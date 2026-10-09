import "server-only";
export class FieldAgentModelError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = "FieldAgentModelError";
    }
}
export type FieldAgentModelMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};
/** The caller supplies retrieved site content and validated conversation turns. */
export async function* streamFieldAgentAnswer(messages: FieldAgentModelMessage[], config: {
    apiKey: string;
    model: string;
}, signal?: AbortSignal) {
    if (!config.apiKey.trim() || !config.model.trim()) {
        throw new FieldAgentModelError(503, "Field Agent 尚未配置模型服务。");
    }
    let response: Response;
    try {
        response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.apiKey}`,
                "Content-Type": "application/json",
            },
            signal: signal
                ? AbortSignal.any([signal, AbortSignal.timeout(45000)])
                : AbortSignal.timeout(45000),
            body: JSON.stringify({
                model: config.model,
                messages,
                thinking: { type: "disabled" },
                max_tokens: 2200,
                stream: true,
            }),
        });
    }
    catch {
        // Provider failures must never return credentials or request internals to visitors.
        throw new FieldAgentModelError(503, "模型连接中断或超时，请稍后重试。");
    }
    if (!response.ok) {
        await response.body?.cancel();
        throw new FieldAgentModelError(503, "模型服务暂不可用，请稍后重试。");
    }
    const reader = response.body?.getReader();
    if (!reader) throw new FieldAgentModelError(502, "模型未返回回答，请稍后重试。");
    const decoder = new TextDecoder();
    let buffer = "", hasText = false, finished = false, sawStop = false;
    try {
        while (!finished) {
            const { value, done } = await reader.read();
            buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
            if (done && buffer) buffer += "\n";
            let newline: number;
            while ((newline = buffer.indexOf("\n")) !== -1) {
                const line = buffer.slice(0, newline).trim();
                buffer = buffer.slice(newline + 1);
                if (!line.startsWith("data:")) continue;
                const payload = line.slice(5).trim();
                if (!payload) continue;
                if (payload === "[DONE]") { finished = true; break; }
                const data = JSON.parse(payload);
                if (data.error) throw new FieldAgentModelError(503, "模型服务暂不可用，请稍后重试。");
                const choice = data.choices?.[0];
                if (choice?.finish_reason === "length") throw new FieldAgentModelError(502, "回答超过长度限制，请缩小问题范围后重试。");
                if (choice?.finish_reason === "stop") sawStop = true;
                const content = choice?.delta?.content;
                if (typeof content === "string" && content) { hasText = true; yield content; }
            }
            if (buffer.length > 64000) throw new FieldAgentModelError(502, "模型返回的数据格式无效，请稍后重试。");
            if (done) break;
        }
        if (!finished || !sawStop || !hasText) throw new FieldAgentModelError(502, "回答未完整生成，请稍后重试。");
    }
    catch (error) {
        throw error instanceof FieldAgentModelError ? error : new FieldAgentModelError(503, "模型连接中断或超时，请稍后重试。");
    }
    finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
    }
}

import { authenticate, configured, failure, guardOrigin, json, readBody, SchoolError, supabase } from "@/lib/school-server";

export const dynamic = "force-dynamic";

type GuestbookMessage = {
  id: string;
  author_name: string;
  is_anonymous: boolean;
  content: string;
  created_at: string;
};

export async function GET() {
  if (!configured()) return json({ configured: false, messages: [] satisfies GuestbookMessage[] });
  try {
    const messages = await supabase("/rest/v1/guestbook_messages?select=id,author_name,is_anonymous,content,created_at&order=created_at.desc&limit=100") as GuestbookMessage[];
    return json({ configured: true, messages });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    guardOrigin(request);
    const { user, token } = await authenticate();
    const body = await readBody(request);
    if (typeof body.content !== "string") throw new SchoolError(400, "留言内容格式无效");
    if (body.isAnonymous !== undefined && typeof body.isAnonymous !== "boolean") throw new SchoolError(400, "匿名选项格式无效");
    const content = body.content.replace(/\r\n?/g, "\n").trim();
    if (!content) throw new SchoolError(400, "请先填写留言");
    if (content.length > 500) throw new SchoolError(400, "留言最多 500 个字符");
    const authorName = String(user.user_metadata?.user_name || user.user_metadata?.preferred_username || user.email?.split("@")[0] || "GitHub 用户").slice(0, 60);
    const messages = await supabase("/rest/v1/guestbook_messages?select=id,author_name,is_anonymous,content,created_at", token, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ user_id: user.id, author_name: authorName, is_anonymous: body.isAnonymous === true, content }),
    }) as GuestbookMessage[];
    return json({ message: messages[0] }, 201);
  } catch (error) {
    return failure(error);
  }
}

import { guestbookIdPattern, isGuestbookAdmin } from "@/lib/guestbook-server";
import { authenticate, failure, guardOrigin, json, readBody, SchoolError, supabase } from "@/lib/school-server";
import { assertGuestbookRateLimit } from "@/lib/guestbook-budget";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    guardOrigin(request);
    const { user, token } = await authenticate();
    const body = await readBody(request);
    if (typeof body.messageId !== "string" || !guestbookIdPattern.test(body.messageId)) throw new SchoolError(400, "留言 ID 无效");
    if (typeof body.content !== "string") throw new SchoolError(400, "评论内容格式无效");
    if (body.isAnonymous !== undefined && typeof body.isAnonymous !== "boolean") throw new SchoolError(400, "匿名选项格式无效");
    const content = body.content.replace(/\r\n?/g, "\n").trim();
    if (!content) throw new SchoolError(400, "请先填写评论");
    if (content.length > 500) throw new SchoolError(400, "评论最多 500 个字符");
    await assertGuestbookRateLimit(request, user.id, "reply");

    const parent = await supabase(`/rest/v1/guestbook_messages?id=eq.${body.messageId}&select=id`) as { id: string }[];
    if (!parent.length) throw new SchoolError(404, "留言不存在或已删除");
    const authorName = String(user.user_metadata?.user_name || user.user_metadata?.preferred_username || user.email?.split("@")[0] || "GitHub 用户").slice(0, 60);
    const replies = await supabase("/rest/v1/guestbook_replies?select=id,message_id,author_name,is_anonymous,content,created_at", token, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        message_id: body.messageId,
        user_id: user.id,
        author_name: authorName,
        is_anonymous: body.isAnonymous === true,
        content,
      }),
    }) as { id: string }[];
    return json({ reply: replies[0] }, 201);
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    guardOrigin(request);
    const { user, token } = await authenticate();
    const body = await readBody(request);
    if (typeof body.id !== "string" || !guestbookIdPattern.test(body.id)) throw new SchoolError(400, "评论 ID 无效");
    await assertGuestbookRateLimit(request, user.id, "delete");

    const rows = await supabase(`/rest/v1/guestbook_replies?id=eq.${body.id}&select=user_id`, undefined, {}, true) as { user_id: string }[];
    const reply = rows[0];
    if (!reply) throw new SchoolError(404, "评论不存在或已删除");
    const ownReply = reply.user_id === user.id;
    if (!ownReply && !isGuestbookAdmin(user)) throw new SchoolError(403, "只能删除自己的评论");

    await supabase(`/rest/v1/guestbook_replies?id=eq.${body.id}`, ownReply ? token : undefined, { method: "DELETE" }, !ownReply);
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

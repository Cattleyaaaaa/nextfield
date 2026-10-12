import { authenticate, configured, failure, guardOrigin, json, readBody, SchoolError, supabase } from "@/lib/school-server";
import { guestbookIdPattern, isGuestbookAdmin } from "@/lib/guestbook-server";

export const dynamic = "force-dynamic";

type GuestbookMessage = {
  id: string;
  author_name: string;
  is_anonymous: boolean;
  content: string;
  created_at: string;
  user_id?: string;
  likes?: { user_id: string }[];
};

type GuestbookReply = {
  id: string;
  message_id: string;
  user_id: string;
  author_name: string;
  is_anonymous: boolean;
  content: string;
  created_at: string;
};

export async function GET() {
  if (!configured()) return json({ configured: false, messages: [] satisfies GuestbookMessage[] });
  try {
    let viewer: { id: string; admin: boolean } | null = null;
    try {
      const { user } = await authenticate();
      viewer = { id: user.id, admin: isGuestbookAdmin(user) };
    } catch (error) {
      if (!(error instanceof SchoolError) || error.status !== 401) throw error;
    }

    const messages = await supabase(
      "/rest/v1/guestbook_messages?select=id,user_id,author_name,is_anonymous,content,created_at,likes:guestbook_message_likes(user_id)&order=created_at.desc&limit=100",
      undefined,
      {},
      true,
    ) as (GuestbookMessage & { user_id: string; likes: { user_id: string }[] })[];
    let replies: GuestbookReply[] = [];
    let repliesEnabled = true;
    if (messages.length) {
      try {
        const ids = messages.map((message) => message.id).join(",");
        replies = await supabase(
          `/rest/v1/guestbook_replies?select=id,message_id,user_id,author_name,is_anonymous,content,created_at&message_id=in.(${ids})&order=created_at.desc&limit=500`,
          undefined,
          {},
          true,
        ) as GuestbookReply[];
      } catch (error) {
        // Existing messages remain readable while the replies migration is pending.
        if (!(error instanceof SchoolError) || error.status !== 502) throw error;
        repliesEnabled = false;
      }
    }
    const repliesByMessage = new Map<string, (Omit<GuestbookReply, "user_id"> & { canDelete: boolean })[]>();
    for (const { user_id, ...reply } of replies.reverse()) {
      const thread = repliesByMessage.get(reply.message_id) || [];
      thread.push({ ...reply, canDelete: Boolean(viewer && (viewer.admin || viewer.id === user_id)) });
      repliesByMessage.set(reply.message_id, thread);
    }
    return json({
      configured: true,
      repliesEnabled,
      messages: messages.map(({ user_id, likes, ...message }) => ({
        ...message,
        likeCount: likes?.length ?? 0,
        likedByMe: Boolean(viewer && likes?.some((like) => like.user_id === viewer?.id)),
        canDelete: Boolean(viewer && (viewer.admin || viewer.id === user_id)),
        replies: repliesByMessage.get(message.id) || [],
      })),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: Request) {
  try {
    guardOrigin(request);
    const { user, token } = await authenticate();
    const body = await readBody(request);
    if (typeof body.id !== "string" || !guestbookIdPattern.test(body.id)) throw new SchoolError(400, "留言 ID 无效");
    if (body.action !== "like" && body.action !== "unlike") throw new SchoolError(400, "操作无效");

    if (body.action === "like") {
      await supabase(`/rest/v1/guestbook_message_likes?on_conflict=message_id,user_id`, token, {
        method: "POST",
        headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
        body: JSON.stringify({ message_id: body.id, user_id: user.id }),
      });
    } else {
      await supabase(`/rest/v1/guestbook_message_likes?message_id=eq.${body.id}&user_id=eq.${user.id}`, token, { method: "DELETE" });
    }
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    guardOrigin(request);
    const { user } = await authenticate();
    const body = await readBody(request);
    if (typeof body.id !== "string" || !guestbookIdPattern.test(body.id)) throw new SchoolError(400, "留言 ID 无效");

    const rows = await supabase(`/rest/v1/guestbook_messages?id=eq.${body.id}&select=user_id`, undefined, {}, true) as { user_id: string }[];
    const message = rows[0];
    if (!message) throw new SchoolError(404, "留言不存在或已删除");
    if (message.user_id !== user.id && !isGuestbookAdmin(user)) throw new SchoolError(403, "只能删除自己的留言");

    await supabase(`/rest/v1/guestbook_messages?id=eq.${body.id}`, undefined, { method: "DELETE" }, true);
    return json({ ok: true });
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

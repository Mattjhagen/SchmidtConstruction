import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendMessageReplyEmail } from '@/lib/email';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const messages = await db.getMessages(threadId);
    return NextResponse.json({ messages });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const { body } = await request.json();
    if (!body?.trim()) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 });
    }

    const threads = await db.getMessageThreads();
    const thread = threads.find((t: { id: string }) => t.id === threadId);
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const message = await db.createMessage(threadId, body.trim(), 'admin', 'Schmidt Construction');

    // Send email notification to customer (server-side only, never exposed to client)
    if (thread.client_email) {
      try {
        await sendMessageReplyEmail({
          to: thread.client_email,
          clientName: thread.client_name,
          subject: thread.subject,
          replyBody: body.trim(),
        });
      } catch (emailErr) {
        // Non-fatal — message is saved even if email fails
        console.error('Message reply email failed:', emailErr);
      }
    }

    return NextResponse.json({ message });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

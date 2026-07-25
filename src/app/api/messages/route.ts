import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const threads = await db.getMessageThreads();
    return NextResponse.json({ threads });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { client_name, client_email, subject, body } = await request.json();

    if (!client_name || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const thread = await db.createMessageThread({
      client_id: null,
      client_name,
      client_email: client_email || '',
      subject,
      last_message_preview: body.slice(0, 120),
      source: 'manual',
    });

    await db.createMessage(thread.id, body, 'admin', 'Schmidt Construction');

    return NextResponse.json({ thread });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

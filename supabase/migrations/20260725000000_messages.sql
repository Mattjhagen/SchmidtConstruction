-- Messages: customer-facing conversation threads + messages
-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS message_threads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  client_id       uuid REFERENCES clients(id) ON DELETE SET NULL,
  client_name     text NOT NULL,
  client_email    text NOT NULL DEFAULT '',
  subject         text NOT NULL DEFAULT 'General Inquiry',
  last_message_at timestamptz NOT NULL DEFAULT now(),
  last_message_preview text NOT NULL DEFAULT '',
  unread_count    int NOT NULL DEFAULT 0,
  source          text NOT NULL DEFAULT 'portal'
    CHECK (source IN ('portal', 'quote', 'contact', 'manual'))
);

CREATE TABLE IF NOT EXISTS messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  thread_id   uuid NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  body        text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('admin', 'client')),
  sender_name text NOT NULL,
  is_read     boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS messages_thread_id_idx ON messages(thread_id);
CREATE INDEX IF NOT EXISTS message_threads_last_message_at_idx ON message_threads(last_message_at DESC);

-- RLS: only authenticated users (estimators) can access
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage message_threads" ON message_threads;
CREATE POLICY "Authenticated users can manage message_threads"
  ON message_threads FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage messages" ON messages;
CREATE POLICY "Authenticated users can manage messages"
  ON messages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

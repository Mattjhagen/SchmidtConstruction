'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Plus, Clock, User, ChevronRight, Search } from 'lucide-react';
import { db } from '@/lib/db';
import type { MessageThread, Message } from '@/lib/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({ client_name: '', client_email: '', subject: '', body: '' });
  const [creatingThread, setCreatingThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedThread = threads.find(t => t.id === selectedThreadId) ?? null;

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selectedThreadId) loadMessages(selectedThreadId);
  }, [selectedThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadThreads() {
    setLoadingThreads(true);
    try {
      const data = await db.getMessageThreads();
      setThreads(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingThreads(false);
    }
  }

  async function loadMessages(threadId: string) {
    setLoadingMessages(true);
    try {
      const data = await db.getMessages(threadId);
      setMessages(data);
      // Optimistically clear unread badge
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unread_count: 0 } : t));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function sendReply() {
    if (!selectedThreadId || !replyText.trim()) return;
    setSending(true);
    const body = replyText.trim();
    setReplyText('');
    try {
      const res = await fetch(`/api/messages/${selectedThreadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error('Failed to send');
      const { message } = await res.json();
      setMessages(prev => [...prev, message]);
      setThreads(prev => prev.map(t =>
        t.id === selectedThreadId
          ? { ...t, last_message_at: message.created_at, last_message_preview: body.slice(0, 120) }
          : t
      ));
    } catch (e) {
      console.error(e);
      setReplyText(body);
    } finally {
      setSending(false);
    }
  }

  async function handleCreateThread() {
    if (!newThread.client_name.trim() || !newThread.subject.trim() || !newThread.body.trim()) return;
    setCreatingThread(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newThread),
      });
      if (!res.ok) throw new Error('Failed');
      const { thread } = await res.json();
      setThreads(prev => [thread, ...prev]);
      setSelectedThreadId(thread.id);
      setShowNewThread(false);
      setNewThread({ client_name: '', client_email: '', subject: '', body: '' });
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingThread(false);
    }
  }

  const filteredThreads = threads.filter(t =>
    !search || t.client_name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = threads.reduce((sum, t) => sum + t.unread_count, 0);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* Thread List */}
      <div className="w-full sm:w-80 lg:w-96 flex-shrink-0 border-r border-slate-800 flex flex-col bg-slate-900">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-white">Customer Messages</h1>
              {totalUnread > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{totalUnread}</span>
              )}
            </div>
            <button
              onClick={() => setShowNewThread(true)}
              className="flex items-center space-x-1 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Thread Items */}
        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="flex items-center justify-center py-12 text-slate-500 text-sm">Loading…</div>
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm space-y-2">
              <MessageSquare className="h-8 w-8 opacity-30" />
              <span>No conversations yet</span>
            </div>
          ) : (
            filteredThreads.map(thread => (
              <button
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                className={`w-full text-left p-4 border-b border-slate-800 transition-colors hover:bg-slate-800/60 ${
                  selectedThreadId === thread.id ? 'bg-slate-800 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-sm font-medium truncate flex-1 mr-2 ${thread.unread_count > 0 ? 'text-white' : 'text-slate-300'}`}>
                    {thread.client_name}
                  </span>
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    {thread.unread_count > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{thread.unread_count}</span>
                    )}
                    <span className="text-xs text-slate-500">{timeAgo(thread.last_message_at)}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 truncate mb-0.5">{thread.subject}</p>
                <p className="text-xs text-slate-500 truncate">{thread.last_message_preview}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message View */}
      <div className={`flex-1 flex flex-col ${selectedThreadId ? 'flex' : 'hidden sm:flex'}`}>
        {!selectedThread ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-3">
            <MessageSquare className="h-12 w-12 opacity-20" />
            <p className="text-sm">Select a conversation to view messages</p>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{selectedThread.client_name}</p>
                <p className="text-xs text-slate-400 truncate">{selectedThread.client_email} · {selectedThread.subject}</p>
              </div>
              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full capitalize">
                {selectedThread.source}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-12 text-slate-500 text-sm">Loading…</div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-slate-500 text-sm">No messages in this thread.</div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${msg.sender_type === 'admin' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.sender_type === 'admin'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                      }`}>
                        {msg.body}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-1 px-1">
                        <span className="text-xs text-slate-500">{msg.sender_name}</span>
                        <span className="text-slate-700">·</span>
                        <Clock className="h-3 w-3 text-slate-600" />
                        <span className="text-xs text-slate-500">{timeAgo(msg.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Box */}
            <div className="p-4 border-t border-slate-800 bg-slate-900">
              <div className="flex items-end space-x-2">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Type a reply… (Enter to send, Shift+Enter for new line)"
                  rows={2}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-2">Reply will be emailed to {selectedThread.client_email}</p>
            </div>
          </>
        )}
      </div>

      {/* New Thread Modal */}
      {showNewThread && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white">New Conversation</h2>
              <p className="text-sm text-slate-400 mt-0.5">Start a message thread with a customer</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Customer Name</label>
                  <input
                    value={newThread.client_name}
                    onChange={e => setNewThread(p => ({ ...p, client_name: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                  <input
                    value={newThread.client_email}
                    onChange={e => setNewThread(p => ({ ...p, client_email: e.target.value }))}
                    type="email"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="john@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Subject</label>
                <input
                  value={newThread.subject}
                  onChange={e => setNewThread(p => ({ ...p, subject: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Project inquiry…"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Message</label>
                <textarea
                  value={newThread.body}
                  onChange={e => setNewThread(p => ({ ...p, body: e.target.value }))}
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Hi, I wanted to reach out about…"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end space-x-3">
              <button
                onClick={() => { setShowNewThread(false); setNewThread({ client_name: '', client_email: '', subject: '', body: '' }); }}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateThread}
                disabled={creatingThread || !newThread.client_name.trim() || !newThread.subject.trim() || !newThread.body.trim()}
                className="px-5 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 rounded-lg transition-colors"
              >
                {creatingThread ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

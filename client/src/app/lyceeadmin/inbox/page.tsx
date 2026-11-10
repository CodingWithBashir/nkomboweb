'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCheck,
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  Phone,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import api from '@/lib/axios';

type Message = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

function flatten(error: unknown): string {
  const detail = (error as { response?: { data?: unknown } })?.response?.data;
  if (!detail) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  return Object.entries(detail as Record<string, unknown>)
    .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(' ') : String(value)}`)
    .join(' · ');
}

const when = (value: string) => (value ? value.replace(' ', ' · ').slice(0, 16) : '');

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/contact/inbox/', { params: { page_size: 200 } });
      setMessages(data.results ?? data);
    } catch (err) {
      setError(flatten(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const open = async (message: Message) => {
    setSelected(selected === message.id ? null : message.id);
    if (message.is_read) return;
    try {
      await api.patch(`/contact/inbox/${message.id}/`, { is_read: true });
      setMessages((current) =>
        current.map((item) => (item.id === message.id ? { ...item, is_read: true } : item))
      );
    } catch {
      /* not fatal — the message is still readable */
    }
  };

  const remove = async (message: Message) => {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;
    try {
      await api.delete(`/contact/inbox/${message.id}/`);
      setMessages((current) => current.filter((item) => item.id !== message.id));
      setNotice('Message deleted.');
    } catch (err) {
      setError(flatten(err));
    }
  };

  const markAll = async () => {
    const unread = messages.filter((message) => !message.is_read);
    await Promise.all(
      unread.map((message) =>
        api.patch(`/contact/inbox/${message.id}/`, { is_read: true }).catch(() => undefined)
      )
    );
    setMessages((current) => current.map((item) => ({ ...item, is_read: true })));
    setNotice('All messages marked as read.');
  };

  const visible = useMemo(
    () => (filter === 'unread' ? messages.filter((message) => !message.is_read) : messages),
    [messages, filter]
  );
  const unreadCount = messages.filter((message) => !message.is_read).length;

  return (
    <RequireAuth roles={['headmaster', 'admin', 'dos']}>
      <div className="min-h-screen bg-navy-50/50">
        <div className="mx-auto max-w-[1040px] px-5 py-10">
          <Link
            href="/lyceeadmin"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-400 hover:text-navy-600"
          >
            <ArrowLeft size={13} /> Overview
          </Link>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-gold-600">Inbox</p>
              <h1 className="mt-2 font-heading text-[28px] font-extrabold text-navy-500">
                Messages from the website
              </h1>
              <p className="mt-1.5 text-[13px] text-navy-400">
                Everything sent through the contact form. {unreadCount > 0 ? `${unreadCount} unread.` : 'All read.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void markAll()}
                disabled={unreadCount === 0}
                className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2.5 text-[12.5px] font-bold text-navy-500 hover:border-navy-300 disabled:opacity-40"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2.5 text-[12.5px] font-bold text-navy-500 hover:border-navy-300"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {(notice || error) && (
            <p
              className={`mt-5 rounded-xl px-4 py-3 text-[12.5px] font-medium ${
                error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {error || notice}
            </p>
          )}

          <div className="mt-6 flex gap-1.5">
            {(
              [
                { key: 'all', label: `All (${messages.length})` },
                { key: 'unread', label: `Unread (${unreadCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-bold transition ${
                  filter === tab.key ? 'bg-navy-500 text-white' : 'bg-white text-navy-500 hover:bg-navy-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-navy-100 bg-white">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-navy-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading messages…
              </div>
            ) : visible.length === 0 ? (
              <div className="py-16 text-center">
                <Inbox className="mx-auto h-8 w-8 text-navy-200" />
                <p className="mt-3 font-heading text-[15px] font-extrabold text-navy-500">Inbox empty</p>
                <p className="mt-1 text-[12.5px] text-navy-400">
                  Messages sent from the website contact form appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-navy-100">
                {visible.map((message) => (
                  <li key={message.id}>
                    <button
                      type="button"
                      onClick={() => void open(message)}
                      className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-navy-50/60"
                    >
                      <span className="mt-0.5 text-navy-300">
                        {message.is_read ? <MailOpen size={16} /> : <Mail size={16} className="text-gold-600" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span
                            className={`font-heading text-[13.5px] ${
                              message.is_read ? 'font-bold text-navy-500' : 'font-extrabold text-navy-600'
                            }`}
                          >
                            {message.subject || 'Website enquiry'}
                          </span>
                          {!message.is_read && (
                            <span className="rounded-full bg-gold-500 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-white">
                              New
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-navy-400">
                          {message.name} · {message.email}
                        </span>
                        {selected === message.id && (
                          <>
                            <span className="mt-2 block whitespace-pre-line rounded-xl bg-navy-50/70 px-3 py-2.5 text-[12.5px] leading-relaxed text-navy-600">
                              {message.message}
                            </span>
                            <span className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px] font-semibold text-navy-400">
                              <a href={`mailto:${message.email}`} className="inline-flex items-center gap-1 hover:text-gold-600">
                                <Mail size={12} /> Reply by e-mail
                              </a>
                              {message.phone && (
                                <a href={`tel:${message.phone}`} className="inline-flex items-center gap-1 hover:text-gold-600">
                                  <Phone size={12} /> {message.phone}
                                </a>
                              )}
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void remove(message);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.stopPropagation();
                                    void remove(message);
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={12} /> Delete
                              </span>
                            </span>
                          </>
                        )}
                      </span>
                      <span className="hidden shrink-0 text-[11px] text-navy-300 sm:block">
                        {when(message.created_at)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

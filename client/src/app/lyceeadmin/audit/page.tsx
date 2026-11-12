'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, Loader2, RefreshCw, Search } from 'lucide-react';
import api from '@/lib/axios';
import { Btn, Chip, Empty, Notice, PageHead, Panel, flatten, input } from '@/components/admin/ui';

type AuditRow = {
  id: number;
  actor: string;
  role: string;
  action: string;
  entity: string;
  entity_id: string;
  detail: string;
  ip: string;
  created_at: string;
};

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/audit/', { params: { limit: 250 } });
      setRows(data.results ?? []);
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = rows.filter((row) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return [row.actor, row.action, row.entity, row.entity_id, row.detail]
      .join(' ')
      .toLowerCase()
      .includes(term);
  });

  return (
    <div className="min-h-screen bg-navy-50/50">
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <PageHead
          eyebrow="Records"
          title="Audit log"
          description="Every change made by a member of staff, with the time, the account and the address it came from. Read-only — nobody can edit history here."
          actions={
            <Btn variant="ghost" icon={RefreshCw} onClick={() => void load()}>
              Reload
            </Btn>
          }
        />

        {notice ? (
          <div className="mb-4">
            <Notice kind={notice.kind}>{notice.text}</Notice>
          </div>
        ) : null}

        <Panel icon={Activity} title={`${filtered.length} entries`}>
          <div className="relative mb-3 max-w-[320px]">
            <Search size={13} className="pointer-events-none absolute left-3 top-2.5 text-navy-300" />
            <input
              className={`${input} pl-8`}
              placeholder="Filter by account, action or page"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-navy-400">
              <Loader2 size={15} className="animate-spin" /> Loading…
            </div>
          ) : filtered.length === 0 ? (
            <Empty>Nothing recorded yet. Changes made from today on appear here.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-[11.5px]">
                <thead>
                  <tr className="border-b border-navy-50 text-[10px] uppercase tracking-[0.12em] text-navy-300">
                    <th className="py-2 pr-3">When</th>
                    <th className="py-2 pr-3">Who</th>
                    <th className="py-2 pr-3">Action</th>
                    <th className="py-2 pr-3">Page</th>
                    <th className="py-2">From</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                  {filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-navy-50/40">
                      <td className="py-1.5 pr-3 whitespace-nowrap text-navy-400">
                        {new Date(row.created_at).toLocaleString('en-GB')}
                      </td>
                      <td className="py-1.5 pr-3">
                        <span className="font-bold text-navy-500">{row.actor}</span>
                        <span className="ml-1.5 text-[10px] text-navy-300">{row.role}</span>
                      </td>
                      <td className="py-1.5 pr-3">
                        <Chip tone={row.action === 'DELETE' ? 'red' : 'navy'}>{row.action}</Chip>
                      </td>
                      <td className="py-1.5 pr-3 font-mono text-[10.5px] text-navy-400">{row.detail}</td>
                      <td className="py-1.5 text-[10.5px] text-navy-300">{row.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  CircleDollarSign,
  Loader2,
  MessageSquare,
  Plus,
  Receipt,
  RefreshCw,
  Smartphone,
  Trash2,
  Wallet,
} from 'lucide-react';
import api from '@/lib/axios';
import {
  Btn,
  Chip,
  Empty,
  LEVELS,
  Notice,
  PageHead,
  Panel,
  TERMS,
  flatten,
  input,
  money,
} from '@/components/admin/ui';

type Trade = { id: number; code: string; name: string };

type Structure = {
  id: number;
  year: string;
  term: string;
  trade_id: number | null;
  trade_code: string | null;
  level: string;
  name: string;
  amount: number;
  currency: string;
  due_date: string | null;
  is_active: number;
};

type Invoice = {
  id: number;
  student: { id: number; student_id: string; full_name: string } | null;
  year: string;
  term: string;
  title: string;
  amount: number;
  paid: number;
  balance: number;
  status: string;
  due_date: string | null;
};

type BalanceRow = {
  id: number;
  student_id: string;
  full_name: string;
  level: string;
  trade_code: string | null;
  parent_phone: string;
  fees: { billed: number; paid: number; balance: number; currency: string };
};

type Payment = {
  id: number;
  amount: number;
  method: string;
  reference: string;
  created_at: string;
  student: { student_id: string; full_name: string };
};

type Overview = {
  academic_year: string;
  currency: string;
  totals: { billed: number; paid: number; balance: number; invoices: number };
  momo: { configured: boolean; environment?: string; detail?: string };
  messaging: { sms: boolean; whatsapp: boolean; detail?: string };
};

type Student = { id: number; student_id: string; full_name: string };

const TABS = [
  { id: 'overview', label: 'Overview', icon: Wallet },
  { id: 'structures', label: 'Fee structure', icon: CircleDollarSign },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'balances', label: 'Balances', icon: Banknote },
  { id: 'payments', label: 'Payments', icon: RefreshCw },
] as const;

const statusTone = (status: string) =>
  status === 'paid' ? 'green' : status === 'partial' ? 'amber' : 'red';

export default function FeesPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('overview');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [year, setYear] = useState('');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [balances, setBalances] = useState<BalanceRow[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [payFor, setPayFor] = useState<Invoice | null>(null);
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash', reference: '' });
  const [filters, setFilters] = useState({ level: 'L3', trade: '', status: '' });
  const [structure, setStructure] = useState({
    level: 'L3',
    trade_id: '',
    term: 'Term 1',
    name: 'Tuition',
    amount: '',
    due_date: '',
  });
  const [invoiceForm, setInvoiceForm] = useState({ structure_id: '', student_id: '', force: false });

  const currency = overview?.currency ?? 'RWF';

  useEffect(() => {
    api
      .get('/academics/trades/', { params: { page_size: 100 } })
      .then((response) => setTrades(response.data.results ?? []))
      .catch(() => setTrades([]));
    api
      .get('/fees/')
      .then((response) => {
        setOverview(response.data as Overview);
        setYear(response.data.academic_year);
      })
      .catch((error) => setNotice({ kind: 'error', text: flatten(error) }));
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [structuresResponse, invoicesResponse, balancesResponse, paymentsResponse, overviewResponse] =
        await Promise.all([
          api.get('/fees/structures/'),
          api.get('/fees/invoices/', { params: { ...(year ? { year } : {}), level: filters.level } }),
          api.get('/fees/students/', { params: { ...(year ? { year } : {}), level: filters.level } }),
          api.get('/fees/payments/'),
          api.get('/fees/', { params: year ? { year } : {} }),
        ]);
      setStructures(structuresResponse.data.results ?? []);
      setInvoices(invoicesResponse.data.results ?? []);
      setBalances(balancesResponse.data.results ?? []);
      setPayments(paymentsResponse.data.results ?? []);
      setOverview(overviewResponse.data as Overview);
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setLoading(false);
    }
  }, [filters.level, year]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    api
      .get('/reports/', {
        params: { level: filters.level, ...(filters.trade ? { trade: filters.trade } : {}) },
      })
      .then((response) => setStudents(response.data.results ?? []))
      .catch(() => setStudents([]));
  }, [filters.level, filters.trade]);

  const act = async (work: () => Promise<unknown>, message?: string) => {
    setBusy(true);
    setNotice(null);
    try {
      await work();
      if (message) setNotice({ kind: 'ok', text: message });
      await loadAll();
      return true;
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const saveStructure = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(structure.amount);
    if (!amount) {
      setNotice({ kind: 'error', text: 'Write the amount in RWF.' });
      return;
    }
    const ok = await act(
      () =>
        api.post('/fees/structures/', {
          year: year || undefined,
          term: structure.term,
          trade_id: structure.trade_id ? Number(structure.trade_id) : null,
          level: structure.level,
          name: structure.name,
          amount,
          due_date: structure.due_date || null,
        }),
      'Fee structure saved.'
    );
    if (ok) setStructure({ ...structure, amount: '', due_date: '' });
  };

  const billClass = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: Record<string, unknown> = {
      level: filters.level,
      force: invoiceForm.force,
    };
    if (invoiceForm.structure_id) payload.structure_id = Number(invoiceForm.structure_id);
    if (invoiceForm.student_id) payload.student_id = Number(invoiceForm.student_id);
    else if (filters.trade) payload.trade_id = Number(filters.trade);
    const ok = await act(() => api.post('/fees/invoices/', payload), 'Invoices generated.');
    if (ok) setInvoiceForm({ ...invoiceForm, student_id: '' });
  };

  const submitPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!payFor) return;
    const amount = Number(payForm.amount);
    if (!amount) {
      setNotice({ kind: 'error', text: 'Write the amount received.' });
      return;
    }
    const ok = await act(
      () =>
        api.post('/fees/payments/', {
          invoice_id: payFor.id,
          amount,
          method: payForm.method,
          reference: payForm.reference,
        }),
      'Payment recorded and the invoice updated.'
    );
    if (ok) {
      setPayFor(null);
      setPayForm({ amount: '', method: 'cash', reference: '' });
    }
  };

  const requestMomo = async (invoice: Invoice) => {
    if (!invoice.student) return;
    setBusy(true);
    setNotice(null);
    try {
      const { data } = await api.post('/fees/momo/', { invoice_id: invoice.id });
      setNotice({
        kind: data.status === 'failed' ? 'error' : 'ok',
        text:
          data.detail ||
          (data.status === 'pending'
            ? 'A payment request was pushed to the parent phone — it is pending.'
            : 'Request sent.'),
      });
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setBusy(false);
    }
  };

  const remind = async (row: BalanceRow) => {
    if (!row.parent_phone) {
      setNotice({ kind: 'error', text: `${row.full_name} has no parent phone on file.` });
      return;
    }
    await act(
      () =>
        api.post('/messages/', {
          to: row.parent_phone,
          student_id: row.id,
          body: `Lycee de Nyanza: the school fees of ${row.full_name} (${row.student_id}) still show a balance of ${money(
            row.fees.balance,
            row.fees.currency
          )}. Please visit the office or pay with MTN MoMo.`,
        }),
      `Reminder queued for ${row.full_name}.`
    );
  };

  const totals = useMemo(() => {
    if (overview) return overview.totals;
    return invoices.reduce(
      (acc, invoice) => ({
        billed: acc.billed + invoice.amount,
        paid: acc.paid + invoice.paid,
        balance: acc.balance + invoice.balance,
        invoices: acc.invoices + 1,
      }),
      { billed: 0, paid: 0, balance: 0, invoices: 0 }
    );
  }, [overview, invoices]);

  return (
    <div className="min-h-screen bg-navy-50/50">
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <PageHead
          eyebrow="Finance"
          title="School fees"
          description="Build the fee structure once, bill a whole class in one click, record cash or MoMo payments and keep the balance on every bulletin. Parents can pay from the phone once the MTN MoMo keys are in place."
          actions={
            <Btn variant="ghost" icon={RefreshCw} onClick={() => void loadAll()}>
              Reload
            </Btn>
          }
        />

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Billed', value: money(totals.billed, currency), icon: Receipt, tone: 'text-navy-500' },
            { label: 'Collected', value: money(totals.paid, currency), icon: Banknote, tone: 'text-emerald-600' },
            { label: 'Outstanding', value: money(totals.balance, currency), icon: Wallet, tone: 'text-red-500' },
            { label: 'Invoices', value: String(totals.invoices), icon: CircleDollarSign, tone: 'text-navy-500' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-xl border border-navy-100 bg-white px-4 py-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-400">{label}</p>
                <Icon size={14} className={tone} />
              </div>
              <p className="mt-1.5 font-heading text-[19px] font-extrabold text-navy-500">{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] font-bold transition ${
                tab === id
                  ? 'bg-navy-500 text-white shadow-sm'
                  : 'border border-navy-100 bg-white text-navy-400 hover:text-navy-500'
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Chip tone={overview?.momo.configured ? 'green' : 'amber'}>
              <Smartphone size={10} /> MoMo {overview?.momo.configured ? 'live' : 'not configured'}
            </Chip>
            <Chip tone={overview?.messaging.sms ? 'green' : 'amber'}>
              <MessageSquare size={10} /> SMS {overview?.messaging.sms ? 'live' : 'log only'}
            </Chip>
          </div>
        </div>

        {notice ? (
          <div className="mb-4">
            <Notice kind={notice.kind}>{notice.text}</Notice>
          </div>
        ) : null}

        {loading ? (
          <Panel>
            <div className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-navy-400">
              <Loader2 size={15} className="animate-spin" /> Loading the ledger…
            </div>
          </Panel>
        ) : tab === 'overview' ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="This school year" description={`${year} · ${overview?.academic_year ?? ''}`}>
              <ul className="space-y-2 text-[12.5px] text-navy-500">
                <li className="flex justify-between border-b border-navy-50 pb-2">
                  <span>Total billed</span>
                  <strong>{money(totals.billed, currency)}</strong>
                </li>
                <li className="flex justify-between border-b border-navy-50 pb-2">
                  <span>Collected</span>
                  <strong className="text-emerald-600">{money(totals.paid, currency)}</strong>
                </li>
                <li className="flex justify-between border-b border-navy-50 pb-2">
                  <span>Still owed by parents</span>
                  <strong className="text-red-500">{money(totals.balance, currency)}</strong>
                </li>
                <li className="flex justify-between">
                  <span>Collection rate</span>
                  <strong>
                    {totals.billed ? Math.round((totals.paid / totals.billed) * 100) : 0}%
                  </strong>
                </li>
              </ul>
            </Panel>
            <Panel title="How parents can pay" description="Mobile money, then cash at the office.">
              <div className="space-y-3 text-[12.5px] leading-relaxed text-navy-500">
                <p>
                  <strong>MTN MoMo:</strong>{' '}
                  {overview?.momo.configured
                    ? `requests are live (${overview.momo.environment ?? 'production'}). Open an invoice and press “MoMo” to push a payment prompt to the parent phone.`
                    : 'add MOMO_SUBSCRIPTION_KEY, MOMO_API_USER and MOMO_API_KEY in server/.env to switch on the “MoMo” button.'}
                </p>
                <p>
                  <strong>SMS reminders:</strong>{' '}
                  {overview?.messaging.sms
                    ? 'messages go out through the configured gateway.'
                    : 'no gateway yet, so reminders are stored in the message log and can be resent later.'}
                </p>
                <p>
                  Every payment you record adds a receipt line to the student&apos;s balance and shows up on
                  the report card.
                </p>
              </div>
            </Panel>
          </div>
        ) : tab === 'structures' ? (
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <Panel title="Fee structure" icon={CircleDollarSign} description="What the school charges per trade, level and term.">
              {structures.length === 0 ? (
                <Empty>No fee structure yet — add the first one on the right.</Empty>
              ) : (
                <ul className="divide-y divide-navy-50">
                  {structures.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div>
                        <p className="text-[12.5px] font-bold text-navy-500">
                          {item.name} · {item.level}
                          {item.trade_code ? ` · ${item.trade_code}` : ''}
                        </p>
                        <p className="text-[10.5px] text-navy-300">
                          {item.term} · {item.year}
                          {item.due_date ? ` · due ${item.due_date}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] font-bold text-navy-500">
                          {money(item.amount, item.currency)}
                        </span>
                        <Btn
                          variant="danger"
                          icon={Trash2}
                          loading={busy}
                          onClick={() =>
                            void act(() => api.delete(`/fees/structures/${item.id}/`), 'Removed.')
                          }
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Add a fee" icon={Plus}>
              <form className="space-y-3" onSubmit={saveStructure}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                      Level
                    </span>
                    <select
                      className={input}
                      value={structure.level}
                      onChange={(event) => setStructure({ ...structure, level: event.target.value })}
                    >
                      {LEVELS.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                      Term
                    </span>
                    <select
                      className={input}
                      value={structure.term}
                      onChange={(event) => setStructure({ ...structure, term: event.target.value })}
                    >
                      {TERMS.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    Trade
                  </span>
                  <select
                    className={input}
                    value={structure.trade_id}
                    onChange={(event) => setStructure({ ...structure, trade_id: event.target.value })}
                  >
                    <option value="">All trades</option>
                    {trades.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code} — {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                    Name
                  </span>
                  <input
                    className={input}
                    value={structure.name}
                    onChange={(event) => setStructure({ ...structure, name: event.target.value })}
                    placeholder="Tuition"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                      Amount (RWF)
                    </span>
                    <input
                      className={input}
                      inputMode="numeric"
                      value={structure.amount}
                      onChange={(event) => setStructure({ ...structure, amount: event.target.value })}
                      placeholder="120000"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
                      Due date
                    </span>
                    <input
                      type="date"
                      className={input}
                      value={structure.due_date}
                      onChange={(event) => setStructure({ ...structure, due_date: event.target.value })}
                    />
                  </label>
                </div>
                <Btn type="submit" icon={Plus} loading={busy} size="md" className="w-full">
                  Save fee
                </Btn>
              </form>
            </Panel>
          </div>
        ) : tab === 'invoices' ? (
          <div className="space-y-4">
            <Panel title="Bill a class" icon={Plus} description="Pick the fee, then bill one student or the whole class.">
              <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" onSubmit={billClass}>
                <select
                  className={input}
                  value={filters.level}
                  onChange={(event) => setFilters({ ...filters, level: event.target.value })}
                >
                  {LEVELS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <select
                  className={input}
                  value={filters.trade}
                  onChange={(event) => setFilters({ ...filters, trade: event.target.value })}
                >
                  <option value="">All trades</option>
                  {trades.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code}
                    </option>
                  ))}
                </select>
                <select
                  className={input}
                  value={invoiceForm.structure_id}
                  onChange={(event) => setInvoiceForm({ ...invoiceForm, structure_id: event.target.value })}
                >
                  <option value="">Choose a fee…</option>
                  {structures
                    .filter((item) => item.level === filters.level)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · {item.term} · {money(item.amount, item.currency)}
                      </option>
                    ))}
                </select>
                <select
                  className={input}
                  value={invoiceForm.student_id}
                  onChange={(event) => setInvoiceForm({ ...invoiceForm, student_id: event.target.value })}
                >
                  <option value="">Whole class</option>
                  {students.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.full_name}
                    </option>
                  ))}
                </select>
                <Btn type="submit" icon={Receipt} loading={busy}>
                  Generate
                </Btn>
              </form>
            </Panel>

            <Panel title={`Invoices — ${filters.level}`} icon={Receipt}>
              {invoices.length === 0 ? (
                <Empty>No invoices for this class yet.</Empty>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-navy-50 text-[10.5px] uppercase tracking-[0.12em] text-navy-300">
                        <th className="py-2 pr-3">Student</th>
                        <th className="py-2 pr-3">Invoice</th>
                        <th className="py-2 pr-3 text-right">Amount</th>
                        <th className="py-2 pr-3 text-right">Paid</th>
                        <th className="py-2 pr-3 text-right">Balance</th>
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-50">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-navy-50/40">
                          <td className="py-2 pr-3">
                            <p className="font-bold text-navy-500">{invoice.student?.full_name ?? '—'}</p>
                            <p className="text-[10.5px] text-navy-300">
                              {invoice.student?.student_id ?? ''}
                            </p>
                          </td>
                          <td className="py-2 pr-3 text-navy-400">
                            {invoice.title}
                            <span className="block text-[10.5px] text-navy-300">
                              {invoice.term} · {invoice.year}
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-right font-semibold text-navy-500">
                            {money(invoice.amount, currency)}
                          </td>
                          <td className="py-2 pr-3 text-right text-emerald-600">
                            {money(invoice.paid, currency)}
                          </td>
                          <td className="py-2 pr-3 text-right font-bold text-navy-500">
                            {money(invoice.balance, currency)}
                          </td>
                          <td className="py-2 pr-3">
                            <Chip tone={statusTone(invoice.status)}>{invoice.status}</Chip>
                          </td>
                          <td className="py-2 text-right">
                            <div className="flex justify-end gap-1.5">
                              <Btn
                                variant="ghost"
                                onClick={() => {
                                  setPayFor(invoice);
                                  setPayForm({
                                    amount: String(invoice.balance || invoice.amount),
                                    method: 'cash',
                                    reference: '',
                                  });
                                }}
                              >
                                Pay
                              </Btn>
                              <Btn
                                variant="ghost"
                                icon={Smartphone}
                                disabled={!overview?.momo.configured || invoice.balance <= 0}
                                onClick={() => void requestMomo(invoice)}
                              >
                                MoMo
                              </Btn>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            {payFor ? (
              <Panel
                title={`Record a payment — ${payFor.student?.full_name ?? ''}`}
                description={`Balance before this payment: ${money(payFor.balance, currency)}`}
              >
                <form className="grid gap-3 sm:grid-cols-4" onSubmit={submitPayment}>
                  <input
                    className={input}
                    inputMode="numeric"
                    value={payForm.amount}
                    onChange={(event) => setPayForm({ ...payForm, amount: event.target.value })}
                    placeholder="Amount"
                  />
                  <select
                    className={input}
                    value={payForm.method}
                    onChange={(event) => setPayForm({ ...payForm, method: event.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="momo">MTN MoMo</option>
                    <option value="airtel">Airtel Money</option>
                    <option value="bank">Bank transfer</option>
                  </select>
                  <input
                    className={input}
                    value={payForm.reference}
                    onChange={(event) => setPayForm({ ...payForm, reference: event.target.value })}
                    placeholder="Receipt / MoMo reference"
                  />
                  <div className="flex gap-2">
                    <Btn type="submit" icon={Banknote} loading={busy} className="flex-1">
                      Save
                    </Btn>
                    <Btn variant="ghost" type="button" onClick={() => setPayFor(null)}>
                      Cancel
                    </Btn>
                  </div>
                </form>
              </Panel>
            ) : null}
          </div>
        ) : tab === 'balances' ? (
          <Panel title={`Balances — ${filters.level}`} icon={Banknote}>
            {balances.length === 0 ? (
              <Empty>No students in this class.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-navy-50 text-[10.5px] uppercase tracking-[0.12em] text-navy-300">
                      <th className="py-2 pr-3">Student</th>
                      <th className="py-2 pr-3 text-right">Billed</th>
                      <th className="py-2 pr-3 text-right">Paid</th>
                      <th className="py-2 pr-3 text-right">Balance</th>
                      <th className="py-2 text-right">Remind</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-50">
                    {balances.map((row) => (
                      <tr key={row.id} className="hover:bg-navy-50/40">
                        <td className="py-2 pr-3">
                          <p className="font-bold text-navy-500">{row.full_name}</p>
                          <p className="text-[10.5px] text-navy-300">
                            {row.student_id}
                            {row.trade_code ? ` · ${row.trade_code}` : ''}
                            {row.parent_phone ? ` · ${row.parent_phone}` : ' · no parent phone'}
                          </p>
                        </td>
                        <td className="py-2 pr-3 text-right text-navy-500">
                          {money(row.fees.billed, row.fees.currency)}
                        </td>
                        <td className="py-2 pr-3 text-right text-emerald-600">
                          {money(row.fees.paid, row.fees.currency)}
                        </td>
                        <td className="py-2 pr-3 text-right font-bold text-navy-500">
                          {money(row.fees.balance, row.fees.currency)}
                        </td>
                        <td className="py-2 text-right">
                          <Btn
                            variant="ghost"
                            icon={MessageSquare}
                            disabled={row.fees.balance <= 0}
                            loading={busy}
                            onClick={() => void remind(row)}
                          >
                            SMS
                          </Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        ) : (
          <Panel title="Recent payments" icon={RefreshCw}>
            {payments.length === 0 ? (
              <Empty>No payment recorded yet.</Empty>
            ) : (
              <ul className="divide-y divide-navy-50">
                {payments.map((payment) => (
                  <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <div>
                      <p className="text-[12.5px] font-bold text-navy-500">
                        {payment.student?.full_name} — {money(payment.amount, currency)}
                      </p>
                      <p className="text-[10.5px] text-navy-300">
                        {payment.student?.student_id} · {payment.method}
                        {payment.reference ? ` · ${payment.reference}` : ''} ·{' '}
                        {new Date(payment.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <Chip tone="green">{payment.method}</Chip>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}

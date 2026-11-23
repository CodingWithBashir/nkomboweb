'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Boxes,
  CheckCircle2,
  Library,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Undo2,
} from 'lucide-react';
import api from '@/lib/axios';
import {
  Btn,
  Chip,
  Empty,
  Notice,
  PageHead,
  Panel,
  flatten,
  input,
  money,
} from '@/components/admin/ui';

type Student = { id: number; student_id: string; full_name: string; level: string };

type Book = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  copies: number;
  out: number;
  available: number;
  shelf: string;
};

type Loan = {
  id: number;
  title: string;
  borrower: string;
  student_code: string;
  borrowed_on: string;
  due_on: string | null;
  returned_on: string | null;
  status: 'out' | 'returned';
  overdue: boolean;
};

type Summary = { titles: number; copies: number; out: number; overdue: number };

type Asset = {
  id: number;
  name: string;
  code: string;
  category: string;
  location: string;
  quantity: number;
  condition: string;
  value: number;
  assigned_to: string;
  note: string;
};

type AssetList = {
  count: number;
  totals: { items: number; value: number; entries: number };
  by_condition: Record<string, number>;
  results: Asset[];
};

const TABS = [
  { id: 'library', label: 'Library', icon: Library },
  { id: 'assets', label: 'Assets', icon: Boxes },
] as const;

const conditionTone = (condition: string) =>
  condition === 'good' ? 'green' : condition === 'fair' ? 'amber' : 'red';

export default function ResourcesPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('library');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [bookForm, setBookForm] = useState({ title: '', author: '', copies: '10', shelf: '' });
  const [lendFor, setLendFor] = useState<Book | null>(null);
  const [lendForm, setLendForm] = useState({ student_id: '' });

  const [assets, setAssets] = useState<AssetList | null>(null);
  const [assetForm, setAssetForm] = useState({
    name: '',
    category: 'equipment',
    location: '',
    quantity: '1',
    condition: 'good',
    value: '',
    assigned_to: '',
  });

  const loadLibrary = useCallback(async () => {
    const [summaryResponse, booksResponse, loansResponse, studentsResponse] = await Promise.all([
      api.get('/library/'),
      api.get('/library/books/', { params: search ? { q: search } : {} }),
      api.get('/library/loans/'),
      api.get('/reports/', { params: { level: 'L3' } }),
    ]);
    setSummary(summaryResponse.data as Summary);
    setBooks(booksResponse.data.results ?? []);
    setLoans(loansResponse.data.results ?? []);
    setStudents(studentsResponse.data.results ?? []);
  }, [search]);

  const loadAssets = useCallback(async () => {
    const { data } = await api.get('/assets/');
    setAssets(data as AssetList);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'library') await loadLibrary();
      else await loadAssets();
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
    } finally {
      setLoading(false);
    }
  }, [tab, loadLibrary, loadAssets]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (work: () => Promise<unknown>, message?: string) => {
    setBusy(true);
    setNotice(null);
    try {
      await work();
      if (message) setNotice({ kind: 'ok', text: message });
      await load();
      return true;
    } catch (error) {
      setNotice({ kind: 'error', text: flatten(error) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const addBook = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bookForm.title.trim()) {
      setNotice({ kind: 'error', text: 'The title is required.' });
      return;
    }
    const ok = await act(
      () =>
        api.post('/library/books/', {
          title: bookForm.title,
          author: bookForm.author,
          copies: Number(bookForm.copies) || 1,
          shelf: bookForm.shelf,
        }),
      'Title added to the library.'
    );
    if (ok) setBookForm({ title: '', author: '', copies: '10', shelf: '' });
  };

  const lend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lendFor || !lendForm.student_id) {
      setNotice({ kind: 'error', text: 'Choose the student who borrows.' });
      return;
    }
    const ok = await act(
      () => api.post('/library/loans/', { book_id: lendFor.id, student_id: Number(lendForm.student_id) }),
      'Loan recorded — due in two weeks.'
    );
    if (ok) {
      setLendFor(null);
      setLendForm({ student_id: '' });
    }
  };

  const addAsset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assetForm.name.trim()) {
      setNotice({ kind: 'error', text: 'Give the item a name.' });
      return;
    }
    const ok = await act(
      () =>
        api.post('/assets/', {
          name: assetForm.name,
          category: assetForm.category,
          location: assetForm.location,
          quantity: Number(assetForm.quantity) || 1,
          condition: assetForm.condition,
          value: Number(assetForm.value) || 0,
          assigned_to: assetForm.assigned_to,
        }),
      'Asset added to the register.'
    );
    if (ok) {
      setAssetForm({ name: '', category: 'equipment', location: '', quantity: '1', condition: 'good', value: '', assigned_to: '' });
    }
  };

  const outLoans = useMemo(() => loans.filter((loan) => loan.status === 'out'), [loans]);

  return (
    <div className="min-h-screen bg-navy-50/50">
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <PageHead
          eyebrow="Resources"
          title="Library & school assets"
          description="What the school owns and what has left the building: books with their copies and loans, and the asset register that the annual census asks for."
          actions={
            <Btn variant="ghost" icon={RefreshCw} onClick={() => void load()}>
              Reload
            </Btn>
          }
        />

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
        </div>

        {notice ? (
          <div className="mb-4">
            <Notice kind={notice.kind}>{notice.text}</Notice>
          </div>
        ) : null}

        {loading ? (
          <Panel>
            <div className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-navy-400">
              <Loader2 size={15} className="animate-spin" /> Loading…
            </div>
          </Panel>
        ) : tab === 'library' ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { label: 'Titles', value: summary?.titles ?? 0 },
                { label: 'Copies', value: summary?.copies ?? 0 },
                { label: 'On loan', value: summary?.out ?? 0 },
                { label: 'Overdue', value: summary?.overdue ?? 0 },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-navy-100 bg-white px-4 py-3.5 shadow-sm">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-400">{item.label}</p>
                  <p className="mt-1.5 font-heading text-[19px] font-extrabold text-navy-500">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <Panel title="Catalogue" icon={BookOpen}>
                <input
                  className={`${input} mb-3`}
                  placeholder="Search a title, author or ISBN…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {books.length === 0 ? (
                  <Empty>No title matches. Add the first book on the right.</Empty>
                ) : (
                  <ul className="divide-y divide-navy-50">
                    {books.map((book) => (
                      <li key={book.id} className="flex flex-wrap items-center gap-3 py-2.5">
                        <div className="min-w-[180px] flex-1">
                          <p className="text-[12.5px] font-bold text-navy-500">{book.title}</p>
                          <p className="text-[10.5px] text-navy-300">
                            {book.author || '—'}
                            {book.shelf ? ` · ${book.shelf}` : ''} · {book.copies} copies
                          </p>
                        </div>
                        <Chip tone={book.available > 0 ? 'green' : 'red'}>
                          {book.available} available
                        </Chip>
                        <Btn
                          variant="ghost"
                          icon={Plus}
                          disabled={book.available === 0}
                          onClick={() => {
                            setLendFor(book);
                            setLendForm({ student_id: '' });
                          }}
                        >
                          Lend
                        </Btn>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <div className="space-y-4">
                <Panel title="Add a title" icon={Plus}>
                  <form className="space-y-3" onSubmit={addBook}>
                    <input
                      className={input}
                      placeholder="Title"
                      value={bookForm.title}
                      onChange={(event) => setBookForm({ ...bookForm, title: event.target.value })}
                    />
                    <input
                      className={input}
                      placeholder="Author"
                      value={bookForm.author}
                      onChange={(event) => setBookForm({ ...bookForm, author: event.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className={input}
                        inputMode="numeric"
                        placeholder="Copies"
                        value={bookForm.copies}
                        onChange={(event) => setBookForm({ ...bookForm, copies: event.target.value })}
                      />
                      <input
                        className={input}
                        placeholder="Shelf"
                        value={bookForm.shelf}
                        onChange={(event) => setBookForm({ ...bookForm, shelf: event.target.value })}
                      />
                    </div>
                    <Btn type="submit" icon={Plus} loading={busy} className="w-full">
                      Add title
                    </Btn>
                  </form>
                </Panel>

                {lendFor ? (
                  <Panel title={`Lend — ${lendFor.title}`} icon={Library}>
                    <form className="space-y-3" onSubmit={lend}>
                      <select
                        className={input}
                        value={lendForm.student_id}
                        onChange={(event) => setLendForm({ student_id: event.target.value })}
                      >
                        <option value="">Choose the student…</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.full_name} — {student.student_id}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Btn type="submit" loading={busy} className="flex-1">
                          Record loan
                        </Btn>
                        <Btn variant="ghost" type="button" onClick={() => setLendFor(null)}>
                          Cancel
                        </Btn>
                      </div>
                      <p className="text-[10.5px] text-navy-300">Due back in two weeks. Overdue loans are flagged in red.</p>
                    </form>
                  </Panel>
                ) : null}
              </div>
            </div>

            <Panel title={`Loans out (${outLoans.length})`} icon={Library}>
              {loans.length === 0 ? (
                <Empty>Nothing has left the library yet.</Empty>
              ) : (
                <ul className="divide-y divide-navy-50">
                  {loans.map((loan) => (
                    <li key={loan.id} className="flex flex-wrap items-center gap-3 py-2.5">
                      <div className="min-w-[190px] flex-1">
                        <p className="text-[12.5px] font-bold text-navy-500">{loan.title}</p>
                        <p className="text-[10.5px] text-navy-300">
                          {loan.borrower || '—'}
                          {loan.student_code ? ` (${loan.student_code})` : ''} · borrowed {loan.borrowed_on}
                          {loan.due_on ? ` · due ${loan.due_on}` : ''}
                          {loan.returned_on ? ` · returned ${loan.returned_on}` : ''}
                        </p>
                      </div>
                      {loan.status === 'returned' ? (
                        <Chip tone="green">
                          <CheckCircle2 size={10} /> returned
                        </Chip>
                      ) : (
                        <>
                          {loan.overdue ? <Chip tone="red">overdue</Chip> : <Chip tone="amber">out</Chip>}
                          <Btn
                            variant="ghost"
                            icon={Undo2}
                            loading={busy}
                            onClick={() =>
                              void act(
                                () => api.patch(`/library/loans/${loan.id}/`, { returned: true }),
                                'Book checked back in.'
                              )
                            }
                          >
                            Return
                          </Btn>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-navy-100 bg-white px-4 py-3.5 shadow-sm">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-400">Items</p>
                <p className="mt-1.5 font-heading text-[19px] font-extrabold text-navy-500">
                  {assets?.totals.items ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-navy-100 bg-white px-4 py-3.5 shadow-sm">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-400">Book value</p>
                <p className="mt-1.5 font-heading text-[19px] font-extrabold text-navy-500">
                  {money(assets?.totals.value ?? 0)}
                </p>
              </div>
              <div className="rounded-xl border border-navy-100 bg-white px-4 py-3.5 shadow-sm">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-400">Needs repair</p>
                <p className="mt-1.5 font-heading text-[19px] font-extrabold text-navy-500">
                  {(assets?.by_condition.fair ?? 0) + (assets?.by_condition.poor ?? 0)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <Panel title="Asset register" icon={Boxes}>
                {!assets || assets.results.length === 0 ? (
                  <Empty>Nothing registered yet.</Empty>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-[12px]">
                      <thead>
                        <tr className="border-b border-navy-50 text-[10.5px] uppercase tracking-[0.12em] text-navy-300">
                          <th className="py-2 pr-3">Item</th>
                          <th className="py-2 pr-3">Location</th>
                          <th className="py-2 pr-3 text-right">Qty</th>
                          <th className="py-2 pr-3">Condition</th>
                          <th className="py-2 pr-3 text-right">Value</th>
                          <th className="py-2" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-50">
                        {assets.results.map((asset) => (
                          <tr key={asset.id} className="hover:bg-navy-50/40">
                            <td className="py-2 pr-3">
                              <p className="font-bold text-navy-500">{asset.name}</p>
                              <p className="text-[10.5px] text-navy-300">
                                {asset.code ? `${asset.code} · ` : ''}
                                {asset.category}
                                {asset.assigned_to ? ` · ${asset.assigned_to}` : ''}
                              </p>
                            </td>
                            <td className="py-2 pr-3 text-navy-400">{asset.location || '—'}</td>
                            <td className="py-2 pr-3 text-right text-navy-500">{asset.quantity}</td>
                            <td className="py-2 pr-3">
                              <Chip tone={conditionTone(asset.condition)}>{asset.condition}</Chip>
                            </td>
                            <td className="py-2 pr-3 text-right text-navy-500">{money(asset.value)}</td>
                            <td className="py-2 text-right">
                              <Btn
                                variant="danger"
                                icon={Trash2}
                                loading={busy}
                                onClick={() =>
                                  void act(() => api.delete(`/assets/${asset.id}/`), 'Asset removed.')
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>

              <Panel title="Register an item" icon={Plus}>
                <form className="space-y-3" onSubmit={addAsset}>
                  <input
                    className={input}
                    placeholder="Item name"
                    value={assetForm.name}
                    onChange={(event) => setAssetForm({ ...assetForm, name: event.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className={input}
                      value={assetForm.category}
                      onChange={(event) => setAssetForm({ ...assetForm, category: event.target.value })}
                    >
                      <option value="equipment">Equipment</option>
                      <option value="it">IT</option>
                      <option value="furniture">Furniture</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="building">Building</option>
                    </select>
                    <select
                      className={input}
                      value={assetForm.condition}
                      onChange={(event) => setAssetForm({ ...assetForm, condition: event.target.value })}
                    >
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="broken">Broken</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={input}
                      inputMode="numeric"
                      placeholder="Quantity"
                      value={assetForm.quantity}
                      onChange={(event) => setAssetForm({ ...assetForm, quantity: event.target.value })}
                    />
                    <input
                      className={input}
                      inputMode="numeric"
                      placeholder="Value (RWF)"
                      value={assetForm.value}
                      onChange={(event) => setAssetForm({ ...assetForm, value: event.target.value })}
                    />
                  </div>
                  <input
                    className={input}
                    placeholder="Location"
                    value={assetForm.location}
                    onChange={(event) => setAssetForm({ ...assetForm, location: event.target.value })}
                  />
                  <input
                    className={input}
                    placeholder="Assigned to (department / person)"
                    value={assetForm.assigned_to}
                    onChange={(event) => setAssetForm({ ...assetForm, assigned_to: event.target.value })}
                  />
                  <Btn type="submit" icon={Plus} loading={busy} className="w-full">
                    Add asset
                  </Btn>
                </form>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

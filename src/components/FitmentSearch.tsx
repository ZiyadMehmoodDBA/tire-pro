import { useState, useEffect } from 'react';
import {
  Car, Search, ChevronDown, CheckCircle2, XCircle,
  Loader2, AlertCircle, Award, TriangleAlert, RefreshCw,
} from 'lucide-react';
import { api } from '../api/client';

/* ── Types ────────────────────────────────────────────────────────────────── */
type FitmentRow = {
  id: number;
  category: string;
  make: string;
  model: string;
  year_from: number | null;
  year_to: number | null;
  tire_size: string;
  gtr_pattern: string | null;
  position: 'Front' | 'Rear' | null;
};

type CatalogEntry = {
  id: number;
  brand: string;
  tire_model: string;
  size: string;
  pattern: string | null;
  load_index: string | null;
  speed_index: string | null;
  tire_type: string | null;
};

/* ── Category colour + icon map ───────────────────────────────────────────── */
const CATEGORY_META: Record<string, { color: string; abbr: string }> = {
  'Passenger Car Tyres':      { color: 'bg-blue-600',   abbr: 'PCR' },
  'SUV/Crossovers Tyres':     { color: 'bg-emerald-600', abbr: 'SUV' },
  'Light Truck Tyres':        { color: 'bg-amber-600',  abbr: 'LT'  },
  'Truck & Bus/OTR Tyres':    { color: 'bg-orange-700', abbr: 'TBR' },
  'Tractor Tyres':            { color: 'bg-lime-700',   abbr: 'AGR' },
  'Motorcycle/Rickshaw Tyres':{ color: 'bg-purple-600', abbr: 'MCY' },
};

/* ── Sub-components ───────────────────────────────────────────────────────── */
function Select({
  value, onChange, options, placeholder, disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none border rounded-xl py-2.5 pl-3 pr-8 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
          disabled
            ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
            : 'border-slate-300 text-slate-800 cursor-pointer hover:border-slate-400'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function YearBadge({ row }: { row: FitmentRow }) {
  if (!row.year_from) return <span className="text-slate-400 text-xs">—</span>;
  return (
    <span className="text-slate-600 text-xs whitespace-nowrap">
      {row.year_from}–{row.year_to ?? 'present'}
    </span>
  );
}

function SizeBadge({ size }: { size: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200 whitespace-nowrap tracking-wide">
      {size}
    </span>
  );
}

function PositionBadge({ position }: { position: 'Front' | 'Rear' | null }) {
  if (!position) return null;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
      position === 'Front' ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'
    }`}>
      {position === 'Front' ? 'F' : 'R'}
    </span>
  );
}

function GtrBadge({ pattern }: { pattern: string | null }) {
  if (!pattern) return <span className="text-slate-300 text-xs italic">—</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold whitespace-nowrap">
      <Award size={10} />
      {pattern}
    </span>
  );
}

function CatalogBadges({ entries }: { entries: CatalogEntry[] }) {
  if (entries.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-300">
        <XCircle size={12} /> Not in catalogue
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(c => (
        <span
          key={c.id}
          title={[c.load_index && `LI: ${c.load_index}`, c.speed_index && `SI: ${c.speed_index}`, c.tire_type].filter(Boolean).join(' | ')}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-medium cursor-default"
        >
          <CheckCircle2 size={10} />
          {c.brand}{c.pattern ? ` — ${c.pattern}` : ''}
        </span>
      ))}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export function FitmentSearch() {
  const [categories,    setCategories]    = useState<string[]>([]);
  const [catsLoading,   setCatsLoading]   = useState(true);
  const [catsError,     setCatsError]     = useState('');
  const [makes,         setMakes]         = useState<string[]>([]);
  const [models,        setModels]        = useState<string[]>([]);

  const [selCategory, setSelCategory] = useState('');
  const [selMake,     setSelMake]     = useState('');
  const [selModel,    setSelModel]    = useState('');

  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [error,    setError]    = useState('');
  const [fitments, setFitments] = useState<FitmentRow[]>([]);
  const [matches,  setMatches]  = useState<Record<string, CatalogEntry[]>>({});

  // Boot: load categories
  const loadCategories = () => {
    setCatsLoading(true);
    setCatsError('');
    api.fitments.categories()
      .then(data => {
        setCategories(data);
        if (data.length === 0) setCatsError('no_data');
      })
      .catch(() => setCatsError('api_error'))
      .finally(() => setCatsLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);

  // Category change → reload makes
  useEffect(() => {
    setSelMake(''); setSelModel(''); setMakes([]); setModels([]);
    api.fitments.makes(selCategory || undefined).then(setMakes).catch(() => {});
  }, [selCategory]);

  // Make change → reload models
  useEffect(() => {
    setSelModel(''); setModels([]);
    if (!selMake) return;
    api.fitments.models(selMake, selCategory || undefined).then(setModels).catch(() => {});
  }, [selMake, selCategory]);

  const handleSearch = async () => {
    if (!selMake && !selModel) { setError('Please select at least a Make.'); return; }
    setError(''); setLoading(true); setSearched(false);
    try {
      const result = await api.fitments.search({
        make:     selMake     || undefined,
        model:    selModel    || undefined,
        category: selCategory || undefined,
      });
      setFitments(result.fitments);
      setMatches(result.catalogMatches);
      setSearched(true);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  /* ── Group results by make → model (for tractor/moto with Front/Rear pairs) */
  const grouped = fitments.reduce<Record<string, FitmentRow[]>>((acc, f) => {
    const key = `${f.make}|||${f.model}`;
    (acc[key] ??= []).push(f);
    return acc;
  }, {});

  const catMeta = selCategory ? CATEGORY_META[selCategory] : null;

  const hasPosition = fitments.some(f => f.position !== null);
  const totalResults = fitments.length;
  const catalogHits  = fitments.filter(f => (matches[f.tire_size] ?? []).length > 0).length;

  return (
    <div className="space-y-5" onKeyDown={handleKeyDown}>

      {/* ── Header banner ──────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-red-700 via-red-600 to-red-500 px-6 py-5 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-200 mb-0.5">GTR Tyre Fitment Guide</p>
            <h2 className="text-lg font-black tracking-tight leading-tight">
              Find the Right Tyre for Any Vehicle
            </h2>
            <p className="text-red-100 text-xs mt-1">
              Pakistan-market OEM fitment · 130+ vehicle models · cross-referenced with your GTR catalogue
            </p>
          </div>
          <div className="hidden sm:flex gap-2">
            {Object.entries(CATEGORY_META).map(([cat, meta]) => (
              <span
                key={cat}
                title={cat}
                className={`${meta.color} text-white text-[9px] font-bold px-2 py-1 rounded-lg opacity-80`}
              >
                {meta.abbr}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search bar ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-5 py-3">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Select Tyre</p>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Tyre Category
              </label>
              <Select
                value={selCategory}
                onChange={setSelCategory}
                options={categories}
                placeholder="All Categories"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Make
              </label>
              <Select
                value={selMake}
                onChange={setSelMake}
                options={makes}
                placeholder="Select Make"
                disabled={makes.length === 0}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Model / Type
              </label>
              <Select
                value={selModel}
                onChange={setSelModel}
                options={models}
                placeholder="Select Model"
                disabled={models.length === 0}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || (!selMake && !selModel)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 active:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading
                ? <Loader2 size={15} className="animate-spin" />
                : <Search size={15} />
              }
              Search
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <AlertCircle size={13} /> {error}
            </div>
          )}
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────────────────── */}
      {searched && (
        fitments.length === 0 ? (
          <div className="text-center py-16">
            <XCircle size={32} className="mx-auto mb-3 text-slate-200" />
            <p className="text-slate-400 text-sm">No fitment data found for the selected vehicle.</p>
            <p className="text-slate-300 text-xs mt-1">Try broadening your selection.</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Summary bar */}
            <div className="flex flex-wrap items-center gap-3 px-1">
              <span className="text-xs text-slate-500">
                <span className="font-bold text-slate-800">{totalResults}</span> fitment{totalResults !== 1 ? 's' : ''}
              </span>
              {catMeta && (
                <span className={`${catMeta.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-lg`}>
                  {selCategory}
                </span>
              )}
              {catalogHits > 0 && (
                <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> {catalogHits} size{catalogHits !== 1 ? 's' : ''} matched in your GTR catalogue
                </span>
              )}
              {catalogHits < totalResults && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <TriangleAlert size={12} /> {totalResults - catalogHits} not yet in catalogue
                </span>
              )}
            </div>

            {/* Results grouped by make+model */}
            {Object.entries(grouped).map(([groupKey, rows]) => {
              const [make, model] = groupKey.split('|||');
              const catKey = rows[0].category;
              const meta   = CATEGORY_META[catKey] ?? { color: 'bg-slate-700', abbr: '—' };

              return (
                <div key={groupKey} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Group header */}
                  <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-3">
                    <Car size={15} className="text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm">{make}</span>
                      <span className="text-slate-400 text-sm ml-2">{model}</span>
                    </div>
                    <span className={`${meta.color} text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0`}>
                      {meta.abbr}
                    </span>
                  </div>

                  {/* Fitment table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                            Years
                          </th>
                          {hasPosition && (
                            <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-12">
                              Pos.
                            </th>
                          )}
                          <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                            OEM Size
                          </th>
                          <th className="px-4 py-2 text-left text-[10px] font-semibold text-red-500 uppercase tracking-wide">
                            GTR Recommended
                          </th>
                          <th className="px-4 py-2 text-left text-[10px] font-semibold text-green-600 uppercase tracking-wide">
                            Catalogue Match
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(f => {
                          const catalogEntries = matches[f.tire_size] ?? [];
                          const gtrInCatalog   = catalogEntries.some(
                            c => f.gtr_pattern && (
                              c.pattern?.toLowerCase().includes(f.gtr_pattern.toLowerCase()) ||
                              c.tire_model?.toLowerCase().includes(f.gtr_pattern.toLowerCase())
                            )
                          );

                          return (
                            <tr
                              key={f.id}
                              className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <YearBadge row={f} />
                              </td>
                              {hasPosition && (
                                <td className="px-3 py-3 text-center">
                                  <PositionBadge position={f.position} />
                                </td>
                              )}
                              <td className="px-4 py-3">
                                <SizeBadge size={f.tire_size} />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <GtrBadge pattern={f.gtr_pattern} />
                                  {f.gtr_pattern && gtrInCatalog && (
                                    <span title="This GTR pattern is in your catalogue" className="text-green-500">
                                      <CheckCircle2 size={12} />
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <CatalogBadges entries={catalogEntries} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Empty / error state (before first search) ──────────────── */}
      {!searched && !loading && (
        <div className="text-center py-14 select-none">
          {/* Server not started or API error */}
          {catsError && (
            <div className="mb-6 inline-block text-left bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 max-w-md">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">
                    {catsError === 'api_error'
                      ? 'Fitment API unavailable'
                      : 'No fitment data found'}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    {catsError === 'api_error'
                      ? 'The backend server may need to be restarted. Run the server once to create the vehicle_fitments table and seed Pakistan-market data.'
                      : 'The vehicle_fitments table is empty. Restart the backend server to trigger the seed.'}
                  </p>
                  <button
                    onClick={loadCategories}
                    disabled={catsLoading}
                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors"
                  >
                    {catsLoading
                      ? <Loader2 size={12} className="animate-spin" />
                      : <RefreshCw size={12} />}
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {catsLoading && (
            <Loader2 size={28} className="mx-auto mb-3 text-slate-300 animate-spin" />
          )}

          {/* Normal idle state */}
          {!catsError && !catsLoading && (
            <>
              <Car size={44} className="mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400 text-sm font-medium">Select a vehicle category, make, and model above</p>
              <p className="text-slate-300 text-xs mt-1">
                Get OEM tyre size and see which GTR products fit
              </p>

              {/* Category quick-pick pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {categories.map(cat => {
                  const m = CATEGORY_META[cat] ?? { color: 'bg-slate-400', abbr: '' };
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelCategory(cat)}
                      className={`${m.color} text-white text-xs font-semibold px-3 py-1.5 rounded-xl opacity-70 hover:opacity-100 transition-opacity`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

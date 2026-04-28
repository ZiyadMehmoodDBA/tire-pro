import { useState, useEffect } from 'react';
import { Car, Search, ChevronDown, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

type FitmentRow = {
  id: number;
  make: string;
  model: string;
  variant: string;
  year_from: number;
  year_to: number | null;
  category: string;
  tire_size: string;
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
        className={`w-full appearance-none border border-slate-200 rounded-xl py-2.5 pl-3 pr-8 text-sm font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white'
        } ${value ? 'text-slate-900' : 'text-slate-400'}`}
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

export function FitmentSearch() {
  const [categories, setCategories] = useState<string[]>([]);
  const [makes,      setMakes]      = useState<string[]>([]);
  const [models,     setModels]     = useState<string[]>([]);

  const [selCategory, setSelCategory] = useState('');
  const [selMake,     setSelMake]     = useState('');
  const [selModel,    setSelModel]    = useState('');

  const [loading,   setLoading]   = useState(false);
  const [searched,  setSearched]  = useState(false);
  const [error,     setError]     = useState('');
  const [fitments,  setFitments]  = useState<FitmentRow[]>([]);
  const [matches,   setMatches]   = useState<Record<string, CatalogEntry[]>>({});

  // Load categories once
  useEffect(() => {
    api.fitments.categories().then(setCategories).catch(() => {});
  }, []);

  // Reload makes when category changes
  useEffect(() => {
    setSelMake('');
    setSelModel('');
    setMakes([]);
    setModels([]);
    api.fitments.makes(selCategory || undefined).then(setMakes).catch(() => {});
  }, [selCategory]);

  // Reload models when make changes
  useEffect(() => {
    setSelModel('');
    setModels([]);
    if (!selMake) return;
    api.fitments.models(selMake, selCategory || undefined).then(setModels).catch(() => {});
  }, [selMake, selCategory]);

  const handleSearch = async () => {
    if (!selMake && !selModel) {
      setError('Select at least a Make to search.');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(false);
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

  const yearLabel = (f: FitmentRow) =>
    f.year_to ? `${f.year_from}–${f.year_to}` : `${f.year_from}–present`;

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 text-white">
        <div className="flex items-center gap-3 mb-1">
          <Car size={20} />
          <h2 className="text-base font-bold tracking-wide uppercase">
            Find Recommended Tyre by Vehicle
          </h2>
        </div>
        <p className="text-red-100 text-xs">
          Pakistan-market OEM fitment guide — cross-referenced with your GTR catalogue
        </p>
      </div>

      {/* Search bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Select Tyre
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <Select
            value={selCategory}
            onChange={setSelCategory}
            options={categories}
            placeholder="Select Category"
          />
          <Select
            value={selMake}
            onChange={setSelMake}
            options={makes}
            placeholder="Select Make"
            disabled={makes.length === 0}
          />
          <Select
            value={selModel}
            onChange={setSelModel}
            options={models}
            placeholder="Select Model"
            disabled={models.length === 0}
          />
          <button
            onClick={handleSearch}
            disabled={loading || (!selMake && !selModel)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Search
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <AlertCircle size={13} /> {error}
          </div>
        )}
      </div>

      {/* Results */}
      {searched && (
        fitments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No fitment data found for the selected vehicle.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              {fitments.length} fitment record{fitments.length !== 1 ? 's' : ''} found
            </p>

            {/* Group by model */}
            {Object.entries(
              fitments.reduce<Record<string, FitmentRow[]>>((acc, f) => {
                const key = `${f.make} ${f.model}`;
                (acc[key] ??= []).push(f);
                return acc;
              }, {})
            ).map(([vehicleLabel, rows]) => (
              <div key={vehicleLabel} className="border border-slate-200 rounded-2xl overflow-hidden">
                {/* Vehicle header */}
                <div className="bg-slate-900 text-white px-5 py-3 flex items-center gap-2">
                  <Car size={15} className="text-slate-400" />
                  <span className="font-bold text-sm">{vehicleLabel}</span>
                  <span className="ml-auto text-xs text-slate-400">{rows[0].category}</span>
                </div>

                {/* Fitment table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Variant</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Years</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">OEM Size</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">GTR Catalogue Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(f => {
                        const catalogEntries = matches[f.tire_size] ?? [];
                        return (
                          <tr key={f.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-slate-700 font-medium">{f.variant}</td>
                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{yearLabel(f)}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100">
                                {f.tire_size}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {catalogEntries.length === 0 ? (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                  <XCircle size={13} className="text-slate-300" />
                                  Not in catalogue
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {catalogEntries.map(c => (
                                    <span
                                      key={c.id}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-green-50 border border-green-100 text-green-700 text-xs font-medium"
                                      title={[c.pattern, c.load_index, c.speed_index].filter(Boolean).join(' / ')}
                                    >
                                      <CheckCircle2 size={11} />
                                      {c.brand}
                                      {c.tire_model && c.tire_model !== c.brand ? ` ${c.tire_model}` : ''}
                                      {c.pattern ? ` — ${c.pattern}` : ''}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {!searched && !loading && (
        <div className="text-center py-10 text-slate-300 text-sm select-none">
          <Car size={40} className="mx-auto mb-3 opacity-30" />
          Select a vehicle above to see OEM tyre sizes and GTR catalogue matches
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Loader2, CheckCircle, Package, Search } from 'lucide-react';
import { api } from '../api/client';
import { formatCurrency } from '../lib/utils';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface LineItem {
  item_key: string;   // 'p:id' | 't:id'
  item_name: string;
  qty: number;
  unit_price: number;
  stock?: number;     // current stock (tires only) — for display
}

interface CatalogItem {
  key: string;
  name: string;
  subtitle: string;
  costPrice: number;
  stock?: number;
  tireId?: number;
  productId?: number;
}

const EMPTY_ITEM: LineItem = { item_key: '', item_name: '', qty: 1, unit_price: 0 };

export default function GRNModal({ onClose, onCreated }: Props) {
  const [suppliers,   setSuppliers]   = useState<any[]>([]);
  const [catalog,     setCatalog]     = useState<CatalogItem[]>([]);
  const [supplierId,  setSupplierId]  = useState('');
  const [date,        setDate]        = useState(new Date().toISOString().split('T')[0]);
  const [refNo,       setRefNo]       = useState('');
  const [notes,       setNotes]       = useState('');
  const [items,       setItems]       = useState<LineItem[]>([{ ...EMPTY_ITEM }]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);

  // Per-row search
  const [rowSearch, setRowSearch]     = useState<Record<number, string>>({});
  const [rowOpen,   setRowOpen]       = useState<Record<number, boolean>>({});
  const searchRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    api.suppliers.list().then(setSuppliers).catch(() => {});
    Promise.all([api.inventory.list(), api.products.list()]).then(([tires, products]) => {
      const items: CatalogItem[] = [];
      tires.forEach((t: any) => items.push({
        key: `t:${t.id}`,
        name: `${t.brand} ${t.model} ${t.size}`,
        subtitle: `${t.type || 'Tire'} · Stock: ${t.stock}`,
        costPrice: Number(t.cost_price || 0),
        stock: Number(t.stock || 0),
        tireId: t.id,
      }));
      products.filter((p: any) => p.is_active && p.category !== 'Service').forEach((p: any) => items.push({
        key: `p:${p.id}`,
        name: p.name,
        subtitle: p.category || 'Product',
        costPrice: Number(p.cost_price || 0),
        productId: p.id,
      }));
      setCatalog(items);
    }).catch(() => {});
  }, []);

  // Click-outside to close dropdowns
  useEffect(() => {
    const handler = () => setRowOpen({});
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const addItem    = () => setItems(p => [...p, { ...EMPTY_ITEM }]);
  const removeItem = (i: number) => {
    setItems(p => p.filter((_, idx) => idx !== i));
    setRowSearch(p => { const n = { ...p }; delete n[i]; return n; });
    setRowOpen(p => { const n = { ...p }; delete n[i]; return n; });
  };

  const selectCatalogItem = (rowIdx: number, cat: CatalogItem) => {
    setItems(prev => {
      const next = [...prev];
      next[rowIdx] = {
        item_key:   cat.key,
        item_name:  cat.name,
        qty:        next[rowIdx].qty || 1,
        unit_price: cat.costPrice,
        stock:      cat.stock,
      };
      return next;
    });
    setRowSearch(p => ({ ...p, [rowIdx]: cat.name }));
    setRowOpen(p => ({ ...p, [rowIdx]: false }));
  };

  const updateQty   = (i: number, v: number) =>
    setItems(p => p.map((it, idx) => idx === i ? { ...it, qty: Math.max(1, v) } : it));
  const updatePrice = (i: number, v: number) =>
    setItems(p => p.map((it, idx) => idx === i ? { ...it, unit_price: Math.max(0, v) } : it));

  const getRowResults = (i: number) => {
    const q = (rowSearch[i] || '').toLowerCase().trim();
    if (!q) return catalog.slice(0, 6);
    return catalog.filter(c =>
      c.name.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)
    ).slice(0, 8);
  };

  const subtotal = items.reduce((s, it) => s + it.qty * it.unit_price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return setError('Please select a supplier.');
    if (items.some(it => !it.item_key || it.qty < 1)) return setError('Fill in all line items.');
    setError(''); setLoading(true);
    try {
      await api.purchases.create({
        supplier_id: Number(supplierId),
        date,
        status: 'received',  // GRN always receives immediately
        notes: [refNo ? `Ref: ${refNo}` : '', notes].filter(Boolean).join(' — '),
        reference_no: refNo || undefined,
        items: items.map(it => {
          const isProd = it.item_key.startsWith('p:');
          return {
            ...(isProd ? { product_id: Number(it.item_key.slice(2)) }
                       : { tire_id:    Number(it.item_key.slice(2)) }),
            tire_name:  it.item_name,
            qty:        it.qty,
            unit_price: it.unit_price,
          };
        }),
      });
      setSuccess(true);
      setTimeout(() => { onCreated(); onClose(); }, 900);
    } catch (err: any) {
      setError(err.message || 'Failed to receive stock');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[94vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Package size={15} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Receive Stock — GRN</h2>
              <p className="text-xs text-slate-400">Stock updated immediately on save</p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Header fields */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50">
                  <option value="">Select supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reference / GRN #</label>
                <input value={refNo} onChange={e => setRefNo(e.target.value)} placeholder="e.g. GRN-001"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50" />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">
                  Items Received <span className="text-red-500">*</span>
                </label>
                <button type="button" onClick={addItem}
                  className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-semibold">
                  <Plus size={13} /> Add Row
                </button>
              </div>

              {/* Column headers */}
              <div className="hidden sm:grid grid-cols-12 gap-2 mb-1 px-1 text-xs text-slate-400 font-medium">
                <span className="col-span-6">Product / Tire</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-right">Cost Price</span>
                <span className="col-span-1"></span>
              </div>

              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-start">

                    {/* Item search */}
                    <div className="col-span-12 sm:col-span-6 relative"
                      onClick={e => e.stopPropagation()}>
                      <div className="relative">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          ref={el => { searchRefs.current[i] = el; }}
                          value={rowSearch[i] ?? item.item_name}
                          onChange={e => {
                            setRowSearch(p => ({ ...p, [i]: e.target.value }));
                            setRowOpen(p => ({ ...p, [i]: true }));
                            if (!e.target.value) {
                              setItems(p => p.map((it, idx) => idx === i ? { ...it, item_key: '', item_name: '' } : it));
                            }
                          }}
                          onFocus={() => setRowOpen(p => ({ ...p, [i]: true }))}
                          placeholder="Search tire or product..."
                          className="w-full text-sm border border-slate-200 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                        />
                      </div>
                      {rowOpen[i] && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-52 overflow-y-auto">
                          {getRowResults(i).length === 0 ? (
                            <p className="text-xs text-slate-400 px-3 py-2">No results</p>
                          ) : getRowResults(i).map(cat => (
                            <button
                              key={cat.key}
                              type="button"
                              onMouseDown={e => { e.preventDefault(); selectCatalogItem(i, cat); }}
                              className="w-full text-left px-3 py-2 hover:bg-violet-50 transition-colors"
                            >
                              <div className="text-sm font-medium text-slate-800">{cat.name}</div>
                              <div className="text-xs text-slate-400">{cat.subtitle} · {formatCurrency(cat.costPrice)}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Qty */}
                    <div className="col-span-4 sm:col-span-2">
                      <input type="number" min={1}
                        value={item.qty}
                        onChange={e => updateQty(i, Number(e.target.value))}
                        className="w-full text-sm border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 text-center bg-slate-50"
                        placeholder="Qty" />
                    </div>

                    {/* Cost */}
                    <div className="col-span-7 sm:col-span-3">
                      <input type="number" min={0} step="0.01"
                        value={item.unit_price}
                        onChange={e => updatePrice(i, Number(e.target.value))}
                        className="w-full text-sm border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 text-right bg-slate-50"
                        placeholder="Cost" />
                    </div>

                    {/* Remove */}
                    <div className="col-span-1 flex items-center justify-end pt-1">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* Stock warning */}
                    {item.stock !== undefined && item.stock >= 0 && (
                      <div className="col-span-12 -mt-1 ml-1 text-[11px] text-slate-400">
                        Current stock: {item.stock} → will become {item.stock + item.qty}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..."
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50" />
            </div>

            {/* Total */}
            <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-violet-600 font-medium">Total Goods Value</p>
                <p className="text-xs text-emerald-600 mt-0.5">✓ Stock will be added to inventory on save</p>
              </div>
              <p className="text-xl font-bold text-violet-700">{formatCurrency(subtotal)}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 flex-shrink-0">
            <button type="button" onClick={onClose} disabled={loading}
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || success}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-60 min-w-40 justify-center">
              {loading  ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
              : success ? <><CheckCircle size={15} /> Stock Received!</>
              : 'Receive Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

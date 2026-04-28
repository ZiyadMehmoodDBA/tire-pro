import { useState, useEffect, useCallback } from 'react';
import {
  Building2, FileText, Tag, Save, Loader2, CheckCircle,
  Plus, Pencil, Trash2, GripVertical, X, AlertCircle, Package,
  Wrench, Users, EyeOff, Eye, ShieldCheck, UserCheck, UserX,
  Server, Database, Activity, HardDrive, RefreshCw, Monitor, Cpu,
} from 'lucide-react';
import { api } from '../api/client';
import { formatCurrency } from '../lib/utils';

type Tab = 'company' | 'defaults' | 'products' | 'lookups' | 'services' | 'users' | 'system';

const ALL_TABS: { id: Tab; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { id: 'company',  label: 'Company Profile',      icon: Building2 },
  { id: 'defaults', label: 'Invoice & PO Defaults', icon: FileText },
  { id: 'products', label: 'Products',              icon: Package  },
  { id: 'lookups',  label: 'Lookup Tables',         icon: Tag      },
  { id: 'services', label: 'Services',              icon: Wrench   },
  { id: 'users',    label: 'Users',                 icon: Users    },
  { id: 'system',   label: 'System',                icon: Server,  adminOnly: true },
];

function getCurrentUserRole(): string | null {
  try {
    const token = localStorage.getItem('tirepro_at');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.role ?? null;
  } catch { return null; }
}

function Field({
  label, help, children,
}: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
      {help && <p className="text-xs text-slate-400 mt-1">{help}</p>}
    </div>
  );
}

function Input({
  value, onChange, placeholder, type = 'text', prefix,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; prefix?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full text-sm border border-slate-200 rounded-xl py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 ${prefix ? 'pl-10 pr-3' : 'px-3'}`}
      />
    </div>
  );
}

// ── Company Tab ────────────────────────────────────────────────────────────────
function CompanyTab({
  settings, onChange,
}: { settings: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className="sm:col-span-2">
        <Field label="Company Name" help="Appears on invoices, POs, and all printouts">
          <Input value={settings.company_name ?? ''} onChange={v => onChange('company_name', v)} placeholder="e.g. TirePro" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Tagline" help="Short description shown below company name on documents">
          <Input value={settings.company_tagline ?? ''} onChange={v => onChange('company_tagline', v)} placeholder="e.g. Tyre & Wheel Solutions" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Address" help="Full postal address printed on invoices and purchase orders">
          <textarea
            value={settings.company_address ?? ''}
            onChange={e => onChange('company_address', e.target.value)}
            placeholder="123 Industrial Zone, Lahore, Pakistan"
            rows={2}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none"
          />
        </Field>
      </div>
      <Field label="Phone" help="Customer-facing phone number on documents">
        <Input value={settings.company_phone ?? ''} onChange={v => onChange('company_phone', v)} placeholder="+92-42-1234567" />
      </Field>
      <Field label="Email" help="Business email shown on invoices">
        <Input value={settings.company_email ?? ''} onChange={v => onChange('company_email', v)} placeholder="info@company.pk" type="email" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Announcement / News Banner" help="Shows a banner at the top of the app for all users. Leave blank to hide.">
          <textarea
            value={settings.announcement ?? ''}
            onChange={e => onChange('announcement', e.target.value)}
            placeholder="e.g. Office closed on Friday · New tire brands now in stock · System maintenance tonight at 11 PM"
            rows={2}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none"
          />
        </Field>
      </div>
    </div>
  );
}

// ── Defaults Tab ───────────────────────────────────────────────────────────────
function DefaultsTab({
  settings, onChange,
}: { settings: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Numbering Prefixes</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Invoice Prefix"
            help="Prepended to invoice numbers — e.g. 'INV' → INV-2025-001"
          >
            <Input
              value={settings.invoice_prefix ?? ''}
              onChange={v => onChange('invoice_prefix', v.toUpperCase())}
              placeholder="INV"
            />
          </Field>
          <Field
            label="Purchase Order Prefix"
            help="Prepended to PO numbers — e.g. 'PO' → PO-2025-001"
          >
            <Input
              value={settings.po_prefix ?? ''}
              onChange={v => onChange('po_prefix', v.toUpperCase())}
              placeholder="PO"
            />
          </Field>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Financial Defaults</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field
            label="Default Tax Rate (%)"
            help="Applied automatically to new sales invoices"
          >
            <Input
              type="number"
              value={settings.default_tax_rate ?? ''}
              onChange={v => onChange('default_tax_rate', v)}
              placeholder="15"
            />
          </Field>
          <Field
            label="Payment Due (days)"
            help="Payment terms printed at the bottom of invoices"
          >
            <Input
              type="number"
              value={settings.payment_due_days ?? ''}
              onChange={v => onChange('payment_due_days', v)}
              placeholder="30"
            />
          </Field>
          <Field
            label="Currency Code"
            help="3-letter ISO code shown on all amounts"
          >
            <Input
              value={settings.currency ?? ''}
              onChange={v => onChange('currency', v.toUpperCase())}
              placeholder="PKR"
            />
          </Field>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sale Defaults</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Default Sale Status"
            help="Status pre-selected when creating a new invoice"
          >
            <select
              value={settings.default_sale_status ?? 'pending'}
              onChange={e => onChange('default_sale_status', e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </Field>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Auto-Refresh</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Auto-Refresh Interval (seconds)"
            help="How often all data pages refresh automatically. Set to 0 to disable. Restart any open page after saving."
          >
            <select
              value={settings.refresh_interval ?? '60'}
              onChange={e => onChange('refresh_interval', e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            >
              <option value="0">Disabled</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="120">2 minutes</option>
              <option value="300">5 minutes</option>
              <option value="600">10 minutes</option>
            </select>
          </Field>
        </div>
      </div>
    </div>
  );
}

// ── Products Tab ───────────────────────────────────────────────────────────────
const EMPTY_PRODUCT = {
  code: '', name: '', description: '', category: '', unit: 'pcs',
  cost_price: '', sale_price: '', is_active: true,
};

function ProductsTab() {
  const [products, setProducts]     = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState<number | null>(null);
  const [form, setForm]             = useState({ ...EMPTY_PRODUCT });
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const load = () => {
    setLoadingList(true);
    api.products.list()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoadingList(false));
  };

  useEffect(load, []);

  const setF = (k: string, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => {
    setForm({ ...EMPTY_PRODUCT });
    setEditId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setForm({
      code:        p.code        ?? '',
      name:        p.name        ?? '',
      description: p.description ?? '',
      category:    p.category    ?? '',
      unit:        p.unit        ?? 'pcs',
      cost_price:  p.cost_price  ?? '',
      sale_price:  p.sale_price  ?? '',
      is_active:   p.is_active   !== false,
    });
    setEditId(p.id);
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditId(null); };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        cost_price: Number(form.cost_price) || 0,
        sale_price: Number(form.sale_price) || 0,
      };
      if (editId) await api.products.update(editId, payload);
      else        await api.products.create(payload);
      closeForm();
      load();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setDeleteError('');
    try {
      await api.products.delete(id);
      load();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-700">Products / Goods Catalog</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Services, accessories, and other items available on invoices, sales, and purchase orders.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> Add Product
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-slate-700">{editId ? 'Edit Product' : 'New Product'}</p>
            <button onClick={closeForm} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
              <X size={15} />
            </button>
          </div>

          {formError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700">
              <AlertCircle size={13} /> {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Code</label>
              <input
                value={form.code} onChange={e => setF('code', e.target.value)}
                placeholder="e.g. SVC-BAL"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name} onChange={e => setF('name', e.target.value)}
                placeholder="e.g. Tyre Balancing Service"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <input
                value={form.category} onChange={e => setF('category', e.target.value)}
                placeholder="e.g. Service"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Unit</label>
              <input
                value={form.unit} onChange={e => setF('unit', e.target.value)}
                placeholder="pcs / hr / set"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setF('is_active', e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cost Price</label>
              <input
                type="number" min={0} step="0.01"
                value={form.cost_price} onChange={e => setF('cost_price', e.target.value)}
                placeholder="0.00"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Sale Price</label>
              <input
                type="number" min={0} step="0.01"
                value={form.sale_price} onChange={e => setF('sale_price', e.target.value)}
                placeholder="0.00"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <input
              value={form.description} onChange={e => setF('description', e.target.value)}
              placeholder="Optional description..."
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={closeForm}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors min-w-24 justify-center">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {saving ? 'Saving...' : editId ? 'Update' : 'Add Product'}
            </button>
          </div>
        </div>
      )}

      {deleteError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700">
          <AlertCircle size={14} /> {deleteError}
        </div>
      )}

      {/* Products list */}
      {loadingList ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-400" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">
          No products yet. Add your first product above.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Code', 'Name', 'Category', 'Unit', 'Cost', 'Sale', 'Status', ''].map(h => (
                  <th key={h} className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 text-left last:text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-3 py-2.5 text-xs font-mono text-slate-500">{p.code || '—'}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-900 max-w-[160px]">
                    <div className="truncate">{p.name}</div>
                    {p.description && <div className="text-xs text-slate-400 truncate">{p.description}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-600">{p.category || '—'}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-600">{p.unit}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-700 whitespace-nowrap">{formatCurrency(Number(p.cost_price))}</td>
                  <td className="px-3 py-2.5 text-xs font-semibold text-slate-900 whitespace-nowrap">{formatCurrency(Number(p.sale_price))}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        {deletingId === p.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Lookups Tab ────────────────────────────────────────────────────────────────
function LookupsTab() {
  const [types, setTypes]         = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [newName, setNewName]     = useState('');
  const [adding, setAdding]       = useState(false);
  const [addError, setAddError]   = useState('');
  const [editId, setEditId]       = useState<number | null>(null);
  const [editName, setEditName]   = useState('');
  const [saving, setSaving]       = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const load = () => {
    setLoadingList(true);
    api.lookups.tireTypes().then(setTypes).catch(() => {}).finally(() => setLoadingList(false));
  };

  useEffect(load, []);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setAddError('');
    try {
      await api.lookups.addTireType(name);
      setNewName('');
      load();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add type');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (t: any) => {
    setEditId(t.id);
    setEditName(t.name);
    setDeleteError('');
  };

  const saveEdit = async (id: number) => {
    const name = editName.trim();
    if (!name) return;
    setSaving(id);
    try {
      await api.lookups.updateTireType(id, { name });
      setEditId(null);
      load();
    } catch (err: any) {
      setAddError(err.message || 'Failed to update');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setDeleteError('');
    try {
      await api.lookups.deleteTireType(id);
      load();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-bold text-slate-700 mb-1">Tire Types</p>
        <p className="text-xs text-slate-400 mb-4">
          These values appear in the "Tire Type" dropdown when adding or editing inventory items.
          You can add custom categories, rename existing ones, or delete those not in use.
        </p>

        {/* Add new */}
        <div className="flex gap-2 mb-4">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            placeholder="New tire type name..."
            className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </div>

        {addError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-3 text-sm text-red-700">
            <AlertCircle size={14} />
            {addError}
          </div>
        )}
        {deleteError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-3 text-sm text-red-700">
            <AlertCircle size={14} />
            {deleteError}
          </div>
        )}

        {/* List */}
        {loadingList ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        ) : types.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No tire types yet</div>
        ) : (
          <div className="space-y-2">
            {types.map(t => (
              <div
                key={t.id}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2.5 group hover:border-slate-300 transition-colors"
              >
                <GripVertical size={14} className="text-slate-300 flex-shrink-0" />

                {editId === t.id ? (
                  <>
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit(t.id);
                        if (e.key === 'Escape') setEditId(null);
                      }}
                      className="flex-1 text-sm border border-blue-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => saveEdit(t.id)}
                      disabled={saving === t.id}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      {saving === t.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-slate-700">{t.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(t)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Rename"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        {deletingId === t.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Trash2 size={13} />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Services Tab ──────────────────────────────────────────────────────────────
function ServicesTab() {
  const [services,    setServices]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [editValues,  setEditValues]  = useState<any>({});
  const [savingId,    setSavingId]    = useState<number | null>(null);
  const [showForm,    setShowForm]    = useState(false);
  const [newService,  setNewService]  = useState({ name: '', description: '', cost_price: '', sale_price: '', unit: 'job' });
  const [formSaving,  setFormSaving]  = useState(false);
  const [formError,   setFormError]   = useState('');
  const [deletingId,  setDeletingId]  = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.products.list()
      .then(all => setServices((all as any[]).filter(p => p.category === 'Service')))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setEditValues({ name: s.name, description: s.description ?? '', cost_price: s.cost_price ?? '', sale_price: s.sale_price ?? '', unit: s.unit ?? 'job', is_active: s.is_active !== false });
  };

  const saveEdit = async (s: any) => {
    setSavingId(s.id);
    try {
      await api.products.update(s.id, { ...s, ...editValues, category: 'Service', cost_price: Number(editValues.cost_price) || 0, sale_price: Number(editValues.sale_price) || 0 });
      setEditingId(null);
      load();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save');
    } finally {
      setSavingId(null);
    }
  };

  const handleAdd = async () => {
    if (!newService.name.trim()) { setFormError('Name is required'); return; }
    setFormSaving(true); setFormError('');
    try {
      await api.products.create({ ...newService, category: 'Service', cost_price: Number(newService.cost_price) || 0, sale_price: Number(newService.sale_price) || 0, is_active: true });
      setNewService({ name: '', description: '', cost_price: '', sale_price: '', unit: 'job' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setFormError(err.message || 'Failed to add service');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try { await api.products.delete(id); load(); }
    catch (err: any) { setFormError(err.message || 'Failed to delete'); }
    finally { setDeletingId(null); }
  };

  const toggleActive = async (s: any) => {
    setSavingId(s.id);
    try {
      await api.products.update(s.id, { ...s, is_active: !s.is_active });
      load();
    } catch { /* ignore */ }
    finally { setSavingId(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-700">Services Price List</p>
          <p className="text-xs text-slate-400 mt-0.5">Manage services shown in POS and invoices. Inline-edit prices directly in the table.</p>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setFormError(''); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors">
            <Plus size={14} /> Add Service
          </button>
        )}
      </div>

      {formError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700">
          <AlertCircle size={13} /> {formError}
        </div>
      )}

      {/* Add service inline form */}
      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700">New Service</p>
            <button onClick={() => { setShowForm(false); setFormError(''); }} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"><X size={14} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Name <span className="text-red-500">*</span></label>
              <input value={newService.name} onChange={e => setNewService(s => ({ ...s, name: e.target.value }))} placeholder="e.g. Tyre Fitting"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Unit</label>
              <input value={newService.unit} onChange={e => setNewService(s => ({ ...s, unit: e.target.value }))} placeholder="job"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
              <input value={newService.description} onChange={e => setNewService(s => ({ ...s, description: e.target.value }))} placeholder="Optional description"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cost Price</label>
              <input type="number" min={0} value={newService.cost_price} onChange={e => setNewService(s => ({ ...s, cost_price: e.target.value }))} placeholder="0"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1 max-w-[200px]">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Sale Price <span className="text-red-500">*</span></label>
              <input type="number" min={0} value={newService.sale_price} onChange={e => setNewService(s => ({ ...s, sale_price: e.target.value }))} placeholder="0"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowForm(false); setFormError(''); }}
                className="px-3 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleAdd} disabled={formSaving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 disabled:opacity-60">
                {formSaving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                {formSaving ? 'Saving…' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-400" /></div>
      ) : services.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">No services yet. Add your first service above.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Name / Description', 'Unit', 'Cost', 'Sale Price', 'Status', ''].map(h => (
                  <th key={h} className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 text-left last:text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map(s => {
                const isEditing = editingId === s.id;
                return (
                  <tr key={s.id} className={`hover:bg-slate-50/60 transition-colors group ${!s.is_active ? 'opacity-60' : ''}`}>
                    {isEditing ? (
                      <>
                        <td className="px-3 py-2">
                          <input value={editValues.name} onChange={e => setEditValues((v: any) => ({ ...v, name: e.target.value }))}
                            className="w-full text-xs border border-teal-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-400" />
                          <input value={editValues.description} onChange={e => setEditValues((v: any) => ({ ...v, description: e.target.value }))}
                            placeholder="Description" className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1 mt-1 focus:outline-none" />
                        </td>
                        <td className="px-3 py-2">
                          <input value={editValues.unit} onChange={e => setEditValues((v: any) => ({ ...v, unit: e.target.value }))}
                            className="w-16 text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" min={0} value={editValues.cost_price} onChange={e => setEditValues((v: any) => ({ ...v, cost_price: e.target.value }))}
                            className="w-24 text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" min={0} value={editValues.sale_price} onChange={e => setEditValues((v: any) => ({ ...v, sale_price: e.target.value }))}
                            className="w-24 text-xs border border-teal-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-400 font-semibold" />
                        </td>
                        <td className="px-3 py-2">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={editValues.is_active} onChange={e => setEditValues((v: any) => ({ ...v, is_active: e.target.checked })) }
                              className="accent-teal-600 w-3.5 h-3.5" />
                            <span className="text-xs text-slate-600">Active</span>
                          </label>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => saveEdit(s)} disabled={savingId === s.id}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Save">
                              {savingId === s.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" title="Cancel">
                              <X size={13} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-slate-900 text-xs">{s.name}</div>
                          {s.description && <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{s.description}</div>}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">{s.unit}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{formatCurrency(Number(s.cost_price))}</td>
                        <td className="px-3 py-2.5 text-xs font-bold text-teal-700 whitespace-nowrap">{formatCurrency(Number(s.sale_price))}</td>
                        <td className="px-3 py-2.5">
                          <button onClick={() => toggleActive(s)} disabled={savingId === s.id}
                            title={s.is_active ? 'Deactivate' : 'Activate'}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                              s.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}>
                            {savingId === s.id ? <Loader2 size={9} className="animate-spin" /> : s.is_active ? <UserCheck size={9} /> : <UserX size={9} />}
                            {s.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(s)}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg" title="Edit">
                              <Pencil size={12} />
                            </button>
                            <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                              {deletingId === s.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

const ROLES = [
  { value: 'org_admin',       label: 'Admin',           color: 'bg-purple-50 text-purple-700 border border-purple-100' },
  { value: 'branch_manager',  label: 'Branch Manager',  color: 'bg-blue-50 text-blue-700 border border-blue-100' },
  { value: 'staff',           label: 'Staff',           color: 'bg-slate-100 text-slate-600 border border-slate-200' },
];

const EMPTY_USER = { name: '', email: '', phone: '', password: '', role: 'staff', branch_id: '' };

function UsersTab() {
  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('tirepro_at');
      if (!token) return null;
      const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return p.userId ?? null;
    } catch { return null; }
  })();

  const [users,      setUsers]      = useState<any[]>([]);
  const [branches,   setBranches]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editUser,   setEditUser]   = useState<any>(null);
  const [form,       setForm]       = useState({ ...EMPTY_USER });
  const [showPw,     setShowPw]     = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [resetPwId,  setResetPwId]  = useState<number | null>(null);
  const [newPw,      setNewPw]      = useState('');
  const [resetSaving,setResetSaving]= useState(false);
  const [resetError, setResetError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.users.list(), api.branches.list()])
      .then(([u, b]) => { setUsers(u); setBranches(b); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => {
    setForm({ ...EMPTY_USER });
    setEditUser(null);
    setFormError('');
    setShowPw(false);
    setShowForm(true);
  };

  const openEdit = (u: any) => {
    setForm({ name: u.name ?? '', email: u.email ?? '', phone: u.phone ?? '', password: '', role: u.role ?? 'staff', branch_id: u.branch_id ?? '' });
    setEditUser(u);
    setFormError('');
    setShowPw(false);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditUser(null); setFormError(''); };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    if (!form.email.includes('@')) { setFormError('Valid email required'); return; }
    if (!editUser && (!form.password || form.password.length < 8)) { setFormError('Password must be at least 8 characters'); return; }
    setSaving(true); setFormError('');
    try {
      const payload = { name: form.name, phone: form.phone, role: form.role, branch_id: form.branch_id ? Number(form.branch_id) : null };
      if (editUser) {
        await api.users.update(editUser.id, payload);
      } else {
        await api.users.create({ ...payload, email: form.email, password: form.password });
      }
      closeForm();
      load();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (u: any) => {
    setTogglingId(u.id);
    try { await api.users.setStatus(u.id, !u.is_active); load(); }
    catch { /* ignore */ }
    finally { setTogglingId(null); }
  };

  const handleResetPassword = async (userId: number) => {
    if (!newPw || newPw.length < 8) { setResetError('Password must be at least 8 characters'); return; }
    setResetSaving(true); setResetError('');
    try {
      await api.users.resetPassword(userId, newPw);
      setResetPwId(null); setNewPw('');
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password');
    } finally {
      setResetSaving(false);
    }
  };

  const roleInfo = (role: string) => ROLES.find(r => r.value === role) ?? { label: role, color: 'bg-slate-100 text-slate-600 border border-slate-200' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-700">User Management</p>
          <p className="text-xs text-slate-400 mt-0.5">Add staff accounts, assign roles and branches, activate or deactivate access.</p>
        </div>
        {!showForm && (
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors">
            <Plus size={14} /> Add User
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <ShieldCheck size={15} className="text-teal-500" />
              {editUser ? 'Edit User' : 'New User Account'}
            </p>
            <button onClick={closeForm} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"><X size={14} /></button>
          </div>

          {formError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700">
              <AlertCircle size={13} /> {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Muhammad Ahmed"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email {!editUser && <span className="text-red-500">*</span>}</label>
              <input value={form.email} onChange={e => setF('email', e.target.value)} placeholder="ahmed@company.pk"
                disabled={!!editUser} type="email"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white disabled:bg-slate-100 disabled:text-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="+92-300-1234567"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
            </div>
            {!editUser && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input value={form.password} onChange={e => setF('password', e.target.value)} placeholder="Min 8 characters"
                    type={showPw ? 'text' : 'password'}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 pr-9 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Role <span className="text-red-500">*</span></label>
              <select value={form.role} onChange={e => setF('role', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
              <select value={form.branch_id} onChange={e => setF('branch_id', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
                <option value="">All branches (org-wide)</option>
                {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={closeForm}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 disabled:opacity-60 min-w-24 justify-center">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
              {saving ? 'Saving…' : editUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-400" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">No users found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Name', 'Email', 'Role', 'Branch', 'Status', ''].map(h => (
                  <th key={h} className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 text-left last:text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u: any) => {
                const ri = roleInfo(u.role);
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className={`hover:bg-slate-50/60 transition-colors group ${!u.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(u.name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{u.name}</p>
                          {u.phone && <p className="text-[10px] text-slate-400">{u.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-600 max-w-[160px]">
                      <span className="truncate block">{u.email}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ri.color}`}>{ri.label}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{u.branch_name ?? <span className="text-slate-300">All</span>}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(u)} title="Edit"
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => { setResetPwId(u.id); setNewPw(''); setResetError(''); }} title="Reset password"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                          <ShieldCheck size={12} />
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => toggleStatus(u)}
                            disabled={togglingId === u.id}
                            title={u.is_active ? 'Deactivate' : 'Activate'}
                            className={`p-1.5 rounded-lg transition-colors ${u.is_active ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                            {togglingId === u.id
                              ? <Loader2 size={12} className="animate-spin" />
                              : u.is_active ? <UserX size={12} /> : <UserCheck size={12} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reset password modal */}
      {resetPwId !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={15} className="text-amber-500" /> Reset Password
              </h3>
              <button onClick={() => { setResetPwId(null); setNewPw(''); setResetError(''); }} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"><X size={14} /></button>
            </div>
            <p className="text-xs text-slate-500">
              Set a new password for <strong>{users.find((u: any) => u.id === resetPwId)?.name}</strong>.
              They will need to use this password to log in.
            </p>
            {resetError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700">
                <AlertCircle size={13} /> {resetError}
              </div>
            )}
            <div className="relative">
              <input value={newPw} onChange={e => setNewPw(e.target.value)} type={showPw ? 'text' : 'password'}
                placeholder="New password (min 8 characters)"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setResetPwId(null); setNewPw(''); setResetError(''); }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleResetPassword(resetPwId!)} disabled={resetSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 disabled:opacity-60">
                {resetSaving ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                {resetSaving ? 'Saving…' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── System Info Tab (admin only) ───────────────────────────────────────────────
function SystemInfoTab() {
  const [info,     setInfo]     = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError('');
    api.settings.systemInfo()
      .then(d => { setInfo(d); setLastFetch(new Date()); })
      .catch(err => setError(err.message || 'Failed to load system info'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 30_000);
    return () => clearInterval(id);
  }, [fetch]);

  function formatUptime(s: number) {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${Math.floor(s % 60)}s`;
  }

  function roleBadge(role: string) {
    if (role === 'org_admin')      return 'bg-purple-50 text-purple-700 border border-purple-100';
    if (role === 'branch_manager') return 'bg-blue-50 text-blue-700 border border-blue-100';
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  }

  function roleLabel(role: string) {
    if (role === 'org_admin')      return 'Admin';
    if (role === 'branch_manager') return 'Manager';
    return 'Staff';
  }

  const StatCard = ({ icon: Icon, color, label, value, sub }: {
    icon: React.ElementType; color: string; label: string; value: string | number; sub?: string;
  }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-slate-900 leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  if (loading && !info) {
    return <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-slate-400" /></div>;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
        <AlertCircle size={14} /> {error}
      </div>
    );
  }

  if (!info) return null;

  const { server, database, sessions } = info;
  const memPct = server.memory_used_mb > 0
    ? Math.round((server.memory_heap_mb / server.memory_used_mb) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-700">System Information</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Live server, database, and session data · refreshes every 30s
            {lastFetch && ` · last updated ${lastFetch.toLocaleTimeString()}`}
          </p>
        </div>
        <button
          onClick={fetch}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Server ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Monitor size={12} /> Server
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Activity}
            color="bg-emerald-100 text-emerald-600"
            label="Uptime"
            value={formatUptime(server.uptime_seconds)}
            sub="since last restart"
          />
          <StatCard
            icon={Cpu}
            color="bg-blue-100 text-blue-600"
            label="Memory Used"
            value={`${server.memory_used_mb} MB`}
            sub={`heap: ${server.memory_heap_mb} MB (${memPct}%)`}
          />
          <StatCard
            icon={Server}
            color="bg-violet-100 text-violet-600"
            label="Node.js"
            value={server.node_version}
            sub={server.platform}
          />
          <StatCard
            icon={CheckCircle}
            color="bg-teal-100 text-teal-600"
            label="Status"
            value="Online"
            sub={new Date(server.timestamp).toLocaleTimeString()}
          />
        </div>
      </div>

      {/* ── Database ───────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Database size={12} /> Database (TireProDB)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Size breakdown */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <HardDrive size={12} className="text-slate-400" /> Storage
            </p>
            <div className="space-y-2">
              {[
                { label: 'Data files',  value: database.data_mb,  color: 'bg-blue-500' },
                { label: 'Log files',   value: database.log_mb,   color: 'bg-slate-300' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="font-semibold text-slate-700">{row.value} MB</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{ width: `${Math.min(100, (row.value / (database.total_mb || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-xs pt-1 border-t border-slate-100 mt-2">
                <span className="font-bold text-slate-600">Total</span>
                <span className="font-bold text-slate-900">{database.total_mb} MB</span>
              </div>
            </div>
          </div>

          {/* Record counts */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-600 mb-3">Record Counts</p>
            <div className="space-y-2">
              {[
                { label: 'Tire SKUs',       value: database.counts.tire_skus },
                { label: 'Sales Invoices',  value: database.counts.total_sales },
                { label: 'Purchase Orders', value: database.counts.total_purchases },
                { label: 'Customers',       value: database.counts.customers },
                { label: 'Users',           value: database.counts.users_count },
                { label: 'Catalog Entries', value: database.counts.catalog_entries },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center text-xs py-0.5">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {(row.value ?? 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Sessions ─────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Activity size={12} /> Active Sessions
          <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            sessions.active_count > 0
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {sessions.active_count} online
          </span>
        </p>
        {sessions.active_count === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm border border-slate-100 rounded-2xl bg-white">
            No active sessions at the moment
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['User', 'Email', 'Role', 'Last Active'].map(h => (
                    <th key={h} className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sessions.users.map((u: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleBadge(u.role)}`}>
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-400 tabular-nums">
                      {new Date(u.last_active).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Settings page ─────────────────────────────────────────────────────────
export default function Settings() {
  const isAdmin = getCurrentUserRole() === 'org_admin';
  const TABS    = ALL_TABS.filter(t => !t.adminOnly || isAdmin);

  const [tab, setTab]           = useState<Tab>('company');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loaded, setLoaded]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    api.settings.get()
      .then(data => { setSettings(data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
    setSaveError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      const updated = await api.settings.update(settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  const isAutoSaveTab = tab === 'lookups' || tab === 'products' || tab === 'services' || tab === 'users' || tab === 'system';

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Configure company details, invoice defaults, products catalog, and lookup tables</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-6 overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
                active
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5">
          {tab === 'company'  && <CompanyTab  settings={settings} onChange={handleChange} />}
          {tab === 'defaults' && <DefaultsTab settings={settings} onChange={handleChange} />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'lookups'  && <LookupsTab />}
          {tab === 'services' && <ServicesTab />}
          {tab === 'users'    && <UsersTab />}
          {tab === 'system'   && isAdmin && <SystemInfoTab />}
        </div>

        {/* Save bar — only for company/defaults tabs */}
        {!isAutoSaveTab && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            {saveError ? (
              <span className="flex items-center gap-2 text-sm text-red-600 font-medium">
                <AlertCircle size={14} /> {saveError}
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                <CheckCircle size={14} /> Settings saved successfully
              </span>
            ) : (
              <span className="text-xs text-slate-400">Changes are saved to the database and take effect immediately</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors min-w-28 justify-center flex-shrink-0"
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

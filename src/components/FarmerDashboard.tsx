import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import QRCode from 'qrcode';
import { Sprout, Plus, QrCode, Download, Loader2, CheckCircle2, Package, ShieldCheck } from 'lucide-react';
import { supabase, type Product } from '@/lib/supabase';
import { buildTraceUrl, cleanLocation, cleanName, cleanQuantity, isLocation, isName, isQuantity } from '@/lib/validation';

const DEMO_FARMER_ID = 'AGRI-DEMO-FARMER-001';

export default function FarmerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ batch_id: string; qr: string } | null>(null);
  const [form, setForm] = useState({
    crop_name: '',
    variety: '',
    quantity: '',
    quantity_unit: 'kg',
    price_per_kg: '',
    farmer_name: '',
    farmer_location: '',
    harvest_date: '',
    certification: 'Organic',
    farmer_id: DEMO_FARMER_ID,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data as Product[] ?? []);
    setLoading(false);
  }

  function generateBatchId() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `AGRI-${year}-${random}`;
  }

  function generateQrToken() {
    return `agritrack-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const cropName = form.crop_name.trim();
    const variety = form.variety.trim();
    const farmerName = form.farmer_name.trim();
    const farmerLocation = form.farmer_location.trim();
    const quantity = form.quantity.trim();
    const quantityUnit = form.quantity_unit;
    const pricePerKg = form.price_per_kg.trim();

    if (!isName(cropName)) { alert('Crop name must contain letters only (with spaces, commas or hyphens).'); return; }
    if (variety && !isName(variety)) { alert('Variety must contain letters only (with spaces, commas or hyphens).'); return; }
    if (!isQuantity(quantity)) { alert('Quantity must be a valid number, for example 500 or 500.5.'); return; }
    if (!pricePerKg || Number(pricePerKg) <= 0 || !/^\d+(?:\.\d{1,2})?$/.test(pricePerKg)) { alert('Price per kg must be a valid positive amount.'); return; }
    if (!isName(farmerName)) { alert('Farmer name must contain letters only.'); return; }
    if (!isLocation(farmerLocation)) { alert('Farm location must contain letters only (commas, spaces and hyphens are allowed).'); return; }

    setSubmitting(true);
    const batch_id = generateBatchId();
    const qr_code_data = generateQrToken();

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        batch_id,
        crop_name: cropName,
        variety,
        quantity,
        quantity_unit: quantityUnit,
        price_per_kg: Number(pricePerKg),
        farmer_name: farmerName,
        farm_location: farmerLocation,
        harvest_date: form.harvest_date,
        certification: form.certification,
        qr_code_data,
        current_status: 'harvested',
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setSubmitting(false);
      return;
    }

    if (product) {
      await supabase.from('supply_chain_events').insert({
        product_id: (product as Product).id,
        stage: 'harvested',
        actor_name: form.farmer_name,
        actor_role: 'farmer',
        location: form.farmer_location,
        notes: `Crop registered: ${cropName}${variety ? ` (${variety})` : ''}, Quantity: ${quantity} ${quantityUnit}, Price: ₹${Number(pricePerKg).toFixed(2)}/kg. Demo Farmer ID: ${DEMO_FARMER_ID}.`,
        temperature: '',
      });
    }

    const traceUrl = buildTraceUrl(qr_code_data);
    const qrDataUrl = await QRCode.toDataURL(traceUrl, {
      width: 500,
      margin: 3,
      errorCorrectionLevel: 'H',
      color: { dark: '#15803d', light: '#ffffff' },
    });

    setSuccess({ batch_id, qr: qrDataUrl });
    setForm({ crop_name: '', variety: '', quantity: '', quantity_unit: 'kg', price_per_kg: '', farmer_name: '', farmer_location: '', harvest_date: '', certification: 'Organic', farmer_id: DEMO_FARMER_ID });
    setShowForm(false);
    setSubmitting(false);
    loadProducts();
  }

  function downloadQr(dataUrl: string, batchId: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr-${batchId}.png`;
    link.click();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <Sprout className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-earth-900 font-display">Farmer Dashboard</h1>
            <p className="text-sm text-earth-500">Register verified crops and generate a scannable traceability QR</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancel' : 'Register New Crop'}
        </button>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSuccess(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-brand-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="font-semibold text-lg">Crop Registered Successfully</h3>
            </div>
            <p className="text-sm text-earth-600 mb-4">Batch ID: <span className="font-mono font-semibold text-earth-900">{success.batch_id}</span></p>
            <div className="flex justify-center mb-4 bg-stone-50 rounded-xl p-4">
              <img src={success.qr} alt="QR Code" className="w-48 h-48" />
            </div>
            <div className="flex items-start gap-2 text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-xl p-3 mb-4"><ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" /><span>This QR opens the consumer trace page directly. For phone scanning during local development, open the site using your computer's network IP, not localhost.</span></div>
            <div className="flex gap-3">
              <button onClick={() => downloadQr(success.qr, success.batch_id)} className="btn-primary flex-1">
                <Download className="w-4 h-4" />
                Download QR
              </button>
              <button onClick={() => setSuccess(null)} className="btn-secondary flex-1">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-8 animate-slide-up">
          <h2 className="font-semibold text-earth-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-600" />
            Crop Registration
          </h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-earth-700 mb-1.5">AgriStack Farmer ID (Hackathon Demo)</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-600" />
                <input required value={form.farmer_id} readOnly className="input-field pl-9" placeholder="AGRI-DEMO-FARMER-001" />
              </div>
              <p className="text-xs text-earth-500 mt-1">Hackathon demo ID only — this is not a real government-issued AgriStack ID.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Crop Name *</label>
              <input required value={form.crop_name} onChange={(e) => setForm({ ...form, crop_name: cleanName(e.target.value) })} className="input-field" placeholder="e.g., Basmati Rice" inputMode="text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Variety</label>
              <input value={form.variety} onChange={(e) => setForm({ ...form, variety: cleanName(e.target.value) })} className="input-field" placeholder="e.g., Basmati Premium" />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Quantity *</label>
              <div className="flex gap-2">
                <input required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: cleanQuantity(e.target.value) })} className="input-field flex-1" placeholder="e.g., 500" inputMode="decimal" />
                <select value={form.quantity_unit} onChange={(e) => setForm({ ...form, quantity_unit: e.target.value })} className="input-field w-28">
                  <option value="kg">kg</option>
                  <option value="g">gram</option>
                </select>
              </div>
              <p className="text-xs text-earth-500 mt-1">Choose kilograms or grams.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Price per kg (₹) *</label>
              <input required value={form.price_per_kg} onChange={(e) => setForm({ ...form, price_per_kg: e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') })} className="input-field" placeholder="e.g., 58" inputMode="decimal" />
              <p className="text-xs text-earth-500 mt-1">Farmer's requested selling price per kilogram.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Certification</label>
              <select value={form.certification} onChange={(e) => setForm({ ...form, certification: e.target.value })} className="input-field">
                <option>Organic</option>
                <option>GAP Certified</option>
                <option>Fair Trade</option>
                <option>None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Farmer Name *</label>
              <input required value={form.farmer_name} onChange={(e) => setForm({ ...form, farmer_name: cleanName(e.target.value) })} className="input-field" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Farm Location *</label>
              <input required value={form.farmer_location} onChange={(e) => setForm({ ...form, farmer_location: cleanLocation(e.target.value) })} className="input-field" placeholder="e.g., Coimbatore, Tamil Nadu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Harvest Date *</label>
              <input required type="date" value={form.harvest_date} onChange={(e) => setForm({ ...form, harvest_date: e.target.value })} className="input-field" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                {submitting ? 'Registering...' : 'Register & Generate QR'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div>
        <h2 className="font-semibold text-earth-900 mb-4">Registered Crops ({products.length})</h2>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="card p-12 text-center">
            <Sprout className="w-12 h-12 text-earth-300 mx-auto mb-3" />
            <p className="text-earth-500">No crops registered yet. Click "Register New Crop" to get started.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(buildTraceUrl(product.qr_code_data), {
      width: 180,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#15803d', light: '#ffffff' },
    }).then(setQrUrl);
  }, [product.qr_code_data]);

  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-earth-900">{product.crop_name}</h3>
          {product.variety && <p className="text-xs text-earth-500">{product.variety}</p>}
        </div>
        <span className={`badge ${product.certification === 'None' ? 'bg-stone-100 text-stone-600 border-stone-200' : 'bg-brand-50 text-brand-700 border-brand-200'}`}>
          {product.certification}
        </span>
      </div>
      <div className="flex gap-4">
        {qrUrl && <img src={qrUrl} alt="QR" className="w-20 h-20 rounded-lg border border-earth-200" />}
        <div className="flex-1 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-earth-500">Batch</span><span className="font-mono text-earth-800">{product.batch_id}</span></div>
          <div className="flex justify-between"><span className="text-earth-500">Qty</span><span className="text-earth-800">{product.quantity} {product.quantity_unit === 'g' ? 'gram' : 'kg'}</span></div>
          <div className="flex justify-between"><span className="text-earth-500">Price</span><span className="text-earth-800">₹{Number(product.price_per_kg ?? 0).toFixed(2)}/kg</span></div>
          <div className="flex justify-between"><span className="text-earth-500">Farmer</span><span className="text-earth-800 truncate ml-2">{product.farmer_name}</span></div>
          <div className="flex justify-between"><span className="text-earth-500">Status</span><span className="text-brand-700 font-medium capitalize">{product.current_status.replace('_', ' ')}</span></div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import QRCode from 'qrcode';
import {
  Truck,
  Loader2,
  Search,
  Package,
  MapPin,
  Thermometer,
  CheckCircle2,
  ArrowRight,
  QrCode,
  Download,
  X,
} from 'lucide-react';

import {
  supabase,
  type Product,
  type SupplyChainEvent,
  STAGE_LABELS,
  STATUS_COLORS,
} from '@/lib/supabase';

import {
  buildTraceUrl,
  cleanLocation,
  cleanName,
  isLocation,
  isName,
} from '@/lib/validation';

const TRANSIT_STAGES = [
  {
    value: 'in_transit',
    label: 'In Transit',
    icon: Truck,
  },
  {
    value: 'quality_check',
    label: 'Quality Check',
    icon: CheckCircle2,
  },
];

export default function TransporterDashboard() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [events, setEvents] = useState<SupplyChainEvent[]>([]);

  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    stage: 'in_transit',
    actor_name: '',
    location: '',
    notes: '',
    temperature: '',
  });

  const [qrUrl, setQrUrl] = useState('');
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('current_status', [
        'harvested',
        'quality_check',
        'in_transit',
      ])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Could not load products:', error);
      alert('Could not load products.');
      setProducts([]);
    } else {
      setProducts((data as Product[]) ?? []);
    }

    setLoading(false);
  }

  async function selectProduct(product: Product) {
    setSelectedProduct(product);

    const { data, error } = await supabase
      .from('supply_chain_events')
      .select('*')
      .eq('product_id', product.id)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Could not load supply chain history:', error);
      setEvents([]);
    } else {
      setEvents((data as SupplyChainEvent[]) ?? []);
    }

    // Generate QR code for this product.
    if (product.qr_code_data) {
      try {
        const url = buildTraceUrl(product.qr_code_data);

        const generatedQr = await QRCode.toDataURL(url, {
          width: 240,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#15803d',
            light: '#ffffff',
          },
        });

        setQrUrl(generatedQr);
      } catch (error) {
        console.error('Could not generate QR code:', error);
        setQrUrl('');
      }
    } else {
      setQrUrl('');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!selectedProduct) {
      alert('Please select a product first.');
      return;
    }

    if (!isName(form.actor_name)) {
      alert('Transporter name must contain letters only.');
      return;
    }

    if (!isLocation(form.location)) {
      alert('Current location must contain letters only.');
      return;
    }

    setSubmitting(true);

    try {
      /*
       * STEP 1:
       * Create the transporter supply-chain event.
       *
       * The database timestamp records the exact date/time
       * automatically when this event is created.
       */
      const { error: eventError } = await supabase
        .from('supply_chain_events')
        .insert({
          product_id: selectedProduct.id,
          stage: form.stage,
          actor_name: form.actor_name,
          actor_role: 'transporter',
          location: form.location,
          notes: form.notes,
          temperature: form.temperature,
        });

      if (eventError) {
        console.error('Event update failed:', eventError);
        alert(
          `Could not update transit status.\n\nSupabase error: ${eventError.message}`
        );
        return;
      }

      /*
       * STEP 2:
       * Update the current product status.
       */
      const { error: productError } = await supabase
        .from('products')
        .update({
          current_status: form.stage,
        })
        .eq('id', selectedProduct.id);

      if (productError) {
        console.error('Product status update failed:', productError);
        alert(
          `Transit event was saved, but product status could not be updated.\n\nSupabase error: ${productError.message}`
        );
        return;
      }

      /*
       * STEP 3:
       * Clear the form.
       */
      setForm({
        stage: 'in_transit',
        actor_name: '',
        location: '',
        notes: '',
        temperature: '',
      });

      /*
       * STEP 4:
       * Refresh selected product and history.
       */
      const updatedProduct = {
        ...selectedProduct,
        current_status: form.stage,
      };

      await selectProduct(updatedProduct);

      /*
       * STEP 5:
       * Refresh product list.
       */
      await loadProducts();

      alert('Transit status updated successfully.');
    } finally {
      setSubmitting(false);
    }
  }

  function downloadQr() {
    if (!qrUrl || !selectedProduct) return;

    const link = document.createElement('a');

    link.href = qrUrl;
    link.download = `${selectedProduct.batch_id}-QR.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filtered = products.filter((p) =>
    p.batch_id.toLowerCase().includes(search.toLowerCase()) ||
    p.crop_name.toLowerCase().includes(search.toLowerCase()) ||
    p.farmer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
          <Truck className="w-6 h-6 text-amber-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-earth-900 font-display">
            Transporter Dashboard
          </h1>

          <p className="text-sm text-earth-500">
            Update product transit status and conditions
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* PRODUCT LIST */}
        <div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              placeholder="Search by batch ID, crop, or farmer..."
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <Package className="w-12 h-12 text-earth-300 mx-auto mb-3" />

              <p className="text-earth-500">
                No products awaiting transport.
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {filtered.map((product) => (
                <button
                  key={product.id}
                  onClick={() => selectProduct(product)}
                  className={`card p-4 w-full text-left hover:shadow-md transition-all duration-200 ${
                    selectedProduct?.id === product.id
                      ? 'ring-2 ring-amber-400'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">

                    <span className="font-mono text-xs text-earth-500">
                      {product.batch_id}
                    </span>

                    <span
                      className={`badge ${
                        STATUS_COLORS[product.current_status] ?? ''
                      }`}
                    >
                      {STAGE_LABELS[product.current_status] ??
                        product.current_status}
                    </span>

                  </div>

                  <h3 className="font-semibold text-earth-900">
                    {product.crop_name}
                  </h3>

                  <p className="text-sm text-earth-500">
                    {product.quantity} • {product.farmer_name}
                  </p>
                </button>
              ))}

            </div>
          )}
        </div>

        {/* DETAILS */}
        <div>

          {!selectedProduct ? (
            <div className="card p-12 text-center">

              <Truck className="w-12 h-12 text-earth-300 mx-auto mb-3" />

              <p className="text-earth-500">
                Select a product from the left to update its transit status.
              </p>

            </div>
          ) : (

            <div className="space-y-4">

              {/* PRODUCT INFORMATION */}
              <div className="card p-5">

                <div className="flex items-center justify-between mb-3">

                  <h3 className="font-semibold text-earth-900">
                    {selectedProduct.crop_name}
                  </h3>

                  <span
                    className={`badge ${
                      STATUS_COLORS[selectedProduct.current_status] ?? ''
                    }`}
                  >
                    {STAGE_LABELS[selectedProduct.current_status] ??
                      selectedProduct.current_status}
                  </span>

                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">

                  <div>
                    <span className="text-earth-500">
                      Batch:
                    </span>{' '}
                    <span className="font-mono text-earth-800">
                      {selectedProduct.batch_id}
                    </span>
                  </div>

                  <div>
                    <span className="text-earth-500">
                      Quantity:
                    </span>{' '}
                    <span className="text-earth-800">
                      {selectedProduct.quantity}
                    </span>
                  </div>

                  <div>
                    <span className="text-earth-500">
                      Farmer:
                    </span>{' '}
                    <span className="text-earth-800">
                      {selectedProduct.farmer_name}
                    </span>
                  </div>

                  <div>
                    <span className="text-earth-500">
                      Origin:
                    </span>{' '}
                    <span className="text-earth-800">
                      {selectedProduct.farmer_location}
                    </span>
                  </div>

                </div>
              </div>

              {/* QR CODE */}
              <div className="card p-5">

                <div className="flex items-center justify-between mb-4">

                  <div>
                    <h4 className="font-semibold text-earth-900 flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-brand-600" />
                      Product QR Code
                    </h4>

                    <p className="text-xs text-earth-500 mt-1">
                      Keep this QR code available for tracking.
                    </p>
                  </div>

                  {qrUrl && (
                    <button
                      type="button"
                      onClick={() => setShowQr(true)}
                      className="btn-secondary text-sm"
                    >
                      View QR
                    </button>
                  )}

                </div>

                {qrUrl ? (
                  <div className="flex flex-col items-center">

                    <div className="bg-white p-3 rounded-xl border border-earth-200">
                      <img
                        src={qrUrl}
                        alt={`QR code for ${selectedProduct.batch_id}`}
                        className="w-44 h-44"
                      />
                    </div>

                    <p className="font-mono text-xs text-earth-500 mt-3">
                      {selectedProduct.batch_id}
                    </p>

                    <button
                      type="button"
                      onClick={downloadQr}
                      className="btn-secondary mt-3 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Save QR Code
                    </button>

                  </div>
                ) : (
                  <p className="text-sm text-earth-500">
                    QR code is not available for this product.
                  </p>
                )}

              </div>

              {/* SUPPLY CHAIN HISTORY */}
              <div className="card p-5">

                <h4 className="font-semibold text-earth-900 mb-3 text-sm">
                  Supply Chain History
                </h4>

                <div className="space-y-3">

                  {events.length === 0 ? (
                    <p className="text-sm text-earth-500">
                      No transit updates yet.
                    </p>
                  ) : (
                    events.map((event, i) => (

                      <div
                        key={event.id}
                        className="flex gap-3"
                      >

                        <div className="flex flex-col items-center">

                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-brand-600" />
                          </div>

                          {i < events.length - 1 && (
                            <div className="w-0.5 flex-1 bg-earth-200 my-1" />
                          )}

                        </div>

                        <div className="pb-2">

                          <div className="flex items-center gap-2 flex-wrap">

                            <span className="font-medium text-sm text-earth-900">
                              {STAGE_LABELS[event.stage] ??
                                event.stage}
                            </span>

                            <span className="text-xs text-earth-400">
                              by {event.actor_name}
                            </span>

                          </div>

                          {/* DATE + LOCATION */}
                          <p className="text-xs text-earth-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>

                          <p className="text-xs text-earth-500 mt-1">
                            {new Date(
                              event.timestamp
                            ).toLocaleString()}
                          </p>

                          {event.temperature && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                              <Thermometer className="w-3 h-3" />
                              {event.temperature}
                            </p>
                          )}

                          {event.notes && (
                            <p className="text-xs text-earth-600 mt-1">
                              {event.notes}
                            </p>
                          )}

                        </div>

                      </div>

                    ))
                  )}

                </div>
              </div>

              {/* UPDATE FORM */}
              <div className="card p-5">

                <h4 className="font-semibold text-earth-900 mb-4 text-sm flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-amber-600" />
                  Update Transit Status
                </h4>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-3"
                >

                  {/* STAGE */}
                  <div>

                    <label className="block text-sm font-medium text-earth-700 mb-1.5">
                      Stage
                    </label>

                    <select
                      value={form.stage}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          stage: e.target.value,
                        })
                      }
                      className="input-field"
                    >
                      {TRANSIT_STAGES.map((stage) => (
                        <option
                          key={stage.value}
                          value={stage.value}
                        >
                          {stage.label}
                        </option>
                      ))}
                    </select>

                  </div>

                  {/* NAME + LOCATION */}
                  <div className="grid sm:grid-cols-2 gap-3">

                    <div>

                      <label className="block text-sm font-medium text-earth-700 mb-1.5">
                        Transporter Name *
                      </label>

                      <input
                        required
                        value={form.actor_name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            actor_name: cleanName(
                              e.target.value
                            ),
                          })
                        }
                        className="input-field"
                        placeholder="Transporter name"
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-earth-700 mb-1.5">
                        Current Location *
                      </label>

                      <div className="relative">

                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />

                        <input
                          required
                          value={form.location}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              location: cleanLocation(
                                e.target.value
                              ),
                            })
                          }
                          className="input-field pl-9"
                          placeholder="e.g., Distribution Center, Delhi"
                        />

                      </div>

                    </div>

                  </div>

                  {/* DATE/TIME DISPLAY */}
                  <div>

                    <label className="block text-sm font-medium text-earth-700 mb-1.5">
                      Update Date & Time
                    </label>

                    <input
                      type="text"
                      readOnly
                      value={new Date().toLocaleString()}
                      className="input-field bg-earth-50"
                    />

                    <p className="text-xs text-earth-400 mt-1">
                      The actual update time is recorded automatically
                      when you submit the status.
                    </p>

                  </div>

                  {/* TEMPERATURE */}
                  <div>

                    <label className="block text-sm font-medium text-earth-700 mb-1.5">
                      Storage Temperature
                    </label>

                    <div className="relative">

                      <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />

                      <input
                        value={form.temperature}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            temperature: e.target.value,
                          })
                        }
                        className="input-field pl-9"
                        placeholder="e.g., 4°C (refrigerated)"
                      />

                    </div>

                  </div>

                  {/* NOTES */}
                  <div>

                    <label className="block text-sm font-medium text-earth-700 mb-1.5">
                      Notes
                    </label>

                    <textarea
                      value={form.notes}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          notes: e.target.value,
                        })
                      }
                      className="input-field"
                      rows={3}
                      placeholder="Any transit details..."
                    />

                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full"
                  >

                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Truck className="w-5 h-5" />
                    )}

                    {submitting
                      ? 'Updating...'
                      : 'Update Status'}

                  </button>

                </form>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* QR FULL SCREEN MODAL */}
      {showQr && qrUrl && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative">

            <button
              type="button"
              onClick={() => setShowQr(false)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-earth-100 flex items-center justify-center hover:bg-earth-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">

              <QrCode className="w-8 h-8 text-brand-600 mx-auto mb-2" />

              <h3 className="font-bold text-earth-900 text-lg">
                Product QR Code
              </h3>

              <p className="font-mono text-sm text-earth-500 mt-1">
                {selectedProduct.batch_id}
              </p>

              <div className="bg-white border border-earth-200 rounded-xl p-4 mt-5 inline-block">

                <img
                  src={qrUrl}
                  alt={`QR code for ${selectedProduct.batch_id}`}
                  className="w-64 h-64"
                />

              </div>

              <button
                type="button"
                onClick={downloadQr}
                className="btn-primary w-full mt-5"
              >
                <Download className="w-5 h-5" />
                Save QR Code
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
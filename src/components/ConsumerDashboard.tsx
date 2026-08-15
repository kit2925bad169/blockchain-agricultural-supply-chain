import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';

import {
  ScanLine,
  Search,
  Loader2,
  Sprout,
  Truck,
  Store,
  CheckCircle2,
  Thermometer,
  MapPin,
  User,
  Calendar,
  Award,
  Package,
  AlertCircle,
  Flag,
  ShieldCheck,
} from 'lucide-react';

import {
  supabase,
  type Product,
  type SupplyChainEvent,
  STAGE_LABELS,
  STATUS_COLORS,
} from '@/lib/supabase';

const DEMO_FARMER_ID = 'AGRI-DEMO-FARMER-001';

type Props = {
  initialTrackId?: string;
};

/*
  Converts whatever comes from the QR code into a batch/tracking ID.

  Supported examples:

  AGRI-2026-9465

  https://your-site.com/?track=AGRI-2026-9465

  https://your-site.com/?batch_id=AGRI-2026-9465

  https://your-site.com/track/AGRI-2026-9465
*/
function extractTrackingId(value: string): string {
  const text = value.trim();

  if (!text) return '';

  // If it is a URL, try to extract the tracking ID
  try {
    const url = new URL(text);

    const params = url.searchParams;

    const fromQuery =
      params.get('track') ||
      params.get('batch') ||
      params.get('batch_id') ||
      params.get('id');

    if (fromQuery) {
      return fromQuery.trim();
    }

    // Support /track/AGRI-2026-9465
    const parts = url.pathname
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean);

    const trackIndex = parts.findIndex(
      (part) => part.toLowerCase() === 'track'
    );

    if (trackIndex !== -1 && parts[trackIndex + 1]) {
      return decodeURIComponent(parts[trackIndex + 1]).trim();
    }

    // If URL itself does not contain a special parameter,
    // use the last pathname part.
    if (parts.length > 0) {
      return decodeURIComponent(parts[parts.length - 1]).trim();
    }
  } catch {
    // Not a URL, so continue as normal text
  }

  return text;
}

export default function ConsumerDashboard({ initialTrackId }: Props) {
  const [search, setSearch] = useState(initialTrackId ?? '');
  const [product, setProduct] = useState<Product | null>(null);
  const [events, setEvents] = useState<SupplyChainEvent[]>([]);
  const [displayStatus, setDisplayStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showComplaint, setShowComplaint] = useState(false);

  useEffect(() => {
    if (initialTrackId) {
      setSearch(initialTrackId);
      searchProduct(initialTrackId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTrackId]);

  async function searchProduct(trackId?: string) {
    const rawQuery = (trackId ?? search).trim();

    if (!rawQuery) {
      setError('Please enter a batch ID or tracking code.');
      return;
    }

    const query = extractTrackingId(rawQuery);

    setLoading(true);
    setError('');
    setProduct(null);
    setEvents([]);
    setDisplayStatus('');
    setShowComplaint(false);

    try {
      /*
        STEP 1:
        Find product by batch ID.
      */
      let productData: Product | null = null;

      const batchResult = await supabase
        .from('products')
        .select('*')
        .eq('batch_id', query)
        .maybeSingle();

      if (batchResult.error) {
        console.error('Batch search error:', batchResult.error);
      }

      if (batchResult.data) {
        productData = batchResult.data as Product;
      }

      /*
        STEP 2:
        If batch ID did not find anything,
        try QR code data.
      */
      if (!productData) {
        const qrResult = await supabase
          .from('products')
          .select('*')
          .eq('qr_code_data', query)
          .maybeSingle();

        if (qrResult.error) {
          console.error('QR search error:', qrResult.error);
        }

        if (qrResult.data) {
          productData = qrResult.data as Product;
        }
      }

      /*
        STEP 3:
        No product found.
      */
      if (!productData) {
        setError(
          'No product found. Check the QR code or batch ID and try again.'
        );
        setLoading(false);
        return;
      }

      setProduct(productData);

      /*
        STEP 4:
        Load ALL supply-chain events for this product.
      */
      const eventResult = await supabase
        .from('supply_chain_events')
        .select('*')
        .eq('product_id', productData.id)
        .order('timestamp', { ascending: true });

      if (eventResult.error) {
        console.error('Supply chain event error:', eventResult.error);

        setError(
          `Product found, but supply-chain history could not be loaded: ${eventResult.error.message}`
        );

        setLoading(false);
        return;
      }

      const loadedEvents = (eventResult.data ?? []) as SupplyChainEvent[];

      setEvents(loadedEvents);

      /*
        IMPORTANT FIX:

        Do NOT rely only on products.current_status.

        Your database currently has:
          harvested
          in_transit
          in_transit
          in_transit
          at_retail

        Therefore the latest event is the real current stage.
      */
      if (loadedEvents.length > 0) {
        const latestEvent = loadedEvents[loadedEvents.length - 1];

        setDisplayStatus(latestEvent.stage);
      } else {
        setDisplayStatus(productData.current_status);
      }

      setLoading(false);
    } catch (err) {
      console.error('Trace error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while tracing the product.'
      );

      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
          <ScanLine className="w-6 h-6 text-blue-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-earth-900 font-display">
            Trace a Product
          </h1>

          <p className="text-sm text-earth-500">
            Scan the QR code with Google Lens or enter the batch ID to view the
            complete supply chain journey.
          </p>
        </div>
      </div>

      {/* QR detected */}
      {initialTrackId && (
        <div className="flex items-center gap-2 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 px-4 py-3 mb-5 text-sm">
          <ShieldCheck className="w-4 h-4 shrink-0" />

          QR link detected — loading the verified crop record.
        </div>
      )}

      {/* Search */}
      <div className="card p-5 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchProduct();
                }
              }}
              className="input-field pl-10"
              placeholder="Enter batch ID or tracking code..."
            />
          </div>

          <button
            onClick={() => searchProduct()}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ScanLine className="w-5 h-5" />
            )}

            Trace
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-6 mb-6 border-rose-200 bg-rose-50/50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />

            <p className="text-sm text-rose-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Product */}
      {product && (
        <div className="space-y-6 animate-fade-in">

          {/* Product Header */}
          <div className="card overflow-hidden">

            <div className="bg-gradient-to-r from-brand-700 to-emerald-800 p-6">

              <div className="flex items-start justify-between gap-4">

                <div>

                  {/* CURRENT STATUS FROM LATEST EVENT */}
                  <span className="badge bg-white/20 text-white border-white/30 mb-3">
                    {STAGE_LABELS[displayStatus] ?? displayStatus}
                  </span>

                  <h2 className="text-2xl font-bold text-white font-display">
                    {product.crop_name}
                  </h2>

                  {product.variety && (
                    <p className="text-brand-100 text-sm mt-1">
                      {product.variety}
                    </p>
                  )}

                </div>

                <div className="text-right">

                  <p className="text-brand-100 text-xs">
                    Batch ID
                  </p>

                  <p className="font-mono text-white font-semibold">
                    {product.batch_id}
                  </p>

                </div>

              </div>
            </div>

            {/* Product Information */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">

              <InfoItem
                icon={Package}
                label="Quantity"
                value={String(product.quantity ?? '')}
              />

              <InfoItem
                icon={User}
                label="Farmer"
                value={String(product.farmer_name ?? '')}
              />

              <InfoItem
                icon={ShieldCheck}
                label="Farmer ID"
                value={DEMO_FARMER_ID}
              />

              <InfoItem
                icon={MapPin}
                label="Origin"
                value={String(product.farmer_location ?? '')}
              />

              <InfoItem
                icon={Calendar}
                label="Harvested"
                value={
                  product.harvest_date
                    ? new Date(product.harvest_date).toLocaleDateString()
                    : ''
                }
              />

              <InfoItem
                icon={Award}
                label="Certification"
                value={String(product.certification ?? '')}
              />

              <InfoItem
                icon={Calendar}
                label="Registered"
                value={
                  product.created_at
                    ? new Date(product.created_at).toLocaleDateString()
                    : ''
                }
              />

            </div>
          </div>

          {/* COMPLETE SUPPLY CHAIN */}
          <div className="card p-6">

            <h3 className="font-semibold text-earth-900 mb-5 flex items-center gap-2">

              <CheckCircle2 className="w-5 h-5 text-brand-600" />

              Complete Supply Chain Journey

            </h3>

            {events.length === 0 ? (

              <div className="text-center py-6">

                <AlertCircle className="w-8 h-8 text-earth-400 mx-auto mb-2" />

                <p className="text-earth-500 text-sm">
                  No supply chain events recorded yet.
                </p>

              </div>

            ) : (

              <div className="space-y-1">

                {events.map((event, i) => (

                  <div key={event.id} className="flex gap-4">

                    {/* Timeline icon */}
                    <div className="flex flex-col items-center">

                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                          event.stage === 'harvested'
                            ? 'bg-brand-100'
                            : event.stage === 'in_transit'
                            ? 'bg-amber-100'
                            : event.stage === 'quality_check'
                            ? 'bg-blue-100'
                            : event.stage === 'at_retail'
                            ? 'bg-purple-100'
                            : event.stage === 'sold'
                            ? 'bg-green-100'
                            : 'bg-stone-100'
                        }`}
                      >

                        <StageIcon stage={event.stage} />

                      </div>

                      {i < events.length - 1 && (
                        <div className="w-0.5 flex-1 bg-earth-200 my-1 min-h-[24px]" />
                      )}

                    </div>

                    {/* Event details */}
                    <div className="pb-6 flex-1">

                      <div className="flex items-center gap-2 flex-wrap">

                        <span className="font-semibold text-earth-900">
                          {STAGE_LABELS[event.stage] ?? event.stage}
                        </span>

                        <span
                          className={`badge ${
                            STATUS_COLORS[event.stage] ?? ''
                          }`}
                        >
                          {event.actor_role}
                        </span>

                      </div>

                      <p className="text-sm text-earth-600 mt-0.5">
                        by {event.actor_name}
                      </p>

                      <p className="text-xs text-earth-500 mt-1 flex items-center gap-1 flex-wrap">

                        <MapPin className="w-3 h-3" />

                        {event.location || 'Location not provided'}

                        <span className="mx-1">•</span>

                        {event.timestamp
                          ? new Date(event.timestamp).toLocaleString()
                          : ''}

                      </p>

                      {event.temperature && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">

                          <Thermometer className="w-3 h-3" />

                          {event.temperature}

                        </p>
                      )}

                      {event.notes && (
                        <p className="text-sm text-earth-600 mt-2 bg-stone-50 rounded-lg p-2.5 border border-earth-100">
                          {event.notes}
                        </p>
                      )}

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* Current status summary */}
          {events.length > 0 && (
            <div className="card p-5 border-brand-200 bg-brand-50">

              <div className="flex items-center gap-3">

                <CheckCircle2 className="w-6 h-6 text-brand-600 shrink-0" />

                <div>

                  <p className="text-xs text-brand-700 font-medium">
                    CURRENT SUPPLY CHAIN STATUS
                  </p>

                  <p className="text-lg font-bold text-brand-900">
                    {STAGE_LABELS[displayStatus] ?? displayStatus}
                  </p>

                  <p className="text-xs text-brand-700 mt-1">
                    Based on the latest recorded supply-chain event.
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* Complaint */}
          {!showComplaint ? (

            <button
              onClick={() => setShowComplaint(true)}
              className="btn-secondary w-full"
            >

              <Flag className="w-4 h-4 text-rose-500" />

              File a Complaint About This Product

            </button>

          ) : (

            <ComplaintForm
              product={product}
              onDone={() => setShowComplaint(false)}
            />

          )}

        </div>
      )}

    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div>

      <div className="flex items-center gap-1.5 text-earth-500 text-xs mb-0.5">

        <Icon className="w-3.5 h-3.5" />

        {label}

      </div>

      <p className="text-sm font-medium text-earth-900">
        {value || '-'}
      </p>

    </div>
  );
}

/* =========================================================
   STAGE ICON
========================================================= */

function StageIcon({ stage }: { stage: string }) {

  const className = 'w-5 h-5';

  if (stage === 'harvested') {
    return (
      <Sprout className={`${className} text-brand-600`} />
    );
  }

  if (stage === 'in_transit') {
    return (
      <Truck className={`${className} text-amber-600`} />
    );
  }

  if (stage === 'at_retail') {
    return (
      <Store className={`${className} text-purple-600`} />
    );
  }

  if (stage === 'sold') {
    return (
      <CheckCircle2 className={`${className} text-green-600`} />
    );
  }

  if (stage === 'quality_check') {
    return (
      <ShieldCheck className={`${className} text-blue-600`} />
    );
  }

  return (
    <CheckCircle2 className={`${className} text-blue-600`} />
  );
}

/* =========================================================
   COMPLAINT FORM
========================================================= */

function ComplaintForm({
  product,
  onDone,
}: {
  product: Product;
  onDone: () => void;
}) {

  const [form, setForm] = useState({
    complainant_name: '',
    complainant_contact: '',
    complaint_type: 'quality',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {

    e.preventDefault();

    setSubmitting(true);
    setError('');

    try {

      const { error: insertError } = await supabase
        .from('complaints')
        .insert({
          product_id: product.id,
          complainant_name: form.complainant_name,
          complainant_contact: form.complainant_contact,
          complaint_type: form.complaint_type,
          description: form.description,
          status: 'pending',
        });

      if (insertError) {
        throw insertError;
      }

      setDone(true);

    } catch (err) {

      console.error('Complaint error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit complaint.'
      );

    } finally {

      setSubmitting(false);

    }
  }

  if (done) {

    return (
      <div className="card p-6 text-center">

        <CheckCircle2 className="w-10 h-10 text-brand-500 mx-auto mb-3" />

        <h3 className="font-semibold text-earth-900 mb-1">
          Complaint Filed
        </h3>

        <p className="text-sm text-earth-600 mb-4">
          Your complaint has been submitted. Authorities will review it
          shortly.
        </p>

        <button
          onClick={onDone}
          className="btn-secondary"
        >
          Close
        </button>

      </div>
    );
  }

  return (
    <div className="card p-5">

      <h4 className="font-semibold text-earth-900 mb-4 text-sm flex items-center gap-2">

        <Flag className="w-4 h-4 text-rose-500" />

        File a Complaint — {product.batch_id}

      </h4>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">

        <div className="grid sm:grid-cols-2 gap-3">

          <div>

            <label className="block text-sm font-medium text-earth-700 mb-1.5">
              Your Name *
            </label>

            <input
              required
              value={form.complainant_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  complainant_name: e.target.value,
                })
              }
              className="input-field"
              placeholder="Full name"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-earth-700 mb-1.5">
              Contact *
            </label>

            <input
              required
              value={form.complainant_contact}
              onChange={(e) =>
                setForm({
                  ...form,
                  complainant_contact: e.target.value,
                })
              }
              className="input-field"
              placeholder="Email or phone"
            />

          </div>

        </div>

        <div>

          <label className="block text-sm font-medium text-earth-700 mb-1.5">
            Complaint Type *
          </label>

          <select
            value={form.complaint_type}
            onChange={(e) =>
              setForm({
                ...form,
                complaint_type: e.target.value,
              })
            }
            className="input-field"
          >
            <option value="quality">
              Quality Issue
            </option>

            <option value="authenticity">
              Authenticity / Not Organic
            </option>

            <option value="pricing">
              Unfair Pricing
            </option>

            <option value="other">
              Other
            </option>
          </select>

        </div>

        <div>

          <label className="block text-sm font-medium text-earth-700 mb-1.5">
            Description *
          </label>

          <textarea
            required
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="input-field"
            rows={3}
            placeholder="Describe the issue..."
          />

        </div>

        <div className="flex gap-3">

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1"
          >

            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Flag className="w-4 h-4" />
            )}

            {submitting
              ? 'Submitting...'
              : 'Submit Complaint'}

          </button>

          <button
            type="button"
            onClick={onDone}
            className="btn-secondary"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
}
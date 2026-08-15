import { useState, useEffect } from 'react';
import {
  FileSearch,
  Loader2,
  Flag,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Search,
  AlertCircle,
} from 'lucide-react';
import {
  supabase,
  type Complaint,
  type Product,
  COMPLAINT_STATUS_COLORS,
} from '@/lib/supabase';

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  under_review: Search,
  resolved: CheckCircle2,
  dismissed: XCircle,
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  under_review: 'Under Review',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

export default function AuthorityDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(null);
  const [response, setResponse] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    setLoading(true);

    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading complaints:', error);
      alert(`Could not load complaints: ${error.message}`);
      setLoading(false);
      return;
    }

    const complaintData = (data as Complaint[]) ?? [];
    setComplaints(complaintData);

    const productIds = [
      ...new Set(
        complaintData
          .map((complaint) => complaint.product_id)
          .filter(Boolean)
      ),
    ] as string[];

    if (productIds.length > 0) {
      const { data: productData, error: productError } =
        await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

      if (productError) {
        console.error('Error loading products:', productError);
      } else {
        const productMap: Record<string, Product> = {};

        ((productData as Product[]) ?? []).forEach((product) => {
          productMap[product.id] = product;
        });

        setProducts(productMap);
      }
    } else {
      setProducts({});
    }

    setLoading(false);
  }

  async function updateStatus(
    complaint: Complaint,
    status: string
  ) {
    if (updating) return;

    setUpdating(true);

    const updates: Record<string, unknown> = {
      status,
    };

    if (status === 'resolved' || status === 'dismissed') {
      updates.resolved_at = new Date().toISOString();
      updates.authority_response = response.trim() || null;
    }

    console.log('Updating complaint:', {
      complaintId: complaint.id,
      oldStatus: complaint.status,
      newStatus: status,
      updates,
    });

    const { error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', complaint.id);

    if (error) {
      console.error('Complaint update error:', error);

      alert(
        `Could not update complaint.\n\nSupabase error:\n${error.message}`
      );

      setUpdating(false);
      return;
    }

    console.log('Complaint updated successfully');

    setUpdating(false);
    setResponse('');
    setSelectedComplaint(null);

    await loadComplaints();
  }

  const filtered =
    filter === 'all'
      ? complaints
      : complaints.filter(
          (complaint) => complaint.status === filter
        );

  const stats = {
    total: complaints.length,
    pending: complaints.filter(
      (complaint) => complaint.status === 'pending'
    ).length,
    under_review: complaints.filter(
      (complaint) => complaint.status === 'under_review'
    ).length,
    resolved: complaints.filter(
      (complaint) => complaint.status === 'resolved'
    ).length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
          <FileSearch className="w-6 h-6 text-rose-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-earth-900 font-display">
            Authority Dashboard
          </h1>

          <p className="text-sm text-earth-500">
            Verify supply chain data and handle consumer complaints
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Complaints"
          value={stats.total}
          icon={Flag}
          color="bg-stone-100 text-stone-700"
        />

        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          color="bg-amber-100 text-amber-700"
        />

        <StatCard
          label="Under Review"
          value={stats.under_review}
          icon={Search}
          color="bg-blue-100 text-blue-700"
        />

        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          color="bg-brand-100 text-brand-700"
        />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          'all',
          'pending',
          'under_review',
          'resolved',
          'dismissed',
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              filter === status
                ? 'bg-earth-900 text-white'
                : 'bg-white text-earth-600 border border-earth-200 hover:bg-earth-100'
            }`}
          >
            {status === 'all'
              ? 'All'
              : STATUS_LABELS[status] ?? status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Flag className="w-12 h-12 text-earth-300 mx-auto mb-3" />
          <p className="text-earth-500">
            No complaints to display.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {filtered.map((complaint) => {
            const product = complaint.product_id
              ? products[complaint.product_id]
              : null;

            const StatusIcon =
              STATUS_ICONS[complaint.status] ?? Clock;

            const isSelected =
              selectedComplaint?.id === complaint.id;

            return (
              <div
                key={complaint.id}
                className={`card p-5 ${
                  isSelected ? 'ring-2 ring-rose-400' : ''
                } hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        COMPLAINT_STATUS_COLORS[
                          complaint.status
                        ] ?? ''
                      }`}
                    >
                      <StatusIcon className="w-4 h-4" />
                    </div>

                    <div>
                      <span className="font-semibold text-earth-900 capitalize">
                        {complaint.complaint_type}
                      </span>

                      <p className="text-xs text-earth-500">
                        {new Date(
                          complaint.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      COMPLAINT_STATUS_COLORS[
                        complaint.status
                      ] ?? ''
                    }`}
                  >
                    {STATUS_LABELS[complaint.status] ??
                      complaint.status}
                  </span>
                </div>

                <div className="text-sm space-y-1.5 mb-3">
                  <p className="text-earth-600">
                    <span className="text-earth-500">
                      From:
                    </span>{' '}
                    {complaint.complainant_name} (
                    {complaint.complainant_contact})
                  </p>

                  {product && (
                    <p className="text-earth-600 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-earth-400" />
                      <span className="font-mono">
                        {product.batch_id}
                      </span>{' '}
                      — {product.crop_name}
                    </p>
                  )}

                  <p className="text-earth-700 bg-stone-50 rounded-lg p-2.5 border border-earth-100 text-sm">
                    {complaint.description}
                  </p>
                </div>

                {complaint.authority_response && (
                  <div className="text-xs text-brand-700 bg-brand-50 rounded-lg p-2.5 border border-brand-100 mb-3">
                    <span className="font-semibold">
                      Response:
                    </span>{' '}
                    {complaint.authority_response}
                  </div>
                )}

                {complaint.status !== 'resolved' &&
                  complaint.status !== 'dismissed' && (
                    <div className="space-y-2">
                      {isSelected ? (
                        <>
                          <textarea
                            value={response}
                            onChange={(e) =>
                              setResponse(e.target.value)
                            }
                            className="input-field text-sm"
                            rows={2}
                            placeholder="Add a response note (optional for review, required for resolve)..."
                          />

                          <div className="flex gap-2">
                            {complaint.status === 'pending' && (
                              <button
                                onClick={() =>
                                  updateStatus(
                                    complaint,
                                    'under_review'
                                  )
                                }
                                disabled={updating}
                                className="btn-secondary flex-1 text-sm py-2"
                              >
                                {updating ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Search className="w-4 h-4" />
                                )}
                                Mark Reviewing
                              </button>
                            )}

                            <button
                              onClick={() =>
                                updateStatus(
                                  complaint,
                                  'resolved'
                                )
                              }
                              disabled={updating}
                              className="btn-primary flex-1 text-sm py-2 bg-brand-600"
                            >
                              {updating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                              Resolve
                            </button>

                            <button
                              onClick={() =>
                                updateStatus(
                                  complaint,
                                  'dismissed'
                                )
                              }
                              disabled={updating}
                              className="btn-secondary text-sm py-2 text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                              {updating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Dismiss
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedComplaint(null);
                              setResponse('');
                            }}
                            disabled={updating}
                            className="w-full text-sm text-earth-500 hover:text-earth-800 py-1"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            setSelectedComplaint(complaint)
                          }
                          className="btn-ghost w-full text-sm text-rose-600 hover:bg-rose-50"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Take Action
                        </button>
                      )}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof Clock;
  color: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-earth-500 mb-0.5">
            {label}
          </p>

          <p className="text-2xl font-bold text-earth-900">
            {value}
          </p>
        </div>

        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
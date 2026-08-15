import { useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Leaf, LogIn, ShieldCheck, Sprout } from 'lucide-react';

const DEMO_AGRISTACK_ID = 'AGRI-DEMO-FARMER-001';

type Props = {
  onLogin: () => void;
  onCancel: () => void;
};

export default function FarmerLogin({ onLogin, onCancel }: Props) {
  const [agriStackId, setAgriStackId] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const enteredId = agriStackId.trim();

    if (!enteredId) {
      setError('Please enter your AgriStack Farmer ID.');
      return;
    }

    if (enteredId !== DEMO_AGRISTACK_ID) {
      setError('For this hackathon demo, please enter the Demo ID shown below.');
      return;
    }

    setError('');
    onLogin();
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-brand-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <button
          onClick={onCancel}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-earth-600 hover:text-brand-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to role selection
        </button>

        <div className="card overflow-hidden shadow-xl border border-brand-100">
          <div className="bg-gradient-to-br from-emerald-800 to-brand-700 px-7 py-8 text-white">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-brand-100">AgriTrust</p>
                <h1 className="text-xl font-bold font-display">Farmer Login</h1>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-brand-200" />
              <div>
                <p className="font-semibold">AgriStack Farmer Login</p>
                <p className="text-sm text-brand-100 mt-1 leading-relaxed">
                  Enter the farmer ID manually to continue to the AgriTrust farmer dashboard.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-7 space-y-5">
            <div>
              <label htmlFor="agristack-id" className="block text-sm font-semibold text-earth-800 mb-2">
                AgriStack Farmer ID
              </label>
              <input
                id="agristack-id"
                type="text"
                value={agriStackId}
                onChange={(event) => {
                  setAgriStackId(event.target.value);
                  setError('');
                }}
                placeholder="Enter AgriStack Farmer ID"
                autoComplete="off"
                className="w-full rounded-xl border border-earth-200 bg-white px-4 py-3.5 text-earth-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
              {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3.5 font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-[0.99] transition-all"
            >
              <LogIn className="w-5 h-5" />
              Continue with AgriStack
            </button>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Hackathon demo ID</p>
              <p className="mt-1 text-sm text-amber-900">
                Type this ID manually in the box above:
              </p>
              <code className="mt-2 block rounded-lg bg-white border border-amber-200 px-3 py-2.5 font-mono text-sm font-semibold text-earth-900 select-all">
                {DEMO_AGRISTACK_ID}
              </code>
              <p className="mt-2 text-xs text-amber-700">
                This ID is displayed only as a demo reference. It is intentionally not auto-filled.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-brand-600" />
              <p>
                After login, you can register crops, generate QR codes, and record the farmer stage of the supply chain.
              </p>
            </div>
          </form>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-earth-500">
          <Sprout className="w-4 h-4" />
          <span>Hackathon demonstration interface</span>
        </div>
      </div>
    </div>
  );
}

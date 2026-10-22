
import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  FileSearch,
  Leaf,
  LogIn,
  ShieldCheck,
  Store,
  Truck,
} from 'lucide-react';
import type { Role } from '@/lib/supabase';

type Props = {
  role: Exclude<Role, 'farmer' | 'consumer'>;
  onLogin: () => void;
  onCancel: () => void;
};

const LOGIN_CONFIG = {
  transporter: {
    title: 'Transporter Login',
    subtitle: 'Driving Licence Verification',
    fieldLabel: 'Driving Licence ID',
    placeholder: 'Enter Driving Licence ID',
    demoLabel: 'Demo Driving Licence ID',
    demoId: 'DL-DEMO-TRANSPORTER-001',
    icon: Truck,
    description:
      'Enter the demo driving licence ID to access the transporter dashboard. This is a demo check, not live licence verification.',
  },
  retailer: {
    title: 'Retailer Login',
    subtitle: 'Retailer Access',
    fieldLabel: 'Username',
    placeholder: 'Enter retailer username',
    demoLabel: 'Demo Username',
    demoId: 'AGRI-DEMO-RETAILER-001',
    password: 'retailer123',
    icon: Store,
    description:
      'Enter the demo retailer username and password to access the existing retailer dashboard.',
  },
  authority: {
    title: 'Authority Login',
    subtitle: 'Authority Access',
    fieldLabel: 'Authority ID',
    placeholder: 'Enter Authority ID',
    demoLabel: 'Demo Authority ID',
    demoId: 'AGRI-DEMO-AUTHORITY-001',
    password: 'authority123',
    icon: FileSearch,
    description:
      'Enter the demo authority ID and password to access the existing authority dashboard.',
  },
} as const;

export default function RoleLogin({
  role,
  onLogin,
  onCancel,
}: Props) {
  const config = LOGIN_CONFIG[role];
  const Icon = config.icon;

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const enteredId = id.trim();

    if (!enteredId) {
      setError(`Please enter your ${config.fieldLabel}.`);
      return;
    }

    if (enteredId !== config.demoId) {
      setError(
        `Incorrect demo ${config.fieldLabel}. Use the credentials shown below.`,
      );
      return;
    }

    if ('password' in config && password !== config.password) {
      setError('Incorrect demo password. Please try again.');
      return;
    }

    setError('');
    onLogin();
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-brand-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <button
          type="button"
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
                <Icon className="w-6 h-6" />
              </div>

              <div>
                <p className="text-sm text-brand-100">AgriTrust</p>
                <h1 className="text-xl font-bold font-display">
                  {config.title}
                </h1>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-brand-200" />
              <div>
                <p className="font-semibold">{config.subtitle}</p>
                <p className="text-sm text-brand-100 mt-1 leading-relaxed">
                  {config.description}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-7 space-y-5"
          >
            <div>
              <label
                htmlFor="role-login-id"
                className="block text-sm font-semibold text-earth-800 mb-2"
              >
                {config.fieldLabel}
              </label>

              <input
                id="role-login-id"
                type="text"
                value={id}
                onChange={(event) => {
                  setId(event.target.value);
                  setError('');
                }}
                placeholder={config.placeholder}
                autoComplete="username"
                required
                className="w-full rounded-xl border border-earth-200 bg-white px-4 py-3.5 text-earth-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </div>

            {'password' in config && (
              <div>
                <label
                  htmlFor="role-login-password"
                  className="block text-sm font-semibold text-earth-800 mb-2"
                >
                  Password
                </label>

                <input
                  id="role-login-password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  placeholder="Enter demo password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-earth-200 bg-white px-4 py-3.5 text-earth-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-rose-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3.5 font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-[0.99] transition-all"
            >
              <LogIn className="w-5 h-5" />
              Login
            </button>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                Hackathon demo access
              </p>
              <p className="mt-1 text-sm text-amber-900">
                Use these demo credentials to continue.
              </p>

              <p className="mt-2 text-xs font-semibold text-amber-800">
                {config.demoLabel}
              </p>
              <code className="mt-1 block rounded-lg bg-white border border-amber-200 px-3 py-2.5 font-mono text-sm font-semibold text-earth-900 select-all break-all">
                {config.demoId}
              </code>

              {'password' in config && (
                <>
                  <p className="mt-2 text-xs font-semibold text-amber-800">
                    Demo Password
                  </p>
                  <code className="mt-1 block rounded-lg bg-white border border-amber-200 px-3 py-2.5 font-mono text-sm font-semibold text-earth-900 select-all">
                    {config.password}
                  </code>
                </>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-brand-600" />
              <p>
                Successful demo login opens the existing dashboard.
                Real identity verification must be implemented separately
                before production use.
              </p>
            </div>
          </form>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-earth-500">
          <Leaf className="w-4 h-4" />
          <span>Hackathon demonstration interface</span>
        </div>
      </div>
    </div>
  );
}

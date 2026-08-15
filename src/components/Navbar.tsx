import { Sprout, Truck, Store, ScanLine, FileSearch, Leaf, ArrowLeft } from 'lucide-react';
import type { Role } from '@/lib/supabase';

type Props = {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  onHome: () => void;
};

const ROLES: { key: Role; label: string; icon: typeof Sprout }[] = [
  { key: 'farmer', label: 'Farmer', icon: Sprout },
  { key: 'transporter', label: 'Transporter', icon: Truck },
  { key: 'retailer', label: 'Retailer', icon: Store },
  { key: 'consumer', label: 'Consumer', icon: ScanLine },
  { key: 'authority', label: 'Authority', icon: FileSearch },
];

export default function Navbar({ currentRole, onRoleChange, onHome }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button onClick={onHome} className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-earth-900 font-display hidden sm:block">AgriTrust</span>
        </button>

        <div className="flex items-center gap-1 overflow-x-auto">
          {ROLES.map((role) => {
            const active = currentRole === role.key;
            return (
              <button
                key={role.key}
                onClick={() => onRoleChange(role.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-earth-600 hover:bg-earth-100'
                }`}
              >
                <role.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{role.label}</span>
              </button>
            );
          })}
        </div>

        <button onClick={onHome} className="btn-ghost shrink-0">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </button>
      </div>
    </header>
  );
}

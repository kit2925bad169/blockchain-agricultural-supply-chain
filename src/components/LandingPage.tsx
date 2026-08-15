import { Sprout, ScanLine, ShieldCheck, Truck, Store, FileSearch, ArrowRight, Leaf, Lock, Users, TrendingUp } from 'lucide-react';
import type { Role } from '@/lib/supabase';

type Props = {
  onEnter: (role: Role) => void;
};

const features = [
  {
    icon: Sprout,
    title: 'Farm-to-Table Tracking',
    description: 'Every product is registered at harvest with crop details, location, and certification — stored as an immutable record.',
  },
  {
    icon: ScanLine,
    title: 'QR Code Transparency',
    description: 'Each batch gets a unique QR code. Consumers scan it to see the complete journey from farm to shelf.',
  },
  {
    icon: ShieldCheck,
    title: 'Blockchain Security',
    description: 'Tamper-proof supply chain events. Once a stage is recorded, it cannot be altered or deleted.',
  },
  {
    icon: Users,
    title: 'Multi-Role Access',
    description: 'Farmers, transporters, retailers, consumers, and authorities — each with tailored tools and views.',
  },
];

const steps = [
  { icon: Sprout, label: 'Farmer Registers Crop', color: 'bg-brand-600' },
  { icon: Lock, label: 'Data Stored on Chain', color: 'bg-brand-700' },
  { icon: Truck, label: 'Transporter Updates', color: 'bg-amber-500' },
  { icon: Store, label: 'Retailer Receives', color: 'bg-purple-500' },
  { icon: ScanLine, label: 'Consumer Scans QR', color: 'bg-blue-500' },
];

const roles: { key: Role; title: string; icon: typeof Sprout; description: string; color: string }[] = [
  { key: 'farmer', title: 'Farmer', icon: Sprout, description: 'Register crops, generate QR codes, record harvest data.', color: 'from-brand-500 to-brand-700' },
  { key: 'transporter', title: 'Transporter', icon: Truck, description: 'Log transit updates, temperature, and delivery status.', color: 'from-amber-500 to-orange-600' },
  { key: 'retailer', title: 'Retailer', icon: Store, description: 'Confirm receipt, update stock, mark products as sold.', color: 'from-purple-500 to-indigo-600' },
  { key: 'consumer', title: 'Consumer', icon: ScanLine, description: 'Scan QR codes to trace any product\'s full history.', color: 'from-blue-500 to-cyan-600' },
  { key: 'authority', title: 'Authority', icon: FileSearch, description: 'Verify supply chain data, review and resolve complaints.', color: 'from-rose-500 to-red-600' },
];

export default function LandingPage({ onEnter }: Props) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-brand-800 to-slate-900">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(https://images.pexels.com/photos/2049001/pexels-photo-2049001.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/60 via-brand-800/70 to-brand-900/90" />
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <Leaf className="w-6 h-6 text-brand-200" />
            </div>
            <span className="text-xl font-bold text-white font-display">AgriTrust</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-3xl font-display">
            Transparency from <span className="text-brand-300">farm</span> to <span className="text-brand-300">table</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-brand-100 max-w-2xl leading-relaxed">
            A blockchain-powered supply chain platform that lets every stakeholder — farmer, transporter, retailer, consumer, and authority — verify the origin, quality, and journey of agricultural products.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button onClick={() => onEnter('consumer')} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-brand-700 font-semibold shadow-lg hover:bg-brand-50 active:scale-[0.98] transition-all duration-200">
              <ScanLine className="w-5 h-5" />
              Trace a Product
            </button>
            <button onClick={() => onEnter('farmer')} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 backdrop-blur text-white font-semibold border border-white/20 hover:bg-white/20 active:scale-[0.98] transition-all duration-200">
              <Sprout className="w-5 h-5" />
              Register as Farmer
            </button>
          </div>
        </div>
      </header>

      {/* Problem Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="badge bg-rose-50 text-rose-600 border-rose-200 mb-4">The Problem</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-earth-900 font-display">Trust is broken in agriculture</h2>
          <p className="mt-4 text-earth-600 text-lg">Consumers can't verify origin. Farmers lose to middlemen. Quality claims go unchecked.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: 'No Transparency', desc: 'The supply chain is opaque — consumers have no visibility into where products come from.' },
            { title: 'Unverifiable Quality', desc: 'Organic and certification claims are hard to confirm at the point of sale.' },
            { title: 'Unfair Pricing', desc: 'Middlemen manipulate information, leading to unfair prices for farmers.' },
            { title: 'No Traceability', desc: 'When issues arise, there is no auditable record of who handled the product and when.' },
            { title: 'Broken Trust', desc: 'Farmers, distributors, retailers, and consumers all lack a shared source of truth.' },
            { title: 'Slow Recalls', desc: 'Without batch-level tracking, contaminated products cannot be quickly traced back.' },
          ].map((item, i) => (
            <div key={i} className="card p-6 hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center mb-4">
                <span className="text-rose-500 font-bold text-lg">{i + 1}</span>
              </div>
              <h3 className="font-semibold text-earth-900 mb-2">{item.title}</h3>
              <p className="text-sm text-earth-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white border-y border-earth-200/60 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="badge bg-brand-50 text-brand-700 border-brand-200 mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-earth-900 font-display">Five steps, end to end</h2>
            <p className="mt-4 text-earth-600 text-lg">Every product moves through a verifiable pipeline with immutable records at each stage.</p>
          </div>
          <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0">
            {steps.map((step, i) => (
              <div key={i} className="flex-1 flex flex-col md:flex-row items-center">
                <div className="flex flex-col items-center text-center px-4">
                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center shadow-md mb-3`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-earth-800 max-w-[120px]">{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex flex-1 h-0.5 bg-earth-200 mx-2 mb-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="badge bg-blue-50 text-blue-600 border-blue-200 mb-4">Platform Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-earth-900 font-display">Built for trust at every link</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card p-7 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <f.icon className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-earth-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-earth-600 leading-relaxed">{f.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Selection */}
      <section className="bg-gradient-to-b from-stone-50 to-brand-50/50 py-20 border-t border-earth-200/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="badge bg-brand-50 text-brand-700 border-brand-200 mb-4">Choose Your Role</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-earth-900 font-display">Enter the platform</h2>
            <p className="mt-4 text-earth-600 text-lg">Select your role to access the tools built for you.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map((role) => (
              <button
                key={role.key}
                onClick={() => onEnter(role.key)}
                className="group card p-6 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-4 shadow-sm`}>
                  <role.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-earth-900 mb-1.5 flex items-center justify-between">
                  {role.title}
                  <ArrowRight className="w-4 h-4 text-earth-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all duration-200" />
                </h3>
                <p className="text-sm text-earth-600 leading-relaxed">{role.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / CTA */}
      <section className="bg-brand-800 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <TrendingUp className="w-10 h-10 text-brand-300 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mb-3">Ready to build trust in your supply chain?</h2>
          <p className="text-brand-100 mb-8 max-w-xl mx-auto">Join the platform that brings transparency to agriculture — from the field to the consumer's hands.</p>
          <button onClick={() => onEnter('farmer')} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-brand-700 font-semibold shadow-lg hover:bg-brand-50 active:scale-[0.98] transition-all duration-200">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-earth-900 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Leaf className="w-5 h-5 text-brand-400" />
            <span className="font-semibold text-white font-display">AgriTrust</span>
          </div>
          <p className="text-sm text-earth-400">Transparent agricultural supply chain platform.</p>
        </div>
      </footer>
    </div>
  );
}

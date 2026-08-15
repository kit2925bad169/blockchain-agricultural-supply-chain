import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import Navbar from '@/components/Navbar';
import FarmerDashboard from '@/components/FarmerDashboard';
import FarmerLogin from '@/components/FarmerLogin';
import RoleLogin from '@/components/RoleLogin';
import TransporterDashboard from '@/components/TransporterDashboard';
import RetailerDashboard from '@/components/RetailerDashboard';
import ConsumerDashboard from '@/components/ConsumerDashboard';
import AuthorityDashboard from '@/components/AuthorityDashboard';
import type { Role } from '@/lib/supabase';

function getTrackingId(): string | undefined {
  return new URLSearchParams(window.location.search).get('track') ?? undefined;
}

export default function App() {
  const trackingId = getTrackingId();
  const [role, setRole] = useState<Role | null>(trackingId ? 'consumer' : null);
  const [farmerAuthenticated, setFarmerAuthenticated] = useState(false);
  const [transporterAuthenticated, setTransporterAuthenticated] = useState(false);
  const [retailerAuthenticated, setRetailerAuthenticated] = useState(false);
  const [authorityAuthenticated, setAuthorityAuthenticated] = useState(false);

  function handleRoleChange(nextRole: Role) {
    setRole(nextRole);
    if (nextRole !== 'consumer' && window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  if (!role) {
    return <LandingPage onEnter={setRole} />;
  }

  if (role === 'farmer' && !farmerAuthenticated) {
    return (
      <div className="min-h-screen app-shell">
        <Navbar currentRole={role} onRoleChange={handleRoleChange} onHome={() => setRole(null)} />
        <FarmerLogin
          onLogin={() => setFarmerAuthenticated(true)}
          onCancel={() => setRole(null)}
        />
      </div>
    );
  }

  const loginRequired =
    (role === 'transporter' && !transporterAuthenticated) ||
    (role === 'retailer' && !retailerAuthenticated) ||
    (role === 'authority' && !authorityAuthenticated);

  if (loginRequired) {
    return (
      <div className="min-h-screen app-shell">
        <Navbar currentRole={role} onRoleChange={handleRoleChange} onHome={() => setRole(null)} />
        <RoleLogin
          role={role as 'transporter' | 'retailer' | 'authority'}
          onLogin={() => {
            if (role === 'transporter') setTransporterAuthenticated(true);
            if (role === 'retailer') setRetailerAuthenticated(true);
            if (role === 'authority') setAuthorityAuthenticated(true);
          }}
          onCancel={() => setRole(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen app-shell">
      <Navbar currentRole={role} onRoleChange={handleRoleChange} onHome={() => setRole(null)} />
      {role === 'farmer' && <FarmerDashboard />}
      {role === 'transporter' && <TransporterDashboard />}
      {role === 'retailer' && <RetailerDashboard />}
      {role === 'consumer' && <ConsumerDashboard initialTrackId={trackingId} />}
      {role === 'authority' && <AuthorityDashboard />}
    </div>
  );
}

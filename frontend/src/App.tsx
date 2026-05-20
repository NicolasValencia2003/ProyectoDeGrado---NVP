import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import AcademicDisclaimer from './pages/AcademicDisclaimer';
import Survey from './pages/Survey';
import Dashboard from './pages/Dashboard';
import LearningJourney from './pages/LearningJourney';
import Profile from './pages/Profile';
import Glossary from './pages/Glossary';
import Chat from './pages/Chat';
import NotificationBell from './components/NotificationBell';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
      Cargando...
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  if (!profile?.academic_disclaimer_accepted) return <Navigate to="/disclaimer" replace />;
  if (!profile?.risk_score) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

const NAV_ITEMS = [
  { to: '/dashboard',   label: 'Dashboard',    icon: '▦' },
  { to: '/trayectoria', label: 'Trayectoria',  icon: '📈' },
  { to: '/chat',        label: 'Asistente IA', icon: '💬' },
  { to: '/glosario',    label: 'Glosario',     icon: '📚' },
  { to: '/profile',     label: 'Perfil',       icon: '◉' },
];

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const noLayout = ['/', '/disclaimer', '/onboarding', '/encuesta'].some(p =>
    location.pathname === p || location.pathname.startsWith('/encuesta')
  );
  if (noLayout) return <>{children}</>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 240, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '24px 0',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100,
      }}>
        <div style={{ padding: '0 24px 32px' }}>
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--gold)' }}>F</span>invise
          </span>
        </div>
        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
              borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
              background: isActive ? 'rgba(212,168,67,0.08)' : 'transparent',
              transition: 'all 150ms ease',
            })}>
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600, marginBottom: 4 }}>⚠ Material educativo</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4 }}>
            {user?.email}
          </div>
          {profile?.risk_score && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
              Perfil riesgo: <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{profile.risk_score}/10</span>
            </div>
          )}
          <button onClick={signOut} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: 56, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 24px', background: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <NotificationBell />
        </header>
        <main style={{ flex: 1, padding: '32px', maxWidth: 1200 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      Cargando...
    </div>
  );

  return (
    <Layout>
      <Routes>
        <Route path="/" element={
          user && profile?.academic_disclaimer_accepted && profile?.risk_score
            ? <Navigate to="/dashboard" replace />
            : <Landing />
        } />
        <Route path="/disclaimer"  element={user ? <AcademicDisclaimer /> : <Navigate to="/" replace />} />
        <Route path="/onboarding"  element={user ? <Onboarding /> : <Navigate to="/" replace />} />
        <Route path="/encuesta"    element={user ? <Survey /> : <Navigate to="/" replace />} />
        <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/trayectoria" element={<ProtectedRoute><LearningJourney /></ProtectedRoute>} />
        <Route path="/chat"        element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/glosario"    element={<ProtectedRoute><Glossary /></ProtectedRoute>} />
        <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/history"     element={<Navigate to="/trayectoria" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

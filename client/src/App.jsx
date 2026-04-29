import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Send,
  Settings,
  UserRound,
  UsersRound,
  X
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { api } from './lib/api.js';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';

const statusColors = {
  Applied: '#22A866',
  'In Progress': '#2E86F7',
  Interview: '#F59E0B',
  Offer: '#7357F6',
  Rejected: '#EF4444'
};

const emptyDashboard = {
  totals: { total: 0, inProgress: 0, interviews: 0, offers: 0 },
  byStatus: ['Applied', 'In Progress', 'Interview', 'Offer', 'Rejected'].map((status) => ({ status, count: 0, percent: 0 })),
  recent: [],
  upcoming: []
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="screen-loader">Loading JobTrack...</div>;

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <AuthPage mode="login" />} />
      <Route path="/register" element={session ? <Navigate to="/" replace /> : <AuthPage mode="register" />} />
      <Route
        path="/*"
        element={session ? <Shell session={session} /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

function AuthPage({ mode }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const isRegister = mode === 'register';

  async function submit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase environment variables are not configured yet.');
      }

      if (isRegister) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.fullName } }
        });
        if (authError) throw authError;

        if (!data.session) {
          setNotice('Account created. Please check your email and confirm your address before logging in.');
          return;
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        });
        if (authError) throw authError;
      }

      navigate('/');
    } catch (err) {
      setError(formatAuthError(err.message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">
          <BriefcaseBusiness size={28} />
          <div>
            <strong>Job<span>Track</span></strong>
            <small>Track. Manage. Land.</small>
          </div>
        </div>
        <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <p>{isRegister ? 'Start organizing every opportunity in one focused workspace.' : 'Sign in to continue tracking your job search.'}</p>
        <form onSubmit={submit}>
          {isRegister && (
            <label>
              Full name
              <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
            </label>
          )}
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          {error && <div className="form-error">{error}</div>}
          {notice && <div className="form-notice">{notice}</div>}
          <button className="primary-button" disabled={busy}>{busy ? 'Please wait...' : isRegister ? 'Create Account' : 'Log In'}</button>
        </form>
        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'New to JobTrack?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create account'}</Link>
        </p>
      </section>
    </main>
  );
}

function Shell({ session }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.getMe(session).then((data) => setProfile(data.profile)).catch(() => setProfile(null));
  }, [session]);

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-area">
        <Topbar profile={profile} email={session.user.email} onMenu={() => setMenuOpen(true)} onLogout={logout} />
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard session={session} profile={profile} />} />
            <Route path="/applications" element={<ApplicationsPage session={session} />} />
            <Route path="/calendar" element={<CalendarPage session={session} />} />
            <Route path="/settings" element={<SettingsPage session={session} profile={profile} onProfile={setProfile} />} />
            <Route path="*" element={<PlaceholderPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ open, onClose }) {
  const location = useLocation();
  const links = [
    ['/', LayoutDashboard, 'Dashboard'],
    ['/applications', BriefcaseBusiness, 'Applications'],
    ['/calendar', CalendarDays, 'Calendar'],
    ['/tasks', ClipboardCheck, 'Tasks'],
    ['/companies', Building2, 'Companies'],
    ['/contacts', UsersRound, 'Contacts'],
    ['/documents', FileText, 'Documents'],
    ['/analytics', BarChart3, 'Analytics'],
    ['/settings', Settings, 'Settings']
  ];

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <button className="mobile-close" onClick={onClose}><X size={18} /></button>
        <div className="brand">
          <div className="brand-icon"><BriefcaseBusiness size={25} /></div>
          <div>
            <strong>Job<span>Track</span></strong>
            <small>Track. Manage. Land.</small>
          </div>
        </div>
        <nav>
          {links.map(([href, Icon, label]) => {
            const active = location.pathname === href;
            return (
              <Link className={active ? 'active' : ''} to={href} key={href} onClick={onClose}>
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-card">
          <BarChart3 size={54} />
          <strong>Keep tracking!</strong>
          <span>You're doing great.</span>
          <Link to="/analytics">View Analytics</Link>
        </div>
      </aside>
      {open && <button className="overlay" onClick={onClose} aria-label="Close menu" />}
    </>
  );
}

function Topbar({ profile, email, onMenu, onLogout }) {
  const now = new Date();
  return (
    <header className="topbar">
      <button className="icon-button menu-button" onClick={onMenu}><Menu size={22} /></button>
      <div className="topbar-meta">
        <span><Clock3 size={20} /> {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
        <span><CalendarDays size={20} /> {now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
      <div className="profile-pill">
        <div className="avatar">{initials(profile?.full_name || email)}</div>
        <div>
          <strong>{profile?.full_name || 'JobTrack User'}</strong>
          <small>{email}</small>
        </div>
        <ChevronDown size={18} />
        <button className="logout-button" onClick={onLogout} title="Log out"><LogOut size={17} /></button>
      </div>
    </header>
  );
}

function Dashboard({ session, profile }) {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDashboard(session).then(setDashboard).catch((err) => setError(err.message));
  }, [session]);

  const chartData = dashboard.byStatus.filter((item) => item.count > 0);

  return (
    <div className="dashboard">
      <div className="page-title">
        <div>
          <h1>Welcome back, {firstName(profile?.full_name) || 'there'}!</h1>
          <p>Stay organized and keep tracking your dream job.</p>
        </div>
        <Link className="primary-button with-icon" to="/applications"><Plus size={18} /> Add Application</Link>
      </div>
      {error && <div className="form-error">{error}</div>}
      <section className="stats-grid">
        <StatCard icon={FileText} label="Total Applications" value={dashboard.totals.total} hint="+ this month" color="green" />
        <StatCard icon={Send} label="In Progress" value={dashboard.totals.inProgress} hint="Active opportunities" color="blue" />
        <StatCard icon={Clock3} label="Interviews" value={dashboard.totals.interviews} hint="Scheduled steps" color="amber" />
        <StatCard icon={CheckCircle2} label="Offers" value={dashboard.totals.offers} hint="Strong outcomes" color="purple" />
      </section>
      <section className="dashboard-grid">
        <RecentApplications rows={dashboard.recent} />
        <div className="side-stack">
          <Panel title="Application Status">
            <div className="status-chart">
              <ResponsiveContainer width="42%" height={190}>
                <PieChart>
                  <Pie data={chartData.length ? chartData : [{ status: 'Empty', count: 1 }]} dataKey="count" innerRadius={52} outerRadius={78} paddingAngle={2}>
                    {(chartData.length ? chartData : [{ status: 'Empty' }]).map((entry) => (
                      <Cell key={entry.status} fill={statusColors[entry.status] || '#E5E7EB'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-total"><strong>{dashboard.totals.total}</strong><span>Total</span></div>
              <div className="legend">
                {dashboard.byStatus.map((item) => (
                  <div key={item.status}><span style={{ background: statusColors[item.status] }} />{item.status}<b>{item.count} ({item.percent}%)</b></div>
                ))}
              </div>
            </div>
          </Panel>
          <Panel title="Upcoming" action="View calendar" href="/calendar">
            <UpcomingList items={dashboard.upcoming} />
          </Panel>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, color }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${color}`}><Icon size={30} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </article>
  );
}

function RecentApplications({ rows }) {
  return (
    <Panel title="Recent Applications" action="View all" href="/applications" className="recent-panel">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Position</th>
              <th>Status</th>
              <th>Applied</th>
              <th>Next Step</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td><CompanyLogo name={row.company} /> {row.company}</td>
                <td>{row.position}</td>
                <td><StatusBadge status={row.status} /></td>
                <td>{formatDate(row.applied_date)}</td>
                <td>{row.next_step_title || '-'}<small>{formatDateTime(row.next_step_date)}</small></td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan="5" className="empty-table">No applications yet. Add your first opportunity to see it here.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ApplicationsPage({ session }) {
  const [applications, setApplications] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  async function refresh() {
    try {
      setApplications(await api.listApplications(session));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, [session]);

  async function remove(id) {
    await api.deleteApplication(id, session);
    refresh();
  }

  return (
    <div>
      <div className="page-title compact">
        <div>
          <h1>Applications</h1>
          <p>Track companies, roles, statuses, and next steps.</p>
        </div>
        <button className="primary-button with-icon" onClick={() => setEditing({})}><Plus size={18} /> Add Application</button>
      </div>
      {error && <div className="form-error">{error}</div>}
      <Panel>
        <div className="search-row"><Search size={18} /><span>{applications.length} tracked applications</span></div>
        <div className="cards-list">
          {applications.map((item) => (
            <article className="application-card" key={item.id}>
              <CompanyLogo name={item.company} />
              <div>
                <strong>{item.company}</strong>
                <span>{item.position}</span>
              </div>
              <StatusBadge status={item.status} />
              <span>{formatDate(item.applied_date)}</span>
              <span>{item.next_step_title || 'No next step'}</span>
              <div className="row-actions">
                <button onClick={() => setEditing(item)}>Edit</button>
                <button onClick={() => remove(item.id)}>Delete</button>
              </div>
            </article>
          ))}
          {!applications.length && <div className="empty-state">No applications yet. Use Add Application to create one.</div>}
        </div>
      </Panel>
      {editing && <ApplicationModal initial={editing} session={session} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </div>
  );
}

function ApplicationModal({ initial, session, onClose, onSaved }) {
  const [form, setForm] = useState({
    company: initial.company || '',
    position: initial.position || '',
    status: initial.status || 'Applied',
    applied_date: initial.applied_date || new Date().toISOString().slice(0, 10),
    next_step_title: initial.next_step_title || '',
    next_step_date: initial.next_step_date ? initial.next_step_date.slice(0, 16) : '',
    notes: initial.notes || ''
  });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    const payload = {
      ...form,
      next_step_title: form.next_step_title || null,
      next_step_date: form.next_step_date ? new Date(form.next_step_date).toISOString() : null,
      notes: form.notes || null
    };

    try {
      if (initial.id) await api.updateApplication(initial.id, payload, session);
      else await api.createApplication(payload, session);
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <h2>{initial.id ? 'Edit Application' : 'Add Application'}</h2>
          <button type="button" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="form-grid">
          <label>Company<input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} required /></label>
          <label>Position<input value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} required /></label>
          <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{Object.keys(statusColors).map((status) => <option key={status}>{status}</option>)}</select></label>
          <label>Applied date<input type="date" value={form.applied_date} onChange={(event) => setForm({ ...form, applied_date: event.target.value })} /></label>
          <label>Next step<input value={form.next_step_title} onChange={(event) => setForm({ ...form, next_step_title: event.target.value })} /></label>
          <label>Next step date<input type="datetime-local" value={form.next_step_date} onChange={(event) => setForm({ ...form, next_step_date: event.target.value })} /></label>
        </div>
        <label>Notes<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="primary-button">Save Application</button>
      </form>
    </div>
  );
}

function CalendarPage({ session }) {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  useEffect(() => {
    api.getDashboard(session).then(setDashboard).catch(() => setDashboard(emptyDashboard));
  }, [session]);

  return (
    <div>
      <div className="page-title compact"><div><h1>Calendar</h1><p>Upcoming interviews, screens, and follow-ups.</p></div></div>
      <Panel><UpcomingList items={dashboard.upcoming} /></Panel>
    </div>
  );
}

function SettingsPage({ session, profile, onProfile }) {
  const [name, setName] = useState(profile?.full_name || '');
  const [message, setMessage] = useState('');

  useEffect(() => setName(profile?.full_name || ''), [profile]);

  async function submit(event) {
    event.preventDefault();
    const updated = await api.updateMe({ full_name: name, avatar_url: profile?.avatar_url || null }, session);
    onProfile(updated);
    setMessage('Profile updated.');
  }

  return (
    <div>
      <div className="page-title compact"><div><h1>Settings</h1><p>Manage your JobTrack profile.</p></div></div>
      <Panel>
        <form className="settings-form" onSubmit={submit}>
          <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
          <button className="primary-button">Save Settings</button>
          {message && <span className="success-message">{message}</span>}
        </form>
      </Panel>
    </div>
  );
}

function PlaceholderPage() {
  return (
    <div>
      <div className="page-title compact"><div><h1>Coming Soon</h1><p>This section is ready for the next iteration.</p></div></div>
      <Panel><div className="empty-state">The main tracking workflow is available in Dashboard, Applications, Calendar, and Settings.</div></Panel>
    </div>
  );
}

function Panel({ title, action, href, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <div className="panel-head">
          {title && <h2>{title}</h2>}
          {action && <Link to={href}>{action}</Link>}
        </div>
      )}
      {children}
    </section>
  );
}

function UpcomingList({ items }) {
  if (!items.length) return <div className="empty-state">No upcoming steps yet.</div>;
  return (
    <div className="upcoming-list">
      {items.map((item) => (
        <article key={item.id}>
          <div className="date-icon"><CalendarDays size={18} /></div>
          <div>
            <strong>{item.next_step_title}</strong>
            <span>{item.company} - {item.position}</span>
          </div>
          <time>{formatDateTime(item.next_step_date)}</time>
        </article>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className="status-badge" style={{ color: statusColors[status], background: `${statusColors[status]}1A` }}>{status}</span>;
}

function CompanyLogo({ name }) {
  return <span className="company-logo">{name?.charAt(0)?.toUpperCase() || '?'}</span>;
}

function firstName(name) {
  return name?.split(' ')?.[0];
}

function formatAuthError(message = '') {
  if (message.toLowerCase().includes('rate limit')) {
    return 'Supabase email rate limit exceeded. For local testing, disable Confirm Email in Supabase Auth settings or wait before trying again.';
  }

  return message;
}

function initials(value) {
  return value?.split(/[ @.]/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'JS';
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default App;

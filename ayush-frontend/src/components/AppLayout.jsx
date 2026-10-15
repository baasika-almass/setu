import { useState } from "react";
import { NavLink, Outlet, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  FlaskConical,
  ListTree,
  BookOpen,
  FileText,
  Settings,
  Home,
  Mail,
  Menu,
  X,
  Search,
  LogOut,
} from "lucide-react";
import { searchTerms } from "../pages/sandbox/diagnosisSearch.js";
import { API_ENABLED, getToken, getDoctor, signOut } from "../lib/api.js";
import "./AppLayout.css";

const MAIN_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/patients", label: "Patients", icon: Users },
  { to: "/sandbox", label: "EMR Sandbox", icon: FlaskConical },
  { to: "/dashboard/api-logs", label: "API Logs", icon: ListTree },
  { to: "/api-docs", label: "API Docs", icon: BookOpen },
  { to: "/dashboard/reports", label: "Reports", icon: FileText },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const PAGE_LINKS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/contact", label: "Contact", icon: Mail },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [lastPath, setLastPath] = useState(location.pathname);

  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setOpen(false);
  }

  const navigate = useNavigate();

  if (API_ENABLED && !getToken()) return <Navigate to="/signin" replace />;

  const doctor = getDoctor();
  const doctorName = doctor?.name ?? "Dr. Ramesh Iyer";
  const initials = doctorName.replace(/^Dr\.?\s*/i, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  function handleSignOut() {
    signOut();
    navigate("/signin");
  }

  const results = query.trim() ? searchTerms(query).slice(0, 6) : [];

  return (
    <div className="shell">
      <aside className={"shell-side" + (open ? " is-open" : "")}>
        <Link to="/dashboard" className="shell-brand">
          <HeartPulse size={22} strokeWidth={2.2} />
          <span>SETU</span>
        </Link>

        <p className="shell-group">Main</p>
        <nav className="shell-nav" aria-label="Main">
          {MAIN_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => "shell-link" + (isActive ? " is-active" : "")}
            >
              <Icon size={17} strokeWidth={1.9} />
              {label}
            </NavLink>
          ))}
        </nav>

        <p className="shell-group">Pages</p>
        <nav className="shell-nav" aria-label="Site pages">
          {PAGE_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="shell-link">
              <Icon size={17} strokeWidth={1.9} />
              {label}
            </NavLink>
          ))}
          <button type="button" className="shell-link shell-signout" onClick={handleSignOut}>
            <LogOut size={17} strokeWidth={1.9} />
            Sign out
          </button>
        </nav>

        <div className="shell-status">
          <p>System status</p>
          <span><i className="dot dot-ok" />NAMASTE API online</span>
          <span><i className="dot dot-ok" />EMR handshake active</span>
          <span><i className="dot dot-warn" />TM2 latency 180ms</span>
        </div>
      </aside>

      {open && <button className="shell-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="shell-main">
        <header className="shell-top">
          <button
            type="button"
            className="shell-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="shell-search">
            <Search size={16} strokeWidth={2} />
            <input
              type="text"
              placeholder="Look up a diagnosis term or code"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-label="Look up a diagnosis term or code"
            />
            {focused && query.trim() && (
              <ul className="shell-search-list">
                {results.length === 0 && <li className="shell-search-empty">No matching term</li>}
                {results.map((r) => (
                  <li key={r.system + r.namasteCode}>
                    <strong>{r.term}</strong>
                    <span>{r.system}</span>
                    <code>{r.namasteCode}</code>
                    <code>{r.icdCode}</code>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="shell-user">
            <span className="shell-avatar">{initials}</span>
            <span className="shell-user-name">{doctorName}</span>
          </div>
        </header>

        <main className="shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

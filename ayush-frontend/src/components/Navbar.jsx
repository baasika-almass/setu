import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Menu, X } from "lucide-react";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/api-docs", label: "API Docs" },
  { to: "/sandbox", label: "EMR Sandbox" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function goTo(path) {
    setMenuOpen(false);
    navigate(path);
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="navbar-mark" aria-hidden="true">
            <ShieldCheck size={16} strokeWidth={2.2} />
          </span>
          <span className="navbar-name">
            NAMASTE <span className="navbar-name-light">Connect</span>
          </span>
        </NavLink>

        <nav className="navbar-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => "navbar-link" + (isActive ? " is-active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <NavLink to="/api-docs" className="navbar-portal-link">
            Developer Portal
          </NavLink>
          <button className="navbar-cta" onClick={() => goTo("/signin")}>
            Launch Console
          </button>
        </div>

        <button
          type="button"
          className="navbar-menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="navbar-mobile-panel" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => "navbar-mobile-link" + (isActive ? " is-active" : "")}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/api-docs" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
            Developer Portal
          </NavLink>
          {location.pathname !== "/signin" && (
            <button className="navbar-cta navbar-mobile-cta" onClick={() => goTo("/signin")}>
              Launch Console
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

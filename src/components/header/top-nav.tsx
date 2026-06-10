import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../app/auth/hooks/use-auth";
import { landingForRole } from "../../utilities/rbac";
import { roleNavigation } from "../sidebar/side-nav";
import { Logo } from "../static/logo";

export function TopNav() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const publicLinks = [
    { to: "/product", label: "Product" },
    { to: "/hospitals", label: "For hospitals" },
    { to: "/security", label: "Security" },
    { to: "/pricing", label: "Pricing" }
  ];
  const navLinks = user ? roleNavigation[user.role].map((item) => ({ to: item.to, label: item.label })) : publicLinks;

  const close = () => setOpen(false);

  return (
    <header className="top-nav">
      <Link to={user ? landingForRole[user.role] : "/"} className="brand-link" onClick={close}><Logo /></Link>
      <button className="menu-button" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label="Open navigation">
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
      <nav className={open ? "open" : ""}>
        {navLinks.map((link) => (
          <NavLink key={link.to} to={link.to} onClick={close}>{link.label}</NavLink>
        ))}
      </nav>
      {user ? (
        <button className="ghost-button account-button" onClick={() => { close(); logout(); }} title="Sign out">
          <LogOut size={18} /> {user.name}
        </button>
      ) : (
        <Link className="primary-button nav-cta" to="/signin" onClick={close}>Sign in</Link>
      )}
    </header>
  );
}

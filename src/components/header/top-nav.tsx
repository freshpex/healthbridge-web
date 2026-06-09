import { Link, NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../app/auth/hooks/use-auth";
import { Logo } from "../static/logo";

export function TopNav() {
  const { user, logout } = useAuth();
  return (
    <header className="top-nav">
      <Link to="/" className="brand-link"><Logo /></Link>
      <nav>
        <NavLink to="/patient">Patient</NavLink>
        <NavLink to="/hospital">Hospital</NavLink>
        <NavLink to="/doctor">Doctor</NavLink>
        <NavLink to="/emergency">Emergency</NavLink>
      </nav>
      {user ? (
        <button className="ghost-button" onClick={logout} title="Sign out">
          <LogOut size={18} /> {user.name}
        </button>
      ) : (
        <Link className="primary-button" to="/signin">Sign in</Link>
      )}
    </header>
  );
}

import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  LogOut,
  Layers,        // Aggregator
  Building2,     // Lender Branch
  Wrench,        // Field Engineer
  Warehouse,     // Warehouse
  Cpu,           // Device
  Move,          // Device Movement
  MapPin,        // Vehicle List
  List           // Vehicle Tracking
} from "lucide-react";
import "./Sidebar.css";

/* Brand assets */
import xconicsMini from "../assets/xconics mini logo.jpeg";
import xconicsText from "../assets/Xconics_logo_blue (3).png";

export default function Sidebar({ isOpen, isMobile, closeSidebar }) {
  const user = {
    name: "Lisa Roy",
    role: "Designer",
  };

  const handleNavClick = () => {
    if (isMobile) closeSidebar();
  };

  return (
    <aside
      className={`sidebar ${isOpen ? "open" : "collapsed"} ${
        isMobile ? "mobile" : ""
      }`}
    >
      {/* ===== BRAND ===== */}
      <div className="brand">
        <img src={xconicsMini} alt="Xconics" className="brand-icon" />
        {isOpen && (
          <img
            src={xconicsText}
            alt="Xconics"
            className="brand-text-logo"
          />
        )}
      </div>

      {/* ===== NAV ===== */}
      <nav className="nav">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
          onClick={handleNavClick}
        >
          <span className="nav-icon">
            <Home size={20} strokeWidth={1.8} />
          </span>
          {isOpen && <span className="nav-label">Dashboard</span>}
        </NavLink>

        {/* Lender */}
        <NavLink
          to="/lenders"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
          onClick={handleNavClick}
        >
          <span className="nav-icon">
            <Users size={20} strokeWidth={1.8} />
          </span>
          {isOpen && <span className="nav-label">Lender</span>}
        </NavLink>

        {/* Aggregator */}
        <NavLink
          to="/aggregators"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
          onClick={handleNavClick}
        >
          <span className="nav-icon">
            <Layers size={20} strokeWidth={1.8} />
          </span>
          {isOpen && <span className="nav-label">Aggregator</span>}
        </NavLink>

        {/* Field Engineer */}
        <NavLink
          to="/engineers"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
          onClick={handleNavClick}
        >
          <span className="nav-icon">
            <Wrench size={20} strokeWidth={1.8} />
          </span>
          {isOpen && <span className="nav-label">Field Engineer</span>}
        </NavLink>

        {/* Warehouse */}
        <NavLink
          to="/warehouse"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
          onClick={handleNavClick}
        >
          <span className="nav-icon">
            <Warehouse size={20} strokeWidth={1.8} />
          </span>
          {isOpen && <span className="nav-label">Warehouse</span>}
        </NavLink>

        {/* Devices */}
        <NavLink
          to="/devices"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
          onClick={handleNavClick}
        >
          <span className="nav-icon">
            <Cpu size={20} strokeWidth={1.8} />
          </span>
          {isOpen && <span className="nav-label">Devices</span>}
        </NavLink>

        {/* Device Movement */}
        <NavLink
          to="/device-movement"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
          onClick={handleNavClick}
        >
          <span className="nav-icon">
            <Move size={20} strokeWidth={1.8} />
          </span>
          {isOpen && <span className="nav-label">Device Movement</span>}
        </NavLink>

        {/* Lender Branch */}
        <NavLink
          to="/lender-branches"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
          onClick={handleNavClick}
        >
          <span className="nav-icon">
            <Building2 size={20} strokeWidth={1.8} />
          </span>
          {isOpen && <span className="nav-label">Lender Branch</span>}
        </NavLink>

        {/* Vehicle List */}
        <NavLink
          to="/tracker"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
          onClick={handleNavClick}
        >
          <span className="nav-icon">
            <MapPin size={20} strokeWidth={1.8} />
          </span>
          {isOpen && <span className="nav-label">Vehicle List</span>}
        </NavLink>

        {/* Vehicle Tracking */}
        <NavLink
          to="/vehicle-tracking"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
          onClick={handleNavClick}
        >
          <span className="nav-icon">
            <List size={20} strokeWidth={1.8} />
          </span>
          {isOpen && <span className="nav-label">Vehicle Tracking</span>}
        </NavLink>
      </nav>

      {/* ===== FOOTER ===== */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="profile-avatar">
            {user.name.charAt(0)}
          </div>

          {isOpen && (
            <div className="user-text">
              <strong>{user.name}</strong>
              <p>{user.role}</p>
            </div>
          )}
        </div>

        {isOpen && (
          <button className="signout-btn" aria-label="Sign out">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}

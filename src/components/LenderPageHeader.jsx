import { Link } from "react-router-dom";
import "./LenderPageHeader.css";
import headerImage from "../assets/Xconics_logo_blue (3).png";

export default function LenderPageHeader({
  title = "Lender Master",
  breadcrumbLabel = "Lender",
}) {
  return (
    <div className="card lender-header-card">
      <div className="lender-header-content">
        {/* LEFT */}
        <div>
          <h2 className="lender-title">{title}</h2>

          <p className="lender-breadcrumb">
            <Link to="/" className="breadcrumb-home">
              Home
            </Link>
            <span className="breadcrumb-separator">&gt;</span>
            <span>{breadcrumbLabel}</span>
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <img
          src={headerImage}
          alt="Header"
          className="lender-header-image"
        />
      </div>
    </div>
  );
}

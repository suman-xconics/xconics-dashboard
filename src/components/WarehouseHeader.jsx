import { Link } from "react-router-dom";
import "./WarehouseHeader.css";

// Right-side image
import headerImage from "../assets/Xconics_logo_blue (3).png";

export default function WarehouseHeader() {
  return (
    <div className="card wh-header-card">
      <div className="wh-header-content">
        {/* LEFT */}
        <div>
          <h2 className="wh-title">Warehouse Master</h2>

          <p className="wh-breadcrumb">
            <Link to="/" className="breadcrumb-home">
              Home
            </Link>
            <span className="breadcrumb-separator">•</span>
            <span>Warehouse</span>
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <img
          src={headerImage}
          alt="Warehouse header"
          className="wh-header-image"
        />
      </div>
    </div>
  );
}

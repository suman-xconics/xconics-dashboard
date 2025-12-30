import { Link } from "react-router-dom";
import "./FieldEngineerHeader.css";

// Right-side image
import headerImage from "../assets/Xconics_logo_blue (3).png";

export default function FieldEngineerPageHeader() {
  return (
    <div className="card fe-header-card">
      <div className="fe-header-content">
        {/* LEFT */}
        <div>
          <h2 className="fe-title">Field Engineer Master</h2>

          <p className="fe-breadcrumb">
            <Link to="/" className="breadcrumb-home">
              Home
            </Link>
            <span className="breadcrumb-separator">•</span>
            <span>Field Engineer</span>
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <img
          src={headerImage}
          alt="Field Engineer header"
          className="fe-header-image"
        />
      </div>
    </div>
  );
}

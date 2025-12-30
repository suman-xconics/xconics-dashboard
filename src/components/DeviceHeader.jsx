import { Link } from "react-router-dom";
import "./DeviceHeader.css";

// Right-side image
import headerImage from "../assets/Xconics_logo_blue (3).png";

export default function DeviceHeader() {
    return (
        <div className="card device-header-card">
            <div className="device-header-content">
                {/* LEFT */}
                <div>
                    <h2 className="device-title">Device Master</h2>

                    <p className="device-breadcrumb">
                        <Link to="/" className="breadcrumb-home">
                            Home
                        </Link>
                        <span className="breadcrumb-separator">•</span>
                        <span>Device</span>
                    </p>
                </div>

                {/* RIGHT IMAGE */}
                <img
                    src={headerImage}
                    alt="Device header"
                    className="device-header-image"
                />
            </div>
        </div>
    );
}
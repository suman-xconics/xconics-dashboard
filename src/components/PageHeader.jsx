import { Link } from "react-router-dom";
import "./PageHeader.css";

export default function PageHeader({ title }) {
    return (
        <div className="page-header">
            {/* LEFT */}
            <div className="page-header-left">
                <h2 className="page-title">{title}</h2>

                <div className="breadcrumb">
                    <Link to="/" className="breadcrumb-link">
                        Home
                    </Link>
                    <span className="breadcrumb-dot">•</span>
                    <span className="breadcrumb-current">{title}</span>
                </div>
            </div>

            {/* RIGHT (decorative illustration placeholder) */}
            <div className="page-header-right">
                <div className="page-illustration">
                    <div className="illustration-star"></div>
                </div>
            </div>
        </div>
    );
}
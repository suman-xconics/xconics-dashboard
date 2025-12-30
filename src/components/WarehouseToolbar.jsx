import { useNavigate } from "react-router-dom";
import "./WarehouseToolbar.css";

export default function WarehouseToolbar() {
  const navigate = useNavigate();

  return (
    <div className="wh-toolbar-wrapper">
      <div className="wh-toolbar">
        {/* Search */}
        <div className="wh-search">
          <img
            src="https://img.icons8.com/ios/50/search--v1.png"
            alt="search"
          />
          <input placeholder="Search here" />
        </div>

        {/* Add Warehouse */}
        <button
          className="add-more-btn"
          onClick={() => navigate("/warehouse/create")}
        >
          + Add Warehouse
        </button>
      </div>
    </div>
  );
}

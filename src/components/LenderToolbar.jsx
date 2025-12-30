import { useNavigate } from "react-router-dom";
import "./LenderToolbar.css";

export default function LenderToolbar({
  searchPlaceholder = "Search here",
  addButtonLabel = "Add More",
  addRoute = "/lenders/add",
}) {
  const navigate = useNavigate();

  return (
    <div className="lender-toolbar-wrapper">
      <div className="lender-toolbar">
        {/* Search */}
        <div className="lender-search">
          <img
            src="https://img.icons8.com/ios/50/search--v1.png"
            alt="search"
          />
          <input placeholder={searchPlaceholder} />
        </div>

        {/* Add Button */}
        <button
          className="add-more-btn"
          onClick={() => navigate(addRoute)}
        >
          + {addButtonLabel}
        </button>
      </div>
    </div>
  );
}

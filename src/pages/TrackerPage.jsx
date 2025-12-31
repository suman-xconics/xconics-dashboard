import { useNavigate } from "react-router-dom";
import { Map } from "lucide-react";

export default function TrackerPage() {
  const navigate = useNavigate();

  const vehicles = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    vehicleNo: `WB-12-AB-${1000 + i}`,
    status: i % 2 === 0 ? "Active" : "Inactive",
  }));

  return (
    <div className="lender-page">
      {/* PAGE HEADER (NO IMAGE) */}
      <div className="card">
        <h2 className="text">Vehicle Tracker</h2>
      </div>

      {/* TOOLBAR */}
      <div className="card toolbar">
        <input
          type="text"
          placeholder="Search vehicle number..."
          className="search-input"
        />
        <button>Add More</button>
      </div>

      {/* TABLE */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle Number</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{v.vehicleNo}</td>
                <td>
                  <span
                    style={{
                      color: v.status === "Active" ? "green" : "red",
                      fontWeight: 500,
                    }}
                  >
                    {v.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => navigate(`/tracker/map/${v.vehicleNo}`)}
                    style={{ background: "none" }}
                  >
                    <Map size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

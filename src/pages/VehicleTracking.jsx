export default function VehicleTracking() {
  const vehicles = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    vehicleNo: `WB-10-XY-${2000 + i}`,
    location: "Kolkata, WB",
    latitude: (22.5726 + i * 0.001).toFixed(6),
    longitude: (88.3639 + i * 0.001).toFixed(6),
    updatedAt: "Just now",
  }));

  return (
    <div className="lender-page">
      {/* PAGE HEADER */}
      <div className="card">
        <h2 className="text">Vehicle Tracking</h2>
      </div>

      {/* TOOLBAR */}
      <div className="card toolbar">
        <input
          type="text"
          placeholder="Search vehicle number..."
          className="search-input"
        />
        <button>Add Vehicle</button>
      </div>

      {/* TABLE */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle Number</th>
              <th>Current Location</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Last Updated</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{v.vehicleNo}</td>
                <td>{v.location}</td>
                <td>{v.latitude}</td>
                <td>{v.longitude}</td>
                <td>{v.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useParams } from "react-router-dom";

export default function TrackerMap() {
  const { vehicleNo } = useParams();

  return (
    <div className="lender-page">
      <div className="card">
        <h2 className="text">Live Map</h2>
        <p>Vehicle Number: <strong>{vehicleNo}</strong></p>

        <div
          style={{
            height: "400px",
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "1rem",
          }}
        >
          Map Placeholder
        </div>
      </div>
    </div>
  );
}

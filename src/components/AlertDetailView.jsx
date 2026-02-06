import React, { useState } from "react";
import {
  ArrowLeft,
  Car,
  AlertTriangle,
  ShieldCheck,
  Power,
  ChevronDown,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const AlertDetailView = ({ vehicle, onBack }) => {
  const [showHistory, setShowHistory] = useState(false);

  if (!vehicle) return null;

  const position = vehicle.coords
    ? vehicle.coords.split(",").map(Number)
    : [12.9716, 77.5946];

  const ignitionEvent = {
    state: "ON",
    time: vehicle.time,
  };

  const ignitionHistory = [
    { id: 1, state: "ON", time: "02 Feb 2026, 10:10" },
    { id: 2, state: "OFF", time: "02 Feb 2026, 09:45" },
    { id: 3, state: "ON", time: "02 Feb 2026, 09:10" },
  ];

  return (
    <div style={styles.page}>
      {/* BACK */}
      <button onClick={onBack} style={styles.backBtn}>
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.carIcon}>
            <Car size={28} />
          </div>
          <div>
            <h1 style={styles.title}>Vehicle : {vehicle.vehicle}</h1>
            <p style={styles.imei}>IMEI : {vehicle.imei}</p>
          </div>
        </div>

        <span style={styles.systemBadge}>System Online</span>
      </div>

      {/* MAIN GRID */}
      <div style={styles.mainGrid}>
        {/* LEFT PANEL */}
        <div style={styles.leftPanel}>
          <div style={styles.bgIcon}>
            <AlertTriangle size={240} />
          </div>

          <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
            <div style={styles.alertTag}>
              <AlertTriangle size={18} />
              <span>Alert Triggered</span>
            </div>

            <h2 style={styles.alertTitle}>{vehicle.type} Alert</h2>

            <div style={styles.detailGroup}>
              <DetailRow label="Alert Time" value={vehicle.time} />
              <DetailRow label="Location" value={vehicle.coords} />
              <DetailRow label="Status" value={vehicle.status} isStatus />
            </div>

            <div style={styles.ignitionBox}>
              <div style={styles.ignitionHeader}>
                <Power size={16} color="#2563eb" />
                <span style={styles.ignitionLabel}>Ignition Event</span>
              </div>

              <div style={styles.ignitionRow}>
                <span style={styles.ignitionText}>
                  Ignition {ignitionEvent.state}
                </span>
                <span style={styles.ignitionTime}>
                  {ignitionEvent.time}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowHistory(!showHistory)}
              style={styles.historyBtn}
            >
              <ChevronDown
                size={14}
                style={{
                  transform: showHistory ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
              View Ignition History (optional)
            </button>

            {showHistory && (
              <div style={{ marginTop: 16 }}>
                {ignitionHistory.map((item) => (
                  <div key={item.id} style={styles.historyItem}>
                    <span>Ignition {item.state}</span>
                    <span style={styles.historyTime}>{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTION */}
          <button style={styles.resolveBtn}>
            <ShieldCheck size={18} />
            Resolve Alert
          </button>
        </div>

        {/* RIGHT MAP */}
        <div style={styles.mapWrapper}>
          <MapContainer
            center={position}
            zoom={13}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position}>
              <Popup minWidth={200}>
                <div>
                  <div style={styles.popupTitle}>Alert Location</div>
                  <div style={styles.popupVehicle}>{vehicle.vehicle}</div>
                  <div style={styles.popupCoords}>{vehicle.coords}</div>
                </div>
              </Popup>
            </Marker>

            <ZoomControl position="bottomright" />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, isStatus }) => (
  <div style={styles.detailRow}>
    <span style={styles.detailLabel}>{label}</span>
    <span
      style={{
        ...styles.detailValue,
        color: isStatus ? "#dc2626" : "#7f1d1d",
      }}
    >
      {value}
    </span>
  </div>
);

/* INLINE STYLES */

const styles = {
  page: { background: "#F8FAFD", minHeight: "100vh", padding: 32 },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#64748b",
    fontWeight: 700,
    marginBottom: 32,
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  header: {
    background: "#fff",
    padding: 24,
    borderRadius: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #e2e8f0",
    marginBottom: 32,
  },
  headerLeft: { display: "flex", gap: 24, alignItems: "center" },
  carIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: 900, textTransform: "uppercase" },
  imei: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 2,
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  systemBadge: {
    padding: "8px 16px",
    background: "#ecfdf5",
    color: "#059669",
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 900,
    textTransform: "uppercase",
    border: "1px solid #a7f3d0",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 32,
    minHeight: 550,
  },
  leftPanel: {
    background: "rgba(254,226,226,0.4)",
    borderRadius: 40,
    border: "2px solid #fee2e2",
    padding: 40,
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  bgIcon: {
    position: "absolute",
    top: -24,
    right: -24,
    opacity: 0.03,
    transform: "rotate(12deg)",
  },
  alertTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    background: "#dc2626",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 24,
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  alertTitle: {
    fontSize: 40,
    fontWeight: 900,
    color: "#dc2626",
    marginBottom: 40,
  },
  detailGroup: { marginBottom: 40 },
  detailRow: { display: "flex", gap: 16, marginBottom: 16 },
  detailLabel: {
    width: 112,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "rgba(127,29,29,0.4)",
  },
  detailValue: { fontSize: 14, fontWeight: 700 },
  ignitionBox: {
    background: "rgba(255,255,255,0.8)",
    borderRadius: 16,
    padding: 24,
    border: "1px solid #e2e8f0",
    marginBottom: 32,
  },
  ignitionHeader: { display: "flex", gap: 8, marginBottom: 8 },
  ignitionLabel: {
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#2563eb",
  },
  ignitionRow: { display: "flex", justifyContent: "space-between" },
  ignitionText: { fontSize: 14, fontWeight: 700 },
  ignitionTime: { fontSize: 12, color: "#64748b" },
  historyBtn: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    fontSize: 12,
    fontWeight: 700,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#475569",
  },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    background: "#fff",
    padding: "12px 20px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    marginBottom: 12,
    fontWeight: 700,
  },
  historyTime: { fontSize: 12, color: "#64748b" },
  resolveBtn: {
    marginTop: 40,
    background: "#2563eb",
    color: "#fff",
    padding: "20px 48px",
    borderRadius: 16,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 3,
    textTransform: "uppercase",
    display: "flex",
    gap: 12,
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  mapWrapper: {
    background: "#fff",
    borderRadius: 40,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
  },
  popupTitle: {
    fontSize: 10,
    fontWeight: 900,
    color: "#2563eb",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  popupVehicle: { fontSize: 14, fontWeight: 900, marginBottom: 4 },
  popupCoords: { fontSize: 12, fontFamily: "monospace" },
};

export default AlertDetailView;

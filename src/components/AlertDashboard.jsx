/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from "react";
import {
  Bell,
  AlertTriangle,
  Zap,
  ChevronDown,
  MapPin,
  Search,
  Calendar,
} from "lucide-react";
import AlertDetailView from "./AlertDetailView";

const AlertDashboard = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("Last 7 days");

  const alerts = [
    { id: 1, vehicle: "KA01AB1234", imei: "#29920198762", type: "Tamper", status: "Active", time: "02 Feb 2026, 10:21", coords: "12.9716, 77.5946" },
    { id: 2, vehicle: "LA011AB1235", imei: "#29920198763", type: "Power Cut", status: "Active", time: "02 Feb 2026, 10:21", coords: "12.9716, 77.5948" },
    { id: 3, vehicle: "KA011AB1234", imei: "#38920198761", type: "Tamper", status: "Resolved", time: "01 Feb 2026, 10:01", coords: "12.9716, 77.5948" },
    { id: 4, vehicle: "LA011AB1235", imei: "#29920198762", type: "Power Cut", status: "Resolved", time: "01 Feb 2026, 10:00", coords: "12.9716, 77.5948" },
  ];

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const s = searchTerm.toLowerCase();
      return (
        (a.vehicle.toLowerCase().includes(s) ||
          a.imei.toLowerCase().includes(s)) &&
        (typeFilter === "All Types" || a.type === typeFilter) &&
        (statusFilter === "All Status" || a.status === statusFilter)
      );
    });
  }, [searchTerm, typeFilter, statusFilter]);

  if (selectedAlert) {
    return (
      <div style={styles.page}>
        <AlertDetailView
          vehicle={selectedAlert}
          onBack={() => setSelectedAlert(null)}
        />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* METRICS */}
        <div style={styles.metricsGrid}>
          <MetricCard title="Active Alerts" count="04" icon={<Bell />} bg="#2563eb" />
          <MetricCard title="Tamper Alerts" count="02" icon={<AlertTriangle />} bg="#f97316" />
          <MetricCard title="Power Cut Alerts" count="02" icon={<Zap />} bg="#dc2626" />
        </div>

        {/* TABLE CARD */}
        <div style={styles.card}>

          {/* FILTER BAR */}
          {/* <div style={styles.filterBar}>
            <div style={styles.filterLeft}>
              <Dropdown label={typeFilter} options={["All Types","Tamper","Power Cut"]} />
              <Dropdown label={statusFilter} options={["All Status","Active","Resolved"]} />
              <Dropdown label={dateFilter} icon={<Calendar size={14} />} options={["Today","Yesterday","Last 7 days","Last 30 days"]} />
            </div>

            <div style={styles.searchBox}>
              <Search size={18} color="#94a3b8" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vehicle or IMEI"
                style={styles.searchInput}
              />
            </div>
          </div> */}

          {/* TABLE */}
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Vehicle Asset","Category","Status","Timestamp","Location","Action"].map(h=>(
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(row => (
                  <tr key={row.id} style={row.status==="Resolved"?styles.rowResolved:null}>
                    <td style={styles.td}>
                      <strong>{row.vehicle}</strong><br/>
                      <small>{row.imei}</small>
                    </td>
                    <td style={styles.td}>
                      {row.type==="Tamper"
                        ? <AlertTriangle size={16} color="#f97316" />
                        : <Zap size={16} color="#dc2626" />}
                      {" "}{row.type}
                    </td>
                    <td style={styles.td}>
                      <span style={row.status==="Active"?styles.badgeActive:styles.badgeResolved}>
                        {row.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>{row.time}</td>
                    <td style={{...styles.td,color:"#2563eb"}}>
                      <MapPin size={14}/> {row.coords}
                    </td>
                    <td style={{...styles.td,textAlign:"right"}}>
                      <button
                        disabled={row.status==="Resolved"}
                        style={row.status==="Resolved"?styles.btnDisabled:styles.btn}
                        onClick={()=>setSelectedAlert(row)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

/* SMALL COMPONENTS */

const MetricCard = ({ title, count, icon, bg }) => (
  <div style={styles.metricCard}>
    <div>
      <p style={styles.metricTitle}>{title}</p>
      <p style={styles.metricCount}>{count}</p>
    </div>
    <div style={{...styles.metricIcon, background:bg}}>
      {icon}
    </div>
  </div>
);

const Dropdown = ({ label, icon }) => (
  <button style={styles.dropdownBtn}>
    {icon} {label} <ChevronDown size={14} />
  </button>
);

/* INLINE STYLES */

const styles = {
  page:{background:"#f8fafc",minHeight:"100vh"},
  container:{padding:32},
  metricsGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:32,marginBottom:48},
  metricCard:{background:"#fff",padding:32,borderRadius:24,display:"flex",justifyContent:"space-between"},
  metricTitle:{fontSize:12,letterSpacing:2,color:"#94a3b8",textTransform:"uppercase"},
  metricCount:{fontSize:48,fontWeight:800},
  metricIcon:{width:64,height:64,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"},
  card:{background:"#fff",borderRadius:24,border:"1px solid #e2e8f0"},
  filterBar:{display:"flex",justifyContent:"space-between",padding:24,flexWrap:"wrap",gap:16},
  filterLeft:{display:"flex",gap:16,flexWrap:"wrap"},
  dropdownBtn:{padding:"12px 16px",borderRadius:12,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer"},
  searchBox:{display:"flex",alignItems:"center",gap:8,width:320},
  searchInput:{flex:1,padding:12,borderRadius:12,border:"1px solid #e2e8f0"},
  tableWrap:{overflowX:"auto",padding:24},
  table:{width:"100%",borderCollapse:"collapse"},
  th:{fontSize:12,color:"#94a3b8",padding:16,textAlign:"left"},
  td:{padding:16,verticalAlign:"middle"},
  rowResolved:{background:"#f8fafc"},
  badgeActive:{background:"#ffedd5",color:"#c2410c",padding:"4px 10px",borderRadius:999,fontSize:11},
  badgeResolved:{background:"#dcfce7",color:"#166534",padding:"4px 10px",borderRadius:999,fontSize:11},
  btn:{background:"#0f172a",color:"#fff",padding:"10px 18px",borderRadius:12,border:"none"},
  btnDisabled:{background:"#cbd5e1",color:"#475569",padding:"10px 18px",borderRadius:12,border:"none"}
};

export default AlertDashboard;

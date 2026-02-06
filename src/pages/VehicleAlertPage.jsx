import { useState } from "react";
import AlertDashboard from "../components/AlertDashboard";
import AlertDetailView from "../components/AlertDetailView";

export default function VehicleAlertPage() {
  const [selectedAlert, setSelectedAlert] = useState(null);

  return (
    <div className="vehicle-alert-scope bg-slate-50 min-h-screen">
      {/* 🔹 ONE SINGLE WIDTH CONTAINER FOR EVERYTHING */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">

        {/* HEADER */}
        

        {/* LIST VIEW */}
        {!selectedAlert && (
          <AlertDashboard onView={setSelectedAlert} />
        )}

        {/* DETAIL VIEW */}
        {selectedAlert && (
          <AlertDetailView
            vehicle={selectedAlert}
            onBack={() => setSelectedAlert(null)}
          />
        )}

      </div>
    </div>
  );
}

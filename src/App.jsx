import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import CreateUser from "./pages/CreateUser";

/* LENDER */
import LenderMaster from "./pages/LenderMaster";
import EditLender from "./pages/EditLender";
import AddLender from "./pages/AddLender";
import ViewLender from "./pages/ViewLender";

/* AGGREGATOR */
import AggregatorMaster from "./pages/AggregatorMaster";
import AddAggregator from "./pages/AddAggregator";
import EditAggregator from "./pages/EditAggregator";
import ViewAggregator from "./pages/ViewAggregator";

/* FIELD ENGINEER */
import FieldEngineerMaster from "./pages/FieldEngineerMaster";
import FieldEngineerForm from "./pages/FieldEngineerForm";
import EditFieldEngineer from "./pages/EditFieldEngineer";
import FieldEngineerDetail from "./pages/FieldEngineerDetail";

/* LENDER BRANCH */
import LenderBranchMaster from "./pages/LenderBranchMaster";
import EditLenderBranch from "./pages/EditLenderBranch";
import ViewLenderBranch from "./pages/ViewLenderBranch";

/* WAREHOUSE */
import WarehouseMaster from "./pages/WarehouseMaster";
import WarehouseDetail from "./pages/WarehouseDetail";
import CreateWarehouse from "./pages/CreateWarehouse";
import EditWarehouse from "./pages/EditWarehouse";

/* DEVICE */
import DeviceMaster from "./pages/DeviceMaster";
import AddDevice from "./pages/AddDevice";
import EditDevice from "./pages/EditDevice";
import DeviceDetail from "./pages/DeviceDetail";

/* ✅ DEVICE MOVEMENT */
import DeviceMovementMaster from "./pages/DeviceMovementMaster";
import CreateDeviceMovement from "./pages/CreateDeviceMovement";
import ReceiveDeviceMovement from "./pages/ReceiveDeviceMovement";
import DeviceMovementDetail from "./pages/DeviceMovementDetail";

/* TRACKER */
import TrackerPage from "./pages/TrackerPage";
import TrackerMap from "./pages/TrackerMap";

import VehicleTracking from "./pages/VehicleTracking";


import "./App.css";
import Footer from "./components/Footer";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        closeSidebar={closeSidebar}
      />

      {/* Main content */}
      <div className="main">
        <Header toggleSidebar={toggleSidebar} />

        <Routes>
          {/* ✅ DEFAULT REDIRECT */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* DASHBOARD */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* CREATE USER */}
          <Route path="/create-user" element={<CreateUser />} />


          {/* LENDER */}
          <Route path="/lenders" element={<LenderMaster />} />
          <Route path="/lenders/add" element={<AddLender />} />
          <Route path="/lenders/edit/:id" element={<EditLender />} />
          <Route path="/lenders/view/:id" element={<ViewLender />} />

          {/* AGGREGATOR */}
          <Route path="/aggregators" element={<AggregatorMaster />} />
          <Route path="/aggregators/add" element={<AddAggregator />} />
          <Route path="/aggregators/edit/:id" element={<EditAggregator />} />
          <Route path="/aggregators/view/:id" element={<ViewAggregator />} />

          {/* FIELD ENGINEER */}
          <Route path="/engineers" element={<FieldEngineerMaster />} />
          <Route path="/engineers/add" element={<FieldEngineerForm />} />
          <Route path="/engineers/edit/:id" element={<EditFieldEngineer />} />
          <Route path="/engineers/view/:id" element={<FieldEngineerDetail />} />

          {/* WAREHOUSE */}
          <Route path="/warehouse" element={<WarehouseMaster />} />
          <Route path="/warehouse/create" element={<CreateWarehouse />} />
          <Route path="/warehouse/edit/:id" element={<EditWarehouse />} />
          <Route path="/warehouse/view/:id" element={<WarehouseDetail />} />

          {/* LENDER BRANCH */}
          <Route path="/lender-branches" element={<LenderBranchMaster />} />
          <Route path="/lender-branches/add" element={<EditLenderBranch />} />
          <Route path="/lender-branches/edit/:id" element={<EditLenderBranch />} />
          <Route path="/lender-branches/view/:id" element={<ViewLenderBranch />} />

          {/* DEVICE */}
          <Route path="/devices" element={<DeviceMaster />} />
          <Route path="/devices/add" element={<AddDevice />} />
          <Route path="/devices/edit/:id" element={<EditDevice />} />
          <Route path="/devices/view/:id" element={<DeviceDetail />} />

          {/* ✅ DEVICE MOVEMENT */}
          <Route path="/device-movement" element={<DeviceMovementMaster />} />
          <Route path="/device-movement/create/:deviceId" element={<CreateDeviceMovement />} />
          <Route path="/device-movement/receive/:movementId" element={<ReceiveDeviceMovement />} />
          <Route path="/device-movement/view/:id" element={<DeviceMovementDetail />} />
          {/* TRACKER */}
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/tracker/map/:vehicleNo" element={<TrackerMap />} />

          {/* VEHICLE TRACKING */}
          <Route path="/vehicle-tracking" element={<VehicleTracking />} />


        </Routes>
        <Footer />

      </div>

      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div className="overlay" onClick={closeSidebar} />
      )}
    </div>
  );
}
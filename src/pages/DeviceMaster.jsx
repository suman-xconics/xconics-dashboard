import LenderPageHeader from "../components/LenderPageHeader";
import LenderToolbar from "../components/LenderToolbar";
import DeviceTableCard from "../components/DeviceTableCard";
import "./DeviceMaster.css";

export default function DeviceMaster() {
    return (
        <div className="device-page">
            {/* PAGE HEADER */}
            <LenderPageHeader
                title="Device Master"
                breadcrumbLabel="Device"
            />

            {/* TOOLBAR */}
            <LenderToolbar
                searchPlaceholder="Search Device..."
                addButtonLabel="Add Device"
                addRoute="/devices/add"
            />

            {/* TABLE */}
            <DeviceTableCard />
        </div>
    );
}
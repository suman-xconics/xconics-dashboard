import WarehouseHeader from "../components/WarehouseHeader";
import WarehouseToolbar from "../components/WarehouseToolbar";
import WarehouseTableCard from "../components/WarehouseTableCard";
import "./WarehouseMaster.css";

export default function WarehouseMaster() {
  return (
    <div className="warehouse-page">
      <WarehouseHeader />
      <WarehouseToolbar />
      <WarehouseTableCard />
    </div>
  );
}

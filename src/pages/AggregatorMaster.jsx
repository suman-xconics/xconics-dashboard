import LenderPageHeader from "../components/LenderPageHeader";
import LenderToolbar from "../components/LenderToolbar";
import AggregatorTableCard from "../components/AggregatorTableCard";
import "./LenderMaster.css";

export default function AggregatorMaster() {
  return (
    <div className="lender-page">
      {/* HEADER */}
      <LenderPageHeader
        title="Aggregator Master"
        breadcrumbLabel="Aggregator"
      />

      {/* TOOLBAR */}
      <LenderToolbar
        searchPlaceholder="Search Aggregator..."
        addButtonLabel="Add Aggregator"
        addRoute="/aggregators/add"
      />

      {/* TABLE */}
      <AggregatorTableCard />
    </div>
  );
}

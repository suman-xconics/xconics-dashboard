import LenderPageHeader from "../components/LenderPageHeader";
import LenderToolbar from "../components/LenderToolbar";
import FieldEngineerTableCard from "../components/FieldEngineerTableCard";
import "./LenderMaster.css";

export default function FieldEngineerMaster() {
  return (
    <div className="lender-page">
      {/* PAGE HEADER */}
      <LenderPageHeader
        title="Field Engineer Master"
        breadcrumbLabel="Field Engineer"
      />

      {/* TOOLBAR */}
      <LenderToolbar
        searchPlaceholder="Search Field Engineer..."
        addButtonLabel="Add Field Engineer"
        addRoute="/engineers/add"
      />

      {/* TABLE CARD */}
      <FieldEngineerTableCard />
    </div>
  );
}

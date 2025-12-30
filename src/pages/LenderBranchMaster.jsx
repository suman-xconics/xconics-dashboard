import LenderPageHeader from "../components/LenderPageHeader";
import LenderToolbar from "../components/LenderToolbar";
import LenderBranchTableCard from "../components/LenderBranchTableCard";

export default function LenderBranchMaster() {
  return (
    <div className="lender-page">
      {/* HEADER */}
      <LenderPageHeader
        title="Lender Branch"
        breadcrumbLabel="Lender Branch"
      />

      {/* TOOLBAR */}
      <LenderToolbar
        searchPlaceholder="Search lender branch"
        addButtonLabel="Add Lender Branch"
        addRoute="/lender-branches/add"
      />

      {/* TABLE */}
      <LenderBranchTableCard />
    </div>
  );
}

import { useLocation, useNavigate, useParams } from "react-router-dom";
import LenderPageHeader from "../components/LenderPageHeader";
import "./ViewAggregator.css";

/* =====================
   DATE FORMATTER
   ===================== */
const formatDate = (date) => {
  if (!date) return "29/12/2025";
  return new Date(date).toLocaleDateString("en-GB");
};

/* =====================
   FULL DUMMY LENDER
   ===================== */
const DUMMY_LENDER = {
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  lenderCode: "LND-001",
  lenderName: "HDFC Finance Ltd",
  lenderType: "NBFC",
  contactPersonName: "Ramesh Kumar",
  contactMobile: "9876543210",
  contactEmail: "contact@hdfcfinance.com",
  registeredAddress: "Mumbai Head Office, Maharashtra",
  state: "Maharashtra",
  region: "West",
  gstNumber: "27ABCDE1234F1Z5",
  panNumber: "ABCDE1234F",
  ldApplicable: true,
  ldPercentageCap: 5,
  billingCycle: "WEEKLY",
  paymentTermsDays: 7,
  pilotStartDate: "2025-01-01",
  pilotEndDate: "2025-03-31",
  agreementStartDate: "2025-04-01",
  agreementEndDate: "2026-03-31",
  status: "ACTIVE",
  remarks: "Preferred NBFC partner",
  createdAt: "2025-01-01",
  updatedAt: "2025-12-29",
};

export default function ViewLender() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  /* =====================
     MERGED DATA (SAFE)
     ===================== */
  const lender = {
    ...DUMMY_LENDER,
    ...(location.state || {}),
    id: location.state?.id || id || DUMMY_LENDER.id,
  };

  return (
    <div className="lender-page">
      {/* HEADER */}
      <LenderPageHeader
        title="Lender View"
        breadcrumbLabel="Lender > View"
      />

      <div className="view-card-wrapper">
        <div className="card view-card">
          <div className="view-grid">

            <div className="view-field">
              <label>ID</label>
              <span>{lender.id}</span>
            </div>

            <div className="view-field">
              <label>Lender Code</label>
              <span>{lender.lenderCode}</span>
            </div>

            <div className="view-field">
              <label>Lender Name</label>
              <span>{lender.lenderName}</span>
            </div>

            <div className="view-field">
              <label>Lender Type</label>
              <span>{lender.lenderType}</span>
            </div>

            <div className="view-field">
              <label>Contact Person Name</label>
              <span>{lender.contactPersonName}</span>
            </div>

            <div className="view-field">
              <label>Contact Mobile</label>
              <span>{lender.contactMobile}</span>
            </div>

            <div className="view-field">
              <label>Contact Email</label>
              <span>{lender.contactEmail}</span>
            </div>

            <div className="view-field">
              <label>Registered Address</label>
              <span>{lender.registeredAddress}</span>
            </div>

            <div className="view-field">
              <label>State</label>
              <span>{lender.state}</span>
            </div>

            <div className="view-field">
              <label>Region</label>
              <span>{lender.region}</span>
            </div>

            <div className="view-field">
              <label>GST Number</label>
              <span>{lender.gstNumber}</span>
            </div>

            <div className="view-field">
              <label>PAN Number</label>
              <span>{lender.panNumber}</span>
            </div>

            <div className="view-field">
              <label>LD Applicable</label>
              <span>{lender.ldApplicable ? "Yes" : "No"}</span>
            </div>

            <div className="view-field">
              <label>LD Percentage Cap</label>
              <span>{lender.ldPercentageCap}%</span>
            </div>

            <div className="view-field">
              <label>Billing Cycle</label>
              <span>{lender.billingCycle}</span>
            </div>

            <div className="view-field">
              <label>Payment Terms Days</label>
              <span>{lender.paymentTermsDays}</span>
            </div>

            <div className="view-field">
              <label>Pilot Start Date</label>
              <span>{formatDate(lender.pilotStartDate)}</span>
            </div>

            <div className="view-field">
              <label>Pilot End Date</label>
              <span>{formatDate(lender.pilotEndDate)}</span>
            </div>

            <div className="view-field">
              <label>Agreement Start Date</label>
              <span>{formatDate(lender.agreementStartDate)}</span>
            </div>

            <div className="view-field">
              <label>Agreement End Date</label>
              <span>{formatDate(lender.agreementEndDate)}</span>
            </div>

            <div className="view-field">
              <label>Lender Status</label>
              <span>{lender.status}</span>
            </div>

            <div className="view-field full-width">
              <label>Remarks</label>
              <span>{lender.remarks}</span>
            </div>

            <div className="view-field">
              <label>Create Date</label>
              <span>{formatDate(lender.createdAt)}</span>
            </div>

            <div className="view-field">
              <label>Update Date</label>
              <span>{formatDate(lender.updatedAt)}</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="view-actions">
            <button
              className="add-more-btn secondary"
              onClick={() => navigate("/lenders")}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

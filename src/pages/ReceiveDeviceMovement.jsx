import { useNavigate } from "react-router-dom";
import LenderPageHeader from "../components/LenderPageHeader";
import "./DeviceMovement.css";

export default function ReceiveDeviceMovement() {
    const navigate = useNavigate();

    return (
        <div className="lender-form-page">
            <LenderPageHeader
                title="Receive Device"
                breadcrumbLabel="Device > Movement > Receive"
            />

            <div className="card movement-form">
                <form>
                    <h3>Receive Device</h3>

                    <input value="867530912345678" disabled />
                    <input type="datetime-local" required />

                    <textarea placeholder="Remarks" />

                    <button
                        type="button"
                        onClick={() => navigate("/device-movement")}
                    >
                        Confirm Received
                    </button>
                </form>
            </div>
        </div>
    );
}
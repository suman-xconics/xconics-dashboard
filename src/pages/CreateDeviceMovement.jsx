import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LenderPageHeader from "../components/LenderPageHeader";
import { createDeviceMovement } from "../services/deviceMovementService";
import "./DeviceMovement.css";

export default function CreateDeviceMovement() {
    const navigate = useNavigate();

    const [movement, setMovement] = useState({
        toEntityId: "",
        dispatchedAt: "",
        remarks: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // PAYLOAD AS BACKEND EXPECTS
        const payload = {
            deviceId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // replace later
            movementType: "WH_TO_ENGINEER",

            fromEntityType: "PRODUCTION_WAREHOUSE",
            fromEntityWarehouseId: "warehouse-uuid",

            toEntityType: "FIELD_ENGINEER",
            toEntityFieldEngineerId: movement.toEntityId,

            dispatchedAt: movement.dispatchedAt,
            remarks: movement.remarks,
        };

        try {
            await createDeviceMovement(payload);
            navigate("/device-movement");
        } catch (error) {
            console.error("Create movement failed", error);
        }
    };

    return (
        <div className="lender-form-page">
            <LenderPageHeader
                title="Create Device Movement"
                breadcrumbLabel="Device > Movement > Create"
            />

            <div className="card movement-form">
                <form onSubmit={handleSubmit}>
                    <h3>Dispatch Device</h3>

                    <input value="867530912345678" disabled />
                    <input value="WAREHOUSE → ENGINEER" disabled />

                    <select
                        onChange={(e) =>
                            setMovement({ ...movement, toEntityId: e.target.value })
                        }
                        required
                    >
                        <option value="">Select To Engineer</option>
                        <option value="engineer-uuid-1">Amit Kumar</option>
                    </select>

                    <input
                        type="datetime-local"
                        required
                        onChange={(e) =>
                            setMovement({ ...movement, dispatchedAt: e.target.value })
                        }
                    />

                    <textarea
                        placeholder="Remarks"
                        onChange={(e) =>
                            setMovement({ ...movement, remarks: e.target.value })
                        }
                    />

                    <button type="submit">Dispatch Device</button>
                </form>
            </div>
        </div>
    );
}
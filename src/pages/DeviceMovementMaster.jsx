import { useEffect, useState } from "react";
import { getDeviceMovements } from "../services/deviceMovementService";
import DeviceMovementTableCard from "../components/DeviceMovementTableCard";
import LenderPageHeader from "../components/LenderPageHeader";

export default function DeviceMovementMaster() {
    const [movements, setMovements] = useState([]);

    useEffect(() => {
        loadMovements();
    }, []);

    const loadMovements = async () => {
        try {
            const res = await getDeviceMovements({ offset: 0, limit: 10 });
            console.log("API DATA:", res.data); // 🔍 IMPORTANT
            setMovements(res.data.data || []);
        } catch (err) {
            console.error("API ERROR:", err);
        }
    };

    return (
        <>
            <LenderPageHeader
                title="Device Movement"
                breadcrumbLabel="Device > Movement"
            />
            <DeviceMovementTableCard movements={movements} />
        </>
    );
}
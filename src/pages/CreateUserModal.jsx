import CreateUser from "../pages/CreateUser";

export default function CreateUserModal({ onClose }) {
    return (
        <div style={overlay} onClick={onClose}>
            <div style={modal} onClick={(e) => e.stopPropagation()}>
                <button style={closeBtn} onClick={onClose}>
                    ✕
                </button>
                <CreateUser />
            </div>
        </div>
    );
}

const overlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100000,
};

const modal = {
    background: "#ffffff",
    padding: "20px",
    width: "800px",
    borderRadius: "8px",
    position: "relative",
};

const closeBtn = {
    position: "absolute",
    top: "10px",
    right: "10px",
    border: "none",
    background: "none",
    fontSize: "18px",
    cursor: "pointer",
};
import { useEffect, useState } from "react";
import { Sun, Moon, User, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    applyTheme,
    saveTheme,
    getSavedTheme,
    getSystemTheme,
} from "../themeManager";
import "./Header.css";

export default function Header({ toggleSidebar }) {
    const [isDark, setIsDark] = useState(false);
    const [unreadCount] = useState(3);
    const navigate = useNavigate(); // ✅ ADD

    useEffect(() => {
        const saved = getSavedTheme();
        const theme = saved || getSystemTheme();
        applyTheme(theme);
        setIsDark(theme === "dark");

        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const listener = (e) => {
            if (!getSavedTheme()) {
                const t = e.matches ? "dark" : "light";
                applyTheme(t);
                setIsDark(t === "dark");
            }
        };

        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, []);

    const toggleTheme = () => {
        const next = isDark ? "light" : "dark";
        applyTheme(next);
        saveTheme(next);
        setIsDark(!isDark);
    };

    return (
        <header className="header">
            {/* LEFT */}
            <div className="header-left">
                <button className="menu-btn" onClick={toggleSidebar}>
                    ☰
                </button>
            </div>

            {/* RIGHT */}
            <div className="header-right">
                {/* Search */}
                <div className="search-wrapper">
                    <img
                        src="https://img.icons8.com/ios/50/search--v1.png"
                        className="search-icon theme-icon"
                        alt="search"
                    />
                    <input
                        className="search"
                        placeholder="Search for something"
                    />
                </div>

                {/* 🌗 Theme Toggle */}
                <button className="lucide-theme-toggle" onClick={toggleTheme}>
                    <div className="icon-circle">
                        {isDark ? (
                            <Moon size={18} strokeWidth={1.8} />
                        ) : (
                            <Sun size={18} strokeWidth={1.8} />
                        )}
                    </div>
                </button>

                {/* 🔔 Notification */}
                <div className="notification-wrapper">
                    <div className="icon-circle">
                        <Bell size={20} strokeWidth={1.8} />
                    </div>
                    {unreadCount > 0 && (
                        <span className="notification-badge">{unreadCount}</span>
                    )}
                </div>

                {/* 👤 PROFILE → CREATE USER */}
                <button
                    className="profile-btn"
                    onClick={() => navigate("/create-user")}
                    title="Create User"
                >
                    <div className="icon-circle">
                        <User size={20} strokeWidth={1.8} />
                    </div>
                </button>
            </div>
        </header>
    );
}

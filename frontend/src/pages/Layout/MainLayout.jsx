import React, { useState, useEffect } from "react";
import Footer from "../../components/Footer";
import Navigation from "../../components/Navigation";

export default function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = (forceState) => {
        if (typeof forceState === "boolean") {
            setSidebarOpen(forceState);
        } else {
            setSidebarOpen(!sidebarOpen);
        }
    };

    return (
        <div id="app">
            <div className="main-wrapper">
                <Navigation sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="main-content">
                    {children}
                </div>
                <Footer />
            </div>
        </div>
    );
}

import axios from "axios";
import NavLink from "./NavLink";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { getTokenWithExpiration } from "../pages/Auth/Session";
import appConfig from "../config/appConfig";

export default function Navigation({ sidebarOpen, toggleSidebar }) {
    const [user, setUser] = useState({});

    const navigate = useNavigate();
    const location = useLocation();
    const token = getTokenWithExpiration("token");

    const [dropdownOpen1, setDropdownOpen1] = useState(false);
    const [dropdownOpen2, setDropdownOpen2] = useState(false);
    const [dropdownOpen3, setDropdownOpen3] = useState(false);

    const dropdownRef1 = useRef(null);
    const dropdownRef2 = useRef(null);
    const dropdownRef3 = useRef(null);


    const handleDropdownClick = (dropdown) => {
        if (dropdown === 1) {
            setDropdownOpen1(prev => !prev);
            setDropdownOpen2(false);
            setDropdownOpen3(false);
        } else if (dropdown === 2) {
            setDropdownOpen2(prev => !prev);
            setDropdownOpen1(false);
            setDropdownOpen3(false);
        } else if (dropdown === 3) {
            setDropdownOpen3(prev => !prev);
            setDropdownOpen1(false);
            setDropdownOpen2(false);
        }
    };

    const handleClickOutsideDropdown = (event) => {
        // Only close dropdowns if clicking outside the entire sidebar on mobile
        // or just ignore for now to ensure stability
    };

    useEffect(() => {
        document.title = "Dashboard";
        if (!token) {
            navigate("/");
        }
        fetchData();

        // Auto-expand dropdowns based on path
        if (location.pathname === "/category" || location.pathname === "/rack-location" || location.pathname === "/items") {
            setDropdownOpen1(true);
        }
        if (location.pathname === "/opening-balance-items" || location.pathname === "/purchases" || location.pathname === "/invoices" || location.pathname === "/stock-opname") {
            setDropdownOpen2(true);
        }
        if (location.pathname === "/reports") {
            setDropdownOpen3(true);
        }

    }, [navigate, location.pathname]);

    const fetchData = async () => {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await axios.get(`${appConfig.baseurlAPI}/user`).then((response) => {
            setUser(response.data);
        });
    };

    const logoutHandler = async () => {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await axios.post(`${appConfig.baseurlAPI}/logout`).then(() => {
            localStorage.removeItem("token");
            navigate("/");
        });
    };

    const closeSidebarIfMobile = () => {
        if (window.innerWidth <= 1024) {
            toggleSidebar(false);
        }
    };

    return (
        <>
            {/* Top Navbar */}
            <nav className={`navbar navbar-expand-lg main-navbar ${sidebarOpen ? 'sidebar-show' : ''}`}>
                <form className="form-inline mr-auto">
                    <ul className="navbar-nav mr-3">
                        <li>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleSidebar();
                                }}
                                className="nav-link nav-link-lg sidebar-toggle-btn"
                            >
                                <i className="fas fa-bars"></i>
                            </a>
                        </li>
                    </ul>
                </form>
                <ul className="navbar-nav navbar-right">
                    <li className="dropdown">
                        <a
                            href="#"
                            data-toggle="dropdown"
                            className="nav-link dropdown-toggle nav-link-lg nav-link-user"
                        >
                            <div className="d-sm-none d-lg-inline-block">
                                Hi, {user.name}
                            </div>
                        </a>
                        <div className="dropdown-menu dropdown-menu-right">
                            <div className="dropdown-title">
                                ROLE: {user.role}
                            </div>
                            <Link
                                to="/profile"
                                className="dropdown-item has-icon"
                                onClick={closeSidebarIfMobile}
                            >
                                <i className="far fa-user"></i> Profile
                            </Link>
                            <div className="dropdown-divider"></div>
                            <a
                                onClick={logoutHandler}
                                href="#"
                                className="dropdown-item has-icon text-danger"
                            >
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </div>
                    </li>
                </ul>
            </nav>

            {/* Sidebar Overlay (Mobile Only) */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={toggleSidebar}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(3px)',
                        zIndex: 890,
                        display: window.innerWidth <= 1024 ? 'block' : 'none'
                    }}
                ></div>
            )}

            {/* Vertical Sidebar */}
            <div className={`main-sidebar ${sidebarOpen ? 'sidebar-show' : ''}`}>
                <aside id="sidebar-wrapper">
                    <ul className="sidebar-menu">
                        <li className="menu-header">Dashboard</li>
                        <li className={location.pathname === "/dashboard" || location.pathname === "/" ? "active" : ""}>
                            <NavLink href="/dashboard" onClick={closeSidebarIfMobile}>
                                <i className="far fa-home"></i>
                                <span>Dashboard</span>
                            </NavLink>
                        </li>

                        <li className="menu-header">Master Data</li>
                        <li ref={dropdownRef1} className={`sidebar-item-dropdown ${dropdownOpen1 || location.pathname === "/category" || location.pathname === "/rack-location" || location.pathname === "/items" ? "active" : ""}`}>
                            <a
                                href="#"
                                className="nav-link react-dropdown-trigger"
                                onClick={(e) => { e.preventDefault(); handleDropdownClick(1); }}
                            >
                                <i className="fas fa-fire"></i>
                                <span>Master Data</span>
                            </a>
                            <ul className={`sidebar-submenu ${dropdownOpen1 ? "d-block" : ""}`}>
                                <li className={location.pathname === "/category" ? "active" : ""}>
                                    <NavLink href="/category" onClick={closeSidebarIfMobile}>Category</NavLink>
                                </li>
                                <li className={location.pathname === "/rack-location" ? "active" : ""}>
                                    <NavLink href="/rack-location" onClick={closeSidebarIfMobile}>Rack Location</NavLink>
                                </li>
                                <li className={location.pathname === "/items" ? "active" : ""}>
                                    <NavLink href="/items" onClick={closeSidebarIfMobile}>Items</NavLink>
                                </li>
                            </ul>
                        </li>

                        <li className="menu-header">Inventory</li>
                        <li ref={dropdownRef2} className={`sidebar-item-dropdown ${dropdownOpen2 || location.pathname === "/opening-balance-items" || location.pathname === "/purchases" || location.pathname === "/invoices" || location.pathname === "/stock-opname" ? "active" : ""}`}>
                            <a
                                href="#"
                                className="nav-link react-dropdown-trigger"
                                onClick={(e) => { e.preventDefault(); handleDropdownClick(2); }}
                            >
                                <i className="fas fa-boxes"></i>
                                <span>Inventory</span>
                            </a>
                            <ul className={`sidebar-submenu ${dropdownOpen2 ? "d-block" : ""}`}>
                                <li className={location.pathname === "/opening-balance-items" ? "active" : ""}>
                                    <NavLink href="/opening-balance-items" onClick={closeSidebarIfMobile}>Opening Balance</NavLink>
                                </li>
                                <li className={location.pathname === "/purchases" ? "active" : ""}>
                                    <NavLink href="/purchases" onClick={closeSidebarIfMobile}>Stock In</NavLink>
                                </li>
                                <li className={location.pathname === "/invoices" ? "active" : ""}>
                                    <NavLink href="/invoices" onClick={closeSidebarIfMobile}>Stock Out</NavLink>
                                </li>
                                <li className={location.pathname === "/stock-opname" ? "active" : ""}>
                                    <NavLink href="/stock-opname" onClick={closeSidebarIfMobile}>Stock Opname</NavLink>
                                </li>
                            </ul>
                        </li>

                        <li className="menu-header">Inventory Control</li>
                        <li className={location.pathname === "/stocks" ? "active" : ""}>
                            <NavLink href="/stocks" onClick={closeSidebarIfMobile}>
                                <i className="far fa-pallet"></i>
                                <span>Medicine Stock</span>
                            </NavLink>
                        </li>
                        <li className={location.pathname === "/solutions" ? "active" : ""}>
                            <NavLink href="/solutions" onClick={closeSidebarIfMobile}>
                                <i className="fas fa-flask"></i>
                                <span>Solutions</span>
                            </NavLink>
                        </li>

                        <li className="menu-header">Reporting</li>
                        <li ref={dropdownRef3} className={`sidebar-item-dropdown ${dropdownOpen3 || location.pathname === "/reports" ? "active" : ""}`}>
                            <a
                                href="#"
                                className="nav-link react-dropdown-trigger"
                                onClick={(e) => { e.preventDefault(); handleDropdownClick(3); }}
                            >
                                <i className="far fa-file-archive"></i>
                                <span>Report</span>
                            </a>
                            <ul className={`sidebar-submenu ${dropdownOpen3 ? "d-block" : ""}`}>
                                <li className={location.search === "?type=sales" ? "active" : ""}>
                                    <NavLink href="/reports?type=sales" onClick={closeSidebarIfMobile}>Sales Report</NavLink>
                                </li>
                                <li className={location.search === "?type=purchases" ? "active" : ""}>
                                    <NavLink href="/reports?type=purchases" onClick={closeSidebarIfMobile}>Purchase Report</NavLink>
                                </li>
                                <li className={location.search === "?type=inventory" ? "active" : ""}>
                                    <NavLink href="/reports?type=inventory" onClick={closeSidebarIfMobile}>Inventory Report</NavLink>
                                </li>
                                <li className={location.search === "?type=expiry" ? "active" : ""}>
                                    <NavLink href="/reports?type=expiry" onClick={closeSidebarIfMobile}>Expiry Forecast</NavLink>
                                </li>
                                <li className={location.search === "?type=profit" ? "active" : ""}>
                                    <NavLink href="/reports?type=profit" onClick={closeSidebarIfMobile}>Profit & Loss</NavLink>
                                </li>
                                <li className={location.search === "?type=stock-card" ? "active" : ""}>
                                    <NavLink href="/reports?type=stock-card" onClick={closeSidebarIfMobile}>Stock Card</NavLink>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    <div className="mt-4 mb-4 p-3 hide-sidebar-mini">
                        <button
                            onClick={logoutHandler}
                            className="btn btn-primary btn-lg btn-block btn-icon-split"
                            style={{
                                borderRadius: '12px',
                                background: '#1d2a82',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(29, 42, 130, 0.3)'
                            }}
                        >
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
}

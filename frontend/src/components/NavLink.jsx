import React from "react";
import { Link } from "react-router-dom";

export default function NavLink({ href, children, onClick }) {
    return (
        <Link className="nav-link" to={href} onClick={onClick}>
            {children}
        </Link>
    );
}

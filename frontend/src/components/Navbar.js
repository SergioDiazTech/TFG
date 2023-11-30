import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <Link className={`navbar-brand ${location.pathname === "/" ? "active" : ""}`} to="/">
                    Analytics sentiment
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNavAltMarkup"
                    aria-controls="navbarNavAltMarkup"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                        <Link className={`nav-link ${location.pathname === "/twitterapi" ? "active" : ""}`} to="/twitterapi">
                            Twitter Ingestion
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/dataset" ? "active" : ""}`} to="/dataset">
                            Dataset Ingestion
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/tweetsData" ? "active" : ""}`} to="/tweetsData">
                            Data
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/overview" ? "active" : ""}`} to="/overview">
                            Overview
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/users" ? "active" : ""}`} to="/users">
                            Users
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/heatmap" ? "active" : ""}`} to="/heatmap">
                            Heatmap
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/pointmap" ? "active" : ""}`} to="/pointmap">
                            Pointmap
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/about" ? "active" : ""}`} to="/about">
                            About
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../styles/navbar.css";

const Navbar = () => {
    const location = useLocation();
    const [isIngestionOpen, setIsIngestionOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const openDropdown = document.querySelector('.dropdown-menu.show');
            if (openDropdown && !openDropdown.contains(event.target)) {
                setIsIngestionOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isIngestionOpen]);

    const toggleIngestion = () => {
        setIsIngestionOpen(!isIngestionOpen);
    };

    const handleIngestionOptionClick = () => {
        setIsIngestionOpen(false);
    };

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <Link className={`navbar-brand ${location.pathname === "/" ? "active" : ""}`} to="/">
                    <img src="/favicon.ico" alt="favicon" className="navbar-favicon" />
                    SLAP
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
                        <div className="nav-item dropdown">
                            <Link
                                className={`nav-link dropdown-toggle ${location.pathname.includes("/ingestion") ? "active" : ""}`}
                                to="#"
                                id="navbarDropdownMenuLink"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded={isIngestionOpen}
                                onClick={toggleIngestion}
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                <span className="ingestion-link-content">Ingestion {isIngestionOpen ? <FaCaretUp /> : <FaCaretDown />}</span>
                            </Link>
                            <ul className={`dropdown-menu ${isIngestionOpen ? "show" : ""}`} aria-labelledby="navbarDropdownMenuLink">
                                <li><Link className="dropdown-item" to="/twitterapi" onClick={handleIngestionOptionClick}>X Ingestion</Link></li>
                                <li><Link className="dropdown-item" to="/dataset" onClick={handleIngestionOptionClick}>Dataset Ingestion</Link></li>
                            </ul>
                        </div>
                        <Link className={`nav-link ${location.pathname === "/overview" ? "active" : ""}`} to="/overview">
                            Overview
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/heatmap" ? "active" : ""}`} to="/heatmap">
                            Heatmap
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/pointmap" ? "active" : ""}`} to="/pointmap">
                            PostsMap
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/trendingtopics" ? "active" : ""}`} to="/trendingtopics">
                            Trending-Topics
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

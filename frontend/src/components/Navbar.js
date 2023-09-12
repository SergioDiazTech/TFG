import React from "react";
import {Link} from 'react-router-dom'

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
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
                        <Link className="nav-link" to="/twitterapi">
                            Ingesta twitter
                        </Link>
                        <Link className="nav-link" to="/dataset">
                            Importar dataset
                        </Link>
                        <Link className="nav-link" to="/tweets">
                            Datos
                        </Link>
                        <Link className="nav-link" to="/heatmap">
                            Heatmap
                        </Link>
                        <Link className="nav-link" to="/about">
                            About
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
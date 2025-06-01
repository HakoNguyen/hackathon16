import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const NavigationBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          YouTube Analytics
        </Link>
        <div className="navbar-links">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link to="/videos" className="nav-link">
            Videos
          </Link>
          <Link to="/comments" className="nav-link">
            Comments
          </Link>
          <Link to="/statistics" className="nav-link">
            Statistics
          </Link>
          <Link to="/sentiment" className="nav-link">
            Sentiment Analysis
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;

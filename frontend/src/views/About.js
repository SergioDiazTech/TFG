import React from "react";
import "../styles/about.css"

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">UNIVERSITY OF CASTILLA-LA MANCHA</h1>
      <p className="about-description">
        FACULTY OF SOCIAL SCIENCES AND INFORMATION TECHNOLOGIES
      </p>
      <h2 className="about-section-title">DEGREE IN:</h2>
      <p className="about-section-description">
        COMPUTER ENGINEERING
      </p>
      <h2 className="about-section-title">Big Data tool for analyzing the evolution of geolocated sentiments on the social network X BY:</h2>
      <ul className="about-team-list">
        <li>SERGIO DÍAZ DE LA PEÑA</li>
      </ul>
      <a href="https://github.com/SergioDiazTech/TFG" className="about-link">
        View Code in Repository
      </a>
    </div>
  );
};

export default About;

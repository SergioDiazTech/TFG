import React from "react";
import "../styles/about.css"


const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">UNIVERSITY OF CASTILLA-LA MANCHA</h1>
      <p className="about-description">
        FACULTY OF SOCIAL SCIENCES AND INFORMATION TECHNOLOGY
      </p>
      <h2 className="about-section-title">BACHELOR'S DEGREE IN:</h2>
      <p className="about-section-description">
        COMPUTER ENGINEERING
      </p>
      <h2 className="about-section-title">TFG PREPARED BY:</h2>
      <ul className="about-team-list">
        <li>SERGIO DÍAZ DE LA PEÑA</li>
      </ul>
    </div>
  );

};

export default About;

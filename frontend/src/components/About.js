import React from "react";


const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">UNIVERSIDAD DE CASTILLA LA MANCHA</h1>
      <p className="about-description">
        FACULTAD DE CIENCIAS SOCIALES Y TECNOLOGÍAS DE LA INFORMACIÓN
      </p>
      <h2 className="about-section-title">GRADO EN:</h2>
      <p className="about-section-description">
        INGENIERÍA INFORMÁTICA
      </p>
      <h2 className="about-section-title">TFG REALIZADO POR:</h2>
      <ul className="about-team-list">
        <li>SERGIO DÍAZ DE LA PEÑA</li>
      </ul>
    </div>
  );
};

export default About;

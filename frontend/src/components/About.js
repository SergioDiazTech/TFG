import React from "react";
import "../styles/about.css"

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">UNIVERSIDAD DE CASTILLA-LA MANCHA</h1>
      <p className="about-description">
        FACULTAD DE CIENCIAS SOCIALES Y TECNOLOGÍAS DE LA INFORMACIÓN
      </p>
      <h2 className="about-section-title">GRADO EN:</h2>
      <p className="about-section-description">
        INGENIERÍA INFORMÁTICA
      </p>
      <h2 className="about-section-title">Herramienta Big Data para el análisis de la evolución de sentimientos geolocalizados en la red social X POR:</h2>
      <ul className="about-team-list">
        <li>SERGIO DÍAZ DE LA PEÑA</li>
      </ul>
      <a href="https://github.com/SergioDiazTech/TFG" className="about-link">
        Ver Código en el Repositorio
      </a>
    </div>
  );
};

export default About;

import React, { useState } from 'react';
// Instalamos Font Awesome en nuestro proyecto React: npm install --save @fortawesome/fontawesome-free
import '@fortawesome/fontawesome-free/css/all.css'; // Para poder cargar los iconos de nuestra aplicacion en este componente


const API = process.env.REACT_APP_API;

function Dataset() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Envía el archivo al backend
      fetch(`${API}/dataset`, {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          // Maneja la respuesta del backend
          console.log(data);
          setMessage(data.message); // Guarda el mensaje en el estado
        })
        .catch(error => {
          // Maneja cualquier error de la solicitud
          console.error('Error:', error);
          //setMessage('Error al cargar el archivo.'); // Guarda el mensaje de error en el estado
          setMessage(API);
        });
    }
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
  };

  return (
    <div className="dataset-container">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <p className="file-info">Archivo seleccionado: {selectedFile.name}</p>
        ) : (
          <div className="upload-area">
            <p className="upload-text">Arrastra y suelta el archivo aquí o</p>
            <label htmlFor="file-upload" className="custom-file-upload">
              Selecciona un archivo
            </label>
            <input id="file-upload" type="file" onChange={handleFileChange} />
          </div>
        )}
      </div>
      <button className="upload-button" onClick={handleFileUpload}>
        Enviar
      </button>
      {message && <p className="upload-message">{message}</p>} {/* Muestra el mensaje si existe */}
    </div>
  );
}

export default Dataset;

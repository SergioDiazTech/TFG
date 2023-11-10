import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.css';

const API = process.env.REACT_APP_API;

function Dataset() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [customName, setCustomName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('customName', customName);

      try {
        const response = await fetch(`${API}/dataset`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error('Error:', error);
        setMessage("El archivo no se ha cargado correctamente");
      } finally {
        setIsUploading(false);
      }
    } else {
      setMessage("Por favor, seleccione un archivo para cargar.");
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
          <>
            <p className="file-info">Selected file: {selectedFile.name}</p>
            <input 
              className="custom-input"
              type="text"
              placeholder="Enter a name for this dataset"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </>
        ) : (
          <div className="upload-area">
            <p className="upload-text">Drag and drop the file here, or select one</p>
            <label htmlFor="file-upload" className="custom-file-upload">
              <i className="fas fa-upload"></i> Select file
            </label>
            <input id="file-upload" type="file" onChange={handleFileChange} />
          </div>
        )}
      </div>
      {!isUploading && selectedFile && (
        <button className="upload-button" onClick={handleFileUpload}>
          Upload file
        </button>
      )}
      {isUploading && (
        <div className="processing-container">
          <i className="fas fa-spinner fa-spin"></i> Processing...
        </div>
      )}
      {message && <p className="upload-message">{message}</p>}
    </div>
  );
}

export default Dataset;
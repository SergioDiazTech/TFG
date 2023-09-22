import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, LayerGroup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API = process.env.REACT_APP_API;

function Heatmap() {
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    fetch(`${API}/heatmap`)
      .then(response => response.json())
      .then(data => {
        if (data.longitude && data.latitude && data.compound) {
          const heatmapPoints = data.longitude.map((lng, index) => ({
            lng,
            lat: data.latitude[index],
            value: data.compound[index]
          }));
          setHeatmapData(heatmapPoints);
        }
        console.log(data.compound);
      })
      .catch(error => {
        console.error('Error fetching heatmap data:', error);
      });
  }, []);

  const calculateCenter = () => {
    if (heatmapData.length === 0) {
      return [0, 0]; // Valor predeterminado en caso de que no haya datos
    }

    const sumLat = heatmapData.reduce((sum, point) => sum + point.lat, 0);
    const sumLng = heatmapData.reduce((sum, point) => sum + point.lng, 0);
    const avgLat = sumLat / heatmapData.length;
    const avgLng = sumLng / heatmapData.length;

    return [avgLat, avgLng];
  };

  return (
    <div className="heatmap-wrapper">
      <div className="heatmap-title">Mapa de calor en base a los tweets cargados</div>
      <div className="heatmap-container">
        <MapContainer center={calculateCenter()} zoom={5} className="heatmap-map">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LayerGroup>
            {heatmapData.map((point, index) => {
              const { lat, lng, value } = point;
              if (typeof lat !== 'number' || typeof lng !== 'number' || typeof value !== 'number') {
                console.error(`Invalid data at index ${index}:`, point);
                return null;
              }

              return (
                <CircleMarker
                  key={index}
                  center={[lat, lng]}
                  radius={6}
                  fillOpacity={0.5}
                  fillColor={getFillColor(value)}
                  className="heatmap-marker"
                />
              );
            })}
          </LayerGroup>
        </MapContainer>
      </div>
    </div>
  );
}

function getFillColor(value) {
  const red = Math.floor((1 - value) * 255);
  const green = Math.floor((value + 1) * 255) / 2;
  const blue = 0;
  const opacity = 0.7;

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

export default Heatmap;
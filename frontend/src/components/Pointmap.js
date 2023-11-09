import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const API = process.env.REACT_APP_API;

function Pointmap() {
  const [pointMapData, setPointMapData] = useState([]);
  const mapContainer = useRef(null);

  // Función para obtener el color de relleno basado en el valor
  const getFillColor = (value) => {
    const red = Math.floor((1 - value) * 255);
    const green = Math.floor((value + 1) * 255) / 2;
    const blue = 0;
    const opacity = 0.7;
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  };

  useEffect(() => {
    fetch(`${API}/pointmap`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const newPointMapData = data.map(item => ({
            lat: item.latitude,
            lng: item.longitude,
            value: item.compound,
          }));
          setPointMapData(newPointMapData);
        } else {
          console.error('Data is missing required properties (latitude, longitude, compound):', data);
        }
      })
      .catch(error => {
        console.error('Error fetching pointmap data:', error);
      });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || pointMapData.length === 0) {
      return;
    }

    const mapInstance = L.map(mapContainer.current).setView([0, 0], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance);

    const layerGroup = L.layerGroup().addTo(mapInstance);

    pointMapData.forEach(point => {
      const { lat, lng, value } = point;
      if (typeof lat !== 'number' || typeof lng !== 'number' || typeof value !== 'number') {
        console.error('Invalid data:', point);
        return;
      }

      const circleMarker = new L.CircleMarker([lat, lng], {
        radius: 6,
        fillOpacity: 0.5,
        fillColor: getFillColor(value),
        className: 'heatmap-marker',
      });

      circleMarker.addTo(layerGroup);
    });

    if (pointMapData.some(point => point.lat && point.lng)) {
      const bounds = L.latLngBounds(pointMapData.map(point => [point.lat, point.lng]));
      mapInstance.fitBounds(bounds);
    } else {
      console.error('No valid data available to fit bounds on map');
    }

    return () => {
      mapInstance.off();
      mapInstance.remove();
    };
  }, [pointMapData]);

  return (
    <div className="heatmap-wrapper">
      <div className='heatmap-title'>Pointmap based on tweets from the dataset: COLOMBIA</div>
      <div ref={mapContainer} id="heatmap-map" className="heatmap-map"></div>
    </div>
  );
}

export default Pointmap;

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat/dist/leaflet-heat.js';

const API = process.env.REACT_APP_API;

function Heatmap() {
  const [heatMapData, setHeatMapData] = useState([]);
  const mapContainer = useRef(null);

  useEffect(() => {
    fetch(`${API}/heatmap`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const newHeatMapData = data.map(item => ({
            lat: item.latitude,
            lng: item.longitude,
            value: item.compound,
          }));
          setHeatMapData(newHeatMapData);
        } else {
          console.error('Data is missing required properties (latitude, longitude, compound):', data);
        }
      })
      .catch(error => {
        console.error('Error fetching heatmap data:', error);
      });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || heatMapData.length === 0) {
      return;
    }

    const mapInstance = L.map(mapContainer.current).setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance);

    const gradient = {
      0.5: 'blue',
      0.6: 'cyan',
      0.7: 'lime',
      0.8: 'yellow',
      0.9: 'orange',
      1.0: 'red',
    };

    L.heatLayer(heatMapData.map(({ lat, lng, value }) => [lat, lng, value]), {
      radius: 15,
      gradient,
      blur: 10,
      maxZoom: 25,
      minOpacity: 0.4,
    }).addTo(mapInstance);

    if (heatMapData.some(point => point.lat && point.lng)) {
      const bounds = L.latLngBounds(heatMapData.map(point => [point.lat, point.lng]));
      mapInstance.fitBounds(bounds);
    } else {
      console.error('No valid data available to fit bounds on map');
    }

    return () => {
      mapInstance.off();
      mapInstance.remove();
    };
  }, [heatMapData]);

  return (
    <div className="heatmap-wrapper">
      <div className='heatmap-title'>Heatmap based on tweets from the dataset: COLOMBIA</div>
      <div ref={mapContainer} id="heatmap-map" className="heatmap-map"></div>
    </div>
  );
}

export default Heatmap;

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat/dist/leaflet-heat.js';

const API = process.env.REACT_APP_API;

function Heatmap() {
  const [heatMapData, setHeatMapData] = useState([]);
  const [collectionName, setCollectionName] = useState('');
  const mapContainer = useRef(null);

  useEffect(() => {
    fetch(`${API}/heatmap`)
      .then(response => response.json())
      .then(response => {
        if (response.data && response.data.length > 0) {
          const newHeatMapData = response.data.map(item => ({
            lat: item.latitude,
            lng: item.longitude,
            value: item.sentiment,
          }));
          setHeatMapData(newHeatMapData);
          setCollectionName(response.collectionName);
        } else {
          console.error('Data is missing required properties:', response);
        }
      })
      .catch(error => {
        console.error('Error fetching heatmap data:', error);
      });
  }, []);

  const normalizeSentiment = value => (value + 1) / 2; 


  useEffect(() => {
    if (!mapContainer.current || heatMapData.length === 0) {
      return;
    }

    const mapInstance = L.map(mapContainer.current).setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance);

    const gradient = {
      0.0: 'red',
      0.1: 'orange',
      0.2: 'lime',
      0.3: 'yellow',
      0.5: 'green',
    };

    L.heatLayer(heatMapData.map(({ lat, lng, value }) => [lat, lng, normalizeSentiment(value)]), {
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
    <div className="map-wrapper">
      <div className='map-title'>Heatmap based on tweets from the dataset: {collectionName}</div>
      <div ref={mapContainer} id="map-map" className="map-map"></div>
    </div>
  );
}

export default Heatmap;

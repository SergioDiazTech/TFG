import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat/dist/leaflet-heat.js';

const API = process.env.REACT_APP_API;

function Heatmap() {
  const mapContainer = useRef(null); // Referencia al contenedor del mapa

  useEffect(() => {
    if (!mapContainer.current) {
      // El contenedor del mapa no está disponible
      return;
    }

    let mapInstance = L.map(mapContainer.current).setView([0, 0], 5); // Inicializamos el mapa aquí

    mapInstance.whenReady(() => {
      fetch(`${API}/heatmap`)
        .then(response => response.json())
        .then(data => {
          if (data.latitude && data.longitude && data.compound) {
            const heatMapData = data.latitude.map((lat, index) => ({
              lat,
              lng: data.longitude[index],
              value: data.compound[index],
            }));

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance);

            const gradient = {
              0.5: 'blue',
              0.6: 'cyan',
              0.7: 'lime',
              0.8: 'yellow',
              0.9: 'orange',
              1.0: 'red',
            };

            L.heatLayer(heatMapData, {
              radius: 15,
              gradient,
              blur: 10,
              maxZoom: 25,
              minOpacity: 0.4,
            }).addTo(mapInstance);

            mapInstance.fitBounds(L.latLngBounds(heatMapData.map(point => [point.lat, point.lng])));
          } else {
            console.error('Data is missing required properties (latitude, longitude, compound):', data);
          }
        })
        .catch(error => {
          console.error('Error fetching heatmap data:', error);
        });
    });

    // Limpiamos en el retorno de la función useEffect
    return () => {
      if (mapInstance) {
        mapInstance.off();
        mapInstance.remove();
      }
    };
  }, []); // Pasamos un array vacío para que useEffect se ejecute solo una vez

  return (
    <div className="heatmap-wrapper">
      <div className='heatmap-title'>Heatmap based on tweets from the dataset: COLOMBIA</div>
      <div ref={mapContainer} id="heatmap-map" className="heatmap-map"></div>
    </div>
  );
}

export default Heatmap;

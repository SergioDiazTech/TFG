import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat/dist/leaflet-heat.js';

const API = process.env.REACT_APP_API;

// Creamos un contexto para almacenar los datos del mapa de calor
const HeatMapDataContext = createContext();

// Este es nuestro componente proveedor que envolverá nuestra aplicación
export function HeatMapDataProvider({ children }) {
  const [heatMapData, setHeatMapData] = useState(null);

  // Aquí es donde buscaríamos los datos del mapa de calor
  useEffect(() => {
    fetch(`${API}/heatmap`)
      .then(response => response.json())
      .then(data => {
        if (data.latitude && data.longitude && data.compound) {
          const newHeatMapData = data.latitude.map((lat, index) => ({
            lat,
            lng: data.longitude[index],
            value: data.compound[index],
          }));

          setHeatMapData(newHeatMapData); // Guardamos los datos en el estado
        } else {
          console.error('Data is missing required properties (latitude, longitude, compound):', data);
        }
      })
      .catch(error => {
        console.error('Error fetching heatmap data:', error);
      });
  }, []);

  return (
    <HeatMapDataContext.Provider value={heatMapData}>
      {children}
    </HeatMapDataContext.Provider>
  );
}

function Heatmap() {
  const mapContainer = useRef(null); // Referencia al contenedor del mapa
  const heatMapData = useContext(HeatMapDataContext); // Obtenemos los datos del mapa de calor del contexto

  useEffect(() => {
    if (!mapContainer.current || !heatMapData) {
      // El contenedor del mapa no está disponible o los datos aún no se han cargado
      return;
    }

    let mapInstance = L.map(mapContainer.current).setView([0, 0], 5); // Inicializamos el mapa aquí

    mapInstance.whenReady(() => {
      renderHeatmap(heatMapData);
    });

    function renderHeatmap(data) {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance);

      const gradient = {
        0.5: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        0.9: 'orange',
        1.0: 'red',
      };

      L.heatLayer(data, {
        radius: 15,
        gradient,
        blur: 10,
        maxZoom: 25,
        minOpacity: 0.4,
      }).addTo(mapInstance);

      mapInstance.fitBounds(L.latLngBounds(data.map(point => [point.lat, point.lng])));
    }

    // Limpiamos en el retorno de la función useEffect
    return () => {
      if (mapInstance) {
        mapInstance.off();
        mapInstance.remove();
      }
    };
  }, [heatMapData]); // Pasamos heatMapData como dependencia

  return (
    <div className="heatmap-wrapper">
      <div className='heatmap-title'>Heatmap based on tweets from the dataset: COLOMBIA</div>
      <div ref={mapContainer} id="heatmap-map" className="heatmap-map"></div>
    </div>
  );
}

export default Heatmap;

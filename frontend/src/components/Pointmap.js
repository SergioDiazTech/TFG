import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


const API = process.env.REACT_APP_API;

// Creamos un contexto para almacenar los datos del mapa de puntos
const PointMapDataContext = createContext();

// Este es nuestro componente proveedor que envolverá nuestra aplicación
export function PointMapDataProvider({ children }) {
  const [pointMapData, setPointMapData] = useState(null);

  // Aquí es donde buscaríamos los datos del mapa de puntos
  useEffect(() => {
    fetch(`${API}/pointmap`)
      .then(response => response.json())
      .then(data => {
        if (data.longitude && data.latitude && data.compound) {
          const pointmapPoints = data.longitude.map((lng, index) => ({
            lng,
            lat: data.latitude[index],
            value: data.compound[index]
          }));
          setPointMapData(pointmapPoints); // Guardamos los datos en el estado
        } else {
          console.error('Data is missing required properties (longitude, latitude, compound):', data);
        }
      })
      .catch(error => {
        console.error('Error fetching pointmap data:', error);
      });
  }, []);

  return (
    <PointMapDataContext.Provider value={pointMapData}>
      {children}
    </PointMapDataContext.Provider>
  );
}

function Pointmap() {
  const mapContainer = useRef(null); // Referencia al contenedor del mapa
  const pointMapData = useContext(PointMapDataContext); // Obtenemos los datos del mapa de puntos del contexto

  useEffect(() => {
    if (!mapContainer.current || !pointMapData) {
      // El contenedor del mapa no está disponible o los datos aún no se han cargado
      return;
    }

    let mapInstance = L.map(mapContainer.current).setView([0, 0], 5); // Inicializamos el mapa aquí

    mapInstance.whenReady(() => {
      renderPointmap(pointMapData);
    });

    function renderPointmap(data) {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance);

      const layerGroup = L.layerGroup().addTo(mapInstance);

      data.forEach(point => {
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

      mapInstance.fitBounds(L.latLngBounds(data.map(point => [point.lat, point.lng])));
    }

    // Limpiamos en el retorno de la función useEffect
    return () => {
      if (mapInstance) {
        mapInstance.off();
        mapInstance.remove();
      }
    };
  }, [pointMapData]); // Pasamos pointMapData como dependencia

  return (
    <div className="heatmap-wrapper">
      <div className='heatmap-title'>Pointmap based on tweets from the dataset: COLOMBIA</div>
      <div ref={mapContainer} id="heatmap-map" className="heatmap-map"></div>
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

export default Pointmap;

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat/dist/leaflet-heat.js';
import "../styles/heatmap.css"

const API = process.env.REACT_APP_API;

function Heatmap() {
  const [heatMapData, setHeatMapData] = useState([]);
  const [gradient, setGradient] = useState({});
  const [collectionName, setCollectionName] = useState('');
  const [globalSentiment, setGlobalSentiment] = useState(0);
  const [coordinateGroups, setCoordinateGroups] = useState(0);
  const mapContainer = useRef(null);

  // Función para actualizar el sentimiento global basado en los límites del mapa
  const updateGlobalSentiment = (bounds) => {
    fetch(`${API}/heatmap?min_lat=${bounds.getSouth()}&max_lat=${bounds.getNorth()}&min_lng=${bounds.getWest()}&max_lng=${bounds.getEast()}`)
      .then(response => response.json())
      .then(response => {
        setGlobalSentiment(response.globalSentiment);
        setCoordinateGroups(response.coordinateGroups);
      })
      .catch(error => {
        console.error('Error fetching dynamic sentiment:', error);
      });
  };

  useEffect(() => {
    fetch(`${API}/heatmap`)
      .then(response => response.json())
      .then(response => {
        if (response.data && response.data.length > 0) {
          setHeatMapData(response.data.map(item => ({
            lat: item.latitude,
            lng: item.longitude,
            value: item.sentiment,
          })));
          setCollectionName(response.collectionName);
          setGlobalSentiment(response.globalSentiment);
          setCoordinateGroups(response.coordinateGroups);

          const [p0, p25, p50, p75, p100] = response.percentiles;
          setGradient({
            [p0]: "red",
            [p25]: "orange",
            [p50]: "yellow",
            [p75]: "lime",
            [p100]: "green"
          });
        } else {
          console.error('Data is missing required properties:', response);
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

    const mapInstance = L.map(mapContainer.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: false
    });

    L.control.zoom({
      position: 'topright'
    }).addTo(mapInstance);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance);

    L.heatLayer(heatMapData.map(({ lat, lng, value }) => [lat, lng, value]), {
      radius: 15,
      gradient,
      blur: 10,
      maxZoom: 1,
      minOpacity: 0.6,
    }).addTo(mapInstance);

    heatMapData.forEach(point => {
      const { lat, lng, value } = point;
      L.circleMarker([lat, lng], { radius: 1, color: 'transparent' })
        .on('mouseover', () => {
          L.popup()
            .setLatLng([lat, lng])
            .setContent(`Sentiment: ${value * 2 - 1}`) // Convierte de nuevo a rango -1 a 1 para mostrar
            .openOn(mapInstance);
        })
        .addTo(mapInstance);
    });

    // Evento que se dispara cuando se cambia el zoom o se desplaza el mapa
    mapInstance.on('moveend', () => {
      const bounds = mapInstance.getBounds();
      updateGlobalSentiment(bounds);
    });

    return () => {
      mapInstance.off();
      mapInstance.remove();
    };
  }, [heatMapData, gradient]);

  return (
    <div className="dashboard-container-heatmap">
      <div className="main-content-heatmap">
        <div className="map-and-data-heatmap">
          <div className="map-section-heatmap">
            <div className="map-header-heatmap">
              <h5 style={{ textAlign: 'center' }}>Global sentiment overview: Data from '{collectionName}'</h5>
            </div>
            <div ref={mapContainer} className="map-map"></div>
          </div>
          <div className="data-summary-section-heatmap">
            <div className="data-summary-header-heatmap">
              <h5 className="map-title-heatmap">Data Summary</h5>
            </div>
            <div className="total-tweets-summary-heatmap">
              <p>Coordinate Groups: {coordinateGroups}</p>
            </div>
            <div className="average-sentiment-summary-heatmap">
              <p>Average Sentiment: {globalSentiment}</p>
            </div>
            <div className="explanation-sentiment-summary-heatmap">
              <p>Explanation: <span>The interface displays an interactive heatmap, based on Twitter data from Colombia, that visualizes the average geolocated sentiment. You can see the distribution of sentiments in different areas and obtain a summary of the processed data.</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;

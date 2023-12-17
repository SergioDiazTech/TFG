import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat/dist/leaflet-heat.js';

const API = process.env.REACT_APP_API;

function Heatmap() {
  const [heatMapData, setHeatMapData] = useState([]);
  const [gradient, setGradient] = useState({});
  const [collectionName, setCollectionName] = useState('');
  const [globalSentiment, setglobalSentiment] = useState(0);
  const mapContainer = useRef(null);

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
          setglobalSentiment(response.globalSentiment);

          
          
          const [p25, p50, p75] = response.percentiles;
          setGradient({
            0: "red",
            [p25]: "orange",
            [p50]: "yellow",
            [p75]: "lime",
            1: "green"
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
      position: 'topright',
      className: 'custom-zoom-control'
    }).addTo(mapInstance);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance);

    console.log("Gradiente actual:", gradient);
    L.heatLayer(
      heatMapData.map(({ lat, lng, value }) => {
        const point = [lat, lng, value];
        console.log(`Punto de calor: lat: ${lat}, lng: ${lng}, valor: ${value}`);
        return point;
      }),
        {
        radius: 15,
        gradient,
        blur: 10,
        maxZoom: 25,
        minOpacity: 0.4,
      }
    ).addTo(mapInstance);

    heatMapData.forEach(point => {
      const { lat, lng, value } = point;
      const marker = L.circleMarker([lat, lng], { radius: 1, color: 'transparent' }).addTo(mapInstance);
      marker.on('mouseover', () => {
        L.popup()
          .setLatLng([lat, lng])
          .setContent(`Sentiment: ${value * 2 - 1}`) // Convierte de nuevo a rango -1 a 1 para mostrar
          .openOn(mapInstance);
      });
    });

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
              <p>Coordinate Groups: {heatMapData.length}</p>
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

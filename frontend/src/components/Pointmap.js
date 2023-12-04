import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const API = process.env.REACT_APP_API;

function Pointmap() {
  const [pointMapData, setPointMapData] = useState([]);
  const [collectionName, setCollectionName] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalTweets, setTotalTweets] = useState(0);
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  const getFillColor = (value) => {
    if (value > 0.51) {
      return 'green';
    } else if (value < -0.51) {
      return 'red';
    } else {
      return 'yellow';
    }
  };

  useEffect(() => {
    fetch(`${API}/pointmap`)
      .then(response => response.json())
      .then(response => {
        if (response.data && response.data.length > 0) {
          const newPointMapData = response.data.map(item => ({
            lat: item.latitude,
            lng: item.longitude,
            value: item.sentiment,
          }));
          setPointMapData(newPointMapData);
          setCollectionName(response.collectionName);
          setTotalTweets(response.totalTweets);
        } else {
          console.error('Data is missing required properties:', response);
        }
      })
      .catch(error => {
        console.error('Error fetching pointmap data:', error);
      });
  }, []);

  useEffect(() => {
    if (pointMapData.length === 0) {
      return;
    }

    setTotalPoints(pointMapData.length);

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainer.current, {
        center: [0, 0],
        zoom: 5,
        zoomControl: false
      });

      L.control.zoom({
        position: 'topright',
        className: 'custom-zoom-control'
      }).addTo(mapInstance.current);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance.current);
    }

    const markers = L.markerClusterGroup();
    pointMapData.forEach(point => {
      const { lat, lng, value } = point;
      const marker = L.circleMarker([lat, lng], {
        radius: 7,
        fillOpacity: 0.8,
        fillColor: getFillColor(value),
        className: 'pointmap-marker',
      });

      marker.bindPopup(`Sentiment value: ${value}`);
      markers.addLayer(marker);
    });

    mapInstance.current.addLayer(markers);

    if (pointMapData.some(point => point.lat && point.lng)) {
      const bounds = L.latLngBounds(pointMapData.map(point => [point.lat, point.lng]));
      mapInstance.current.fitBounds(bounds);
    } else {
      console.error('No valid data available to fit bounds on map');
    }

    // Añadir leyenda al mapa
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [-1, -0.51, 0.51]; // Puntos de corte para los colores
      const labels = [];
      const colors = ['red', 'yellow', 'green'];

      for (let i = 0; i < grades.length; i++) {
        labels.push(
          '<i style="background:' + colors[i] + '"></i> ' +
          (grades[i] ? grades[i] : '+0.51'));
      }

      div.innerHTML = labels.join('<br>');
      return div;
    };

    legend.addTo(mapInstance.current);

    return () => {
      markers.clearLayers();
    };
  }, [pointMapData]);

  return (
    <div className="map-wrapper">
      <div className='map-title'>Emotional reflection: Visualizing individual tweet sentiments from '{collectionName}' data</div>
      <div className="total-points">
        Tweet Summary: {totalPoints} out of {totalTweets} Tweets Analyzed
      </div>
      <div ref={mapContainer} id="map-map" className="map-map"></div>
    </div>
  );
}

export default Pointmap;

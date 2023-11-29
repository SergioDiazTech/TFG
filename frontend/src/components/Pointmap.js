import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const API = process.env.REACT_APP_API;

function Pointmap() {
  const [pointMapData, setPointMapData] = useState([]);
  const [collectionName, setCollectionName] = useState('');
  const [totalPoints, setTotalPoints] = useState(0); // Estado para el contador de puntos
  const [totalTweets, setTotalTweets] = useState(0); // Estado para el total de tweets
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

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
      .then(response => {
        if (response.data && response.data.length > 0) {
          const newPointMapData = response.data.map(item => ({
            lat: item.latitude,
            lng: item.longitude,
            value: item.sentiment,
          }));
          setPointMapData(newPointMapData);
          setCollectionName(response.collectionName);
          setTotalTweets(response.totalTweets); // Establece el total de tweets
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

    // Actualiza el contador de puntos
    setTotalPoints(pointMapData.length);

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainer.current).setView([0, 0], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance.current);
    }

    const layerGroup = L.layerGroup().addTo(mapInstance.current);

    pointMapData.forEach(point => {
      const { lat, lng, value } = point;
      if (typeof lat !== 'number' || typeof lng !== 'number' || typeof value !== 'number') {
        console.error('Invalid data:', point);
        return;
      }

      const marker = L.circleMarker([lat, lng], {
        radius: 6,
        fillOpacity: 0.5,
        fillColor: getFillColor(value),
        className: 'pointmap-marker',
      });

      marker.bindPopup(`Sentiment value: ${value}`).addTo(layerGroup);
    });

    if (pointMapData.some(point => point.lat && point.lng)) {
      const bounds = L.latLngBounds(pointMapData.map(point => [point.lat, point.lng]));
      mapInstance.current.fitBounds(bounds);
    } else {
      console.error('No valid data available to fit bounds on map');
    }

    return () => {
      layerGroup.clearLayers();
    };
  }, [pointMapData]);

  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

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

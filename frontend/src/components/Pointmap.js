import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import "../styles/pointmap.css";

const API = process.env.REACT_APP_API;

function Pointmap() {
  const [pointMapData, setPointMapData] = useState([]);
  const [collectionName, setCollectionName] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalTweets, setTotalTweets] = useState(0);
  const [highestSentimentTweet, setHighestSentimentTweet] = useState('');
  const [lowestSentimentTweet, setlowestSentimentTweet] = useState('');


  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const legend = useRef(null);

  const getFillColor = (value) => {
    if (value > 0.51) {
      return 'green';
    } else if (value < -0.51) {
      return 'red';
    } else {
      return 'yellow';
    }
  };

  const updateTotalPoints = (bounds) => {
    fetch(`${API}/pointmap?min_lat=${bounds.getSouth()}&max_lat=${bounds.getNorth()}&min_lng=${bounds.getWest()}&max_lng=${bounds.getEast()}`)
      .then(response => response.json())
      .then(response => {
        setTotalPoints(response.data.length);
        setHighestSentimentTweet(response.highestSentimentTweet);
        setlowestSentimentTweet(response.lowestSentimentTweet);
      })
      .catch(error => {
        console.error('Error fetching dynamic point data:', error);
      });
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
            text: item.text,
          }));
          setPointMapData(newPointMapData);
          setCollectionName(response.collectionName);
          setTotalTweets(response.totalTweets);
          setTotalPoints(newPointMapData.length);
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

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainer.current, {
        center: [0, 0],
        zoom: 5,
        zoomControl: false
      });

      L.control.zoom({
        position: 'topright'
      }).addTo(mapInstance.current);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance.current);
    }

    const markers = L.markerClusterGroup({
      iconCreateFunction: function (cluster) {
        var childCount = cluster.getChildCount();
        var className = 'marker-cluster';
        var gradientStyle = '';
        var baseSize = 20;
        var sizeIncrease = Math.min(Math.log(childCount) * 5, 20);
        var fontSize = Math.min(12 + (Math.log(childCount) * 2), 10);

        if (childCount < 50) {
          gradientStyle = 'background-image: linear-gradient(135deg, rgba(18, 83, 225, 0.3) 0%, rgba(18, 83, 225, 0.5) 70%);';
        } else if (childCount < 3000) {
          gradientStyle = 'background-image: linear-gradient(135deg, rgba(18, 83, 225, 0.7) 0%, rgba(18, 83, 225, 0.8) 70%);';
        } else {
          gradientStyle = 'background-image: linear-gradient(135deg, rgba(18, 83, 225, 1) 0%, rgba(15, 60, 181, 1) 70%);';
        }
      
        var size = baseSize + sizeIncrease;
      
        var iconHtml = `<div style="width: ${size}px; height: ${size}px; line-height: ${size}px; ${gradientStyle}; border-radius: 50%; text-align: center; font-size: ${fontSize}px; color: white;">${childCount}</div>`;
      
        return new L.DivIcon({
          html: iconHtml,
          className: className,
          iconSize: new L.Point(size, size)
        });
      }
      
      
    });

    pointMapData.forEach(point => {
      const { lat, lng, value, text } = point;
      const marker = L.circleMarker([lat, lng], {
        radius: 7,
        fillOpacity: 0.8,
        fillColor: getFillColor(value),
        className: 'pointmap-marker',
      });

      const popupContent = `
        <div class="custom-popup">
          <h5 style="text-align: center;">Sentiment Value: ${value}</h5>
          <p style="text-align: justify;">${text}</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      markers.addLayer(marker);
    });

    mapInstance.current.addLayer(markers);

    if (pointMapData.some(point => point.lat && point.lng)) {
      const bounds = L.latLngBounds(pointMapData.map(point => [point.lat, point.lng]));
      mapInstance.current.fitBounds(bounds);
    } else {
      console.error('No valid data available to fit bounds on map');
    }

    if (legend.current) {
      mapInstance.current.removeControl(legend.current);
    }

    legend.current = L.control({ position: 'bottomright' });
    legend.current.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = ["< 50 tweets", "50 - 3000 tweets", "3000+ tweets"];
      const labels = [];

      const colors = [
        'rgba(18, 83, 225, 0.4)',
        'rgba(18, 83, 225, 0.75)',
        'rgba(18, 83, 225, 1)'
      ];

      div.innerHTML = '<h6>Tweet cluster size</h6>';

      for (let i = 0; i < grades.length; i++) {
        labels.push(
          '<i style="background:' + colors[i] + '"></i> ' +
          grades[i]);
      }

      div.innerHTML += labels.join('<br>');
      return div;
    };
    legend.current.addTo(mapInstance.current);

    mapInstance.current.on('moveend', () => {
      const bounds = mapInstance.current.getBounds();
      updateTotalPoints(bounds);
    });

    return () => {
      markers.clearLayers();
      if (legend.current) {
        mapInstance.current.removeControl(legend.current);
        legend.current = null;
      }
    };
  }, [pointMapData]);

  return (
    <div className="dashboard-container-pointmap">
      <div className="main-content-pointmap">
        <div className="map-and-data-pointmap">
          <div className="map-section-pointmap">
            <div className="map-header-pointmap">
              <h5 style={{ textAlign: 'center' }}>Tweet distribution: Visualizing clusters by volume in '{collectionName}'</h5>
            </div>
            <div ref={mapContainer} className="map-map-pointmap"></div>
          </div>
          <div className="data-summary-background">
            <div className="data-summary-section-pointmap">
              <div className="data-summary-header-pointmap">
                <h5 className="map-title-pointmap">Tweets summary</h5>
              </div>
              <div className="total-tweets-summary-pointmap">
                <p>{totalPoints} out of {totalTweets} Tweets Analyzed</p>
              </div>
              <div className="Highest-Sentiment-tweets-summary-pointmap">
                <p>Highest Sentiment Tweet: <span>"{highestSentimentTweet}"</span></p>
              </div>

              <div className="Lowest-Sentiment-tweets-summary-pointmap">
                <p>Lowest Sentiment Tweet: <span>"{lowestSentimentTweet}"</span></p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Pointmap;

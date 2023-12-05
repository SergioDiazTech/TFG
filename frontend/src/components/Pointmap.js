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

    const markers = L.markerClusterGroup({
      iconCreateFunction: function(cluster) {
        var childCount = cluster.getChildCount();
        var c = ' marker-cluster-';
        if (childCount < 50) {
          c += 'small';
        } else if (childCount < 1000) {
          c += 'medium';
        } else {
          c += 'large';
        }

        return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
      }
    });

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

    if (legend.current) {
      mapInstance.current.removeControl(legend.current);
    }

    legend.current = L.control({ position: 'bottomright' });
    legend.current.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = ["< 50 tweets", "50 - 1000 tweets", "1000+ tweets"];
      const labels = [];
      const colors = ['red', 'yellow', 'green'];

      div.innerHTML = '<h6>Tweet cluster size</h6>';

      for (let i = 0; i < grades.length; i++) {
        labels.push(
          '<i style="background:' + colors[i] + '"></i> ' +
          (grades[i] ? grades[i] : '+0.51'));
      }

      div.innerHTML += labels.join('<br>');
      return div;
    };
    legend.current.addTo(mapInstance.current);

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
                        <h5 className="map-title-pointmap">Tweet distribution: Visualizing clusters by volume in '{collectionName}'</h5>
                    </div>
                    <div ref={mapContainer} className="map-map"></div>
                </div>

                <div className="data-summary-section-pointmap">
                    <div className="data-summary-header-pointmap">
                        <h5 className="map-title-pointmap">Tweet summary</h5>
                    </div>
                    <div className="data-summary-pointmap">
                      <p>- {totalPoints} out of {totalTweets} Tweets Analyzed</p>
                      
                      <p>- Data 2</p>
                      
                      <p>- Data 3</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default Pointmap;

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat/dist/leaflet-heat.js';
import "../styles/heatmap.css"

const API = process.env.REACT_APP_API;

const dates = [
  "2021-04-28T00", "2021-04-28T03", "2021-04-28T06", "2021-04-28T09", "2021-04-28T12", "2021-04-28T15", "2021-04-28T18", "2021-04-28T21",
  "2021-04-29T00", "2021-04-29T03", "2021-04-29T06", "2021-04-29T09", "2021-04-29T12", "2021-04-29T15", "2021-04-29T18", "2021-04-29T21",
  "2021-04-30T00", "2021-04-30T03", "2021-04-30T06", "2021-04-30T09", "2021-04-30T12", "2021-04-30T15", "2021-04-30T18", "2021-04-30T21",
  "2021-04-01T00", "2021-04-01T03", "2021-04-01T06", "2021-04-01T09", "2021-04-01T12", "2021-04-01T15", "2021-04-01T18", "2021-04-01T21",
  "2021-04-02T00", "2021-04-02T03", "2021-04-02T06", "2021-04-02T09", "2021-04-02T12", "2021-04-02T15", "2021-04-02T18", "2021-04-02T21",
  "2021-04-03T00", "2021-04-03T03", "2021-04-03T06", "2021-04-03T09"
];


function Heatmap() {
  const [heatMapData, setHeatMapData] = useState([]);
  const [gradient, setGradient] = useState({});
  const [collectionName, setCollectionName] = useState('');
  const [globalSentiment, setGlobalSentiment] = useState(0);
  const [coordinateGroups, setCoordinateGroups] = useState(0);
  const mapContainer = useRef(null);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  

  const updateGlobalSentiment = useCallback((bounds) => {
    const selectedDate = dates[selectedDateIndex];
    fetch(`${API}/heatmap?min_lat=${bounds.getSouth()}&max_lat=${bounds.getNorth()}&min_lng=${bounds.getWest()}&max_lng=${bounds.getEast()}&date=${selectedDate}`)
      .then(response => response.json())
      .then(response => {
        setGlobalSentiment(response.globalSentiment);
        setCoordinateGroups(response.coordinateGroups);
      })
      .catch(error => {
        console.error('Error fetching dynamic sentiment:', error);
      });
  }, [selectedDateIndex]); 

  useEffect(() => {
    const selectedDate = dates[selectedDateIndex];
    console.log("Fecha seleccionada:", selectedDate);

    fetch(`${API}/heatmap?date=${selectedDate}`)
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

          setGradient({
            0.0: 'blue',
            0.2: 'cyan',
            0.4: 'lime',
            0.6: 'yellow',
            0.8: 'orange',
            1.0: 'red',   
          });
        } else {
          console.error('Data is missing required properties:', response);
        }
      })
      .catch(error => {
        console.error('Error fetching heatmap data:', error);
      });
  }, [selectedDateIndex]);

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
      maxZoom: 25,
      minOpacity: 0.4,
    }).addTo(mapInstance);

    heatMapData.forEach(point => {
      const { lat, lng, value } = point;
      L.circleMarker([lat, lng], { radius: 1, color: 'transparent' })
        .on('mouseover', () => {
          L.popup()
            .setLatLng([lat, lng])
            .setContent(`Sentiment: ${value * 2 - 1}`)
            .openOn(mapInstance);
        })
        .addTo(mapInstance);
    });

    mapInstance.on('moveend', () => {
      const bounds = mapInstance.getBounds();
      updateGlobalSentiment(bounds);
    });

    return () => {
      mapInstance.off();
      mapInstance.remove();
    };
  }, [heatMapData, gradient, updateGlobalSentiment]);

  return (
    <div className="dashboard-container-heatmap">
      <div className="main-content-heatmap">
        <div className="map-and-data-heatmap">
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
              <p>Explanation: <span><p>Explanation: <span>The interface displays an interactive heatmap, based on Twitter data from Colombia, that visualizes the average geolocated sentiment. You can see the distribution of sentiments in different areas and obtain a summary of the processed data.</span></p></span></p>
            </div>
          </div>
          <div className="map-section-heatmap">
            <div className="map-header-heatmap">
              <h5 style={{ textAlign: 'center' }}>Global sentiment overview: Data from '{collectionName}'</h5>
            </div>
            <div ref={mapContainer} className="map-map-heatmap"></div>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max={dates.length - 1}
                value={selectedDateIndex}
                onChange={(e) => setSelectedDateIndex(Number(e.target.value))}
                className="slider"
              />
              <div className="slider-date-display">
                Fecha seleccionada: {dates[selectedDateIndex]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;

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
  console.log("Heatmap component mounted");

  const [heatMapData, setHeatMapData] = useState([]);
  const [gradient, setGradient] = useState({});
  const [collectionName, setCollectionName] = useState('');
  const [globalSentiment, setGlobalSentiment] = useState(0);
  const [coordinateGroups, setCoordinateGroups] = useState(0);
  const mapContainer = useRef(null);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSelectDisabled, setIsSelectDisabled] = useState(false);

  const handleSelectChange = (event) => {
  console.log("handleSelectChange invoked, value selected:", event.target.value);

    if (event.target.value === 'accumulated') {
      setIsSelectDisabled(true);
      play();
    } else if (event.target.value === 'threeHourInterval') {
      setIsSelectDisabled(true);
      playThreeHourInterval();
    }
  };

  const play = () => {
    console.log("Function play invoked");

    if (!isPlaying) {
      setIsPlaying(true);

      let currentIndex = 0;
      const startDateFixed = dates[0];

      const intervalId = setInterval(() => {
        if (currentIndex >= dates.length) {
          clearInterval(intervalId);
          setIsPlaying(false);
          setIsSelectDisabled(false);
        } else {
          const endDate = dates[currentIndex];

          console.log(`Fetching data from ${startDateFixed} to ${endDate}`);

          fetch(`${API}/heatmap?start_date=${startDateFixed}&end_date=${endDate}`)
            .then(response => response.json())
            .then(response => {
              setHeatMapData((currentData) => [...currentData, ...response.data.map(item => ({
                lat: item.latitude,
                lng: item.longitude,
                value: item.sentiment,
              }))]);
              setCollectionName(response.collectionName);
              setGlobalSentiment(response.globalSentiment);
              setCoordinateGroups(response.coordinateGroups);
            })
            .catch(error => {
              console.error('Error fetching heatmap data:', error);
            });

          currentIndex++;
        }
      }, 2000);
    }
  };


  const playThreeHourInterval = () => {
    console.log("Function playThreeHourInterval invoked");

    if (!isPlaying) {
      setIsPlaying(true);

      const intervalId = setInterval(() => {
        setSelectedDateIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= dates.length) {
            clearInterval(intervalId);
            setIsPlaying(false);
            setIsSelectDisabled(false);
            return prevIndex;
          }

          fetch(`${API}/heatmap?start_date=${dates[prevIndex]}&end_date=${dates[nextIndex]}`)
            .then(response => response.json())
            .then(response => {
              setHeatMapData(response.data.map(item => ({
                lat: item.latitude,
                lng: item.longitude,
                value: item.sentiment,
              })));
              setCollectionName(response.collectionName);
              setGlobalSentiment(response.globalSentiment);
              setCoordinateGroups(response.coordinateGroups);
            })
            .catch(error => {
              console.error('Error fetching heatmap data:', error);
            });
          return nextIndex;
        });
      }, 500);
    }
  };



  const updateGlobalSentiment = useCallback((bounds) => {
    console.log("Function updateGlobalSentiment invoked");

    const startDate = dates[selectedDateIndex];
    const endDate = dates[selectedDateIndex + 1];

    fetch(`${API}/heatmap?min_lat=${bounds.getSouth()}&max_lat=${bounds.getNorth()}&min_lng=${bounds.getWest()}&max_lng=${bounds.getEast()}&start_date=${startDate}&end_date=${endDate}`)
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
    console.log("useEffect to load initial data on, selected date:", dates[selectedDateIndex]);

    const startDate = dates[selectedDateIndex];
    const endDate = startDate;

    console.log("Fetching heatmap data for:", startDate, "to", endDate);

    fetch(`${API}/heatmap?start_date=${startDate}&end_date=${endDate}`)
      .then(response => response.json())
      .then(response => {
        if (response.data && response.data.length > 0) {
          setHeatMapData(response.data.map(item => ({
            lat: item.latitude,
            lng: item.longitude,
            value: item.sentiment,
          })));

          setGradient({
            0.0: 'blue',
            0.2: 'cyan',
            0.4: 'lime',
            0.6: 'yellow',
            0.8: 'orange',
            1.0: 'red',
          });
        } else {
          setHeatMapData([]);
        }

        setCollectionName(response.collectionName);
        setGlobalSentiment(response.globalSentiment);
        setCoordinateGroups(response.coordinateGroups);
      })
      .catch(error => {
        console.error('Error fetching heatmap data:', error);
      });
  }, [selectedDateIndex]);



  useEffect(() => {
    console.log("useEffect para inicializar el mapa activado");

    if (!mapContainer.current) return;

    const mapInstance = L.map(mapContainer.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: false
    });

    L.control.zoom({
      position: 'topright'
    }).addTo(mapInstance);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapInstance);

    let heatLayer;

    if (heatMapData.length > 0) {
      heatLayer = L.heatLayer(heatMapData.map(({ lat, lng, value }) => [lat, lng, value]), {
        radius: 15,
        gradient,
        blur: 10,
        maxZoom: 25,
        minOpacity: 0.4,
      }).addTo(mapInstance);
    }

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
      if (heatLayer) {
        mapInstance.removeLayer(heatLayer);
      }
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
              <p>Explanation: <span><p><span>The interface displays an interactive heat map, based on Twitter data from Colombia, which visualizes tweet traffic by zone. It allows observing the distribution of tweets in different zones and provides a summary of the processed data, such as average sentiment.</span></p></span></p>
            </div>
          </div>
          <div className="map-section-heatmap">
            <div className="map-header-heatmap">
              <h5 style={{ textAlign: 'center' }}>Global tweets traffic: Data from '{collectionName}'</h5>
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
                Viewing data from 2021-04-28T00 to {dates[selectedDateIndex]}
              </div>
              <div className="play-button-container">
                <select onChange={handleSelectChange} className="play-button" disabled={isSelectDisabled}>
                  <option value="">Select an option</option>.
                  <option value="accumulated">Dynamic accumulated traffic</option>.
                  <option value="threeHourInterval">Traffic every 3 hours</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;

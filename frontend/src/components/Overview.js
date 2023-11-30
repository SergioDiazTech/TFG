import React, { useEffect, useState } from "react";
import "../App.css";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const API = process.env.REACT_APP_API;

function TotalTweets() {
  const [sentimentData, setSentimentData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const getSentimentCount = async () => {
    try {
      const response = await fetch(`${API}/sentiment_count`);
      const data = await response.json();
      setSentimentData({
        labels: ['Positivos', 'Negativos'],
        datasets: [{
          label: 'Sentimiento de Tweets',
          data: [data.positive_tweets, data.negative_tweets],
          backgroundColor: ['#4CAF50', '#F44336'],
          borderColor: ['white'],
          borderWidth: 2
        }]
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error al obtener los datos de sentimiento:", error);
    }
  };

  useEffect(() => {
    getSentimentCount();
  }, []);

  return (
    <div className="total-tweets-container">
      <h1 className="title">Análisis de Sentimientos de Tweets</h1>
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div className="doughnut-chart-container">
          <Doughnut data={sentimentData} options={{
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 15,
                  padding: 20,
                  font: {
                    size: 14
                  }
                }
              }
            }
          }} />
        </div>
      )}
    </div>
  );
}

export default TotalTweets;

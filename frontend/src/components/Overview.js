import React, { useEffect, useState } from "react";
import "../App.css";
import { Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const API = process.env.REACT_APP_API;

function TotalTweets() {
  const [sentimentData, setSentimentData] = useState({});
  const [topTweets, setTopTweets] = useState([]);
  const [sentimentOverTimeData, setSentimentOverTimeData] = useState({});
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
      setTopTweets(data.top_tweets);
      setSentimentOverTimeData({
        labels: data.sentiment_over_time.map(d => d._id),
        datasets: [
          {
            label: 'Sentimiento Promedio por Día',
            data: data.sentiment_over_time.map(d => d.average_sentiment),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          }
        ]
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
    <div className="dashboard-container">
      <h1 className="title">Twitter Sentiment Analysis and Statistics Dashboard</h1>
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <div className="top-section">
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
            <div className="top-tweets-table-container">
              <h2>Tweets con más RTs</h2>
              <table>
                <thead>
                  <tr>
                    <th>Texto del Tweet</th>
                    <th>RTs</th>
                  </tr>
                </thead>
                <tbody>
                  {topTweets.map((tweet, index) => (
                    <tr key={index}>
                      <td>{tweet.text}</td>
                      <td>{tweet.public_metrics.retweet_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="sentiment-over-time-chart">
            <h2>Variación de Sentimiento a lo Largo del Tiempo</h2>
            <Line data={sentimentOverTimeData} options={{
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
          </div>
        </>
      )}
    </div>
  );
}

export default TotalTweets;

import React, { useEffect, useState } from "react";
import "../styles/overview.css";
import { Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import '@fortawesome/fontawesome-free/css/all.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const API = process.env.REACT_APP_API;

function TotalTweets() {
  const [sentimentData, setSentimentData] = useState({});
  const [percentages, setPercentages] = useState([]);
  const [topTweets, setTopTweets] = useState([]);
  const [topNegativeTweets, setTopNegativeTweets] = useState([]);
  const [sentimentOverTimeData, setSentimentOverTimeData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const getSentimentCount = async () => {
    try {
      const response = await fetch(`${API}/sentiment_count`);
      const data = await response.json();

      const sentimentCounts = [data.positive_tweets, data.negative_tweets];
      const total = sentimentCounts.reduce((acc, val) => acc + val, 0);
      const percentages = sentimentCounts.map(val => ((val / total) * 100).toFixed(2));

      setSentimentData({
        labels: ['Positives', 'Negatives'],
        datasets: [{
          label: 'Number of Tweets',
          data: sentimentCounts,
          backgroundColor: ['#4CAF50', '#F44336'],
          borderColor: ['white'],
          borderWidth: 2
        }]
      });

      setPercentages(percentages);

      setTopTweets(data.top_tweets);
      setTopNegativeTweets(data.top_negative_tweets);

      const general = data.sentiment_over_time.general;
      const positive = data.sentiment_over_time.positive;
      const negative = data.sentiment_over_time.negative;

      setSentimentOverTimeData({
        labels: general.map(d => d._id),
        datasets: [
          {
            label: 'Average Sentiment',
            data: general.map(d => d.average_sentiment),
            tweetCount: general.map(d => d.tweet_count),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
          {
            label: 'Average Positive Sentiment',
            data: positive.map(d => d.average_sentiment),
            tweetCount: positive.map(d => d.tweet_count),
            borderColor: 'rgb(100, 181, 246)',
            backgroundColor: 'rgba(100, 181, 246, 0.5)',
          },
          {
            label: 'Average Negative Sentiment',
            data: negative.map(d => d.average_sentiment),
            tweetCount: negative.map(d => d.tweet_count),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          }
        ]
      });


      setIsLoading(false);
    } catch (error) {
      console.error("Error in obtaining sentiment data:", error);
    }
  };

  useEffect(() => {
    getSentimentCount();
  }, []);

  
  const doughnutOptions = {
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        onClick: null,
        position: 'bottom',
        labels: {
          boxWidth: 15,
          padding: 20,
          font: {
            size: 14
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => ({
                text: `${label}: ${percentages[i]}%`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].borderColor[i],
                lineWidth: data.datasets[0].borderWidth,
                hidden: isNaN(data.datasets[0].data[i]),
                index: i
              }));
            } else {
              return [];
            }
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += `${context.parsed} tweets`;
            }
            return label;
          }
        }
      }
    }
  };
  

  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    },
    tooltips: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function (tooltipItem, data) {
          const dataset = data.datasets[tooltipItem.datasetIndex];
          const value = dataset.data[tooltipItem.index].toFixed(2);
          const tweetCount = dataset.tweetCount ? dataset.tweetCount[tooltipItem.index] : 'N/A';
          return `${dataset.label}: ${value} (Tweets: ${tweetCount})`;
        }
      }
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="title">Twitter Sentiment Analysis Dashboard and Twitter Statistics</h1>
      {isLoading ? (
        <div className="processing-container">
          <i className="fas fa-spinner fa-spin"></i> Loading...
        </div>
      ) : (
        <>
          <div className="top-section">
            <div className="left-section">
              <div className="doughnut-chart-container">
                <h4 style={{ textAlign: 'center' }}>Positive vs Negative Tweets Analysis</h4>
                <Doughnut data={sentimentData} options={doughnutOptions} />
              </div>
            </div>
            <div className="right-section">
              <div className="top-tweets-table-container-positive">
                <h4 style={{ textAlign: 'center' }}>Tweets with Most Retweets (Positive)</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Text of the Tweet</th>
                      <th>Retweets</th>
                      <th>Sentiment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTweets.map((tweet, index) => (
                      <tr key={index}>
                        <td>{tweet.text}</td>
                        <td>{tweet.public_metrics.retweet_count}</td>
                        <td>{tweet.sentiment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="top-tweets-table-container-negative">
                <h4 style={{ textAlign: 'center' }}>Tweets with Most Retweets (Negative)</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Text of the Tweet</th>
                      <th>Retweets</th>
                      <th>Sentiment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topNegativeTweets.map((tweet, index) => (
                      <tr key={index}>
                        <td>{tweet.text}</td>
                        <td>{tweet.public_metrics.retweet_count}</td>
                        <td>{tweet.sentiment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="bottom-section">
            <div className="sentiment-over-time-chart">
              <h4>Variation of Sentiment over Time</h4>
              <Line data={sentimentOverTimeData} options={options} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TotalTweets;

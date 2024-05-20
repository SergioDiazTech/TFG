import React, { useEffect, useState } from "react";
import "../styles/dashboard.css";
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
      console.log(data);

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
            label: 'Positive average sentiment',
            data: positive.map(d => d.average_sentiment),
            tweetCount: positive.map(d => d.tweet_count),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
          {
            label: 'Average sentiment',
            data: general.map(d => d.average_sentiment),
            tweetCount: general.map(d => d.tweet_count),
            borderColor: 'rgb(100, 181, 246)',
            backgroundColor: 'rgba(100, 181, 246, 0.5)',
          },
          {
            label: 'Negative average sentiment',
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
        display: false,
      },
      animation: {
        animateScale: true,
        animateRotate: true
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
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.parsed.y.toFixed(2);
            const tweetCount = context.dataset.tweetCount[context.dataIndex];
            return `${label} ${value} (Tweets: ${tweetCount})`;
          }
        }
      }
    }
  };
  

  return (
    <div className="dashboard-container">
      <h1 className="title">X Sentiment Analysis Dashboard</h1>
      {isLoading ? (
        <div className="processing-container">
          <i className="fas fa-spinner fa-spin"></i> Loading...
        </div>
      ) : (
        <>
          <div className="top-section">
            <div className="left-section">
              <div className="doughnut-chart-container">
                <h4 style={{ textAlign: 'center' }}>Positive vs Negative Posts Analysis</h4>
                <Doughnut data={sentimentData} options={doughnutOptions} />
                <div className="chart-legend">
                  {sentimentData.labels && sentimentData.labels.map((label, index) => (
                    <div key={index} className="legend-item">
                      <span className="legend-color" style={{ background: sentimentData.datasets[0].backgroundColor[index] }}></span>
                      <span className="legend-label">{`${label}: ${percentages[index]}%`}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
            <div className="right-section">
              <div className="top-tweets-table-container-positive">
                <h4 style={{ textAlign: 'center' }}>Posts with Most Reposts (Positive)</h4>
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Text of the post</th>
                      <th>Reposts</th>
                      <th>Sentiment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTweets.map((tweet, index) => (
                      <tr key={index}>
                        <td>{'@'+tweet.user_of_tweet}</td>
                        <td>{tweet.text}</td>
                        <td>{tweet.public_metrics.retweet_count}</td>
                        <td>{tweet.sentiment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="top-tweets-table-container-negative">
                <h4 style={{ textAlign: 'center' }}>Posts with Most Reposts (Negative)</h4>
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Text of the post</th>
                      <th>Reposts</th>
                      <th>Sentiment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topNegativeTweets.map((tweet, index) => (
                      <tr key={index}>
                        <td>{'@'+tweet.user_of_tweet}</td>
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
              <p className="date-format-explanation">
                * The date format in the chart is Year-Month-Day-Time.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TotalTweets;

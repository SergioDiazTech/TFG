import React, { useEffect, useState } from 'react';
import WordCloud from 'react-wordcloud';
import "../styles/trendingtopics.css";
import { FaInfoCircle } from 'react-icons/fa';


const API = process.env.REACT_APP_API;

function Trendingtopics() {
  const [positiveWords, setPositiveWords] = useState([]);
  const [negativeWords, setNegativeWords] = useState([]);
  const [positiveHashtags, setPositiveHashtags] = useState([]);
  const [negativeHashtags, setNegativeHashtags] = useState([]);
  const [isPopupPositiveVisible, setIsPopupPositiveVisible] = useState(false);
  const [isPopupNegativeVisible, setIsPopupNegativeVisible] = useState(false);
  const [isPopupPositiveHashtagsVisible, setIsPopupPositiveHashtagsVisible] = useState(false);
  const [isPopupNegativeHashtagsVisible, setIsPopupNegativeHashtagsVisible] = useState(false);




  useEffect(() => {
    fetch(`${API}/trendingtopics`)
      .then(response => response.json())
      .then(data => {
        const positiveWordsData = processData(data.positive_words, 'word');
        const negativeWordsData = processData(data.negative_words, 'word');

        const positiveHashtagsData = data.hashtags_positives.map((hashtag, index) => ({
          text: hashtag.hashtag,
          value: hashtag.counts,
          rank: index + 1
        }));

        const negativeHashtagsData = data.hashtags_negatives.map((hashtag, index) => ({
          text: hashtag.hashtag,
          value: hashtag.counts,
          rank: index + 1
        }));

        setPositiveWords(positiveWordsData);
        setNegativeWords(negativeWordsData);
        setPositiveHashtags(positiveHashtagsData);
        setNegativeHashtags(negativeHashtagsData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const InfoPopup = ({ isVisible, children }) => {
    if (!isVisible) return null;

    return (
      <div className="info-popup">
        {children}
      </div>
    );
  };



  function processData(items, key) {
    const frequencyMap = {};
    items.forEach(item => {
      const word = item[key].toLowerCase();
      if (frequencyMap[word]) {
        frequencyMap[word]++;
      } else {
        frequencyMap[word] = 1;
      }
    });

    return Object.keys(frequencyMap).map(word => ({
      text: word,
      value: frequencyMap[word]
    })).sort((a, b) => b.value - a.value).slice(0, 20);
  }

  const wordCloudOptions = {
    rotations: 0,
    fontSizes: [15, 50],
    fontWeight: 'bold',
  };



  return (
    <div className="content-container">
      <div className="wordclouds-section">
        <div className="wordcloud-container" >
          <h2>Positive Words Cloud
            <span className="info-icon" onMouseEnter={() => setIsPopupPositiveVisible(true)} onMouseLeave={() => setIsPopupPositiveVisible(false)}>
              <FaInfoCircle />
            </span>
          </h2>
          <InfoPopup isVisible={isPopupPositiveVisible}>
            <p>This cloud visualizes the most frequent words in the most</p>
            <p>positively toned posts. Specifically, the data corresponding </p>
            <p>to the 5% of the most positive posts are shown, which is </p>
            <p>equal to the 95th percentile.</p>
          </InfoPopup>

          <WordCloud words={positiveWords} options={{ ...wordCloudOptions, colors: ["#B6D7A8", "#93C47D", "#6AA84F", "#38761D", "#274E13"] }} />
        </div>

        <div className="wordcloud-container" >
          <h2>Negative Words Cloud
            <span className="info-icon" onMouseEnter={() => setIsPopupNegativeVisible(true)} onMouseLeave={() => setIsPopupNegativeVisible(false)}>
              <FaInfoCircle />
            </span>
          </h2>
          <InfoPopup isVisible={isPopupNegativeVisible}>
            <p>This cloud visualizes the most frequent words in the most</p>
            <p>negatively toned posts. Specifically, it shows the data </p>
            <p>corresponding to the 5% of the most negative posts, which</p>
            <p>is equivalent to the 5th percentile.</p>
          </InfoPopup>
          <WordCloud words={negativeWords} options={{ ...wordCloudOptions, colors: ["#FF0000", "#D50000", "#B22222", "#8B0000", "#700000"] }} />
        </div>
      </div>

      <div className="tophashtags-section">
        <div className="hashtags-ranking" >
          <h2>Top Positive Hashtags
            <span className="info-icon" onMouseEnter={() => setIsPopupPositiveHashtagsVisible(true)} onMouseLeave={() => setIsPopupPositiveHashtagsVisible(false)}>
              <FaInfoCircle />
            </span>
          </h2>
          <InfoPopup isVisible={isPopupPositiveHashtagsVisible}>
            <p>A ranking of the most used hashtags</p>
            <p>in the top 5% of the most positive</p>
            <p>posts (95th percentile) is shown.</p>
          </InfoPopup>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Hashtag</th>
                <th>Times</th>
              </tr>
            </thead>
            <tbody>
              {positiveHashtags.map(hashtag => (
                <tr key={hashtag.text}>
                  <td>{hashtag.rank}</td>
                  <td>{hashtag.text}</td>
                  <td>{hashtag.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="hashtags-ranking">
          <h2>Top Negative Hashtags
            <span className="info-icon" onMouseEnter={() => setIsPopupNegativeHashtagsVisible(true)} onMouseLeave={() => setIsPopupNegativeHashtagsVisible(false)}>
              <FaInfoCircle />
            </span>
          </h2>

          <InfoPopup isVisible={isPopupNegativeHashtagsVisible}>
            <p>A ranking of the most frequently used</p>
            <p>hashtags in the top 5% of the most</p>
            <p>negative posts (5th percentile).</p>
          </InfoPopup>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Hashtag</th>
                <th>Times</th>
              </tr>
            </thead>
            <tbody>
              {negativeHashtags.map(hashtag => (
                <tr key={hashtag.text}>
                  <td>{hashtag.rank}</td>
                  <td>{hashtag.text}</td>
                  <td>{hashtag.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

}

export default Trendingtopics;

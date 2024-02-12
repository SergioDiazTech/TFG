import React, { useEffect, useState } from 'react';
import WordCloud from 'react-wordcloud';
import "../styles/trendingtopics.css";

const API = process.env.REACT_APP_API;

function Trendingtopics() {
  const [positiveWords, setPositiveWords] = useState([]);
  const [negativeWords, setNegativeWords] = useState([]);
  const [positiveHashtags, setPositiveHashtags] = useState([]);
  const [negativeHashtags, setNegativeHashtags] = useState([]);

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
    fontSizes: [25, 70],
    rotationAngles: [-90, 0, 90],
    fontWeight: 'bold',
  };

  return (
    <div className="content-container">
      <div className="wordcloud-container" style={{ height: '500px', width: '750px' }}>
        <h2>Positive Words Cloud</h2>
        <WordCloud words={positiveWords} options={{ ...wordCloudOptions, colors: ["#B6D7A8", "#93C47D", "#6AA84F", "#38761D", "#274E13"] }} />
        <div className="explanation-box">
          <p><b>Explanation</b>: This cloud visualizes the most frequent words in the most positively toned tweets.</p>
        </div>
      </div>

      <div className="hashtags-ranking" style={{ height: '500px', width: '750px' }}>
        <h2>Top Positive Hashtags</h2>
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

      <div className="wordcloud-container" style={{ height: '500px', width: '750px' }}>
        <h2>Negative Words Cloud</h2>
        <WordCloud words={negativeWords} options={{ ...wordCloudOptions, colors: ["#FF0000", "#D50000", "#B22222", "#8B0000", "#700000"] }} />
        <div className="explanation-box">
          <p><b>Explanation</b>: This cloud visualizes the most frequent words in the most negatively toned tweets.</p>
        </div>
      </div>

      

      <div className="hashtags-ranking"  style={{ height: '500px', width: '750px' }}>
        <h2>Top Negative Hashtags</h2>
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
  );
}

export default Trendingtopics;

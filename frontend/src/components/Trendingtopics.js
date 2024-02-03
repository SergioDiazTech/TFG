import React, { useEffect, useState } from 'react';
import WordCloud from 'react-wordcloud';
import "../styles/trendingtopics.css";

const API = process.env.REACT_APP_API;

function Trendingtopics() {
  const [positiveWords, setPositiveWords] = useState([]);
  const [negativeWords, setNegativeWords] = useState([]);
  const [hashtags, setHashtags] = useState([]);

  useEffect(() => {
    fetch(`${API}/trendingtopics`)
      .then(response => response.json())
      .then(data => {
        const positiveWordsData = processData(data.positive_words, 'word');
        const negativeWordsData = processData(data.negative_words, 'word');

        
        const hashtagsData = data.hashtags.map(hashtag => ({
          text: hashtag.hashtag,
          value: hashtag.counts
        }));

        setPositiveWords(positiveWordsData);
        setNegativeWords(negativeWordsData);
        setHashtags(hashtagsData);
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
    return Object.keys(frequencyMap).map(word => {
      return { text: word, value: frequencyMap[word] };
    });
  }

  function generateRandomColors(length) {
    return Array.from({ length }, () => '#' + Math.floor(Math.random() * 16777215).toString(16));
  }

  const positiveWordsOptions = {
    fontSizes: [10, 80],
    rotations: 0,
    rotationAngles: [-90, 0, 90],
    fontWeight: 'bold',
    colors: generateRandomColors(positiveWords.length),
  };

  const negativeWordsOptions = {
    fontSizes: [10, 80],
    rotations: 0,
    rotationAngles: [-90, 0, 90],
    fontWeight: 'bold',
    colors: generateRandomColors(negativeWords.length),
  };

  return (
    <div className="content-container">
      <div className="wordcloud-container" style={{ height: '600px', width: '800px' }}>
        <h2>Positive Words Cloud</h2>
        <WordCloud words={positiveWords} options={positiveWordsOptions} />
        <h2>Negative Words Cloud</h2>
        <WordCloud words={negativeWords} options={negativeWordsOptions} />
      </div>

      <div className="hashtags-ranking">
        <h2>Top Hashtags</h2>
        <table>
          <thead>
            <tr>
              <th>Hashtag</th>
              <th>TIMES</th>
            </tr>
          </thead>
          <tbody>
            {hashtags.map(hashtag => (
              <tr key={hashtag.text}>
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

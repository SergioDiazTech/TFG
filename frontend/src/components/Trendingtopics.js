import React, { useEffect, useState } from 'react';
import WordCloud from 'react-wordcloud';
import "../styles/trendingtopics.css";

const API = process.env.REACT_APP_API;

function Trendingtopics() {
  const [words, setWords] = useState([]);
  const [hashtags, setHashtags] = useState([]);

  useEffect(() => {
    fetch(`${API}/trendingtopics`)
      .then(response => response.json())
      .then(data => {
        const wordsData = processData(data.words, 'word');

        const hashtagsData = data.hashtags.map(hashtag => ({
          text: hashtag.hashtag,
          value: hashtag.counts
        }));

        setWords(wordsData);
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



  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const options = {
    fontSizes: [10, 80],
    rotations: 3,
    rotationAngles: [-90, 0, 90],
    fontWeight: 'bold',
    colors: words.map(() => getRandomColor()),
  };

  return (
    <div className="content-container">
      <div className="wordcloud-container" style={{ height: '600px', width: '800px' }}>
        <h2>WordCloud</h2>
        <WordCloud words={words} options={options} />
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

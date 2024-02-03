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


    const sortedFrequencyArray = Object.keys(frequencyMap)
      .map(word => {
        return { text: word, value: frequencyMap[word] };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 25);

    return sortedFrequencyArray;
  }


    const positiveColors = [
      "#6AA84F", "#38761D", "#274E13", "#4CBB17", "#32CD32",
      "#B6D7A8", "#93C47D", "#6AA84F", "#38761D", "#274E13"
    ];

    const negativeColors = [
      "#FF6F61", "#C74444", "#990000", "#FF1E1E", "#FF4C4C",
      "#FF0000", "#D50000", "#B22222", "#8B0000", "#700000"
    ];


  const positiveWordsOptions = {
    fontSizes: [40, 80],
    rotations: 0,
    rotationAngles: [-90, 0, 90],
    fontWeight: 'bold',
    colors: positiveColors,
  };

  const negativeWordsOptions = {
    fontSizes: [20, 50],
    rotations: 0,
    rotationAngles: [-90, 0, 90],
    fontWeight: 'bold',
    colors: negativeColors,
  };

  return (
    <div className="content-container">
      <div className="wordcloud-container" style={{ height: '600px', width: '800px' }}>
        <h2>Positive Words Cloud</h2>
        <WordCloud words={positiveWords} options={positiveWordsOptions} />
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

      <div className="wordcloud-container" style={{ height: '600px', width: '800px' }}>
        <h2>Negative Words Cloud</h2>
        <WordCloud words={negativeWords} options={negativeWordsOptions} />
      </div>


      
      
      
    </div>
  );
}

export default Trendingtopics;

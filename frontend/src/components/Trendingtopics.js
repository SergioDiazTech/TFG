import React, { useEffect, useState } from 'react';
import WordCloud from 'react-wordcloud';

const API = process.env.REACT_APP_API;

function Trendingtopics() {
  const [words, setWords] = useState([]);

  useEffect(() => {
    fetch(`${API}/trendingtopics`)
      .then(response => response.json())
      .then(data => {
        const frequencyMap = {};
        data.data.forEach(item => {
          const word = item.word.toLowerCase();
          if (frequencyMap[word]) {
            frequencyMap[word]++;
          } else {
            frequencyMap[word] = 1;
          }
        });

        const wordsData = Object.keys(frequencyMap).map(word => {
          return { text: word, value: frequencyMap[word] };
        });

        setWords(wordsData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);


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
    colors: words.map(() => getRandomColor()), // Asigna un color aleatorio a cada palabra
  };

  return (
    <div className="wordcloud-container" style={{ height: '600px', width: '800px' }}>
      <WordCloud
        words={words}
        options={options}
        onMouseOver={(word, event) => {
            // Muestra un tooltip o realiza alguna acción cuando el usuario pasa el ratón sobre una palabra
    console.log(`Mouse over: ${word.text}`);
  }}
/>
    </div>
  );
}

export default Trendingtopics;

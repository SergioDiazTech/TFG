import React, { useEffect, useState } from "react";
import "../App.css";

const API = process.env.REACT_APP_API;
const TWEETS_PER_PAGE = 10;

function Tweets() {
  // Estado para almacenar los tweets, la página actual y si se están cargando más tweets
  const [tweets, setTweets] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);


  // Función para obtener tweets de la API
  const getTweets = async (page, per_page) => {
    try {
      const response = await fetch(`${API}/tweets?page=${page}&per_page=${per_page}`);
      const data = await response.json();
      setTweets(data);
      setIsLoading(false);
    } catch (error) {
      console.log('API:', API);
      console.error('Error al obtener los tweets:', error);
    }
  };

  const loadMoreTweets = async () => {
    setIsLoading(true);
    setPage(page + 1);

    try {
      const response = await fetch(`${API}/tweets?page=${page}&per_page=${TWEETS_PER_PAGE}`);
      const data = await response.json();
      
      // Agregamos los nuevos tweets a los ya existentes y limitamos el número
      setTweets((prevTweets) => [...prevTweets, ...data]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar más tweets:', error);
    }
  };

  useEffect(() => {
    getTweets(page, TWEETS_PER_PAGE);
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <h1 className="title">INFORMACIÓN SOBRE EL CONJUNTO DE DATOS: COLOMBIA</h1>
      <table className="tweet-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Sentiment positive</th>
            <th>Sentiment negative</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>
          {tweets.map((tweet, index) => (
            <tr key={tweet.id}>
              <td>{index + 1}</td>
              <td>{tweet.sentiment.positive}</td>
              <td>{tweet.sentiment.negative}</td>
              <td>{tweet.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {tweets.length >= page * TWEETS_PER_PAGE && (
        <div className="button-container">
          <button onClick={loadMoreTweets} disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Tweets;

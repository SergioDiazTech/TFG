import React, { useEffect, useState } from "react";
import "../App.css";

const API = process.env.REACT_APP_API;
const TWEETS_PER_PAGE = 10;

function Tweets() {
  const [tweets, setTweets] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Función para obtener los tweets
  const getTweets = async () => {
    try {
      const response = await fetch(`${API}/tweets`);
      const data = await response.json();
      setTweets(data);
      setIsLoading(false);
    } catch (error) {
      console.log('API:', API);
      console.error('Error al obtener los tweets:', error);
    }
  };

  // Función para cargar más tweets
  const loadMoreTweets = async () => {
    setIsLoading(true);
    setPage(page + 1);
    const startIndex = (page + 1) * TWEETS_PER_PAGE;
    const endIndex = startIndex + TWEETS_PER_PAGE;

    try {
      const response = await fetch(`${API}/tweets`);
      const data = await response.json();
      setTweets((prevTweets) => [...prevTweets, ...data].slice(0, endIndex));
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar más tweets:', error);
    }
  };

  useEffect(() => {
    // Cargar los tweets al cargar el componente
    getTweets();
  }, []);

  return (
    <div>
      <h1 className="title">Tweets cargados actualmente</h1>
      <table className="tweet-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Sentiment Rate</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {tweets.slice(0, page * TWEETS_PER_PAGE).map((tweet, index) => (
            <tr key={tweet.id}>
              <td>{index + 1}</td>
              <td>{tweet.Compound}</td>
              <td>{tweet.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {tweets.length > page * TWEETS_PER_PAGE && (
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

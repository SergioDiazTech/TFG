import React, { useEffect, useState } from "react";
import "../App.css";

const API = process.env.REACT_APP_API;
const TWEETS_PER_PAGE = 10;

function Tweets() {
  const [tweets, setTweets] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

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
      <h1 className="title">SENTIMENT RATE EN BASE AL TEXTO DE LOS TWEETS DEL CONJUNTO DE DATOS: COLOMBIA</h1>
      <table className="tweet-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Sentiment</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>
          {tweets.map((tweet, index) => (
            <tr key={tweet.id}>
              <td>{index + 1}</td>
              <td>
                {tweet.sentiment >= 0 ? (
                  <span className="green-circle"></span>
                ) : (
                  <span className="red-circle"></span>
                )}
                <span>{tweet.sentiment}</span>
              </td>
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

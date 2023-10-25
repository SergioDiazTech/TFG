import React, { useState } from 'react';

const API = process.env.REACT_APP_API;

function Twitter_API() {
  const [keyword, setKeyword] = useState('');
  const [numeroDeTweets, setNumeroDeTweets] = useState('');
  const [message, setMessage] = useState('');



  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Realizar la solicitud a la API de Twitter
    fetch(`${API}/twitterapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword,
        numeroDeTweets,
      }),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        // Actualizar el mensaje en el estado
        setMessage(data.message);
      } else {
        // Actualizar los tweets en el estado
        setMessage("Los tweets no se han cargado correctamente");
      }
    })
    .catch((error) => {
      console.error('Error al obtener los tweets:', error);
    });
};

  return (
    <div className="containerApiTwitter">
      <h1>Fetch Tweets from the Twitter API</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label htmlFor="keyword" className="label">
            Keyword
          </label>
          <input
            type="text"
            id="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="numeroDeTweets" className="label">
            Number of tweets to retrieve
          </label>
          <input
            type="number"
            id="numeroDeTweets"
            value={numeroDeTweets}
            onChange={(e) => setNumeroDeTweets(e.target.value)}
            className="input"
          />
        </div>
        <button type="submit" className="btnApiTwitter">
          Fetch tweets
        </button>
      </form>
      {message && <p className="messageApiTwitter">{message}</p>}
    </div>
  );

}

export default Twitter_API;

import React, { useState } from 'react';
import "../styles/twitterApi.css"

const API = process.env.REACT_APP_API;

function Twitter_API() {
  const [keyword, setKeyword] = useState('');
  const [numeroDeTweets, setNumeroDeTweets] = useState('');
  const [customName, setCustomName] = useState('');
  const [message, setMessage] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (parseInt(numeroDeTweets) <= 0) {
      setMessage("Please enter a number of posts greater than zero.");
      return;
    }

    setMessage("Processing your request...");

    fetch(`${API}/twitterapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword,
        numeroDeTweets,
        customName,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        console.error('Error while fetching the posts:', error);
        setMessage("Error loading the posts.");
      });
  };

  return (
    <div className="containerApiTwitter">
      <h1>Fetch Posts from the X API</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label htmlFor="keyword" className="label">
            Keyword
          </label>
          <input
            type="text"
            id="keyword"
            placeholder="Please enter the keyword to search for tweets"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="numeroDeTweets" className="label">
            Number of posts to retrieve
          </label>
          <input
            type="number"
            id="numeroDeTweets"
            placeholder="Please enter the number of tweets you wish to retrieve"
            value={numeroDeTweets}
            onChange={(e) => setNumeroDeTweets(e.target.value)}
            className="input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="customName" className="label">Custom Name for Ingestion</label>
          <input
            type="text"
            id="customName"
            placeholder="Enter a custom name for this ingestion"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="input"
          />
        </div>
        <button type="submit" className="btnApiTwitter">
          Fetch posts
        </button>
      </form>
      {message && <p className="messageApiTwitter">{message}</p>}
    </div>
  );
}

export default Twitter_API;

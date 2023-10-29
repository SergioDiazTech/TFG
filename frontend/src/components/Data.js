import React, { useEffect, useState } from "react";
import "../App.css";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";

const API = process.env.REACT_APP_API;
const TWEETS_PER_PAGE = 5;

function Data() {
  const [tweets, setTweets] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [sortOrder, setSortOrder] = useState("asc");

  const getTweets = async (page, per_page) => {
    try {
      const response = await fetch(
        `${API}/tweets?page=${page}&per_page=${per_page}&sortOrder=${sortOrder}`
      );
      const data = await response.json();
      setTweets(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al obtener los tweets:", error);
    }
  };

  const [totalTweetsLoaded, setTotalTweetsLoaded] = useState(0);

  const loadMoreTweets = async () => {
    setIsLoading(true);
    const newPage = page + 1;

    try {
      const response = await fetch(
        `${API}/tweets?page=${newPage}&per_page=${TWEETS_PER_PAGE}`
      );
      const data = await response.json();

      // Calcula el número total de tweets que has cargado
      const newTotalTweetsLoaded = totalTweetsLoaded + data.length;

      setTweets((prevTweets) => [...prevTweets, ...data]);
      setPage(newPage);
      setTotalTweetsLoaded(newTotalTweetsLoaded);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar más tweets:", error);
    }
  };

  useEffect(() => {
    getTweets(page, TWEETS_PER_PAGE);
    // eslint-disable-next-line
  }, [sortOrder]);

  const handleSortClick = () => {
    if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortOrder("asc");
    }
  };

  const sortedTweets = [...tweets];
  
  sortedTweets.sort((a, b) => {
    if (sortOrder === "asc") {
      return a.sentiment - b.sentiment;
    } else {
      return b.sentiment - a.sentiment;
    }
  });

  return (
    <div>
      <h1 className="title">Sentiment Rate for Text in Dataset: COLOMBIA</h1>
      <table className="tweet-table">
        <thead>
          <tr>
            <th>#</th>
            <th onClick={handleSortClick}>
              <div style={{ display: "flex", alignItems: "center" }}>
                Sentiment
                {sortOrder === "asc" ? <GoTriangleDown /> : <GoTriangleUp />}
              </div>
            </th>
            <th>Text</th>
            <th>Retweets</th>
          </tr>
        </thead>
        <tbody>
          {sortedTweets.map((tweet, index) => (
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
              <td style={{ textAlign: "left" }}>{tweet.text}</td>
              <td>{tweet.public_metrics.retweet_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {tweets.length >= page * TWEETS_PER_PAGE && (
        <div className="button-container">
          <button onClick={loadMoreTweets} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Data;

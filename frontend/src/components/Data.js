import React, { useEffect, useState, useCallback } from "react";
import "../styles/App.css";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";

const API = process.env.REACT_APP_API;
const TWEETS_PER_PAGE = 5;

function Data() {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");

  const getTweets = useCallback(async (page, per_page) => {
    try {
      if (!selectedCollection) {
        const response = await fetch(`${API}/tweetsData`);
        const data = await response.json();
        setCollections(data);
        setIsLoading(false);
      } else {
        const response = await fetch(`${API}/tweetsData/${selectedCollection}?page=${page}&per_page=${per_page}`);
        const data = await response.json();
        if (data.length > 0) {
          setTweets((prevTweets) => [...prevTweets, ...data]);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Error al obtener los tweets:", error);
    }
  }, [selectedCollection]);

  const handleSortClick = () => {
    if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    setPage(1);
    setTweets([]);
    setIsLoading(true);
    getTweets(1, TWEETS_PER_PAGE);
  }, [selectedCollection, getTweets]);

  const handleCollectionSelect = (collectionName) => {
    let collectionToUse = collectionName === 'Colombia' ? 'tweets_colombia' : collectionName;
    setSelectedCollection(collectionToUse);
  };

  const sortedTweets = [...tweets];
  sortedTweets.sort((a, b) => {
    return sortOrder === "asc" ? a.sentiment - b.sentiment : b.sentiment - a.sentiment;
  });

  const loadMoreTweets = async () => {
    setIsLoading(true);
    const newPage = page + 1;

    try {
      const response = await fetch(`${API}/tweetsData/${selectedCollection}?page=${newPage}&per_page=${TWEETS_PER_PAGE}`);
      const data = await response.json();
      if (data.length > 0) {
        setTweets((prevTweets) => [...prevTweets, ...data]);
        setPage(newPage);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error al cargar más tweets:", error);
    }
  };

  return (
    <div>
      {!selectedCollection ? (
        <div className="collections-container">
          <h1 className="title">Select a Collection</h1>
          <ul className="collections-list">
            {collections.map((collection) => (
              <li key={collection} onClick={() => handleCollectionSelect(collection)}>
                <div className="collection-card">
                  <div className="collection-icon">{}</div>
                  <div className="collection-name">{collection}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h1 className="title">Sentiment Rate for Text in Collection: {selectedCollection}</h1>
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
                    {tweet.sentiment >= -0.51 && tweet.sentiment <= 0.51 ? (
                      <span className="yellow-circle"></span>
                    ) : tweet.sentiment > 0.51 ? (
                      <span className="green-circle"></span>
                    ) : (
                      <span className="red-circle"></span>
                    )}
                    <span>{tweet.sentiment}</span>
                  </td>
                  <td style={{ textAlign: "left" }}>{tweet.text}</td>
                  <td>{tweet.public_metrics ? tweet.public_metrics.retweet_count : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {tweets.length >= page * TWEETS_PER_PAGE && (
            <div className="button-container">
              <button className="button-load-more" onClick={loadMoreTweets} disabled={isLoading}>
                {isLoading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Data;

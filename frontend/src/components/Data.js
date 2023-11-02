import React, { useEffect, useState, useCallback } from "react";
import "../App.css";
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
        const response = await fetch(`${API}/tweets`);
        const data = await response.json();
        setCollections(data);
        setIsLoading(false);
      } else {
        const response = await fetch(`${API}/tweets/${selectedCollection}?page=${page}&per_page=${per_page}`);
        const data = await response.json();

        // Verifica si hay nuevos datos para evitar duplicados
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
    // Reiniciar la página cuando se selecciona una nueva colección
    setPage(1);
    setTweets([]);
    setIsLoading(true);
    getTweets(1, TWEETS_PER_PAGE); // Llama a getTweets al renderizar el componente y cuando se selecciona una colección.
  }, [selectedCollection, getTweets]);

  const sortedTweets = [...tweets];

  sortedTweets.sort((a, b) => {
    if (sortOrder === "asc") {
      return a.sentiment - b.sentiment;
    } else {
      return b.sentiment - a.sentiment;
    }
  });

  const loadMoreTweets = async () => {
    setIsLoading(true);
    const newPage = page + 1;

    try {
      const response = await fetch(`${API}/tweets/${selectedCollection}?page=${newPage}&per_page=${TWEETS_PER_PAGE}`);
      const data = await response.json();

      // Verifica si hay nuevos datos para evitar duplicados
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
              <li key={collection} onClick={() => { setSelectedCollection(collection); getTweets(page, TWEETS_PER_PAGE); }}>
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
                    {tweet.sentiment >= 0 ? (
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

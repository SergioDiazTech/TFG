import React, { useState, useEffect, useRef } from "react";
import "../styles/users.css"

const API = process.env.REACT_APP_API;
const USERS_PER_PAGE = 5;

function Users() {
  const [selectedOption, setSelectedOption] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadedUsernames = useRef(new Set());

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    setUsers([]);
    setPage(1);
    setIsLoading(true);
    loadedUsernames.current.clear();
  };

  const getUsers = async (page, per_page) => {
    try {
      let option = selectedOption;
      if (selectedOption === 'mostFollowers') {
        option = 'mostFollowers';
      }
      const response = await fetch(`${API}/users?option=${option}&page=${page}&per_page=${per_page}`);
      const data = await response.json();

      const currentUsersSet = new Set(users.map(user => user.username));

      const newUsers = data.filter((user) => !currentUsersSet.has(user.username));

      setUsers((prevUsers) => [...prevUsers, ...newUsers]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  };

  const loadMoreUsers = () => {
    setIsLoading(true);
    setPage(page + 1);
  };

  useEffect(() => {
    if (selectedOption) {
      getUsers(page, USERS_PER_PAGE);
    }
    // eslint-disable-next-line
  }, [selectedOption, page]);

  return (
    <div>
      <h1 className="title">USER INFORMATION</h1>
      <select className="user-selector" value={selectedOption} onChange={handleOptionChange}>
        <option value="">Select an option</option>
        <option value="all">All Users</option>
        <option value="mostRelevant">Most Influential Users</option>
        <option value="mostFollowers">Users with Most Followers</option>
        <option value="positiveReputation">Users with Positive Reputation</option>
        <option value="negativeReputation">Users with Negative Reputation</option>
      </select>
      {selectedOption === "mostFollowers" ? (
        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Number of Followers</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, USERS_PER_PAGE * page).map((user, index) => (
              <tr key={user.id}>
                <td>{index+1}</td>
                <td>{user.username}</td>
                <td>{user.public_metrics.followers_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className="user-list">
          {users.slice(0, USERS_PER_PAGE * page).map((user, index) => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      )}
      {users.length > USERS_PER_PAGE * (page - 1) && (
        <div className="button-container">
          <button className="button-load-more" onClick={loadMoreUsers} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Users;

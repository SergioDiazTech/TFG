import React, { useState, useEffect, useRef } from "react";

const API = process.env.REACT_APP_API;
const USERS_PER_PAGE = 10;

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
      <h1 className="title">INFORMACIÓN ACERCA DE LOS USUARIOS</h1>
      <select className="selector-users" value={selectedOption} onChange={handleOptionChange}>
        <option value="">Selecciona la opción que desees</option>
        <option value="all">Todos los usuarios</option>
        <option value="mostRelevant">Usuarios con mayor repercusión</option>
        <option value="mostFollowers">Usuarios con mayor número de seguidores</option>
        <option value="positiveReputation">Usuarios con mayor repercusión positiva</option>
        <option value="negativeReputation">Usuarios con mayor repercusión negativa</option>
      </select>
      {selectedOption === "mostFollowers" ? (
        <table className="user-table">
          <thead>
            <tr>
              <th>Nombre de Usuario</th>
              <th>Número de Seguidores</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, USERS_PER_PAGE * page).map((user, index) => (
              <tr key={user.id}>
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
          <button onClick={loadMoreUsers} disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Users;

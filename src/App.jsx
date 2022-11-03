import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './assets/styles/main.scss';

import UsersTable from './components/UsersTable';
import useAxios from './hooks/useAxios.js';

/** Valtio */
import { proxy, useSnapshot } from "valtio";
import { devtools } from "valtio/utils";

const state = proxy({ users: null });
const unsub = devtools(state, { name: "state name", enabled: true });

const App = () => {
  const snap = useSnapshot(state);
  const { response, error, loading } = useAxios({
    method: 'GET',
    url: 'https://randomuser.me/api/?results=10',
  });

  const redefineUsers = (users) => {
    return users.map((user, key) =>
    ({
      key: key,
      uuid: uuidv4(),
      name: `${user.name.last} ${user.name.first}`,
      email: user.email,
      userImage: user.picture.medium,
      location: `${user.location.country}, ${user.location.city}, ${user.location.street.name} ${user.location.street.number}.`,
    })
    )
  }

  useEffect(() => {
    if (response) {
      state.users = redefineUsers(response.results);
    }
  }, [response])

  return (
    <div className="App">
      {loading && <div className="loading">loading...</div>}
      {snap.users && <UsersTable data={snap.users} state={state}/>}
      {error && <div className="error">error...</div>}
    </div>
  )
}

export default App

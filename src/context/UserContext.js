import { createContext, useContext, useState } from 'react';
import SoTApi from '../services/SoTApi';

export const UserContext = createContext();

export const useGetUser = () => {
  const { user } = useContext(UserContext);

  return user;
};

export const useSetUser = () => {
  const { setUser } = useContext(UserContext);

  return user => setUser(user);
}

export const useLoadUser = () => {
  const { setUser } = useContext(UserContext);

  return () => {
    SoTApi.getUser().then(data => {
      const { user } = data;
      setUser(user);
    });
  }
}

export default function UserContextProvider(props) {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {props.children}
    </UserContext.Provider>
  );
};
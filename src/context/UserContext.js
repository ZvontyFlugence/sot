import { createContext, useContext, useLayoutEffect, useState } from 'react';
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

  useLayoutEffect(() => {
    let timer;
    setTimeout(() => {
      timer = setInterval(() => {
        SoTApi.validate().then(data => {
          if (!data.err && data.user) {
            setUser(data.user);
          }
        }); 
      }, 120000);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {props.children}
    </UserContext.Provider>
  );
};
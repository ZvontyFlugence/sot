import { createContext, useContext, useState } from 'react';

export const NotificationContext = createContext(undefined);

export const useNotification = () => {
  const { notification } = useContext(NotificationContext);

  return notification;
}

export const useSetNotification = () => {
  const { setNotification } = useContext(NotificationContext);

  return notification => setNotification(notification);
}

export default function NotificationContextProvider({ children }) {
  const [notification, setNotification] = useState(undefined);

  return (
    <NotificationContext.Provider value={{ notification, setNotification }}>
      { children }
    </NotificationContext.Provider>
  );
}

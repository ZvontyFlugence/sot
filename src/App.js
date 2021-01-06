import UserContextProvider from './context/UserContext';
import NotificationContextProvider from './context/NotificationContext';
import Routes from './Routes';
import NotificationDisplay from './components/NotificationDisplay';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-contexify/dist/ReactContexify.css';
import 'flag-icon-css/sass/flag-icon.scss';
import './styles/layout.scss';
import './styles/images.scss';

export default function App() {
  return (
    <NotificationContextProvider>
      <NotificationDisplay />
      <UserContextProvider>
        <Routes />
      </UserContextProvider>
    </NotificationContextProvider>
  );
};

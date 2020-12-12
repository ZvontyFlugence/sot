import { useEffect } from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';

import PublicRoute from './guards/PublicRoute';
import PrivateRoute from './guards/PrivateRoute';
import Footer from './layout/Footer';

import { useGetUser, useSetUser } from './context/UserContext';
import SoTApi from './services/SoTApi';

import Home from './views/Homepage';
import Login from './views/Login';

import Alerts from './views/Alerts';
import Company from './views/Company';
import Dashboard from './views/Dashboard';
import Mail from './views/Mail';
import MailThread from './views/MailThread';
import Market from './views/Market';
import MyCompanies from './views/MyCompanies';
import MyHome from './views/MyHome';
import NotFound from './views/NotFound';
import Profile from './views/Profile';
import Rankings from './views/Rankings';
import Register from './views/Register';
import Settings from './views/Settings';
import World from './views/World';


export default function Routes() {
  const user = useGetUser();
  const setUser = useSetUser();

  useEffect(() => {
    if (user === null && !!localStorage.getItem('token')) {
      // TODO: Validate User
      SoTApi.setToken(localStorage.getItem('token'));
      SoTApi.validate().then(data => {
        if (!data.err) {
          setUser(data.user);
        }
      })
    }
  }, [user, setUser]);

  return (
    <Router>
      <div id="app">
        <div id="body">
          <Switch>
            <PublicRoute exact path='/' component={Home} />
            <PublicRoute path='/login' component={Login} />
            <PublicRoute path='/register' component={Register} />
            <PrivateRoute path='/alerts' component={Alerts} />
            <PrivateRoute path='/companies' component={MyCompanies} />
            <PrivateRoute path='/company/:id' component={Company} />
            <PrivateRoute path='/dashboard' component={Dashboard} />
            <PrivateRoute path='/home' component={MyHome} />
            <PrivateRoute exact path='/mail' component={Mail} />
            <PrivateRoute path='/mail/thread/:id' component={MailThread} />
            <PrivateRoute path='/market' component={Market} />
            <PrivateRoute path='/profile/:id' component={Profile} />
            <PrivateRoute path='/rankings' component={Rankings} />
            <PrivateRoute path='/settings' component={Settings} />
            <PrivateRoute path='/world' component={World} />
            <PublicRoute path='*' component={NotFound} />
          </Switch>
        </div>
        <Footer />
      </div>
    </Router>
  );
};
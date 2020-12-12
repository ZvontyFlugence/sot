import React from 'react';
import { useGetUser } from '../context/UserContext';
import { Route, Redirect } from 'react-router-dom';

import PrivateNav from '../layout/PrivateNav';

export default function PrivateRoute({ component, ...rest }) {
  const user = useGetUser();
  const Component = component;

  return (
    <Route {...rest} component={(props) => (
      user !== null ? (
        <>
          <PrivateNav />
          <Component {...props} />
        </>
      ) : (
        <Redirect to="/login" />
      )
    )} />
  );
}
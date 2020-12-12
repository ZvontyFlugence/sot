import { useGetUser } from '../context/UserContext';
import { Route, Redirect } from 'react-router-dom';

import PublicNav from '../layout/PublicNav';

export default function PublicRoute({ component, ...rest }) {
  const user = useGetUser();
  const Component = component;

  return (
    <Route {...rest} component={(props) => (
      user === null ? (
        <>
          <PublicNav />
          <Component {...props} />
        </>
      ) : (
        <Redirect to="/dashboard" />
      )
    )} />
  );
}
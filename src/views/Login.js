import { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  Button,
  Form,
  Grid,
  Header
} from 'semantic-ui-react';

import SoTApi from '../services/SoTApi';
import { useSetUser } from '../context/UserContext';
import { useSetNotification } from '../context/NotificationContext';

export default function Login() {
  let history = useHistory();
  const setNotification = useSetNotification();
  const setUser = useSetUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = e => {
    e.preventDefault();
    const credentials = { email, password };

    SoTApi.login(credentials)
      .then(data => {
        if (data && !data.err) {
          localStorage.setItem('token', data.token);
          SoTApi.setToken(data.token);
          setUser(data.user);
          setNotification({ type: 'success', header: 'Login Successful', content: `Welcome, ${data.user.displayName}` })
        }
      })
      .then(() => history.push('/dashboard'))
      .catch(error => {
        if (error && error.response) {
          let data = error.response.data;
          setNotification({ type: 'error', header: 'Login Failed', content: data.error });
        } else {
          setNotification({ type: 'error', header: 'Login Failed', content: 'Server Error' });
        }
      });
  }

  return (
    <div id='login'>
      <Grid centered>
        <Grid.Row>
          <Grid.Column mobile={12} computer={6}>
            <Header as='h1'>Login</Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column mobile={12} computer={6}>
            <Form>
              <Form.Field>
                <label>Email</label>
                <Form.Input placeholder='Email' onChange={e => setEmail(e.target.value)} />
              </Form.Field>
              <Form.Field>
                <label>Password</label>
                <Form.Input type='password' onChange={e => setPassword(e.target.value)} />
              </Form.Field>
              <Button type='submit' onClick={handleLogin} color='green'>Login</Button>
            </Form>
            <span>
              Don't have an account?
              <Link to='/register'> Register</Link>
            </span>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};
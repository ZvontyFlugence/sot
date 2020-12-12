import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import SoTApi from '../services/SoTApi';

import {
  Button,
  Form,
  Grid,
  Header,
  Message
} from 'semantic-ui-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (confirm && password && confirm !== password) {
      setError('Passwords Do Not Match');
    } else {
      setError('');
    }
  }, [password, confirm]);

  const handleRegister = e => {
    e.preventDefault();
    let payload = { username, email, password };

    SoTApi.register(payload).then(data => {
      if (data.success) {
        // Display success notification
        // Redirect to dashboard or login depending on if we get token on register
      }
    });
  }

  return (
    <div id='register'>
      <Grid centered>
        <Grid.Row>
          <Grid.Column mobile={12} computer={6}>
            <Header as='h1'>Register</Header>
          </Grid.Column>
        </Grid.Row>
        {error && (
          <Grid.Row>
            <Grid.Column mobile={12} computer={6}>
              <Message negative visible header={error} />
            </Grid.Column>
          </Grid.Row>
        )}
        <Grid.Row>
          <Grid.Column mobile={12} computer={6}>
            <Form>
              <Form.Field>
                <label>Username</label>
                <Form.Input
                  placeholder='Username'
                  onChange={e => setUsername(e.target.value)}
                />
              </Form.Field>
              <Form.Field>
                <label>Email</label>
                <Form.Input
                  placeholder='Email'
                  type='email'
                  onChange={e => setEmail(e.target.value)}
                />
              </Form.Field>
              <Form.Field>
                <label>Password</label>
                <Form.Input
                  type='password'
                  onChange={e => setPassword(e.target.value)}
                />
              </Form.Field>
              <Form.Field>
                <label>Confirm</label>
                <Form.Input
                  type='password'
                  onChange={e => setConfirm(e.target.value)}
                />
              </Form.Field>
              <Button type='submit' onClick={handleRegister} color='blue'>Register</Button>
            </Form>
            <span>
              Already have an account?
              <Link to='/login'> Login</Link>
            </span>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};
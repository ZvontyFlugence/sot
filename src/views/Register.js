import { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useSetNotification } from '../context/NotificationContext';
import SoTApi from '../services/SoTApi';

import {
  Button,
  Dropdown,
  Form,
  Grid,
  Header,
  Message
} from 'semantic-ui-react';

export default function Register() {
  const history = useHistory();
  const setNotification = useSetNotification();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [country, setCountry] = useState(1);
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (confirm && password && confirm !== password) {
      setError('Passwords Do Not Match');
    } else {
      setError('');
    }
  }, [password, confirm]);

  useEffect(() => {
    SoTApi.getCountries().then(data => {
      if (data.countries) {
        setCountries(data.countries.map(c => {
          return {
            ...c,
            value: c._id,
            text: (
              <Dropdown.Item key={c._id} value={c._id}>
                <i className={`flag-icon flag-icon-${c.flag_code} flag-inline-left`} />
                &nbsp;
                { c.name }
              </Dropdown.Item>
            ),
          };
        }));
      }
    })
  }, []);

  const handleRegister = e => {
    e.preventDefault();
    let payload = { username, email, password, country };

    SoTApi.register(payload).then(data => {
      if (data.created) {
        setNotification({ 
          type: 'success',
          header: 'Registration Successful',
          content: 'You may now login'
        });
        
        history.push('/login');
      }
    });
  }

  const getSelectText = () => {
    let selected = countries.find(c => c._id === country);
    return (selected && selected.text) || null;
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
                <label>Country</label>
                {countries.length > 0 && (                  
                  <Dropdown
                    text={getSelectText()}
                    options={countries}
                    value={country}
                    onChange={(e, {value}) => setCountry(value)}
                    selection
                  />
                )}
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
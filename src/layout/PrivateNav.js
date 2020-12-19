import { useHistory } from 'react-router-dom';

import { useGetUser, useSetUser } from '../context/UserContext';
import '../styles/layout.scss';
import logo from '../images/SoT.svg';

import { Dropdown, Menu, Icon, Image } from 'semantic-ui-react';

export default function PrivateNav() {
  const history = useHistory();
  const user = useGetUser();
  const setUser = useSetUser();
  const date = new Date();

  const formatTime = () => {
    let hours = date.getUTCHours();
    let mins = date.getUTCMinutes();
    let hoursString = hours < 10 ? `0${hours}` : hours;
    let minsString = mins < 10 ? `0${mins}` : mins;

    return `${hoursString}:${minsString}`;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  }

  const actions = (
    <Menu.Menu className='desktop' position='right'>
      <Dropdown item text='My Places' floating>
        <Dropdown.Menu>
          <Dropdown.Item text='My Home' onClick={() => history.push('/home')} />
          <Dropdown.Item text='My Companies' onClick={() => history.push('/companies')} />
          <Dropdown.Item text='My Party' onClick={() => history.push(`/party${user && user.party > 0 ? `/${user.party}` : ''}`)} />
          <Dropdown.Item text='My Newspaper' onClick={() => history.push(`/newspaper${user && user.newspaper > 0 ? `/${user.newspaper}` : ''}`)} />
          <Dropdown.Item text='My Army' onClick={() => history.push(`/unit${user && user.unit > 0 ? `/${user.unit}` : ''}`)} />
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown item text='Markets' floating>
        <Dropdown.Menu>
          <Dropdown.Item text='Goods' onClick={() => history.push('/market/goods')} />
          <Dropdown.Item text='Jobs' onClick={() => history.push('/market/jobs')} />
          <Dropdown.Item text='Exchange' onClick={() => history.push('/market/exchange')} />
          <Dropdown.Item text='Companies' />
        </Dropdown.Menu>
      </Dropdown>
      <Menu.Item name='Battles' onClick={() => history.push('/battles')} />
      <Dropdown item text='Social' floating>
        <Dropdown.Menu>
          <Dropdown.Item text='My Country' onClick={() => history.push(`/country/${user && user.country}`)} />
          <Dropdown.Item text='Rankings' onClick={() => history.push('/rankings')} />
        </Dropdown.Menu>
      </Dropdown>
      <Menu.Item name='World Map' onClick={() => history.push('/world')} />
      <Menu.Item>
        <Icon name='calendar alternate outline' />
        <span>{date.toDateString()}</span>
      </Menu.Item>
      <Menu.Item>
        <Icon name='clock outline' />
        <span>{formatTime()}</span>
      </Menu.Item>
      <Menu.Item onClick={handleLogout}>Logout</Menu.Item>
    </Menu.Menu>
  );

  const actionsMobile = (
    <Menu.Menu className='phone' position='right'>
      <Menu.Item>
        <Dropdown
          icon='bars'
          floating
          className='icon'
        >
          <Dropdown.Menu>
            <Dropdown.Item>
              <Dropdown text='My Places' floating>
                <Dropdown.Menu>
                  <Dropdown.Item text='My Home' onClick={() => history.push('/home')} />
                  <Dropdown.Item text='My Companies' onClick={() => history.push('/companies')} />
                  <Dropdown.Item text='My Party' onClick={() => history.push(`/party${user && user.party > 0 ? `/${user.party}` : ''}`)} />
                  <Dropdown.Item text='My Newspaper' onClick={() => history.push(`/newspaper${user && user.newspaper > 0 ? `/${user.newspaper}` : ''}`)} />
                  <Dropdown.Item text='My Army' onClick={() => history.push(`/unit${user && user.unit > 0 ? `/${user.unit}` : ''}`)} />
                </Dropdown.Menu>
              </Dropdown>
            </Dropdown.Item>
            <Dropdown.Item>
              <Dropdown text='Markets' floating>
                <Dropdown.Menu>
                  <Dropdown.Item text='Goods' onClick={() => history.push('/market/goods')} />
                  <Dropdown.Item text='Jobs' onClick={() => history.push('/market/jobs')} />
                  <Dropdown.Item text='Exchange' onClick={() => history.push('/market/exchange')} />
                  <Dropdown.Item text='Companies' />
                </Dropdown.Menu>
              </Dropdown>
            </Dropdown.Item>
            <Dropdown.Item>Battles</Dropdown.Item>
            <Dropdown.Item>
              <Dropdown text='Social' floating>
                <Dropdown.Menu>
                  <Dropdown.Item text='My Country' onClick={() => history.push(`/country/${user && user.country}`)} />
                  <Dropdown.Item text='Rankings' onClick={() => history.push('/rankings')} />
                </Dropdown.Menu>
              </Dropdown>
            </Dropdown.Item>
            <Dropdown.Item text='World Map' onClick={() => history.push('/world')} />
            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            <Dropdown.Item>
              <Icon name='calendar alternate outline' />
              <span>{date.toDateString()}</span>
            </Dropdown.Item>
            <Dropdown.Item>
              <Icon name='clock outline' />
              <span>{formatTime()}</span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Menu.Item>
    </Menu.Menu>
  );

  return (
    <Menu className='nav'>
      <Menu.Item
        header
        onClick={() => history.push('/dashboard')}
      >
        <Image src={logo} avatar />
        State of Turmoil
      </Menu.Item>
      {actions}
      {actionsMobile}
    </Menu>
  );
}
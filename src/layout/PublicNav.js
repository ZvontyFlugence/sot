import { Dropdown, Menu, Image } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';

import '../styles/layout.scss';
import logo from '../images/SoT.svg';

export default function PublicNav() {
  const history = useHistory();

  const goToHome = () => {
    history.push('/');
  }

  const goToLogin = () => {
    history.push('/login');
  }

  const goToRegister = () => {
    history.push('/register');
  }

  const actionsMobile = (
    <Menu.Menu className='phone' position='right'>
      <Menu.Item>
        <Dropdown
          icon='bars'
          floating
          className='icon'
        >
          <Dropdown.Menu>
            <Dropdown.Item onClick={goToLogin}>Login</Dropdown.Item>
            <Dropdown.Item onClick={goToRegister}>Register</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Menu.Item>
    </Menu.Menu>
  );

  const actions = (
    <Menu.Menu className='desktop' position='right'>
      <Menu.Item name='Login' onClick={goToLogin} />
      <Menu.Item name='Register' onClick={goToRegister} />
    </Menu.Menu>
  )

  return (
    <Menu className='nav'>
      <Menu.Item header onClick={goToHome}>
        <Image src={logo} avatar/>
        State of Turmoil
      </Menu.Item>
      {actions}
      {actionsMobile}
    </Menu>
  );
};
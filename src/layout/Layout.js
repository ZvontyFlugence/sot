import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { getXpNeeded } from '../util/config';
import { useGetUser, useLoadUser } from '../context/UserContext';
import SoTApi from '../services/SoTApi';
import gold from '../images/assets/coin.svg';

import {
  Button,
  Card,
  Grid,
  Icon,
  Image,
  Label,
  Menu,  
  Progress,
} from 'semantic-ui-react';

export default function Layout(props) {
  const history = useHistory();
  const user = useGetUser();
  const loadUser = useLoadUser();
  const unreadAlerts = user && user.alerts.filter(alert => !alert.read).length;
  const unreadMessages = user && user.messages.filter(msg => !msg.read).length;
  const [regionInfo, setRegionInfo] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);

  useEffect(() => {
    if (user !== null) {
      SoTApi.getLocationInfo().then(data => {
        if (!data.err) {
          setRegionInfo(data.region_info);
        }
      });

      SoTApi.getWalletInfo().then(data => {
        if (!data.err) {
          setWalletInfo(data.wallet_info);
        }
      });
    }
  }, [user]);

  const handleHeal = () => {
    SoTApi.doAction({ action: 'heal' }).then(data => {
      if (data.success) {
        loadUser();
      }
    });
  }

  const sidebar = (
    <Grid.Column className='desktop' computer={3}>
      <Card>
        <Card.Content>
          <Card.Header>
            <Link to={`/profile/${user._id}`} style={{ color: 'initial', textDecoration: 'none' }}>
              <Grid centered>
                <Grid.Column textAlign='center' width={16}>
                  <Image src={user.image} size='small' circular />
                  <br />
                  <span>
                    {user.displayName}&nbsp;
                    <Label size={'tiny'} color='blue'>{user.level}</Label>
                  </span>
                </Grid.Column>
              </Grid>
            </Link>
          </Card.Header>
          <Grid>
            <Grid.Column textAlign='center' width={16}>
              <Label
                as='a'
                color={unreadAlerts > 0 ? 'red' : null}
                onClick={() => history.push('/alerts')}
              >
                <Icon name='bell' /> {unreadAlerts}
              </Label>
              <Label
                as='a'
                color={unreadMessages > 0 ? 'red' : null}
                onClick={() => history.push('/mail')}
              >
                <Icon name='mail' /> {unreadMessages}
              </Label>
            </Grid.Column>
            <Grid.Column width={16}>
              <Progress
                label='XP'
                color='orange'
                size='small'
                value={user.xp}
                total={getXpNeeded(user.level)}
                progress='ratio'
              />
              <Progress
                percent={user.health}
                label='Health'
                color='green'
                size='small'
                progress
                active
              />
              <Button
                fluid
                color='green'
                content='Heal'
                icon='heartbeat'
                size='tiny'
                onClick={handleHeal}
                disabled={(user && user.health === 100) || (user && new Date(user.canHeal) > new Date(Date.now()))}
              />
              <Menu vertical text>
                { regionInfo && (
                  <Menu.Item>
                    <span className='link' onClick={() => history.push(`/region/${user.location}`)}>
                      {`${ regionInfo.name } `}
                    </span>
                    <span className='link' onClick={() => history.push(`/country/${regionInfo.owner._id}`)}>
                      <i className={`flag-icon flag-icon-${regionInfo.owner.flag} flag-inline-right`} />
                    </span>
                  </Menu.Item>
                )}
                <Menu.Item style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Gold</span>
                  <span style={{ paddingRight: '15%' }}>
                    { user.gold.toFixed(2) }&nbsp;<Image src={gold} avatar />
                  </span>
                </Menu.Item>
                { walletInfo && regionInfo && (
                  <Menu.Item style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{ walletInfo.current.currency }</span>
                    <span style={{ float: 'right', paddingRight: '15%' }}>
                      { walletInfo.current.amount.toFixed(2) }&nbsp;&nbsp;<span className={`flag-icon flag-icon-${regionInfo.owner.flag} flag-inline-right`}></span>
                    </span>
                  </Menu.Item>
                )}
              </Menu>
            </Grid.Column>
          </Grid>
        </Card.Content>
      </Card>
    </Grid.Column>
  );

  return (
    <div style={{ paddingBottom: '1vh' }}>
      <Grid id='layout' centered>
        {sidebar}
        <Grid.Column mobile={16} computer={11}>
          {props.children}
        </Grid.Column>
      </Grid>
    </div>
  );
}
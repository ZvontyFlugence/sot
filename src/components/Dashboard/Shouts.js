import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { useGetUser } from '../../context/UserContext';
import { useSetNotification } from '../../context/NotificationContext';
import SoTApi from '../../services/SoTApi';

import { Feed, Form, Menu, Segment, Tab } from 'semantic-ui-react';

export default function Shouts() {
  const isMountedRef = useRef(true);
  const user = useGetUser();
  const setNotification = useSetNotification();
  const [shout, setShout] = useState('');
  const [shouts, setShouts] = useState([]);
  const [regionInfo, setRegionInfo] = useState(null);
  const [reload, setReload] = useState(true);
  const [active, setActive] = useState(1);

  useEffect(() => () => { isMountedRef.current = false }, []);

  useEffect(() => {
    if (!regionInfo) {
      SoTApi.getLocationInfo().then(data => {
        if (!data.error && isMountedRef.current) {
          setRegionInfo(data.region_info);
        }
      });
    }

    if (reload && regionInfo) {
      let scope = undefined;
      let country, party, unit = undefined;

      switch (active) {
        case 0:
          scope = 'global';
          break;
        case 1:
          country = regionInfo.owner._id;
          scope = 'country';
          break;
        case 2:
          party = user && user.party;
          scope = 'party';
          break;
        case 3:
          unit = user && user.unit;
          scope = 'unit';
          break;
        default:
          break;
      }

      if (scope) {
        SoTApi.getShouts({ scope, country, party, unit })
          .then(data => {
            if (data.shouts && isMountedRef.current) {
              setShouts(data.shouts);
              setReload(false);
            }
          });
      }
    }
  });

  const handleTabChange = (e, { activeIndex }) => {
    setActive(activeIndex);
    setReload(true);
  }

  const handleShout = () => {
    let scope = 'global';
    let country, party, unit = undefined;

    switch (active) {
      case 1:
        scope = 'country';
        country = regionInfo.owner._id;
        break;
      case 2:
        scope = 'party';
        party = user && user.party;
        break;
      case 3:
        scope = 'unit';
        unit = user && user.unit;
        break;
      default:
        break;
    }

    let payload = {
      action: 'shout',
      shout: {
        scope,
        message: shout,
        country,
        party,
        unit,
      },
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Shout Sent', content: 'Shout message sent successfully' });
        setReload(true);
      }
    });
  }

  const countryTabHeader = regionInfo ? (
    <Menu.Item key='countryTab' link>
      {regionInfo.owner.name }
      <i
        className={`flag-icon flag-icon-${regionInfo.owner.flag} flag-inline-right`}
        style={{ float: 'right', marginLeft: '10px' }}
      />
    </Menu.Item>
  ) : 'Country';

  const partyTabHeader = user.party === 0 ? (
    <Menu.Item key='partyTab' link disabled>
      Party
    </Menu.Item>
  ) : 'Party';

  const unitTabHeader = user.unit === 0 ? (
    <Menu.Item key='unitTab' link disabled>
      Unit
    </Menu.Item>
  ) : 'Unit';

  const shoutBox = (
    <Form>
      <Form.TextArea
        label='Shout'
        placeholder='Enter shout message'
        value={shout}
        onChange={e => setShout(e.target.value)}
      />
      <Form.Button color='blue' onClick={handleShout}>Shout</Form.Button>
    </Form>
  );

  const shoutContent = (
    <Segment raised>
      { shoutBox }
      <Feed>
        {shouts.map((s, index) => (
          <Feed.Event key={index}>
            <Feed.Label style={{ display: 'flex', alignItems: 'center' }}>
              <Link to={`/profile/${s.user}`}>
                <img src={s.user_img} alt={`${s.user_name}'s Avatar`} />
              </Link>
            </Feed.Label>
            <Feed.Content>
              <Feed.Summary>
                <Feed.User>{ s.user_name }</Feed.User>
                <Feed.Date>{ moment(s.posted).fromNow() }</Feed.Date>
              </Feed.Summary>
              <Feed.Extra text>
                { s.message }
              </Feed.Extra>
            </Feed.Content>
          </Feed.Event>
        ))}
      </Feed>
    </Segment>
  );

  const panes = () => [
    { menuItem: 'Global', render: () => <Tab.Pane className='hide-tab-pane'>{shoutContent}</Tab.Pane> },
    { menuItem: countryTabHeader, render: () => <Tab.Pane className='hide-tab-pane'>{shoutContent}</Tab.Pane> },
    { menuItem: partyTabHeader, render: () => <Tab.Pane className='hide-tab-pane'>{shoutContent}</Tab.Pane> },
    { menuItem: unitTabHeader, render: () => <Tab.Pane className='hide-tab-pane'>{shoutContent}</Tab.Pane> }
  ];

  return (
    <Tab menu={{ pointing: true }} panes={panes()} activeIndex={active} onTabChange={handleTabChange} />
  );
}
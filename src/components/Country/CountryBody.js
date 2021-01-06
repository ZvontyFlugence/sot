import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import Demographics from './Demographics';
import Regions from './Regions';
import Government from './Government';
import Laws from './Laws';

import { Tab } from 'semantic-ui-react';

export default function CountryBody(props) {
  const { country } = props;
  const location = useLocation();
  const [active, setActive] = useState((location.state && location.state.active) || 0);

  const panes = [
    { menuItem: 'Demographics', render: () => <Demographics /> },
    { menuItem: 'Regions', render: () => <Regions country={country} /> },
    { menuItem: 'Government', render: () => <Government country={country} /> },
    { menuItem: 'Economy' },
    { menuItem: 'Military' },
    { menuItem: 'Laws', render: () => <Laws country={country} /> },
  ];

  const handleTabChange = (_, { activeIndex }) => {
    location.state = { active: activeIndex };
    setActive(activeIndex);
  }

  return (
    <Tab
      menu={{ fluid: true, vertical: true }}
      menuPosition='left'
      panes={panes}
      activeIndex={(location.state && location.state.active) || active}
      onTabChange={handleTabChange}
    />
  );
}
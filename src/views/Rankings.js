import { useState } from 'react';

import CitizenRankings from '../components/Rankings/CitizenRankings';
import CountryRankings from '../components/Rankings/CountryRankings';
import Layout from '../layout/Layout';

import { Menu, Segment } from 'semantic-ui-react';

export default function Rankings() {
  const [active, setActive] = useState('citizens');

  const getTabContent = () => {
    switch(active) {
      case 'citizens':
        return <CitizenRankings />;
      case 'countries':
        return <CountryRankings />;
      default:
        return <></>;
    }
  }

  return (
    <Layout>
      <div id='rankings'>
        <h1>Rankings</h1>
        <Menu attached='top' tabular>
          <Menu.Item
            name='citizens'
            active={active === 'citizens'}
            onClick={(_, { name }) => setActive(name)}
          />
          <Menu.Item
            name='countries'
            active={active === 'countries'}
            onClick={(_, { name }) => setActive(name)}
          />
          <Menu.Item
            name='parties'
            active={active === 'parties'}
            onClick={(_, { name }) => setActive(name)}
            disabled
          />
          <Menu.Item
            name='armies'
            active={active === 'armies'}
            onClick={(_, { name }) => setActive(name)}
            disabled
          />
          <Menu.Item
            name='newspapers'
            active={active === 'newspapers'}
            onClick={(_, { name }) => setActive(name)}
            disabled
          />
        </Menu>

        <Segment attached='bottom'>
          { getTabContent() }
        </Segment>
      </div>
    </Layout>
  );
}
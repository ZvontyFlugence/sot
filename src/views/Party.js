import { Switch, Route } from 'react-router-dom';

import CreateParty from '../components/Party/CreateParty';
import PartyHome from '../components/Party/PartyHome';
import Layout from '../layout/Layout';

export default function Party() {
  return (
    <Layout>
      <div id='party'>
        <Switch>
          <Route exact path='/party' component={CreateParty} />
          <Route exact path='/party/:id' component={PartyHome} />
        </Switch>
      </div>
    </Layout>
  );
}
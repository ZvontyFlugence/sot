import Layout from '../layout/Layout';
import Dailies from '../components/Dashboard/Dailies';
import Shouts from '../components/Dashboard/Shouts';

import { Grid } from 'semantic-ui-react';

export default function Dashboard() {
  return (
    <Layout>
      <div id='dashboard'>
        <h1>Dashboard</h1>
        <Grid stackable columns={2}>
          <Grid.Column>
            <Dailies />
          </Grid.Column>
          <Grid.Column>
            <Shouts />
          </Grid.Column>
        </Grid>
      </div>
    </Layout>
  );
};
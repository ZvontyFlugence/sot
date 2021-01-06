import { useHistory } from 'react-router-dom';

import Layout from '../layout/Layout';
import Dailies from '../components/Dashboard/Dailies';
import News from '../components/Dashboard/News';
import Shouts from '../components/Dashboard/Shouts';

import { Button, Grid, Message } from 'semantic-ui-react';

export default function Dashboard() {
  const history = useHistory();
  let date = new Date(Date.now());

  return (
    <Layout>
      <div id='dashboard'>
        <h1>Dashboard</h1>
        {
          ((date.getUTCDate() === 5) || (date.getUTCDate() === 15)) && (
            <center style={{ marginBottom: 10 }}>
              <Message info style={{ width: 'fit-content' }}>
                <Message.Header>Election Day</Message.Header>
                <p style={{ textAlign: 'center' }}>
                  Vote today to select your next Country President!
                  <span style={{ display: 'block', marginTop: 10 }}>
                    <Button
                      compact
                      size='tiny'
                      color='blue'
                      content='Vote'
                      onClick={() => history.push('/election')}
                    />
                  </span>
                </p>
              </Message>
            </center>
          )
        }
        <Grid stackable columns={2}>
          <Grid.Column>
            <Dailies />
            <News />
          </Grid.Column>
          <Grid.Column>
            <Shouts />
          </Grid.Column>
        </Grid>
      </div>
    </Layout>
  );
};
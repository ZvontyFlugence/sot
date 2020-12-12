import { useEffect, useState } from 'react';

import { useGetUser, useLoadUser } from '../context/UserContext';
import { useSetNotification } from '../context/NotificationContext';
import Inventory from '../components/Shared/Inventory';
import Layout from '../layout/Layout';
import SoTApi from '../services/SoTApi';

import { Button, Grid, Image, Message, Segment } from 'semantic-ui-react';

export default function MyHome() {
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (user && user.job > 0) {
      SoTApi.getCompany(user.job).then(data => {
        if (data.company) {
          setJob(data.company);
        }
      });
    }
  }, [user]);

  const hasTrained = () => user && new Date(user.canTrain) > new Date(Date.now());
  const hasWorked = () => user && new Date(user.canWork) > new Date(Date.now());

  const handleTraining = () => {
    SoTApi.doAction({ action: 'train' }).then(data => {
      if (data.success) {
        setNotification({
          type: 'success',
          header: 'Training Complete',
          content: 'Gained 1 strength and 1 xp',
        });
        loadUser();
      } else {
        setNotification({
          type: 'danger',
          header: 'Training Failed',
          content: 'Failed to train',
        });
      }
    });
  };

  const handleWorking = () => {
    SoTApi.doAction({ action: 'work' }).then(data => {
      if (data.success) {
        setNotification({
          type: 'success',
          header: 'Working Complete',
          content: 'Gained 1 xp',
        });

        loadUser();
      } else {
        setNotification({
          type: 'danger',
          header: 'Working Failed',
          content: 'Failed to work',
        });
      }
    });
  }

  return (
    <Layout>
      <div id='home'>
        <h1>My Home</h1>

        <Grid columns={2}>
          <Grid.Column width={16}>
            <Grid stackable columns={2}>
              <Grid.Column computer={6}>
                <Segment>
                  <h3>Gym</h3>
                  { hasTrained() && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Message
                        compact
                        warning
                        header='Must Wait Until Tomorrow'
                        content='You can only train once per day'
                      />
                      <br />
                    </div>
                  )}
                  <p>Current Strength: { user && user.strength } <i className='sot-strength' /></p>
                  <Button color='blue' content='Train' onClick={handleTraining} disabled={user && hasTrained()} />
                </Segment>
              </Grid.Column>
              <Grid.Column computer={10}>
                <Segment>
                  <h3>Work</h3>
                  { hasWorked() && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Message
                        compact
                        warning
                        header='Must Wait Until Tomorrow'
                        content='You can only work once per day'
                      />
                    </div>
                  )}
                  { user.job === 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Message
                        compact
                        info
                        header='You Are Unemployed'
                        content={'You can find a job at the job market or in a company\'s job listings'}
                      />
                    </div>
                  )}
                  {job && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Image src={job.image} alt='' size='tiny' circular />
                        &nbsp;
                        <span style={{ fontSize: '2.0rem' }}>{job.name}</span>
                      </div>
                      <div>
                        <Button
                          compact
                          color='blue'
                          content='Work'
                          onClick={handleWorking}
                          disabled={user && hasWorked()}
                        />
                      </div>
                    </div>
                  )}             
                </Segment>
              </Grid.Column>
            </Grid>
          </Grid.Column>
          <Grid.Column width={16}>
            <Segment>
              <h3>Inventory</h3>
              <Inventory inventory={user.inventory} />
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    </Layout>
  );
}
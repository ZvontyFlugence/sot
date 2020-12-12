import { useHistory } from 'react-router-dom';
import { Button, Checkbox, Grid, Segment } from 'semantic-ui-react';

import { useGetUser, useLoadUser } from '../../context/UserContext';
import { useSetNotification } from '../../context/NotificationContext';
import SoTApi from '../../services/SoTApi';

export default function Dailies() {
  const history = useHistory();
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();

  const hasTrained = user && new Date(user.canTrain) > new Date(Date.now());
  const hasWorked = user && new Date(user.canWork) > new Date(Date.now());
  const hasCollectedRewards = user && new Date(user.canCollectRewards) > new Date(Date.now());

  const collectRewards = () => {
    SoTApi.doAction({ action: 'collect_dailies' }).then(data => {
      if (data.success) {
        setNotification({
          type: 'success',
          header: 'Collected Daily Rewards',
          content: 'You have gained 1 bonus xp',
        });

        loadUser();
      } else {
        setNotification({
          type: 'error',
          header: 'Failed to Collect Daily Rewards'
        });
      }
    });
  }

  return (
    <Segment raised compact>
      <Grid>
        <Grid.Row style={{ paddingLeft: '10%' }}>
          <span style={{ fontSize: '1.5rem' }}>Daily Tasks</span>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column>
            <Checkbox label='Train' checked={hasTrained} readOnly />
            <br />
            <Checkbox label='Work' checked={hasWorked} readOnly />
          </Grid.Column>
          <Grid.Column>
            {hasTrained && hasWorked ? (
              <Button color='blue' disabled={hasCollectedRewards} onClick={collectRewards}>
                Collect Rewards
              </Button>
            ) : (
              <Button color='green' onClick={() => history.push('/home')}>Go To Task</Button>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  );
}
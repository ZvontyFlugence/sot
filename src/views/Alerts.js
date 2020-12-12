import { useGetUser, useLoadUser } from '../context/UserContext';
import AlertItem from '../components/Alerts/AlertItem';
import Layout from '../layout/Layout';
import SoTApi from '../services/SoTApi';

import { Button, Message, Segment } from 'semantic-ui-react';

export default function Alerts() {
  const user = useGetUser();
  const loadUser = useLoadUser();

  const markAllAsRead = () => {
    Promise.all(user && user.alerts.filter(item => !item.read).map(async (alert, index) => {
      alert.index = index;
      return await SoTApi.doAction({ action: 'read_alert', alert });
    }))
      .then(values => {
        if (values.every(data => data.success)) {
          loadUser();
        }
      });
  }

  const deleteAll = () => {
    Promise.all(user && user.alerts.map(async (alert, index) => {
      alert.index = index;
      return await SoTApi.doAction({ action: 'delete_alert', alert });
    }))
      .then(values => {
        if (values.every(data => data.success)) {
          loadUser();
        }
      });
  }

  return (
    <Layout>
      <div id='alerts'>
        <h1>Alerts</h1>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button color='blue' onClick={markAllAsRead}>Mark All as Read</Button>
          <Button color='red' onClick={deleteAll}>Delete all</Button>
        </div>
        {user.alerts.length > 0 ? (
          <Segment.Group>
            {user.alerts.map((a, i) => (
              <AlertItem key={i} alert={a} index={i} />
            ))}
          </Segment.Group>
        ) : (
          <Message>
            <Message.Content>
              You do not have any alerts
            </Message.Content>
          </Message>
        )}
      </div>
    </Layout>
  );
}
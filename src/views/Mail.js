import { useState } from 'react';

import { useSetNotification } from '../context/NotificationContext';
import { useGetUser, useLoadUser } from '../context/UserContext';
import Layout from '../layout/Layout';
import ComposeModal from '../components/Mail/ComposeModal';
import MailItem from '../components/Mail/MailItem';
import SoTApi from '../services/SoTApi';

import { Button, Message, Segment } from 'semantic-ui-react';

export default function Mail() {
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [showCompose, setShowCompose] = useState(false);

  const readAll = () => {
    let payload = { action: 'read_message' };
    Promise.all(user.messages.filter(thread => !thread.read).map(async thread => {
      payload.threadId = thread.id;
      return await SoTApi.doAction(payload);
    }))
    .then(values => {
      if (values.every(data => data.success)) {
        setNotification({
          type: 'success',
          header: 'Messages Read',
        });

        loadUser();
      }
    });
  }

  const deleteAll = () => {
    let payload = { action: 'delete_message' };
    Promise.all(user.messages.map(async thread => {
      payload.threadId = thread.id;
      return await SoTApi.doAction(payload);
    }))
    .then(values => {
      if (values.every(data => data.success)) {
        setNotification({
          type: 'success',
          header: 'Messages Deleted',
        });

        loadUser();
      }
    });
  }

  return (
    <Layout>
      <div id='mail'>
        <h1>Mail</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            <Button color='green' content='Compose' onClick={() => setShowCompose(true)} />
          </div>
          <div style={{ display: 'flex' }}>
            <Button color='blue' content='Mark All as Read' onClick={readAll} />
            <Button color='red' content='Delete All' onClick={deleteAll} />
          </div>
        </div>
        {user.messages.length > 0 ? (
          <Segment.Group>
            {user.messages.map((thread, index) => (
              <MailItem key={index} thread={thread} index={index} userId={user._id} />
            ))}
          </Segment.Group>
        ) : (
          <Message>
            <Message.Content>
              You do not have any messages
            </Message.Content>
          </Message>
        )}
      </div>
      <ComposeModal show={showCompose} onClose={() => setShowCompose(false)} />
    </Layout>
  );
}
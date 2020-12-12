import { useState } from 'react';

import { useSetNotification } from '../context/NotificationContext';
import { useGetUser, useLoadUser } from '../context/UserContext';
import Layout from '../layout/Layout';
import MailItem from '../components/Mail/MailItem';
import SoTApi from '../services/SoTApi';

import { Button, Form, Label, Icon, Image, Message, Modal, Search, Segment, TextArea } from 'semantic-ui-react';

export default function Mail() {
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [showCompose, setShowCompose] = useState(false);
  const [participant, setParticipant] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSelection = (e, data) => {
    setUsers(prev => [...prev, data.result]);
  }

  const handleSearch = (e, data) => {
    let displayName = data.value;
    setParticipant(data.value);

    // Call API to find User with matching displayName
    setLoading(true);
    SoTApi.getUsers().then(data => {
      if (data.users) {
        setResults(data.users.filter(u => {
          return u.displayName.includes(displayName) &&
            u._id !== user._id && !users.find(usr => usr.displayName.includes(displayName));
        }));
        setLoading(false);
      }
    });
  }

  const removeUser = userID => {
    let index = users.findIndex(u => u._id === userID);

    if (index > -1) {
      setUsers(prev => {
        prev.splice(index, 1);
        return [...prev];
      });
    }
  }

  const handleCreateThread = () => {
    let payload = {
      action: 'create_message',
      thread: {
        participants: users.map(u => u._id),
        subject,
        message,
        timestamp: new Date(Date.now()),
      }
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({
          type: 'success',
          header: 'Message Sent',
        });

        loadUser();
      }
    })
    .catch(err => {
      setNotification({
        type: 'error',
        header: 'Message Failed To Send'
      });
    });
  }

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

  const resultRenderer = result => (
    <div key={result._id} style={{ display: 'flex', alignItems: 'center', columnGap: 10 }}>
      <div style={{ display: 'flex' }}>
        <Image src={result.image} alt='' size='mini' avatar />
      </div>
      <div>{ result.displayName }</div>
    </div>
  );

  const composeModal = (
    <Modal open={showCompose} onClose={() => setShowCompose(false)}>
      <Modal.Header>Compose New Message</Modal.Header>
      <Modal.Content>
        <Search
          loading={loading}
          onResultSelect={handleSelection}
          onSearchChange={handleSearch}
          resultRenderer={resultRenderer}
          results={results}
          value={participant}
        />
        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
          <span>To: </span>
          {users.map(u => (
            <Label key={u._id} image>
              <img src={u.image} alt='' />
              { u.displayName }
              <Icon name='delete' onClick={() => removeUser(u._id)} />
            </Label>
          ))}
        </div>
        <Form>
          <Form.Input type='text' placeholder='Subject' value={subject} onChange={e => setSubject(e.target.value)} />
          <TextArea placeholder='Enter message' value={message} onChange={e => setMessage(e.target.value)} />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color='green' content='Send' onClick={handleCreateThread} />
        <Button content='Cancel' onClick={() => setShowCompose(false)} />
      </Modal.Actions>
    </Modal>
  );

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
      { composeModal }
    </Layout>
  );
}
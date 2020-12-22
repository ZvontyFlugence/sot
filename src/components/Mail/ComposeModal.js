import { useEffect, useState } from 'react';

import { useSetNotification } from '../../context/NotificationContext';
import { useGetUser, useLoadUser } from '../../context/UserContext';
import SoTApi from '../../services/SoTApi';

import { Button, Form, Label, Icon, Image, Modal, Search, TextArea } from 'semantic-ui-react';

export default function ComposeModal(props) {
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [participant, setParticipant] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (props.profile) {
      setUsers(curr => [...curr, props.profile]);
    }
  }, [props.profile]);

  const handleSelection = (_, data) => {
    setUsers(prev => [...prev, data.result]);
  }

  const handleSearch = (_, data) => {
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

        if (props.onSuccess) {
          props.onSuccess();
        }
      }
    })
    .catch(_ => {
      setNotification({
        type: 'error',
        header: 'Message Failed To Send'
      });
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

  return (
    <Modal open={props.show} onClose={props.onClose}>
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
        <Button content='Cancel' onClick={props.onClose} />
      </Modal.Actions>
    </Modal>
  );
}
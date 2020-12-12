import { useEffect, useState } from 'react';
// import { useHistory } from 'react-router-dom';
import moment from 'moment';

import { useSetNotification } from '../context/NotificationContext';
import { useGetUser, useLoadUser } from '../context/UserContext';
import Layout from '../layout/Layout';

import { Button, Comment, Form, Grid, Header, Label, List, Segment, TextArea } from 'semantic-ui-react';
import SoTApi from '../services/SoTApi';

export default function MailThread(props) {
  const threadId = props.match.params.id;
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [thread, setThread] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (user) {
      let targetThread = user.messages.find(thrd => thrd.id === threadId);
      setThread(targetThread);
      
      if (!targetThread.read) {
        let payload = { action: 'read_message', threadId };
        SoTApi.doAction(payload);
        loadUser();
      }
    }
  }, [user, threadId, loadUser]);

  useEffect(() => {
    if (thread !== null && participants.length === 0) {
      thread.participants.forEach(u => {
        SoTApi.getProfile(u).then(data => {
          if (data.profile) {
            setParticipants(prev => [...prev, data.profile]);
          }
        });
      });
    }
  }, [thread, participants.length]);

  const handleSend = () => {
    let payload = {
      action: 'send_message',
      threadId: thread.id,
      reply: {
        from: user._id,
        message: reply,
        timestamp: new Date(Date.now()),
      },
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({
          type: 'success',
          header: 'Message Sent',
        });

        loadUser();
      }
    });
  }

  return (
    <Layout>
        {thread && (
          <div id='mail-thread'>
            <h1>Mail Thread: { thread.subject }</h1>
            <Grid columns={2}>
              <Grid.Column width={12}>
                <Segment>
                  <Comment.Group threaded style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    <Header as='h3' dividing>
                      Messages
                    </Header>
                        
                    {thread.messages.map((msg, i) => {
                      let from = participants.find(u => u._id === msg.from);

                      return from ? (
                          <Comment key={`${msg.from}-${i}`}>
                            <Comment.Avatar as='a' src={from.image} />
                            <Comment.Content>
                              <Comment.Author as='a'>{ from.displayName }</Comment.Author>
                              <Comment.Metadata>
                                <span>{ moment(msg.timestamp).fromNow() }</span>
                              </Comment.Metadata>
                              <Comment.Text>
                                { msg.message }
                              </Comment.Text>
                            </Comment.Content>
                          </Comment>
                      ) : (<></>);
                    })}
                  </Comment.Group>
                </Segment>
                <Segment>
                  <Form>
                    <TextArea placeholder='Enter Message' value={reply} onChange={e => setReply(e.target.value)} />
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                      <Button color='blue' content='Send' size='tiny' onClick={handleSend} />
                    </div>
                  </Form>
                </Segment>
              </Grid.Column>
              <Grid.Column width={4}>
                <Segment>
                  <h3>Participants: </h3>
                  <List style={{ display: 'flex', justifyContent: 'center' }}>
                    {participants.filter(u => u._id !== user._id).map(u => (
                      <List.Item key={u._id}>
                        <Label size='small'>
                          <img src={u.image} alt='' />
                          { u.displayName }
                        </Label>
                      </List.Item>
                    ))}
                  </List>
                </Segment>
              </Grid.Column>
            </Grid>
          </div>
        )}
    </Layout>
  );
}
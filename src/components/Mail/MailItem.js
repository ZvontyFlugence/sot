import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Menu, Item, useContextMenu } from 'react-contexify';
import moment from 'moment';

import { useLoadUser } from '../../context/UserContext';
import SoTApi from '../../services/SoTApi';

import { Grid, Label, Segment } from 'semantic-ui-react';

export default function MailItem(props) {
  const { thread, index, userId } = props;
  const { show } = useContextMenu({ id: `mail-${index}` });
  const history = useHistory();
  const loadUser = useLoadUser();
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (thread && participants.length === 0) {
      thread.participants.forEach(u => {
        SoTApi.getProfile(u).then(data => {
          if (data.profile) {
            setParticipants(prev => [...prev, data.profile]);
          }
        });
      });
    }
  }, [thread, thread.participants, participants.length])

  const goToThread = () => {
    history.push(`/mail/thread/${thread.id}`);
  }

  const readThread = () => {
    SoTApi.doAction({ action: 'read_message', threadId: thread.id })
      .then(data => {
        if (data.success) {
          loadUser();
        }
      });
  }

  const deleteThread = () => {
    SoTApi.doAction({ action: 'delete_message', threadId: thread.id })
      .then(data => {
        if (data.success) {
          loadUser();
        }
      });
  }

  return (
    <>
      <Segment onContextMenu={show} secondary={thread.read} onClick={goToThread} clearing>
        <Grid>
          <Grid.Column width={16}>
            {!thread.read && (
              <>
                <Label color='blue' empty circular />
                &nbsp;
              </>
            )}            
            { thread.subject }&nbsp;
            {participants.filter(u => u._id !== userId).map(u => (
              <Label key={u._id} size='mini'>
                <img src={u.image} alt='' />
                { u.displayName }
              </Label>
            ))}

            <span style={{ float: 'right' }}>{ moment(thread.timestamp).fromNow() }</span>
            &nbsp;
            <div style={{ marginTop: '10px' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                { thread.messages[thread.messages.length-1].message }
              </span>
            </div>
          </Grid.Column>
        </Grid>
      </Segment>

      <Menu id={`mail-${index}`}>
        <Item onClick={readThread}>
          Mark as Read
        </Item>
        <Item onClick={deleteThread}>
          Delete
        </Item>
      </Menu>
    </>
  );
}
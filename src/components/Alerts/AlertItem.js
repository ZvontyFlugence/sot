import moment from 'moment';
import { Menu, Item, useContextMenu } from 'react-contexify';

import { useLoadUser } from '../../context/UserContext';
import SoTApi from '../../services/SoTApi';

import { Button, Grid, Segment } from 'semantic-ui-react';

export default function AlertItem(props) {
  const loadUser = useLoadUser();
  const { alert, index } = props;
  const { show } = useContextMenu({
    id: `alert-${index}`
  });

  const getTimestamp = () => (
    <span>{ moment(alert.timestamp).fromNow() }</span>
  );

  const getActions = () => {
    switch (alert.type) {
      case 'SEND_FRIEND_REQUEST':
        return (
          <div style={{ float: 'right' }}>
            <Button color='green' icon='check' style={{ marginRight: '10px' }} onClick={acceptFR} />
            <Button color='red' icon='times' onClick={declineFR} />
          </div>
        );
      default:
        return <></>;
    }
  };

  const acceptFR = () => {
    let payload = {
      action: 'friend_request_response',
      response_data: {
        response: 'accept',
        alert_index: index,
        friend_id: alert.from,
      },
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        loadUser();
      }
    });
  };

  const declineFR = () => {
    let payload = {
      action: 'friend_request_response',
      response_data: {
        response: 'decline',
        alert_index: index,
        friend_id: alert.from,
      },
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        loadUser();
      }
    });
  };

  const readAlert = () => {
    SoTApi.doAction({ action: 'read_alert', alert: { ...alert, index } })
      .then(data => {
        if (data.success)
          loadUser();
      });
  }

  const deleteAlert = () => {
    SoTApi.doAction({ action: 'delete_alert', alert: { ...alert, index } })
      .then(data => {
        if (data.success)
          loadUser();
      });
  }
  
  return (
    <>
      <Segment onContextMenu={show} secondary={alert.read} clearing>
        { getActions() }

        <Grid columns={2}>
          <Grid.Column mobile={6} computer={3}>{getTimestamp()}</Grid.Column>
          <Grid.Column style={{ fontWeight: alert.read ? 'lighter' : 'bold' }}>{ alert.message }</Grid.Column>
        </Grid>
      </Segment>

      <Menu id={`alert-${index}`}>
        <Item onClick={readAlert}>
          Mark as Read
        </Item>
        <Item onClick={deleteAlert}>
          Delete
        </Item>
      </Menu>
    </>
  );
}
import { useHistory } from 'react-router-dom';

import { useGetUser } from '../../context/UserContext';
import { useSetNotification } from '../../context/NotificationContext';
import SoTApi from '../../services/SoTApi';

import { Button, Grid, Image, Item, Segment } from 'semantic-ui-react';

export default function ProfileHead(props) {
  const { profile } = props;
  const user = useGetUser();
  const history = useHistory();
  const setNotification = useSetNotification();

  const sendFriendRequest = () => {
    SoTApi.doAction({ action: 'send_friend_request', friend_id: profile._id })
      .then(data => {
        if (data.success) {
          setNotification({
            type: 'success',
            header: 'Friend Request Sent',
            content: `Sent friend request to ${profile.displayName}`,
          });
        } else {
          setNotification({
            type: 'error',
            header: 'Error',
            content: `Friend request failed to send`,
          });
        }
      });
  }

  const removeFriend = () => {
    SoTApi.doAction({ action: 'remove_friend', friend_id: profile._id })
      .then(data => {
        if (data.success) {
          setNotification({
            type: 'success',
            header: 'Friend Removed',
            content: `Successfully removed ${profile.displayName} from friends list`,
          });
        } else {
          setNotification({
            type: 'error',
            header: 'Error',
            content: `Failed to remove ${profile.displayName} from friends list`,
          });
        }
      });
  }

  return (
    <Segment>
      <Grid>
        <Grid.Row>
          <Grid.Column width={4}>
            <Image
              fluid
              circular
              src={profile.image}
              alt={`${profile.displayName}'s Profile Picture`}
            />
          </Grid.Column>
          <Grid.Column width={10}>
            <Grid>
              <Grid.Row columns={1}>
                <Grid.Column width={16}>
                  <h1 style={{ fontWeight: 'lighter', margin: 0, textAlign: 'left !important' }}>
                    <span>
                      { profile.displayName }
                      <i
                        className={`flag-icon flag-icon-${profile.country_info.flag}`}
                        style={{ float: 'none', verticalAlign: 'middle', fontSize: '28px', marginLeft: '1vw' }}
                      />
                    </span>
                  </h1>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row columns={2}>
                <Grid.Column>
                  <span>Level: { profile.level }</span>
                  <p>Experience: { profile.xp }</p>
                  <p>
                    Location: {`${profile.location_info.name}, ${profile.location_info.owner.nick}`}
                    <i
                      className={`flag-icon flag-icon-${profile.location_info.owner.flag}`}
                      style={{ float: 'none', verticalAlign: 'middle', marginLeft: '1vw' }}
                    />
                  </p>
                </Grid.Column>
                <Grid.Column>
                  <Item>
                    <Item.Content>
                      <Item.Meta>Description:</Item.Meta>
                      <Item.Description style={{ textAlign: 'left' }}>
                        { profile.description }
                      </Item.Description>
                    </Item.Content>
                  </Item>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Grid.Column>
          <Grid.Column width={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {user._id !== profile._id ? (
              <Button.Group color='blue' vertical icon>
                {user.friends.indexOf(profile._id) === -1 ? (
                  <Button
                    icon='user plus'
                    onClick={sendFriendRequest}
                    disabled={user.pendingFriends.indexOf(profile._id) >= 0}
                  />
                ) : (
                  <Button icon='user times' onClick={removeFriend} />
                )}
                <Button icon='envelope' />
                <Button icon='dollar' />
              </Button.Group>
            ) : (
              <Button color='blue' icon='setting' onClick={() => history.push('/settings')} />
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  );
}
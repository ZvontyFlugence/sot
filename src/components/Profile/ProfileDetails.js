import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import SoTApi from '../../services/SoTApi';

import { Card, Image, Segment } from 'semantic-ui-react';

export default function ProfileDetails(props) {
  const { profile } = props;

  const friends = profile.friends.length > 0 ? (
    <Card.Group itemsPerRow={5} style={{ padding: '0 1vw'}}>
      {profile.friends.map((friend, index) => (
        <FriendCard index={index} friendId={friend} />
      ))}
    </Card.Group>
  ) : (
    <span>{ profile.displayName } has no friends</span>
  );

  return (
    <Segment>
      <Segment.Group>
        <Segment>Stats</Segment>
        <Segment>Achievements</Segment>
        <Segment>
          <h3>Friends</h3>
          <br />
          { friends }
        </Segment>
      </Segment.Group>
    </Segment>
  );
}

function FriendCard(props) {
  const { friendId, index } = props;
  const [friend, setFriend] = useState(null);

  useEffect(() => {
    if (!friend) {
      SoTApi.getProfile(friendId).then(data => {
        if (data.profile) {
          setFriend(data.profile);
        }
      });
    }
  }, [friend, friendId]);

  return friend && (
    <Link key={index} to={`/profile/${friendId}`} style={{ color: 'initial', textDecoration: 'none' }}>
      <Image src={friend.image} size='tiny' avatar />
      <span style={{ display: 'flex', justifyContent: 'center' }}>{ friend.displayName }</span>
    </Link>
  );
}
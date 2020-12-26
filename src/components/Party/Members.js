import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Menu, Item, useContextMenu } from 'react-contexify';

import { useGetUser } from '../../context/UserContext';
import SoTApi from '../../services/SoTApi';

import { Image, Label, List, Tab } from 'semantic-ui-react';

export default function Members(props) {
  const { party, setReload } = props;
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (party) {
      if (members.length === 0) {
        party.members.map(async member => {
          await SoTApi.getProfile(member).then(data => {
            if (data.profile) {
              setMembers(curr => [...curr, data.profile]);
            }
          });
        });
      }
    }
  }, [party, members.length]);

  const getMemberRole = memberId => {
    switch (memberId) {
      case party.president:
        return 'Party President';
      case party.vp:
        return 'Party VP';
      default:
        if (party.congressMembers.includes(memberId))
          return 'Congress Member';
        return 'Member';
    }
  }

  return party && (
    <Tab.Pane>
      <h3>Members ({ party.members.length }):</h3>
      <List selection relaxed divided>
        {
          members && members.map((member, idx) => {
            let role = getMemberRole(member._id);
            return (
              <MemberItem
                key={idx}
                member={member}
                role={role}
                party={party}
                setReload={setReload}
              />
            );
          })
        }
      </List>
    </Tab.Pane>
  )
}

function MemberItem(props) {
  const { member, party, role, setReload } = props;
  const history = useHistory();
  const user = useGetUser();
  const { show } = useContextMenu({
    id: `party-member-action-${member._id}`
  });

  const getRoleColor = role => {
    switch (role) {
      case 'Party President':
        return 'violet';
      case 'Party VP':
        return 'teal';
      case 'Congress Member':
        return 'olive';
      case 'Member':
      default:
        return;
    }
  }

  const makeVP = () => {
    let payload = {
      action: 'set_vp',
      userId: user && user._id,
      memberId: member && member._id,
    };

    SoTApi.doPartyAction(party._id, payload).then(data => {
      if (data.success) {
        setReload(true);
      }
    });
  }

  return (
    <>
      <List.Item onContextMenu={party.president !== member._id && party.vp !== member._id && show} onClick={() => history.push(`/profile/${member._id}`)}>
        <List.Content floated='right'>
          <Label color={getRoleColor(role)} content={role} />
        </List.Content>
        
        <List.Content style={{ display: 'flex', alignItems: 'center' }}>
          <Image avatar src={member.image} alt='' />
          <List.Header>{ member.displayName }</List.Header>
        </List.Content>
      </List.Item>
      <Menu id={`party-member-action-${member._id}`}>
        <Item onClick={makeVP}>
          Make Vice Party President
        </Item>
      </Menu>
    </>
  );
}
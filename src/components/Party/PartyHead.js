import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';

import { useGetUser, useLoadUser } from '../../context/UserContext';
import { useSetNotification } from '../../context/NotificationContext';
import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Button, Form, Grid, Image, Modal, Segment, Statistic } from 'semantic-ui-react';

export default function PartyHead(props) {
  const { party, setReload } = props;
  const history = useHistory();
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [partyPres, setPartyPres] = useState(null);
  const [partyVP, setPartyVP] = useState(null);
  const [country, setCountry] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (party) {
      if (party.president) {
        SoTApi.getProfile(party.president).then(data => {
          if (data.profile) {
            setPartyPres(data.profile);
          }
        });
      }

      if (party.vp) {
        SoTApi.getProfile(party.vp).then(data => {
          if (data.profile) {
            setPartyVP(data.profile);
          }
        });
      }

      if (party.country) {
        SoTApi.getCountry(party.country).then(data => {
          if (data.country) {
            setCountry(data.country);
          }
        });
      }
    }
  }, [party]);

  const goToPerson = id => {
    if (id) {
      history.push(`/profile/${id}`);
    }
  }

  const leaveParty = () => {
    let payload = {
      action: 'leave_party',
      partyId: party._id,
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Left Party!', content: `You have left the ${party.name}.` });
        loadUser();
        setReload(true);
      }
    });
  }

  const joinParty = () => {
    let payload = {
      action: 'join_party',
      partyId: party._id,
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Joined Party!', content: `You have joined the ${party.name}.` });
        loadUser();
        setReload(true);
      }
    });
  }

  return party && (
    <Segment>
      <Grid>
        <Grid.Column width={2} style={{ display: 'flex', alignItems: 'center' }}>
          <Image fluid circular src={party.image} alt='' />
        </Grid.Column>
        <Grid.Column width={10}>
          <h1>
            { party.name }
            &nbsp;
            <i className={`flag-icon flag-icon-${country && country.flag_code}`} />
          </h1>
          <div style={{ display: 'flex', justifyContent: 'space-between'}}>
            <div>
              <p>Orientation: { party.economic }, { party.social }</p>
              <p>Founded: { format(new Date(party.createdOn), 'LL/dd/yyyy') }</p>
            </div>
            <div>
              <p>
                Party President:&nbsp;
                {
                  partyPres ? (
                    <span className='link' onClick={() => goToPerson(party.president)}>
                      <Image avatar src={partyPres.image} alt='' />
                      { partyPres.displayName }
                    </span>
                  ) : 'None'
                }
              </p>
              <p>
                Vice Party President:&nbsp;
                {
                  partyVP ? (
                    <span className='link' onClick={() => goToPerson(party.vp)}>
                      <Image avatar src={partyVP.image} alt='' />
                      { partyVP.displayName }
                    </span>
                  ) : 'None'
                }
              </p>
            </div>
          </div>
        </Grid.Column>
        <Grid.Column width={3} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Statistic label='Members' value={party.members.length} />
        </Grid.Column>
        <Grid.Column width={1}>
          <Button.Group vertical>
            {
              party.president === user._id && (
                <Button compact color='blue' icon='cog' onClick={() => setShowEdit(true)} />
              )
            }
            {
              party.members.includes(user._id) ? (
                <Button compact color='red' icon='sign out' onClick={leaveParty} />
              ) : (
                <Button compact color='blue' icon='sign in' onClick={joinParty} />
              )
            }
          </Button.Group> 
        </Grid.Column>
      </Grid>
      <EditPartyModal
        show={showEdit}
        onClose={() => setShowEdit(false)}
        party={party}
        setReload={setReload}
        setNotification={setNotification}
      />
    </Segment>
  );
}

function EditPartyModal(props) {
  const { party, setNotification, setReload } = props;
  const fileUploadRef = useRef();
  const [file, setFile] = useState(null);
  const [name, setName] = useState(props.party.name);
  const [social, setSocial] = useState(props.party.social);
  const [economic, setEconomic] = useState(props.party.economic);

  const handleFileChange = e => {
    const targetFile = e.target.files[0];
    setFile(targetFile);
  }

  const handleUpload = e => {
    e.preventDefault();

    let reader = new FileReader();
    reader.onloadend = () => {
      let base64 = reader.result;
      SoTApi.doPartyAction(party._id, { action: 'upload', image: base64 })
        .then(data => {
          if (data.success) {
            setNotification({ type: 'success', header: 'Party Logo Uploaded!' });
            setReload(true);
            props.onClose();
          } else {
            setNotification({ type: 'error', header: data.error });
          }
        });
    }

    reader.readAsDataURL(file);
  }

  const editParty = () => {
    let payload = {
      action: 'edit',
      updates: {
        name,
        social,
        economic,
      }
    };
    SoTApi.doPartyAction(payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Party Updated!' });
        setReload(true);
      } else {
        setNotification({ type: 'error', header: data.error });
      }
    });
  }

  return (
    <Modal size='tiny' open={props.show} onClose={props.onClose}>
      <Modal.Header>Edit Political Party</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input
            type='text'
            label='Party Name'
            value={name}
            onChange={(_, { value }) => setName(value)}
          />
          <Form.Group style={{ display: 'flex', alignItems: 'center' }}>
            <Form.Input
              type='file'
              label='Party Logo'
              accept='image/*'
              ref={fileUploadRef}
              onChange={handleFileChange}
            />
            <Button
              color='blue'
              content='Upload'
              onClick={handleUpload}
              style={{ marginTop: '20px' }}
            />
          </Form.Group>
          <Form.Select
            label='Social Orientation'
            options={constants.PARTY_SOCIAL_VIEWS}
            value={social}
            onChange={(_, { value }) => setSocial(value)}
          />
          <Form.Select
            label='Economic Orientation'
            options={constants.PARTY_ECONOMIC_VIEWS}
            value={economic}
            onChange={(_, { value }) => setEconomic(value)}
          />      
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color='blue' content='Edit' onClick={editParty} />
        <Button content='Cancel' onClick={props.onClose} />
      </Modal.Actions>
    </Modal>
  )
}
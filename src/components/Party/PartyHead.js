import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';

import { useGetUser, useLoadUser } from '../../context/UserContext';
import { useSetNotification } from '../../context/NotificationContext';
import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Button, Card, Form, Grid, Image, List, Message, Modal, Segment, Select, Statistic, Step } from 'semantic-ui-react';

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
  const [showActions, setShowActions] = useState(false);

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
                <>
                  <Button compact color='blue' icon='cog' onClick={() => setShowEdit(true)} />
                  <Button compact color='blue' icon='bullhorn' onClick={() => setShowActions(true)} />
                </>
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
      <PartyActionModal
        show={showActions}
        onClose={() => setShowActions(false)}
        party={party}
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

function PartyActionModal(props) {
  const { party, show, onClose } = props;
  const [country, setCountry] = useState(null);
  const [regions, setRegions] = useState(null);
  const [selectedAction, setSelectedAction] = useState('');

  useEffect(() => {
    if (party && !country) {
      SoTApi.getCountry(party.country).then(data => {
        if (data.country) {
          setCountry(data.country);
        }
      });
    }

    if (party && regions === null) {
      SoTApi.getCountryRegions(party.country).then(data => {
        if (data.regions) {
          setRegions(data.regions);
        }
      });
    }
  }, [party, country, regions]);

  const handleClose = () => {
    setSelectedAction('');
    onClose();
  }

  const hasNoGovernment = () => {
    if (!country) return false;
    const { government } = country;
    return government && !government.president && !government.vp && government.congress.length === 0;
  }

  return (
    <Modal size='large' open={show} onClose={handleClose}>
      <Modal.Header>Party Actions</Modal.Header>
      <Modal.Content>
        <Message info>
          <Message.Header>What Are Party Actions?</Message.Header>
          <p>
            Party Actions are special actions a party can take which have important implications on the future of your country!
            Each action undertaken will launch a multistep process that when completed, will initiate a special event in your country,
            such as forming a national government, staging a coup, or declaring independence from your country!
          </p>
        </Message>
        <Grid stackable centered>
          {
            hasNoGovernment() ? (
              <Grid.Column mobile={16} computer={5}>
                <Card>
                  <Card.Content>
                    <Card.Header>Form Government</Card.Header>
                    <Card.Meta>Peaceful Action</Card.Meta>
                    <Card.Description>
                      Your country lacks an official government, and your fellow citizens are looking for leadership.
                      It's time for the { party.name } to take the initiative and begin the steps to form a national government!
                    </Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Button basic color='green' onClick={() => setSelectedAction('form_gov')}>
                        Begin Forming Government
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              </Grid.Column>
            ) : (
              <Grid.Column mobile={16} computer={5}>
                <Card>
                  <Card.Content>
                    <Card.Header>Stage Government Coup</Card.Header>
                    <Card.Meta>Violent Action</Card.Meta>
                    <Card.Description>
                      The current regime is corrupt and incompetant -- our people deserve better, and the { party.name } can provide that.
                      We must forcibly take control of the government for benefit of our citizens and prosperity of our nation!
                    </Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Button basic color='red' onClick={() => setSelectedAction('stage_coup')}>
                        Begin Staging Coup
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              </Grid.Column>
            )
          }
          {
            regions && regions.length > 0 && (
              <Grid.Column mobile={16} computer={5}>
                <Card>
                  <Card.Content>
                    <Card.Header>Push for Independence</Card.Header>
                    <Card.Meta>Peaceful and Violent Options</Card.Meta>
                    <Card.Description>
                      A large portion of the population have become disaffected with the country.
                      These people tire of having their culture oppressed and their opinions disregarded and yearn for a country to truly call their own!
                      Will the { party.name } support their calls for independence?
                    </Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button basic color='green' onClick={() => setSelectedAction('support_referendum')}>
                        Support Referendum
                      </Button>
                      <Button basic color='red' onClick={() => setSelectedAction('support_revolt')}>
                        Support Revolt
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              </Grid.Column>
            )
          }
        </Grid>
        {
          selectedAction === 'form_gov' && (
            <FormGovernmentSteps party={party} congressSeats={country && country.government.congressSeats} />
          )
        }
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={handleClose} />
      </Modal.Actions>
    </Modal>
  );
}

function FormGovernmentSteps(props) {
  const { party, congressSeats } = props;
  const user = useGetUser();
  const setNotification = useSetNotification();
  const [activeStep, setActiveStep] = useState(0);
  const [politicians, setPoliticians] = useState(null);
  const [vp, setVP] = useState(null);
  const [cabinet, setCabinet] = useState({ mofa: null, mod: null, mot: null });
  const [seatsRemaining, setSeatsRemaining] = useState(congressSeats);
  const [congress, setCongress] = useState([]);
  const [pp, setPP] = useState(null);

  const cabinetPositions = [
    { key: 'mofa', text: 'Minister of Foreign Affairs', value: 'mofa' },
    { key: 'mod', text: 'Minister of Defense', value: 'mod' },
    { key: 'mot', text: 'Minister of the Treasury', value: 'mot' },
  ];

  useEffect(() => {
    if (party && politicians === null) {
      SoTApi.getCountryPoliticans(party.country).then(data => {
        if (data.politicians) {
          setPoliticians(data.politicians);
        }
      });
    }
  }, [party, politicians]);

  const showStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <List selection relaxed>
              {
                politicians && politicians.map(politician => (
                  <List.Item key={politician._id} onClick={() => selectVP(politician._id)}>
                    <List.Content floated='right'>
                      <Image avatar src={politician.party.image} alt='' />
                    </List.Content>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Image avatar src={politician.image} alt='' />
                      <List.Content>{ politician.displayName }</List.Content>
                    </div>
                  </List.Item>
                ))
              }
            </List>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button color='blue' content='Skip' onClick={() => setActiveStep(step => step + 1)} />
            </div>
          </>
        );
      case 1:
        return (
          <>
            <List selection relaxed>
              {
                politicians && politicians.filter(politician => politician._id !== vp).map(politician => (
                  <List.Item key={politician._id}>
                    <List.Content floated='right'>
                      <Image avatar src={politician.party.image} alt='' />
                      <Select options={cabinetPositions} onChange={(_, { value }) => handleSetCabinet(value, politician._id)} />
                    </List.Content>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Image avatar src={politician.image} alt='' />
                      <List.Content>{ politician.displayName }</List.Content>
                    </div>
                  </List.Item>
                ))
              }
            </List>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button color='green' content='Go Back' onClick={() => setActiveStep(step => step - 1)} />
              <Button color='blue' content='Next' onClick={() => setActiveStep(step => step + 1)} />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <p>Congress Seats Remaining: {seatsRemaining}</p>
            <List selection relaxed>
              {
                politicians && politicians.filter(politician => {
                  let id = politician._id;
                  return id !== vp && id  !== cabinet.mofa && id !== cabinet.mod && id !== cabinet.mot;
                }).map(politician => (
                  <List.Item key={politician._id} onClick={() => handleSetCongress(politician._id)}>
                    <List.Content floated='right'>
                      <Image avatar src={politician.party.image} alt='' />
                    </List.Content>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Image avatar src={politician.image} alt='' />
                      <List.Content>{ politician.displayName }</List.Content>
                    </div>
                  </List.Item>
                ))
              }
            </List>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button color='green' content='Go Back' onClick={() => setActiveStep(step => step - 1)} />
              <Button color='blue' content='Next' onClick={() => setActiveStep(step => step + 1)} />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <List selection relaxed>
              {
                politicians && politicians.filter(politician => {
                  let id = politician._id;
                  return id !== vp && !congress.includes(id) && party.members.includes(id);
                }).map(politician => (
                  <List.Item key={politician._id} onClick={() => setPP(politician._id)}>
                    <List.Content floated='right'>
                      <Image avatar src={politician.party.image} alt='' />
                    </List.Content>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Image avatar src={politician.image} alt='' />
                      <List.Content>{ politician.displayName }</List.Content>
                    </div>
                  </List.Item>
                ))
              }
            </List>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button color='green' content='Go Back' onClick={() => setActiveStep(step => step - 1)} />
              <Button color='blue' content='Done' onClick={formGovernment} disabled={pp === null} />
            </div>
          </>
        );
      default:
        return null;
    }
  }

  const selectVP = politicianID => {
    setVP(politicianID);
    setActiveStep(step => step + 1);
  }

  const handleSetCabinet = (position, politicianID) => {
    setCabinet(currCabinet => ({ ...currCabinet, [position]: politicianID }));
  }

  const handleSetCongress = politicianID => {
    let index = congress.findIndex(id => id === politicianID);
    if (index !== -1) {
      setCongress(currCongress => {
        currCongress.splice(index, 1);
        return [...currCongress];
      });
      setSeatsRemaining(seats => seats + 1);
    } else {
      setCongress(currCongress => [...currCongress, politicianID]);
      setSeatsRemaining(seats => seats - 1);
    }
  }

  const formGovernment = () => {
    let payload = {
      action: 'form_gov',
      government: {
        president: user && user._id,
        vp,
        cabinet,
        congress,
      },
      pp,
    };

    SoTApi.doPartyAction(party._id, payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Government Formed!' });
      } else {
        setNotification({ type: 'error', header: data.error, content: data.errorDetail });
      }
    });
  }

  return (
    <>
      <Step.Group stackable='tablet' attached='top' ordered>
        <Step active={activeStep === 0} completed={activeStep > 0}>
          <Step.Content>
            <Step.Title>Vice President</Step.Title>
            <Step.Description>Select your VP</Step.Description>  
          </Step.Content>
        </Step>
        <Step active={activeStep === 1} completed={activeStep > 1} disabled={activeStep < 1}>
          <Step.Content>
            <Step.Title>Cabinet</Step.Title>
            <Step.Description>Select your cabinet</Step.Description>  
          </Step.Content>
        </Step>
        <Step active={activeStep === 2} completed={activeStep > 2} disabled={activeStep < 2}>
          <Step.Content>
            <Step.Title>Congress</Step.Title>
            <Step.Description>Select your congress members</Step.Description>  
          </Step.Content>
        </Step>
        <Step active={activeStep === 3} completed={activeStep > 3} disabled={activeStep < 3}>
          <Step.Content>
            <Step.Title>Party Leadership</Step.Title>
            <Step.Description>Select Party President Replacement</Step.Description>  
          </Step.Content>
        </Step>
      </Step.Group>
      <Segment attached>
        { showStepContent() }
      </Segment>
    </>
  );
}
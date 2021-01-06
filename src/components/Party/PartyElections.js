import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { format, addMonths } from 'date-fns';

import { useSetNotification } from '../../context/NotificationContext';
import { useGetUser, useLoadUser } from '../../context/UserContext';
import SoTApi from '../../services/SoTApi';

import { Button, Divider, Image, List, Tab } from 'semantic-ui-react';

export default function PartyElections(props) {
  const { party, setReload } = props;
  const history = useHistory();
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [election, setElection] = useState(null);
  const [partyPres, setPartyPres] = useState(null);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const fetchCandidates = async (targetElection) => {
      setCandidates(await targetElection.candidates.reduce(async (accum, candidate) => {
        let data = await SoTApi.getProfile(candidate.id);
        if (data.profile) {
          accum.push(data.profile);
        }
  
        return accum;
      }, []));
    }

    if (party) {
      let electionIndex = party.elections.length - 1;
      let targetElection = party.elections[electionIndex];
      if (targetElection) {
        setElection(targetElection);
        fetchCandidates(targetElection);
      }

      if (party.president) {
        SoTApi.getProfile(party.president).then(data => {
          if (data.profile) {
            setPartyPres(data.profile);
          }
        });
      }
    }
  }, [party]);

  const hasVoted = () => {
    return new Date(user.canVote) > new Date(Date.now());
  }

  const runForPresident = () => {
    let payload = {
      action: 'add_party_president_candidate',
      userId: user && user._id,
    };
    SoTApi.doPartyAction(party._id, payload).then(data => {
      if (data.success) {
        setReload(true);
      }
    });
  }

  const resignFromPresidentElection = () => {
    let payload = {
      action: 'resign_from_pp_election',
      userId: user && user._id,
    };
    SoTApi.doPartyAction(party._id, payload).then(data => {
      if (data.success) {
        setReload(true);
      }
    });
  }

  const resignFromPresidency = () => {
    let payload = {
      action: 'resign_from_pp',
      userId: user && user._id,
    };
    SoTApi.doPartyAction(party._id, payload).then(data => {
      if (data.success) {
        setReload(true);
      }
    });
  }

  const handleVote = candidateId => {
    let payload = {
      scope: 'party',
      candidate: candidateId,
    };

    SoTApi.vote(payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Voted!' });
        loadUser();
        setReload(true);
      } else {
        setNotification({ type: 'error', header: data.error });
      }
    });
  }

  const goToElectionResults = () => {
    let date = new Date(Date.now());

    if (date.getUTCDate() <= 25) {
      date = addMonths(date, -1);
    }
    
    history.push('/elections/results', {
      type: 2,
      country: party.country,
      party: party._id,
      date: format(date, 'MMM yyyy'),
    });
  }

  return party && (
    <Tab.Pane>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h3>Current Party President:</h3></div>
        <Button
          compact
          size='tiny'
          color='green'
          content='View Past Elections'
          onClick={goToElectionResults}
        />
      </div>      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {
          partyPres ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, fontSize: '1.25rem', cursor: 'pointer', width: 'fit-content' }} onClick={() => history.push(`/profile/${partyPres._id}`)}>
              <Image size='tiny' circular src={partyPres.image} alt='' />
              { partyPres.displayName }
            </div>
          ) : 'None'
        }
        {
          partyPres && partyPres._id === user._id && (
            <Button
              compact
              size='tiny'
              color='red'
              content='Resign'
              onClick={resignFromPresidency}
            />
          )
        }
      </div>
      {
        election && (
          <>
            <Divider horizontal>{ election.date } Election</Divider>
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Candidates ({ candidates.length }):</strong>
              <Button
                compact
                size='small'
                color='blue'
                content='Run For Party President'
                disabled={election.active === true || election.candidates.findIndex(can => can.id === user._id) !== -1}
                onClick={runForPresident}
              />
            </span>
            <List selection relaxed divided>
              {
                candidates.map((candidate, idx) => (
                  <List.Item key={idx}>
                    {
                      election.active && (
                        <List.Content floated='right'>
                          <Button
                            compact
                            size='tiny'
                            color='green'
                            content='Vote'
                            disabled={user && hasVoted()}
                            onClick={() => handleVote(candidate._id)}
                          />
                        </List.Content>
                      )
                    }
                    {
                      !election.active && candidate._id === user._id && (
                        <List.Content floated='right'>
                          <Button
                            compact
                            size='tiny'
                            color='red'
                            content='Resign'
                            onClick={resignFromPresidentElection}
                          />
                        </List.Content>
                      )
                    }
                    <List.Content style={{ display: 'flex', alignItems: 'center' }}>
                      <Image avatar src={candidate.image} alt='' />
                      <List.Header>{ candidate.displayName }</List.Header>
                    </List.Content>
                  </List.Item>
                ))
              }
            </List>
          </>
        )
      }
    </Tab.Pane>
  );
}
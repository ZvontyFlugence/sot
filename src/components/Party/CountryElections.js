import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { format, addMonths } from 'date-fns';

import { useSetNotification } from '../../context/NotificationContext';
import { useGetUser } from '../../context/UserContext';
import SoTApi from '../../services/SoTApi';

import { Button, Divider, Image, List, Tab } from 'semantic-ui-react';

export default function CountryElections(props) {
  const { party, setReload } = props;
  const history = useHistory();
  const user = useGetUser();
  const setNotification = useSetNotification();
  const [election, setElection] = useState(null);
  const [country, setCountry] = useState(null);
  const [cp, setCP] = useState(null);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    if (party) {
      SoTApi.getCountry(party.country).then(data => {
        if (data.country) {
          setCountry(data.country);
          if (data.country.government.president) {
            SoTApi.getProfile(data.country.government.president).then(cpData => {
              if (cpData.profile) {
                if (cpData.profile.party > 0) {
                  SoTApi.getParty(cpData.profile.party).then(partyData => {
                    if (partyData.party) {
                      cpData.profile.party = partyData.party;
                      setCP(cpData.profile);
                    }
                  });
                } else {
                  setCP(cpData.profile);
                }                
              }
            });
          }
        }
      });
    }
  }, [party]);

  useEffect(() => {
    const fetchCandidates = async targetElection => {
      setCandidates(await targetElection.candidates.reduce(async (accum, candidate) => {
        let data = await SoTApi.getProfile(candidate.id);
        if (data.profile) {
          data.profile.endorsers = [];
          for (let endorser of candidate.endorsed) {
            let endorserParty = await SoTApi.getParty(endorser);
            if (endorserParty.party) {
              data.profile.endorsers = [...data.profile.endorsers, endorserParty.party];
            }
          }
          accum.push(data.profile);
        }

        return accum;
      }, []));
    }

    if (country) {
      let electionIndex = country.presidentElections.length - 1;
      let targetElection = country.presidentElections[electionIndex];
      if (targetElection) {
        setElection(targetElection);
        fetchCandidates(targetElection);
      }
    }
  }, [country]);

  const runForCP = () => {
    let payload = {
      action: 'add_cp_candidate',
      data: {
        candidateID: user && user._id,
      },
    };

    SoTApi.doPartyAction(party._id, payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Successfully Ran for Country President!' });
        setReload(true);
      }
    });
  }

  const resignFromCPElection = () => {
    let payload = {
      action: 'resign_from_cp_election',
      userId: user && user._id,
    };

    SoTApi.doPartyAction(party._id, payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Resigned from Country President Election' });
        setReload(true);
      }
    });
  }

  const endorseCPCandidate = candidateId => {
    let payload = {
      action: 'endorse_cp_candidate',
      candidateId,
    };

    SoTApi.doPartyAction(party._id, payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Endorsed Candidate!' });
        setReload(true);
      }
    });
  }

  const goToElectionResults = () => {
    let date = new Date(Date.now());

    if (date.getUTCMonth() <= 5) {
      date = addMonths(date, -1);
    }

    history.push('elections/results', {
      type: 0,
      country: party.country,
      date: format(date, 'MMM yyyy'),
    });
  }

  const goToElection = () => {
    history.push('/election');
  }

  return country && (
    <Tab.Pane>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h3>Current Country President:</h3></div>
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
          cp ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, fontSize: '1.25rem', cursor: 'pointer', width: 'fit-content' }}>
              <Image circular size='tiny' src={cp.image} alt='' />
              { cp.displayName }
            </div>
          ) : 'No Sitting Country President!'
        }
        {
          cp && (
            <Image circular size='mini' src={cp.party.image} alt='' />
          )
        } 
      </div>
      {
        election && !election.active ? (
          <>
            <Divider horizontal>{ election.date } Election</Divider>
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Candidates ({ candidates.length }):</strong>
              <Button
                compact
                size='small'
                color='blue'
                content='Run For Country President'
                disabled={election.candidates.findIndex(can => can.id === user._id) !== -1}
                onClick={runForCP}
              />
            </span>
            <List selection relaxed divided>
              {
                candidates.map((candidate, idx) => (
                  <List.Item key={idx}>
                    {
                      party.president === user._id && (
                        <List.Content floated='right'>
                          {
                            candidate.endorsers.map(endorser => (
                              <Image
                                avatar
                                key={endorser._id}
                                src={endorser.image}
                                alt=''
                                title={endorser.name}
                                onClick={() => history.push(`/party/${endorser._id}`)}
                              />
                            ))
                          }
                          <Button
                            compact
                            size='tiny'
                            color='yellow'
                            content='Endorse'
                            disabled={candidate.endorsers.findIndex(endorser => endorser._id === party._id) !== -1}
                            onClick={() => endorseCPCandidate(candidate._id)}
                          />
                        </List.Content>
                      )
                    }
                    {
                      candidate._id === user._id && (
                        <List.Content floated='right'>
                          {
                            candidate.endorsers.map(endorser => (
                              <Image
                                avatar
                                key={endorser._id}
                                src={endorser.image}
                                alt=''
                                title={endorser.name}
                                onClick={() => history.push(`/party/${endorser._id}`)}
                              />
                            ))
                          }
                          <Button
                            compact
                            size='tiny'
                            color='red'
                            content='Resign'
                            onClick={resignFromCPElection}
                          />
                        </List.Content>
                      )
                    }
                    {
                      candidate._id !== user._id && party.president !== user._id && (
                        <List.Content floated='right'>
                          {
                            candidate.endorsers.map(endorser => (
                              <Image
                                avatar
                                key={endorser._id}
                                src={endorser.image}
                                alt=''
                                title={endorser.name}
                                onClick={() => history.push(`/party/${endorser._id}`)}
                              />
                            ))
                          }
                        </List.Content>
                      )
                    }
                    <List.Content>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Image avatar src={candidate.image} alt='' />
                        <List.Header>{ candidate.displayName }</List.Header>
                      </div>
                    </List.Content>
                  </List.Item>
                ))
              }
            </List>
          </>
        ) : (
          <center>
            <span>Country President Elections are currently underway!</span>
            <br />
            <Button
              compact
              size='tiny'
              color='green'
              content='Vote'
              onClick={goToElection}
            />
          </center>
        )
      }
    </Tab.Pane>
  );
}
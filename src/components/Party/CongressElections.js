import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { format, addMonths } from 'date-fns';

import { useSetNotification } from '../../context/NotificationContext';
import { useGetUser } from '../../context/UserContext';
import SoTApi from '../../services/SoTApi';

import { Button, Divider, Image, Label, List, Tab } from 'semantic-ui-react';

export default function CongressElections(props) {
  const { party, setReload } = props;
  const history = useHistory();
  const user = useGetUser();
  const setNotification = useSetNotification();
  const [election, setElection] = useState(null);
  const [country, setCountry] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [congress, setCongress] = useState([]);

  useEffect(() => {
    if (party) {
      SoTApi.getCountry(party.country).then(data => {
        if (data.country) {
          setCountry(data.country);
        }
      });
    }
  }, [party]);

  useEffect(() => {
    const fetchCandidates = async targetElection => {
      setCandidates(await targetElection.candidates.reduce(async (accum, candidate) => {
        if (candidate.party === party._id) {
          let data = await SoTApi.getProfile(candidate.id);
          let regionData = await SoTApi.getRegion(candidate.region);
          if (data.profile && regionData.region) {
            data.profile.represents = regionData.region;
            data.profile.confirmed = candidate.confirmed;
            accum.push(data.profile);
          }
        }
        return accum;
      }, []));
    }

    if (country) {
      let electionIndex = country.congressElections.length - 1;
      let targetElection = country.congressElections[electionIndex];
      if (targetElection) {
        setElection(targetElection);
        fetchCandidates(targetElection);
      }

      setCongress([]);

      for (let congressMember of country.government.congress) {
        SoTApi.getProfile(congressMember.id).then(data => {
          if (data.profile && data.profile.party === party._id) {
            SoTApi.getRegion(congressMember.region).then(regionData => {
              if (regionData.region) {
                data.profile.represents = regionData.region;
                setCongress(currCongress => [...currCongress, data.profile]);
              }
            });
          }
        });
      }
    }
  }, [country, party._id]);

  const runForCongress = () => {
    let payload = {
      action: 'add_congress_candidate',
      data: {
        candidateID: user && user._id,
        regionID: user && user.location,
      },
    };

    SoTApi.doPartyAction(party._id, payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Successfully Ran for Congress!' });
        setReload(true);
      }
    });
  }

  const resignFromCongressElection = () => {
    let payload = {
      action: 'resign_from_congress_election',
      userId: user && user._id,
    };

    SoTApi.doPartyAction(party._id, payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Resigned from Congress Election' });
        setReload(true);
      }
    });
  }

  const confirmCongressCandidate = candidateId => {
    let payload = {
      action: 'confirm_congress_candidate',
      userId: candidateId
    };

    SoTApi.doPartyAction(party._id, payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Congress Candidate Confirmed!' });
        setReload(true);
      }
    });
  }

  const goToElectionResults = () => {
    let date = new Date(Date.now());

    if (date.getUTCDate() <= 15) {
      date = addMonths(date, -1);
    }

    history.push('/elections/results', {
      type: 1,
      country: party.country,
      date: format(date, 'MMM yyyy'),
    });
  }

  const goToElection = () => {
    history.push('/election');
  }

  return country && (
    <Tab.Pane>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h3>Current Congress Members ({ congress.length }/{ country.government.congressSeats }):</h3></div>
          <Button
            compact
            size='tiny'
            color='green'
            content='View Past Elections'
            onClick={goToElectionResults}
          />
        </div>
        <List selection relaxed divided>
          {
            congress.map((congressMember, idx) => (
              <List.Item key={idx}>
                <List.Content floated='right'>
                  <Label content={congressMember.represents.name} />
                </List.Content>
                <List.Content>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Image avatar src={congressMember.image} alt='' />
                    <List.Header>{ congressMember.displayName }</List.Header>
                  </div>
                </List.Content>
              </List.Item>
            ))
          }
        </List>
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
                content='Run For Congress'
                disabled={election.active === true || election.candidates.findIndex(can => can.id === user._id) !== -1}
                onClick={runForCongress}
              />
            </span>
            {
              election.active === false ? (
                <List selection relaxed divided>
                  {
                    candidates.map((candidate, idx) => (
                      <List.Item key={idx}>
                        {
                          party.president === user._id && (
                            <List.Content floated='right'>
                              <Button
                                compact
                                size='tiny'
                                color='yellow'
                                content='Confirm'
                                disabled={candidate.confirmed}
                                onClick={() => confirmCongressCandidate(candidate._id)}
                              />
                            </List.Content>
                          )
                        }
                        {
                          candidate._id === user._id && (
                            <List.Content floated='right'>
                              <Button
                                compact
                                size='tiny'
                                color='red'
                                content='Resign'
                                onClick={resignFromCongressElection}
                              />
                            </List.Content>
                          )
                        }
                        <List.Content style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Image avatar src={candidate.image} alt='' />
                            <List.Header>{ candidate.displayName }</List.Header>
                            <List.Description>{ candidate.region.name }</List.Description>
                          </div>
                        </List.Content>
                      </List.Item>
                    ))
                  }
                </List>
              ) : (
                <center>
                  <span>Congress Elections are currently underway!</span>
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
          </>
        )
      }
    </Tab.Pane>
  );
}
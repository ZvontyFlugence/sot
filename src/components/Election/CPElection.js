import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useSetNotification } from '../../context/NotificationContext';
import { useGetUser, useLoadUser } from '../../context/UserContext';
import SoTApi from '../../services/SoTApi';

import { Button, Image, Segment, Table } from 'semantic-ui-react';

export default function CPElection(props) {
  const { election } = props;
  const history = useHistory();
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      let candidateData = [];
      for (let candidate of election.candidates) {
        let data = await SoTApi.getProfile(candidate.id);
        
        if (data.profile) {
          let endorsers = [];
          for (let endorser of candidate.endorsed) {
            let partyData = await SoTApi.getParty(endorser);
            if (partyData.party) {
              endorsers.push(partyData.party);
            }
          }
          data.profile.endorsers = endorsers;

          let partyData = await SoTApi.getParty(candidate.party);
          if (partyData.party) {
            data.profile.party = partyData.party;
          }
          candidateData.push(data.profile);
        }
      }

      setCandidates(candidateData);
    }

    if (election) {
      fetchCandidates();
    }
  }, [election]);

  const hasVoted = () => new Date(user.canVote) > new Date(Date.now());

  const handleVote = candidateId => {
    let payload = {
      scope: 'president',
      candidate: candidateId,
    };

    SoTApi.vote(payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'You Have Voted!' });
        loadUser();
      } else {
        setNotification({ type: 'error', header: 'Failed to Vote!' });
      }
    });
  }

  return (
    <Segment>
      <Table basic='very'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Candidate</Table.HeaderCell>
            <Table.HeaderCell>Party</Table.HeaderCell>
            <Table.HeaderCell>Endorsements</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            candidates.map((candidate, idx) => (
              <Table.Row key={idx}>
                <Table.Cell>
                  <Image avatar src={candidate.image} alt='' />
                  &nbsp;
                  { candidate.displayName }
                </Table.Cell>
                <Table.Cell>
                  <div style={{ cursor: 'pointer', width: 'fit-content' }} onClick={() => history.push(`/party/${candidate.party._id}`)}>
                    <Image avatar src={candidate.party.image} />
                    &nbsp;
                    { candidate.party.name }
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {
                      candidate.endorsers.map((endorser, index) => (
                        <Image
                          avatar
                          key={index}
                          src={endorser.image}
                          alt=''
                          title={endorser.name}
                          onClick={() => history.push(`/party/${endorser._id}`)}
                        />
                      ))
                    }
                  </div>
                </Table.Cell>
                <Table.Cell collapsing>
                  <Button
                    compact
                    size='tiny'
                    color='blue'
                    content='Vote'
                    disabled={user && hasVoted()}
                    onClick={() => handleVote(candidate._id)}
                  />
                </Table.Cell>
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table>
    </Segment>
  );
}
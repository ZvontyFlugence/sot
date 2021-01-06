import { useHistory } from 'react-router-dom';

import { Icon, Image, Table } from 'semantic-ui-react';

export default function CongressElectionResults(props) {
  const { country, election, candidates, parties } = props;
  const history = useHistory();

  return country && election && candidates && parties ? (
    <>
      <Table basic='very'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Candidate</Table.HeaderCell>
            <Table.HeaderCell>Party</Table.HeaderCell>
            <Table.HeaderCell>Votes</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            candidates && candidates.map((candidate, idx) => {
              let candidateParty = parties.find(p => p._id === candidate.party);
              return (
                <Table.Row key={idx} positive={election.winners.includes(candidate._id)}>
                  <Table.Cell>
                    {
                      election.winners.includes(candidate._id) && (
                        <>
                          <Icon name='checkmark' />
                          &nbsp;
                        </>
                      )
                    }
                    <div style={{ cursor: 'pointer', width: 'fit-content' }} onClick={() => history.push(`/profile/${candidate._id}`)}>
                      <Image avatar src={candidate.image} alt='' />
                      &nbsp;
                      { candidate.displayName }
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ cursor: 'pointer', width: 'fit-content' }} onClick={() => history.push(`/party/${candidateParty._id}`)}>
                      <Image avatar src={candidateParty.logo} alt='' />
                      &nbsp;
                      { candidateParty.name }
                    </div>
                  </Table.Cell>
                  <Table.Cell collapsing style={{ textAlign: 'right' }}>
                    { election.candidates[candidate.index].votes }
                  </Table.Cell>
                </Table.Row>
              )
            })
          }
        </Table.Body>
      </Table>
    </>
  ) : null;
}
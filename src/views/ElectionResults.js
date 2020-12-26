import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';

import Layout from '../layout/Layout';
import SoTApi from '../services/SoTApi';

import { Button, Dropdown, Icon, Image, Segment, Table } from 'semantic-ui-react';

export default function ElectionResults() {
  const location = useLocation();
  const [countries, setCountries] = useState([]);
  const [parties, setParties] = useState([]);
  const [country, setCountry] = useState((location.state && location.state.country) || 1);
  const [electionType, setElectionType] = useState((location.state && location.state.type) || 0);
  const [party, setParty] = useState((location.state && location.state.party) || 1);
  const [date, setDate] = useState((location.state && location.state.date) || format(new Date(Date.now()), 'MMM yyyy'));
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    SoTApi.getCountries().then(data => {
      if (data.countries) {
        setCountries(data.countries.map(c => ({
          ...c,
          value: c._id,
          text: (
            <Dropdown.Item key={c._id} value={c._id}>
              <i className={`flag-icon flag-icon-${c.flag_code} flag-inline-left`} />
              &nbsp;
              { c.name }
            </Dropdown.Item>
          ),
        })));
      }
    });
  }, []);

  useEffect(() => {
    if (country) {
      SoTApi.getCountryParties(country).then(data => {
        if (data.parties) {
          setParties(data.parties.map(p => ({
            ...p,
            image: undefined,
            logo: p.image,
            value: p._id,
            text: (
              <Dropdown.Item key={p._id} value={p._id}>
                <Image avatar src={p.image} alt='' style={{ backgroundRepeat: 'no-repeat' }} />
                &nbsp;
                { p.name }
              </Dropdown.Item>
            ),
          })));
        }
      });
    }
  }, [country]);

  useEffect(() => {
    if (electionType) {
      switch (electionType) {
        case 2:
          let selected = parties.find(p => p._id === party);
          if (!selected) return;
          let targetElection = selected.elections.find(e => e.date === date);
          setElection(targetElection);
          break;
        default:
          setElection(null);
          setCandidates([]);
          break;
      }
    }
  }, [date, electionType, parties, party]);

  useEffect(() => {
    const fetchCandidates = async (targetElection) => {
      setCandidates(await targetElection.candidates.reduce(async (accum, candidate, index) => {
        let data = await SoTApi.getProfile(candidate.id);
        if (data.profile) {
          accum.push({ ...data.profile, index });
        }
  
        return accum;
      }, []));
    }

    if (election) {
      fetchCandidates(election);
    }
  }, [election]);

  const handleChangeCountry = value => {
    setCountry(value);
    setParties([]);
  }

  const handleChangeDate = value => {
    setDate(value);

    switch (electionType) {
      case 2:
        let selected = parties.find(p => p._id === party);
        if (!selected) return;
        let targetElection = selected.elections.find(e => e.date === value);
        setElection(targetElection);
        break;
      default:
        break;
    }
  }

  const getElectionDates = () => {
    let selected = parties.find(p => p._id === party);
    if (!selected) return;

    return selected.elections.filter(el => el.finished).map((election, idx) => ({
      key: idx,
      text: election.date,
      value: election.date,
    }));
  }

  return (
    <Layout>
      <div id='electionResults'>
        <h1>Election Results</h1>
        <Segment>
          <Segment style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Dropdown
                options={countries}
                value={country}
                onChange={(_, { value }) => handleChangeCountry(value)}
                selection
              />
              <Button.Group>
                <Button color={electionType === 0 ? 'blue' : ''} onClick={() => setElectionType(0)}>
                  President
                </Button>
                <Button color={electionType === 1 ? 'blue' : ''} onClick={() => setElectionType(1)}>
                  Congress
                </Button>
                <Button color={electionType === 2 ? 'blue' : ''} onClick={() => setElectionType(2)}>
                  Party
                </Button>
              </Button.Group>
            </div>
            {
              electionType === 2 && (
                <div>
                  <Dropdown
                    options={parties}
                    value={party}
                    onChange={(_, { value }) => setParty(value)}
                    selection
                  />
                </div>
              )
            }
          </Segment>
          <Segment>
            <p>Election Date:</p>
            <Dropdown
              options={getElectionDates()}
              value={date}
              onChange={(_, { value }) => handleChangeDate(value)}
              selection
            />
            {
              electionType !== 1 && (
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
                      election && candidates && candidates.map((candidate, idx) => {
                        let candidateParty = parties.find(p => p._id === candidate.party);
                        return (
                          <Table.Row key={idx} positive={election.winner === candidate._id}>
                            <Table.Cell>
                              <Icon name='checkmark' />
                              &nbsp;
                              <Image avatar src={candidate.image} alt='' />
                              &nbsp;
                              { candidate.displayName }
                            </Table.Cell>
                            <Table.Cell>
                              <Image avatar src={candidateParty.logo} alt='' />
                              &nbsp;
                              { candidateParty.name }
                            </Table.Cell>
                            <Table.Cell collapsing style={{ textAlign: 'right' }}>
                              { election.candidates[candidate.index].votes }
                            </Table.Cell>
                          </Table.Row>
                        );
                      })
                    }
                  </Table.Body>
                </Table>
              )
            }
          </Segment>
        </Segment>
      </div>
    </Layout>
  );
}
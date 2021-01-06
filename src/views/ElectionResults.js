import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import CPElectionResults from '../components/Election/CPElectionResults';
import CongressElectionResults from '../components/Election/CongressElectionResults';
import Layout from '../layout/Layout';
import SoTApi from '../services/SoTApi';

import { Button, Dropdown, Icon, Image, Segment, Table } from 'semantic-ui-react';

export default function ElectionResults() {
  const location = useLocation();
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [parties, setParties] = useState([]);
  const [country, setCountry] = useState((location.state && location.state.country) || 1);
  const [electionType, setElectionType] = useState((location.state && location.state.type) || 0);
  const [region, setRegion] = useState((location.state && location.state.region) || null);
  const [party, setParty] = useState((location.state && location.state.party) || 1);
  const [date, setDate] = useState((location.state && location.state.date) || null);
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

      SoTApi.getCountryRegions(country).then(data => {
        if (data.regions) {
          setRegions(data.regions.map(reg => ({
            ...reg,
            value: reg._id,
            text: reg.name,
          })));
        }
      });
    }
  }, [country]);

  useEffect(() => {
    if (electionType) {
      let selected = null;
      let targetElection = null;
      switch (electionType) {
        case 0:
          selected = countries.find(c => c._id === country);
          if (!selected) return;
          targetElection = selected.presidentElections.find(e => e.date === date);
          setElection(targetElection);
          break;
        case 1:
          selected = countries.find(c => c._id === country);
          if (!selected) return;
          targetElection = selected.congressElections.find(e => e.date === date);
          setElection(targetElection);
          break;
        case 2:
          selected = parties.find(p => p._id === party);
          if (!selected) return;
          targetElection = selected.elections.find(e => e.date === date);
          setElection(targetElection);
          break;
        default:
          setElection(null);
          setCandidates([]);
          break;
      }
    }
  }, [date, electionType, parties, party, countries, country]);

  useEffect(() => {
    const fetchCandidates = async (targetElection, targetRegion = undefined) => {
      let electionCandidates = targetElection.candidates;
      if (targetRegion) {
        electionCandidates = targetElection.candidates.filter(can => can.region === region);
      }

      setCandidates(await electionCandidates.reduce(async (accum, candidate, index) => {
        let data = await SoTApi.getProfile(candidate.id);
        if (data.profile) {
          accum.push({ ...data.profile, index });
        }
  
        return accum;
      }, []));
    }

    if (election && region) {
      fetchCandidates(election, region);
    } else if (election) {
      fetchCandidates(election);
    }
  }, [election, region]);

  const handleChangeCountry = value => {
    setCountry(value);
    setParties([]);
    setDate(null);
    setElection(null);
    setCandidates([]);
    setRegion(null);
  }

  const handleChangeElectionType = value => {
    setElectionType(value);
    //setParties([]);
    setDate(null);
    setElection(null);
    setCandidates([]);
    setRegion(null);
  }

  const handleChangeDate = value => {
    setDate(value);
    let selected = null;
    let targetElection = null;

    switch (electionType) {
      case 0:
        selected = countries.find(c => c._id === country);
        if (!selected) return;
        targetElection = selected.presidentElections.find(e => e.date === value);
        setElection(targetElection);
        break;
      case 1:
        selected = countries.find(c => c._id === country);
        if (!selected) return;
        targetElection = selected.congressElections.find(e => e.date === value);
        setElection(targetElection);
        break;
      case 2:
        selected = parties.find(p => p._id === party);
        if (!selected) return;
        targetElection = selected.elections.find(e => e.date === value);
        setElection(targetElection);
        break;
      default:
        break;
    }
  }

  const getElectionDates = () => {
    let selected = null;
    switch (electionType) {
      case 0:
        selected = countries.find(c => c._id === country);
        if (!selected) return;

        return selected.presidentElections.filter(el => el.finished).map((el, idx) => ({
          key: idx,
          text: el.date,
          value: el.date,
        }));
      case 1:
        selected = countries.find(c => c._id === country);
        if (!selected) return;

        return selected.congressElections.filter(el => el.finished).map((el, idx) => ({
          key: idx,
          text: el.date,
          value: el.date,
        }));
      case 2:
        selected = parties.find(p => p._id === party);
        if (!selected) return;
    
        return selected.elections.filter(el => el.finished).map((el, idx) => ({
          key: idx,
          text: el.date,
          value: el.date,
        }));
      default:
        return;
    }
  }

  const displayElectionResults = () => {
    switch (electionType) {
      case 0:
        return country && election && candidates.length > 0 && (
            <CPElectionResults
              country={country}
              election={election}
              candidates={candidates}
              parties={parties}
            />
          );
      case 1:
        return country && election && candidates.length > 0 && region && (
          <CongressElectionResults
            country={country}
            election={election}
            candidates={candidates}
            parties={parties}
          />
        );
      case 2:
        return (
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
                        {
                          election.winner === candidate._id && (
                            <>
                              <Icon name='checkmark' />
                              &nbsp;
                            </>
                          )
                        }
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
        );
      default:
        return null;
    }
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
                <Button color={electionType === 0 ? 'blue' : undefined} onClick={() => handleChangeElectionType(0)}>
                  President
                </Button>
                <Button color={electionType === 1 ? 'blue' : undefined} onClick={() => handleChangeElectionType(1)}>
                  Congress
                </Button>
                <Button color={electionType === 2 ? 'blue' : undefined} onClick={() => handleChangeElectionType(2)}>
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
            {
              electionType === 1 && (
                <div>
                  <Dropdown
                    options={regions}
                    value={region}
                    onChange={(_, { value }) => setRegion(value)}
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
            { displayElectionResults() }
          </Segment>
        </Segment>
      </div>
    </Layout>
  );
}
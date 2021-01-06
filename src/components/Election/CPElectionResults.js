/*global google*/
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useSetNotification } from '../../context/NotificationContext';
import { pSBC } from '../../util/config';
import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Icon, Image, Message, Table } from 'semantic-ui-react';
import { GMap } from 'primereact/gmap';

export default function CPElectionResults(props) {
  const { country, election, candidates, parties } = props;
  const history = useHistory();


  const displayElectionInfoBox = () => {
    let electionSystem = 'a Popular Vote'
    let content = undefined;
    if (election.system === 'Electoral College') {
      electionSystem = 'an Electoral College'
      content = 'There may be a slight discrepancy in the total number of electoral votes due to rounding!';
    }

    return <Message info header={`This election was conducted with ${electionSystem} system`} content={content} />
  }

  return country && election && candidates && parties ? (
    <>
      { displayElectionInfoBox() }
      <Table basic='very'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Candidate</Table.HeaderCell>
            <Table.HeaderCell>Party</Table.HeaderCell>
            <Table.HeaderCell>Endorsers</Table.HeaderCell>
            <Table.HeaderCell>Votes</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            candidates && candidates.map((candidate, idx) => {
              let candidateParty = parties.find(p => p._id === candidate.party);
              let endorsers = candidate.endorsed && candidate.endorsed.map(endorser => {
                return parties.find(p => p._id === endorser);
              });
              let votes = candidate.votes && candidate.votes.reduce((accum, voteObj) => accum + voteObj.tally, 0);

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
                    { candidateParty && (
                      <div style={{ width: 'fit-content', cursor: 'pointer' }} onClick={() => history.push(`/party/${candidateParty._id}`)}>
                        <Image avatar src={candidateParty.logo} alt='' />
                        &nbsp;
                        { candidateParty.name }
                      </div>
                    )}                                        
                  </Table.Cell>
                  <Table.Cell>
                    {
                      endorsers && endorsers.map((endorser, index) => (
                        <Image
                          avatar
                          key={index}
                          src={endorser.logo}
                          alt=''
                          title={endorser.name}
                          onClick={() => history.push(`/party/${endorser._id}`)}
                        />
                      ))
                    }
                  </Table.Cell>
                  <Table.Cell collapsing>
                    { election.tally && election.winner ? election.tally[election.winner] : votes }
                  </Table.Cell>
                </Table.Row>
              )
            })
          }
        </Table.Body>
      </Table>
      <ElectoralCollegeResults
        country={country}
        election={election}
        candidates={candidates}
        parties={parties}
      />
    </>
  ) : null;
}

function ElectoralCollegeResults(props) {
  const { country, election, candidates, parties } = props;
  const history = useHistory();
  const setNotification = useSetNotification();
  const [overlays, setOverlays] = useState([]);

  useEffect(() => {
    const displayRegionInfo = region => {
      if (election.system !== 'Electoral College') return;
      let regionResults = election.ecResults[region._id];
      let results = [];
      if (regionResults) {
        for (let candidateID in regionResults) {
          let candidate = candidates.find(can => can._id == candidateID);
          if (candidate) {
            let party = parties.find(p => p._id === candidate.party);
            results.push({
              candidate,
              party,
              votes: regionResults[candidateID],
            });
          }
        }
      }
      setNotification({
        type: 'info',
        header: (
          <span style={{ fontSize: '1.25rem' }}>
            { region.name }
          </span>
        ),
        content: (
          <div style={{ margin: '0 auto' }}>
            <p style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                Electoral College Votes: { region.ecVotes }
              </div>
              {
                results.length > 0 ? (
                  results.map((result, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Image avatar src={result.candidate.image} />
                        &nbsp;
                        { result.candidate.displayName }
                      </div>
                      <div>
                        <Image avatar src={result.party.logo} />
                      </div>
                      <div>
                        { (result.votes * 100).toFixed(1) }%
                      </div>
                    </div>
                  ))
                ) : 'No Votes'
              }
            </p>
          </div>
        )
      })
    }

    const getRegionColor = regionID => {
      if (election.system !== 'Electoral College' || !Object.keys(election.ecResults).includes(`${regionID}`)) {
        return '#777777';
      }
      // Get results from region
      let regionResults = election.ecResults && election.ecResults[regionID];
      // Calculate winning candidate
      let maxVotes = 0;
      let winner = null;
      if (regionResults) {
        for (let candidate in regionResults) {
          if (regionResults[candidate] > maxVotes) {
            maxVotes = regionResults[candidate];
            winner = candidate;
          } else if (regionResults[candidate] === maxVotes) {
            const prevWinner = winner;
            let candidateAIndex = candidates.findIndex(can => can.id === candidate);
            let candidateBIndex = candidates.findIndex(can => can.id === prevWinner);
            if (candidateAIndex !== -1 && candidateBIndex !== -1) {
              if (candidates[candidateAIndex].xp > candidates[candidateBIndex].xp) {
                winner = candidate;
              }
            }
          }
        }
      }
  
      if (!winner) {
        return '#777777';
      }
  
      // Get candidates party
      winner = candidates.find(can => {
        return can._id == winner;
      });

      if (!winner) {
        return '#777777';
      }
  
      let party = parties.find(p => p._id === winner.party);
      if (!party) {
        return '#777777';
      }
  
      // Return party color
      return party.color;
    }

    SoTApi.getCountryRegions(country).then(data => {
      if (data.regions) {
        setOverlays(data.regions.map(region => {
          let paths = [];
          if (!region.type) {
            paths = region.borders.map(path => ({ lat: path.lng, lng: path.lat }));
          } else {
            paths = region.borders.map(geom => {
              return geom.map(path => ({ lat: path.lng, lng: path.lat }));
            });
          }
          const color = getRegionColor(region._id);
          let polygon = new google.maps.Polygon({ paths, strokeWeight: 1, fillColor: color, fillOpacity: 0.9 });
          polygon.addListener('click', () => history.push(`/region/${region._id}`));
          polygon.addListener('mouseover', () => {
            displayRegionInfo(region);

            // Highlight
            polygon.setOptions({ fillColor: pSBC(0.3, color) });
          });
          polygon.addListener('mouseout', () => {
            setNotification(undefined);
            polygon.setOptions({ fillColor: color });
          });
          return polygon;
        }));
      }
    });
  }, [candidates, country, parties, election.ecResults, history]);

  const options = {
    center: {
      lat: 37.72886323155891,
      lng: -97.86977002071538,
    },
    zoom: 4,
    disabledDefaultUI: true,
    styles: constants.MAP_STYLE,
  };

  return election.system === 'Electoral College' ? (
    <div id='world' style={{ marginTop: 10 }}>
      <h1>Electoral College Results</h1>
      <div>
        <GMap
          overlays={overlays}
          options={options}
          style={{ width: '100%', minHeight: '500px' }}
        />
      </div>
    </div>
  ) : (<></>);
}
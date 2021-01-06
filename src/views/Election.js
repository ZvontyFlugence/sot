import { useEffect, useState } from 'react';

import { useGetUser } from '../context/UserContext';
import CPElection from '../components/Election/CPElection';
import CongressElection from '../components/Election/CongressElection';
import Layout from '../layout/Layout';
import SoTApi from '../services/SoTApi';

export default function Election() {
  const user = useGetUser();
  const [country, setCountry] = useState(null);
  const [electionType, setElectionType] = useState(undefined);
  const [election, setElection] = useState(null);

  useEffect(() => {
    if (user) {
      SoTApi.getCountry(user.country).then(data => {
        if (data.country) {
          setCountry(data.country);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (country) {
      let date = new Date(Date.now());
      let electionIndex = -1;
      if (date.getUTCDate() === 5) {
        setElectionType(0);
        electionIndex = country.presidentElections.length - 1;
        setElection(country.presidentElections[electionIndex]);
      } else if (date.getUTCDate() === 15) {
        setElectionType(1);
        electionIndex = country.congressElections.length - 1;
        setElection(country.congressElections[electionIndex]);
      }
    }
  }, [country]);

  const getElectionByType = () => {
    switch (electionType) {
      case 0:
        return <CPElection country={country} election={election} />;
      case 1:
        return <CongressElection country={country} election={election} />;
      default:
        return null;
    }
  }

  return (
    <Layout>
      <div id='election'>
        <h1>
          <i className={`flag-icon flag-icon-${country && country.flag_code}`} />
          &nbsp;
          { country && country.name }
          &nbsp;
          { electionType === 0 ? 'Country President' : 'Congress' }
          &nbsp;
          Election
        </h1>
        { getElectionByType() }
      </div>
    </Layout>
  );
}
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import PartyBody from './PartyBody';
import PartyHead from './PartyHead';
import SoTApi from '../../services/SoTApi';

import { Grid } from 'semantic-ui-react';

export default function PartyHome() {
  const { id } = useParams();
  const [party, setParty] = useState(null);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    if (reload) {
      SoTApi.getParty(id).then(data => {
        if (data.party) {
          setParty(data.party);
          setReload(false);
        }
      });
    }
  }, [reload, id]);

  return (
    <>
      <Grid>
        <Grid.Column width={16}>
          <PartyHead party={party} setReload={setReload} />
        </Grid.Column>
        <Grid.Column width={16}>
          <PartyBody party={party} setReload={setReload} />
        </Grid.Column>
      </Grid>
    </>
  );
}
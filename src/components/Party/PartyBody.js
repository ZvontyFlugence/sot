import Members from './Members';
import PartyElections from './PartyElections';
import CongressElections from './CongressElections';
import CountryElections from './CountryElections';

import { Tab } from 'semantic-ui-react';

export default function PartyBody(props) {
  const { party, setReload } = props;

  const panes = [
    { menuItem: 'Members', render: () => <Members party={party} setReload={setReload} /> },
    { menuItem: 'Party Elections', render: () => <PartyElections party={party} setReload={setReload} /> },
    { menuItem: 'Congress Elections', render: () => <CongressElections party={party} setReload={setReload} /> },
    { menuItem: 'Country Elections', render: () => <CountryElections party={party} setReload={setReload} /> },
  ];

  

  return (
    <Tab
      menu={{ fluid: true, vertical: true }}
      menuPosition='left'
      panes={panes}
    />
  );
}
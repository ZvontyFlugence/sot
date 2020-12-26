import Members from './Members';
import PartyElections from './PartyElections';

import { Tab } from 'semantic-ui-react';

export default function PartyBody(props) {
  const { party, setReload } = props;

  const panes = [
    { menuItem: 'Members', render: () => <Members party={party} setReload={setReload} /> },
    { menuItem: 'Party President Elections', render: () => <PartyElections party={party} setReload={setReload} /> },
    { menuItem: 'Congress Elections', render: () => <></> },
    { menuItem: 'Country President Elections', render: () => <></> },
  ];

  return (
    <Tab
      menu={{ fluid: true, vertical: true }}
      menuPosition='left'
      panes={panes}
    />
  );
}
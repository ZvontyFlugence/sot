import { useState } from 'react';

import { useGetUser } from '../../context/UserContext';
import constants from '../../util/constants';

import { Divider, Tab, Select } from 'semantic-ui-react';

export default function Laws(props) {
  const { country } = props;
  const user = useGetUser();
  const [selectedLaw, setSelectedLaw] = useState(null);

  const isInGovernment = () => {
    const { government } = country;

    switch (user._id) {
      case government.president:
      case government.cabinet.mofa:
      case government.cabinet.mod:
      case government.cabinet.mot:
        return true;
      default:
        return government.congress.findIndex(rep => rep.id === user._id) !== -1;
    }
  }

  const getValidLawProposals = () => {
    const { government } = country;

    switch (user._id) {
      case government.president:
        return constants.CP_LAWS;
      case government.cabinet.mofa:
        return constants.MOFA_LAWS;
      case government.cabinet.mod:
        return constants.MOD_LAWS;
      case government.cabinet.mot:
        return constants.MOT_LAWS;
      default:
        if (government.congress.findIndex(rep => rep.id === user._id) !== -1) {
          return constants.CONGRESS_LAWS;
        } else {
          return [];
        }
    }
  }

  return (
    <Tab.Pane>
      <h3>Legislature</h3>
      {
        isInGovernment() && (
          <div>
            <label>Propose Law:</label><br />
            <Select options={getValidLawProposals()} value={selectedLaw} onChange={(_, {value}) => setSelectedLaw(value)} />
          </div>
        )
      }      
      <Divider horizontal>Proposed Laws</Divider>
    </Tab.Pane>
  );
}
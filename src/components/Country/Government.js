import { useEffect, useState } from 'react';

import { pSBC } from '../../util/config';
import SoTApi from '../../services/SoTApi';

import { Checkbox, Image, List, Tab } from 'semantic-ui-react';
import { OrganizationChart } from 'primereact/organizationchart';
import { Chart } from 'primereact/chart';

export default function Government(props) {
  const { country } = props;
  const [cp, setCP] = useState(null);
  const [vp, setVP] = useState(null);
  const [cabinet, setCabinet] = useState({ mofa: null, mod: null, mot: null });
  const [congress, setCongress] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [pieData, setPieData] = useState(null);
  const [reload, setReload] = useState(true);
  const [includeEmpty, setIncludeEmpty] = useState(false);

  useEffect(() => {
    if (reload) {
      const { government } = country;
      if (government.president) {
        SoTApi.getProfile(government.president).then(data => {
          if (data.profile) {
            SoTApi.getParty(data.profile.party).then(partyData => {
              if (partyData.party) {
                data.profile.party = partyData.party;
                setCP(data.profile);
              }
            });
          }
        });
      }

      if (government.vp) {
        SoTApi.getProfile(government.vp).then(data => {
          if (data.profile) {
            SoTApi.getParty(data.profile.party).then(partyData => {
              if (partyData.party) {
                data.profile.party = partyData.party;
                setVP(data.profile);
              }
            });
          }
        });
      }

      for (let position in government.cabinet) {
        if (government.cabinet[position] !== null) {
          SoTApi.getProfile(government.cabinet[position]).then(data => {
            if (data.profile) {
              SoTApi.getParty(data.profile.party).then(partyData => {
                if (partyData.party) {
                  data.profile.party = partyData.party;
                  setCabinet(currCabinet => ({ ...currCabinet, [position]: data.profile }));
                }
              });
            }
          });
        }
      }

      for (let congressMember of government.congress) {
        SoTApi.getProfile(congressMember.id).then(data => {
          if (data.profile) {
            SoTApi.getParty(data.profile.party).then(partyData => {
              if (partyData.party) {
                data.profile.party = partyData.party;
                setCongress(currCongress => [...currCongress, data.profile]);
              }
            });
          }
        });
      }
      setReload(false);
    }
  }, [reload, country]);

  useEffect(() => {
    let data = [];
    if (cp !== null) {
      let root = (
        {
          label: 'President',
          expanded: true,
          data: { name: cp.displayName, avatar: cp.image, partyLogo: cp.party.image },
          children: [],
        }
      );

      if (vp !== null) {
        root.children.push(
          {
            label: 'Vice President',
            data: { name: vp.displayName, avatar: vp.image, partyLogo: vp.party.logo },
            children: [],
          }
        );
      }

      for (let position in cabinet) {
        if (cabinet[position] !== null) {
          let title = '';
          switch (position) {
            case 'mofa':
              title = 'Foreign Affairs';
              break;
            case 'mod':
              title = 'Defense';
              break;
            case 'mot':
              title = 'Treasury';
              break;
            default:
              break;
          }
          root.children.push(
            {
              label: title,
              data: { name: cabinet[position].displayName, avatar: cabinet[position].image, partyLogo: cabinet[position].party.image },
              children: [],
            }
          );
        }
      }

      data.push(root);
    }

    setTreeData([...data]);
  }, [cp, vp, cabinet]);

  useEffect(() => {
    if (country) {
      let labels = [];
      let dataset = { data: [], backgroundColor: [], hoverBackgroundColor: [] };
      for (let politician of congress) {
        let index = labels.findIndex(label => label === politician.party.name);
        if (index === -1) {
          labels.push(politician.party.name);
          dataset.data.push(1);
          dataset.backgroundColor.push(politician.party.color);
          dataset.hoverBackgroundColor.push(pSBC(0.3, politician.party.color));
        } else {
          dataset.data[index]++;
        }
      }

      if (includeEmpty && congress.length < country.government.congressSeats) {
        labels.push('Unfilled Seats');
        dataset.data.push(country.government.congressSeats - congress.length);
        dataset.backgroundColor.push('#cfcfcf');
        dataset.hoverBackgroundColor.push(pSBC(0.3, '#cfcfcf'));
      }

      setPieData({ labels, datasets: [dataset] });
    }
  }, [congress, includeEmpty, country]);

  const nodeTemplate = node => {
    return (
      <div>
        <div className='node-header'>{ node.label }</div>
        <div className='node-content'>
          <div style={{ position: 'relative' }}>
            <Image circular size='tiny' src={node.data.avatar} alt='' style={{ textAlign: 'center' }} />
            <div style={{ position: 'absolute', bottom: 0, right: '-10%' }}>
              <Image avatar src={node.data.partyLogo} alt='' />
            </div>
          </div>
          <div>
            { node.data.name }
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tab.Pane>
      <h3>Executive Branch</h3>
      {
        treeData.length > 0 && (
          <OrganizationChart value={treeData} nodeTemplate={nodeTemplate} />
        )
      }
      <hr />
      <h3>Congress</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <p>Total Members: { congress.length }, Maxiumum Seats: { country.government.congressSeats }</p>
        <Checkbox toggle label='Include Empty Seats?' onChange={() => setIncludeEmpty(prev => !prev)} checked={includeEmpty} />
      </div>
      {
        pieData && (
          <Chart type='pie' data={pieData} options={{ elements: { arc: { borderWidth: 0 } } }}/>
        )
      }
      <List relaxed>
        {
          congress.map(politician => (
            <List.Item key={politician._id}>
              <List.Content floated='right'>
                <Image avatar src={politician.party.image} alt='' />
              </List.Content>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: 'fit-content' }}>
                <Image avatar src={politician.image} alt='' />
                <List.Content>{ politician.displayName }</List.Content>
              </div>
            </List.Item>
          ))
        }
      </List>
    </Tab.Pane>
  );
}
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Label, List, Tab } from 'semantic-ui-react';

export default function Regions(props) {
  const { id } = useParams();
  const { country } = props;
  const [regions, setRegions] = useState([]);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    if (reload) {
      SoTApi.getCountryRegions(id).then(data => {
        if (data.regions) {
          setRegions(data.regions);
          setReload(false);
        }
      });
    }
  }, [id, reload]);

  const getResourceColor = resourceID => {
    let resource = constants.RESOURCES[resourceID];
    
    switch (resource.quality) {
      case 'Low':
        return 'red';
      case 'Medium':
        return 'yellow';
      case 'High':
        return 'green';
      default:
        return;
    }
  }

  const getResourceName = resourceID => {
    let resource = constants.RESOURCES[resourceID];
    return resource.label;
  }

  return (
    <Tab.Pane>
      <h3>Regions ({ regions.length }):</h3>
      {
        regions.length > 0 && (
          <List selection relaxed divided>
            {
              regions.map((region, idx) => (
                <List.Item key={idx}>
                  <List.Content floated='right'>
                    {
                      region._id === country.capital && (
                        <Label color='blue' content='Capital' />
                      )
                    }
                    {
                      region.resource > 0 ? (
                        <Label
                          color={getResourceColor(region.resource)}
                          content={getResourceName(region.resource)}
                        />
                      ) : (
                        <Label content='None' />
                      )
                    }
                  </List.Content>
                  <List.Content>
                    <List.Header>{ region.name }</List.Header>
                  </List.Content>
                </List.Item>
              ))
            }
          </List>
        )
      }
    </Tab.Pane>
  );
}
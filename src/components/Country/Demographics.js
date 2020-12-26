import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import SoTApi from '../../services/SoTApi';

import { Button, List, Tab } from 'semantic-ui-react';

export default function Demographics() {
  const { id } = useParams();
  const [demographics, setDemographics] = useState(null);

  useEffect(() => {
    SoTApi.getDemographics(id).then(data => {
      if (!data.error) {
        setDemographics({ ...data });
      }
    });
  }, [id]);

  return (
    <Tab.Pane>
      {
        demographics && (
          <List selection relaxed divided>
            <List.Item>
              <List.Content floated='right'>
                { demographics.population }
              </List.Content>
              <List.Content>
                <List.Header>Population</List.Header>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Content floated='right'>
                { demographics.newCitizens }
              </List.Content>
              <List.Content>
                <List.Header>New Citizens Today</List.Header>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Content floated='right'>
                { demographics.averageLevel }
              </List.Content>
              <List.Content>
                <List.Header>Average Citizen Level</List.Header>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Content floated='right'>
                <Button compact color='blue' size='tiny' content='View Requests' />
              </List.Content>
              <List.Content>
                <List.Header>Citizenship Requests</List.Header>
              </List.Content>
            </List.Item>
          </List>
        )
      }
    </Tab.Pane>
  );
}
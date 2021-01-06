import { useState, useEffect } from 'react';
import SoTApi from '../../services/SoTApi';

import { Card, List, Image } from 'semantic-ui-react';

export default function TopCitizens() {
  const [citizens, setCitizens] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      SoTApi.getCitizenStats({ stat: 'xp', limit: 5 })
        .then(data => {
          if (!data.err && data.citizens) {
            setCitizens(data.citizens.map(c => (
              { displayName: c.displayName, image: c.image, country_flag: c.country.flag }
            )));
          }
        });
    }
  }, [loaded, setLoaded, setCitizens]);

  return (
    <Card fluid>
      <Card.Content>
        <Card.Header>Top Citizens</Card.Header>
      </Card.Content>
      <Card.Content>
        <List>
          {
            citizens.map((citizen, idx) => (
              <List.Item key={idx}>
                <List.Content floated='right'>
                  <i
                    className={`flag-icon flag-icon-${citizen.country_flag}`}
                    style={{ fontSize: '2.0rem' }}
                  />
                </List.Content>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <Image avatar src={citizen.image} alt='' />
                <List.Content>{ citizen.displayName }</List.Content>
                </div>
              </List.Item>
            ))
          }
        </List>
      </Card.Content>
    </Card>
  );
}
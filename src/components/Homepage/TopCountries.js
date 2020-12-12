import { useState, useEffect } from 'react';
import SoTApi from '../../services/SoTApi';

import {
  Card, List
} from 'semantic-ui-react';

export default function TopCountries() {
  const [countries, setCountries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      SoTApi.getCountryStats({ stat: 'population', limit: 5 })
        .then(data => {
          if (!data.err) {
            setCountries(data.countries.map(c => (
              { name: c.name, flag: c.flag_code}
            )));
            setLoaded(true);
          }
        })
    }
  }, [loaded, setLoaded, setCountries]);

  return (
    <Card fluid>
      <Card.Content>
        <Card.Header>Top Countries</Card.Header>
      </Card.Content>
      <Card.Content>
        <List>
          {countries.map((country, idx) => (
            <List.Item key={idx}>
              {country.name}
              <span
                className={`flag-icon flag-icon-${country.flag}`}
                style={{ float: 'right', fontSize: '2rem', verticalAlign: 'middle' }}
              ></span>
            </List.Item>
          ))}
        </List>
      </Card.Content>
    </Card>
  );
}
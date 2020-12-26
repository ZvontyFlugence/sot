import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import SoTApi from '../../services/SoTApi';

import { Dropdown, Grid } from 'semantic-ui-react';

export default function CountryHead(props) {
  const { country } = props;
  const history = useHistory();
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    if (countries.length === 0) {
      SoTApi.getCountries().then(data => {
        if (data.countries) {
          setCountries(data.countries.map((c) => {
            return {
              ...c,
              value: c._id,
              text: (
                <Dropdown.Item key={c._id} value={c._id}>
                  <i className={`flag-icon flag-icon-${c.flag_code}`} />
                  &nbsp;
                  { c.name }
                </Dropdown.Item>
              ),
            };
          }));
        }
      });
    }
  }, [countries]);

  const getDropdownText = () => {
    let selected = countries.find(c => c._id === country._id);
    return (selected && selected.text) || null;
  }

  const getSelected = () => {
    let selected = countries.find(c => c._id === country._id);
    return (selected && selected.text) || null;
  }

  const handleSelect = (_, { value }) => {
    if (value !== country._id) {
      history.push(`/country/${value}`);
    }
  }

  return country && countries && (
    <Grid style={{ padding: '0 12px' }}>
      <Grid.Row style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>
          { country.name }
          &nbsp;
          <i className={`flag-icon flag-icon-${country.flag_code}`} />
        </h1>
        <Dropdown
          text={getDropdownText()}
          options={countries}
          value={getSelected()}
          onChange={handleSelect}
          selection
        />
      </Grid.Row>
    </Grid>
  );
}
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Button, Message, Segment, Table } from 'semantic-ui-react';

export default function CountryRankings() {
  const history = useHistory();
  const [stat, setStat] = useState('population');
  const [countries, setCountries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      SoTApi.getCountryStats({ stat }).then(data => {
        if (data.countries) {
          setCountries(data.countries);
          setLoaded(true);
        }
      });
    }
  });

  const handleChangeStat = value => {
    setStat(value);
    setLoaded(false);
  }

  const getStatName = () => {
    switch (stat) {
      case 'population':
        return 'Citizens';
      default:
        return undefined;
    }
  }

  return countries && countries.length > 0 ? (
    <>
      <Segment>
        <Button.Group>
          {constants.COUNTRY_RANKINGS.map(c_stat => (
            <Button color={stat === c_stat.value ? 'blue' : ''} onClick={() => handleChangeStat(c_stat.value)}>
              { c_stat.label }
            </Button>
          ))}
        </Button.Group>
      </Segment>
      <Segment>
        <Table basic='very'>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Rank</Table.HeaderCell>
              <Table.HeaderCell>Country</Table.HeaderCell>
              <Table.HeaderCell>{ getStatName() }</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              countries.map((country, idx) => {
                let rank = idx + 1;

                return (
                  <Table.Row key={idx}>
                    <Table.Cell collapsing>{ rank }</Table.Cell>
                    <Table.Cell style={{ cursor: 'pointer' }} onClick={() => history.push(`/country/${country._id}`)}>
                      <i
                        className={`flag-icon flag-icon-${country.flag_code}`}
                        style={{ float: 'none', marginRight: '10px', fontSize: '32px', verticalAlign: 'middle' }}
                      />
                      <span style={{ fontSize: '1.25rem' }}>{ country.name }</span>
                    </Table.Cell>
                    <Table.Cell collapsing>
                      <p style={{ textAlign: 'right' }}>{ country[stat] } { getStatName() }</p>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            }
          </Table.Body>
        </Table>
      </Segment>
    </>
  ) : (
    <Message info visible header='No Countries Found' />
  );
}
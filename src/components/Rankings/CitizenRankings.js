import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Button, Dropdown, Image, Message, Segment, Table } from 'semantic-ui-react';

export default function CitizenRankings() {
  const history = useHistory();
  const [stat, setStat] = useState('xp');
  const [citizens, setCitizens] = useState([]);
  const [country, setCountry] = useState('global');
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    SoTApi.getCountries().then(data => {
      if (data.countries) {
        let dropdown_countries = data.countries.map(c => {
          return {
            ...c,
            value: c._id,
            text: (
              <Dropdown.Item key={c._id} value={c._id}>
                <i className={`flag-icon flag-icon-${c.flag_code} flag-inline-left`} />
                &nbsp;
                { c.name }
              </Dropdown.Item>
            ),
          };
        });
        let global_item = { key: 'global', text: 'Global', value: 'global' };
        setCountries([global_item, ...dropdown_countries]);
      }
    });
  }, []);

  useEffect(() => {
    if (citizens.length === 0) {
      let payload = { stat };

      if (country !== 'global') {
        payload.country = country;
      }

      SoTApi.getCitizenStats(payload).then(data => {
        if (data.citizens) {
          setCitizens(data.citizens);
        }
      });
    }
  });

  const handleChangeStat = value => {
    setStat(value);
    setCitizens([]);
  }

  const handleChangeCountry = value => {
    setCountry(value);
    setCitizens([]);
  }

  const getStatName = () => {
    switch (stat) {
      case 'strength':
        return 'Strength';
      case 'xp':
        return 'XP';
      default:
        return undefined;
    }
  }

  return citizens.length > 0 ? (
    <>
      <Segment style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Dropdown
            options={countries}
            value={country}
            onChange={(_, {value}) => handleChangeCountry(value)}
            selection
          />
        </div>
        <div>
          <Button.Group>
            {constants.CITIZEN_RANKINGS.map(cit_stat => (
              <Button color={(stat === cit_stat.value) ? 'blue' : ''} onClick={() => handleChangeStat(cit_stat.value)}>
                { cit_stat.label }
              </Button>
            ))}
          </Button.Group>
        </div>
      </Segment>
      <Segment style={{ paddingBottom: 0 }}>
        <Table basic='very'>  
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Rank</Table.HeaderCell>
              <Table.HeaderCell>Citizen</Table.HeaderCell>
              <Table.HeaderCell>Country</Table.HeaderCell>
              <Table.HeaderCell>{ getStatName() }</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              citizens && citizens.map((citizen, idx) => {
                let rank = idx + 1;

                return (
                  <Table.Row key={idx}>
                    <Table.Cell collapsing>{ rank }</Table.Cell>
                    <Table.Cell style={{ display: 'flex', flexDirection: 'columns', alignItems: 'center', cursor: 'pointer' }} onClick={() => history.push(`/profile/${citizen._id}`)}>
                      <Image src={citizen.image} alt='' size='mini' circular />
                      &nbsp;
                      <span style={{ fontSize: '1.25rem' }}>{ citizen.displayName }</span>
                    </Table.Cell>
                    <Table.Cell>
                      <i
                        className={`flag-icon flag-icon-${citizen.country.flag}`}
                        style={{ float: 'none', marginRight: '10px', fontSize: '32px', verticalAlign: 'middle' }}
                      />
                      <span style={{ fontSize: '1.25rem' }}>{ citizen.country.name }</span>
                    </Table.Cell>
                    <Table.Cell collapsing>
                      <p style={{ textAlign: 'right' }}>
                        { citizen[stat] }
                        &nbsp;
                        { getStatName() === 'Strength' ? <i className='sot-str' /> : getStatName()}
                      </p>
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
    <Message info visible header='No Citizens Found' />
  );
}
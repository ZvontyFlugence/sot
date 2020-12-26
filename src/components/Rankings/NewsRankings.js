import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import SoTApi from '../../services/SoTApi';

import { Dropdown, Image, Message, Segment, Table } from 'semantic-ui-react';

export default function NewsRankings() {
  const history = useHistory();
  const [newspapers, setNewspapers] = useState([]);
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
    if (country) {
      let payload = {};
      if (country !== 'global') {
        payload.country = country;
      }

      SoTApi.getNewspaperStats(payload).then(data => {
        if (data.newspapers) {
          setNewspapers(data.newspapers);
        }
      });   
    }
  }, [country]);

  const handleChangeCountry = value => {
    setCountry(value);
    setNewspapers([]);
  }

  return (
    <>
      <Segment style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Dropdown
            options={countries}
            value={country}
            onChange={(_, { value }) => handleChangeCountry(value)}
            selection
          />
        </div>
      </Segment>
      {
        newspapers.length > 0 ? (
          <Segment style={{ paddingBottom: 0 }}>
            <Table basic='very'>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Rank</Table.HeaderCell>
                  <Table.HeaderCell>Party</Table.HeaderCell>
                  <Table.HeaderCell>Country</Table.HeaderCell>
                  <Table.HeaderCell>Subscribers</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {
                  newspapers && newspapers.map((news, idx) => (
                    <Table.Row key={idx+1}>
                      <Table.Cell collapsing>{ idx + 1 }</Table.Cell>
                      <Table.Cell style={{ display: 'flex', flexDirection: 'columns', alignItems: 'center', cursor: 'pointer' }} onClick={() => history.push(`/newspaper/${news._id}`)}>
                        <Image src={news.image} alt='' size='mini' circular />
                        &nbsp;
                        <span style={{ fontSize: '1.25rem' }}>{ news.name }</span>
                      </Table.Cell>
                      <Table.Cell>
                        <i
                          className={`flag-icon flag-icon-${news.country.flag_code}`}
                          style={{ float: 'none', marginRight: '10px', fontSize: '32px', verticalAlign: 'middle' }}
                        />
                        <span style={{ fontSize: '1.25rem' }}>{ news.country.name }</span>
                      </Table.Cell>
                      <Table.Cell collapsing>
                        <p style={{ textAlign: 'right' }}>
                          { news.subscribers.length } Subscribers
                        </p>
                      </Table.Cell>
                    </Table.Row>
                  ))
                }
              </Table.Body>
            </Table>
          </Segment>
        ) : (
          <Message info visible header='No Newspapers Found!' />
        )
      }
    </>
  )
}
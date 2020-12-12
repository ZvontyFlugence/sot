import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useSetNotification } from '../../context/NotificationContext';
import { useGetUser, useLoadUser } from '../../context/UserContext';
import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Button, Dropdown, Grid, Image, Segment, Table } from 'semantic-ui-react';

export default function JobsMarket() {
  const history = useHistory();
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [countryId, setCountryId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [countries, setCountries] = useState([]);
  const [jobOffers, setJobOffers] = useState([]);

  useEffect(() => {
    if (countries.length === 0) {
      SoTApi.getCountries().then(data => {
        if (data.countries) {
          setCountries(data.countries.map(c => {
            return {
              ...c,
              value: c._id,
              text: (
                <Dropdown.Item key={c._id} value={c._id}>
                  <i className={`flag-icon flag-icon-${c.flag_code} flag-inline-left`} />
                  &nbsp;
                  { c.name }
                </Dropdown.Item>
              )
            };
          }));
        }
      });
    }

    if (user) {
      setCountryId(user.country);
    }    
  }, [user, countries.length]);

  useEffect(() => {
    setSelected(countries.find(c => c._id === countryId));
  }, [countryId, countries]);

  useEffect(() => {
    SoTApi.getJobOffers(countryId).then(data => {
      if (data.jobOffers) {
        setJobOffers(data.jobOffers);
      }
    });
  }, [countryId]);

  const acceptOffer = offer => {
    let payload = {
      action: 'accept_job_offer',
      compId: offer.comp._id,
      offer,
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({
          type: 'success',
          header: 'Job Offer Accepted',
          content: `You are now an employee of ${offer.comp.name}`,
        });

        loadUser();
      }
    });
  }

  return (
    <div id='jobs-market'>
      <h1>Jobs Market</h1>
      <Grid>
        <Grid.Column width={16}>
          <Segment>
            <div>
              {/* TODO: Filter Company Type Dropdown */}
            </div>
            <div>
              {/* TODO: Sort Wage Buttons */}
            </div>
            <div>
              {
                countries.length > 0 && (
                  <Dropdown
                    text={(selected && selected.text) || null}
                    options={countries}
                    value={countryId}
                    onChange={(_, {value}) => setCountryId(value)}
                    selection
                  />
                )
              }
            </div>
          </Segment>
        </Grid.Column>
        <Grid.Column width={16}>
          <Segment>
            <Table basic='very'>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Company</Table.HeaderCell>
                  <Table.HeaderCell>Company Type</Table.HeaderCell>
                  <Table.HeaderCell>Position Title</Table.HeaderCell>
                  <Table.HeaderCell>Wage</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {
                  jobOffers && jobOffers.map((offer, idx) => {
                    let type = constants.COMPANY_TYPES[offer.comp.type - 1]
                    return (
                      <Table.Row key={idx}>
                        <Table.Cell style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => history.push(`/company/${offer.comp._id}`)}>
                          <Image src={offer.comp.image} alt='' size='mini' circular />
                          &nbsp;
                          { offer.comp.name }
                        </Table.Cell>
                        <Table.Cell>
                          <i className={type.css} />
                          &nbsp;
                          { type.text }                          
                        </Table.Cell>
                        <Table.Cell>
                          { offer.title }
                        </Table.Cell>
                        <Table.Cell>
                          { offer.wage.toFixed(2) } { selected.currency }
                          &nbsp;
                          <i className={`flag-icon flag-icon-${selected.flag_code} flag-inline-right`} />
                        </Table.Cell>
                        <Table.Cell collapsing>
                          <Button
                            compact
                            size='small'
                            color={user && user.job !== 0 ? 'red' : 'blue'}
                            content={user && user.job !== 0 ? 'Already Employed' : 'Apply'}
                            disabled={user && user.job !== 0}
                            onClick={() => acceptOffer(offer)}
                          />
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                }
              </Table.Body>
            </Table>
          </Segment>
        </Grid.Column>
      </Grid>
    </div>
  );
}
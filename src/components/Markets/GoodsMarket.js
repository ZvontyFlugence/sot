import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useSetNotification } from '../../context/NotificationContext';
import { useGetUser, useLoadUser } from '../../context/UserContext';
import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Button, Dropdown, Grid, Image, Input, Segment, Table } from 'semantic-ui-react';

export default function GoodsMarket() {
  const history = useHistory();
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [countryId, setCountryId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [countries, setCountries] = useState([]);
  const [productOffers, setProductOffers] = useState([]);
  const [buyAmount, setBuyAmount] = useState(1);

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
              ),
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
    SoTApi.getProductOffers(countryId).then(data => {
      if (data.productOffers) {
        setProductOffers(data.productOffers);
      }
    });
  }, [countryId]);

  const isSufficientFunds = price => {
    let cc = user && user.wallet.find(cc => cc.currency === selected.currency);
    return (buyAmount * price).toFixed(2) > (cc && cc.amount);
  }

  const buyItem = offer => {
    let payload = {
      action: 'purchase_offer',
      purchase: {
        compId: offer.comp._id,
        offer,
        purchaseAmount: buyAmount,
      },
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({
          type: 'success',
          header: 'Purchase Successful'
        });

        loadUser();
      }
    });
  }

  return (
    <div id='goods-market'>
      <h1>Goods Market</h1>
      <Grid>
        <Grid.Column width={16}>
          <Segment>
            <div>
              {/* TODO: Filter Item Dropdown */}
            </div>
            <div>
              {/* TODO: Filter Quality Dropdown */}
            </div>
            <div>
              {/* TODO: Sort Cost Buttons */}
            </div>
            <div>
              {
                countries.length > 0 && (
                  <Dropdown
                    text={selected && selected.text}
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
                  <Table.HeaderCell>Quantity</Table.HeaderCell>
                  <Table.HeaderCell>Price/Unit</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {
                  productOffers && productOffers.map((offer, idx) => {
                    let type = constants.COMPANY_TYPES[offer.comp.type - 1];

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
                          { offer.quantity }
                        </Table.Cell>
                        <Table.Cell>
                          { offer.price.toFixed(2) } { selected.currency }
                          &nbsp;
                          <i className={`flag-icon flag-icon-${selected.flag_code} flag-inline-left`} />
                        </Table.Cell>
                        <Table.Cell collapsing>
                          <Input
                            type='number'
                            size='mini'
                            min={1}
                            max={offer.quantity}
                            step={1}
                            value={buyAmount}
                            onChange={e => setBuyAmount(e.target.valueAsNumber)}
                          />
                          &nbsp;
                          <Button
                            compact
                            size='small'
                            color={isSufficientFunds(offer.price) ? 'red' : 'blue'}
                            content={isSufficientFunds(offer.price) ? 'Insufficient Funds' : 'Purchase'}
                            disabled={isSufficientFunds(offer.price)}
                            onClick={() => buyItem(offer)}
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
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useSetNotification } from '../../context/NotificationContext';
import { useGetUser, useLoadUser } from '../../context/UserContext';
import SoTApi from '../../services/SoTApi';

import {
  Button,
  Dropdown,
  Form,
  Grid,
  Image,
  Input,
  Modal,
  Segment,
  Table,
} from 'semantic-ui-react';

export default function Exchange() {
  const user = useGetUser();
  const loadUser = useLoadUser();
  const history = useHistory();
  const setNotification = useSetNotification();
  const [active, setActive] = useState(0);
  const [country, setCountry] = useState(null);
  const [countries, setCountries] = useState([]);
  const [showCreateOfferModal, setShowCreateOfferModal] = useState(false);
  const [showRemoveOfferModal, setShowRemoveOfferModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState(1);

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
      setCountry(user.country);
    }
  }, [user, countries.length]);

  useEffect(() => {
    setSelected(countries.find(c => c._id === country));
  }, [country, countries]);

  const getSelectText = () => {
    return (selected && selected.text) || null;
  }

  const getCCText= () => {
    return (selected && selected.currency) || 'CC';
  }

  const validateFunds = offer => {
    if (selected && active === 0) {
      let userCC = user.wallet.find(cc => cc.currency === selected.currency);
      return userCC && userCC.amount >= (offer.exchangeRate * purchaseAmount);
    }

    return user.gold >= (offer.exchangeRate * purchaseAmount);
  }

  const exchange = (offer) => {
    let payload = {
      action: 'exchange_money',
      data: {
        offerId: offer.id,
        countryId: selected._id,
        purchaseAmount: Number(purchaseAmount),
      }
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Currency Exchanged!' });
        loadUser();
      } else {
        setNotification({ type: 'error', header: data.error });
      }
    })
    .catch(err => {
      let data = err.response.data;
      setNotification({ type: 'error', header: data.error });
    });
  }

  return (
    <div id='exchange-market'>
      <h1>Monetary Exchange</h1>
      <Grid>
        <Grid.Column width={16}>
          <Segment style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {countries.length > 0 && (
                <Dropdown
                  text={getSelectText()}
                  options={countries}
                  value={country}
                  onChange={(e, {value}) => setCountry(value)}
                  selection
                />
              )}
            </div>
            <div>
              <Button.Group>
                <Button positive={active === 0} onClick={() => setActive(0)}>
                  Gold to {getCCText()}
                </Button>
                <Button.Or />
                <Button positive={active === 1} onClick={() => setActive(1)}>
                  {getCCText()} to Gold
                </Button>
              </Button.Group>
            </div>
            <div>
              <Button
                compact
                color='green'
                icon='plus'
                content='Create Offer'
                onClick={() => setShowCreateOfferModal(true)}
              />
              <Button
                compact
                color='red'
                icon='times'
                content='Remove Offer'
                onClick={() => setShowRemoveOfferModal(true)}
              />
            </div>
          </Segment>
        </Grid.Column>
        <Grid.Column width={16}>
          <Segment>
            <h3><strong>Offers</strong></h3>
            <Table basic='very'>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Seller</Table.HeaderCell>
                  <Table.HeaderCell>Amount</Table.HeaderCell>
                  <Table.HeaderCell>Exchange Rate</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {selected && selected.exchangeOffers.filter(offer => offer.mode === active).map((offer, idx) => {
                  return (
                    <Table.Row key={idx}>
                      <Table.Cell style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => history.push(`/profile/${offer.seller.id}`)}>
                        <Image src={offer.seller.image} alt='' size='mini' circular />
                        &nbsp;
                        { offer.seller.displayName }
                      </Table.Cell>
                      <Table.Cell>
                        { offer.sellAmount.toFixed(2) }
                        &nbsp;
                        {
                          active === 0 ? (
                            <i className='sot-coin' />
                          ) : (
                            <span>
                              { selected.currency }
                              &nbsp;
                              <i className={`flag-icon flag-icon-${selected.flag_code} flag-inline-right`} />
                            </span>
                          )
                        }
                      </Table.Cell>
                      <Table.Cell>
                        { offer.exchangeRate.toFixed(2) }
                        &nbsp;
                        {
                          active === 0 ? (
                            <span>
                              { selected.currency }
                              &nbsp;
                              <i className={`flag-icon flag-icon-${selected.flag_code} flag-inline-right`} />
                              &nbsp;
                              per 1.00 <i className='sot-coin' />
                            </span>
                          ) : (
                            <span>
                              <i className='sot-coin' />
                              &nbsp;                            
                              per 1.00 { selected.currency }
                              &nbsp;
                              <i className={`flag-icon flag-icon-${selected.flag_code} flag-inline-right`} />
                            </span>
                          )
                        }
                      </Table.Cell>
                      <Table.Cell collapsing>
                        <Input
                          style={{ marginRight: 10 }}
                          size='mini'
                          type='number'
                          min={0.01}
                          max={offer.sellAmount}
                          step={0.01}
                          value={purchaseAmount}
                          onChange={(_, {value}) => setPurchaseAmount(Number.parseFloat(value))}
                        />
                        <Button
                          compact
                          color={validateFunds(offer) ? 'blue' : 'red'}
                          content={validateFunds(offer) ? `Purchase for ${(offer.exchangeRate * purchaseAmount).toFixed(2)} ${selected.currency}` : 'Insufficient Funds'}
                          disabled={!validateFunds(offer)}
                          onClick={() => exchange(offer)}
                        />
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </Segment>
        </Grid.Column>
      </Grid>
      <CreateExchangeOfferModal
        show={showCreateOfferModal}
        active={active}
        selected={selected}
        onClose={() => setShowCreateOfferModal(false)}
      />
      <RemoveExchangeOfferModal
        show={showRemoveOfferModal}
        active={active}
        selected={selected}
        setNotification={setNotification}
        user={user}
        loadUser={loadUser}
        onClose={() => setShowRemoveOfferModal(false)}
      />
    </div>
  );
}

function CreateExchangeOfferModal(props) {
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [sellAmount, setSellAmount] = useState(0.01);
  const [exchangeRate, setExchangeRate] = useState(0.01);

  const getCCText = () => {
    return props.selected ? props.selected.currency : 'CC';
  }

  const getHeaderText = () => {
    if (props.active === 0) {
      return `Gold to ${getCCText()}`;
    }

    return `${getCCText()} to Gold`
  }

  const createOffer = () => {
    let payload = {
      action: 'create_exchange_offer',
      mode: props.active,
      country: props.selected && props.selected._id,
      exchangeOffer: {
        sellAmount,
        exchangeRate,
      },
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Exchange Offer Created' });
        loadUser();
      }
    })
    .catch(error => {
      let data = error.response.data;
      setNotification({ type: 'error', header: data.error });
    });
  }

  const sellText = props.active === 0 ? (
    <span>
      {sellAmount.toFixed(2)}
      &nbsp;
      <i className='sot-coin' />
    </span>
  ) : (
    <span>
      {sellAmount.toFixed(2)}
      &nbsp;
      {props.selected && (
        <i className={`flag-icon flag-icon-${props.selected.flag_code} flag-inline-right`} />
      )}      
    </span>
  );

  const rateText = props.active === 0 ? (
    <span>
      {exchangeRate.toFixed(2)}
      &nbsp;
      {props.selected && (
        <>
          <span>{props.selected.currency} </span>
          <i className={`flag-icon flag-icon-${props.selected.flag_code} flag-inline-right`} />
        </>
      )}
    </span>
  ) : (
    <span>
      {exchangeRate.toFixed(2)}
      &nbsp;
      <i className='sot-coin' />
    </span>
  );

  return (
    <Modal size='tiny' open={props.show} onClose={props.onClose}>
      <Modal.Header>Create Exchange Offer ({getHeaderText()})</Modal.Header>
      <Modal.Content>
        <p style={{ textAlign: 'center' }}>Sell {sellText} at a rate of {rateText} each?</p>
        <Form>
          <Form.Input
            type='number'
            label='Sell Amount'
            min={0.01}
            step={0.01}
            value={sellAmount}
            onChange={(_, {value}) => setSellAmount(Number(value))}
          />
          <Form.Input
            type='number'
            label='Exchange Rate'
            min={0.01}
            step={0.01}
            value={exchangeRate}
            onChange={(_, {value}) => setExchangeRate(Number(value))}
          />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color='blue' content='Create Offer' onClick={createOffer} />
        <Button content='Cancel' onClick={props.onClose} />
      </Modal.Actions>
    </Modal>
  );
}

function RemoveExchangeOfferModal(props) {
  const [offers, setOffers] = useState([]);
  const [offersToRemove, setOffersToRemove] = useState([]);

  useEffect(() => {
    if (props.selected && props.user) {
      setOffers(props.selected.exchangeOffers.filter(offer => {
        return offer.mode === props.active && offer.seller.id === props.user._id;
      }));
    }
  }, [props.selected, props.user, props.active]);

  const getCCText = () => {
    return props.selected ? props.selected.currency : 'CC';
  }

  const getHeaderText = () => {
    if (props.active === 0) {
      return `Gold to ${getCCText()}`;
    }

    return `${getCCText()} to Gold`
  }

  const handleClick = offerId => {
    let index = offersToRemove.findIndex(offer => offer === offerId);
    
    if (index !== -1) {
      setOffersToRemove(curr => {
        curr.splice(index, 1);
        return curr;
      });
    } else {
      setOffersToRemove(curr => [...curr, offerId]);
    }
  }

  const removeOffers = () => {
    let payload = {
      action: 'remove_exchange_offer',
      country: props.selected._id,
      offersToRemove,
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        props.setNotification({ type: 'success', header: 'Offers Removed' });
        props.loadUser();
      }
    });
  }

  return (
    <Modal size='tiny' open={props.show} onClose={props.onClose}>
      <Modal.Header>Remove Exchange Offer ({getHeaderText()})</Modal.Header>
      <Modal.Content>
        <Table basic='very' selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Amount</Table.HeaderCell>
              <Table.HeaderCell>Exchange Rate</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              offers.map((offer, idx) => (
                <RemoveOfferRow
                  offer={offer}
                  idx={idx}
                  active={props.active}
                  selected={props.selected}
                  offersToRemove={offersToRemove}
                  onClick={() => handleClick(offer.id)}
                />
              ))
            }
          </Table.Body>
        </Table>
      </Modal.Content>
      <Modal.Actions>
        <Button color='red' content='Remove Selected' onClick={removeOffers} />
        <Button content='Close' onClick={props.onClose} />
      </Modal.Actions>
    </Modal>
  );
}

function RemoveOfferRow(props) {
  const { idx, offer } = props;
  const [isError, setIsError] = useState(props.offersToRemove && props.offersToRemove.includes(offer.id));

  const handleClick = () => {
    props.onClick();
    setIsError(curr => !curr);
  }

  return props.offersToRemove && offer && (
    <Table.Row key={idx} error={isError} onClick={handleClick}>
      <Table.Cell>
        { offer.sellAmount.toFixed(2) }
        &nbsp;
        {
          props.active === 0 ? (
            <i className='sot-coin' />
          ) : (
            <span>
              { props.selected.currency }
              &nbsp;
              <i className={`flag-icon flag-icon-${props.selected.flag_code} flag-inline-right`} />
            </span>
          )
        }
      </Table.Cell>
      <Table.Cell>
        { offer.exchangeRate.toFixed(2) }
        &nbsp;
        {
          props.active === 0 ? (
            <span>
              { props.selected.currency }
              &nbsp;
              <i className={`flag-icon flag-icon-${props.selected.flag_code} flag-inline-right`} />
              &nbsp;
              per 1.00 <i className='sot-coin' />
            </span>
          ) : (
            <span>
              <i className='sot-coin' />
              &nbsp;                            
              per 1.00 { props.selected.currency }
              &nbsp;
              <i className={`flag-icon flag-icon-${props.selected.flag_code} flag-inline-right`} />
            </span>
          )
        }
      </Table.Cell>
    </Table.Row>
  );
}
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useGetUser, useLoadUser } from '../../context/UserContext';
import { useSetNotification } from '../../context/NotificationContext';
import constants from '../../util/constants';
import Inventory from '../Shared/Inventory';
import ComposeModal from '../Mail/ComposeModal';
import SoTApi from '../../services/SoTApi';

import { Button, Dropdown, Grid, Image, Input, Item, List, Modal, Segment } from 'semantic-ui-react';

export default function ProfileHead(props) {
  const { profile } = props;
  const user = useGetUser();
  const loadUser = useLoadUser();
  const history = useHistory();
  const setNotification = useSetNotification();
  const [showCompose, setShowCompose] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showGift, setShowGift] = useState(false);

  const sendFriendRequest = () => {
    SoTApi.doAction({ action: 'send_friend_request', friend_id: profile._id })
      .then(data => {
        if (data.success) {
          setNotification({
            type: 'success',
            header: 'Friend Request Sent',
            content: `Sent friend request to ${profile.displayName}`,
          });

          loadUser();
        } else {
          setNotification({
            type: 'error',
            header: 'Error',
            content: `Friend request failed to send`,
          });
        }
      });
  }

  const removeFriend = () => {
    SoTApi.doAction({ action: 'remove_friend', friend_id: profile._id })
      .then(data => {
        if (data.success) {
          setNotification({
            type: 'success',
            header: 'Friend Removed',
            content: `Successfully removed ${profile.displayName} from friends list`,
          });

          loadUser();
        } else {
          setNotification({
            type: 'error',
            header: 'Error',
            content: `Failed to remove ${profile.displayName} from friends list`,
          });
        }
      });
  }

  return (
    <Segment>
      <Grid>
        <Grid.Row>
          <Grid.Column width={4}>
            <Image
              fluid
              circular
              src={profile.image}
              alt={`${profile.displayName}'s Profile Picture`}
            />
          </Grid.Column>
          <Grid.Column width={10}>
            <Grid>
              <Grid.Row columns={1}>
                <Grid.Column width={16}>
                  <h1 style={{ fontWeight: 'lighter', margin: 0, textAlign: 'left !important' }}>
                    <span>
                      { profile.displayName }
                      <i
                        className={`flag-icon flag-icon-${profile.country_info.flag}`}
                        style={{ float: 'none', verticalAlign: 'middle', fontSize: '28px', marginLeft: '1vw' }}
                      />
                    </span>
                  </h1>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row columns={2}>
                <Grid.Column>
                  <span>Level: { profile.level }</span>
                  <p>Experience: { profile.xp }</p>
                  <p>
                    Location: {`${profile.location_info.name}, ${profile.location_info.owner.nick}`}
                    <i
                      className={`flag-icon flag-icon-${profile.location_info.owner.flag}`}
                      style={{ float: 'none', verticalAlign: 'middle', marginLeft: '1vw' }}
                    />
                  </p>
                </Grid.Column>
                <Grid.Column>
                  <Item>
                    <Item.Content>
                      <Item.Meta>Description:</Item.Meta>
                      <Item.Description style={{ textAlign: 'left' }}>
                        { profile.description }
                      </Item.Description>
                    </Item.Content>
                  </Item>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Grid.Column>
          <Grid.Column width={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {user._id !== profile._id ? (
              <Button.Group color='blue' vertical icon>
                {user.friends.indexOf(profile._id) === -1 ? (
                  <Button
                    icon='user plus'
                    onClick={sendFriendRequest}
                    disabled={user.pendingFriends.indexOf(profile._id) >= 0}
                  />
                ) : (
                  <Button icon='user times' onClick={removeFriend} />
                )}
                <Button icon='envelope' onClick={() => setShowCompose(true)} />
                <Button icon='dollar' onClick={() => setShowDonate(true)} />
                <Button icon='gift' onClick={() => setShowGift(true)} />
              </Button.Group>
            ) : (
              <Button color='blue' icon='setting' onClick={() => history.push('/settings')} />
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <ComposeModal
        show={showCompose}
        onClose={() => setShowCompose(false)}
        profile={profile}
        onSuccess={() => history.push('/mail')}
      />
      <DonateModal
        show={showDonate}
        onClose={() => setShowDonate(false)}
        profile={profile}
      />
      <GiftModal
        show={showGift}
        onClose={() => setShowGift(false)}
        profile={profile}
      />
    </Segment>
  );
}

function DonateModal(props) {
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [wallet, setWallet] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(0.01);
  const [donations, setDonations] = useState([]);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    if (user && reload) {
      let userWallet = [...user.wallet];
      userWallet.push({ currency: 'Gold', amount: user.gold });
      setWallet(userWallet.map((cc, idx) => {
        let ccImage = constants.CURRENCY_IMAGE[cc.currency];
        return {
          ...cc,
          value: cc.currency,
          text: (
            <Dropdown.Item key={idx} value={cc.currency}>
              { cc.currency }
              &nbsp;
              <i className={ccImage} />
            </Dropdown.Item>
          ),
        };
      }));
      setReload(false);
    }
  }, [user, reload]);

  const getDropdownText = () => {
    return (selectedCurrency && selectedCurrency.text) || 'Select Currency to Donate';
  }

  const addCurrency = () => {
    setDonations(curr => {
      let cc = { currency: selectedCurrency.currency, amount: selectedAmount };
      return [...curr, cc];
    });
    setWallet(curr => {
      let index = curr.findIndex(cc => cc.currency === selectedCurrency.currency);
      if (index !== -1) {
        curr.splice(index, 1);
      }
      return [...curr];
    });
    setSelectedCurrency(null);
    setSelectedAmount(0.01);
  }

  const reset = () => {
    setSelectedCurrency(null);
    setSelectedAmount(0.01);
    setDonations([]);
    setWallet([]);
    setReload(true);
  }

  const donate = () => {
    let payload = {
      action: 'donate_money',
      recipientId: props.profile && props.profile._id,
      donations,
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Donations Made!' });
        loadUser();
      } else {
        setNotification({ type: 'error', header: data.error, content: data.errorDetail });
      }
    });
  }
  
  return props.profile && (
    <Modal open={props.show} onClose={props.onClose}>
      <Modal.Header>Donate To: { props.profile.displayName }</Modal.Header>
      <Modal.Content>
        {
          wallet.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Dropdown
                text={getDropdownText()}
                options={wallet}
                value={selectedCurrency}
                onChange={(_, { value }) => setSelectedCurrency(wallet.find(cc => cc.currency === value))}
                selection
              />
              {
                selectedCurrency && (
                  <>
                    <Input
                      type='number'
                      label='Amount'
                      min={0.01}
                      step={0.01}
                      max={selectedCurrency.amount}
                      value={selectedAmount.toFixed(2)}
                      onChange={(_, {value}) => setSelectedAmount(Number.parseFloat(value))}
                    />
                    <Button color='green' content='Add Currency' onClick={addCurrency} />
                  </>
                )
              }
            </div>
          )
        }
        <br />
        {
          donations.length > 0 && (
            <List relaxed>
              {
                donations.map((donation, idx) => {
                  let ccImage = constants.CURRENCY_IMAGE[donation.currency];
                  return (
                    <List.Item key={idx}>
                      { donation.amount }
                      &nbsp;
                      { donation.currency }
                      &nbsp;
                      <i className={ccImage} />
                    </List.Item>
                  );
                })
              }
            </List>
          )
        }
      </Modal.Content>
      <Modal.Actions>
        <Button color='red' content='Reset' onClick={reset} />
        <Button color='blue' content='Donate' onClick={donate} />
        <Button content='Cancel' onClick={props.onClose} />
      </Modal.Actions>
    </Modal>
  );
}

function GiftModal(props) {
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [giftItems, setGiftItems] = useState([]);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    if (user && reload) {
      setItems(user.inventory.map((item, idx) => {
        let itemDetails = constants.ITEMS[item.id];
        return {
          ...item,
          value: item.id,
          text: (
            <Dropdown.Item key={item.id} value={item.id}>
              <i className={itemDetails.image} />
              &nbsp;
              { itemDetails.label }
              &nbsp;
              {
                itemDetails.quality > 0 && (
                  `Q${itemDetails.quality}`
                )
              }
            </Dropdown.Item>
          )
        };
      }));
      setReload(false);
    }
  }, [user, reload]);

  const getDropdownText = () => {
    return (selectedItem && selectedItem.text) || 'Select Item to Gift';
  }

  const addItem = () => {
    setGiftItems(curr => {
      let item = { id: selectedItem.id, quantity: selectedQuantity };
      return [...curr, item];
    });
    setItems(curr => {
      let index = curr.findIndex(item => item.id === selectedItem.id);
      if (index !== -1) {
        curr.splice(index, 1);
      }
      return [...curr];
    });
    setSelectedItem(null);
    setSelectedQuantity(1);
  }

  const reset = () => {
    setGiftItems([]);
    setSelectedItem(null);
    setSelectedQuantity(1);
    setReload(true);
  }

  const gift = () => {
    let payload = {
      action: 'gift_items',
      recipientId: props.profile && props.profile._id,
      giftItems,
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Gifts Made!' });
        loadUser();
      } else {
        setNotification({ type: 'error', header: data.error, content: data.errorDetail });
      }
    });
  }
  
  return props.profile && (
    <Modal open={props.show} onClose={props.onClose}>
      <Modal.Header>Gift Items To: {props.profile.displayName}</Modal.Header>
      <Modal.Content>
        {
          items.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Dropdown
                text={getDropdownText()}
                options={items}
                value={selectedItem}
                onChange={(_, { value }) => setSelectedItem(items.find(item => item.id === value))}
                selection
              />
              {
                selectedItem && (
                  <>
                    <Input
                      type='number'
                      label='Quantity'
                      min={1}
                      step={1}
                      max={selectedItem.quantity}
                      value={selectedQuantity}
                      onChange={(_, { value }) => setSelectedQuantity(Number.parseInt(value))}
                    />
                    <Button color='green' content='Add Item' onClick={addItem} />
                  </>
                )
              }
            </div>
          )
        }
        <br />
        {
          giftItems.length > 0 && (
            <Inventory inventory={giftItems} />
          )
        }
      </Modal.Content>
      <Modal.Actions>
        <Button color='blue' content='Gift Items' onClick={gift} />
        <Button color='red' content='Reset' onClick={reset} />
        <Button content='Cancel' onClick={props.onClose} />
      </Modal.Actions>
    </Modal>
  );
}
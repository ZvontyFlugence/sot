import { useEffect, useState } from 'react';

import { useSetNotification } from '../../context/NotificationContext';
import { useGetUser, useLoadUser } from '../../context/UserContext';
import Inventory from '../Shared/Inventory';
import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Button, Dropdown, Input, Modal } from 'semantic-ui-react';

export default function ExchangeItemsModal(props) {
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [mode, setMode] = useState(0);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [giftItems, setGiftItems] = useState([]);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    if (user && reload) {
      if (mode === 0) {
        setItems(user.inventory.map(mapItems));
      } else {
        setItems(props.inventory.map(mapItems));
      }
      setReload(false);
    }
  }, [user, reload, mode, props.inventory]);

  const handleSetMode = mode => {
    setMode(mode);
    reset();
  }

  const getDropdownText = () => {
    return (selectedItem && selectedItem.text) ||
      mode === 0 ? 'Select Item to Deposit' : 'Select Item to Withdraw';
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
    if (mode === 0) {
      let payload = {
        action: 'deposit_items',
        mode,
        compId: props.compId,
        giftItems,
      };

      SoTApi.doAction(payload).then(data => {
        if (data.success) {
          setNotification({ type: 'success', header: 'Items Deposited!' });
          loadUser();
        } else {
          setNotification({ type: 'error', header: data.error, content: data.errorDetail });
        }
      });
    } else {
      let payload = {
        action: 'withdraw_items',
        mode,
        compId: props.compId,
        giftItems,
      };

      SoTApi.doAction(payload).then(data => {
        if (data.success) {
          setNotification({ type: 'success', header: 'Items Withdrawn!' });
          loadUser();
        } else {
          setNotification({ type: 'error', header: data.error, content: data.errorDetail });
        }
      });
    }
  }

  return (
    <Modal open={props.show} onClose={props.onClose}>
      <Modal.Header>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          Exchange Items
          <Button.Group>
            <Button content='Deposit' positive={mode === 0} onClick={() => handleSetMode(0)} />
            <Button.Or />
            <Button content='Withdraw' positive={mode === 1} onClick={() => handleSetMode(1)} />
          </Button.Group>
        </div>
      </Modal.Header>
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
        <Button color='blue' content={mode === 0 ? 'Deposit Items' : 'Withdraw Items'} onClick={gift} />
        <Button color='red' content='Reset' onClick={reset} />
        <Button content='Cancel' onClick={props.onClose} />
      </Modal.Actions>
    </Modal>
  );
}

function mapItems(item) {
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
    ),
  };
}
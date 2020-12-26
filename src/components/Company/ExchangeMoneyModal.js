import { useEffect, useState } from 'react';

import { useSetNotification } from '../../context/NotificationContext';
import { useGetUser, useLoadUser } from '../../context/UserContext';
import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Button, Dropdown, Input, List, Modal } from 'semantic-ui-react';

export default function ExchangeMoneyModal(props) {
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [mode, setMode] = useState(0);
  const [wallet, setWallet] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(0.01);
  const [donations, setDonations] = useState([]);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    if (user && reload && props.funds) {
      if (mode === 0) {
        let userWallet = [...user.wallet];
        if (user.gold > 0) {
          userWallet.push({ currency: 'Gold', amount: user.gold });
        }
        setWallet(userWallet.map(mapWallet));
      } else {
        let compWallet = [{ currency: props.funds.currency, amount: props.funds.amount }];
        if (props.gold > 0) {
          compWallet.push({ currency: 'Gold', amount: props.gold });
        }
        setWallet(compWallet.map(mapWallet));
      }
      setReload(false);
    }
  }, [user, reload, mode, props.funds, props.gold]);

  const handleSetMode = mode => {
    setMode(mode);
    reset();
  }

  const getDropdownText = () => {
    return (selectedCurrency && selectedCurrency.text) ||
      mode === 0 ? 'Select Currency to Donate' : 'Select Currency to Withdraw';
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
    if (mode === 0) {
      let payload = {
        action: 'deposit_money',
        compId: props.compId,
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
    } else {
      let payload = {
        action: 'withdraw_money',
        compId: props.compId,
        donations,
      };

      SoTApi.doAction(payload).then(data => {
        if (data.success) {
          setNotification({ type: 'success', header: 'Withdrawal Made!' });
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Exchange Money
          <Button.Group>
            <Button content='Deposit' positive={mode === 0} onClick={() => handleSetMode(0)} />
            <Button.Or />
            <Button content='Withdraw' positive={mode === 1} onClick={() => handleSetMode(1)} />
          </Button.Group>
        </div>
      </Modal.Header>
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
                      onChange={(_, { value }) => setSelectedAmount(Number.parseFloat(value))}
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
        <Button color='blue' content='Donate' onClick={donate} />
        <Button color='red' content='Reset' onClick={reset} />
        <Button content='Cancel' onClick={props.onClose} />
      </Modal.Actions>
    </Modal>
  );
}

function mapWallet(cc, idx) {
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
}
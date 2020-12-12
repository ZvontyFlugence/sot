import { useState } from 'react';

import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Button, Grid, Input, Modal, Segment, Table } from 'semantic-ui-react'

export default function PublicDetails(props) {
  const { user, funds, compId, loadUser, setNotification, setReload } = props;
  const [buyAmount, setBuyAmount] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  const getUserCC = () => {
    if (funds && user) {      
      let cc = user.wallet.find(cc => cc.currency === funds.currency);
      if (cc)
        return cc.amount;
    }

    return 0.00;
  }

  const isSufficientFunds = price => {
    return (buyAmount * price).toFixed(2) > getUserCC();
  }

  const buyItem = offer => {
    let payload = {
      action: 'purchase_offer',
      purchase: {
        compId,
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
        setReload(true);
      }
    });
  }

  const acceptOffer = offer => {
    let payload = {
      action: 'accept_job_offer',
      compId,
      offer,
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({
          type: 'success',
          header: 'Job Offer Accepted',
          content: `You are now an employee of ${props.compName}`,
        });

        loadUser();
        setReload(true);
      }
    });
  }

  const confirmModal = (label, po, currency) => (
    <Modal open={showConfirm} onClose={() => setShowConfirm(false)} size='tiny'>
      <Modal.Header>Confirm Purchase</Modal.Header>
      <Modal.Content>
        <span>
          Are you sure you want to buy { buyAmount } { label } for { (buyAmount * po.price).toFixed(2) } { currency }
          &nbsp;
          <i className={`flag-icon flag-icon-${funds.flag} flag-inline-right`} />
          &nbsp;?
        </span>
      </Modal.Content>
      <Modal.Actions>
        <Button color='blue' content='Confirm Purchase' onClick={() => buyItem(po)} />
        <Button content='Cancel' onClick={() => setShowConfirm(false)} />
      </Modal.Actions>
    </Modal>
  );

  const productOffers = (
    <Table basic='very'>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Product</Table.HeaderCell>
          <Table.HeaderCell>Quantity</Table.HeaderCell>
          <Table.HeaderCell>Price/Unit</Table.HeaderCell>
          <Table.HeaderCell>Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {props.productOffers.map((po, i) => {
          let item = constants.ITEMS[po.id];

          return (
            <Table.Row key={i}>
              <Table.Cell>
                <i className={item.image} />
                &nbsp;
                { item.label }
              </Table.Cell>
              <Table.Cell>
                { po.quantity }
              </Table.Cell>
              <Table.Cell>
                <span style={{ color: isSufficientFunds(po.price) ? 'red' : 'initial'}}>
                  { (po.price * buyAmount).toFixed(2) } { funds.currency }
                  &nbsp;
                  <i className={`flag-icon flag-icon-${funds.flag} flag-inline-right`} />
                </span>
              </Table.Cell>
              <Table.Cell style={{ display: 'flex' }} collapsing>
                <Input
                  type='number'
                  size='mini'
                  min={1}
                  max={po.quantity}
                  value={buyAmount}
                  onChange={e => setBuyAmount(e.target.valueAsNumber)}
                />
                &nbsp;
                <Button
                  size='mini'
                  color={isSufficientFunds(po.price) ? 'red' : 'blue'}
                  content={isSufficientFunds(po.price) ? 'Insufficient Funds' : 'Purchase'}
                  disabled={isSufficientFunds(po.price)}
                  onClick={() => setShowConfirm(true)}
                />
              </Table.Cell>
              { confirmModal(item.label, po, funds.currency)}
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );

  const jobOffers = (
    <Table basic='very'>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Job Title</Table.HeaderCell>
          <Table.HeaderCell>Wage</Table.HeaderCell>
          <Table.HeaderCell>Positions Available</Table.HeaderCell>
          <Table.HeaderCell>Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {props.jobOffers.map(offer => (
          <Table.Row key={offer.id}>
            <Table.Cell>{ offer.title }</Table.Cell>
            <Table.Cell>
              { offer.wage.toFixed(2) } { funds.currency }
              &nbsp;
              <i className={`flag-icon flag-icon-${funds.flag} flag-inline-right`} />
            </Table.Cell>
            <Table.Cell>
              { offer.quantity }
            </Table.Cell>
            <Table.Cell collapsing>
              <Button
                size='mini'
                color={(user && user.job === 0) ? 'blue' : 'red'}
                content={(user && user.job === 0) ? 'Apply' : 'Already Employed'}
                disabled={user && user.job !== 0}
                onClick={() => acceptOffer(offer)}
              />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );

  return (
      <Grid container stackable columns={2}>
        <Grid.Column width={16}>
          <Segment>
            <h3><strong>Product Offers</strong></h3>
            { productOffers }
          </Segment>
        </Grid.Column>
        <Grid.Column width={16}>
          <Segment>
            <h3><strong>Job Offers</strong></h3>
            { jobOffers }
          </Segment>
        </Grid.Column>
      </Grid>
  );
}
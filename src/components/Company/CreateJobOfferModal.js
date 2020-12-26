import { useState } from 'react';

import { useLoadUser } from '../../context/UserContext';
import { useSetNotification } from '../../context/NotificationContext';
import SoTApi from '../../services/SoTApi';

import { Button, Input, Modal } from 'semantic-ui-react'

export default function CreateJobOfferModal(props) {
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [title, setTitle] = useState('');
  const [numOffers, setNumOffers] = useState(1);
  const [wage, setWage] = useState(1);
  const { compId, setReload, funds } = props;

  const createJobOffer = () => {
    let payload = {
      action: 'create_job_offer',
      jobOffer: {
        title,
        quantity: numOffers,
        wage,
      },
    };

    SoTApi.doCompAction(compId, payload).then(data => {
      if (data.success) {
        setNotification({
          type: 'success',
          header: 'Job Offer(s) Created',
          content: 'Now just wait for the new hires to roll in',
        });

        props.onClose();
        loadUser();
        setReload(true);
      }
    });
  }

  return (
    <Modal size='mini' open={props.show} onClose={props.onClose}>
      <Modal.Header>Create Job Offer</Modal.Header>
      <Modal.Content style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label><strong>Job Title</strong></label>
          <Input type='text' value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label><strong>Number of Job Offers:</strong></label>
          <Input type='number' min={1} value={numOffers} onChange={e => setNumOffers(e.target.valueAsNumber)} />
        </div>
        <br />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label><strong>Wage:</strong></label>
          <Input
            label={funds.currency}
            labelPosition='right'
            type='number'
            min={1}
            step={0.25}
            value={wage}
            onChange={e => setWage(e.target.valueAsNumber)}
          />
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button color='blue' content='Create Job Offer' onClick={createJobOffer} />
        <Button content='Cancel' onClick={props.onClose} />
      </Modal.Actions>
    </Modal>
  );
}
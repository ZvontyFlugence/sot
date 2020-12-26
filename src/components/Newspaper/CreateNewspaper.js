import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useGetUser, useLoadUser } from '../../context/UserContext';
import SoTApi from '../../services/SoTApi';

import { Button, Form, Message, Modal, Segment } from "semantic-ui-react";

export default function CreateNewspaper() {
  const user = useGetUser();
  const loadUser = useLoadUser();
  const history = useHistory();
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = () => {
    let payload = {
      action: 'create_newspaper',
      newsName: name,
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        loadUser();
        history.push(`/newspaper/${data.newsId}`);
      }
    });
  }

  const createNewsModal = (
    <Modal size='mini' open={show} onClose={() => setShow(false)}>
      <Modal.Header>Create Newspaper</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input
            type='text'
            label='Newspaper Name'
            value={name}
            onChange={(e, { value }) => setName(value)}
          />
          <Message
            warning
            visible={user.gold < 5.0}
            header='Insufficient Funds'
          />
          <div>
            <p>
              Cost:
              <span style={{ float: 'right' }}>
                {Number.parseInt('5').toFixed(2)}
                &nbsp;
                <i className='sot-coin' />
              </span>
            </p>
            <p>
              You have:
              <span style={{ float: 'right' }}>
                {user.gold.toFixed(2)}
                &nbsp;
                <i className='sot-coin' />
              </span>
            </p>
          </div>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color='blue' content='Create' disabled={user.gold < 5.0} onClick={handleCreate} />
        <Button content='Cancel' onClick={() => setShow(false)} />
      </Modal.Actions>
    </Modal>
  );

  return (
    <>
      <h1><strong>Newspaper</strong></h1>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Segment>
          <Message
            info
            visible
            header='You do not own a Newspaper'
            content='You can create a new Newspaper'
          />
          <Button color='blue' content='Create Newspaper' onClick={() => setShow(true)} />
        </Segment>
      </div>
      { createNewsModal }
    </>
  );
}
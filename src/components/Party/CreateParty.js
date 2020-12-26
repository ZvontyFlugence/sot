import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useGetUser, useLoadUser } from '../../context/UserContext';
import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Button, Form, Message, Modal, Segment } from 'semantic-ui-react';

export default function CreateParty() {
  const user = useGetUser();
  const loadUser = useLoadUser();
  const history = useHistory();
  const [show, setShow] = useState(false);

  return (
    <>
      <h1><strong>Political Party</strong></h1>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Segment>
          <Message
            info
            visible
            header='You are not affiliated with a Political Party'
            content='You can create your own or join an existing political party'
          />
          <Button color='blue' content='Create New' onClick={() => setShow(true)} />
          <Button color='green' content='Join Existing' onClick={() => history.push('/rankings', { tab: 'parties' })} />
        </Segment>
      </div>
      <CreatePartyModal
        show={show}
        onClose={() => setShow(false)}
        user={user}
        loadUser={loadUser}
        history={history}
      />
    </>
  );
}

function CreatePartyModal(props) {
  const { user, loadUser, history } = props;
  const [name, setName] = useState('');
  const [social, setSocial] = useState('');
  const [economic, setEconomic] = useState('');

  const handleCreate = () => {
    let payload = {
      action: 'create_party',
      party: { name, social, economic },
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        loadUser();
        history.push(`/party/${data.partyId}`);
      }
    });
  }

  return (
    <Modal size='mini' open={props.show} onClose={props.onClose}>
      <Modal.Header>Create Political Party</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input
            type='text'
            label='Party Name'
            value={name}
            onChange={(_, { value }) => setName(value)}
          />
          <Form.Select
            label='Social Orientation'
            options={constants.PARTY_SOCIAL_VIEWS}
            value={social}
            onChange={(_, { value }) => setSocial(value)}
          />
          <Form.Select
            label='Economic Orientation'
            options={constants.PARTY_ECONOMIC_VIEWS}
            value={economic}
            onChange={(_, { value }) => setEconomic(value)}
          />
          <Message
            warning
            visible={user.gold < 15.0}
            header='Insufficient Funds'
          />
          <div>
            <p>
              Cost:
              <span style={{ float: 'right' }}>
                { Number.parseInt('15').toFixed(2) }
                &nbsp;
                <i className='sot-coin' />
              </span>
            </p>
            <p>
              You have:
              <span style={{ float: 'right' }}>
                { user.gold.toFixed(2) }
                &nbsp;
                <i className='sot-coin' />
              </span>
            </p>
          </div>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color='blue' content='Create' disabled={user.gold < 15.0} onClick={handleCreate} />
        <Button content='Cancel' onClick={props.onClose} />
      </Modal.Actions>
    </Modal>
  )
}
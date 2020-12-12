import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useGetUser } from '../context/UserContext';
import { useSetNotification } from '../context/NotificationContext';
import Layout from '../layout/Layout';
import SoTApi from '../services/SoTApi';
import constants from '../util/constants';

import {
  Button,
  Form,
  Grid,
  Image,
  Message,
  Modal,
  Segment,
  Table
} from 'semantic-ui-react';

export default function MyCompanies() {
  const user = useGetUser();
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    if (user && reload) {
      SoTApi.getUserCompaniesPlus('location=true').then(data => {
        if (data.companies) {
          setCompanies(data.companies);
          setReload(false);
        }
      });
    }
  }, [user, reload]);

  const companiesTable = (
    <Table basic='very'>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Company</Table.HeaderCell>
          <Table.HeaderCell>Type</Table.HeaderCell>
          <Table.HeaderCell>Location</Table.HeaderCell>
          <Table.HeaderCell>Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {companies.map((comp, index) => {
          let type = constants.COMPANY_TYPES[comp.type - 1].text;
          let img = constants.ITEMS.find(i => i.label === type).image;

          return (
            <Table.Row key={index}>
              <Table.Cell>
                <span style={{ display: 'flex', alignItems: 'center', columnGap: 10 }}>
                  <Image src={comp.image} size='mini' circular style={{ verticalAlign: 'middle' }} />
                  &nbsp;
                  { comp.name }
                </span>
              </Table.Cell>
              <Table.Cell>
                <span>
                  <i className={img} />
                  &nbsp;
                  { type }
                </span>
              </Table.Cell>
              <Table.Cell>
                { comp.location.name }, { comp.location.owner.name }
                &nbsp;
                <i className={`flag-icon flag-icon-${comp.location.owner.flag} flag-inline-right`} />
              </Table.Cell>
              <Table.Cell collapsing>
                <Button
                  compact
                  color='blue'
                  size='small'
                  content='View'
                  onClick={() => history.push(`/company/${comp._id}`)}
                />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );

  return (
    <Layout>
      <div id='myCompanies'>
        <h1>My Companies</h1>
        <Grid>
          <Grid.Column width={16} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button color='blue' content='Create Company' onClick={() => setShowModal(true)} />
          </Grid.Column>
          <Grid.Column width={16}>
            <Segment raised>
              {companies.length > 0 ?  companiesTable : (
                <span>You dont own any companies</span>
              )}
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
      <CreateCompanyModal show={showModal} hide={() => setShowModal(false)} gold={user && user.gold} />
    </Layout>
  );
};

function CreateCompanyModal(props) {
  const { show, hide, gold } = props;
  const history = useHistory();
  const setNotification = useSetNotification();
  const [name, setName] = useState('');
  const [type, setType] = useState(null);

  const handleCreate = () => {
    SoTApi.doAction({ action: 'create_company', comp: { name, type } })
      .then(data => {
        if (data.success) {
          setNotification({
            type: 'success',
            header: 'Company Created',
          });
          history.push(`/company/${data.comp_id}`);
        } else {
          setNotification({
            type: 'error',
            header: 'Error',
            content: 'Failed to create company'
          });
        }
      });
  }

  return (
    <Modal onClose={hide} open={show}>
      <Modal.Header>Create Company</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input
            fluid
            type='text'
            label='Company Name'
            value={name}
            onChange={(e, {value}) => setName(value)}
          />
          <Form.Select
            fluid
            label='Company Type'
            options={constants.COMPANY_TYPES}
            placeholder='Select Company Type'
            value={type}
            onChange={(e, {value}) => setType(value)}
          />

          <Message
            warning
            visible={gold < 25}
            header='Insufficient Gold'
            content='You must have at least 25 gold to create a company'
          />

          <div>
            <p>
              Cost:
              <span style={{ float: 'right' }}>
                {Number.parseInt('25').toFixed(2)}
                &nbsp;
                <i className='sot-coin' />
              </span>
            </p>
            <p>
              You have:
              <span style={{ float: 'right' }}>
                {gold.toFixed(2)}
                &nbsp;
                <i className='sot-coin' />
              </span>
            </p>
          </div>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color='blue' content='Create' onClick={handleCreate} disabled={gold < 25 || !Number.isInteger(type)} />
        <Button content='Cancel' onClick={hide} />
      </Modal.Actions>
    </Modal>
  );
}
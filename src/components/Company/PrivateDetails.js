import { useState } from 'react';

import Inventory from '../Shared/Inventory';
import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Button, Dropdown, Form, Grid, Image, Input, List, Message, Modal, Statistic, Tab } from 'semantic-ui-react'

export default function PrivateDetails(props) {
  const { ceo, compId, employees, inventory, funds, loadUser, setNotification, setReload, gold } = props;
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellAmount, setSellAmount] = useState(1);
  const [sellPrice, setSellPrice] = useState(1);
  const [title, setTitle] = useState('');
  const [numOffers, setNumOffers] = useState(1);
  const [wage, setWage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(-1);
  const [showEditEmpModal, setShowEditEmpModal] = useState(false);

  const panes=[
    { menuItem: 'Inventory', render: () => inventoryTab },
    { menuItem: 'Employees', render: () => employeesTab },
    { menuItem: 'Treasury', render: () => treasuryTab },
    { menuItem: 'Stats', render: () => statsTab },
  ];

  const getInventoryItems = () => {
    return inventory.map(item => {
      let itemData = constants.ITEMS[item.id];

      return {
        id: item.id,
        label: itemData.label,
        image: itemData.image,
        quantity: item.quantity,
        as: () => (
          <Dropdown.Item key={itemData} value={item.id} onClick={(e, {value}) => setSelectedProduct(value)}>
            <i className={itemData.image} />
            &nbsp;
            {itemData.label}
          </Dropdown.Item>
        ),
      };
    });
  }

  const listProduct = () => {
    let payload = {
      action: 'sell_product',
      productOffer: { id: selectedProduct.id, quantity: sellAmount, price: sellPrice },
    };

    SoTApi.doCompAction(compId, payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Product Offer Created', content: 'Product listed for sell' });
        setShowCreateProduct(false);
        loadUser();
        setReload(true);
      }
    });
  }

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

        setShowCreateJob(false);
        loadUser();
        setReload(true);
      }
    });
  }

  const getDropdownText = () => {
    let item = getInventoryItems().find(item => item.id === selectedProduct);

    if (item)
      return item.as;
    else
      return selectedProduct;
  }
  
  const getUserTitle = (employeeId, empTitle) => {
    return employeeId === ceo._id ? 'CEO' : empTitle
  }

  const handleEditEmployee = employee => {
    setSelectedEmployee(employee);
    setShowEditEmpModal(true);
  }

  const CreateProductOfferModal = () => {
    return (
      <Modal size='mini' open={showCreateProduct} onClose={() => setShowCreateProduct(false)}>
        <Modal.Header>Create Product Offer</Modal.Header>
        <Modal.Content style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label><strong>Product:</strong></label>
            <Dropdown
              text={getDropdownText()}
              value={selectedProduct}
              options={getInventoryItems()}
              selection
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label><strong>Amount:</strong></label>
            <Input
              type='number'
              min={1}
              step={1}
              max={(selectedProduct && selectedProduct.quantity) || 1}
              value={sellAmount}
              onChange={e => setSellAmount(e.target.valueAsNumber)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label><strong>Price:</strong></label>
            <Input
              type='number'
              min={1}
              step={0.25}
              value={sellPrice}
              onChange={e => setSellPrice(e.target.valueAsNumber)}
            />
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button color='blue' content='Create Product Offer' onClick={listProduct} />
          <Button content='Cancel' onClick={() => setShowCreateProduct(false)} />
        </Modal.Actions>
      </Modal>
    );
  }

  const CreateJobOfferModal = () => {
    return (
      <Modal size='mini' open={showCreateJob} onClose={() => setShowCreateJob(false)}>
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
          <Button content='Cancel' onClick={() => setShowCreateJob(false)} />
        </Modal.Actions>
      </Modal>
    );
  }

  const EditEmployeeModal = () => {
    const [empWage, setEmpWage] = useState(selectedEmployee.wage);
    const [empTitle, setEmpTitle] = useState(selectedEmployee.title);

    const handleChangeTitle = (_, { value }) => setEmpTitle(value);
  
    const handleChangeWage = (_, { value }) => setEmpWage(Number.parseFloat(value).toFixed(2));

    const fireEmployee = () => {
      let payload = {
        action: 'fire_employee',
        employeeId: selectedEmployee._id,
      };

      SoTApi.doCompAction(payload).then(data => {
        if (data.success) {
          setNotification({ type: 'success', header: 'Fired Employee', content: 'The fired employee has been notified.' });
          setReload(true);
        } else {
          setNotification({ type: 'error', header: data.error });
        }
      });
    }

    const editEmployee = () => {
      let payload = {
        action: 'edit_employee',
        employeeData: {
          title: empTitle === selectedEmployee.title ? undefined : empTitle,
          wage: empWage === selectedEmployee.wage ? undefined : empWage,
          userId: selectedEmployee._id,
        },
      };

      SoTApi.doCompAction(payload).then(data => {
        if (data.success) {
          setNotification({ type: 'success', header: 'Employee Edited!', content: 'The Employee has been notified' });
          setReload(true);
        } else {
          setNotification({ type: 'error', header: data.error });
        }
      });
    }

    return (
      <Modal size='tiny' open={showEditEmpModal} onClose={() => setShowEditEmpModal(false)}>
        <Modal.Header>Edit Employee: { selectedEmployee.displayName }</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Input label='Employee Title' type='text' value={empTitle} onChange={handleChangeTitle} />
            <Form.Input label='Employee Wage' type='number' min={1} step={0.01} value={empWage} onChange={handleChangeWage} />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button color='red' content='Fire' onClick={fireEmployee} />
            <div>
              <Button color='blue' content='Edit' onClick={editEmployee} />
              <Button content='Cancel' onClick={() => setShowEditEmpModal(false)} />
            </div>
          </div>          
        </Modal.Actions>
      </Modal>
    );
  }

  const inventoryTab = (
    <Tab.Pane>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>Inventory</h3>
        </div>
        <div>
          <Button
            color='blue'
            size='small'
            icon='plus'
            content='Create Product Offer'
            onClick={() => setShowCreateProduct(true)}
          />
        </div>        
      </div>
      <Inventory inventory={inventory} />
      <CreateProductOfferModal />
    </Tab.Pane>
  );
  
  const employeesTab = (
    <Tab.Pane>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>Employees</h3>
        </div>
        <div>
          <Button
            color='blue'
            size='small'
            icon='plus'
            content='Create Job Offer'
            onClick={() => setShowCreateJob(true)}
          />
        </div>        
      </div>
      {employees && employees.length > 0 ? (
        <Grid>
          <Grid.Column>
            <List>
              {employees.map((emp, i) => {
                return (
                  <List.Item key={i} style={{ display: 'flex', alignItems: 'center' }} onClick={() => handleEditEmployee(emp)}>
                    <Image src={emp.image} alt='' size='mini' circular />
                    <List.Content>
                      <List.Header>{emp.displayName}</List.Header>
                      <List.Description>{ getUserTitle(emp.userId, emp.title) }</List.Description>
                    </List.Content>
                  </List.Item>
                );
              })}
            </List>
          </Grid.Column>
          <EditEmployeeModal />
        </Grid>
      ) : (
        <Message
          info
          visible
          header='No Employees'
          content='You can hire employees by putting out a job offer'
        />
      )}
      <CreateJobOfferModal />
    </Tab.Pane>
  );

  const treasuryTab = (
    <Tab.Pane>
      <h3>Treasury</h3>
      <Statistic.Group style={{ display: 'flex', justifyContent: 'center' }}>
        <Statistic>
          <Statistic.Value>{ funds.amount.toFixed(2) }</Statistic.Value>
          <Statistic.Label>
            { funds.currency }
            &nbsp;
            <i className={`flag-icon flag-icon-${funds.flag} flag-inline-right`} />
          </Statistic.Label>
        </Statistic>
        <Statistic>
          <Statistic.Value>{ gold.toFixed(2) }</Statistic.Value>
          <Statistic.Label>Gold <i className='sot-coin' /></Statistic.Label>
        </Statistic>
      </Statistic.Group>
    </Tab.Pane>
  );

  const statsTab = (
    <Tab.Pane disabled>

    </Tab.Pane>
  );

  return (
    <Tab
      menu={{ fluid: true, vertical: true }}
      menuPosition='left'
      panes={panes}
    />
  );
}
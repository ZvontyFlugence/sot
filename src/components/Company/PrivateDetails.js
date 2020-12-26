import { useState } from 'react';

import CreateJobOfferModal from './CreateJobOfferModal';
import CreateProductOfferModal from './CreateProductOfferModal';
import EditEmployeeModal from './EditEmployeeModal';
import ExchangeItemsModal from './ExchangeItemsModal';
import ExchangeMoneyModal from './ExchangeMoneyModal';
import Inventory from '../Shared/Inventory';

import { Button, Grid, Image, List, Message, Statistic, Tab } from 'semantic-ui-react';

export default function PrivateDetails(props) {
  const { ceo, compId, employees, inventory, funds, setReload, gold } = props;
  const [selectedEmployee, setSelectedEmployee] = useState(-1);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);  
  const [showEditEmpModal, setShowEditEmpModal] = useState(false);
  const [showExchangeItems, setShowExchangeItems] = useState(false);
  const [showExchangeMoney, setShowExchangeMoney] = useState(false);

  const panes=[
    { menuItem: 'Inventory', render: () => inventoryTab },
    { menuItem: 'Employees', render: () => employeesTab },
    { menuItem: 'Treasury', render: () => treasuryTab },
    { menuItem: 'Stats', render: () => statsTab },
  ];
  
  const getUserTitle = (employeeId, empTitle) => {
    return employeeId === ceo._id ? 'CEO' : empTitle
  }

  const handleEditEmployee = employee => {
    setSelectedEmployee(employee);
    setShowEditEmpModal(true);
  }

  const inventoryTab = (
    <Tab.Pane>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>Inventory</h3>
        </div>
        <div>
          <Button
            compact
            color='blue'
            size='small'
            icon='plus'
            content='Create Product Offer'
            onClick={() => setShowCreateProduct(true)}
          />
          <Button
            compact
            color='green'
            size='small'
            icon='exchange'
            content='Exchange Items'
            onClick={() => setShowExchangeItems(true)}
          />
        </div>        
      </div>
      <Inventory inventory={inventory} />
      <CreateProductOfferModal
        show={showCreateProduct}
        onClose={() => setShowCreateProduct(false)}
        inventory={inventory}
        compId={compId}
        setReload={setReload}
      />
      <ExchangeItemsModal
        show={showExchangeItems}
        onClose={() => setShowExchangeItems(false)}
        inventory={inventory}
        compId={compId}
      />
    </Tab.Pane>
  );
  
  const employeesTab = (
    <Tab.Pane>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3>Employees</h3>
        </div>
        <Button
          compact
          color='blue'
          size='small'
          icon='plus'
          content='Create Job Offer'
          onClick={() => setShowCreateJob(true)}
        />       
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
          <EditEmployeeModal
            show={showEditEmpModal}
            onClose={() => setShowEditEmpModal(false)}
            setReload={setReload}
            selectedEmployee={selectedEmployee}
          />
        </Grid>
      ) : (
        <Message
          info
          visible
          header='No Employees'
          content='You can hire employees by putting out a job offer'
        />
      )}
      <CreateJobOfferModal
        show={showCreateJob}
        onClose={() => setShowCreateJob(false)}
        compId={compId}
        setReload={setReload}
        funds={funds}
      />
    </Tab.Pane>
  );

  const treasuryTab = (
    <Tab.Pane>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3>Treasury</h3>
        <Button
          compact
          color='green'
          size='tiny'
          icon='exchange'
          content='Exchange Money '
          onClick={() => setShowExchangeMoney(true)}
        />
      </div>
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
      <ExchangeMoneyModal
        show={showExchangeMoney}
        onClose={() => setShowExchangeMoney(false)}
        compId={compId}
        funds={funds}
        gold={gold}
      />
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
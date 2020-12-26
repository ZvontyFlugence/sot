import { useState } from 'react';

import { useSetNotification } from '../../context/NotificationContext';
import SoTApi from '../../services/SoTApi';

import { Button, Form, Modal } from 'semantic-ui-react';

export default function EditEmployeeModal(props) {
  const { setReload, selectedEmployee } = props;
  const setNotification = useSetNotification();
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
    <Modal size='tiny' open={props.show} onClose={props.onClose}>
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
            <Button content='Cancel' onClick={props.onClose} />
          </div>
        </div>          
      </Modal.Actions>
    </Modal>
  );
}
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import SoTApi from '../../services/SoTApi';

import { Button, Dropdown, Input, Message, Modal } from 'semantic-ui-react';

export default function EditCompanyModal(props) {
  const { setReload, user, company, loadUser } = props;
  const history = useHistory();
  const [name, setName] = useState(company.name || '');
  const [relocate, setRelocate] = useState(false);
  const [regions, setRegions] = useState([]);
  const [location, setLocation] = useState(0);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    getRegions();
  }, []);

  const getRegions = () => {
    SoTApi.getRegions().then(data => {
      if (data.regions) {
        setRegions(data.regions.map((region, index) => {
          return {
            ...region,
            as: () => (
              <Dropdown.Item key={index} value={region._id} onClick={(e, { value }) => setLocation(value)}>
              <i className={`flag-icon flag-icon-${region.owner.flag_code} flag-inline-left`} />
              &nbsp;
              { region.name }
              </Dropdown.Item>
            ),
          };
        }));
      }
    });
  }

  const handleDelete = () => {
    SoTApi.deleteCompany(company._id)
      .then(data => {
        if (data.success) {
          loadUser();
          history.push('/companies');
        }
      });
  }

  const handleUpdate = () => {
    let payload = { name };
    SoTApi.updateCompDetails(company._id, payload)
      .then(data => {
        if (data.success) {
          setReload(true);
        }
      });
  }

  const handleSetUpdateError = error => {
    if (updateError !== error) {
      setUpdateError(error);
    }
  }

  const updateDisabled = () => {
    let hasName = !!name;
    let notRelocating = location === 0;
    let invalidLocation = location === (company && company.location);
    let sufficientFunds = (user && user.gold) >= 10;

    if (notRelocating && (!hasName || name === company.name)) {
      handleSetUpdateError('No Updates Detected!');
      return true;
    } else if (!notRelocating && invalidLocation) {
      handleSetUpdateError('Cannot relocate to current location!');
      return true;
    } else if (!notRelocating && !sufficientFunds) {
      handleSetUpdateError('Insufficient funds for relocation!');
      return true;
    } else {
      handleSetUpdateError('');
      return false;
    }
  }

  const clearRelocation = () => {
    setLocation(0);
    setUpdateError('');
    setRelocate(false);
  }

  const handleHideModal = () => {
    clearRelocation();
    props.onClose();
  }

  return (
    <Modal open={props.show} onClose={handleHideModal}>
      <Modal.Header>Update Company Details</Modal.Header>
      <Modal.Content>
        <label>Company Name</label>
        <br />
        <Input
          type='text'
          placeholder='Company Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div style={{ marginTop: '10px' }}>
          {relocate ? (
            <>
              <label>Region</label>
              <div style={{ display: 'flex', columnGap: '10px' }}>
                <Dropdown text={regions.find(r => r._id === location)} value={location} options={regions} selection />
                <Button color='orange' icon='times' onClick={clearRelocation} />
              </div>
            </>
          ) : (
            <Button color='green' content='Relocate?' onClick={() => setRelocate(true)} />
          )}
        </div>
        {!!updateError && (
          <Message
            warning
            visible
            header='Warning'
            content={updateError}
          />
        )}
        {relocate && location !== 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <span>Cost To Relocate:</span>
              <span>10.00 <i className='sot-coin' /></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <span>You have: </span>
            <span>{ user && user.gold.toFixed(2) } <i className='sot-coin' /></span>
            </div>
          </>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button color='blue' content='Update' onClick={handleUpdate} disabled={updateDisabled()} />
        <Button color='red' content='Delete' onClick={handleDelete} />
        <Button content='Cancel' onClick={handleHideModal} />
      </Modal.Actions>
    </Modal>
  );
}
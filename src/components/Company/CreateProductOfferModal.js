import { useState } from 'react';

import { useLoadUser } from '../../context/UserContext';
import { useSetNotification } from '../../context/NotificationContext';
import constants from '../../util/constants';
import SoTApi from '../../services/SoTApi';

import { Button, Dropdown, Input, Modal } from 'semantic-ui-react';

export default function CreateProductOfferModal(props) {
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [sellAmount, setSellAmount] = useState(1);
  const [sellPrice, setSellPrice] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { inventory, compId, setReload } = props;

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

  const getDropdownText = () => {
    let item = getInventoryItems().find(item => item.id === selectedProduct);

    if (item)
      return item.as;
    else
      return selectedProduct;
  }

  const listProduct = () => {
    let payload = {
      action: 'sell_product',
      productOffer: { id: selectedProduct.id, quantity: sellAmount, price: sellPrice },
    };

    SoTApi.doCompAction(compId, payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Product Offer Created', content: 'Product listed for sell' });
        props.onClose();
        loadUser();
        setReload(true);
      }
    });
  }

  return (
    <Modal size='mini' open={props.show} onClose={props.onClose}>
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
        <Button content='Cancel' onClick={props.onClose} />
      </Modal.Actions>
    </Modal>
  );
}
import constants from '../../util/constants';

import { Card, Label, Message, Rating } from 'semantic-ui-react';

export default function Inventory(props) {
  const { inventory } = props;

  return inventory.length > 0 ? (
    <Card.Group itemsPerRow={8}>
      {inventory.map((item, i) => {
        let itemData = constants.ITEMS[item.id];
        
        return (
          <Card key={i} fluid raised style={{ position: 'relative', paddingTop: '10px', paddingBottom: itemData.quality === 0 && '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <i className={itemData.image} />
              <span style={{ textAlign: 'center' }}>{ itemData.label }</span>
            </div>
            <Label attached='top right' size='mini' content={item.quantity} />
            {itemData.quality !== 0 && (
              <Rating icon='star' size='mini' maxRating={5} rating={itemData.quality} disabled />
            )}
          </Card>
        );
      })}
    </Card.Group>
  ) : (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Message
        compact
        info
        header='Inventory Empty'
        content='You have no items in your inventory'
      />
    </div>
  );
}
import { Message } from 'semantic-ui-react';
import { useNotification, useSetNotification } from '../context/NotificationContext';

export default function NotificationDisplay() {
  const notification = useNotification();
  const setNotification = useSetNotification();

  const clearNotification = () => setNotification(undefined);

  return notification ? (
    <div id='notification-wrapper' style={{ position: 'fixed', top: '10%', right: '1%' }}>
      <Message
        floating
        success={notification.type === 'success'}
        info={notification.type === 'info'}
        warning={notification.type === 'warn'}
        error={notification.type === 'error'}
        onDismiss={clearNotification}
        header={notification.header}
        content={notification.content}
      />
    </div>
  ) : (
    <></>
  );
}
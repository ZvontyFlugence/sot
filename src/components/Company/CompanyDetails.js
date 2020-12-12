import { useGetUser, useLoadUser } from '../../context/UserContext';
import { useSetNotification } from '../../context/NotificationContext';
import PrivateDetails from './PrivateDetails';
import PublicDetails from './PublicDetails';

export default function CompanyDetails(props) {
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();

  return props.manageMode ? (
    <PrivateDetails {...props} user={user} loadUser={loadUser} setNotification={setNotification} />
  ) : (
    <PublicDetails {...props} user={user} loadUser={loadUser} setNotification={setNotification} />
  );
};
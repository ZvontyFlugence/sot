import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useGetUser, useLoadUser } from '../../context/UserContext';
import EditCompanyModal from './EditCompanyModal';
import SoTApi from '../../services/SoTApi';
import constants from '../../util/constants';

import { Button, Grid, Image, Segment } from 'semantic-ui-react';

export default function CompanyHeader(props) {
  const { company, manageMode, setManageMode, setReload } = props;
  const type = constants.COMPANY_TYPES[company.type - 1];
  const user = useGetUser();
  const loadUser = useLoadUser();
  const [regionInfo, setRegionInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (company && !regionInfo) {
      SoTApi.getRegion(company.location).then(data => {
        if (data.region) {
          setRegionInfo(data.region);
        }
      });
    }
  });

  const displayWorth = () => {
    return company.gold.toFixed(2);
  }

  return (
    <Segment>
      <Grid>
        <Grid.Column width={3}>
          <Image fluid circular src={company.image} alt='' />
        </Grid.Column>
        <Grid.Column width={12}>
          <Grid>
            <Grid.Column width={16}>
              <h1>{ company.name }</h1>
            </Grid.Column>
            <Grid.Column width={8}>
              {regionInfo && (
                <div>
                  <span>Location: </span>
                  <Link to={`/region/${regionInfo._id}`}>{ regionInfo.name }</Link>
                  <span>, </span>
                  <Link to={`/country/${regionInfo.owner._id}`}>
                    { regionInfo.owner.name }
                    <i
                      className={`flag-icon flag-icon-${regionInfo.owner.flag}`}
                      style={{ float: 'none', marginLeft: '10px', verticalAlign: 'middle' }}
                    />
                  </Link>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <span style={{ marginRight: '1vw', verticalAlign: 'middle' }}>CEO:</span>
                <Link to={`/profile/${company.ceo._id}`} style={{ display: 'flex', alignItems: 'center' }}>
                  <Image src={company.ceo.image} size='tiny' alt='' circular style={{ width: '20%', verticalAlign: 'middle' }} />
                  <span style={{ display: 'flex', marginLeft: '10px' }}>{ company.ceo.displayName }</span>
                </Link>
              </div>
            </Grid.Column>
            <Grid.Column width={8}>
              <span>Company Type: { type.text }&nbsp;<i className={`${type.css}`} /></span>
              <br />
              <span>Employees: { company.employees.length }</span>
              <br />
              <span>Worth: { displayWorth() } <i className='sot-coin' /></span>
            </Grid.Column>
          </Grid>
        </Grid.Column>
        {(user && user._id) === company.ceo._id && (
          <Grid.Column width={1} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button.Group vertical>
              <Button color='blue' icon='pencil' onClick={() => setShowModal(true)} />
              <Button color='blue' icon='sliders' onClick={() => setManageMode(!manageMode)} />
            </Button.Group>
          </Grid.Column>
        )}
      </Grid>
      <EditCompanyModal
        show={showModal}
        onClose={() => setShowModal(false)}
        setReload={setReload}
        user={user}
        company={company}
        loadUser={loadUser}
      />
    </Segment>
  );
};
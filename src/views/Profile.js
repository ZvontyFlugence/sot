import { useEffect, useState } from 'react';

import Layout from '../layout/Layout';
import ProfileActivities from '../components/Profile/ProfileActivities';
import ProfileDetails from '../components/Profile/ProfileDetails';
import ProfileHead from '../components/Profile/ProfileHead';
import SoTApi from '../services/SoTApi';

import { Dimmer, Grid, Loader } from 'semantic-ui-react';

export default function Profile(props) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!profile) {
      SoTApi.getProfile(props.match.params.id)
        .then(data => {
          if (data.profile) {
            setProfile(data.profile);
          }
        });
    }

    if (profile && profile._id !== Number.parseInt(props.match.params.id)) {
      setProfile(null);
    }
  }, [profile, props.match.params.id]);

  return profile ? (
    <Layout>
      <div id='profile'>
        <Grid stackable>
          <Grid.Row>
            <Grid.Column>
              <ProfileHead profile={profile} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column computer={4}>
              <ProfileActivities profile={profile} />
            </Grid.Column>
            <Grid.Column computer={12}>
              <ProfileDetails profile={profile} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    </Layout>
  ) : (
    <Layout>
      <div id='profile'>
        <Dimmer active>
          <Loader indeterminate>Loading...</Loader>
        </Dimmer>
      </div>
    </Layout>
  );
}
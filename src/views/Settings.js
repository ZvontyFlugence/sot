import { useEffect, useRef, useState } from 'react';

import { useGetUser, useLoadUser } from '../context/UserContext';
import { useSetNotification } from '../context/NotificationContext';
import Layout from '../layout/Layout';
import SoTApi from '../services/SoTApi';

import { Button, Grid, Form, Message, Segment } from 'semantic-ui-react';

export default function Settings() {
  const fileUploadRef = useRef();
  const user = useGetUser();
  const loadUser = useLoadUser();
  const setNotification = useSetNotification();
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState(null);

  useEffect(() => {
    if (desc == null && user) {
      setDesc(user.description);
    }
  }, [user, desc]);

  const handleFileChange = e => {
    const targetFile = e.target.files[0];
    setFile(targetFile);
  }

  const handleUpload = async e => {
    e.preventDefault();

    let reader = new FileReader();
    reader.onloadend = () => {
      let base64 = reader.result;
      SoTApi.doAction({ action: 'upload', image: base64 })
        .then(data => {
          if (data.success) {
            setNotification({
              type: 'success',
              header: 'File Uploaded',
              content: 'Profile Picture uploaded'
            });
            loadUser();
          } else {
            setNotification({
              type: 'error',
              header: 'File Upload Failed',
              content: 'Failed to upload profile picture',
            });
          }
        });
    }

    reader.readAsDataURL(file);
  };

  const updateDesc = () => {
    SoTApi.doAction({ action: 'update_desc', desc })
      .then(data => {
        if (data.success) {
          setNotification({
            type: 'success',
            header: 'Description Updated',
            content: 'Your profile description has been updated',
          });
          loadUser();
        }
      });
  };

  return (
    <Layout>
      <div id='settings'>
        <h1>Settings</h1>
        <Grid columns={1}>
          <Grid.Column width={16} style={{ display: 'flex', justifyContent: 'center' }}>
            <Message
              warning
              compact
              header='Go To Your Turmoil Studios Account To Access More Settings'
              content={(
                <span>
                  Some settings can only be accessed through your Turmoil Studios Account.
                  <br />
                  Manage <a href='https://turmoil-studios-dev.herokuapp.com/'>Your Account</a> to view/edit those settings.
                </span>
              )}
            />
          </Grid.Column>
          <Grid.Column width={16}>
            <Segment>
              <h3>Upload Profile Picture:</h3>
              <Form.Input
                type='file'
                accept='image/*'
                ref={fileUploadRef}
                onChange={handleFileChange}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button color='blue' onClick={handleUpload}>Upload</Button>
              </div>
            </Segment>
          </Grid.Column>
          <Grid.Column>
            <Segment>
              <h3>Update Description:</h3>
              <Form.TextArea
                placeholder='Enter Description'
                rows={3}
                cols={75}
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button color='blue' onClick={updateDesc}>Update</Button>
              </div>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    </Layout>
  );
}
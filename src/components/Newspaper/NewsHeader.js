import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useSetNotification } from '../../context/NotificationContext';
import SoTApi from '../../services/SoTApi';

import { Button, Grid, Image, Modal, Segment, Statistic } from "semantic-ui-react";

export default function NewsHeader({ news, user, reload }) {
  const history = useHistory();
  const setNotification = useSetNotification();
  const [author, setAuthor] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (news) {
      SoTApi.getProfile(news.author).then(data => {
        if (data.profile) {
          setAuthor(data.profile);
        }
      });
    }
  }, [news]);

  const goToAuthor = () => {
    history.push(`/profile/${author._id}`);
  }

  const handleSubscribe = () => {
    let payload = {
      action: 'sub_news',
      newsId: news && news._id,
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Subscribed to Newspaper!' });
        reload(true);
      } else {
        setNotification({ type: 'error', header: data.error });
      }
    });
  }

  const handleUnsubscribe = () => {
    let payload = {
      action: 'unsub_news',
      newsId: news && news._id,
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Unsubscribed from Newspaper!' });
        reload(true);
      } else {
        setNotification({ type: 'error', header: data.error });
      }
    });
  }

  const handleEdit = () => {}

  const getSubscribeButton = () => {
    if (!user || !author || user._id === author._id)
      return null;

    if (news.subscribers.includes(user._id)) {
      return <Button color='red' content='Unsubscribe' onClick={handleUnsubscribe} />
    } else {
      return <Button color='blue' content='Subscribe' onClick={handleSubscribe} />
    }
  }

  const editNewspaperModal = (
    <Modal size='tiny' open={showEdit} onClose={() => setShowEdit(false)}>
      <Modal.Header>Edit Newspaper</Modal.Header>
      <Modal.Content>
        {/* TODO (See Edit Company Modal for inspiration) */}
      </Modal.Content>
      <Modal.Actions>
        <Button color='blue' content='Update' onClick={handleEdit} />
        <Button content='Cancel' onClick={() => setShowEdit(false)} />
      </Modal.Actions>
    </Modal>
  )

  return news && (
    <Segment>
      <Grid>
        <Grid.Column width={2}>
          <Image fluid circular src={news.image} alt='' />
        </Grid.Column>
        <Grid.Column width={10}>
          <h1>{ news.name }</h1>
          {
            author && (
              <p className='link' onClick={goToAuthor}>
                Author:&nbsp;
                <Image avatar src={author.image} alt='' />
                { author.displayName }
              </p>
            )
          }
        </Grid.Column>
        <Grid.Column width={3}>
          <Statistic label='Subscribers' value={news.subscribers.length} />
          { getSubscribeButton() }
        </Grid.Column>
        <Grid.Column width={1}>
          <Button compact color='blue' icon='cog' onClick={() => setShowEdit(true)} />
        </Grid.Column>
      </Grid>
      { editNewspaperModal }
    </Segment>
  );
}
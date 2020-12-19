import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';

import { useSetNotification } from '../../context/NotificationContext';
import SoTApi from '../../services/SoTApi';

import { Button, Icon, Image, Item, Label, Segment } from 'semantic-ui-react';

export default function ArticleHead({ news, article, reload }) {
  const history = useHistory();
  const setNotification = useSetNotification();

  const handleLike = () => {
    let payload = {
      action: 'like_article',
      newsId: news && news._id,
      articleId: article && article.id,
    };

    SoTApi.doAction(payload).then(data => {
      if (data.success) {
        setNotification({ type: 'success', header: 'Article Liked' });
        reload(true);
      } else {
        setNotification({ type: 'error', header: data.error });
      }
    });
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
    })
  }

  return article && news && (
    <Segment style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Item>          
          <Item.Content>
            <Item.Header style={{ fontWeight: 'bold', fontSize: '2.0rem' }}>{ article.title }</Item.Header>
            <Item.Meta style={{ marginTop: '10px' }}>
              Published on: { format(new Date(article.publishDate), 'LL/dd/yyyy') }
            </Item.Meta>
            <Item.Description style={{ marginTop: '10px' }}>
              <Label className='link' image onClick={() => history.push(`/newspaper/${news._id}`)}>
                <Image src={news.image} alt='' />
                { news.name }
              </Label>
            </Item.Description>
          </Item.Content>
        </Item>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button as='div' compact labelPosition='left' style={{ display: 'flex', justifyContent: 'flex-end'}}>
          <Label as='a' basic color='red' pointing='right'>
            { (article.likes && article.likes.length) || 0}
          </Label>
          <Button compact color='red' onClick={handleLike}>
            <Icon name='heart' />
            Like
          </Button>          
        </Button>
        <Button as='div' compact labelPosition='left' style={{ display: 'flex', justifyContent: 'flex-end'}}>
          <Label as='a' basic color='blue' pointing='right'>
            { news.subscribers.length || 0}
          </Label>
          <Button compact color='blue' onClick={handleSubscribe}>
            <Icon name='feed' />
            Subscribe
          </Button>
        </Button>
      </div>
    </Segment>
  );
}
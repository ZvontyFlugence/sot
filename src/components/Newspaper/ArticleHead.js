import { useHistory } from 'react-router-dom';

import { Button, Icon, Image, Item, Label, Segment } from 'semantic-ui-react';

export default function ArticleHead({ news, article }) {
  const history = useHistory();

  const handleLike = () => {}

  const handleSubsribe = () => {}

  return article && news && (
    <Segment style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Item>          
          <Item.Content>
            <Item.Header style={{ fontWeight: 'bold', fontSize: '2.0rem' }}>{ article.title }</Item.Header>
            <Item.Meta style={{ marginTop: '10px' }}>
              Published on: {article.publishDate || 'XX-XXX-XXXX'}
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
          <Button compact color='red'>
            <Icon name='heart' />
            Like
          </Button>          
        </Button>
        <Button as='div' compact labelPosition='left' style={{ display: 'flex', justifyContent: 'flex-end'}}>
          <Label as='a' basic color='blue' pointing='right'>
            { news.subscribers.length || 0}
          </Label>
          <Button compact color='blue'>
            <Icon name='feed' />
            Subscribe
          </Button>
        </Button>
      </div>
    </Segment>
  );
}
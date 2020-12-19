import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';

import { useGetUser } from '../../context/UserContext';
import SoTApi from '../../services/SoTApi';

import { Grid, List, Image, Segment, Statistic, Message } from 'semantic-ui-react';

export default function News() {
  const history = useHistory();
  const user = useGetUser();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    if (user && user.country) {
      SoTApi.getCountryArticles(user.country).then(data => {
        if (data.articles) {
          setArticles(data.articles)
        }
      });
    }
  }, [user]);

  const goToArticle = (publisherId, articleId) => {
    history.push(`/newspaper/${publisherId}/article/${articleId}`);
  }

  return (
    <Segment raised>
      <Grid>
        <Grid.Row style={{ paddingLeft: '10%' }}>
          <span style={{ fontSize: '1.5rem' }}>News</span>
        </Grid.Row>
        <Grid.Column width={16} style={{ marginTop: 0, paddingTop: 0 }}>
          {
            articles.length > 0 ? (
              <List divided relaxed selection verticalAlign='middle'>
                {
                  articles.map((article, idx) => (
                    <List.Item key={idx} onClick={() => goToArticle(article.publisher._id, article.id)}>
                      <List.Content floated='right'>
                        <Statistic label='Likes' value={article.likes.length} size='tiny' />
                      </List.Content>
                      <Image avatar src={article.publisher.image} />
                      <List.Content>
                        <List.Header>{ article.title }</List.Header>
                        <List.Description>
                          { format(new Date(article.publishDate), 'LL/dd/yyyy') }
                        </List.Description>
                        { article.publisher.name }
                      </List.Content>
                    </List.Item>
                  ))
                }
              </List>
            ) : (
              <Message info visible header='No Country Articles' />
            )
          }
        </Grid.Column>
      </Grid>
    </Segment>
  );
}
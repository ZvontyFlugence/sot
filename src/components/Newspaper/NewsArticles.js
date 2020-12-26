import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';

import { Button, Grid, List, Message, Pagination, Segment } from 'semantic-ui-react';

const ARTICLES_PER_PAGE = 10;

export default function NewsArticles({ news }) {
  const history = useHistory();
  const [page, setPage] = useState(0);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    if (news) {
      let endIndex = page !== 0 ?
        Math.min(page * ARTICLES_PER_PAGE, news.articles.length) :
        Math.min(1, news.articles.length);
      let pageArticles = news.articles.slice(page, endIndex);
      pageArticles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
      setArticles([...pageArticles]);
    }
  }, [news, page]);

  const getTotalPages = () => {
    if (news.articles.length % ARTICLES_PER_PAGE === 0) {
      return news.articles.length / ARTICLES_PER_PAGE;
    } else {
      return (news.articles.length / ARTICLES_PER_PAGE) + 1;
    }
  }

  return news && (
    <Segment>
      <Grid>
        <Grid.Column width={16} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3><strong>Articles</strong></h3>
          <Button
            size='tiny'
            icon='edit outline'
            color='green'
            content='Write Article'
            onClick={() => history.push(`/newspaper/${news._id}/write`)}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          {
            articles && articles.length > 0 ? (
              <List divided relaxed>
                {
                  articles.map((article, idx) => (
                    <List.Item key={idx}>
                      <List.Content floated='right'>
                        <span><strong>{ (article.likes && article.likes.length) || 0 } LIKES</strong></span>
                      </List.Content>
                      <List.Content className='link' onClick={() => history.push(`/newspaper/${news._id}/article/${article._id}`)}>
                        <List.Header>
                          { article.title }
                          {
                            !article.published && (
                              <span style={{ marginLeft: '10px', color: 'red' }}>DRAFT</span>
                            )
                          }
                        </List.Header>
                        {
                          article.published && (
                            <List.Description>{ format(new Date(article.publishDate), 'LL/dd/yyyy') }</List.Description>
                          )
                        }
                      </List.Content>
                    </List.Item>
                  ))
                }
              </List>
            ) : (
              <Message
                info
                header='No Articles'
                content='This newspaper has no articles'
              />
            )
          }
          {
            news.articles.length > 10 && (
              <Pagination
                activePage={page + 1}
                onPageChange={(_, { activePage }) => setPage(activePage - 1)}
                totalPages={getTotalPages()}
              />
            )
          }
        </Grid.Column>
      </Grid>      
    </Segment>
  );
}
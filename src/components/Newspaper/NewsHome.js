import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGetUser } from '../../context/UserContext';
import NewsHeader from './NewsHeader';
import NewsArticles from './NewsArticles';
import SoTApi from '../../services/SoTApi';

import { Grid } from "semantic-ui-react";

export default function NewsHome(props) {
  // const id = props.match.params.id;
  const { id } = useParams();
  console.log('ID:', id);
  const user = useGetUser();
  const [news, setNews] = useState(null);

  useEffect(() => {
    if (!news) {
      SoTApi.getNewspaper(id).then(data => {
        if (data.news) {
          setNews(data.news);
        }
      });
    }
  }, [id, news]);

  return (
    <>
      <Grid>
        <Grid.Column width={16}>
          <NewsHeader news={news} user={user} />
        </Grid.Column>
        <Grid.Column width={16}>
          <NewsArticles news={news} />
        </Grid.Column>
      </Grid>
    </>
  );
}
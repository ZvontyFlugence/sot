import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGetUser } from '../../context/UserContext';
import NewsHeader from './NewsHeader';
import NewsArticles from './NewsArticles';
import SoTApi from '../../services/SoTApi';

import { Grid } from "semantic-ui-react";

export default function NewsHome() {
  const { id } = useParams();
  const user = useGetUser();
  const [news, setNews] = useState(null);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    if (reload) {
      if (!news) {
        SoTApi.getNewspaper(id).then(data => {
          if (data.news) {
            setNews(data.news);
          }
        });
      }
    }
  }, [reload, news, id]);

  return (
    <>
      <Grid>
        <Grid.Column width={16}>
          <NewsHeader news={news} user={user} reload={setReload} />
        </Grid.Column>
        <Grid.Column width={16}>
          <NewsArticles news={news} />
        </Grid.Column>
      </Grid>
    </>
  );
}
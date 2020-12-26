import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import ArticleHead from './ArticleHead';
import ArticleBody from './ArticleBody';
import SoTApi from '../../services/SoTApi';

export default function Article() {
  const history = useHistory();
  const { newsId, articleId } = useParams();
  const [newspaper, setNewspaper] = useState(null);
  const [article, setArticle] = useState(null);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    if (reload) {
      if (newsId && articleId) {
        SoTApi.getArticle(newsId, articleId)
          .then(data => {
            if (data.article) {
              if (!data.article.published) {
                history.push(`/newspaper/${newsId}/article/${articleId}/edit`);
              }
              setArticle(data.article);
              setNewspaper(data.newspaper);
            }
            setReload(false);
          });        
      }
    }
  }, [newsId, articleId, history, reload]);

  return article && article.published && (
    <>
      <ArticleHead news={newspaper} article={article} reload={(bool) => setReload(bool)} />
      <ArticleBody article={article} />
    </>
  );
}
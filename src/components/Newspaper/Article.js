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

  useEffect(() => {
    if (newsId && articleId) {
      SoTApi.getArticle(newsId, articleId)
        .then(data => {
          if (data.article) {
            if (!data.article.published) {
              history.push(`/newspaper/${newsId}/article/${articleId}/edit`);
            }
            setArticle(data.article);
          }
        });
      
      SoTApi.getNewspaper(newsId).then(data => {
        if (data.news) {
          setNewspaper(data.news);
        }
      });
    }
  }, [newsId, articleId, history]);

  return article && article.published && (
    <>
      <ArticleHead news={newspaper} article={article} />
      <ArticleBody article={article} />
    </>
  );
}
import { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';

import ArticleHead from './ArticleHead';
import ArticleBody from './ArticleBody';
import SoTApi from '../../services/SoTApi';

export default function Article(props) {
  const newsId = props.match.params.newsId;
  const articleId = props.match.params.articleId;
  const [newspaper, setNewspaper] = useState(null);
  const [article, setArticle] = useState(null);

  useEffect(() => {
    if (newsId && articleId) {
      SoTApi.getArticle(newsId, articleId)
        .then(data => {
          if (data.article) {
            setArticle(data.article);
          }
        });
      
      SoTApi.getNewspaper(newsId).then(data => {
        if (data.news) {
          setNewspaper(data.news);
        }
      });
    }
  }, [newsId, articleId]);

  return article && article.published ? (
    <>
      <ArticleHead news={newspaper} article={article} />
      <ArticleBody article={article} />
    </>
  ) : (
    <Redirect to={`/newspaper/${newspaper && newspaper._id}/article/${article.id}/edit`} />
  );
}
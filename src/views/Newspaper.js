import { Switch, Route } from 'react-router-dom';

import Article from '../components/Newspaper/Article';
import CreateNewspaper from '../components/Newspaper/CreateNewspaper';
import EditArticle from '../components/Newspaper/EditArticle';
import NewsHome from '../components/Newspaper/NewsHome';
import WriteArticle from '../components/Newspaper/WriteArticle';
import Layout from '../layout/Layout';

export default function Newspaper() {
  return (
    <Layout>
      <div id='newspaper'>
        <Switch>
          <Route exact path='/newspaper' component={CreateNewspaper} />
          <Route exact path='/newspaper/:id' component={NewsHome} />
          <Route path='/newspaper/:id/write' component={WriteArticle} />
          <Route exact path='/newspaper/:newsId/article/:articleId' component={Article} />
          <Route path='/newspaper/:newsId/article/:articleId/edit' component={EditArticle} />  
        </Switch>
      </div>
    </Layout>
  );
}
import { Switch, Route } from 'react-router-dom';

import Exchange from '../components/Markets/Exchange';
import GoodsMarket from '../components/Markets/GoodsMarket';
import JobsMarket from '../components/Markets/JobsMarket';
import Layout from '../layout/Layout';

export default function Market() {
  return (
    <Layout>
      <div id='market'>
        <Switch>
          <Route path='/market/goods' component={GoodsMarket} />
          <Route path='/market/jobs' component={JobsMarket} />
          <Route path='/market/exchange' component={Exchange} />
        </Switch>
      </div>
    </Layout>
  );
}
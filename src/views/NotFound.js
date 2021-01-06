import { useHistory } from 'react-router-dom';

import { Button } from 'semantic-ui-react';

export default function NotFound() {
  const history = useHistory();

  return (
    <div id='404NotFound' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, flexDirection: 'column', paddingTop: '10vh' }}>
      <div>
        <img src='/SoT.svg' alt='' height={300} />
      </div>
      <div>
        <h1>Error: Page Not Found</h1>
        <p>The page you were looking for seems to not exist</p>
      </div>
      <div>
        <Button color='blue' content='Go Back' onClick={() => history.goBack()} />
      </div>
    </div>
  );
}
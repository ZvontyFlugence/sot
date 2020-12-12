import {
  Grid,
  Header,
  Image
} from 'semantic-ui-react';

import logo from '../images/SoT.svg';
import TopCountries from '../components/Homepage/TopCountries';

export default function Homepage() {
  return (
    <Grid id='homepage' centered>
      <Grid.Row>
        <Grid.Column width={2}>
          <Image src={logo} />
        </Grid.Column>
        <Grid.Column width={16} textAlign='center'>
          <Header as='h1'>State of Turmoil</Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={4}>
          <TopCountries />
        </Grid.Column>
        <Grid.Column width={4}>
          
        </Grid.Column>
        <Grid.Column width={4}>
          
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

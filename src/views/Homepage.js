import {
  Grid,
  Header,
  Image
} from 'semantic-ui-react';

import logo from '../images/SoT.svg';
import TopCountries from '../components/Homepage/TopCountries';
import TopCitizens from '../components/Homepage/TopCitizens';
import Features from '../components/Homepage/Features';

export default function Homepage() {
  return (
    <Grid id='homepage' stackable centered>
      <Grid.Row>
        <Grid.Column width={2}>
          <Image src={logo} />
        </Grid.Column>
        <Grid.Column width={16} textAlign='center'>
          <Header as='h1'>State of Turmoil</Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column mobile={16} computer={4}>
          <TopCountries />
        </Grid.Column>
        <Grid.Column mobile={16} computer={4}>
          <Features />
        </Grid.Column>
        <Grid.Column mobile={16} computer={4}>
          <TopCitizens />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

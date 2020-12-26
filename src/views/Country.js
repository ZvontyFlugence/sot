import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import CountryHead from '../components/Country/CountryHead';
import CountryBody from '../components/Country/CountryBody';
import Layout from '../layout/Layout';

import { Segment } from 'semantic-ui-react';
import SoTApi from '../services/SoTApi';

export default function Country() {
  const { id } = useParams();
  const [country, setCountry] = useState(null);

  useEffect(() => {
    if (!country) {
      SoTApi.getCountry(id).then(data => {
        if (data.country) {
          setCountry(data.country);
        }
      });
    }
  }, [id, country]);

  return country && (
    <Layout>
      <div id='country'>
        <Segment>
          <CountryHead country={country} />
        </Segment>
        <CountryBody country={country} />
      </div>
    </Layout>
  );
}
import { useEffect, useState } from 'react';

import Layout from '../layout/Layout';
import CompanyDetails from '../components/Company/CompanyDetails';
import CompanyHeader from '../components/Company/CompanyHeader';
import SoTApi from '../services/SoTApi';

import { Dimmer, Grid, Loader } from 'semantic-ui-react';

export default function Company(props) {
  const id = props.match.params.id;
  const [company, setCompany] = useState(null);
  const [manageMode, setManageMode] = useState(false);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    if (reload) {
      SoTApi.getCompany(id).then(data => {
        if (data.company) {
          setCompany(data.company);
          setReload(false);
        }
      });
    }
  }, [id, reload]);

  return (
    <Layout>
      <div id='company'>
        {company ? (
          <Grid columns={2}>
            <Grid.Column width={16}>
              <CompanyHeader
                company={company}
                manageMode={manageMode}
                setManageMode={setManageMode}
                setReload={bool => setReload(bool)}
              />
            </Grid.Column>
            <Grid.Column width={16}>
              <CompanyDetails
                compId={company._id}
                compName={company.name}
                ceo={company.ceo}
                inventory={company.inventory}
                funds={company.funds}
                gold={company.gold}
                productOffers={company.productOffers}
                jobOffers={company.jobOffers}
                employees={company.employees}
                manageMode={manageMode}
                setReload={bool => setReload(bool)}
              />
            </Grid.Column>
          </Grid>
        ) : (
          <Dimmer active>
            <Loader indeterminate />
          </Dimmer>
        )}
      </div>
    </Layout>
  );
};
import { useEffect, useState } from 'react';

import SoTApi from '../../services/SoTApi';

import { Accordion, Card, Icon, Image } from 'semantic-ui-react';

export default function ProfileActivities(props) {
  const { profile } = props;
  const [job, setJob] = useState(null);
  const [newspaper, setNewspaper] = useState(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (profile && profile.job > 0) {
      SoTApi.getCompany(profile.job).then(data => {
        if (data.company) {
          setJob(data.company);
        }
      });
    }

    if (profile && profile.newspaper > 0) {
      SoTApi.getNewspaper(profile.newspaper).then(data => {
        if (data.news) {
          setNewspaper(data.news);
        }
      });
    }
  }, [profile])

  const getJoinDate = () => {
    let date = new Date(profile.createdOn);
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();

    return `${month}/${day}/${year}`;
  };

  const handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const newIndex = active === index ? -1 : index;
    setActive(newIndex);
  }

  const party = profile.party > 0 && (
    <>
      <Accordion.Title
        style={{ textAlign: 'left' }}
        active={active === 0}
        index={0}
        onClick={handleClick}
      >
        <Icon name='dropdown' />
        Party
      </Accordion.Title>
      <Accordion.Content active={active === 0}>

      </Accordion.Content>
    </>
  );

  const unit = profile.unit > 0 && (
    <>
      <Accordion.Title
        style={{ textAlign: 'left' }}
        active={active === 1}
        index={1}
        onClick={handleClick}
      >
        <Icon name='dropdown' />
        Army
      </Accordion.Title>
      <Accordion.Content active={active === 1}>

      </Accordion.Content>
    </>
  );

  const news = profile.newspaper > 0 && (
    <>
      <Accordion.Title
        style={{ textAlign: 'left' }}
        active={active === 2}
        index={2}
        onClick={handleClick}
      >
        <Icon name='dropdown' />
        Newspaper
      </Accordion.Title>
      <Accordion.Content active={active === 2}>
        {
          newspaper && (
            <div>
              { newspaper.name }
              <Image src={newspaper.image} alt='' size='tiny' />
              <br />
              {
                newspaper.author === profile._id ? 'Author' : 'Staff'
              }
            </div>
          )
        }
      </Accordion.Content>
    </>
  );

  const work = profile.job > 0 && (
    <>
      <Accordion.Title
        style={{ textAlign: 'left' }}
        active={active === 3}
        index={3}
        onClick={handleClick}
      >
        <Icon name='dropdown' />
        Job
      </Accordion.Title>
      <Accordion.Content active={active === 3}>
      {
        job && (
          <div>
            { job.name }
            <Image src={job.image} alt='' size='tiny' />
            <br />
            {
              job.ceo._id === profile._id ? 'CEO' : job.employees.find(emp => emp.userId === profile._id).title
            }
          </div>
        )
      }
      </Accordion.Content>
    </>
  );

  return (
    <Card style={{ textAlign: 'center' }}>
      <Card.Content>
        <Card.Header>Activities</Card.Header>
      </Card.Content>
      <Card.Content>
          <Accordion fluid styled>
            { party }
            { unit }
            { news }
            { work }
          </Accordion>
      </Card.Content>
      <Card.Content>
        <span>
          Joined on: { getJoinDate() }
        </span>
      </Card.Content>
    </Card>
  );
}
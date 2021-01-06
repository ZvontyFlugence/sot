/*global google*/
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useSetNotification } from '../context/NotificationContext';
import Layout from '../layout/Layout';
import { pSBC } from '../util/config';
import constants from '../util/constants';
import SoTApi from '../services/SoTApi';

import { Button, Segment } from 'semantic-ui-react';
import { GMap } from 'primereact/gmap';

export default function World() {
  const history = useHistory();
  const setNotification = useSetNotification();
  const [mode, setMode] = useState('political');
  const [overlays, setOverlays] = useState([]);

  const options = {
    center: {
      lat: 37.72886323155891,
      lng: -97.86977002071538,
    },
    zoom: 4,
    disableDefaultUI: true,
    styles: constants.MAP_STYLE,
  };

  const getResource = value => {
    let resource = constants.RESOURCES[value];

    if (resource.css) {
      return (
        <span style={{ float: 'right' }}>
          { resource.quality } { resource.label }
          <i className={resource.css} style={{ marginLeft: '10px', verticalAlign: 'middle' }} />
        </span>
      );
    } else {
      return <span style={{ float: 'right' }}>{ resource.label }</span>;
    }
  }

  const displayRegionInfo = region => {
    setNotification({
      type: 'info',
      header: (
        <span style={{ fontSize: '1.25rem' }}>
          { region.name }
          &nbsp;
          <i className={`flag-icon flag-icon-${region.owner.flag_code}`} />
        </span>
      ),
      content: (
        <div style={{ margin: '0 auto' }}>
          <p>
            Core
            <span style={{ float: 'right' }}>
              { region.owner.nick }
              &nbsp;
              <i className={`flag-icon flag-icon-${region.owner.flag_code}`} />
            </span>                      
          </p>
          <p>
            Resource: { getResource(region.resource) }
          </p>
        </div>
      ),
    });
  }

  const getResourceColor = resource => {
    switch (resource) {
      case 1:
      case 2:
      case 3:
        return '#ffd500';
      case 4:
      case 5:
      case 6:
        return '#d6d6d6';
      case 7:
      case 8:
      case 9:
        return '#4d4c4c';
      case 10:
      case 11:
      case 12:
        return '#bbeb1e';
      case 13:
      case 14:
      case 15:
        return '#a2bfdb';
      case 16:
      case 17:
      case 18:
        return '#81888f';
      default:
        return '#ffffff';
    }
  }

  useEffect(() => {
    const getRegionColor = region => {
      switch (mode) {
        case 'resources':
          return getResourceColor(region.resource);
        case 'political':
        default:
          return region.owner.color;
      }
    }

    if (mode) {
      SoTApi.getMapRegions().then(data => {
        if (data.regions) {
          setOverlays(data.regions.map(region => {
            let paths = [];
            if (!region.type) {
              paths = region.borders.map(path => ({ lat: path.lng, lng: path.lat }));
            } else {
              paths = region.borders.map(geom => {
                return geom.map(path => ({ lat: path.lng, lng: path.lat }));
              });
            }
            const color = getRegionColor(region);
            let polygon = new google.maps.Polygon({ paths, strokeWeight: 1, fillColor: color, fillOpacity: 0.9 });
            polygon.addListener('click', () => history.push(`/region/${region._id}`));
            polygon.addListener('mouseover', () => {
              displayRegionInfo(region);

              // Highlight
              polygon.setOptions({ fillColor: pSBC(0.3, color) });

            });
            polygon.addListener('mouseout', () => {
              setNotification(undefined);
              polygon.setOptions({ fillColor: color });
            });
            return polygon;
          }));
        }
      });
    }
  }, [mode]);

  return (
    <Layout>
      <div id='world'>
        <h1>World Map</h1>
        <Segment>
          <Button compact color='green' size='tiny' content='Political' onClick={() => setMode('political')} />
          <Button compact color='green' size='tiny' content='Resources' onClick={()=> setMode('resources')} />
        </Segment>
        <div>
          <GMap
            overlays={overlays}
            options={options}
            style={{ width: '100%', minHeight: '500px' }}
          />
        </div>
      </div>
    </Layout>
  );
}

/*global google*/
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useSetNotification } from '../context/NotificationContext';
import Layout from '../layout/Layout';
import constants from '../util/constants';
import SoTApi from '../services/SoTApi';

import { GMap } from 'primereact/gmap';

export default function World() {
  const history = useHistory();
  const setNotification = useSetNotification();
  const [overlays, setOverlays] = useState([]);
  const [gmapReady, setGMapReady] = useState(false);

  useEffect(() => {
    if (!gmapReady) {
      loadGoogleMaps(() => {
        setGMapReady(true);
      });
    }
  });

  const getResource = value => {
    let resource = constants.RESOURCES[value];

    if (resource.css) {
      return (
        <span style={{ float: 'right' }}>
          { resource.label }
          <i className={resource.css} style={{ marginLeft: '10px', verticalAlign: 'middle' }} />
        </span>
      );
    } else {
      return <span style={{ float: 'right' }}>{ resource.label }</span>;
    }
  }

  const loadGoogleMaps = callback => {
    const existingScript = document.getElementById('googleMaps');

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GMAP_KEY}`;
      script.id = 'googleMaps';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (callback) callback();
      };
    }

    if (existingScript && callback) callback();
  };

  const options = {
    center: {
      lat: 37.72886323155891,
      lng: -97.86977002071538,
    },
    zoom: 4,
    disableDefaultUI: true,
    styles: constants.MAP_STYLE,
  };

  const onMapReady = e => {
    if (overlays.length === 0) {
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
            let polygon = new google.maps.Polygon({ paths, strokeWeight: 1, fillColor: region.owner.color, fillOpacity: 0.9 });
            polygon.addListener('click', () => history.push(`/region/${region._id}`));
            polygon.addListener('mouseover', () => {
              // display notification
              setNotification({
                type: 'info',
                header: (
                  <span>
                    { region.name }
                    &nbsp;
                    <i className={`flag-icon flag-icon-${region.owner.flag_code}`} style={{ float: 'right', boxShadow: 'none' }} />
                  </span>
                ),
                content: (
                  <div style={{ margin: '0 auto' }}>
                    <p>
                      Core <i className={`flag-icon flag-icon-${region.owner.flag_code}`} style={{ boxShadow: 'none' }} />
                    </p>
                    <p>
                      Resource: { getResource(region.resource) }
                    </p>
                  </div>
                ),
              });
            });
            polygon.addListener('mouseout', () => {
              // remove notification
              setNotification(undefined);
            });
            return polygon;
          }));
        }
      });
    }
  }

  return (
    <Layout>
      <div id='world'>
        <h1>World Map</h1>
        <div>
          {
            gmapReady && <GMap overlays={overlays} options={options} onMapReady={onMapReady} style={{ width: '100%', minHeight: '500px' }} />
          }
        </div>
      </div>
    </Layout>
  );
}

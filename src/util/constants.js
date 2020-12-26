const constants = {
  CITIZEN_RANKINGS: [
    { label: 'Experience', value: 'xp' },
    { label: 'Strength', value: 'strength' },
  ],
  COUNTRY_RANKINGS: [
    { label: 'Population', value: 'population' },
  ],
  RESOURCES: [
    { label: 'None', value: 0 },
    { label: 'Wheat', value: 1, css: 'sot-wheat', quality: 'Low' },
    { label: 'Wheat', value: 2, css: 'sot-wheat', quality: 'Medium' },
    { label: 'Wheat', value: 3, css: 'sot-wheat', quality: 'High' },
    { label: 'Iron', value: 4, css: 'sot-iron', quality: 'Low' },
    { label: 'Iron', value: 5, css: 'sot-iron', quality: 'Medium' },
    { label: 'Iron', value: 6, css: 'sot-iron', quality: 'High' },
    { label: 'Oil', value: 7, css: 'sot-oil', quality: 'Low' },
    { label: 'Oil', value: 8, css: 'sot-oil', quality: 'Medium' },
    { label: 'Oil', value: 9, css: 'sot-oil', quality: 'High' },
    { label: 'Uranium', value: 10, css: 'sot-uranium', quality: 'Low' },
    { label: 'Uranium', value: 11, css: 'sot-uranium', quality: 'Medium' },
    { label: 'Uranium', value: 12, css: 'sot-uranium', quality: 'High' },
    { label: 'Aluminum', value: 13, css: 'sot-aluminum', quality: 'Low' },
    { label: 'Aluminum', value: 14, css: 'sot-aluminum', quality: 'Medium' },
    { label: 'Aluminum', value: 15, css: 'sot-aluminum', quality: 'High' },
    { label: 'Steel', value: 16, css: 'sot-steel', quality: 'Low' },
    { label: 'Steel', value: 17, css: 'sot-steel', quality: 'Medium' },
    { label: 'Steel', value: 18, css: 'sot-steel', quality: 'High' },
  ],
  ITEMS: [
    { id: 0, label: 'Iron', quality: 0, image: 'sot-iron' },
    { id: 1, label: 'Wheat', quality: 0, image: 'sot-wheat' },
    { id: 2, label: 'Bread', quality: 1, image: 'sot-bread' },
    { id: 3, label: 'Bread', quality: 2, image: 'sot-bread' },
    { id: 4, label: 'Bread', quality: 3, image: 'sot-bread' },
    { id: 5, label: 'Bread', quality: 4, image: 'sot-bread' },
    { id: 6, label: 'Bread', quality: 5, image: 'sot-bread' },
  ],
  COMPANY_TYPES: [
    { text: 'Wheat', value: 1, item: 1, css: 'sot-wheat' },
    { text: 'Iron', value: 2, item: 0, css: 'sot-iron' },
    { text: 'Bread', value: 3, item: 2, css: 'sot-bread' },
  ],
  PARTY_SOCIAL_VIEWS: [
    { key: 'auth', value: 'Authoritarian', text: 'Authoritarian' },
    { key: 'moderate', value: 'Moderate', text: 'Moderate' },
    { key: 'lib', value: 'Libertarian', text: 'Libertarian' },
  ],
  PARTY_ECONOMIC_VIEWS: [
    { key: 'flw', value: 'Far Left', text: 'Far Left' },
    { key: 'lw', value: 'Left', text: 'Left' },
    { key: 'clw', value: 'Center Left', text: 'Center Left' },
    { key: 'c', value: 'Centrist', text: 'Centrist' },
    { key: 'crw', value: 'Center Right', text: 'Center Right' },
    { key: 'rw', value: 'Right', text: 'Right' },
    { key: 'frw', value: 'Far Right', text: 'Far Right' },
  ],
  CURRENCY_IMAGE: {
      'Gold': 'sot-coin',
      'USD': 'flag-icon flag-icon-us',
  },
  MAP_STYLE: [
    {
        "featureType": "all",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "lightness": "-100"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "saturation": 36
            },
            {
                "color": "#000000"
            },
            {
                "lightness": 40
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#000000"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 17
            },
            {
                "weight": 1.2
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 21
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 17
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 29
            },
            {
                "weight": 0.2
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 18
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 19
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 17
            }
        ]
    }
  ],
};

export default constants;
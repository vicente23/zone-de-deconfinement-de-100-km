// Add the map
mapboxgl.accessToken = 'pk.eyJ1IjoidmljZW50ZTIzIiwiYSI6ImNqZTN6M2xueTY0engyeXAyazZsc2I4YXoifQ.bsCjmMr5GNd5A7POOaS_pw'; // Ajout d'un token
const map = new mapboxgl.Map({
  container: 'map', // container id (déclaré dans le fichier html)
  style: 'mapbox://styles/mapbox/outdoors-v11', // stylesheet location
  center: [2.6, 46.33], // starting position [lng, lat]
  zoom: 5, // starting zoom
  minZoom: 3, // zoom minimum
  maxZoom: 24, // zoom maximum
  pitch: 0, // Inclinaison
  bearing: 0, // Rotation
  attributionControl: 'Test',
  locale: {
    'NavigationControl.ZoomIn': 'Zoomer',
    'NavigationControl.ZoomOut': 'Dézoomer',
    'NavigationControl.ResetBearing': 'Orienter vers le nord',
    'GeolocateControl.FindMyLocation': 'Trouver ma localisation',
    'GeolocateControl.LocationNotAvailable': 'Localisation non disponible'
  }
});


// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());


// Change the background map
var layerList = document.getElementById('dropdown-menu'); // Récupération des éléments par id dans la div dropdown-menu
var inputs = layerList.getElementsByTagName('input'); // Récupération des éléments par nom 

function switchLayer(layer) {
  var layerId = layer.target.id;
  map.setStyle('mapbox://styles/mapbox/' + layerId);
};

for (var i = 0; i < inputs.length; i++) {
  inputs[i].onclick = switchLayer;
};


// Géocodeur addition
var geocoder = new MapboxGeocoder({ // Initialize the geocoder
  accessToken: mapboxgl.accessToken, // Set the access token
  placeholder: 'Rechercher une adresse',
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  marker: false, // Do not use the default marker style
});

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));


// Geocoding and isochrone
map.on('load', function () {

  // Essai de suppression d'un point de géolocalisation déjà existant
  try {
    map.removeLayer('point');
    map.removeSource('point');
  } catch (e) {};
  
  // Source du point de l'adresse géolocalisée
  map.addSource('single-point', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });
  
  // Ajout du point de l'adresse géolocalisée
  map.addLayer({
    id: 'point',
    source: 'single-point',
    type: 'circle',
    paint: {
      'circle-radius': 4,
      'circle-color': '#FF0000'
    },
  });


  // Géolocalisation d'une adresse
  geocoder.on('result', function (e) {
    map.getSource('single-point').setData(e.result.geometry);

    // Longitude et Latitude du poitn géolocalisé
    var lon = e.result.geometry.coordinates[0];
    var lat = e.result.geometry.coordinates[1];

    // Turf buffer 100 km autour du point de l'adresse géolocalisée
    var point = turf.point([lon, lat]);
    var buffered = turf.buffer(point, 144, {units: 'kilometers'});

    // buff = turf.featureCollection([buffered]);
    // console.log(buffered);
    // console.log(buffered.geometry);
    // console.log(buffered.geometry.coordinates[0]);

    // Suppression d'un buffer déjà existant
    try {
      map.removeLayer('buffer_100kmLayer');
      map.removeSource('buffer_100km');
    } catch (e) {
  
    };

    // Source du buffer
    map.addSource('buffer_100km', {
      type: 'geojson',
      data: {
        "type": 'FeatureCollection',
        "features": []
      }
    });

    // Ajout des coordonnées du buffer 
    map.getSource('buffer_100km').setData(buffered.geometry);

    // Ajout du buffer
    map.addLayer({
      'id': 'buffer_100kmLayer',
      'type': 'fill',
      'source': 'buffer_100km',
      'layout': {},
      'paint': {
        'fill-color': '#5a3fc0',
        'fill-opacity': 0.3
      }
    }, "poi-label");

    // Zoom sur la bounding box
    var bounds = turf.bbox(buffered.geometry);
    // console.log(bounds);
    map.fitBounds(bounds, {zoom:7});
      
    

  });
});


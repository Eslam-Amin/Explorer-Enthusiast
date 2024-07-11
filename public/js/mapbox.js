/* eslint-disable */

const locations = JSON.parse(document.getElementById("map").dataset.locations);
mapboxgl.accessToken = 'pk.eyJ1IjoiZXNsYW1hbWluIiwiYSI6ImNsd3Q1YzRnajAwNGUybnF6a2Vjc21sejYifQ.Lic6bZO33QnrcDzjQQrqZg';
var map = new mapboxgl.Map({
    container: 'map',
    // style: 'mapbox://styles/eslamamin/clx00dosn01ka01r0098sb2zc'
    // style: 'mapbox://styles/eslamamin/clx00h2t401a101qs71o49iu5'
    style: 'mapbox://styles/eslamamin/clx00j4sk01mz01qsfz9yfqbi',
    scrollZoom: false
    //center: [-118.11349, 34.111745],
    // zoom: 12,

})

const bounds = new mapboxgl.LngLatBounds();
locations.forEach(loc => {
    //Create Marker
    const el = document.createElement('div');
    el.className = 'marker'
    //Add Narker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    })
        .setLngLat(loc.coordinates)
        .addTo(map)


    //Add Popup
    new mapboxgl.Popup({
        offset: 30,

    }).setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map)


    //Exrend map bounds to include current location
    bounds.extend(loc.coordinates)
});

map.fitBounds(bounds, {
    padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
    },

})
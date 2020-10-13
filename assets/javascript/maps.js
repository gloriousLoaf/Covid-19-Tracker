/* This file was written by Chase. */

// On page load, call functions
$(document).ready(function () {
    // get MapBox.com
    initializeApp();
    // gives value to userState
    ajaxState();
    // fill News, Testing  & Data Cards (needs userState)
    // setTimeouts to give ajax calls time to respond
    setTimeout(function () {
        stateStatsCall();
    }, 400)
    setTimeout(function () {
        ajaxNews();
    }, 500)
    setTimeout(function () {
        ajaxTesting();
    }, 750)
});


/* BEGIN MAPBOX */
// Our api for map-plot data
const baseUrlEndPoint = `https://disease.sh/v3/covid-19/countries`;

// Container for displaying the corona details 
let coronaDetailsContainer;

// Dropdown for country selection
let countrySelectDropdown;

// Container for rendering the world Corona details 
let coronaWorldDetailsContainer;

// Primary array:
// latest filled by async func at 443
// locations filled with reverse-lookup async func at ln 64
const coronaData = [
    latest = {},
    locations = []
]

// Countries with Country Codes,
// value set in async func at ln 269
let countriesWithCountryCodes = {}

// adding locations to mapbox
function populateLocation(country, country_code) {
    const countryOption = document.createElement('option');
    countryOption.value = country;
    countryOption.textContent = `${country_code}-${country}`;
    countrySelectDropdown.appendChild(countryOption);
}

function populateLocations() {
    Object.entries(countriesWithCountryCodes)
        .forEach(([country_code, country]) => populateLocation(country, country_code));
}

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hhc2V5YiIsImEiOiJja2EydmhiMXIwM2Y1M2xzNW5oMnRpYzd5In0.m1vDX_9oLA_Ywa2fa43WXg';

let geocorder;
async function geocodeReverseFromLatLngToPlace(lat, lng) {

    return new Promise((resolve, reject) => {
        geocoder.mapboxClient.geocodeReverse(
            {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng)
            },
            function (error, response) {
                if (error) {
                    reject(error);
                }
                resolve(response.features[0] && response.features[0].place_name);
            }
        );
    })
}

// MAPBOX functionality //
function renderMap() {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v10', // stylesheet location
        center: [10, 0], // starting position [lng, lat]
        zoom: 1.2 // starting zoom
    });

    geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    });

    map.addControl(geocoder);
    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', async function () {
        map.addSource('places', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                crs: {
                    type: 'name',
                    properties: {
                        name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
                    },
                },
                features: await Promise.all(coronaData.latest.map(async location => {
                        // a few places are "undefined" in the json obj due to missing
                        // country names, like the Azores.
                        const placeName = await geocodeReverseFromLatLngToPlace(
                            location.countryInfo.lat,
                            location.countryInfo.long
                        )
                        return {
                            type: 'Feature',
                            properties: {
                                description: `
                                    <table>
                                    <img class="flag" src="${location.countryInfo.flag}"
                                    alt="Flag for the selected country">
                                        <thead>
                                            <tr>${placeName}</tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Active Cases: </td>
                                                <td>${location.active}</td>
                                            </tr>
                                            <tr>
                                                <td>New Today: </td>
                                                <td>${location.todayCases}</td>
                                            </tr>
                                            <tr>
                                                <td>Deaths: </td>
                                                <td>${location.deaths}</td>
                                            </tr>
                                            <tr>
                                                <td>Latitude: </td>
                                                <td>${location.countryInfo.lat}</td>
                                            </tr>
                                            <tr>
                                                <td>Longitude: </td>
                                                <td>${location.countryInfo.long}</td>
                                            </tr>
                                        </tbody>
                                    </table> 
                                `,
                                icon: 'rocket'
                            },
                            geometry: {
                                type: "Point",
                                coordinates: [
                                    `${location.countryInfo.long}`,
                                    `${location.countryInfo.lat}`
                                ]
                            }
                    }
                }))
            },
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
        });

        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'places',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#28a745',
                    100,
                    '#f1f075',
                    750,
                    '#f28cb1'
                ],
                'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
            }
        });

        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'places',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            },
        });

        map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'places',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#28a745',
                'circle-radius': 4,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            },
        });

        // inspect a cluster on click
        map.on('click', 'clusters', function (event) {
            const features = map.queryRenderedFeatures(event.point, {
                layers: ['clusters'],
            });
            const clusterId = features[0].properties.cluster_id;
            map
                .getSource('places')
                .getClusterExpansionZoom(clusterId, function (error, zoom) {
                    if (error) return;

                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom,
                    });
                }
                );
        });

        // When a click event occurs on a feature in the unclustered-point layer,
        // open a popup at the location of the feature, with description HTML from its properties.
        map.on('click', 'unclustered-point', function (event) {
            const coordinates = event.features[0].geometry.coordinates.slice();
            const { description } = event.features[0].properties;

            // Ensure that if the map is zoomed out such that multiple copies of the feature are 
            // visible, the popup appears over the copy being pointed to.
            while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        });

        map.on('mouseenter', 'clusters', function () {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', function () {
            map.getCanvas().style.cursor = '';
        });
    });
}

async function initializeApp() {
    setReferences();
    doEventBindings();
    NProgress.start();
    populateLocations();
    await performAsyncCall();
    renderUI(coronaData.latest, world = true);
    NProgress.done();
    renderMap();
}

async function performAsyncCall() {
    const response = await fetch(`${baseUrlEndPoint}`);
    const data = await response.json();
    // .latest is the data being mapped to html in renderMap()
    coronaData.latest = data;
    // .locations is looped to the mapbox in populateLocations() ln 56
    coronaData.locations = data.map((country) => (
        {
            key: country.countryInfo.iso2,
            value: country.country
        }
    ))
    countriesWithCountryCodes = coronaData.locations;
}

function renderUI(world = true) {
    let html = '';
    if (world) {
        coronaWorldDetailsContainer.innerHTML = html;
    } else {
        coronaWorldDetailsContainer.innerHTML = html;
    }
}

function renderDetailsForSelectedLocation(event) {
    const countrySelected = event.target.value;
    const locationCoronaDetails = coronaData.locations.reduce((accumulator, currentLocation) => {
        if (currentLocation.country === countrySelected) {
            accumulator['country'] = currentLocation.country;
            accumulator['country_code'] = currentLocation.country_code;
            accumulator.latest.confirmed += currentLocation.latest.confirmed;
            accumulator.latest.deaths += currentLocation.latest.deaths;
        }
        return accumulator
    }, {
        country: '',
        country_code: '',
        latest: {
            confirmed: 0,
            deaths: 0
        }
    });
    renderUI(locationCoronaDetails);
}

function setReferences() {
    coronaDetailsContainer = document.querySelector('#corona-details')
    countrySelectDropdown = document.querySelector('[name="select-country"]');
    coronaWorldDetailsContainer = document.querySelector('#corona-world-details');
}

function doEventBindings() {
    countrySelectDropdown.addEventListener('change', renderDetailsForSelectedLocation);
}
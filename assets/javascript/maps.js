/* The first half of this file was written
    by Chase & Maurice, the bottom half was me.*/

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
// NEW - Need to update destructuring data from json response       ////////////////////////////
const baseUrlEndPoint = `https://disease.sh/v3/covid-19/countries`;

// Container for displaying the corona details 
let coronaDetailsContainer;

// Dropdown for country selection
let countrySelectDropdown;

// Container for rendering the world Corona details 
let coronaWorldDetailsContainer;

//////////////////////////////////////////////////////////////////////////////////////////////////
// NEW
const coronaData = [
    latest = {},
    locations = []
]

// Countries with Country Codes
const countriesWithCountryCodes = {
    "TH": "Thailand",
    "JP": "Japan",
    "SG": "Singapore",
    "NP": "Nepal",
    "MY": "Malaysia",
    "CA": "Canada",
    "AU": "Australia",
    "KH": "Cambodia",
    "LK": "Sri Lanka",
    "DE": "Germany",
    "FI": "Finland",
    "AE": "United Arab Emirates",
    "PH": "Philippines",
    "IN": "India",
    "IT": "Italy",
    "SE": "Sweden",
    "ES": "Spain",
    "BE": "Belgium",
    "EG": "Egypt",
    "LB": "Lebanon",
    "IQ": "Iraq",
    "OM": "Oman",
    "AF": "Afghanistan",
    "BH": "Bahrain",
    "KW": "Kuwait",
    "DZ": "Algeria",
    "HR": "Croatia",
    "CH": "Switzerland",
    "AT": "Austria",
    "IL": "Israel",
    "PK": "Pakistan",
    "BR": "Brazil",
    "GE": "Georgia",
    "GR": "Greece",
    "MK": "North Macedonia",
    "NO": "Norway",
    "RO": "Romania",
    "EE": "Estonia",
    "SM": "San Marino",
    "BY": "Belarus",
    "IS": "Iceland",
    "LT": "Lithuania",
    "MX": "Mexico",
    "NZ": "New Zealand",
    "NG": "Nigeria",
    "IE": "Ireland",
    "LU": "Luxembourg",
    "MC": "Monaco",
    "QA": "Qatar",
    "EC": "Ecuador",
    "AZ": "Azerbaijan",
    "AM": "Armenia",
    "DO": "Dominican Republic",
    "ID": "Indonesia",
    "PT": "Portugal",
    "AD": "Andorra",
    "LV": "Latvia",
    "MA": "Morocco",
    "SA": "Saudi Arabia",
    "SN": "Senegal",
    "AR": "Argentina",
    "CL": "Chile",
    "JO": "Jordan",
    "UA": "Ukraine",
    "HU": "Hungary",
    "LI": "Liechtenstein",
    "PL": "Poland",
    "TN": "Tunisia",
    "BA": "Bosnia and Herzegovina",
    "SI": "Slovenia",
    "ZA": "South Africa",
    "BT": "Bhutan",
    "CM": "Cameroon",
    "CO": "Colombia",
    "CR": "Costa Rica",
    "PE": "Peru",
    "RS": "Serbia",
    "SK": "Slovakia",
    "TG": "Togo",
    "MT": "Malta",
    "MQ": "Martinique",
    "BG": "Bulgaria",
    "MV": "Maldives",
    "BD": "Bangladesh",
    "PY": "Paraguay",
    "AL": "Albania",
    "CY": "Cyprus",
    "BN": "Brunei",
    "US": "US",
    "BF": "Burkina Faso",
    "VA": "Holy See",
    "MN": "Mongolia",
    "PA": "Panama",
    "CN": "China",
    "IR": "Iran",
    "KR": "Korea, South",
    "FR": "France",
    "XX": "Cruise Ship",
    "DK": "Denmark",
    "CZ": "Czechia",
    "TW": "Taiwan*",
    "VN": "Vietnam",
    "RU": "Russia",
    "MD": "Moldova",
    "BO": "Bolivia",
    "HN": "Honduras",
    "GB": "United Kingdom",
    "CD": "Congo (Kinshasa)",
    "CI": "Cote d'Ivoire",
    "JM": "Jamaica",
    "TR": "Turkey",
    "CU": "Cuba",
    "GY": "Guyana",
    "KZ": "Kazakhstan",
    "ET": "Ethiopia",
    "SD": "Sudan",
    "GN": "Guinea",
    "KE": "Kenya",
    "AG": "Antigua and Barbuda",
    "UY": "Uruguay",
    "GH": "Ghana",
    "NA": "Namibia",
    "SC": "Seychelles",
    "TT": "Trinidad and Tobago",
    "VE": "Venezuela",
    "SZ": "Eswatini",
    "GA": "Gabon",
    "GT": "Guatemala",
    "MR": "Mauritania",
    "RW": "Rwanda",
    "LC": "Saint Lucia",
    "VC": "Saint Vincent and the Grenadines",
    "SR": "Suriname",
    "XK": "Kosovo",
    "CF": "Central African Republic",
    "CG": "Congo (Brazzaville)",
    "GQ": "Equatorial Guinea",
    "UZ": "Uzbekistan",
    "NL": "Netherlands",
    "BJ": "Benin",
    "LR": "Liberia",
    "SO": "Somalia",
    "TZ": "Tanzania",
    "BB": "Barbados",
    "ME": "Montenegro",
    "KG": "Kyrgyzstan",
    "MU": "Mauritius",
    "ZM": "Zambia",
    "DJ": "Djibouti",
    "GM": "Gambia, The",
    "BS": "Bahamas, The",
    "TD": "Chad",
    "SV": "El Salvador",
    "FJ": "Fiji",
    "NI": "Nicaragua",
    "MG": "Madagascar",
    "HT": "Haiti",
    "AO": "Angola",
    "CV": "Cape Verde",
    "NE": "Niger",
    "PG": "Papua New Guinea",
    "ZW": "Zimbabwe",
    "TL": "Timor-Leste",
    "ER": "Eritrea",
    "UG": "Uganda",
    "DM": "Dominica",
    "GD": "Grenada",
    "MZ": "Mozambique",
    "SY": "Syria"
}

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
                //////////////////////////////////////////////////////////////////////////////////////////////////
                features: await Promise.all(coronaData.latest.map(async location => {
                        const placeName = await geocodeReverseFromLatLngToPlace(
                            location.countryInfo.lat,
                            location.countryInfo.long
                        )
                        // a few places are "undefined" in the json obj
                        console.log(placeName);
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
                        // };
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

        // When a click event occurs on a feature in
        // the unclustered-point layer, open a popup at
        // the location of the feature, with
        // description HTML from its properties.
        map.on('click', 'unclustered-point', function (event) {
            const coordinates = event.features[0].geometry.coordinates.slice();
            const { description } = event.features[0].properties;

            // Ensure that if the map is zoomed out such that
            // multiple copies of the feature are visible, the
            // popup appears over the copy being pointed to.
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
////////////////////////////////////////////////////////////////////////////////////////////////////
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
    const data = await response.json();;
    coronaData.latest = data;
    console.log(coronaData.latest);
}
///////////////////////////////////////////////////////////////////////////////////////////////

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
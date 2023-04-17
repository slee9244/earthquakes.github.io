// Earthquake Data from USGS
earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// Plate tectonics
plateURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
// Mapbox token
API_KEY = "pk.eyJ1Ijoic2xlZTkyNDQiLCJhIjoiY2xmZWJiMjVuMDI1eDN5cW51bDB6aGZuaCJ9.pH22fB7obgMGeKahEEUw2g";

fatalityURL = "https://raw.githubusercontent.com/slee9244/earthquake_files/main/fatality.csv"

///////////////////////////////////////////// Functions //////////////////////////////////////////
// Circle color based on the magnitude of earthquake
function circleColor(magnitude) {
  var color="#feffdf";
  switch(true) {
    case (magnitude < 1):
    color="#feffdf";
      break;
    case (magnitude < 2):
      color="#ffe79a";
      break;
    case (magnitude < 3):
      color="#ffa952";
      break;
    case (magnitude < 4):
      color="#ef5a5a";
      break;
    case (magnitude < 5):
      color="#ea2c2c";
      break;
    case (magnitude >= 5):
      color="#8f3636";
      break;
  }
  return color;
}

// Circle style
function circleStyle (feature) {
  return {
      fillColor: circleColor(feature.properties.mag),
      radius: 3*feature.properties.mag,
      weight: 0,
      fillOpacity: 0.7   
  };
};

// Plate style
function plateStyle (feature) {
  return {
      fillColor: null,
      color: "cornflowerblue",
      weight: 1.5,
      fillOpacity: 0
  };
};

///////////////////////////////////////// Map Style //////////////////////////////////////////////
// Base map styles
var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery Â© <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 10,
  id: "dark-v10",
  accessToken: API_KEY
});

var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery Â© <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 10,     
  id: "light-v11",
  accessToken: API_KEY
});

var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery Â© <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 10,
  id: "satellite-v9",
  accessToken: API_KEY
});

//////////////////////////////////// Variables for the map /////////////////////////////////////
var baseMaps = {Dark: dark, Light: light, Satellite: satellite};

var earthquakes = new L.LayerGroup();

var plateBorders = new L.LayerGroup();

var fatalities = new L.LayerGroup();

var associatedDisasters = new L.LayerGroup();

var allearthquakes = new L.LayerGroup();

var overlayMaps = {
  'Plate borders': plateBorders,
  'Latest (7 days) Earthquakes Events': earthquakes,
  "Earthquakes": allearthquakes,
  'Fatalities': fatalities,
  "Associated Disasters": associatedDisasters,
};

// Create the map 
var map = L.map("map", {
  // Salt lake city
  center: [40.7608, -111.8910],
  zoom: 5,
  minZoom: 2,
  worldCopyJump: true,
  layers: [dark, plateBorders],
  timeDimensionControl: true,
  timeDimensionControlOptions: {
    timeSliderDragUpdate: true,
    loopButton: true,
    autoPlay: false,
    playerOptions: {
      transitionTime: 1,
      loop:true
    }
  },
  timeDimension: true,
});
L.control.layers(baseMaps, overlayMaps).addTo(map);

var fatalityLegend = L.control({ position: 'bottomright' });

// Legend for Fatality
fatalityLegend.onAdd = function() {
  var div = L.DomUtil.create('div', 'legend');
  div.innerHTML += '<h4>Total Deaths</h4>';

  var ranges = [
    { min: 0, max: 5 },
    { min: 6, max: 50 },
    { min: 51, max: 1000 },
    { min: 1001, max: 2500 },
    { min: 2501, max: 5000 },
    { min: 5001, max: 10000 },
    { min: 10001, max: 50000 },
    { min: 50001, max: 100000 },
    { min: 100001, max: 500000 },
    { min: 500001, max: 1000000 }
  ];

  for (var i = 0; i < ranges.length; i++) {
    div.innerHTML +=
      '<i style="background:' +
      fatalityColor(ranges[i].min) +
      '"></i> ' +
      ranges[i].min +
      (ranges[i].max ? '&ndash;' + ranges[i].max + '<br>' : '+');
  }

  return div;
};

// Legend for Associated Disasters
var associatedDisastersLegend = L.control({ position: "bottomright" });

associatedDisastersLegend.onAdd = function () {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>Associated Disasters</h4>";
  div.innerHTML += '<i style="background: ' + disasterColor("Tsunami/Tidal wave") + '"></i><span>Tsunami/Tidal wave</span><br>';
  div.innerHTML += '<i style="background: ' + disasterColor("Slide (land, mud, snow, rock)") + '"></i><span>Slide (land, mud, snow, rock)</span><br>';
  div.innerHTML += '<i style="background: ' + disasterColor("Volcanic activity") + '"></i><span>Volcanic activity</span><br>';
  div.innerHTML += '<i style="background: ' + disasterColor("Fire") + '"></i><span>Fire</span><br>';
  div.innerHTML += '<i style="background: ' + disasterColor("Flood") + '"></i><span>Flood</span><br>';
  div.innerHTML += '<i style="background: ' + disasterColor("Collapse") + '"></i><span>Collapse</span><br>';
  div.innerHTML += '<i style="background: ' + disasterColor("Avalanche (Snow, Debris)") + '"></i><span>Avalanche (Snow, Debris)</span><br>';
  return div;
};

// Legend for Earthquakes
var legend = L.control({position: 'bottomright'});
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>Magnitude</h4>";
  div.innerHTML += '<i style="background: #feffdf"></i><span>0 - 1</span><br>';
  div.innerHTML += '<i style="background: #ffe79a"></i><span>1 - 2</span><br>';
  div.innerHTML += '<i style="background: #ffa952"></i><span>2 - 3</span><br>';
  div.innerHTML += '<i style="background: #ef5a5a"></i><span>3 - 4</span><br>';
  div.innerHTML += '<i style="background: #ea2c2c"></i><span>4 - 5</span><br>';
  div.innerHTML += '<i style="background: #8f3636"></i><span>5+</span><br>';
  return div;
};
legend.addTo(map);

// Global variable to track timeDimension status
var timeDimensionActive = true;

// Function to hide timeDimension control when fatalities or associatedDisasters layers are active
function updateTimeDimensionStatus() {
  if (map.hasLayer(fatalities) || map.hasLayer(associatedDisasters)) {
    if (timeDimensionActive) {
      map.timeDimensionControl._container.style.display = 'none';
      timeDimensionActive = false;
    }
  } else {
    if (!timeDimensionActive) {
      map.timeDimensionControl._container.style.display = 'block';
      timeDimensionActive = true;
    }
  }
}

// Add legend to map when layer is added
map.on("overlayadd", function (eventLayer) {
  if (eventLayer.name === "Fatalities") {
    fatalityLegend.addTo(map);
  } else if (eventLayer.name === "Associated Disasters") {
    associatedDisastersLegend.addTo(map);
  }
  else if (eventLayer.name === "Earthquakes") {
    legend.addTo(map);
  }
  updateTimeDimensionStatus();
});

// Remove legend from map when layer is removed
map.on("overlayremove", function (eventLayer) {
  if (eventLayer.name === "Fatalities") {
    map.removeControl(fatalityLegend);
  } else if (eventLayer.name === "Associated Disasters") {
    map.removeControl(associatedDisastersLegend);
  }
  else if (eventLayer.name === "Earthquakes") {
    map.removeControl(Legend);
  }
  updateTimeDimensionStatus();
});

//////////////////////////////////// Earthquakes ///////////////////////////////////////////////
d3.json(earthquakeURL, function(data) {
  var geoJSONLayer = L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, circleStyle(feature));
    },
    // create a popup for each circleMarker
    onEachFeature: function(feature, layer) {
      var date = new Date(feature.properties.time)
      // uses date-format to format the date
      //var dateString = date.format('mmm d, yyyy')
      layer.bindPopup('<strong>Date: </strong>' + date.toDateString() + '<br />'
                    + '<strong>Magnitude: </strong>' + feature.properties.mag + '<br />'
                    + '<strong>Depth: </strong>' + feature.geometry.coordinates[2] + ' km' + '<br />'
                    + '<strong>Location: </strong>' + feature.properties.place);
    }
  });
  geoJSONLayer.addTo(earthquakes)
  
  /////////////////////////////////////// TimeDimension //////////////////////////////////////////
  var geoJSONTDLayer = L.timeDimension.layer.geoJson(geoJSONLayer, {
        updateTimeDimension: true,
        updateTimeDimensionMode: 'replace',
        waitForReady: true,
        addlastPoint: true,
        
  });
  geoJSONTDLayer.addTo(map);

  /////////////////////////////////////// Search /////////////////////////////////////////////////
  var provider = new GeoSearch.OpenStreetMapProvider();
  var search = new GeoSearch.GeoSearchControl({
    provider: provider,
    searchLabel: 'Enter the location',
    autoClose: true,
  });
  map.addControl(search);
});

/////////////////////////////////// Tectonic Plates ////////////////////////////////////////////
d3.json(plateURL, function(data) {
  L.geoJSON(data, {
    style: plateStyle, 
    onEachFeature: function (feature, layer){
      layer.bindPopup("<strong>Tectonic Plate: </strong>" + feature.properties.Name);
    }
  }).addTo(plateBorders)
});

// Colorbar for fatalities
function fatalityColor(deaths) {
  if (deaths <= 5) return '#ffffcc';
  if (deaths <= 50) return '#c7e9b4';
  if (deaths <= 1000) return '#7fcdbb';
  if (deaths <= 2500) return '#41b6c4';
  if (deaths <= 5000) return '#1d91c0';
  if (deaths <= 10000) return '#225ea8';
  if (deaths <= 50000) return '#253494';
  if (deaths <= 100000) return '#081d58';
  if (deaths <= 500000) return '#800026';
  return '#000000';
}

// Colorbar for associated disasters
function disasterColor(disasterType) {
  switch (disasterType) {
    case "Tsunami/Tidal wave":
      return "#1f77b4";
    case "Slide (land, mud, snow, rock)":
      return "#ff7f0e";
    case "Volcanic activity":
      return "#2ca02c";
    case "Fire":
      return "#d62728";
    case "Flood":
      return "#9467bd";
    case "Collapse":
      return "#8c564b";
    case "Avalanche (Snow, Debris)":
      return "#e377c2";
    default:
      return null;
  }
}

/////////////////////////////////// Fatalities /////////////////////////////////////////////////
d3.csv(fatalityURL, function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.Year = +d.Year;
    d.Latitude = +d.Latitude;
    d.Longitude = +d.Longitude;
    d['Dis Mag Value'] = +d['Dis Mag Value'];
    d['Total Deaths'] = +d['Total Deaths'];
    console.log("Latitude: " + d.Latitude + " Longitude: " + d.Longitude);

    var latlng = L.latLng(d.Latitude, d.Longitude);

    if (d["Associated Dis"]) {
      var disasterMarker = L.circleMarker(latlng, {
        radius: 6,
        fillColor: disasterColor(d["Associated Dis"]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      }
      );
    
      disasterMarker.bindPopup(
        "<strong>Country:</strong> " +
          d.Country +
          "<br>" +
          "<strong>Year:</strong> " +
          d.Year +
          "<br>" +
          "<strong>Associated Disaster:</strong> " +
          d["Associated Dis"]
      );
    
      disasterMarker.addTo(associatedDisasters);
    }

    var circleMarker = L.circleMarker(latlng, {
      radius: 10,
      fillColor: fatalityColor(d['Total Deaths']),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });

    circleMarker.bindPopup(
      '<strong>Country:</strong> ' + d.Country + '<br>' +
      '<strong>Year:</strong> ' + d.Year + '<br>' +
      '<strong>Deaths:</strong> ' + d['Total Deaths'] + '<br>' +
      '<strong>Magnitude:</strong> ' + d['Dis Mag Value']
    );

    circleMarker.addTo(fatalities);

    var EarthquakeMarker = L.circleMarker(latlng, {
      radius: 10,
      fillColor: circleColor(d['Dis Mag Value']),
      radius: 3*d['Dis Mag Value'],
      weight: 0,
      fillOpacity: 0.7  
    });
  
    EarthquakeMarker.bindPopup(
      '<strong>Country:</strong> ' + d.Country + '<br>' +
      '<strong>Year:</strong> ' + d.Year + '<br>' +
      '<strong>Magnitude:</strong> ' + d['Dis Mag Value']
    );
  
    EarthquakeMarker.addTo(allearthquakes);
  });
});

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(queryUrl).then(function(data) {
    createFeatures(data.features);
});

function size(magnitude) {
    return magnitude * 6.5;
}

function Color(depth) {
    if (depth < 1) return "yellow";
    else if (depth < 3) return "orange";
    else if (depth < 6) return "red";
    else if (depth < 9.9) return "black";
    else return "white";
}

function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(
            `<h3>${feature.properties.place}</h3>
            <hr>
            <p>Magnitude: ${feature.properties.mag}</p>
            <p>${new Date(feature.properties.time)}</p>`
        );
    }

    function circle(feature, latlng) {
        let circles = {
            radius: size(feature.properties.mag),
            fillColor: Color(feature.geometry.coordinates[2]),
            color: Color(feature.geometry.coordinates[2]),
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.5 
        };
        return L.circleMarker(latlng, circles);
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: circle
    });

    createMap(earthquakes);
}

function createMap(earthquakes) {
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    var overlayMaps = {
        Earthquakes: earthquakes
    };

    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [street, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({ position: "bottomleft" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"),
            depths = [0, 1, 3, 6, 9.9];
        div.innerHTML += "<h4>Depth</h4>";

        for (var i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<div class="legend-item"><i style="background:' +
                Color(depths[i]) +
                '"></i> ' +
                depths[i] +
                (depths[i + 1] ? "&ndash;" + depths[i + 1] + '<br>' : '+') +
                '</div>';
        }

        return div;
    };

    legend.addTo(myMap);
}

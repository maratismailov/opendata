<script>
    import { onMount } from "svelte";

    import { init_db } from "../init_db";

    import L from "leaflet";
    import "leaflet.markercluster";
    import "Leaflet.TileLayer.MBTiles";

    export let server_url;
    // export let dictionary;
    let db;
    let map;
    let zoom = 14;
    const lat = 51.509865;
    const lon = -0.118092;
    let center = [lat, lon];
    let points = [];
    let markerGroup;

    onMount(async () => {
        init_db();
        createMap();
        var db_mobilesurvey = indexedDB.open("db_mobilesurvey", 1);
        db_mobilesurvey.onsuccess = function (e) {
            db = e.target.result;
        };
        db_mobilesurvey.onerror = function (e) {
            console.log("onerror!");
            console.dir(e);
        };
        points = await fetch(server_url).then((response) => response.json());
        points.results.forEach((elem) => {
            // const popup =
            //     dict.city +
            //     ": " +
            //     elem.name +
            //     "<br>" +
            //     dict.country +
            //     ": " +
            //     get_country_name(elem.country) +
            //     "<br>" +
            //     dict.temp +
            //     ": " +
            //     elem.data.temperature +
            //     "<br>" +
            //     dict.humidity +
            //     ": " +
            //     elem.data.humidity +
            //     "<br>" +
            //     dict.pressure +
            //     ": " +
            //     elem.data.pressure +
            //     "<br>" +
            //     dict.wind_speed +
            //     ": " +
            //     elem.data.wind_speed +
            //     "<br>" +
            //     dict.wind_degree +
            //     ": " +
            //     wind_degree_to_text(elem.data.wind_degree) +
            //     "<br>" +
            //     dict.lat +
            //     ": " +
            //     elem.lat +
            //     "<br>" +
            //     dict.lon +
            //     ": " +
            //     elem.lon;
            const popup = "Name: " + elem.borough + "<hr>" +
                        "Opening hours: " + elem.opening_hours + "<hr>" +
                        "Full address: " + elem.address + "<hr>" +
                        "Wheelchair accessible: " + elem.wheelchair + "<hr>" +
                        "Baby change facilities : " + elem.address + "<hr>" +
                        "Fee: " + elem.address + "<hr>" +
                        "Avg rating: " + elem.address + "<hr>" +
                        "Number of ratings: " + elem.address + "<hr>" +
                        "Toilets4London id: " + elem.address + "<hr>"
            L.marker([elem.latitude, elem.longitude], {}).bindPopup(popup).addTo(markerGroup);
        });
    });

    const get_mbtiles = (survey_name) => {
        var transaction = db.transaction(["mbtiles"], "readonly");

        transaction.objectStore("mbtiles").get(survey_name).onsuccess = function (event) {
            // URL.revokeObjectURL(mbtiles);
            var mbtiles = event.target.result;
            map_url = URL.createObjectURL(mbtiles);
            // get_objects_to_save();
            createMap();
        };
    };

    const createMap = () => {
        map = L.map("map", {
            editable: true,
        }).setView(center, zoom);
        L.tileLayer("https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        map.zoomControl.setPosition("bottomright");
        markerGroup = L.markerClusterGroup().addTo(map);
    };

    const handleSubmit = (e) => {
        if (e.target.elements[0].value !== null) {
            const fetchData = async () => {
                const result = await fetch("https://nominatim.openstreetmap.org/search?q=" + e.target.elements[0].value + "&format=json&limit=1").then((response) => response.json());
                map.setView([result[0].lat, result[0].lon], 14);
            };
            fetchData();
        }
    };
</script>

<div class="full-page">
    <form class="form" on:submit|preventDefault={handleSubmit}>
        <label for="name" style="padding: 5px;">Toilets4London Map</label>
        <input class="search" type="text" value="" placeholder="Search for a London location" />
        <button type="submit">Search</button>
    </form>
    <div id="map" style="z-index: 1000">
        <slot />
    </div>
</div>

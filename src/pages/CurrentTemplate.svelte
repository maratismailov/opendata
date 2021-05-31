<script>
    import { onMount } from "svelte";

    import L from "leaflet";
    // import { * } from 'Leaflet.TileLayer.MBTiles';
    import "Leaflet.TileLayer.MBTiles";

    import { store_current_template } from "../stores.js";

    import Parsed from "../components/Parsed.svelte";

    export let url;
    export let dictionary;
    let template;
    let db;
    let map_url;
    let map;
    let center = [41.4, 72.77];
    let zoom = 6;

    onMount(() => {
        console.log(template);
        if (!("indexedDB" in window)) {
            console.log("This browser doesn't support IndexedDB");
            return;
        }
        var db_mobilesurvey = indexedDB.open("db_mobilesurvey", 1);
        db_mobilesurvey.onsuccess = function (e) {
            db = e.target.result;
            const survey_name = template.survey_name;
            get_mbtiles(survey_name);
        };
        db_mobilesurvey.onerror = function (e) {
            console.log("onerror!");
            console.dir(e);
        };
        db_mobilesurvey.onupgradeneeded = function (e) {
            db = e.target.result;
            if (!db.objectStoreNames.contains("templates")) {
                var templates = db.createObjectStore("templates", {
                    autoIncrement: true,
                });
            }
        };
    });

    const get_mbtiles = (survey_name) => {
        console.log(survey_name);
        var transaction = db.transaction(["mbtiles"], "readonly");
        var store = transaction.objectStore("mbtiles");
        // var request = store.get(template_name.toString());
        var request = store.get(survey_name);

        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {
            let blob = e.target.result;
            map_url = URL.createObjectURL(blob);
            map_url = map_url.substring(5);
            // const str_arr = map_url.split("/")[3]
            // map_url = 'http://localhost:5555/' + str_arr
            createMap();
        };
    };

    // objectURL = URL.createObjectURL(blob);

    template = JSON.parse(localStorage.getItem("current_template"));

    const createMap = () => {
        console.log('mapurl ', map_url)
        map = L.map("map").setView(center, zoom);
        var mb = L.tileLayer.mbTiles(map_url).addTo(map);
    };
</script>

<div>
    <!-- {#if dictionary} -->
    {#if template}
        {template.survey_name}
    {/if}
    <!-- {/if} -->
    <button
        on:click={() => {
            console.log(template);
        }}>test</button
    >
</div>

<Parsed {template} />

<div style="height: 200px" class="map" id="map">
    <slot />
</div>

<script>
    import { onMount } from "svelte";

    import L from "leaflet";
    // import { * } from 'Leaflet.TileLayer.MBTiles';
    import "Leaflet.TileLayer.MBTiles";
    import "@geoman-io/leaflet-geoman-free";
    import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

    import { store_current_template } from "../stores.js";

    import Parsed from "../components/Parsed.svelte";
    // import { mapEditor } from "../../public/leaflet/geoman/map-editor.dev";

    export let url;
    export let dictionary;
    let data_to_send;
    let template;
    let db;
    let map_url;
    let map;
    let center;
    let zoom = 15;
    let is_map = true;
    let height = (window.innerHeight * 0.78).toString() + "px";
    let geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
    };
    let objects_layer;
    // const geomanClickOnLayer = (a, b) => {
    //     console.log("dd");
    // };

    onMount(() => {
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
        var transaction = db.transaction(["mbtiles"], "readonly");

        transaction.objectStore("mbtiles").get(survey_name).onsuccess =
            function (event) {
                // URL.revokeObjectURL(mbtiles);
                var mbtiles = event.target.result;
                map_url = URL.createObjectURL(mbtiles);
                createMap();
                // mapEditor.putGeoJSONToMap(map, template.objects, "en", false);

                // URL.revokeObjectURL(imgURL);
            };
        // console.log(survey_name);
        // var transaction = db.transaction(["mbtiles"], "readonly");
        // var store = transaction.objectStore("mbtiles");
        // // var request = store.get(template_name.toString());
        // var request = store.get(survey_name);

        // request.onerror = function (e) {
        //     console.log("Error", e.target.error.name);
        // };
        // request.onsuccess = function (e) {
        //     let blob = e.target.result;
        //     map_url = window.URL.createObjectURL(blob);
        //     // map_url = URL.createObjectURL(blob);
        //     // map_url = map_url.substring(5);
        //     // const str_arr = map_url.split("/")[3]
        //     // map_url = 'http://localhost:5555/' + str_arr
        //     createMap();
        // };
    };

    // objectURL = URL.createObjectURL(blob);

    template = JSON.parse(localStorage.getItem("current_template"));

    const createMap = () => {
        let bounds2 = Object.values(template.bounds);
        let southWest = L.latLng(
                parseFloat(bounds2[2]),
                parseFloat(bounds2[0])
            ),
            northEast = L.latLng(
                parseFloat(bounds2[3]),
                parseFloat(bounds2[1])
            ),
            bounds = L.latLngBounds(southWest, northEast);
        map = L.map("map").fitBounds(bounds);
        console.log(bounds);
        L.tileLayer
            .mbTiles(map_url, {
                attribution: "&copy; Bing Maps",
            })
            .addTo(map);
        objects_layer = L.geoJSON(null, {
            onEachFeature: onEachFeature,
            pmIgnore: true,
        }).addTo(map);
        template.objects.forEach((elem) => {
            objects_layer.addData(elem);
        });

        // L.geoJson(geoJsonData, {
        //     onEachFeature: function (feature, layer) {
        //         var label = L.marker(layer.getBounds().getCenter(), {
        //             icon: L.divIcon({
        //                 className: "label",
        //                 html: feature.properties.NAME,
        //                 iconSize: [100, 40],
        //             }),
        //         }).addTo(map);
        //     },
        // });
        // template.objects.forEach((elem) => {
        //     L.geoJSON(elem, {
        //         onEachFeature: onEachFeature,
        //     }).addTo(map);
        // });
        map.pm.addControls({
            position: "topleft",
            drawCircle: false,
        });
        map.on("pm:cut", (e) => {
            console.log(e);
            e.layer.feature.properties = e.originalLayer.feature.properties;
        });

        is_map = false;
    };
    const onEachFeature = (feature, layer) => {
        layer.on({
            click: () => layer_click(feature, layer),
        });
        // try {
        //     layer.bindPopup(
        //         template.survey_body.object_code + " " + feature.properties.id
        //     );
        // } catch (e) {
        //     console.log(e);
        // }
        if (feature.properties) {
            layer.bindPopup(
                template.survey_body.object_code + " " + feature.properties.id
            );
        }
        let center = layer.getBounds().getCenter();
        // // does this feature have a property named popupContent?
        // if (feature.id) {
        //     layer.bindPopup("dd").addTo(map);
        //     // layer.bindPopup("feature.id");
        // }
        if (feature.id) {
            var label = L.marker(center, {
                icon: L.divIcon({
                    className: "label",
                    html: feature.id,
                    iconSize: [0, 0],
                }),
            }).addTo(map);
        }
    };

    // function onEachFeature(feature, layer) {
    // 	var popupContent = "<p>I started out as a GeoJSON " +
    // 			feature.geometry.type + ", but now I'm a Leaflet vector!</p>";

    // 	if (feature.properties && feature.properties.popupContent) {
    // 		popupContent += feature.properties.popupContent;
    // 	}

    // 	layer.bindPopup(popupContent);
    // }

    const layer_click = (feature, layer) => {
        layer.bindPopup(
            template.survey_body.object_code + " " + feature.properties.id
        );
        console.log("ddd", feature);
        layer.setStyle({ pmIgnore: false });
        L.PM.reInitLayer(layer);
        // map.fitBounds(e.target.getBounds());
    };

    // var polygonCenter = layer.getBounds().getCenter();

    // // e.g. using Leaflet.label plugin
    // L.marker(polygonCenter)
    //     .bindLabel(feature.properties["NAME"], { noHide: true })
    //     .addTo(map);

    // L.geoJSON(someGeojsonFeature, {
    //     pointToLayer: function (feature, latlng) {
    //         return L.circleMarker(latlng, geojsonMarkerOptions);
    //     },
    // }).addTo(map);
    // var pointLayer = L.geoJSON(null, {
    //     pointToLayer: function (feature, latlng) {
    //         label = String(feature.id); // Must convert to string, .bindTooltip can't use straight 'feature.properties.attribute'
    //         return new L.CircleMarker(latlng, {
    //             radius: 1,
    //         })
    //             .bindTooltip(label, { permanent: true, opacity: 0.7 })
    //             .openTooltip();
    //     },
    // });
    // pointLayer.addData(data_points);
    // mymap.addLayer(pointLayer);

    const resize = () => {
        height = (window.innerHeight * 0.78).toString() + "px";
    };

    const parse_tables = () => {
        console.log(template);
        let table_data = [];
        let parsed_data = template.survey_body.survey_body.map((elem) => {
            if (elem.type !== "table") {
                return elem;
            } else {
                elem.fields.forEach((elem2, index) => {
                    elem2.forEach((elem3) => {
                        const new_index = (index + 1) * -1;
                        table_data.push({
                            id: elem.id + "." + elem3.id + "." + new_index,
                            value: elem3.value,
                        });
                        // table_data.push({ value: elem3.value });
                        // table_data.push('id:' + elem.id + '.' + elem3.id)
                        // table_data.push('val: ' + elem3.value)
                    });
                });
                // const test = table_data.reduce( (result, current) => result.concat(current.id) , []);
                // table_data.forEach(elem => {
                //     return elem
                // })
                return;
            }
        });
        parsed_data = parsed_data.concat(table_data);
        parsed_data = parsed_data.concat(template.initial_fields);
        // console.log(parsed_data)
        const filtered = parsed_data.filter(function (el) {
            return el != null;
        });
        data_to_send = filtered.map((elem) => {
            const data = {};
            if (elem.id) {
                data.id = elem.id;
            } else if (elem.name) {
                data.id = elem.name;
            }
            data.val = elem.value;
            return data;
        });

        send_data(data_to_send);
    };

    const send_data = async (data) => {
        // url = "https://dev.forest.caiag.kg/ru/rent/standest/savestandestform"
        url =
            "http://0.0.0.0:8000/send_standestimation_data?data=" +
            JSON.stringify(data);
        const post = await fetch(url).then((response) => response.json());
        console.log(post);
    };
    // const show_map = () => {
    //     is_map = true
    //     map.setView(template.center, zoom);
    //     // map.invalidateSize()
    //     // resize()
    // }
</script>

<svelte:window on:resize={resize} on:orientationchange={resize} />

<ul id="menu">
    <li>
        <button
            on:click|preventDefault={() => (is_map = false)}
            class:selected={!is_map}>survey</button
        >
    </li>
    |
    <li>
        <button
            on:click|preventDefault={() => (is_map = true)}
            class:selected={is_map}>map</button
        >
    </li>
</ul>

<div class:hidden={is_map}>
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
        <button on:click={parse_tables}>test to send</button>
        <div class="parsed">
            <Parsed {template} />
        </div>
    </div>
</div>
<div class:hidden={!is_map}>
    <div style="height: {height}" class="map" id="map">
        <slot />
    </div>
</div>

<style>
    .parsed {
        padding-bottom: 50px;
    }
    .hidden {
        display: none;
    }
    ul#menu li {
        display: inline;
    }
    .selected {
        background-color: orange;
        color: white;
    }
</style>

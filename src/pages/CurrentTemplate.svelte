<script>
    import { onMount } from "svelte";

    import { init_db } from "../init_db";

    import L from "leaflet";
    // import { * } from 'Leaflet.TileLayer.MBTiles';
    import "Leaflet.TileLayer.MBTiles";
    import "@geoman-io/leaflet-geoman-free";
    import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

    import { store_current_template } from "../stores.js";

    import Parsed from "../components/Parsed.svelte";
    import { empty } from "svelte/internal";
    // import { mapEditor } from "../../public/leaflet/geoman/map-editor.dev";

    export let server_url;
    export let dictionary;
    let data_to_send;
    let template;
    let db;
    let map_url;
    let map;
    let center;
    let zoom = 20;
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
    let orig_objects;
    let object_code_value = "";
    let object_name = "";
    let object_num = "";
    let is_object_missing = false;
    let layer_to_edit;
    let layer_name_to_edit = "";
    let objects_to_save = [];
    let new_geom = [];
    let new_geometries = [];
    let geometries_to_delete = [];
    let new_polygons_counter = 0;
    // const geomanClickOnLayer = (a, b) => {
    //     console.log("dd");
    // };

    onMount(() => {
        init_db();
        var db_mobilesurvey = indexedDB.open("db_mobilesurvey", 1);
        db_mobilesurvey.onsuccess = function (e) {
            db = e.target.result;
            read_geometries_to_send(template.survey_name);
            const survey_name = template.survey_name;
            get_new_objects();
            get_objects_to_save().then((result) => {
                new_geom = result;
                get_mbtiles(survey_name);
            });

            // let new_objects = [];
            // var transaction = db.transaction(["objects_to_save"], "readonly");
            // var store = transaction.objectStore("objects_to_save");
            // var request = store.getAll();
            // request.onerror = function (e) {
            //     console.log("Error", e.target.error.name);
            // };
            // request.onsuccess = function (e) {
            //     new_objects = e.target.result;
            // };

            // objects_to_save = get_objects_to_save();
            // console.log("oj2", new_objects);
            // console.log('oj2', get_objects_to_save())
        };
        db_mobilesurvey.onerror = function (e) {
            console.log("onerror!");
            console.dir(e);
        };
    });

    const save_survey = () => {
        is_object_missing = false;
        const object_code = template.survey_body.object_code;
        template.survey_body.survey_body.forEach((elem) => {
            if (elem.id == object_code) {
                object_code_value = elem.value;
                object_name = elem.name;
            }
        });
        if (!object_code_value) {
            is_object_missing = true;
        } else {
            const name_to_save = template.survey_name + "-" + object_code_value;
            var transaction = db.transaction(["complete_surveys"], "readwrite");
            var store = transaction.objectStore("complete_surveys");
            var request = store.put(template.survey_body.survey_body, name_to_save);
            request.onerror = function (e) {
                console.log("Error", e.target.error.name);
            };
            request.onsuccess = function (e) {};
        }
    };

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

    // function getLayoutData(key) {
    //     return new Promise(function (resolve) {
    //         indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    //         var open = indexedDB.open("DB", 1);

    //         open.onsuccess = function () {
    //             db = open.result;
    //             tx = db.transaction("Store", "readwrite");
    //             var store = tx.objectStore("Store");

    //             store.get(key).onsuccess = function (event) {
    //                 return resolve(event.target.result);
    //             };
    //         };
    //     });
    // }

    const get_objects_to_save = () => {
        return new Promise(function (resolve) {
            var transaction = db.transaction(["objects_to_save"], "readonly");
            var store = transaction.objectStore("objects_to_save");
            var request = store.getAll();
            request.onerror = function (e) {
                console.log("Error", e.target.error.name);
            };
            request.onsuccess = function (e) {
                return resolve(e.target.result);
            };
        });
    };

    const get_new_objects = () => {
        var transaction = db.transaction(["objects_to_save"], "readonly");
        var store = transaction.objectStore("objects_to_save");
        // var request = store.getAll();
        var request = store.getAllKeys();
        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {
            e.target.result.forEach((elem) => {
                const id = parseInt(elem.replaceAll(template.survey_name + "-", ""));
                if (id < 0) {
                    new_polygons_counter += 1;
                }
            });
        };
    };

    // objectURL = URL.createObjectURL(blob);

    template = JSON.parse(localStorage.getItem("current_template"));

    const createMap = () => {
        orig_objects = JSON.parse(JSON.stringify(template.objects));
        let bounds2 = Object.values(template.bounds);
        let southWest = L.latLng(parseFloat(bounds2[2]), parseFloat(bounds2[0])),
            northEast = L.latLng(parseFloat(bounds2[3]), parseFloat(bounds2[1])),
            bounds = L.latLngBounds(southWest, northEast);
        map = L.map("map", { maxZoom: 20 }).fitBounds(bounds);
        L.tileLayer
            .mbTiles(map_url, {
                attribution: "&copy; Bing Maps",
            })
            .addTo(map);
        objects_layer = L.geoJSON(null, {
            onEachFeature: onEachFeature,
            pmIgnore: true,
        }).addTo(map);
        // new_geom = new_objects;
        // console.log(new_geom);
        // new_geom.forEach((elem) => {
        //     objects_layer.addData(elem);
        // });
        template.objects.forEach((elem) => {
            objects_layer.addData(elem);
        });
        if (template.survey_body.geom_type === "polygon") {
            map.pm.addControls({
                position: "topleft",
                drawCircle: false,
                drawRectangle: false,
                drawPolyline: false,
                drawCircleMarker: false,
                drawMarker: false,
                rotateMode: false,
                oneBlock: true,
            });
            map.pm.Toolbar.changeControlOrder(["drawPolygon", "editMode", "dragMode", "cutPolygon", "removalMode"]);
        } else if (template.survey_body.geom_type === "point") {
            map.pm.addControls({
                position: "topleft",
                drawCircle: false,
                drawRectangle: false,
            });
        }

        map.on("pm:create", (e) => {
            const new_object = e.layer.toGeoJSON();
            const new_object_id = (new_polygons_counter + 1) * -1;
            new_polygons_counter += 1;
            new_object.properties = { id: new_object_id };
            let object_name_to_save = template.survey_name + "." + new_object_id;
            // const new_template_objects = template.objects.map((elem) => {
            //     if (elem.properties.id == e.target.toGeoJSON().properties.id) {
            //         const new_elem = e.target.toGeoJSON();
            //         new_elem.properties = { id: e.target.toGeoJSON().properties.id };
            //         return new_elem;
            //     } else return elem;
            // });
            template.objects.push(new_object);
            // template.objects = new_template_objects;
            localStorage.setItem("current_template", JSON.stringify(template));
            put_to_save(new_object, object_name_to_save, template.survey_name, template);
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

        is_map = false;
    };
    const onEachFeature = (feature, layer) => {
        layer.on({
            click: () => layer_click(feature, layer),
        });
        if (feature.properties) {
            layer.bindPopup(template.survey_body.object_code + " " + feature.properties.id);
        }
        let center = layer.getBounds().getCenter();
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
        console.log("ddd", feature);
        layer.bindPopup(template.survey_body.object_code + " " + feature.properties.id);
        layer_to_edit = null;
        layer_to_edit = layer;
        object_num = feature.properties.id;
        layer_name_to_edit = template.survey_body.object_code + " " + feature.properties.id;
        // layer.setStyle({ pmIgnore: false });
        // L.PM.reInitLayer(layer);
        // map.fitBounds(e.target.getBounds());
    };

    const put_to_save = (geojson, name, db_name, template) => {
        var transaction = db.transaction(["objects_to_save"], "readwrite");
        var store = transaction.objectStore("objects_to_save");
        var request = store.put(geojson, name);
        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {};

        var transaction = db.transaction(["templates"], "readwrite");
        var store = transaction.objectStore("templates");
        var request = store.put(template, db_name + "_to_edit");
        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {};
        // localStorage.setItem("objects_to_save", JSON.stringify(objects_array));
    };

    const put_to_delete = (name, db_name, template) => {
        var transaction = db.transaction(["objects_to_delete"], "readwrite");
        var store = transaction.objectStore("objects_to_delete");
        var request = store.put("to_delete", name);
        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {};

        var transaction = db.transaction(["templates"], "readwrite");
        var store = transaction.objectStore("templates");
        var request = store.put(template, db_name + "_to_edit");
        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {};
        // localStorage.setItem("objects_to_save", JSON.stringify(objects_array));
    };

    const enable_edit = (layer) => {
        let object_name_to_save = template.survey_name + "." + object_num;
        // let objects_array = JSON.parse(localStorage.getItem("objects_to_save"));
        layer.setStyle({ pmIgnore: false, color: "orange", snappable: true });
        layer.on("pm:update", (e) => {
            const new_template_objects = template.objects.map((elem) => {
                if (elem.properties.id == e.target.toGeoJSON().properties.id) {
                    const new_elem = e.target.toGeoJSON();
                    new_elem.properties = { id: e.target.toGeoJSON().properties.id };
                    return new_elem;
                } else return elem;
            });
            template.objects = new_template_objects;
            localStorage.setItem("current_template", JSON.stringify(template));
            put_to_save(e.layer.toGeoJSON(), object_name_to_save, template.survey_name, template);
        });
        layer.on("pm:drag", (e) => {
            const new_template_objects = template.objects.map((elem) => {
                if (elem.properties.id == e.target.toGeoJSON().properties.id) {
                    const new_elem = e.target.toGeoJSON();
                    new_elem.properties = { id: e.target.toGeoJSON().properties.id };
                    return new_elem;
                } else return elem;
            });
            template.objects = new_template_objects;
            localStorage.setItem("current_template", JSON.stringify(template));
            put_to_save(e.layer.toGeoJSON(), object_name_to_save, template.survey_name, template);
        });
        layer.on("pm:remove", (e) => {
            const new_template_objects = template.objects.filter((elem) => elem.properties.id !== e.layer.toGeoJSON().properties.id);
            template.objects = new_template_objects;
            localStorage.setItem("current_template", JSON.stringify(template));
            put_to_delete(object_name_to_save, template.survey_name, template);
            // put_to_save(e.layer.toGeoJSON(), object_name_to_save, template.survey_name, template);
        });
        layer.on("pm:cut", (e) => {
            const new_template_objects = template.objects.map((elem) => {
                if (elem.properties.id == e.target.toGeoJSON().properties.id) {
                    const new_elem = e.layer.toGeoJSON();
                    new_elem.properties = { id: e.target.toGeoJSON().properties.id };
                    return new_elem;
                } else return elem;
            });
            e.layer.feature.properties = { id: e.originalLayer.toGeoJSON().properties.id };
            template.objects = new_template_objects;
            localStorage.setItem("current_template", JSON.stringify(template));
            if (e.layer.toGeoJSON().type === "FeatureCollection" && e.layer.toGeoJSON().features.length === 0) {
                console.log("empty", object_name_to_save);
                put_to_delete(object_name_to_save, template.survey_name, template);
            } else {
                put_to_save(e.layer.toGeoJSON(), object_name_to_save, template.survey_name, template);
            }
        });
        L.PM.reInitLayer(layer);
    };

    const disable_edit = (layer) => {
        layer.setStyle({ pmIgnore: true, color: "dodgerblue" });
        L.PM.reInitLayer(layer);
    };

    const compare_geom = (geom) => {
        let orig = JSON.stringify(orig_objects[25].geometry.coordinates[0][0]);
        let new_geom = JSON.stringify(geom.geometry.coordinates[0][0]);
        // let new_geom = JSON.stringify(geom)
        // let new_geom = geom[0][0].map(elem => {
        //     const point = map.latLngToLayerPoint(elem)
        //     return point
        // })
        // console.log(map.latLngToLayerPoint(new_geom))
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

    const read_geometries_to_send = (survey_name) => {
        new_geometries = [];
        geometries_to_delete = [];
        var transaction = db.transaction(["objects_to_save"], "readonly");
        var store = transaction.objectStore("objects_to_save");
        // var request = store.getAll();
        var request = store.getAllKeys();
        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {
            e.target.result.forEach((elem) => {
                if (elem.includes(survey_name)) {
                    console.log(elem);
                    get_new_geometries(elem);
                }
            });
        };
        var transaction = db.transaction(["objects_to_delete"], "readonly");
        var store = transaction.objectStore("objects_to_delete");
        // var request = store.getAll();
        var request = store.getAllKeys();
        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {
            e.target.result.forEach((elem) => {
                if (elem.includes(survey_name)) {
                    geometries_to_delete.push(elem);
                }
            });
        };
    };

    const get_new_geometries = (key) => {
        var transaction = db.transaction(["objects_to_save"], "readonly");
        var store = transaction.objectStore("objects_to_save");
        var request = store.get(key);
        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {
            new_geometries.push(e.target.result);
        };
    };

    const parse_tables = () => {
        let table_data = [];
        // console.log(template.survey_name)
        // read_geometries_to_send(template.survey_name);
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
        console.log("1", new_geometries);
        new_geometries.forEach((elem) => {
            console.log("elem", elem);
            console.log("string", JSON.stringify(elem));
        });
        console.log("2", JSON.stringify(new_geometries));
        console.log("1", geometries_to_delete);
        console.log("2", JSON.stringify(geometries_to_delete));
        data_to_send.push({ id: "new_geometries", val: JSON.stringify(new_geometries) });
        data_to_send.push({ id: "geometries_to_delete", val: JSON.stringify(geometries_to_delete) });
        send_data(data_to_send);
    };

    const send_data = async (data) => {
        console.log("data_to_send", data);
        let string = JSON.stringify(data);
        console.log("string", string);
        string = string.replace(/\+/gi, "%2B");
        const post = await fetch(server_url + "/send_standestimation_data?data=" + string).then((response) => response.json());
    };
</script>

<svelte:window on:resize={resize} on:orientationchange={resize} />

<ul id="menu">
    <li>
        <button on:click|preventDefault={() => (is_map = false)} class:selected={!is_map}>survey</button>
    </li>
    |
    <li>
        <button on:click|preventDefault={() => (is_map = true)} class:selected={is_map}>map</button>
    </li>
</ul>

{#if is_object_missing}
    <div style="color: red;">Отсутствует {object_name}</div>
{/if}

<div class:hidden={is_map}>
    <button on:click={save_survey}>save</button>
    <div>
        <!-- {#if dictionary} -->
        {#if template}
            {template.survey_name}
        {/if}
        <!-- {/if} -->
        <button on:click={compare_geom}>test</button>
        <button on:click={parse_tables}>test to send</button>
        <button on:click={console.log(JSON.stringify(new_geometries))}>stringify</button>

        <!-- <button
            on:click={() => {
                console.log(new_geom);
            }}>test to send</button
        > -->
        <div class="parsed">
            <Parsed {template} />
            <button on:click={save_survey}>save</button>
        </div>
    </div>
</div>
<div class:hidden={!is_map}>
    <div style="height: {height}" class="map" id="map">
        <slot />
    </div>
    current layer: {layer_name_to_edit}
    <button on:click={() => enable_edit(layer_to_edit)}>enable edit</button>
    <button on:click={() => disable_edit(layer_to_edit)}>disable edit</button>
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

<script>
    import { onMount } from "svelte";
import { init } from "svelte/internal";

    export let url;
    export let dictionary;
    let templates_list;
    let initial_fields;
    let initial_fields_values;
    let db;
    let object_code = "";
    let active_template = '';

    onMount(async () => {
        let server = url + `/get_templates_list`;
        const res = await fetch(server);
        const result = await res.json();
        templates_list = JSON.parse(result);
        if (!("indexedDB" in window)) {
            console.log("This browser doesn't support IndexedDB");
            return;
        }
        var db_mobilesurvey = indexedDB.open("db_mobilesurvey", 1);
        db_mobilesurvey.onsuccess = function (e) {
            db = e.target.result;
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
            if (!db.objectStoreNames.contains("mbtiles")) {
                var mbtiles = db.createObjectStore("mbtiles", {
                    autoIncrement: true,
                });
            }
            if (!db.objectStoreNames.contains("complete_surveys")) {
                var complete_surveys = db.createObjectStore(
                    "complete_surveys",
                    {
                        autoIncrement: true,
                    }
                );
            }
        };
    });
    const get_initial_fields = async (id) => {
        active_template = id;
        let server = url + `/get_initial_fields?id=` + id;
        const res = await fetch(server);
        const result = await res.json();
        console.log(JSON.parse(result).initial_fields)
        initial_fields = await JSON.parse(result).initial_fields;
        console.log(initial_fields)
        initial_fields_values = initial_fields.map((elem) => {
            elem.value = "";
            return elem;
        });

    };
    const generate_survey = async (id) => {
        initial_fields_values.map((elem) => {
            object_code = object_code + elem.value + "-";
        });
        object_code = object_code.slice(0, -1);
        let server =
            url +
            `/generate_objects?id=` +
            id +
            "&values=" +
            JSON.stringify(initial_fields_values);
        let server2 =
            url +
            `/generate_survey?id=` +
            id +
            "&values=" +
            JSON.stringify(initial_fields_values);
        let mbtiles_url =
            url +
            `/generate_mbtiles?id=` +
            id +
            "&values=" +
            JSON.stringify(initial_fields_values);

        const pre_objects = await fetch(server).then((response) =>
            response.json()
        );
        const pre_survey = await fetch(server2).then((response) =>
            response.json()
        );
        const survey = JSON.parse(pre_survey);
        const object_id = survey.survey_body.object_code;
        const pre_objects2 = JSON.parse(pre_objects);
        const objects = pre_objects2.map((elem) => {
            const new_elem = {};
            const geometry = JSON.parse(elem.st_asgeojson);
            new_elem.geometry = geometry;
            new_elem.properties = {};
            new_elem.properties.id = elem[object_id];
            new_elem.type = "Feature";
            return new_elem;
        });
        const survey_name = survey.survey_body.name + " " + object_code;
        survey.objects = objects;
        survey.survey_name = survey_name;
        const mbitles = await fetch(mbtiles_url).then((response) =>
            response.blob().then((blob) => save_mbtiles(blob, survey_name))
        );
        save_survey(survey, survey_name);
    };

    const save_mbtiles = (file, survey_name) => {
        console.log(file);
        var transaction = db.transaction(["mbtiles"], "readwrite");
        var store = transaction.objectStore("mbtiles");

        var request = store.put(file, survey_name);

        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {};
    };

    const save_survey = (survey, survey_name) => {
        var transaction = db.transaction(["templates"], "readwrite");
        var store = transaction.objectStore("templates");

        var request = store.put(survey, survey_name);

        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {};
    };
</script>

<div>
    <!-- {#if dictionary} -->
    {#if templates_list}
        {#each templates_list as template}
            <div on:click={get_initial_fields(template.survey_id)}>
                <div>
                    {template.survey_id}
                </div>
                <div>
                    {template.survey_name}
                </div>
                <hr />
            </div>
            {#if initial_fields_values}
                {#if active_template === template.survey_id}
                    {#each initial_fields_values as field}
                        <div>
                            <div>{field.name}</div>
                            <input bind:value={field.value} type="text" />
                            <hr />
                        </div>
                    {/each}
                    <button on:click={generate_survey(template.survey_id)}
                        >{dictionary.generate_survey}</button
                    >
                {/if}
            {/if}
        {/each}
    {/if}
    <!-- {/if} -->
</div>

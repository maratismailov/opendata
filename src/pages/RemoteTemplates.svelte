<script>
    import { onMount } from "svelte";

    import { init_db } from "../init_db";

    export let server_url;
    export let dictionary;
    let templates_list;
    let initial_fields;
    let initial_fields_values;
    let db;
    let object_code = "";
    let active_template = "";
    let is_loading = false;
    let is_ready = false;
    let is_error = false;
    let error_msg = "";

    onMount(async () => {
        let server = server_url + `/get_templates_list`;
        const res = await fetch(server);
        const result = await res.json();
        templates_list = JSON.parse(result);
        init_db();
        var db_mobilesurvey = indexedDB.open("db_mobilesurvey", 1);
        db_mobilesurvey.onsuccess = function (e) {
            db = e.target.result;
        };
    });
    const get_initial_fields = async (id) => {
        active_template = id;
        let server = server_url + `/get_initial_fields?id=` + id;
        const res = await fetch(server);
        const result = await res.json();
        initial_fields = await JSON.parse(result).initial_fields;
        initial_fields_values = initial_fields.map((elem) => {
            elem.value = "";
            return elem;
        });
    };
    const generate_survey = async (id) => {
        error_msg = ''
        is_error = false
        is_loading = true;
        initial_fields_values.map((elem) => {
            object_code = object_code + elem.value + "-";
        });
        object_code = object_code.slice(0, -1);
        let server = server_url + `/generate_objects?id=` + id + "&values=" + JSON.stringify(initial_fields_values);
        let server2 = server_url + `/generate_survey?id=` + id + "&values=" + JSON.stringify(initial_fields_values);
        let mbtiles_url = server_url + `/generate_mbtiles?id=` + id + "&values=" + JSON.stringify(initial_fields_values);

        const pre_objects1 = await fetch(server);
        const pre_objects = await pre_objects1.json();
        const pre_objects_status = await pre_objects1.status;
        const pre_survey1 = await fetch(server2);
        const pre_survey = await pre_survey1.json();
        const pre_survey_status = await pre_survey1.status;
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
        const mbtiles1 = await fetch(mbtiles_url);
        const mbtiles = await mbtiles1.blob().then((blob) => save_mbtiles(blob, survey_name));
        const mbtiles_status = await mbtiles1.status;
        save_survey(survey, survey_name);
        if (pre_objects_status == "200" && pre_survey_status == "200" && mbtiles_status == "200") {
            is_loading = false;
            is_ready = true;
        } else {
            is_error = true;
            is_loading = false;
            error_msg = pre_objects_status + "\n" + pre_survey_status + "\n" + mbtiles_status;
        }
        setTimeout(() => {
            is_ready = false;
        }, 5000);
    };

    const save_mbtiles = (file, survey_name) => {
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
        var request = store.put(survey, survey_name + '_to_edit');

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
                    <button on:click={generate_survey(template.survey_id)}>{dictionary.generate_survey}</button>
                {/if}
            {/if}
        {/each}
    {/if}

    <!-- <button on:click={() => console.log(db)}>test db</button> -->

    {#if is_loading}
        <img src="assets/icons/loader.svg" alt="loading" style="max-height: 5em" />
    {/if}
    {#if is_ready}
        <img src="assets/icons/ready.svg" alt="ready" style="max-height: 5em" />
    {/if}
    {#if is_error}
        <img src="assets/icons/error.svg" alt="error" style="max-height: 5em" />
    {/if}
    {#if error_msg}
        <div>
            {error_msg}
        </div>
    {/if}

    <!-- {/if} -->
</div>

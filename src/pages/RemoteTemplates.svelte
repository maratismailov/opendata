<script>
    import { onMount } from "svelte";

    export let url;
    export let dictionary;
    let templates_list;
    let initial_fields;
    let initial_fields_values;
    let db;
    let object_code = "";

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
            if (!db.objectStoreNames.contains("objects")) {
                var objects = db.createObjectStore("objects", {
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
        let server = url + `/get_initial_fields?id=` + id;
        const res = await fetch(server);
        const result = await res.json();
        initial_fields = JSON.parse(result).initial_fields;
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
        let server2 = url + `/generate_survey?id=` + id;
        const pre_objects = await fetch(server).then((response) =>
            response.json()
        );
        const pre_survey = await fetch(server2).then((response) =>
            response.json()
        );
        const survey = JSON.parse(pre_survey);
        const objects = JSON.parse(pre_objects);
        const survey_name = survey.survey_body.name + " " + object_code;
        survey.ojbects = objects;
        survey.survey_name = survey_name;
        save_survey(survey, survey_name);
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
        {/each}
    {/if}
    <!-- {/if} -->
</div>

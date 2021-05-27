<script>
    import { onMount } from "svelte";

    import { store_current_template } from "../stores.js";

    export let url;
    export let dictionary;
    let templates_list;
    let initial_fields;
    let initial_fields_values;
    let db;
    let template_list;

    onMount(() => {
        if (!("indexedDB" in window)) {
            console.log("This browser doesn't support IndexedDB");
            return;
        }
        var db_mobilesurvey = indexedDB.open("db_mobilesurvey", 1);
        db_mobilesurvey.onsuccess = function (e) {
            db = e.target.result;
            get_templates();
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
    const get_templates = () => {
        var transaction = db.transaction(["templates"], "readonly");
        var store = transaction.objectStore("templates");
        var request = store.getAllKeys();

        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {
            let list = e.target.result;
            template_list = list.map((elem) => {
                // return JSON.parse(elem);
                return elem;
            });
        };
    };

    const add_survey = (template_name) => {
        console.log(template_name);
        var transaction = db.transaction(["templates"], "readonly");
        var store = transaction.objectStore("templates");
        var request = store.get(template_name.toString());

        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {
            let template = e.target.result;
            console.log(template);
            store_current_template.set(template);
            localStorage.setItem(
                "current_template",
                JSON.stringify(template)
            );
        };
        window.location.href = "/current";
    };
</script>

<div>
    <!-- {#if dictionary} -->
    {#if template_list}
        {#each template_list as template}
            <!-- <div on:click={get_initial_fields(template.survey_id)}> -->
            <div>
                <div>
                    {template}
                </div>
                <div>
                    <input
                        type="image"
                        img
                        src="assets/icons/plus.svg"
                        class="delete"
                        alt="add_survey"
                        on:click={add_survey(template)}
                    />
                </div>
            </div>
            <hr />
        {/each}
    {/if}
    <!-- {/if} -->
</div>

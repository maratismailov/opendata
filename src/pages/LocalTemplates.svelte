<script>
    import { onMount } from "svelte";

    import { store_current_template } from "../stores.js";

    import { init_db } from "../init_db";

    export let dictionary;
    let templates_list;
    let initial_fields;
    let initial_fields_values;
    let db;
    let template_list;
    let complete_surveys;

    onMount(() => {
        init_db();
        var db_mobilesurvey = indexedDB.open("db_mobilesurvey", 1);
        db_mobilesurvey.onsuccess = function (e) {
            db = e.target.result;
            get_templates();
            get_complete_surveys();
        };
        db_mobilesurvey.onerror = function (e) {
            console.log("onerror!");
            console.dir(e);
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

    const get_complete_surveys = () => {
        var transaction = db.transaction(["complete_surveys"], "readonly");
        var store = transaction.objectStore("complete_surveys");
        var request = store.getAllKeys();

        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {
            complete_surveys = e.target.result;
            console.log(complete_surveys);
        };
    };

    const add_survey = (template_name) => {
        console.log(template_name);
        var transaction = db.transaction(["templates"], "readonly");
        var store = transaction.objectStore("templates");
        var request = store.get(template_name.toString() + '_to_edit');

        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {
            let template = e.target.result;
            console.log(template);
            store_current_template.set(template);
            localStorage.setItem("current_template", JSON.stringify(template));
        };
        window.location.href = "/current";
    };
</script>

<div>
    <!-- {#if dictionary} -->
    {#if template_list}
        {#each template_list as template}
            {#if !template.includes("_to_edit")}
                <!-- <div on:click={get_initial_fields(template.survey_id)}> -->
                <div>
                    <div>
                        {template}
                        <div class="complete">
                            {#if complete_surveys}
                                {#each complete_surveys as survey}
                                    <div>
                                        {survey}
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    </div>
                    <div>
                        <input type="image" img src="assets/icons/plus.svg" class="plus" alt="add_survey" on:click={add_survey(template)} />
                    </div>
                </div>
                <hr />
            {/if}
        {/each}
    {/if}
    <!-- {/if} -->
</div>

<script>
    import { onMount } from "svelte";

    export let url;
    export let dictionary;
    let templates_list;
    let initial_fields;
    let initial_fields_values;
    let db;
    let block_list;

    onMount(() => {
        if (!("indexedDB" in window)) {
            console.log("This browser doesn't support IndexedDB");
            return;
        }
        var db_mobilesurvey = indexedDB.open("db_mobilesurvey", 1);
        db_mobilesurvey.onsuccess = function (e) {
            db = e.target.result;
            get_blocks();
        };
        db_mobilesurvey.onerror = function (e) {
            console.log("onerror!");
            console.dir(e);
        };
        db_mobilesurvey.onupgradeneeded = function (e) {
            db = e.target.result;
            if (!db.objectStoreNames.contains("standestimation_templates")) {
                var standestimation_templates = db.createObjectStore(
                    "standestimation_templates",
                    {
                        autoIncrement: true,
                    }
                );
            }
        };
    });
    const get_blocks = () => {
        var transaction = db.transaction(
            ["standestimation_templates"],
            "readonly"
        );
        var store = transaction.objectStore("standestimation_templates");
        var request = store.getAllKeys();

        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {
            let list = e.target.result;
            block_list = list.map((elem) => {
                return JSON.parse(elem);
            });
            console.log(block_list);
        };
    };
    const show_blocks = block => {
        var transaction = db.transaction(
            ["standestimation_templates"],
            "readonly"
        );
        var store = transaction.objectStore("standestimation_templates");
        var request = store.get(block.toString());

        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        };
        request.onsuccess = function (e) {
            let block = e.target.result;
            block = JSON.parse(block)
            // block_list = list.map((elem) => {
            //     return JSON.parse(elem);
            // });
            console.log(block);
        };
    }
</script>

<div>
    <!-- {#if dictionary} -->
    {#if block_list}
        {#each block_list as block}
            <!-- <div on:click={get_initial_fields(template.survey_id)}> -->
            <div on:click={show_blocks(block)}>
                {block}
            </div>
            <hr />
        {/each}
    {/if}
    <!-- {/if} -->
</div>

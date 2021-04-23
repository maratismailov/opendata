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
        console.log(initial_fields_values, id);
        let server =
            url +
            `/generate_survey?id=` +
            id +
            "&values=" +
            JSON.stringify(initial_fields_values);
        const res = await fetch(server);
        const result = await res.json();
        let block_code = JSON.parse(result)[0]
            .stand_code.toString()
            .slice(0, -3);
        save_block(result, block_code);
        // initial_fields = JSON.parse(result).initial_fields;
        // initial_fields_values = initial_fields.map((elem) => {
        //     elem.value = "";
        //     return elem;
        // });
        // console.log(initial_fields_values);
    };
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
</script>

<div>
    <!-- {#if dictionary} -->
    {#if block_list}
        {#each block_list as block}
            <!-- <div on:click={get_initial_fields(template.survey_id)}> -->
            <div>
                {block}
            </div>
            <hr />
        {/each}
    {/if}
    <!-- {/if} -->
</div>

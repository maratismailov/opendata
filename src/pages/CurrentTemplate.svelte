<script>
    import { onMount } from "svelte";

    import { store_current_template } from "../stores.js";

    import Parsed from '../components/Parsed.svelte'

    export let url;
    export let dictionary;
    let template
    let db;

    onMount(() => {
        console.log(template)
        if (!("indexedDB" in window)) {
            console.log("This browser doesn't support IndexedDB");
            return;
        }
        var db_mobilesurvey = indexedDB.open("db_mobilesurvey", 1);
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
    template = JSON.parse(localStorage.getItem('current_template'))

</script>

<div>
    <!-- {#if dictionary} -->
    {#if template}
        {template.survey_name}
    {/if}
    <!-- {/if} -->
    <button on:click={() => {console.log(template)}}>test</button>
</div>

<Parsed template={template}/>

<script>
	import { Route, active } from "tinro";
	import { onMount } from "svelte";

	import RemoteTemplates from "./pages/RemoteTemplates.svelte";
	import LocalTemplates from "./pages/LocalTemplates.svelte";
	import CurrentTemplate from "./pages/CurrentTemplate.svelte";

	import { init_db } from "./init_db";

	let server_url;
	let lng = "ru";
	let dictionary;

	if (!is_production) {
		console.log("Developement Mode");
		if (location.hostname == "localhost" || location.hostname == "0.0.0.0") {
			server_url = "http://0.0.0.0:8000";
			// server_url = "https://dev.forest.caiag.kg/survey-editor";
		} else if (location.hostname == "192.168.20.35") {
			server_url = "http://192.168.20.35:8000";
		}
	} else {
		server_url = "https://dev.forest.caiag.kg/survey-editor";
	}

	onMount(async () => {
		init_db();
		const res = await fetch("https://dev.forest.caiag.kg/" + lng + "/rent/taxdescr/getdictionarysurveyeditor");
		dictionary = await res.json();
	});
</script>

<div class="navbar">
	<a href="/" use:active exact> <img src="assets/icons/cloud.svg" alt="remote" /></a>
	<a href="/local" use:active exact><img src="assets/icons/prepare.svg" alt="prepare" /></a>
	<a href="/current" use:active exact><img src="assets/icons/forest.svg" alt="forest" /></a>
	<a href="/saved" use:active exact><img src="assets/icons/saved.svg" alt="saved" /></a>
</div>

<Route path="/"><RemoteTemplates {server_url} {dictionary} /></Route>
<Route path="/local"><LocalTemplates {server_url} {dictionary} /></Route>
<Route path="/current"><CurrentTemplate {server_url} {dictionary} /></Route>

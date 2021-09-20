<script>
	import { Route, active } from "tinro";
	import { onMount } from "svelte";


	import Main from "./components/Main.svelte";

	import { init_db } from "./init_db";

	let server_url;
	let lng = "ru";
	let dictionary;

	server_url = 'https://toilets4london.herokuapp.com/toilets/?page_size=200'

	onMount(async () => {
		init_db();
	});
</script>


<Route path="/"><Main {server_url}/></Route>

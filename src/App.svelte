<script>
	import { Route, active } from "tinro";

	import RemoteTemplates from "./pages/RemoteTemplates.svelte";
</script>

<div class="navbar">
	<a href="/" use:active exact>
		<img src="assets/icons/cloud.svg" alt="remote" /></a
	>
	<a href="/make" use:active exact
		><img src="assets/icons/prepare.svg" alt="prepare" /></a
	>
	<a href="/local" use:active exact
		><img src="assets/icons/forest.svg" alt="forest" /></a
	>
</div>

<Route path="/"><RemoteTemplates /></Route>

<style>
	.navbar {
		width: 100%;
		display: block;
		bottom: 0;
		position: fixed;
		background-color: #1e1e1e;
	}
	.navbar a {
		float: left;
		padding-top: 3px;
		padding-bottom: 5px;
		color: white;
		text-decoration: none;
		font-size: 17px;
		width: 33.3%; /* Four links of equal widths */
		text-align: center;
		align-content: center;
	}
	.navbar a:hover {
		background-color: lightblue;
	}
	img {
		max-height: 1.5em;
		display: block;
		margin-left: auto;
		margin-right: auto;
	}

	:global(.active) {
		background-color: lightblue;
	}
	/* main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	} */
	:global(body) {
		background-color: #1e1e1e;
		color: #ff7f50;
		font-size: 1em;
		line-height: 1.5;
	}
	/* h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	} */

	/* @media (min-width: 640px) {
		main {
			max-width: none;
		}
	} */
</style>

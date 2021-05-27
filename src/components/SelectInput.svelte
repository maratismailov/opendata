<script>
  import { onMount } from "svelte";
import { select_value } from "svelte/internal";

  export let element;

  const table_name = element.select.table_name;
  const name_column = element.select.name_column;
  const id_column = element.select.id_column;
  const where_clause = element.select.where_clause;

  // const query =
  //   '{  selectList(tableName:"' + table_name + '", nameColumn:"' + name_column + '", idColumn: "' + id_column +'"whereClause: "' + where_clause + '") {    id    name }}';

  // onMount(async () => {
  //   const res = await fetch(`http://192.168.20.35:8000/?query=` + query);
  //   result = await res.json();
  // });

  let selected;
  console.log("element ", element);
  const getIndex = (item) => {
    console.log('item', item)
    return item.findIndex((i) => i.id === 2);
  };
</script>
{#if element.select_values}
<input
  bind:value={element.selected}
  type="text"
/>
{/if}
  {#each element.select_values as option}
  {#if option.code == element.selected}
    <div>{option.name} {option.code}</div>
  {/if}
  {/each}
<br />

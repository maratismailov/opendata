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

  // let selected;
  const getIndex = (item) => {
    return item.findIndex((i) => i.id === 2);
  };
  const get_index = (array, attr, value) => {
    for (var i = 0; i < array.length; i += 1) {
      if (array[i][attr] === value) {
        return i;
      }
    }
    return -1;
  };
</script>

{#if element.select_values}
  <input bind:value={element.value} type="text" />
{/if}
{#each element.select_values as option}
  {#if option.code == element.value}
    <div>{option.name} {option.code}</div>
  <!-- {:else}
    <div>no value</div> -->
  {/if}
{/each}
<!-- {#if element.select_values}
<select bind:value={element.select_values[get_index(element.select_values, 'code', element.selected)]}>
    {#each element.select_values as option}
      <option>{option.name} {option.code}</option>
    {/each}
</select>
{/if} -->
<br />
<!-- <button on:click={() => {console.log(get_index(element.select_values, 'code', element.selected))}}>test</button> -->

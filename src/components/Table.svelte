<script>
  import TextInput from "./TextInput.svelte";
  import NumberInput from "./NumberInput.svelte";
  import SelectInput from "./SelectInput.svelte";

  export let element;
</script>

<style>
  .table {
    margin-left: 25px;
  }
</style>

<div class="table">
  {#each element.fields as element}
    <!-- <div>{element.id}</div> -->
    <div>{element.name}</div>
    {#if element.type === 'text'}
      <TextInput {element} />
    {:else if element.type === 'number'}
      <NumberInput {element} />
    {:else if element.type === 'select'}
      <!-- <input bind:value={element.value} type="number" /> -->
      <SelectInput {element} />
    {/if}
  {/each}
</div>

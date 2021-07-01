<script>
  import TextInput from "./TextInput.svelte";
  import NumberInput from "./NumberInput.svelte";
  import SelectInput from "./SelectInput.svelte";
  import Table from "./Table.svelte";

  export let template;

  const survey = template.survey_body.survey_body;
</script>

<div class={$$props.class}>
  {#if survey}
    {#each survey as element}
      <div class="parsed">
        <div class="name">{element.name}</div>
        <div class="input">
          {#if element.type === "text"}
            <TextInput {element} />
          {:else if element.type === "number"}
            <NumberInput {element} />
          {:else if element.type === "select"}
            <!-- <input bind:value={element.value} type="number" /> -->
            <SelectInput {element} />
          {:else if element.type === "table"}
            <Table {element} />
          {/if}
        </div>
      </div>
      <hr />
    {/each}
  {/if}
</div>

<style>
  .parsed {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas: "name input";
  }

  .name {
    grid-area: name;
  }

  .input {
    grid-area: input;
  }
</style>

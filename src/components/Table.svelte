<script>
  import TextInput from "./TextInput.svelte";
  import NumberInput from "./NumberInput.svelte";
  import SelectInput from "./SelectInput.svelte";

  export let element;

  // let temp_fields = JSON.parse(JSON.stringify(element.fields))
  let origin_elements = JSON.parse(JSON.stringify(element.fields[0]));
  // elements[0] = JSON.parse(JSON.stringify(element.fields));
  // element = JSON.parse(JSON.stringify(elements));

  const add_field = () => {
    // element = []
    // return 's'
    // console.log(elements);
    // element.fields.forEach((elem) => {
    //   console.log(elem.id);
    // });
    element.fields.push(JSON.parse(JSON.stringify(origin_elements)));
    element = element;
    // console.log(elements);
    // element = JSON.parse(JSON.stringify(elements));
  };
</script>

  {#each element.fields as table_element}
    <div >
      <br>
      <br>
      {#each table_element as element}
        <!-- <div>{element.id}</div> -->
        <div class="table">
          <div class="table_name">{element.name}</div>
          <div class="table_input">
            {#if element.type === "text"}
              <TextInput {element} />
            {:else if element.type === "number"}
              <NumberInput {element} />
            {:else if element.type === "select"}
              <!-- <input bind:value={element.value} type="number" /> -->
              <SelectInput {element} />
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/each}

  <input type="image" img src="assets/icons/plus.svg" class="plus" alt="add_field" on:click={add_field} />

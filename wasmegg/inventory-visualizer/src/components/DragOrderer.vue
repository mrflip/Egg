<template>
<div class="flex items-center justify-center DragOrderer">
  <draggable
    v-model="list"
    v-bind="dragOptions"
    item-key="name"
    tag="ul"
    :component-data="{ tag: 'ul', class: `flex ${flexDir}`, name: 'orderable-list', onEnd: handleUpdate }"
    @start="dragging = true"
    @end="dragging = false"
    >
    <template #item="{ element }">
      <li :key="element.name" class="border rounded-md mb-2 px-2 py-1.5 flex orderable-item" :class="`${element.id} ${itemClasses}`">
        <slot name="listItem" :element="element">{{ element.name }}</slot>
      </li>
    </template>
  </draggable>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { defineComponent, PropType } from 'vue';
import draggable from 'vuedraggable';
//
import { Orderables, Orderable } from '@/lib';

function listFromLayoutOrder(layoutOrder: Orderables): Orderable[] {
  if (! layoutOrder) { return [{ name: 'null layoutOrder', id: 'oops', weight: -1, img: '', desc: '', area: 'typ', grain: 3 }] }
  return _.sortBy([...Object.values(layoutOrder)], 'weight')
}

export default defineComponent({
  name: "DragOrderer",
  // display: "Transition",
  order: 8,

  components: {
    draggable
  },

  props: {
    layoutOrder: { type: Object as PropType<Orderables>, required: true },
    direction:   { type: String, default: 'horiz' },
    itemClasses: { type: String, default: '' },
    group:       { type: String, required: true },
  },

  emits: ['updateOrder'],

  data() {
    return {
      flexDir:  ((this.direction === 'vert') ? 'flex-col' : 'flex-col sm:flex-row'),
      list: listFromLayoutOrder(this.layoutOrder),
      dragging: false
    };
  },

  computed: {
    dragOptions() {
      return {
        animation:      0,
        group:          this.group,
        disabled:       false,
        ghostClass:     "ghost",
        dragClass:      "chosen",
      };
    },
  },

  watch: {
    layoutOrder(newVal) {
      this.list = listFromLayoutOrder(newVal) as Orderable[]
    },
  },

  methods: {
    handleUpdate() {
      const updated = Object.fromEntries(
        this.list.map((val: Orderable, idx): [string, Orderable] => [val.id, { ...val, weight: idx + 1 }])
      )
      this.$emit('updateOrder', updated);
    },
  },

});
</script>

<style scoped>
.ghost {
  opacity:    0.5;
  background: #c8ebfb;
}
.chosen {}
.orderable-item {
  cursor: grab;
}
.orderable-list-move {
  transition: transform 0.0s;
}
.no-move {
  transition: transform 0s;
}
</style>

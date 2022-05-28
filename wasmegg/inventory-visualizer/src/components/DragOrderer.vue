<template>
<div class="flex items-center justify-center DragOrderer">
  <draggable
    item-key="name"
    tag="ul"
    :component-data="{ tag: 'ul', class: `flex ${flexDir} ${direction}`, name: 'orderable-list', onEnd: this.handleUpdate }"
    v-model="list"
    v-bind="dragOptions"
    @start="isDragging = true"
    @end="isDragging = false"
    >
    <template #item="{ element }">
      <li class="border mx-4 my-1 px-2 py-1.5 flex orderable-item" :class="`${element.id} ${itemClasses}`" :key="element.name">
        <slot name="listItem" :element="element">{{ element.name }}</slot>
      </li>
    </template>
  </draggable>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { defineComponent } from 'vue';
import draggable from 'vuedraggable';
//
import { Orderables } from '@/lib';

function listFromLayoutOrder(layoutOrder) {
  if (! layoutOrder) { return [{ name: 'null layoutOrder' }] }
  return _.sortBy([...Object.values(layoutOrder)], 'weight')
}

export default defineComponent({
  name: "Drag Orderer",
  // display: "Transition",
  order: 8,
  components: {
    draggable
  },
  props: {
    layoutOrder: { type: Object as Orderables },
    direction: { type: String, default: 'horiz' },
    itemClasses: { type: String },
  },
  emits: ['updateOrder'],
  methods: {
    handleUpdate(args) {
      const updated = Object.fromEntries(
        this.list.map((val, idx) => [val.id, { ...val, weight: idx + 1 }])
      )
      this.$emit('updateOrder', updated);
    },
  },
  watch: {
    layoutOrder(newVal) {
      this.list = listFromLayoutOrder(newVal)
    },
  },
  data() {
    return {
      flexDir:  ((this.direction === 'vert') ? 'flex-col' : 'flex-row'),
      list: listFromLayoutOrder(this.layoutOrder),
      dragging: false
    };
  },
  computed: {
    dragOptions() {
      return {
        animation: 0,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
        dragClass: "chosen",
      };
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

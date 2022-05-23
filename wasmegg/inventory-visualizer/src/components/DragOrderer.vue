<template>
<div class="flex items-center justify-center mb-3 DragOrderer">
  <div class="m-3">Order of Rarity Groups:</div>
  <draggable
    item-key="name"
    tag="transition-group"
    :component-data="{ tag: 'ul', class: 'flex flex-row', name: 'orderable-list', onEnd: this.handleUpdate, type: 'transition' }"
    v-model="list"
    v-bind="dragOptions"
    @start="isDragging = true"
    @end="isDragging = false"
    >
    <template #item="{ element }">
      <li class="border mx-4 flex orderable-item" :class="element.name">
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

export default defineComponent({
  name: "Drag Orderer",
  display: "Transition",
  order: 8,
  components: {
    draggable
  },
  props: {
    layoutOrder: { type: Object as Orderables },
  },
  emits: ['updateOrder'],
  data() {
    return {
      list: _.sortBy([...Object.values(this.layoutOrder)], 'weight'),
      dragging: false
    };
  },
  methods: {
    handleUpdate(args) {
      const updated = Object.fromEntries(this.list.map((val, idx) => [val.name, { ...val, weight: idx + 1 }]))
      this.$emit('updateOrder', updated);
    },
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

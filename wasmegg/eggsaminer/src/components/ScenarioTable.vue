<template>
  <div class="flex flex-col">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div class="shadow overflow-hidden border-b border-gray-900 sm:rounded-lg">
          <table class="min-w divide-y divide-gray-200 tabular-nums">

              <slot></slot>

          </table>
        </div>
      </div>
    </div>
  </div>
</template>

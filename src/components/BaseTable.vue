<template>
  <table class="score-table">
    <thead class="score-table-head">
      <tr class="no-hover score-table-head__row">
        <th
          class="score-table-head__cell"
          v-for="theading in thead"
          :key="theading"
        >
          {{ theading }}
        </th>
      </tr>
    </thead>
    <tbody class="score-table-body">
      <tr
        v-for="record in tbody"
        :key="record.id"
        :id="record.id"
        class="score-table-body__row"
      >
        <td class="score-table-body__data-cell">
          {{ record.address }}
        </td>
        <td class="score-table-body__data-cell">{{ record.notes }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { note } from "../models/note";

interface ITableProps {
  thead: string[];
  tbody: note[];
}

defineProps<ITableProps>();
</script>

<style scoped lang="scss">
.score-table {
  border-collapse: collapse;
  font-size: 0.9em;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  border-bottom: 2px solid $color-primary;
  margin: 0 auto;
  &-head__row {
    background-color: $color-primary;
    color: white;
    text-align: left;
  }

  &-head__cell,
  &-body__data-cell {
    padding: 12px 15px;
  }

  &-body {
    &__row {
      border-bottom: 1px solid #dddddd;

      &:nth-child(even) {
        background-color: hsl(0, 0%, 95%);
      }
    }
  }
}
</style>

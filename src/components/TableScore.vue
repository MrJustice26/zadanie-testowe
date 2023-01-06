<template>
  <div>
    <BaseTable :thead="tableHeading" :tbody="notesToRender"></BaseTable>

    <BasePagination
      v-model="currentPage"
      :pages-amount="pagesAmount"
      v-if="tableBody.length > rowsPerPageLimit"
    ></BasePagination>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BaseTable from "./BaseTable.vue";
import BasePagination from "./BasePagination.vue";

interface ITableBodyRow {
  id: string;
  address: string;
  notes: string;
}

interface ITableScoreProps {
  tableHeading: string[];
  tableBody: ITableBodyRow[];
  rowsPerPageLimit: number;
  defaultPage?: number;
}

const props = defineProps<ITableScoreProps>();

const pagesAmount = Math.ceil(props.tableBody.length / props.rowsPerPageLimit);
const currentPage = ref(1);

const positionStart = computed(
  () => (currentPage.value - 1) * props.rowsPerPageLimit + 1
);
const positionEnd = computed(() => currentPage.value * props.rowsPerPageLimit);

const notesToRender = computed(() =>
  props.tableBody.filter((_, recordIdx) => {
    const recordPosition: number = recordIdx + 1;
    return (
      recordPosition >= positionStart.value &&
      recordPosition <= positionEnd.value
    );
  })
);
</script>

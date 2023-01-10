<template>
  <div>
    <BaseTable :thead="tableHeading" :tbody="notesToRender"></BaseTable>

    <BasePagination
      v-model="currentPage"
      :pages-amount="getPagesAmount"
      v-if="tableBody.length > rowsPerPageLimit"
    ></BasePagination>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BaseTable from "./BaseTable.vue";
import BasePagination from "./BasePagination.vue";
import { INote } from "../models/note";

interface ITableScoreProps {
  tableHeading: string[];
  tableBody: INote[];
  rowsPerPageLimit: number;
  defaultPage?: number;
}

const props = defineProps<ITableScoreProps>();

const getRowsLength = computed(() => props.tableBody.length);

const getPagesAmount = computed(() =>
  Math.ceil(getRowsLength.value / props.rowsPerPageLimit)
);
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

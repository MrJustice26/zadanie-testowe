<template>
  <div class="pagination">
    <BaseButton
      class="btn btn-primary"
      :disabled="!canGoBack"
      @click="goToPage(currentPage - 1)"
      >Back</BaseButton
    >
    <BaseButton
      class="btn btn-primary"
      :disabled="!canGoForward"
      @click="goToPage(currentPage + 1)"
      >Next</BaseButton
    >
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseButton from "./BaseButton.vue";

interface PaginationProps {
  modelValue: number;
  pagesAmount: number;
}

const props = defineProps<PaginationProps>();

const currentPage = computed(() => props.modelValue);

const canGoBack = computed(() => currentPage.value > 1);
const canGoForward = computed(() => currentPage.value < props.pagesAmount);
const emit = defineEmits(["update:modelValue"]);

const goToPage = (page: number) => {
  emit("update:modelValue", page);
};
</script>

<style>
.pagination {
  display: flex;
  justify-content: center;
  column-gap: 50px;
  margin: 25px 0 40px;
}
</style>

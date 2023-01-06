<template>
  <TableScore
    :table-body="tableBody"
    :table-heading="tableHeading"
    :rows-per-page-limit="rowsPerPageLimit"
    :default-page="defaultPage"
  ></TableScore>
  <LeafletMap></LeafletMap>
</template>

<script setup lang="ts">
import TableScore from "./components/TableScore.vue";
import LeafletMap from "./components/LeafletMap.vue";
import tableBody from "./mocks/mockNotes";
const tableHeading = ["Address", "Zawartość notatek"];

const rowsPerPageLimit = 3;
const defaultPage = 1;
</script>
<style scoped></style>

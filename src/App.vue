<template>
  <main>
    <div class="container">
      <TableScore
        v-if="!areNotesEmpty"
        :table-body="notes"
        :table-heading="tableHeading"
        :rows-per-page-limit="rowsPerPageLimit"
        :default-page="defaultPage"
      ></TableScore>
      <LeafletMap
        v-if="!areLeafletNotesEmpty"
        :notes="leafletNotes"
      ></LeafletMap>
    </div>
  </main>
</template>

<script setup lang="ts">
import TableScore from "./components/TableScore.vue";
import LeafletMap from "./components/LeafletMap.vue";
import { onMounted, ref, watch, computed } from "vue";
import { note } from "./models/note";

const tableHeading = ["Address", "Zawartość notatek"];
const rowsPerPageLimit = 10;
const defaultPage = 1;

const notes = ref<[] | note[]>([]);
const leafletNotes = ref<[] | string[]>([]);

const areNotesEmpty = computed(() => notes.value.length === 0);
const areLeafletNotesEmpty = computed(() => leafletNotes.value.length === 0);

const fetchRecentNotes = async () => {
  try {
    const response = await fetch(
      "https://wavy-media-proxy.wavyapps.com/investors-notebook/?action=get_entries"
    );
    notes.value = await response.json();
  } catch (e) {
    console.error(e);
  }
};

watch(notes, (newNode) => {
  if (newNode) {
    leafletNotes.value = notes.value.map((note) => note.Notes);
  }
});

onMounted(() => {
  fetchRecentNotes();
});
</script>
<style lang="scss">
main {
  margin-top: 50px;
}
.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}
</style>

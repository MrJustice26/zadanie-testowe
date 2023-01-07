<template>
  <main>
    <div class="container">
      <NotesChecker
        v-if="areNotes"
        @check-data-validity="fetchRecentNotes"
        :notes="notes"
      />
      <TableScore
        v-if="areNotes"
        :table-body="notes"
        :table-heading="tableHeading"
        :rows-per-page-limit="rowsPerPageLimit"
        :default-page="defaultPage"
      />
      <LeafletMap v-if="areLeafletNotes" :notes="leafletNotes" />
    </div>
  </main>
</template>

<script setup lang="ts">
import TableScore from "./components/TableScore.vue";
import LeafletMap from "./components/LeafletMap.vue";
import NotesChecker from "./components/NotesChecker.vue";
import { onMounted, ref, watch, computed } from "vue";
import { note } from "./models/note";

const tableHeading = ["Address", "Zawartość notatek"];
const rowsPerPageLimit = 10;
const defaultPage = 1;

const notes = ref<[] | note[]>([]);
const leafletNotes = ref<[] | string[]>([]);

const areNotes = computed(() => notes.value.length);
const areLeafletNotes = computed(() => leafletNotes.value.length);

const fetchRecentNotes = async () => {
  try {
    const response = await fetch(
      "https://wavy-media-proxy.wavyapps.com/investors-notebook/?action=get_entries"
    );

    notes.value = [
      {
        Id: `${new Date().toISOString()}`,
        Address: "Szpitalna 26, Poznań, wielkopolskie",
        Notes: "Poznań miasto doznań",
      },
      ...notes.value,
    ];
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

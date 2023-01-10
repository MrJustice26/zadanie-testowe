<template>
  <main>
    <div class="container">
      <NotesChecker
        v-if="areNotes"
        @check-data-validity="fetchRecentNotes"
        :notes="notes"
        :force-delay="forceDelay"
      />
      <TableScore
        v-if="areNotes"
        :table-body="notes"
        :table-heading="tableHeading"
        :rows-per-page-limit="rowsPerPageLimit"
        :default-page="defaultPage"
      />
      <LeafletMap v-if="areILeafletNotes" :notes="leafletNotes" />
    </div>
  </main>
</template>

<script setup lang="ts">
import TableScore from "./components/TableScore.vue";
import LeafletMap from "./components/LeafletMap.vue";
import NotesChecker from "./components/NotesChecker.vue";
import { onMounted, ref, watch, computed } from "vue";
import { INote, ILeafletNote } from "./models/note";
import mockEntries from "./mocks/mockEntries";

// NOTESCHECKER ADDITIONAL DATA
const forceDelay = 10;

// TABLESCORE DATA
const tableHeading = ["Address", "Zawartość notatek"];
const rowsPerPageLimit = 10;
const defaultPage = 1;
const notes = ref<[] | INote[]>([]);
const areNotes = computed(() => notes.value.length);

// LEAFLETMAP DATA
const leafletNotes = ref<[] | ILeafletNote[]>([]);
const areILeafletNotes = computed(() => leafletNotes.value.length);

const fetchRecentNotes = async () => {
  try {
    const response = await fetch(
      "https://wavy-media-proxy.wavyapps.com/investors-notebook/?action=get_entries"
    );
    const receivedData = await response.json();

    // W Przypadku gdy serwer nie zadziała.
    if (receivedData[0]?.errorCode) {
      notes.value = mockEntries;
    } else {
      notes.value = receivedData;
    }
  } catch (e) {
    console.error(e);
  }
};

watch(notes, (newNode) => {
  if (newNode) {
    leafletNotes.value = notes.value.map((note) => ({
      Notes: note.Notes,
    }));
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

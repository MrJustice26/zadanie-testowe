<template>
  <div class="notes-checker">
    <div class="notes-checker__column">
      <p
        :class="[
          'badge',
          dataValidityText === DataValidity.OLD ? 'green' : 'red',
        ]"
      >
        <b>{{ noteDiffCounter }}</b> nowych wpisów
      </p>
    </div>
    <div class="notes-checker__column">
      <p>
        Do odświeżenia danych zostało <b>{{ timerValue }}</b> sekund
      </p>

      <BaseButton
        class="btn-primary"
        @click="fetchChecker?.forceFetch()"
        :disabled="canForceCheck"
      >
        Wymuś sprawdzenie
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, onUnmounted, computed, watch } from "vue";
import { note } from "../models/note";
import BaseButton from "./BaseButton.vue";

interface NotesCheckerProps {
  notes: note[];
  delay?: number;
}

interface IFetchChecker {
  destroy: () => void;
  forceFetch: () => void;
}

const props = defineProps<NotesCheckerProps>();
const savedNotes: note[] | [] = props.notes;
const noteDiffCounter = ref(0);

const getParentNotes = computed(() => props.notes);

const emit = defineEmits(["checkDataValidity"]);
const timerValue: Ref<number | null> = ref(null);

const canForceCheck = computed(() => timerValue.value && timerValue.value > 50);

enum DataValidity {
  ACTUAL = "Aktualne",
  OLD = "Stare",
}

const dataValidityText: Ref<DataValidity> = ref<DataValidity>(
  DataValidity.ACTUAL
);

const getNewNotesAmount = () => {
  if (getParentNotes.value.length) {
    let counter = 0;
    const theMostRecentSavedNoteId = savedNotes[0]?.Id;
    for (let note of getParentNotes.value) {
      if (note.Id === theMostRecentSavedNoteId) break;
      counter++;
    }
    noteDiffCounter.value = counter;
  }
};

const checkNotesDiff = () => {
  if (savedNotes.length !== getParentNotes.value.length) {
    dataValidityText.value = DataValidity.OLD;
    getNewNotesAmount();
    return;
  }

  for (let noteIdx in savedNotes) {
    if (savedNotes[noteIdx]?.Id !== getParentNotes.value[noteIdx]?.Id) {
      dataValidityText.value = DataValidity.OLD;
      getNewNotesAmount();
      return;
    }
  }

  dataValidityText.value = DataValidity.ACTUAL;
};

getNewNotesAmount();

watch(getParentNotes, checkNotesDiff);

const loadFetcherTimer = (delay: number = 60) => {
  timerValue.value = delay;
  const emitInterval = setInterval(() => {
    timerValue.value = timerValue.value! - 1;
    if (timerValue.value === 0) {
      emit("checkDataValidity");
      timerValue.value = delay;
    }
  }, 1000);

  return {
    destroy: () => {
      clearInterval(emitInterval);
    },
    forceFetch: () => {
      emit("checkDataValidity");
      timerValue.value = delay;
    },
  };
};

let fetchChecker: IFetchChecker | null = null;

onMounted(() => {
  fetchChecker = loadFetcherTimer(props.delay);
});

onUnmounted(() => {
  fetchChecker?.destroy();
});
</script>

<style scoped lang="scss">
.notes-checker {
  max-width: 500px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 0 20px rgb(0 0 0 / 15%);
  padding: 15px 15px;

  &__column {
    &:not(:last-child) {
      margin-bottom: 20px;
    }
    p {
      margin: 0;
      margin-bottom: 5px;
    }
  }
}
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 10px;
  color: white;
  &.green {
    background-color: $color-success;
  }

  &.red {
    background-color: $color-primary;
  }
}
</style>

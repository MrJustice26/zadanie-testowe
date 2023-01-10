<template>
  <div id="map" style="width: 100%; min-height: min(450px, 45vh)"></div>
</template>
<script setup lang="ts">
import L from "leaflet";
import { onMounted, onUnmounted, computed, ref, Ref, watch } from "vue";
import { ILeafletNote } from "../models/note";

interface LeafletMapProps {
  notes: ILeafletNote[];
  pointsLimit?: number;
}

let map: L.Map | undefined;

const props = defineProps<LeafletMapProps>();

const getPointsLimit = computed(() => props.pointsLimit);
const getNotes = computed(() => props.notes);

const leafletData: Ref<L.Marker<any>[]> = ref([]);

const setupLeafletMap = () => {
  map = L.map("map", {
    zoomAnimation: false,
    fadeAnimation: true,
    markerZoomAnimation: true,
  }).setView([52, 20], 6);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  loadPoints();
};

// Z api otrzymujemy 100 najnowszych wpisów, czyli mogę usunąć poprzednie i w pusty array dodać nowe.
const loadPoints = () => {
  getNotes.value.forEach((note: ILeafletNote) => {
    const marker = L.marker(generateGeoData());

    leafletData.value.unshift(marker);

    marker.addTo(map).bindPopup(note.Notes).openPopup();
  });
};

const deletePoints = () => {
  leafletData.value.forEach((point: L.Marker<any>) => {
    map?.removeLayer(point);
  });

  leafletData.value = [];
};

const deleteLeafletMap = () => {
  map?.off();
  map?.remove();
};

const reloadPoints = () => {
  deletePoints();
  loadPoints();
};

// Ponieważ https://wavy-media-proxy.wavyapps.com/investors-notebook/?action=get_entries zwraca bez lat i lng
const generateGeoData = (): [number, number] => {
  const lat = Math.random() * 4 + 50;
  const lng = Math.random() * 6 + 15;
  return [lat, lng];
};

onMounted(() => {
  setupLeafletMap();
});

onUnmounted(() => {
  deleteLeafletMap();
});

watch(getNotes, () => reloadPoints());
</script>

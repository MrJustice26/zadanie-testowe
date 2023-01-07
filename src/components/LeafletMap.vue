<template>
  <div id="map" style="width: 100%; height: 500px"></div>
</template>
<script setup lang="ts">
import L from "leaflet";
import { onMounted } from "vue";
interface LeafletMapProps {
  notes: string[];
}

let map: L.Map | undefined;

const props = defineProps<LeafletMapProps>();

const setupLeafletMap = () => {
  map = L.map("map").setView([52, 20], 6);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  props.notes.forEach((note) => {
    L.marker(generateGeoData()).addTo(map).bindPopup(note).openPopup();
  });
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
</script>

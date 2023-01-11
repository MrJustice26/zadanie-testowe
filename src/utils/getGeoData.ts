// Ponieważ https://wavy-media-proxy.wavyapps.com/investors-notebook/?action=get_entries zwraca bez lat i lng
const generateGeoData = (): [number, number] => {
  const lat = Math.random() * 4 + 50;
  const lng = Math.random() * 6 + 15;
  return [lat, lng];
};

export { generateGeoData };

const $form = document.querySelector("#form");
const $voivodeshipsSelect = document.querySelector("#voivodeshipsSelect");
const $citiesSelect = document.querySelector("#citiesSelect");
const $streetInput = document.querySelector("#streetInput");
const $notesInput = document.querySelector("#notesInput");

let voivodeships = [];
let cities = {};

let selectedVoivodeship = {};
let selectedCity = {};
let streetValue = "";
let notesValue = "";

window.addEventListener("load", init);
$form.addEventListener("submit", submitForm);

function init() {
  initVoivodeships();
  initCities();
}

$voivodeshipsSelect.addEventListener("change", function () {
  selectedVoivodeship = voivodeships.find(
    (voivodeship) => voivodeship.unique_name === this.value
  );
  const desiredCities = cities[selectedVoivodeship.id];
  renderOptions(desiredCities, $citiesSelect, "Wybierz miasto");
});

$citiesSelect.addEventListener("change", function () {
  selectedCity = cities[selectedVoivodeship.id].find(
    (city) => city.unique_name === this.value
  );
});

$streetInput.addEventListener("input", function () {
  streetValue = this.value;
});

$notesInput.addEventListener("input", function () {
  notesValue = this.value;
});

// Ładowanie oraz dodanie do selektora województw
async function initVoivodeships() {
  const receivedVoivodeships = await getVoivodeships();
  renderOptions(
    receivedVoivodeships,
    $voivodeshipsSelect,
    "Wybierz Województwo"
  );

  voivodeships = receivedVoivodeships;
}
async function getVoivodeships() {
  const response = await fetch(
    "https://wavy-media-proxy.wavyapps.com/investors-notebook/data/wojewodztwa.json"
  );
  return await response.json();
}

function renderOptions(options, $parent, defaultOption) {
  const optionsArrayToHTML = [
    `<option value="" disabled selected>${
      defaultOption || "Wybierz opcję"
    }</option>`,
  ];
  options.forEach((option) => {
    optionsArrayToHTML.push(
      `<option value=${option.unique_name}>${option.name}</option>`
    );
  });

  $parent.innerHTML = optionsArrayToHTML.join();
}

async function initCities() {
  const receivedCities = await getCities();
  const citiesSegregated = segregateCities(receivedCities);

  cities = citiesSegregated;
}

async function getCities() {
  const response = await fetch(
    "https://wavy-media-proxy.wavyapps.com/investors-notebook/data/miasta.json"
  );
  return await response.json();
}

function segregateCities(cities) {
  const sortedCitiesAlphabetically = cities.sort((cityA, cityB) =>
    cityA.name.localeCompare(cityB.name)
  );
  return sortedCitiesAlphabetically.reduce((acc, city) => {
    const voivodeshipId = city.voivodeship_id;
    if (acc[voivodeshipId]) acc[voivodeshipId].push(city);
    else acc[voivodeshipId] = [city];
    return acc;
  }, {});
}

function submitForm(e) {
  e.preventDefault();
  if (
    !(
      selectedVoivodeship?.name &&
      selectedCity?.name &&
      streetValue &&
      notesValue
    )
  ) {
    return;
  }

  const payload = {
    Address: `${selectedVoivodeship.name},${selectedCity.name},${streetValue}`,
    Notes: notesValue,
  };

  addNotes(payload);
}

async function addNotes(payload) {
  try {
    const response = await fetch(
      "https://wavy-media-proxy.wavyapps.com/investors-notebook/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5500",
          "Access-Control-Allow-Origin": "http://localhost:5500",
        },
        body: JSON.stringify(payload),
      }
    );

    const content = await response?.json();
    console.log(content);
  } catch (e) {
    console.error(e);
  }
}

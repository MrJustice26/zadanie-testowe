const $form = document.querySelector("#form");
const $voivodeshipsSelect = document.querySelector("#voivodeshipsSelect");
const $citiesSelect = document.querySelector("#citiesSelect");
const $streetInput = document.querySelector("#streetInput");
const $notesInput = document.querySelector("#notesInput");

const $tableBody = document.querySelector("table tbody");

let voivodeships = [];
let cities = {};
let notes = [];

let selectedVoivodeship = {};
let selectedCity = {};
let addressValue = "";
let notesValue = "";

window.addEventListener("load", init);
$form.addEventListener("submit", submitForm);
$form.addEventListener("reset", clearForm);
$notesInput.addEventListener("input", function () {
  adjustTextArea(this);
});
function init() {
  initVoivodeships();
  initCities();
  loadTable();

  fillForm();
}

$voivodeshipsSelect.addEventListener("change", handleVoivodeshipsSelectChange);

function handleVoivodeshipsSelectChange() {
  selectedVoivodeship = voivodeships.find(
    (voivodeship) => voivodeship.unique_name === this.value
  );
  const desiredCities = cities[selectedVoivodeship.id];
  renderCitiesList(desiredCities, $citiesSelect);
}

$citiesSelect.addEventListener("change", handleCitiesSelectChange);

function handleCitiesSelectChange() {
  selectedCity = cities[selectedVoivodeship.id].find(
    (city) => city.unique_name === this.value
  );
}

$streetInput.addEventListener("input", function () {
  addressValue = this.value;
});

$notesInput.addEventListener("input", function () {
  notesValue = this.value;
});

// Ładowanie oraz dodanie do selektora województw
async function initVoivodeships() {
  const receivedVoivodeships = await fetchUrlGET(
    "https://wavy-media-proxy.wavyapps.com/investors-notebook/data/wojewodztwa.json"
  );

  renderVoivodeshipsList(receivedVoivodeships, $voivodeshipsSelect);
  voivodeships = receivedVoivodeships;
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

async function fetchUrlGET(url) {
  const response = await fetch(url);
  return await response.json();
}

async function initCities() {
  const receivedCities = await fetchUrlGET(
    "https://wavy-media-proxy.wavyapps.com/investors-notebook/data/miasta.json"
  );
  const citiesSegregated = segregateCities(receivedCities);

  cities = citiesSegregated;
  clearCitiesList();
}

function clearCitiesList() {
  renderOptions([], $citiesSelect, "Brak danych do wyświetlenia");
}

function renderCitiesList(data, $parent) {
  renderOptions(data, $parent, "Wybierz miasto");
}

function renderVoivodeshipsList(data, $parent) {
  renderOptions(data, $parent, "Wybierz Województwo");
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
      addressValue &&
      notesValue
    )
  ) {
    return;
  }

  const payload = {
    Address: `${selectedVoivodeship.name},${selectedCity.name},${addressValue}`,
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
    loadTable();
  } catch (e) {
    return false;
  }
}

async function loadTable() {
  const receivedNotes = await fetchUrlGET(
    "https://wavy-media-proxy.wavyapps.com/investors-notebook/?action=get_entries"
  );

  notes = receivedNotes;
  renderTableDataCells(receivedNotes, $tableBody);
}

function renderTableDataCells(data, $parent) {
  const dataToHTML = data.map((record) => {
    return `
    <tr data-id="${record?.Id}">
    <td>${record?.Address}</td>
    <td>${record?.Notes}</td>
    </tr>
    `;
  });
  $parent.innerHTML = dataToHTML.join("");
  $parent
    .querySelectorAll("tr")
    .forEach((tableRow) =>
      tableRow.addEventListener("click", () =>
        handleTableDataClick(tableRow.getAttribute("data-id"))
      )
    );
}

function handleTableDataClick(id) {
  rewriteUrl(`?id=${id}`);
  loadNote(id);
}

function rewriteUrl(query = "") {
  history.replaceState({}, null, location.href.split("?")[0] + query);
}

function getParamByKey(queryKey) {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  return params[queryKey];
}

async function loadNote(id) {
  const data = await fetchUrlGET(
    `https://wavy-media-proxy.wavyapps.com/investors-notebook/?action=get_entry&entry_id=${id}`
  );

  const [_, cityName, voivodeshipName] = data[0]?.Address.split(", ");
  addressValue = data[0]?.Address.split(", ")[0];
  notesValue = data[0]?.Notes;

  if (addressValue && cityName && voivodeshipName && notesValue) {
    const desiredVoivodeship = voivodeships.find(
      (voivodeship) => voivodeship.name === voivodeshipName
    );
    selectedVoivodeship = desiredVoivodeship;

    const desiredCitiy = cities[selectedVoivodeship.id]?.find(
      (city) => city.name === cityName
    );
    selectedCity = desiredCitiy;

    $voivodeshipsSelect.value = selectedVoivodeship.unique_name;
    renderCitiesList(cities[selectedVoivodeship.id], $citiesSelect);

    $citiesSelect.value = selectedCity.unique_name;

    $streetInput.value = addressValue;
    $notesInput.value = notesValue;
  }
}

function fillForm() {
  const id = getParamByKey("id");
  if (id) {
    loadNote(id);
  }
}

function clearForm() {
  rewriteUrl();
}

function adjustTextArea(element) {
  element.style.height = "1px";
  element.style.height = 25 + element.scrollHeight + "px";
}

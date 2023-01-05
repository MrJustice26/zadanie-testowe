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
let selectedNote = {};

window.addEventListener("load", init);

function init() {
  initVoivodeships();
  initCities();
  loadTable();

  fillForm();
}

$form.addEventListener("submit", submitForm);
$form.addEventListener("reset", clearForm);

$voivodeshipsSelect.addEventListener("change", handleVoivodeshipsSelectChange);

$citiesSelect.addEventListener("change", handleCitiesSelectChange);

$streetInput.addEventListener("input", function () {
  $streetInput.value = this.value;
});

$notesInput.addEventListener("input", function () {
  adjustTextArea(this);
});
$notesInput.addEventListener("input", function () {
  $notesInput.value = this.value;
});

// ============== LOGIKA ZWIĄZANA Z WOJEWÓDZTWAMI ==============

async function initVoivodeships() {
  const receivedVoivodeships = await fetchGET(
    "https://wavy-media-proxy.wavyapps.com/investors-notebook/data/wojewodztwa.json"
  );

  renderVoivodeshipsList(receivedVoivodeships, $voivodeshipsSelect);
  voivodeships = receivedVoivodeships;
}

function renderVoivodeshipsList(data, $parent) {
  renderOptions(data, $parent, "Wybierz Województwo");
}

function handleVoivodeshipsSelectChange() {
  selectedVoivodeship = voivodeships.find(
    (voivodeship) => voivodeship.unique_name === this.value
  );
  const desiredCities = cities[selectedVoivodeship.id];
  renderCitiesList(desiredCities, $citiesSelect);
}

// ============== LOGIKA ZWIĄZANA Z MIASTAMI ==============

async function initCities() {
  const receivedCities = await fetchGET(
    "https://wavy-media-proxy.wavyapps.com/investors-notebook/data/miasta.json"
  );
  const citiesSegregated = segregateCities(receivedCities);

  cities = citiesSegregated;
  clearCitiesList();
}

function clearCitiesList() {
  renderOptions([], $citiesSelect, "Brak danych do wyświetlenia");
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

function renderCitiesList(data, $parent) {
  renderOptions(
    data,
    $parent,
    data.length > 0 ? "Wybierz miasto" : "Brak danych do wyświetlenia"
  );
}

function handleCitiesSelectChange() {
  selectedCity = cities[selectedVoivodeship.id].find(
    (city) => city.unique_name === this.value
  );
}

// ============== LOGIKA ZWIĄZANA Z NOTATKAMI ==============

async function addNote(payload) {
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
    console.error(e);
  }
}
// ============== /LOGIKA ZWIĄZANA Z NOTATKAMI ==============

// ============== LOGIKA ZWIĄZANA Z TABLICĄ ==============
async function loadTable() {
  const receivedNotes = await fetchGET(
    "https://wavy-media-proxy.wavyapps.com/investors-notebook/?action=get_entries"
  );

  notes = receivedNotes;
  renderTableDataCells(receivedNotes, $tableBody);
}

function renderTableDataCells(data, $parent) {
  const dataToHTML = data.map((record) => {
    const $tr = document.createElement("tr");
    $tr.dataset.id = record?.Id;
    $tr.addEventListener("click", () => handleTableDataClick($tr.dataset.id));

    const $tdAddress = document.createElement("td");
    $tdAddress.textContent = record?.Address;

    const $tdNote = document.createElement("td");
    $tdNote.textContent = record?.Notes;

    $tr.appendChild($tdAddress);
    $tr.appendChild($tdNote);
    return $tr;
  });

  $parent.innerHTML = "";
  dataToHTML.forEach((node) => {
    $parent.appendChild(node);
  });
}

function handleTableDataClick(id) {
  rewriteUrl(`?id=${id}`);
  loadFormDataById(id);
}

// ============== /LOGIKA ZWIĄZANA Z TABLICĄ ==============

function rewriteUrl(query = "") {
  history.replaceState({}, null, location.href.split("?")[0] + query);
}

function getParamByKey(queryKey) {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  return params[queryKey];
}

// ============== /LOGIKA ZWIĄZANA Z FORMULARZEM ==============

function submitForm(e) {
  e.preventDefault();
  if (
    !(
      selectedVoivodeship?.name &&
      selectedCity?.name &&
      $streetInput.value &&
      $notesInput.value
    )
  ) {
    return;
  }

  const payload = {
    Address: `${selectedVoivodeship.name},${selectedCity.name},${$streetInput.value}`,
    Notes: $notesInput.value,
  };

  addNote(payload);
}

async function loadFormDataById(id) {
  if (!id || id === selectedNote?.Id) return;
  const desiredNote = notes.find((note) => note.Id === id);
  let data;
  if (desiredNote) {
    data = desiredNote;
  } else {
    try {
      arrayOfDatas = await fetchGET(
        `https://wavy-media-proxy.wavyapps.com/investors-notebook/?action=get_entry&entry_id=${id}`
      );
    } catch (e) {
      console.error(e);
    }
    data = arrayOfDatas[0];
  }
  selectedNote = data;

  const { Notes: receivedNotes, Address: address } = selectedNote;
  const [streetName, cityName, voivodeshipName] = address
    .split(",")
    .map((text) => text.trim());

  if (!(streetName && cityName && voivodeshipName && receivedNotes)) return;

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

  $streetInput.value = streetName;
  $notesInput.value = receivedNotes;
}

function fillForm() {
  const id = getParamByKey("id");
  if (id) {
    loadFormDataById(id);
  }
}

function clearForm() {
  rewriteUrl();
  renderCitiesList([], $citiesSelect);
}

function adjustTextArea(element) {
  element.style.height = "1px";
  element.style.height = 25 + element.scrollHeight + "px";
}

// ============== /LOGIKA ZWIĄZANA Z FORMULARZEM ==============

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

async function fetchGET(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (e) {
    console.error(e);
  }
}

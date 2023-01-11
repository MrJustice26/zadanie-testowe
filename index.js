// Elementy otrzymane z DOM
const $form = document.querySelector("#form");
const $voivodeshipsSelect = document.querySelector("#voivodeshipsSelect");
const $citiesSelect = document.querySelector("#citiesSelect");
const $addressInput = document.querySelector("#addressInput");
const $notesTextarea = document.querySelector("#notesTextarea");

const $tableBody = document.querySelector("table tbody");

// Instancje klassy VoivodeShipSelect i CitiesSelect
let voivodeshipsController;
let citiesController;

// Instancje AddressInput i NotesTextarea
let addressController;
let notesController;

// Instancja tablicy
let tableController;

const selectedNote = {};

window.addEventListener("load", init);

async function init() {
  tableController = new NotesTable(
    $tableBody,
    "https://wavy-media-proxy.wavyapps.com/investors-notebook/?action=get_entries"
  );

  await tableController.initTableDataCells();

  // Tworzymy instancje klasy VoivodeshipSelect dla województw
  voivodeshipsController = new VoivodeshipSelect(
    $voivodeshipsSelect,
    "https://wavy-media-proxy.wavyapps.com/investors-notebook/inst6/data/wojewodztwa.json"
  );

  await voivodeshipsController.init();

  // Tworzymy instancje klasy CitiesSelect dla miast
  citiesController = new CitiesSelect(
    $citiesSelect,
    "https://wavy-media-proxy.wavyapps.com/investors-notebook/inst6/data/miasta.json"
  );
  await citiesController.init();

  // Tworzymy instancje klasy AddressInput
  addressController = new AddressInput($addressInput);

  // Tworzymy instancje klasy NotesTextarea
  notesController = new NotesTextarea($notesTextarea);

  fillForm();

  // Dodanie event listenerów
  initEventListeners();
}

function initEventListeners() {
  voivodeshipsController.addChangeListener(function () {
    voivodeshipsController.selectedOption = voivodeshipsController
      .getData()
      .find((v) => v.unique_name === this.value);
    citiesController.renderCitiesById(voivodeshipsController.selectedOption.id);
  });

  citiesController.addChangeListener(function () {
    const voivodeshipId = voivodeshipsController.getSelectedOption()["id"];
    const availableCities =
      citiesController.getAvailableCities()[voivodeshipId];
    citiesController.selectedOption = availableCities.find(
      (city) => city.unique_name === this.value
    );
  });

  $addressInput.addEventListener("input", function () {
    addressController.setValue(this.value);
  });

  $notesTextarea.addEventListener("input", function () {
    notesController.setValue(this.value);
    notesController.adjustTextAreaHeight(this);
  });

  $form.addEventListener("submit", submitForm);
  $form.addEventListener("reset", resetForm);
}

class Select {
  $selector;

  changeFunction;
  activeEventListener;

  data;
  urlToFetch;

  defaultOption;
  selectedOption;

  constructor(selector, urlToFetch, defaultOption = "") {
    this.$selector = selector;
    this.urlToFetch = urlToFetch;
    this.defaultOption = defaultOption;
  }

  async initOptions(urlToFetch, shouldBeRendered = true) {
    this.data = await this.fetchOptions(urlToFetch);
    if (shouldBeRendered) {
      this.renderOptions(this.data);
    }
  }

  getSelectedOption() {
    return this.selectedOption;
  }

  getData() {
    return this.data;
  }

  getSelector() {
    return this.$selector;
  }

  setValue(voivodeship) {
    if (voivodeship?.unique_name) {
      this.selectedOption = voivodeship;
      this.$selector.value = this.selectedOption["unique_name"];
    } else {
      this.$selector.value = "";
      this.selectedOption = {};
    }
  }

  clearSelectedOption() {
    this.setValue("");
  }

  renderOptions(options, defaultOption = this.defaultOption) {
    const optionsArrayToHTML = [];
    options.forEach((option) => {
      optionsArrayToHTML.push(
        `<option value=${option.unique_name}>${option.name}</option>`
      );
    });

    const defaultoptionText =
      optionsArrayToHTML.length > 0
        ? defaultOption
        : "Brak danych do wyświetlenia";
    const defaultOptionHTML = `<option value="" disabled selected>${defaultoptionText}</option>`;

    optionsArrayToHTML.unshift(defaultOptionHTML);

    this.$selector.innerHTML = optionsArrayToHTML.join();
  }

  async fetchOptions(url) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  addChangeListener(callback) {
    if (this.activeEventListener) {
      this.$selector.removeEventListener(
        this.activeEventListener,
        this.changeFunction
      );
    }
    this.changeFunction = callback;
    this.activeEventListener = this.$selector.addEventListener(
      "change",
      callback
    );
  }

  runChangeFunction() {
    this.changeFunction();
  }

  destroy() {
    this.$selector.removeEventListener(
      this.activeEventListener,
      this.changeFunction
    );
  }
}

class VoivodeshipSelect extends Select {
  constructor(selector, urlToFetch) {
    super(selector, urlToFetch, "Wybierz województwo");
  }

  getData() {
    return super.getData();
  }

  async init() {
    await super.initOptions(this.urlToFetch);
  }
}

class CitiesSelect extends Select {
  citiesToShow;
  constructor(selector, urlToFetch) {
    super(selector, urlToFetch, "Wybierz miasto");
  }

  getData() {
    return super.getData();
  }

  getAvailableCities() {
    return this.citiesToShow;
  }

  async init() {
    await super.initOptions(this.urlToFetch, false);
    this.segregateCities();
  }

  segregateCities() {
    const sortedCitiesAlphabetically = this.getData().sort((cityA, cityB) =>
      cityA.name.localeCompare(cityB.name)
    );
    this.citiesToShow = sortedCitiesAlphabetically.reduce((acc, city) => {
      const voivodeshipId = city.voivodeship_id;
      if (acc[voivodeshipId]) acc[voivodeshipId].push(city);
      else acc[voivodeshipId] = [city];
      return acc;
    }, {});
  }

  async renderCitiesById(voivodeshipId) {
    this.renderOptions(this.citiesToShow[voivodeshipId]);
    this.activeVoivodeshipId = voivodeshipId;

    this.$selector.value = "";
    this.selectedOption = {};
  }
}

class BaseTextField {
  $selector;
  value;
  constructor(selector) {
    this.$selector = selector;
    this.value = "";
  }

  setValue(value) {
    this.$selector.value = value;
    this.value = value;
  }

  clearValue() {
    this.setValue("");
  }

  getValue() {
    return this.value;
  }
}
class AddressInput extends BaseTextField {
  constructor(selector) {
    super(selector);
  }
}

class NotesTextarea extends BaseTextField {
  constructor(selector) {
    super(selector);
  }

  adjustTextAreaHeight() {
    this.$selector.style.height = "1px";
    this.$selector.style.height = 25 + this.$selector.scrollHeight + "px";
  }
}

class NotesTable {
  $selector;
  data;
  constructor($selector, urlToFetch) {
    this.$selector = $selector;
    this.urlToFetch = urlToFetch;
  }

  getData() {
    return this.data;
  }

  async initTableDataCells() {
    await this.fetchTableDataCells();
    this.renderTableDataCells(this.data);
  }

  async fetchTableDataCells() {
    try {
      const response = await fetch(this.urlToFetch);
      const receivedData = await response.json();

      if (receivedData[0]?.errorCode) this.data = mockEntries;
      else this.data = receivedData;
    } catch (e) {
      console.error(e);
    }
  }

  async renderTableDataCells(data) {
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

    this.$selector.innerHTML = "";
    dataToHTML.forEach((node) => {
      this.$selector.appendChild(node);
    });
  }
}

function handleTableDataClick(id) {
  rewriteUrl(`?id=${id}`);
  loadFormDataById(id);
}

// ============== LOGIKA ZWIĄZANA Z FORMULARZEM ==============

async function loadFormDataById(id) {
  if (!id || id === selectedNote?.Id) return;
  const desiredNote = tableController.getData().find((note) => note.Id === id);
  if (desiredNote) {
    // ! ZMIENIŁEM KOLEJNOŚĆ, W API OTRZYMUJEMY ADDRESS I VOIVODESHIP ODWROTNIE.
    const [receivedAddress, receivedCityName, receivedVoivodeshipName] =
      desiredNote.Address.split(", ");
    const receivedNotes = desiredNote.Notes;

    const desiredVoivodeship = voivodeshipsController
      .getData()
      .find((voivodeship) => voivodeship.name === receivedVoivodeshipName);
    if (desiredVoivodeship) {
      const desiredVoivodeshipId = desiredVoivodeship["id"];
      voivodeshipsController.setValue(desiredVoivodeship);

      const desiredCity = citiesController
        .getAvailableCities()
        [desiredVoivodeshipId].find((city) => city.name === receivedCityName);
      citiesController.renderCitiesById(desiredVoivodeshipId);
      citiesController.setValue(desiredCity);

      addressController.setValue(receivedAddress);
      notesController.setValue(receivedNotes);
    } else {
      alert("Error with data!");
    }
  }
}

function resetForm(e) {
  e.preventDefault();
  clearForm(true);
}

function clearForm(resetUrl = false) {
  voivodeshipsController.clearSelectedOption();
  citiesController.clearSelectedOption();
  addressController.clearValue();
  notesController.clearValue();
  if (resetUrl) rewriteUrl();
}

function submitForm(e) {
  e.preventDefault();

  const voivodeshipName = voivodeshipsController.getSelectedOption()?.name;
  const cityName = citiesController.getSelectedOption()?.name;
  const addressValue = addressController.getValue();
  const notesValue = notesController.getValue();

  const errors = validateForm(
    voivodeshipName,
    cityName,
    addressValue,
    notesValue
  );

  const errorValues = Object.keys(errors).map((errorKey) => errors[errorKey]);

  if (errorValues.length) {
    alert(errorValues.join("\n"));
    return;
  }

  const payload = {
    Address: `${voivodeshipName},${cityName},${addressValue}`,
    Notes: notesValue,
  };
  clearForm(true);
  addNote(payload);
}

function validateForm(voivodeshipValue, cityValue, addressValue, notesValue) {
  const errors = {};
  if (!voivodeshipValue || voivodeshipValue.trim() === "") {
    errors.voivodeship = "Musisz zaznaczyć jedną opcje z województw!";
  }
  if (!cityValue || cityValue.trim() === "") {
    errors.cityValue = "Musisz zaznaczyć jedną opcje z miast!";
  }
  if (addressValue.trim() === "") {
    errors.addressValue = "Pole address nie może być puste!";
  }
  if (notesValue.trim() === "") {
    errors.notesValue = "Pole notatki nie może być puste!";
  }

  return errors;
}

function fillForm() {
  const id = getParamByKey("id");
  if (id) {
    loadFormDataById(id);
  }
}

// ============== /LOGIKA ZWIĄZANA Z FORMULARZEM ==============

// ============== UTILS

function rewriteUrl(query = "") {
  history.replaceState({}, null, location.href.split("?")[0] + query);
}

function getParamByKey(queryKey) {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  return params[queryKey];
}

async function addNote(payload) {
  try {
    const response = await fetch(
      "https://wavy-media-proxy.wavyapps.com/investors-notebook/inst6/",
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.status == 200) {
      tableController.initTableDataCells();
    }
  } catch (e) {
    console.error(e);
  }
}

// Dane, w przypadku gdy serwer nie zadziała.
var mockEntries = [
  {
    Id: "1",
    Notes: "Witaj swit! 1",
    Address: "pl. Defilad 1, Warszawa, mazowieckie",
  },
  {
    Id: "2",
    Notes: "Następna stacja...",
    Address: "pole Mokotowskie, Warszawa, mazowieckie",
  },
  {
    Id: "3",
    Notes: "Poznań - miasto doznań",
    Address: "pl. Defilad 3, Poznań, wielkopolskie",
  },
];

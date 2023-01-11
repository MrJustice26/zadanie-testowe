// Elementy otrzymane z DOM
const $form = document.querySelector("#form");
const $voivodeshipsSelect = document.querySelector("#voivodeshipsSelect");
const $citiesSelect = document.querySelector("#citiesSelect");
const $addressInput = document.querySelector("#addressInput");
const $notesTextarea = document.querySelector("#notesTextarea");

// Instancje klassy VoivodeShipSelect i CitiesSelect
let voivodeshipsController;
let citiesController;

// Instancje AddressInput i NotesTextarea
let addressController;
let notesController;

// Inicjalizacja aplikacji
window.addEventListener("load", init);

function init() {
  // Tworzymy instancje klasy VoivodeshipSelect dla województw
  voivodeshipsController = new VoivodeshipSelect(
    $voivodeshipsSelect,
    "https://wavy-media-proxy.wavyapps.com/investors-notebook/inst6/data/wojewodztwa.json"
  );

  // Tworzymy instancje klasy CitiesSelect dla miast
  citiesController = new CitiesSelect(
    $citiesSelect,
    "https://wavy-media-proxy.wavyapps.com/investors-notebook/inst6/data/miasta.json"
  );

  // Tworzymy instancje klasy AddressInput
  addressController = new AddressInput($addressInput);

  // Tworzymy instancje klasy NotesTextarea
  notesController = new NotesTextarea($notesTextarea);

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
  });

  $form.addEventListener("submit", submitForm);
  $form.addEventListener("reset", resetForm);
}

class Selector {
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
    this.setValue({});
  }

  renderOptions(options, defaultOption = this.defaultOption) {
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

    this.$selector.innerHTML = optionsArrayToHTML.join();
  }

  async fetchOptions(url) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (e) {
      console.error(e);
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

class VoivodeshipSelect extends Selector {
  constructor(selector, urlToFetch) {
    super(selector, urlToFetch, "Wybierz województwo");
    this.init();
  }

  getData() {
    return super.getData();
  }

  async init() {
    await super.initOptions(this.urlToFetch);
  }
}

class CitiesSelect extends Selector {
  citiesToShow;
  constructor(selector, urlToFetch) {
    super(selector, urlToFetch, "Wybierz miasto");
    this.init();
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

  addNotes(payload);
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

async function addNotes(payload) {
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

    const content = await response;
    console.log(content);
  } catch (e) {
    console.error(e);
  }
}

function resetForm(e) {
  e.preventDefault();
  voivodeshipsController.clearSelectedOption();
  citiesController.clearSelectedOption();
  addressController.clearValue();
  notesController.clearValue();
}

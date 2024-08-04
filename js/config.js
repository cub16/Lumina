// config.js

// Datos default del usuario
const userDataDefaults = {
  theme: "dark",
  notes: [],
};

const APP_INFO = {
  version: "v0.2.0",
  resetFactorySettings: () => {
    localStorage.clear();
    Object.assign(userData, userDataDefaults);
    localStorage.setItem("userData", JSON.stringify(userData));
    location.reload();
  },
  workspaceCSS: "style/frameworks/pico.classless.slate.min.css",
  workspaceFont: "style/Roboto-Regular.ttf",
};

let userData = {
  theme: "dark",
  notes: [],
};

// Cargar datos desde localStorage si existen
if (localStorage.getItem("userData")) {
  Object.assign(userData, JSON.parse(localStorage.getItem("userData")));
} else {
  APP_INFO.resetFactorySettings();
}

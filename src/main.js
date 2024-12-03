import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router";
import axios from "axios";
import store from "./store/store";

import "./index.css";
// Import Flowbite styles
import "flowbite/dist/flowbite.css";
import "flowbite";

// Import Flowbite JavaScript

const authToken = localStorage.getItem("authToken");
const userDataString = localStorage.getItem("userData");
const authData = userDataString ? JSON.parse(userDataString) : null;

// Inisialisasi state di Vuex store jika data tersedia
if (authToken && authData) {
  store.dispatch("saveUserDataAndToken", { token: authToken, user: authData });
}

const app = createApp(App);

const apiUrl = `${import.meta.env.VITE_HOSTNAME}${
  import.meta.env.VITE_PORT
}/api`;

// Set base URL untuk Axios
axios.defaults.baseURL = apiUrl;

app.use(router).use(store).mount("#app");

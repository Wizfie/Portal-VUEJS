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

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api"; // Fallback ke default jika kosong

// Set base URL untuk Axios
axios.defaults.baseURL = apiUrl;

// Axios global
// axios.defaults.baseURL = "http://10.129.48.138:8080/api";
// axios.defaults.baseURL = "http://172.20.10.2:8080/api";
// axios.defaults.baseURL = "http://192.168.199.199:8080/api";
// axios.defaults.baseURL = "http://192.168.1.7:8080/api";

app.use(router).use(store).mount("#app");

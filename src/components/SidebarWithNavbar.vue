<script setup>
import { onMounted, ref } from "vue";
import { initFlowbite } from "flowbite";
import axios from "axios";
import router from "../router/router";
import Swal from "sweetalert2";
import store from "@/store/store";
import {
  handleSuccess,
  handleError,
  isSidebarOpen,
  sidebarToggle,
} from "@/utils/utils";
const token = store.getters.getAuthToken;
const user = store.getters.getUserData;

onMounted(() => {
  initFlowbite();
});

const Logout = async () => {
  const result = await Swal.fire({
    position: "center",
    title: "Sign Out?",
    showConfirmButton: true,
    showCancelButton: true,
  });
  if (!result.isConfirmed) return;
  try {
    const response = await axios.post("/auth/logout", null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      localStorage.clear();
      await store.dispatch("clearAuthToken"); // Bersihkan state di store
      handleSuccess("Logout", "Success ");
      router.push({ name: "login" });
    } else {
      handleError("Logout", "Fail Logout");
      console.error("Logout Fail" + response.statusText);
    }
  } catch (error) {
    console.error("Logout Fail" + error.message);
  }
};
</script>
<template>
  <nav
    class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
  >
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start rtl:justify-end">
          <!-- data-drawer-target="logo-sidebar" -->
          <!-- data-drawer-toggle="logo-sidebar" -->
          <button
            @click="sidebarToggle"
            aria-controls="logo-sidebar"
            type="button"
            class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          >
            <span class="sr-only">Buka sidebar</span>
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              ></path>
            </svg>
          </button>
          <a href="#" class="flex ms-2 md:me-24">
            <img
              src="./../assets/Gajah_Tunggal.png"
              class="h-8 me-3"
              alt="Logo GT"
            />
            <span
              class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-black"
              >GT Logistik</span
            >
          </a>
        </div>
        <div class="flex items-center">
          <div class="flex items-center ms-3">
            <div>
              <button
                type="button"
                class="flex text-sm rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                aria-expanded="false"
                data-dropdown-toggle="dropdown-user"
              >
                <span class="sr-only">Buka menu pengguna</span>

                <img
                  class="w-10 h-10 rounded-full"
                  src="./../assets/user.png"
                  alt="foto pengguna"
                />
              </button>
            </div>

            <div
              class="z-50 hidden my-4 text-base list-none boroder border-1 me-5 bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600"
              id="dropdown-user"
            >
              <div class="me-5 border border-1">
                <div class="px-6 py-4 w-56" role="none">
                  <p
                    class="text-sm text-center text-gray-900 dark:text-white"
                    role="none"
                  >
                    {{ user.username.toUpperCase() }}
                  </p>
                  <p
                    class="text-sm text-center font-medium text-gray-900 truncate dark:text-gray-300"
                    role="none"
                  >
                    {{ user.role }}
                  </p>
                </div>
                <hr />

                <ul class="py-1" role="none">
                  <li>
                    <router-link
                      to="/userguide"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                      role="menuitem"
                      >User Guide</router-link
                    >
                  </li>
                  <li>
                    <a
                      @click="Logout"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                      role="menuitem"
                      >Keluar</a
                    >
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <aside
    id="logo-sidebar"
    :class="{
      'transform-none': isSidebarOpen,
      '-translate-x-full lg:translate-x-0': !isSidebarOpen,
    }"
    class="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 lg:translate-x-0"
    aria-label="Sidebar"
  >
    <div class="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
      <ul class="space-y-2 font-medium">
        <li>
          <p>Halo, {{ user.username.toUpperCase() }}</p>
        </li>
        <hr />
        <li>
          <a
            href="/dashboard"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              id="bold"
              enable-background="new 0 0 24 24"
              height="512"
              viewBox="0 0 24 24"
              width="512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path
                  d="m9.25 0h-7.5c-.965 0-1.75.785-1.75 1.75v4.5c0 .965.785 1.75 1.75 1.75h7.5c.965 0 1.75-.785 1.75-1.75v-4.5c0-.965-.785-1.75-1.75-1.75z"
                />
                <path
                  d="m9.25 10h-7.5c-.965 0-1.75.785-1.75 1.75v10.5c0 .965.785 1.75 1.75 1.75h7.5c.965 0 1.75-.785 1.75-1.75v-10.5c0-.965-.785-1.75-1.75-1.75z"
                />
                <path
                  d="m22.25 16h-7.5c-.965 0-1.75.785-1.75 1.75v4.5c0 .965.785 1.75 1.75 1.75h7.5c.965 0 1.75-.785 1.75-1.75v-4.5c0-.965-.785-1.75-1.75-1.75z"
                />
                <path
                  d="m22.25 0h-7.5c-.965 0-1.75.785-1.75 1.75v10.5c0 .965.785 1.75 1.75 1.75h7.5c.965 0 1.75-.785 1.75-1.75v-10.5c0-.965-.785-1.75-1.75-1.75z"
                />
              </g>
            </svg>
            <span class="ms-3">Dasbor</span>
          </a>
        </li>
        <li v-if="user.role === `ADMIN`">
          <router-link
            to="/admin-event"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              id="Layer_1"
              enable-background="new 0 0 53 53"
              height="512"
              viewBox="0 0 53 53"
              width="512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="_x33_3_1_">
                <path d="m8.5 32.645h2.983v2.984h-2.983z" />
                <path d="m27.117 32.645h4.786v2.983h-4.786z" />
                <path d="m17.861 41.519h3.004v2.983h-3.004z" />
                <path d="m33.903 32.645h3.188v2.983h-3.188z" />
                <path d="m43.185 32.645h1.314v2.983h-1.314z" />
                <path d="m8.5 41.518h2.983v2.984h-2.983z" />
                <path d="m39.091 32.645h2.095v2.983h-2.095z" />
                <path
                  d="m45.5 2.5h-38c-2.7600098 0-5 2.25-5 5v38c0 2.7600098 2.2399902 5 5 5h38c2.7600098 0 5-2.2399902 5-5v-38c0-2.75-2.2399902-5-5-5zm.9998779 29.1452637v4.9833984c0 .5522461-.4477539 1-1 1-5.6276779 0-22.1915131 0-28.6391602 0-.5522461 0-1-.4477539-1-1v-4.9833984c0-.5522461.4477539-1 1-1 .1025791 0 29.1118584 0 28.6391602 0 .5522461 0 1 .4477539 1 1zm-5.3279419-25.1429444c1.0974731 0 1.9954834.8979492 1.9954834 2.0045776 0 1.0974731-.8980103 1.9954224-1.9954834 1.9954224-1.1065674 0-2.0045166-.8979492-2.0045166-1.9954224 0-1.1066283.8979493-2.0045776 2.0045166-2.0045776zm-4.2919311 8.1677246c.3499756-1.1900024 1.2000122-2.1700439 2.289978-2.710022.5800171.3400269 1.2700195.5399781 2 .5399781s1.4100342-.1999512 2-.539978c1.0900269.539978 1.9400024 1.5200195 2.289978 2.710022.1900024.6400146-.2999878 1.289978-.9599609 1.289978h-6.6600342c-.6599731 0-1.1499634-.6499634-.9599609-1.2899781zm6.2874145 5.9083252c0 1.0974731-.8980103 1.9954224-1.9954834 1.9954224-1.1065674 0-2.0045166-.8979492-2.0045166-1.9954224 0-1.1065674.8979492-2.0045776 2.0045166-2.0045776 1.0974732 0 1.9954834.8980103 1.9954834 2.0045776zm-6.2874145 6.1616822c.3499756-1.1900024 1.2000122-2.1600342 2.289978-2.710022.5800171.3400269 1.2700195.539978 2 .539978s1.4100342-.1999512 2-.539978c1.0900269.5499878 1.9400024 1.5200195 2.289978 2.710022.1900024.6399536-.2999878 1.289978-.9599609 1.289978h-6.6600342c-.6599731 0-1.1499634-.6500244-.9599609-1.289978zm-5.8962403-19.237854c0-.5522461.4477539-1 1-1s1 .4477539 1 1v20.9057617c0 .5522461-.4477539 1-1 1s-1-.4477539-1-1zm-12.7421875.0508423c4.5819702.467041 8.223938 4.1089478 8.6911621 8.6908569h-8.6911621zm8.6912232 10.6908569c-.5006104 4.9107666-4.6478882 8.7419434-9.690979 8.7419434-2.3300171 0-4.46698-.8200684-6.1433105-2.1843262l6.5571289-6.5576172zm-10.6912232-10.6907959v9.2767334l-6.5571289 6.5576172c-1.3643188-1.6763306-2.1844482-3.8133545-2.1844482-6.1434326 0-5.0429688 3.8309326-9.1901246 8.7415771-9.690918zm-2.7583007 36.9490967c0 1.1030273-.8969727 2-2 2h-2.9833985c-1.1030273 0-2-.8969727-2-2v-2.9833984c0-1.1030273.8969727-2 2-2h2.9833984c1.1030273 0 2 .8969727 2 2v2.9833984zm0-8.8735352c0 1.1030273-.8969727 2-2 2h-2.9833985c-1.1030273 0-2-.8969727-2-2v-2.9833984c0-1.1030273.8969727-2 2-2h2.9833984c1.1030273 0 2 .8969727 2 2v2.9833984zm33.0170898 9.8735352c0 .5522461-.4477539 1-1 1-6.2728691 0-21.9239674 0-28.6396484 0-.5522461 0-1-.4477539-1-1v-4.9833984c0-.5522461.4477539-1 1-1h28.6396484c.5522461 0 1 .4477539 1 1z"
                />
                <path d="m39.642 41.519h1.537v2.983h-1.537z" />
                <path d="m43.179 41.519h1.322v2.983h-1.322z" />
                <path d="m17.861 32.645h7.256v2.983h-7.256z" />
                <path d="m35.869 41.519h1.773v2.983h-1.773z" />
                <path d="m27.51 41.519h2.324v2.983h-2.324z" />
                <path d="m22.865 41.519h2.646v2.983h-2.646z" />
                <path d="m31.834 41.519h2.035v2.983h-2.035z" />
              </g>
            </svg>
            <span class="flex-1 ms-3 whitespace-nowrap">Panel Admin</span>
          </router-link>
        </li>
        <li v-if="user.role == `USER`">
          <router-link
            to="/teams"
            href="#"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              class="w-5 h-5 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4c0 1.1.9 2 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.8-3.1a5.5 5.5 0 0 0-2.8-6.3c.6-.4 1.3-.6 2-.6a3.5 3.5 0 0 1 .8 6.9Zm2.2 7.1h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1l-.5.8c1.9 1 3.1 3 3.1 5.2ZM4 7.5a3.5 3.5 0 0 1 5.5-2.9A5.5 5.5 0 0 0 6.7 11 3.5 3.5 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4c0 1.1.9 2 2 2h.5a6 6 0 0 1 3-5.2l-.4-.8Z"
                clip-rule="evenodd"
              />
            </svg>

            <span class="flex-1 ms-3 whitespace-nowrap">Tim</span>
          </router-link>
        </li>
        <li v-if="user.role === `USER`">
          <router-link
            to="/event"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              class="w-5 h-5 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7h1v12c0 .6-.4 1-1 1h-2a1 1 0 0 1-1-1V5c0-.6-.4-1-1-1H5a1 1 0 0 0-1 1v14c0 .6.4 1 1 1h11.5M7 14h6m-6 3h6m0-10h.5m-.5 3h.5M7 7h3v3H7V7Z"
              />
            </svg>
            <span class="flex-1 ms-3 whitespace-nowrap">Acara</span>
          </router-link>
        </li>

        <li v-if="user.role == `JURI`">
          <button
            type="button"
            class="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            aria-controls="dropdown-penilaian"
            data-collapse-toggle="dropdown-penilaian"
          >
            <svg
              class="w-5 h-5 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-width="2"
                d="M11 5.1a1 1 0 0 1 2 0l1.7 4c.1.4.4.6.8.6l4.5.4a1 1 0 0 1 .5 1.7l-3.3 2.8a1 1 0 0 0-.3 1l1 4a1 1 0 0 1-1.5 1.2l-3.9-2.3a1 1 0 0 0-1 0l-4 2.3a1 1 0 0 1-1.4-1.1l1-4.1c.1-.4 0-.8-.3-1l-3.3-2.8a1 1 0 0 1 .5-1.7l4.5-.4c.4 0 .7-.2.8-.6l1.8-4Z"
              />
            </svg>

            <span class="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap"
              >Penilaian</span
            >
            <svg
              class="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          <div>
            <ul id="dropdown-penilaian" class="hidden py-2 space-y-2">
              <li>
                <button
                  type="button"
                  class="flex ms-4 items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  aria-controls="dropdown-qcc"
                  data-collapse-toggle="dropdown-qcc"
                >
                  <svg
                    class="w-4 h-4 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16.153 19 21 12l-4.847-7H3l4.848 7L3 19h13.153Z"
                    />
                  </svg>

                  <span
                    class="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap"
                    >QCC</span
                  >
                  <svg
                    class="w-3 h-3 me-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>
                <ul id="dropdown-qcc" class="hidden py-2 space-y-2">
                  <li>
                    <router-link
                      to="/lapangan-qcc"
                      class="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      Lapangan</router-link
                    >
                  </li>
                  <li>
                    <router-link
                      to="/presentasi-qcc"
                      class="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      Presentasi</router-link
                    >
                  </li>
                </ul>
              </li>
              <button
                type="button"
                class="flex ms-4 items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                aria-controls="dropdown-ss"
                data-collapse-toggle="dropdown-ss"
              >
                <svg
                  class="w-4 h-4 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16.153 19 21 12l-4.847-7H3l4.848 7L3 19h13.153Z"
                  />
                </svg>

                <span
                  class="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap"
                  >SS</span
                >
                <svg
                  class="w-3 h-3 me-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              <ul id="dropdown-ss" class="hidden py-2 space-y-2">
                <li>
                  <router-link
                    to="/lapangan-ss"
                    class="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Lapangan</router-link
                  >
                </li>
                <li>
                  <router-link
                    to="/presentasi-ss"
                    class="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >Presentasi</router-link
                  >
                </li>
              </ul>
              <button
                type="button"
                class="flex ms-4 items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                aria-controls="dropdown-yelyel"
                data-collapse-toggle="dropdown-yelyel"
              >
                <svg
                  class="w-4 h-4 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16.153 19 21 12l-4.847-7H3l4.848 7L3 19h13.153Z"
                  />
                </svg>

                <span
                  class="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap"
                  >Yel-Yel</span
                >
                <svg
                  class="w-3 h-3 me-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              <ul id="dropdown-yelyel" class="hidden py-2 space-y-2">
                <li>
                  <router-link
                    to="/yel-yel-penilaian"
                    class="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >Yel-Yel</router-link
                  >
                </li>
              </ul>
            </ul>
          </div>
        </li>

        <li>
          <router-link
            to="/profile"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              class="w-5 h-5 text-gray-800 dark:text-white"
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              viewBox="0 0 512 512"
              style="enable-background: new 0 0 512 512"
              xml:space="preserve"
            >
              <g>
                <g>
                  <path
                    d="M150,241c-16.538,0-30,13.462-30,30c0,16.538,13.462,30,30,30c16.538,0,30-13.462,30-30C180,254.462,166.538,241,150,241z
			"
                  />
                </g>
              </g>
              <g>
                <g>
                  <path
                    d="M467,31H45C20.186,31,0,51.186,0,76v75h512V76C512,51.186,491.814,31,467,31z M75,121c-8.284,0-15-6.716-15-15
			s6.716-15,15-15s15,6.716,15,15S83.284,121,75,121z M135,121c-8.284,0-15-6.716-15-15s6.716-15,15-15s15,6.716,15,15
			S143.284,121,135,121z M195,121c-8.284,0-15-6.716-15-15s6.716-15,15-15s15,6.716,15,15S203.284,121,195,121z"
                  />
                </g>
              </g>
              <g>
                <g>
                  <path
                    d="M157.925,331h-15.85C113.364,331,90,354.364,90,383.075V391h120v-7.925C210,354.364,186.636,331,157.925,331z"
                  />
                </g>
              </g>
              <g>
                <g>
                  <rect x="300" y="241" width="122" height="30" />
                </g>
              </g>
              <g>
                <g>
                  <path
                    d="M0,181v255c0,24.814,20.186,45,45,45h422c24.814,0,45-20.186,45-45V181H0z M240,406c0,8.291-6.709,15-15,15H75
			c-8.291,0-15-6.709-15-15v-22.925c0-31.853,18.419-59.214,44.995-72.812C95.779,299.713,90,286.081,90,271
			c0-33.091,26.909-60,60-60s60,26.909,60,60c0,15.081-5.779,28.713-14.995,39.263C221.581,323.861,240,351.222,240,383.075V406z
			 M437,421H285c-8.291,0-15-6.709-15-15c0-8.291,6.709-15,15-15h152c8.291,0,15,6.709,15,15C452,414.291,445.291,421,437,421z
			 M437,361H285c-8.291,0-15-6.709-15-15c0-8.291,6.709-15,15-15h152c8.291,0,15,6.709,15,15C452,354.291,445.291,361,437,361z
			 M452,286c0,8.291-6.709,15-15,15H285c-8.291,0-15-6.709-15-15v-60c0-8.291,6.709-15,15-15h152c8.291,0,15,6.709,15,15V286z"
                  />
                </g>
              </g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
            </svg>

            <span class="flex-1 ms-3 whitespace-nowrap">Profil</span>
          </router-link>
        </li>
        <li v-if="user.role != `USER`">
          <router-link
            to="/awards"
            href="#"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              class="w-5 h-5"
              clip-rule="evenodd"
              fill-rule="evenodd"
              height="800"
              image-rendering="optimizeQuality"
              shape-rendering="geometricPrecision"
              text-rendering="geometricPrecision"
              viewBox="0 0 800 800"
              width="800"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="Layer_x0020_1">
                <circle cx="400" cy="400" fill="#1a1a1a" r="400.001" />
                <g fill="#fefefe">
                  <path
                    d="m418.761 331.692 81.5612-141.268c1.16103-2.01142 1.16103-4.48938 0-6.49962-1.15984-2.01142-3.30591-3.2504-5.62796-3.2504h-189.391c-2.32205 0-4.46812 1.23898-5.62914 3.2504-1.16103 2.01024-1.16103 4.4882 0 6.49962l81.5624 141.268h-38.6434c-1.54016 0-3.0378.179528-4.47521.517324l-84.26-128.716c-7.85789-12.0047-8.47561-26.7071-1.65237-39.3296 6.82324-12.6201 19.4611-20.1544 33.8091-20.1544l227.97-.0011811c14.3481 0 26.9871 7.53545 33.8115 20.1556 6.82206 12.6213 6.20552 27.3237-1.65237 39.3296l-84.2612 128.716c-1.4374-.337796-2.93505-.517324-4.47521-.517324h-38.6457z"
                  />
                  <path
                    d="m457.406 395.318h-114.814c-3.58938 0-6.49962-2.90906-6.49962-6.49962v-37.6276c0-3.59056 2.91024-6.49962 6.49962-6.49962h114.814c3.58938 0 6.49962 2.90906 6.49962 6.49962v37.6276c0 3.58938-2.91024 6.49962-6.49962 6.49962z"
                  />
                  <path
                    d="m399.999 655.991c-75.4525 0-136.836-61.3844-136.836-136.836 0-49.3253 26.2359-92.6329 65.4828-116.716l.16063.164174.00590552.00472442.170079.166536.170079.165355.173622.162992.174803.16063.177166.158268.155906.138189.022441.0188977.180709.153544.0153544.0129922.0129922.0106299.154725.12874.184252.15.011811.00944884.00708663.00590552.167717.132284.187796.145276.0354331.0259843.154725.116929.19252.141733.0507875.0354331.142914.102756.194882.137008.0330709.022441.00354331.00236221.16063.108662.198426.132284.138189.089764.0625985.0389765.201969.126378.134646.0838584.0696852.0413387.205512.121654.00826773.00472442.198426.114567.209056.11811.0307087.0165355.168898.0921262.0106299.00590552.211418.111024.121654.0637797.0909451.0460631.303544.15.0283465.0141733.0992128.0472442.218504.101575.112205.0519686.106299.0472442.220867.0968506.106299.0460631.115748.0484253.223229.0909451.101575.0401576.124016.0484253.225591.0862206.0956695.0354331.132284.0472442.227953.0803151.0909451.0307087.453544.147638h.0011811.0011811l.381497.114567.0779529.022441.00826773.00236221.38504.105118.0708663.0188977.166536.0413387.238583.0578741.0649608.0153544.174803.0389765.240945.0519686.0578741.011811.0212599.00354331.405119.079134.0519686.00944884.19252.0330709.244489.0401576.044882.00708663.0389765.00590552.408662.056693.0377953.00472442.00590552.0011811.453544.0519686.0307087.00354331.0484253.00472442.377953.0330709.0437009.00354331.022441.00236221.229134.0153544.252756.0153544.0153544.0011811.0519686.00236221.349607.0129922.0909451.00236221.00708663.0011811.0885829.0011811.414568.00472442h114.814l.414568-.00472442.0885829-.0011811.00708663-.0011811.0909451-.00236221.349607-.0129922.0519686-.00236221.0153544-.0011811.252756-.0153544.229134-.0153544.022441-.00236221.0437009-.00354331.377953-.0330709.0484253-.00472442.0307087-.00354331.435828-.0507875.0236221-.00236221.0366142-.00472442.403938-.056693.044882-.00590552.044882-.00708663.244489-.0401576.19252-.0330709.0519686-.00944884.242126-.0460631.184252-.0366142.0578741-.011811.240945-.0519686.174803-.0389765.0649608-.0153544.238583-.0578741.165355-.0413387.0720474-.0188977.236221-.0637797.157087-.0437009.0779529-.022441.381497-.114567h.0011811.0011811l.312993-.101575.140551-.0460631.089764-.0307087.229134-.0803151.131103-.0472442.0968506-.0366142.225591-.0850395.124016-.0484253.100394-.0401576.22441-.0921262.114567-.0472442.107481-.0460631.219685-.0968506.107481-.0472442.112205-.0519686.217323-.101575.0992128-.0472442.116929-.0578741.214961-.106299.0921262-.0460631.121654-.0637797.211418-.112205.210237-.114567.209056-.116929.0755907-.0425198.131103-.0767718.205512-.122835.0685041-.0401576.0814962-.0507875.0543308-.0330709.201969-.126378.0614174-.0389765.13937-.0909451.198426-.131103.0543308-.0366142.142914-.0980317.194882-.135827.193701-.13937.19252-.140551.124016-.0933073.0377953-.0283465.0271654-.0212599.188977-.145276.034252-.0271654.309449-.248032.0271654-.022441.0283465-.022441.154725-.129922.180709-.154725.154725-.135827.0236221-.0200788.177166-.158268.0165355-.0141733.158268-.146457.173622-.162992.0106299-.00944884.159449-.155906.170079-.166536.00590552-.00472442.16063-.164174c39.2469 24.0827 65.4816 67.3903 65.4816 116.716 0 75.4513-61.3844 136.836-136.836 136.836zm48.9143-69.5234c-.856301 0-1.71142-.263386-2.4378-.79134l-46.4765-33.7678-46.4741 33.7666c-1.45394 1.05591-3.42284 1.05827-4.8756 0-1.45394-1.05473-2.06221-2.92678-1.50709-4.63584l17.752-54.6367-46.4753-33.7666c-1.45394-1.05473-2.06221-2.92678-1.50709-4.63584.5563-1.70906 2.14843-2.86536 3.94489-2.86536h57.4466l17.752-54.6367c.555119-1.70906 2.14725-2.86536 3.94371-2.86536 1.79764 0 3.38977 1.1563 3.94489 2.86536l17.7532 54.6367h57.4466c1.79646 0 3.38859 1.15748 3.94371 2.86536.5563 1.70906-.0531497 3.57993-1.50591 4.63584l-46.4765 33.7678 17.752 54.6355c.555119 1.70906-.0531497 3.57993-1.50591 4.63584-.72756.529135-1.58268.792521-2.4378.792521zm-48.9143-43.832c.85512 0 1.71142.264567 2.4378.792521l38.5879 28.0359-14.7402-45.3627c-.555119-1.70906.0531497-3.57993 1.50709-4.63702l38.5867-28.0347h-47.6966c-1.79646 0-3.38859-1.15748-3.94371-2.86536l-14.739-45.365-14.739 45.3639c-.555119 1.70906-2.14725 2.86536-3.94489 2.86536h-47.6954l38.5867 28.0359c1.45394 1.05473 2.06221 2.92678 1.50709 4.63584l-14.7402 45.3627 38.5879-28.0359c.726379-.526773 1.58268-.79134 2.4378-.79134z"
                  />
                </g>
              </g>
            </svg>

            <span class="flex-1 ms-3 whitespace-nowrap">Penghargaan</span>
          </router-link>
        </li>
        <li>
          <router-link
            to="/history-event"
            href="#"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              class="w-5 h-5 text-gray-800 dark:text-white"
              height="512"
              viewBox="0 0 512 512"
              width="512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="diamond">
                <path
                  d="m248.58 404.87a140.8 140.8 0 0 1 217.18-118.24c.15-10.43.23-21.56.23-33.57 0-61.75-2.1-100.29-6.25-140.21h.59a119.41 119.41 0 0 0 -77.65-99.85c-1.11-.42-2.22-.82-3.34-1.2a119.37 119.37 0 0 0 -25.58-5.57l-.83-.09c-33.21-3.41-38.54-6.14-108.57-6.14s-81.36 2.73-114.54 6.19l-.83.09a119.16 119.16 0 0 0 -26.81 6v-.45a119.48 119.48 0 0 0 -80.38 100.78c-4.16 40-6.28 78.58-6.28 140.45s2.12 100.45 6.28 140.45a119.59 119.59 0 0 0 106.58 106.57l.83.09c33.21 3.46 38.53 6.19 108.56 6.19 23.2 0 40-.3 53.19-.83a140.36 140.36 0 0 1 -42.38-100.66zm-117-271.72h218.31a23.82 23.82 0 0 1 0 47.64h-218.26a23.82 23.82 0 0 1 0-47.64zm0 149.57a23.83 23.83 0 0 1 0-47.65h124.51a23.83 23.83 0 1 1 0 47.65z"
                />
                <path
                  d="m389.35 297.74a107.13 107.13 0 1 0 107.13 107.13 107.13 107.13 0 0 0 -107.13-107.13zm42.46 122.81h-44.59a12.75 12.75 0 0 1 -12.75-12.75v-68.5a12.75 12.75 0 1 1 25.5 0v55.75h31.84a12.75 12.75 0 0 1 0 25.5z"
                />
              </g>
            </svg>

            <span class="flex-1 ms-3 whitespace-nowrap">Riwayat Acara</span>
          </router-link>
        </li>
        <li v-if="user.role == 'ADMIN'">
          <router-link
            to="/admin/report"
            href="#"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              class="w-5 h-5 text-gray-800 dark:text-white"
              height="512"
              viewBox="0 0 512 512"
              width="512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="diamond">
                <path
                  d="m248.58 404.87a140.8 140.8 0 0 1 217.18-118.24c.15-10.43.23-21.56.23-33.57 0-61.75-2.1-100.29-6.25-140.21h.59a119.41 119.41 0 0 0 -77.65-99.85c-1.11-.42-2.22-.82-3.34-1.2a119.37 119.37 0 0 0 -25.58-5.57l-.83-.09c-33.21-3.41-38.54-6.14-108.57-6.14s-81.36 2.73-114.54 6.19l-.83.09a119.16 119.16 0 0 0 -26.81 6v-.45a119.48 119.48 0 0 0 -80.38 100.78c-4.16 40-6.28 78.58-6.28 140.45s2.12 100.45 6.28 140.45a119.59 119.59 0 0 0 106.58 106.57l.83.09c33.21 3.46 38.53 6.19 108.56 6.19 23.2 0 40-.3 53.19-.83a140.36 140.36 0 0 1 -42.38-100.66zm-117-271.72h218.31a23.82 23.82 0 0 1 0 47.64h-218.26a23.82 23.82 0 0 1 0-47.64zm0 149.57a23.83 23.83 0 0 1 0-47.65h124.51a23.83 23.83 0 1 1 0 47.65z"
                />
                <path
                  d="m389.35 297.74a107.13 107.13 0 1 0 107.13 107.13 107.13 107.13 0 0 0 -107.13-107.13zm42.46 122.81h-44.59a12.75 12.75 0 0 1 -12.75-12.75v-68.5a12.75 12.75 0 1 1 25.5 0v55.75h31.84a12.75 12.75 0 0 1 0 25.5z"
                />
              </g>
            </svg>

            <span class="flex-1 ms-3 whitespace-nowrap">Report</span>
          </router-link>
        </li>

        <li>
          <a
            @click="Logout"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 16"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
              />
            </svg>
            <span class="flex-1 ms-3 whitespace-nowrap">Keluar</span>
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped></style>

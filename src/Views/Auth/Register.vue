<script setup>
import { ref } from "vue";
import axios from "axios";
import router from "../../router/router";
import Spinner from "@/components/Spinner.vue";
import { withLoading, handleError, handleSuccess } from "@/utils/utils";
const username = ref("");
const password = ref("");
const nip = ref("");
const email = ref("");
const role = ref("USER");

const Registration = async () => {
  withLoading(async () => {
    const userData = {
      username: username.value,
      password: password.value,
      nip: nip.value,
      email: email.value,
      role: role.value,
    };

    try {
      if (username.value !== "" && password.value !== "") {
        isLoading.value = true;
        const response = await axios.post("/auth/register", userData);
        console.log(response);
        handleSuccess("Registration , Success");
        router.push({ name: "login" });
      }
    } catch (error) {
      handleError(error + " : " + error.response.data.message);
    }
  });
};
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <Spinner v-if="isLoading"></Spinner>
    <form
      @submit.prevent="Registration"
      class="max-w-sm mx-auto border-2 rounded-xl shadow-xl p-5 m-sm-5"
    >
      <h1 class="block mb-5 text-2xl font-semibold text-center">My Apps</h1>

      <div class="mb-3">
        <div class="flex">
          <span
            class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600"
          >
            <svg
              class="w-4 h-4 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 18"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-2 3h4a4 4 0 0 1 4 4v2H1v-2a4 4 0 0 1 4-4Z"
              />
            </svg>
          </span>
          <input
            v-model="username"
            required
            type="text"
            id="website-admin"
            class="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Username"
          />
        </div>
      </div>
      <div class="mb-3">
        <div class="flex">
          <span
            class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600"
          >
            <svg
              class="w-4 h-4 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11.5 8V4.5a3.5 3.5 0 1 0-7 0V8M8 12v3M2 8h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
              />
            </svg>
          </span>
          <input
            v-model="password"
            type="password"
            required
            id="website-admin"
            class="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Password"
          />
        </div>
      </div>

      <!--  -->
      <button
        type="submit"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full p-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        {{ isLoading ? "Registering..." : "Register new account" }}
      </button>
      <small class="block text-center mt-2"
        >Have Account?
        <router-link
          to="/"
          class="font-semibold underline hover:text-slate-400 text-center"
          >Login Here
        </router-link>
      </small>
    </form>
  </div>
</template>

<style scoped></style>

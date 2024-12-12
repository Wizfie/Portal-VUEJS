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
const role = ref("");
const dept = ref("");

const Registration = async () => {
  withLoading(async () => {
    const userData = {
      username: username.value,
      password: password.value,
      nip: nip.value,
      email: email.value,
      role: role.value,
      department: dept.value,
    };

    try {
      if (username.value !== "" && password.value !== "") {
        const response = await axios.post("/auth/register", userData);
        console.log(response);
        handleSuccess("Registration , Success");
        router.push({ name: "login" });
      }
    } catch (error) {
      handleError(error);
    }
  });
};
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <Spinner v-if="isLoading"></Spinner>
    <form
      @submit.prevent="Registration"
      class="w-50 mx-auto border-2 rounded-xl shadow-xl p-8"
    >
      <h1 class="block mb-5 text-2xl font-semibold text-center">Register</h1>

      <div class="mb-5">
        <input
          v-model="username"
          type="username"
          id="username"
          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
          placeholder="Nama Pengguna"
          required
        />
      </div>
      <div class="mb-5">
        <input
          v-model="nip"
          type="text"
          id="nip"
          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
          placeholder="NIP (22-0123)"
        />
      </div>
      <div class="mb-5">
        <input
          v-model="dept"
          type="text"
          id="dept"
          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
          placeholder="Department"
          required
        />
      </div>
      <div class="mb-5">
        <input
          v-model="email"
          type="email"
          id="email"
          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
          placeholder="Email"
          required
        />
      </div>
      <div class="mb-5">
        <input
          v-model="password"
          type="password"
          id="password"
          placeholder="Kata Sandi"
          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
          required
        />
      </div>
      <div class="mb-5">
        <select
          v-model="role"
          required
          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
        >
          <option disabled selected value="">--Pilih Peran--</option>
          <option value="USER">PENGGUNA</option>
          <option value="JURI">JURI</option>
          <option value="LEADER">PIMPINAN</option>
          <option value="ADMIN">ADMIN</option>
        </select>
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

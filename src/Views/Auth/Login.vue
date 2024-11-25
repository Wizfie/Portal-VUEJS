<script setup>
import axios from "axios";
import { ref } from "vue";
import router from "../../router/router";
import store from "../../store/store";
import { handleSuccess, handleError } from "../../utils/utils";

const username = ref("");
const password = ref("");

const Login = async () => {
  const userLogin = {
    username: username.value,
    password: password.value,
  };

  try {
    if (username.value !== "" && password.value !== "") {
      const response = await axios.post("/auth/login", userLogin);

      // Simpan token ke Vuex
      const token = response.data.token;
      const user = response.data.user;

      await store.dispatch("saveUserDataAndToken", {
        token,
        user,
      });

      // Simpan token ke localStorage
      localStorage.setItem("authToken", token);

      localStorage.setItem("userData", JSON.stringify(user));

      handleSuccess("Login", "Login Success");

      await router.push("/dashboard");
    }
  } catch (error) {
    if (error.response.status === 401) {
      handleError("Login", "Username or password wrong");
    } else {
      handleError("Login", "Internal Server Error");
      console.error("Login Error", error);
    }
  }
};
</script>
<template>
  <div class="flex justify-center items-center h-screen">
    <form
      @submit.prevent="Login"
      class="max-w-sm mx-auto border-2 rounded-xl shadow-xl p-5 m-sm-5"
    >
      <h1 class="block mb-5 text-2xl font-semibold text-center">
        EMS Logistic
      </h1>

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
            type="text"
            v-model="username"
            id="username"
            class="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Username"
          />
        </div>
      </div>
      <div class="mb-3">
        <!-- <label
					for="website-admin"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Email</label
				> -->
        <!-- <div class="flex">
					<span
						class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600"
					>
						<svg
							class="w-4 h-4 text-gray-800 dark:text-white"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 20 16"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m19 2-8.4 7.05a1 1 0 0 1-1.2 0L1 2m18 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1m18 0v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2"
							/>
						</svg>
					</span>
					<input
						type="email"
						id="website-admin"
						class="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="Email"
					/>
				</div> -->
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
            type="password"
            id="password"
            v-model="password"
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
        Login
      </button>
      <!-- <small class="block text-center mt-2"
        >Don't have an account?
        <router-link
          to="/register"
          class="font-semibold underline hover:text-slate-400 text-center"
          >Register Here
        </router-link></small
      > -->
    </form>
  </div>
</template>

<style scoped></style>

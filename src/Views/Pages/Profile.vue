<script setup>
import { onMounted, ref } from "vue";
import SiddebarWithNavbar from "../../components/SidebarWithNavbar.vue";
import { useStore } from "vuex";
import axios from "axios";
import Spinner from "@/components/Spinner.vue";
import {
  isSidebarOpen,
  sidebarToggle,
  handleSuccess,
  handleError,
  validateNip,
} from "@/utils/utils";

const store = useStore();
const userData = ref("");
const token = ref();
const formPassword = ref(false);
const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const isEditing = ref(false);
const nipError = ref(false);
const users = ref({
  nip: "",
  username: "",
  role: "",
  email: "",
});
onMounted(() => {
  userData.value = store.getters.getUserData;
  token.value = localStorage.getItem("authToken");

  getUsers();
});

const getUsers = async () => {
  try {
    const res = await axios.get(`/auth/users/${userData.value.id}`, {
      headers: {
        Authorization: "Bearer " + token.value,
      },
    });

    users.value = res.data;
  } catch (error) {
    console.error("Fail get Users " + error);
  }
};

const validNip = (nip) => {
  nipError.value = !validateNip(nip);
};

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};

const saveProfileChanges = async () => {
  try {
    isLoading.value = true;
    const response = await axios.put(
      `/auth/update/${userData.value.id}`,
      users.value
    );

    handleSuccess("Profil berhasil diperbarui!");
    isEditing.value = false;
    console.log(response.status);
  } catch (error) {
    console.error("ERROR Update : " + error);
    if (error.response) {
      handleError(error.response.data.message);
    } else {
      handleError("Terjadi kesalahan saat memperbarui profil");
    }
  } finally {
    isLoading.value = false;
  }
};

const togglePassword = () => {
  formPassword.value = !formPassword.value;
};
const resetForm = () => {
  oldPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
};

const changePassword = async () => {
  const passwordRequest = {
    username: userData.value.username,
    currentPassword: oldPassword.value,
    newPassword: newPassword.value,
  };

  try {
    if (
      oldPassword.value != "" &&
      newPassword.value === confirmPassword.value
    ) {
      isLoading.value = true;
      const response = await axios.post(
        "/auth/update-password",
        passwordRequest
      );
      handleSuccess("Kata sandi berhasil diperbarui");
      isLoading.value = false;
    } else {
      handleError("Kata sandi baru dan konfirmasi kata sandi tidak cocok");
    }
  } catch (error) {
    console.error("ERROR Update : " + error);
    if (error.response) {
      handleError(error.response.data.message);
    } else {
      handleError("Terjadi kesalahan saat memperbarui kata sandi");
    }
  } finally {
    resetForm();
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <Spinner v-if="isLoading"></Spinner>
    <SiddebarWithNavbar @toggleSidebar="sidebarToggle"></SiddebarWithNavbar>
    <div
      :class="{
        'sm:ml-64': isSidebarOpen,
        'ml-0': !isSidebarOpen,
        'p-4': true,
        'transition-all': true,
        'ease-in-out': true,
        'duration-700': true,
      }"
    >
      >
      <div
        class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-14"
      >
        <h1>Profil</h1>
      </div>

      <section class="flex flex-wrap gap-2">
        <div
          class="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mt-4"
        >
          <div class="flex flex-col items-center mt-4 pb-10">
            <svg
              class="w-20 h-20 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M12 20a7.966 7.966 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.966 7.966 0 0 1 12 20ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12Zm10-5c-1.84 0-3.333 1.455-3.333 3.25S10.159 13.5 12 13.5c1.84 0 3.333-1.455 3.333-3.25S13.841 7 12 7Z"
                clip-rule="evenodd"
              />
            </svg>

            <!-- Editable NIP and Email -->
            <div v-if="isEditing">
              <label class="text-sm text-gray-500 mb-1 dark:text-gray-400"
                >Username</label
              >
              <input
                v-model="users.username"
                class="bg-gray-50 border cursor-not-allowed border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white mb-3"
                disabled
              />
              <label class="text-sm text-gray-500 mb-1 dark:text-gray-400"
                >Role</label
              >
              <input
                v-model="users.role"
                class="bg-gray-50 border cursor-not-allowed border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white mb-3"
                disabled
              />
              <label class="text-sm text-gray-500 mb-1 dark:text-gray-400"
                >NIP</label
              >
              <input
                type="text"
                v-model="users.nip"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white mb-3"
                placeholder="Masukkan NIP (23-1234)"
                @input="validNip(users.nip)"
              />
              <span v-if="nipError" class="block text-red-500 text-sm">
                Format NIP tidak valid. Harus berupa 23-1234.
              </span>
              <label class="text-sm text-gray-500 mb-1 dark:text-gray-400"
                >Email</label
              >
              <input
                type="email"
                v-model="users.email"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white mb-3"
                placeholder="Masukkan Email"
              />
            </div>
            <div class="flex flex-col text-center mt-4" v-else>
              <h5
                class="mb-6 text-xl font-medium uppercase text-gray-900 dark:text-white"
              >
                {{ users.username }}
              </h5>
              <span class="text-sm text-gray-500 mb-2 dark:text-gray-400">
                {{ users.role }}
              </span>

              <span class="text-sm text-gray-500 mb-2 dark:text-gray-400">
                {{ users.nip ? users.nip : "-" }}
              </span>
              <span class="text-sm text-gray-500 mb-2 dark:text-gray-400">
                {{ users.email ? users.email : "-" }}
              </span>
            </div>

            <div class="flex gap-2 mt-4 md:mt-6">
              <button
                v-if="!isEditing"
                @click="togglePassword()"
                class="inline-flex items-center px-4 py-2 mt-10 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Ubah Kata Sandi
              </button>
              <button
                v-if="!isEditing"
                @click="toggleEdit()"
                class="inline-flex items-center px-4 py-2 mt-10 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                Edit Profil
              </button>
              <button
                v-if="isEditing"
                @click="toggleEdit()"
                class="inline-flex items-center px-4 py-2 mt-10 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
              >
                Cancel
              </button>
              <button
                v-if="isEditing"
                @click="saveProfileChanges"
                class="inline-flex items-center px-4 py-2 mt-10 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>

        <div
          v-show="formPassword"
          class="w-full max-w-sm p-4 mt-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700"
        >
          <form @submit.prevent="changePassword" class="space-y-6" action="#">
            <div class="flex">
              <h5 class="text-xl font-medium text-gray-900 dark:text-white">
                Ubah Kata Sandi
              </h5>
              <button
                type="button"
                @click="togglePassword()"
                class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  class="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span class="sr-only">Tutup</span>
              </button>
            </div>
            <div>
              <label
                for="current-password"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Kata Sandi Saat Ini</label
              >
              <input
                v-bind:type="showPassword ? 'text' : 'password'"
                id="current-password"
                v-model="oldPassword"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Kata Sandi Lama"
                required
              />
            </div>
            <div>
              <label
                for="new-password"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Kata Sandi Baru</label
              >
              <input
                v-bind:type="showPassword ? 'text' : 'password'"
                id="new-password"
                v-model="newPassword"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Kata Sandi Baru"
                required
              />
            </div>
            <div>
              <label
                for="re-password"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Ulangi Kata Sandi</label
              >
              <input
                v-bind:type="showPassword ? 'text' : 'password'"
                id="re-password"
                v-model="confirmPassword"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Ulangi Kata Sandi Baru"
                required
              />
            </div>
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="show-password"
                  type="checkbox"
                  v-model="showPassword"
                  class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <label
                for="show-password"
                class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >Tampilkan Kata Sandi</label
              >
            </div>
            <button
              type="submit"
              class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Ubah Kata Sandi
            </button>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<style></style>

<script setup>
import { onMounted, ref } from "vue";
import SiddebarWithNavbar from "@/components/SidebarWithNavbar.vue";
import Swal from "sweetalert2";
import Spinner from "@/components/Spinner.vue";
import {
  handleSearch,
  changePage,
  calculatePageNumbers,
  holdPage,
  isLoading,
  handleSuccess,
  handleConfirm,
  withLoading,
  handleError,
  isSidebarOpen,
  sidebarToggle,
} from "@/utils/utils";

import { useStore } from "vuex";
import axios from "axios";
import NavButtonGroup from "@/components/NavButtonGroup.vue";

const store = useStore();
const user = ref("");
const token = ref();
const usersData = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageNumbers = ref([]);
const username = ref("");
const email = ref("");
const password = ref("");
const role = ref("");
const nip = ref("");
const dept = ref("");
const searchQuery = ref("");
const showRegistration = ref(false);
const selectedUser = ref({
  username: "",
  email: "",
  password: "",
  nip: "",
  emailPassword: "",
  role: "",
  department: "",
  active: true,
});
const showUpdateUserModal = ref(false);

onMounted(() => {
  user.value = store.getters.getUserData;
  token.value = store.getters.getAuthToken;

  fetchUsers();
  holdPage(currentPage);
});

const toggleModal = (type, user = null) => {
  if (type === "registration") {
    showRegistration.value = !showRegistration.value;
  } else if (type === "update") {
    if (user) {
      selectedUser.value = { ...user };
    }
    showUpdateUserModal.value = !showUpdateUserModal.value;
  }
};

const resetForm = () => {
  username.value = "";
  email.value = "";
  password.value = "";
  nip.value = "";
  role.value = "";
  dept.value = "";

  showRegistration.value = false;
  showUpdateUserModal.value = false;
  fetchUsers();
};

const Registration = async () => {
  withLoading(async () => {
    const userData = {
      username: username.value,
      password: password.value,
      nip: nip.value,
      email: email.value,
      role: role.value,
      department: dept.value.toUpperCase(),
    };

    try {
      if (userData.username !== "" && userData.password !== "") {
        const response = await axios.post("/auth/register", userData);
        console.log(response);
        handleSuccess("Registration", "Successfully created");
      }
    } catch (error) {
      handleError("Registration", "Failed to create");
      console.error(error);
    } finally {
      resetForm();
    }
  });
};

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get("/auth/users", {
      headers: {
        Authorization: "Bearer " + token.value,
      },
      params: {
        page: currentPage.value,
        keyword: searchQuery.value,
      },
    });

    usersData.value = response.data;

    currentPage.value = response.data.currentPage;
    totalPages.value = response.data.totalPages;
    localStorage.setItem("currentPage", currentPage.value);

    pageNumbers.value = calculatePageNumbers(
      currentPage.value,
      totalPages.value
    );

    console.log(usersData.value);
  } catch (error) {
    console.error("ERROR FETCH USER : " + error);
  } finally {
    isLoading.value = false;
  }
};

const updateUser = async () => {
  isLoading.value = true;
  const result = await Swal.fire({
    position: "center",
    title: "Update Member?",
    showConfirmButton: true,
    showCancelButton: true,
  });
  if (!result.isConfirmed) return;
  try {
    const response = await axios.put(
      `/auth/update/${selectedUser.value.id}`,
      selectedUser.value
    );
    handleSuccess(selectedUser.value.username, "Successfully updated");
  } catch (error) {
    handleError(selectedUser.value.username, "Failed to update");
    console.error("ERROR UPDATE USER : " + error);
  } finally {
    resetForm();
  }
};
const toggleActiveUser = async (user) => {
  const result = await Swal.fire({
    position: "center",
    title: "Ubah Status?",
    showConfirmButton: true,
    showCancelButton: true,
  });
  if (!result.isConfirmed) return;
  try {
    const updatedUser = { ...user, active: !user.active };

    await axios.put(`/auth/update/${user.id}`, updatedUser);
    handleSuccess(user.username, "Successfully updated");
  } catch (error) {
    handleError(user.username, "Failed to update");
    console.error("ERROR UPDATE USER : " + error);
  } finally {
    resetForm();
  }
};

const removeUser = async (id) => {
  const result = await handleConfirm({
    title: "Remove user?",
    text: "Do you really want to remove this user?",
  });

  if (!result.isConfirmed) return null;

  try {
    const response = await axios.delete(`/auth/users/${id}`);
    handleSuccess("User", "Successfully removed");
    fetchUsers();
  } catch (ex) {
    handleError("User", "Failed to remove user");
    console.error("ERROR DELETE " + ex);
  }
};

const handleSearchInput = async () => {
  await handleSearch(searchQuery.value, fetchUsers);
};

const changePageNumber = async (pageNumber) => {
  currentPage.value = pageNumber;
  await changePage(pageNumber, fetchUsers, totalPages);
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
      <div class="p-4 border-2 border-gray-200 rounded-lg items-center mt-14">
        <div class="sm:flex-col md:flex md:justify-between items-center">
          <div class="text-center mb-2">
            <span class="text-2xl font-bold text-gray-900">PENGGUNA</span>
          </div>
          <NavButtonGroup></NavButtonGroup>
        </div>
      </div>
      <section
        id="registration"
        v-if="showRegistration"
        class="w-full h-full p-4 dark:bg-gray-700 dark:text-white"
      >
        <form
          @submit.prevent="Registration"
          class="max-w-sm border border-1 p-4 rounded-md mb-3"
        >
          <div class="flex justify-between mb-2">
            <h1 class="font-bold text-xl mb-2">Pendaftaran</h1>
            <span
              @click="toggleModal('registration')"
              class="text-sm cursor-pointer flex items-center gap-1 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </span>
          </div>
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
            </select>
          </div>
          <button
            type="submit"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Daftar
          </button>
        </form>
      </section>

      <section class="w-full h-full p-4 dark:bg-gray-700 dark:text-white">
        <section class="flex justify-between">
          <div>
            <label for="search">Cari : </label>
            <input
              id="search"
              v-model="searchQuery"
              type="search"
              @input="handleSearchInput"
              placeholder="Cari pengguna..."
              class="ms-4 md:me-10 p-2 mb-4 mt-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            @click="toggleModal('registration')"
            class="p-2 mb-4 mt-2 border bg-blue-600 text-white rounded-md hover:bg-blue-800 active:bg-blue-900 active:scale-95 transition-transform"
          >
            Buat Pengguna
          </button>
        </section>

        <!-- Tabel -->
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table
            class="w-full text-sm p-6 text-left rtl:text-right text-gray-500 dark:text-gray-400"
          >
            <thead
              class="text-xs text-center text-gray-700 uppercase bg-gray-400 dark:bg-gray-700 dark:text-gray-400"
            >
              <tr>
                <th scope="col" class="px-6 py-3">No</th>
                <th scope="col" class="px-6 py-3">Nama Pengguna</th>
                <th scope="col" class="px-6 py-3">Nip</th>
                <th scope="col" class="px-6 py-3">Department</th>
                <th scope="col" class="px-6 py-3">Email</th>
                <th scope="col" class="px-6 py-3">Peran</th>
                <th scope="col" class="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(user, index) in usersData.data"
                :key="user.id"
                class="text-center bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <td class="px-6 py-4">{{ index + 1 }}</td>
                <th
                  scope="row"
                  class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {{ user.username }}
                </th>
                <td class="px-6 py-4">{{ user.nip ? user.nip : "-" }}</td>
                <td class="px-6 py-4">
                  {{ user.department ? user.department : "-" }}
                </td>
                <td class="px-6 py-4">{{ user.email ? user.email : "-" }}</td>
                <td class="px-6 py-4">{{ user.role }}</td>
                <td class="px-6 py-4">
                  <div class="md:flex md:flex-col gap-2">
                    <button
                      @click="toggleModal('update', user)"
                      class="w-full font-medium px-2 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-700 mb-1"
                    >
                      Edit
                    </button>
                    <button
                      @click="toggleActiveUser(user)"
                      class="w-full font-medium px-2 py-1 rounded-md text-white hover:bg-opacity-80 mb-1"
                      :class="{
                        'bg-green-500 hover:bg-green-700': user.active,
                        'bg-red-500 hover:bg-red-700': !user.active,
                      }"
                      style="min-width: 5rem; min-height: 2.5rem"
                    >
                      {{ user.active ? "AKTIF" : "NONAKTIF" }}
                    </button>

                    <!-- <button
                      @click="removeUser(user.id)"
                      class="w-full font-medium px-2 py-2 rounded-md bg-red-500 text-white hover:bg-red-800 mb-1"
                    >
                      Hapus
                    </button> -->
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <nav
            class="flex items-center flex-column flex-wrap p-4 md:flex-row justify-between pt-4"
            aria-label="Navigasi Tabel"
          >
            <span
              class="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto"
              >Menampilkan
              <span class="font-semibold text-gray-900 dark:text-white">{{
                (currentPage - 1) * usersData.pageSize + 1
              }}</span>
              -
              <span class="font-semibold text-gray-900 dark:text-white">{{
                Math.min(
                  currentPage * usersData.pageSize,
                  usersData.totalElements
                )
              }}</span>
              dari
              <span class="font-semibold text-gray-900 dark:text-white">{{
                usersData.totalElements
              }}</span>
              <span class="ms-5">Halaman </span>
              <span class="font-semibold"> - {{ currentPage }}</span>
            </span>

            <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
              <li>
                <button
                  :disabled="currentPage === 1"
                  @click.prevent="changePageNumber(currentPage - 1)"
                  :class="{
                    'text-gray-500 border-gray-300': currentPage <= 0,
                  }"
                  class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Sebelumnya
                </button>
              </li>

              <template v-for="pageNumber in pageNumbers">
                <li>
                  <button
                    @click.prevent="changePageNumber(pageNumber)"
                    :class="[
                      'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
                      { 'bg-blue-200': pageNumber === currentPage },
                    ]"
                  >
                    {{ pageNumber }}
                  </button>
                </li>
              </template>
              <li>
                <button
                  @click.prevent="changePageNumber(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  :class="{
                    'text-gray-500 border-gray-300': currentPage === totalPages,
                  }"
                  class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Berikutnya
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </section>
    </div>
  </div>

  <!-- Main modal untuk memperbarui pengguna -->
  <div v-show="showUpdateUserModal" class="modal">
    <div class="modal-content">
      <!-- Tombol Tutup -->
      <button
        @click="toggleModal('update')"
        class="close-button my-4 me-4 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300"
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
      </button>
      <!-- Konten Modal -->
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Perbarui Pengguna
      </h2>
      <!-- Form untuk memperbarui pengguna -->
      <form @submit.prevent="updateUser" class="space-y-4" action="#">
        <div>
          <label
            for="update-username"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Nama Pengguna</label
          >
          <input
            type="text"
            name="text"
            id="update-username"
            v-model="selectedUser.username"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="Nama Pengguna"
            required
          />
        </div>
        <div>
          <label
            for="update-email"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Email</label
          >
          <input
            type="email"
            name="email"
            id="update-email"
            v-model="selectedUser.email"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="nama@perusahaan.com"
            required
          />
        </div>
        <div v-if="selectedUser.role == 'ADMIN'">
          <label
            for="email-password"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Email Password</label
          >
          <input
            type="text"
            name="email-password"
            id="email-password"
            v-model="selectedUser.emailPassword"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        <div>
          <label
            for="update-nip"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >NIP</label
          >
          <input
            type="text"
            name="nip"
            id="update-nip"
            v-model="selectedUser.nip"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="22-0123"
          />
        </div>
        <div>
          <label
            for="update-dept"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Department</label
          >
          <input
            type="text"
            name="dept"
            id="update-dept"
            v-model="selectedUser.department"
            @input="
              selectedUser.department = selectedUser.department.toUpperCase()
            "
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="Department"
            required
          />
        </div>
        <div>
          <label
            for="update-password"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Kata Sandi</label
          >
          <input
            type="password"
            name="password"
            id="update-password"
            v-model="selectedUser.password"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="********"
          />
        </div>
        <div class="col-span-2 sm:col-span-1">
          <label
            for="update-role"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Peran</label
          >
          <select
            id="update-role"
            v-model="selectedUser.role"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            required
          >
            <option value="USER">PENGGUNA</option>
            <option value="JURI">JURI</option>
            <option value="LEADER">PIMPINAN</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <!-- Tombol untuk memperbarui pengguna -->
        <button
          type="submit"
          class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Perbarui Pengguna
        </button>
      </form>
    </div>
  </div>
</template>

<style>
/* Styling modal */
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Latar belakang agak gelap */
  z-index: 999;
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 400px;
  border-radius: 8px;
  position: relative;
}

.close-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
</style>

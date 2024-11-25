<template>
  <div>
    <!-- Tampilkan spinner saat sedang loading -->
    <Spinner v-if="isLoading"></Spinner>

    <!-- Sidebar navigasi -->
    <SidebarWithNav @toggleSidebar="sidebarToggle"></SidebarWithNav>

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
      <!-- Header halaman utama -->
      <div class="p-4 border-2 border-gray-200 rounded-lg mt-14">
        <div
          class="sm:flex-col sm:justify-center md:flex md:justify-between items-center"
        >
          <div class="mb-2 text-center">
            <span class="text-2xl font-bold text-gray-900"> Event</span>
          </div>
          <!-- Tombol navigasi -->
          <NavButton></NavButton>
        </div>
      </div>

      <!-- Tombol untuk membuat event baru -->
      <div
        class="p-2 border-2 border-gray-200 rounded-lg items-center mt-2 mb-2"
      >
        <div class="flex gap-2 justify-end items-center">
          <router-link
            to="/admin-event/list"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
          >
            List Event
          </router-link>
        </div>
      </div>

      <section
        id="table-list-registration"
        class="relative overflow-x-auto shadow-md sm:rounded-lg dark:bg-gray-800"
      >
        <p class="text-xl font-semibold border-2 p-2 underline">
          Registered Team
        </p>
        <table
          class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead
            class="text-xs text-gray-700 uppercase text-center bg-gray-400 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="px-6 py-3">No</th>
              <th scope="col" class="px-6 py-3">Dept.</th>
              <th scope="col" class="px-6 py-3">Tim</th>
              <th scope="col" class="px-6 py-3">Event</th>
              <th scope="col" class="px-6 py-3">Tanggal</th>
              <th scope="col" class="px-6 py-3">Status</th>
              <th scope="col" class="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- Looping data registrasi -->
            <tr
              v-for="(registration, index) in registrations"
              :key="index"
              class="bg-white text-center border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td class="px-6 py-4">{{ index + 1 }}</td>
              <td class="px-6 py-4">{{ registration.team.username }}</td>
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {{ registration.team.teamName }}
              </th>
              <td class="px-6 py-4">{{ registration.event.eventName }}</td>
              <td class="px-6 py-4">
                {{ formatDate(registration.createdAt) }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="{
                    'bg-green-500 text-white rounded-md':
                      registration.registrationStatus === 'Completed',
                    'bg-yellow-300 text-white rounded-md':
                      registration.registrationStatus !== 'Completed',
                  }"
                  class="p-2 block text-center min-w-4"
                >
                  {{ registration.registrationStatus }}
                </span>
              </td>

              <td class="px-6 py-4">
                <span>
                  <router-link
                    :to="{
                      name: 'registration-details',
                      params: { registrationId: registration.registrationId },
                    }"
                    class="font-medium hover:text-blue-600 hover:underline"
                  >
                    Berkas
                  </router-link>
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <!-- Tampilkan jika tidak ada data -->
            <tr v-if="!registrations.length">
              <td colspan="7" class="p-4">
                <center class="font-bold">Tidak Ada Data</center>
              </td>
            </tr>
          </tfoot>
        </table>
        <!-- Navigasi halaman -->
        <nav
          class="flex items-center flex-column flex-wrap p-4 md:flex-row justify-between pt-4"
          aria-label="Navigasi Tabel"
        >
          <span
            class="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto"
          >
            Menampilkan
            <span class="font-semibold text-gray-900 dark:text-white">
              {{ (currentPage - 1) * pageSize + 1 }}
            </span>
            -
            <span class="font-semibold text-gray-900 dark:text-white">
              {{ Math.min(currentPage * pageSize, totalElements) }}
            </span>
            dari
            <span class="font-semibold text-gray-900 dark:text-white">
              {{ totalElements }}
            </span>
            <span class="ms-5">Halaman</span>
            <span class="font-semibold">- {{ currentPage }}</span>
          </span>

          <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
            <li>
              <!-- Tombol untuk halaman sebelumnya -->
              <button
                @click.prevent="changePageNumber(currentPage - 1)"
                :disabled="currentPage === 1"
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
                <!-- Tombol untuk pindah halaman -->
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
              <!-- Tombol untuk halaman selanjutnya -->
              <button
                @click.prevent="changePageNumber(currentPage + 1)"
                :disabled="currentPage === totalPages"
                :class="{
                  'text-gray-500 border-gray-300': currentPage === totalPages,
                }"
                class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Selanjutnya
              </button>
            </li>
          </ul>
        </nav>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SidebarWithNav from "@/components/SidebarWithNavbar.vue";
import Spinner from "@/components/Spinner.vue";
import NavButton from "@/components/NavButtonGroup.vue";
import { useStore } from "vuex";
import axios from "axios";
import { initFlowbite } from "flowbite";
import {
  holdPage,
  withLoading,
  isLoading,
  calculatePageNumbers,
  changePage,
  isSidebarOpen,
  sidebarToggle,
  formatDate,
} from "@/utils/utils";

// Menginisialisasi state dan referensi
const token = "Bearer " + localStorage.getItem("authToken");
const store = useStore();
const userData = ref("");
const registrations = ref([]);
const currentPage = ref(1);
const pageNumbers = ref([]);
const totalPages = ref(1);
const pageSize = ref();
const totalElements = ref();

// Memuat data saat komponen dimount
onMounted(() => {
  initFlowbite();
  registrationList();
  holdPage(currentPage);
  userData.value = store.getters.getUserData;
  console.log(userData.value);
});

// Mendapatkan daftar registrasi
const registrationList = () => {
  withLoading(async () => {
    try {
      const response = await axios.get("/registration/get-all", {
        params: {
          page: currentPage.value,
          pageSize: 10,
        },
      });
      registrations.value = response.data.data;
      currentPage.value = response.data.currentPage;
      totalPages.value = response.data.totalPages;
      pageSize.value = response.data.pageSize;
      totalElements.value = response.data.totalElements;

      localStorage.setItem("currentPage", currentPage.value);
      console.log(registrations.value);

      pageNumbers.value = calculatePageNumbers(
        currentPage.value,
        totalPages.value
      );
    } catch (error) {
      console.error("Gagal Memuat Data Registrasi: " + error);
    }
  });
};

const changePageNumber = async (pageNumber) => {
  currentPage.value = pageNumber;
  await changePage(pageNumber, registrationList);
};
</script>

<style scoped>
/* Tambahkan efek shadow dan border pada setiap langkah */
.relative.col-span-2.mb-4 {
  transition: all 0.3s ease-in-out;
  cursor: pointer;
}

.relative.col-span-2.mb-4:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

button {
  transition: color 0.2s ease-in-out;
}

button:hover {
  color: #ff0000;
}

/* Styling untuk input event agar konsisten dengan langkah */
.event-input {
  padding: 8px;
  border: 1px solid #d1d5db; /* border color */
  border-radius: 0.375rem; /* rounded corners */
  background-color: #f9fafb; /* light background color */
  transition: all 0.3s ease-in-out;
}

.event-input:focus {
  border-color: #3b82f6; /* focus border color */
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3); /* focus shadow */
}

/* Sticky header dan tombol */
.sticky {
  position: sticky;
  background-color: inherit; /* Tetap menggunakan background elemen induk */
  z-index: 10;
}

.bg-white,
.dark\:bg-gray-700 {
  background-color: #ffffff;
}

.dark .dark\:bg-gray-700 {
  background-color: #374151;
}

.top-0 {
  top: 0;
}

.top-12 {
  top: 3rem; /* Menyelaraskan posisi sticky kedua */
}

.z-10 {
  z-index: 10;
}
</style>

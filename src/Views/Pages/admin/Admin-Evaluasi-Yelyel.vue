<template>
  <div>
    <!-- Komponen Spinner dan Navbar -->
    <Spinner v-if="isLoading"></Spinner>
    <SidebarWithNavbar @toggleSidebar="sidebarToggle"></SidebarWithNavbar>

    <!-- Konten Utama -->
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
      <!-- Bagian Header -->
      <div class="p-4 border-2 border-gray-200 rounded-lg items-center mt-14">
        <div class="sm:flex-col md:flex md:justify-between items-center">
          <div class="mb-2 text-center">
            <span id="title" class="text-2xl font-bold text-gray-900">{{
              titleText
            }}</span>
          </div>
          <NavButtonGroup></NavButtonGroup>
        </div>
        <!-- Breadcrumb -->
        <NavEvaluasi
          :title-text="titleText"
          @toggle-form="toggleForm"
        ></NavEvaluasi>
      </div>

      <!-- Form pertanyaan -->
      <CreateFormLapangan
        v-if="showForm"
        @update-show-form="showForm = $event"
      />

      <!-- Form Ekspor Lapangan & Presentasi -->
      <form
        @submit.prevent="exportData"
        class="p-4 mt-4 flex gap-2 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700"
      >
        <section
          id="export"
          class="flex flex-col gap-4 text-center items-center w-full sm:gap-2 md:flex-row"
        >
          <span class="block text-center mb-2">Ekspor</span>

          <div
            class="flex flex-col gap-2 w-full sm:flex-row sm:gap-2 md:w-auto"
          >
            <select
              v-model="selectedJuri"
              id="juri"
              required
              class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="" disabled>Pilih Juri</option>
              <option v-for="juri in juriList" :key="juri.id" :value="juri.id">
                {{ juri.name }}
              </option>
            </select>
            <select
              v-model="selectedEvent"
              id="event"
              required
              class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="" disabled>Pilih Event</option>
              <option
                v-for="event in eventList"
                :key="event.id"
                :value="event.id"
              >
                {{ event.name }}
              </option>
            </select>
            <select
              v-model="selectedYear"
              id="year"
              required
              class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="" disabled>Pilih Tahun</option>
              <option
                v-for="(year, index) in createdAtList"
                :key="index"
                :value="year"
              >
                {{ year }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-2 w-full sm:flex-row sm:w-auto mt-2">
            <button
              type="submit"
              class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1.5 w-full sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Ekspor
            </button>
            <button
              @click="resetExport"
              type="button"
              class="text-black bg-yellow-300 hover:bg-yellow-400 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-1.5 w-full sm:w-auto"
            >
              Reset
            </button>
          </div>
        </section>
      </form>

      <!-- Tabel Riwayat -->
      <section
        v-if="!isDetailVisible"
        id="table-evaluation-lapangan"
        class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-5"
      >
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <center class="text-2xl font-bold text-gray-900">
            Riwayat {{ titleText }}
          </center>
          <br />
          <div class="flex items-center gap-2 ms-2 mb-2 sm:mb-0">
            <label
              for="filterKeyword"
              class="text-sm font-medium text-gray-900 dark:text-white"
              >Cari:</label
            >
            <input
              v-model.trim="filterKeyword"
              @input="handleSearch(filterKeyword, getListEvaluasiYelyel)"
              id="filterKeyword"
              type="search"
              class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 sm:w-auto text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Dept / Tim / Event / Juri"
            />
          </div>
          <table
            id="evaluasi"
            class="w-full mt-4 text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
          >
            <thead
              class="text-xs text-center text-gray-800 uppercase bg-gray-400 dark:bg-gray-700 dark:text-gray-400"
            >
              <tr>
                <th scope="col" class="px-6 py-3">No</th>
                <th scope="col" class="px-6 py-3">Dept</th>
                <th scope="col" class="px-6 py-3">Event</th>
                <th scope="col" class="px-6 py-3">Skor</th>
                <th scope="col" class="px-6 py-3">Juri</th>
                <th scope="col" class="px-6 py-3">Dibuat</th>
                <th scope="col" class="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(list, index) in evaluationList" :key="index">
                <tr
                  class="odd:bg-white text-center odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                >
                  <td class="px-6 py-4">
                    {{ index + 1 + (currentPage - 1) * pageSize }}
                  </td>
                  <td class="px-6 py-4">{{ list.deptName }}</td>
                  <td class="px-6 py-4">{{ list.eventName }}</td>
                  <td class="px-6 py-4">
                    {{ formatScore(list.score) }}
                  </td>
                  <td class="px-6 py-4">{{ list.juriName }}</td>
                  <td class="px-6 py-4">
                    {{ formatDate(list.createdAt) }}
                  </td>
                  <td class="px-6 py-4">
                    <a
                      class="font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer"
                      @click="
                        getDetailsYelyel(
                          list.deptId,
                          list.juriId,
                          list.createdAt
                        )
                      "
                      >Detail</a
                    >
                  </td>
                </tr>
              </template>
            </tbody>
            <tfoot>
              <tr v-if="!evaluationList.length">
                <td colspan="7" class="p-4">
                  <center class="font-bold">Tidak Ada Data</center>
                </td>
              </tr>
            </tfoot>
          </table>
          <nav
            class="flex items-center flex-column flex-wrap p-4 md:flex-row justify-between pt-4"
            aria-label="Navigasi Tabel"
          >
            <span
              class="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto"
            >
              Menampilkan
              <span class="font-semibold text-gray-900 dark:text-white">{{
                (currentPage - 1) * pageSize + 1
              }}</span>
              -
              <span class="font-semibold text-gray-900 dark:text-white">{{
                Math.min(currentPage * pageSize, totalElements)
              }}</span>
              dari
              <span class="font-semibold text-gray-900 dark:text-white">{{
                totalElements
              }}</span>
              <span class="ms-5">Halaman </span>
              <span class="font-semibold"> - {{ currentPage }}</span> dari
              <span class="font-semibold"> {{ totalPages }}</span>
            </span>
            <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
              <li>
                <button
                  :disabled="currentPage === 1"
                  @click.prevent="changePageNumber(currentPage - 1)"
                  :class="{ 'text-gray-500 border-gray-300': currentPage <= 1 }"
                  class="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Sebelumnya
                </button>
              </li>
              <template v-for="pageNumber in pageNumbers" :key="pageNumber">
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
                  class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Selanjutnya
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </section>
      <section v-if="isDetailVisible" class="mt-4">
        <div
          class="flex justify-between items-center bg-blue-200 p-2 rounded-t-lg"
        >
          <span class="text-lg font-bold text-gray-900"
            >Detail Evaluasi {{ titleText }}</span
          >
          <button
            @click="closeDetail"
            class="text-red-500 font-extrabold size-8 me-4 hover:text-red-700"
          >
            Tutup
          </button>
        </div>
        <table
          id="detail"
          class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead
            class="text-xs text-gray-800 uppercase bg-gray-400 dark:bg-gray-700 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="px-6 py-3">No</th>
              <th scope="col" class="px-6 py-3">Pertanyaan</th>
              <th scope="col" class="px-6 py-3">Skor</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(detail, index) in detailevaluationList"
              :key="index"
              class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
            >
              <td class="px-6 py-4">{{ index + 1 }}</td>
              <td class="px-6 py-4">{{ detail.pertanyaan }}</td>
              <td class="px-6 py-4">
                <input
                  type="number"
                  v-model.number="detail.score"
                  class="border border-gray-300 rounded-lg px-2 py-1"
                />
              </td>
            </tr>
            <tr
              class="bg-gray-200 dark:bg-gray-800 border-b dark:border-gray-700"
            >
              <td colspan="2" class="px-6 py-4 font-bold text-right">
                Total Skor
              </td>
              <td class="px-6 py-4 font-bold">{{ formatScore(totalScore) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="mt-4 flex gap-2">
          <button
            @click="updateScore"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Simpan
          </button>
          <button
            @click="closeDetail"
            class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Batal
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import SidebarWithNavbar from "@/components/SidebarWithNavbar.vue";
import axios from "axios";
import Spinner from "@/components/Spinner.vue";
import NavButtonGroup from "@/components/NavButtonGroup.vue";
import CreateFormLapangan from "@/components/CreateFormLapangan.vue";
import NavEvaluasi from "@/components/NavEvaluasi.vue";

import {
  handleError,
  handleSearch,
  changePage,
  calculatePageNumbers,
  withLoading,
  formatDate,
  formatScore,
  isLoading,
  handleSuccess,
  isSidebarOpen,
  sidebarToggle,
} from "@/utils/utils";

const showForm = ref(false);
const titleText = "Evaluasi Yel-Yel";
const isDetailVisible = ref(false);

const selectedJuri = ref("");
const filterKeyword = ref();
const selectedEvent = ref("");
const selectedYear = ref("");
const juriList = ref([]);
const eventList = ref([]);
const teamsList = ref([]);
const createdAtList = ref([]);
const currentPage = ref(1);
const totalPages = ref(0);
const pageSize = ref();
const totalElements = ref(0);
const evaluationList = ref([]);
const detailevaluationList = ref([]);

const getListEvaluasiYelyel = async () => {
  withLoading(async () => {
    try {
      const response = await axios.get("/yelyel/evaluations-list", {
        params: {
          page: currentPage.value,
          search: filterKeyword.value,
        },
      });
      evaluationList.value = response.data.data;
      currentPage.value = response.data.currentPage;
      totalPages.value = response.data.totalPages;
      pageSize.value = response.data.pageSize;
      totalElements.value = response.data.totalElements;

      console.log(evaluationList.value);
    } catch (error) {
      handleError("Gagal Memuat data ...");
    }
  });
};

const getAttributes = async () => {
  withLoading(async () => {
    const response = await axios.get("/yelyel/attributes");
    juriList.value = response.data.juris;
    eventList.value = response.data.events;
    teamsList.value = response.data.teams;
    createdAtList.value = response.data.createdAt;
  });
};

const getDetailsYelyel = async (deptId, juriId, createdAt) => {
  console.log(deptId);
  console.log(juriId);
  console.log(createdAt);
  
  withLoading(async () => {
    try {
      const response = await axios.get("yelyel/detail-evaluation", {
        params: {
          deptId: deptId,
          juriId: juriId,
          createdAt : createdAt
          
        },
      });
      detailevaluationList.value = response.data;
      isDetailVisible.value = true;
      console.log(response);
      
    } catch (error) {
      handleError("Gagal mendapatkan detail");
      console.log("ERROR" + error);
      
    }
  });
};

const updateScore = async () => {
  try {
    await axios.put("/yelyel/update-scores", detailevaluationList.value);
    handleSuccess("Skor diperbarui");
    closeDetail();
    getListEvaluasiYelyel();
  } catch (error) {
    handleError("Gagal memperbarui skor");
  }
};

const totalScore = computed(() => {
  return detailevaluationList.value.reduce((total, detail) => {
    return total + (detail.score || 0);
  }, 0);
});

const closeDetail = () => {
  isDetailVisible.value = false;
  detailevaluationList.value = null;
};

const exportData = async () => {
  try {
    let endpoint = "/report/evaluasi-yelyel";
    let params = {
      userId: selectedJuri.value,
      eventId: selectedEvent.value,
      year: selectedYear.value,
    };

    const response = await axios.get(endpoint, {
      params: params,
      responseType: "blob",
    });

    const contentDisposition = response.headers["content-disposition"];
    const filename = contentDisposition
      ? contentDisposition.split("filename=")[1].split(";")[0].replace(/"/g, "")
      : "laporan.xlsx";

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    handleError("Gagal mengekspor data");
  }
};

const toggleForm = () => {
  showForm.value = !showForm.value;
};

const resetExport = () => {
  selectedJuri.value = "";
  selectedEvent.value = "";
  selectedYear.value = "";
};

const changePageNumber = async (newPage) => {
  currentPage.value = newPage;
  await changePage(newPage, getListEvaluasiYelyel, totalPages);
};

const pageNumbers = computed(() => {
  return calculatePageNumbers(currentPage.value, totalPages.value);
});

onMounted(() => {
  getListEvaluasiYelyel(currentPage.value);
  getAttributes();
});
</script>

<style></style>

<template>
  <div>
    <!-- Spinner dan Komponen Navbar -->
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

      <CreateFormPresentasi
        v-if="showForm"
        @update-show-form="showForm = $event"
      />

      <!-- Form Ekspor Lapangan & Presentasi -->
      <form
        @submit.prevent="exportData"
        class="p-4 mt-4 flex flex-wrap gap-2 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700"
      >
        <section id="export" class="flex items-center gap-2 w-full">
          <p>Ekspor</p>
          <select
            v-model="selectedJuri"
            id="juri"
            required
            class="ml-2 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-40 sm:w-auto text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            class="ml-2 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-40 sm:w-auto text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="" disabled>Pilih Acara</option>
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
            class="ml-2 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-40 sm:w-auto text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="" disabled>Pilih Tahun</option>
            <option v-for="year in createdList" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
          <button
            type="submit"
            class="ml-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Ekspor
          </button>
          <button
            @click="resetExport"
            type="button"
            class="text-black bg-yellow-300 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Reset
          </button>
        </section>
      </form>

      <!-- Tabel Riwayat Evaluasi -->
      <section
        v-if="!showDetail"
        id="table-history-presentasi"
        class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-5"
      >
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <center class="text-2xl font-bold text-gray-900">
            Riwayat {{ titleText }}
          </center>
          <br />
          <div class="flex items-center gap-2 mb-2 sm:mb-0">
            <label
              for="filterKeyword"
              class="text-sm font-medium text-gray-900 dark:text-white"
              >Cari:</label
            >
            <input
              v-model.trim="filterKeyword"
              @input="handleSearch(filterKeyword, getEvaluasiList)"
              id="filterKeyword"
              type="search"
              class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 sm:w-auto text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Dept / Tim / Acara / Juri"
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
                <th scope="col" class="px-6 py-3">Tim</th>
                <th scope="col" class="px-6 py-3">Acara</th>
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
                  <td class="px-6 py-4">{{ list.teamName }}</td>
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
                        getDetailsEvaluation(
                          list.teamId,
                          list.juriId,
                          list.eventId
                        )
                      "
                      >Detail</a
                    >
                  </td>
                </tr>
              </template>
            </tbody>
            <tfoot>
              <tr v-if="!evaluationList">
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
              <span class="font-semibold"> - {{ currentPage }}</span>
              <span class="font-semibold"> dari {{ totalPages }}</span>
            </span>
            <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
              <li>
                <button
                  :disabled="currentPage === 1"
                  @click.prevent="changePageNumber(currentPage - 1)"
                  :class="{ 'text-gray-500 border-gray-300': currentPage <= 0 }"
                  class="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
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
                  class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Selanjutnya
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </section>
      <section v-if="showDetail">
        <div
          class="flex justify-between items-center bg-blue-200 p-2 rounded-t-lg mt-4"
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
              v-for="(detail, index) in detailsEvaluationList"
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
import NavEvaluasi from "@/components/NavEvaluasi.vue";
import CreateFormPresentasi from "@/components/CreateFormPresentasi.vue";
import {
  handleSearch,
  changePage,
  calculatePageNumbers,
  withLoading,
  formatDate,
  formatScore,
  isLoading,
  holdPage,
  handleError,
  handleSuccess,
  isSidebarOpen,
  sidebarToggle,
} from "@/utils/utils";

const titleText = ref("Evaluasi Presentasi");
const filterKeyword = ref("");
const showForm = ref(false);
const showDetail = ref(false);
const selectedJuri = ref("");
const selectedEvent = ref("");
const selectedYear = ref("");
const juriList = ref([]);
const eventList = ref([]);
const createdList = ref([]);
const teamsList = ref([]);
const currentPage = ref(1);
const totalPages = ref(0);
const pageSize = ref();
const totalElements = ref(0);
const evaluationList = ref([]);
const detailsEvaluationList = ref([]);

const getEvaluasiList = async () => {
  withLoading(async () => {
    try {
      const response = await axios.get("/presentasi/evaluation-list", {
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
    } catch (error) {
      console.error("Gagal memuat data evaluasi");
    }
  });
};

const getDetailsEvaluation = async (teamId, userId, eventId) => {
  withLoading(async () => {
    try {
      console.log(teamId);
      console.log(eventId);
      console.log(userId);

      const response = await axios.get("/presentasi/details-evaluation", {
        params: {
          teamId: teamId,
          userId: userId,
          eventId: eventId,
        },
      });

      detailsEvaluationList.value = response.data;
      showDetail.value = true;
    } catch (error) {
      console.error("Gagal mendapatkan detail");
    }
  });
};

const getAttributes = async () => {
  withLoading(async () => {
    try {
      const response = await axios.get("/presentasi/attributes");
      juriList.value = response.data.juris;
      eventList.value = response.data.events;
      teamsList.value = response.data.teams;
      createdList.value = response.data.createdAt;
    } catch (error) {
      console.error("Gagal mendapatkan atribut");
    }
  });
};

const totalScore = computed(() => {
  return detailsEvaluationList.value.reduce((total, detail) => {
    return total + (detail.score || 0);
  }, 0);
});

const closeDetail = () => {
  showDetail.value = !showDetail.value;
};

const toggleForm = () => {
  showForm.value = !showForm.value;
};

const updateScore = async () => {
  try {
    const response = await axios.put(
      "/presentasi/update-scores",
      detailsEvaluationList.value
    );
    handleSuccess("Skor berhasil diperbarui");
    getEvaluasiList();
    closeDetail();
    console.log("Skor berhasil diperbarui", response.data);
  } catch (error) {
    console.error("Gagal memperbarui skor", error);
    handleError("Gagal memperbarui skor");
  }
};

const exportData = async () => {
  try {
    let endpoint = "";
    let params = {};

    endpoint = "/report/evaluasi-presentasi";
    params = {
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
      : "report.xlsx";

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    handleError("Gagal mengekspor data", error.response.status);
    console.error("Gagal mengekspor data:", error.response.status);
  }
};

const resetExport = () => {
  selectedJuri.value = "";
  selectedEvent.value = "";
  selectedYear.value = "";
};

const changePageNumber = (newPage) => {
  currentPage.value = newPage;
  changePage(newPage, getEvaluasiList);
};

const pageNumbers = computed(() => {
  return calculatePageNumbers(currentPage.value, totalPages.value);
});

onMounted(() => {
  holdPage(currentPage);
  getEvaluasiList();
  getAttributes();
});
</script>

<style></style>

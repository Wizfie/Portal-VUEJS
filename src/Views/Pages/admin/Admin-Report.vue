<script setup>
import { onMounted, ref, computed } from "vue";
import SiddebarWithNavbar from "@/components/SidebarWithNavbar.vue";
import { useStore } from "vuex";
import axios from "axios";
import Spinner from "@/components/Spinner.vue";
import {
  formatDate,
  isSidebarOpen,
  sidebarToggle,
  withLoading,
  handleError,
  handleSuccess,
} from "@/utils/utils";

const store = useStore();
const user = ref("");
const showInput = ref(false);

const year = ref("");
const noUrut = ref("");
const month = ref("");
const listReport = ref([]);

onMounted(() => {
  user.value = store.getters.getUserData;
  getReport();
});

const getReport = async () => {
  try {
    withLoading(async () => {
      const response = await axios.get("/reports/log");
      listReport.value = response.data;
      console.log(listReport.value);
    });
  } catch (error) {
    console.error("failed get report /n " + error);
  }
};

const toggleInput = () => {
  showInput.value = !showInput.value;
};

const generateReport = async () => {
  // Validasi input hanya dilakukan jika berasal dari form
  if (!isFormValid.value) {
    handleError("Input tidak valid");
    return;
  }

  withLoading(async () => {
    try {
      // Padding untuk noUrut jika kurang dari 3 digit
      if (noUrut.value.length < 3 && month.value.length < 2) {
        noUrut.value = noUrut.value.padStart(3, "0");
        month.value = month.value.padStart(2, "0");
      }

      // Request ke server untuk generate report
      const response = await axios.get("/reports/generate-awarding", {
        params: {
          year: year.value,
          noUrut: noUrut.value,
          bulan: month.value,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      // Nama file yang di-download disesuaikan berdasarkan data yang digunakan
      link.href = url;
      link.setAttribute(
        "download",
        `Surat_Keputusan_Juara_${year.value}_${noUrut.value}.docx`
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      handleSuccess("Report downloaded successfully");

      // Refresh daftar laporan setelah berhasil membuat laporan baru
      getReport();
    } catch (error) {
      handleError("Failed to generate report: " + error.message);
    }
  });
};

const validateNumeric = (field) => {
  if (field === "year") {
    year.value = year.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (year.value.length > 4) {
      year.value = year.value.slice(0, 4); // Limit input to 4 characters
    }
  } else if (field === "bulan") {
    month.value = month.value.replace(/\D/g, ""); // Remove non-numeric characters
  }
};

const validateMonth = () => {
  month.value = month.value.replace(/\D/g, ""); // Remove non-numeric characters
  if (parseInt(month.value) > 12) {
    month.value = "12"; // Restrict to 12 as the maximum value for month
  }
};

// Error messages for noUrut and month
const noUrutError = computed(() =>
  parseInt(noUrut.value) < 1 ? "No Urut must be at least 001" : ""
);
const monthError = computed(() =>
  parseInt(month.value) < 1 || parseInt(month.value) > 12
    ? "Month must be between 01 and 12"
    : ""
);
const yearError = computed(() =>
  year.value.length > 4 ? "Year invalid must be a 4-digit number" : ""
);

// Enable button only if all inputs are valid
const isFormValid = computed(
  () =>
    noUrut.value != "" &&
    !noUrutError.value &&
    month.value != "" &&
    !monthError.value &&
    year.value != "" &&
    !yearError.value
);

const setReportData = (itemNoUrut, itemMonth, itemYear) => {
  noUrut.value = itemNoUrut;
  month.value = itemMonth;
  year.value = itemYear;
  generateReport();
};

const clearInput = () => {
  noUrut.value = "";
  year.value = "";
  month.value = "";
  toggleInput();
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
        <div class="flex justify-between items-center">
          <h1 class="font-semibold text-xl">Report Log</h1>
          <button
            @click="toggleInput"
            class="p-2 bg-blue-500 rounded-md text-white"
          >
            Buat Laporan
          </button>
        </div>
      </div>

      <section v-if="showInput">
        <div class="flex gap-2 py-4 px-4 items-center">
          <div class="mb-6">
            <label
              for="no-urut"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >No Urut</label
            >
            <input
              v-model="noUrut"
              type="text"
              id="no-urut"
              placeholder="001"
              min="001"
              required
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <p v-if="noUrutError" class="text-red-500 text-xs">
              {{ noUrutError }}
            </p>
          </div>

          <div class="mb-6">
            <label
              for="bulan"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Bulan</label
            >
            <input
              v-model="month"
              type="text"
              id="bulan"
              placeholder="MM"
              required
              @input="validateMonth"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <p v-if="monthError" class="text-red-500 text-xs">
              {{ monthError }}
            </p>
          </div>
          <div class="mb-6">
            <label
              for="tahun"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Tahun</label
            >
            <input
              v-model="year"
              type="text"
              id="tahun"
              placeholder="YYYY"
              @input="validateNumeric"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <p v-if="yearError" class="text-red-500 text-xs">
              {{ yearError }}
            </p>
          </div>
          <button
            @click.prevent="generateReport"
            class="py-2 px-4 bg-blue-500 rounded-md text-white"
          >
            Buat
          </button>
          <button
            @click="clearInput"
            class="py-2 px-4 bg-red-500 rounded-md text-white"
          >
            Batal
          </button>
        </div>
      </section>

      <section>
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg p-2">
          <table
            class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
          >
            <thead
              class="text-xs text-gray-700 uppercase bg-gray-400 dark:bg-gray-700 dark:text-gray-400 rounded-t-lg"
            >
              <tr>
                <th scope="col" class="px-6 py-3">No</th>
                <th scope="col" class="px-6 py-3">No urut</th>
                <th scope="col" class="px-6 py-3">bulan</th>
                <th scope="col" class="px-6 py-3">tahun</th>
                <th scope="col" class="px-6 py-3">Dibuat</th>
                <th scope="col" class="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in listReport"
                :key="index"
                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <th
                  scope="row"
                  class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {{ index + 1 }}
                </th>
                <td class="px-6 py-4">{{ item.noUrut }}</td>
                <td class="px-6 py-4">{{ item.bulan }}</td>
                <td class="px-6 py-4">{{ item.year }}</td>
                <td class="px-6 py-4">{{ formatDate(item.generatedDate) }}</td>
                <td class="px-6 py-4">
                  <a
                    @click.prevent="
                      setReportData(item.noUrut, item.month, item.year)
                    "
                    class="font-medium text-blue-600 cursor-pointer dark:text-blue-500 hover:underline"
                    >Download</a
                  >
                </td>
              </tr>
            </tbody>
            <tfoot v-if="listReport.length === 0">
              <tr>
                <td colspan="6" class="text-center py-4">
                  <span class="text-gray-500 font-bold">No Data</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style></style>

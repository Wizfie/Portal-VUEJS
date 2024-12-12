<template>
  <main>
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
      <div
        class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-14 bg-white shadow-lg"
      >
        <div class="container mx-auto p-4">
          <nav class="flex py-4" aria-label="Breadcrumb">
            <ol
              class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse"
            >
              <li class="inline-flex items-center">
                <router-link
                  to="/awards"
                  href="#"
                  class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                >
                  <svg
                    class="w-3 h-3 me-2.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"
                    />
                  </svg>
                  Lapangan & Presentasi
                </router-link>
              </li>
              <li>
                <div class="flex items-center">
                  <svg
                    class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <router-link
                    to="/awards/yelyel"
                    class="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white"
                    >Yel-Yel</router-link
                  >
                </div>
              </li>
            </ol>
          </nav>

          <div
            class="flex justify-between items-center px-5 py-3 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
            aria-label="Breadcrumb"
          >
            <div>
              <span class="text-xl font-medium">Hasil Evaluasi Yel-Yel</span>
            </div>
          </div>

          <div class="text-center mb-4 mt-4">
            <label>
              <input type="checkbox" v-model="showAllYears" />
              Tampilkan Semua Tahun
            </label>
          </div>

          <section v-if="!showAllYears">
            <span class="mb-4 font-semibold"> {{ year }}</span>
            <div
              id="history-now"
              v-for="(item, index) in yelyelList"
              :key="index"
              class="mb-4 border-b-2"
            >
              <details open class="mb-4">
                <summary
                  class="cursor-pointer text-2xl font-bold mb-4 text-gray-700 hover:underline"
                >
                  {{ item.deptName }}
                </summary>
                <div class="ms-4 mb-4 border-b">
                  <div class="mb-4 bg-gray-50 p-4 rounded-lg shadow-md">
                    <div class="flex justify-between gap-5 items-center mb-2">
                      <p class="text-lg font-bold">
                        #Peringkat :
                        <span class="font-bold text-green-600">
                          {{ index + 1 }}
                        </span>
                      </p>
                      <p class="text-md font-semibold">
                        Skor Akhir :
                        <span class="font-bold text-green-600">
                          {{ item.totalScore }}
                        </span>
                      </p>
                      <details class="flex-1 ms-4 text-right">
                        <summary
                          class="cursor-pointer text-blue-600 hover:underline"
                        >
                          Detail Penilaian
                        </summary>
                        <!-- Tabel untuk Skor Juri -->
                        <table
                          class="table-auto w-full mt-2 border-collapse border border-gray-300"
                        >
                          <thead>
                            <tr class="bg-gray-200">
                              <th
                                class="px-4 py-2 border border-gray-300 text-left"
                              >
                                Juri
                              </th>
                              <th
                                class="px-4 py-2 border border-gray-300 text-left"
                              >
                                Skor
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(juri, index) in item.juris"
                              :key="index"
                              class="hover:bg-gray-100"
                            >
                              <td class="border px-4 py-2 text-left">
                                {{ juri.juriName }}
                              </td>
                              <td class="border px-4 py-2 text-left">
                                {{ juri.score }}
                              </td>
                            </tr>
                            <tr class="bg-gray-100 font-semibold">
                              <td class="border px-4 py-2 text-left">Total</td>
                              <td class="border px-4 py-2 text-left">
                                {{ item.totalScore }}
                              </td>
                            </tr>
                            <tr class="bg-gray-100 font-semibold">
                              <td class="border px-4 py-2 text-left">
                                Rata-rata
                              </td>
                              <td class="border px-4 py-2 text-left">
                                {{ item.totalScore / item.juris.length }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </details>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </section>
          <section v-else>
            <!-- Tabel untuk Semua Tahun (history-all) -->
            <div v-show="!showDetails" class="overflow-x-auto">
              <table
                class="table-auto w-full mt-4 border-collapse border border-gray-300"
              >
                <thead>
                  <tr class="bg-gray-200">
                    <th class="px-4 py-2 border border-gray-300 text-left">
                      Tahun
                    </th>
                    <th class="px-4 py-2 border border-gray-300 text-left">
                      Dept.
                    </th>
                    <th class="px-4 py-2 border border-gray-300 text-left">
                      Skor Akhir
                    </th>
                    <th class="px-4 py-2 border border-gray-300 text-left">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in yelyelList" :key="index">
                    <td
                      v-if="isFirstRowForYear(index)"
                      :rowspan="getRowspanForYear(item.year)"
                      class="border px-4 py-2 text-left bg-gray-100"
                    >
                      {{ item.year }}
                    </td>
                    <td class="border px-4 py-2 text-left bg-gray-50">
                      {{ item.deptName }}
                    </td>
                    <td class="border px-4 py-2 text-left">
                      {{ item.totalScore }}
                    </td>
                    <td class="border px-4 py-2 text-left">
                      <button
                        class="text-blue-600 hover:underline"
                        @click="showJurors(index)"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Tabel untuk Detail Juri -->
            <div v-show="showDetails" class="overflow-x-auto mt-2">
              <span class="font-semibold">Dept : {{ selectedDept }}</span>
              <table
                class="table-auto w-full border-collapse border border-gray-300"
              >
                <thead>
                  <tr class="bg-gray-200">
                    <th class="px-4 py-2 border border-gray-300 text-left">
                      Juri
                    </th>
                    <th class="px-4 py-2 border border-gray-300 text-left">
                      Skor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(juri, juriIndex) in jurorData"
                    :key="juriIndex"
                    class="hover:bg-gray-100"
                  >
                    <td class="border px-4 py-2">
                      {{ juri.juriName }}
                    </td>
                    <td class="border px-4 py-2">
                      {{ juri.score }}
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-100 font-semibold">
                  <tr>
                    <td class="border-t px-4 py-2">Total</td>
                    <td class="border-t px-4 py-2">
                      {{ selectedTotalScore }}
                    </td>
                  </tr>
                  <tr>
                    <td class="border-t px-4 py-2">Rata-rata</td>
                    <td class="border-t px-4 py-2">
                      {{ (selectedTotalScore / jurorData.length).toFixed(2) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
              <!-- Tombol untuk kembali ke tabel history-all -->
              <button
                class="text-blue-600 hover:underline mt-4"
                @click="showDetails = false"
              >
                Kembali ke Riwayat
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import SiddebarWithNavbar from "@/components/SidebarWithNavbar.vue";
import Spinner from "@/components/Spinner.vue";
import { useStore } from "vuex";

import {
  isLoading,
  withLoading,
  sidebarToggle,
  isSidebarOpen,
} from "@/utils/utils";

const store = useStore();
const user = ref("");
const year = ref(new Date().getFullYear());
const yelyelList = ref([]);
const showAllYears = ref(false);
const selectedAllYearsIndex = ref(null);
const jurorData = ref([]);
const selectedTotalScore = ref(0);
const selectedDept = ref("");
const showDetails = ref(false);

onMounted(() => {
  user.value = store.getters.getUserData;

  getAwardingYelyel();
});
watch(showAllYears, () => {
  getAwardingYelyel();
});

const getAwardingYelyel = async () => {
  withLoading(async () => {
    try {
      const params = !showAllYears.value ? { year: year.value } : { year: "" };
      // console.log(params);
      const response = await axios.get("/yelyel/final-scores", {
        params,
      });
      yelyelList.value = response.data;
      // console.log(yelyelList.value);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });
};

const showJurors = (index) => {
  if (selectedAllYearsIndex.value === index) {
    selectedAllYearsIndex.value = null;
    jurorData.value = [];
    selectedTotalScore.value = 0;
    selectedDept.value = "";
    showDetails.value = false;
  } else {
    selectedAllYearsIndex.value = index;
    jurorData.value = yelyelList.value[index]?.juris || [];
    selectedTotalScore.value = yelyelList.value[index]?.totalScore || 0;
    selectedDept.value = yelyelList.value[index]?.deptName || "";
    showDetails.value = true;
  }
};

const isFirstRowForYear = (index) => {
  return (
    index === 0 ||
    yelyelList.value[index].year !== yelyelList.value[index - 1].year
  );
};

const getRowspanForYear = (year) => {
  return yelyelList.value.filter((item) => item.year === year).length;
};
</script>

<style></style>

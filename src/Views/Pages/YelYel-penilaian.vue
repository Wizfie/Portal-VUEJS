<script setup>
import { onMounted, ref, computed } from "vue";
import SidebarWithNavbar from "@/components/SidebarWithNavbar.vue";
import axios from "axios";
import Spinner from "@/components/Spinner.vue";
import {
  handleError,
  handleSuccess,
  isLoading,
  withLoading,
  isSidebarOpen,
  sidebarToggle,
} from "@/utils/utils";
import { useStore } from "vuex";

const store = useStore();
const deptList = ref([]);
const detailsList = ref([]);
const user = ref();
const showMain = ref(true);
const selectedDept = ref(null);
const selectedYear = ref(null);

onMounted(() => {
  user.value = store.getters.getUserData;
  getDeptList();
});

const getDeptList = async () => {
  await withLoading(async () => {
    try {
      const response = await axios.get("/registration/yelyel-user", {
        params: {
          juriId: user.value.id,
        },
      });
      deptList.value = response.data;
    } catch (error) {
      handleError("Terjadi kesalahan saat memuat data tim");
    }
  });
};

const getDetailsEvaluation = async (deptId, year) => {
  await withLoading(async () => {
    try {
      const response = await axios.get("/yelyel/evaluasi-by-penilai", {
        params: {
          userId: deptId,
          juriId: user.value.id,
          year: year,
        },
      });

      detailsList.value = response.data;
    } catch (e) {
      handleError("Gagal Memuat Detail: " + e);
    }
  });
};

const handleDetailsClick = (deptId, year) => {
  selectedDept.value = deptId;
  selectedYear.value = year;

  showMain.value = false;
  getDetailsEvaluation(deptId, year);
};

// Function to save edited scores
const saveDetailsEvaluation = async () => {
  try {
    await withLoading(async () => {
      // Prepare data to be sent
      const dataToSend = detailsList.value.map((detail) => ({
        id: detail.id,
        score: detail.score,
      }));

      const response = await axios.put("/yelyel/update-scores", dataToSend);
      handleSuccess("Data berhasil disimpan");
    });
  } catch (error) {
    handleError("Gagal menyimpan perubahan: " + error);
  }
};

// Function to calculate total score
const totalScore = computed(() => {
  return detailsList.value.reduce(
    (total, detail) => total + parseFloat(detail.score || 0),
    0
  );
});

// Function to return to the main view
const goBack = () => {
  showMain.value = true;
};
</script>

<template>
  <main>
    <Spinner v-if="isLoading"></Spinner>
    <SidebarWithNavbar @toggleSidebar="sidebarToggle"></SidebarWithNavbar>
    <section
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
        <div class="flex items-center">
          <div class="flex-1 text-center">
            <span class="text-2xl font-bold text-gray-900"
              >Penilaian Yel-Yel</span
            >
          </div>
        </div>
      </div>

      <!-- Section DEPT MAIN -->
      <div
        v-if="showMain"
        class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-5"
      >
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table
            id="list-teams"
            class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
          >
            <thead
              class="text-xs text-gray-700 uppercase bg-gray-400 dark:bg-gray-700 dark:text-gray-400"
            >
              <tr>
                <th scope="col" class="px-6 py-3">No</th>
                <th scope="col" class="px-6 py-3">Departemen</th>
                <th scope="col" class="px-6 py-3">Nilai</th>
                <th scope="col" class="px-6 py-3">Tahun</th>
                <th scope="col" class="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody v-if="deptList.length > 0">
              <tr
                v-for="(team, index) in deptList"
                :key="index"
                class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-600 even:dark:bg-gray-800 border-b dark:border-gray-700"
              >
                <td class="px-6 py-4">{{ index + 1 }}</td>
                <td class="px-6 py-4 font-semibold">
                  {{ team.createdByUsername }}
                </td>
                <td class="px-6 py-4 font-bold">{{ team.score }}</td>
                <td class="px-6 py-4">{{ team.year }}</td>
                <td class="px-6 py-4">
                  <span v-if="!team.score">
                    <router-link
                      :to="{
                        name: 'evaluasi-yelyel',
                        params: {
                          deptId: team.createdBy,
                          deptName: team.createdByUsername,
                        },
                      }"
                      class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                      >Buat Nilai</router-link
                    >
                  </span>
                  <span v-else>
                    <a
                      @click="handleDetailsClick(team.createdBy, team.year)"
                      class="font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer"
                      >Detail</a
                    >
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section DETAILS -->
      <div
        v-if="!showMain"
        class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-5"
      >
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table
            id="details-evaluasi"
            class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
          >
            <thead
              class="text-xs text-gray-700 uppercase bg-gray-400 dark:bg-gray-700 dark:text-gray-400"
            >
              <tr>
                <th scope="col" class="px-6 py-3">No</th>
                <th scope="col" class="px-6 py-3">Pertanyaan</th>
                <th scope="col" class="px-6 py-3">Nilai</th>
              </tr>
            </thead>
            <tbody v-if="detailsList.length > 0">
              <tr
                v-for="(detail, index) in detailsList"
                :key="index"
                class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-600 even:dark:bg-gray-800 border-b dark:border-gray-700"
              >
                <td class="px-6 py-4">{{ index + 1 }}</td>
                <td class="px-6 py-4 font-semibold">{{ detail.pertanyaan }}</td>
                <td class="px-6 py-4 font-bold">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    v-model="detail.score"
                    class="border border-gray-300 rounded px-2 py-1"
                  />
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" class="px-6 py-3 font-bold text-right">
                  Total Nilai
                </td>
                <td class="px-6 py-3 font-bold">{{ totalScore }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Tombol Save dan Back -->
        <div class="flex justify-end mt-4 space-x-4">
          <button
            @click="goBack"
            class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Kembali
          </button>
          <button
            @click="saveDetailsEvaluation"
            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Simpan
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

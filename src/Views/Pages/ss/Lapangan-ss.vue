<script setup>
import { onMounted, ref, watch } from "vue";
import axios from "axios";
import SidebarWithNavbar from "@/components/SidebarWithNavbar.vue";
import Spinner from "@/components/Spinner.vue";
import {
  handleError,
  withLoading,
  sidebarToggle,
  isSidebarOpen,
  handleSuccess,
} from "@/utils/utils";
import Breadcrumb from "@/components/BreadcrumbPenilaian.vue";

const userData = ref(null);
const teamList = ref([]);
const evaluasiDetail = ref([]);
const totalScore = ref(0);
const showEvaluasiTable = ref(false);

// Breadcrumb items
const breadcrumbItems = ref([
  { name: "Lapangan", route: "/lapangan-ss" },
  { name: "Presentasi", route: "/presentasi-ss" },
]);

onMounted(() => {
  getCurrentLogin();
  getTeamList();
});

const getTeamList = async (pageSize = 1000) => {
  await withLoading(async () => {
    try {
      const response = await axios.get("/registration/get-all", {
        params: { pageSize },
      });
      const allRegistrations = response.data.data;
      const filteredRegistrations = allRegistrations.filter(
        (registration) => registration.event.eventType === "SS"
      );

      for (const registration of filteredRegistrations) {
        try {
          const evaluasiResponse = await axios.get(
            "/lapangan/evaluasi-by-penilai",
            {
              params: {
                userId: userData.value.id,
                teamId: registration.team.teamId,
                eventId: registration.event.eventId,
              },
            }
          );

          if (evaluasiResponse.data && Array.isArray(evaluasiResponse.data)) {
            registration.evaluasiDetails = evaluasiResponse.data;
            // Gunakan fungsi calculateTeamTotalScore untuk hitung total skor
            registration.totalScore = calculateTeamTotalScore(
              evaluasiResponse.data
            );
          } else {
            console.error("Unexpected response format:", evaluasiResponse.data);
            registration.totalScore = 0;
          }
        } catch (innerError) {
          console.error("Error fetching evaluasi details:", innerError);
          registration.totalScore = 0;
        }
      }

      teamList.value = filteredRegistrations;
    } catch (error) {
      handleError("Terjadi kesalahan saat memuat data tim");
      console.error("Error fetching team list:", error);
    }
  });
};

const getCurrentLogin = () => {
  const currentLogin = localStorage.getItem("userData");
  userData.value = currentLogin ? JSON.parse(currentLogin) : null;
};

const handleDetailsClick = (team, event) => {
  showEvaluasiTable.value = true;
  const selectedTeam = teamList.value.find(
    (registration) =>
      registration.team.teamId === team.teamId &&
      registration.event.eventId === event.eventId
  );

  if (selectedTeam) {
    evaluasiDetail.value = selectedTeam.evaluasiDetails;
    totalScore.value = selectedTeam.totalScore;
  }
};

const handleBackClick = () => {
  showEvaluasiTable.value = false;
  evaluasiDetail.value = [];
};

const updateScore = async () => {
  try {
    const response = await axios.put(
      "/lapangan/update-scores",
      evaluasiDetail.value
    );
    handleSuccess("Skor berhasil diperbarui");
    getTeamList();
    handleBackClick();
    console.log("Skor berhasil diperbarui", response.data);
  } catch (error) {
    console.error("Error memperbarui skor", error);
    handleError("Gagal memperbarui skor");
  }
};
// Fungsi untuk menghitung total score saat ada perubahan input di tabel detail
const calculateDetailTotalScore = () => {
  totalScore.value = calculateTeamTotalScore(evaluasiDetail.value);
};

// Watch evaluasiDetail untuk memantau perubahan pada input tabel detail
watch(evaluasiDetail, calculateDetailTotalScore, { deep: true });

const calculateTeamTotalScore = (evaluasiDetails) => {
  // Menghitung total skor dengan validasi agar jika kosong atau undefined nilainya tetap 0
  return evaluasiDetails.reduce((acc, item) => {
    return acc + (parseFloat(item.score) || 0);
  }, 0);
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
          <button
            v-if="showEvaluasiTable"
            class="p-2 rounded-md text-white bg-gray-900"
            @click="handleBackClick"
          >
            Kembali
          </button>
          <div class="flex-1 text-center">
            <span class="text-2xl font-bold text-gray-900"
              >Penilaian Lapangan</span
            >
          </div>
        </div>
      </div>

      <!-- Komponen Breadcrumb -->
      <Breadcrumb :items="breadcrumbItems" />

      <div
        v-if="!showEvaluasiTable"
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
                <th scope="col" class="px-6 py-3">Dept</th>
                <th scope="col" class="px-6 py-3">Tim</th>
                <th scope="col" class="px-6 py-3">Acara</th>
                <th scope="col" class="px-6 py-3">Nilai</th>
                <th scope="col" class="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(list, index) in teamList"
                :key="index"
                class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-600 even:dark:bg-gray-800 border-b dark:border-gray-700"
              >
                <td class="px-6 py-4">{{ index + 1 }}</td>
                <td class="px-6 py-4">{{ list.team.username }}</td>
                <th
                  scope="row"
                  class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {{ list.team.teamName }}
                </th>
                <td class="px-6 py-4">{{ list.event.eventName }}</td>
                <td class="px-6 py-4">{{ list.totalScore.toFixed(2) }}</td>
                <td class="px-6 py-4">
                  <span v-if="!list.totalScore">
                    <router-link
                      :to="{
                        name: 'evaluasi-lapangan-ss',
                        params: {
                          teamId: list.team.teamId,
                          eventId: list.event.eventId,
                          teamName: list.team.teamName,
                        },
                      }"
                      class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                      >Beri Nilai
                    </router-link>
                  </span>
                  <span v-if="list.totalScore">
                    <a
                      @click.prevent="handleDetailsClick(list.team, list.event)"
                      class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      Detail
                    </a>
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr v-if="!teamList">
                <td class="p-2 text-center" colspan="6">Tidak ada data</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div
        v-if="showEvaluasiTable"
        class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800"
      >
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table
            id="table-evaluasi-details"
            class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
          >
            <thead
              class="text-xs text-gray-700 uppercase bg-gray-400 dark:bg-gray-700 dark:text-gray-400"
            >
              <tr>
                <th scope="col" class="px-6 py-3">No</th>
                <th scope="col" class="px-6 py-3 text-center">Pertanyaan</th>
                <th scope="col" class="px-6 py-3">Nilai</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-if="!evaluasiDetail.length"
                class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
              >
                <td colspan="3" class="px-6 py-4 text-center">
                  Tidak ada data
                </td>
              </tr>
              <tr
                v-for="(item, index) in evaluasiDetail"
                :key="item.id"
                class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
              >
                <td class="px-6 py-4">{{ index + 1 }}</td>
                <th
                  scope="row"
                  class="px-6 py-4 font-medium text-gray-900 whitespace-pre dark:text-white"
                >
                  {{ item.pertanyaan }}
                </th>
                <td class="px-6 py-4">
                  <input
                    type="number"
                    v-model.number="item.score"
                    class="border border-gray-300 rounded-lg px-2 py-1"
                  />
                </td>
              </tr>
            </tbody>
            <tfoot v-if="evaluasiDetail.length">
              <tr class="font-semibold text-gray-900 dark:text-white">
                <th colspan="2" class="px-6 py-3 text-center">Total</th>
                <td class="px-6 py-3 text-end">{{ totalScore.toFixed(2) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="mt-4 flex gap-2 justify-end">
          <button
            @click="updateScore"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Simpan
          </button>
          <button
            @click="handleBackClick"
            class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Batal
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style></style>

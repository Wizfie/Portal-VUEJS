<template>
  <main>
    <Spinner v-if="isLoading"></Spinner>
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
              <span class="text-xl font-medium"
                >Hasil Evaluasi Lapangan & Presentasi</span
              >
            </div>
          </div>

          <div class="text-center mb-4 mt-4">
            <label>
              <input type="checkbox" v-model="showAllYears" />
              Tampilkan Semua Tahun
            </label>
          </div>

          <hr />
          <br />

          <div
            id="lapangan-presentasi-all"
            v-if="showAllYears"
            class="overflow-x-auto"
          >
            <table
              class="table-auto w-full mt-4 border-collapse border border-gray-300"
            >
              <thead>
                <tr class="bg-gray-200">
                  <th class="px-4 py-2 border border-gray-300 text-left">
                    Tahun Event
                  </th>
                  <th class="px-4 py-2 border border-gray-300 text-left">
                    Nama Event
                  </th>
                  <th class="px-4 py-2 border border-gray-300 text-left">
                    Departemen
                  </th>
                  <th class="px-4 py-2 border border-gray-300 text-left">
                    Nama Tim
                  </th>
                  <th class="px-4 py-2 border border-gray-300 text-left">
                    Nilai Akhir
                  </th>
                  <th class="px-4 py-2 border border-gray-300 text-left">
                    Peringkat
                  </th>
                  <th class="px-4 py-2 border border-gray-300 text-left">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(teamData, index) in allTeams" :key="index">
                  <td
                    v-if="isNewYear(index)"
                    :rowspan="getYearRowSpan(index)"
                    class="border px-4 py-2 text-left bg-gray-100"
                  >
                    {{ teamData.eventyear }}
                  </td>
                  <td
                    v-if="isNewEvent(index)"
                    :rowspan="getEventRowSpan(index)"
                    class="border px-4 py-2 text-left bg-gray-50"
                  >
                    {{ teamData.eventName }}
                  </td>
                  <td class="border px-4 py-2 text-left">
                    {{ teamData.dept }}
                  </td>
                  <td class="border px-4 py-2 text-left">
                    {{ teamData.teamName }}
                  </td>
                  <td class="border px-4 py-2 text-left">
                    {{ Number(teamData.nilaiAkhir).toFixed(2) }}
                  </td>
                  <td class="border px-4 py-2 text-left">
                    {{ teamData.rank }}
                  </td>

                  <td class="border px-4 py-2 text-left">
                    <button
                      @click="openModal(teamData)"
                      class="text-blue-600 hover:underline"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else>
            <div
              id="lapangan-presentasi-now"
              v-for="(events, eventYear) in groupedTeams"
              :key="eventYear"
              class="mb-8 border-b-2 pb-6"
            >
              <details open class="mb-4">
                <summary
                  class="cursor-pointer text-2xl font-bold mb-4 text-gray-700 hover:underline"
                >
                  {{ eventYear }}
                </summary>
                <div
                  v-for="(teams, eventName) in events"
                  :key="eventName"
                  class="ms-4 mb-8 border-b-2 pb-6"
                >
                  <details open class="mb-4">
                    <summary
                      class="cursor-pointer text-xl font-bold mb-4 text-gray-700 hover:underline"
                    >
                      {{ eventName }}
                    </summary>
                    <div
                      v-for="team in teams"
                      :key="team.teamId"
                      class="mb-4 bg-gray-50 p-4 rounded-lg shadow-md"
                    >
                      <div class="flex justify-between items-center mb-2">
                        <div>
                          <span class="text-xl font-semibold text-gray-800">
                            <span> {{ team.teamName }} - </span>
                            <small> {{ team.dept }}</small>
                          </span>
                        </div>
                        <div class="text-right">
                          <p class="text-lg font-bold">
                            Peringkat :
                            <span class="font-bold text-green-600">
                              {{ team.rank }}
                            </span>
                          </p>
                          <p class="text-md font-semibold">
                            Nilai Akhir :
                            <span class="font-bold text-green-600">
                              {{ Number(team.nilaiAkhir).toFixed(2) }}
                            </span>
                          </p>
                        </div>
                      </div>

                      <!-- Expanded Section for Details -->
                      <details class="mt-2">
                        <summary
                          class="cursor-pointer text-blue-600 hover:underline"
                        >
                          Detail Penilaian dan Anggota Tim
                        </summary>
                        <div class="overflow-x-auto mt-2">
                          <!-- Display Judul and RisalahFileName -->
                          <div class="mt-4">
                            <p><strong>Judul:</strong> {{ team.judul }}</p>
                            <div
                              v-if="
                                team.risalahFileNames &&
                                team.risalahFileNames.length
                              "
                            >
                              <strong>Risalah Files:</strong>
                              <ul class="list-disc list-inside">
                                <li
                                  v-for="(
                                    fileName, index
                                  ) in team.risalahFileNames"
                                  :key="index"
                                >
                                  {{ fileName }}
                                  <button
                                    @click="
                                      downloadFile(team.risalahFileNames[index])
                                    "
                                    class="text-blue-500 hover:underline ml-2"
                                  >
                                    Unduh
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                          <!-- Display Team Members -->
                          <div class="mt-4">
                            <h4 class="font-semibold">Anggota Tim:</h4>
                            <ul class="list-disc list-inside">
                              <li
                                v-for="member in team.teamMembers"
                                :key="member.teamMemberId"
                              >
                                <span class="font-bold">
                                  {{ member.memberName }} -
                                </span>
                                <span> ({{ member.nip }})</span> |
                                {{ member.memberPosition }}
                              </li>
                            </ul>
                          </div>
                        </div>
                        <!-- Table for Juri Scores -->
                        <table
                          class="table-auto w-full mt-2 border-collapse border border-gray-300"
                        >
                          <thead>
                            <tr class="bg-gray-200">
                              <th
                                class="px-4 py-2 border border-gray-300 text-left"
                              >
                                Nama Juri
                              </th>
                              <th
                                class="px-4 py-2 border border-gray-300 text-left"
                              >
                                Skor Lapangan
                              </th>
                              <th
                                class="px-4 py-2 border border-gray-300 text-left"
                              >
                                Skor Presentasi
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="score in team.userScores"
                              :key="score.id"
                              class="hover:bg-gray-100"
                            >
                              <td class="border px-4 py-2 text-left">
                                {{ score.username }}
                              </td>
                              <td class="border px-4 py-2 text-left">
                                <input
                                  v-if="user.role === 'ADMIN'"
                                  type="number"
                                  v-model="score.scoreLapangan"
                                  class="border p-2 w-full"
                                  step="0.01"
                                  placeholder="Edit Skor Lapangan"
                                  @blur="updateScore(score, 'scoreLapangan')"
                                />
                                <span v-else>
                                  {{ score.scoreLapangan }}
                                </span>
                                <!-- Pesan Sukses -->
                                <p
                                  v-if="
                                    successMessages[score.id + '-scoreLapangan']
                                  "
                                  class="text-green-600 text-sm mt-1"
                                >
                                  {{
                                    successMessages[score.id + "-scoreLapangan"]
                                  }}
                                </p>
                                <!-- Pesan Error -->
                                <p
                                  v-if="
                                    errorMessages[score.id + '-scoreLapangan']
                                  "
                                  class="text-red-600 text-sm mt-1"
                                >
                                  {{
                                    errorMessages[score.id + "-scoreLapangan"]
                                  }}
                                </p>
                              </td>
                              <td class="border px-4 py-2 text-left">
                                <input
                                  v-if="user.role === 'ADMIN'"
                                  type="number"
                                  v-model="score.scorePresentasi"
                                  class="border p-2 w-full"
                                  step="0.01"
                                  placeholder="Edit Skor Presentasi"
                                  @blur="updateScore(score, 'scorePresentasi')"
                                />
                                <span v-else>{{ score.scorePresentasi }}</span>
                                <!-- Pesan Sukses -->
                                <p
                                  v-if="
                                    successMessages[
                                      score.id + '-scorePresentasi'
                                    ]
                                  "
                                  class="text-green-600 text-sm mt-1"
                                >
                                  {{
                                    successMessages[
                                      score.id + "-scorePresentasi"
                                    ]
                                  }}
                                </p>
                                <!-- Pesan Error -->
                                <p
                                  v-if="
                                    errorMessages[score.id + '-scorePresentasi']
                                  "
                                  class="text-red-600 text-sm mt-1"
                                >
                                  {{
                                    errorMessages[score.id + "-scorePresentasi"]
                                  }}
                                </p>
                              </td>
                            </tr>
                            <tr class="bg-gray-100 font-semibold">
                              <td class="border px-4 py-2 text-left">Total</td>
                              <td class="border px-4 py-2 text-left">
                                {{ Number(team.totalScoreLapangan).toFixed(2) }}
                              </td>
                              <td class="border px-4 py-2 text-left">
                                {{
                                  Number(team.totalScorePresentasi).toFixed(2)
                                }}
                              </td>
                            </tr>
                            <tr class="bg-gray-100 font-semibold">
                              <td class="border px-4 py-2 text-left">
                                Rata-rata
                              </td>
                              <td class="border px-4 py-2 text-left">
                                {{
                                  (
                                    Number(team.totalScoreLapangan) /
                                    team.userScores.length
                                  ).toFixed(2)
                                }}
                              </td>
                              <td class="border px-4 py-2 text-left">
                                {{
                                  (
                                    Number(team.totalScorePresentasi) /
                                    team.userScores.length
                                  ).toFixed(2)
                                }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </details>
                    </div>
                  </details>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal with Semi-transparent Gray Overlay -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 flex justify-center items-center"
    >
      <!-- Semi-transparent background overlay -->
      <div class="absolute inset-0 bg-gray-500 opacity-50"></div>

      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow-lg p-6 w-4/5 max-w-5xl">
        <h2 class="text-2xl font-bold mb-4">{{ selectedTeam.teamName }}</h2>
        <p><strong>Judul:</strong> {{ selectedTeam.judul }}</p>
        <div
          v-if="
            selectedTeam.risalahFileNames &&
            selectedTeam.risalahFileNames.length
          "
        >
          <strong>Risalah Files:</strong>
          <ul class="list-disc list-inside">
            <li
              v-for="(fileName, index) in selectedTeam.risalahFileNames"
              :key="index"
            >
              {{ fileName }}
              <button
                @click="downloadFile(selectedTeam.risalahFileNames[index])"
                class="text-blue-500 hover:underline ml-2"
              >
                Unduh
              </button>
            </li>
          </ul>
        </div>

        <!-- Display Team Members -->
        <div class="mt-4">
          <h4 class="font-semibold">Anggota Tim:</h4>
          <ul class="list-disc list-inside">
            <li
              v-for="member in selectedTeam.teamMembers"
              :key="member.teamMemberId"
            >
              <span class="font-bold"> {{ member.memberName }} - </span>
              <span> ({{ member.nip }})</span> |
              {{ member.memberPosition }}
            </li>
          </ul>
        </div>

        <!-- Table for Juri Scores -->
        <div class="overflow-x-auto mt-4">
          <table
            class="table-auto w-full mt-2 border-collapse border border-gray-300"
          >
            <thead>
              <tr class="bg-gray-200">
                <th class="px-4 py-2 border border-gray-300 text-left">
                  Nama Juri
                </th>
                <th class="px-4 py-2 border border-gray-300 text-left">
                  Skor Lapangan
                </th>
                <th class="px-4 py-2 border border-gray-300 text-left">
                  Skor Presentasi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="score in selectedTeam.userScores"
                :key="score.id"
                class="hover:bg-gray-100"
              >
                <td class="border px-4 py-2 text-left">{{ score.username }}</td>
                <td class="border px-4 py-2 text-left">
                  {{
                    score.scoreLapangan
                      ? parseFloat(score.scoreLapangan).toFixed(2)
                      : "N/A"
                  }}
                </td>
                <td class="border px-4 py-2 text-left">
                  {{
                    score.scorePresentasi
                      ? parseFloat(score.scorePresentasi).toFixed(2)
                      : "N/A"
                  }}
                </td>
              </tr>
              <tr class="bg-gray-100 font-semibold">
                <td class="border px-4 py-2 text-left">Total</td>
                <td class="border px-4 py-2 text-left">
                  {{ Number(selectedTeam.totalScoreLapangan).toFixed(2) }}
                </td>
                <td class="border px-4 py-2 text-left">
                  {{ Number(selectedTeam.totalScorePresentasi).toFixed(2) }}
                </td>
              </tr>
              <tr class="bg-gray-100 font-semibold">
                <td class="border px-4 py-2 text-left">Rata-rata</td>
                <td class="border px-4 py-2 text-left">
                  {{
                    (
                      Number(selectedTeam.totalScoreLapangan) /
                      selectedTeam.userScores.length
                    ).toFixed(2)
                  }}
                </td>
                <td class="border px-4 py-2 text-left">
                  {{
                    (
                      Number(selectedTeam.totalScorePresentasi) /
                      selectedTeam.userScores.length
                    ).toFixed(2)
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-6 text-right">
          <button
            @click="closeModal"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import SidebarWithNav from "@/components/SidebarWithNavbar.vue";
import Spinner from "@/components/Spinner.vue";
import { useStore } from "vuex";

import {
  isLoading,
  withLoading,
  downloadFile,
  handleError,
  handleSuccess,
  isSidebarOpen,
  sidebarToggle,
} from "@/utils/utils";

const store = useStore();
const successMessages = ref({});
const errorMessages = ref({});
const user = ref("");
const teams = ref([]);
const showAllYears = ref(false);
const currentYear = new Date().getFullYear();
const isModalOpen = ref(false);
const selectedTeam = ref(null);

onMounted(() => {
  user.value = store.getters.getUserData;

  getFinalScore();
});

const groupedTeams = computed(() => {
  const groupedByYear = {};
  const filteredTeams = teams.value.filter(
    (team) => showAllYears.value || team.eventyear == currentYear
  );

  filteredTeams.forEach((team) => {
    // Filter nilai valid untuk Yelyel
    const validYelyelScores = team.userScores
      .map((score) => parseFloat(score.scoreYelyel))
      .filter((score) => !isNaN(score));

    const totalYelyel = validYelyelScores.reduce((total, score) => {
      return total + score;
    }, 0);

    // Hitung rata-rata hanya jika ada nilai valid
    if (validYelyelScores.length > 0) {
      team.averageYelyel = totalYelyel / validYelyelScores.length;
    } else {
      team.averageYelyel = null; // Set null jika tidak ada nilai valid
    }

    if (!groupedByYear[team.eventyear]) {
      groupedByYear[team.eventyear] = {};
    }
    if (!groupedByYear[team.eventyear][team.eventName]) {
      groupedByYear[team.eventyear][team.eventName] = [];
    }
    groupedByYear[team.eventyear][team.eventName].push(team);
  });

  for (const year in groupedByYear) {
    for (const eventName in groupedByYear[year]) {
      // Urutkan berdasarkan yelyel jika nilai rata-rata yelyel tidak null
      groupedByYear[year][eventName]
        .filter((team) => team.averageYelyel !== null)
        .sort((a, b) => b.averageYelyel - a.averageYelyel)
        .forEach((team, index) => {
          team.yelyelRank = index + 1;
        });

      // Urutkan kembali berdasarkan nilai akhir untuk rank lapangan-presentasi
      groupedByYear[year][eventName].sort(
        (a, b) => b.nilaiAkhir - a.nilaiAkhir
      );
      groupedByYear[year][eventName].forEach((team, index) => {
        team.rank = index + 1;
      });
    }
  }

  const sortedGroupedByYear = {};
  Object.keys(groupedByYear)
    .sort((a, b) => b - a)
    .forEach((year) => {
      sortedGroupedByYear[year] = groupedByYear[year];
    });

  return sortedGroupedByYear;
});

const getFinalScore = async () => {
  withLoading(async () => {
    try {
      const response = await axios.get("/evaluasi/final");
      teams.value = response.data;
      // console.log(teams.value);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });
};

const openModal = (team) => {
  selectedTeam.value = team;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedTeam.value = null;
};

const allTeams = computed(() => {
  const all = [];

  Object.keys(groupedTeams.value).forEach((year) => {
    Object.keys(groupedTeams.value[year]).forEach((eventName) => {
      const teams = groupedTeams.value[year][eventName];
      teams.forEach((team) => {
        all.push({
          ...team,
          eventyear: year,
          eventName,
        });
      });
    });
  });

  return all.sort((a, b) => parseInt(b.eventyear) - parseInt(a.eventyear));
});

const isNewYear = (index) => {
  return (
    index === 0 ||
    allTeams.value[index].eventyear !== allTeams.value[index - 1].eventyear
  );
};

const isNewEvent = (index) => {
  return (
    index === 0 ||
    allTeams.value[index].eventName !== allTeams.value[index - 1].eventName
  );
};

const getYearRowSpan = (index) => {
  return allTeams.value.filter(
    (team) => team.eventyear === allTeams.value[index].eventyear
  ).length;
};

const getEventRowSpan = (index) => {
  return allTeams.value.filter(
    (team) =>
      team.eventyear === allTeams.value[index].eventyear &&
      team.eventName === allTeams.value[index].eventName
  ).length;
};

const updateScore = async (score, scoreType) => {
  try {
    const updateData = {
      scoreType: scoreType,
      scoreValue: score[scoreType] ? score[scoreType].toString() : "0",
    };

    await axios.put(`/evaluasi/${score.id}/update-score`, updateData);

    successMessages.value[score.id + "-" + scoreType] = "Update berhasil";
    errorMessages.value[score.id + "-" + scoreType] = null;

    // Hapus pesan setelah beberapa detik
    setTimeout(() => {
      successMessages.value[score.id + "-" + scoreType] = null;
    }, 1000);
  } catch (error) {
    errorMessages.value[score.id + "-" + scoreType] = "Gagal memperbarui skor";
    successMessages.value[score.id + "-" + scoreType] = null;

    // Hapus pesan error setelah beberapa detik
    setTimeout(() => {
      errorMessages.value[score.id + "-" + scoreType] = null;
    }, 1000);
  }
};
</script>

<style></style>

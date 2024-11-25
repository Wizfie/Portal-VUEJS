<script setup>
import { onMounted, ref } from "vue";
import SidebarWithNavbar from "@/components/SidebarWithNavbar.vue";
import Spinner from "@/components/Spinner.vue";
import axios from "axios";
import { useRoute } from "vue-router";
import {
  withLoading,
  handleConfirm,
  isLoading,
  isSidebarOpen,
  sidebarToggle,
} from "@/utils/utils"; // Import utilities

const currentTitle = ref("");

const route = useRoute();
const lapanganQccData = ref([]);
const lapanganSsData = ref([]);
const presentasiQccData = ref([]);
const presentasiSsData = ref([]);
const yeylyelDataList = ref([]);

// Toast state
const showToastSuccess = ref(false);
const showToastError = ref(false);
const toastMessage = ref("");

// Function to show success toast
const showSuccessToast = (message) => {
  toastMessage.value = message;
  showToastSuccess.value = true;
  setTimeout(() => {
    showToastSuccess.value = false;
  }, 3000); // Auto-hide after 3 seconds
};

// Function to show error toast
const showErrorToast = (message) => {
  toastMessage.value = message;
  showToastError.value = true;
  setTimeout(() => {
    showToastError.value = false;
  }, 3000); // Auto-hide after 3 seconds
};

// Fetch data from API
const fetchData = async (endpoint, targetQccData, targetSsData) => {
  await withLoading(async () => {
    try {
      const response = await axios.get(endpoint);
      const allData = response.data;
      console.log(allData);

      // Split data by 'QCC' and 'SS' types
      targetQccData.value = allData.filter((item) => item.type === "QCC");
      targetSsData.value = allData.filter((item) => item.type === "SS");

      console.log("DATA SSS" + targetSsData.value);
    } catch (error) {
      showErrorToast("Error fetching data");
    }
  });
};

const lapanganData = async () => {
  await fetchData("/lapangan/questions", lapanganQccData, lapanganSsData);
};

const presentasiData = async () => {
  await fetchData(
    "/presentasi/pertanyaan-all",
    presentasiQccData,
    presentasiSsData
  );
};

const yelyelData = async () => {
  withLoading(async () => {
    const response = await axios.get("/yelyel/pertanyaan-all", {
      params: {
        activeOnly: false,
      },
    });
    yeylyelDataList.value = response.data;
  });
};

// Function to save changes based on entity type with confirmation
const savePartialChanges = async (entity, type) => {
  const confirmed = await handleConfirm(
    "Are you sure you want to save these changes?"
  );
  if (!confirmed) return;

  let endpoint = "";
  let params = {};

  switch (type) {
    case "fase":
      endpoint = `/lapangan/fase/${entity.id}`;
      params = { name: entity.name };
      break;
    case "kriteria":
      endpoint = `/lapangan/kriteria/${entity.id}`;
      params = { name: entity.name };
      break;
    case "subkriteria":
      endpoint = `/lapangan/subKriteriaLapangan/${entity.id}`;
      params = { name: entity.name };
      break;
    case "pertanyaanLapangan":
      endpoint = `/lapangan/pertanyaan/${entity.id}`;
      params = { name: entity.pertanyaan };
      break;
    case "pointLapangan":
      endpoint = `/lapangan/point/${entity.id}`;
      params = { name: entity.jawaban };
      break;
    case "pertanyaanPresentasi":
      endpoint = `/presentasi/${entity.id}/pertanyaan`;
      params = { pertanyaan: entity.pertanyaan };
      break;
    case "pointPenilaian":
      endpoint = `/presentasi/${entity.id}/point`; // sesuai dengan API point penilaian
      params = {
        pointPenilaian: entity.pointPenilaian,
        scoreMaksimal: entity.scoreMaksimal,
      }; // menggunakan 'pointPenilaian' dan 'scoreMaksimal'
      break;
    case "yelyel":
      endpoint = `/yelyel/${entity.id}/kriteria`;
      params = { name: entity.name };
      break;
    case "pertanyaan":
      endpoint = `/yelyel/${entity.id}/pertanyaan`;
      params = {
        pertanyaan: entity.pertanyaan,
        scoreMaksimal: entity.scoreMaksimal,
      };
      break;
    default:
      showErrorToast("Invalid type for update.");
      return;
  }

  await withLoading(async () => {
    try {
      await axios.put(endpoint, null, { params });
      showSuccessToast("Changes saved successfully!");
    } catch (error) {
      showErrorToast("Error saving changes.");
    }
  }, isLoading);
};

// Function to toggle active status
const toggleActiveStatus = async (entity, type, isRoot = true) => {
  console.log(entity);
  console.log(type);

  const confirmed = await handleConfirm({
    title: "Are you sure you want to change the active status?",
    text: "This action cannot be undone.",
  });
  if (!confirmed) return;

  let endpoint = "";
  let params = { active: !entity.active }; // Toggling the active status

  switch (type) {
    case "fase":
      endpoint = `/lapangan/fase/${entity.id}`;
      break;
    case "kriteria":
      endpoint = `/lapangan/kriteria/${entity.id}`;
      break;
    case "subkriteria":
      endpoint = `/lapangan/subKriteriaLapangan/${entity.id}`;
      break;
    case "pertanyaanLapangan":
      endpoint = `/lapangan/pertanyaan/${entity.id}`;
      break;
    case "pointLapangan":
      endpoint = `/lapangan/point/${entity.id}`;
      break;
    case "pertanyaanPresentasi":
      endpoint = `/presentasi/${entity.id}/pertanyaan`;
      break;
    case "pointPenilaian":
      endpoint = `/presentasi/${entity.id}/point`;
      break;
    case "yelyel":
      endpoint = `/yelyel/${entity.id}/kriteria`;
      break;
    case "pertanyaan":
      endpoint = `/yelyel/${entity.id}/pertanyaan`;
      break;
    default:
      showErrorToast("Invalid type for update.");
      return;
  }

  await withLoading(async () => {
    try {
      const response = await axios.put(endpoint, null, { params });
      if (response.status === 200) {
        // Update the entity status locally if API call is successful
        entity.active = !entity.active;
        if (isRoot) {
          updateChildrenActiveStatus(entity, entity.active);
        }
        showSuccessToast("Status updated successfully!");
      }
    } catch (error) {
      // Show error toast in case of failure
      showErrorToast("Error updating status.");
      console.error("XXXXXXXXXX" + error);
    }
  }, isLoading);
};

const updateChildrenActiveStatus = (entity, newStatus) => {
  // Update untuk data lapangan
  if (entity.kriteriaLapangan) {
    entity.kriteriaLapangan.forEach((kriteria) => {
      kriteria.active = newStatus;
      updateChildrenActiveStatus(kriteria, newStatus);
    });
  }

  if (entity.subKriteriaList) {
    entity.subKriteriaList.forEach((subKriteria) => {
      subKriteria.active = newStatus;
      updateChildrenActiveStatus(subKriteria, newStatus);
    });
  }

  if (entity.pertanyaanList) {
    entity.pertanyaanList.forEach((pertanyaan) => {
      pertanyaan.active = newStatus;
      if (pertanyaan.points) {
        pertanyaan.points.forEach((point) => {
          point.active = newStatus;
        });
      }
    });
  }

  // Update untuk Yel-yel: kriteria dan pertanyaan
  if (entity.kriteria) {
    entity.kriteria.forEach((kriteria) => {
      kriteria.active = newStatus;
      updateChildrenActiveStatus(kriteria, newStatus);
    });
  }

  if (entity.points) {
    entity.points.forEach((points) => {
      points.active = newStatus;
    });
  }
};
onMounted(() => {
  lapanganData();
  presentasiData();
  yelyelData();
  currentTitle.value = route.params.title || " ";
  console.log(currentTitle.value);
});
</script>

<template>
  <div>
    <Spinner v-if="isLoading"></Spinner>
    <SidebarWithNavbar @toggleSidebar="sidebarToggle"></SidebarWithNavbar>

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
      <!-- Notifikasi Toast -->
      <div class="fixed top-10 right-0 z-50 space-y-2 me-4">
        <!-- Toast Sukses -->
        <div
          v-if="showToastSuccess"
          class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
          role="alert"
        >
          <div
            class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200"
          >
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
              />
            </svg>
            <span class="sr-only">Ikon sukses</span>
          </div>
          <div class="ms-3 text-sm font-normal">{{ toastMessage }}</div>
          <button
            @click="showToastSuccess = false"
            type="button"
            class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            aria-label="Tutup"
          >
            <span class="sr-only">Tutup</span>
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
        </div>

        <!-- Toast Error -->
        <div
          v-if="showToastError"
          class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
          role="alert"
        >
          <div
            class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200"
          >
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"
              />
            </svg>
            <span class="sr-only">Ikon error</span>
          </div>
          <div class="ms-3 text-sm font-normal">{{ toastMessage }}</div>
          <button
            @click="showToastError = false"
            type="button"
            class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            aria-label="Tutup"
          >
            <span class="sr-only">Tutup</span>
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
        </div>
      </div>

      <div class="p-4 border-2 border-gray-200 rounded-lg items-center mt-14">
        <a
          @click="$router.back"
          class="text-gray-500 cursor-pointer hover:text-blue-600 hover:underline"
        >
          Kembali
        </a>
        <div class="flex items-center mb-4">
          <span class="text-2xl font-bold text-gray-900 mt-6"
            >Daftar Pertanyaan {{ currentTitle }}</span
          >
        </div>

        <!-- Menampilkan data Lapangan QCC -->
        <details v-if="currentTitle === 'Lapangan'" class="mb-6">
          <summary class="text-xl font-bold text-gray-800 mb-4 cursor-pointer">
            Lapangan QCC
          </summary>

          <div v-if="lapanganQccData.length > 0">
            <div
              v-for="(fase, faseIndex) in lapanganQccData"
              :key="fase.id"
              class="bg-white p-4 rounded shadow mb-4"
            >
              <details class="mb-4">
                <summary class="text-lg font-semibold text-gray-700 mb-4">
                  {{ fase.name }} - Fase {{ faseIndex + 1 }}
                </summary>
                <!-- Tombol untuk mengubah nama dan status aktif fase -->
                <input
                  type="text"
                  v-model="fase.name"
                  class="border p-1 rounded w-full mt-1 mb-2"
                  placeholder="Edit Fase"
                  @blur="savePartialChanges(fase, 'fase')"
                />
                <button
                  @click="toggleActiveStatus(fase, 'fase')"
                  :class="
                    fase.active
                      ? 'bg-green-500 hover:bg-green-700'
                      : 'bg-red-500 hover:bg-red-700'
                  "
                  class="mt-1 text-sm text-white rounded px-2 py-1"
                >
                  {{ fase.active ? "Nonaktifkan" : "Aktifkan" }}
                </button>
                <div
                  v-for="(kriteria, kriteriaIndex) in fase.kriteriaLapangan"
                  :key="kriteria.id"
                  class="ml-4 mt-2"
                >
                  <details class="mb-4">
                    <summary class="text-sm font-bold text-gray-600 mb-4">
                      Kriteria {{ kriteriaIndex + 1 }} - {{ kriteria.name }}:
                    </summary>
                    <input
                      type="text"
                      v-model="kriteria.name"
                      class="border p-1 rounded w-full mt-1 mb-2"
                      placeholder="Edit Kriteria"
                      @blur="savePartialChanges(kriteria, 'kriteria')"
                    />
                    <!-- Tombol untuk mengubah status aktif kriteria -->
                    <button
                      @click="toggleActiveStatus(kriteria, 'kriteria')"
                      :class="
                        kriteria.active
                          ? 'bg-green-500 hover:bg-green-700'
                          : 'bg-red-500 hover:bg-red-700'
                      "
                      class="mt-1 text-sm text-white rounded px-2 py-1"
                    >
                      {{ kriteria.active ? "Nonaktifkan" : "Aktifkan" }}
                    </button>

                    <div
                      v-for="(
                        subKriteria, subKriteriaIndex
                      ) in kriteria.subKriteriaList"
                      :key="subKriteria.id"
                      class="ml-6"
                    >
                      <details class="mb-4">
                        <summary class="text-sm font-bold text-gray-600 mb-4">
                          SubKriteria {{ subKriteriaIndex + 1 }} -
                          {{ subKriteria.name }}:
                        </summary>
                        <input
                          type="text"
                          v-model="subKriteria.name"
                          class="border p-1 rounded w-full mt-1 mb-2"
                          placeholder="Edit SubKriteria"
                          @blur="savePartialChanges(subKriteria, 'subkriteria')"
                        />
                        <!-- Tombol untuk mengubah status aktif subkriteria -->
                        <button
                          @click="
                            toggleActiveStatus(subKriteria, 'subkriteria')
                          "
                          :class="
                            subKriteria.active
                              ? 'bg-green-500 hover:bg-green-700'
                              : 'bg-red-500 hover:bg-red-700'
                          "
                          class="mt-1 text-sm text-white rounded px-2 py-1"
                        >
                          {{ subKriteria.active ? "Nonaktifkan" : "Aktifkan" }}
                        </button>

                        <div
                          v-for="(
                            pertanyaanLapangan, pertanyaanIndex
                          ) in subKriteria.pertanyaanList"
                          :key="pertanyaanLapangan.id"
                          class="ml-8"
                        >
                          <details class="mb-4">
                            <summary
                              class="text-sm font-bold text-gray-600 mt-4"
                            >
                              Pertanyaan {{ pertanyaanIndex + 1 }}:
                            </summary>
                            <input
                              type="text"
                              v-model="pertanyaanLapangan.pertanyaan"
                              class="border p-1 rounded w-full mt-1 mb-2"
                              placeholder="Edit Pertanyaan"
                              @blur="
                                savePartialChanges(
                                  pertanyaanLapangan,
                                  'pertanyaanLapangan'
                                )
                              "
                            />
                            <!-- Tombol untuk mengubah status aktif pertanyaan -->
                            <button
                              @click="
                                toggleActiveStatus(
                                  pertanyaanLapangan,
                                  'pertanyaanLapangan'
                                )
                              "
                              :class="
                                pertanyaanLapangan.active
                                  ? 'bg-green-500 hover:bg-green-700'
                                  : 'bg-red-500 hover:bg-red-700'
                              "
                              class="mt-1 text-sm text-white rounded px-2 py-1"
                            >
                              {{
                                pertanyaanLapangan.active
                                  ? "Nonaktifkan"
                                  : "Aktifkan"
                              }}
                            </button>

                            <div class="flex flex-wrap gap-4 mb-4">
                              <div
                                v-for="(
                                  point, pointIndex
                                ) in pertanyaanLapangan.points"
                                :key="point.id"
                                class="mt-2 flex-1 sm:w-auto"
                              >
                                <label class="text-sm font-bold">
                                  Poin {{ pointIndex + 1 }}:
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  v-model="point.jawaban"
                                  class="border p-1 rounded w-full sm:w-20"
                                  placeholder="Edit Poin"
                                  @blur="
                                    savePartialChanges(point, 'pointLapangan')
                                  "
                                />
                              </div>
                            </div>
                          </details>
                        </div>
                      </details>
                    </div>
                  </details>
                </div>
              </details>
            </div>
          </div>
        </details>

        <!-- Menampilkan data Lapangan SS -->
        <details v-if="currentTitle === 'Lapangan'" class="mb-6">
          <summary class="text-xl font-bold text-gray-800 mb-4 cursor-pointer">
            Lapangan SS / SSG
          </summary>
          <div v-if="lapanganSsData.length > 0">
            <div
              v-for="(fase, faseIndex) in lapanganSsData"
              :key="fase.id"
              class="bg-white p-4 rounded shadow mb-4"
            >
              <details class="mb-4">
                <summary class="text-lg font-semibold text-gray-700 mb-4">
                  {{ fase.name }} - Fase {{ faseIndex + 1 }}
                </summary>
                <input
                  type="text"
                  v-model="fase.name"
                  class="border p-1 rounded w-full mt-1 mb-2"
                  placeholder="Edit Fase"
                  @blur="savePartialChanges(fase, 'fase')"
                />
                <button
                  @click="toggleActiveStatus(fase, 'fase')"
                  :class="
                    fase.active
                      ? 'bg-green-500 hover:bg-green-700'
                      : 'bg-red-500 hover:bg-red-700'
                  "
                  class="mt-1 text-sm text-white rounded px-2 py-1"
                >
                  {{ fase.active ? "Nonaktifkan" : "Aktifkan" }}
                </button>

                <div
                  v-for="(kriteria, kriteriaIndex) in fase.kriteriaLapangan"
                  :key="kriteria.id"
                  class="ml-4 mt-2"
                >
                  <details class="mb-4">
                    <summary class="text-sm font-bold text-gray-600 mb-4">
                      Kriteria {{ kriteriaIndex + 1 }} - {{ kriteria.name }}:
                    </summary>
                    <input
                      type="text"
                      v-model="kriteria.name"
                      class="border p-1 rounded w-full mt-1 mb-2"
                      placeholder="Edit Kriteria"
                      @blur="savePartialChanges(kriteria, 'kriteria')"
                    />
                    <button
                      @click="toggleActiveStatus(kriteria, 'kriteria')"
                      :class="
                        kriteria.active
                          ? 'bg-green-500 hover:bg-green-700'
                          : 'bg-red-500 hover:bg-red-700'
                      "
                      class="mt-1 text-sm text-white rounded px-2 py-1"
                    >
                      {{ kriteria.active ? "Nonaktifkan" : "Aktifkan" }}
                    </button>

                    <div
                      v-for="(
                        subKriteria, subKriteriaIndex
                      ) in kriteria.subKriteriaList"
                      :key="subKriteria.id"
                      class="ml-6"
                    >
                      <details class="mb-4">
                        <summary class="text-sm font-bold text-gray-600 mb-4">
                          SubKriteria {{ subKriteriaIndex + 1 }} -
                          {{ subKriteria.name }}:
                        </summary>
                        <input
                          type="text"
                          v-model="subKriteria.name"
                          class="border p-1 rounded w-full mt-1 mb-2"
                          placeholder="Edit SubKriteria"
                          @blur="savePartialChanges(subKriteria, 'subkriteria')"
                        />
                        <button
                          @click="
                            toggleActiveStatus(subKriteria, 'subkriteria')
                          "
                          :class="
                            subKriteria.active
                              ? 'bg-green-500 hover:bg-green-700'
                              : 'bg-red-500 hover:bg-red-700'
                          "
                          class="mt-1 text-sm text-white rounded px-2 py-1"
                        >
                          {{ subKriteria.active ? "Nonaktifkan" : "Aktifkan" }}
                        </button>

                        <div
                          v-for="(
                            pertanyaan, pertanyaanIndex
                          ) in subKriteria.pertanyaanList"
                          :key="pertanyaan.id"
                          class="ml-8"
                        >
                          <details class="mb-4">
                            <summary
                              class="text-sm font-bold text-gray-600 mt-4"
                            >
                              Pertanyaan {{ pertanyaanIndex + 1 }}:
                            </summary>
                            <input
                              type="text"
                              v-model="pertanyaan.pertanyaan"
                              class="border p-1 rounded w-full mt-1 mb-2"
                              placeholder="Edit Pertanyaan"
                              @blur="
                                savePartialChanges(
                                  pertanyaan,
                                  'pertanyaanLapangan'
                                )
                              "
                            />
                            <button
                              @click="
                                toggleActiveStatus(
                                  pertanyaan,
                                  'pertanyaanLapangan'
                                )
                              "
                              :class="
                                pertanyaan.active
                                  ? 'bg-green-500 hover:bg-green-700'
                                  : 'bg-red-500 hover:bg-red-700'
                              "
                              class="mt-1 text-sm text-white rounded px-2 py-1"
                            >
                              {{
                                pertanyaan.active ? "Nonaktifkan" : "Aktifkan"
                              }}
                            </button>

                            <div class="flex flex-wrap gap-4 mb-4">
                              <div
                                v-for="(point, pointIndex) in pertanyaan.points"
                                :key="point.id"
                                class="mt-2 flex-1 sm:w-auto"
                              >
                                <label class="text-sm font-bold"
                                  >Poin {{ pointIndex + 1 }}:</label
                                >
                                <input
                                  type="number"
                                  step="0.01"
                                  v-model="point.jawaban"
                                  class="border p-1 rounded w-full sm:w-20"
                                  placeholder="Edit Poin"
                                  @blur="
                                    savePartialChanges(point, 'pointLapangan')
                                  "
                                />
                              </div>
                            </div>
                          </details>
                        </div>
                      </details>
                    </div>
                  </details>
                </div>
              </details>
            </div>
          </div>
        </details>

        <!-- Menampilkan data Presentasi QCC -->
        <details v-if="currentTitle === 'Presentasi'" class="mb-6">
          <summary class="text-xl font-bold text-gray-800 mb-4 cursor-pointer">
            Presentasi QCC
          </summary>
          <div
            v-for="(pertanyaan, pertanyaanIndex) in presentasiQccData"
            :key="pertanyaan.id"
            class="ml-4 mt-2"
          >
            <details class="mb-4">
              <summary class="text-sm font-bold text-gray-600">
                Pertanyaan {{ pertanyaanIndex + 1 }}:
              </summary>
              <input
                type="text"
                v-model="pertanyaan.pertanyaan"
                class="border p-1 rounded w-full mt-1 mb-2"
                placeholder="Edit Pertanyaan"
                @blur="savePartialChanges(pertanyaan, 'pertanyaanPresentasi')"
              />
              <button
                @click="toggleActiveStatus(pertanyaan, 'pertanyaanPresentasi')"
                :class="
                  pertanyaan.active
                    ? 'bg-green-500 hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-700'
                "
                class="mt-1 text-sm text-white rounded px-2 py-1"
              >
                {{ pertanyaan.active ? "Nonaktifkan" : "Aktifkan" }}
              </button>

              <template
                v-for="(
                  pointPenilaian, pointPenilaianIndex
                ) in pertanyaan.point"
                :key="pointPenilaian.id"
                class="ml-6"
              >
                <div>
                  <label class="text-sm font-bold text-gray-600"
                    >Poin Penilaian {{ pointPenilaianIndex + 1 }}:</label
                  >
                  <textarea
                    v-model="pointPenilaian.pointPenilaian"
                    class="border p-1 rounded w-full mt-1 mb-2"
                    placeholder="Edit Poin Penilaian"
                    @blur="savePartialChanges(pointPenilaian, 'pointPenilaian')"
                    rows="3"
                  ></textarea>

                  <div class="flex flex-wrap gap-4 mb-4">
                    <div class="mt-2 flex-1 sm:w-auto">
                      <label class="text-sm font-bold"
                        >Skor Maksimal {{ pointPenilaianIndex + 1 }}:</label
                      >
                      <input
                        type="number"
                        v-model="pointPenilaian.scoreMaksimal"
                        class="border p-1 rounded w-full sm:w-20"
                        placeholder="Edit Skor"
                        @blur="
                          savePartialChanges(pointPenilaian, 'pointPenilaian')
                        "
                      />
                    </div>
                  </div>
                </div>
              </template>
            </details>
          </div>
        </details>

        <!-- Menampilkan data Presentasi SS -->
        <details v-if="currentTitle === 'Presentasi'" class="mb-6">
          <summary class="text-xl font-bold text-gray-800 mb-4 cursor-pointer">
            Presentasi SS
          </summary>
          <div
            v-for="(pertanyaan, pertanyaanIndex) in presentasiSsData"
            :key="pertanyaan.id"
            class="ml-4 mt-2"
          >
            <details class="mb-4">
              <summary class="text-sm font-bold text-gray-600">
                Pertanyaan {{ pertanyaanIndex + 1 }}:
              </summary>
              <input
                type="text"
                v-model="pertanyaan.pertanyaan"
                class="border p-1 rounded w-full mt-1 mb-2"
                placeholder="Edit Pertanyaan"
                @blur="savePartialChanges(pertanyaan, 'pertanyaanPresentasi')"
              />
              <button
                @click="toggleActiveStatus(pertanyaan, 'pertanyaanPresentasi')"
                :class="
                  pertanyaan.active
                    ? 'bg-green-500 hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-700'
                "
                class="mt-1 text-sm text-white rounded px-2 py-1"
              >
                {{ pertanyaan.active ? "Nonaktifkan" : "Aktifkan" }}
              </button>

              <template
                v-for="(
                  pointPenilaian, pointPenilaianIndex
                ) in pertanyaan.point"
                :key="pointPenilaian.id"
                class="ml-6"
              >
                <div>
                  <label class="text-sm font-bold text-gray-600"
                    >Poin Penilaian {{ pointPenilaianIndex + 1 }}:</label
                  >
                  <textarea
                    v-model="pointPenilaian.pointPenilaian"
                    class="border p-1 rounded w-full mt-1 mb-2"
                    placeholder="Edit Poin Penilaian"
                    @blur="savePartialChanges(pointPenilaian, 'pointPenilaian')"
                    rows="3"
                  ></textarea>

                  <div class="flex flex-wrap gap-4 mb-4">
                    <div class="mt-2 flex-1 sm:w-auto">
                      <label class="text-sm font-bold"
                        >Skor Maksimal {{ pointPenilaianIndex + 1 }}:</label
                      >
                      <input
                        type="number"
                        v-model="pointPenilaian.scoreMaksimal"
                        class="border p-1 rounded w-full sm:w-20"
                        placeholder="Edit Skor"
                        @blur="
                          savePartialChanges(pointPenilaian, 'pointPenilaian')
                        "
                      />
                    </div>
                  </div>
                </div>
              </template>
            </details>
          </div>
        </details>

        <!-- Menampilkan data Yelyel -->
        <details v-if="currentTitle === 'Yel-Yel'" class="mb-6">
          <summary class="text-xl font-bold text-gray-800 mb-4 cursor-pointer">
            Yelyel
          </summary>
          <div
            v-for="(kriteria, kriteriaIndex) in yeylyelDataList"
            :key="kriteriaIndex"
            class="ml-4 mt-2"
          >
            <details class="mb-4">
              <summary class="text-sm font-bold text-gray-600">
                Kriteria {{ kriteriaIndex + 1 }}:
              </summary>
              <button
                @click="toggleActiveStatus(kriteria, 'yelyel')"
                :class="
                  kriteria.active
                    ? 'bg-green-500 hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-700'
                "
                class="mt-1 text-sm text-white rounded px-2 py-1"
              >
                {{ kriteria.active ? "Nonaktifkan" : "Aktifkan" }}
              </button>
              <input
                type="text"
                v-model="kriteria.name"
                class="border p-1 rounded w-full mt-1 mb-2"
                placeholder="Edit Pertanyaan"
                @blur="savePartialChanges(kriteria, 'yelyel')"
              />

              <template
                v-for="(pertanyaan, pertanyaanIndex) in kriteria.points"
                :key="pertanyaanIndex"
                class="ml-6"
              >
                <div>
                  <label class="text-sm font-bold text-gray-600"
                    >Pertanyaan {{ pertanyaanIndex + 1 }}:</label
                  >
                  <button
                    @click="toggleActiveStatus(pertanyaan, 'pertanyaan')"
                    :class="
                      pertanyaan.active
                        ? 'bg-green-500 hover:bg-green-700'
                        : 'bg-red-500 hover:bg-red-700'
                    "
                    class="ms-2 mt-1 text-sm text-white rounded px-2 py-1"
                  >
                    {{ pertanyaan.active ? "Nonaktifkan" : "Aktifkan" }}
                  </button>
                  <textarea
                    v-model="pertanyaan.pertanyaan"
                    class="border p-1 rounded w-full mt-1 mb-2"
                    placeholder="Edit Pertanyaan"
                    @blur="savePartialChanges(pertanyaan, 'yelyel')"
                    rows="3"
                  ></textarea>

                  <div class="flex flex-wrap gap-4 mb-4">
                    <div class="mb-2 flex-1 sm:w-auto">
                      <label class="text-sm font-bold"
                        >Skor Maksimal {{ pertanyaanIndex + 1 }}:</label
                      >
                      <input
                        type="number"
                        v-model="pertanyaan.scoreMaksimal"
                        class="border p-1 rounded w-full sm:w-20"
                        placeholder="Edit Skor"
                        @blur="savePartialChanges(pertanyaan, 'yelyel')"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </details>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>
<style scoped></style>

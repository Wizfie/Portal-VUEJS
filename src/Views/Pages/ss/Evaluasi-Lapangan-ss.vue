<script setup>
import { onMounted, ref } from "vue";
import SidebarWithNavbar from "@/components/SidebarWithNavbar.vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Spinner from "@/components/Spinner.vue";
import {
  handleInfo,
  handleError,
  handleSuccess,
  withLoading,
  handleConfirm,
  isSidebarOpen,
  sidebarToggle,
} from "@/utils/utils";

const router = useRouter();
const store = useStore();
const route = useRoute();

const teamId = ref(route.params.teamId);
const eventId = ref(route.params.eventId);
const teamName = ref(route.params.teamName);
const subKriteriaData = ref([]);
const pageLapangan = ref(0);
const pageSize = ref(1);
const totalPages = ref(0);
const evaluations = ref({});
const userData = ref(JSON.parse(localStorage.getItem("userData")));
const isLoading = ref(false);
const totalScore = ref(0);
const errors = ref({});

onMounted(() => {
  loadStoredData();
  getPertanyaan((pageLapangan.value = 0));
});

const getPertanyaan = async (page) => {
  await withLoading(async () => {
    try {
      const response = await axios.get("/lapangan/list-pertanyaan", {
        params: { page, size: pageSize.value, type: "SS" },
      });
      subKriteriaData.value = response.data.data;
      pageLapangan.value = response.data.currentPage;
      localStorage.setItem("PageLapangan", pageLapangan.value);
      totalPages.value = response.data.totalPages;

      // Inisialisasi evaluations untuk semua pertanyaan tanpa nilai score
      subKriteriaData.value.forEach((subKriteria) => {
        subKriteria.pertanyaanList.forEach((pertanyaan) => {
          if (!evaluations.value[pertanyaan.id]) {
            evaluations.value[pertanyaan.id] = {
              pertanyaanId: pertanyaan.id,
              pertanyaan: pertanyaan.pertanyaan,
              userId: userData.value.id,
              score: null, // Set initial score to null
              teamId: teamId.value,
              eventId: eventId.value,
              page: pageLapangan.value,
            };
          }
        });
      });

      updateRadioInputs();
      updateTotalScore();
    } catch (error) {
      handleError("Terjadi kesalahan saat memuat data pertanyaan");
    }
  });
};

const loadStoredData = () => {
  const storedPageLapangan = localStorage.getItem("PageLapangan") || 0;
  pageLapangan.value = parseInt(storedPageLapangan);

  const storedEvaluations =
    JSON.parse(localStorage.getItem("evaluations")) || [];
  evaluations.value = storedEvaluations.reduce((acc, curr) => {
    acc[curr.pertanyaanId] = curr;
    return acc;
  }, {});
  store.dispatch("setEvaluationsLapangan", storedEvaluations);

  updateRadioInputs();
};

const updateRadioInputs = () => {
  subKriteriaData.value.forEach((subKriteria) => {
    subKriteria.pertanyaanList.forEach((pertanyaan) => {
      const storedEvaluation = evaluations.value[pertanyaan.id];
      if (storedEvaluation) {
        pertanyaan.selectedValue = storedEvaluation.score;
      }
    });
  });
};

const selectAnswer = (pertanyaan, jawaban) => {
  const { id: pertanyaanId } = pertanyaan;
  const evaluation = {
    pertanyaanId,
    userId: userData.value.id,
    score: jawaban,
    teamId: teamId.value,
    eventId: eventId.value,
  };

  evaluations.value[pertanyaanId] = evaluation;
  localStorage.setItem(
    "evaluations",
    JSON.stringify(Object.values(evaluations.value))
  );
  updateTotalScore();
  delete errors.value[pertanyaanId]; // Remove error if the question is answered
};

const nextPage = () => {
  getPertanyaan(pageLapangan.value + 1);
};

const prevPage = () => {
  if (pageLapangan.value > 0) {
    getPertanyaan(pageLapangan.value - 1);
  }
};

const saveNilai = async () => {
  const unansweredQuestions = Object.values(evaluations.value).filter(
    (evaluation) => evaluation.score === null
  );

  if (unansweredQuestions.length > 0) {
    // Set error messages for unanswered questions
    unansweredQuestions.forEach((evaluation) => {
      errors.value[evaluation.pertanyaanId] = "Pertanyaan ini harus dijawab.";
    });

    // Generate HTML list for unanswered questions with numbering and line breaks
    const unansweredQuestionsHtml = unansweredQuestions
      .map((evaluation, index) => {
        // Gunakan informasi halaman dari evaluasi
        return `
        <li style="margin-bottom: 10px;">${index + 1}. ${
          evaluation.pertanyaan
        } (Halaman: <b>${evaluation.page + 1}</b>)</li>`;
      })
      .join("");

    const message = `
      <ul style="list-style-type: none; padding: 0;">
        ${unansweredQuestionsHtml}
      </ul>
    `;

    handleInfo(
      "Harap jawab semua pertanyaan ", // Title
      "\n", // Text
      message // HTML content
    );

    return;
  }

  // Mengumpulkan semua jawaban evaluasi
  const evaluationsArray = Object.values(evaluations.value);

  // Hapus atribut pertanyaan dari evaluasi sebelum mengirim data
  const cleanedEvaluationsArray = evaluationsArray.map((evaluation) => {
    const { pertanyaan, ...rest } = evaluation;
    return rest;
  });

  handleConfirm({
    title: `Simpan Jawaban?`,
    text: `Jawaban yang tersimpan tidak bisa diubah kembali!`,
  }).then(async (result) => {
    if (result) {
      await withLoading(async () => {
        try {
          const response = await axios.post(
            `/lapangan/create-evaluasi?teamId=${teamId.value}`,
            cleanedEvaluationsArray,
            { headers: { "Content-Type": "application/json" } }
          );
          handleSuccess("Evaluasi berhasil disimpan");
          console.log("Save Nilai: " + response.data);
        } catch (e) {
          handleError(e.response.data);
        } finally {
          removeItem();
          router.replace("/lapangan-ss");
        }
      });
    }
  });
};

const removeItem = () => {
  localStorage.removeItem("evaluations");
  localStorage.removeItem("PageLapangan");
  getPertanyaan(0);
};

const confirmBack = async () => {
  const result = await handleConfirm({
    title: "Are you sure?",
    text: " Any unsaved changes will be lost.",
  });

  if (result) {
    removeItem();
    router.replace("/lapangan-ss");
  }
};

const updateTotalScore = () => {
  totalScore.value = Object.values(evaluations.value).reduce(
    (total, evaluation) => total + parseFloat(evaluation.score || 0),
    0
  );
};
</script>

<template>
  <div>
    <Spinner v-if="isLoading"></Spinner>
    <SidebarWithNavbar @toggleSidebar="sidebarToggle"></SidebarWithNavbar>
    <main
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
            class="p-2 rounded-md text-white bg-gray-900"
            @click.prevent="confirmBack"
          >
            Kembali
          </button>
          <div class="flex-1 text-center">
            <span class="text-2xl font-bold text-gray-900"
              >Evaluasi Lapangan</span
            >
          </div>
        </div>
      </div>

      <div
        class="w-full mt-4 bg-white border border-gray-200 rounded-lg shadow"
      >
        <div
          class="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 rounded-t-lg bg-gray-50"
        >
          <strong
            id="pertanyaan-tab"
            class="inline-block p-4 text-neutral-950 rounded-ss-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-blue-500"
          >
            Penilaian Lapangan</strong
          >
        </div>

        <div id="defaultTabContent">
          <div
            class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800"
            id="pertanyaan"
          >
            <section class="flex justify-between">
              <div class="team-name text-xl">
                Nama Tim :
                <span class="font-semibold text-gray-900">{{ teamName }}</span>
              </div>
              <div class="total-score">
                <p>
                  Skor : <strong>{{ totalScore.toFixed(2) }}</strong>
                </p>
              </div>
            </section>
            <section
              id="list-pertanyaan"
              class="border border-1 rounded-md mb-2 mt-2 p-4 text-wrap"
              v-for="subKriteria in subKriteriaData"
              :key="subKriteria.id"
            >
              <h2
                class="mb-5 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
              >
                {{ subKriteria.name }}
              </h2>
              <ul class="space-y-4 text-gray-500 dark:text-gray-400">
                <li
                  v-for="(pertanyaan, index) in subKriteria.pertanyaanList"
                  :key="pertanyaan.id"
                >
                  <h3 class="mb-4 text-xl font-bold">
                    {{ index + 1 }}. {{ pertanyaan.pertanyaan }}
                  </h3>
                  <ul>
                    <li
                      v-for="jawaban in pertanyaan.jawabanList"
                      :key="jawaban"
                      class="flex space-x-2 items-center mb-2"
                    >
                      <input
                        type="radio"
                        :name="'pertanyaan_' + pertanyaan.id"
                        :value="jawaban"
                        v-model="pertanyaan.selectedValue"
                        @change="selectAnswer(pertanyaan, jawaban)"
                        class="form-radio text-blue-500"
                        required
                      />
                      <span class="ml-2">{{ jawaban }}</span>
                    </li>
                  </ul>
                  <!-- Pesan kesalahan untuk pertanyaan yang belum dijawab -->
                  <p
                    v-if="errors[pertanyaan.id]"
                    class="text-sm text-red-500 mt-1"
                  >
                    {{ errors[pertanyaan.id] }}
                  </p>
                </li>
              </ul>
            </section>
            <div class="flex justify-between mt-4 items-center">
              <!-- Tombol Sebelumnya -->
              <button
                @click="prevPage"
                :disabled="pageLapangan === 0"
                class="btn text-xs sm:text-sm md:text-base py-3 px-2 sm:py-2 sm:px-4"
              >
                Sebelumnya
              </button>

              <!-- Informasi Halaman -->
              <div class="flex flex-col items-center">
                <span class="text-gray-500 text-xs italic sm:text-sm">
                  Halaman
                </span>
                <span class="text-gray-500 font-semibold text-xs sm:text-sm">{{
                  pageLapangan + 1
                }}</span>
              </div>

              <!-- Tombol Selanjutnya -->
              <button
                @click="nextPage"
                v-show="pageLapangan !== totalPages - 1"
                class="btn text-xs sm:text-sm md:text-base py-3 px-2 sm:py-2 sm:px-4"
              >
                Selanjutnya
              </button>

              <!-- Tombol Selesai -->
              <button
                @click="saveNilai"
                v-show="pageLapangan === totalPages - 1"
                class="btn text-xs sm:text-sm md:text-base py-3 px-2 sm:py-2 sm:px-4"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.3s;
}
.btn:disabled {
  cursor: not-allowed;
  background-color: #e9ecef;
}
.btn:not(:disabled):hover {
  background-color: #e2e6ea;
}

.pagination button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  background-color: #d3d3d3;
  cursor: not-allowed;
}
</style>

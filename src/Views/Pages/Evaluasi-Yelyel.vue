<script setup>
import { onMounted, ref } from "vue";
import SidebarWithNavbar from "@/components/SidebarWithNavbar.vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Spinner from "@/components/Spinner.vue";
import {
  handleConfirm,
  handleSuccess,
  handleError,
  isLoading,
  withLoading,
  sidebarToggle,
  isSidebarOpen,
} from "@/utils/utils";

const router = useRouter();
const route = useRoute();

const deptName = ref(route.params.deptName);
const deptId = ref(route.params.deptId);
const user = ref(JSON.parse(localStorage.getItem(`userData`)));
const pertanyaanList = ref([]);
const totalScore = ref(0);
const evaluations = ref({}); // Object to store user input for each question
const errors = ref({}); // Object to store error messages for each question

onMounted(() => {
  getPertanyaanList();
  loadFromLocalStorage();
});

const getPertanyaanList = async () => {
  const response = await axios.get("/yelyel/pertanyaan-all", {
    params: {
      activeOnly: true,
    },
  });
  pertanyaanList.value = response.data;
  console.log(pertanyaanList.value);
};

// Function to handle input changes and ensure it does not exceed the max score
const handleScoreChange = (pertanyaanId, newScore) => {
  const point = pertanyaanList.value
    .flatMap((p) => p.points)
    .find((p) => p.id === pertanyaanId);
  if (point) {
    const maxScore = parseFloat(point.scoreMaksimal);
    const score = parseFloat(newScore);

    if (isNaN(score) || score < 0) {
      errors.value[pertanyaanId] = "Score must be a positive number.";
    } else if (score > maxScore) {
      errors.value[
        pertanyaanId
      ] = `Score cannot exceed the maximum score of ${maxScore}.`;
    } else {
      errors.value[pertanyaanId] = ""; // Clear error message if valid
    }

    evaluations.value[pertanyaanId] = Math.min(score, maxScore);
    updateTotalScore();
    saveToLocalStorage();
    console.log(evaluations.value);
  }
};

const updateTotalScore = () => {
  totalScore.value = Object.values(evaluations.value).reduce(
    (total, score) => total + score,
    0
  );
};

const saveToLocalStorage = () => {
  localStorage.setItem("evaluations", JSON.stringify(evaluations.value));
};

const loadFromLocalStorage = () => {
  const savedEvaluations = localStorage.getItem("evaluations");
  if (savedEvaluations) {
    evaluations.value = JSON.parse(savedEvaluations);
    updateTotalScore();
  }
};

const confirmBack = async () => {
  const result = await handleConfirm({
    title: "Are you sure?",
    text: "Any unsaved changes will be lost.",
  });

  if (result) {
    localStorage.removeItem("evaluations");
    router.back();
  }
};

const submitEvaluation = async () => {
  await withLoading(async () => {
    const result = await handleConfirm({
      title: "Save?",
      text: "Data yang di simpan tidak bisa diubah kembali !",
    });

    if (result) {
      try {
        const evaluationData = Object.keys(evaluations.value).map(
          (pertanyaanId) => {
            return {
              pertanyaanId: parseInt(pertanyaanId),
              score: evaluations.value[pertanyaanId],
              deptId: deptId.value,
              deptName: deptName.value,
              juriId: user.value.id,
            };
          }
        );
        console.log("Evaluation Data:", evaluationData); // Debugging log

        const response = await axios.post(
          "/yelyel/create-evaluasi",
          evaluationData
        );

        if (response.status === 200) {
          localStorage.removeItem("evaluations");
          handleSuccess("Evaluasi berhasil disimpan");
          setTimeout(() => {
            router.back();
          }, 1000);
        } else {
          handleError(
            "Terjadi kesalahan saat menyimpan evaluasi. Status Code: " +
              response.status
          );
        }
      } catch (error) {
        console.error("Error submitting evaluations:", error);

        if (error.response && error.response.data) {
          handleError(`Terjadi kesalahan: ${error.response.data}`);
        } else {
          handleError("Terjadi kesalahan saat menyimpan evaluasi");
        }
      }
    }
  });
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
              >Evaluasi Yel-Yel</span
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
            class="inline-block p-4 text-neutral-950 rounded-ss-lg hover:bg-gray-100"
          >
            Penilaian Yel-Yel
          </strong>
        </div>
        <div id="defaultTabContent">
          <div class="p-4 bg-white rounded-lg md:p-8" id="pertanyaan">
            <section class="flex justify-between">
              <div class="team-name text-xl">
                Departemen:
                <span class="font-semibold text-gray-900">{{ deptName }}</span>
              </div>
              <div class="total-score">
                <p>
                  Nilai: <strong>{{ totalScore.toFixed(2) }}</strong>
                </p>
              </div>
            </section>
            <section
              id="list-pertanyaan"
              class="border border-1 rounded-md mb-2 mt-2 p-4 text-wrap"
              v-for="kriteria in pertanyaanList"
              :key="kriteria.id"
            >
              <h2
                class="mb-5 text-2xl font-extrabold tracking-tight text-gray-900"
              >
                <svg
                  class="inline-block w-4 h-4 mr-2 text-gray-900"
                  fill="currentColor"
                  viewBox="0 0 8 8"
                >
                  <circle cx="3" cy="3" r="3" />
                </svg>
                {{ kriteria.name }}
              </h2>

              <ul class="space-y-4 text-gray-500">
                <small class="font-semibold border border-1 p-2 italic">
                  Poin Penilaian</small
                >
                <li
                  v-for="(item, pointIndex) in kriteria.points"
                  :key="item.id"
                >
                  <p class="mb-4 font-bold">
                    {{ pointIndex + 1 }}. {{ item.pertanyaan }}
                  </p>
                  <small
                    >Nilai Maksimal :
                    <strong class="">{{ item.scoreMaksimal }}</strong></small
                  >
                  <div>
                    <label class="mt-2" for="nilai">Nilai</label>
                    <input
                      min="0"
                      class="ms-2 border p-1 rounded"
                      step="0.1"
                      type="number"
                      :max="item.scoreMaksimal"
                      v-model="evaluations[item.id]"
                      @input="handleScoreChange(item.id, $event.target.value)"
                    />
                    <p v-if="errors[item.id]" class="text-red-500 mt-1">
                      {{ errors[item.id] }}
                    </p>
                  </div>
                </li>
              </ul>
              <br />
              <br />
            </section>
          </div>
        </div>
        <div class="p-4">
          <button
            class="p-2 rounded-md text-white bg-green-500"
            @click="submitEvaluation"
          >
            Simpan
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style></style>

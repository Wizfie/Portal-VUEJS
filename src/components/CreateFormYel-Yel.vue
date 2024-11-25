<template>
  <Section
    id="pertanyaan-lapangan"
    class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-5"
  >
    <form @submit.prevent="createPertanyaan" class="w-3/12">
      <!-- Validation Alerts -->
      <div v-if="alertMessage" :class="alertClass" role="alert">
        <span class="font-medium">{{ alertTitle }}</span> {{ alertMessage }}
      </div>

      <label
        for="select-pertanyaan"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Select Kriteria
      </label>
      <select
        id="select-pertanyaan"
        v-model="selectedKriteria"
        class="bg-gray-50 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option value="new">-- Create New Kriteria --</option>
        <option selected disabled>-- List kriteria --</option>
        <option
          v-for="(list, index) in pertanyaanList"
          :key="index"
          :value="list.id"
        >
          {{ list.name }}
        </option>
      </select>
      <input
        v-if="selectedKriteria === 'new'"
        v-model="newkriteria"
        type="text"
        id="default-input"
        placeholder="Masukkan Pertanyaan Baru"
        class="bg-gray-50 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <label
        for="indikator-pertanyaan"
        class="block mt-2 mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Point Penilaian
      </label>
      <div
        v-for="(point, index) in points"
        :key="index"
        class="w-full flex gap-1 mb-2"
      >
        <textarea
          v-model="point.pertanyaan"
          type="text"
          placeholder="Masukan Pertanyaan baru"
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        ></textarea>
        <input
          v-model="point.scoreMaksimal"
          type="number"
          step="0.01"
          placeholder="Score Maksimal"
          class="max-w-25% bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
        <button
          v-if="points.length > 1"
          type="button"
          @click="removePoint(index)"
          class="rounded-lg p-2.5 bg-red-500 text-white"
        >
          Remove
        </button>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          @click="addPoint"
          class="rounded-lg p-2.5 bg-green-500 text-white"
        >
          Add
        </button>
        <button type="submit" class="rounded-lg p-2.5 bg-blue-500 text-white">
          Submit
        </button>
      </div>
    </form>
  </Section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { handleError, handleSuccess, withLoading } from "@/utils/utils";

const pertanyaanList = ref([]);
const selectedKriteria = ref("");
const newkriteria = ref("");
const points = ref([
  {
    pertanyaan: "",
    scoreMaksimal: "",
  },
]);
const alertMessage = ref("");
const alertClass = ref("");
const alertTitle = ref("");
const emits = defineEmits(["update-show-form"]);

onMounted(() => {
  getPertanyaan();
});

const getPertanyaan = async () => {
  withLoading(async () => {
    try {
      const response = await axios.get("/yelyel/pertanyaan-all");
      console.log(response.data);
      pertanyaanList.value = response.data;
    } catch (e) {
      console.log(e);
    }
  });
};

const addPoint = () => {
  points.value.push({ pertanyaan: "", scoreMaksimal: "" });
};

const removePoint = (index) => {
  if (points.value.length > 1) {
    points.value.splice(index, 1);
  }
};

const createPertanyaan = async () => {
  if (!validateForm()) return;

  const data = {
    kriteria: {
      id: selectedKriteria.value !== "new" ? selectedKriteria.value : "",
      name: newkriteria.value.trim(),
    },
    points: points.value,
  };

  try {
    const response = await axios.post("/yelyel/create-pertanyaan-qcc", data);
    console.log(response.data);
    handleSuccess("Pertanyaan Created");
  } catch (error) {
    console.error("Error creating pertanyaan:", error);
    handleError("Error ", "Create Pertanyaan");
  } finally {
    selectedKriteria.value = "";
    newkriteria.value = "";
    points.value = [{ pertanyaan: "", scoreMaksimal: "" }];
    emits("update-show-form", false); // Mengirim event untuk mengubah showForm di parent
  }
};

const validateForm = () => {
  if (
    selectedKriteria.value === "" ||
    (selectedKriteria.value === "new" && newkriteria.value.trim() === "")
  ) {
    alertTitle.value = "Info alert!";
    alertMessage.value = "Please select or enter a question.";
    alertClass.value =
      "p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400";
    return false;
  }

  if (
    points.value.some(
      (point) => point.pertanyaan.trim() === "" || point.scoreMaksimal === ""
    )
  ) {
    alertTitle.value = "Danger alert!";
    alertMessage.value = "Please fill out all point evaluation fields.";
    alertClass.value =
      "p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400";
    return false;
  }

  if (
    points.value.some(
      (point) => isNaN(point.scoreMaksimal) || point.scoreMaksimal <= 0
    )
  ) {
    alertTitle.value = "Warning alert!";
    alertMessage.value = "Please enter a valid score maximum (greater than 0).";
    alertClass.value =
      "p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300";
    return false;
  }

  alertTitle.value = "Success alert!";
  alertMessage.value = "Data Saved.";
  alertClass.value =
    "p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400";
  return true;
};
</script>

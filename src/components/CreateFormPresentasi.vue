<template>
  <section
    id="pertanyaan-lapangan"
    class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-5"
  >
    <form @submit.prevent="createPertanyaan" class="w-3/12">
      <!-- Peringatan Validasi -->
      <div v-if="alertMessage" :class="alertClass" role="alert">
        <span class="font-medium">{{ alertTitle }}</span> {{ alertMessage }}
      </div>

      <!-- Pilih Tipe Acara -->
      <label
        for="select-type"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Pilih Acara
      </label>
      <select
        id="select-type"
        v-model="selectedType"
        required
        class="bg-gray-50 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option disabled value="">-- Pilih Tipe --</option>
        <option value="QCC">QCC</option>
        <option value="SS">SS</option>
      </select>

      <!-- Pilih Pertanyaan -->
      <label
        for="select-pertanyaan"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Pilih Pertanyaan
      </label>
      <select
        id="select-pertanyaan"
        v-model="selectedPertanyaan"
        class="bg-gray-50 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option value="new">-- Buat Pertanyaan Baru --</option>
        <option selected disabled>-- Daftar Pertanyaan --</option>
        <option
          v-for="(list, index) in filteredPertanyaanList"
          :key="index"
          :value="list.id"
        >
          <!-- Batasi karakter  -->
          {{ truncateText(list.pertanyaan, 150) }}
        </option>
      </select>
      <input
        v-if="selectedPertanyaan === 'new'"
        v-model="newPertanyaan"
        type="text"
        id="default-input"
        placeholder="Masukkan Pertanyaan Baru"
        class="bg-gray-50 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />

      <!-- Indikator Pertanyaan -->
      <label
        for="indikator-pertanyaan"
        class="block mt-2 mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Indikator Pertanyaan
      </label>
      <div
        v-for="(point, index) in points"
        :key="index"
        class="w-full flex gap-1 mb-2"
      >
        <textarea
          v-model="point.pointPenilaian"
          type="text"
          placeholder="Poin Penilaian"
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        ></textarea>
        <input
          v-model="point.scoreMaksimal"
          type="number"
          step="0.01"
          placeholder="Skor Maksimal"
          class="max-w-25% bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
        <button
          v-if="points.length > 1"
          type="button"
          @click="removePoint(index)"
          class="rounded-lg p-2.5 bg-red-500 text-white"
        >
          Hapus
        </button>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          @click="addPoint"
          class="rounded-lg p-2.5 bg-green-500 text-white"
        >
          Tambah
        </button>
        <button type="submit" class="rounded-lg p-2.5 bg-blue-500 text-white">
          Simpan
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import axios from "axios";
import { handleSuccess, truncateText } from "@/utils/utils";

const pertanyaanList = ref([]);
const selectedPertanyaan = ref("");
const newPertanyaan = ref("");
const selectedType = ref("");
const points = ref([{ pointPenilaian: "", scoreMaksimal: "" }]);
const alertMessage = ref("");
const alertClass = ref("");
const alertTitle = ref("");
const emits = defineEmits(["update-show-form"]);

onMounted(() => {
  getPertanyaanList();
});

// Mengambil data pertanyaan saat selectedType berubah
watch(selectedType, () => {
  getPertanyaanList();
});

// Fungsi untuk mengambil data pertanyaan dari server
const getPertanyaanList = async () => {
  if (selectedType.value) {
    try {
      const response = await axios.get("/presentasi/pertanyaan-all", {
        params: { type: selectedType.value },
      });
      pertanyaanList.value = response.data;
    } catch (error) {
      console.error("Error fetching pertanyaan list:", error);
    }
  }
};

// Filter pertanyaanList berdasarkan type
const filteredPertanyaanList = computed(() =>
  pertanyaanList.value.filter((item) => item.type === selectedType.value)
);

const addPoint = () => {
  points.value.push({ pointPenilaian: "", scoreMaksimal: "" });
};

const removePoint = (index) => {
  if (points.value.length > 1) {
    points.value.splice(index, 1);
  }
};

const validateForm = () => {
  if (selectedType.value === "") {
    alertTitle.value = "Info alert!";
    alertMessage.value = "Please select a type.";
    alertClass.value =
      "p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400";
    return false;
  }

  if (
    selectedPertanyaan.value === "" ||
    (selectedPertanyaan.value === "new" && newPertanyaan.value.trim() === "")
  ) {
    alertTitle.value = "Info alert!";
    alertMessage.value = "Please select or enter a question.";
    alertClass.value =
      "p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400";
    return false;
  }

  if (
    points.value.some(
      (point) =>
        point.pointPenilaian.trim() === "" || point.scoreMaksimal === ""
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

const createPertanyaan = async () => {
  if (!validateForm()) return;

  const data = {
    pertanyaan: {
      id: selectedPertanyaan.value !== "new" ? selectedPertanyaan.value : "",
      pertanyaan: newPertanyaan.value.trim(),
      type: selectedType.value, // Tambahkan type ke data
    },
    points: points.value,
  };

  try {
    const response = await axios.post("/presentasi/create-pertanyaan", data);
    console.log(response.data);
    handleSuccess("Pertanyaan Created");
  } catch (error) {
    console.error("Error creating pertanyaan:", error);
  } finally {
    selectedPertanyaan.value = "";
    newPertanyaan.value = "";
    selectedType.value = ""; // Reset selectedType
    points.value = [{ pointPenilaian: "", scoreMaksimal: "" }];
    emits("update-show-form", false); // Mengirim event untuk mengubah showForm di parent
  }
};
</script>

<style scoped></style>

<template>
  <section
    id="pertanyaan-lapangan"
    class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-5"
  >
    <form @submit.prevent="createPertanyaan">
      <!-- Pilih Type -->
      <label
        for="select-type"
        class="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white"
        >Acara</label
      >
      <select
        v-model="selectedType"
        id="select-type"
        class="bg-gray-50 border w-1/2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="" disabled>-- Pilih Tipe --</option>
        <option value="QCC">QCC</option>
        <option value="SS">SS</option>
      </select>

      <!-- Fase -->
      <label
        for="select-fase"
        class="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white"
        >Fase</label
      >
      <select
        v-model="selectedFase"
        id="select-fase"
        class="bg-gray-50 border w-1/2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="" disabled>-- Pilih Fase --</option>
        <option value="new">-- Buat Fase Baru --</option>
        <option
          v-for="fase in filteredFaseList"
          :key="fase.id"
          :value="fase.id"
        >
          {{ fase.name }}
        </option>
      </select>

      <!-- Input Fase Baru -->
      <input
        v-if="selectedFase === 'new'"
        type="text"
        v-model="newFase"
        id="fase"
        class="bg-gray-50 border w-1/2 border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="Masukkan Fase Baru"
        required
      />

      <!-- Kriteria -->
      <label
        for="select-kriteria"
        class="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white"
        >Kriteria</label
      >
      <select
        v-model="selectedKriteria"
        id="select-kriteria"
        class="bg-gray-50 border w-1/2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="" disabled>-- Pilih Kriteria --</option>
        <option value="new">-- Buat Kriteria Baru --</option>
        <option
          v-for="kriteria in filteredKriteriaList"
          :key="kriteria.id"
          :value="kriteria.id"
        >
          {{ kriteria.name }}
        </option>
      </select>

      <!-- Input Kriteria Baru -->
      <input
        v-if="selectedKriteria === 'new'"
        type="text"
        v-model="newKriteria"
        id="kriteria"
        class="bg-gray-50 border w-1/2 border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="Masukkan Kriteria Baru"
        required
      />

      <!-- Subkriteria -->
      <label
        for="select-subkriteria"
        class="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white"
        >Subkriteria</label
      >
      <select
        v-model="selectedSubkriteria"
        id="select-subkriteria"
        class="bg-gray-50 border w-1/2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="">-- Pilih Subkriteria --</option>
        <option value="new">-- Buat Subkriteria Baru --</option>
        <option
          v-for="subkriteria in filteredSubkriteriaList"
          :key="subkriteria.id"
          :value="subkriteria.id"
        >
          {{ subkriteria.name }}
        </option>
      </select>

      <!-- Input Subkriteria Baru -->
      <input
        v-if="selectedSubkriteria === 'new'"
        type="text"
        v-model="newSubkriteria"
        id="subkriteria"
        class="bg-gray-50 border w-1/2 border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="Masukkan Subkriteria Baru"
        required
      />

      <!-- Pertanyaan dan Jawaban Section -->
      <div
        v-if="selectedSubkriteria"
        v-for="(pertanyaanItem, index) in pertanyaanList"
        :key="index"
      >
        <!-- Input Pertanyaan -->
        <div class="mb-6 mt-6">
          <label
            :for="'pertanyaan' + index"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Pertanyaan {{ index + 1 }}
          </label>
          <input
            :id="'pertanyaan' + index"
            v-model="pertanyaanItem.pertanyaan"
            class="bg-gray-50 border w-1/2 border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <!-- Input Jawaban -->
        <div class="flex space-x-4 mb-2">
          <div
            v-for="(jawaban, jawabanIndex) in pertanyaanItem.jawabanList"
            :key="jawabanIndex"
          >
            <label
              :for="'jawaban' + index + jawabanIndex"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Jawaban {{ jawabanIndex + 1 }}
            </label>
            <input
              :id="'jawaban' + index + jawabanIndex"
              :value="jawaban"
              type="text"
              @input="updateJawaban(index, jawabanIndex, $event.target.value)"
              class="bg-gray-50 border w-full text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p
              v-if="!isJawabanValid(jawaban) && jawaban.trim() !== ''"
              class="text-sm text-red-500 mt-1"
            >
              Jawaban harus berupa angka atau desimal yang valid (misal: 0.5
              atau 5.5)
            </p>
          </div>
        </div>
      </div>

      <!-- Buttons for Adding/Removing Questions -->
      <div v-if="selectedSubkriteria" class="flex mb-6 gap-2 mt-2">
        <button
          @click="tambahInputPertanyaan"
          type="button"
          class="bg-blue-700 text-white px-5 py-2.5 rounded-lg"
        >
          Tambah Pertanyaan
        </button>
        <button
          v-if="pertanyaanList.length > 1"
          @click="hapusPertanyaan(index)"
          type="button"
          class="bg-red-500 text-white px-5 py-2.5 rounded-lg"
        >
          Hapus Pertanyaan
        </button>
      </div>

      <!-- Submit and Cancel Buttons -->
      <div class="flex gap-2 mt-4">
        <button
          type="submit"
          class="bg-blue-700 hover:bg-blue-900 text-white px-5 py-2.5 rounded-lg"
        >
          Simpan
        </button>
        <button
          @click="resetForm()"
          type="button"
          class="bg-red-500 hover:bg-red-900 text-white px-5 py-2.5 rounded-lg"
        >
          Batal
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import { handleError, handleSuccess, withLoading } from "@/utils/utils";

const lapanganData = ref([]);
const selectedType = ref("");
const selectedFase = ref("");
const newFase = ref("");
const selectedKriteria = ref("");
const newKriteria = ref("");
const selectedSubkriteria = ref("");
const newSubkriteria = ref("");
const pertanyaanList = ref([]);
const faseList = ref([]);
const kriteriaList = ref([]);
const subkriteriaList = ref([]);
const emit = defineEmits(["update-show-form"]);

onMounted(() => {
  getAllLapangan();
});

// Fungsi untuk mengatur ulang form dan inisialisasi jawaban
const resetPertanyaanList = () => {
  const jawabanCount = selectedType.value === "SS" ? 5 : 4;
  pertanyaanList.value = [
    { pertanyaan: "", jawabanList: Array(jawabanCount).fill("") },
  ];
};

// Menjalankan resetPertanyaanList setiap kali selectedType berubah
watch(selectedType, () => {
  resetPertanyaanList();
});

const getAllLapangan = async () => {
  withLoading(async () => {
    try {
      const response = await axios.get("/lapangan/all");
      lapanganData.value = response.data;

      faseList.value = lapanganData.value.map((fase) => ({
        id: fase.faseId,
        name: fase.faseName,
        type: fase.faseType,
      }));
      kriteriaList.value = lapanganData.value.flatMap((fase) =>
        fase.kriteriaList.map((kriteria) => ({
          id: kriteria.id,
          name: kriteria.name,
          faseId: kriteria.faseId,
        }))
      );
      subkriteriaList.value = lapanganData.value.flatMap((fase) =>
        fase.kriteriaList.flatMap((kriteria) =>
          kriteria.subKriteriaList.map((subkriteria) => ({
            id: subkriteria.id,
            name: subkriteria.name,
            kriteriaId: subkriteria.kriteriaId,
          }))
        )
      );
    } catch (error) {
      handleError("Error", error);
      console.log("GET ALL LAPANGAN:", error);
    }
  });
};

const filteredFaseList = computed(() => {
  return faseList.value.filter((fase) => fase.type === selectedType.value);
});

const filteredKriteriaList = computed(() => {
  return kriteriaList.value.filter(
    (kriteria) => kriteria.faseId == selectedFase.value
  );
});

const filteredSubkriteriaList = computed(() => {
  return subkriteriaList.value.filter(
    (subkriteria) => subkriteria.kriteriaId == selectedKriteria.value
  );
});

const createPertanyaan = async () => {
  try {
    const duplicateMessages = [
      checkDuplicate(faseList, newFase.value, "Fase", null, selectedType.value),
      checkDuplicate(
        kriteriaList,
        newKriteria.value,
        "Kriteria",
        selectedFase.value
      ),
      checkDuplicate(
        subkriteriaList,
        newSubkriteria.value,
        "Subkriteria",
        selectedKriteria.value
      ),
    ].filter(Boolean);

    if (duplicateMessages.length > 0) {
      handleError(duplicateMessages.join("\n"));
      return;
    }

    let faseId = selectedFase.value;
    let kriteriaId = selectedKriteria.value;
    let subkriteriaId = selectedSubkriteria.value;
    let successMessages = [];

    if (faseId === "new") {
      const faseResponse = await axios.post("/lapangan/create-fase", {
        name: newFase.value,
        type: selectedType.value,
      });
      faseId = faseResponse.data.id;
      successMessages.push(`Fase Created\n,`);
    }

    if (kriteriaId === "new") {
      const kriteriaResponse = await axios.post("/lapangan/create-kriteria", {
        faseId: faseId,
        name: newKriteria.value,
      });
      kriteriaId = kriteriaResponse.data.id;
      successMessages.push(`Kriteria Created\n,`);
    }

    if (subkriteriaId === "new") {
      const subkriteriaResponse = await axios.post(
        "/lapangan/create-subkriteria",
        {
          kriteriaId: kriteriaId,
          name: newSubkriteria.value,
        }
      );
      subkriteriaId = subkriteriaResponse.data.id;
      successMessages.push(`Subkriteria Created\n,`);
    }

    const validPertanyaanList = pertanyaanList.value.filter(
      (pertanyaanItem) =>
        pertanyaanItem.pertanyaan.trim() !== "" &&
        pertanyaanItem.jawabanList.every((jawaban) => jawaban.trim() !== "")
    );

    if (validPertanyaanList.length > 0) {
      for (const pertanyaanItem of validPertanyaanList) {
        try {
          for (let i = 0; i < pertanyaanItem.jawabanList.length; i++) {
            const jawaban = pertanyaanItem.jawabanList[i];
            validateJawaban(
              pertanyaanList.value.indexOf(pertanyaanItem),
              i,
              jawaban
            );
            if (!isJawabanValid(jawaban)) {
              handleError(
                "invalid Jawaban",
                "Jawaban harus berupa angka atau desimal yang valid"
              );
              return;
            }
          }

          const pertanyaanResponse = await axios.post(
            "/lapangan/create-pertanyaan-jawaban",
            {
              subKriteriaId: subkriteriaId,
              pertanyaan: pertanyaanItem.pertanyaan,
              jawabanList: pertanyaanItem.jawabanList,
            }
          );
          successMessages.push(`Pertanyaan Created ,`);
        } catch (error) {
          handleError("Error", error.response.data);
        }
      }
    }

    if (successMessages.length > 0) {
      handleSuccess("Success", "Success ", successMessages.join("\n"));
    }

    resetForm();
    getAllLapangan();
  } catch (error) {
    handleError("error", error.message);
  }
};

const resetForm = () => {
  selectedType.value = "";
  selectedFase.value = "";
  newFase.value = "";
  selectedKriteria.value = "";
  newKriteria.value = "";
  selectedSubkriteria.value = "";
  newSubkriteria.value = "";

  resetPertanyaanList();
  emit("update-show-form", false); // Emit ke parent untuk menutup form
};

const checkDuplicate = (
  list,
  value,
  type,
  relatedId = null,
  faseType = null
) => {
  return list.value.find(
    (item) =>
      item.name === value &&
      (faseType ? item.type === faseType : true) &&
      (relatedId
        ? item.faseId === relatedId || item.kriteriaId === relatedId
        : true)
  )
    ? `${type} dengan nama yang sama sudah ada dalam konteks terkait`
    : null;
};

const isJawabanValid = (jawaban) => {
  return !isNaN(parseFloat(jawaban)) && isFinite(jawaban);
};

const validateJawaban = (pertanyaanIndex, jawabanIndex, value) => {
  const validValue = value.replace(/[^0-9.,]/g, ""); // Hanya izinkan angka dan koma/titik
  const formattedValue = validValue.replace(/,/g, "."); // Ganti koma dengan titik untuk konsistensi
  if (!isNaN(formattedValue)) {
    pertanyaanList.value[pertanyaanIndex].jawabanList[jawabanIndex] =
      formattedValue;
  } else {
    handleAlert({
      title: "Input Invalid",
      text: "Jawaban harus berupa angka atau desimal yang valid",
    });
  }
};

const tambahInputPertanyaan = () => {
  const jawabanCount = selectedType.value === "SS" ? 5 : 4;
  pertanyaanList.value.push({
    pertanyaan: "",
    jawabanList: Array(jawabanCount).fill(""),
  });
};

const hapusPertanyaan = (index) => {
  if (pertanyaanList.value.length > 1) {
    pertanyaanList.value.splice(index, 1);
  }
};

const updateJawaban = (pertanyaanIndex, jawabanIndex, value) => {
  pertanyaanList.value[pertanyaanIndex].jawabanList[jawabanIndex] = value;
};
</script>

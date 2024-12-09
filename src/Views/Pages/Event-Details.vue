<script setup>
import { onMounted, ref } from "vue";
import SiddebarWithNavbar from "../../components/SidebarWithNavbar.vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import {
  getStatusColor,
  handleError,
  handleSuccess,
  formatDate,
  isLoading,
  downloadFile,
  withLoading,
  isSidebarOpen,
  sidebarToggle,
  sendEmail,
  getEmailCc,
  ccEmail,
  emailUploadFile,
} from "@/utils/utils";
import spinner from "@/components/Spinner.vue";

import axios from "axios";
import router from "@/router/router";

const store = useStore();
const user = ref("");
const registrationId = ref(null);
const route = useRoute();
const registeredData = ref([]);
const selectedFiles = ref([]);
const filteredBerkas = ref([]);
const showJudulInput = ref(false);
const newJudul = ref("");

// Fungsi untuk mengelompokkan file berdasarkan tanggal unggahan

onMounted(() => {
  user.value = store.getters.getUserData;
  registrationId.value = route.params.registrationId;
  getRegisteredById();
});

const updateRegistrationJudul = async () => {
  try {
    const updatedRegistration = {
      judul: newJudul.value,
    };

    await axios.put(
      `/registration/${registrationId.value}`,
      updatedRegistration
    );
    registeredData.value.judul = newJudul.value; // Update the local state

    handleSuccess("Judul ", "updated successfully");
  } catch (error) {
    handleError("Failed to update Judul: " + error.message);
  } finally {
    showJudulInput.value = false;
    getRegisteredById(registrationId.value);
  }
};

const uploadFiles = async (stepId) => {
  if (!selectedFiles.value[stepId] || !selectedFiles.value[stepId].length) {
    handleError("Silakan pilih file untuk diunggah.");
    return;
  }

  const formData = new FormData();
  selectedFiles.value[stepId].forEach((file) => {
    formData.append("files", file);
  });
  formData.append("eventName", registeredData.value.event.eventName);
  formData.append("teamName", registeredData.value.team.teamName);
  formData.append("steps", stepId);
  formData.append("registration", registrationId.value);

  try {
    await withLoading(async () => {
      const response = await axios.post("/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Generate success message based on the number of files uploaded
      const fileCount = selectedFiles.value[stepId].length;
      const successMessage =
        fileCount > 1
          ? `${fileCount} file berhasil diunggah.`
          : `${fileCount} file berhasil diunggah.`;

      // Ambil informasi cc dari backend (misalnya role "LEADER")
      await getEmailCc("LEADER", user.value.department);

      const fileNames = selectedFiles.value[stepId].map((file) => file.name);

      const emailContent = await emailUploadFile(
        fileNames,
        user.value.username
      );

      console.log("USERRR " + user.value.username);

      // Kirim email pemberitahuan setelah file berhasil diunggah
      const mailRequest = {
        to: [user.value.email],
        cc: ccEmail.value,
        bcc: [],
        subject: `Notifikasi Upload File ${registeredData.value.event.eventName}`,
        text: emailContent,
      };

      await sendEmail(mailRequest);

      // handleSuccess(successMessage);
    });
  } catch (error) {
    console.error(error);

    // Default error message
    let errorMessage = "Gagal mengunggah file.";

    // Extract error message from response
    if (error.response && error.response.data) {
      errorMessage = error.response.data;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Handle specific error cases
    if (errorMessage.includes("AlreadyExist")) {
      handleError("File dengan nama yang sama sudah ada.");
    } else if (errorMessage.includes("File size exceeds the allowed limit")) {
      handleError("Ukuran file melebihi batas maksimum 10 MB.");
    } else if (errorMessage.includes("File type not allowed")) {
      handleError(
        "Tipe file tidak diizinkan. Silakan unggah file dengan format yang benar."
      );
    } else {
      handleError(errorMessage);
    }
  } finally {
    // Clear the selected files for the current step
    selectedFiles.value[stepId] = [];
    // Refresh the registered data
    getRegisteredById();
  }
};

const handleNewFileUpload = (event, stepId) => {
  if (!selectedFiles.value[stepId]) {
    selectedFiles.value[stepId] = [];
  }
  selectedFiles.value[stepId].push(...event.target.files);
};

const removeFile = (stepId, fileIndex) => {
  selectedFiles.value[stepId].splice(fileIndex, 1);
  if (selectedFiles.value[stepId].length === 0) {
    delete selectedFiles.value[stepId];
  }
};

const getRegisteredById = async () => {
  withLoading(async () => {
    try {
      const res = await axios.get(`/registration/${registrationId.value}`);
      registeredData.value = res.data;

      // Filter dan atur pengelompokan file berkas
      filteredBerkas.value = registeredData.value.event.stages.filter(
        (stage) => stage.berkas == `true`
      );

      console.log(filteredBerkas.value);
    } catch (error) {
      console.error("Gagal mendapatkan data registrasi: " + error);
    }
  });
};

const showUploadInput = (stage) => {
  if (!stage.uploadFiles.length) return true;
  const lastFileGroup = stage.uploadFiles[stage.uploadFiles.length - 1];
  if (lastFileGroup) {
    const lastApprovalStatus = lastFileGroup.approvalStatus.toUpperCase();
    return lastApprovalStatus == "REJECT" || lastFileGroup.files.length == 0;
  }
  return false;
};
</script>

<!-- Main -->
<template>
  <main>
    <SiddebarWithNavbar @toggleSidebar="sidebarToggle"></SiddebarWithNavbar>
    <spinner v-if="isLoading"></spinner>
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
      <button
        @click="router.back()"
        class="bg-gray-900 p-2 rounded text-white hover:text-blue hover:bg-gray-600 mt-14"
      >
        Kembali
      </button>
      <div
        class="w-full min-w-sm p-4 mt-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700"
      >
        <div class="flex justify-between mb-3">
          <div class="flex-1 min-w-0">
            <div
              class="flex items-center space-x-2 whitespace-pre-wrap break-words text-sm font-medium text-gray-900 dark:text-white"
            >
              <div>
                {{ registeredData.judul }}
              </div>
              <div
                class="cursor-pointer"
                v-if="registeredData.registrationStatus != 'Completed'"
              >
                <svg
                  v-if="!registeredData.risalahFileName && user.role == 'USER'"
                  @click="showJudulInput = !showJudulInput"
                  height="10pt"
                  viewBox="0 -1 401.52289 401"
                  width="10pt"
                  xmlns="http://www.w3.org/2000/svg"
                  id="fi_1159633"
                >
                  <path
                    d="m370.589844 250.972656c-5.523438 0-10 4.476563-10 10v88.789063c-.019532 16.5625-13.4375 29.984375-30 30h-280.589844c-16.5625-.015625-29.980469-13.4375-30-30v-260.589844c.019531-16.558594 13.4375-29.980469 30-30h88.789062c5.523438 0 10-4.476563 10-10 0-5.519531-4.476562-10-10-10h-88.789062c-27.601562.03125-49.96875 22.398437-50 50v260.59375c.03125 27.601563 22.398438 49.96875 50 50h280.589844c27.601562-.03125 49.96875-22.398437 50-50v-88.792969c0-5.523437-4.476563-10-10-10zm0 0"
                  ></path>
                  <path
                    d="m376.628906 13.441406c-17.574218-17.574218-46.066406-17.574218-63.640625 0l-178.40625 178.40625c-1.222656 1.222656-2.105469 2.738282-2.566406 4.402344l-23.460937 84.699219c-.964844 3.472656.015624 7.191406 2.5625 9.742187 2.550781 2.546875 6.269531 3.527344 9.742187 2.566406l84.699219-23.464843c1.664062-.460938 3.179687-1.34375 4.402344-2.566407l178.402343-178.410156c17.546875-17.585937 17.546875-46.054687 0-63.640625zm-220.257812 184.90625 146.011718-146.015625 47.089844 47.089844-146.015625 146.015625zm-9.40625 18.875 37.621094 37.625-52.039063 14.417969zm227.257812-142.546875-10.605468 10.605469-47.09375-47.09375 10.609374-10.605469c9.761719-9.761719 25.589844-9.761719 35.351563 0l11.738281 11.734375c9.746094 9.773438 9.746094 25.589844 0 35.359375zm0 0"
                  ></path>
                </svg>
              </div>
            </div>

            <!-- Text area untuk memperbarui judul -->
            <div v-if="showJudulInput" class="mt-4">
              <textarea
                v-model="newJudul"
                class="border rounded px-2 py-1 w-full"
                rows="3"
                placeholder="Masukkan judul baru"
              ></textarea>
              <button
                @click="updateRegistrationJudul"
                class="bg-green-500 text-white px-3 py-1.5 rounded mt-2"
              >
                Simpan
              </button>
              <button
                @click="showJudulInput = !showJudulInput"
                class="ms-2 bg-red-500 text-white px-3 py-1.5 rounded mt-2"
              >
                Batal
              </button>
            </div>

            <div class="mt-2 text-black">
              <span class="font-medium"> Risalah : </span>

              <!-- Menampilkan daftar nama file risalah -->
              <div
                v-if="
                  registeredData.risalahFileNames &&
                  registeredData.risalahFileNames.length
                "
              >
                <ul>
                  <li
                    v-for="(fileName, index) in registeredData.risalahFileNames"
                    :key="index"
                  >
                    <div class="flex items-center">
                      <span class="text-sm">{{ fileName }}</span>
                      <button
                        class="ml-2 text-blue-600 dark:text-blue-500 cursor-pointer hover:underline"
                        @click="
                          downloadFile(registeredData.risalahFileNames[index])
                        "
                      >
                        Unduh
                      </button>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Jika tidak ada file risalah -->
              <div v-else>
                <span>- Tidak Ada</span>
              </div>
            </div>
          </div>
          <span
            class="text-sm font-medium text-blue-600 dark:text-blue-500 ml-4 flex-shrink-0"
          >
            {{
              registeredData.event
                ? registeredData.event.eventName
                : "Nama Acara"
            }}
          </span>
        </div>

        <br />
        <hr />
        <p class="mt-2 font-bold text-xl underline">Anggota Tim</p>
        <div class="flow-root">
          <ul
            v-if="
              registeredData &&
              registeredData.team &&
              registeredData.team.teamMember
            "
            role="list"
            class="divide-y divide-gray-200 dark:divide-gray-700"
          >
            <li
              v-for="(team, index) in registeredData.team.teamMember"
              :key="index"
              class="py-2 sm:py-1"
            >
              <div class="flex items-center mt-2">
                <p>{{ index + 1 }}.</p>
                <div class="flex-1 min-w-0 ms-4">
                  <p
                    class="text-sm font-medium text-gray-900 truncate dark:text-white"
                  >
                    {{ team.memberName }} <span>({{ team.nip }})</span>
                  </p>
                </div>
                <div
                  class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
                >
                  {{ team.memberPosition }}
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div
        class="w-full p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-5"
      >
        <template v-if="filteredBerkas">
          <template v-for="stage in filteredBerkas" :key="stage.stepId">
            <!-- Pengelompokan file berdasarkan upload -->
            <div
              class="w-full p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-5"
            >
              <span class="flex flex-wrap justify-between items-center">
                <div>
                  <strong
                    class="text-xl font-bold underline leading-none text-gray-900 dark:text-white"
                  >
                    {{ stage.stepName }}
                  </strong>
                </div>

                <pre
                  v-if="!stage.uploadFiles.length"
                  class="text-sm font-medium text-gray-900 truncate dark:text-white mt-2"
                >
                  Belum Ada File
                </pre>

                <section id="input-upload" v-if="showUploadInput(stage)">
                  <div class="mt-2">
                    <label
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Unggah file:
                    </label>
                    <input
                      @change="
                        (event) => handleNewFileUpload(event, stage.stepId)
                      "
                      class="block text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                      type="file"
                      multiple
                    />

                    <small class="text-gray-600 dark:text-gray-400">
                      * Support Multiple file
                      <br />
                      * Maksimum ukuran file: 10 MB.
                      <br />
                      * Tipe file yang diizinkan: .png, .jpg, .jpeg, .pdf, .doc,
                      .docx, .xls, .xlsx, .ppt, .pptx
                    </small>

                    <!-- Tampilkan file yang dipilih -->
                    <ul>
                      <p
                        class="font-medium underline"
                        v-if="selectedFiles.length > 1"
                      >
                        Selected File :
                      </p>
                      <li
                        v-for="(file, index) in selectedFiles[stage.stepId]"
                        :key="index"
                      >
                        {{ file.name }}
                        <button
                          class="text-red-500"
                          @click="removeFile(stage.stepId, index)"
                        >
                          - hapus
                        </button>
                      </li>
                    </ul>

                    <!-- Tampilkan aturan file upload -->

                    <button
                      @click="() => uploadFiles(stage.stepId)"
                      class="bg-blue-500 hover:bg-blue-800 text-white mt-2 p-2 rounded-md"
                    >
                      Unggah
                    </button>
                  </div>
                </section>
              </span>

              <!-- Rendering grouped files -->
              <template v-for="filesGroup in stage.uploadFiles" :key="index">
                <section
                  id="list-berkas"
                  class="border border-1 rounded-md mb-2 mt-2 p-4 text-wrap"
                >
                  <small class="underline">Status: </small>
                  <span
                    class="ms-2"
                    :class="getStatusColor(filesGroup.approvalStatus)"
                    >{{ filesGroup.approvalStatus }}</span
                  >
                  <ul role="list" class="text-sm font-medium bg text-gray-900">
                    <template
                      v-for="(file, index) in filesGroup.files"
                      :key="file.filesId"
                    >
                      <li>
                        <div
                          class="flex flex-1 items-center sm:flex-wrap sm:flex-row"
                        >
                          {{ index + 1 }} . {{ file.fileName }} -
                          <span class="italic ms-1">
                            Diunggah: {{ formatDate(file.uploadedAt) }}
                          </span>
                          <button
                            class="p-2 ms-2 rounded-md bg-white cursor-pointer whitespace-pre-wrap hover:bg-blue-500"
                            @click="() => downloadFile(file.fileName)"
                            download
                          >
                            Unduh
                          </button>
                        </div>
                      </li>
                    </template>
                  </ul>
                  <div>
                    <small class="italic">Keterangan: </small>
                  </div>
                  <div v-if="filesGroup.files[0].responseFileName">
                    <span>
                      File:
                      <span class="italic ms-1">
                        {{ filesGroup.files[0].responseFileName }}
                      </span>
                      <button
                        class="p-2 ms-1 rounded-md bg-white cursor-pointer hover:bg-blue-500"
                        @click="
                          () =>
                            downloadFile(filesGroup.files[0].responseFileName)
                        "
                        download
                      >
                        Unduh
                      </button>
                    </span>
                    <div class="mt-1 wrap-text">
                      <p>
                        {{ filesGroup.files[0].responseDescription }}
                      </p>
                    </div>
                  </div>
                  <div v-else>-</div>
                </section>
              </template>
            </div>
          </template>
        </template>
      </div>
    </div>
  </main>
</template>

<style>
.wrap-text {
  white-space: pre-wrap; /* CSS3 */
  white-space: -moz-pre-wrap; /* Firefox */
  white-space: -pre-wrap; /* Opera <7 */
  white-space: -o-pre-wrap; /* Opera 7 */
  word-wrap: break-word; /* IE */
}
</style>

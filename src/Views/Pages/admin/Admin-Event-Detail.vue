<script setup>
import { handleError, onMounted, ref } from "vue";
import SiddebarWithNavbar from "../../../components/SidebarWithNavbar.vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Spinner from "@/components/Spinner.vue";
import {
  handleConfirm,
  formatDate,
  handleSuccess,
  withLoading,
  downloadFile,
  isSidebarOpen,
  sidebarToggle,
  sendEmail,
  isLoading,
  emailApproval,
  emailReject,
} from "@/utils/utils";

const store = useStore();
const route = useRoute();
const router = useRouter();
const user = ref("");
const rejectFileId = ref();
const rejectFileGroupId = ref();
const rejectFileName = ref();
const fileNameApproved = ref();
const fileUploadedBy = ref();
const selectedFile = ref();
const selectedFileName = ref("");
const rejectReason = ref("");
const registeredData = ref([]);
const filteredBerkas = ref([]);
const showJudulInput = ref(false);
const newJudul = ref("");

const id = ref(null);

onMounted(() => {
  user.value = store.getters.getUserData;
  id.value = route.params.registrationId;
  registrationById(id.value);
});

const navigateBack = () => {
  router.replace(`/admin-event`);
};

const registrationById = async (id) => {
  withLoading(async () => {
    try {
      const response = await axios.get("/registration/" + id);
      registeredData.value = response.data;
      newJudul.value = registeredData.value.judul;
      console.log(registeredData.value);

      filteredBerkas.value = registeredData.value.event.stages.filter(
        (stage) => stage.berkas == `true`
      );

      console.log(filteredBerkas.value);
    } catch (ex) {
      console.error(ex);
    }
  });
};

const updateRegistrationJudul = async () => {
  try {
    const updatedRegistration = {
      judul: newJudul.value,
    };

    await axios.put(`/registration/${id.value}`, updatedRegistration);
    registeredData.value.judul = newJudul.value;

    handleSuccess("Judul ", "updated successfully");
  } catch (error) {
    handleError("Failed to update Judul: " + error.message);
  } finally {
    showJudulInput.value = false;
    registrationById(id.value);
  }
};

const approveFile = async (filesGroup) => {
  const approvalStatus = "APPROVE";
  fileNameApproved.value = filesGroup.fileName;
  fileUploadedBy.value = filesGroup.uploadedBy;
  try {
    const result = await handleConfirm({
      title: "Approve File?",
      text: "This action cannot be undone!",
    });

    if (result) {
      isLoading.value = true;

      await axios.put(
        `/file/approve/${filesGroup.groupId}?approvalStatus=${approvalStatus}`
      );

      await registrationById(id.value);

      handleSuccess("Approved");

      const emailContent = emailApproval(
        fileNameApproved.value,
        fileUploadedBy.value
      );

      const mailRequest = {
        to: [user.value.email],
        cc: [],
        bcc: ["wiz.fie@gmail.com"],
        subject: "Notification File Approved",
        text: emailContent,
        name: "Admin",
        from: "admin@example.com",
      };

      await sendEmail(mailRequest);
    }
  } catch (error) {
    console.error("Error approving file:", error);
    handleError("Failed to approve file: " + error.message);
  } finally {
    isLoading.value = false;
    fileUploadedBy.value = "";
    fileNameApproved.value = "";
  }
};

const rejectFile = async () => {
  handleConfirm({
    title: "Reject File",
    text: "This action cannot be undone!",
  }).then(async (result) => {
    if (result) {
      try {
        isLoading.value = true;
        const formData = new FormData();
        formData.append("description", rejectReason.value);

        formData.append("file", selectedFile.value);
        formData.append("fileId", rejectFileId.value);
        formData.append("groupId", rejectFileGroupId.value);

        await axios.put(`/file/reject`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        await registrationById(id.value);
        handleSuccess("Reject File Success");

        const emailContent = emailReject(
          rejectFileName.value,
          fileUploadedBy.value,
          rejectReason.value
        );

        const mailRequest = {
          to: ["wiz.fie@gmail.com"],
          cc: [],
          bcc: [user.value.email],
          subject: "Notification file Rejected",
          text: emailContent,
          name: "Admin",
          from: "admin@example.com",
          isFromAdmin: true,
        };

        await sendEmail(mailRequest);
      } catch (error) {
        handleError("Failed to reject file: " + error.response.data);
      } finally {
        hideRejectModal();
        rejectFileId.value = null;
        rejectReason.value = "";
        selectedFile.value = ""; // Clear the selected file
        selectedFileName.value = "";
        isLoading.value = false;
      }
    }
  });
};

const showRejectModal = (filesGroup) => {
  const modal = document.getElementById("reject-modal");
  modal.classList.remove("hidden");

  rejectFileId.value = filesGroup.filesId;
  rejectFileGroupId.value = filesGroup.groupId;
  rejectFileName.value = filesGroup.fileName;
  fileUploadedBy.value = filesGroup.uploadedBy;

  console.log(rejectFileId.value);
  console.log(rejectFileGroupId.value);
  console.log(rejectFileName.value);
  console.log(fileUploadedBy.value);
};

// Method untuk menyembunyikan modal reject
const hideRejectModal = () => {
  const modal = document.getElementById("reject-modal");
  modal.classList.add("hidden");
};
const handleFileChange = (event) => {
  // Akses file yang dipilih
  selectedFile.value = event.target.files[0];
  // Dapatkan nama file
  const fileName = selectedFile.value.name;
  // Tampilkan nama file, misalnya dengan menyimpannya ke dalam ref
  selectedFileName.value = fileName;
};
</script>

<template>
  <div>
    <Spinner v-if="isLoading"></Spinner>
    <SiddebarWithNavbar @toggleSidebar="sidebarToggle"></SiddebarWithNavbar>
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
      >
      <div
        class="flex items-center justify-between p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-14"
      >
        <button
          @click="navigateBack()"
          class="p-2 bg-gray-900 text-white border-1 rounded"
        >
          Kembali
        </button>
        <h5
          class="text-xl font-bold underline leading-none mb-2 text-gray-900 dark:text-white flex-1 text-center"
        >
          {{ registeredData.team ? registeredData.team.teamName : "Nama Tim " }}
        </h5>
      </div>

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
              <div>
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
                Submit
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
                    {{ team.memberName }} <span> ({{ team.nip }})</span>
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

      <section>
        <div
          v-for="stage in filteredBerkas"
          :key="stage.stepId"
          class="w-full mt-5 p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700"
        >
          <div class="flex items-center justify-between mb-4">
            <h5
              class="text-xl font-bold leading-none text-gray-900 dark:text-white"
            >
              {{ stage.stepName }}
            </h5>
          </div>
          <template v-for="filesGroup in stage.uploadFiles" :key="groupIndex">
            <section
              id="list-berkas"
              class="justify-between md:flex md:flex-row border border-1 rounded-md mb-2 mt-2 p-4 text-wrap"
            >
              <div>
                <ul role="list" class="text-sm font-medium text-gray-900">
                  <template
                    v-for="(file, fileIndex) in filesGroup.files"
                    :key="file.filesId"
                  >
                    <li>
                      <div class="flex flex-col items-center md:flex-row">
                        <span>
                          {{ fileIndex + 1 }}. {{ file.fileName }} -
                          <span class="italic ms-1 me-2"
                            >Diupload: {{ formatDate(file.uploadedAt) }}</span
                          >
                        </span>
                        <button
                          class="py-4 px-2 rounded-md bg-white cursor-pointer hover:bg-blue-500 hover:underline"
                          @click="downloadFile(file.fileName)"
                          download
                        >
                          Unduh
                        </button>
                      </div>
                    </li>

                    <!-- Bagian Revisi dengan responseFileName -->
                    <div v-if="file.responseFileName">
                      <div>
                        <small>Saran Revisi:</small>
                        <button
                          class="ms-2 p-1 rounded-md bg-white cursor-pointer hover:bg-blue-500"
                          @click="downloadFile(file.responseFileName)"
                          download
                        >
                          Unduh
                        </button>
                      </div>
                      <span
                        >*Note :
                        <span>{{ file.responseDescription }}</span></span
                      >
                    </div>
                  </template>
                </ul>
              </div>

              <div
                v-if="filesGroup.approvalStatus == 'PENDING'"
                class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
              >
                <div class="flex gap-2">
                  <button
                    v-if="filesGroup.approvalStatus == 'PENDING'"
                    @click="approveFile(filesGroup.files[0])"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Setujui
                  </button>
                  <button
                    @click.prevent="showRejectModal(filesGroup.files[0])"
                    class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    data-modal-target="select-modal"
                    data-modal-toggle="select-modal"
                    type="button"
                  >
                    Tolak
                  </button>
                </div>
              </div>
              <div v-else>
                <span
                  :class="{
                    'inline-flex items-center text-base font-semibold rounded ': true,
                    'border border-green-500 text-green-500':
                      filesGroup.approvalStatus === 'APPROVE',
                    'border border-red-500 text-red-500':
                      filesGroup.approvalStatus === 'REJECT',
                    'dark:text-white': true,
                  }"
                  class="px-6 py-4 mt-4 me-4"
                >
                  {{ filesGroup.approvalStatus }}
                </span>
              </div>
            </section>
          </template>
        </div>
      </section>
    </div>
  </div>

  <!-- Modal utama -->
  <div
    id="reject-modal"
    tabindex="-1"
    aria-hidden="true"
    class="hidden fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50"
  >
    <div class="relative p-4 w-full max-w-md max-h-full">
      <!-- Konten Modal -->
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <!-- Header Modal -->
        <div
          class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Form Penolakan
          </h3>
          <button
            @click="hideRejectModal()"
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            data-modal-toggle="select-modal"
          >
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
            <span class="sr-only">Tutup modal</span>
          </button>
        </div>
        <!-- Body Modal -->
        <div class="p-4 md:p-5">
          <form @submit.prevent="rejectFile">
            <div
              class="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            >
              <div class="flex items-center justify-center w-full">
                <!-- Di dalam template Anda -->
                <label
                  for="dropzone-file"
                  class="flex flex-col items-center justify-center w-full h-36 mb-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div
                    class="flex flex-col items-center justify-center pt-5 pb-6"
                  >
                    <svg
                      class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <span class="font-semibold">Klik untuk mengunggah</span>
                    <span class="text-center">{{ selectedFileName }}</span>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    class="hidden"
                    @change="handleFileChange"
                  />
                </label>
              </div>

              <div
                class="px-4 py-2 w-full bg-white rounded-t-lg dark:bg-gray-800"
              >
                <label for="comment" class="sr-only">Komentar Anda</label>
                <textarea
                  v-model="rejectReason"
                  id="comment"
                  rows="4"
                  class="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
                  placeholder="Tulis komentar..."
                  required
                ></textarea>
              </div>
              <div
                class="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600"
              >
                <button
                  type="submit"
                  class="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
#reject-modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>

<script setup>
import axios from "axios";
import { initFlowbite } from "flowbite";
import { onMounted, ref } from "vue";
import Spinner from "@/components/Spinner.vue";
import { useStore } from "vuex";

import SidebarWithNavbar from "../../components/SidebarWithNavbar.vue";
import {
  calculatePageNumbers,
  changePage,
  handleError,
  handleSuccess,
  holdPage,
  isLoading,
  withLoading,
  isSidebarOpen,
  sidebarToggle,
  formatDate,
  sendEmail,
  emailRegistration,
} from "@/utils/utils";

const store = useStore();
const user = ref();
const teams = ref([]);
const events = ref([]);
const selectedEvent = ref();
const selectedTeam = ref();
const judul = ref("");
const members = ref([{ memberName: "", memberPosition: "" }]);
const positions = ref([
  "Pemimpin Circle",
  "Pemimpin Tema",
  "Penasehat",
  "Notulen",
  "Fasilitator",
  "Anggota",
]);

const registrationList = ref([]);
const currentDate = new Date();
const currentYear = currentDate.getFullYear().toString();
const currentPage = ref(1);
const pageNumbers = ref([]);
const totalPages = ref();
const pageSize = ref();
const totalElements = ref();
const nipPattern = /^\d{2}-\d{4}$/;

onMounted(() => {
  initFlowbite();
  user.value = store.getters.getUserData;

  getEvents();
  fetchTeams();
  holdPage(currentPage);
  getRegistration();
});

const validateNipFormat = (nip) => {
  return nipPattern.test(nip);
};

const resetFormTeam = () => {
  selectedEvent.value = "";
  selectedTeam.value = "";
  members.value = [{ memberName: "", memberPosition: "" }];

  getRegistration();
};

const registerEvent = async () => {
  try {
    const registrationData = {
      teamId: selectedTeam.value.teamId,
      eventId: selectedEvent.value.eventId,
      registrationStatus: "Pending",
      createdBy: user.value.id,
      judul: judul.value,
    };

    console.log("EVENT" + selectedEvent.value.eventName);
    console.log("TEAM" + selectedTeam.value.teamName);

    await axios.post("/registration/register", registrationData);

    for (const member of members.value) {
      const memberData = {
        memberName: member.memberName,
        memberPosition: member.memberPosition,
        nip: member.nip,
        eventId: selectedEvent.value.eventId,
        teamId: selectedTeam.value.teamId,
      };
      await axios.post("/member/create", memberData);
    }

    handleSuccess("Pendaftaran berhasil");

    const emailContent = await emailRegistration(
      selectedTeam,
      selectedEvent,
      user
    );

    const mailRequest = {
      to: [user.value.email],
      cc: [],
      bcc: [user.value.email],
      subject: "Notification Registration",
      text: emailContent,
      name: user.value.username,
      from: "wiz.fie@gmail.com",
      isFromAdmin: false,
    };

    await sendEmail(mailRequest);
  } catch (error) {
    console.error("Gagal mendaftarkan tim:", error);
    handleError("Pendaftaran gagal");
  } finally {
    resetFormTeam();
  }
};

const getEvents = async () => {
  withLoading(async () => {
    try {
      const response = await axios.get("/event/all");
      const filteredEvents = response.data.filter(
        (event) => event.eventYear == currentYear
      );
      events.value = filteredEvents;
      console.log(events.value);
    } catch (error) {
      console.error("Error mengambil acara:", error);
    }
  });
};

const fetchTeams = async () => {
  isLoading.value = true;
  try {
    const { data } = await axios.get("/team/with-member", {
      params: { userId: user.value.id },
    });
    teams.value = data.data;
  } catch (error) {
    console.error("Error mengambil tim:", error);
  } finally {
    isLoading.value = false;
  }
};

const getRegistration = () => {
  isLoading.value = true;
  axios
    .get("/registration/get-all", {
      params: {
        createdBy: user.value.id,
        page: currentPage.value,
        pageSize: 10,
      },
    })
    .then((response) => {
      registrationList.value = response.data.data;
      currentPage.value = response.data.currentPage;
      totalPages.value = response.data.totalPages;
      pageSize.value = response.data.pageSize;
      totalElements.value = response.data.totalElements;

      localStorage.setItem("currentPage", currentPage.value);

      pageNumbers.value = calculatePageNumbers(
        currentPage.value,
        totalPages.value
      );

      console.log(registrationList.value);
    })
    .catch((ex) => {
      console.error("Gagal mendapatkan data pendaftaran: " + ex);
    });
  isLoading.value = false;
};

const addMember = () => {
  members.value.push({ memberName: "", memberPosition: "" });
};

const removeMember = (index) => {
  members.value.splice(index, 1);
};

const getAvailablePositions = (index) => {
  const selectedPositions = members.value
    .filter((_, i) => i !== index)
    .map((member) => member.memberPosition);

  return positions.value.filter(
    (position) =>
      !selectedPositions.includes(position) || position === "Anggota"
  );
};

const changePageNumber = async (pageNumber) => {
  currentPage.value = pageNumber;
  await changePage(pageNumber, getRegistration);
};
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
      >
      <div
        class="p-4 border-2 border-gray-200 rounded-lg dark:border-gray-700 mt-14"
      >
        <h1 class="text-2xl font-bold">Pendaftaran</h1>
      </div>

      <div
        class="p-4 border-2 border-gray-200 rounded-lg dark:border-gray-700 mt-2"
      >
        <div>
          <!-- Modal Pendaftaran -->
          <button
            data-modal-target="registration-modal"
            data-modal-toggle="registration-modal"
            class="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
          >
            Daftar
          </button>

          <!-- Modal Utama Pendaftaran -->
          <div
            data-modal-backdrop="static"
            id="registration-modal"
            tabindex="1"
            aria-hidden="true"
            class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
          >
            <div class="relative p-4 w-full max-w-md max-h-full">
              <!-- Isi Modal -->
              <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <!-- Header Modal -->
                <div
                  class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600"
                >
                  <h3
                    class="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    Pendaftaran Acara
                  </h3>
                  <button
                    type="button"
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-toggle="registration-modal"
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
                <!-- Isi Formulir Modal -->
                <form @submit.prevent="registerEvent" class="p-4 md:p-5">
                  <div class="grid gap-4 mb-4 grid-cols-2">
                    <div class="col-span-2">
                      <label
                        for="select-team"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Pilih Tim</label
                      >
                      <select
                        id="select-team"
                        required
                        v-model="selectedTeam"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option disabled value="">-- Pilih Tim --</option>
                        <template v-if="teams.length === 0">
                          <option disabled>Belum Ada Tim</option>
                        </template>
                        <option
                          v-for="team in teams"
                          :key="team.teamId"
                          :value="team"
                        >
                          {{ team.teamName }}
                        </option>
                      </select>
                    </div>
                    <div class="col-span-2">
                      <label
                        for="select-event"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Pilih Acara</label
                      >
                      <select
                        id="select-event"
                        required
                        v-model="selectedEvent"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option disabled value="">-- Pilih Acara --</option>
                        <option
                          v-for="event in events"
                          :key="event.eventId"
                          :value="event"
                        >
                          {{ event.eventName }}
                        </option>
                      </select>

                      <div class="col-span-2">
                        <label
                          for="judul"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-2"
                          >Judul</label
                        >
                        <small class="text-gray-500"
                          >*Note : Bisa di ubah sebelum pengumpulan
                          risalah</small
                        >
                        <input
                          type="text"
                          v-model="judul"
                          placeholder="Tuliskan judul disini"
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        />
                      </div>

                      <div class="mt-4 italic underline font-medium">
                        Tambah Anggota
                      </div>
                      <small class="text-gray-500 mb-4"
                        >*Note : untuk perubahan setelah di simpan hubungi
                        admin</small
                      >
                      <div
                        v-for="(member, index) in members"
                        :key="index"
                        class="mb-4"
                      >
                        <!-- Nama Anggota Full Width -->
                        <label
                          class="block text-sm font-medium text-gray-900 dark:text-white mt-2"
                        >
                          Nama Anggota
                        </label>
                        <input
                          v-model="member.memberName"
                          type="text"
                          required
                          placeholder="Nama Anggota"
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 mb-2"
                        />

                        <!-- Inline Input for NIP and Position -->
                        <div class="flex gap-2">
                          <!-- NIP Anggota -->
                          <div class="w-1/2">
                            <label
                              class="block text-sm font-medium text-gray-900 dark:text-white"
                            >
                              NIP
                            </label>
                            <input
                              v-model="member.nip"
                              type="text"
                              required
                              placeholder="23-0437"
                              :class="{
                                'border-red-500':
                                  member.nip && !validateNipFormat(member.nip),
                                'border-gray-300':
                                  !member.nip || validateNipFormat(member.nip),
                              }"
                              class="bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                            />

                            <!-- Pesan kesalahan jika NIP tidak valid -->
                            <span
                              v-if="
                                member.nip && !validateNipFormat(member.nip)
                              "
                              class="text-red-500 text-xs"
                            >
                              Format NIP tidak valid. Gunakan format xx-xxxx.
                            </span>
                          </div>

                          <!-- Posisi Anggota -->
                          <div class="w-1/2">
                            <label
                              class="block text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Posisi
                            </label>
                            <select
                              v-model="member.memberPosition"
                              required
                              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                            >
                              <option disabled value="">Pilih Posisi</option>
                              <option
                                v-for="position in getAvailablePositions(index)"
                                :key="position"
                                :value="position"
                              >
                                {{ position }}
                              </option>
                            </select>
                          </div>
                        </div>

                        <!-- Tombol Hapus Anggota -->
                        <button
                          type="button"
                          @click="removeMember(index)"
                          class="text-red-500 hover:text-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 rounded-lg text-sm px-2 py-1.5 mt-2"
                          v-if="members.length > 1"
                        >
                          Hapus
                        </button>
                      </div>

                      <button
                        type="button"
                        @click="addMember"
                        class="p-2 text-blue-500 hover:text-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm py-1.5"
                      >
                        Tambah Anggota
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    data-modal-toggle="registration-modal"
                    class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Simpan
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="p-4 border-2 border-gray-200 rounded-lg dark:border-gray-700 mt-2"
      >
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-2">
          <table
            class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
          >
            <caption>
              <h1 class="text-2xl font-semibold mb-2">Daftar Acara</h1>
            </caption>
            <thead
              class="text-xs text-gray-700 uppercase bg-gray-400 dark:bg-gray-700 dark:text-gray-400"
            >
              <tr>
                <th scope="col" class="px-6 py-3">No</th>
                <th scope="col" class="px-6 py-3">Tim</th>
                <th scope="col" class="px-6 py-3">Acara</th>
                <th scope="col" class="px-6 py-3">Tanggal</th>
                <th scope="col" class="px-6 py-3">Status</th>
                <th scope="col" class="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(register, index) in registrationList"
                :key="index"
                class="bg-white border-b-2 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <td class="px-6 py-4">{{ index + 1 }}</td>
                <th
                  scope="row"
                  class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {{ register.team.teamName }}
                </th>
                <td class="px-6 py-4">{{ register.event.eventName }}</td>
                <td class="px-6 py-4">{{ formatDate(register.createdAt) }}</td>
                <td class="px-6 py-4">{{ register.registrationStatus }}</td>
                <td class="px-6 py-4">
                  <router-link
                    :to="{
                      name: 'eventDetail',
                      params: { registrationId: register.registrationId },
                    }"
                    class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >Detail</router-link
                  >
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr v-if="!registrationList.length">
                <td colspan="7" class="p-4">
                  <center class="font-bold">Tidak Ada Data</center>
                </td>
              </tr>
            </tfoot>
          </table>
          <nav
            class="flex items-center flex-column flex-wrap p-4 md:flex-row justify-between pt-4"
            aria-label="Navigasi Tabel"
          >
            <span
              class="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto"
              >Menampilkan
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ (currentPage - 1) * pageSize + 1 }}
              </span>

              -
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ Math.min(currentPage * pageSize, totalElements) }}
              </span>
              dari
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ totalElements }}
              </span>
              <span class="ms-5">Halaman </span>
              <span class="font-semibold"> - {{ currentPage }}</span>
            </span>

            <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
              <li>
                <button
                  @click.prevent="changePageNumber(currentPage - 1)"
                  :disabled="currentPage === 1"
                  :class="{
                    'text-gray-500 border-gray-300': currentPage <= 0,
                  }"
                  class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Sebelumnya
                </button>
              </li>

              <template v-for="pageNumber in pageNumbers">
                <li>
                  <button
                    @click.prevent="changePageNumber(pageNumber)"
                    :class="[
                      'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
                      { 'bg-blue-200': pageNumber === currentPage },
                    ]"
                  >
                    {{ pageNumber }}
                  </button>
                </li>
              </template>
              <li>
                <button
                  @click.prevent="changePageNumber(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  :class="{
                    'text-gray-500 border-gray-300': currentPage === totalPages,
                  }"
                  class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Selanjutnya
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>

<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import SidebarWithNavbarVue from "../../components/SidebarWithNavbar.vue";
import { useStore } from "vuex";
import {
  calculatePageNumbers,
  handleSearch,
  changePage,
  holdPage,
  handleSuccess,
  handleError,
  isSidebarOpen,
  sidebarToggle,
} from "@/utils/utils";
import Spinner from "@/components/Spinner.vue";

const store = useStore();
const teamName = ref("");
const description = ref("");
const events = ref([]);
const user = ref();
const currentPage = ref(1);
const searchQuery = ref("");
const totalPages = ref(1);
const pageNumbers = ref([]);
const isLoading = ref(false);

const teams = ref([]);
const teamList = ref([]);

const currentDate = new Date();
const currentYear = currentDate.getFullYear().toString();
onMounted(() => {
  user.value = store.getters.getUserData;
  fetchTeam();
  getEvents();
  holdPage(currentPage);
});

const getEvents = () => {
  axios.get("/event/all").then((response) => {
    const filteredEvents = response.data.filter(
      (item) => item.eventYear === currentYear
    );

    events.value = filteredEvents.map((item) => item.event);
  });
};

const createTeam = async () => {
  const now = new Date();
  const teamData = {
    teamName: teamName.value,
    userId: user.value.id,
    description: description.value.trim(),
    createdAt: now.toISOString(),
  };

  try {
    const response = await axios.post("/team/create", teamData);
    handleSuccess("Tim Berhasil Dibuat");
    teamName.value = "";
    description.value = "";
    fetchTeam();
  } catch (error) {
    console.log("Error: " + error);
    handleError("Gagal Membuat Tim");
  }
};

const fetchTeam = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get("/team/with-member", {
      params: {
        page: currentPage.value,
        keyword: searchQuery.value,
        userId: user.value.id,
      },
    });

    const responses = await axios.get("/team/all");
    teams.value = response.data;
    teamList.value = responses.data.filter(
      (team) => team.userId === user.value.id
    );

    currentPage.value = response.data.currentPage;
    totalPages.value = response.data.totalPages;
    localStorage.setItem("currentPage", currentPage.value);
    console.log(teamList.value);
    console.log(teams.value);

    pageNumbers.value = calculatePageNumbers(
      currentPage.value ? currentPage.value : 0,
      totalPages.value
    );
    isLoading.value = false;
  } catch (error) {
    console.error("Gagal Mengambil Data Tim: " + error);
  }
};

const handleSearchInput = async () => {
  await handleSearch(searchQuery.value, fetchTeam);
};

const changePageNumber = async (pageNumber) => {
  currentPage.value = pageNumber;
  await changePage(pageNumber, fetchTeam);
};
</script>

<template>
  <SidebarWithNavbarVue @toggleSidebar="sidebarToggle"></SidebarWithNavbarVue>
  <Spinner v-if="isLoading"></Spinner>
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
      class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-14"
    >
      <h1 class="font-medium text-3xl p-6">Tim</h1>

      <div
        class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-5"
      >
        <div class="flex gap-4">
          <div class="flex gap-2">
            <!-- Modal toggle -->
            <button
              data-modal-target="create-team-modal"
              data-modal-toggle="create-team-modal"
              class="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              type="button"
            >
              Buat Tim
            </button>

            <!-- Create Team modal -->
            <div
              data-modal-backdrop="static"
              id="create-team-modal"
              tabindex="1"
              aria-hidden="true"
              class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
              <div class="relative p-4 w-full max-w-md max-h-full">
                <!-- Modal content -->
                <div
                  class="relative bg-white rounded-lg shadow dark:bg-gray-700"
                >
                  <!-- Modal header -->
                  <div
                    class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600"
                  >
                    <h3
                      class="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      Buat Tim Baru
                    </h3>
                    <button
                      type="button"
                      class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                      data-modal-toggle="create-team-modal"
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
                      <span class="sr-only">Tutup Modal</span>
                    </button>
                  </div>
                  <!-- Modal body -->
                  <form @submit.prevent="createTeam" class="p-4 md:p-5">
                    <div class="grid gap-4 mb-4 grid-cols-2">
                      <div class="col-span-2">
                        <label
                          for="name-event"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Nama Tim
                        </label>
                        <input
                          v-model="teamName"
                          @input="teamName = $event.target.value.toUpperCase()"
                          type="text"
                          name="name-event"
                          id="name-event"
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                          placeholder="Nama Tim"
                          required
                        />
                      </div>
                      <div class="col-span-2">
                        <label
                          for="name-event"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Deskripsi
                        </label>
                        <textarea
                          v-model="description"
                          type="text"
                          name="name-event"
                          id="name-event"
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                          placeholder="Tentang Tim (opsional)"
                          required
                        />
                      </div>
                    </div>
                    <button
                      data-modal-toggle="create-team-modal"
                      type="submit"
                      class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Simpan
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section class="flex flex-col mt-2 ms-1">
        <label for="search">Cari</label>
        <input
          id="search"
          v-model="searchQuery"
          type="text"
          @input="handleSearchInput()"
          placeholder="Cari Tim..."
          class="md:me-10 p-2 mt-2 border border-gray-300 rounded-md"
        />
      </section>

      <!-- Table -->
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-5">
        <table
          class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead
            class="text-xs text-gray-700 uppercase border-2 bg-gray-400 dark:bg-gray-700 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="px-6 py-3">No</th>
              <th scope="col" class="px-6 py-3">Nama Tim</th>
              <th scope="col" class="px-6 py-3">Tentang</th>
              <th scope="col" class="px-6 py-3">Created</th>
              <th scope="col" class="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(team, index) in teams.data"
              :key="index"
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td class="px-6 py-4">{{ index + 1 }}</td>
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {{ team.teamName }}
              </th>
              <td
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {{ team.description }}
              </td>
              <td
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {{ team.createdAt }}
              </td>
              <td class="px-6 py-4">
                <router-link
                  :to="{
                    name: 'teams-details',
                    params: { teamId: team.teamId },
                  }"
                  class="text-blue-600 font-medium rounded-sm hover:underline"
                >
                  Detail
                </router-link>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr v-if="teams.length < 1">
              <td
                colspan="4"
                class="font-semibold text-center align-middle px-6 py-4"
              >
                No Data
              </td>
            </tr>
          </tfoot>
        </table>
        <nav
          v-if="teamList.length > 1"
          class="flex items-center flex-column flex-wrap p-4 md:flex-row justify-between pt-4"
          aria-label="Table navigation"
        >
          <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
            <li>
              <button
                :disabled="currentPage === 1"
                @click.prevent="changePageNumber(currentPage - 1)"
                class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700"
              >
                Sebelumnya
              </button>
            </li>

            <template v-for="pageNumber in pageNumbers">
              <li>
                <button
                  @click.prevent="changePageNumber(pageNumber)"
                  :class="[
                    'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700',
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
                class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700"
              >
                Berikutnya
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<style></style>

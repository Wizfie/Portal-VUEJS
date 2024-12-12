<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import SidebarWithNavbarVue from "@/components/SidebarWithNavbar.vue";
import Spinner from "@/components/Spinner.vue";
import {
  calculatePageNumbers,
  handleSearch,
  changePage,
  holdPage,
  sidebarToggle,
  isSidebarOpen,
  handleSuccess,
  handleError,
  withLoading,
  handleConfirm,
  formatDate,
} from "@/utils/utils.js";
import NavButtonGroup from "@/components/NavButtonGroup.vue";

const userId = ref();
const role = ref(null);
const currentPage = ref();
const searchQuery = ref("");
const totalPages = ref(1);
const pageNumbers = ref([]);
const isLoading = ref(false);

const isEditing = ref(null);
const editedTeamName = ref("");
const editedDescription = ref("");
const editedCreatedAt = ref("");

const teams = ref([]);
const currentDate = new Date();
const currentYear = currentDate.getFullYear().toString();

onMounted(() => {
  const userData = localStorage.getItem("userData");
  if (userData) {
    const parseJson = JSON.parse(userData);
    userId.value = parseJson.id.toString();
    role.value = parseJson.role;
  }
  holdPage(currentPage);
  fetchTeam();
});

const startEdit = (team) => {
  isEditing.value = team.teamId;
  editedTeamName.value = team.teamName;
  editedDescription.value = team.description;
  editedCreatedAt.value = team.createdAt;
};

const saveEdit = async (teamId) => {
  const confirmed = await handleConfirm({
    title: "Are you sure?",
    text: "This action will update the team details.",
  });
  if (!confirmed) return;

  const updatedTeamData = {
    teamName: editedTeamName.value,
    description: editedDescription.value,
    createdAt: editedCreatedAt.value,
  };

  try {
    await axios.put(`/team/${teamId}`, updatedTeamData);
    handleSuccess("Success", "Team details updated successfully.");
    await fetchTeam(); // Refresh data
    isEditing.value = null; // Exit edit mode
  } catch (error) {
    console.error("Failed to update team:", error);
    handleError("Failed", "Could not update team details.");
  }
};

const cancelEdit = () => {
  isEditing.value = null;
};

const fetchTeam = async () => {
  await withLoading(async () => {
    const response = await axios.get("/team/with-member", {
      params: {
        page: currentPage.value,
        keyword: searchQuery.value,
        userId: "",
      },
    });

    teams.value = response.data;
    localStorage.setItem("currentPage", currentPage.value);

    currentPage.value = response.data.currentPage;
    totalPages.value = response.data.totalPages;
    pageNumbers.value = calculatePageNumbers(
      currentPage.value,
      totalPages.value
    );
  });
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
  <Spinner v-if="isLoading"></Spinner>
  <SidebarWithNavbarVue @toggleSidebar="sidebarToggle"></SidebarWithNavbarVue>
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
    <div
      class="p-4 border-2 mt-14 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700"
    >
      <div class="p-4 border-2 border-gray-200 rounded-lg items-center">
        <div class="sm:flex-col md:flex md:justify-between items-center">
          <div class="text-center mb-2">
            <span class="text-2xl font-bold text-gray-900">TIM</span>
          </div>
          <NavButtonGroup></NavButtonGroup>
        </div>
      </div>

      <section class="flex my-4 ms-2 items-center">
        <label for="search">Search :</label>
        <input
          class="w-1/2 mx-2 rounded-md"
          id="search"
          v-model="searchQuery"
          type="search"
          @input="handleSearchInput()"
          placeholder="Cari Tim..."
        />
      </section>

      <!-- table -->
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-5">
        <table
          class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead
            class="text-xs text-gray-700 uppercase border-2 bg-gray-400 dark:bg-gray-700 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="px-6 py-3">No</th>
              <th scope="col" class="px-6 py-3">Dept.</th>
              <th scope="col" class="px-6 py-3">Nama Tim</th>
              <th scope="col" class="px-6 py-3">Tentang</th>
              <th scope="col" class="px-6 py-3">Created</th>
              <th scope="col" class="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(team, index) in teams.data"
              :key="team.teamId"
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td class="px-6 py-4">{{ index + 1 }}</td>
              <td class="px-6 py-4">{{ team.username }}</td>

              <!-- Nama Tim -->
              <td v-if="isEditing !== team.teamId" class="px-6 py-4">
                {{ team.teamName }}
              </td>
              <td v-else class="px-6 py-4">
                <input
                  v-model="editedTeamName"
                  class="border rounded px-2 py-1 w-full"
                />
              </td>

              <!-- Deskripsi -->
              <td v-if="isEditing !== team.teamId" class="px-6 py-4">
                {{ team.description }}
              </td>
              <td v-else class="px-6 py-4">
                <input
                  v-model="editedDescription"
                  class="border rounded px-2 py-1 w-full"
                />
              </td>

              <!-- Created -->
              <td v-if="isEditing !== team.teamId" class="px-6 py-4">
                {{ formatDate(team.createdAt) }}
              </td>
              <td v-else class="px-6 py-4">
                <input
                  type="date"
                  v-model="editedCreatedAt"
                  class="border rounded px-2 py-1 w-full"
                />
              </td>

              <!-- Aksi -->
              <td class="px-6 py-4">
                <!-- Tombol Detail Selalu Tampil -->
                <router-link
                  v-if="!isEditing"
                  :to="{
                    name: 'teams-details',
                    params: { teamId: team.teamId },
                  }"
                  class="text-blue-600 font-medium rounded-sm hover:underline"
                >
                  Detail
                </router-link>
                <span v-if="!isEditing" class="mx-2">|</span>
                <!-- Tombol Edit, Save, dan Cancel -->
                <span v-if="isEditing !== team.teamId">
                  <button
                    @click="startEdit(team)"
                    class="text-blue-600 font-medium ml-2 hover:underline"
                  >
                    Edit
                  </button>
                </span>
                <span v-else>
                  <button
                    @click="saveEdit(team.teamId)"
                    class="bg-green-500 rounded-md text-white px-2 py-1"
                  >
                    Save
                  </button>
                  <button
                    @click="cancelEdit"
                    class="bg-red-500 px-2 py-1 rounded-md text-white ml-2"
                  >
                    Cancel
                  </button>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style></style>

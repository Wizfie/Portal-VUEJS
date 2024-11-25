<script setup>
import { onMounted, ref } from "vue";
import SiddebarWithNavbar from "../../components/SidebarWithNavbar.vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import axios from "axios";
import { initFlowbite } from "flowbite";
import Spinner from "@/components/Spinner.vue";
import router from "@/router/router";
import {
  sidebarToggle,
  isSidebarOpen,
  handleConfirm,
  handleSuccess,
  handleError,
  withLoading,
} from "@/utils/utils";

const route = useRoute();
const store = useStore();
const isLoading = ref(false);
const user = ref("");
const teams = ref([]);
const teamId = ref(null);
const token = ref("");
const selectedMember = ref({});
const showUpdateModal = ref(false);
const showAddMemberForm = ref(null);
const newMember = ref({
  memberName: "",
  memberPosition: "",
  teamId: teamId.value,
  eventId: null,
});

const positions = ref([
  "Pemimpin Circle",
  "Pemimpin Tema",
  "Penasehat",
  "Notulen",
  "Fasilitator",
  "Anggota",
]);

onMounted(() => {
  user.value = store.getters.getUserData;
  token.value = store.getters.getAuthToken;
  teamId.value = route.params.teamId;
  initFlowbite();
  fetchMemberById();
});

const toggleUpdateModal = (member) => {
  selectedMember.value = member;
  showUpdateModal.value = !showUpdateModal.value;
};

const closeUpdateModal = () => {
  showUpdateModal.value = false;
  fetchMemberById();
};

const toggleAddMemberForm = (teamId, eventId) => {
  newMember.value.teamId = teamId;
  newMember.value.eventId = eventId;
  showAddMemberForm.value =
    showAddMemberForm.value === eventId ? null : eventId;
};

const fetchMemberById = async () => {
  await withLoading(async () => {
    try {
      const response = await axios.get(`/team/${teamId.value}`);
      teams.value = response.data;
    } catch (error) {
      console.error("Gagal Mengambil Data Tim: " + error);
      handleError("Gagal Mengambil Data", "Data tim tidak dapat diambil.");
    }
  });
};

const addMember = async () => {
  if (
    await handleConfirm({
      title: "Tambah Anggota?",
      text: "Apakah Anda yakin ingin menambah anggota ini?",
    })
  ) {
    await withLoading(async () => {
      try {
        await axios.post("/member/create", newMember.value);
        handleSuccess("Anggota berhasil ditambahkan");
        fetchMemberById();
        newMember.value = {
          memberName: "",
          memberPosition: "",
          nip: "",
          teamId: teamId.value,
          eventId: null,
        };
        showAddMemberForm.value = null;
      } catch (error) {
        console.error("Gagal Menambah Anggota: " + error);
        handleError(
          "Gagal Menambah Anggota",
          "Anggota tidak dapat ditambahkan."
        );
      }
    });
  }
};

const editMember = async () => {
  if (
    await handleConfirm({
      title: "Perbarui Anggota?",
      text: "Apakah Anda yakin ingin memperbarui data anggota ini?",
    })
  ) {
    await withLoading(async () => {
      try {
        const member = {
          memberName: selectedMember.value.memberName,
          memberPosition: selectedMember.value.memberPosition,
          nip: selectedMember.value.nip,
        };
        await axios.put(`member/${selectedMember.value.teamMemberId}`, member);
        handleSuccess("Anggota berhasil diperbarui");
        closeUpdateModal();
      } catch (error) {
        console.error("Error Perbarui Anggota: " + error);
        handleError(
          "Gagal Memperbarui Anggota",
          "Data anggota tidak dapat diperbarui."
        );
      }
    });
  }
};

const deleteMember = async (memberId) => {
  if (
    await handleConfirm({
      title: "Hapus Anggota?",
      text: "Apakah Anda yakin ingin menghapus anggota ini?",
    })
  ) {
    await withLoading(async () => {
      try {
        await axios.delete(`/member/${memberId}`);
        handleSuccess("Anggota berhasil dihapus");
        fetchMemberById();
      } catch (error) {
        console.error("Error Hapus Anggota: " + error);
        handleError("Gagal Menghapus Anggota", "Anggota tidak dapat dihapus.");
      }
    });
  }
};
</script>

<template>
  <div>
    <Spinner v-if="isLoading"></Spinner>
    <SiddebarWithNavbar @toggleSidebar="sidebarToggle"></SiddebarWithNavbar>
    <section
      id="header"
      :class="{
        'sm:ml-64': isSidebarOpen,
        'ml-0': !isSidebarOpen,
        'p-4': true,
        'transition-all': true,
        'ease-in-out': true,
        'duration-700': true,
      }"
    >
      <header
        class="flex justify-between items-center p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-14"
      >
        <h1>Detail Tim</h1>
        <button
          @click="router.back()"
          class="p-2 bg-gray-900 hover:bg-gray-600 cursor-pointer text-white rounded"
        >
          Kembali
        </button>
      </header>
      <main>
        <section
          id="card-member"
          class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-4"
        >
          <div class="md:flex md:flex-col gap-2">
            <div
              v-for="(event, eventIndex) in teams.teamEvent"
              :key="eventIndex"
              class="w-full max-w-xl p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
            >
              <div class="flex items-center justify-between mb-4">
                <h5
                  class="text-xl font-bold leading-none text-gray-900 dark:text-white"
                >
                  {{ teams.teamName }}
                </h5>
                <p
                  class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  {{ event.eventName }}
                </p>
              </div>
              <div class="flow-root">
                <ul
                  role="list"
                  class="divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <template
                    v-for="(member, index) in event.members"
                    :key="index"
                  >
                    <li class="py-1 sm:py-2">
                      <div class="flex items-center">
                        <div class="flex-1 min-w-5 ms-4">
                          <div class="flex justify-between items-center gap-1">
                            <p
                              class="text-md font-medium text-gray-900 truncate dark:text-white"
                            >
                              {{ member.memberName }}
                              <span>({{ member.nip }})</span>
                            </p>
                            <span
                              v-if="user.role !== 'ADMIN'"
                              class="text-sm text-gray-500 truncate text-right items-end dark:text-gray-400"
                            >
                              {{ member.memberPosition }}
                            </span>
                          </div>

                          <p
                            v-if="user.role === 'ADMIN'"
                            class="text-sm text-gray-500 truncate dark:text-gray-400"
                          >
                            {{ member.memberPosition }}
                          </p>
                        </div>
                        <div
                          class="flex flex-col mt-2 mb-2 items-center gap-1 text-base font-semibold text-gray-900 dark:text-white"
                        >
                          <button
                            v-if="user.role === 'ADMIN'"
                            @click="toggleUpdateModal(member)"
                            class="block w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            v-if="user.role === 'ADMIN'"
                            @click="deleteMember(member.teamMemberId)"
                            class="block w-full text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </li>
                  </template>
                </ul>
              </div>

              <!-- Tombol Tambah Anggota -->
              <button
                v-if="user.role === 'ADMIN'"
                @click="toggleAddMemberForm(teams.teamId, event.eventId)"
                class="mt-2 block w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700"
              >
                Tambah Anggota
              </button>

              <!-- Form Tambah Anggota (Hanya Tampil Jika Tombol Diklik) -->
              <div v-if="showAddMemberForm === event.eventId" class="mt-4">
                <form @submit.prevent="addMember" class="space-y-4">
                  <div>
                    <label
                      for="newMemberName"
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Nama</label
                    >
                    <input
                      v-model="newMember.memberName"
                      type="text"
                      id="newMemberName"
                      placeholder="username"
                      class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label
                      for="newMemberNip"
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Nip</label
                    >
                    <input
                      v-model="newMember.nip"
                      type="text"
                      id="newMemberNip"
                      placeholder="23-1111"
                      class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label
                      for="newMemberPosition"
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >Posisi</label
                    >
                    <select
                      v-model="newMember.memberPosition"
                      id="newMemberPosition"
                      class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      required
                    >
                      <option value="" disabled>Pilih Posisi</option>
                      <option
                        v-for="position in positions"
                        :key="position"
                        :value="position"
                      >
                        {{ position }}
                      </option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Tambah
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </section>

    <!-- Modal Edit Anggota -->
    <div
      v-if="showUpdateModal"
      id="update-modal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="relative p-4 bg-white w-full max-w-md max-h-full rounded-lg shadow dark:bg-gray-700"
      >
        <div
          class="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600"
        >
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Data
          </h3>
          <button
            @click="closeUpdateModal"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <svg
              class="w-3 h-3"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13"
              />
            </svg>
          </button>
        </div>
        <div class="p-4 md:p-5">
          <!-- Form Edit Anggota dalam Modal -->
          <form @submit.prevent="editMember" class="space-y-4">
            <div>
              <label
                for="name"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Nama</label
              >
              <input
                v-model="selectedMember.memberName"
                type="text"
                name="name"
                id="name"
                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                required
              />
            </div>
            <div>
              <label
                for="nip"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Nama</label
              >
              <input
                v-model="selectedMember.nip"
                type="text"
                name="name"
                id="name"
                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                required
              />
            </div>
            <div>
              <label
                for="position"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Posisi</label
              >
              <select
                v-model="selectedMember.memberPosition"
                name="position"
                id="position"
                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                required
              >
                <option value="" disabled>Pilih Posisi</option>
                <option
                  v-for="position in positions"
                  :key="position"
                  :value="position"
                >
                  {{ position }}
                </option>
              </select>
            </div>
            <button
              type="submit"
              class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Perbarui
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
#update-modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>

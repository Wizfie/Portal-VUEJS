<script setup>
import { onMounted, ref, computed } from "vue";
import SiddebarWithNavbar from "../../components/SidebarWithNavbar.vue";
import { useStore } from "vuex";
import axios from "axios";
import Spinner from "@/components/Spinner.vue";
import {
  downloadFile,
  isLoading,
  sidebarToggle,
  isSidebarOpen,
  handleSearch,
  changePage,
  calculatePageNumbers,
} from "@/utils/utils";

const store = useStore();
const userData = ref("");
const history = ref([]);
const selectedDetail = ref(null);
const currentPage = ref(1);
const filterKeyword = ref();
const totalPages = ref(null);
const pageSize = ref(null);
const totalElements = ref(null);

onMounted(() => {
  userData.value = store.getters.getUserData;
  getHistory();
});

const getHistory = async () => {
  const response = await axios.get("/registration/history", {
    params: {
      page: currentPage.value,
      search: filterKeyword.value,
    },
  });
  // history.value = calculateRanks(response.data);
  history.value = response.data.data;
  currentPage.value = response.data.currentPage;
  totalPages.value = response.data.totalPages;
  pageSize.value = response.data.pageSize;
  totalElements.value = response.data.totalElements;
  console.log(history.value);
  console.log(currentPage.value);
  console.log(pageSize.value);
  console.log(totalElements.value);
};

const showDetails = (item) => {
  selectedDetail.value = item;
  console.log(selectedDetail.value);
};

const closeDetails = () => {
  selectedDetail.value = null; // Reset detail item
};

const changePageNumber = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage;
    changePage(newPage, getHistory);
  }
};

const pageNumbers = computed(() => {
  return calculatePageNumbers(currentPage.value, totalPages.value);
});
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
        class="border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-14"
      >
        <h1 class="p-4">HISTORY</h1>
      </div>
      <div
        v-if="!selectedDetail"
        class="flex items-center gap-2 ms-2 mb-2 mt-2 sm:mb-0"
      >
        <label
          for="filterKeyword"
          class="text-sm font-medium text-gray-900 dark:text-white"
          >Cari:</label
        >
        <input
          v-model.trim="filterKeyword"
          @input="handleSearch(filterKeyword, getHistory)"
          id="filterKeyword"
          type="search"
          class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 sm:w-auto text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Dept / Tim / Acara "
        />
      </div>
      <!-- Table Registration -->
      <section id="table-list-registration" v-if="!selectedDetail">
        <div
          class="relative overflow-x-auto overflow-y-auto h-max[500px] shadow-md sm:rounded-lg mt-4 mb-4"
        >
          <table
            class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
          >
            <thead
              class="text-xs text-gray-700 uppercase bg-gray-400 dark:bg-gray-700 dark:text-gray-400"
            >
              <tr>
                <th scope="col" class="px-6 py-3">No.</th>
                <th scope="col" class="px-6 py-3">Departemen</th>
                <th scope="col" class="px-6 py-3">Tim</th>
                <th scope="col" class="px-6 py-3">Acara</th>
                <th scope="col" class="px-6 py-3">Judul</th>
                <th scope="col" class="px-6 py-3">Peringkat</th>
                <th scope="col" class="px-6 py-3">Risalah</th>
                <!-- <th scope="col" class="px-6 py-3">Status</th> -->
                <th scope="col" class="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                v-for="(item, index) in history"
                :key="item.registrationId"
              >
                <td class="px-6 py-4">{{ index + 1 }}</td>
                <th
                  scope="row"
                  class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {{ item.username }}
                </th>
                <td class="px-6 py-4">{{ item.team.teamName }}</td>
                <td class="px-6 py-4">{{ item.event.eventName }}</td>
                <td class="px-6 py-4 text-wrap w-max-sm">{{ item.judul }}</td>
                <td class="px-6 py-4 text-wrap w-max-sm">{{ item.rank }}</td>
                <td class="px-6 py-4">
                  <ul>
                    <li
                      v-for="(fileName, index) in item.fileNames"
                      :key="index"
                    >
                      <div class="flex flex-col">
                        <a
                          class="cursor-pointer font-medium truncate hover:text-blue-900 hover:underline mb-2"
                          @click="downloadFile(fileName)"
                        >
                          <span v-if="fileName > 1"> {{ index + 1 }}. </span>
                          {{ fileName }}</a
                        >
                      </div>
                    </li>
                  </ul>
                </td>

                <td class="px-6 py-4">
                  <a
                    @click.prevent="showDetails(item)"
                    href="#"
                    class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >Details</a
                  >
                </td>
              </tr>
            </tbody>
            <tfoot v-if="history.length == 0">
              <tr>
                <td colspan="9" class="p-3 text-center">Tidak Ada Data</td>
              </tr>
            </tfoot>
          </table>
          <nav
            class="flex items-center flex-column flex-wrap p-4 md:flex-row justify-between pt-4"
            aria-label="Navigasi Tabel"
          >
            <span
              class="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto"
            >
              Menampilkan
              <span class="font-semibold text-gray-900 dark:text-white">{{
                (currentPage - 1) * pageSize + 1
              }}</span>
              -
              <span class="font-semibold text-gray-900 dark:text-white">{{
                Math.min(currentPage * pageSize, totalElements)
              }}</span>
              dari
              <span class="font-semibold text-gray-900 dark:text-white">{{
                totalElements
              }}</span>
              <span class="ms-5">Halaman </span>
              <span class="font-semibold"> - {{ currentPage }}</span>
            </span>

            <ul class="inline-flex -space-x-px rtl:space-x-reverse">
              <!-- Tombol Sebelumnya -->
              <li>
                <a
                  :disabled="currentPage === 1"
                  @click.prevent="changePageNumber(currentPage - 1)"
                  :class="{
                    'text-gray-500 border-gray-300 cursor-not-allowed opacity-50 pointer-events-none':
                      currentPage === 1,
                  }"
                  class="flex items-center justify-center px-2 py-1 cursor-pointer text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Sebelumnya
                </a>
              </li>

              <!-- Halaman yang dapat diklik -->
              <template v-for="pageNumber in pageNumbers">
                <li>
                  <a
                    @click.prevent="changePageNumber(pageNumber)"
                    :class="[
                      'flex items-center justify-center px-2 py-1 cursor-pointer text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
                      { 'bg-blue-200 text-white': pageNumber === currentPage },
                    ]"
                  >
                    {{ pageNumber }}
                  </a>
                </li>
              </template>

              <!-- Tombol Selanjutnya -->
              <li>
                <a
                  @click.prevent="changePageNumber(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  :class="{
                    'text-gray-500 border-gray-300 cursor-not-allowed opacity-50 pointer-events-none':
                      currentPage === totalPages,
                  }"
                  class="flex items-center justify-center px-2 py-1 cursor-pointer text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Selanjutnya
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      <!-- Bagian detail yang akan tampil jika item diklik -->
      <section id="details-list" v-if="selectedDetail">
        <div
          class="relative block w-full md:w-1/2 h-fit p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 mt-4"
        >
          <button
            @click="closeDetails"
            class="absolute top-2 right-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-1 focus:outline-none rounded"
          >
            &times;
          </button>
          <h5
            class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2"
          >
            {{ selectedDetail.judul }}
          </h5>
          <small>{{ selectedDetail.username }}</small>
          <hr style="border-top: 1px solid" />
          <div class="flex flex-col md:flex-row justify-between gap-4 mt-2">
            <div>
              <strong>Nama Tim :</strong> {{ selectedDetail.team.teamName }}
              <br />
              <strong>Dibuat :</strong>
              {{ selectedDetail.team.createdAt }}
              <br />

              <ul>
                <strong>Anggota:</strong>
                <li
                  v-for="(member, index) in selectedDetail.team.members"
                  :key="member.teamMemberId"
                >
                  <p>
                    {{ index + 1 }}.
                    <span class="font-bold">
                      {{ member.memberName }}
                    </span>
                    <span class=""> ({{ member.nip }})</span> |<span
                      class="font-semibold ms-2"
                    >
                      {{ member.memberPosition }}
                    </span>
                  </p>
                </li>
              </ul>
            </div>
            <div>
              <strong>Acara:</strong> {{ selectedDetail.event.eventName }}
              <br />
              <strong>Status:</strong> {{ selectedDetail.registrationStatus }}
              <br />
              <strong>Peringkat:</strong> {{ selectedDetail.rank }}
              <br />
              <strong>Skor Akhir:</strong>
              {{
                selectedDetail.finalScore
                  ? selectedDetail.finalScore.toFixed(2)
                  : "N/A"
              }}<br />
            </div>
            <div>
              <strong>Event:</strong> {{ selectedDetail.event.eventName }}
              <br />
              <strong>Status:</strong> {{ selectedDetail.registrationStatus }}
              <br />
              <strong>Ranking:</strong> {{ selectedDetail.rank }}
              <br />
              <strong>Final Score:</strong>
              {{
                selectedDetail.finalScore
                  ? selectedDetail.finalScore.toFixed(2)
                  : "N/A"
              }}<br />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
button {
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:focus {
  outline: none;
}
</style>

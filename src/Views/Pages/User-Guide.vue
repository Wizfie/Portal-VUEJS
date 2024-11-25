<script setup>
import { onMounted, ref } from "vue";
import SiddebarWithNavbar from "../../components/SidebarWithNavbar.vue";
import { useStore } from "vuex";
import axios from "axios";
import Spinner from "@/components/Spinner.vue";
import { isSidebarOpen, sidebarToggle, withLoading } from "@/utils/utils";

const store = useStore();
const userData = ref("");
const fileList = ref([]);

onMounted(() => {
  userData.value = store.getters.getUserData;
  getUserGuide();
});

const getUserGuide = () => {
  try {
    withLoading(async () => {
      const res = await axios.get("/file/userguide");
      console.log(res.data);
      fileList.value = res.data;
    });
  } catch (error) {
    console.error("failde get file " + error);
  }
};

const openOrDownloadFile = async (fileName, action) => {
  try {
    const response = await axios.get(`/file/userguide/open/${fileName}`, {
      responseType: "blob", // Mendapatkan data sebagai blob
    });

    // Buat URL dari Blob
    const file = new Blob([response.data], { type: "application/pdf" }); // Tentukan tipe PDF
    const fileURL = window.URL.createObjectURL(file);

    if (action === "open") {
      // Membuka file di tab baru
      window.open(fileURL, "_blank");
    } else if (action === "download") {
      // Membuat elemen <a> untuk unduh
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // Nama file yang diunduh
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  } catch (error) {
    console.error("Failed to open or download file: ", error);
  }
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
        class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-14"
      >
        <p class="font-semibold">USER GUIDE</p>
      </div>
      <section class="py-4">
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table
            class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
          >
            <thead
              class="text-xs text-gray-700 uppercase bg-gray-400 dark:bg-gray-700 dark:text-gray-400"
            >
              <tr>
                <th scope="col" class="px-6 py-3">file name</th>
                <th scope="col" class="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(file, index) in fileList"
                :key="index"
                class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
              >
                <td class="px-6 py-4">{{ file }}</td>
                <td class="px-6 py-4">
                  <button
                    @click="openOrDownloadFile(file, 'open')"
                    class="text-blue-500 hover:underline"
                  >
                    Open
                  </button>
                  <!-- | -->
                  <!-- <button
                    @click="openOrDownloadFile(file, 'download')"
                    class="text-green-500 hover:underline"
                  >
                    Download
                  </button> -->
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style></style>

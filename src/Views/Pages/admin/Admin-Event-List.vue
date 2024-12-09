<script setup>
import { onMounted, ref, computed } from "vue";
import SiddebarWithNavbar from "@/components/SidebarWithNavbar.vue";
import { useStore } from "vuex";
import axios from "axios";
import Spinner from "@/components/Spinner.vue";
import {
  withLoading,
  handleError,
  handleSuccess,
  handleConfirm,
  sidebarToggle,
  isSidebarOpen,
  sendEmail,
  emailEvent,
  getEmailCc,
  ccEmail,
} from "@/utils/utils";

const store = useStore();
const user = ref("");
const token = ref("");
const eventsList = ref([]);
const showCreate = ref(false);
let selectedEvent = ref(null);
const isEditMode = ref(false);
const originalSteps = ref([]);
const userList = ref([]);
const newEvent = ref({
  eventName: "",
  eventType: "",
  eventYear: "",
  steps: [],
});

const staticSteps = [
  {
    stepName: "Pengumpulan Risalah Final",
    startDate: "",
    endDate: "",
    berkas: true,
  },
  { stepName: "Penjurian Lapangan", startDate: "", endDate: "", berkas: false },
  {
    stepName: "Penjurian Presentasi",
    startDate: "",
    endDate: "",
    berkas: false,
  },
  { stepName: "Awarding", startDate: "", endDate: "", berkas: false },
];

onMounted(() => {
  user.value = store.getters.getUserData;
  token.value = store.getters.getAuthToken;
  getEvents();
  getUsers();
});

const getUsers = async () => {
  try {
    const res = await axios.get("/auth/users", {
      headers: {
        Authorization: "Bearer " + token.value,
      },
      params: { role: "USER" },
    });
    userList.value = res.data.data;
  } catch (error) {
    console.error("Failed to get users: " + error);
  }
};

const isStaticStep = (step) => {
  return staticSteps.some(
    (staticStep) => staticStep.stepName === step.stepName
  );
};

const enableEditModeEvent = (event) => {
  event.isEditModeEvent = true;
};

const saveEventChanges = async (event) => {
  const updatedEventData = {
    eventId: event.eventId,
    eventName: event.eventName,
    eventYear: event.eventYear,
    eventType: event.eventType,
  };

  await withLoading(async () => {
    try {
      await axios.put(
        `/event/update/${updatedEventData.eventId}`,
        updatedEventData
      );
      handleSuccess("Event updated successfully");
      event.isEditModeEvent = false; // Nonaktifkan mode edit untuk event ini
      getEvents(); // Refresh list to ensure data consistency
    } catch (error) {
      handleError("Failed to update event: " + error.message);
    }
  });
};

const cancelEditEvent = (event) => {
  event.isEditModeEvent = false;
  getEvents();
};

const deleteEvent = async (eventId) => {
  try {
    // Konfirmasi sebelum menghapus
    const isConfirmed = await handleConfirm({
      title: "Are you sure?",
      text: "This will delete the event and all related steps. This action cannot be undone.",
    });

    if (!isConfirmed) return;

    // Hapus event dengan satu panggilan ke backend
    await axios.delete(`/event/delete/${eventId}`);
    handleSuccess("Event and all related steps deleted successfully");

    // Memperbarui daftar event
    getEvents();
  } catch (error) {
    handleError("Failed to delete event: " + error.message);
  }
};

const addOneDay = (date) => {
  if (!date) return null;
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1);
  return newDate.toISOString().split("T")[0];
};

const getEvents = () => {
  withLoading(async () => {
    const res = await axios.get("/event/all");
    eventsList.value = res.data;
  });
};

const stepsList = computed(() => {
  if (isEditMode.value) {
    // Jika dalam mode edit, jangan urutkan ulang
    return selectedEvent.value.steps.slice();
  } else {
    return selectedEvent.value.steps.slice().sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateA - dateB;
    });
  }
});

const showEventDetails = (event) => {
  selectedEvent.value = { ...event };
  originalSteps.value = JSON.parse(JSON.stringify(event.steps));
  isEditMode.value = false;
};

const toggleCreate = () => {
  showCreate.value = !showCreate.value;
  selectedEvent.value = null;
};

const hideEventDetails = () => {
  selectedEvent.value = null;
};

const enableEditMode = () => {
  isEditMode.value = true;
};

const cancelEdit = () => {
  isEditMode.value = false;
  selectedEvent.value.steps = JSON.parse(JSON.stringify(originalSteps.value));
};

const validateSteps = (steps) => {
  for (let i = 0; i < steps.length; i++) {
    const currentStep = steps[i];
    const nextStep = steps[i + 1];

    // Validasi bahwa End Date tidak boleh kurang dari Start Date di setiap langkah
    if (new Date(currentStep.endDate) < new Date(currentStep.startDate)) {
      handleError(
        `End Date pada "${currentStep.stepName}" harus setelah Start Date.`
      );
      return false;
    }

    if (
      nextStep &&
      new Date(nextStep.startDate) < addOneDay(currentStep.endDate)
    ) {
      handleError(
        `Start Date pada "${nextStep.stepName}" harus minimal H+1 setelah End Date "${currentStep.stepName}".`
      );
      return false;
    }
  }
  return true;
};

const createEvent = async () => {
  const steps = [...newEvent.value.steps, ...staticSteps].map((step) => ({
    stepName: step.stepName,
    startDate: step.startDate,
    endDate: step.endDate,
    berkas: step.berkas.toString(),
  }));

  if (!validateSteps(steps)) {
    return;
  }

  const eventData = {
    event: {
      eventName: newEvent.value.eventName,
      eventType: newEvent.value.eventType,
      eventYear: newEvent.value.eventYear,
    },
    steps: steps,
  };

  await withLoading(async () => {
    try {
      // Buat event di backend
      await axios.post("/event/create", eventData);
      handleSuccess("Event and steps created successfully");
      toggleCreate();

      // Generate konten email
      const emailContent = await emailEvent(eventData);

      const toEmails = userList.value
        .map((user) => user.email)
        .filter((email) => email);

      await getEmailCc("LEADER", null);

      // Kirim email ke backend
      const mailRequest = {
        to: toEmails,
        cc: ccEmail.value,
        bcc: [user.value.email],
        subject: `Undangan Partisipasi Program ${eventData.event.eventName}`,
        text: emailContent,
      };

      await sendEmail(mailRequest);
      getEvents();
    } catch (error) {
      if (error.response) {
        handleError(error.response.data);
      } else if (error.request) {
        handleError("Server did not respond. Please try again.");
      } else {
        handleError("An unexpected error occurred: " + error.message);
      }
    }
  });
};

const updateSteps = async () => {
  await withLoading(async () => {
    try {
      await axios.post(
        `/step/addOrUpdate/${selectedEvent.value.eventId}`,
        selectedEvent.value.steps
      );
      handleSuccess("All steps updated successfully");
      isEditMode.value = false;
      getEvents();
      selectedEvent.value = null;
    } catch (error) {
      handleError(error);
    }
  });
};

const addStep = () => {
  selectedEvent.value.steps.push({
    stepId: null,
    stepName: "",
    startDate: "",
    endDate: "",
    berkas: "false",
  });
};

const deleteStep = async (index, stepId) => {
  try {
    const isConfirmed = await handleConfirm({
      title: "Are you sure?",
      text: "Do you really want to delete this step?",
    });

    if (isConfirmed) {
      if (stepId) {
        await axios.delete(`/step/delete/${stepId}`);
        handleSuccess("Step deleted successfully");
      }
    }
  } catch (error) {
    handleError("Failed to delete step", error.message);
    console.error(error.message);
  } finally {
    selectedEvent.value.steps.splice(index, 1);
    isEditMode.value = false;
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
      <!-- Main Event List Table -->
      <div v-if="!showCreate && !selectedEvent">
        <div
          class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-14"
        >
          <div class="flex justify-between items-center">
            <h1 class="font-semibold text-xl">Event List</h1>
            <button @click="toggleCreate" class="bg-blue-400 rounded-md p-3">
              Buat Event
            </button>
          </div>
        </div>

        <section class="py-2">
          <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table
              class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
            >
              <thead class="text-xs text-gray-700 uppercase bg-gray-400">
                <tr>
                  <th scope="col" class="px-6 py-3">No</th>
                  <th scope="col" class="px-6 py-3">Name</th>
                  <th scope="col" class="px-6 py-3">Event type</th>
                  <th scope="col" class="px-6 py-3">Year</th>
                  <th scope="col" class="px-6 py-3">Details</th>
                  <th scope="col" class="px-6 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(event, index) in eventsList"
                  :key="event.eventId"
                  class="odd:bg-white even:bg-gray-50 border-b"
                >
                  <td class="px-6 py-4">{{ index + 1 }}</td>

                  <!-- Editable Event Name -->
                  <td class="px-6 py-4">
                    <input
                      v-if="event.isEditModeEvent"
                      v-model="event.eventName"
                      class="border rounded px-2 py-1 w-full"
                      placeholder="Event Name"
                    />
                    <span v-else>{{ event.eventName }}</span>
                  </td>

                  <!-- Editable Event Type -->
                  <td class="px-6 py-4">
                    <select
                      v-if="event.isEditModeEvent"
                      v-model="event.eventType"
                      class="border rounded px-2 py-1 w-full"
                    >
                      <option value="QCC">QCC</option>
                      <option value="SS">SS</option>
                    </select>
                    <span v-else>{{ event.eventType }}</span>
                  </td>

                  <!-- Editable Event Year -->
                  <td class="px-6 py-4">
                    <input
                      v-if="event.isEditModeEvent"
                      v-model="event.eventYear"
                      type="number"
                      class="border rounded px-2 py-1 w-full"
                      placeholder="Year"
                      min="1000"
                      max="9999"
                    />
                    <span v-else>{{ event.eventYear }}</span>
                  </td>

                  <td class="px-6 py-4">
                    <button @click="showEventDetails(event)">Show Steps</button>
                  </td>

                  <!-- Edit, Save, and Cancel Buttons -->
                  <td class="px-6 py-4">
                    <button
                      v-if="!event.isEditModeEvent"
                      class="bg-blue-400 rounded-md p-2 text-white"
                      @click="enableEditModeEvent(event)"
                    >
                      Edit
                    </button>
                    <button
                      v-if="event.isEditModeEvent"
                      class="bg-green-400 rounded-md p-2 text-white"
                      @click="saveEventChanges(event)"
                    >
                      Save
                    </button>
                    <button
                      v-if="event.isEditModeEvent"
                      class="bg-gray-400 rounded-md p-2 text-white ml-2"
                      @click="cancelEditEvent(event)"
                    >
                      Cancel
                    </button>
                    <button
                      v-if="event.isEditModeEvent"
                      class="bg-red-400 rounded-md p-2 text-white ml-2"
                      @click="deleteEvent(event.eventId)"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>

              <tfoot>
                <tr v-if="!eventsList">
                  <td colspan="6" class="text-center py-4">No Data</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>

      <!-- Create Event Form -->
      <section
        v-if="showCreate"
        class="p-4 border-2 border-gray-200 rounded-lg dark:border-gray-700 mt-14"
      >
        <h1 class="font-semibold text-xl mb-4">Create New Event</h1>

        <!-- Event Details Input -->
        <div class="flex items-center space-x-4 mb-4">
          <div class="flex items-center">
            <label class="text-sm font-medium text-gray-700 mr-2"
              >Event Name</label
            >
            <input
              v-model="newEvent.eventName"
              type="text"
              class="border rounded px-3 py-1"
              placeholder="Event name"
            />
          </div>
          <div class="flex items-center">
            <label class="text-sm font-medium text-gray-700 mr-2"
              >Event Type</label
            >
            <select
              v-model="newEvent.eventType"
              class="border rounded px-3 py-1"
            >
              <option value="" disabled selected>Select Event Type</option>
              <option value="QCC">QCC</option>
              <option value="SS">SS</option>
            </select>
          </div>
          <div class="flex items-center">
            <label class="text-sm font-medium text-gray-700 mr-2"
              >Event Year</label
            >
            <input
              v-model="newEvent.eventYear"
              type="number"
              class="border rounded px-3 py-1"
              placeholder="Year"
              min="1000"
              max="9999"
            />
          </div>
        </div>

        <!-- Dynamic Steps -->
        <div
          v-for="(step, index) in newEvent.steps"
          :key="`dynamic-${index}`"
          class="flex items-center space-x-4 mb-2"
        >
          <span class="font-semibold text-sm">Step {{ index + 1 }}:</span>
          <div class="flex items-center w-1/2">
            <label class="text-sm font-medium text-gray-700 mr-2"
              >Step Name</label
            >
            <input
              v-model="step.stepName"
              type="text"
              class="border rounded px-2 py-1 w-full"
              placeholder="Step name"
            />
          </div>
          <div class="flex items-center">
            <label class="text-sm font-medium text-gray-700 mr-2"
              >Start Date</label
            >
            <input
              v-model="step.startDate"
              type="date"
              class="border rounded px-2 py-1"
              :min="
                index === 0
                  ? null
                  : addOneDay(newEvent.steps[index - 1].endDate)
              "
            />
          </div>
          <div class="flex items-center">
            <label class="text-sm font-medium text-gray-700 mr-2"
              >End Date</label
            >
            <input
              v-model="step.endDate"
              type="date"
              class="border rounded px-2 py-1"
              :min="step.startDate"
            />
          </div>
          <div class="flex items-center">
            <label class="text-sm font-medium text-gray-700 mr-2">Berkas</label>
            <select v-model="step.berkas" class="border rounded px-2 py-1">
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
          <button
            @click="newEvent.steps.splice(index, 1)"
            class="px-3 py-1 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>

        <!-- Static Steps -->
        <div
          v-for="(step, index) in staticSteps"
          :key="`static-${index}`"
          class="flex items-center space-x-4 mb-2"
        >
          <span class="font-semibold text-sm"
            >Step {{ newEvent.steps.length + index + 1 }}:</span
          >
          <div class="flex items-center w-1/2">
            <label class="text-sm font-medium text-gray-700 mr-2"
              >Step Name</label
            >
            <input
              v-model="step.stepName"
              type="text"
              class="border rounded px-2 py-1 w-full"
              disabled
            />
          </div>
          <div class="flex items-center">
            <label class="text-sm font-medium text-gray-700 mr-2"
              >Start Date</label
            >
            <input
              v-model="step.startDate"
              type="date"
              class="border rounded px-2 py-1"
              :min="
                index === 0
                  ? newEvent.steps.length > 0
                    ? addOneDay(
                        newEvent.steps[newEvent.steps.length - 1].endDate
                      )
                    : null
                  : addOneDay(staticSteps[index - 1].endDate)
              "
            />
          </div>
          <div class="flex items-center">
            <label class="text-sm font-medium text-gray-700 mr-2"
              >End Date</label
            >
            <input
              v-model="step.endDate"
              type="date"
              class="border rounded px-2 py-1"
              :min="step.startDate"
            />
          </div>
          <div class="flex items-center">
            <label class="text-sm font-medium text-gray-700 mr-2">Berkas</label>
            <select
              v-model="step.berkas"
              class="border rounded px-2 py-1"
              disabled
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        </div>

        <!-- Add Step Button -->
        <button
          @click="
            newEvent.steps.push({
              stepName: '',
              startDate: '',
              endDate: '',
              berkas: 'false',
            })
          "
          class="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
        >
          Add Step
        </button>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-2 mt-4">
          <button
            @click="createEvent"
            class="px-4 py-2 bg-green-500 text-white rounded"
          >
            Create Event
          </button>
          <button
            @click="toggleCreate"
            class="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  </div>

  <!-- Steps Table (Detail View) -->
  <div v-if="selectedEvent">
    <div
      class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-14"
    >
      <div class="flex justify-between items-center">
        <h1 class="font-semibold text-xl">
          {{ selectedEvent.eventName }} - Steps
        </h1>
        <button @click="hideEventDetails">Back to Events</button>
      </div>
    </div>
    <section class="py-2 px-2">
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table
          class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead class="text-xs text-gray-700 uppercase bg-gray-300">
            <tr>
              <th class="px-6 py-3">No</th>
              <th class="px-6 py-3">Step Name</th>
              <th class="px-6 py-3">Start Date</th>
              <th class="px-6 py-3">End Date</th>
              <th class="px-6 py-3">Berkas</th>
              <th v-if="isEditMode" class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(step, index) in stepsList"
              :key="step.stepId || index"
              class="border-b"
            >
              <td class="px-6 py-4">{{ index + 1 }}</td>

              <!-- Conditionally Editable Step Name -->
              <td class="px-6 py-4">
                <input
                  v-if="isEditMode && !isStaticStep(step)"
                  v-model="step.stepName"
                  class="border rounded px-4 py-2"
                  placeholder="New Step"
                />
                <span v-else>{{ step.stepName }}</span>
              </td>

              <!-- Editable Start Date -->
              <td class="px-6 py-4">
                <input
                  v-if="isEditMode"
                  type="date"
                  v-model="step.startDate"
                  class="border rounded px-2 py-1"
                />
                <span v-else>{{ step.startDate }}</span>
              </td>

              <!-- Editable End Date -->
              <td class="px-6 py-4">
                <input
                  v-if="isEditMode"
                  type="date"
                  v-model="step.endDate"
                  class="border rounded px-2 py-1"
                />
                <span v-else>{{ step.endDate }}</span>
              </td>

              <!-- Editable Berkas -->
              <td class="px-6 py-4">
                <select
                  v-if="isEditMode && !isStaticStep(step)"
                  v-model="step.berkas"
                  class="border rounded px-2 py-1"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
                <span class="uppercase" v-else>{{ step.berkas }}</span>
              </td>

              <!-- Actions (only in edit mode) -->
              <td v-if="isEditMode" class="px-6 py-4">
                <button
                  @click="deleteStep(index, step.stepId)"
                  class="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <!-- Edit Mode Actions -->
    <div class="flex justify-between mt-4 p-4">
      <button
        v-if="isEditMode"
        @click="addStep"
        class="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Step
      </button>

      <div class="flex justify-end">
        <button
          v-if="!isEditMode"
          @click="enableEditMode"
          class="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Edit
        </button>
        <div v-else>
          <button
            @click="updateSteps"
            class="px-4 py-2 bg-green-500 text-white rounded"
          >
            Save
          </button>
          <button
            @click="cancelEdit"
            class="px-4 py-2 bg-gray-500 text-white rounded ml-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

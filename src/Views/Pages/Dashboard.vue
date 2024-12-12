<template>
  <div>
    <SidebarWithNavbar @toggleSidebar="sidebarToggle" />
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
        class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-14"
      >
        <h1 class="font-semibold text-xl text-left">Dasbor</h1>
      </div>

      <main class="flex flex-col md:flex-row gap-2 w-full">
        <section
          id="left"
          :class="{
            'flex-grow': rankListIsEmpty,
            'flex-basis': !rankListIsEmpty,
          }"
        >
          <div
            class="px-5 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-2"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <template v-for="event in events" :key="event.eventName">
                <div class="event-item p-4">
                  <div
                    @click="toggleAccordion(event.eventName)"
                    class="cursor-pointer flex justify-between items-center p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700"
                  >
                    <p class="text-md underline italic font-semibold">
                      {{ event.eventName }}
                    </p>
                    <small
                      class="font-semibold flex items-center gap-2 space-x-4"
                    >
                      Lini Masa
                      <svg
                        v-if="!isActive(event.eventName)"
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <svg
                        v-if="isActive(event.eventName)"
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </small>
                  </div>

                  <!-- Display Active or Next Step -->
                  <div
                    v-if="getActiveOrNextStep(event.steps).status !== null"
                    class="mt-2 cursor-pointer p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700"
                  >
                    <div class="flex flex-col gap-2 space-x-4">
                      <div class="flex">
                        <h3 class="font-semibold me-4">
                          {{
                            getActiveOrNextStep(sortStepsByDate(event.steps))
                              .stepName
                          }}
                        </h3>
                        <small
                          v-if="
                            getActiveOrNextStep(sortStepsByDate(event.steps))
                              .status === 'active'
                          "
                          class="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300"
                        >
                          Sedang Berjalan
                        </small>
                        <small
                          v-if="
                            getActiveOrNextStep(sortStepsByDate(event.steps))
                              .status === 'upcoming'
                          "
                          class="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300"
                        >
                          Akan Datang
                        </small>
                      </div>
                      <time
                        class="text-sm font-semibold text-gray-400 dark:text-gray-500"
                      >
                        {{
                          formatDate(
                            getActiveOrNextStep(sortStepsByDate(event.steps))
                              .startDate
                          )
                        }}
                        -
                        {{
                          formatDate(
                            getActiveOrNextStep(sortStepsByDate(event.steps))
                              .endDate
                          )
                        }}
                      </time>
                    </div>
                  </div>

                  <!-- Accordion for Event Steps -->
                  <div
                    v-if="isActive(event.eventName)"
                    class="p-4 border-2 border-gray-200 border-opacity-100 rounded-lg dark:border-gray-700 mt-2"
                  >
                    <ol
                      class="relative mt-4 border-l border-gray-200 dark:border-gray-700"
                    >
                      <li
                        v-for="(step, stepIndex) in sortStepsByDate(
                          event.steps
                        )"
                        :key="stepIndex"
                        class="mb-10 ml-6"
                      >
                        <div class="flex items-center">
                          <span
                            class="flex-shrink-0 w-6 h-6 me-4 mb-4 bg-blue-100 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900 flex items-center justify-center"
                            :class="{
                              'opacity-50 , bg-gray-100': isStepPast(
                                step.endDate
                              ),
                            }"
                          >
                            <svg
                              :class="{
                                'opacity-50 , bg-gray-100 text-gray-400':
                                  isStepPast(step.endDate),
                              }"
                              class="w-2.5 h-2.5 text-blue-800 dark:text-blue-300"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"
                              />
                            </svg>
                          </span>
                          <h3
                            class="flex items-center mb-4 text-lg font-semibold text-gray-900 dark:text-white ml-4"
                            :class="{
                              ended: isStepPast(step.endDate),
                            }"
                          >
                            {{ step.stepName }}
                            <span
                              v-if="
                                isWithinDateRange(step.startDate, step.endDate)
                              "
                              class="bg-blue-100 text-blue-800 text-sm font-medium mx-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                            >
                              Sekarang
                            </span>
                          </h3>
                        </div>
                        <time
                          class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
                        >
                          {{ formatDate(step.startDate) }} -
                          {{ formatDate(step.endDate) }}
                        </time>
                        <p
                          class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400"
                        >
                          {{ step.description }}
                        </p>
                      </li>
                    </ol>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </section>
        <section id="right" v-if="!rankListIsEmpty">
          <div>
            <div
              v-for="(teams, eventName) in rankList"
              :key="eventName"
              class="w-full max-w-md p-4 my-2 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700"
            >
              <div class="flex items-center justify-between mb-4">
                <span
                  class="text-sm font-normal underline text-gray-500 dark:text-gray-400"
                  >Daftar Peringkat</span
                >
                <h6>Teams</h6>

                <h5
                  class="text-xl font-bold leading-none text-gray-900 dark:text-white"
                >
                  {{ eventName }}
                </h5>
              </div>
              <div class="flow-root">
                <ul
                  role="list"
                  class="divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <li
                    v-for="(team, index) in teams"
                    :key="team.teamId"
                    class="py-3 sm:py-4"
                  >
                    <div class="flex items-center justify-between">
                      <span
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {{ team.teamName }}</span
                      >
                      <span class="text-sm p-2 text-gray-500 dark:text-gray-400"
                        >Peringkat : {{ index + 1 }}</span
                      >
                    </div>
                    <a
                      class="judul text-wrap mt-2 cursor-pointer hover:text-blue-500 relative group"
                    >
                      <small>{{ team.judul }}</small>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { onMounted, ref, computed } from "vue";
import SidebarWithNavbar from "@/components/SidebarWithNavbar.vue";
import { formatDate, isSidebarOpen, sidebarToggle } from "@/utils/utils";

const events = ref([]);
const currentTime = new Date();
const year = currentTime.getFullYear();
const rankList = ref({});
const activeEvent = ref(null);

onMounted(() => {
  getEvent();
  evaluasiFinal();
});

const getEvent = async () => {
  const response = await axios.get("/event/all");
  const filteredEvents = response.data.filter((event) => {
    return new Date(event.eventYear).getFullYear() === year;
  });
  events.value = filteredEvents;
  // console.log(events.value);
};

const evaluasiFinal = async () => {
  const response = await axios.get("/evaluasi/final");
  const evaluasiData = response.data;

  // Filter data berdasarkan tahun saat ini
  const currentYear = new Date().getFullYear();
  const filteredData = evaluasiData.filter(
    // (item) => item.eventyear === String(currentYear - 1)
    (item) => item.eventyear === String(currentYear - 1)
  );

  // Kelompokkan data berdasarkan nama event
  const groupedByEvent = filteredData.reduce((acc, item) => {
    if (!acc[item.eventName]) {
      acc[item.eventName] = [];
    }
    acc[item.eventName].push(item);
    return acc;
  }, {});

  // Urutkan data dalam setiap event berdasarkan nilai akhir
  for (const eventName in groupedByEvent) {
    groupedByEvent[eventName].sort((a, b) => b.nilaiAkhir - a.nilaiAkhir);
  }

  // Update state untuk digunakan di template
  rankList.value = groupedByEvent;
};

const toggleAccordion = (eventName) => {
  // Toggle the accordion state
  activeEvent.value = activeEvent.value === eventName ? null : eventName;
};

const isActive = (eventName) => {
  return activeEvent.value === eventName; // Check if the event is active
};

const isWithinDateRange = (startDate, endDate) => {
  const currentDate = new Date().setUTCHours(0, 0, 0, 0);
  const start = new Date(startDate).setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate).setUTCHours(0, 0, 0, 0);

  return currentDate >= start && currentDate <= end;
};

// Function to get active step or next upcoming step
const getActiveOrNextStep = (steps) => {
  const currentDate = new Date().setUTCHours(0, 0, 0, 0);

  // Find active step
  const activeStep = steps.find((step) => {
    const start = new Date(step.startDate).setUTCHours(0, 0, 0, 0);
    const end = new Date(step.endDate).setUTCHours(0, 0, 0, 0);
    return currentDate >= start && currentDate <= end;
  });

  // If an active step is found, return its details
  if (activeStep) {
    return {
      stepName: activeStep.stepName,
      startDate: activeStep.startDate,
      endDate: activeStep.endDate,
      status: "active",
    };
  }

  // Find the next upcoming step
  const upcomingStep = steps.find((step) => {
    const start = new Date(step.startDate).setUTCHours(0, 0, 0, 0);
    return start > currentDate;
  });

  // If an upcoming step is found, return its details
  if (upcomingStep) {
    return {
      stepName: upcomingStep.stepName,
      startDate: upcomingStep.startDate,
      endDate: upcomingStep.endDate,
      status: "upcoming",
    };
  }

  // If no active or upcoming step, return a hault label
  return {
    stepName: "No Event",
    startDate: null,
    endDate: null,
    status: null,
  };
};

// Function to sort steps by startDate and endDate
const sortStepsByDate = (steps) => {
  return steps.sort((a, b) => {
    const startA = new Date(a.startDate).getTime();
    const startB = new Date(b.startDate).getTime();
    const endA = new Date(a.endDate).getTime();
    const endB = new Date(b.endDate).getTime();

    // Prioritize sorting by startDate, if startDates are equal, sort by endDate
    if (startA !== startB) {
      return startA - startB; // Sort in ascending order of startDate
    } else {
      return endA - endB; // Sort in ascending order of endDate if startDates are the same
    }
  });
};

// Computed property to determine if rankList is empty
const rankListIsEmpty = computed(() => {
  return Object.keys(rankList.value).length === 0;
});

const isStepPast = (endDate) => {
  const currentDate = new Date().setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate).setUTCHours(0, 0, 0, 0);
  return currentDate > end; // Return true if current date is past the step's end date
};
</script>

<style scoped>
#left {
  flex-grow: 1; /* Default growth */
}

#right {
  flex-basis: 30%; /* Default size for right section */
}

.ended {
  color: grey;
  opacity: 0.5;
  text-decoration: none;
}
</style>

<template>
  <nav
    id="nav-evaluasi"
    class="flex px-5 py-3 mt-2 items-center justify-between text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
    aria-label="Breadcrumb"
  >
    <div>
      <ol
        class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse"
      >
        <li
          v-for="(item, index) in items"
          :key="index"
          class="inline-flex items-center"
        >
          <router-link
            :to="item.route"
            :class="{
              'text-blue-600 dark:text-white font-bold':
                currentPath === item.route,
              'text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white':
                currentPath !== item.route,
            }"
            class="inline-flex items-center text-sm font-medium"
          >
            <svg
              v-if="index === 0"
              class="w-3 h-3 me-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"
              />
            </svg>
            {{ item.name }}
          </router-link>
          <svg
            v-if="index < items.length - 1"
            class="rtl:rotate-180 block w-3 h-3 mx-1 text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
        </li>
      </ol>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router";
import { defineProps } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const route = useRoute();
const currentPath = route.path;
</script>

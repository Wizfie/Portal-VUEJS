<template>
  <div id="nav-button" class="flex justify-center md:justify-end">
    <router-link
      v-if="currentRoute !== '/admin-event'"
      to="/admin-event"
      type="button"
      class="nav-button"
    >
      Event
    </router-link>
    <router-link
      v-if="currentRoute !== '/admin/teams'"
      to="/admin/teams"
      type="button"
      class="nav-button"
    >
      Teams
    </router-link>
    <router-link
      v-if="currentRoute !== '/admin/users'"
      to="/admin/users"
      type="button"
      class="nav-button"
    >
      Users
    </router-link>
    <router-link
      v-if="
        currentRoute !== '/admin/evaluasi-lapangan' &&
        currentRoute !== '/admin/evaluasi-presentasi' &&
        currentRoute !== '/admin/evaluasi-yelyel'
      "
      to="/admin/evaluasi-lapangan"
      type="button"
      class="nav-button"
    >
      Evaluasi
    </router-link>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
const currentRoute = route.path;
</script>

<style scoped>
.nav-button {
  padding: 0.625rem 1.25rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  background-color: #6b7280; /* bg-gray-500 */
  border: 1px solid black;
  border-radius: 0.375rem;
  text-align: center;
  cursor: pointer;
}

.nav-button:hover {
  background-color: #4b5563; /* bg-gray-600 */
  color: black;
}

.dark .nav-button {
  background-color: #374151; /* dark:bg-gray-800 */
  color: #9ca3af; /* dark:text-gray-400 */
  border-color: #4b5563; /* dark:border-gray-600 */
}

.dark .nav-button:hover {
  background-color: #4b5563; /* dark:hover:bg-gray-700 */
  color: white; /* dark:hover:text-white */
}
</style>

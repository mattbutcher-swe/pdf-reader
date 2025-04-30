import { createRouter, createWebHistory } from 'vue-router'
import SetHomeView from '../views/SetHomeView.vue'
import LibraryView from '../views/LibraryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/setHome',
      name: 'home',
      component: SetHomeView,
    },
    {
      path: '/',
      name: 'library',
      component: LibraryView,
    },
  ],
})

export default router

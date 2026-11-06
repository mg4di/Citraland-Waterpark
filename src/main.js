import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import AdminPage from './AdminPage.vue'
import AdminLogin from './AdminLogin.vue'
import UserPage from './UserPage.vue'
import { authService } from './services/authService.js'
import './styles.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: UserPage },
    { path: '/admin', name: 'admin-login', component: AdminLogin },
    { path: '/admin/dashboard', name: 'admin-dashboard', component: AdminPage, meta: { requiresAdminDemoAccess: true } },
    { path: '/admin/:pathMatch(.*)*', redirect: '/admin' },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAdminDemoAccess && !await authService.isAdmin()) {
    return { name: 'admin-login', query: { expired: '1' } }
  }
})

createApp(App).use(router).mount('#app')

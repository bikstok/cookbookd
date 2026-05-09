import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import { supabase } from '@/lib/supabaseClient'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: () => import('../views/RecipeDetail.vue'),
    props: true,
  },
  {
    path: '/edit/:id?',
    name: 'RecipeEditor',
    component: () => import('../views/RecipeEditor.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, _from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (to.meta.requiresAuth && !session) {
    next('/login')
  } else if (to.path === '/login' && session) {
    next('/')
  } else {
    next()
  }
})

export default router

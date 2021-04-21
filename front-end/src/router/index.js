import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Board from '../views/Board.vue'
import Profile from '../views/Profile.vue'
import Battle from '../views/Battle.vue'
import Death from '../views/Death.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/board',
    name: 'Board',
    component: Board
  },
  {
    path: '/Profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/battle',
    name: 'Battle',
    component: Battle
  },
  {
    path: '/death',
    name: 'Death',
    component: Death
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

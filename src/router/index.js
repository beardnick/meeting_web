import Vue from 'vue'
import Router from 'vue-router'
import meeting from '@/components/meeting.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '',
      component: meeting
    }
  ]
})

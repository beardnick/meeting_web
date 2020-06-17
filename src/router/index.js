import Vue from 'vue'
import Router from 'vue-router'
import meeting from '@/components/meeting.vue'
import testVideo from '@/components/testVideo.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'meeting',
      component: meeting
    },
    {
      path: '/test',
      name: 'test',
      component: testVideo
    }
  ]
})

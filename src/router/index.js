import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', name: 'Home', component: function() {return import ('@/pages/home')} },
    { path: '/audio', name: 'Audio', component: function() {return import ('@/pages/audio/audio')} }
  ]
})

import Vue from 'vue';
import Router from 'vue-router';

import Projects from './views/Projects'
import Project from './views/Project'
import Issues from './views/Issues'
import Clients from './views/Clients'
import Client from './views/Client'

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'projects',
      component: Projects,
    },
    {
      path: '/project/:id',
      name: 'project',
      component: Project,
      props: true
    },
    {
      path: '/issues',
      name: 'issues',
      component: Issues,
    },
    {
      path: '/clients',
      name: 'clients',
      component: Clients,
    },
    {
      path: '/client/:id',
      name: 'client',
      component: Client,
      props: true
    }
  ],
});
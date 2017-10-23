import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

function load (component) {
  return () => System.import(`components/${component}.vue`)
}

export default new VueRouter({
  /*
   * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
   * it is only to be used only for websites.
   *
   * If you decide to go with "history" mode, please also open /config/index.js
   * and set "build.publicPath" to something other than an empty string.
   * Example: '/' instead of current ''
   *
   * If switching back to default "hash" mode, don't forget to set the
   * build publicPath back to '' so Cordova builds work again.
   */

  routes: [
    {
      path: '/',
      component: load('Index'),
      children: [
        {
          path: 'admin',
          component: load('admin/users')
        },
        {
          path: 'login',
          component: load('login')
        },
        {
          path: 'category',
          component: load('admin/category')
        },
        {
          path: 'companyBrands',
          component: load('admin/companyBrands')
        },
        {
          path: 'item',
          component: load('admin/items')
        },
        {
          path: 'store',
          component: load('admin/stores')
        },
        {
          path: 'campaign',
          component: load('admin/campaigns')
        },
        {
          path: 'storeItems',
          component: load('store/items')
        },
        {
          path: 'storeMessages',
          component: load('store/messages')
        },
        {
          path: 'message/:email',
          component: load('admin/messages')
        },
        {
          path: 'company/dashboard',
          component: load('company/dashboard')
        },
        {
          path: 'company/history',
          component: load('company/history')
        },
        {
          path: 'brand/dashboard',
          component: load('brand/dashboard')
        },
        {
          path: 'brand/history',
          component: load('brand/history')
        }
      ]
    },
    { path: '*', component: load('Error404') } // Not found
  ]
})

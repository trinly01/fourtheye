// === DEFAULT / CUSTOM STYLE ===
// WARNING! always comment out ONE of the two require() calls below.
// 1. use next line to activate CUSTOM STYLE (./src/themes)
// require(`./themes/app.${__THEME}.styl`)
// 2. or, use next line to activate DEFAULT QUASAR STYLE
require(`quasar/dist/quasar.${__THEME}.css`)
// ==============================

import Vue from 'vue'
import Quasar from 'quasar'
import router from './router'
import _ from 'lodash'
import $moment from 'moment'
import 'chart.js'
import 'hchs-vue-charts'
Vue.use(window.VueCharts)

// import Chartkick from 'chartkick'
// import VueChartkick from 'vue-chartkick'

// Vue.use(VueChartkick, { Chartkick })

import VueFire from 'vuefire'
import fireb from 'firebase'

let userTypes = require('userTypes.js')
// console.log('userTypes', userTypes)
// import fireAdmin from 'firebase-admin'
// var serviceAccount = require('third-eye-fb5d3-firebase-adminsdk-54hr3-c3b4ceb7a2.json')

var config = {
  apiKey: 'AIzaSyB-bXnV7jLihjtlgQC0iqdKnr-BNM8VBsg',
  authDomain: 'third-eye-fb5d3.firebaseapp.com',
  databaseURL: 'https://third-eye-fb5d3.firebaseio.com',
  projectId: 'third-eye-fb5d3',
  storageBucket: 'third-eye-fb5d3.appspot.com',
  messagingSenderId: '177209493401'
}
var firebase = fireb.initializeApp(config)
var firebase2 = fireb.initializeApp(config, 'firebase2')
// fireAdmin.initializeApp({
//   credential: fireAdmin.credential.cert(serviceAccount),
//   databaseURL: config.databaseURL
// })

var $auth = firebase.auth()
var $auth2 = firebase2.auth()
var database = firebase.database()
$auth.usersRef = database.ref('users')

Vue.prototype.$auth2 = $auth2
Vue.prototype.$database = database
Vue.prototype.$firebase = firebase
Vue.prototype.$auth = $auth
Vue.prototype.$user = null
Vue.prototype.$lodash = _
Vue.prototype.$moment = $moment

Vue.use(VueFire)
Vue.use(Quasar) // Install Quasar Framework

import store from 'store.js'

$auth.onAuthStateChanged(user => {
  store.state.user = user
  console.log('USER', store.state.user)
  if (user) {
    $auth.usersRef.child(user.uid).on('value', snapshot => {
      // console.log('snapshot.val()', snapshot.val().type)

      Vue.set(store.state.user, 'data', snapshot.val())
      if (router.currentRoute.path === '/login') {
        router.push(userTypes[store.state.user.data.type])
        console.log(userTypes[store.state.user.data.type])
      }
      // else {
      //   router.push(router.currentRoute.path + 'postfix')
      //   console.log('currentRoute', router.currentRoute.path)
      // }
    })
  }
  else {
    console.log('not authenticated')
    router.push('/login')
  }
})

Quasar.start(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#q-app',
    router,
    store,
    render: h => h(require('./App'))
  })
})

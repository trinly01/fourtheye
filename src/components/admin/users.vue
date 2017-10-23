<template>
  <div>
    <div slot="header" class="toolbar primary">
      <q-toolbar-title :padding="0" class="row full-width flex">
        <div class="row full-width flex">
          <span style="padding: 8px 16px 0px 0px;" class="auto">User Management {{companyCheck}}</span>
          <q-search style="max-width: 320px;" v-model="search" :model.sync="search" class="primary float-right"></q-search>
        </div>
      </q-toolbar-title>
      
    </div>
    <div class="layout-padding">
      <table class="q-table bordered highlight striped-odd loose full-width responsive">
        <thead>
          <tr>
            <th class="text-left">Name</th>
            <th class="text-right">Email</th>
            <th class="text-right">Type</th>
            <th class="text-right">Company</th>
            <th class="text-right">Brand</th>
            <th class="text-right">Store</th>
            <th class="text-right">Activated</th>
          </tr>
        </thead>
        <tbody>
           <tr v-for="u in filteredUsers" :key="u._id" @click="showUser(u)">
            <td class="text-left" >{{u.displayName}}</td>
            <td class="text-right" >{{u.email}}</td>
            <td class="text-right" >{{u.type}}</td>
            <td class="text-right" ><span v-if="u.company">{{u.company.name}}</span></td>
            <td class="text-right" ><span v-if="u.brand">{{u.brand}}</span></td>
            <td class="text-right" ><span v-if="u.store">{{u.store}}</span></td>
            <td class="text-right">
              <q-toggle
                :value="u.activated"
                @input="activate(u.activated, u['.key'])"
              ></q-toggle>
            </td>
          </tr> 
        </tbody>
      </table>
    </div>
    <button @click="isNew = true, showAddForm(), isNew = true, isNew = true" style="bottom: 2em; right: 2em;" class="primary circular absolute-bottom-right raised">
      <i>add</i>
    </button>

    <q-modal :noEscDismiss="false" :noBackdropDismiss="false" ref="newModal">
      <div class="layout-padding">
        <h4>{{isNew? 'Create' : 'Edit'}} User</h4>
        <form>
          <div class="floating-label">
            <input v-model="user.displayName" required class="full-width">
            <label>Display Name</label>
          </div>
          <div :disabled="!isNew" class="floating-label">
            <input :disabled="!isNew" v-model="user.email" required class="full-width">
            <label v-show="isNew">Email</label>
          </div>
          <div v-show="isNew" class="floating-label">
            <input v-model="user.password" required class="full-width" type="password">
            <label>Password</label>
          </div>
          <div v-show="isNew" class="floating-label">
            <input v-model="user.passwordConfirm" required class="full-width" type="password">
            <label>Confirm Password</label>
          </div>
          <q-select
            class=""
            type="list"
            label="Type"
            v-model="user.type"
            :options="userTypes"
          ></q-select>
          <q-select
            v-if="user.type === 'Company manager' || user.type === 'Brand manager'"
            class=""
            type="list"
            label="Company"
            v-model="user.company"
            value="user.company"
            :options="companyOptions"
          ></q-select>
          {{ (!user.company.name) }}
          <q-select
            v-if="user.type === 'Brand manager' && user.company.name"
            class=""
            type="list"
            label="Brand"
            v-model="user.brand"
            :options="user.company.brands"
          ></q-select>
          <q-select
            v-if="user.type === 'Store owner'"
            class=""
            type="list"
            label="Store"
            v-model="user.store"
            :options="storeOptions"
          ></q-select>
        </form>
        <br>
        <div class="row pull-right">
          <button class="primary clear" @click="$refs.newModal.close()">cancel</button>
          <button class="primary" v-show="isNew" @click="saveNew">Save</button>
          <button class="primary" v-show="!isNew" @click="saveUpdate">Save</button>
        </div>
        <br>
      </div>
    </q-modal>
  </div>
</template>

<script>

import {Dialog, Toast, Loading} from 'quasar'
import _ from 'lodash'

export default {
  data () {
    return {
      search: '',
      users: [],
      companies: [],
      company: '',
      store: '',
      user: {
        activated: false,
        company: {},
        displayName: '',
        email: '',
        store: '',
        type: '',
        brand: '',
        password: '',
        passwordConfirm: ''
      },
      userTypes: [
        {label: 'Company manager', value: 'Company manager'},
        {label: 'Brand manager', value: 'Brand manager'},
        {label: 'Store owner', value: 'Store owner'},
        {label: 'Admin', value: 'Admin'}
      ]
    }
  },
  mounted () {
    this.$bindAsArray('users', this.$database.ref('users'))
    this.$bindAsArray('companies', this.$database.ref('companies'))
    this.$bindAsArray('stores', this.$database.ref('stores'))
    if (this.$store.state.user && this.$store.state.user.data && this.$store.state.user.data.type !== 'Admin') {
      this.$router.push('/login')
    }
  },
  computed: {
    filteredUsers () {
      if (this.users.length !== 0) {
        return this.users.filter((item) => {
          if (item.displayName) {
            return item.displayName.toLowerCase().indexOf(this.search.toLowerCase()) !== -1 ||
            item.email.toLowerCase().indexOf(this.search.toLowerCase()) !== -1 ||
            item.type.toLowerCase().indexOf(this.search.toLowerCase()) !== -1
          }
          else {
            return false
          }
        })
      }
      else {
        return this.users
      }
    },
    storeOptions () {
      return _.map(this.stores).map(s => {
        return {label: s.name, value: s.name}
      })
    },
    companyOptions () {
      return _.map(this.companies).map(c => {
        let brands = _.map(c.brands).map(b => {
          return {label: b, value: b}
        })
        return _.assign(c, {
          label: c.name,
          value: {name: c.name, brands, code: c.code}
        })
      })
    },
    companyCheck () {
      return this.company
    }
  },
  methods: {
    activate (a, uid) {
      this.$auth.usersRef.child(`${uid}/activated`).set(!a)
    },
    showBrand (user) {
      let self = this
      if (!user.company) {
        Toast.create.negative({
          html: 'Add a company first'
        })
      }
      else {
        let brands = user.company.brands || []
        Dialog.create({
          title: user.email,
          form: {
            brand: {
              type: 'radio',
              model: user.brand,
              items: brands
            }
          },
          buttons: [
            'cancel',
            {
              label: 'Save',
              handler (data) {
                console.log(data.brand)
                self.$auth.usersRef.child(`${user['.key']}/brand`).set(data.brand)
              }
            }
          ]
        })
      }
    },
    showUser (user) {
      console.log('showUser', user)
      user.company = ''
      user.brand = user.brand || ''
      this.user = Object.assign({}, user)
      this.isNew = false
      this.$forceUpdate()
      this.$refs.newModal.open()
      // let self = this
      // Dialog.create({
      //   title: user.email,
      //   form: {
      //     displayName: {
      //       type: 'textbox',
      //       label: 'Display Name',
      //       model: user.displayName
      //     },
      //     header1: {
      //       type: 'heading',
      //       label: 'Type'
      //     },
      //     type: {
      //       type: 'radio',
      //       model: user.type,
      //       items: [
      //         {label: 'Company manager', value: 'Company manager'},
      //         {label: 'Brand manager', value: 'Brand manager'},
      //         {label: 'Store owner', value: 'Store owner'},
      //         {label: 'Admin', value: 'Admin'}
      //       ]
      //     },
      //     header2: {
      //       type: 'heading',
      //       label: 'Company'
      //     },
      //     company: {
      //       type: 'radio',
      //       model: user.company,
      //       items: this.companyOptions
      //     },
      //     header3: {
      //       type: 'heading',
      //       label: 'Store'
      //     },
      //     store: {
      //       type: 'radio',
      //       model: this.store,
      //       items: this.storeOptions
      //     }
      //   },
      //   buttons: [
      //     'Cancel',
      //     {
      //       label: 'Save',
      //       preventClose: true,
      //       handler (data, close) {
      //         data.company = data.company || ''
      //         if (data.displayName.length === 0) {
      //           Toast.create.negative({
      //             html: 'Invalid name'
      //           })
      //         }
      //         else if (data.type.length === 0) {
      //           Toast.create.negative({
      //             html: 'Invalid type'
      //           })
      //         }
      //         else {
      //           Loading.show()
      //           // data = Object.assign(data, user)
      //           self.$auth.usersRef.child(user['.key']).update(data).then(u => {
      //             close()
      //             Loading.hide()
      //           })
      //           .catch(error => {
      //             Toast.create.negative({
      //               html: `${error.code}: ${error.message}`
      //             })
      //           })
      //         }
      //       }
      //     }
      //   ]
      // })
    },
    showAddForm () {
      this.isNew = true
      this.$forceUpdate()
      this.$refs.newModal.open()
    },
    saveNew () {
      let data = this.user
      let self = this

      console.log(data)

      var emailValidation = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (data.displayName.length === 0) {
        Toast.create.negative({
          html: 'Invalid name'
        })
      }
      else if (!emailValidation.test(data.email)) {
        Toast.create.negative({
          html: 'Invalid email'
        })
      }
      else if (data.password.length < 6 || data.password !== data.passwordConfirm) {
        Toast.create.negative({
          html: 'Invalid password'
        })
      }
      else if (data.type.length === 0) {
        Toast.create.negative({
          html: 'Invalid type'
        })
      }
      else if (data.type === 'Company manager' && !data.company.name) {
        Toast.create.negative({
          html: 'Invalid Company'
        })
      }
      else {
        Loading.show()
        self.$auth2.createUserWithEmailAndPassword(data.email, data.password)
        .then(user => {
          delete data['passwordConfirm']
          delete data['password']
          data.activated = false
          self.$auth.usersRef.child(user.uid).set(data).then(u => {
            this.$refs.newModal.close()
            Loading.hide()
          })
          .catch(error => {
            Toast.create.negative({
              html: `${error.code}: ${error.message}`
            })
            Loading.hide()
          })
        })
        .catch(error => {
          Toast.create.negative({
            html: `${error.code}: ${error.message}`
          })
          Loading.hide()
        })
      }
    },
    saveUpdate () {
      let data = this.user
      console.log(data)
      if (data.displayName.length === 0) {
        Toast.create.negative({
          html: 'Invalid name'
        })
      }
      else if (data.type === 'Company manager' && !data.company.name) {
        Toast.create.negative({
          html: 'Invalid Company'
        })
      }
      else if (data.type === 'Brand manager' && !data.company.name && !data.brand) {
        Toast.create.negative({
          html: 'Invalid Brand'
        })
      }
      else {
        Loading.show()
        let key = data['.key']
        delete data['.key']
        this.$auth.usersRef.child(key).update(data).then(u => {
          close()
          Loading.hide()
          this.$refs.newModal.close()
        })
        .catch(error => {
          Toast.create.negative({
            html: `${error.code}: ${error.message}`
          })
          Loading.hide()
        })
      }
    }
  }
}
</script>

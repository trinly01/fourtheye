<template>
  <div>
    <div slot="header" class="toolbar primary">
      <q-toolbar-title :padding="0" class="row full-width flex">
        <div class="row full-width flex">
          <span style="padding: 8px 16px 0px 0px;" class="auto">Category Management</span>
          <q-search style="max-width: 320px;" v-model="search" :model.sync="search" class="primary float-right"></q-search>
        </div>
      </q-toolbar-title>
    </div>
    <div class="layout-padding">
      <table class="q-table bordered highlight striped-odd loose full-width responsive">
        <thead>
          <tr>
            <th class="text-left">Code</th>
            <th class="text-left">Name</th>
            <th class="text-left">Brands</th>
            <th class="text-center"></th>
          </tr>
        </thead>
        <tbody>
           <tr v-for="c in companies" :key="c['.key']">
            <td class="text-left" @click="showCompany(c)">{{c.code}}</td>
            <td class="text-left" @click="showCompany(c)">{{c.name}}</td>
            <td class="text-left" @click="showCompany(c)">
              <q-chips v-model="c.brands" readonly></q-chips>
            </td>
            <td class="text-right">
              <button class="circular small text-negative" @click="deleteCompany(c)"><i>delete</i></button>
            </td>
          </tr> 
        </tbody>
      </table>
    </div>
    <button @click="showAddForm" style="bottom: 2em; right: 2em;" class="primary circular absolute-bottom-right raised">
      <i>add</i>
    </button>
  </div>
</template>

<script>
import {Dialog, Toast, Loading} from 'quasar'

export default {
  mounted () {
    this.$bindAsArray('companies', this.$database.ref('companies'))
    if (this.$store.state.user && this.$store.state.user.data && this.$store.state.user.data.type !== 'Admin') {
      this.$router.push('/login')
    }
  },
  data () {
    return {
      search: '',
      companies: []
    }
  },
  computed: {
    $user () {
      return this.$store.state.user
    }
  },
  methods: {
    deleteCompany (c) {
      let self = this
      Dialog.create({
        title: 'Warning',
        message: `Are you sure you want to delete ${c.code} | ${c.name}?`,
        buttons: [
          'No',
          {
            label: 'Yes',
            handler (data, close) {
              self.$firebaseRefs.companies.child(c['.key']).remove()
            }
          }
        ]
      })
    },
    showCompany (c) {
      let self = this
      Dialog.create({
        title: 'Create Company',
        form: {
          code: {
            type: 'textbox',
            label: 'Code',
            model: c.code
          },
          name: {
            type: 'textbox',
            label: 'Name',
            model: c.name
          },
          brands: {
            type: 'chips',
            label: 'Brands',
            model: c.brands
          }
        },
        buttons: [
          'Cancel',
          {
            label: 'Save',
            preventClose: true,
            handler (data, close) {
              console.log(data)
              if (data.code === '' && data.name === '' && data.brands.length < 1) {
                Toast.create.negative({
                  html: 'All fields are required'
                })
              }
              else {
                Loading.show()
                self.$firebaseRefs.companies.child(c['.key']).set(data)
                .then(() => {
                  Loading.hide()
                  close()
                  Toast.create.positive({
                    html: `${data.code} | ${data.name} updated`
                  })
                })
                .catch(error => {
                  Loading.hide()
                  Toast.create.negative({
                    html: `${error.code}: ${error.message}`
                  })
                })
              }
            }
          }
        ]
      })
    },
    showAddForm () {
      let self = this
      Dialog.create({
        title: 'Create Company',
        form: {
          code: {
            type: 'textbox',
            label: 'Code',
            model: ''
          },
          name: {
            type: 'textbox',
            label: 'Name',
            model: ''
          },
          brands: {
            type: 'chips',
            label: 'Brands',
            model: []
          }
        },
        buttons: [
          'Cancel',
          {
            label: 'Save',
            preventClose: true,
            handler (data, close) {
              console.log(data)
              if (data.code === '' && data.name === '' && data.brands.length < 1) {
                Toast.create.negative({
                  html: 'All fields are required'
                })
              }
              else {
                console.log(self.$firebaseRefs)
                Loading.show()
                self.$firebaseRefs.companies.push(data)
                .then(() => {
                  Loading.hide()
                  Toast.create.positive({
                    html: `${data.code} | ${data.name} created`
                  })
                  close()
                })
                .catch(error => {
                  Loading.hide()
                  Toast.create.negative({
                    html: `${error.code}: ${error.message}`
                  })
                })
              }
            }
          }
        ]
      })
    }
  }
}
</script>

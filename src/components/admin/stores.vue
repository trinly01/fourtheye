<template>
  <div>
    <div slot="header" class="toolbar primary">
      <q-toolbar-title :padding="0" class="row full-width flex">
        <div class="row full-width flex">
          <span style="padding: 8px 16px 0px 0px;" class="auto">Item Management</span>
          <q-search style="max-width: 320px;" v-model="search" :model.sync="search" class="primary float-right"></q-search>
        </div>
      </q-toolbar-title>
    </div>
    <div class="layout-padding">
      <table class="q-table bordered highlight striped-odd loose full-width responsive">
        <thead>
          <tr>
            <th class="text-left">Name</th>
            <th class="text-left">Owner</th>
            <th class="text-left">Address</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filteredStores" :key="s['.key']" @click="isNew = false">
            <td class="text-left" @click="showItem(s)">{{s.name}}</td>
            <td class="text-left" @click="showItem(s)">{{s.owner}}</td>
            <td class="text-left" @click="showItem(s)">{{s.address}}</td>
            <td class="text-right">
              <button class="circular small text-negative" @click="deleteStore(s)"><i>delete</i></button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td class="text-right" colspan="7">
              <!-- <q-pagination
                class="text-white bg-white"
                v-model="page"  
                :max="12"
              ></q-pagination> -->
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <button @click="isNew = true, $refs.newModal.open()" style="bottom: 2em; right: 2em;" class="primary circular absolute-bottom-right raised">
      <i>add</i>
    </button>

    <q-modal :noEscDismiss="true" :noBackdropDismiss="true" ref="newModal">
      <div class="layout-padding">
        <h4>{{isNew? 'Create Item' : 'Edit Item'}}</h4>
        <form>
          <div class="floating-label">
            <input v-model="store.name" required class="full-width">
            <label>name</label>
          </div>
          <div class="floating-label">
            <input v-model="store.owner" required class="full-width">
            <label>owner</label>
          </div>
          <q-select
            class=""
            type="list"
            label="Region"
            v-model="store.region"
            :options="regions"
          ></q-select>
          <q-select
            class=""
            type="list"
            label="Province"
            v-model="store.province"
            :options="provinces"
          ></q-select>
          <q-select
            class=""
            type="list"
            label="City/Mun"
            v-model="store.citymun"
            :options="citymuns"
          ></q-select>
          <q-select
            class=""
            type="list"
            label="Barangay"
            v-model="store.brgy"
            :options="brgys"
          ></q-select>
        </form>
        <br>
        <div class="row pull-right">
          <button class="primary clear" @click="$refs.newModal.close()">cancel</button>
          <button class="primary" v-if="isNew" @click="isNew = false, saveNew()">Save</button>
          <button class="primary" v-else @click="saveUpdate">Save</button>
        </div>
        <br>
      </div>
    </q-modal>
  </div>
</template>
<script>
import {Dialog, Toast, Loading} from 'quasar'
let regions = require('../../address/region.json').RECORDS
let provinces = require('../../address/province.json').RECORDS
let citymuns = require('../../address/citymun.json').RECORDS
let brgys = require('../../address/brgy.json').RECORDS
console.log(Dialog)

export default {
  mounted () {
    // this.$bindAsArray('companies', this.$database.ref('companies'))
    // this.$bindAsArray('categories', this.$database.ref('categories'))
    this.$bindAsArray('stores', this.$database.ref('stores'))
    if (this.$store.state.user && this.$store.state.user.data && this.$store.state.user.data.type !== 'Admin') {
      this.$router.push('/login')
    }
  },
  computed: {
    $user () {
      return this.$store.state.user
    },
    mapStores () {
      return this.$lodash.map(this.stores, store => {
        store.address = `${store.region}, ${store.province}, ${store.citymun}, ${store.brgy}`
        return store
      })
    },
    filteredStores () {
      return this.mapStores.filter((store) => {
        return store.name.toLowerCase().indexOf(this.search.toLowerCase()) !== -1 ||
        store.owner.toLowerCase().indexOf(this.search.toLowerCase()) !== -1 ||
        store.address.toLowerCase().indexOf(this.search.toLowerCase()) !== -1
      })
    },
    regions () {
      return this.$lodash.map(regions, r => {
        return {label: r.regDesc, value: r.regDesc}
      })
    },
    provinces () {
      let region = this.$lodash.find(regions, r => {
        return r.regDesc === this.store.region
      }) || {regCode: 1321321}
      let provs = this.$lodash.filter(provinces, p => {
        return p.regCode === region.regCode
      })
      return this.$lodash.map(provs, p => {
        return {label: p.provDesc, value: p.provDesc}
      })
    },
    citymuns () {
      let province = this.$lodash.find(provinces, p => {
        return p.provDesc === this.store.province
      }) || {provCode: 1321321}
      let citmunss = this.$lodash.filter(citymuns, p => {
        return p.provCode === province.provCode
      })
      return this.$lodash.map(citmunss, cm => {
        return {label: cm.citymunDesc, value: cm.citymunDesc}
      })
    },
    brgys () {
      let citymun = this.$lodash.find(citymuns, cm => {
        return cm.citymunDesc === this.store.citymun
      }) || {citymunCode: 1321321}
      let barangays = this.$lodash.filter(brgys, b => {
        return b.citymunCode === citymun.citymunCode
      })
      return this.$lodash.map(barangays, b => {
        return {label: b.brgyDesc, value: b.brgyDesc}
      })
    }
  },
  data () {
    return {
      isNew: true,
      search: '',
      stores: [],
      store: {
        name: null,
        owner: null,
        region: null,
        province: null,
        citymun: null,
        brgy: null
      },
      page: 1
    }
  },
  methods: {
    deleteStore (c) {
      console.log(c)
      let self = this
      Dialog.create({
        title: 'Warning',
        message: `Are you sure you want to delete ${c.name} | ${c.owner}?`,
        buttons: [
          'No',
          {
            label: 'Yes',
            handler (data, close) {
              self.$firebaseRefs.stores.child(c['.key']).remove()
            }
          }
        ]
      })
    },
    showItem (item) {
      let i = Object.assign({}, item)
      console.log(item)
      this.store = i
      this.$refs.newModal.open()
    },
    saveNew () {
      let store = Object.assign({}, this.store)
      delete store['.key']

      Loading.show()
      this.$firebaseRefs.stores.push(store)
      .then(() => {
        Loading.hide()
        this.$refs.newModal.close()
        Toast.create.positive({
          html: `${store.name} | ${store.owner} created`
        })
      })
      .catch(error => {
        Loading.hide()
        Toast.create.negative({
          html: `${error.code}: ${error.message}`
        })
      })
    },
    saveUpdate () {
      let item = Object.assign({}, this.store)
      let key = item['.key']
      delete item['.key']
      delete item.address

      this.$firebaseRefs.stores.child(key).update(item)
      .then(() => {
        Loading.hide()
        this.$refs.newModal.close()
        Toast.create.positive({
          html: `${item.name} | ${item.owner} created`
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
</script>

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
            <th class="text-left">Barcode</th>
            <th class="text-left">SKU</th>
            <th class="text-center">Name/ Desc.</th>
            <th class="text-left">Category</th>
            <th class="text-left">Company</th>
            <th class="text-left">Bus. Unit/ Brand</th>
            <th class="text-left">Unit</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
           <tr v-for="i in filteredItems" :key="i['.key']" @click="isNew = false">
            <td class="text-left" @click="showItem(i)">{{i.barcode}}</td>
            <td class="text-left" @click="showItem(i)">{{i.sku}}</td>
            <td class="text-left" @click="showItem(i)">{{i.nameDesc}}</td>
            <td class="text-left" @click="showItem(i)">{{i.category}}</td>
            <td class="text-left" @click="showItem(i)">{{i.company}}</td>
            <td class="text-left" @click="showItem(i)">{{i.brand}}</td>
            <td class="text-left" @click="showItem(i)">{{i.unit}}</td>
            <td class="text-right">
              <button class="circular small text-negative" @click="deleteItem(i)"><i>delete</i></button>
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
            <input v-model="item.barcode" required class="full-width">
            <label>barcode</label>
          </div>
          <div class="floating-label">
            <input v-model="item.sku" required class="full-width">
            <label>SKU</label>
          </div>
          <div class="floating-label">
            <textarea v-model="item.nameDesc" required class="full-width"></textarea>
            <label>Name/ Description</label>
          </div>
          <div class="floating-label">
            <input v-model="item.unit" required class="full-width">
            <label>Unit</label>
          </div>
          <q-select
            class=""
            type="list"
            label="Company"
            v-model="item.company"
            :options="companyOptions"
          ></q-select>
          <q-select
            class=""
            type="list"
            label="Brand"
            v-model="item.brand"
            :options="brandOptions"
          ></q-select>
          <q-select
            class=""
            type="list"
            label="Category"
            v-model="item.category"
            :options="categoryOptions"
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
console.log(Dialog)
// let FirebasePaginator = require('firebase-paginator')
// let itemsPaginator = null

export default {
  mounted () {
    this.$bindAsArray('companies', this.$database.ref('companies'))
    this.$bindAsArray('categories', this.$database.ref('categories'))
    this.$bindAsArray('items', this.$database.ref('items'))
    if (this.$store.state.user && this.$store.state.user.data && this.$store.state.user.data.type !== 'Admin') {
      this.$router.push('/login')
    }

    // let options = {
    //   pageSize: 10,
    //   finite: true
    // }
    // itemsPaginator = new FirebasePaginator(this.$database.ref('items'), options)

    // this.$database.ref('items').on('value', snapshot => {
    // })

    // let pages = snapshot.numChildren() / 10

    // itemsPaginator.on('value', () => {
    //   console.log('itemsPaginator', itemsPaginator)
    //   this.items = itemsPaginator.collection
    // })

    // itemsPaginator.reset()
    // .then(() => {
    //   this.items = itemsPaginator.collection
    // })
  },
  computed: {
    $user () {
      return this.$store.state.user
    },
    filteredItems () {
      if (this.items.length !== 0) {
        return this.items.filter((item) => {
          return item.sku.toLowerCase().indexOf(this.search.toLowerCase()) !== -1 ||
          item.company.toLowerCase().indexOf(this.search.toLowerCase()) !== -1 ||
          item.brand.toLowerCase().indexOf(this.search.toLowerCase()) !== -1 ||
          item.category.toLowerCase().indexOf(this.search.toLowerCase()) !== -1 ||
          item.unit.toLowerCase().indexOf(this.search.toLowerCase()) !== -1
        })
      }
      else {
        return this.items
      }
    },
    companyOptions () {
      let options = this.$lodash.map(this.companies, c => {
        let company = {label: c.name, value: c.code}
        return company
      })
      console.log(options)
      return options
    },
    brandOptions () {
      let index = this.$lodash.findIndex(this.companies, c => {
        return c.code === this.item.company
      })

      if (index !== -1) {
        console.log('this.companies', index)
        let options = this.$lodash.map(this.companies[index].brands, b => {
          return {label: b, value: b}
        })
        return options
      }
      else {
        return []
      }
    },
    categoryOptions () {
      let options = this.$lodash.map(this.categories, c => {
        return {label: c.name, value: c.code}
      })
      return options
    }
  },
  data () {
    return {
      isNew: true,
      search: '',
      companies: [],
      categories: [],
      items: [],
      item: {
        barcode: null,
        sku: null,
        company: {brands: []},
        brand: null,
        category: null,
        nameDesc: null,
        unit: null
      },
      page: 1
    }
  },
  methods: {
    deleteItem (c) {
      console.log(c)
      let self = this
      Dialog.create({
        title: 'Warning',
        message: `Are you sure you want to delete ${c.sku} | ${c.nameDesc}?`,
        buttons: [
          'No',
          {
            label: 'Yes',
            handler (data, close) {
              self.$firebaseRefs.items.child(c['.key']).remove()
            }
          }
        ]
      })
    },
    showItem (item) {
      let i = Object.assign({}, item)
      console.log(i.company)
      this.item = i
      this.$refs.newModal.open()
    },
    saveNew () {
      let item = Object.assign({}, this.item)
      delete item['.key']

      Loading.show()
      console.log(item)
      this.$firebaseRefs.items.push(item)
      .then(() => {
        Loading.hide()
        this.$refs.newModal.close()
        Toast.create.positive({
          html: `${item.sku} | ${item.nameDesc} created`
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
      let item = Object.assign({}, this.item)
      let key = item['.key']
      delete item['.key']

      this.$firebaseRefs.items.child(key).update(item)
      .then(() => {
        Loading.hide()
        this.$refs.newModal.close()
        Toast.create.positive({
          html: `${item.sku} | ${item.nameDesc} created`
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

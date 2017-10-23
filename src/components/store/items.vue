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
            <th class="text-left">Barcodee</th>
            <th class="text-left">SKU</th>
            <th class="text-left">Name/ Desc.</th>
            <!-- <th class="text-left">Category</th>
            <th class="text-left">Company</th>
            <th class="text-left">Bus. Unit/ Brand</th>
            <th class="text-left">Unit</th> -->
            <th class="text-left">Quantity</th>
            <!-- <th></th> -->
          </tr>
        </thead>
        <tbody>
           <tr v-for="i in filteredItems" :key="i['.key']" @click="isNew = false">
            <td data-th="Barcode" class="text-left" @click="showItem(i)">{{i.barcode}}</td>
            <td data-th="SKU" class="text-left" @click="showItem(i)">{{i.sku}}</td>
            <td data-th="Desc" class="text-left" @click="showItem(i)">{{i.nameDesc}}</td>
            <!-- <td data-th="Category" class="text-left" @click="showItem(i)">{{i.category}}</td>
            <td data-th="Company" class="text-left" @click="showItem(i)">{{i.company}}</td>
            <td data-th="Brand" class="text-left" @click="showItem(i)">{{i.brand}}</td>
            <td data-th="Unit" class="text-left" @click="showItem(i)">{{i.unit}}</td> -->
            <td data-th="Quantity" class="text-left" @click="showItem(i)">{{i.quantity}}</td>
            <!-- <td data-th="Name" class="text-right">
              <button class="circular small text-negative"><i>delete</i></button>
            </td> -->
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
    <button @click="showProductIn" style="bottom: 2em; right: 2em;" class="primary circular absolute-bottom-right raised">
      <i>add</i>
    </button>

    <q-modal :noEscDismiss="true" :noBackdropDismiss="true" ref="newModal">
      <div class="layout-padding">
        <h4>Scan Item</h4>
        <form>
          <div class="floating-label">
            <form v-on:submit.prevent="getItemInfo">
              <input ref="barcode" v-model="item.barcode" required class="full-width">
            </form>
            <label>barcode</label>
          </div>
          <div class="floating-label">
            <input placeholder="SKU" readonly v-model="item.sku" required class="full-width">
            <!-- <label>SKU</label> -->
          </div>
          <div class="floating-label">
            <textarea placeholder="Name/ Description" readonly v-model="item.nameDesc" required class="full-width"></textarea>
            <!-- <label>Name/ Description</label> -->
          </div>
          <div readonly placeholder="Unit" class="floating-label">
            <input readonly v-model="item.unit" required class="full-width">
          </div>
          <q-select
            readonly
            class=""
            type="list"
            label="Company"
            v-model="item.company"
            :options="companyOptions"
          ></q-select>
          <q-select
            readonly
            class=""
            type="list"
            label="Brand"
            v-model="item.brand"
            :options="brandOptions"
          ></q-select>
          <q-select
            readonly
            class=""
            type="list"
            label="Category"
            v-model="item.category"
            :options="categoryOptions"
          ></q-select>
          <q-numeric
            v-model="item.quantity"
            :min="1"
            :max="17"
          ></q-numeric>
        </form>
        <br>
        <div class="row pull-right">
          <button class="primary clear" @click="$refs.newModal.close()">cancel</button>
          <button class="primary" :disabled="!item.sku || quantityMaxDecrease < item.quantity" v-if="isNew" @click="isNew = false, saveNew(-item.quantity)"><i>remove_circle_outline</i></button> &nbsp
          <button class="primary" :disabled="!item.sku" v-if="isNew" @click="isNew = false, saveNew(item.quantity)"><i>add_circle_outline</i></button>
          <!-- <button class="primary" v-else @click="saveUpdate">Save</button> -->
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
    // this.$bindAsArray('items', this.$database.ref('items'))
    if (this.$store.state.user && this.$store.state.user.data && this.$store.state.user.data.type !== 'Store owner') {
      this.$router.push('/login')
    }

    this.$watch(() => {
      return this.$store.state.user && this.$store.state.user.data ? this.$store.state.user.data.type : null
    }, () => {
      if (this.$store.state.user && this.$store.state.user.data) {
        this.$database.ref('stores').orderByChild('name').equalTo(this.$store.state.user.data.store).on('child_added', snapshot => {
          console.log(snapshot.key, `stores/${snapshot.key}/items`)
          this.$store.state.user.data.storeKey = snapshot.key
          this.$bindAsArray('items', this.$database.ref(`stores/${snapshot.key}/items`))
        })
      }
    })

    if (this.$store.state.user && this.$store.state.user.data) {
      this.$database.ref('stores').orderByChild('name').equalTo(this.$store.state.user.data.store).on('child_added', snapshot => {
        console.log(snapshot.key, `stores/${snapshot.key}/items`)
        this.$store.state.user.data.storeKey = snapshot.key
        this.$bindAsArray('items', this.$database.ref(`stores/${snapshot.key}/items`))
      })
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
        unit: null,
        quantity: 1
      },
      page: 1,
      quantityMaxDecrease: 0
    }
  },
  methods: {
    getItemInfo () {
      this.$database.ref('items').orderByChild('barcode').equalTo(this.item.barcode).on('child_added', snapshot => {
        let itemIndex = this.$lodash.findIndex(this.items, {'barcode': this.item.barcode})

        if (itemIndex === -1) {
          this.item = snapshot.val()
          this.item.quantity = 1
          this.item['.key'] = snapshot.key

          this.quantityMaxDecrease = 0
        }
        else {
          this.item = Object.assign({}, this.items[itemIndex])
          this.item.quantity = 1

          this.quantityMaxDecrease = this.items[itemIndex].quantity
        }
      })
      // .catch(error => {
      //   this.loggingIn = false
      //   Toast.create.negative({
      //     html: `${error.code}: ${error.message}`
      //   })
      // })
    },
    showProductIn () {
      this.item = {
        barcode: null,
        sku: null,
        company: {brands: []},
        brand: null,
        category: null,
        nameDesc: null,
        unit: null
      }

      this.isNew = true
      this.$refs.newModal.open()
      setTimeout(() => {
        this.$refs.barcode.select()
        this.$refs.barcode.focus()
      }, 300)
    },
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
    saveNew (quantity) {
      Loading.show()
      let item = Object.assign({}, this.item)
      console.log(item)
      let key = item['.key']
      let today = this.$moment()

      if (quantity < 0) {
        this.$database.ref('items').orderByChild('barcode').equalTo(item.barcode).on('child_added', snapshot => {
          let itemMain = snapshot.val()
          let out = itemMain.out || 0
          itemMain.out = out + (quantity * -1)
          this.$database.ref('items/' + key + '/out').set(out + (quantity * -1))
          this.$database.ref(`itemsReports/${today.format('YYYY-MM-WW')}/${key}`).set(itemMain)
        })
      }

      let existingItemIndex = this.$lodash.findIndex(this.items, {'barcode': this.item.barcode})
      delete item['.key']

      if (existingItemIndex !== -1) {
        item.quantity = this.items[existingItemIndex].quantity + quantity
        this.$database.ref(`stores/${this.$store.state.user.data.storeKey}/itemsHistory/${today.format('YYYY-MM-WW-DD')}/${key}`).set(item)

        let log = {
          inout: quantity < 0 ? 'in' : 'out',
          year: today.format('YYYY'),
          month: today.format('MM'),
          yearmonth: `${today.format('YYYY')}-${today.format('MM')}`,
          yearmonthweek: `${today.format('YYYY')}-${today.format('MM')}-${today.format('WW')}`,
          day: today.format('DD'),
          time: today.format('hh:mmA'),
          user: this.$store.state.user.data.email,
          ...item
        }

        this.$database.ref(`stores/${this.$store.state.user.data.storeKey}/logs`).push(log)
        this.$database.ref(`stores/${this.$store.state.user.data.storeKey}/items/${key}`).set(item)
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
      else {
        this.$database.ref(`stores/${this.$store.state.user.data.storeKey}/itemsHistory/${today.format('YYYY-MM-WW-DD')}/${key}`).set(item)

        let log = {
          inout: quantity < 0 ? 'in' : 'out',
          year: today.format('YYYY'),
          month: today.format('MM'),
          yearmonth: `${today.format('YYYY')}-${today.format('MM')}`,
          yearmonthweek: `${today.format('YYYY')}-${today.format('MM')}-${today.format('WW')}`,
          day: today.format('DD'),
          time: today.format('hh:mmA'),
          user: this.$store.state.user.data.email,
          ...item
        }

        this.$database.ref(`stores/${this.$store.state.user.data.storeKey}/logs`).push(log)
        this.$database.ref(`stores/${this.$store.state.user.data.storeKey}/items/${key}`).set(item)
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
    } // ,
    // saveUpdate () {
    //   let item = Object.assign({}, this.item)
    //   let key = item['.key']
    //   delete item['.key']

    //   this.$firebaseRefs.items.child(key).update(item)
    //   .then(() => {
    //     Loading.hide()
    //     this.$refs.newModal.close()
    //     Toast.create.positive({
    //       html: `${item.sku} | ${item.nameDesc} created`
    //     })
    //   })
    //   .catch(error => {
    //     Loading.hide()
    //     Toast.create.negative({
    //       html: `${error.code}: ${error.message}`
    //     })
    //   })
    // }
  }
}
</script>

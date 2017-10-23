<style>
  .chart {
    max-width: 320px
  }
</style>

<template>
  <div>
    <div slot="header" class="toolbar primary">
      <q-toolbar-title :padding="0" class="row full-width flex">
        <div class="row full-width flex">
          <span style="padding: 8px 16px 0px 0px;" class="auto">Dashboard</span>
          <!-- <q-search style="max-width: 320px;" v-model="search" :model.sync="search" class="primary float-right"></q-search> -->
          
          <button :disabled="category !== 'All'" class="clear" @click="saveCheckPoint"><i>save</i> Save Checkpoint</button>
        </div>
      </q-toolbar-title>
    </div>
    <div class="layout-padding">
      <div class="row wrap">
        <q-select v-if="this.$store.state.user && this.$store.state.user.data"
          label="Category"
          type="list"
          v-model="category"
          :options="categoryOptions"
        ></q-select>
        
      </div>
      <br>
      <div class="row wrap">
        <doughnut-by-category class="chart" :chart-data="itemsOuts"></doughnut-by-category>
        <bar-by-category class="chart" v-for="b in brands" :chart-data="b" :key="b.name"></bar-by-category>
        {{items}}
      </div>
      
      <br>
      <!-- <pre>
        {{itemsOuts}}
      </pre> -->
    </div>
  </div>
</template>

<script>
// import {Dialog} from 'quasar'
import DoughnutByCategory from './DoughnutByCategory.js'
import BarByCategory from './BarByCategory.js'
// let FirebasePaginator = require('firebase-paginator')
// let itemsPaginator = null

export default {
  components: {
    DoughnutByCategory,
    BarByCategory
  },
  mounted () {
    if (this.$store.state.user && this.$store.state.user.data && this.$store.state.user.data.type !== 'Brand manager') {
      this.$router.push('/login')
    }

    this.$bindAsArray('categories', this.$database.ref('categories'))
    this.$store.watch((state) => {
      return state.user
    }, () => {
      this.getData()
    })

    this.getData()
  },
  computed: {
    itemsOuts () {
      if (this.$store.state.user && this.$store.state.user.data && this.$store.state.user.data.type === 'Brand manager') {
        let byCategory = {
          labels: [],
          datasets: [{
            label: 'My First dataset',
            backgroundColor: this.$lodash.map(this.$store.state.user.data.company.brands, (brand) => this.getRandomColor()),
            hoverBorderColor: 'rgba(255,99,132,1)',
            data: []
          }]
        }

        let items = this.category === 'All' ? this.items : this.$lodash.filter(this.items, {category: this.category})

        this.$lodash.map(this.$lodash.groupBy(items, 'brand'), (objs, key) => {
          if (key !== 'undefined') {
            byCategory.labels.push(key)
            byCategory.datasets[0].data.push(this.$lodash.sumBy(objs, 'out'))
            console.log(key)
            return {
              name: key,
              outs: this.$lodash.sumBy(objs, 'out')
            }
          }
        })

        this.byCategory = byCategory
        // byCategory

        this.brands = this.$lodash.map(this.$lodash.groupBy(items, 'brand'), (objs, key) => {
          if (key !== 'undefined') {
            console.log(key)
            return {
              labels: this.$lodash.map(objs, obj => obj.sku),
              datasets: [{
                label: key,
                backgroundColor: this.$lodash.map(this.$store.state.user.data.company.brands, (brand) => this.getRandomColor()),
                hoverBorderColor: 'rgba(255,99,132,1)',
                data: this.$lodash.map(objs, obj => obj.out)
              }]
            }
          }
        })

        return byCategory
        // console.log('this.byCategory.labels', this.byCategory.labels)
      }

      // return this.$lodash.groupBy(this.items, 'brand').length
      return this.byCategory
    },
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
      options.push({label: 'All', value: 'All'})
      return options
    }
  },
  data () {
    return {
      category: 'All',
      isNew: true,
      search: '',
      companies: [],
      categories: [],
      brands: [],
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
      page: 1,
      byCategory: {
        labels: [],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [],
          hoverBorderColor: 'rgba(255,99,132,1)',
          data: []
        }]
      }
    }
  },
  methods: {
    getData () {
      if (this.$store.state.user && this.$store.state.user.data) {
        this.$bindAsArray('items', this.$database.ref('items').orderByChild('brand').equalTo(this.$store.state.user.data.brand))
      }
    },
    saveCheckPoint () {
      this.category = 'All'
      this.category = 'All'
      this.getData()
      let moment = this.$moment()
      let dateNow = moment.format('YYYY-MM-WW-DD')
      let byCategory = JSON.parse(JSON.stringify(this.$lodash.clone(this.byCategory), (key, value) => {
        if (key === '_meta') {
          return undefined
        }
        return value
      }))

      let brands = JSON.parse(JSON.stringify(this.$lodash.clone(this.brands), (key, value) => {
        if (key === '_meta') {
          return undefined
        }
        return value
      }))

      let data = {
        date: dateNow,
        year: moment.format('YYYY'),
        month: moment.format('MM'),
        week: moment.format('WW'),
        day: moment.format('DD'),
        data: {
          byCategory: byCategory,
          brands: brands
        }
      }

      console.log(data.data.brands)
      // data.data.brands.datasets[0]._meta = null
      // data.data.byCategory.datasets['0']._meta = null

      setTimeout(() => {
        console.log(data)
        this.$database.ref('companies').orderByChild('code').equalTo(this.$store.state.user.data.company.code).once('value', (snapshot) => {
          console.log(`companies/${Object.keys(snapshot.val())[0]}/${this.$store.state.user.data.brand}/history/${dateNow}`)
          this.$database.ref(`companies/${Object.keys(snapshot.val())[0]}/${this.$store.state.user.data.brand}/history/${dateNow}`).set(data)
        })
      }, 500)
    },
    getRandomColor () {
      var letters = '0123456789ABCDEF'
      var color = '#'
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    }
  }
}
</script>

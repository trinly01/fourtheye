<template>
  <div>
    <div slot="header" class="toolbar primary">
      <q-toolbar-title :padding="0" class="row full-width flex">
        <div class="row full-width flex">
          <span style="padding: 8px 16px 0px 0px;" class="auto">Campaigns</span>
          <q-search style="max-width: 320px;" v-model="search" :model.sync="search" class="primary float-right"></q-search>
        </div>
      </q-toolbar-title>
    </div>
    <div class="layout-padding">
      <table class="q-table bordered highlight striped-odd loose full-width responsive">
        <thead>
          <tr>
            <th class="text-left">Period</th>
            <th class="text-left">Promo</th>
            <th class="text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filteredCampaigns" :key="s['.key']" @click="isNew = false">
            <td class="text-left" @click="showItem(s)">{{$moment(s.period.from).format('MMM DD, YYYY')}}<br>- {{$moment(s.period.to).format('MMM DD, YYYY')}}</td>
            <td class="text-left" @click="showItem(s)">{{s.promo}}</td>
            <td class="text-left" @click="showItem(s)">{{s.desc}}</td>
            <td class="text-right">
              <button class="circular small text-negative" @click="deleteCampaign(s)"><i>delete</i></button>
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
          <!-- <div class="floating-label">
            <input v-model="store.name" required class="full-width">
            <label>name</label>
          </div>
          <div class="floating-label">
            <input v-model="store.owner" required class="full-width">
            <label>owner</label>
          </div> -->
          <p class="caption">
            Period
          </p>
          <q-datetime-range
            type="datetime"
            v-model="campaign.period"
          ></q-datetime-range>
          <div class="floating-label">
            <input v-model="campaign.promo" required class="full-width">
            <label>Promo</label>
          </div>
          <div class="floating-label">
            <input v-model="campaign.desc" required class="full-width">
            <label>Description</label>
          </div>
          <q-uploader v-if="isNew" :hide-upload-button="true" @add="photoAdded" @remove="photoRemoved" :url="''" extensions="'.gif,.GIF,.jpg,.JPG,.jpeg,.JPEG,.png,.PNG'"></q-uploader>
          <img style="max-width: auto; max-height: 500px;" v-if="campaign.photo !== ''" :src="campaign.photo" alt="image">
        </form>
        <br>
        <div class="row pull-right">
          <button class="primary clear" @click="$refs.newModal.close()">cancel</button>
          <button class="primary" :disabled="campaign.period.from === '' || campaign.period.to === '' || campaign.promo === '' || campaign.desc === '' || uploadedPhoto === null" v-if="isNew" @click="isNew = false, saveNew()">Save</button>
          <button class="primary" :disabled="campaign.period.from === '' || campaign.period.to === '' || campaign.promo === '' || campaign.desc === '' || uploadedPhoto === null" v-else @click="saveUpdate">Save</button>
        </div>
        <br>
      </div>
    </q-modal>
  </div>
</template>
<script>
import {Dialog, Toast, Loading} from 'quasar'

// let storageRef = null

export default {
  mounted () {
    this.storageRef = this.$firebase.storage().ref()
    // this.$bindAsArray('companies', this.$database.ref('companies'))
    // this.$bindAsArray('categories', this.$database.ref('categories'))
    this.$bindAsArray('campaigns', this.$database.ref('campaigns'))
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
    filteredCampaigns () {
      return this.campaigns.filter((store) => {
        return store.promo.toLowerCase().indexOf(this.search.toLowerCase()) !== -1 ||
        store.desc.toLowerCase().indexOf(this.search.toLowerCase()) !== -1
      })
    }
  },
  data () {
    return {
      storageRef: null,
      uploadedPhoto: null,
      isNew: true,
      search: '',
      campaigns: [],
      campaign: {
        period: {
          from: '',
          to: ''
        },
        promo: '',
        desc: '',
        photo: ''
      },
      page: 1
    }
  },
  methods: {
    photoAdded (p) {
      this.uploadedPhoto = p[0]
    },
    photoRemoved () {
      this.uploadedPhoto = null
    },
    deleteCampaign (c) {
      console.log(c)
      let self = this
      Dialog.create({
        title: 'Warning',
        message: `Are you sure you want to delete ${c.promo}?`,
        buttons: [
          'No',
          {
            label: 'Yes',
            handler (data, close) {
              self.$firebaseRefs.campaigns.child(c['.key']).remove()
            }
          }
        ]
      })
    },
    showItem (item) {
      let i = Object.assign({}, item)
      console.log(item)
      this.campaign = i
      this.$refs.newModal.open()
    },
    saveNew () {
      let campaign = Object.assign({}, this.campaign)
      delete campaign['.key']

      Loading.show()
      console.log(this.uploadedPhoto)
      let uploadTask = this.storageRef.child('campaigns/' + this.campaign.promo + this.campaign.period.from + this.campaign.period.to).put(this.uploadedPhoto)

      uploadTask.then(snapshot => {
        console.log('PHOTO', snapshot)

        let photo = snapshot.downloadURL
        this.campaign.photo = photo
        console.log('campaign.photo', this.campaign.photo)

        setTimeout(() => {
          this.$firebaseRefs.campaigns.push(this.campaign)
          .then(() => {
            Loading.hide()
            this.campaign = {
              period: {
                from: '',
                to: ''
              },
              promo: '',
              desc: '',
              photo: ''
            }
            this.$refs.newModal.close()
            Toast.create.positive({
              html: `${campaign.promo} created`
            })
          })
          .catch(error => {
            Loading.hide()
            Toast.create.negative({
              html: `${error.code}: ${error.message}`
            })
          })
        }, 750)
      })

      uploadTask.on('state_changed', () => {}, error => {
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

      this.$firebaseRefs.campaigns.child(key).update(item)
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

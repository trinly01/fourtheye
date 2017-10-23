<style>
.layout-header {
   z-index: 5;
}
button {
  z-index: 100;
}
</style>


<template>
  <q-layout>
    </q-fab>
    <div slot="header" class="toolbar" style="position:relative; z-index: 5; ">
      <button class="hide-on-drawer-visible" @click="$refs.leftDrawer.open()">
        <i>menu</i>
      </button>
      <q-toolbar-title :padding="0">
        Property Inventory v{{$q.version}}
      </q-toolbar-title>
      <button class="circular small raised">
        <i>person</i>
        <q-popover ref="popover">
          <!--
            The DOM element(s) that make up the Dropdown menu,
            in this case a list
          -->
          <div class="list item-delimiter highlight" style="width: 250px">
            <div v-if="$user && $user.data" class="list-label">{{$user.data.displayName}} ({{$user.data.type}})</div>  
             <div v-if="$user && $user.data" class="item item-link" @click="showChangePassword">
              <div class="item-content">
                Change Password
              </div>
            </div>
            <div v-if="$user" class="item item-link" @click="logout">
              <div class="item-content">
                Logout
              </div>
            </div>
            <router-link to="/login">
              <div v-if="!$user" class="item item-link" @click="logout">
                <div class="item-content">
                  Login
                </div>
              </div>
            </router-link>  
          </div>
        </q-popover>
      </button>
    </div>

    <q-drawer ref="leftDrawer" v-if="$store.state.user">
      <div class="toolbar light">
        <q-toolbar-title :padding="1">
            {{ $store.state.user && $store.state.user.data ? $store.state.user.data.type : '' }} <br>
            {{ $user && $user.data && $user.data.store? $user.data.store : ''}}
            {{ $user && $user.data && $user.data.company && $user.data.type === 'Company manager'? $user.data.company.name : ''}}
            {{ $user && $user.data && $user.data.company && $user.data.type === 'Brand manager'? $user.data.brand : ''}}
        </q-toolbar-title>
      </div>

      <div v-if="$user && $user.data && $user.data.type === 'Company manager'" class="list no-border platform-delimiter">
        <div class="list-label">Management</div>
        <q-drawer-link icon="group" to="/company/dashboard" exact>
          Dashboard
        </q-drawer-link>
        <q-drawer-link icon="history" to="/company/history" exact>
          History
        </q-drawer-link>
      </div>

      <div v-if="$user && $user.data && $user.data.type === 'Brand manager'" class="list no-border platform-delimiter">
        <div class="list-label">Management</div>
        <q-drawer-link icon="group" to="/brand/dashboard" exact>
          Dashboard
        </q-drawer-link>
        <q-drawer-link icon="history" to="/brand/history" exact>
          History
        </q-drawer-link>
      </div>

      <div v-if="$user && $user.data && $user.data.type === 'Admin'" class="list no-border platform-delimiter">
        <div class="list-label">Management</div>
        <q-drawer-link icon="group" to="/admin" exact>
          Users
        </q-drawer-link>
        <q-drawer-link icon="group_work" to="/category" exact>
          Category
        </q-drawer-link>
        <q-drawer-link icon="branding_watermark" to="companyBrands" exact>
          Company & Brands
        </q-drawer-link>
        <q-drawer-link icon="shopping_basket" to="/item" exact>
          Item / Product
        </q-drawer-link>
        <q-drawer-link icon="store" to="/store" exact>
          Store
        </q-drawer-link>
        <q-drawer-link icon="volume_up" to="/campaign" exact>
          Campaign
        </q-drawer-link>
      </div>

      <div v-if="$user && $user.data && $user.data.type === 'Store owner'" class="list no-border platform-delimiter">
        <div class="list-label">Store Management</div>
        <q-drawer-link icon="shopping_basket" to="/storeItems" exact>
          Items / Products
        </q-drawer-link>
        <q-drawer-link icon="message" to="/storeMessages" exact>
          Messages
        </q-drawer-link>
      </div>
      <div v-if="$user && $user.data && $user.data.type === 'Admin'" class="list highlight no-border platform-delimiter">
        <div class="list-label">Messages</div>
        <div v-for="u in users" :key="u['.key']" class="item" @click="$router.push(`/message/${u.email}`)" :class="{'active': u.email === $route.params.email}" style="height: 72px" >
          <div class="item-content has-secondary">
            <div>{{u.displayName}}</div>
            <div class="item-label item-smaller">{{u.email}}</div>
            <div class="item-label item-smaller">{{u.type}}</div>
          </div>
          <br>
          <br>
        </div>
      </div>
    </q-drawer>

    <!--
      Replace following "div" with
      "<router-view class="layout-view">" component
      if using subRoutes
    -->
    <router-view class="layout-view"></router-view>
    <!-- <div class="layout-view">
       <div class="logo-container non-selectable no-pointer-events">
        <div class="logo" :style="position">
          <img src="~assets/quasar-logo.png">
          <p class="caption text-center">
            <span v-if="orienting || rotating">Tilt your device.</span>
            <template v-else>
              <span class="desktop-only">Move your mouse.</span>
              <span class="touch-only">Touch screen and move.</span>
            </template>
          </p>
        </div>
      </div> 
    </div> -->
  </q-layout>
</template>

<script>
import {Dialog, Loading, Toast} from 'quasar'

export default {
  mounted () {
    this.$bindAsArray('users', this.$database.ref('users'))
  },
  data () {
    return {
      users: []
    }
  },
  computed: {
    $user () {
      return this.$store.state.user
    }
  },
  methods: {
    logout () {
      return this.$auth.signOut()
    },
    showChangePassword () {
      Loading.show()
      this.$auth.sendPasswordResetEmail(this.$user.email)
      .then(() => {
        Dialog.create({
          title: 'Password Reset',
          message: `We sent your password reset link to your email: ${this.$user.email}`
        })
        Loading.hide()
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

<style scoped>
  .card {
    margin-bottom: 0px;
  }
  .card-content {
    min-height: 160px;
  }
  button {
    margin-bottom: 4%;
  }
  h4 {
    font-weight: 300;
  }
</style>


<template>
  <div class="flex justify-center items-center">
    <div class="card text-white text-center width-3of4 bg-width-2of5 gt-bg-width-1of4 sm-auto " id="login">
      <div class="card-title bg-primary">
        <i style="font-size: 100px;">person</i>
        <h4>Hello!</h4>
      </div>
      <form @submit.prevent="login">
      <div class="card-content bg-white ">
        <div class="stacked-label">
          <input required class="full-width" type="email" v-model="email">
          <label>Email</label>
        </div>
        <div class="stacked-label">
          <input required class="full-width" type="password" v-model="password">
          <label>Password</label>
        </div>
      </div>
      <div class="card-actions">
        <button class="teal fit " type="submit" :disabled="loggingIn">Login &nbsp; <spinner v-if="loggingIn" size="24" color="white"></spinner></button>
        <!-- <button class="red fit" @click="login()">Login Google</button> -->
        <!-- <button class="blue fit" @click="login()">Login Facebook</button> -->
      </div>
      </form>
    </div>
  </div>
</template>

<script>
import {Toast} from 'quasar'

export default {
  mounted () {
    console.log(this.$auth)
  },
  data () {
    return {
      email: '',
      password: '',
      loggingIn: false
    }
  },
  methods: {
    login () {
      this.loggingIn = true
      this.$auth.signInWithEmailAndPassword(this.email, this.password)
      .then(() => {
        this.loggingIn = false
      })
      .catch(error => {
        this.loggingIn = false
        Toast.create.negative({
          html: `${error.code}: ${error.message}`
        })
      })
    }
  }
}
</script>

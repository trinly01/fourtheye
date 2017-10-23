<template>
  <div class="column">
    <div class="toolbar">
      {{email}}
    </div>
    <div class="layout-view auto" style="max-height: 90vh" ref="messagesDiv">
      <div class="layout-padding">
      <!-- Message received from peer -->
      <!-- <div class="chat-other">
        <div class="chat-user">
          <img src="~assets/linux-avatar.png">
        </div>
        <div class="chat-date">
        7 minutes ago
        </div>
        <div class="chat-message">
          <p>
            hey, if you type in your pw, it will show as stars
          </p>
        </div>
      </div> -->
      <!-- Message sent by you -->
      <div v-for="msg in messages" :key="msg['.key']" :class="msg.fromto === 'admin' + $route.params.email ? 'chat-you' : 'chat-other'">
        <div class="chat-user">
          <img v-if="msg.fromto === 'admin' + $route.params.email" src="~assets/linux-avatar.png">
          <img v-else src="~assets/boy-avatar.png">
        </div>
        <div class="chat-date">
          {{$moment(msg.dateTime).fromNow()}} {{msg.from}}
        </div>
        <div class="chat-message">
          <p>
            {{msg.msg}}
          </p>
        </div>
      </div>
    </div>
    </div>
    <div class="row">
      <form @submit.prevent="send" class="auto row vertical-bottom" style="padding: 16px 16px 16px 16px;">
        <textarea v-model="message" placeholder="asd" class="auto"style="resize: none;"></textarea>
        <button type="submit" class="circular small clear primary">
          <i>send</i>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  beforeDestroy () {
    clearInterval(this.interval)
  },
  data () {
    return {
      interval: null,
      messagesAdminToStore: [],
      messagesStoreToAdmin: [],
      messagesAdminToAll: [],
      message: ''
    }
  },
  computed: {
    messages () {
      const node = this.$refs.messagesDiv
      if (node) {
        setTimeout(function () {
          node.scrollTop = node.scrollHeight
        }, 100)
      }
      let messages = this.$lodash.concat(this.messagesAdminToStore, this.messagesStoreToAdmin, this.messagesAdminToAll)
      return this.$lodash.sortBy(messages, ['.key'])
    },
    email () {
      this.$bindAsArray('messagesAdminToStore', this.$database.ref(`messages`).orderByChild('fromto').equalTo('admin' + this.$route.params.email))
      this.$bindAsArray('messagesStoreToAdmin', this.$database.ref(`messages`).orderByChild('fromto').equalTo(this.$route.params.email + 'admin'))
      this.$bindAsArray('messagesAdminToAll', this.$database.ref(`messages`).orderByChild('fromto').equalTo('adminall'))
      return this.$route.params.email
    }
  },
  mounted () {
    this.$watch(() => {
      return this.$store.state.user && this.$store.state.user.data ? this.$store.state.user.data.type : null
    }, () => {
      // console.log(this.$database.ref(`messages`).orderByChild('to'))
      if (this.$store.state.user && this.$store.state.user.data) {
        this.$bindAsArray('messagesAdminToStore', this.$database.ref(`messages`).orderByChild('fromto').equalTo('admin' + this.$route.params.email))
        this.$bindAsArray('messagesStoreToAdmin', this.$database.ref(`messages`).orderByChild('fromto').equalTo(this.$route.params.email + 'admin'))
        this.$bindAsArray('messagesAdminToAll', this.$database.ref(`messages`).orderByChild('fromto').equalTo('adminall'))
      }
    })

    if (this.$store.state.user && this.$store.state.user.data) {
      this.$bindAsArray('messagesAdminToStore', this.$database.ref(`messages`).orderByChild('fromto').equalTo('admin' + this.$route.params.email))
      this.$bindAsArray('messagesStoreToAdmin', this.$database.ref(`messages`).orderByChild('fromto').equalTo(this.$route.params.email + 'admin'))
      this.$bindAsArray('messagesAdminToAll', this.$database.ref(`messages`).orderByChild('fromto').equalTo('adminall'))
    }

    this.interval = setInterval(() => this.$forceUpdate(), 60000)
  },
  methods: {
    send () {
      let msg = {
        admin: this.$store.state.user.data.email,
        fromto: 'admin' + this.$route.params.email,
        msg: this.message,
        dateTime: this.$moment().format()
      }
      this.$firebaseRefs.messagesAdminToStore.push(msg).then(() => {
        this.message = ''
      })
    }
  }
}
</script>

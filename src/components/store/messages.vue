<template>
  <div class="column">
    <div class="toolbar">
      Messages
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
      <div v-for="msg in messages" :key="msg['.key']" :class="msg.fromto === $store.state.user.data.email + 'admin' ? 'chat-you' : 'chat-other'">
        <div class="chat-user">
          <img v-if="msg.fromto === 'admin' + $store.state.user.data.email" src="~assets/linux-avatar.png">
          <img v-else src="~assets/boy-avatar.png">
        </div>
        <div class="chat-date">
          {{$moment(msg.dateTime).fromNow()}}
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
    }
  },
  mounted () {
    this.$watch(() => {
      return this.$store.state.user && this.$store.state.user.data ? this.$store.state.user.data.type : null
    }, () => {
      // console.log(this.$database.ref(`messages`).orderByChild('to'))
      if (this.$store.state.user && this.$store.state.user.data) {
        this.$bindAsArray('messagesAdminToStore', this.$database.ref(`messages`).orderByChild('fromto').equalTo('admin' + this.$store.state.user.data.email))
        this.$bindAsArray('messagesStoreToAdmin', this.$database.ref(`messages`).orderByChild('fromto').equalTo(this.$store.state.user.data.email + 'admin'))
        this.$bindAsArray('messagesAdminToAll', this.$database.ref(`messages`).orderByChild('fromto').equalTo('adminall'))
        // this.$bindAsArray('messagesTo', this.$database.ref(`messages`).orderByChild('to').equalTo(this.$store.state.user.data.email))
        // this.$bindAsArray('messagesToAll', this.$database.ref(`messages`).orderByChild('to').equalTo('all'))
        // this.$bindAsArray('messagesFrom', this.$database.ref(`messages`).orderByChild('from').equalTo(this.$store.state.user.data.email))
      }
    })

    if (this.$store.state.user && this.$store.state.user.data) {
      this.$bindAsArray('messagesAdminToStore', this.$database.ref(`messages`).orderByChild('fromto').equalTo('admin' + this.$store.state.user.data.email))
      this.$bindAsArray('messagesStoreToAdmin', this.$database.ref(`messages`).orderByChild('fromto').equalTo(this.$store.state.user.data.email + 'admin'))
      this.$bindAsArray('messagesAdminToAll', this.$database.ref(`messages`).orderByChild('fromto').equalTo('adminall'))
    }

    this.interval = setInterval(() => this.$forceUpdate(), 60000)
  },
  methods: {
    send () {
      let msg = {
        to: 'admin',
        fromto: this.$store.state.user.data.email + 'admin',
        fromStore: this.$store.state.user.data.store,
        msg: this.message,
        dateTime: this.$moment().format()
      }
      this.$firebaseRefs.messagesStoreToAdmin.push(msg).then(() => {
        this.message = ''
      })
    }
  }
}
</script>

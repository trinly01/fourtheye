import { Doughnut, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default Doughnut.extend({
  mixins: [reactiveProp],
  props: ['chartData', 'chartOptions'],
  data () {
    return {
      data: {
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
  mounted () {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.data = Object.assign(this.data, this.chartData)

    this.$watch('data', function (newVal, oldVal) {
      this.renderChart(this.data, this.chartOptions)
    })

    this.renderChart(this.data, this.chartOptions)
  }
})

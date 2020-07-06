import Vue from 'vue'

Vue.filter('fromNow', function (date, format) {
  if (!date) return ''

  if (_.isEmpty(format)) {
      format = 'YYYY-MM-DD hh:mm:ss'
  }

  return moment(date, format).fromNow()
})
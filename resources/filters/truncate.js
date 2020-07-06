import Vue from 'vue'

Vue.filter('truncate', function (string, length) {
  if (!string) return ''
  string = string.toString()
  return _.truncate(string, { length })
})

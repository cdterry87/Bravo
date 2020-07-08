<template>
  <v-container fluid grid-list-md>
    <v-layout row>
      <Loading v-if="isLoading" />
      <v-container v-else>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          filled
          color="blue darken-3"
        />
        <v-data-table
          :headers="headers"
          :items="issues"
          :search="search"
          class="elevation-1"
          no-data-text="You do not currently have any unresolved issues."
          :sort-by="['resolved', 'priority', 'name']"
          hide-default-footer
          :items-per-page="-1"
        >
          <template v-slot:item.resolved="{ item }">
            <span class="hidden">{{ item.resolved }}</span>
            <span v-if="item.resolved">
              <v-icon color="success" @click="resolveIssue(item.id, false)">mdi-checkbox-marked-circle</v-icon>
            </span>
            <span v-else>
              <v-icon color="error" @click="resolveIssue(item.id, true)">mdi-alert</v-icon>
            </span>
          </template>

          <template v-slot:item.details="{ item }">
            {{ item.details | truncate(100) }}
          </template>

          <template v-slot:item.created_at="{ item }">
            {{ item.created_at | fromNow }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-form method="POST" id="deleteForm" @submit.prevent="deleteIssue(item.id)">
              <v-btn text small :to="'/project/' + item.project.id" color="primary" class="white--text">
                View
              </v-btn>
              <v-btn text small type="submit" color="red darken-1" class="white--text">
                Delete
              </v-btn>
            </v-form>
          </template>
        </v-data-table>
      </v-container>
    </v-layout>
  </v-container>
</template>

<script>
  import Event from '../events'
  import Loading from './../components/Loading'
  import { GET_UNRESOLVED_ISSUES } from '../../graphql/queries'
  import { SAVE_ISSUE, RESOLVE_ISSUE, DELETE_ISSUE } from '../../graphql/mutations'

  export default {
    name: 'Issues',
    components: {
      Loading,
    },
    data() {
      return {
        dialog: false,
        issues: [],
        search: '',
        headers: [
          { text: 'Status', value: 'resolved' },
          { text: 'ID', value: 'id' },
          { text: 'Priority', value: 'priority' },
          { text: 'Details', value: 'details' },
          { text: 'Project', value: 'project.name' },
          { text: 'Created', value: 'created_at' },
          { text: 'Actions', value: 'actions', sortable: false },
        ],
        isLoading: false,
        hasError: false
      }
    },
    apollo: {
      getIssues: {
        query: GET_UNRESOLVED_ISSUES,
        watchLoading (isLoading) {
          this.isLoading = isLoading
        },
        update (data) {
          if (!Object.keys(data).length) {
            this.hasError = true
            return
          }
          if (data.unresolvedIssues) {
            this.issues = data.unresolvedIssues
          } else {
            console.error('Failed to load issues.')
          }
        },
        error () {
          this.projects = []
          this.hasError = true
        }
      }
    },
    methods: {
      resolveIssue(id, resolved) {
        let resolved_date = (resolved ? moment().format('YYYY-MM-DD') : null)

        this.$apollo.mutate(
          {
            mutation: RESOLVE_ISSUE,
            variables: {
              id,
              resolved,
              resolved_date
            }
          }
        ).then((response) => {
          Event.$emit('alert', {
            message: `Issue #${ response.data.results.id } is now ` + (resolved ? 'resolved.' : 'unresolved.'),
            color: resolved ? 'success' : 'warning'
          })
        }).catch(() => {
          console.error('Could not resolve issue.')
        })
      },
      deleteIssue(id) {
        this.$apollo.mutate(
          {
            mutation: DELETE_ISSUE,
            variables: {
              id
            }
          }
        ).then((response) => {
          this.$apollo.queries.getIssues.refetch()

          Event.$emit('alert', {
            message: `Issue #${ response.data.results.id } deleted successfully.`,
            color: 'error'
          })
        }).catch(() => {
          console.log('Could not delete issue')
        })
      }
    },
  }
</script>

<style lang="scss" scoped>

</style>
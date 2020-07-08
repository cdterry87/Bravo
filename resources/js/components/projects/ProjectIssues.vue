<template>
  <v-container fluid grid-list-md>
    <v-layout align-baseline>
      <v-flex xs12>
        <v-card>
          <v-card-text>
            <v-layout align-baseline>
              <v-flex xs6>
                <span class="headline">
                  <v-icon>mdi-bug</v-icon>Issues
                </span>
              </v-flex>
              <v-flex xs6 text-right>
                <v-btn color="primary" @click="dialog = true" text small>
                  <v-icon left dark>mdi-plus</v-icon>Add Issue
                </v-btn>
              </v-flex>
            </v-layout>

            <div v-if="project.issues" class="mt-3">
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
                filled
              ></v-text-field>
              <v-data-table
                :headers="headers"
                :items="project.issues"
                :search="search"
                :sort-by="['resolved']"
                :items-per-page="-1"
                hide-default-footer
                no-data-text="This project does not currently have any issues."
              >
                <template v-slot:item.resolved="{ item }">
                  <span class="hidden">{{ item.resolved }}</span>
                  <span v-if="item.resolved">
                    <v-icon
                      class="pointer"
                      color="success"
                      @click="resolveIssue(item.id, false)"
                    >mdi-checkbox-marked-circle</v-icon>
                  </span>
                  <span v-else>
                    <v-icon
                      class="pointer"
                      color="error"
                      @click="resolveIssue(item.id, true)"
                    >mdi-minus-circle</v-icon>
                  </span>
                </template>

                <template v-slot:item.details="{ item }">
                  {{ item.details | truncate(100) }}
                </template>

                <template v-slot:item.created_at="{ item }">
                  <span class="hidden">{{ item.created_at }}</span>
                  {{ item.created_at | fromNow }}
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-form
                    method="POST"
                    id="deleteForm"
                    @submit.prevent="deleteIssue(item.id)"
                  >
                    <v-btn
                      small
                      text
                      color="primary"
                      class="white--text"
                      @click="editIssue(item)"
                    >Edit</v-btn>
                    <v-btn small text type="submit" color="red darken-1" class="white--text">Delete</v-btn>
                  </v-form>
                </template>
              </v-data-table>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <v-dialog v-model="dialog" width="500">
      <v-form method="POST" id="issueForm" @submit.prevent="saveIssue" ref="form">
        <v-card>
          <v-card-title class="blue darken-3 white--text py-4 title">Save Issue</v-card-title>
          <v-container grid-list-sm class="pa-4">
            <v-layout row wrap>
              <v-flex xs12>
                <v-textarea
                  prepend-icon="mdi-text"
                  label="Details"
                  v-model="details"
                  :rules="[v => !!v || 'Details is required']"
                  required
                ></v-textarea>
              </v-flex>
              <v-flex xs12>
                <v-radio-group
                  v-model="priority"
                  row
                  required
                  :rules="[v => !!v || 'Priority is required']"
                >
                  <template v-slot:label>
                    <div>Priority:</div>
                  </template>
                  <v-radio label="1" :value="1" />
                  <v-radio label="2" :value="2" />
                  <v-radio label="3" :value="3" />
                  <v-radio label="4" :value="4" />
                  <v-radio label="5" :value="5" />
                </v-radio-group>
              </v-flex>
            </v-layout>
          </v-container>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn type="submit" text color="blue darken-2">Save</v-btn>
            <v-btn text color="red darken-2" form="projectForm" @click="dialog = false">Cancel</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-container>
</template>

<script>
import Event from '../../events'
import { SAVE_ISSUE, RESOLVE_ISSUE, DELETE_ISSUE } from '../../../graphql/mutations'

export default {
  name: 'ProjectIssues',
  props: ['project'],
  data() {
    return {
      dialog: false,
      details: '',
      priority: '',
      search: '',
      headers: [
        { text: 'Status', value: 'resolved' },
        { text: 'ID', value: 'id' },
        { text: 'Priority', value: 'priority' },
        { text: 'Details', value: 'details' },
        { text: 'Created', value: 'created_at' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    };
  },
  methods: {
    addIssue() {
      this.dialog = true

      this.priority = ''
      this.details = ''
      this.issue_id = ''
    },
    editIssue(issue) {
      this.dialog = true;

      this.priority = issue.priority
      this.details = issue.details
      this.issue_id = issue.id
    },
    saveIssue() {
      this.$apollo
        .mutate({
          mutation: SAVE_ISSUE,
          variables: {
            input: {
              id: (this.issue_id ? this.issue_id : null),
              project_id: this.project.id,
              details: this.details,
              priority: this.priority
            }
          }
        })
        .then(response => {
          this.dialog = false

          this.$emit('refetchProject')
        })
        .catch(() => {
          console.error('Could not save issue.')
        })
    },
    resolveIssue(id, resolved) {
      let resolved_date = resolved ? moment().format('YYYY-MM-DD') : null

      this.$apollo
        .mutate({
          mutation: RESOLVE_ISSUE,
          variables: {
            id,
            resolved,
            resolved_date
          }
        })
        .then(response => {
          Event.$emit('alert', {
            message: `Issue #${ response.data.results.id } is now ` + (resolved ? 'resolved.' : 'unresolved.'),
            color: resolved ? 'success' : 'warning'
          })
        })
        .catch(() => {
          console.error('Could not resolve issue.')
        })
    },
    deleteIssue(id) {
      this.$apollo
        .mutate({
          mutation: DELETE_ISSUE,
          variables: {
            id
          }
        })
        .then(response => {
          this.$emit('refetchProject')
          Event.$emit('alert', {
            message: `Issue #${ response.data.results.id } has been deleted.`,
            color: 'error'
          })
        })
        .catch(() => {
          console.error('Could not delete issue.')
        })
    }
  }
}
</script>

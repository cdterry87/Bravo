<template>
  <v-container fluid grid-list-md>
    <v-layout align-baseline>
      <v-flex xs12>
        <v-card>
          <v-card-text>
            <v-layout align-baseline>
              <v-flex xs6>
                <span class="headline">
                  <v-icon>mdi-briefcase</v-icon>Projects
                </span>
              </v-flex>
              <v-flex xs6 text-right>
                <v-btn color="primary" @click="dialog = true" text small>
                  <v-icon left dark>mdi-pencil</v-icon>Add Project
                </v-btn>
              </v-flex>
            </v-layout>

            <div v-if="client.projects" class="mt-3">
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
                :items="client.projects"
                :search="search"
                no-data-text="This client does not currently have any projects."
                :sort-by="['completed', 'due_date']"
                :items-per-page="-1"
                hide-default-footer
              >
                <template v-slot:item.completed="{ item }">
                  <span class="hidden">{{ item.completed }}</span>
                  <span v-if="item.completed">
                    <v-icon color="success" @click="completeProject(item.id, false)">mdi-checkbox-marked-circle</v-icon>
                  </span>
                  <span v-else-if="!item.completed && item.due_date != '' && item.due_date != null && new Date(item.due_date) < Date.now()">
                    <v-icon color="error" @click="completeProject(item.id, true)">mdi-alert</v-icon>
                  </span>
                  <span v-else-if="!item.completed">
                    <v-icon color="warning" @click="completeProject(item.id, true)">mdi-minus-circle</v-icon>
                  </span>
                </template>

                <template v-slot:item.due_date="{ item }">
                  {{ item.due_date | fromNow }}
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-form method="POST" id="deleteForm" @submit.prevent="deleteProject(item.id)">
                    <v-btn text small :to="'/project/' + item.id" color="primary" class="white--text">
                      View
                    </v-btn>
                    <v-btn text small type="submit" color="red darken-1" class="white--text">
                      Delete
                    </v-btn>
                  </v-form>
                </template>
              </v-data-table>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <v-dialog v-model="dialog" width="500">
      <v-form
        method="POST"
        id="projectForm"
        @submit.prevent="saveProject"
        ref="form"
        lazy-validation
      >
        <v-card>
          <v-card-title class="blue darken-3 white--text py-4 title">Add Project</v-card-title>
          <v-container grid-list-sm class="pa-4">
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  prepend-icon="mdi-briefcase"
                  label="Project Name"
                  v-model="name"
                  maxlength="100"
                  :rules="[v => !!v || 'Name is required']"
                  required
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-textarea prepend-icon="mdi-text" label="Details" v-model="details"></v-textarea>

                <v-dialog
                  ref="datePicker"
                  v-model="date_dialog"
                  :return-value.sync="due_date"
                  persistent
                  width="300"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="due_date"
                      label="Due Date"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="due_date" scrollable @change="dueDate">
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="date_dialog = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="$refs.dialog.save(due_date)">OK</v-btn>
                    <v-spacer></v-spacer>
                  </v-date-picker>
                </v-dialog>
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
import { SAVE_PROJECT, COMPLETE_PROJECT, DELETE_PROJECT } from '../../../graphql/mutations'

export default {
  name: 'ClientProjects',
  props: ['client'],
  data() {
    return {
      dialog: false,
      date_dialog: false,
      name: '',
      details: '',
      due_date: '',
      search: '',
      headers: [
        { text: 'Status', value: 'completed' },
        { text: 'Name', value: 'name' },
        { text: 'Due', value: 'due_date' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    };
  },
  methods: {
    dueDate(due_date) {
      this.date_dialog = false
      this.$refs.datePicker.save(due_date)
    },
    saveProject() {
      this.$apollo.mutate(
          {
            mutation: SAVE_PROJECT,
            variables: {
              input: {
                client_id: this.client.id,
                name: this.name,
                details: this.details,
                due_date: this.due_date,
              }
            }
          }
        ).then((response) => {
          this.dialog = false
          this.$emit('refetchClient')
          Event.$emit('alert', {
            message: `Project #${ response.data.results.id } saved successfully.`,
            color: 'success'
          })
        }).catch(() => {
          console.log('Could not save project.')
        })
    },
    completeProject(id, completed) {
      this.isLoading = true
      let completed_date = (completed ? moment().format('YYYY-MM-DD') : null)

      this.$apollo.mutate(
        {
          mutation: COMPLETE_PROJECT,
          variables: {
            id,
            completed,
            completed_date
          }
        }
      ).then((response) => {
        this.isLoading = false

        Event.$emit('alert', {
          message: `Project #${ response.data.results.id } is now ` + (completed ? 'complete.' : 'incomplete.'),
          color: completed ? 'success' : 'warning'
        })
      }).catch(() => {
        this.isLoading = false
      })
    },
    deleteProject(id) {
      this.$apollo
        .mutate({
          mutation: DELETE_PROJECT,
          variables: {
            id
          }
        })
        .then(response => {
          this.$emit('refetchClient')
          Event.$emit('alert', {
            message:`Project #${ response.data.results.id } has been deleted.`,
            color: 'error'
          })
        })
        .catch(() => {
          console.error('Could not delete project.')
        })
    },
    reset() {
      this.dialog = false;
      this.name = ''
      this.details = ''
      this.due_date = ''
    }
  }
}
</script>

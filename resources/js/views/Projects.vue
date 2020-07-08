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
          :items="projects"
          :search="search"
          class="elevation-1"
          no-data-text="You do not currently have any projects."
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
      </v-container>
    </v-layout>

    <v-dialog v-model="dialog" width="500">
      <v-form method="POST" id="projectForm" @submit.prevent="saveProject" ref="form" lazy-validation>
        <v-card>
          <v-card-title class="blue darken-3 white--text py-4 title">Save Project</v-card-title>
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
                <v-autocomplete
                  :items="clients"
                  item-text="name"
                  item-value="id"
                  label="Select a client"
                  prepend-icon="mdi-account"
                  v-model="client_id"
                  required
                  :rules="[v => !!v || 'Client is required']"
                />
              </v-flex>
              <v-flex xs12>
                <v-textarea
                  prepend-icon="mdi-note-text"
                  label="Details"
                  v-model="details"
                ></v-textarea>
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
                    />
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

    <v-fab-transition>
      <v-btn
        fixed
        color="green"
        fab
        large
        dark
        bottom
        right
        @click="dialog = true"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-fab-transition>
  </v-container>
</template>

<script>
  import Event from '../events'
  import Loading from './../components/Loading'
  import { GET_PROJECTS, GET_ACTIVE_CLIENTS } from '../../graphql/queries'
  import { SAVE_PROJECT, COMPLETE_PROJECT, DELETE_PROJECT } from '../../graphql/mutations'

  export default {
    name: 'Projects',
    components: {
      Loading,
    },
    data() {
      return {
        dialog: false,
        date_dialog: false,
        name: '',
        details: '',
        due_date: '',
        client_id: '',
        projects: [],
        clients: [],
        search: '',
        headers: [
          { text: 'Status', value: 'completed' },
          { text: 'ID', value: 'id' },
          { text: 'Name', value: 'name' },
          { text: 'Client', value: 'client.name' },
          { text: 'Due', value: 'due_date' },
          { text: 'Actions', value: 'actions', sortable: false },
        ],
        isLoading: false,
        hasError: false
      }
    },
    apollo: {
      getProjects: {
        query: GET_PROJECTS,
        watchLoading (isLoading) {
          this.isLoading = isLoading
        },
        update (data) {
          if (!Object.keys(data).length) {
            this.hasError = true
            return
          }
          if (data.projects) {
            this.projects = data.projects
          } else {
            console.error('Failed to load projects.')
          }
        },
        error () {
          this.projects = []
          this.hasError = true
        }
      },
      getActiveClientNames: {
        query: GET_ACTIVE_CLIENTS,
        update (data) {
          this.clients = data.activeClients
        },
        error () {
          this.clients = []
        }
      }
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
                client_id: this.client_id,
                name: this.name,
                details: this.details,
                due_date: this.due_date,
              }
            }
          }
        ).then((response) => {
          this.dialog = false
          Event.$emit('alert', {
            message: `Project #${ response.data.results.id } created successfully.`,
            color: 'success'
          })
          this.$apollo.queries.getProjects.refetch()
          this.reset()
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
        this.isLoading = true

        this.$apollo.mutate(
          {
            mutation: DELETE_PROJECT,
            variables: {
              id
            }
          }
        ).then((response) => {
          this.isLoading = false
          this.$apollo.queries.getProjects.refetch()

          Event.$emit('alert', {
            message: `Project #${ response.data.results.id } deleted successfully.`,
            color: 'error'
          })
        }).catch(() => {
          this.isLoading = false
        })
      },
      reset() {
        this.dialog = false
        this.name = ''
        this.details = ''
        this.due_date = ''
        this.client_id = ''
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
<template>
  <div>
    <Loading v-if="isLoading" />
    <div v-else-if="!isLoading && project.id">
      <v-container fluid grid-list-md>
        <v-layout row>
          <v-flex xs12>
            <v-card>
              <v-alert
                :type="alertType"
                class="pointer"
                @click.native="completeProject(!project.completed)"
              >
                {{ alertMessage }}
              </v-alert>
              <v-card-text>
                <div>
                  #{{ project.id }}
                </div>
                <v-layout align-baseline class="mt-2">
                  <v-flex xs6>
                    <span class="title">
                      <v-icon>mdi-briefcase</v-icon>
                      {{ project.name }}
                    </span>
                    <p class="mt-2" v-html="project.details" />
                  </v-flex>
                  <v-flex xs6 text-right>
                    <v-btn color="primary" @click="dialog = true" text small>
                      <v-icon left dark>mdi-pencil</v-icon>Edit
                    </v-btn>
                  </v-flex>
                </v-layout>
                <div class="mt-4" v-if="project.client">
                  <span class="title">
                    <v-icon>mdi-account-group</v-icon>Client
                  </span>
                  <div>
                    <div class="mt-2">
                      <router-link
                        :to="'/client/' + project.client.id"
                        class="primary--text"
                      >{{ project.client.name }}</router-link>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>

      <ProjectTasks
        @refetchProject="refetchProject"
        :project="project"
      />

      <ProjectIssues
        @refetchProject="refetchProject"
        :project="project"
      />

      <v-dialog v-model="dialog" width="500">
        <v-form
          method="POST"
          id="editProjectForm"
          @submit.prevent="saveProject"
          ref="form"
        >
          <v-card>
            <v-card-title class="blue darken-3 white--text py-4 title">Save Project</v-card-title>
            <v-container grid-list-sm class="pa-4">
              <v-layout row wrap>
                <v-flex xs12>
                  <v-text-field
                    :rules="[v => !!v || 'Name is required']"
                    prepend-icon="mdi-briefcase"
                    label="Project Name"
                    v-model="project.name"
                    maxlength="100"
                    required
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-textarea
                    prepend-icon="mdi-text"
                    label="Details"
                    v-model="project.details"
                  ></v-textarea>

                  <v-dialog
                    ref="datePicker"
                    v-model="date_dialog"
                    :return-value.sync="project.due_date"
                    persistent
                    width="300"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="project.due_date"
                        label="Due Date"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker v-model="project.due_date" scrollable @change="dueDate">
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
              <v-btn text color="red darken-2" form="editProjectForm" @click="dialog = false">Cancel</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>
    </div>
    <div v-else>
      <v-container fluid grid-list-md>
        <v-layout row>
          <v-flex xs12 class="text-sm-center mt-3">
            <p class="headline">
              <v-icon>mdi-alert</v-icon>Sorry, this project could not be loaded.
            </p>
            <p class="subheading">This project either contains an error or does not exist.</p>

            <v-btn type="submit" text color="blue darken-2" to="/">
              <v-icon left>mdi-briefcase</v-icon>Return to Projects
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </div>
  </div>
</template>

<script>
import Event from '../events'
import Loading from './../components/Loading'
import ProjectTasks from './../components/projects/ProjectTasks'
import ProjectIssues from './../components/projects/ProjectIssues'
import { GET_PROJECT } from '../../graphql/queries'
import { SAVE_PROJECT, COMPLETE_PROJECT, DELETE_PROJECT } from '../../graphql/mutations'

export default {
  name: 'Project',
  props: ['id'],
  components: {
    Loading,
    ProjectTasks,
    ProjectIssues
  },
  data() {
    return {
      dialog: false,
      date_dialog: false,
      isLoading: false,
      hasError: false,
      project: {}
    }
  },
  computed: {
    alertType () {
      return this.project.completed
        ? 'success'
        : (!this.project.completed && this.project.due_date && this.daysOverdue > 0)
          ? 'error'
          : 'warning'
    },
    alertMessage () {
      return this.project.completed
        ? 'This project is complete.'
        : (!this.project.completed && this.project.due_date && this.daysOverdue > 0)
          ? 'This project is ' + this.daysOverdue + ' days overdue.'
          : 'This project is due in ' + Math.abs(this.daysOverdue) + ' days.'
    },
    daysOverdue () {
      return moment().diff(this.project.due_date, 'days')
    }
  },
  apollo: {
    getProject: {
      query: GET_PROJECT,
      variables () {
        return {
          id: this.id
        }
      },
      watchLoading(isLoading) {
        this.isLoading = isLoading
      },
      update(data) {
        if (!Object.keys(data).length) {
          this.hasError = true
          return
        }
        if (data.project) {
          this.project = data.project
        } else {
          console.error('Failed to load project.')
        }
      },
      error() {
        this.project = []
        this.hasError = true
      }
    }
  },
  methods: {
    dueDate(due_date) {
      this.date_dialog = false
      this.$refs.datePicker.save(due_date)
    },
    saveProject() {
      this.$apollo
        .mutate({
          mutation: SAVE_PROJECT,
          variables: {
            input: {
              id: this.project.id,
              client_id: this.project.client.id,
              name: this.project.name,
              details: this.project.details,
              due_date: this.project.due_date
            }
          }
        })
        .then(response => {
          this.dialog = false
          Event.$emit('alert', {
            message: `Project #${ response.data.results.id } updated successfully.`,
            color: 'success'
          })
        })
        .catch(() => {
          console.error('Could not save project.')
        })
    },
    refetchProject() {
      this.$apollo.queries.getProject.refetch()
    },
    completeProject(completed) {
      let id = this.id
      let completed_date = completed ? moment().format('YYYY-MM-DD') : null

      this.$apollo
        .mutate({
          mutation: COMPLETE_PROJECT,
          variables: {
            id,
            completed,
            completed_date
          }
        })
        .then(response => {
          Event.$emit('alert', {
            message: `Project #${ response.data.results.id } is now ` + (completed ? 'complete.' : 'incomplete.'),
            color: completed ? 'success' : 'warning'
          })
        })
        .catch(() => {
          console.error('Could not complete project.')
        })
    },
    deleteProject() {
      let id = this.project.id

      this.$apollo
        .mutate({
          mutation: DELETE_PROJECT,
          variables: {
            id
          }
        })
        .then(response => {
          this.$router.push('projects')
        })
        .catch(() => {
          console.error('Could not delete project.')
        })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
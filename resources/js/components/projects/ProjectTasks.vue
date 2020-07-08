<template>
  <v-container fluid grid-list-md>
    <v-layout align-baseline>
      <v-flex xs12>
        <v-card>
          <v-card-text>
            <v-layout align-baseline>
              <v-flex xs6>
                <span class="headline">
                  <v-icon>mdi-format-list-bulleted-square</v-icon>Tasks
                </span>
              </v-flex>
              <v-flex xs6 text-right>
                <v-btn color="primary" @click="addTask" text small>
                  <v-icon left dark>mdi-plus</v-icon>Add Task
                </v-btn>
              </v-flex>
            </v-layout>

            <div v-if="project.tasks" class="mt-3">
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
                :items="project.tasks"
                :search="search"
                :sort-by="['completed', 'due_date']"
                :items-per-page="-1"
                hide-default-footer
                no-data-text="This project does not currently have any tasks."
              >
                <template v-slot:item.completed="{ item }">
                  <span class="hidden">{{ item.completed }}</span>
                  <span v-if="item.completed">
                    <v-icon color="success" @click="completeTask(item.id, false)">mdi-checkbox-marked-circle</v-icon>
                  </span>
                  <span v-else-if="!item.completed && item.due_date != '' && item.due_date != null && new Date(item.due_date) < Date.now()">
                    <v-icon color="error" @click="completeTask(item.id, true)">mdi-alert</v-icon>
                  </span>
                  <span v-else-if="!item.completed">
                    <v-icon color="warning" @click="completeTask(item.id, true)">mdi-minus-circle</v-icon>
                  </span>
                </template>

                <template v-slot:item.due_date="{ item }">
                  <span class="hidden">{{ item.due_date }}</span>
                  {{ item.due_date | fromNow }}
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-form
                    method="POST"
                    id="deleteForm"
                    @submit.prevent="deleteTask(item.id)"
                  >
                    <v-btn
                      small
                      text
                      color="primary"
                      class="white--text"
                      @click="editTask(item)"
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
      <v-form method="POST" id="taskForm" @submit.prevent="saveTask" ref="form">
        <input type="hidden" name="task_id" v-model="task_id" />
        <v-card>
          <v-card-title class="blue darken-3 white--text py-4 title">Save Task</v-card-title>
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
            <v-btn text color="red darken-2" form="taskForm" @click="dialog = false">Cancel</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-container>
</template>

<script>
import Event from '../../events'
import { SAVE_TASK, COMPLETE_TASK, DELETE_TASK } from '../../../graphql/mutations'

export default {
  name: 'ProjectTasks',
  props: ['project'],
  data() {
    return {
      dialog: false,
      date_dialog: false,
      details: '',
      due_date: '',
      task_id: '',
      search: '',
      headers: [
        { text: 'Status', value: 'completed' },
        { text: 'ID', value: 'id' },
        { text: 'Details', value: 'details' },
        { text: 'Due Date', value: 'due_date' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    };
  },
  methods: {
    addTask() {
      this.dialog = true;

      this.due_date = ''
      this.details = ''
      this.task_id = ''
    },
    editTask(task) {
      this.dialog = true;

      this.due_date = task.due_date;
      this.details = task.details;
      this.task_id = task.id;
    },
    dueDate(due_date) {
      this.date_dialog = false;
      this.$refs.datePicker.save(due_date);
    },
    saveTask() {
      this.$apollo
        .mutate({
          mutation: SAVE_TASK,
          variables: {
            input: {
              id: (this.task_id ? this.task_id : null),
              project_id: this.project.id,
              details: this.details,
              due_date: this.due_date
            }
          }
        })
        .then(response => {
          this.dialog = false

          this.$emit('refetchProject')
        })
        .catch(() => {
          console.log('Could not save task.')
        })
    },
    completeTask(id, completed) {
      let completed_date = completed ? moment().format('YYYY-MM-DD') : null

      this.$apollo
        .mutate({
          mutation: COMPLETE_TASK,
          variables: {
            id,
            completed,
            completed_date
          }
        })
        .then(response => {
          Event.$emit('alert', {
            message: `Task #${ response.data.results.id } is now ` + (completed ? 'complete.' : 'incomplete.'),
            color: completed ? 'success' : 'warning'
          })
        })
        .catch(() => {
          console.error('Could not complete task.')
        })
    },
    deleteTask(id) {
      this.$apollo
        .mutate({
          mutation: DELETE_TASK,
          variables: {
            id
          }
        })
        .then(response => {
          this.$emit('refetchProject')
          Event.$emit('alert', {
            message: `Task #${ response.data.results.id } has been deleted.`,
            color: 'error'
          })
        })
        .catch(() => {
          console.error('Could not delete task.')
        })
    }
  }
};
</script>

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
          :items="clients"
          :search="search"
          class="elevation-1"
          no-data-text="You do not currently have any clients."
          :sort-by="['active', 'name']"
          :sort-desc="true"
          hide-default-footer
          :items-per-page="-1"
        >
          <template v-slot:body="{ items }">
            <tbody>
              <tr v-for="(item, key) in items" :key="key">
                <td>
                  <span v-if="item.active">
                    <v-icon color="success" @click="activateClient(item.id, false)">mdi-checkbox-marked-circle</v-icon>
                  </span>
                  <span v-else>
                    <v-icon color="warning" @click="activateClient(item.id, true)">mdi-minus-circle</v-icon>
                  </span>
                </td>
                <td>{{ item.name }}</td>
                <td width="15%">
                  <span class="hidden">{{ item.created_at }}</span>
                  {{ item.created_at | fromNow() }}
                </td>
                <td width="20%">
                  <v-form method="POST" id="deleteForm" @submit.prevent="deleteClient(item.id)">
                    <v-btn text small :to="'/client/' + item.id" color="primary" class="white--text">
                      View
                    </v-btn>
                    <v-btn text small type="submit" color="red darken-1" class="white--text">
                      Delete
                    </v-btn>
                  </v-form>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
      </v-container>
    </v-layout>

    <v-dialog v-model="dialog" width="500">
      <v-form method="POST" id="clientForm" @submit.prevent="saveClient" ref="form" lazy-validation>
        <v-card>
          <v-card-title class="blue darken-3 white--text py-4 title">Save Client</v-card-title>
          <v-container grid-list-sm class="pa-4">
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  prepend-icon="mdi-account-group"
                  label="Client Name"
                  v-model="name"
                  maxlength="100"
                  :rules="[v => !!v || 'Name is required']"
                  required
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-textarea
                  prepend-icon="mdi-note-text"
                  label="Details"
                  v-model="details"
                ></v-textarea>
              </v-flex>
            </v-layout>
          </v-container>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn type="submit" text color="blue darken-2">Save</v-btn>
            <v-btn text color="red darken-2" form="clientForm" @click="dialog = false">Cancel</v-btn>
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
  import { GET_CLIENTS } from '../../graphql/queries'
  import { SAVE_CLIENT, ACTIVATE_CLIENT, DELETE_CLIENT } from '../../graphql/mutations'

  export default {
    name: 'Clients',
    components: {
      Loading,
    },
    data() {
      return {
        dialog: false,
        name: '',
        details: '',
        active: '',
        clients: [],
        search: '',
        headers: [
          { text: 'Active', value: 'completed' },
          { text: 'Name', value: 'name' },
          { text: 'Since', value: 'created_at' },
          { text: 'Actions', value: 'actions', sortable: false },
        ],
        isLoading: false,
        hasError: false
      }
    },
    apollo: {
      getClients: {
        query: GET_CLIENTS,
        watchLoading (isLoading) {
          this.isLoading = isLoading
        },
        update (data) {
          if (!Object.keys(data).length) {
            this.hasError = true
            return
          }
          if (data.clients) {
            this.clients = data.clients
          } else {
            console.error('Failed to load clients.')
          }
        },
        error () {
          this.clients = []
          this.hasError = true
        }
      }
    },
    methods: {
      saveClient() {
        this.$apollo.mutate(
          {
            mutation: SAVE_CLIENT,
            variables: {
              input: {
                name: this.name,
                details: this.details,
              }
            }
          }
        ).then((response) => {
          this.dialog = false

          this.$apollo.queries.getClients.refetch()
        }).catch(() => {
          console.log('Could not save client.')
        })
      },
      activateClient(id, active) {
        this.$apollo.mutate(
          {
            mutation: ACTIVATE_CLIENT,
            variables: {
              id,
              active
            }
          }
        ).then((response) => {
          Event.$emit('alert', {
            message: 'Client is now ' + (active ? 'active.' : 'inactive.'),
            color: active ? 'success' : 'warning'
          })
        }).catch(() => {
          console.log('Could not activate client.')
        })
      },
      deleteClient(id) {
        this.$apollo.mutate(
          {
            mutation: DELETE_CLIENT,
            variables: {
              id
            }
          }
        ).then((response) => {
          this.$apollo.queries.getClients.refetch()

          Event.$emit('alert', {
            message: response.data.results.name + ' deleted successfully.',
            color: 'error'
          })
        }).catch(() => {
          console.error('Could not delete client.')
        })
      }
    },
  }
</script>

<style lang="scss" scoped>

</style>
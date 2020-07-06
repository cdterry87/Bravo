<template>
  <div>
    <Loading v-if="isLoading" />
    <div v-else-if="!isLoading && client.id">
      <v-container fluid grid-list-md>
        <v-layout row>
          <v-flex xs12>
            <v-card>
              <v-alert
                :type="alertType"
                class="pointer"
                @click.native="activateClient(!client.active)"
              >
                {{ alertMessage }}
              </v-alert>
              <v-card-text>
                <v-layout align-baseline>
                  <v-flex xs6>
                    <span class="title">
                      <v-icon>mdi-account-group</v-icon>
                      {{ client.name }}
                    </span>
                    <p class="mt-2" v-html="client.details" />
                  </v-flex>
                  <v-flex xs6 text-right>
                    <v-btn color="primary" @click="dialog = true" text small>
                      <v-icon left dark>mdi-pencil</v-icon>Edit
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>

      <ClientContacts
        @refetchClient="refetchClient"
        :client="client"
      />

      <ClientProjects
        @refetchClient="refetchClient"
        :client="client"
      />

      <v-dialog v-model="dialog" width="500">
        <v-form
          method="POST"
          id="editClientForm"
          @submit.prevent="saveClient"
          ref="form"
        >
          <v-card>
            <v-card-title class="blue darken-3 white--text py-4 title">Save Client</v-card-title>
            <v-container grid-list-sm class="pa-4">
              <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  prepend-icon="mdi-account-group"
                  label="Client Name"
                  v-model="client.name"
                  maxlength="100"
                  :rules="[v => !!v || 'Name is required']"
                  required
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-textarea
                  prepend-icon="mdi-note-text"
                  label="Details"
                  v-model="client.details"
                ></v-textarea>
              </v-flex>
            </v-layout>
            </v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn type="submit" text color="blue darken-2">Save</v-btn>
              <v-btn text color="red darken-2" form="editClientForm" @click="dialog = false">Cancel</v-btn>
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
              <v-icon>mdi-alert</v-icon>Sorry, this client could not be loaded.
            </p>
            <p class="subheading">This client either contains an error or does not exist.</p>

            <v-btn type="submit" text color="blue darken-2" to="/">
              <v-icon left>mdi-account-group</v-icon>Return to Clients
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
import ClientContacts from '../components/clients/CilentContacts'
import ClientProjects from '../components/clients/ClientProjects'
import { GET_CLIENT } from '../../graphql/queries'
import { SAVE_CLIENT, ACTIVATE_CLIENT, DELETE_CLIENT } from '../../graphql/mutations'

export default {
  name: 'Project',
  props: ['id'],
  components: {
    Loading,
    ClientContacts,
    ClientProjects
  },
  data() {
    return {
      dialog: false,
      isLoading: false,
      hasError: false,
      client: {}
    }
  },
  computed: {
    alertType () {
      return this.client.active ? 'success' : 'error'
    },
    alertMessage () {
      return 'This client is ' + (this.client.active ? 'active.' : 'inactive.')
    }
  },
  apollo: {
    getClient: {
      query: GET_CLIENT,
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
        if (data.client) {
          this.client = data.client
        } else {
          console.error('Failed to load client.')
        }
      },
      error() {
        this.client = []
        this.hasError = true
      }
    }
  },
  methods: {
    saveClient() {
      this.$apollo
        .mutate({
          mutation: SAVE_CLIENT,
          variables: {
            input: {
              id: this.client.id,
              name: this.client.name,
              details: this.client.details
            }
          }
        })
        .then(response => {
          this.dialog = false
          Event.$emit('alert', {
            message: response.data.results.name + ' updated successfully.',
            color: 'success'
          })
        })
        .catch(() => {
          console.error('Could not save client')
        })
    },
    refetchClient() {
      this.$apollo.queries.getClient.refetch()
    },
    activateClient(active) {
      let id = this.id

      this.$apollo
        .mutate({
          mutation: ACTIVATE_CLIENT,
          variables: {
            id,
            active
          }
        })
        .then(response => {
          Event.$emit('alert', {
            message: 'Client is now ' + (active ? 'active.' : 'inactive.'),
            color: active ? 'success' : 'warning'
          })
        })
        .catch(() => {
          console.error('Could not activate client.')
        })
    },
    deleteClient() {
      let id = this.client.id

      this.$apollo
        .mutate({
          mutation: DELETE_CLIENT,
          variables: {
            id
          }
        })
        .then(response => {
          Event.$emit('alert', {
            message: response.data.results.name + ' deleted successfully.',
            color: 'error'
          })
          this.$router.push('clients')
        })
        .catch(() => {
          console.error('Could not delete client.')
        })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
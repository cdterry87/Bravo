<template>
  <v-container fluid grid-list-md>
    <v-layout align-baseline>
      <v-flex xs12>
        <v-card>
          <v-card-text>
            <v-layout align-baseline>
              <v-flex xs6>
                <span class="headline">
                  <v-icon>mdi-phone</v-icon>Contacts
                </span>
              </v-flex>
              <v-flex xs6 text-right>
                <v-btn color="primary" @click="addContact" text small>
                  <v-icon left dark>mdi-plus</v-icon>Add Contact
                </v-btn>
              </v-flex>
            </v-layout>

            <div v-if="client.contacts" class="mt-3">
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
                :items="client.contacts"
                :search="search"
                no-data-text="This client does not currently have any contacts."
                :sort-by="['active', 'created_date']"
                :items-per-page="-1"
                hide-default-footer
              >
                <template v-slot:body="{ items }">
                  <tbody>
                    <tr v-for="(item, key) in items" :key="key">
                      <td>{{ item.name }}</td>
                      <td>{{ item.title }}</td>
                      <td>{{ item.email }}</td>
                      <td>{{ item.phone }}</td>
                      <td>
                        <v-form
                          method="POST"
                          id="deleteForm"
                          @submit.prevent="deleteContact(item.id)"
                        >
                          <v-btn
                            small
                            text
                            @click="editContact(item)"
                            color="primary"
                            class="white--text"
                          >Edit</v-btn>
                          <v-btn small text type="submit" color="red darken-1" class="white--text">Delete</v-btn>
                        </v-form>
                      </td>
                    </tr>
                  </tbody>
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
        id="contactForm"
        @submit.prevent="saveContact"
        ref="form"
        lazy-validation
      >
        <v-card>
          <v-card-title class="blue darken-3 white--text py-4 title">Save Contact</v-card-title>
          <v-container grid-list-sm class="pa-4">
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  prepend-icon="mdi-account-group"
                  label="Contact Name"
                  v-model="name"
                  maxlength="100"
                  :rules="[v => !!v || 'Name is required']"
                  required
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  prepend-icon="mdi-briefcase"
                  label="Contact Title"
                  v-model="title"
                  maxlength="100"
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  prepend-icon="mdi-email"
                  label="Contact Email"
                  v-model="email"
                  maxlength="100"
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  prepend-icon="mdi-phone"
                  label="Contact Phone"
                  v-model="phone"
                  maxlength="30"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn type="submit" text color="blue darken-2">Save</v-btn>
            <v-btn text color="red darken-2" form="contactForm" @click="dialog = false">Cancel</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-container>
</template>

<script>
import Event from '../../events'
import { SAVE_CONTACT, DELETE_CONTACT } from '../../../graphql/mutations'

export default {
  name: 'ClientContacts',
  props: ['client'],
  data() {
    return {
      dialog: false,
      name: '',
      title: '',
      email: '',
      phone: '',
      contact_id: '',
      search: '',
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Title', value: 'title' },
        { text: 'Email', value: 'email' },
        { text: 'Phone', value: 'phone' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    };
  },
  methods: {
    editContact(contact) {
      this.dialog = true
      this.name = contact.name
      this.title = contact.title
      this.email = contact.email
      this.phone = contact.phone
      this.contact_id = contact.id
    },
    addContact() {
      this.reset()
      this.dialog = true
    },
    saveContact() {
      this.$apollo.mutate(
          {
            mutation: SAVE_CONTACT,
            variables: {
              input: {
                id: (this.contact_id ? this.contact_id : null),
                client_id: this.client.id,
                name: this.name,
                title: this.title,
                email: this.email,
                phone: this.phone
              }
            }
          }
        ).then((response) => {
          this.dialog = false
          this.$emit('refetchClient')
          Event.$emit('alert', {
            message: `Contact saved successfully.`,
            color: 'success'
          })
        }).catch(() => {
          console.log('Could not save contact.')
        })
    },
    deleteContact(id) {
      this.$apollo
        .mutate({
          mutation: DELETE_CONTACT,
          variables: {
            id
          }
        })
        .then(response => {
          this.$emit('refetchClient')
          Event.$emit('alert', {
            message: `Contact deleted successfully.`,
            color: 'error'
          })
        })
        .catch(() => {
          console.error('Could not delete contact.')
        })
    },
    reset() {
      this.dialog = false
      this.name = ''
      this.title = ''
      this.email = ''
      this.phone = ''
      this.contact_id = ''
    }
  }
}
</script>

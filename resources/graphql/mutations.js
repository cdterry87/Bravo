import gql from 'graphql-tag'

/* Clients */

// Insert/Update a client
export const SAVE_CLIENT = gql`mutation saveClient($input: ClientInput!) {
  results: saveClient(input: $input) {
    id
    name
    details
    active
    created_at
  }
}
`

// Activate/Deactivate a client
export const ACTIVATE_CLIENT = gql`mutation activateClient($id: ID!, $active: Boolean!) {
  results: activateClient(id: $id, active: $active) {
    id
    name
    details
    active
    created_at
  }
}
`

// Delete a client
export const DELETE_CLIENT = gql`mutation deleteClient($id: ID!) {
  results: deleteClient(id: $id) {
    id
  }
}
`

/* Contacts */

// Insert/Update a contact
export const SAVE_CONTACT = gql`mutation saveContact($input: ContactInput!) {
  results: saveContact(input: $input) {
    id
    name
    title
    email
    phone
    created_at
    updated_at
  }
}
`

// Delete a contact
export const DELETE_CONTACT = gql`mutation deleteContact($id: ID!) {
  results: deleteContact(id: $id) {
    id
  }
}
`

/* Issues */

// Insert/Update an Issue
export const SAVE_ISSUE = gql`mutation saveIssue($input: IssueInput!) {
  results: saveIssue(input: $input) {
    id
    details
    resolved
    resolved_date
  }
}
`

// Resolve/Unresolve an issue
export const RESOLVE_ISSUE = gql`mutation resolveIssue($id: ID!, $resolved: Boolean!, $resolved_date: Date) {
  results: resolveIssue(id: $id, resolved: $resolved, resolved_date: $resolved_date) {
    id
    details
    resolved
    resolved_date
  }
}
`

// Delete an issue
export const DELETE_ISSUE = gql`mutation deleteIssue($id: ID!) {
  results: deleteIssue(id: $id) {
    id
  }
}
`

/* Projects */

// Insert/Update a project
export const SAVE_PROJECT = gql`mutation saveProject($input: ProjectInput!) {
  results: saveProject(input: $input) {
    id
    name
    details
    due_date
    completed
    completed_date
    client {
      id
      name
    }
  }
}
`

// Complete/Incomplete a project
export const COMPLETE_PROJECT = gql`mutation completeProject($id: ID!, $completed: Boolean!, $completed_date: Date) {
  results: completeProject(id: $id, completed: $completed, completed_date: $completed_date) {
    id
    name
    completed
    completed_date
  }
}
`

// Delete a project
export const DELETE_PROJECT = gql`mutation deleteProject($id: ID!) {
  results: deleteProject(id: $id) {
    id
  }
}
`

/* Tasks */

// Insert/Update a task
export const SAVE_TASK = gql`mutation saveTask($input: TaskInput!) {
  results: saveTask(input: $input) {
    id
    details
    due_date
    completed
    completed_date
  }
}
`

// Complete/Incomplete a task
export const COMPLETE_TASK = gql`mutation completeTask($id: ID!, $completed: Boolean!, $completed_date: Date) {
  results: completeTask(id: $id, completed: $completed, completed_date: $completed_date) {
    id
    details
    due_date
    completed
    completed_date
  }
}
`

// Delete a task
export const DELETE_TASK = gql`mutation deleteTask($id: ID!) {
  results: deleteTask(id: $id) {
    id
  }
}
`

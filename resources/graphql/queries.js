import gql from 'graphql-tag'

/* Clients */

// Get active clients for dropdown
export const GET_ACTIVE_CLIENTS = gql`
  {
    activeClients {
      id
      name
    }
  }
`

// Get all clients
export const GET_CLIENTS = gql`
  {
    clients {
      id
      name
      active
      created_at
    }
  }
`

// Get a single client by ID
export const GET_CLIENT = gql`query client ($id: ID!) {
  client (id: $id) {
    id
    name
    details
    active
    contacts {
      id
      name
      title
      email
      phone
    }
    projects {
      id
      name
      details
      due_date
      completed
      completed_date
    }
  }
}
`

/* Issues */

// Get only open issues
export const GET_UNRESOLVED_ISSUES = gql`
  {
    unresolvedIssues {
      id
      details
      priority
      resolved
      resolved_date
      created_at
      updated_at
      project {
        id
        name
      }
    }
  }
`

// Get all issues
export const GET_ISSUES = gql`
  {
    issues {
      id
      details
      priority
      resolved
      resolved_date
      created_at
      updated_at
      project {
        id
        name
      }
    }
  }
`

/* Projects */

// Get all projects
export const GET_PROJECTS = gql`
  {
    projects {
      id
      name
      completed
      due_date
      client {
        id
        name
      }
    }
  }
`

// Get a single project by ID
export const GET_PROJECT = gql`query project ($id: ID!) {
  project (id: $id) {
    id
    name
    details
    due_date
    completed
    completed_date
    created_at
    updated_at
    client {
      id
      name
    }
    tasks {
      id
      details
      due_date
      completed
      completed_date
      created_at
      updated_at
    }
    issues {
      id
      details
      priority
      resolved
      resolved_date
      created_at
      updated_at
    }
  }
}
`

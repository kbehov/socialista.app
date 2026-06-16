export const API_URL = 'http://localhost:8080'

export const AUTH_ROUTES = {
  SIGN_IN: `${API_URL}/auth/sign-in`,
  SIGN_UP: `${API_URL}/auth/sign-up`,
  REFRESH: `${API_URL}/auth/refresh`,
  SOCIAL_LOGIN: `${API_URL}/auth/social`,
}

export const USER_ROUTES = {
  ME: `${API_URL}/user/me`,
  GET_USER: `${API_URL}/user/:id`,
  GET_USERS: `${API_URL}/users`,
  UPDATE_USER: `${API_URL}/user/:id`,
  DELETE_USER: `${API_URL}/user/:id`,
}

export const WORKSPACE_ROUTES = {
  GET_WORKSPACE: `${API_URL}/workspace/:id`,
  GET_WORKSPACES: `${API_URL}/workspaces`,
  CREATE_WORKSPACE: `${API_URL}/workspace`,
  UPDATE_WORKSPACE: `${API_URL}/workspace/:id`,
  DELETE_WORKSPACE: `${API_URL}/workspace/:id`,
  ADD_MEMBER: `${API_URL}/workspace/:id/member`,
  REMOVE_MEMBER: `${API_URL}/workspace/:id/member/:memberId`,
  UPDATE_MEMBER: `${API_URL}/workspace/:id/member/:memberId`,
}

export const API_URL = 'http://localhost:8080'

export const AUTH_ROUTES = {
  SIGN_IN: `/auth/sign-in`,
  SIGN_UP: `/auth/sign-up`,
  REFRESH: `/auth/refresh`,
  SOCIAL_LOGIN: `/auth/social`,
}

export const USER_ROUTES = {
  ME: `/user/me`,
  GET_USER: `/user/:id`,
  GET_USERS: `/users`,
  UPDATE_USER: `/user/:id`,
  DELETE_USER: `/user/:id`,
}

export const WORKSPACE_ROUTES = {
  GET_WORKSPACE: `/workspace/:id`,
  GET_WORKSPACES: `/workspaces`,
  CREATE_WORKSPACE: `/workspace`,
  UPDATE_WORKSPACE: `/workspace/:id`,
  DELETE_WORKSPACE: `/workspace/:id`,
  ADD_MEMBER: `/workspace/:id/member`,
  REMOVE_MEMBER: `/workspace/:id/member/:memberId`,
  UPDATE_MEMBER: `/workspace/:id/member/:memberId`,
}

import {
  index,
  prefix,
  route,
  type RouteConfig,
} from '@react-router/dev/routes'

export default [
  route('', './home/pages/home.page.tsx'),
  route('login', './auth/pages/login.page.tsx'),
  ...prefix('todos', [
    index('./todo/pages/todos.page.tsx'),
    route(':id', './todo/pages/todo.page.tsx'),
  ]),
  // * matches all URLs, the ? makes it optional so it will match / as well
  route('*?', './auth/pages/not-found.page.tsx'),
] satisfies RouteConfig

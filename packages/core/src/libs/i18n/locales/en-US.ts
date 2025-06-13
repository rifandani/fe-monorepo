import type { LanguageMessages } from '@workspace/core/libs/i18n/init.js'

export default {
  // #region COMMON
  locale: 'en-US',
  backTo: 'Back to {target} page',
  errorMinLength: '{field} must have at least {length} characters',
  error: '{module} error',
  theme: 'Theme',
  system: 'System',
  light: 'Light',
  dark: 'Dark',
  add: 'Add',
  update: 'Update',
  remove: 'Remove',
  empty: 'Empty',
  unsavedChanges: 'You have unsaved changes - are you sure?',
  noPageContent: 'No Content',
  unauthorized: 'Unauthorized. Please login first',
  authorized: 'Authorized',
  attention: 'Attention',
  language: 'Language',
  account: 'Account',
  profile: 'Profile',
  settings: 'Settings',
  cancel: 'Cancel',
  continue: 'Continue',
  reload: 'Reload',
  appReady: 'App is ready to use offline',
  newContentAvailable:
    'New content is available, click the reload button to update',
  // #endregion COMMON

  // #region AUTH
  username: 'Username',
  usernamePlaceholder: 'Your username...',
  password: 'Password',
  passwordPlaceholder: 'Your password...',
  loginLoading: 'Logging in...',
  login: 'Login',
  logout: 'Logout',
  notFound: 'Not Found',
  gone: 'Sorry, we can\'t find the page you\'re looking for',
  welcome: 'Welcome Back',
  noAccount: 'Don\'t have an account?',
  registerHere: 'Register here',
  // #endregion AUTH

  // #region HOME
  title: 'Home',
  // #endregion HOME
} as const satisfies LanguageMessages

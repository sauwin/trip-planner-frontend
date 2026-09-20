import { createApp } from 'vue'
import App from './App.vue'
import './main.css'
import { createPinia } from 'pinia'
import { i18n } from './locales'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(i18n)

import('./router').then(({ default: router }) => {
  app.use(router)
  app.mount('#app')
})

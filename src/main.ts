import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './main.css'
import { createPinia } from 'pinia'
import { i18n } from './locales'

const pinia = createPinia()

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(i18n)

app.mount('#app')

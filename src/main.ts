import './assets/main.css'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'dark',
        themes: {
          dark: {
            dark: true,
            colors: {
              background: '#121212',
              surface: '#1E1E1E',
              primary: '#BB86FC',
              secondary: '#03DAC6',
              error: '#CF6679',
            },
          },
        },
      },
  })

const app = createApp(App)

app.use(vuetify, {
    iconfont: 'md'
})

app.use(createPinia())
app.use(router)

app.mount('#app')









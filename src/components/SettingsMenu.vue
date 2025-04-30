<template>
    <div class="text-center">
      <v-menu :location="location">
        <template v-slot:activator="{ props }">
          <v-btn
            color="primary"
            v-bind="props"
            variant="outlined"
          >
            Settings
          </v-btn>
        </template>
  
        <v-list>
          <v-list-item
            v-for="(item, index) in items"
            :key="index"
            :value="index"
          >
            <RouterLink style="text-decoration: none; color: inherit;" :to="item.to">
                <v-list-item-title>{{ item.title }}</v-list-item-title>
            </RouterLink>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </template>

  <script lang="ts" setup>
    import { ref } from 'vue'
  
    const location = ref('bottom')
  
    const items = [
      { title: 'Set Home', to: '/setHome' },
    ]
  </script>

<script lang="ts">
    export default {
        name: 'SettingsMenu',
    }
</script>
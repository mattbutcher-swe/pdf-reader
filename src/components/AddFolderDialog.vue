export {};
<script setup lang="ts">
  import { ref } from 'vue';
  const { currentFolder } = defineProps(['currentFolder'])
  const emit = defineEmits(['folderAdded']);
  let folderName = ref("");

  const addFolder = async () => {
    await window.electronAPI.createFolder(currentFolder, folderName.value);
    console.log(folderName.value);
    emit("folderAdded", true);
  }
</script>

<template>
    <v-dialog max-width="500">
        <template v-slot:activator="{ props: activatorProps }">
    
        <v-list class="w-auto">
            <v-list-item v-bind="activatorProps">

              <v-list-item-content>
                <v-list-item-title>+</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
    
        </template>
    
        <template v-slot:default="{ isActive }">
        <v-card>
            <v-text-field
                hide-details="auto"
                label="Folder Name"
                @input="event => folderName = event.target.value">
            </v-text-field>
    
            <v-card-actions>
            <v-spacer></v-spacer>
    
            <v-btn
                text="Close"
                @click="isActive.value = false"
            ></v-btn>
            <v-btn
                text="Add"
                @click="isActive.value = false; addFolder()"
            ></v-btn>
            </v-card-actions>
        </v-card>
        </template>
    </v-dialog>
  </template>

<script lang="ts">
    export default {
        name: 'AddFolderDialog',
    }
</script>
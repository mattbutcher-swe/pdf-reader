export {};
<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue';
import AddFolderDialog from '../components/AddFolderDialog.vue';
const vcardVariant = "flat";
let currentFolder = ref<string | null>("");
let folders = ref<Object[]>([]);
let loading = ref<boolean>(false);
let setHomeText = ref<string>("Set home");
let setHomeBtnDisabled = ref<boolean>(false);
const setHomeBtnStyle = ref<object>({
  "color": "primary",
  "variant": "outlined",
  "text": "Set home"
});

const fetchFoldersChildren = async (currentFolder: string | null, folderToInspect: string | null) => {
  const folders = await window.electronAPI.getFoldersChildren(currentFolder, folderToInspect);
  return folders;
}

const setFolders = (newFolders: String[]) => {
  let newFoldersFormatted: Object[] = [];

  newFolders.forEach(folder => {
    newFoldersFormatted.push({
      title: folder,
      value: folder
    })
  });

  folders.value = newFoldersFormatted;
}

const openFolder = async (newFolder: string | null) => {
  const newFolders = await fetchFoldersChildren(currentFolder.value, newFolder);
  setFolders(newFolders);
  currentFolder.value = await window.electronAPI.getCurrentFolder(currentFolder.value, newFolder);
}

const openParentFolder = async () => {
  const parentFolder = await window.electronAPI.getParentFolder(currentFolder.value);
  currentFolder.value = parentFolder;
  await openFolder(null);
}

const refreshFolders = async () => {
  const folders = await fetchFoldersChildren(currentFolder.value, null);
  setFolders(folders);
}

const setHome = async () => {
  loading.value = true;
  setHomeBtnDisabled.value = true;
  const setHomeSucceeded = await window.electronAPI.setHome(currentFolder.value);

  await setTimeout(() => {
    loading.value = false;
    setHomeBtnStyle.value.variant = "elevated";
    if (setHomeSucceeded) {
      setHomeBtnStyle.value.color = "success";
      setHomeBtnStyle.value.text = "Saved";
    } else {
      setHomeBtnStyle.value.color = "error";
      setHomeBtnStyle.value.text = "Failed";
    }

    setTimeout(() => {
      setHomeBtnStyle.value.text = "Set home";
      setHomeBtnDisabled.value = false;
      setHomeBtnStyle.value.color = "primary";
      setHomeBtnStyle.value.variant = "outlined";
    }, 500);
  }, 500);

  
}

const getHome = async () => {
  return await window.electronAPI.getHome();
}

const openHomeFolder = async () => {
  let home = await getHome();
  if (home !== null) {
    currentFolder.value = home;
  } 
  await openFolder(null);
}

openHomeFolder();
</script>

<template>
  <main class="">
    <v-card class="h-screen d-flex flex-column" :variant="vcardVariant">
      <div>
      <v-text-field style="white-space: nowrap;" class="w-auto" disabled :value="currentFolder">
        <template v-slot:prepend-inner>
          Current folder: 
        </template>
      </v-text-field>
      <v-row no-gutters>
        <v-col class="align-self-center d-flex justify-start">
          <v-list class="w-auto">
            <v-list-item class="position-sticky" @click="openParentFolder()">
              <v-list-item-content>
                <v-list-item-title>&larr;</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col class="align-self-center d-flex justify-end">
          <AddFolderDialog :currentFolder="currentFolder" @folderAdded="refreshFolders"></AddFolderDialog>
        </v-col>
      </v-row>
      </div>
      <div class="flex-grow-1 overflow-auto">
      <v-virtual-scroll :items="folders" style="height: 100%" item-height="48" :key="currentFolder">
        <template v-slot:default="{ item }">
          <v-list-item :key="item.value" @click="openFolder(item.value)">
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-virtual-scroll>
      </div>
      <v-row no-gutters class="ma-2" style="max-height: fit-content;">
        <v-col>
          <RouterLink style="text-decoration: none; color: inherit;" to="/"><div class="d-flex justify-center"><v-btn color="primary" variant="outlined">Cancel
</v-btn></div></RouterLink>
        </v-col>
        <v-col>
          <div class="d-flex justify-center"><v-btn ref="setHomeBtn" :loading="loading" @click="setHome()" :color="setHomeBtnStyle.color" :variant="setHomeBtnStyle.variant" :disabled="setHomeBtnDisabled">{{ setHomeBtnStyle.text }}</v-btn></div>
        </v-col>
      </v-row>
    </v-card>
  </main>
</template>

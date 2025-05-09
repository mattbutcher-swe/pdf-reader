<script setup lang="ts">
import { isReactive, ref, watch } from 'vue';

let title = defineModel<string>('title');
let pdfPath = defineModel<string>('pdf-path');

const localTitle = ref(title.value);

const updateBook = async () => {
  title.value = localTitle.value;
  await window.electronAPI.updateBook(pdfPath.value, { title: localTitle.value });
};
</script>

<template>
  <v-dialog max-width="500">
    <template v-slot:activator="{ props: activatorProps }">
      <v-icon
        icon="mdi-cog"
        style="text-shadow: 0 0 2px black;"
        class="book-settings-btn"
        v-bind="activatorProps"
      ></v-icon>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-text-field
          hide-details="auto"
          label="Title"
          v-model="localTitle"
        ></v-text-field>
        <!-- <v-text-field
          hide-details="auto"
          label="Tags"
        ></v-text-field> -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text="Close"
            @click="() => (isActive.value = false)"
          ></v-btn>
          <v-btn
            text="Save"
            @click="() => {isActive.value = false; updateBook()}"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'EditBookDialog',
};
</script>
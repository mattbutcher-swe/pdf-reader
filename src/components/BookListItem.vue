<template>
    <v-list-item class="d-flex align-end justify-end book-item w-100" :style="{
        backgroundImage: 'url(' + bookDetails.image + ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    }" :key="bookDetails.name" @click="openPDF(bookDetails.name, bookDetails.bookmark)">
    <div class="h-100 w-100 d-flex align-end">
        <v-list-item-title class="book-info pa-2">
           {{bookDetails.name}}
        </v-list-item-title>
        </div>
    </v-list-item>
</template>
  
<script lang="ts" setup>
const { bookDetails, currentFolder } = defineProps(['bookDetails', 'currentFolder']);

const openPDF = async (pdfName, pageNumber) => {
    try {
        await window.electronAPI.openPDF(pdfName, currentFolder, pageNumber);
    } catch (err) {
        console.error('Error opening PDF:', err);
    }
};
</script>
  
<style>

.book-item {
  position: relative;
  cursor: pointer;
  height: 300px; /* Fixed or min height */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 2px solid var(--v-theme-primary);
  padding: 8px;
  border-radius: 6px !important;
  display: flex; /* Ensure children can align */
  align-items: flex-end; /* Vertical alignment */
}


.book-info {
  width: -webkit-fill-available !important;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.7);
}

.book-info > div {
  width: 100%; /* Ensure the inner div takes full width */
  white-space: normal; /* Allow text to wrap naturally */
  word-break: break-word; /* Break long words if needed */
}

.book-item:hover {
  opacity: 0.8;
}

.v-list-item__content {
    width: -webkit-fill-available !important;
    height: -webkit-fill-available !important;
}

</style>

<template>
    <v-list-item class="d-flex align-end justify-end book-item h-100 w-100" :style="{
        backgroundImage: 'url(' + bookDetails.image + ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    }" :key="bookDetails.name" @click="openPDF(bookDetails.path, bookDetails.bookmark)">
        <div class="d-flex flex-column h-100 w-100">
            <div class="d-flex w-100 justify-end">
                <EditBookDialog v-model:title="bookDetails.name" v-model:pdf-path="bookDetails.path"></EditBookDialog>
            </div>
            <div class="d-flex flex-grow-1 align-end">
                <v-list-item-title :title="bookDetails.name" class="book-info pa-2">
                    {{bookDetails.name}}
                </v-list-item-title>
            </div>
        </div>
    </v-list-item>
</template>
  
<script lang="ts" setup>
import EditBookDialog from '../components/EditBookDialog.vue';

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
  height: 100%;
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
  height: fit-content;
}

.book-info > div {
  width: 100%; /* Ensure the inner div takes full width */
  white-space: normal; /* Allow text to wrap naturally */
  word-break: break-word; /* Break long words if needed */
}

.book-item:hover {
  opacity: 0.8;
}

.book-item .v-list-item__content {
    width: -webkit-fill-available !important;
    height: -webkit-fill-available !important;
}

</style>
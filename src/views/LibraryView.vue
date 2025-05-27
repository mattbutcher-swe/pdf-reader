export {};
<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue';
import SettingsMenu from '../components/SettingsMenu.vue';
import BookListItem from '../components/BookListItem.vue';

const pdfs = ref<Object[]>([]);
let localPdfs = ref(pdfs.value);

const currentFolder = ref<String>("");
const vcardVariant = "flat";

function observeFadeOutOnScroll() {
  const container = document.getElementById('book-grid');
  const bookItems = container.querySelectorAll('.book-wrapper');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('fade-out');
        } else {
          entry.target.classList.add('fade-out');
        }
      });
    },
    {
      root: container,
      threshold: 0.1, // Trigger fade when 10% of item is visible
    }
  );

  bookItems.forEach(item => observer.observe(item));
}



const fetchPDFs = async () => {
  const home = await window.electronAPI.getHome();
  return await window.electronAPI.getFoldersPDFs(home);
}

const setPDFs = async () => {
  pdfs.value = await fetchPDFs();
  localPdfs.value = pdfs.value;
  currentFolder.value = await window.electronAPI.getHome();
}

function getNextOutOfViewItem(container) {
  const children = container.querySelectorAll('.book-wrapper');

  let next = null;

  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];

    if (!isInViewport(child)) {
      next = child;
    } else {
      return next;
    }
  }

  return next;
}

function getPreviousOutOfViewItem(container, selector = '.book-wrapper') {
  const children = container.querySelectorAll('.book-wrapper');

  let previous = null;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (!isInViewport(child)) {
      previous = child;
    } else {
      return previous;
    }
  }

  return previous;
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}



function scrollDown() {
  const container = document.getElementById('book-grid');
  const nextItem = getNextOutOfViewItem(container);

  if (nextItem) {
    nextItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  }

  observeFadeOutOnScroll(); // Run after DOM is updated
}

function scrollUp() {
  const container = document.getElementById('book-grid');
  const nextItem = getPreviousOutOfViewItem(container);

  if (nextItem) {
    nextItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  observeFadeOutOnScroll(); // Run after DOM is updated
}

function scrollProxy(e: WheelEvent | TouchEvent | KeyboardEvent) {
  e.preventDefault();

  if ('deltaY' in e) {
    const wheel = e as WheelEvent;
    if (wheel.deltaY > 0) {
      scrollDown();
    } else if (wheel.deltaY < 0) {
      scrollUp();
    }
  }

}

function fuzzySearch(search) {
  // if (search.target.value.length == 0) {
  //   return;
  // }

  localPdfs.value = pdfs.value;


  const lowerSearch = search.target.value.toLowerCase();

  localPdfs.value = localPdfs.value.filter(pdf => {
    let i = 0;
    const lowerItem = pdf.name.toLowerCase();

    for (let char of lowerItem) {
      if (char === lowerSearch[i]) {
        i++;
      }
      if (i === lowerSearch.length) {
        return true;
      }
    }

    return false;
  });
}



setPDFs();

</script>

<template>
  <main>
    <v-card class="h-screen d-flex flex-column" :variant="vcardVariant">
      <div class="d-flex pa-7">
        <div class="d-flex justify start">
          <v-text-field @input="fuzzySearch" class="text-primary pr-2" placeholder="Filter" variant="outlined" :width="150"></v-text-field>
        </div>
        <div class="d-flex flex-grow-1 justify-end settings-wrapper">
          <SettingsMenu />
        </div>
      </div>
      <v-container class="d-flex justify-center">
        <div class="align-center">
          <v-icon
          @click="scrollUp"
          icon="mdi-arrow-up"
          start
          class="text-primary"
          id="scroll-up-btn"
        ></v-icon>
        </div>
      </v-container>

      <!-- Book Grid -->
      <v-container class="flex-grow-1 overflow-y-auto pa-2" @wheel.prevent="scrollProxy" id="book-grid" fluid>
        <v-row class="h-100 book-wrapper-row" no-gutters>
          <v-col class="book-wrapper pa-5 h-50" v-for="(item, index) in localPdfs" :key="index" cols="12" sm="6" md="4"  lg="3">
            <div class="h-100 w-100">
              <BookListItem :bookDetails="item" :currentFolder="currentFolder" />
            </div>
          </v-col>
        </v-row>
      </v-container>
      <v-container class="d-flex justify-center">
        <v-icon
          @click="scrollDown"
          icon="mdi-arrow-down"
          start
          class="text-primary"
          id="scroll-down-btn"

        ></v-icon>
      </v-container>
    </v-card>

    
  </main>
</template>


<style scoped>
  .book-wrapper {
  opacity: 1;
  transition: opacity 5s ease;
}

.book-wrapper.fade-out {
  opacity: 0; /* or 0 for complete fade-out */
}

#book-grid {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
}
#book-grid::-webkit-scrollbar { 
    display: none;  /* Safari and Chrome */
}


</style>


<template>
  <div class="app-container">
    <my-uploader
      :action="'http://localhost:3000/api/utils/upload'"
    ></my-uploader>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import myUploader from "./components/myUploader.vue"
export default defineComponent({
  name: "App",
  components: {
    myUploader
  }
})
</script>

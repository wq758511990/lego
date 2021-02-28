<template>
  <div class="file-upload">
    <div
      class="upload-area"
      :class="{ 'is-dragover': drag && isDragOver }"
      v-on="events"
    >
      <slot v-if="isUploading" name="loading">
        <button disabled>正在上传</button>
      </slot>
      <slot
        name="uploaded"
        v-else-if="lastFileData && lastFileData.loaded"
        :uploadedData="lastFileData.data"
      >
        <button>点击上传</button>
      </slot>
      <slot v-else name="default">
        <button>点击上传</button>
      </slot>
    </div>

    <input
      type="file"
      style="display: none"
      ref="fileInput"
      multiple
      @change="handleFileChange"
    />
    <ul>
      <li
        v-for="(file, idx) in filesList"
        :key="file.uid"
        :class="`uploaded-file upload-${file.status}`"
      >
        <img :src="file.url" alt="" />
        <span class="filename">{{ file.name }}</span>
        <button class="delete-icon" @click="removeFile(idx)">del</button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { v4 as uuidv4 } from "uuid"
import axios from "axios"
import { last } from "lodash-es"
import {
  computed,
  defineComponent,
  PropType,
  reactive,
  ref,
  getCurrentInstance
} from "vue"
// import axios from "axios"
type UploadStatus = "ready" | "loading" | "success" | "error"
type CheckUpload = (file: File) => boolean | Promise<File>
export interface UploadFile {
  uid: string
  size: number
  name: string
  status: UploadStatus
  raw: File
  resp?: any
  url?: string
}
export default defineComponent({
  name: "file-upload",
  props: {
    action: {
      type: String,
      required: true
    },
    beforeUpload: {
      type: Function as PropType<CheckUpload>
    },
    drag: {
      type: Boolean,
      default: false
    },
    autoUpload: {
      type: Boolean,
      default: true
    },
    listType: {
      type: String
    }
  },
  setup(props) {
    const interInstance = getCurrentInstance()
    console.log("interInstance", interInstance)
    const fileInput = ref<null | HTMLInputElement>(null)
    const filesList = ref<UploadFile[]>([])
    const isDragOver = ref<boolean>(false)
    const isUploading = computed(() => {
      return filesList.value.some(file => file.status === "loading")
    })
    const lastFileData = computed(() => {
      const lastFile = last(filesList.value)
      if (lastFile) {
        return {
          loaded: lastFile.status === "success",
          data: lastFile.resp
        }
      }
      return false
    })
    const triggerUpload = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }
    const removeFile = (idx: number) => {
      filesList.value.splice(idx, 1)
    }
    const postFile = (readyFile: UploadFile) => {
      const formData = new FormData()
      formData.append("file", readyFile.raw)
      readyFile.status = "loading"
      axios
        .post(props.action, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(resp => {
          readyFile.status = "success"
          console.log(resp.data)
          readyFile.resp = resp.data
        })
        .catch(() => {
          readyFile.status = "error"
        })
        .finally(() => {
          if (fileInput.value) {
            fileInput.value.value = ""
          }
        })
    }
    const addFileToList = (uploadedFile: File) => {
      const fileObj = reactive<UploadFile>({
        uid: uuidv4(),
        size: uploadedFile.size,
        name: uploadedFile.name,
        status: "ready",
        raw: uploadedFile
      })
      // 本地预览图片
      // URL.createObjectURL
      // fileReader.readAsDataURL
      if (props.listType === "picture") {
        // try {
        //   fileObj.url = URL.createObjectURL(uploadedFile)
        // } catch (err) {
        //   console.error("upload File error", err)
        // }
        const fileReader = new FileReader()
        fileReader.readAsDataURL(uploadedFile)
        fileReader.addEventListener("load", () => {
          fileObj.url = fileReader.result as string
        })
      }
      filesList.value.push(fileObj)
      if (props.autoUpload) {
        postFile(fileObj)
      }
    }
    const beforeUploadCheck = (files: null | FileList) => {
      if (files) {
        const uploadFile = files[0]
        if (props.beforeUpload) {
          const result = props.beforeUpload(uploadFile)
          if (result && result instanceof Promise) {
            result
              .then(processedFile => {
                if (processedFile instanceof File) {
                  // 处理后的文件
                  addFileToList(processedFile)
                } else {
                  throw new Error(
                    "beforeupload promise should return File Object"
                  )
                }
              })
              .catch(e => {
                console.error("e", e)
              })
          } else if (result === true) {
            addFileToList(uploadFile)
          }
        } else {
          addFileToList(uploadFile)
        }
      }
    }
    const uploadFiles = () => {
      filesList.value
        .filter(file => file.status === "ready")
        .forEach(readyFile => postFile(readyFile))
    }
    let events: { [key: string]: (e: any) => void } = {
      click: triggerUpload
    }
    const handleFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      const files = target.files
      beforeUploadCheck(files)
    }
    const handleDrag = (e: DragEvent, over: boolean) => {
      e.preventDefault() // 防止drag 拖到浏览器会默认打开一个新的标签页
      isDragOver.value = over
    }
    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      isDragOver.value = false
      if (e.dataTransfer) {
        // e.dataTransfer.files 为 拖拽过程中， 取消拖拽时的文件数据
        beforeUploadCheck(e.dataTransfer.files)
      }
    }
    if (props.drag) {
      events = {
        ...events,
        dragover: (e: DragEvent) => {
          handleDrag(e, true)
        },
        dragleave: (e: DragEvent) => {
          handleDrag(e, false)
        },
        drop: handleDrop
      }
    }
    return {
      fileInput,
      triggerUpload,
      handleFileChange,
      isUploading,
      filesList,
      removeFile,
      lastFileData,
      isDragOver,
      events,
      uploadFiles
    }
  }
})
</script>

<style lang="scss">
.upload-loading {
  color: yellow;
}
.upload-success {
  color: green;
}
.upload-error {
  color: red;
}
.upload-area {
  width: 200px;
  height: 200px;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}
.is-dragover {
  border-color: blue;
}
</style>

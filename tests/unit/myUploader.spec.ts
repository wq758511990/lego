import { shallowMount, VueWrapper, mount, flushPromises } from "@vue/test-utils"
import Uploader from "@/components/myUploader.vue"
import axios from "axios"
import { last, wrap } from "lodash-es"
jest.mock("axios")
const mockedAxios = axios as jest.Mocked<typeof axios>
const testFile = new File(["xyz"], "test.png", { type: "image/png" })
let wrapper: VueWrapper<any>

const setInputValue = (input: HTMLInputElement) => {
  const files = [testFile] as any
  Object.defineProperty(input, "files", {
    value: files,
    writable: false
  })
}

describe("Uploader Component", () => {
  beforeAll(() => {
    wrapper = shallowMount(Uploader, {
      props: {
        action: "test.url"
      }
    })
  })

  it("basic layout before uploading", () => {
    expect(wrapper.find("button").exists()).toBeTruthy()
    expect(wrapper.find("button").text()).toBe("点击上传")
    expect(wrapper.get("input").isVisible()).toBeFalsy()
  })

  it("upload process should wors fine", async () => {
    // change
    mockedAxios.post.mockResolvedValueOnce({ status: "success" })
    const fileInput = wrapper.find("input").element as HTMLInputElement
    setInputValue(fileInput)
    await wrapper.get("input").trigger("change")
    expect(mockedAxios.post).toHaveBeenCalledTimes(1)
    expect(wrapper.find("button").text()).toBe("正在上传")

    expect(wrapper.get("button").attributes()).toHaveProperty("disabled")
    // 列表长度修改 并且有正确的class
    expect(wrapper.findAll("li").length).toBe(1)
    const firstItem = wrapper.get("li:first-child")
    expect(firstItem.classes()).toContain("upload-loading")
    await flushPromises()
    expect(wrapper.find("button").text()).toBe("点击上传")
    expect(firstItem.classes()).toContain("upload-success")
    expect(firstItem.get(".filename").text()).toBe(testFile.name)
  })
  it("should return error text when post is rejected", async () => {
    mockedAxios.post.mockRejectedValueOnce({ error: "error" })
    await wrapper.get("input").trigger("change")
    expect(mockedAxios.post).toHaveBeenCalledTimes(2)
    expect(wrapper.find("button").text()).toBe("正在上传")
    await flushPromises()
    expect(wrapper.find("button").text()).toBe("点击上传")
    // 列表长度增加，最后一项有正确的class名
    expect(wrapper.findAll("li").length).toBe(2)
    const lastItem = wrapper.get("li:last-child")
    expect(lastItem.classes()).toContain("upload-error")
    // 点击列表右侧的button，可以删除
    await lastItem.get(".delete-icon").trigger("click")
    expect(wrapper.findAll("li").length).toBe(1)
  })
  it("should show the correct interface when using custom slot", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { url: "test1.url" } })
    mockedAxios.post.mockResolvedValueOnce({ data: { url: "test2.url" } })

    const wrapper = mount(Uploader, {
      props: {
        action: "test.url"
      },
      slots: {
        default: "<button>Custom button</button>",
        loading: '<div class="loading">custom loading</div>',
        uploaded: `<template #uploaded="{ uploadedData }">
          <div class="custom-loaded">{{uploadedData.url}}</div>
        </template>`
      }
    })
    expect(wrapper.get("button").text()).toBe("Custom button")
    const fileInput = wrapper.find("input").element as HTMLInputElement
    setInputValue(fileInput)
    await wrapper.get("input").trigger("change")
    expect(wrapper.get(".loading").text()).toBe("custom loading")
    await flushPromises()
    expect(wrapper.get(".custom-loaded").text()).toBe("test1.url")

    await wrapper.get("input").trigger("change")
    expect(wrapper.get(".loading").text()).toBe("custom loading")
    await flushPromises()
    expect(wrapper.get(".custom-loaded").text()).toBe("test2.url")
  })

  it("testing drag and drop function", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { url: "test.png" } })
    const wrapper = shallowMount(Uploader, {
      props: {
        action: "test.url",
        drag: true
      }
    })
    const uploadArea = wrapper.get(".upload-area")
    await uploadArea.trigger("dragover")
    expect(uploadArea.classes()).toContain("is-dragover")

    await uploadArea.trigger("dragleave")
    expect(uploadArea.classes()).not.toContain("is-dragover")

    await uploadArea.trigger("drop", {
      // 给e.dataTransfer 赋值
      dataTransfer: {
        files: [testFile]
      }
    })
    expect(mockedAxios.post).toHaveBeenCalled()
    await flushPromises()
    expect(wrapper.findAll("li").length).toBe(1)
  })
  it("testing manual upload progress", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { url: "test123.url" } })
    const wrapper = shallowMount(Uploader, {
      props: {
        action: "test.url",
        drag: true,
        autoUpload: false
      }
    })
    const fileInput = wrapper.get("input").element as HTMLInputElement
    setInputValue(fileInput)
    await wrapper.get("input").trigger("change")
    expect(wrapper.findAll("li").length).toBe(1)
    const firstItem = wrapper.get("li:first-child")
    expect(firstItem.classes()).toContain("upload-ready")
    // 组件实例 wrapper.vm
    wrapper.vm.uploadFiles()
    expect(mockedAxios.post).toHaveBeenCalled()
    await flushPromises()
    expect(firstItem.classes()).toContain("upload-success")
  })
})

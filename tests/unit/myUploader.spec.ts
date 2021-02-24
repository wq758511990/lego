import { shallowMount, VueWrapper, mount, flushPromises } from "@vue/test-utils"
import Uploader from "@/components/myUploader.vue"
import axios from "axios"
jest.mock("axios")
const mockedAxios = axios as jest.Mocked<typeof axios>
const testFile = new File(["xyz"], "test.png", { type: "image/png" })
let wrapper: VueWrapper<any>

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
    const files = [testFile] as any
    Object.defineProperty(fileInput, "files", {
      value: files,
      writable: false
    })
    await wrapper.get("input").trigger("change")
    expect(mockedAxios.post).toHaveBeenCalledTimes(1)
    expect(wrapper.find("button").text()).toBe("正在上传")
    await flushPromises()
    expect(wrapper.find("button").text()).toBe("上传成功")
  })
  it("should return error text when post is rejected", async () => {
    mockedAxios.post.mockRejectedValueOnce({ error: "error" })
    await wrapper.get("input").trigger("change")
    expect(mockedAxios.post).toHaveBeenCalledTimes(2)
    await flushPromises()
    expect(wrapper.find("button").text()).toBe("上传失败")
  })
})

import { mount } from "@vue/test-utils";
import UserProfile from "@/components/UserProfile.vue";
let wrapper: any;
jest.mock("ant-design-vue");
jest.mock("vuex");
jest.mock("vue-router");

describe("UserProfile component", () => {
  beforeAll(async () => {
    wrapper = mount(UserProfile, {
      props: {
        user: { isLogin: false }
      },
      global: {
        components: {}
      }
    });
  });
});
it("should render login button when login is false", () => {
  console.log(wrapper.html());
});
it("should render username when login is true", () => {});
afterAll(() => {});

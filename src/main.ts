import { createApp } from "vue"
import Antd from "ant-design-vue"
import "ant-design-vue/dist/antd.css"
import router from "./routes/index"
import store from "./store/index"
import App from "./App.vue"
const app = createApp(App)
app
  .use(Antd)
  .use(router)
  .use(store)
app.mount("#app")

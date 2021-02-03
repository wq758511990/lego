import { Module } from "vuex";
import { GlobalDataProps } from "./index";

export interface UserProps {
  isLogin: boolean;
  userName?: string;
}

const user: Module<UserProps, GlobalDataProps> = {
  state: {
    isLogin: false
  },
  mutations: {
    login(state) {
      state.isLogin = true; // 覆盖原有的值
      state.userName = "wzx";
    },
    logout(state) {
      state.isLogin = false;
    }
  }
};

export default user;

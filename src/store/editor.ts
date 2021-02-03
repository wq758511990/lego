import { Module } from "vuex";
import { GlobalDataProps } from "./index";

export interface EditorProps {
  components: ComponentData[];
  currentElement: string;
}

interface ComponentData {
  // 元素属性
  props: { [key: string]: any };
  // id
  id: string;
  // 业务组件库名称 l-text l-image
  name: string;
}

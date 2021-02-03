import { Module } from "vuex";
import { GlobalDataProps } from "./index";
export interface TemplateProps {
  id: number;
  title: string;
  coverImg: string;
  author: string;
  copiedCount: number;
}

const testData: TemplateProps[] = [
  { id: 1, coverImg: "https://static.imooc-lego.com/upload-files/screenshot-677311.png", title: "title 1", author: "wzx", copiedCount: 0 },
  { id: 2, coverImg: "https://static.imooc-lego.com/upload-files/screenshot-677311.png", title: "title 2", author: "wzx", copiedCount: 2 },
  { id: 3, coverImg: "https://static.imooc-lego.com/upload-files/screenshot-677311.png", title: "title 3", author: "wzx", copiedCount: 1 },
  { id: 4, coverImg: "https://static.imooc-lego.com/upload-files/screenshot-677311.png", title: "title 4", author: "wzx", copiedCount: 5 },
  { id: 5, coverImg: "https://static.imooc-lego.com/upload-files/screenshot-677311.png", title: "title 5", author: "wzx", copiedCount: 6 }
];

export interface TemplatesProps {
  data: TemplateProps[];
}

const templates: Module<TemplatesProps, GlobalDataProps> = {
  state: {
    data: testData
  },
  getters: {
    getTemplateById: state => (id: number) => {
      // rootState 全局state类型， 也就是GlobalDataProps
      return state.data.find(t => t.id === id);
    }
  }
};

export default templates;

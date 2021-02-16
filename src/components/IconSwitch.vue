<template>
  <div class="icons_wrapper">
    <div class="icon-item" v-for="(item, key) in finalFontStyles" :key="key">
      <a-tooltip>
        <template v-slot:title>
          {{ item.text }}
        </template>
        <div
          class="icon"
          :class="item.isHight ? 'active' : ''"
          @click="onChange(item)"
        >
          {{ item.iconText }}
        </div>
      </a-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
interface FontProp {
  text: string
  propName: string
  value: string
  iconText: string
  isHight?: boolean
}
const fontStyles: FontProp[] = [
  { text: "黑体", propName: "fontWeight", value: "bold", iconText: "B" },
  { text: "斜体", propName: "fontStyle", value: "italic", iconText: "I" },
  {
    text: "下划线",
    propName: "textDecoration",
    value: "underline",
    iconText: "U"
  }
]
import { computed, defineComponent, PropType } from "vue"
import { Tooltip } from "ant-design-vue"
export default defineComponent({
  name: "icon-switch",
  props: {
    fontstyles: {
      type: Array as PropType<Record<string, any>>,
      default: fontStyles
    }
  },
  components: {
    "a-tooltip": Tooltip
  },
  emits: ["change"],
  setup(props, context) {
    const finalFontStyles = computed(() => fontStyles)
    const onChange = (item: FontProp) => {
      item.isHight = item.isHight ? false : true
      context.emit("change", {
        isCustom: true,
        key: item.propName,
        value: item.isHight ? item.value : "unset"
      })
    }
    return {
      finalFontStyles,
      onChange
    }
  }
})
</script>

<style lang="scss">
.icons_wrapper {
  display: flex;
  .icon-item {
    .icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      text-align: center;
      line-height: 30px;
      margin-right: 15px;
      border: 1px solid #ccc;
      cursor: pointer;
      &:hover {
        background-color: #1890ff;
        color: #fff;
      }
    }
    .active {
      background-color: #1890ff;
      color: #fff;
    }
  }
}
</style>

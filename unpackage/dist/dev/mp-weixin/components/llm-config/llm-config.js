"use strict";
const common_vendor = require("../../common/vendor.js");
let confirmCallback = () => {
};
const _sfc_main = {
  name: "llm-config",
  data() {
    return {
      models: [
        {
          text: "gpt-4",
          value: "gpt-4"
        },
        {
          text: "gpt-4-0314",
          value: "gpt-4-0314"
        },
        {
          text: "gpt-4-32k",
          value: "gpt-4-32k"
        },
        {
          text: "gpt-4-32k-0314",
          value: "gpt-4-32k-0314"
        },
        {
          text: "gpt-3.5-turbo",
          value: "gpt-3.5-turbo"
        },
        {
          text: "gpt-3.5-turbo-0301",
          value: "gpt-3.5-turbo-0301"
        },
        {
          text: "都不选",
          value: ""
        }
      ],
      currentModel: ""
    };
  },
  methods: {
    open(callback) {
      this.currentModel = common_vendor.index.getStorageSync("uni-ai-chat-llmModel");
      confirmCallback = callback;
      this.$refs.popup.open("center");
    },
    radioChange(event) {
      console.log("event", event.detail.value);
      this.currentModel = event.detail.value;
    },
    cancel() {
      this.$refs.popup.close();
    },
    confirm() {
      confirmCallback(this.currentModel);
      this.$refs.popup.close();
    }
  }
};
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.models, (item, index, i0) => {
      return {
        a: item.value,
        b: $data.currentModel === item.value,
        c: common_vendor.t(item.text),
        d: item.value
      };
    }),
    b: common_vendor.o((...args) => $options.radioChange && $options.radioChange(...args)),
    c: common_vendor.o((...args) => $options.cancel && $options.cancel(...args)),
    d: common_vendor.o((...args) => $options.confirm && $options.confirm(...args)),
    e: common_vendor.sr("popup", "6aeca295-0"),
    f: common_vendor.p({
      type: "top"
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);

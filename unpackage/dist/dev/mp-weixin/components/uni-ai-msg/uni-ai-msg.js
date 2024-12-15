"use strict";
const common_vendor = require("../../common/vendor.js");
const config = require("../../config.js");
const lib_markdownIt_min = require("../../lib/markdown-it.min.js");
const lib_highlight_highlightUni_min = require("../../lib/highlight/highlight-uni.min.js");
require("../../lib/html-parser.js");
const {
  adpid
} = config.config;
let codeDataList = [];
const markdownIt = lib_markdownIt_min.mt({
  // 在源码中启用 HTML 标签
  html: true,
  // 如果结果以 <pre ... 开头，内部包装器则会跳过。
  highlight: function(str, lang) {
    let preCode = "";
    try {
      preCode = lib_highlight_highlightUni_min.$e.highlightAuto(str).value;
    } catch (err) {
      preCode = markdownIt.utils.escapeHtml(str);
    }
    const lines = preCode.split(/\n/).slice(0, -1);
    let html = lines.map((item, index) => {
      if (item == "") {
        return "";
      }
      return '<li><span class="line-num" data-line="' + (index + 1) + '"></span>' + item + "</li>";
    }).join("");
    html = '<ol style="padding: 0px 30px;">' + html + "</ol>";
    codeDataList.push(str);
    let htmlCode = `<div style="background:#0d1117;margin-top: 5px;color: #888;padding:5px 0;border-radius: 5px;">`;
    htmlCode += `<pre class="hljs" style="padding:0 8px;margin-bottom:5px;overflow: auto;display: block;border-radius: 5px;"><code>${html}</code></pre>`;
    htmlCode += "</div>";
    return htmlCode;
  }
});
const _sfc_main = {
  name: "uni-ai-msg",
  data() {
    return {
      // 悬浮的复制按钮的左边距
      left: "-100px",
      // 悬浮的复制按钮的上边距
      top: "-100px",
      adpid,
      showMoreMenu: false
    };
  },
  mounted() {
  },
  created() {
  },
  props: {
    // 是否显示鼠标闪烁的效果
    showCursor: {
      type: [Boolean, Number],
      default() {
        return false;
      }
    },
    isLastMsg: {
      type: Boolean,
      default() {
        return false;
      }
    },
    msg: {
      type: Object,
      default() {
        return {
          content: "",
          isDelete: false
        };
      }
    }
  },
  computed: {
    msgContent() {
      console.log(this.msg.isAi);
      return this.msg.content;
    },
    nodes() {
      if (!this.msgContent) {
        return;
      }
      let htmlString = "";
      if (this.msgContent.split("```").length % 2) {
        let msgContent = this.msgContent;
        if (msgContent[msgContent.length - 1] != "\n") {
          msgContent += "\n";
        }
        msgContent += ' <span class="cursor">|</span>';
        htmlString = markdownIt.render(msgContent);
      } else {
        htmlString = markdownIt.render(this.msgContent) + ' \n <span class="cursor">|</span>';
      }
      return htmlString;
    }
  },
  methods: {
    trOnclick(e) {
      console.log(e);
      let { attrs } = e.detail.node;
      console.log({ attrs });
      let { "code-data-index": codeDataIndex, "class": className } = attrs;
      if (className == "copy-btn") {
        common_vendor.index.setClipboardData({
          data: codeDataList[codeDataIndex],
          showToast: false,
          success() {
            common_vendor.index.showToast({
              title: "复制成功",
              icon: "none"
            });
          }
        });
      }
    },
    changeAnswer() {
      this.$emit("changeAnswer");
    },
    // 复制文本内容到系统剪切板
    copy() {
      common_vendor.index.setClipboardData({
        data: this.msgContent,
        showToast: false,
        success() {
          common_vendor.index.showToast({
            title: "复制成功",
            icon: "none"
          });
        }
      });
      this.showMoreMenu = false;
    },
    // 删除消息
    removeMsg() {
      this.$emit("removeMsg");
      this.showMoreMenu = false;
    }
  }
};
if (!Array) {
  const _easycom_uni_dateformat2 = common_vendor.resolveComponent("uni-dateformat");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_dateformat2 + _easycom_uni_icons2)();
}
const _easycom_uni_dateformat = () => "../../uni_modules/uni-dateformat/components/uni-dateformat/uni-dateformat.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_dateformat + _easycom_uni_icons)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$props.msg.isDelete
  }, !$props.msg.isDelete ? common_vendor.e({
    b: common_vendor.p({
      date: $props.msg.create_time,
      format: "MM/dd hh:mm:ss"
    }),
    c: $props.msg.isAi ? "../../static/uni-ai.png" : "../../static/avatar.png",
    d: $props.msg.isAi
  }, $props.msg.isAi ? common_vendor.e({
    e: $options.nodes && $options.nodes.length
  }, $options.nodes && $options.nodes.length ? {
    f: $options.nodes,
    g: common_vendor.o((...args) => $options.trOnclick && $options.trOnclick(...args))
  } : {}, {
    h: $props.showCursor ? 1 : ""
  }) : {
    i: common_vendor.t($options.msgContent)
  }, {
    j: $props.isLastMsg && $props.msg.isAi
  }, $props.isLastMsg && $props.msg.isAi ? {
    k: common_vendor.o($options.changeAnswer),
    l: common_vendor.p({
      title: "换一个答案",
      color: "#ccc",
      type: "reload",
      size: "16"
    })
  } : {}, {
    m: common_vendor.p({
      size: "12px",
      type: "more-filled",
      color: "#ccc"
    }),
    n: common_vendor.o(($event) => $data.showMoreMenu = !$data.showMoreMenu),
    o: $data.showMoreMenu
  }, $data.showMoreMenu ? {
    p: common_vendor.o((...args) => $options.copy && $options.copy(...args)),
    q: common_vendor.o($options.removeMsg),
    r: common_vendor.p({
      type: "trash",
      size: "20",
      color: "#ccc"
    }),
    s: common_vendor.o(($event) => $data.showMoreMenu = false)
  } : {}, {
    t: $props.msg.isAi ? 1 : "",
    v: !$props.msg.isAi ? 1 : ""
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);

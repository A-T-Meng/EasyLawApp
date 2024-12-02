"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  props: {
    hasLeftWin: {
      type: Boolean
    },
    leftWinActive: {
      type: String
    }
  },
  data() {
    return {
      list: [
        {
          id: "view",
          name: "视图容器",
          open: false,
          pages: [
            "view",
            "scroll-view",
            "swiper",
            "movable-view",
            "cover-view"
          ]
        },
        {
          id: "content",
          name: "基础内容",
          open: false,
          pages: ["text", "rich-text", "progress"]
        },
        {
          id: "form",
          name: "表单组件",
          open: false,
          pages: [
            "button",
            "checkbox",
            "form",
            "input",
            "label",
            "picker",
            "picker-view",
            "radio",
            "slider",
            "switch",
            "textarea",
            "editor"
          ]
        },
        {
          id: "nav",
          name: "导航",
          open: false,
          pages: ["navigator"]
        },
        {
          id: "media",
          name: "媒体组件",
          open: false,
          pages: [
            "image",
            "video"
          ]
        },
        {
          id: "map",
          name: "地图",
          open: false,
          pages: ["map"]
        },
        {
          id: "canvas",
          name: "画布",
          open: false,
          pages: ["canvas"]
        },
        {
          id: "web-view",
          name: "网页",
          open: false,
          pages: ["web-view"]
        },
        {
          id: "ad",
          url: "ad",
          name: "AD组件",
          open: false
        }
      ]
    };
  },
  onShareAppMessage() {
    return {
      title: "欢迎体验uni-app",
      path: "/pages/tabBar/component/component"
    };
  },
  onNavigationBarButtonTap(e) {
    common_vendor.index.navigateTo({
      url: "/pages/about/about"
    });
  },
  methods: {
    triggerCollapse(e, id) {
      if (!this.list[e].pages) {
        this.goDetailPage("", this.list[e].url);
        return;
      }
      for (var i = 0; i < this.list.length; ++i) {
        if (e === i) {
          this.list[i].open = !this.list[i].open;
        } else {
          this.list[i].open = false;
        }
      }
    },
    goDetailPage(panel, e) {
      if (typeof e === "string") {
        const url = "/pages/component/" + e + "/" + e;
        if (this.hasLeftWin) {
          common_vendor.index.reLaunch({
            url
          });
        } else {
          common_vendor.index.navigateTo({
            url
          });
        }
      } else {
        if (this.hasLeftWin) {
          common_vendor.index.reLaunch({
            url: e.url
          });
        } else {
          common_vendor.index.navigateTo({
            url: e.url
          });
        }
      }
    }
  }
};
if (!Array) {
  const _component_u_link = common_vendor.resolveComponent("u-link");
  _component_u_link();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$props.hasLeftWin
  }, !$props.hasLeftWin ? {
    b: common_assets._imports_0
  } : {}, {
    c: !$props.hasLeftWin
  }, !$props.hasLeftWin ? {
    d: common_vendor.p({
      href: "https://uniapp.dcloud.io/component/",
      text: "https://uniapp.dcloud.io/component/",
      inWhiteList: true
    })
  } : {}, {
    e: common_vendor.f($data.list, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.pages ? "" : ""),
        c: common_vendor.n(item.open ? "uni-panel-icon-on" : ""),
        d: common_vendor.n(item.open ? "uni-panel-h-on" : ""),
        e: common_vendor.o(($event) => $options.triggerCollapse(index, item.id), item.id),
        f: item.open
      }, item.open ? {
        g: common_vendor.f(item.pages, (item2, key, i1) => {
          return {
            a: common_vendor.t(item2.name ? item2.name : item2),
            b: $props.leftWinActive === (item2.url ? item2.url.split("/")[3] : item2) && $props.hasLeftWin ? 1 : "",
            c: key,
            d: common_vendor.o(($event) => $options.goDetailPage(item.id, item2), key)
          };
        })
      } : {}, {
        h: item.id
      });
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);

"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      title: "tababr",
      hasSetTabBarBadge: false,
      hasShownTabBarRedDot: false,
      hasCustomedStyle: false,
      hasCustomedItem: false,
      hasHiddenTabBar: false
    };
  },
  destroyed() {
    if (this.hasSetTabBarBadge) {
      common_vendor.index.removeTabBarBadge({
        index: 1
      });
    }
    if (this.hasShownTabBarRedDot) {
      common_vendor.index.hideTabBarRedDot({
        index: 1
      });
    }
    if (this.hasHiddenTabBar) {
      common_vendor.index.showTabBar();
    }
    if (this.hasCustomedStyle) {
      common_vendor.index.setTabBarStyle({
        color: "#7A7E83",
        selectedColor: "#007AFF",
        backgroundColor: "#F8F8F8",
        borderStyle: "black"
      });
    }
    if (this.hasCustomedItem) {
      let tabBarOptions = {
        index: 1,
        text: "接口",
        iconPath: "/static/api.png",
        selectedIconPath: "/static/apiHL.png"
      };
      common_vendor.index.setTabBarItem(tabBarOptions);
    }
  },
  methods: {
    navigateBack() {
      this.$emit("unmount");
    },
    setTabBarBadge() {
      if (this.hasShownTabBarRedDot) {
        common_vendor.index.hideTabBarRedDot({
          index: 1
        });
        this.hasShownTabBarRedDot = !this.hasShownTabBarRedDot;
      }
      if (!this.hasSetTabBarBadge) {
        common_vendor.index.setTabBarBadge({
          index: 1,
          text: "1"
        });
      } else {
        common_vendor.index.removeTabBarBadge({
          index: 1
        });
      }
      this.hasSetTabBarBadge = !this.hasSetTabBarBadge;
    },
    showTabBarRedDot() {
      if (this.hasSetTabBarBadge) {
        common_vendor.index.removeTabBarBadge({
          index: 1
        });
        this.hasSetTabBarBadge = !this.hasSetTabBarBadge;
      }
      if (!this.hasShownTabBarRedDot) {
        common_vendor.index.showTabBarRedDot({
          index: 1
        });
      } else {
        common_vendor.index.hideTabBarRedDot({
          index: 1
        });
      }
      this.hasShownTabBarRedDot = !this.hasShownTabBarRedDot;
    },
    hideTabBar() {
      if (!this.hasHiddenTabBar) {
        common_vendor.index.hideTabBar();
      } else {
        common_vendor.index.showTabBar();
      }
      this.hasHiddenTabBar = !this.hasHiddenTabBar;
    },
    customStyle() {
      if (this.hasCustomedStyle) {
        common_vendor.index.setTabBarStyle({
          color: "#7A7E83",
          selectedColor: "#007AFF",
          backgroundColor: "#F8F8F8",
          borderStyle: "black"
        });
      } else {
        common_vendor.index.setTabBarStyle({
          color: "#FFF",
          selectedColor: "#007AFF",
          backgroundColor: "#000000",
          borderStyle: "black"
        });
      }
      this.hasCustomedStyle = !this.hasCustomedStyle;
    },
    customItem() {
      let tabBarOptions = {
        index: 1,
        text: "接口",
        iconPath: "/static/api.png",
        selectedIconPath: "/static/apiHL.png"
      };
      if (this.hasCustomedItem) {
        common_vendor.index.setTabBarItem(tabBarOptions);
      } else {
        tabBarOptions.text = "API";
        common_vendor.index.setTabBarItem(tabBarOptions);
      }
      this.hasCustomedItem = !this.hasCustomedItem;
    }
  }
};
if (!Array) {
  const _component_page_head = common_vendor.resolveComponent("page-head");
  _component_page_head();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      title: $data.title
    }),
    b: common_vendor.t(!$data.hasSetTabBarBadge ? "设置tab徽标" : "移除tab徽标"),
    c: common_vendor.o((...args) => $options.setTabBarBadge && $options.setTabBarBadge(...args)),
    d: common_vendor.t(!$data.hasShownTabBarRedDot ? "显示红点" : "移除红点"),
    e: common_vendor.o((...args) => $options.showTabBarRedDot && $options.showTabBarRedDot(...args)),
    f: common_vendor.t(!$data.hasCustomedStyle ? "自定义Tab样式" : "移除自定义样式"),
    g: common_vendor.o((...args) => $options.customStyle && $options.customStyle(...args)),
    h: common_vendor.t(!$data.hasCustomedItem ? "自定义Tab信息" : "移除自定义信息"),
    i: common_vendor.o((...args) => $options.customItem && $options.customItem(...args)),
    j: common_vendor.t(!$data.hasHiddenTabBar ? "隐藏TabBar" : "显示TabBar"),
    k: common_vendor.o((...args) => $options.hideTabBar && $options.hideTabBar(...args)),
    l: common_vendor.o((...args) => $options.navigateBack && $options.navigateBack(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);

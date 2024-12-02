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
      hideList: [
        "ucharts",
        "nav-city-dropdown"
      ],
      list: [
        {
          name: "顶部选项卡",
          url: "tabbar"
        },
        {
          name: "组件通讯",
          url: "component-communication"
        },
        // {
        // 	name: 'uCharts 图表',
        // 	url: 'ucharts'
        // },
        {
          name: "列表到详情示例",
          url: "list2detail-list"
        },
        {
          name: "GlobalData和vuex",
          url: "global"
        }
        // {
        // 	name: '微信自定义组件示例（vant ui）',
        // 	url: 'vant-button'
        // }
      ]
    };
  },
  onShareAppMessage() {
    return {
      title: "欢迎体验uni-app",
      path: "/pages/tabBar/template/template"
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
        this.goDetailPage(this.list[e].url);
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
    goDetailPage(e) {
      let path = e.url ? e.url : e;
      let url = ~path.indexOf("platform") ? path : "/pages/template/" + path + "/" + path;
      if (this.hasLeftWin) {
        common_vendor.index.reLaunch({
          url
        });
      } else {
        common_vendor.index.navigateTo({
          url
        });
      }
      return false;
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
    b: common_assets._imports_0$2
  } : {}, {
    c: !$props.hasLeftWin
  }, !$props.hasLeftWin ? {
    d: common_vendor.p({
      href: "https://ext.dcloud.net.cn",
      text: "https://ext.dcloud.net.cn",
      inWhiteList: true
    })
  } : {}, {
    e: common_vendor.f($data.list, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.pages ? "" : ""),
        c: common_vendor.n(item.open ? "uni-panel-icon-on" : ""),
        d: $props.leftWinActive === item.url && $props.hasLeftWin ? 1 : "",
        e: item.open ? 1 : "",
        f: common_vendor.o(($event) => $options.triggerCollapse(index, item.id), item.id),
        g: item.open
      }, item.open ? {
        h: common_vendor.f(item.pages, (item2, key, i1) => {
          return {
            a: common_vendor.t(item2.name ? item2.name : item2),
            b: $props.leftWinActive === item2.url && $props.hasLeftWin ? 1 : "",
            c: $data.hideList.indexOf(item2.url) !== -1 && $props.hasLeftWin ? 1 : "",
            d: key,
            e: common_vendor.o(($event) => $options.goDetailPage(item2), key)
          };
        })
      } : {}, {
        i: $data.hideList.indexOf(item.url) !== -1 && $props.hasLeftWin ? 1 : "",
        j: item.id
      });
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);

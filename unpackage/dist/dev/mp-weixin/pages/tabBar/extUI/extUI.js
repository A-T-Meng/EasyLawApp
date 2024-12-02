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
        "load-more"
      ],
      lists: [
        {
          name: "uni-badge 数字角标",
          url: "badge"
        },
        {
          name: "uni-breadcrumb 面包屑",
          url: "breadcrumb"
        },
        {
          name: "uni-calendar 日历",
          url: "calendar"
        },
        {
          name: "uni-card 卡片",
          url: "card"
        },
        {
          name: "uni-collapse 折叠面板",
          url: "collapse"
        },
        {
          name: "uni-combox 组合框",
          url: "combox"
        },
        {
          name: "uni-countdown 倒计时",
          url: "countdown"
        },
        {
          name: "uni-data-checkbox 数据选择器",
          url: "data-checkbox"
        },
        {
          name: "uni-data-picker 数据驱动的picker选择器",
          url: "data-picker"
        },
        {
          name: "uni-data-select 数据驱动的下拉框",
          url: "data-select"
        },
        {
          name: "uni-dateformat 日期格式化",
          url: "dateformat"
        },
        {
          name: "uni-datetime-picker 日期选择器",
          url: "datetime-picker"
        },
        {
          name: "uni-drawer 抽屉",
          url: "drawer"
        },
        {
          name: "uni-easyinput 增强输入框",
          url: "easyinput"
        },
        {
          name: "uni-fab 悬浮按钮",
          url: "fab"
        },
        {
          name: "uni-fav 收藏按钮",
          url: "fav"
        },
        {
          name: "uni-file-picker 文件选择上传",
          url: "file-picker"
        },
        {
          name: "uni-forms 表单",
          url: "forms"
        },
        {
          name: "uni-goods-nav 商品导航",
          url: "goods-nav"
        },
        {
          name: "uni-grid 宫格",
          url: "grid"
        },
        {
          name: "uni-group 分组",
          url: "group"
        },
        {
          name: "uni-icons 图标",
          url: "icons"
        },
        {
          name: "uni-indexed-list 索引列表",
          url: "indexed-list"
        },
        {
          name: "uni-link 超链接",
          url: "link"
        },
        {
          name: "uni-list 列表",
          url: "list"
        },
        {
          name: "uni-load-more 加载更多",
          url: "load-more"
        },
        {
          name: "uni-nav-bar 自定义导航栏",
          url: "nav-bar"
        },
        {
          name: "uni-notice-bar 通告栏",
          url: "notice-bar"
        },
        {
          name: "uni-number-box 数字输入框",
          url: "number-box"
        },
        {
          name: "uni-pagination 分页器",
          url: "pagination"
        },
        {
          name: "uni-popup 弹出层",
          url: "popup"
        },
        {
          name: "uni-rate 评分",
          url: "rate"
        },
        {
          name: "uni-row 布局-行",
          url: "row"
        },
        {
          name: "uni-search-bar 搜索栏",
          url: "search-bar"
        },
        {
          name: "uni-section 标题栏",
          url: "section"
        },
        {
          name: "uni-segmented-control 分段器",
          url: "segmented-control"
        },
        {
          name: "uni-steps 步骤条",
          url: "steps"
        },
        {
          name: "uni-swipe-action 滑动操作",
          url: "swipe-action"
        },
        {
          name: "uni-swiper-dot 轮播图指示点",
          url: "swiper-dot"
        },
        {
          name: "uni-table 表格",
          url: "table"
        },
        {
          name: "uni-tag 标签",
          url: "tag"
        },
        {
          name: "uni-title 章节标题",
          url: "title"
        },
        {
          name: "uni-tooltip 文字提示",
          url: "tooltip"
        },
        {
          name: "uni-transition 过渡动画",
          url: "transition"
        }
      ]
    };
  },
  onLoad() {
  },
  onReady() {
  },
  onShareAppMessage() {
    return {
      title: "欢迎体验uni-app",
      path: "/pages/tabBar/extUI/extUI"
    };
  },
  onNavigationBarButtonTap(e) {
    common_vendor.index.navigateTo({
      url: "/pages/about/about"
    });
  },
  methods: {
    goDetailPage(path) {
      const url = "/pages/extUI/" + path + "/" + path;
      if (this.hasLeftWin) {
        common_vendor.index.reLaunch({
          url
        });
      } else {
        common_vendor.index.navigateTo({
          url
        });
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
    b: common_assets._imports_0$3
  } : {}, {
    c: !$props.hasLeftWin
  }, !$props.hasLeftWin ? {
    d: common_vendor.p({
      href: "https://ext.dcloud.net.cn/",
      text: "https://ext.dcloud.net.cn",
      inWhiteList: true
    })
  } : {}, {
    e: common_vendor.f($data.lists, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: $props.leftWinActive === item.url && $props.hasLeftWin ? 1 : "",
        c: common_vendor.o(($event) => $options.goDetailPage(item.url), item.url),
        d: $data.hideList.indexOf(item.url) !== -1 && $props.hasLeftWin ? 1 : "",
        e: item.url
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);

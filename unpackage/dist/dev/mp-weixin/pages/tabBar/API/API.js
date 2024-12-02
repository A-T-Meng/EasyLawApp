"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const setTabBar = () => "../../../components/api-set-tabbar.js";
const _sfc_main = {
  components: {
    setTabBar
  },
  props: {
    hasLeftWin: {
      type: Boolean
    },
    leftWinActive: {
      type: String
    }
  },
  data() {
    let mediaPages = [
      {
        name: "图片",
        url: "image"
      },
      {
        name: "音频",
        url: "inner-audio"
      },
      {
        name: "录音",
        url: "voice"
      },
      {
        name: "背景音频",
        url: "background-audio"
      },
      {
        name: "视频",
        url: "video"
      },
      {
        name: "文件",
        url: "file"
      },
      {
        name: "保存媒体到本地",
        url: "save-media"
      }
    ];
    const list = [
      {
        id: "page",
        name: "界面",
        open: false,
        pages: [
          {
            name: "设置导航条",
            url: "set-navigation-bar-title"
          },
          {
            name: "页面跳转",
            url: "navigator"
          },
          {
            name: "设置TabBar",
            url: "set-tabbar"
          },
          {
            name: "下拉刷新",
            url: "pull-down-refresh"
          },
          {
            name: "创建动画",
            url: "animation"
          },
          {
            name: "创建绘画",
            url: "canvas"
          },
          {
            name: "节点信息",
            url: "get-node-info"
          },
          {
            name: "节点布局交互状态",
            url: "intersection-observer"
          },
          {
            name: "显示操作菜单",
            url: "action-sheet"
          },
          {
            name: "显示模态弹窗",
            url: "modal"
          },
          {
            name: "显示加载提示框",
            url: "show-loading"
          },
          {
            name: "显示消息提示框",
            url: "toast"
          }
        ]
      },
      {
        id: "device",
        name: "设备",
        open: false,
        pages: [
          {
            name: "获取设备网络状态",
            url: "get-network-type"
          },
          {
            name: "获取设备系统信息",
            url: "get-system-info"
          },
          {
            name: "打电话",
            url: "make-phone-call"
          },
          {
            name: "震动",
            url: "vibrate"
          },
          {
            name: "添加手机联系人",
            url: "add-phone-contact"
          },
          {
            name: "扫码",
            url: "scan-code"
          },
          {
            name: "剪贴板",
            url: "clipboard"
          },
          {
            name: "屏幕亮度",
            url: "brightness"
          },
          {
            name: "蓝牙",
            url: "bluetooth"
          },
          {
            name: "生物认证",
            url: "soter"
          },
          {
            name: "iBeacon",
            url: "ibeacon"
          },
          {
            name: "监听加速度传感器",
            url: "on-accelerometer-change"
          },
          {
            name: "监听罗盘数据",
            url: "on-compass-change"
          }
        ]
      },
      {
        id: "network",
        name: "网络",
        open: false,
        pages: [
          {
            name: "发起一个请求",
            url: "request"
          },
          {
            name: "上传文件",
            url: "upload-file"
          },
          {
            name: "下载文件",
            url: "download-file"
          }
        ]
      },
      {
        id: "websocket",
        name: "websocket",
        open: false,
        pages: [
          {
            name: "socketTask",
            url: "websocket-socketTask"
          },
          {
            name: "全局websocket",
            url: "websocket-global"
          }
        ]
      },
      {
        id: "media",
        name: "媒体",
        open: false,
        pages: mediaPages
      },
      {
        id: "location",
        name: "位置",
        open: false,
        pages: [
          {
            name: "获取当前位置",
            url: "get-location"
          },
          {
            name: "使用地图查看位置",
            url: "open-location"
          },
          {
            name: "使用地图选择位置",
            url: "choose-location"
          },
          {
            name: "地图控制",
            url: "map"
          }
        ]
      },
      {
        id: "storage",
        name: "数据",
        open: false,
        pages: [
          {
            name: "数据存储（key-value）",
            url: "storage"
          }
        ]
      },
      {
        url: "rewarded-video-ad",
        name: "激励视频广告",
        open: false
      },
      {
        id: "login",
        name: "登录",
        open: false,
        pages: [
          {
            name: "登录",
            url: "login"
          },
          {
            name: "获取用户信息",
            url: "get-user-info"
          }
        ]
      },
      {
        id: "share",
        name: "分享",
        open: false,
        pages: [{
          name: "分享",
          url: "share"
        }]
      },
      {
        id: "payment",
        name: "支付",
        open: false,
        pages: [{
          name: "发起支付",
          url: "request-payment"
        }]
      }
    ];
    return {
      showSetTabBarPage: false,
      list,
      notForPc: [{
        name: "设置TabBar",
        url: "set-tabbar"
      }]
    };
  },
  onShareAppMessage() {
    return {
      title: "欢迎体验uni-app",
      path: "/pages/tabBar/API/API"
    };
  },
  onNavigationBarButtonTap(e) {
    common_vendor.index.navigateTo({
      url: "/pages/about/about"
    });
  },
  onLoad() {
  },
  onReady() {
  },
  onShow() {
    this.navigateFlag = false;
    this.leaveSetTabBarPage();
  },
  onHide() {
    this.leaveSetTabBarPage();
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
      if (e === "set-tabbar") {
        this.showSetTabBarPage = true;
        return;
      }
      let url = ~e.indexOf("platform") ? e : "/pages/API/" + e + "/" + e;
      if (this.hasLeftWin) {
        common_vendor.index.reLaunch({
          url
        });
      } else {
        common_vendor.index.navigateTo({
          url
        });
      }
    },
    leaveSetTabBarPage() {
      this.showSetTabBarPage = false;
    }
  }
};
if (!Array) {
  const _component_set_tab_bar = common_vendor.resolveComponent("set-tab-bar");
  const _component_u_link = common_vendor.resolveComponent("u-link");
  (_component_set_tab_bar + _component_u_link)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.showSetTabBarPage
  }, $data.showSetTabBarPage ? {
    b: common_vendor.o($options.leaveSetTabBarPage)
  } : common_vendor.e({
    c: !$props.hasLeftWin
  }, !$props.hasLeftWin ? {
    d: common_assets._imports_0$1
  } : {}, {
    e: !$props.hasLeftWin
  }, !$props.hasLeftWin ? {
    f: common_vendor.p({
      href: "https://uniapp.dcloud.io/api/",
      text: "https://uniapp.dcloud.io/api/",
      inWhiteList: true
    })
  } : {}, {
    g: common_vendor.f($data.list, (item, index, i0) => {
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
            b: $props.leftWinActive === item2.url && $props.hasLeftWin ? 1 : "",
            c: item2.name === "设置TabBar" && $props.hasLeftWin ? 1 : "",
            d: key,
            e: common_vendor.o(($event) => $options.goDetailPage(item.id, item2.url), key)
          };
        }),
        h: item.url
      } : {}, {
        i: item.id
      });
    })
  }));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);

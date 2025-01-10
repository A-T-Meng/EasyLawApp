"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  data() {
    return {};
  }
};
if (!Array) {
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_grid_item2 = common_vendor.resolveComponent("uni-grid-item");
  const _easycom_uni_grid2 = common_vendor.resolveComponent("uni-grid");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  (_easycom_uni_search_bar2 + _easycom_uni_grid_item2 + _easycom_uni_grid2 + _easycom_uni_section2)();
}
const _easycom_uni_search_bar = () => "../../../uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.js";
const _easycom_uni_grid_item = () => "../../../uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.js";
const _easycom_uni_grid = () => "../../../uni_modules/uni-grid/components/uni-grid/uni-grid.js";
const _easycom_uni_section = () => "../../../uni_modules/uni-section/components/uni-section/uni-section.js";
if (!Math) {
  (_easycom_uni_search_bar + _easycom_uni_grid_item + _easycom_uni_grid + _easycom_uni_section)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(_ctx.search),
    b: common_vendor.o(_ctx.blur),
    c: common_vendor.o(_ctx.focus),
    d: common_vendor.o(_ctx.input),
    e: common_vendor.o(_ctx.cancel),
    f: common_vendor.o(_ctx.clear),
    g: common_vendor.o(($event) => _ctx.searchValue = $event),
    h: common_vendor.p({
      focus: true,
      modelValue: _ctx.searchValue
    }),
    i: common_assets._imports_0,
    j: common_assets._imports_1,
    k: common_assets._imports_0,
    l: common_assets._imports_1,
    m: common_assets._imports_0,
    n: common_assets._imports_1,
    o: common_assets._imports_0,
    p: common_assets._imports_1,
    q: common_assets._imports_0,
    r: common_assets._imports_1,
    s: common_assets._imports_0,
    t: common_assets._imports_1,
    v: common_vendor.o(_ctx.change),
    w: common_vendor.p({
      column: 4,
      highlight: true,
      showBorder: false,
      square: false
    }),
    x: common_vendor.p({
      title: "合同审查",
      ["sub-title"]: "合同一键审查 修改 导出",
      padding: "0 0 5px 10px"
    }),
    y: common_assets._imports_2,
    z: common_assets._imports_3,
    A: common_assets._imports_4,
    B: common_assets._imports_5,
    C: common_assets._imports_2,
    D: common_assets._imports_3,
    E: common_assets._imports_4,
    F: common_assets._imports_5,
    G: common_vendor.o(_ctx.change),
    H: common_vendor.p({
      column: 4,
      highlight: true,
      showBorder: false,
      square: false
    }),
    I: common_vendor.p({
      title: "文书起草",
      ["sub-title"]: "交互式生成起诉状和答辩状",
      padding: "0 0 5px 10px"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);

"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class SliceMsgToLastMsg {
  constructor(arg) {
    // 所有待插入的消息数据
    __publicField(this, "msgs", "");
    // 是否正在分割消息数据
    __publicField(this, "sliceMsgIng", false);
    this.$ = arg;
    this.t = 70;
    this.msgCreateTime = false;
    this.stopAction = false;
  }
  addMsg(msg) {
    this.msgs += msg;
    if (this.sliceMsgIng === false) {
      this.sliceMsg();
    }
  }
  end() {
    this.stopAction = true;
  }
  sliceMsg() {
    if (this.stopAction === true) {
      return;
    }
    this.sliceMsgIng = true;
    const msgsArr = this.msgs.match(/[\p{Script=Han}]|[^\p{Script=Han}]+/gu);
    let msg = msgsArr.reverse().pop();
    this.$.updateLastMsg((lastMsg) => {
      if (this.msgCreateTime && this.msgCreateTime != lastMsg.create_time) {
        return;
      }
      this.msgCreateTime = lastMsg.create_time;
      lastMsg.content += msg;
    });
    this.$.showLastMsg();
    this.msgs = msgsArr.reverse().join("");
    if (this.msgs.length) {
      if (this.t) {
        setTimeout(() => {
          this.sliceMsg(this.msgs);
        }, this.t);
      } else {
        this.sliceMsg(this.msgs);
      }
    } else {
      this.sliceMsgIng = false;
    }
  }
}
exports.SliceMsgToLastMsg = SliceMsgToLastMsg;

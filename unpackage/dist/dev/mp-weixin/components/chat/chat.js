"use strict";
const common_vendor = require("../../common/vendor.js");
const components_chat_SliceMsgToLastMsg = require("./SliceMsgToLastMsg.js");
const _sfc_main = {
  data() {
    return {
      // 使聊天窗口滚动到指定元素id的值
      scrollIntoView: "",
      // 消息列表数据
      msgList: [],
      // 通讯请求状态
      requestState: 0,
      //0发送中 100发送成功 -100发送失败
      // 本地对话是否因积分不足而终止
      insufficientScore: false,
      // 输入框的消息内容
      content: "",
      // 记录流式响应次数
      sseIndex: 0,
      // 是否启用流式响应模式
      enableStream: true,
      // 当前屏幕是否为宽屏
      isWidescreen: false,
      llmModel: false,
      keyboardHeight: 0,
      socketOpen: false,
      socketMsgQueue: []
    };
  },
  computed: {
    // 输入框是否禁用
    inputBoxDisabled() {
      return false;
    },
    // 获取当前环境
    NODE_ENV() {
      return "development";
    },
    footBoxPaddingBottom() {
      return (this.keyboardHeight || 10) + "px";
    }
  },
  // 监听msgList变化，将其存储到本地缓存中
  watch: {
    msgList: {
      handler(msgList) {
        common_vendor.index.setStorage({
          "key": "uni-ai-msg",
          "data": msgList
        });
      },
      // 深度监听msgList变化
      deep: true
    },
    insufficientScore(insufficientScore) {
      common_vendor.index.setStorage({
        "key": "uni-ai-chat-insufficientScore",
        "data": insufficientScore
      });
    },
    llmModel(llmModel) {
      common_vendor.index.setStorage({
        key: "uni-ai-chat-llmModel",
        data: llmModel
      });
    }
  },
  beforeMount() {
  },
  async mounted() {
    this.initSocket();
    this.msgList = common_vendor.index.getStorageSync("uni-ai-msg") || [];
    this.llmModel = common_vendor.index.getStorageSync("uni-ai-chat-llmModel");
    this.insufficientScore = common_vendor.index.getStorageSync("uni-ai-chat-insufficientScore") || false;
    let length = this.msgList.length;
    if (length) {
      let lastMsg = this.msgList[length - 1];
      if (!lastMsg.isAi) {
        this.send();
      }
    }
    this.$nextTick(() => {
      this.showLastMsg();
    });
    common_vendor.index.onKeyboardHeightChange((e2) => {
      this.keyboardHeight = e2.height;
      this.$nextTick(() => {
        this.showLastMsg();
      });
    });
  },
  methods: {
    sendSocketMessage(message) {
      console.log(message.content);
      if (this.socketOpen) {
        common_vendor.index.sendSocketMessage({
          data: message.content
        });
      } else {
        this.socketMsgQueue.push(message);
      }
    },
    initSocket() {
      common_vendor.index.connectSocket({
        url: "ws://127.0.0.1:8888/ws"
      });
      common_vendor.index.onSocketOpen((res) => {
        this.socketOpen = true;
        this.socketMsgQueue = [];
      });
      common_vendor.index.onSocketError(function(res) {
        console.log("WebSocket连接打开失败，请检查！");
      });
      common_vendor.index.onSocketMessage((res) => {
        console.log("收到服务器内容：" + res.data, this.sseIndex);
        if (res.data === "endendend") {
          this.closeSseChannel();
        } else {
          if (this.sseIndex === 0) {
            this.msgList.push({
              // 标记为非人工智能机器人，即：为用户发送的消息
              isAi: true,
              // 消息内容
              content: res.data,
              // 消息创建时间
              create_time: Date.now()
            });
          } else {
            this.sliceMsgToLastMsg.addMsg(res.data);
          }
          this.showLastMsg();
          this.sseIndex++;
        }
      });
      common_vendor.index.onSocketClose(function(res) {
        console.log("WebSocket connection closed");
        this.sliceMsgToLastMsg.t = 0;
        if (e && typeof e == "object" && e.errCode) {
          let setLastAiMsgContent = (content) => {
            if (this.sseIndex === 0) {
              this.msgList.push({
                isAi: true,
                content,
                create_time: Date.now()
              });
            } else {
              this.updateLastMsg((lastMsg) => {
                lastMsg.content += content;
              });
            }
            this.showLastMsg();
          };
          if (e.errCode == 60004) {
            let length = this.msgList.length;
            if (length % 2) {
              this.msgList.push({
                isAi: true,
                content: "内容涉及敏感",
                illegal: true,
                create_time: Date.now()
              });
              length += 1;
            }
            this.msgList[length - 2].illegal = true;
            this.msgList[length - 1].illegal = true;
            this.msgList[length - 1].content = "内容涉及敏感";
          } else {
            setLastAiMsgContent(e.errMsg);
          }
        }
      });
    },
    setLLMmodel() {
      this.$refs["llm-config"].open((model) => {
        console.log("model", model);
        this.llmModel = model;
      });
    },
    // 更新最后一条消息
    updateLastMsg(param) {
      let length = this.msgList.length;
      if (length === 0) {
        return;
      }
      let lastMsg = this.msgList[length - 1];
      if (typeof param == "function") {
        let callback = param;
        callback(lastMsg);
      } else {
        const [data, cover = false] = arguments;
        if (cover) {
          lastMsg = data;
        } else {
          lastMsg = Object.assign(lastMsg, data);
        }
      }
      this.msgList.splice(length - 1, 1, lastMsg);
    },
    // 换一个答案
    async changeAnswer() {
      if (this.sseIndex) {
        this.closeSseChannel();
      }
      this.msgList.pop();
      this.updateLastMsg({
        // 防止 偶发答案涉及敏感，重复回答时。提问内容 被卡掉无法重新问
        illegal: false
      });
      this.insufficientScore = false;
      this.send();
    },
    removeMsg(index) {
      if (this.msgList[index].isAi) {
        index -= 1;
      }
      if (this.sseIndex && index == this.msgList.length - 2) {
        this.closeSseChannel();
      }
      this.msgList.splice(index, 2);
    },
    async beforeSend() {
      if (this.inputBoxDisabled) {
        return common_vendor.index.showToast({
          title: "ai正在回复中不能发送",
          icon: "none"
        });
      }
      if (!this.content) {
        return common_vendor.index.showToast({
          // 提示内容
          title: "内容不能为空",
          // 不显示图标
          icon: "none"
        });
      }
      this.msgList.push({
        // 标记为非人工智能机器人，即：为用户发送的消息
        isAi: false,
        // 消息内容
        content: this.content,
        // 消息创建时间
        create_time: Date.now()
      });
      this.showLastMsg();
      this.$nextTick(() => {
        this.content = "";
      });
      this.send();
    },
    async send() {
      this.requestState = 0;
      if (this.afterChatCompletion && this.afterChatCompletion.clear)
        this.afterChatCompletion.clear();
      let message = this.msgList[this.msgList.length - 1];
      console.log("send to ai message:", message);
      if (this.enableStream) {
        this.sliceMsgToLastMsg = new components_chat_SliceMsgToLastMsg.SliceMsgToLastMsg(this);
        this.sendSocketMessage(message);
      }
    },
    closeSseChannel() {
      this.sseIndex = 0;
    },
    // 滚动窗口以显示最新的一条消息
    showLastMsg() {
      this.$nextTick(() => {
        this.scrollIntoView = "last-msg-item";
        this.$nextTick(() => {
          this.scrollIntoView = "";
        });
      });
    },
    // 清空消息列表
    clearAllMsg(e2) {
      common_vendor.index.showModal({
        title: "确认要清空聊天记录？",
        content: "本操作不可撤销",
        complete: (e3) => {
          if (e3.confirm) {
            this.closeSseChannel();
            this.msgList.splice(0, this.msgList.length);
          }
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_ai_msg2 = common_vendor.resolveComponent("uni-ai-msg");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_llm_config2 = common_vendor.resolveComponent("llm-config");
  (_easycom_uni_ai_msg2 + _easycom_uni_icons2 + _easycom_llm_config2)();
}
const _easycom_uni_ai_msg = () => "../uni-ai-msg/uni-ai-msg.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_llm_config = () => "../llm-config/llm-config.js";
if (!Math) {
  (_easycom_uni_ai_msg + _easycom_uni_icons + _easycom_llm_config)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.msgList.length === 0
  }, $data.msgList.length === 0 ? {} : {}, {
    b: common_vendor.f($data.msgList, (msg, index, i0) => {
      return {
        a: common_vendor.sr("msg", "5df516c5-0-" + i0, {
          "f": 1
        }),
        b: index,
        c: common_vendor.o($options.changeAnswer, index),
        d: common_vendor.o(($event) => $options.removeMsg(index), index),
        e: "5df516c5-0-" + i0,
        f: common_vendor.p({
          msg,
          ["show-cursor"]: index == $data.msgList.length - 1 && $data.msgList.length % 2 === 0 && $data.sseIndex,
          isLastMsg: index == $data.msgList.length - 1
        })
      };
    }),
    c: $data.msgList.length % 2 !== 0
  }, $data.msgList.length % 2 !== 0 ? common_vendor.e({
    d: $data.requestState == -100
  }, $data.requestState == -100 ? {
    e: common_vendor.o($options.send),
    f: common_vendor.p({
      color: "#d22",
      type: "refresh-filled"
    })
  } : $data.msgList.length ? {} : {}, {
    g: $data.msgList.length
  }) : {}, {
    h: $data.sseIndex
  }, $data.sseIndex ? {
    i: common_vendor.o((...args) => $options.closeSseChannel && $options.closeSseChannel(...args))
  } : {}, {
    j: $data.scrollIntoView,
    k: !$data.isWidescreen
  }, !$data.isWidescreen ? {
    l: common_vendor.p({
      type: "trash",
      color: "#888"
    }),
    m: common_vendor.o((...args) => $options.clearAllMsg && $options.clearAllMsg(...args)),
    n: common_vendor.p({
      type: "trash",
      color: "#888"
    }),
    o: common_vendor.o((...args) => $options.clearAllMsg && $options.clearAllMsg(...args)),
    p: common_vendor.p({
      type: "trash",
      color: "#888"
    }),
    q: common_vendor.o((...args) => $options.clearAllMsg && $options.clearAllMsg(...args)),
    r: common_vendor.p({
      type: "trash",
      color: "#888"
    }),
    s: common_vendor.o((...args) => $options.clearAllMsg && $options.clearAllMsg(...args))
  } : {}, {
    t: !$data.isWidescreen,
    v: -1,
    w: $data.content,
    x: common_vendor.o(($event) => $data.content = $event.detail.value),
    y: common_vendor.o((...args) => $options.beforeSend && $options.beforeSend(...args)),
    z: $options.inputBoxDisabled || !$data.content,
    A: $data.msgList.length && $data.msgList.length % 2 !== 0 ? "ai正在回复中不能发送" : "",
    B: common_vendor.sr("llm-config", "5df516c5-6")
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);

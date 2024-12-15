"use strict";
const common_vendor = require("../../common/vendor.js");
const config = require("../../config.js");
const common_unicloudCoTask = require("../../common/unicloud-co-task.js");
const components_chat_SliceMsgToLastMsg = require("./SliceMsgToLastMsg.js");
const {
  adpid
} = config.config;
let sseChannel = false;
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
      // 广告位id
      adpid,
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
    if (this.adpid && common_vendor.Ys.getCurrentUserInfo().tokenExpired > Date.now()) {
      let db = common_vendor.Ys.databaseForJQL();
      let res = await db.collection("uni-id-users").where({
        // 当前用户id
        "_id": common_vendor.Ys.getCurrentUserInfo().uid
      }).field("score").get();
      console.log("当前用户有多少积分:", res.data[0] && res.data[0].score);
    }
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
    sendSocketMessage(messages) {
      for (var i = 0; i < messages.length; i++) {
        console.log(messages[i].content);
        if (this.socketOpen) {
          common_vendor.index.sendSocketMessage({
            data: messages[i].content
          });
        } else {
          this.socketMsgQueue.push(messages[i]);
        }
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
      });
      common_vendor.index.onSocketClose(function(res) {
        console.log("WebSocket 已关闭！");
        console.log("WebSocket connection closed");
        console.log("sse 结束", e);
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
    // 广告关闭事件
    onAdClose(e2) {
      console.log(22222222222222224e25);
      console.log("onAdClose e.detail.isEnded", e2.detail.isEnded);
      if (e2.detail.isEnded) {
        let i = 0;
        common_vendor.index.showLoading({
          mask: true
        });
        let myIntive = setInterval(async (e3) => {
          i++;
          const db = common_vendor.Ys.database();
          let res = await db.collection("uni-id-users").where('"_id" == $cloudEnv_uid').field("score").get();
          let {
            score
          } = res.result.data[0] || {};
          console.log("score", score);
          if (score > 0 || i > 5) {
            clearInterval(myIntive);
            common_vendor.index.hideLoading();
            if (score > 0) {
              this.insufficientScore = false;
              this.msgList.pop();
              this.$nextTick(() => {
                this.send();
                common_vendor.index.showToast({
                  title: "积分余额:" + score,
                  icon: "none"
                });
              });
            }
          }
        }, 2e3);
      }
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
      console.log(33333333333333333e8);
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
      if (this.adpid) {
        let token = common_vendor.index.getStorageSync("uni_id_token");
        if (!token) {
          return common_vendor.index.showModal({
            // 提示内容
            content: "启用激励视频，客户端需登录并启用安全网络",
            // 不显示取消按钮
            showCancel: false,
            // 确认按钮文本
            confirmText: "查看详情",
            // 弹框关闭后执行的回调函数
            complete() {
              let url = "https://uniapp.dcloud.net.cn/uniCloud/uni-ai-chat.html#ad";
              common_vendor.index.setClipboardData({
                // 复制的内容
                data: url,
                // 不显示提示框
                showToast: false,
                // 复制成功后的回调函数
                success() {
                  common_vendor.index.showToast({
                    // 提示内容
                    title: "已复制文档链接，请到浏览器粘贴浏览",
                    // 不显示图标
                    icon: "none",
                    // 提示框持续时间
                    duration: 5e3
                  });
                }
              });
            }
          });
        }
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
      let messages = [];
      let msgs = JSON.parse(JSON.stringify(this.msgList));
      let findIndex = [...msgs].reverse().findIndex((item) => item.summarize);
      if (findIndex != -1) {
        let aiSummaryIndex = msgs.length - findIndex - 1;
        msgs[aiSummaryIndex].content = msgs[aiSummaryIndex].summarize;
        msgs = msgs.splice(aiSummaryIndex);
      } else {
        msgs = msgs.splice(-10);
      }
      msgs = msgs.filter((msg) => !msg.illegal);
      messages = msgs.map((item) => {
        let role = "user";
        if (item.isAi) {
          role = item.summarize ? "system" : "assistant";
        }
        return {
          content: item.content,
          role
        };
      });
      console.log("send to ai messages:", messages);
      let sseEnd, requestEnd;
      if (this.enableStream) {
        this.sliceMsgToLastMsg = new components_chat_SliceMsgToLastMsg.SliceMsgToLastMsg(this);
        this.sendSocketMessage(messages)(function fnSelf(that) {
          fnSelf.clear = () => {
            if (fnSelf.clear.sse) {
              fnSelf.clear.sse();
            }
            if (fnSelf.clear.request) {
              fnSelf.clear.request();
            }
          };
          Promise.all([
            new Promise((resolve, reject) => {
              sseEnd = resolve;
              fnSelf.clear.sse = reject;
            }),
            new Promise((resolve, reject) => {
              requestEnd = resolve;
              fnSelf.clear.request = reject;
            })
          ]).then((e2) => {
            sseChannel.close();
            that.sseIndex = 0;
          }).catch((err) => {
          });
          that.afterChatCompletion = fnSelf;
        })(this);
      }
      common_unicloudCoTask.main({
        coName: "uni-ai-chat",
        funName: "send",
        param: [{
          messages,
          // 消息列表
          sseChannel,
          // 消息通道
          llmModel: this.llmModel
        }],
        config: {
          customUI: true
        },
        success: (res) => {
          this.requestState = 100;
          if (!res.data)
            return;
          let {
            reply,
            summarize,
            insufficientScore,
            illegal
          } = res.data;
          if (this.enableStream == false && !reply) {
            illegal = true;
            reply = "内容涉及敏感";
          }
          if (this.enableStream == false && illegal) {
            console.error("内容涉及敏感");
            this.updateLastMsg({
              // 添加消息涉敏标记
              illegal: true
            });
          }
          if (insufficientScore) {
            this.insufficientScore = true;
          }
          if (summarize) {
            console.log(" 拿到总结", summarize);
            let index = this.msgList.length - 1;
            if (index % 2) {
              index -= 2;
            } else {
              index -= 1;
            }
            if (index < 1) {
              index = 1;
            }
            let msg = this.msgList[index];
            msg.summarize = summarize;
            this.msgList.splice(index, 1, msg);
          }
        },
        complete: (e2) => {
          if (this.enableStream) {
            requestEnd();
          }
          this.$nextTick(() => {
            this.showLastMsg();
          });
        },
        fail: (e2) => {
          console.error(e2);
          this.requestState = -100;
          common_vendor.index.showModal({
            content: JSON.stringify(e2.message),
            showCancel: false
          });
          if (this.enableStream) {
            sseEnd();
          }
        }
      });
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
  const _easycom_uni_link2 = common_vendor.resolveComponent("uni-link");
  const _easycom_llm_config2 = common_vendor.resolveComponent("llm-config");
  (_easycom_uni_ai_msg2 + _easycom_uni_icons2 + _easycom_uni_link2 + _easycom_llm_config2)();
}
const _easycom_uni_ai_msg = () => "../uni-ai-msg/uni-ai-msg.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_link = () => "../../uni_modules/uni-link/components/uni-link/uni-link.js";
const _easycom_llm_config = () => "../llm-config/llm-config.js";
if (!Math) {
  (_easycom_uni_ai_msg + _easycom_uni_icons + _easycom_uni_link + _easycom_llm_config)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.msgList.length === 0
  }, $data.msgList.length === 0 ? {} : {}, {
    b: common_vendor.f($data.msgList, (msg, index, i0) => {
      return {
        a: common_vendor.sr("msg", "0a20f884-0-" + i0, {
          "f": 1
        }),
        b: index,
        c: common_vendor.o($options.changeAnswer, index),
        d: common_vendor.o(($event) => $options.removeMsg(index), index),
        e: "0a20f884-0-" + i0,
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
  } : $data.msgList.length ? common_vendor.e({
    h: $options.NODE_ENV == "development" && !$data.enableStream
  }, $options.NODE_ENV == "development" && !$data.enableStream ? {
    i: common_vendor.p({
      href: "https://uniapp.dcloud.net.cn/uniCloud/uni-ai-chat.html",
      text: "[流式响应]"
    })
  } : {}) : {}, {
    g: $data.msgList.length
  }) : {}, {
    j: $data.adpid
  }, $data.adpid ? {} : {}, {
    k: $data.sseIndex
  }, $data.sseIndex ? {
    l: common_vendor.o((...args) => $options.closeSseChannel && $options.closeSseChannel(...args))
  } : {}, {
    m: $data.scrollIntoView,
    n: !$data.isWidescreen
  }, !$data.isWidescreen ? {
    o: common_vendor.o($options.clearAllMsg),
    p: common_vendor.p({
      type: "trash",
      size: "24",
      color: "#888"
    }),
    q: common_vendor.o($options.setLLMmodel),
    r: common_vendor.p({
      color: "#555",
      size: "20px",
      type: "settings"
    })
  } : {}, {
    s: !$data.isWidescreen,
    t: -1,
    v: $data.content,
    w: common_vendor.o(($event) => $data.content = $event.detail.value),
    x: common_vendor.o((...args) => $options.beforeSend && $options.beforeSend(...args)),
    y: $options.inputBoxDisabled || !$data.content,
    z: $data.msgList.length && $data.msgList.length % 2 !== 0 ? "ai正在回复中不能发送" : "",
    A: $options.footBoxPaddingBottom,
    B: common_vendor.sr("llm-config", "0a20f884-5")
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);

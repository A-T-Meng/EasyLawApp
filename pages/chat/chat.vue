<template>
	<view class="container">
		<!-- #ifdef H5 -->
		<view v-if="isWidescreen" class="header">uni-ai-chat</view>
		<!-- #endif -->
		<text class="noData" v-if="msgList.length === 0">没有对话记录</text>
		<scroll-view :scroll-into-view="scrollIntoView" scroll-y="true" class="msg-list" :enable-flex="true">
			<uni-ai-msg ref="msg" v-for="(msg,index) in msgList" :key="index" :msg="msg" @changeAnswer="changeAnswer"
				:show-cursor="index == msgList.length - 1 && msgList.length%2 === 0 && sseIndex"
				:isLastMsg="index == msgList.length - 1" @removeMsg="removeMsg(index)"></uni-ai-msg>
			<template v-if="msgList.length%2 !== 0">
				<view v-if="requestState == -100" class="retries-box">
					<text>消息发送失败</text>
					<uni-icons @click="send" color="#d22" type="refresh-filled" class="retries-icon"></uni-icons>
				</view>
				<view class="tip-ai-ing" v-else-if="msgList.length">
					<text>uni-ai正在思考中...</text>
					<view v-if="NODE_ENV == 'development' && !enableStream">
						如需提速，请开通<uni-link class="uni-link" href="https://uniapp.dcloud.net.cn/uniCloud/uni-ai-chat.html"
							text="[流式响应]"></uni-link>
					</view>
				</view>
			</template>
			<view v-if="adpid" class="open-ad-btn-box">
				<text style="color: red;">
					默认不启用广告组件(被注释)，如需使用，请"去掉注释"(“重新运行”后生效)
					位置：/pages/chat/chat.vue 第30行，或全局搜索 uni-ad-rewarded-video
				</text>
				<!-- <uni-ad-rewarded-video v-show="insufficientScore" :adpid="adpid" @onAdClose="onAdClose"></uni-ad-rewarded-video> -->
			</view>
			<view @click="closeSseChannel" class="stop-responding" v-if="sseIndex"> ▣ 停止响应</view>
			<view id="last-msg-item" style="height: 1px;"></view>
		</scroll-view>

		<view class="foot-box" :style="{'padding-bottom':footBoxPaddingBottom}">
			<!-- #ifdef H5 -->
			<view class="pc-menu" v-if="isWidescreen">
				<view class="pc-trash pc-menu-item" @click="clearAllMsg" title="删除">
					<image src="@/static/remove.png" mode="heightFix"></image>
				</view>
				<view class="settings pc-menu-item" @click="setLLMmodel" title="设置">
					<uni-icons color="#555" size="20px" type="settings"></uni-icons>
				</view>
			</view>
			<!-- #endif -->
			<view class="foot-box-content">
				<view v-if="!isWidescreen" class="menu">
					<uni-icons class="menu-item" @click="clearAllMsg" type="trash" size="24" color="#888"></uni-icons>
					<uni-icons class="menu-item" @click="setLLMmodel" color="#555" size="20px"
						type="settings"></uni-icons>
				</view>
				<view class="textarea-box">
					<textarea v-model="content" :cursor-spacing="15" class="textarea" :auto-height="!isWidescreen"
						placeholder="请输入要发给uni-ai的内容" :maxlength="-1" :adjust-position="false"
						:disable-default-padding="false" placeholder-class="input-placeholder"></textarea>
				</view>
				<view class="send-btn-box" :title="(msgList.length && msgList.length%2 !== 0) ? 'ai正在回复中不能发送':''">
					<!-- #ifdef H5 -->
					<text v-if="isWidescreen" class="send-btn-tip">↵ 发送 / shift + ↵ 换行</text>
					<!-- #endif -->
					<button @click="beforeSend" :disabled="inputBoxDisabled || !content" class="send"
						type="primary">发送</button>
				</view>
			</view>
		</view>
		<llm-config ref="llm-config"></llm-config>
	</view>
</template>

<script>
	// 引入配置文件
	import config from '@/config.js';

	// 导入uniCloud云对象task模块
	import uniCoTask from '@/common/unicloud-co-task.js';
	// 导入 将多个字消息文本，分割成单个字 分批插入到最末尾的消息中 的类
	import SliceMsgToLastMsg from './SliceMsgToLastMsg.js';

	// 获取广告id
	const {
		adpid
	} = config
	// 初始化sse通道
	let sseChannel = false;

	// 键盘的shift键是否被按下
	let shiftKeyPressed = false
	
	let socketOpen = false;
	let socketMsgQueue = [];
		
	export default {
		data() {
			return {
				// 使聊天窗口滚动到指定元素id的值
				scrollIntoView: "",
				// 消息列表数据
				msgList: [],
				// 通讯请求状态
				requestState:0,//0发送中 100发送成功 -100发送失败
				// 本地对话是否因积分不足而终止
				insufficientScore:false,
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
				keyboardHeight: 0
			}
		},
		onLoad() {
			console.log(111111, this.msgList);
			// 页面启动的生命周期，这里编写页面加载时的逻辑
			this.initSocket();
		},
		computed: {
			// 输入框是否禁用
			inputBoxDisabled() {
				// 如果正在等待流式响应，则禁用输入框
				if (this.sseIndex !== 0) {
					return true
				}
				// 如果消息列表长度为奇数，则禁用输入框
				return !!(this.msgList.length && this.msgList.length % 2 !== 0)
			},
			// 获取当前环境
			NODE_ENV() {
				return process.env.NODE_ENV
			},
			footBoxPaddingBottom() {
				return (this.keyboardHeight || 10) + 'px'
			}
		},
		// 监听msgList变化，将其存储到本地缓存中
		watch: {
			msgList: {
				handler(msgList) {
					// 将msgList存储到本地缓存中
					uni.setStorage({
						"key": "uni-ai-msg",
						"data": msgList
					})
				},
				// 深度监听msgList变化
				deep: true
			},
			insufficientScore(insufficientScore){
				uni.setStorage({
					"key": "uni-ai-chat-insufficientScore",
					"data": insufficientScore
				})
			},
			llmModel(llmModel) {
				let title = 'uni-ai-chat'
				if (llmModel) {
					title += ` (${llmModel})`
				}
				// uni.setNavigationBarTitle({title})
				// #ifdef H5
				if (this.isWidescreen) {
					document.querySelector('.header').innerText = title
				}
				// #endif
				uni.setStorage({
					key: 'uni-ai-chat-llmModel',
					data: llmModel
				})
			}
		},
		beforeMount() {
			// #ifdef H5
			// 监听屏幕宽度变化，判断是否为宽屏 并设置isWidescreen的值
			uni.createMediaQueryObserver(this).observe({
				minWidth: 650,
			}, matches => {
				this.isWidescreen = matches;
			})
			// #endif
		},
		async mounted() {
			// 如果存在广告位id且用户token未过期
			if (this.adpid && uniCloud.getCurrentUserInfo().tokenExpired > Date.now()) {
				// 查询当前用户的积分
				// 获取数据库对象
				let db = uniCloud.databaseForJQL();
				// 获取uni-id-users集合
				let res = await db.collection("uni-id-users")
					// 查询条件
					.where({
						// 当前用户id
						"_id": uniCloud.getCurrentUserInfo().uid
					})
					// 返回score字段
					.field('score')
					// 执行查询
					.get()
				// 输出当前用户积分
				console.log('当前用户有多少积分:', res.data[0] && res.data[0].score);
			}

			// for (let i = 0; i < 15; i++) {
			// 	this.msgList.push({
			// 		isAi: i % 2 == true,
			// 		content: "1-" + i
			// 	})
			// }

			// 获得历史对话记录
			this.msgList = uni.getStorageSync('uni-ai-msg') || [];

			// 获得之前设置的llmModel
			this.llmModel = uni.getStorageSync('uni-ai-chat-llmModel')
			
			// 获得之前设置的uni-ai-chat-insufficientScore
			this.insufficientScore = uni.getStorageSync('uni-ai-chat-insufficientScore') || false

			// 如果上一次对话中 最后一条消息ai未回复。则一启动就自动重发。
			let length = this.msgList.length
			if (length) {
				let lastMsg = this.msgList[length - 1]
				if (!lastMsg.isAi) {
					this.send()
				}
			}

			// this.msgList.pop()
			// console.log('this.msgList', this.msgList);

			// 在dom渲染完毕后 使聊天窗口滚动到最后一条消息
			this.$nextTick(() => {
				this.showLastMsg()
			})

			// #ifdef H5
			//获得消息输入框对象
			let adjunctKeydown = false
			const textareaDom = document.querySelector('.textarea-box textarea');
			if (textareaDom) {
				//键盘按下时
				textareaDom.onkeydown = e => {
					// console.log('onkeydown', e.keyCode)
					if ([16, 17, 18, 93].includes(e.keyCode)) {
						//按下了shift ctrl alt windows键
						adjunctKeydown = true;
					}
					if (e.keyCode == 13 && !adjunctKeydown) {
						e.preventDefault()
						// 执行发送
						setTimeout(() => {
							this.beforeSend();
						}, 300)
					}
				};
				textareaDom.onkeyup = e => {
					//松开adjunct键
					if ([16, 17, 18, 93].includes(e.keyCode)) {
						adjunctKeydown = false;
					}
				};
				
				// 可视窗口高
				let initialInnerHeight = window.innerHeight;
				if (uni.getSystemInfoSync().platform == "ios") {
					textareaDom.addEventListener('focus', () => {
						let interval = setInterval(function() {
							if (window.innerHeight !== initialInnerHeight) {
								clearInterval(interval)
								// 触发相应的回调函数
								document.querySelector('.container').style.height = window.innerHeight + 'px'
								window.scrollTo(0, 0);
								this.showLastMsg()
							}
						}, 1);
					})
					textareaDom.addEventListener('blur', () => {
						document.querySelector('.container').style.height = initialInnerHeight + 'px'
					})
				}else{
					window.addEventListener('resize',(e)=>{
						this.showLastMsg()
					})
				}
			}
			// #endif

			// #ifndef H5
			uni.onKeyboardHeightChange(e => {
				this.keyboardHeight = e.height
				// 在dom渲染完毕后 使聊天窗口滚动到最后一条消息
				this.$nextTick(() => {
					this.showLastMsg()
				})
			})
			// #endif
		},
		methods: {			
			sendSocketMessage(msg) {
				console.log(msg, this.msgList)
				if (socketOpen) {
					uni.sendSocketMessage({
						data: msg
					});
				} else {
					socketMsgQueue.push(msg);
				}
			},
			
			initSocket() {
				let aaa = this
				uni.connectSocket({
				  url: 'ws://127.0.0.1:8888/ws'
				});
				
				uni.onSocketOpen(function (res) {
					aaa.msgList.push({
						// 标记为非人工智能机器人，即：为用户发送的消息
						isAi: false,
						// 消息内容
						content: 'hahahha',
						// 消息创建时间
						create_time: Date.now()
					});
					socketOpen = true;
					for (var i = 0; i < socketMsgQueue.length; i++) {
						aaa.sendSocketMessage(socketMsgQueue[i]);
					};
					socketMsgQueue = [];
				});
				
				uni.onSocketError(function (res) {
					console.log('WebSocket连接打开失败，请检查！');
				});
				
				uni.onSocketMessage(function (res) {
				  console.log('收到服务器内容：' + res.data);
				  console.log('收到服务器内容', aaa.msgList)
				  aaa.msgList.push({
						// 标记为非人工智能机器人，即：为用户发送的消息
						isAi: false,
						// 消息内容
						content: 'hahahha',
						// 消息创建时间
						create_time: Date.now()
					});
				  // console.log('on message', message);
				  // 将从云端接收到的消息添加到消息列表中
				  
				  // 如果之前未添加过就添加，否则就执行更新最后一条消息
				  if (self.sseIndex === 0) {
				  	this.msgList.push({
				  		isAi: true,
				  		content: message,
				  		create_time: Date.now()
				  	})
				  } else {
				  	this.sliceMsgToLastMsg.addMsg(message)
				  	// this.updateLastMsg(lastMsg => {
				  	// 	lastMsg.content += message
				  	// })
				  }
				  this.showLastMsg()
				  // 让流式响应计数值递增
				  this.sseIndex++
				});
				
				uni.onSocketClose(function (res) {
				  console.log('WebSocket 已关闭！');
				  console.log('WebSocket connection closed');
				  console.log('sse 结束',e)
				  // 更改“按字分割追加到最后一条消息“的时间间隔为0，即：一次性加载完（不再分割加载）
				  this.sliceMsgToLastMsg.t = 0
				  if(e && typeof e == 'object' && e.errCode){
				  	let setLastAiMsgContent = (content)=>{
				  		// console.log(content);
				  		// 如果最后一项不是ai的就添加，否则就执行更新最后一条消息
				  		if (this.sseIndex === 0) {
				  			this.msgList.push({
				  				isAi: true,
				  				content,
				  				create_time: Date.now()
				  			})
				  		} else {
				  			this.updateLastMsg(lastMsg => {
				  				lastMsg.content += content
				  			})
				  		}
				  		this.showLastMsg()
				  	}
				  	if(e.errCode == 60004){
				  		//服务商检测到AI输出了敏感内容
				  		let length = this.msgList.length
				  		//如果最后一项不是ai，就创建一项
				  		if(length % 2){
				  			this.msgList.push({
				  				isAi: true,
				  				content:"内容涉及敏感",
				  				illegal:true,
				  				create_time: Date.now()
				  			})
				  			length += 1
				  		}
				  		// 更新倒数第2项 用户提的问题
				  		this.msgList[length - 2].illegal = true
				  		// 更新倒数第1项 ai 回答的内容
				  		this.msgList[length - 1].illegal = true
				  		this.msgList[length - 1].content = "内容涉及敏感"
				  		
				  	}else{
				  		setLastAiMsgContent(e.errMsg)
				  	}
				  }
				});
			},
			
			setLLMmodel() {
				this.$refs['llm-config'].open(model => {
					console.log('model', model);
					this.llmModel = model
				})
			},
			
			// 更新最后一条消息
			updateLastMsg(param) {
				let length = this.msgList.length
				if (length === 0) {
					return
				}
				let lastMsg = this.msgList[length - 1]
			
				// 如果param是函数，则将最后一条消息作为参数传入该函数
				if (typeof param == 'function') {
					let callback = param;
					callback(lastMsg)
				} else {
					// 否则，将参数解构为data和cover两个变量
					const [data, cover = false] = arguments
					if (cover) {
						lastMsg = data
					} else {
						lastMsg = Object.assign(lastMsg, data)
					}
				}
				this.msgList.splice(length - 1, 1, lastMsg)
			},
			// 广告关闭事件
			onAdClose(e) {
				console.log('onAdClose e.detail.isEnded', e.detail.isEnded);
				if (e.detail.isEnded) {
					//5次轮训查结果
					let i = 0;
					uni.showLoading({
						mask: true
					})
					let myIntive = setInterval(async e => {
						i++;
						// 获取云数据库实例
						const db = uniCloud.database();
						// 获取uni-id-users集合
						let res = await db.collection("uni-id-users")
							// 查询条件为_id等于当前用户id
							.where('"_id" == $cloudEnv_uid')
							// 只返回score字段
							.field('score')
							// 执行查询
							.get()
						// 解构出score字段的值，如果没有则默认为undefined
						let {
							score
						} = res.result.data[0] || {}
						console.log('score',score);
						if (score > 0 || i > 5) {
							// 清除轮询定时器
							clearInterval(myIntive)
							// 隐藏加载提示
							uni.hideLoading()
							if (score > 0) {
								this.insufficientScore = false
								// 移除最后一条消息
								this.msgList.pop()
								this.$nextTick(() => {
									// 重发消息
									this.send()
									uni.showToast({
										title: '积分余额:' + score,
										icon: 'none'
									});
								})
							}
						}
					}, 2000);
				}
			},
			// 换一个答案
			async changeAnswer() {
				// 如果问题还在回答中需要先关闭
				if (this.sseIndex) {
					this.closeSseChannel()
				}
				//删除旧的回答
				this.msgList.pop()
				this.updateLastMsg({
					// 防止 偶发答案涉及敏感，重复回答时。提问内容 被卡掉无法重新问
					illegal: false
				})
				// 多设备登录时其他设备看广告后点击重新回答，insufficientScore应当设置为 false
				this.insufficientScore = false
				this.send()
			},
			removeMsg(index) {
				// 成对删除，如果点中的是 ai 回答的内容，index -= 1
				if (this.msgList[index].isAi) {
					index -= 1
				}
				
				// 如果删除的就是正在问的，且问题还在回答中需要先关闭
				if (this.sseIndex && index == this.msgList.length - 2) {
					this.closeSseChannel()
				}
				
				this.msgList.splice(index,2)
			},
			async beforeSend() {
				if (this.inputBoxDisabled) {
					return uni.showToast({
						title: 'ai正在回复中不能发送',
						icon: 'none'
					});
				}
				// 如果开启了广告位需要登录
				if (this.adpid) {
					// 获取本地缓存的token
					let token = uni.getStorageSync('uni_id_token')
					// 如果token不存在
					if (!token) {
						// 弹出提示框
						return uni.showModal({
							// 提示内容
							content: '启用激励视频，客户端需登录并启用安全网络',
							// 不显示取消按钮
							showCancel: false,
							// 确认按钮文本
							confirmText: "查看详情",
							// 弹框关闭后执行的回调函数
							complete() {
								// 文档链接
								let url = "https://uniapp.dcloud.net.cn/uniCloud/uni-ai-chat.html#ad"
								// #ifndef H5
								// 将文档链接复制到剪贴板
								uni.setClipboardData({
									// 复制的内容
									data: url,
									// 不显示提示框
									showToast: false,
									// 复制成功后的回调函数
									success() {
										// 弹出提示框
										uni.showToast({
											// 提示内容
											title: '已复制文档链接，请到浏览器粘贴浏览',
											// 不显示图标
											icon: 'none',
											// 提示框持续时间
											duration: 5000
										});
									}
								})
								// #endif

								// #ifdef H5
								// 在新窗口打开文档链接
								window.open(url)
								// #endif
							}
						});
					}
				}

				// 如果内容为空
				if (!this.content) {
					// 弹出提示框
					return uni.showToast({
						// 提示内容
						title: '内容不能为空',
						// 不显示图标
						icon: 'none'
					});
				}

				// 将用户输入的消息添加到消息列表中
				this.msgList.push({
					// 标记为非人工智能机器人，即：为用户发送的消息
					isAi: false,
					// 消息内容
					content: this.content,
					// 消息创建时间
					create_time: Date.now()
				})

				// 展示最后一条消息
				this.showLastMsg()
				// dom加载完成后 清空文本内容
				this.$nextTick(() => {
					this.content = ''
				})
				this.send() // 发送消息
			},
			async send() {				
				// 请求状态归零
				this.requestState = 0
				// 清除旧的afterChatCompletion（如果存在）
				if(this.afterChatCompletion && this.afterChatCompletion.clear) this.afterChatCompletion.clear()
				
				let messages = []
				// 复制一份，消息列表数据
				let msgs = JSON.parse(JSON.stringify(this.msgList))
				
				// - 获取上下文的代码【start】-
				// 带总结的消息 index
				let findIndex = [...msgs].reverse().findIndex(item => item.summarize)
				// console.log('findIndex', findIndex)
				if (findIndex != -1) {
					let aiSummaryIndex = msgs.length - findIndex - 1
					// console.log('aiSummaryIndex', aiSummaryIndex)
					// 将带总结的消息的 内容 更换成 总结
					msgs[aiSummaryIndex].content = msgs[aiSummaryIndex].summarize
					// 拿最后一条带直接的消息作为与ai对话的msg body
					msgs = msgs.splice(aiSummaryIndex)
				} else {
					// 如果未总结过就直接从末尾拿10条
					msgs = msgs.splice(-10)
				}
				// 过滤涉敏问题
				msgs = msgs.filter(msg => !msg.illegal)
				// - 获取上下文的代码【end】-
				
				// 如果：不希望带上上下文；请注释掉 上方：获取上下文的代码【start】-【end】。并添加，代码： msgs = [msgs.pop()]
				// 根据数据内容设置角色
				messages = msgs.map(item => {
					// 角色默认为用户
					let role = "user"
					// 如果是ai再根据 是否有总结 来设置角色为 system 还是 assistant
					if (item.isAi) {
						role = item.summarize ? 'system' : 'assistant'
					}
					return {
						content: item.content,
						role
					}
				})

				// 在控制台输出 向ai机器人发送的完整消息内容
				console.log('send to ai messages:', messages);

				// 流式响应和云对象的请求结束回调函数
				let sseEnd,requestEnd;
				// 判断是否开启了流式响应模式
				if (this.enableStream) {
					// 将多个字的文本，分割成单个字 分批插入到最末尾的消息中
					this.sliceMsgToLastMsg = new SliceMsgToLastMsg(this)
					this.sendSocketMessage(messages)
					// 等待对话完成（云函数请求完成，sse 执行了 end）之后
					(function fnSelf(that){
						fnSelf.clear = ()=>{
							// console.log('do fnSelf.clear');
							if(fnSelf.clear.sse){
								// console.log('fnSelf.clear.sse();')
								fnSelf.clear.sse();
							}
							if(fnSelf.clear.request){
								// console.log('fnSelf.clear.request();')
								fnSelf.clear.request();
							}
						}
						Promise.all([
							new Promise((resolve,reject)=>{
								sseEnd = resolve;
								fnSelf.clear.sse = reject;
							}),
							new Promise((resolve,reject)=>{
								requestEnd = resolve;
								fnSelf.clear.request = reject;
							})
						]).then((e)=>{
							// console.log('sseEnd && requestEnd');
							//当两个都结束时
							sseChannel.close()
							// 结束流式响应 将流式响应计数值 设置为 0
							that.sseIndex = 0
						}).catch((err)=>{
							// console.log('afterChatCompletion is close',err);
						})
						that.afterChatCompletion = fnSelf
					})(this)
				}
				
				// 导入uni-ai-chat模块，并设置customUI为true
				let task = uniCoTask({
					coName: "uni-ai-chat",
					funName: "send",
					param: [{
						messages, // 消息列表
						sseChannel, // 消息通道
						llmModel: this.llmModel
					}],
					config: {
						customUI: true
					},
					success: res => {
						// 更新 通讯状态为100（发送成功）
						this.requestState = 100
						// console.log("success",res);
						if (!res.data) return
						
						let {
							reply,
							summarize,
							insufficientScore,
							illegal
						} = res.data
						
						// 特殊处理 - start
						if(this.enableStream == false && !reply){
							//服务商检测到AI输出了敏感内容
							illegal = true
							reply = "内容涉及敏感"
						}
						// 特殊处理 - end
            
            // 非流式模式 && 内容涉及敏感
            if (this.enableStream == false && illegal) {
            	console.error('内容涉及敏感');
            	this.updateLastMsg({
            		// 添加消息涉敏标记
            		illegal: true
            	})
            }

						if(insufficientScore){
							// 积分不足
							this.insufficientScore = true
						}
						// 如果回调包含总结的内容，就设置总结
						if(summarize){
							console.log(' 拿到总结',summarize);
							// 总结的内容是上一轮对话的
							// console.log('setSummarize');
							let index = this.msgList.length - 1;
							// 如果最后一项是ai就往前退2项，否则退1项（流式响应的时候，回答可能晚于总结）
							if(index%2){
								index -= 2
							}else{
								index -= 1
							}
							// 假如第一次提问就需要总结
							if (index < 1) {
								index = 1
							}
							let msg = this.msgList[index]
							msg.summarize = summarize
							this.msgList.splice(index, 1, msg)
							// console.log('setSummarize this.msgList',this.msgList,this.msgList.length-1,index);
						}
						
					},
					complete:e=>{
						if (this.enableStream) {
							requestEnd()
						}
						// console.log('complete:',e);
						// 滚动窗口以显示最新的一条消息
						this.$nextTick(() => {
							this.showLastMsg()
						})
					},
					fail: e => {
						console.error(e);
						// 更新 通讯状态为-100（发送失败）
						this.requestState = -100
						// 弹框提示用户错误原因
						uni.showModal({
							content: JSON.stringify(e.message),
							showCancel: false
						});
						// 如果启用流式，云函数出错了，sse 也应当被终止
						if (this.enableStream) {
							sseEnd()
						}
					}
				})
			},
			closeSseChannel() {
				// 如果存在消息通道，就关闭消息通道
				if (sseChannel) {
					sseChannel.close()
					// 设置为 false 防止重复调用closeSseChannel时出错
					sseChannel = false
					this.sliceMsgToLastMsg.end()
				}
				// 将流式响应计数值归零
				this.sseIndex = 0
			},
			// 滚动窗口以显示最新的一条消息
			showLastMsg() {
				// 等待DOM更新
				this.$nextTick(() => {
					// 将scrollIntoView属性设置为"last-msg-item"，以便滚动窗口到最后一条消息
					this.scrollIntoView = "last-msg-item"
					// 等待DOM更新，即：滚动完成
					this.$nextTick(() => {
						// 将scrollIntoView属性设置为空，以便下次设置滚动条位置可被监听
						this.scrollIntoView = ""
					})
				})
			},
			// 清空消息列表
			clearAllMsg(e) {
				// 弹出确认清空聊天记录的提示框
				uni.showModal({
					title: "确认要清空聊天记录？",
					content: '本操作不可撤销',
					complete: (e) => {
						// 如果用户确认清空聊天记录
						if (e.confirm) {
							// 关闭ssh请求
							this.closeSseChannel()
							// 将消息列表清空 
							this.msgList.splice(0, this.msgList.length);
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	/* #ifdef VUE3 && APP-PLUS */
	@import "@/components/uni-ai-msg/uni-ai-msg.scss";
	/* #endif */

	/* #ifndef APP-NVUE */
	page,
	/* #ifdef H5 */
	.container *,
	/* #endif */
	view,
	textarea,
	button {
		display: flex;
		box-sizing: border-box;
	}

	page {
		height: 100%;
		width: 100%;
	}

	/* #endif */

	.stop-responding {
		font-size: 14px;
		border-radius: 3px;
		margin-bottom: 15px;
		background-color: #f0b00a;
		color: #FFF;
		width: 90px;
		height: 30px;
		line-height: 30px;
		margin: 0 auto;
		justify-content: center;
		margin-bottom: 15px;
		/* #ifdef H5 */
		cursor: pointer;
		/* #endif */
	}

	.stop-responding:hover {
		box-shadow: 0 0 10px #aaa;
	}

	.container {
		height: 100%;
		background-color: #FAFAFA;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		// border: 1px solid blue;
	}

	.foot-box {
		width: 750rpx;
		display: flex;
		flex-direction: column;
		padding: 10px 0px;
		background-color: #FFF;
	}

	.foot-box-content {
		justify-content: space-around;
	}

	.textarea-box {
		padding: 8px 10px;
		background-color: #f9f9f9;
		border-radius: 5px;
	}

	.textarea-box .textarea {
		max-height: 120px;
		font-size: 14px;
		/* #ifndef APP-NVUE */
		overflow: auto;
		/* #endif */
		width: 450rpx;
		font-size: 14px;
	}

	/* #ifdef H5 */
	/*隐藏滚动条*/
	.textarea-box .textarea::-webkit-scrollbar {
		width: 0;
	}

	/* #endif */

	.input-placeholder {
		color: #bbb;
		line-height: 18px;
	}

	.trash,
	.send {
		width: 50px;
		height: 30px;
		justify-content: center;
		align-items: center;
		flex-shrink: 0;
	}

	.trash {
		width: 30rpx;
		margin-left: 10rpx;
	}

	.menu {
		justify-content: center;
		align-items: center;
		flex-shrink: 0;
	}

	.menu-item {
		width: 30rpx;
		margin: 0 10rpx;
	}

	.send {
		color: #FFF;
		border-radius: 4px;
		display: flex;
		margin: 0;
		padding: 0;
		font-size: 14px;
		margin-right: 20rpx;
	}

	/* #ifndef APP-NVUE */
	.send::after {
		display: none;
	}

	/* #endif */


	.msg-list {
		height: 0; //不可省略，先设置为0 再由flex: 1;撑开才是一个滚动容器
		flex: 1;
		width: 750rpx;
		// border: 1px solid red;
	}

	.noData {
		margin-top: 15px;
		text-align: center;
		width: 750rpx;
		color: #aaa;
		font-size: 12px;
		justify-content: center;
	}
	
	.open-ad-btn-box{
		justify-content: center;
		margin: 10px 0;
	}

	.tip-ai-ing {
		align-items: center;
		flex-direction: column;
		font-size: 14px;
		color: #919396;
		padding: 15px 0;
	}

	.uni-link {
		margin-left: 5px;
		line-height: 20px;
	}

	/* #ifdef H5 */
	@media screen and (min-width:650px) {
		.foot-box {
			border-top: solid 1px #dde0e2;
		}

		.container,.container * {
			max-width: 950px;
		}

		.container {
			box-shadow: 0 0 5px #e0e1e7;
			height: calc(100vh - 44px);
			margin: 22px auto;
			border-radius: 10px;
			overflow: hidden;
			background-color: #FAFAFA;
		}
		
		page {
			background-color: #efefef;
		}

		.container .header {
			height: 44px;
			line-height: 44px;
			border-bottom: 1px solid #F0F0F0;
			width: 100vw;
			justify-content: center;
			font-weight: 500;
		}

		.content {
			background-color: #f9f9f9;
			position: relative;
			max-width: 90%;
		}

		// .copy {
		// 	color: #888888;
		// 	position: absolute;
		// 	right: 8px;
		// 	top: 8px;
		// 	font-size: 12px;
		// 	cursor:pointer;
		// }
		// .copy :hover{
		// 	color: #4b9e5f;
		// }

		.foot-box,
		.foot-box-content,
		.msg-list,
		.msg-item,
		// .create_time,
		.noData,
		.textarea-box,
		.textarea,
		textarea-box {
			width: 100% !important;
		}

		.textarea-box,
		.textarea,
		textarea,
		textarea-box {
			height: 120px;
		}

		.foot-box,
		.textarea-box {
			background-color: #FFF;
		}

		.foot-box-content {
			flex-direction: column;
			justify-content: center;
			align-items: flex-end;
			padding-bottom: 0;
		}

		.pc-menu {
			padding: 0 10px;
		}

		.pc-menu-item {
			height: 20px;
			justify-content: center;
			align-items: center;
			align-content: center;
			display: flex;
			margin-right: 10px;
			cursor: pointer;
		}

		.pc-trash {
			opacity: 0.8;
		}

		.pc-trash image {
			height: 15px;
		}


		.textarea-box,
		.textarea-box * {
			// border: 1px solid #000;
		}

		.send-btn-box .send-btn-tip {
			color: #919396;
			margin-right: 8px;
			font-size: 12px;
			line-height: 28px;
		}
	}
	/* #endif */
	.retries-box{
		justify-content: center;
		align-items: center;
		font-size: 12px;
		color: #d2071b;
	}
	.retries-icon{
		margin-top: 1px;
		margin-left: 5px;
	}
</style>
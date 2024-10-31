// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
// 引入utils模块中的safeRequire和checkContentSecurityEnable函数
const {
	safeRequire,
	checkContentSecurityEnable
} = require('./utils')
// 引入uni-config-center模块，并创建config对象
const createConfig = safeRequire('uni-config-center')
const config = createConfig({
	pluginId: 'uni-ai-chat'
}).config()
// 引入uniCloud.database()方法，并创建db对象
const db = uniCloud.database();
// 创建userscollection对象
const userscollection = db.collection('uni-id-users')
// 引入uni-id-common模块
const uniIdCommon = require('uni-id-common')


module.exports = {
	_before: async function() {
		// 这里是云函数的前置方法，你可以在这里加入你需要逻辑

		// 判断否调用量本云对象的send方法
		if (this.getMethodName() == 'send') {
			// 从配置中心获取是否需要销毁积分
			if (config.spentScore) {

				/*先校验token（用户身份令牌）是否有效，并获得用户的_id*/
				// 获取客户端信息
				this.clientInfo = this.getClientInfo()
				// console.log(this.clientInfo);

				// 定义uni-id公共模块对象
				this.uniIdCommon = uniIdCommon.createInstance({
					clientInfo: this.clientInfo
				})
				// 校验token（用户身份令牌）是否有效，并获得用户的_id
				let res = await this.uniIdCommon.checkToken(this.clientInfo.uniIdToken)
				if (res.errCode) {
					// 如果token校验出错，则抛出错误
					throw res
				} else {
					// 通过token校验则，拿去用户id
					this.current_uid = res.uid
				}
				/* 判断剩余多少积分：拒绝对话、扣除配置的积分数 */
				let {
					data: [{
						score
					}]
				} = await userscollection.doc(this.current_uid).field({
					'score': 1
				}).get()
				// 如果积分余额小于与uni-ai对话一次所需消耗的积分数 即 积分不足 则抛出错误提醒客户端
				if (score < config.spentScore) {
					throw "insufficientScore"
				}
				// 扣除对应的积分值
				await userscollection.doc(this.current_uid)
					.update({
						score: db.command.inc(-1 * config.spentScore)
					})
			}

			// 从配置中心获取内容安全配置
			// console.log('config.contentSecurity',config.contentSecurity);
			if (config.contentSecurity) {
				const uniIdconfig = createConfig({
					pluginId: 'uni-id'
				}).config()
				// console.log('uniIdconfig',uniIdconfig);
				
				try{
					let {appid,appsecret} = uniIdconfig["mp-weixin"].oauth.weixin
					if(!appid || !appsecret){
						throw '启用内容安全，但未配置微信小程序的appid、appsecret，详情参考：https://uniapp.dcloud.net.cn/uniCloud/uni-sec-check.html#config'
					}
				}catch(e){
					throw "启用内容安全，但未配置微信小程序的appid、appsecret，详情参考：https://uniapp.dcloud.net.cn/uniCloud/uni-sec-check.html#config"
				}
				
				// 获取sseChannel
				let {
					sseChannel
				} = this.getParams()[0] || {}
				// 如果存在sseChannel，则抛出错误
				if (sseChannel) {
					throw {
						errSubject: 'uni-ai-chat',
						errCode: "sec-check",
						errMsg: "流式响应模式，内容安全识别功能无效"
					}
				}
				
				// 引入uni-sec-check模块
				const UniSecCheck = safeRequire('uni-sec-check')
				// 创建uniSecCheck对象
				const uniSecCheck = new UniSecCheck({
					provider: 'mp-weixin',
					requestId: this.getUniCloudRequestId()
				})
				// 定义文本安全检测函数
				this.textSecCheck = async (content) => {
					// 检测文本
					const checkRes = await uniSecCheck.textSecCheck({
						// 文本内容，不可超过500KB
						content,
						// 微信小程序端 开放的唯一用户标识符
						// openid,
						// 场景值（1 资料；2 评论；3 论坛；4 社交日志）
						scene: 4,
						// 接口版本号，可选1或2，但1的检测能力很弱  支持微信登录的项目，微信小程序端 可改用模式2 详情：https://uniapp.dcloud.net.cn/uniCloud/uni-sec-check.html#%E4%BD%BF%E7%94%A8%E5%89%8D%E5%BF%85%E7%9C%8B
						version: 1
					})
					// console.log('checkRes检测文本', checkRes);
					// 如果检测到风险内容，则抛出错误
					if (checkRes.errCode === uniSecCheck.ErrorCode.RISK_CONTENT) {
						console.error({
							errCode: checkRes.errCode,
							errMsg: '文字存在风险',
							result: checkRes.result
						});
						throw "uni-sec-check:illegalData"
						// 如果检测出错，则抛出错误
					} else if (checkRes.errCode) {
						console.log(
							`其他原因导致此文件未完成自动审核（错误码：${checkRes.errCode}，错误信息：${checkRes.errMsg}），需要人工审核`
							);
						console.error({
							errCode: checkRes.errCode,
							errMsg: checkRes.errMsg,
							result: checkRes.result
						});
						throw "uni-sec-check:illegalData"
					}
				}

				// 获取messages参数
				let {
					messages
				} = this.getParams()[0] || {
					"messages": []
				}
				// 将messages中的content拼接成字符串
				let contentString = messages.map(i => i.content).join(' ')
				console.log('contentString', contentString);
				// 对contentString进行文本安全检测
				await this.textSecCheck(contentString)
			}
		}
	},
	async _after(error, result) {
		// 打印错误和结果
		// console.log('_after',{error,result}); 
		// 如果有错误
		if (error) {
			// 如果是内容安全检测错误
			if (error.errCode == 60004 || error == "uni-sec-check:illegalData") {
				// 返回一个包含敏感内容提示和标记的响应体
				return {
					"data": {
						"reply": "内容涉及敏感",
						"illegal": true
					},
					"errCode": 0
				}
			}
			// 其他符合响应体规范的错误，直接返回
			else if (error.errCode && error.errMsg) {
				return error
			}
			// 如果是积分不足错误
			else if (error == 'insufficientScore') {
				// 设置回复内容
				return {
					"data": {
						"reply":"积分不足，请看完激励视频广告后再试",
						"insufficientScore": true
					},
					"errCode": 0
				}
			} else {
				// 如果是其他错误
				throw error // 直接抛出异常
			}
		}

		// 如果是send方法且开启了内容安全检测
		if (this.getMethodName() == 'send' && config.contentSecurity) {
			try {
				// 对回复内容进行文本安全检测
				await this.textSecCheck(result.data.reply)
			} catch (e) {
				// 如果检测到敏感内容 返回一个包含敏感内容提示和标记的响应体
				return {
					"data": {
						"reply": "内容涉及敏感",
						"illegal": true
					},
					"errCode": 0
				}
			}
		}
		// 返回处理后的结果
		return result
	},
	// 发送消息
	async send({
		// 消息内容
		messages,
		// sse渠道对象
		sseChannel,
		// 语言模型
		llmModel
	}) {
		// 初次调试时，可不从客户端获取数据，直接使用下面写死在云函数里的数据
		// messages =  [{
		// 	role: 'user',
		// 	content: 'uni-app是什么，20个字以内进行说明'
		// }]

		// 校验客户端提交的消息参数是否符合规范
		let res = checkMessages(messages)
		if (res.errCode) {
			throw new Error(res.errMsg)
		}

		// 向uni-ai发送消息
		let promiseTaskList = []
		let promiseTask = new Promise((resolve, reject) => {
			chatCompletion(messages)
			.then((res) => {
				console.log(' 获取到问题的回答，res.reply：',res.reply); //非sse 时才有值，sse 时消息直接发往客户端了
				resolve({
					type:"reply",
					data:res.reply
				});
			})
			.catch((error) => {
				reject(error)
			})
		});
		promiseTaskList.push(promiseTask)

		// 拿到最后一次对话的消息内容（去掉最后一次，还没得到答案的提问）
		let lastTimeMessages = messages.slice(0, -1)
		// 判断是否需要总结 (根据消息总长度是否大于800)
		if (lastTimeMessages.map(i => i.content).join('').length > 800) {
			// 获取总结
			lastTimeMessages.push({
				"content": "请简要总结上述全部对话",
				"role": "user"
			})
			let promiseTask = new Promise((resolve, reject) => {
				chatCompletion(lastTimeMessages,false).then((res) => {
					console.log('获取到总结，res：',res);
					resolve({
						type:"summarize",
						data:res.reply
					});
				})
				.catch((error) => {
					reject(error)
				})
			});
			promiseTaskList.push(promiseTask)
		}
		

		let promiseAllRes = await Promise.all(promiseTaskList)
		// console.log('Promise.all promiseRes',promiseAllRes);
		res = {
			data:{},
			errCode:0
		}
		promiseAllRes.forEach(item=>{
			switch (item.type){
				case 'summarize':
					res.data.summarize = item.data
					break;
				case 'reply':
					res.data.reply = item.data
					break;
				default:
					break;
			}
		})
		return res


		// chatCompletion函数：对话完成
		/**
		 * 校验消息内容是否符合规范
		 * @param {Array} messages - 消息列表
		 * @param {Boolean} stream - 是否启用流式响应
		 * @returns {Promise} - 返回结果
		 */
		function chatCompletion(messages,stream = true) {
			// 从uni-config-center config获取 调用chatCompletion函数，传入messages、sseChannel、llm参数
			let {
				llm,
				chatCompletionOptions
			} = config
			// 如果客户端传了llmModel 就覆盖配置的model
			if (llmModel) {
				if (llmModel.includes('gpt-') && (llm && !["azure","openai"].includes(llm.provider))) {
					throw new Error('错误：LLM的provider不是openai或azure，但model却选了' + llmModel + '；请参考文档：https://uniapp.dcloud.net.cn/uniCloud/uni-ai.html#chat-completion 中model参数的说明')
				}
				chatCompletionOptions.model = llmModel
			}
			
			// console.log({llm,chatCompletionOptions});
			// 获取语言模型管理器
			const llmManager = uniCloud.ai.getLLMManager(llm)
			// 调用chatCompletion方法，传入参数
			// console.log('______messages',messages);
			return llmManager.chatCompletion({
				...chatCompletionOptions,
				messages,
				stream:stream && sseChannel !== false,
				sseChannel,
				streamEventForSSE:"optimizedMessage"
			})
		}

		/**
		 * 校验消息内容是否符合规范
		 * @param {Array} messages - 消息列表
		 * @returns {Object} - 返回校验结果
		 */
		function checkMessages(messages) {
			try {
				// 如果messages未定义
				if (messages === undefined) {
					// 抛出异常
					throw "messages为必传参数"
					// 如果messages不是数组
				} else if (!Array.isArray(messages)) {
					// 抛出异常
					throw "参数messages的值类型必须是[object,object...]"
				} else {
					// 否则 遍历messages
					messages.forEach(item => {
						// 如果item不是对象
						if (typeof item != 'object') {
							// 抛出异常
							throw "参数messages的值类型必须是[object,object...]"
						}
						// 定义itemRoleArr数组
						let itemRoleArr = ["assistant", "user", "system"]
						// 如果item的role属性不在itemRoleArr数组中
						if (!itemRoleArr.includes(item.role)) {
							// 抛出异常
							throw "参数messages[{role}]的值只能是：" + itemRoleArr.join('或')
						}
						// 如果item的content属性不是字符串
						if (typeof item.content != 'string') {
							// 抛出异常
							throw "参数messages[{content}]的值类型必须是字符串"
						}
					})
				}
				// 返回校验结果
				return {
					errCode: 0,
				}
				// 捕获异常
			} catch (errMsg) {
				// 返回异常信息
				return {
					errSubject: 'ai-demo',
					errCode: 'param-error',
					errMsg
				}
			}
		}
	}
}
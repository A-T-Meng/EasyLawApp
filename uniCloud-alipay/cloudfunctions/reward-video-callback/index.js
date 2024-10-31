'use strict';
const uniADConfig = require('uni-config-center')({
	pluginId: 'uni-ad'
}).config()
// 如果 uni-ad 配置项不存在，则抛出错误引导用户配置参数
if (!uniADConfig){
	throw new Error('请先完成uni-ad配置')
}

// 自定义业务逻辑方法（在通过签名验证后被执行）
async function nextFn(data) {
	console.log('广告回调成功:',JSON.stringify(data));
	try{
		data.extra = JSON.parse(data.extra)
	}catch(e){
		console.log('extra不是JSON')
	}
	
	if(typeof data.extra == 'object' && data.extra.unique_type == "uni-ai-chat"){
		await uniAiChatEarnedScoreByAd(data)
	}
	
	// uni-ai-chat 看广告奖励积分
	async function uniAiChatEarnedScoreByAd(data){
		const uniAiChatConfig = require('uni-config-center')({
			pluginId: 'uni-ai-chat'
		}).config()
		console.log('uniAiChatConfig',uniAiChatConfig);
		if(!uniAiChatConfig || !uniAiChatConfig.earnedScore || !uniAiChatConfig.earnedScore.ad){
			throw new Error('请先完成uni-ai-chat的广告奖励配置')
		}
		
		if(!data.extra.user_id){
			return console.error('userId 不能为空');
		}
		let score = db.command.inc(uniAiChatConfig.earnedScore.ad)
		let res = await db.collection('uni-id-users').doc(data.extra.user_id).update({score})
		console.log('update res',res)
	}
	
	//如果不返回，广点通会2次调用本云函数
	return {
		"isValid": true
	}
}

const crypto = require('crypto');
const db = uniCloud.database();
exports.main = async (event, context) => {
	// event = {
	// 	"adpid": "1053355918",
	// 	"platform": "weixin-mp",
	// 	"provider": "sh",
	// 	"trans_id": "6a51e0edb22aa854c394acb104cad761",
	// 	"sign": "7c4a0f7952be42b7578179a10f191b408f3afb49f230ce7558ae483fa761a799",
	// 	"user_id": "6448f5e70c801ca8782c7a6e",
	// 	"extra": "{\"user_id\":\"6448f5e70c801ca8782c7a6e\",\"unique_id\":\"6448f5e70c801ca8782c7a6e1682587255500\",\"unique_type\":\"uni-ai-chat\"}"
	// }
	console.log('event : ', event);
	const trans_id = event.trans_id;
	//去uni-config-center通过adpid获取secret
	const secret = uniADConfig[event.adpid]
	if (!secret){
		throw new Error(`未配置，广告位adpid:${adpid}的secret。在uni-AD Web控制台，找到广告位，点击配置激励视频，展开当前广告位项，可看到生成的 Security key`)
	}
	// 验签请求来源
	const sign2 = crypto.createHash('sha256').update(`${secret}:${trans_id}`).digest('hex');
	if (event.sign !== sign2) {
		console.log('验签失败');
		return null;
	}
	
	try{
		// 存储广告回调日志
		const data2 = Object.assign(event, {
			ad_type: 0,
			create_date: new Date()
		})
		await db.collection('ad-callback-log').add(data2);
	}catch(err){
		// 如果选择了腾讯云，需要手动预创建表
		console.error(err);
		throw new Error('广告回调日志存储失败，请确认:是否已创建ad-callback-log表。')
	}
	
	// 已完成验签，可以执行自定义业务逻辑
	return await nextFn(event)
};
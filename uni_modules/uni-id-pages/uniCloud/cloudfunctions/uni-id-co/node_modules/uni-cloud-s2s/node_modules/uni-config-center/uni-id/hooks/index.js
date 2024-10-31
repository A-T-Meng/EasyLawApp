// 你的应用的 appid，比如：__UNI_123123
const appId = "";
// 用户注册后默认积分
const defaultScore = 0;


// 钩子函数示例 hooks/index.js
function beforeRegister({
	userRecord,
	clientInfo
} = {}) {
	if (clientInfo.appId === appId) {
		userRecord.score = defaultScore
	}
	return userRecord // 务必返回处理后的userRecord
}

module.exports = {
	beforeRegister
}
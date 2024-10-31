<template>
	<view>
		<ad-rewarded-video ref="rewardedVideo" :adpid="adpid" :preload="false" :disabled="true" :loadnext="true"
			:url-callback="urlCallback" @load="onAdLoad" @close="onAdClose" @error="onAdError"
			v-slot:default="{ loading, error }">
			<text v-if="error" class="text">广告加载失败</text>
		</ad-rewarded-video>
		<button class="text" @click="callAd" >去看广告</button>
	</view>
</template>

<script>
	export default {
		name: "uni-ad-rewarded-video",
		data() {
			return {}
		},
		props: {
			// 广告位唯一标识
			adpid: {
				type: String,
				default(){
					return ''
				}
			},
		},
		computed: {
			// 回调URL
			urlCallback() {
				// 拿到当前用户的id值
				let uid = uniCloud.getCurrentUserInfo().uid
				return {
					userId: uid,
					extra: JSON.stringify({
						user_id: uid,
						unique_id: uid + Date.now(),
						unique_type: "uni-ai-chat"
					})
				}
			},
		},
		async mounted() {
		},
		methods: {
			callAd() {
				// #ifdef H5
				// 如果在浏览器中，则提示需在App或小程序中操作
				return uni.showModal({
					content: '浏览器不支持广告播放, 请在App或小程序中操作',
					showCancel: false,
					confirmText:"知道了"
				})
				// #endif

				// 如果用户状态无效，则提示需要登录
				if (uniCloud.getCurrentUserInfo().tokenExpired < Date.now()) {
					uni.showModal({
						content: '请登录后操作',
						success: ({
							confirm
						}) => {
							if(confirm){
								// 登录跳转URL 请根据实际情况修改
								// 获取当前页面信息
								let pages = getCurrentPages()
								let currentPage = pages[pages.length - 1]
								let url = '/uni_modules/uni-id-pages/pages/login/login-withoutpwd' + 
									(currentPage.route ? ('?uniIdRedirectUrl=' + currentPage.route) : '')
								uni.navigateTo({
									url,
									complete(e) {
										console.log(e);
									}
								});
							}
						}
					})
					return
				}

				// 显示广告
				this.$refs.rewardedVideo.show()
			},
			onAdLoad(e) {
				console.log('onAdLoad', e)
			},
			onAdClose(e) {
				console.log('onAdClose', e)
				this.$emit('onAdClose',e) // 触发onAdClose事件
			},
			onAdError(e) {
				console.log('onAdError', e)
			},
		}
	}
</script>

<style lang="scss">

</style>
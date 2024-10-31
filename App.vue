<script>
	import uniIdPagesInit from '@/uni_modules/uni-id-pages/init.js';
	import config from '@/config.js';
	export default {
		 onLaunch:async function() {
			// 初始化uni身份信息管理模块
			uniIdPagesInit();
			console.log('App Launch')
			if(typeof(uniCloud.SSEChannel) == 'undefined' ){
				uni.showModal({
					content: '本项目，仅支持HBuilderX 正式版 v3.7.10 或 alpha v3.8.0及以上版本请升级',
					showCancel: false
				});
			}
			// #ifdef MP-WEIXIN
			if(config.adpid){
				uniCloud.initSecureNetworkByWeixin()
			}
			// #endif
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	/* #ifdef H5 */
	@media screen and (min-width:650px){
		/* pc宽屏 隐藏会话页面头部 && 全局底部导航 以下兼容了Vue2和3两种模式的样式*/
			uni-page[data-page="pages/chat/chat"] uni-page-head,
			{
				display: none !important;
				background-color: red !important;
			}
	}
	/* #endif */
</style>

<template>
	<view class="warp">
		<uni-search-bar @confirm="search" :focus="true" v-model="searchValue" @blur="blur" @focus="focus" @input="input"
			@cancel="cancel" @clear="clear">
		</uni-search-bar>
		<uni-section class="mb-10" title="合同审查" sub-title="合同一键审查 修改 导出" padding="0 0 5px 10px">
			<uni-grid :column="4" :highlight="true" @change="change" :showBorder="false"  :square="false">
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/fangwuzulin.png" class="image"></image>
						<text class="text">房屋租赁</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/laodong.png" class="image"></image>
						<text class="text">劳动合同</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/fangwuzulin.png" class="image"></image>
						<text class="text">房屋租赁</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/laodong.png" class="image"></image>
						<text class="text">劳动合同</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/fangwuzulin.png" class="image"></image>
						<text class="text">房屋租赁</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/laodong.png" class="image"></image>
						<text class="text">劳动合同</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/fangwuzulin.png" class="image"></image>
						<text class="text">房屋租赁</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/laodong.png" class="image"></image>
						<text class="text">劳动合同</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/fangwuzulin.png" class="image"></image>
						<text class="text">房屋租赁</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/laodong.png" class="image"></image>
						<text class="text">劳动合同</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/fangwuzulin.png" class="image"></image>
						<text class="text">房屋租赁</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/laodong.png" class="image"></image>
						<text class="text">劳动合同</text>
					</view>
				</uni-grid-item>
			</uni-grid>
		</uni-section>
		<uni-section class="mb-10" title="文书起草" sub-title="交互式生成起诉状和答辩状" padding="0 0 5px 10px">
			<uni-grid :column="4" :highlight="true" @change="change" :showBorder="false"  :square="false">
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/minjianjiedai.png" class="image"></image>
						<text class="text">民间借贷</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/lihun.png" class="image"></image>
						<text class="text">离婚纠纷</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/maimai.png" class="image"></image>
						<text class="text">买卖合同</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/jinrongjiedai.png" class="image"></image>
						<text class="text">金融借贷</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/minjianjiedai.png" class="image"></image>
						<text class="text">民间借贷</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/lihun.png" class="image"></image>
						<text class="text">离婚纠纷</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/maimai.png" class="image"></image>
						<text class="text">买卖合同</text>
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="@/static/jinrongjiedai.png" class="image"></image>
						<text class="text">金融借贷</text>
					</view>
				</uni-grid-item>
			</uni-grid>
		</uni-section>
	</view>
</template>


<script>
	export default {
		data() {
			return {
				
			};
		}
	}
</script>

<style lang="scss">
	.image {
		width: 64px;
		height: 64px;
		border-radius: 10px; /* 设置你需要的圆角值 */
	}
	
	.mb-10 {
		margin-bottom: 10px;
	}

	.text {
		font-size: 14px;
		margin-top: 5px;
	}

	.example-body {
		/* #ifndef APP-NVUE */
		// display: block;
		/* #endif */
	}

	.grid-dynamic-box {
		margin-bottom: 15px;
	}

	.grid-item-box {
		flex: 1;
		// position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 15px 0;
	}

	.grid-item-box-row {
		flex: 1;
		// position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 15px 0;
	}

	.grid-dot {
		position: absolute;
		top: 5px;
		right: 15px;
	}

	.swiper {
		height: 420px;
	}

	/* #ifdef H5 */
	@media screen and (min-width: 768px) and (max-width: 1425px) {
		.swiper {
			height: 630px;
		}
	}

	@media screen and (min-width: 1425px) {
		.swiper {
			height: 830px;
		}
	}

	/* #endif */
</style>

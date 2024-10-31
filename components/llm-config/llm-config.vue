<template>
	<uni-popup ref="popup" type="top">
		<view class="box">
			<text class="title">请选择llm的model</text>
			<radio-group @change="radioChange" class="radio-group">
				<label class="item" v-for="(item, index) in models" :key="item.value">
					<radio :value="item.value" :checked="currentModel === item.value" class="radio" />
					<view class="item-title">{{item.text}}</view>
				</label>
			</radio-group>
			<view class="btn-box">
				<view @click="cancel" class="btn cancel">取消</view>
				<view @click="confirm" class="btn confirm">确认</view>
			</view>
		</view>
	</uni-popup>
</template>

<script>
	let confirmCallback = ()=>{}
	export default {
		name: "llm-config",
		data() {
			return {
				models: [
					{
						text:"gpt-4",
						value:"gpt-4"
					},
					{
						text:"gpt-4-0314",
						value:"gpt-4-0314"
					},
					{
						text:"gpt-4-32k",
						value:"gpt-4-32k"
					},
					{
						text:"gpt-4-32k-0314",
						value:"gpt-4-32k-0314"
					},
					{
						text:"gpt-3.5-turbo",
						value:"gpt-3.5-turbo"
					},
					{
						text:"gpt-3.5-turbo-0301",
						value:"gpt-3.5-turbo-0301"
					},
					{
						text:"都不选",
						value:""
					}
				],
				currentModel:''
			};
		},
		methods: {
			open(callback){
				this.currentModel = uni.getStorageSync('uni-ai-chat-llmModel')
				confirmCallback = callback
				this.$refs.popup.open('center')
			},
			radioChange(event) {
				console.log('event',event.detail.value)
				this.currentModel = event.detail.value
			},
			cancel(){
				this.$refs.popup.close()
			},
			confirm(){
				// console.log(this.models[this.current]);
				confirmCallback(this.currentModel)
				this.$refs.popup.close()
			},
		}
	}
</script>

<style>
	/* #ifndef APP-NVUE */
	.box,
	/* #ifdef H5 */
	.box *,
	/* #endif */
	radio-group,
	label
	{
		display: flex;
		box-sizing: border-box;
	}
	/* #endif */
	.box,.title,.btn-box {
		width: 250px;
	}
	
	.box {
		background-color: #fff;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding-bottom: 0;
		border-radius: 5px;
	}
	.title {
		font-size: 16px;
		padding: 10px 0;
		padding-bottom: 5px;
		font-weight: 400;
		flex: 1;
		text-align: center;
		/* #ifndef APP-NVUE */
		display: inline-block;
		/* #endif */
	}
	.radio-group {
		flex-direction: column;
		padding: 0 15px;
	}
	.radio {
		transform: scale(0.7);
	}
	.item {
		flex-direction: row;
		margin-bottom: 5px;
		position: relative;
	}
	.item-title {
		font-size: 14px;
		color: #555;
	}
	.btn-box{
		/* #ifdef APP-NVUE */
		border-top:solid 1px #ccc;
		/* #endif */
		height: 48px;
		position: relative;
	}
	/* #ifndef APP-NVUE */
	.btn-box:after {
	    content: " ";
	    position: absolute;
	    left: 0;
	    top: 0;
	    right: 0;
	    height: 1px;
	    border-top: 1px solid #d5d5d6;
	    color: #d5d5d6;
	    transform-origin: 0 0;
	    transform: scaleY(.5);
	}
	/* #endif */
	
	.btn{
		justify-content: center;
		align-items: center;
		width: 150px;
		/* #ifdef H5 */
		cursor: pointer;
		/* #endif */
	}
	
	.confirm {
		color: #007aff;
		position: relative;
		/* #ifdef APP-NVUE */
		border-left:solid 1px #ccc;
		/* #endif */
	}
	
	/* #ifndef APP-NVUE */
	.confirm::before {
	    content: "";
	    position: absolute;
	    left: 0;
	    top: 0;
	    right: 0;
		background-color: #d5d5d6;
	    height: 48px;
		width: 1px;
	    /* border-top: 1px solid #d5d5d6; */
	    /* color: #d5d5d6; */
	    /* transform-origin: 0 0; */
	    transform: scaleX(.5);
	}
	/* #endif */
</style>
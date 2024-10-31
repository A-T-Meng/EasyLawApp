class Task {
	constructor({
		success,
		fail,
		complete
	} = {}) {
		this.status = 0
		this.callback = {
			success,
			fail,
			complete
		}
	}
	invoke(callbackName, ...args) {
		if (this.status !== 0) {
			// console.log('此任务已被终止');
			return
		}
		const callback = this.callback[callbackName]
		callback && callback(...args)
	}
	abort() {
		this.status = 1
	}
}

export default function main({
	coName,
	funName,
	param,
	success,
	fail,
	complete,
	config
} = {}) {
	
	if(!Array.isArray(param)){
		throw new Error('param的值必须为数组')
	}
	
	const task = new Task({
		success,
		fail,
		complete
	})

	const uniCloudCo = uniCloud.importObject(coName, config||{})

	uniCloudCo[funName](...param)
		.then(res => {
			task.invoke('success', res)
		})
		.catch(err => {
			task.invoke('fail', err)
		})
		.finally(res => {
			task.invoke('complete', res)
		})
	return task
}
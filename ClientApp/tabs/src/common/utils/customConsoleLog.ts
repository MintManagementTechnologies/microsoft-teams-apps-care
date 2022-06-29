const logStyles = {
	base: [
		'color: #fff',
		'background-color: #444',
		'padding: 2px 4px',
		'border-radius: 2px',
	],
	warning: ['color: #eee', 'background-color: red'],
	success: ['background-color: green'],
	test: ['background-color: purple'],
};

export const log = (_msg: any, _logStyles?: undefined | 'base' | 'warning' | 'success' | 'test') => {
	if(_logStyles){
		let styles = logStyles[_logStyles].join(';');
		console.log(`%c${_msg}`, styles);
	} else {
		console.log(_msg);
	}
};
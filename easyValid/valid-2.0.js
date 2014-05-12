/***********************/
/***********************/
(function($){
	var defaults = {
		all:true,//表单提交时是否验证所有表单元素,如果为否，则遇到未通过验证的就会停止后面元素的验证
		focus:true,//提交表单时，未验证通过的第一个表单元素是否自动获得焦点
		/*******************/
		tiptype:2,//提示方式默认为系统内置的第2种
		domcls:'ev-tip-dom',//提示方式为2时会根据此clsss在表单元素的同级中查找dom元素，如果没有找到则会自动创建一个;另外此参数还可以为函数，返回一个dom元素
		errcls:'ev-err',
		emptycls:null,
		okcls:'ev-ok',
		tipcls:'ev-tip',
		waitcls:'ev-wait',
		f_errcls:'evf-err',
		f_emptycls:null,
		f_okcls:'evf-ok',
		f_tipcls:'evf-tip',
		f_waitcls:'evf-wait',
		errmsg:'填写错误',
		okmsg:'',
		tipmsg:'请填写',
		emptymsg:'不能为空',
		waitmsg:'正在验证...',
		textcls:'',//显示提示信息的容器的类名
		empty:false,//是否允许为空
		onvalid:function(elem,state,conf){},//验证后的回调函数
		fn:{} //要用到的函数列表
	};
	var rules ={
		'*'          : /^[^\s]+$/, //不为空格的任何字符
		'w'          : /^\w+$/, //字母、数字、下划线
		'd'			 : /^\d+$/, //数字	
		'en'         : /^[A-Za-z]+$/,  //英文字母
		'zh'         : /^[\u0391-\uFFE5]+$/,  //中文
		'cellphone'  : /^((\(\d{2,3}\))|(\d{3}\-))?13\d{9}$/, //手机号码
		'telphone'   : /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/, //固定电话
		'email'      : /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, //邮箱地址
		'idcard'     : /^\d{15}(\d{2}[A-Za-z0-9])?$/ //身份证
	}
	var randers = {//内置提示方式
		'1':function(state,elem,conf){//最简单原始的alert提示
				if(state===null){}
				else if(!state){} //验证通过时不进行提示
				else{alert(conf.errmsg)}
			},
		'2':function(state,elem,conf){//会查找参数中指定的dom元素，没有时会自动创建
				var $dom = conf.tipdom;
				if(state===null){//留空
					$dom.hide();
				}else if(!state){//验证通过
					$dom.removeClass(conf.errcls+' '+conf.tipcls+' '+conf.waitcls).addClass(conf.okcls);
					conf.textdom.html(conf.okmsg);
					$dom.show();
					$(elem).removeClass(conf.f_errcls+' '+conf.f_tipcls+' '+conf.f_waitcls).addClass(conf.f_okcls);//表单元素的类
				}else if(state==5){//不能为空
					$dom.removeClass(conf.okcls+' '+conf.tipcls+' '+conf.waitcls).addClass(conf.errcls);
					conf.textdom.html(conf.emptymsg||(conf.emptymsg===''?conf.emptymsg:conf.errmsg));
					$dom.show();
					$(elem).removeClass(conf.f_okcls+' '+conf.f_tipcls+' '+conf.f_waitcls).addClass(conf.f_errcls);		
				}else if(state==1){//验证未通过
					$dom.removeClass(conf.okcls+' '+conf.tipcls+' '+conf.waitcls).addClass(conf.errcls);
					conf.textdom.html(conf.errmsg);
					$dom.show();
					$(elem).removeClass(conf.f_okcls+' '+conf.f_tipcls+' '+conf.f_waitcls).addClass(conf.f_errcls);
				}else if(state==2){//得到焦点
					$dom.removeClass(conf.errcls+' '+conf.okcls+' '+conf.waitcls).addClass(conf.tipcls);
					conf.textdom.html(conf.tipmsg);
					$dom.show();
					$(elem).removeClass(conf.f_errcls+' '+conf.f_okcls+' '+conf.f_waitcls).addClass(conf.f_tipcls);
				}else if(state==3){//等待ajax验证返回结果
					$dom.removeClass(conf.errcls+' '+conf.okcls+' '+conf.tipcls).addClass(conf.waitcls);
					conf.textdom.html(conf.waitmsg);
					$dom.show();
					$(elem).removeClass(conf.f_errcls+' '+conf.f_okcls+' '+conf.f_tipcls).addClass(conf.f_waitcls);
				}else if(state==4){//ajax验证未通过
					$dom.removeClass(conf.okcls+' '+conf.tipcls+' '+conf.waitcls).addClass(conf.errcls);
					conf.textdom.html(conf.ajax_errmsg);
					$dom.show();
					$(elem).removeClass(conf.f_okcls+' '+conf.f_tipcls+' '+conf.f_waitcls).addClass(conf.f_errcls);
				}
			}	
	}
	function init(form,opts){
		var elems = getVerifyElems(form); //需要验证的表单元素集合
		$(form).data('opts',opts); //把该表单的配置参数储存起来
		$(form).data('elems',elems); //把该表单要验证的表单元素储存起来
		var default_str = 'errmsg,errcls,emptycls,f_emptycls,f_errcls,okmsg,okcls,f_okcls,tipmsg,tipcls,f_tipcls,waitcls,f_waitcls,waitmsg,emptymsg,domcls,empty,tiptype,onvalid';
		var default_str_arr = default_str.split(',');
		for(var i=0,len=elems.length;i<len;i++){
			var conf = {}; //单个表单元素的配置对象
			for(var n=0,len2=default_str_arr.length;n<len2;n++){//循环赋值
				conf[default_str_arr[n]] = ($(elems[i]).attr(default_str_arr[n])||$(elems[i]).attr(default_str_arr[n])==='') ? $(elems[i]).attr(default_str_arr[n]) : opts[default_str_arr[n]];
			}
			if(!$.isFunction(conf.onvalid)) conf.onvalid = opts.fn[conf.onvalid.replace(/\(.*\)$/,'')] || function(){};//验证后触发的回调函数
			if(conf.emptycls===null) conf.emptycls = conf.errcls;
			if(conf.f_emptycls===null) conf.f_emptycls = conf.f_errcls;
			conf.form = form; //储存form元素
			conf.elem = elems[i]; //储存dom元素
			conf.ajaxurl = $(elems[i]).attr('ajaxurl') || ''; //ajax验证url
			conf.ajaxname = $(elems[i]).attr('ajaxname') || $(elems[i]).attr('name') || 'ajaxdata'; //ajax验证时传送验证值的参数名
			
			conf.datatype = $.trim($(elems[i]).attr('datatype'));//数据类型
			conf.verify = createValid(conf.datatype,opts);//编译成验证函数
			conf.rander = creatRander(conf.tiptype,opts);//编译成渲染函数
			if(conf.tiptype==2){//如果是系统内置的第2种验证方法，则需要获取用于提示的dom元素
				conf.tipdom = getTipdom(conf.domcls,$(elems[i]),conf,form);//获取提示dom节点
				conf.tipdom.hide();
				conf.textcls = $(elems[i]).attr('textcls') || opts.textcls; //存放提示信息的容器的类名
				conf.textdom = conf.textcls?conf.tipdom.find('.'+conf.textcls):conf.tipdom;//存放提示信息的容器
			}
			$(elems[i]).data('ev_conf',conf); //把配置对象赋给元素,这里加个 前缀ev是为了防止和其他代码的冲突
			//注册失去和得到焦点事件
			if(elems[i].type == 'radio' || elems[i].type == 'checkbox') $(elems[i]).click(onBlur);//如果是单选按钮或多选按钮则注册点击事件
			else if(elems[i].nodeName.toUpperCase() == 'SELECT') $(elems[i]).change(onBlur); //下拉框注册change事件
			else $(elems[i]).blur(onBlur).focus(onFocus);
			$(elems[i]).focus(onFocus);
		}
		$(form).submit(function(){//注册表单提交事件
			return onSubmit(this,opts,elems);
		});
	}
	/**
	**********************************************************************************************************************************************************************************
	*
	*********************************************************************************************************************************************************************************
	*/
	function createValid(datatype,opts){//生成验证函数,验证函数必须返回一个状态码，为0或未定义时代表验证通过,为null时表示留空,为1时代表验证未通过,为2时代表得到焦点,为3时表示等待ajax返回结果,为4时表示ajax验证未通过,为5时表示不能为空
		if($.isFunction(datatype)) var verify = datatype;
		else if(/^\w+\(.*\)$/.test(datatype)){//自定义函数验证
			var verify =  opts.fn[datatype.replace(/\(.*\)$/,'')];
			if(!verify) verify = function(){return 0}; //找不到自定义的验证函数则所有值都验证通过
		}else if(/^\/.+\/\w*$/.test(datatype)){//自定义正则表达式验证
			var matches = datatype.match(/^\/(.+)\/(\w*)$/);
			var reg = matches[2]?new RegExp(matches[1],matches[2]):new RegExp(matches[1]);
			var verify = function(value,conf){
				if(value===''){return conf.empty?null:5}//为空或不能为空
				if(reg.test(value)){return 0}
				else{return 1}
			}
		}else if(rules[datatype]){//普通的内置验证规则
			var verify = function(value,conf){
				if(value===''){return conf.empty?null:5}//为空或不能为空
				if(rules[datatype].test(value)){return 0}
				else{return 1}
			}
		}else{//其他特殊的内置规则
			var verify = specialValid(datatype);
		}
		return verify;//返回生成的验证函数
	}
	
	function creatRander(tiptype,opts){//生成ui渲染函数，第一个参数state表示验证状态，第二个参数elem表示当前的表单元素，第三个参数conf表示当前表单元素的配置信息
		if(tiptype==1) var rander = randers['1'];
		else if(tiptype==2) var rander = randers['2'];
		else if($.isFunction(tiptype)){//自定义的共用渲染函数
			var rander = tiptype;	
		}
		else if(/^\w+\(.*\)$/.test(tiptype)){//在表单元素上自定义的ui渲染函数
			var rander =  opts.fn[tiptype.replace(/\(.*\)$/,'')];
			if(!rander) rander = randers[opts.tiptype];
		}
		return rander;
	}
	function getVerifyElems(form){/***获取需要验证的表单元素集合***/
		var elems = [];
		$('input,select',form).each(function(){
			if($(this).attr('datatype')) elems.push(this); //有datatype	属性的即代表需要验证						  
		});
		return elems;
	}
	/**
	*********************************************************************************************************************************************************************
	*
	*********************************************************************************************************************************************************************
	*/
	function onBlur(){//表单元素失去焦点
		var conf = $(this).data('ev_conf');
		if(conf.tiptype==1) return;//第一种提示方式时，不需要失去焦点事件
		//var state = conf.verify($(this).val(),conf);
		var state = finalValid(conf.verify,$(this).val(),conf);
		conf.rander(state,this,conf);//渲染Ui
		conf.onvalid.call(this,this,state,conf);//执行验证后的自定义回调函数
	}
	function onFocus(){//表单元素获得焦点
		if($(this).data('ajaxing')){return}//正在ajax验证
		var conf = $(this).data('ev_conf');
		if(conf.tiptype==1) return;//第一种提示方式时，不需要得到焦点事件
		conf.rander(2,this,conf);//渲染Ui
	}
	function onSubmit(form,opts,elems){//表单提交事件
		$(form).data('need_submit',1);//需要提交
		return submitCheck(form,opts,elems);
	}
	function submitCheck(form,opts,elems){//提交时进行验证
		var flag = 1,first_err;
	    for(var i=0,len=elems.length;i<len;i++){
			var conf = $(elems[i]).data('ev_conf');
			var state = finalValid(conf.verify,$(elems[i]).val(),conf);
			conf.rander(state,elems[i],conf);//渲染Ui
			conf.onvalid.call(elems[i],elems[i],state,conf);//执行验证后的自定义回调函数
			if(state){
				if(flag&&opts.focus) elems[i].focus();//第一个错误的元素获得焦点
				flag*=0;
				if(!opts.all) break;//不验证余下的了
			}
		}
		if(flag && $(form).data('need_submit')){//需要提交
			form.submit();
			return false;
		}
		return !!flag;
	}
	function finalValid(validFn,value,conf){//最终的验证函数
		var state = validFn(value,conf);//第一步验证
		if(state){//第一步验证未通过
			$(conf.form).data('need_submit',0);//不需要提交了
			return state;
		}
		else{//第一步通过验证，检查还要不要进行其他的验证
			if(conf.ajaxurl){//需要ajax验证
				state = ajaxValid(conf);//ajax状态
			}
		}
		return state;
	}
	function ajaxValid(conf){//ajax验证函数
		var state = 3;
		var elem = conf.elem;
		if($(elem).data('ajaxing')){return state}//正在验证，不要重复发送
		/*****缓存ajax验证的结果，这样下次再进行ajax验证时则可以直接返回结果，不需要异步等待了**************/
		if($(elem).data('ajaxvalid')&&$(elem).data('old_value')===$(elem).val()){//已经验证过了，且值没变，则不再进行ajax验证了
			state = $(elem).data('ajaxvalid')=='yes'?0:4;
			return state;
		}
		$(conf.elem).data('old_value',$(elem).val());//把值储存起来，以后如果值没变，就不用重复验证了
		var url = conf.ajaxurl;
		var data = {};
		data[conf.ajaxname] = $(elem).val();
		$(conf.elem).data('ajaxing',1);//防止重复发送ajax请求的标识
		$.ajax({
			url:url,
			type:'POST',
			data:data,
			success:function(r){
				$(conf.elem).data('ajaxing',0);//关掉防止重复发送ajax请求的标识
				if(r.error=='0'){
					var state = 0;//ajax验证通过
					$(elem).data('ajaxvalid','yes');
				}else{
					var state = 4;//ajax验证未通过
					$(conf.form).data('need_submit',0);//不需要提交了
					$(elem).data('ajaxvalid','no');
					conf.ajax_errmsg = r.errstr || conf.errmsg;//ajax验证未通过的提示内容
				}			 
				conf.rander(state,conf.elem,conf);//渲染Ui
				
				if($(conf.form).data('need_submit')){//ajax验证后需要提交表单
					submitCheck(conf.form,$(conf.form).data('opts'),$(conf.form).data('elems'));
				}
			},
			error:function(){//出错当做验证通过来对待
				$(conf.elem).data('ajaxing',0);//关掉防止重复发送ajax请求的标识
				var state = 0;
				$(elem).data('ajaxvalid','yes');	 
				conf.rander(state,conf.elem,conf);//渲染Ui
				if($(conf.form).data('need_submit')){//ajax验证后需要提交表单
					submitCheck(conf.form,$(conf.form).data('opts'),$(conf.form).data('elems'));
				}
			},
			dataType:'json'
		});
		return state;
	}	
	function specialValid(datatype){//特殊的验证规则
		var verify = function(){return 0}
		var matches = datatype.match(/^(\*|w|d|en|zh)(\d+)+(~)?(\d+)?$/); //匹配基本的几个类型,可以带上数字
		if(matches){//基本类型并且有数量限制的验证
			var ns =  '{'+matches[2]+(matches[3]?',':'')+(matches[4]?matches[4]:'')+'}'; //构造出像{2,3}这样的字符串
			var reg_str = rules[matches[1]].source.replace(/\+/,ns); //创建正则表示式的字符串
			var Reg = new RegExp(reg_str);
			verify = function(value,conf){
				if(value===''){return conf.empty?null:5}//为空或不能为空
				if(Reg.test(value)){return 0}
				else{return 1}
			}
			return verify;
		}
		matches = datatype.match(/^re\:(.+)/); //匹配一致性类型
		if(matches){//一致性验证，常用在确认密码的地方
			var name = matches[1];
			verify = function(value,conf){
				return $('[name="'+name+'"]',conf.form).val()===value?0:1;
			}
			return verify;
		}
		/*****更多的特殊验证可在此添加***********************/
		return verify;
	}
	
	function getTipdom(domcls,$elem,conf,form){//获取提示ui元素,只有在提示方式为2时才用得到
		var f = null, opts = $(form).data('opts');
		if($.isFunction(domcls)){f = domcls;}//直接是函数
		else if(/^\w+\(.*\)$/.test(domcls)){//自定义函数查找dom
			f = opts.fn[domcls.replace(/\(.*\)$/,'')];
		}
		if(f){
			var dom = f($elem,form);
			return $(dom);
		}
		var $dom = $elem.siblings('.'+domcls);
		if(!$dom.length){//如果在同级中找不到则创建一个
			$dom = $('<span clsss="'+domcls+'"></span>').insertAfter($elem);
		}
		return $dom;
	}
	$.easyValid = {};
	$.easyValid.addRule = function(rule_name,rule){//增加验证规则,rule_name为规则名，可以直接被datatype使用,rule为规则内容，为一个正则表达式对象，注意自己添加的规则不能覆盖已有的内置规则
		if(/^w|d|en|zh|\*|cellphone|telphone|idcard$/.test(rule_name)) return; //不能覆盖内置规则 
		rules[rule_name] = rule;
	}
	$.fn.easyValid = function(opts){
		var opts = $.extend({},defaults,opts);
		if(opts.tiptype==1) opts.all = false; //当是第一种提示方式时，只对第一个遇到的错误进行提示
		this.each(function(){	   
			init(this,opts);				   
		});
	}
})(jQuery);
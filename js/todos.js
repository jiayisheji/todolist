/**
* todoApp Module
*
* Description
*/
	//本地存储相关操作
	function save(data){    //保存到本地存储
		localStorage.setItem("todo",JSON.stringify(data));
	}
	function pull(){   //从本地存储拉取数据
		var collection = localStorage.getItem("todo");
		if(collection != null){
			return JSON.parse(collection);
		}else{
			return [];
		}
	}
	//自定义指令
	Vue.directive('my-checked',{  //是否选中指令
		bind: function () {},
		update: function (newValue, oldValue) {
		    // 值更新时的工作
		    // 也会以初始值为参数调用一次
		    this.el.checked = newValue;
		},
	  	unbind: function () {}
	});
	Vue.directive('my-disabled',{  //是否禁用
		bind: function () {},
		update: function (newValue, oldValue) {
		    // 值更新时的工作
		    // 也会以初始值为参数调用一次
		    this.el.disabled = newValue;
		},
	  	unbind: function () {}
	});
	var app = new Vue({
		el : '#todoapp',
		data : {
			title : 'todos',   //标题
			list : pull(),  //数据列表
			disabled : true,   //全选按钮默认关闭
			toggleAll :　false, 　　//是否全选
			count : 0,   //剩下的项目
			completed : 0,   //要清除完成的项目
			content : '',        //输入框要填写的内容
		},
		methods : {
			add : function(){   //添加数据
				if(this.content.trim()){
					var todo = {"id":+new Date(),"title":this.content,"done":false,"edit":false};
					this.list.unshift(todo);
					this.content = '';
					this.disabled = false;
					this.todoCount();
				}
			},
			remove : function(id){   //删除数据
				this.list.splice(id,1);
				this.todoCount();
			},
			change : function(id){    //修改数据显示删除
				this.list[id].done = !this.list[id].done;
				this.todoCount();
			},
			changeAllfn : function(){    //修改全部数据显示删除
				var _this = this;
				this.list.forEach(function(v){
					v.done = !_this.toggleAll;
				});
				this.toggleAll = !this.toggleAll;
				this.todoCount();
			},
			edit : function(id){  //修改数据
				this.list.forEach(function(v){
					v.edit = v.id === id;
				});
				this.todoCount();
			},
			blur : function(id){   //失去焦点保存修改数据
				this.list[id].edit = false;
				this.todoCount();
			},
			clear : function(){  //清除选中的
				if(this.completed > 0){
					this.list = this.list.filter(function(v) {   //过滤选中的数据，保留未选中的
						return !v.done;
					});
				}
				this.todoCount();
			},
			todoCount : function(){    //统计函数
				var iNum = this.list.filter(function(v) {   //过滤选中的数据，保留选中的
					return v.done;
				});
				this.completed = iNum.length;  //统计需要清除项目
				this.count = this.list.length-iNum.length;  //统计剩下项目
				this.disabled = !this.list.length; //如果没有项目全按钮不能点击
				this.toggleAll = !!this.completed && this.list.length === this.completed;   //动态改变全选按钮选中状态
				save(this.list);   //保存数据到本地存储
			}
		}
	});
	//初始化记录
	app.todoCount();

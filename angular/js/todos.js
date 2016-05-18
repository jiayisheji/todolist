/**
* todoApp Module
*
* Description
*/
angular.module('todoApp', []).
	controller('todoCntroller', ['$scope', function($scope){
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
		$scope.Todo = {
			list : pull(),  //数据列表
			disabled : true,   //全选按钮默认关闭
			toggleAll :　false, 　　//是否全选
			count : 0,   //剩下的项目
			completed : 0,   //要清除完成的项目
			content : '',        //输入框要填写的内容
			add : function(){    //添加数据
				if(this.content.trim()){
					var todo = {"id":+new Date(),"title":this.content,"done":false,"edit":false};
					this.list.unshift(todo);
					this.content = '';
					this.disabled = false;
					todoCount();
				}
				return false;
			},
			remove : function(id){   //删除数据
				this.list.splice(id,1);
				todoCount();
			},
			change : function(id){    //修改数据显示删除
				this.list[id].done = !this.list[id].done;
				todoCount();
			},
			changeAll : function(){    //修改全部数据显示删除
				var _this = this;
				angular.forEach(this.list,function(v){
					v.done = !_this.toggleAll;
				});
				this.toggleAll = !this.toggleAll;
				todoCount();
			},
			edit : function(id){  //修改数据
				angular.forEach(this.list,function(v){
					v.edit = v.id === id;
				});
				todoCount();
			},
			blur : function(id){   //失去焦点保存修改数据
				this.list[id].edit = false;
				todoCount();
			},
			clear : function(){  //清除选中的
				if(this.completed > 0){
					this.list = this.list.filter(function(v) {   //过滤选中的数据，保留未选中的
						return !v.done;
					});
				}
				todoCount();
			}
		};
		todoCount();
		function todoCount(){    //统计函数
			var iNum = $scope.Todo.list.filter(function(v) {   //过滤选中的数据，保留选中的
				return v.done;
			});
			$scope.Todo.completed = iNum.length;  //统计需要清除项目
			$scope.Todo.count = $scope.Todo.list.length-iNum.length;  //统计剩下项目
			$scope.Todo.disabled = !$scope.Todo.list.length; //如果没有项目全按钮不能点击
			$scope.Todo.toggleAll = !!$scope.Todo.completed && $scope.Todo.list.length === $scope.Todo.completed;   //动态改变全选按钮选中状态
			save($scope.Todo.list);   //保存数据到本地存储
		}
	}]);

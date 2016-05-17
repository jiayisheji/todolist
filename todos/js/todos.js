$(function(){
	//step1  获取必备元素
	var $todoapp = $('#todoapp');
	var $todoform = $todoapp.find('.todo-form');
	var $addtodo = $todoapp.find('.add-todo');
	var $toggleall = $todoapp.find('.toggle-all');
	var $todolist = $todoapp.find('.todo-list');
	var $todocount = $todoapp.find('.todo-count');
	var $clearcompleted = $todoapp.find('.clear-completed');

	//全局数据列表
	var todoData = loadData();
	//step2  实现添加功能
	$todoform.on('submit',function(event){
		event.preventDefault();
		if(!!$.trim($addtodo.val())){
			var todo = {"id":+new Date(),"title":$addtodo.val(),"done":false};
			todoData.unshift(todo);
			$todolist.prepend(createData(todo));
			$addtodo.val('');
			$toggleall.prop("disabled", false);
			todoCount();
		}
		return false;
	});

	//step3  实现列表中显示一条数据
	// 数据格式  {"id":当前id放置冲突用时间戳代替,title":显示文字,"done":显示是否选中}
	function createData(data){
		return '<li class="'+(data.done ? 'completed' : '')+'" data-uid="'+data.id+'">\
		            <div class="view">\
		                <input class="toggle" type="checkbox" '+(data.done ? 'checked="checked"' : '')+' />\
		                <label>'+data.title+'</label>\
		                <button class="destroy"></button>\
		            </div>\
		            <input class="edit" value="'+data.title+'">\
		        </li>';
	};

	//step4  实现列表中删除一条数据
	$todoapp.delegate('.destroy', 'click',function(event){
		event.preventDefault(); //阻止默认事件，防止冒泡
		$(this).parents('li').remove(); //删除当前显示列表项
		var index = findIndex(todoData,$(this).parents('li').data('uid'));
		todoData.splice(index,1);    //删除数据
		todoCount();
	});
	function findIndex(arr,id){   //查找数组索引值
		for (var i = 0,len = arr.length; i < len; i++) {
			if(arr[i].id == id){
				return i;
			}
		}
		return -1;
	}

	//step4  实现列表中选中一条数据
	$todoapp.delegate('.toggle', 'change',function(event){
		event.preventDefault(); //阻止默认事件，防止冒泡
		var _checked = $(this).prop('checked');
		var index = findIndex(todoData,$(this).parents('li').data('uid'));
		todoData[index].done = _checked;
		$(this).parents('li').toggleClass('completed',_checked); //实现删除选中效果
		todoCount();
	});

	//step5  实现列表中编辑一条数据 需要双击
	$todoapp.delegate('li', 'dblclick',function(event){
		event.preventDefault(); //阻止默认事件，防止冒泡
		$(this).addClass('editing').siblings('li').removeClass('editing');
	});
	$todoapp.delegate('.edit','blur',function(event){
		event.preventDefault(); //阻止默认事件，防止冒泡
		$(this).parents('li').removeClass('editing');
		var index = findIndex(todoData,$(this).parents('li').data('uid'));
		if(!!$.trim($(this).val())){
			todoData[index].title = $(this).val();
			$(this).parents('li').find('label').html($(this).val())
		}else{
			$(this).parents('li').remove(); //删除当前显示列表项
			todoData.splice(index,1);    //删除数据
		}
		todoCount();
	});

	//step6  实现列表中计数功能
	function todoCount(){
		var todo = $todolist.find('li').size();
		var completed = $todolist.find('li.completed').size();
		$clearcompleted.html('<span>清除&nbsp;</span><strong>'+completed+'</strong><span>&nbsp;完成项目</span>');
		$todocount.html('<strong>'+(todo - completed)+'</strong><span>&nbsp;剩下的项目</span>');
		$toggleall.prop({"checked": !!completed && completed === todo,"disabled":!todo});
		saveData(todoData);
	}

	//step7  清除选中的列表项
	$todoapp.delegate('.clear-completed','click',function(event){
		event.preventDefault(); //阻止默认事件，防止冒泡
		if($todolist.find('li.completed').size()>0){
			$todolist.find('li.completed').remove();
			todoCount();
		}
	});

	//step8  全部选中的列表项
	$toggleall.prop("disabled", true);
	$todoapp.delegate('.toggle-all','change',function(event){
		event.preventDefault(); //阻止默认事件，防止冒泡
		var _checked = $(this).prop('checked');
		$todolist.find('li').toggleClass('completed',_checked); //实现删除选中效果
		$todolist.find('li').find('.toggle').prop('checked',_checked);
		todoCount();
	});

	//step8  本地存储数据
	//获取本地存储数据
	function loadData(){
		var collection = localStorage.getItem("todo");
		if(collection != null){
			return JSON.parse(collection);
		}else{
			return [];
		}
	}
	//清除全部本地存储数据
	function clearData(){
		localStorage.clear();
		createList();  //更新视图
	}
	//保存本地存储数据
	function saveData(data){
		localStorage.setItem("todo",JSON.stringify(data));
	}
	function createList(){
		var str = '';
		for (var i = 0,len = todoData.length; i < len; i++) {
			str += createData(todoData[i]);
		}
		$todolist.html(str);
		todoCount();
	};
	//更新视图
	createList();
})

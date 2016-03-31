$(function(){
	//step1  获取元素
	var oFromData = $('#formData'),
	    oAdd = $('#title'),
		oTodocount = $('#todocount'),
		oDonecount = $('#donecount'),
		oTodolist = $('#todolist'),
		oDonelist = $('#donelist'),
		oRemoveList = $('#removeList'),
		oDoc = $(document),
		oWin = $(window);
	//tep2  实现添加功能 创建一个li
	oFromData.on('submit',function(ev){
		if(!oAdd.val()){
			alert('请输入内容')
		}else{
			var data = loadData();
			var todo = {"title":oAdd.val(),"done":false};
			data.push(todo);
			saveData(data);
			createData();
			oAdd.val('');
		}
		return false;
	})
	if(loadData().length){
		createData()
	}
	//tep3 创建li 带有两个参数，一个指定添加在谁的里面，一个添加内容，做好公用准备
	function createData(){
		var data = loadData(),
			sDonelist = '',
			sTodolist = '',
			iTodo = 0,
			iDone = 0;
		for(var i = data.length - 1; i >= 0; i--){
			if(data[i].done){
				sDonelist += '<li><input type="checkbox" checked data-index="'+i+'" /><div class="content" data-editor="'+i+'">'+data[i].title+'</div><a href="javascript:;" data-remove="'+i+'">-</a></li>'
				iDone++;
			}else{
				sTodolist += '<li draggable="true"><input type="checkbox" data-index="'+i+'" /><div class="content" data-editor="'+i+'">'+data[i].title+'</div><a href="javascript:;" data-remove="'+i+'">-</a></li>'
				iTodo++;
			}
		};
		//添加数据渲染视图
		oTodolist.html(sTodolist);
		oDonelist.html(sDonelist);
		//显示计数器
		oTodocount.html(iTodo);
		oDonecount.html(iDone);
		//控制清空按钮
		if(iTodo > 0 || iDone > 0){
			oRemoveList.show();
		}else{
			oRemoveList.hide();
		}
		var aTodoLi = oTodolist[0].getElementsByTagName('li');
		[].forEach.call(aTodoLi,function(li){
			li.addEventListener('dragstart', handleDragStart, false);
			li.addEventListener('dragover', handleDragOver, false);
			li.addEventListener('drop', handleDrop, false);
		})
	}
	/*	// 不用事件委托写法 新添加没有事件  技巧：注意动态创建的元素要绑定事件一定要用事件委托不然没有事件绑定
	$('#todolist li').click(function(event) {
		alert(1)
	});*/
	//tep4 实现删除功能 用事件委托写法
	oDoc.delegate('#todolist li a,#donelist li a', 'click',function(ev){
		ev.preventDefault(); //阻止默认事件，防止冒泡
		//$(this)    这是谁，你点击那个li   #todolist li
		//$(this)    这是谁，你点击那个a   #todolist li a
		//ev.target.nodeName 查看触发事件的DOM元素标签名
		var index = $(this).data('remove'),   //获取当前a标签的索引
			data = loadData();   //获取数据
		data.splice(index,1);    //删除数据
		saveData(data);			//保存数据
		createData();			//更新视图
	})
	//tep5 正在进行移动到已完成
	oDoc.delegate('#todolist li input', 'click',function(ev){
		ev.preventDefault(); //阻止默认事件，防止冒泡
		move($(this),true);
	})
	//tep6 已完成移动到正在进行
	oDoc.delegate('#donelist li input', 'click',function(ev){
		ev.preventDefault(); //阻止默认事件，防止冒泡
		move($(this),false);
	})
	function move(obj,off){
		var index = obj.data('index'),   //获取当前a标签的索引
			data = loadData();   //获取数据
		data[index].done = off;   //更改done值就可以切换todolist状态	
		saveData(data);			//保存数据
		createData();			//更新视图
	}
	//tep7 实现可以编辑
	oDoc.delegate('#donelist .content,#todolist .content', 'click',function(ev){
		ev.preventDefault(); //阻止默认事件，防止冒泡
		$(this).attr('contenteditable',true);  //使用html5标签编辑属性
		return false;
	})
	oDoc.on('click',function(){
		var oDiv = $(this).find('.content[contenteditable]');  //找到刚刚编辑div
		if(oDiv.length){   //如果存在就继续，不然会报错
			var str = oDiv.html(),   //获取编辑后内容
				index = oDiv.data('editor'),   //获取当前div索引
				data = loadData();    //获取数据
			data[index].title = str;  //更新数据
			saveData(data);     //保存数据
			oDiv.attr('contenteditable',false);   //取消编辑功能
		}
	})
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
		createData();  //更新视图
	}
	//保存本地存储数据
	function saveData(data){
		localStorage.setItem("todo",JSON.stringify(data));
	}
	oRemoveList.on('click',function(event) {
		if(confirm('你确定要删除吗？删除就没有数据了。。。')){
			clearData();  //清空数据
		}
	});
	//html5拖拽相关api
	oWin.on('storage',function(){
		createData();
	})
	var dragSrcEl = null;
	function handleDragStart(e) {
	  dragSrcEl = this;
	  e.dataTransfer.effectAllowed = 'move';
	  e.dataTransfer.setData('text/html', this.innerHTML);
	}
	function handleDragOver(e) {
	  if (e.preventDefault) {
	    e.preventDefault();
	  }
	  e.dataTransfer.dropEffect = 'move';
	  return false;
	}
	function handleDrop(e) {
	  if (e.stopPropagation) {
	    e.stopPropagation(); 
	  }
	  if (dragSrcEl != this) {
	    dragSrcEl.innerHTML = this.innerHTML;
	    this.innerHTML = e.dataTransfer.getData('text/html');
	    var timer = setTimeout(function(){
	    	saveSort();
	    	clearTimeout(timer)
	    }, 350)
	  }
	  return false;
	}
	//拖拽结束保存数据
	function saveSort(){
		var tDiv=oTodolist.find('.content'),
			dDiv=oDonelist.find('.content'),
			data=[];
		for(var i=0,tDivLen = tDiv.length; i<tDivLen; i++){
			var todo={"title":tDiv[i].innerHTML,"done":false};
			data.unshift(todo);
		}
		for(var i=0,dDivLen = dDiv.length; i<dDivLen; i++){
			var todo={"title":dDiv[i].innerHTML,"done":true};
			data.unshift(todo);
		}
		saveData(data);
	}
})
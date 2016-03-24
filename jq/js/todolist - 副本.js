$(function(){
	//step1  获取元素
	var oFromData = $('#formData'),
	    oAdd = $('#title'),
		oTodocount = $('#todocount'),
		oDonecount = $('#donecount'),
		oTodolist = $('#todolist'),
		oDonelist = $('#donelist'),
		oRemoveList = $('#removeList'),
		oDoc = $(document);
	//tep2  实现添加功能 创建一个li
	oFromData.on('submit',function(ev){
		if(!oAdd.val()){
			alert('请输入内容')
		}else{
			var data = loadData();
			var todo = {"title":oAdd.val(),"done":false};
			data.push(todo);
			createLi(todo);
			saveData(data);
			oAdd.val('');
		}
		return false;
	})
	count();
	if(loadData().length){
		load()
	}
	function load(){
		var data = loadData();
		$.each(data,function(index, el) {
			createLi(el)
		});
	}
	//tep3 创建li 带有两个参数，一个指定添加在谁的里面，一个添加内容，做好公用准备
	function createLi(json){
		var checkbox = json.done ? 'checked' : '',
			sLi = '<li draggable="true"><input type="checkbox" '+checkbox+' name="" id="" /><div class="content">'+json.title+'</div><a href="javascript:;>-</a></li>'
		if(json.done){
			oDonelist.prepend(sLi)
		}else{
			oTodolist.prepend(sLi)
		}
		//计数
		count()
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
		var parent = $(this).closest('li');    //查找指定的父级
			sibling = $(this).siblings('.content').html();  //查找兄弟p标签
		var data=loadData();
		$.each(data,function(index, el){ //把移动先从数据库里面删除
			if(el.title == sibling){
				data.splice(index,1);
				saveData(data);
				return false;
			}
		}); 
		parent.remove();   //删除
		count();
	})
	//tep5 计数函数
	function count(){
		oTodocount.html($('#todolist li').size());
		oDonecount.html($('#donelist li').size());
		if($('#todolist li').size() > 0 || $('#donelist li').size() > 0){
			oRemoveList.show();
		}else{
			oRemoveList.hide();
		}
	}
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
		var parent = obj.closest('li'),    //查找指定的父级
			sibling = obj.siblings('.content').html();    //查找兄弟p标签
			data = loadData(),
			todo = {"title":sibling,"done":off};
		$.each(data,function(index, el){ //把移动先从数据库里面删除
			if(el.title == sibling){
				data.splice(index,1);
				saveData(data);
				return false;
			}
		});
		data.push(todo); //添加移动数据到数据库
		createLi(todo);  //移动
		saveData(data);  
		parent.remove();   //把自己删除
		count()
	}
	//tep7 实现可以编辑
	oDoc.delegate('#donelist .content,#todolist .content', 'click',function(ev){
		ev.preventDefault(); //阻止默认事件，防止冒泡
		var This = $(this),
			data = loadData();
			str = $(this).html();
		$.each(data,function(index, el){ //把移动先从数据库里面删除
			if(el.title == str){
				This.data('editor',index)
			}
		});
		$(this).attr('contenteditable',true);
		return false;
	})
	oDoc.on('click',function(){
		var oDiv = $(this).find('.content[contenteditable]');
		if(oDiv.length){
			var str = oDiv.html(),
				index = oDiv.data('editor'),
				data = loadData();
			data[index].title = str;
			saveData(data);
			oDiv.attr('contenteditable',false);
		}

	})
	//step8 保存数据
	function loadData(){
		var collection=localStorage.getItem("todo");
		if(collection!=null){
			return JSON.parse(collection);
		}else{
			return [];
		}
	}
	function clearData(){
		localStorage.clear();
		load();
	}
	function saveData(data){
		localStorage.setItem("todo",JSON.stringify(data));
	}
	oRemoveList.on('click',function(event) {
		if(confirm('你确定要删除吗？删除就没有数据了。。。')){
			clearData()
			oTodolist.empty();
			oDonelist.empty();
			count()
		}
	});
	//step9 正在进行可以拖拽
	oTodolist.delegate('li','dragstart',function(ev){
		ev.preventDefault();
		handleDragStart($(this),ev)
	}).delegate('li','dragover',function(ev){
		ev.preventDefault();
		handleDragOver($(this),ev)
	}).delegate('li','drop',function(ev){
		ev.preventDefault();
		handleDrop($(this),ev)
	});
	oDoc.on('mouseout',function(){
		saveSort();
	})
	var dragSrcEl = null;
	function handleDragStart(obj,e) {
	  dragSrcEl = obj[0];
	  console.log(e)
	  e.originalEvent.dataTransfer.effectAllowed = 'move';
	  e.originalEvent.dataTransfer.setData('text/html', obj.innerHTML);
	}
	function handleDragOver(obj,e) {
		console.log('dragover')
	  if (e.preventDefault) {
	    e.preventDefault();
	  }
	  e.originalEvent.dataTransfer.dropEffect = 'move';
	  return false;
	}
	function handleDrop(obj,e) {
		console.log('drop')
	  if (e.stopPropagation) {
	    e.stopPropagation(); 
	  }
	  if (dragSrcEl != obj[0]) {
	    dragSrcEl.innerHTML = obj[0].innerHTML;
	    obj[0].innerHTML = e.originalEvent.dataTransfer.getData('text/html');
	  }
	  return false;
	}
	function saveSort(){
		var todolist=document.getElementById("todolist");
		var donelist=document.getElementById("donelist");
		var ts=todolist.getElementsByTagName("div");
		var ds=donelist.getElementsByTagName("div");
		var data=[];
		for(i=0;i<ts.length; i++){
			var todo={"title":ts[i].innerHTML,"done":false};
			data.unshift(todo);
		}
		for(i=0;i<ds.length; i++){
			var todo={"title":ds[i].innerHTML,"done":true};
			data.unshift(todo);
		}
		saveData(data);
	}
})
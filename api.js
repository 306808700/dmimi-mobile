var api_data = [
	{
		type:"api",
		name:'$.ani',
		api:[],
		desc:'dom选择器',
		code:'<div class="api-ani">\
			动画实例\
		</div>',
		exp:function(){
			$(".api-ani").ani({
				// 终点属性配置
				prop:{
					"-webkit-transform":"translateX(300px) scale(2)",
					"opacity":0.5
				},

				// 动画持续时间
				duration:3,

				// 动画延迟执行
				delay:0,

				// 动画形式
				timing:"ease",

				// 动画次数 默认 infinite
				count:1,

				// 完成函数
				end:function(){
					$(this).text("完成");
				}
			});	
		}
	}
];
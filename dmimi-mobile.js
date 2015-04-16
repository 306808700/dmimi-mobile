//@setting UTF-8
/*
    @name dmimi-mobile.js 
    @version v1.2
    @by Dmimi.js

    Copyright (c) 2013,linchangyuan 
    developer more intimate more intelligent  

    updata
        2014-4-25  v1.0
        1.基于Dmimi.js, dmimi-mobile.js 移动版诞生 v1.0
        
        2014-4-26  v1.0
        1.改造dom创建方式，$.create 减少行数21


        2014-4-28  v1.0
        1.添加一个工具函数 $.futher 作用是转换"class.key" ===> class.key 的无限级作用域链读取。

        2014-5-4 v1.0
        1.$.template 改写
        2.添加支持函数式回调
        
        2014-5-12 v1.1
        1.$.ani 动画函数，(css3)支持GPU硬件加速

        2014-7-30 v1.1
        1.$.on 支持on(type,selector,callback) 写法  

        2014-8-29 v1.2
        更新了许多东西，以后补上日志


*/

var DMIMI = (function(){
    return window.$ = window.DMIMI = function(elem) {
        return DMIMI._selector(elem);
    };
})();
(function($) {
    $.Dmimi = "dmimi-mobile 1.1";
    $._selector = function(selector, dom) {
        var doc = dom || document,
            arr, domTemp = [],
            i, len, nodes;
        if (!selector) {
            return $.classArray([]);
        }
        if (typeof selector == "function") {
            return $.ready(selector);
        }
        if (selector.Dmimi) {
            return selector;
        }
        if (typeof selector == "object" || selector.nodeType === 1 || selector.nodeType === 9) {
            if (selector == document) {
                selector = document.documentElement;
            }
            return $.classArray([selector]);
        }
        if (String(selector).match(/^</)) {
            return $.create("div",{},selector).children();
        }

        // 选择器错误验证提示
        if($._error(doc,doc.querySelectorAll(selector),selector)){
            return $.classArray([]);
        }


        return $.classArray(doc.querySelectorAll(selector));
    };
    $._error = function(doc,data,selector){
        if(!data[0]){
            console.warn("selector "+selector+"' is not find");
            return true;
        }
    }
    $._test = function(name, selector) {
        var results;
        var object = {};

        /*
            拿到class name
        */
        if (selector.indexOf(".") != -1) {
            if (selector.indexOf(".") != 0) {
                var arr = selector.split(".");
                object.tagName = arr[0];
                object.arr = [{
                    className: "class",
                    classValue: arr[1]
                }];
            } else {
                object.arr = [{
                    className: "class",
                    classValue: selector.substring(1)
                }];
            }
            return object;
        }

        //===================================================//

        var reg1 = /^\w*/;
        var reg2 = /(\[\w+=.+]|\[\w+]*\])/gi;
        results = selector.match(reg1);

        /*
            拿到 tagName 
        */
        if (results && results.length && results[0] != "") {
            object.tagName = results[0];
        }
        object.arr = [];
        results = selector.match(reg2);

        /*
            拿到 attr
        */
        if (results && results.length) {
            for (var i = 0; i < results.length; i++) {
                var a = results[i],
                    b, c;
                a = a.match(/\[\w*=[#\-\d\w]*\]|\[\w*\]/g);
                if (a && a.length) {
                    for (var j = 0; j < a.length; j++) {
                        b = a[j].replace(/[\[\]]/g, "");
                        c = b.split("=");
                        object.arr[j] = {
                            attrName: c[0],
                            attrValue: c[1]
                        };
                    }
                }
            }
        }
        return object;
    }
    $.validateSelector = function(dom, object) {
        if(!dom) return false;
        var attributeFun = function(dom, object) {

                var n, v;
                if (object.attrName) {
                    if (!dom.getAttribute(object.attrName)) {
                        return false;
                    }
                }
                if (object.attrValue) {
                    v = dom.getAttribute(object.attrName);
                    if (object.attrName == "href") {
                        v = dom.getAttribute(object.attrName);
                        if (v.indexOf("#") != -1) {
                            v = "#" + v.split("#")[1];
                        }
                    }
                    if (v != object.attrValue) {
                        return false;
                    }
                }
                if (object.className) {

                    if (!DMIMI.hasClass(object.classValue, dom.className)) {
                        return false;
                    }
                }
                return true;
            };
        if (object.tagName) {
            if (dom.tagName != object.tagName.toUpperCase()) {
                return false;
            }
        }
        var arr = object.arr;
        var bool = true;
        for (var j = 0; j < arr.length; j++) {
            bool = attributeFun(dom, arr[j]);
            if (!bool) {
                break;
            }
        }
        return bool;
    };
    $.classArray = function(dom) {
        var toArray = function(s) {
                try {
                    return Array.prototype.slice.call(s);
                } catch (e) {
                    var arr = [];
                    for (var i = 0, len = s.length; i < len; i++) {
                        arr[i] = s[i];
                    }
                    return arr;
                }
            }
        var arr = toArray(dom);
        for (var i in $) {
            arr[i] = $[i];
        }
        return arr;
    };
    $.create = function(name,attrs,html){
        var ele = document.createElement(name);
        for(var i in attrs){
            ele.setAttribute(i,attrs[i]);
        }
        if(html){
            ele.innerHTML = html;
        }
        return $.classArray([ele]);
    };
    $.extend = function(a, b) {
        var _class = {};
        if (a) {
            if (typeof a == "function") {
                for (var name in b) {
                    a[name] = b[name];
                }
                return;
            }
            for (var name in a) {
                _class[name] = a[name];
            }
        }
        if (b) {
            for (var name in b) {
                _class[name] = b[name];
            }
        }
        return _class;
    };
    $.plugin = function(name, fn) {
        var obj = fn($);
        delete obj.init;
        var setFunction = function(key, obj) {
                $[key] = function() {
                    return obj[key].apply(this, arguments);
                }
            }
        for (var key in obj) {
            setFunction(key, obj);
        }
        $[name] = $.extend($[name], obj);
    };
    $.each = function(obj, callback) {
        if (typeof obj == "function") {
            callback = obj;
            obj = this;
        }
        if (!obj || obj.length == 0) {
            return;
        }
        var len = obj.length,
            i;
        for (i = 0; i < len; i++) {
            if (callback.apply(obj[i], [i, obj[i]]) == false) {
                break;
            }
        }
        return obj;
    }
})(DMIMI);
DMIMI.plugin("tool", function($) {
    var self;
    return ({
        
        data:function(name,value){
            if(name&&value==undefined){
                if(!this[0][name]){
                    return this.attr("data-"+name);
                }
                return this[0][name];
            }

            for(var i=0;i<this.length;i++){
                this[i][name]=value;
            }
            return this;
        },
        redrow:function(){
            var clone = $(this.html(true));
            this.after(clone);
            this.remove();
            return clone;
        },
        get: function(i) {
            i = i || 0;
            return i >= 0 ? this[i] : this[this.length + i];
        },
        index: function() {
            return this.prevAll().size();
        },
        size: function(object) {
            if(object){
                var len = 0;
                for(var i in object){
                    len++;
                }
                return len;
            }
            return this.length;
        },
        hidden:function(ele){
            if(ele[0].offsetWidth == 0  || ele.css("display")=="none"){
                return true;
            }
        },
        transform:function(type){
            return $.martix($(this).css("-webkit-transform"))[type];
        },
        css:function(prop,value){
            if(prop==undefined||null){
                return getComputedStyle(this[0]);
            }
            if(typeof prop=="string"&&!value){
                if(this[0]){
                    return getComputedStyle(this[0])[prop];
                }else{
                    return null;
                }
            }
            
            $.each(this,function(){
                if(value){
                    this.style[prop] = value;
                } else {
                    for(var i in prop){
                        if(i.match(/width|height/)){
                            if(String(prop[i]).indexOf("px")==-1&&!String(prop[i]).match(/auto|100%/)){
                                prop[i] = prop[i]+"px";
                            }
                        }
                        this.style[i] = prop[i];
                    }
                }
            });
            return this;
        },
        trim: function(data) {

            return data?data.replace(/^[\s\n\t]*|[\s\n\t]*$/g, ""):"";
        },
        html: function(data) {
            var ele = this;
            if (typeof data == "string" || typeof data == "number") {
          
                $.each(ele, function(index, dom) {
                    try{
                        this.innerHTML = data;
                    }catch(err){
                        this.innerText = data;
                    }
                });
                return ele;
            }
            if (typeof data == "boolean") {
                var temp = $("<div></div>");
                temp.append(ele.clone());
                return temp.html();
            }
            if (typeof data == "undefined") {
                var arr = [];
                $.each(ele, function() {
                    arr.push(this.innerHTML);
                });
                return arr.length == 1 ? arr.join("") : arr;
            }
            if(typeof data == "function"){
                ele.html(data.call(this));
            }
            if (data.Dmimi) {
                ele.html("").append(data);
                return ele;
            }
        },
        outHtml:function(){
            var ele = this;
            var div = $.create("div");
            div.append(ele);
            return div.html();
        },
        param:function(url){
            var str = url||window.location.href,temp = {};
            if(str.indexOf("?")!=-1){
                temp = $.paramToJson(str.split("?")[1].replace(/#/g,""));
            }
            return temp;
        },
        text: function(data) {
            if(!this[0]){
                return undefined;
            }
            if (data || data == "") {
                $.each(this, function() {
                    this.textContent = data;
                });
                return this;
            } else {
                return this[0].textContent;
            }
        },
        attr: function(name, value) {
            if (value != undefined) {
                $.each(this, function() {
                    this.setAttribute(name, value);
                });
                return this;
            } else {
                return this[0]?this[0].getAttribute(name):undefined;
            }
        },
        width: function(data) {
            if(this[0]==window){
                return this[0].innerWidth;
            }
            if(data){
                this[0].style.width = data;
                return this;
            }
            return this[0].offsetWidth;
        },
        height: function(data) {
            if(this[0]==window){
                return this[0].innerHeight;
            }
            if(data){
                this[0].style.height = data;
                return this;
            }
            return this[0].offsetHeight;
        },
        offsetLeft:function(){
            return this[0].offsetLeft;
        },
        offsetTop: function() {
            var ele = this;
            var offsetTop = ele[0].offsetTop;
            function up(p){
                if (p.css("position") == "relative" || p.css("position") == "fixed" || p.css("position") == "absolute") {
                    offsetTop += p[0].offsetTop;
                }
                if(p.parent().length){
                    up(p.parent());
                }
            }
            if(ele.parent().length){
                up(ele.parent());
            }
            return offsetTop;
        },
        hide: function(num,callback) {
            var ele = this;
            var callback = callback||function(){};
            if(num){
                this.ani({
                    prop:{
                        "opacity":"0"
                    },
                    duration:num/1000,

                    end:function(){
                        ele.css({
                            display: "none"
                        });
                        callback.call(ele);
                    }
                });
                return this;
            }
            this.css({
                display: "none"
            });
            return this;
        },
        show: function(num,callback) {
            var ele = this;
            var callback = callback||function(){};
            if(num){
                this.css({
                    "opacity":"0",
                    "display":"block"
                });

                this.ani({
                    prop:{
                        "opacity":"1"
                    },
                    duration:num/1000,

                    end:function(){
                        callback.call(ele);
                    }
                });
                return this;
            }
            this.css({
                "opacity":"1",
                "display":"block"
            });

            return this;
        },
        getLength: function(obj) {
            var num = 0;
            for (var i in obj) {
                num++;
            }
            return num;
        },
        trigger: function(event, param) {
            var element = this[0];
           
            var evt = document.createEvent("Event");
            evt.initEvent(event, true, true);
            for (var i in param) {
                evt[i] = param[i];
            }
            element.dispatchEvent(evt);
            return this;
        },
        cookie:function(name,value){
            if(!name&&!value){
                var arr = document.cookie.split("; ");
                var temp = {};
                for(var i=0;i<arr.length;i++){
                    var thisArr = arr[i].split("=");
                    temp[thisArr[0]] = thisArr[1];
                }
                return temp;
            }
            if(name&&!value){
                var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
                if(arr=document.cookie.match(reg)){
                    return unescape(arr[2]);
                }else{
                    return null;
                }
                return;
            }
            if(name&&value){
                var Days = 30; 
                var exp = new Date(); 
                exp.setTime(exp.getTime() + Days*24*60*60*1000); 
                document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString(); 
                return;
            }
            
        },
        removeCookie:function(name){
            if(name){
                var exp = new Date(); 
                exp.setTime(exp.getTime() - 1); 
                var cval=getCookie(name); 
                if(cval!=null){
                    document.cookie= name + "="+cval+";expires="+exp.toGMTString();
                }
            }else{
                document.cookie = null;
            }
        },
        filter:function(selector){
            var domTemp = [];
            $.each(this,function(){
                var object = $._test("attr",selector);
                if($.validateSelector(this, object)){
                    domTemp.push(this);
                }
            });
            return $.classArray(domTemp);
        },
        template: function(str, json ,listFun,rootFun, unNil) {

            /*
                思路，遍历数据一次一次的替换掉key名
                缺点：不可以存在两个相同key名,由于数据结构存在多级结构，不同级间可能会存在同名情况。
                所以我提出一个理念，“最多二级法则”
                所有的数据结构在表现上最多只有二级，一是为了简化结构，还能加速遍历
                做法是，首先
            */
            function render(str){

                var _eval = function(r){
                    return eval("/{" + r + "}/g");
                };
                
                var res = {
                    futher:/{([a-zA-Z\d]+\.[a-zA-Z\d]+)}/g
                }

                
                var futherFn = function(obj,str){
                    var futherArr = str.match(res.futher);
                    if(futherArr){
                        for(var j=0;j<futherArr.length;j++){
                            var resStr = futherArr[j].replace(/[{}]/g,"");
                            if($.futher(obj,resStr)||$.futher(obj,resStr)==0){
                                str = str.replace(futherArr[j],$.futher(obj,resStr));
                            }
                        }
                    }
                    return str;
                }

                /*
                    拿出数组
                */
                var arrTemp = {};
                var arrArray = str.match(/\[([^\]]+)\][^\[]+\[\/\1\]/g);
                if(arrArray){
                    for(var i=0;i<arrArray.length;i++){
                        arrTemp[i] = arrArray[i];
                        str = str.replace(arrTemp[i],"arrTemp"+i);
                    }
                }
                
                

                /* 
                    复原
                */
                if(arrArray){
                    var arr = str.match(/arrTemp\d/g);
                    for(var i=0;i<arr.length;i++){
                        str = str.replace(arr[i],arrTemp[i]);
                    }
                }

                /*
                    函数处理
                */
                for (var s in rootFun) {
                    str = str.replace(_eval(s), rootFun[s](json));
                }

                str = futherFn(json,str);

                for (var name in json) {

                    if (typeof json[name] == "object") {
                        var indexNum = str.indexOf("[" + name + "]");
                        var lastNum = str.lastIndexOf("[/" + name + "]");
                        var newStr = "";

                        if(indexNum==-1){
                            continue;
                        }

                        var getStr = str.substring(indexNum + 2 + name.length, lastNum);
                        for (var i = 0; i < json[name].length; i++) {
                            var newStrP = getStr;
                            for (var s in listFun) {
                                newStrP = newStrP.replace(_eval(s), listFun[s](json[name][i],i));
                            }

                            if(typeof json[name][i]=="string"){
                                newStrP = newStrP.replace(_eval("value"), json[name][i]);
                            }else{
                                for (var s in json[name][i]) {
                                    newStrP = newStrP.replace(_eval(s), json[name][i][s]);
                                }
                            }
                            newStrP = futherFn(json[name][i],newStrP);
                            newStr += newStrP;
                        }

                        str = str.replace("[" + name + "]" + getStr + "[/" + name + "]", newStr);
                    } else {

                        if (json[name]!=="") {

                            str = str.replace(_eval(name), json[name]);
                        }
                    }
                }
                if(unNil){
                    return str.replace(/\{[a-z.A-Z]+\}/g,"");
                }else{
                    return str;
                }
            }
            if(typeof str=="object"){
                var tpl = String(str.html());
                return str.html(render(tpl));
            }else{
                return render(str);
            }
        },
        
        appendTo: function(data) {
            data.append(this);
            return this;
        },
        append: function(data) {
            self.pend(this, "append", data);
            return this;
        },
        prepend: function(data) {
            self.pend(this, "prepend", data);
            return this;
        },
        before: function(data) {
            self.pend(this, "before", data);
            return this;
        },
        after: function(data) {
            self.pend(this, "after", data);
            return this;
        },
        val: function(data) {
            var arr = [];
            this.each(function() {
                (data || data == "") ? this.value = data : arr.push(this.value);
            });
            return arr.length > 0 ? arr.join("") : this;
        },
        hasClass: function(selector, className) {
            if (typeof className == "undefined") {
                var ele = this;
                className = ele.attr("class");
            }
            var pattern = new RegExp("(^|\\s)" + selector + "(\\s|$)");
            return pattern.test(className);
        },
        addClass:function(data){
            var ele = this;
            var _class;
            $.each(ele,function(){
                _class = this.className;
                var res = eval("/^"+data+"\\s|\\s"+data+"$|\\s"+data+"\\s/");

                if(_class.match(res)){return;}
                _class = _class.split(" ")||[];
                _class.push(data);
                _class = _class.join(" ");
                this.className = _class;
            });
            return ele;
        },
        removeClass: function(data) {
            var ele = this;
            $.each(ele, function() {
                var res = eval("/^"+data+"\\s|\\s"+data+"$|\\s"+data+"\\s/");
                this.className = data?$.trim(this.className.replace(res," ")):"";
            });
            return ele;
        },
        removeAttr: function(data) {
            var ele = this;
            $.each(ele, function() {
                this.removeAttribute(data);
            });
            return ele;
        },
        remove: function() {
            var ele = this;
            var div = $.create("div");
            $.each(ele, function() {
                if (this && this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            });
            delete ele;
        },
        clone: function(bl) {
            var ele = this;
            var newEle = ele.get().cloneNode(true)
            if (bl) {
                if (ele.get().eventCall) {
                    var i, arr = ele.get().eventCall,
                        len = arr.length;
                    for (i = 0; i < len; i++) {
                        newEle.on(arr[i].type, arr[i].fn);
                    }
                }
            }
            return $(newEle);
        },
        eq: function(i) {
            var ele = this,
                i = i || 0;
            return i >= 0 ? $(ele[i]) : $(ele[$(ele).length + i]);
        },
        inArray: function(a, arr) {
            if (a.Dmimi) {
                arr = arr[0];
                a = a[0][0];
            }            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == a) {
                    return i;
                }
            }
            return -1;
        },
        each: function(obj, callback) {
            if (typeof obj == "function") {
                callback = obj;
                obj = this;
            }
            if (!obj || obj.length == 0) {
                return;
            }
            var len = obj.length,
                i;
            for (i = 0; i < len; i++) {
                if (callback.apply(obj[i], [i, obj[i]]) != undefined) {
                    break;
                }
            }
            return obj;
        },

        not: function(selector) {
            var ele = this;
            var object = $._test("attr", selector);
            var num = [];
            $.each(ele, function(index, dom) {
                if ($.validateSelector(this, object)) {
                    num.push(index);
                }
            });
            for (var i = 0; i < num.length; i++) {
                ele.splice(num[i], 1);
            }
            return ele;
        },
        date: function(date, f) {
            if(date=="刚刚"){
                return date;
            }
            if (typeof date != "object") {
                if(!String(date).match(/\d*/)){
                    f = date;
                    console.log(f);
                    date = new Date();
                }else{
                    date = new Date(Number(date));
                }
            }
            f = f || "yyyy-MM-dd hh:mm:ss";
            if(f=="human"){
                var d1 = +new Date(date);
                var d2 = +new Date();
                if(d1<d2){
                    f = "MM-dd";
                }else if(d1==d2){
                    f = "昨天";
                }
                else{
                    f = "hh:mm";
                }
            }
            var o = {
                "M+": date.getMonth() + 1,
                "d+": date.getDate(),
                "h+": date.getHours(),
                "m+": date.getMinutes(),
                "s+": date.getSeconds(),
                "q+": Math.floor((date.getMonth() + 3) / 3),
                "S": date.getMilliseconds()
            };
            if (/(y+)/.test(f)) f = f.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
            if (new RegExp("(" + k + ")").test(f)) f = f.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            return f;
        },
        ua: function() {
            return window.navigator.userAgent.toLowerCase();
        },
        os: function(){
            return function(n, l) {
                var q = /\s*([\-\w ]+)[\s\/\:]([\d_]+\b(?:[\-\._\/]\w+)*)/,
                    r = /([\w\-\.]+[\s\/][v]?[\d_]+\b(?:[\-\._\/]\w+)*)/g,
                    s = /\b(?:(blackberry\w*|bb10)|(rim tablet os))(?:\/(\d+\.\d+(?:\.\w+)*))?/,
                    t = /\bsilk-accelerated=true\b/,
                    u = /\bfluidapp\b/,
                    v = /(\bwindows\b|\bmacintosh\b|\blinux\b|\bunix\b)/,
                    w = /(\bandroid\b|\bipad\b|\bipod\b|\bwindows phone\b|\bwpdesktop\b|\bxblwp7\b|\bzunewp7\b|\bwindows ce\b|\bblackberry\w*|\bbb10\b|\brim tablet os\b|\bmeego|\bwebos\b|\bpalm|\bsymbian|\bj2me\b|\bdocomo\b|\bpda\b|\bchtml\b|\bmidp\b|\bcldc\b|\w*?mobile\w*?|\w*?phone\w*?)/,
                    x = /(\bxbox\b|\bplaystation\b|\bnintendo\s+\w+)/,
                    k = {
                        parse: function(b) {
                            var a = {};
                            b = ("" + b).toLowerCase();
                            if (!b) return a;
                            for (var c, e, g = b.split(/[()]/), f = 0, k = g.length; f < k; f++) if (f % 2) {
                                var m = g[f].split(";");
                                c = 0;
                                for (e = m.length; c < e; c++) if (q.exec(m[c])) {
                                    var h = RegExp.$1.split(" ").join("_"),
                                        l = RegExp.$2;
                                    if (!a[h] || parseFloat(a[h]) < parseFloat(l)) a[h] = l
                                }
                            } else if (m = g[f].match(r)) for (c = 0, e = m.length; c < e; c++) h = m[c].split(/[\/\s]+/), h.length && "mozilla" !== h[0] && (a[h[0].split(" ").join("_")] = h.slice(1).join("-"));
                            w.exec(b) ? (a.mobile = RegExp.$1, s.exec(b) && (delete a[a.mobile], a.blackberry = a.version || RegExp.$3 || RegExp.$2 || RegExp.$1, RegExp.$1 ? a.mobile = "blackberry" : "0.0.1" === a.version && (a.blackberry = "7.1.0.0"))) : v.exec(b) ? a.desktop = RegExp.$1 : x.exec(b) && (a.game = RegExp.$1, c = a.game.split(" ").join("_"), a.version && !a[c] && (a[c] = a.version));
                            a.intel_mac_os_x ? (a.mac_os_x = a.intel_mac_os_x.split("_").join("."), delete a.intel_mac_os_x) : a.cpu_iphone_os ? (a.ios = a.cpu_iphone_os.split("_").join("."), delete a.cpu_iphone_os) : a.cpu_os ? (a.ios = a.cpu_os.split("_").join("."), delete a.cpu_os) : "iphone" !== a.mobile || a.ios || (a.ios = "1");
                            a.opera && a.version ? (a.opera = a.version, delete a.blackberry) : t.exec(b) ? a.silk_accelerated = !0 : u.exec(b) && (a.fluidapp = a.version);
                            if (a.applewebkit) a.webkit = a.applewebkit, delete a.applewebkit, a.opr && (a.opera = a.opr, delete a.opr, delete a.chrome), a.safari && (a.chrome || a.crios || a.opera || a.silk || a.fluidapp || a.phantomjs || a.mobile && !a.ios ? delete a.safari : a.safari = a.version && !a.rim_tablet_os ? a.version : {
                                419: "2.0.4",
                                417: "2.0.3",
                                416: "2.0.2",
                                412: "2.0",
                                312: "1.3",
                                125: "1.2",
                                85: "1.0"
                            }[parseInt(a.safari, 10)] || a.safari);
                            else if (a.msie || a.trident) if (a.opera || (a.ie = a.msie || a.rv), delete a.msie, a.windows_phone_os) a.windows_phone = a.windows_phone_os, delete a.windows_phone_os;
                            else {
                                if ("wpdesktop" === a.mobile || "xblwp7" === a.mobile || "zunewp7" === a.mobile) a.mobile = "windows desktop", a.windows_phone = 9 > +a.ie ? "7.0" : 10 > +a.ie ? "7.5" : "8.0", delete a.windows_nt
                            } else if (a.gecko || a.firefox) a.gecko = a.rv;
                            a.rv && delete a.rv;
                            a.version && delete a.version;
                            return a
                        }
                    };
                return k.parse(l);
            }(document.documentElement, navigator.userAgent)
        },
        futher: function(ele, str) {
            var arr = str.split("."),
                len = arr.length,
                i = 0,
                obj = ele;

            function fn(ele) {
                if (i < len) {
                    if(ele[arr[i]]||ele[arr[i]]==0){
                        obj = ele[arr[i]];
                        i++;
                        fn(obj);
                    }else{
                        obj = false;
                    }
                }
            }
            fn(ele);
            return obj;
        },
        ready:function(callback) {
            if (document.readyState.match(/complete|loaded|interactive/)) {
                return callback();
            } else {
                document.addEventListener("DOMContentLoaded", callback, false);
            }
        },
        init: function() {
            self = this;
            self.pend = function(dom, pend, data) {
                var fun, temp, bool, obj1, obj2, type;
                if (!data) {
                    return false;
                }
                if (typeof data == "string" || typeof data == "number") {
                    //bool = new RegExp(/^</).test(String(data));
                    var frag = document.createDocumentFragment();
                    fun = function(obj, type, child, type2) {
                        if (bool) {
                            temp = $.createElement(data);
                            frag.appendChild(temp);
                        } else {
                            temp = document.createTextNode(data);
                            frag.appendChild(temp);
                        }
                        switch (type2) {
                        case "append":
                          
                            obj.appendChild(frag);
                            break;
                        case "prepend":
                            obj.insertBefore(frag, obj.firstChild);
                            break;
                        case "after":
                            obj[type](temp, child);
                            break;
                        case "before":
                            obj[type](temp, child);
                            break;
                        }
                    };
                } else {
                    if (data.Dmimi) {
                        
                        fun = function(dom, type, child) {
                            for (var j = 0; data[j]; j++) {
                                if (data[j]) {
                                    dom[type](data[j], child);
                                }
                            }
                        };
                    } else {
                        fun = function(dom, type, child) {
                            dom[type](data, child);
                        };
                    }
                }
                for (var i = 0; dom[i]; i++) {
                    switch (pend) {
                    case "append":
                        obj1 = dom[i];
                        obj2 = dom[i].firstChild;
                        type = "appendChild";
                        break;
                    case "prepend":
                        obj1 = dom[i];
                        obj2 = dom[i].firstChild;
                        type = "insertBefore";
                        break;
                    case "before":
                        obj1 = dom[i].parentNode;
                        obj2 = dom[i];
                        type = "insertBefore";
                        break;
                    case "after":
                        obj1 = dom[i].parentNode;
                        obj2 = dom[i].nextSibling;
                        type = "insertBefore";
                        break;
                    }
                    fun(obj1, type, obj2, pend);
                }
            }
            return this;
        }
    }).init();
});
DMIMI.plugin("selector", function($) {
    return ({
        find: function(selector) {
            var ele = this;
            var domTemp = [];
            if (selector) {
                $.each(ele, function() {
                    domTemp = domTemp.concat($._selector(selector, this, "find"));
                });
                if(domTemp.length){
                    return $.classArray(domTemp);
                }
            }
            return $.classArray([]);
        },
        contains:function(target){
            var ele = this;
            var bool = false;
            $.each(ele,function(){
                if(this.contains(target)){
                    bool = true;
                    return true;
                }
            });
            return bool;
        },
        closest:function(selector){
            var dom;
            if(!selector){
                return this.parent()[0];
            }
            var object = $._test("attr", selector);
            (function search(d){
                if(!$.validateSelector(d[0],object)){
                    if(d.parent()[0]){
                        search(d.parent());
                    }
                }else{
                    dom = d;
                }
            })(this);
            return dom;

        },
        init: function() {
            var self = this;
            ({
                attrs: {
                    parent: ["parentNode", 1],
                    next: ["nextSibling", 1],
                    prev: ["previousSibling", 1],
                    nextAll: ["nextSibling", 2],
                    prevAll: ["previousSibling", 2],
                    siblings: ["nextSibling", 3, "parentNode.firstChild"],
                    children: ["nextSibling", 3, "firstChild"]
                },
                recursion: function(dom, dir) {
                    var _Selector = this;
                    var arr = [];
                    void
                    function rec(dom) {
                        if (dom[dir]) {
                            if (_Selector.verify.call(dom[dir])) {
                                arr = dom[dir];
                            } else {
                                rec(dom[dir]);
                            }
                        }
                    }(dom);
                    return arr;
                },
                foreach: function(dom, dir, elem) {
                    var _Selector = this;
                    var arr = [];
                    for (; dom; dom = dom[dir]) {
                        if (_Selector.verify.call(dom) && dom !== elem) {
                            arr.push(dom);
                        }
                    }
                    return arr;
                },
                setSelector: function(method, arr) {
                    var _Selector = this;
                    self[method] = function(selector) {
                        _Selector.verify = selector ?
                        function() {
                            var object = $._test("attr", selector);
                            return this.nodeType === 1 && $.validateSelector(this, object);
                        } : function() {
                            return this.nodeType === 1;
                        };
                        return $.classArray(self[method].dir.call(this, arr));
                    }
                    self[method].dir = (function() {
                        switch (arr[1]) {
                        case 1:
                            return function(arr) {
                                var domTemp = [];
                                $.each(this, function() {
                                    domTemp = domTemp.concat(_Selector.recursion.apply(_Selector, [this, arr[0], this]));
                                });
                                return domTemp;
                            };
                            break;
                        case 2:
                            return function(arr) {
                                var domTemp = [];
                                $.each(this, function() {
                                    domTemp = domTemp.concat(_Selector.foreach.apply(_Selector, [this, arr[0], this]));
                                });
                                return domTemp;
                            };
                            break;
                        case 3:
                            return function(arr) {
                                var domTemp = [];
                                $.each(this, function() {
                                    domTemp = domTemp.concat(_Selector.foreach.apply(_Selector, [$.futher(this, arr[2]), arr[0], this]));
                                });
                                return domTemp;
                            };
                            break;
                        }
                    })();
                },
                init: function() {
                    var arr;
                    for (var name in this.attrs) {
                        this.setSelector(name, this.attrs[name]);
                    }
                }
            }).init();
            return this;
        }
    }).init();
});
DMIMI.plugin("event", function($) {
    return ({
        on: function(type, selector, callback) {
            if(selector && typeof selector!="function"){
                this.delegate(selector,type,callback);
                return this;
            }else{
                callback = selector;
            }
            callback = callback || function() {};
            $.each(this, function() {
                var dom = this;
                dom.events = dom.events || {};
                dom.addEventListener(type, callback);
                dom.events[type] = dom.events[type]||[];
                dom.events[type].push(callback);
                /*
                 ({
                    type: type,
                    fn: callback
                });
                */
            });
            return this;
        },
        off: function(type, selector, callback) {
            var ele = this;

            if(selector && typeof selector!="function"){
                this.delegate(selector,type,callback);
                return this;
            }else{
                callback = selector;
            }

            function removeEvent(dom, ev, type, callback) {
                if (callback) {
                    dom[ev](type, callback);
                } else {
                    if (dom.events) {
                        delete dom.events[type];
                    }
                    dom[ev][type] = null;
                }
            }
            ele.each(function() {
                removeEvent(this, "removeEventListener", type, callback)
            });
            return ele;
        },
        delegate: function(selector, type, callback) {
            var ele = this;
            ele.on(type, function(e) {
                var dom = ele.find(selector);
                var target = e.target;

                $.each(dom, function() {
                    
                    if (target == this || this.contains(target)) {
                        callback.call(this,e);
                        return;
                    }
                });
            });
            return ele;
        },
        init: function() {
            var self = this;
            return this;
        }
    }).init();
});
DMIMI.plugin("net", function($) {
    return ({
        
        paramToJson:function(str){
            var arr = str.split("&"),arr2 = [],temp = {},i;
            for(i=0;i<arr.length;i++){
                arr2 = arr[i].split("=");
                temp[arr2[0]]=arr2[1];
            }
            return temp;
        },
        jsonToParam:function(json){
            var str = "";
            for(var i in json){
                str+=i+"="+json[i]+"&";
            }
            str = str.substr(0,str.length-1);
            return str;
        },
        ajax: function(options) {

            $.ajaxNum?$.ajaxNum++:$.ajaxNum = 1;
            var opts = {
                url:"aboutblank",
                type:"post",
                dataType: "json",
                timeout:0,
                success: function() {},
                error:function(){},
                complete:function(){}
            };


            var opt = $.extend(opts,options);
            var callbackName,callbackParamName = "callback",symbol,paramCallback,xmlhttp, script,link, head = $("head");


            if(opt.dataType == "jsonp"){

                callbackName = "jsonpcallback"+$.ajaxNum;
                if(opt.jsonp){
                    callbackParamName = opt.jsonp;
                }
                window[callbackName] = function(res){
                    $(script).remove();
                    delete window[callbackName];
                    return opt.success(res);
                }
                
                var randomTime = +new Date();
                symbol = opt.url.indexOf("?")!=-1?"&":"?";
                opt.url = opt.url+symbol+"_dt="+randomTime;
                symbol = opt.url.indexOf("?")!=-1?"&":"?";
                paramCallback = symbol+callbackParamName+"=jsonpcallback"+$.ajaxNum;
                if(opt.data){
                    opt.url +="&"+$.jsonToParam(opt.data);
                }


                script = $.create("script",{type:"text/javascript",src:opt.url+paramCallback});
                
                head.append(script);
                return false;
            }
            if(opt.dataType=="js"){
                script = $.create("script",{type:"text/javascript",src:opt.url});
                script[0].onload = function(){
                    //$(script).remove();
                    return opt.success();
                };    
                head.append(script);
                return false;
            }
            if(opt.dataType=="css"){
                link = $.create("link",{rel:"stylesheet",href:opt.url});
                head.append(link);
                return false;
            }


            if(opt.type.match(/post|get/)){
                var xhr =  new XMLHttpRequest();
                xhr.open(opt.type.toUpperCase(), opt.url, true);  
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                if(opt.beforeSend){
                    opt.beforeSend(xhr);
                }
                xhr.send(opt.data?$.jsonToParam(opt.data):null);

                if(opt.timeout){
                    setTimeout(function(){
                        opt.timeoutBoolen = true;
                        opt.error({responseText:"timeout",status:"001"});

                    },opt.timeout*1000);
                }
                xhr.onreadystatechange = function(){  
                    if(opt.timeoutBoolen) return;
                    //alert(xhr.readyState);  
                    if (xhr.readyState == 4){ // 代表读取服务器的响应数据完成  
                        
                        var res = xhr.responseText || '{"responseText":"","status":"'+xhr.status+'"}';
                        opt.complete();
                        console.log(1423);
                        if (xhr.status == 200){ // 代表服务器响应正常  
                            if(opt.dataType=="json" && res){
                                try{

                                    res = JSON.parse(xhr.responseText);
                                }
                                catch(e){
                                    console.log(123);
                                    opt.error({responseText:"can not parse responseText",status:xhr.status,res:xhr.responseText});
                                    return;
                                }
                            }
                            opt.success(res,xhr.status);
                        }else{
                            opt.error({responseText:xhr.responseText,status:xhr.status});
                        }
                    }  
                };  
            }
            return xhr;
        },
        init: function() {
            return this;
        }
    }).init();
});

DMIMI.plugin("packet", function($) {
    return ({
        styleRule:function(){
            return {
                add:function(key,value){ 
                    var css = document.styleSheets[document.styleSheets.length-1]; 
                    css.cssRules ? 
                    (css.insertRule(key+"{"+value+"}", css.cssRules.length)) : 
                    (css.addRule(key,value)) ; 
                },
                remove:function(key){ 
                    for(var i = 0; i < document.styleSheets.length; i++){ 
                        var css = document.styleSheets[i]; 
                        css.cssRules ? 
                            (function(){ 
                                for(var j = 0; j < css.cssRules.length; j++){ 
                                    if(css.cssRules[j].selectorText==key){ 
                                        css.deleteRule(j); 
                                    }   
                                } 
                            })() : (css.removeRule(key)) ; 
                    } 
                }
            }
        },
        debug: function(options) {
            var options = options||{};
            if($.os().desktop) return;
            if($("#debug-wrap")[0]) return;

            var _class = {
                init:function(){
                    _class.view.main();
                    if(options.livereload){
                        _class.tool.checkUpdate();
                    }
                },
                tool:{
                    checkUpdate:function(){
                        $.ajax({
                            url:options.livereload,
                            dataType:"js",
                            success:function(res,status){
                                if(window.edition&&window.edition!=$.param().edition){
                                   _class.tool.reload(window.edition);
                                }else{
                                    setTimeout(function(){
                                        _class.tool.checkUpdate();
                                    },5000);
                                }
                            }
                        });
                    },
                    reload:function(edition){
                        var href = window.location.href;
                        if($.param().randomTime){
                            href = href.replace(/&randomTime=[\d]*/g,"");
                            href = href.replace(/\?randomTime=[\d]*/g,"");
                        }
                        if($.param().edition){
                            href = href.replace(/&edition=[\d]*/g,"");
                        }
                        var symbol = href.indexOf("?")!=-1?"&":"?";

                        href = href+symbol+"randomTime="+(+new Date());
                        href = href+"&edition="+(window.edition||1);
                        
                        window.location.href = href;
                    }
                },
                view:{
                    main:function(){
                        _class.view.wrap();
                        _class.view.control();
                        _class.view.content();
                        _class.boxWrap.append(_class.boxContent);
                        $("body").append(_class.boxWrap);
                        $("body").append(_class.btn);
                    },
                    wrap:function(){
                        _class.boxWrap = $("<div id='debug-wrap'></div>");
                        _class.boxWrap.css({
                            "position":"fixed",
                            "bottom":"0px",
                            "left":"0px",
                            "right":"0px",
                            "height":window.screen.height*0.2+"px",
                            "z-index":"9999",
                            "overflow":"auto",
                            "background":"rgba(0,0,0,0.7)",
                            "color":"#fff",
                            "padding":"5px",
                            "display":"none",
                            "-webkit-overflow-scrolling":"touch"
                        });

                        if(options.refresh){
                            _class.refresh = $("<div class='debug-refresh'>刷新</div>");
                            _class.refresh.css({
                                  position:" absolute",
                                  bottom: "5px",
                                  right: "0px",
                                  width: "40px",
                                  height: "25px",
                                  "text-align": "center"
                            }).on("click",function(){
                                _class.tool.reload();
                            });
                            _class.boxWrap.append(_class.refresh);
                        }
                        // ???
                        _class.boxWrap.on("touchmove",function(e){
                            e.stopPropagation();
                        });
                    },
                    control:function(){
                        _class.btn = $("<div id='debug-btn'>◕‿◕</div>");
                        _class.btn.css({
                            "position":"fixed",
                            "bottom":"0px",
                            "right":"0px",
                            "width":"30px",
                            "height":"30px",
                            "z-index":"9999",
                            "background":"rgba(0,0,0,0.3)",
                            "color":"#fff",
                            "line-height":"30px",
                            "text-align":"center",
                            "border-radius":"999px",
                            "font-size":"12px"
                        }).on("click",function(){
                            if(_class.boxWrap.css("display")!="none"){
                                _class.boxWrap.hide();
                                $(this).css({
                                    "bottom":"0px"
                                });
                            }else{
                                _class.boxWrap.show();
                                $(this).css({
                                    "bottom":_class.boxWrap.height()+"px"
                                });
                            }
                        })
                    },
                    content:function(){
                        _class.boxContent = $("<div id='debug-box-content'></div>");
                    }
                },
                event:{
                    append:function(param){
                        var div = $("<div>"+param+"</div>");
                        _class.boxContent.prepend(div);
                    }
                }
            }
            _class.init();

            window.console = {
                log:function(){
                    for(var i=0;i<arguments.length;i++){
                        // 如果是json
                        var obj = arguments[i];
                        if(typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length){
                            obj = JSON.stringify(obj);
                        }
                        _class.event.append(obj);
                    }
                },
                warn:function(){
                    for(var i=0;i<arguments.length;i++){
                        // 如果是json
                        var obj = arguments[i];
                        if(typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length){
                            obj = JSON.stringify(obj);
                        }
                        _class.event.append("warn: "+obj);
                    }
                }
            }
            return this;
        },
        handou:function(){

            function HANDOU(ele){
                this._nodes = [];
                this.ele = ele;
                this.init();
            };

            HANDOU.prototype.init = function(){
                this._nodes.push(this.ele);
                this.ele = this.ele[0];
                if(this.ele&&!this.ele.events){
                    this.ele.events = {};
                }
                return this.export;
            };

            HANDOU.prototype._hasTarget = function(target,type){
                if(this._nodes.length>0){
                    for(var i=0;i<this._nodes.length;i++){
                        if(this._nodes[i].contains(target)&&this._nodes[i][0].events[type]){
                            return this._nodes[i][0];
                        }
                    }
                    return false;
                }else{
                    return false;
                }
            };


            HANDOU.prototype.off = function(type){
                delete this.ele.events[type];
                return this;
            };

            HANDOU.prototype.on = function(type,start,move,end){
                var self = this;

                if(!this.ele) return self;
                this.ele.events[type] = [start||function(){},move||function(){},end||function(){}];
                if(this["_"+type+"enable"]) return self;

                var touchNum,touchFn;

                switch(type){
                    case "drag":
                        touchNum = 1;
                        touchFn = function(e){
                            return [e,e.targetTouches[0].clientX,e.targetTouches[0].clientY];
                        }
                    break;
                    case "pinch":
                        touchNum = 2;
                        touchFn = function(e){
                            return [e,e.targetTouches[0].clientX,e.targetTouches[1].clientX,e.targetTouches[0].clientY,e.targetTouches[1].clientY];
                        }
                    break;
                }
                
                
                $(document).on("touchstart",function(e){
                    
                    var ele = self._hasTarget(e.target,type);
                    if(ele){
                        //$("#info_end").html(touchNum);
                        if(touchNum != e.targetTouches.length) return;
                        if(!ele.events[type]) return;
                        self._nowTouchType = type;
                        ele.events[type][0].apply(ele,touchFn(e));
                        //e.preventDefault();
                    }
                });

                $(document).on("touchmove",function(e){
                    
                    var ele = self._hasTarget(e.target,type);
                    if(ele){
                        if(touchNum != e.targetTouches.length) return;
                        if(!ele.events[type]) return;
                        if(self._nowTouchType != type) return;
                        ele.events[type][1].apply(ele,touchFn(e));
                        //e.preventDefault();
                        //e.stopPropagation();
                    }
                   
                });
    
                // pinch end 只触发pinch end
                $(document).on("touchend",function(e){
                    var ele = self._hasTarget(e.target,type);
                    if(ele){
                        if(!ele.events[type]) return;

                        ele.events[type][2].call(ele,e);
                        //e.preventDefault();
                    }
                });

                self["_"+type+"enable"] = true;

                return self;
            };
            
            return new HANDOU(this);
            
        },
        animation:function(options){
            var self = this;
            $.animationNum = $.animationNum?($.animationNum+1):1;

            console.log($.animationNum);
            var frame = options.frame,
                        duration = options.duration || 0.3,
                        timing = options.timing || "linear",
                        delay = options.delay||0,
                        count = options.count || 1,
                        end = options.end || function() {},
                        name = "dmimi-animation"+ $.animationNum;

            if($(this).hasClass(name)){
                $(this).removeClass(name);
            }


            $(this).removeClass("dmimi-animation"+($.animationNum-1))

            $.styleRule().add("."+name,"-webkit-animation: "+name+"KeyFrame "+duration+"s "+timing+" "+delay+"s"+" "+count);
            $.styleRule().add("@-webkit-keyframes "+name+"KeyFrame",frame);
            
            $(self).addClass(name);
            $(self).on("webkitAnimationEnd",end);


        },
        aniQueueClass:function(){
            var RAF = window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    function(callback) {
                        setTimeout(callback, 1000 / 60);
                    };
            var _exports = {
                martix:function(transform){
                    var transformArr = transform.replace(/[matrix()\s]/g, "").split(",");
                    var rotateC = Math.round(Math.acos(transformArr[0]) * 180 / Math.PI);
                    var rotateS = Math.round(Math.asin(transformArr[1]) * 180 / Math.PI);
                    var rotate_C = Math.round(Math.acos(transformArr[2]) * 180 / Math.PI);
                    var rotate_S = Math.round(Math.asin(transformArr[3]) * 180 / Math.PI);
                    rotate = rotateC;
                    if (rotateS < 0) {
                        rotate = 180 - rotateS;
                    }
                    if (rotateC < 90 && rotateS > -90 && rotate_C > 0 && rotate_C < 90 && rotate_S > 0) {
                        rotate = 270 + rotate_C;
                    }
                    var translateX = transformArr[4];
                    var translateY = transformArr[5];
                    var transformStyle = "";
                    // 设置scale
                    if (Math.abs(transformArr[0]) != 1 || Math.abs(transformArr[3]) != 1) {
                        if (Math.abs(transformArr[0]) == Math.abs(transformArr[3])) {
                            transformStyle = " scale(" + transformArr[0] + ")";
                        } else {
                            transformStyle = " scale(" + transformArr[0] + "," + transformArr[3] + ")";
                        }
                    }
                    if (rotate) {
                        transformStyle += " rotate(" + rotate + "deg)";
                    }
                    if (Number(translateX)) {
                        transformStyle += " translateX(" + translateX + "px)";
                    }
                    if (Number(translateY)) {
                        transformStyle += " translateY(" + translateY + "px)";
                    }

                    return {
                        translateX:Number(transformArr[4]),
                        translateY:Number(transformArr[5]),
                        scale:Number(rotate),
                        transformStyle:transformStyle
                    }
                },
                _aniData: function(name, value) {
                    if (name && !value) {
                        return this[0][name];
                    }
                    for (var i = 0; i < this.length; i++) {
                        this[i][name] = value;
                    }
                    return this;
                },
                aniContinue: function() {
                    var self = this;
                    /*
                        动画的暂停，android系统下同时计算多个会有bug，具体原因还未能知。
                        想继续动画的时候，必须要重绘这个dom节点否则无法继续执行。原因只能怀疑transition动画已被缓存。
                        由于重绘，当执行多个dom且其中存在嵌套关系，那么只会执行最外层dom动画
                    */
                    var i = 0,
                        len = self.length;
                    // 如果不是暂停状态，不需要继续 
                    if (!self._aniData("paused")) {
                        return self;
                    }
                    // 去掉暂停状态
                    self._aniData("paused", false);
                    for (; i < len; i++) {
                        var ele = $(self[i]);
                        var transform = ele._aniData("transform");
                        // 将动画数据拷贝过来。
                        var options = $.extend({}, ele._aniData("anistyle"));
                        // 重新赋值上
                        ele.css({
                            "-webkit-transform": transform
                        });
                        ele.css("-webkit-transform");
                        var aniStarTime = options.aniStarTime;
                        var aniPausedTime = options.aniPausedTime;
                        options.duration = options.duration - (aniPausedTime - aniStarTime) / 1000;
                        if (options.delay) {
                            options.duration = options.duration + options.delay;
                        }
                        ele.ani(options);
                    }
                    return this;
                },
                aniPause: function() {
                    var self = this;
                    /*
                        动画的暂停，android系统下同时计算多个会有bug，具体原因还未能知。
                    */
                    var i = 0,
                        len = self.length;
                    for (; i < len; i++) {
                        var transform = $(self[i]).transform("transformStyle");
                        self._aniData("anistyle").aniPausedTime = +new Date();
                        $(self[i]).css({
                            "-webkit-transition": "none",
                            "-webkit-transform": transform
                        })._aniData("transform", transform)._aniData("paused", true);
                    }
                    return this;
                },
                aniStop: function() {
                    this._aniData("aniStop", true);
                    this.css({
                        "-webkit-transition": "none",
                        "transition": "none",
                        "-webkit-transform": "none"
                    });
                    this.css("-webkit-transform");
                    this.removeAttr('animation');
                    this.off("webkitTransitionEnd");
                    return this;
                },
                aniQueue: function(options) {
                    var self = this,
                        i = 0,
                        len = 0,
                        list = options.list,
                        count = options.count,
                        delay = options.delay || 0,
                        end = options.end || function() {};
                    self._aniData("aniQueue", true);
                    self._aniData("aniQueueList", list);
                    function setAni(i) {
                        list[i].end = function() {
                            i++;
                            /*
                                这里是为了当需要动态添加动画队列的时候
                            */
                            list = self._aniData("aniQueueList");
                            len = list.length;
                            /* end */
                            if (i < len) {
                                setAni(i);
                            } else {
                                if (count == "infinite") {
                                    setTimeout(function() {
                                        setAni(0);
                                    }, delay * 1000);
                                } else {
                                    count--;
                                    if (count > 0) {
                                        setTimeout(function() {
                                            setAni(0);
                                        }, delay * 1000);
                                    } else {
                                        if (end) {
                                            end.call(self);
                                        }
                                    }
                                }
                            }
                        }
                        self.ani(list[i]);
                    }
                    setAni(i);
                    return this;
                },
                ani: function(options) {
                    var self = this,
                        propNum = 0,
                        endNum = 0;
                    var prop = options.prop,
                        duration = options.duration || 0.3,
                        timing = options.timing || "linear",
                        delay = options.delay,
                        count = options.count || 1,
                        end = options.end || function() {};
                    options.aniStarTime = +new Date();
                    if (!self[0]) {
                        return self;
                    }
                    var len = this.length;
                    /*
                        储存动画数据
                    */
                    if (!self._aniData("aniDefault")) {
                        self._aniData("aniDefault", options);
                    }
                    self._aniData("anistyle", options);
                    
                    function setAni(i) {
                        var ele = $(self[i]);
                        ele.css({
                            "-webkit-transition": "all " + duration + "s " + timing
                        });
                        RAF(function() {
                            for (var i in prop) {
                                if (ele[0].style[i] != prop[i]) {
                                    //$("#layer_box").append($("<p>"+i+":"+prop[i]+"</p>"));
                                    propNum++;
                                    ele[0].style[i] = prop[i];
                                }
                            }
                            ele.attr('animation', "true");
                        });

                        ele.off("webkitTransitionEnd").on("webkitTransitionEnd", function() {
                            // 每个属性发生改变都会触发一次
                            endNum++;
                            if (propNum == endNum) {
                                ele.css({
                                    "-webkit-transition": "none",
                                    "transition": "none"
                                });
                                ele.removeAttr('animation');
                                if (self._aniData("aniQueue")) {
                                    end.call(self);
                                    return;
                                }
                                if (count == "infinite") {
                                    ele.aniStop().ani(self._aniData("aniDefault"));
                                } else {
                                    count--;
                                    if (count > 0) {
                                        self._aniData("aniDefault").count = count;
                                        ele.aniStop().ani(self._aniData("aniDefault"));
                                    }
                                }
                                if (end) {
                                    end.call(self);
                                }
                            }
                        });
                        i++;
                        if (i < len) {
                            setAni(i);
                        }
                    }
                    if (delay) {
                        setTimeout(function() {
                            setAni(0);
                        }, delay * 1000);
                    } else {
                        RAF(function() {
                            setAni(0);
                        });
                    }
                    return this;
                }
            };
            for (var i in _exports) {
                $[i] = _exports[i];
            }
        },
        init: function() {
            var self = this;
            this.handou();
            this.aniQueueClass();
            return this;
        }
    }).init();
});


//@setting UTF-8
/*
    @name dmimi-mobile.js 
    @version v1.1
    @by Dmimi.js

    Copyright (c) 2013,linchangyuan 
    developer more intimate more intelligent  
    
    “ 赞助作者 https://me.alipay.com/linchangyuan ”

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
        
        2014-5-12 v1.0
        1.$.ani 动画函数，(css3)支持GPU硬件加速

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
                selector = document.body;
            }
            return $.classArray([selector]);
        }
        if (String(selector).match(/^</)) {
            return $.create("div",{},selector).children();
        }
        return $.classArray(doc.querySelectorAll(selector));
    };
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
})(DMIMI);;

DMIMI.plugin("tool", function($) {
    var self;
    return ({
        get: function(i) {
            i = i || 0;
            return i >= 0 ? this[i] : this[this.length + i];
        },
        index: function() {
            return this.prevAll().size();
        },
        size: function() {
            return this.length;
        },
        hidden:function(ele){
            if(ele[0].offsetWidth == 0  || ele.css("display")=="none"){
                return true;
            }
        },
        css:function(prop){
            if(typeof prop=="string"){
                return getComputedStyle(this[0])[prop];
            }
            $.each(this,function(){
                for(var i in prop){
                    if(i.match(/width|height/)){
                        if(String(prop[i]).indexOf("px")==-1&&!String(prop[i]).match(/auto|100%/)){
                            prop[i] = prop[i]+"px";
                        }
                    }
                    this.style[i] = prop[i];
                }
            });
            return this;
        },
        trim: function(data) {
            return data.replace(/^\s*|\s*$/g, "");
        },
        html: function(data) {
            var ele = this;
            if (typeof data == "string" || typeof data == "number") {
                $.each(ele, function(index, dom) {
                    this.innerHTML = data;
                });
                return ele;
            }
            if (typeof data == "boolean") {
                var temp = $("<div></div>");
                temp.append(ele);
                return temp.html();
            }
            if (typeof data == "undefined") {
                var arr = [];
                $.each(ele, function() {
                    arr.push(this.innerHTML);
                });
                return arr.length == 1 ? arr.join("") : arr;
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
        text: function(data) {
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
                return this[0].getAttribute(name);
            }
        },
        width: function(data) {
            if(data){
                this[0].style.width = data;
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
        hide: function(num) {
            var ele = this;
            this.css({
                display: "none"
            });
            return this;
        },
        show: function(num) {
            var ele = this;
            if(num){
                this.css({
                    "-webkit-transition":"opacity "+num/1000+"s",
                    "opacity":"0.8",
                    "display":"block"
                });
                setTimeout(function(){
                    ele.css({
                        "opacity":1
                    });
                },1);
                setTimeout(function(){
                    ele.css({
                        "-webkit-transition":"none"
                    });
                },num+1000);
            }else{
                this.css({
                    display: "block",
                    "opacity":"1"
                });
            }
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
        template: function(str, json ,listFun,rootFun) {

            /*
                思路，遍历数据一次一次的替换掉key名
                缺点：不可以存在两个相同key名,由于数据结构存在多级结构，不同级间可能会存在同名情况。
                所以我提出一个理念，“最多二级法则”
                所有的数据结构在表现上最多只有二级，一是为了简化结构，还能加速遍历
                做法是，首先
            */


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
                        str = str.replace(futherArr[j],$.futher(obj,resStr)||"");
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
            
            str = futherFn(json,str);

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
                        for (var s in json[name][i]) {
                            newStrP = newStrP.replace(_eval(s), json[name][i][s]);
                        }
                        newStrP = futherFn(json[name][i],newStrP);
                        newStr += newStrP;
                    }
                    str = str.replace("[" + name + "]" + getStr + "[/" + name + "]", newStr);
                } else {
                    if (json[name]) {
                        str = str.replace(_eval(name), json[name]);
                    }
                }
            }
            return str.replace(/\{[a-z.A-Z]+\}/g,"");
        },
        anistop:function(){
            this.css({
                "-webkit-transition":"none"
            });
            return this;
        },
        ani:function(prop,time,ease,callback){
            time = time || 0.3;
            ease = ease || "ease-in";
            var ele = this;
            ele.css({
                "-webkit-transition":"all "+time+"s "+ease
            });
            setTimeout(function(){
                for(var i in prop){
                    ele[0].style[i] = prop[i];
                }
            },1);
            setTimeout(function(){
                if(callback){callback();}
            },time*1000);
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
        addClass: function(data) {
            var ele = this;
            var _class;
            $.each(ele, function() {
                _class = this.className;
                if (_class.indexOf(data) != -1) {
                    return;
                }
                _class = _class.split(" ") || [];
                _class.push(data);
                _class = _class.join(" ");
                this.className = $.trim(_class);
            });
            return ele;
        },
        removeClass: function(data) {
            var ele = this;
            $.each(ele, function() {
                this.className = data?$.trim(this.className.replace(data,"")):"";
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
            return i >= 0 ? $(ele[i]) : $(ele[ele[0].length + i]);
        },
        inArray: function(a, arr) {
            if (a.Dmimi) {
                arr = arr[0];
                a = a[0][0];
            }
            for (var i = 0; i < arr.length; i++) {
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
                ele[0].splice(num[i], 1);
            }
            return ele;
        },
        date: function(date, f) {
            if (typeof date != "object") {
                f = date;
                date = new Date();
            }
            f = f || "yyyy-MM-dd hh:mm:ss";
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
        futher: function(ele, str) {
            var arr = str.split("."),
                len = arr.length,
                i = 0,
                obj = ele;

            function fn(ele) {
                if (i < len) {
                    obj = ele[arr[i]];
                    i++;
                    fn(obj);
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
        /*
            target 原生dom
        */
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
                    search(d.parent());
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
});;
DMIMI.plugin("event", function($) {
    return ({
        on: function(type, callback) {
            callback = callback || function() {};
            $.each(this, function() {
                var dom = this;
                dom.events = dom.events || [];
                dom.addEventListener(type, callback);
                dom.events.push({
                    type: type,
                    fn: callback
                });
            });
            return this;
        },
        off: function(type, callback) {
            var ele = this;
            function removeEvent(dom, ev, type, callback) {
                if (callback) {
                    dom[ev](type, callback);
                } else {
                    if (dom.events) {
                        for (var i = 0; i < dom.events.length; i++) {
                            if (type == dom.events[i].type) {
                                dom[ev](type, dom.events[i].fn);
                            }
                        }
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
                e = e || window.event;
                var dom = $._selector(selector, ele[0]);
                var target = e.target || e.srcElement;
                $.each(dom, function() {
                    if (target == this) {
                        callback.apply(this);
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
});;
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
        ajax: function(options) {
            $.ajaxNum?$.ajaxNum++:$.ajaxNum = 1;
            var opts = {
                dataType: "json",
                success: function() {}
            };

            var opt = $.extend(opts,options);
            var symbol,paramCallback,xmlhttp, script,link, head = $("head")[0];

            if(opt.dataType.match(/jsonp$|js$/)){
                window["jsonpcallback"+$.ajaxNum] = function(res){
                    opt.success(res);
                    $(script).remove();
                }
                symbol = opt.url.indexOf("?")!=-1?"&":"?";
                paramCallback = symbol+"callback=jsonpcallback"+$.ajaxNum;

                script = $.create("script",{type:"text/javascript",src:opt.url+paramCallback})[0];
                head.appendChild(script);
                return false;
            }
            if(opt.dataType=="css"){
                link = $.create("link",{rel:"stylesheet",href:opt.url})[0];
                head.appendChild(link);
                return false;
            }
        },
        init: function() {
            return this;
        }
    }).init();
});

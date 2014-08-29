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
        param:function(){
            var str = window.location.href,temp = {};
            if(str.indexOf("?")!=-1){
                temp = $.paramToJson(str.split("?")[1]);
            }
            return temp;
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
                return this[0]?this[0].getAttribute(name):undefined;
            }
        },
        width: function(data) {
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
            if(num){
                this.ani({
                    "opacity":"0"
                },num/1000,function(){
                    ele.css({
                        display: "none"
                    });
                });
                return;
            }
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
                        if($.futher(obj,resStr)){
                            str = str.replace(futherArr[j],$.futher(obj,resStr)||"");
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
            return str.replace(/\{[a-z.A-Z]+\}/g,"");
        },
        anipause:function(){
            var self = this;
            this.css({
                "-webkit-transform":this.css("-webkit-transform"),

            });
            setTimeout(function(){
                self.css({
                    "-webkit-transition":"none"
                });
            },1)
            return this;
        },
        anistop:function(){
            this.css({
                "-webkit-transition":"none"
            });
            this.removeAttr('animation');
            this.off("webkitTransitionEnd");
            return this;
        },
        ani:function(prop,time,ease,callback){
            var ele = this;
            time = time || 0.3;
            ease = ease || "ease-in";
            if(typeof ease == "function"){
                callback = ease;
                ease = "ease-in";
            }
            if(typeof time == "function"){
                callback = time;
                time = 0.3;
            }
            ele.css({
                "-webkit-transition":"all "+time+"s "+ease
            });

            setTimeout(function(){
                for(var i in prop){
                    ele[0].style[i] = prop[i];
                }
                ele.attr('animation',"true");
            },1000/10);
            ele.off("webkitTransitionEnd").on("webkitTransitionEnd",function(){
                if(callback){callback.call(this)}
                ele.removeAttr('animation');
            });
            return this;
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
                    if(ele[arr[i]]){
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
                dom.events = dom.events || [];
                dom.addEventListener(type, callback);
                dom.events.push({
                    type: type,
                    fn: callback
                });
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
                var dom = $._selector(selector, ele[0]);
                var target = e.target;
                $.each(dom, function() {
                    if (target == this || this.contains(target)) {
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
                success: function() {},
                complete:function(){}
            };


            var opt = $.extend(opts,options);
            var callbackName,symbol,paramCallback,xmlhttp, script,link, head = $("head");

            if(opt.dataType == "jsonp"){
                callbackName = opt.jsonp || "jsonpcallback"+$.ajaxNum;
                window[callbackName] = function(res){
                    $(script).remove();
                    delete window[callbackName];
                    return opt.success(res);
                }
                
                symbol = opt.url.indexOf("?")!=-1?"&":"?";
                paramCallback = symbol+"callback=jsonpcallback"+$.ajaxNum;

                script = $.create("script",{type:"text/javascript",src:opt.url+paramCallback});
                
                head.append(script);
                return false;
            }
            if(opt.dataType=="js"){
                script = $.create("script",{type:"text/javascript",src:opt.url});
                script[0].onload = function(){
                    $(script).remove();
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
                xhr.onreadystatechange = function(){  
                    //alert(xhr.readyState);  
                    if (xhr.readyState == 4){ // 代表读取服务器的响应数据完成  

                        opt.complete();
                        if (xhr.status == 200){ // 代表服务器响应正常  
                            // 获取响应的数据  
                            if(opt.dataType="json"){
                                opt.success(JSON.parse(xhr.responseText));
                            }else{
                                opt.success(xhr.responseText);
                            }
                        }else{
                            opt.error(xhr.responseText);  
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

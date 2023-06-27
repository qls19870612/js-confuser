(function () {
    'use strict';

    class EnterVersion {
        constructor() {
            this._rootPath = "";
        }
        static get ins() {
            if (EnterVersion._ins == null) {
                EnterVersion._ins = new EnterVersion();
            }
            return EnterVersion._ins;
        }
        get rootPath() {
            return this._rootPath;
        }
        set rootPath(value) {
            this._rootPath = value;
        }
        init(versionObj) {
            this.versionObj = versionObj;
        }
        getVersionUrl(originURL) {
            if (this.versionObj && this.versionObj.hasOwnProperty(originURL)) {
                var versionNUm = this.versionObj[originURL];
                var arr = originURL.split(".");
                var fileName = arr.shift();
                var versionUrl = fileName + "_v_" + versionNUm + "." + arr.join(".");
                return versionUrl;
            }
            return originURL;
        }
    }

    class EnterLoader {
        constructor() {
            this._loadNum = 0;
            this._contentType = "";
            this._progressFunc = null;
            this.onProgress = (ev) => {
                if (this._progressFunc) {
                    this._progressFunc(ev.loaded / ev.total);
                    this._progressFunc.apply(this._caller, [ev.loaded / ev.total]);
                }
            };
            this.onload = () => {
                if (this._completeFunc) {
                    var response = this._versionLoader.response;
                    console.log("加载完成：" + this._url);
                    this._completeFunc.apply(this._caller, [response]);
                }
            };
            this.onError = () => {
                setTimeout(() => {
                    this.startLoad();
                }, 1000);
                if (this._loadNum == 6) {
                    console.log("加载失败" + this._url);
                    alert("网络链接异常，资源加载失败， 请稍后再试 " + this._sign);
                }
            };
        }
        load(url, sign, caller, completeFunc, progressFunc = null, contentType = "") {
            this._completeFunc = completeFunc;
            this._progressFunc = progressFunc;
            this._contentType = contentType;
            this._caller = caller;
            this._url = url;
            url = EnterVersion.ins.getVersionUrl(url);
            if (url.indexOf("http") != 0) {
                url = EnterVersion.ins.rootPath + url;
            }
            this._versionUrl = url;
            this._sign = sign;
            this.startLoad();
        }
        startLoad() {
            this._loadNum++;
            if (this._versionLoader != null) {
                this._versionLoader.onload = null;
                this._versionLoader.onerror = null;
            }
            this._versionLoader = new XMLHttpRequest();
            this._versionLoader.onload = this.onload;
            this._versionLoader.onerror = this.onError;
            this._versionLoader.onprogress = this.onProgress;
            console.log("enterLoad:" + this._versionUrl);
            this._versionLoader.open("GET", this._versionUrl, true);
            this._versionLoader.responseType = this._contentType;
            this._versionLoader.send();
        }
    }

    class Utils {
        static getRandomNum(min, max) {
            return min + Math.floor(Math.random() * (max - min));
        }
        static uint8ArrayToString(array) {
            var str = "";
            try {
                str = new TextDecoder("utf-8").decode(array);
                console.log("TextDecoder 解压");
            }
            catch (error) {
                console.log("decoTextByJs 解压");
                str = this.decoTextByJs(array);
            }
            return str;
        }
        static normalUint8ArrayToString(array) {
            var dataString = "";
            for (var i = 0; i < array.length; i++) {
                dataString += String.fromCharCode(array[i]);
            }
            return dataString;
        }
        static decoTextByJs(array) {
            var out, i, len, c;
            var char2, char3;
            out = "";
            len = array.length;
            i = 0;
            while (i < len) {
                c = array[i++];
                switch (c >> 4) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        out += String.fromCharCode(c);
                        break;
                    case 12:
                    case 13:
                        char2 = array[i++];
                        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                        break;
                    case 14:
                        char2 = array[i++];
                        char3 = array[i++];
                        out += String.fromCharCode(((c & 0x0F) << 12) |
                            ((char2 & 0x3F) << 6) |
                            ((char3 & 0x3F) << 0));
                        break;
                }
            }
            return out;
        }
        static getQueryString(paramName) {
            var e = new RegExp("(^|&)" + paramName + "=([^&]*)(&|$)");
            var i = window.location.search.substr(1).match(e);
            if (i != null) {
                return decodeURIComponent(i[2]);
            }
            else {
                return "";
            }
        }
        static urlToObj(url) {
            let locationData = {};
            if (url && url.indexOf("?") != -1) {
                url = url.substring(url.indexOf("?") + 1);
                let arrParams = url.split("&");
                for (let strParam of arrParams) {
                    if (strParam.indexOf("=") >= 0) {
                        let tmpElemtAry = strParam.split("=");
                        locationData[tmpElemtAry[0]] = tmpElemtAry[1];
                    }
                }
                ;
            }
            return locationData;
        }
        static xorEncrypt(buf, key) {
            const result = new Uint8Array(buf.byteLength);
            const keyByteLength = key.byteLength;
            for (let i = 0; i < buf.byteLength; i++) {
                result[i] = buf[i] ^ key[i % keyByteLength];
            }
            return result;
        }
    }

    class JsLoader {
        constructor() {
            this._isZip = true;
            this._url = "";
            this._startLoadTime = 0;
            this._zipEndTime = 0;
            this._endLoadTime = 0;
            this.securtKey = new Uint8Array([88, 24, 55]);
        }
        load(url, sign, caller, completeFunc, isZip = true) {
            console.log("JsLoader url:" + url);
            this._startLoadTime = new Date().getTime();
            this._url = url;
            this._completeFunc = completeFunc;
            this._caller = caller;
            this._isZip = isZip;
            this.codeLoad = new EnterLoader();
            var responseType = "";
            if (isZip) {
                responseType = "arraybuffer";
            }
            this.codeLoad.load(url, sign, this, this.onCodeLoad, this.onProgress, responseType);
        }
        onProgress(prcent) {
        }
        onCodeLoad(response) {
            this._endLoadTime = new Date().getTime();
            var codeStr = "";
            if (this._isZip) {
                codeStr = this.unzip(response);
            }
            else {
                codeStr = response;
            }
            this._zipEndTime = new Date().getTime();
            this.loadScript(codeStr);
        }
        unzip(arraybuffer) {
            var strartTime = new Date().getTime();
            var uint8array = new Uint8Array(arraybuffer);
            uint8array = Utils.xorEncrypt(uint8array, this.securtKey);
            var zli = new Zlib.Inflate(uint8array);
            uint8array = zli.decompress();
            var endZipTime = new Date().getTime();
            var codeStr = Utils.uint8ArrayToString(uint8array);
            var endTransTime = new Date().getTime();
            console.log(`zip 解压耗时:${endZipTime - strartTime} , 转换耗时：${endTransTime - endZipTime}, 总耗时：${endTransTime - strartTime}`);
            return codeStr;
        }
        loadScript(codeStr) {
            var fileref = document.createElement("script");
            fileref.setAttribute("type", "text/javascript");
            fileref.text = codeStr;
            if (typeof fileref != "undefined") {
                document.getElementsByTagName("head")[0].appendChild(fileref);
                var parseEndTime = new Date().getTime();
                console.log(`加载耗时${this._endLoadTime - this._startLoadTime}， 解压耗时：${this._zipEndTime - this._endLoadTime}  解析耗时： ${parseEndTime - this._zipEndTime} ,总耗时：${parseEndTime - this._startLoadTime}`, this._url);
            }
            if (this._completeFunc) {
                this._completeFunc.apply(this._caller);
            }
        }
    }

    var EnterLoadSign;
    (function (EnterLoadSign) {
        EnterLoadSign[EnterLoadSign["mainVersion"] = 1] = "mainVersion";
        EnterLoadSign[EnterLoadSign["zlib"] = 2] = "zlib";
        EnterLoadSign[EnterLoadSign["versionDat"] = 3] = "versionDat";
        EnterLoadSign[EnterLoadSign["ReleaseEnter"] = 4] = "ReleaseEnter";
        EnterLoadSign[EnterLoadSign["libs"] = 5] = "libs";
        EnterLoadSign[EnterLoadSign["code"] = 6] = "code";
    })(EnterLoadSign || (EnterLoadSign = {}));

    class IosUtils {
        static urlToObj(url) {
            let locationData = {};
            if (url && url.indexOf("?") != -1) {
                url = url.substring(url.indexOf("?") + 1);
                let arrParams = url.split("&");
                for (let strParam of arrParams) {
                    if (strParam.indexOf("=") >= 0) {
                        let tmpElemtAry = strParam.split("=");
                        locationData[tmpElemtAry[0]] = tmpElemtAry[1];
                    }
                }
                ;
            }
            return locationData;
        }
        static isIos15() {
            try {
                let ua = window.navigator.userAgent.toLowerCase();
                if (ua.indexOf("mac os") > 0) {
                    let reg = /\d+_\d+/g;
                    let verinfo = ua.match(reg);
                    console.log("mac os:" + verinfo);
                    if (verinfo != null) {
                        let versionArr = verinfo[0].split("_");
                        let version = parseInt(versionArr[0]);
                        let marjoy = parseInt(versionArr[1]);
                        if (version == 15 && (marjoy < 4)) {
                            return true;
                        }
                    }
                }
            }
            catch (e) {
                console.log("isIos15:error1:" + e.message);
            }
            try {
                console.log("html url:" + location.href);
                let urlObj = this.urlToObj(location.href);
                if (urlObj['systemVersion'] && urlObj['deviceName']) {
                    let deviceName = urlObj['deviceName'];
                    if (deviceName.indexOf("iOS") !== -1 || deviceName.indexOf("iPadOS") !== -1) {
                        let versionArr = urlObj['systemVersion'].split(".");
                        let version = parseInt(versionArr[0]);
                        let marjoy = parseInt(versionArr[1]);
                        if (version == 15 && (marjoy < 4)) {
                            return true;
                        }
                    }
                }
            }
            catch (e) {
                console.log("isIos15:error2:" + e.message);
                return false;
            }
            return false;
        }
        static isIos() {
            try {
                let ua = window.navigator.userAgent.toLowerCase();
                console.log("ua:" + ua);
                if (ua.indexOf("mac os") > 0) {
                    return true;
                }
            }
            catch (e) {
                console.log("isIos15:error1:" + e.message);
            }
            try {
                console.log("html url:" + location.href);
                let urlObj = this.urlToObj(location.href);
                if (urlObj['systemVersion'] && urlObj['deviceName']) {
                    let deviceName = urlObj['deviceName'];
                    if (deviceName.indexOf("iOS") !== -1 || deviceName.indexOf("iPadOS") !== -1) {
                        return true;
                    }
                }
            }
            catch (e) {
                console.log("isIos15:error2:" + e.message);
                return false;
            }
            return false;
        }
    }

    class NativeBridge {
        constructor() {
            this.nativeCallBacks = new Array();
            console.log("初始化初始化初始化初始化初始化初始化初始化初始化");
            this.onNativeMessage = this.onNativeMessage.bind(this);
            var conchConfig = window["conchConfig"];
            var PlatformClass = window["PlatformClass"];
            console.log(conchConfig, PlatformClass);
            if (conchConfig && PlatformClass) {
                console.log("有conchConfig和PlatformClass");
                this.sOS = conchConfig.getOS();
                if (this.sOS == "Conch-ios") {
                    this.bridge = PlatformClass.createClass("JSBridge");
                }
                else if (this.sOS == "Conch-android") {
                    this.bridge = PlatformClass.createClass("demo.JSBridge");
                }
            }
            this.isPhone = !NativeBridge.isEmpty(this.sOS);
        }
        static get ins() {
            if (NativeBridge._ins == null) {
                NativeBridge._ins = new NativeBridge();
            }
            return this._ins;
        }
        static isEmpty(str) {
            return str == undefined || str.length == 0;
        }
        setNativePercent(value) {
            console.log("setNativePercent1:" + value);
            if (this.bridge) {
                console.log("setNativePercent3:" + value);
                this.bridge.callWithBack(null, "loading:", value + "");
            }
        }
        sendNative(funcName, json = null) {
            if (json == null) {
                json = {};
            }
            var s = JSON.stringify(json);
            if (window["Laya"] && Laya.Browser.window.control) {
                Laya.Browser.window.control.onMessage(s);
            }
            if (this.bridge) {
                if (this.sOS == "Conch-ios") {
                    this.bridge.callWithBack(this.onNativeMessage, "js2Nactive:", s);
                }
                else if (this.sOS == "Conch-android") {
                    this.bridge.callWithBack(this.onNativeMessage, "js2Nactive", s);
                }
            }
            else if (window.kairong5 != null) {
                window.KaiRongSdk.addCallBack(this.onAndroidNativeMessage.bind(this));
                window.kairong5.js2Nactive(s);
            }
        }
        sendNativeEx(eventId, json = null) {
            if (json == null) {
                json = {};
            }
            json["eventID"] = eventId;
            this.sendNative("sendToNative", json);
        }
        listen(callback) {
            this.nativeCallBacks.push(callback);
        }
        unListen(callback) {
            let index = this.nativeCallBacks.indexOf(callback);
            if (index != -1) {
                this.nativeCallBacks.splice(index, 1);
            }
        }
        onAndroidNativeMessage(eventId, message) {
            this.onNativeMessage(message);
        }
        onNativeMessage(message) {
            try {
                let type = typeof message;
                let data;
                if (type == "object") {
                    data = message;
                }
                else {
                    data = JSON.parse(message);
                }
                let eventID = String(data["eventID"]);
                for (const nativeCallBack of this.nativeCallBacks) {
                    nativeCallBack.onNativeMessage(eventID, data);
                }
            }
            catch (error) {
                console.log("【Bridge.onNaciveMessage】error=" + error);
            }
        }
    }

    class NativeLoading {
        static setNativePrcent(value) {
            if (window["loadingView"] && window["loadingView"].loading) {
                window["loadingView"].loading(value);
            }
            else if (window["kairong5"] && window["kairong5"].loading) {
                kairong5.loading(value);
            }
            else {
                NativeBridge.ins.setNativePercent(value + "");
            }
        }
    }

    class ProgressBar {
        constructor(conginer) {
            this._currentPrcent = 0;
            this._currentAniPrcent = 0;
            this._isAni = false;
            this.pgBg = new Laya.Image("res/img/loading/login_bar_bg.png");
            this.pgBg.width = 631;
            this.pgBg.height = 19;
            this.pgBg.sizeGrid = "7,33,5,36";
            conginer.addChild(this.pgBg);
            this.pgBar = new Laya.Image("res/img/loading/login_bar_01.png");
            this.pgBar.width = this.pgBg.width + 13;
            this.pgBar.height = this.pgBg.height;
            this.pgBar.sizeGrid = "7,21,5,27";
            this.pgBar.x = this.pgBg.x - 9;
            this.pgBar.y = this.pgBg.y + 3;
            conginer.addChild(this.pgBar);
            this.pgBarWidth = this.pgBar.width;
            this.pgBarHeight = this.pgBar.height;
            this.pgBar.width = 0;
            conginer.width = 631;
        }
        setProgress(current) {
            this._isAni = false;
            this.updateProgress(current);
        }
        updateProgress(current) {
            var scaele = current / 100;
            scaele = scaele > 1 ? 1 : scaele;
            scaele = scaele < 0 ? 0 : scaele;
            this.pgBar.width = this.pgBarWidth * scaele;
        }
        updateAni() {
            if (this._currentAniPrcent < this._currentPrcent) {
                this._currentAniPrcent += 2;
                this.updateProgress(this._currentAniPrcent);
            }
            else {
                this._currentAniPrcent = 0;
            }
        }
        setSubAniProgress(current) {
            this._isAni = true;
            this._currentPrcent = current;
        }
    }

    class Constants {
    }
    Constants.WinWidth = 720;
    Constants.WinHeight = 1280;
    Constants.loadingBg = "";
    Constants.rootDomain = window.rootDomain || "https://update-ry.skaa5.com/honour";
    Constants.prjName = window.prjName || "prj";
    Constants.isMiniGame = window.hasOwnProperty("isMiniGame");

    class LoadingUI {
        constructor() {
            this.loadType = 1;
            this._currentAniPrcent = 0;
            this._currentPrcent = 0;
            this._continer = new Laya.Sprite();
            this._continer.width = Constants.WinWidth;
            this._continer.height = Constants.WinHeight;
            this._mainProgressContiner = new Laya.Sprite();
            this._mainProgress = new ProgressBar(this._mainProgressContiner);
            this._subProgressBarContiner = new Laya.Sprite();
            this._subProgressBar = new ProgressBar(this._subProgressBarContiner);
            this.createNormalLoad();
            Laya.timer.loop(1, this, this.onProgressLoop);
            Laya.stage.on(Laya.Event.RESIZE, this, this.resize);
        }
        static get ins() {
            if (LoadingUI._ins == null) {
                LoadingUI._ins = new LoadingUI();
            }
            return LoadingUI._ins;
        }
        onProgressLoop() {
            this.setTweenMainProgress();
            this._subProgressBar.updateAni();
        }
        resize() {
            this.refreshBg();
        }
        refreshBg() {
            let ScreenW = Laya.stage.width;
            let ScreenH = Laya.stage.height;
            let bg = this.bg;
            bg.skin = Constants.loadingBg;
            bg.width = 750;
            bg.height = 1334;
            bg.scaleX = bg.scaleY = Math.max(Laya.stage.width / Constants.WinWidth, Laya.stage.height / Constants.WinHeight);
            bg.x = ScreenW / 2 - bg.width * bg.scaleX / 2;
            bg.y = ScreenH / 2 - bg.height * bg.scaleX / 2;
            this._mainProgressContiner.y = ScreenH - 120;
            this._subProgressBarContiner.y = ScreenH - 50;
            this.prcentLab.y = this._mainProgressContiner.y + 13;
            this.loadingTextLab.y = this._mainProgressContiner.y - 20;
            this.subTextLab.y = this._subProgressBarContiner.y - 20;
        }
        createNormalLoad() {
            let ScreenW = Laya.stage.width;
            let ScreenH = Laya.stage.height;
            this.NormalBG = new Laya.Sprite();
            this.NormalBG.width = ScreenW;
            this.NormalBG.height = ScreenH;
            this._continer.addChild(this.NormalBG);
            this.bg = new Laya.Image();
            this.NormalBG.addChild(this.bg);
            this.initProgressBar();
            this.refreshBg();
        }
        initProgressBar() {
            let ScreenW = Laya.stage.width;
            console.log("this._mainProgressContiner.width :" + this._mainProgressContiner.width);
            this._mainProgressContiner.x = ScreenW / 2 - this._mainProgressContiner.width / 2;
            this._subProgressBarContiner.x = this._mainProgressContiner.x;
            this.NormalBG.addChild(this._mainProgressContiner);
            this.NormalBG.addChild(this._subProgressBarContiner);
            this.prcentLab = new Laya.Label();
            this.prcentLab.fontSize = 26;
            this.prcentLab.color = "#FFFFFF";
            this.prcentLab.strokeColor = "#000000";
            this.prcentLab.stroke = 2;
            this.prcentLab.width = 100;
            this.prcentLab.text = "0%";
            this.prcentLab.anchorX = 0.5;
            this.prcentLab.anchorY = 0.5;
            this.prcentLab.x = ScreenW / 2;
            this.prcentLab.align = "center";
            this.prcentLab.bold = true;
            this.NormalBG.addChild(this.prcentLab);
            this.loadingTextLab = new Laya.Label();
            this.loadingTextLab.fontSize = 24;
            this.loadingTextLab.color = "#3e67b8";
            this.loadingTextLab.width = 768;
            this.loadingTextLab.text = LoadingUI._loadingTextArr[0];
            this.loadingTextLab.x = ScreenW / 2;
            this.loadingTextLab.anchorX = 0.5;
            this.loadingTextLab.anchorY = 0.5;
            this.loadingTextLab.align = "center";
            this.NormalBG.addChild(this.loadingTextLab);
            this.subTextLab = new Laya.Label();
            this.subTextLab.fontSize = 24;
            this.subTextLab.color = "#3e67b8";
            this.subTextLab.width = 768;
            this.subTextLab.text = "";
            this.subTextLab.x = ScreenW / 2;
            this.subTextLab.anchorX = 0.5;
            this.subTextLab.anchorY = 0.5;
            this.subTextLab.align = "center";
            this.NormalBG.addChild(this.subTextLab);
        }
        setMainProgress(current) {
            this._currentAniPrcent = this._currentPrcent;
            this._currentPrcent = current;
        }
        setTweenMainProgress() {
            if (this._currentAniPrcent < this._currentPrcent) {
                this._currentAniPrcent += 0.2;
                this.prcentLab.text = Math.floor(this._currentAniPrcent) + "%";
                this._mainProgress.setProgress(this._currentAniPrcent);
            }
        }
        setSubProgress(current) {
            this._subProgressBar.setProgress(current);
        }
        setSubAniProgress(current) {
            this._subProgressBar.setSubAniProgress(current);
        }
        setSubText(text) {
            this.subTextLab.text = text;
        }
        startLoad(loadType) {
            this.loadType = loadType;
            this.NormalBG.visible = this.loadType == 1;
            console.info("LoadingUI startLoad" + loadType);
            if (this.loadType == 1) {
                Laya.timer.loop(500, this, this.onLoop);
                this.loadingTextLab.text = LoadingUI._loadingTextArr[0];
            }
        }
        onLoop() {
            this.loadingTextLab.text = this.GetTipStr();
        }
        GetTipStr() {
            var loadingTextIndex = this.getRandomNum(0, LoadingUI._loadingTextArr.length - 1);
            return LoadingUI._loadingTextArr[loadingTextIndex];
        }
        getRandomNum(min, max) {
            return min + Math.floor(Math.random() * (max - min));
        }
        show(parent, index = -1, runTime = 0) {
            if (this.helTxt) {
                this.helTxt.visible = runTime > 0;
            }
            if (parent) {
                if (index == -1) {
                    parent.addChild(this._continer);
                }
                else {
                    parent.addChildAt(this._continer, index);
                }
            }
            this.startLoad(1);
        }
        finishLoad() {
        }
        remove() {
            console.info("LoadingUI remove remove");
            Laya.timer.clear(this, this.onProgressLoop);
            Laya.timer.clearAll(this);
            if (this._continer.parent) {
                this._continer.parent.removeChild(this._continer);
            }
        }
        static close() {
            if (this._ins) {
                this._ins.remove();
                this._ins.finishLoad();
            }
        }
        static show(parent) {
            this.ins.show(parent);
        }
    }
    LoadingUI._loadingTextArr = [
        "首次加载时间稍长，请耐心等待",
        "正在打扫学院大门……",
        "正在商店街闲逛……",
        "正在勇士酒馆庆祝胜利……",
        "正在特训室练习……",
        "正在查看荣誉榜排名……",
        "正在查看本次学院测试的成绩……",
        "正在等待列车进站……",
        "正在偷吃食堂的便当……",
        "正在给灌木丛浇水……",
        "正在完成骑士挑战……",
        "正在清洗武器……"
    ];
    var win$1 = window;
    win$1["LoadingUI"] = LoadingUI;

    var UploadProgress;
    (function (UploadProgress) {
        UploadProgress[UploadProgress["onMainVersionLoad"] = 200] = "onMainVersionLoad";
        UploadProgress[UploadProgress["onZlibLoad"] = 300] = "onZlibLoad";
        UploadProgress[UploadProgress["onVersionLoad"] = 400] = "onVersionLoad";
        UploadProgress[UploadProgress["onEngineLoad"] = 500] = "onEngineLoad";
        UploadProgress[UploadProgress["initLaya"] = 600] = "initLaya";
        UploadProgress[UploadProgress["onLoadingBgLoad"] = 700] = "onLoadingBgLoad";
        UploadProgress[UploadProgress["onCodeLoad"] = 800] = "onCodeLoad";
        UploadProgress[UploadProgress["enterGame"] = 900] = "enterGame";
    })(UploadProgress || (UploadProgress = {}));

    var RunTime;
    (function (RunTime) {
        RunTime[RunTime["native"] = -1] = "native";
        RunTime[RunTime["debug"] = 999] = "debug";
        RunTime[RunTime["web"] = 2] = "web";
        RunTime[RunTime["wei_xin_miniGame"] = 3] = "wei_xin_miniGame";
        RunTime[RunTime["vivo_miniGame"] = 4] = "vivo_miniGame";
        RunTime[RunTime["oppo_miniGame"] = 5] = "oppo_miniGame";
        RunTime[RunTime["hua_wei_minigGame"] = 6] = "hua_wei_minigGame";
        RunTime[RunTime["tiktok_miniGame"] = 7] = "tiktok_miniGame";
    })(RunTime || (RunTime = {}));

    class BaseEnter {
        constructor(mainVersion, versionObj, runTime) {
            this.platformType = 0;
            this.isAudit = false;
            this.eventUploader = null;
            this._mainVersion = mainVersion;
            this._versionObj = versionObj;
            this._runTime = runTime;
            window['loadStartTime'] = new Date().getTime();
        }
        uploadProgress(progress) {
            if (this.eventUploader) {
                this.eventUploader.uploadProgress(progress);
            }
        }
        initLaya() {
            console.log("initLaya++++++");
            let userAgent = this.getUserAgent();
            if (window["Laya3D"] && IosUtils.isIos15() == false) {
                console.log("layaInit: 3d");
                Laya3D.init(Constants.WinWidth, Constants.WinHeight);
            }
            else {
                console.log("layaInit: 2d");
                Laya.init(Constants.WinWidth, Constants.WinHeight, Laya.WebGL);
            }
            Laya["Physics"] && Laya["Physics"].enable();
            Laya.SoundManager.autoReleaseSound = false;
            let workerPath = "libs/worker.js";
            if (window["_URL_ROOT_"]) {
                workerPath = window["_URL_ROOT_"] + workerPath;
            }
            Laya.WorkerLoader.workerPath = workerPath;
            Laya.WorkerLoader.enable = false;
            if (userAgent.mobile || userAgent.LayaAirIDE || window["conch"] != null || this._runTime == RunTime.hua_wei_minigGame || this._runTime == RunTime.wei_xin_miniGame || this._runTime == RunTime.tiktok_miniGame) {
                Laya.stage.screenMode = Laya.Stage.SCREEN_VERTICAL;
                Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
                Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.stage.alignV = Laya.Stage.ALIGN_TOP;
            }
            else {
                Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
                Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
            }
            console.log(window.navigator.userAgent);
            Laya.stage.frameRate = Laya.Stage.FRAME_FAST;
            this.uploadProgress(UploadProgress.initLaya);
        }
        setMiniGamePath() {
            Laya.URL.basePath = EnterVersion.ins.rootPath;
        }
        getUserAgent() {
            let u = window.navigator.userAgent;
            return {
                LayaAirIDE: u.indexOf('LayaAirIDE') > -1,
                trident: u.indexOf('Trident') > -1,
                presto: u.indexOf('Presto') > -1,
                webKit: u.indexOf('AppleWebKit') > -1,
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,
                mobile: !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/) && u.indexOf('QIHU') && u.indexOf('Chrome') < 0,
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
                iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1,
                iPad: u.indexOf('iPad') > -1,
                webApp: u.indexOf('Safari') == -1,
                ua: u
            };
        }
        ;
        loadLoading() {
            Laya.loader.load(Constants.loadingBg, Laya.Handler.create(this, this.onLoadingBgLoad), null, Laya.Loader.IMAGE, 0);
        }
        onLoadingBgLoad() {
            console.log("onLoadingBgLoad");
            this.uploadProgress(UploadProgress.onLoadingBgLoad);
            LoadingUI.ins.refreshBg();
            this.onLoadingBgComplete();
            NativeLoading.setNativePrcent(100);
        }
        enterGame() {
            console.log("enterGame" + this.platformType);
            if (this.platformType == 0) {
                var TestEnter = window["TestEnter"];
                var testEnter = new TestEnter();
            }
            else {
                var GameMain = window["GameMain"];
                var gameMain = new GameMain(this._mainVersion, this._versionObj);
                gameMain.setRelease(this._runTime, this.platformType, this.isAudit);
            }
            LoadingUI.ins.setMainProgress(20);
            this.uploadProgress(UploadProgress.enterGame);
            this.eventUploader = null;
        }
        showLoading() {
            LoadingUI.ins.show(Laya.stage, 0, this._runTime);
        }
    }

    class DebugEnter extends BaseEnter {
        constructor(mainVersion = -1, versionObj = {}) {
            super(mainVersion, versionObj, -1);
            this.onEngineLoad = () => {
                this.initLaya();
                this.loadLoading();
            };
            this.onCodeLoad = () => {
                setTimeout(() => {
                    this.enterGame();
                }, 100);
            };
        }
        start() {
            this.loadEngine();
        }
        loadEngine() {
            var load = new JsLoader();
            load.load("code/libs.js", EnterLoadSign.libs, this, this.onEngineLoad, false);
        }
        onLoadingBgComplete() {
            this.showLoading();
            this.loadCode();
        }
        loadCode() {
            var load = new JsLoader();
            load.load("code/code.js", EnterLoadSign.code, this, this.onCodeLoad, false);
        }
    }

    class HuaWeiMiniGameEnter extends BaseEnter {
        constructor(mainVersion, versionObj, runTime) {
            super(mainVersion, versionObj, runTime);
            qg.onError((res) => {
                console.error(res.location);
                console.error(res.message);
                console.error(res.stack);
            });
        }
        start() {
            this.initLaya();
            this.setMiniGamePath();
            this.loadLoading();
        }
        onLoadingBgComplete() {
            this.showLoading();
            this.enterGame();
        }
    }

    class OppoMiniGameEnter extends BaseEnter {
        constructor(mainVersion, versionObj, runTime) {
            super(mainVersion, versionObj, runTime);
            qg.onError((res) => {
                console.error(res.location);
                console.error(res.message);
                console.error(res.stack);
            });
        }
        start() {
            this.initLaya();
            this.setMiniGamePath();
            this.loadLoading();
        }
        onLoadingBgComplete() {
            this.showLoading();
            this.enterGame();
        }
    }

    class CodeLoader extends JsLoader {
        onProgress(prcent) {
            LoadingUI.ins.setSubProgress(prcent * 100);
        }
        onCodeLoad(response) {
            LoadingUI.ins.setSubText("解压资源中，请稍候");
            setTimeout(() => {
                super.onCodeLoad(response);
            }, 30);
        }
        loadScript(codeStr) {
            LoadingUI.ins.setSubText("解析资源中...请稍候");
            setTimeout(() => {
                super.loadScript(codeStr);
            }, 30);
        }
    }

    class ReleaseEnter extends BaseEnter {
        constructor(mainVersion = -1, versionObj = {}) {
            super(mainVersion, versionObj, -1);
            this.userFly = true;
            this.extName = ".fly";
            this.onEngineLoad = () => {
                console.log("onEngineLoad++++++");
                this.uploadProgress(UploadProgress.onEngineLoad);
                NativeLoading.setNativePrcent(80);
                this.initLaya();
                this.loadLoading();
            };
            this.onCodeLoad = (e) => {
                this.uploadProgress(UploadProgress.onCodeLoad);
                LoadingUI.ins.setMainProgress(30);
                setTimeout(() => {
                    this.enterGame();
                }, 100);
            };
            if (!this.userFly) {
                this.extName = ".js";
            }
        }
        start() {
            let enterBundle = Utils.getQueryString("enterBundle");
            if (enterBundle != "") {
                this.initLaya();
                this.enterGame();
            }
            else {
                this.loadEngine();
            }
        }
        loadEngine() {
            var load = new JsLoader();
            load.load("code/libs" + this.extName, EnterLoadSign.libs, this, this.onEngineLoad, this.userFly);
        }
        onLoadingBgComplete() {
            this.showLoading();
            this.loadCode();
        }
        loadCode() {
            var load = new CodeLoader();
            LoadingUI.ins.setMainProgress(20);
            LoadingUI.ins.setSubText("加载资源");
            load.load("code/code" + this.extName, EnterLoadSign.code, this, this.onCodeLoad, this.userFly);
        }
    }

    class TiktokMiniGameEnter extends BaseEnter {
        constructor(mainVersion, versionObj, runTime) {
            super(mainVersion, versionObj, runTime);
        }
        start() {
            this.initLaya();
            this.setMiniGamePath();
            this.loadLoading();
        }
        onLoadingBgComplete() {
            this.showLoading();
            this.loadSubPackage();
        }
        loadSubPackage() {
            let fixPackageName = window.fixPackageName;
            let packageName;
            if (fixPackageName) {
                packageName = fixPackageName;
            }
            else {
                packageName = this.isAudit ? "mini" : "code";
            }
            var loadTask = tt.loadSubpackage({
                complete: (...args) => {
                    console.log("load main package complete:" + packageName);
                },
                fail: (...args) => {
                    console.log("load main package fail:" + packageName);
                },
                name: packageName,
                success: (...args) => {
                    console.log("load main package success:" + packageName);
                    this.enterGame();
                }
            });
            loadTask.onProgressUpdate(res => {
            });
        }
    }

    class VivoMiniGameEnter extends BaseEnter {
        constructor(mainVersion, versionObj, runTime) {
            super(mainVersion, versionObj, runTime);
        }
        start() {
            this.initLaya();
            this.setMiniGamePath();
            this.loadLoading();
        }
        onLoadingBgComplete() {
            this.showLoading();
            this.enterGame();
        }
    }

    class WeiXinMiniGameEnter extends BaseEnter {
        constructor(mainVersion, versionObj, runTime) {
            super(mainVersion, versionObj, runTime);
        }
        start() {
            this.initLaya();
            this.setMiniGamePath();
            this.loadLoading();
        }
        onLoadingBgComplete() {
            this.showLoading();
            this.loadSubPackage();
        }
        loadSubPackage() {
            let fixPackageName = window.fixPackageName;
            let packageName;
            if (fixPackageName) {
                packageName = fixPackageName;
            }
            else {
                packageName = this.isAudit ? "mini" : "code";
            }
            var loadTask = wx.loadSubpackage({
                complete: (...args) => {
                    console.log("load main package complete:" + packageName);
                },
                fail: (...args) => {
                    console.log("load main package fail:" + packageName);
                },
                name: packageName,
                success: (...args) => {
                    console.log("load main package success:" + packageName);
                    this.enterGame();
                }
            });
            loadTask.onProgressUpdate(res => {
            });
        }
    }

    var CommonMsgValueExt;
    (function (CommonMsgValueExt) {
        CommonMsgValueExt["GET_CONFIG"] = "GET_CONFIG";
        CommonMsgValueExt["UPLOAD_LOADING_PROGRESS"] = "UPLOAD_LOADING_PROGRESS";
    })(CommonMsgValueExt || (CommonMsgValueExt = {}));

    class ReleaseLoader {
        constructor() {
            this._pid = 0;
            this._runTime = 0;
            this.noHotPatch = {};
            this._isUploadProgress = true;
            this._isAudit = false;
            this._platformId = 0;
            this.isAlreadyLoadMainVersion = false;
            this.onZlibLoad = () => {
                this.uploadProgress(UploadProgress.onZlibLoad);
                NativeLoading.setNativePrcent(40);
                this.loadVersion();
            };
            this._targetWindow = window;
            this.noHotPatch[RunTime.wei_xin_miniGame] = 1;
            this.noHotPatch[RunTime.vivo_miniGame] = 1;
            this.noHotPatch[RunTime.oppo_miniGame] = 1;
            this.noHotPatch[RunTime.hua_wei_minigGame] = 1;
            this.noHotPatch[RunTime.tiktok_miniGame] = 1;
            this._urlData = Utils.urlToObj(window.location.search);
        }
        static get instance() {
            if (ReleaseLoader._instance == null) {
                ReleaseLoader._instance = new ReleaseLoader();
            }
            return ReleaseLoader._instance;
        }
        sendToSdk(msgType, extInfo = null) {
            NativeBridge.ins.sendNativeEx(msgType, extInfo);
        }
        uploadProgress(progress) {
            console.log("++++++上报进度：" + progress);
            if (!this._isUploadProgress) {
                return;
            }
            this.sendToSdk(CommonMsgValueExt.UPLOAD_LOADING_PROGRESS, { action: "progress_" + UploadProgress[progress], msg: 'v=' + progress.valueOf() });
        }
        loadMainVersion(platformId, pid, runTime) {
            if (this.isAlreadyLoadMainVersion == false) {
                this.isAlreadyLoadMainVersion = true;
                console.log("+++++++ loadMainVersion------:", platformId, pid, runTime);
                if (isNaN(platformId)) {
                    platformId = 6;
                }
                NativeLoading.setNativePrcent(10);
                this._pid = pid;
                this._runTime = runTime;
                this._versionLoader = new EnterLoader();
                this.startLoad(platformId, false);
            }
        }
        loadPoke(platformId, pid, runTime) {
            NativeLoading.setNativePrcent(10);
            this._pid = pid;
            this._runTime = runTime;
            this._versionLoader = new EnterLoader();
            this._isAudit = true;
            if (window.auditPrjName) {
                Constants.prjName = window.auditPrjName;
            }
            this.startLoad(platformId, true);
        }
        startLoad(platformId, isPoke) {
            this.initRootPath();
            platformId = platformId == null ? 2 : platformId;
            this._platformId = platformId;
            if (Constants.isMiniGame) {
                NativeLoading.setNativePrcent(100);
                return;
            }
            if (this.nativeConfigData && this.nativeConfigData.httpConfig) {
                this.uploadProgress(UploadProgress.onMainVersionLoad);
                var obj = this.nativeConfigData.httpConfig;
                NativeLoading.setNativePrcent(20);
                this.start(obj);
                return;
            }
            console.log("this._pid" + this._pid);
            var configStr = "config.json?v=";
            this._versionLoader.load(configStr + Math.random(), EnterLoadSign.mainVersion, this, this.onMainVersionLoad, null, "");
        }
        initRootPath() {
            if (this._runTime && this._runTime > 0) {
                var cdnPath = window.cdnPath || Constants.rootDomain + "/resource/" + Constants.prjName + "/dist/";
                if (this._runTime == RunTime.wei_xin_miniGame) {
                    EnterVersion.ins.rootPath = cdnPath;
                }
                else if (this._runTime == RunTime.tiktok_miniGame) {
                    EnterVersion.ins.rootPath = cdnPath;
                }
                else if (this._runTime == RunTime.vivo_miniGame) {
                    EnterVersion.ins.rootPath = cdnPath;
                }
                else if (this._runTime == RunTime.oppo_miniGame) {
                    EnterVersion.ins.rootPath = cdnPath;
                }
                else if (this._runTime == RunTime.hua_wei_minigGame) {
                    EnterVersion.ins.rootPath = cdnPath;
                }
            }
        }
        onMainVersionLoad(response) {
            this.uploadProgress(UploadProgress.onMainVersionLoad);
            var obj = JSON.parse(response);
            NativeLoading.setNativePrcent(20);
            this.start(obj);
        }
        start(configInfo) {
            this.configInfo = configInfo;
            configInfo.platformId = this._platformId;
            configInfo.pid = this._pid;
            var updateGroup = configInfo.platfrom[this._platformId].updateGroup;
            console.log("_platformId:" + this._platformId);
            console.log("updateGroup:" + updateGroup);
            var version = configInfo.updateGroup[updateGroup].version;
            this.initCustom(configInfo);
            this._targetWindow["nativeConfigData"] = this.nativeConfigData;
            this._targetWindow["configInfo"] = configInfo;
            this._mainVersion = version;
            console.log("#######  mainVersion  ##########", this._mainVersion);
            console.log("#######  runTime  ##########", this._runTime);
            if (this.noHotPatch.hasOwnProperty(this._runTime)) {
                this.loadVersion();
            }
            else {
                this.loadZlib();
            }
        }
        initCustom(obj) {
            var platformCustom = obj.custom.platform[this._platformId];
            var pidCustom = obj.custom.pid[this._pid];
            var guideGame = this._urlData["GuideGame"];
            if (pidCustom) {
                if (pidCustom.guideGameId) {
                    console.log("原来gameid:" + guideGame);
                    var newGameId = pidCustom.guideGameId.toString();
                    this._urlData["GuideGame"] = newGameId;
                    guideGame = newGameId;
                    console.log("重定向的gameid:" + newGameId);
                }
            }
            if (guideGame && IosUtils.isIos15()) {
                if (obj.custom.miniGameMapping.hasOwnProperty(guideGame)) {
                    guideGame = obj.custom.miniGameMapping[guideGame];
                }
            }
            var loadingBg = "";
            var miniGameCustom;
            if (guideGame && obj.custom.miniGame) {
                miniGameCustom = obj.custom.miniGame[guideGame];
            }
            if (pidCustom != null && pidCustom.loadingBg) {
                loadingBg = pidCustom.loadingBg;
            }
            else if (miniGameCustom != null && miniGameCustom.loadingBg) {
                loadingBg = miniGameCustom.loadingBg;
            }
            else if (platformCustom != null && platformCustom.loadingBg) {
                loadingBg = platformCustom.loadingBg;
            }
            if (this.isInPlatMiniGame) {
                Constants.loadingBg = loadingBg;
            }
            else if (loadingBg != "") {
                Constants.loadingBg = `res/img/loading/${loadingBg}`;
            }
            else {
                Constants.loadingBg = `res/img/loading/bg/${Utils.getRandomNum(1, 7)}.jpg`;
            }
        }
        get isInPlatMiniGame() {
            let env = window['wx'] || window['tt'];
            if (env && env.loadSubpackage) {
                return true;
            }
            return false;
        }
        loadZlib() {
            var load = new JsLoader();
            load.load("zlib.min.js", EnterLoadSign.zlib, this, this.onZlibLoad, false);
        }
        loadVersion() {
            if (this._platformId == 0) {
                this._versionObj = {};
                EnterVersion.ins.init(this._versionObj);
                this.enter();
            }
            else {
                this._versionLoader = new EnterLoader();
                var versioDatUrl = "version/version_" + this._mainVersion + ".dat";
                this._versionLoader.load(versioDatUrl, EnterLoadSign.versionDat, this, this.onVersionLoad, null, "arraybuffer");
            }
        }
        onVersionLoad(arraybuffer) {
            NativeLoading.setNativePrcent(60);
            this.uploadProgress(UploadProgress.onVersionLoad);
            var versionStr;
            try {
                var uint8array = new Uint8Array(arraybuffer);
                var decompressArr = new Zlib.Inflate(uint8array).decompress();
                versionStr = Utils.uint8ArrayToString(decompressArr);
                versionStr = versionStr.substr(versionStr.indexOf("{"));
            }
            catch (e) {
                versionStr = "{}";
            }
            this._versionObj = JSON.parse(versionStr);
            if (this._isAudit) {
                if (this.configInfo && this.configInfo.auditVersionFix) {
                    let versionFix = this.configInfo.auditVersionFix;
                    for (const res in versionFix) {
                        this._versionObj[res] = versionFix[res];
                        console.log("onVersionLoad fix version res:%s,versionFix:%s", res, versionFix[res]);
                    }
                }
            }
            EnterVersion.ins.init(this._versionObj);
            this.enter();
        }
        enter() {
            var enter = null;
            console.log("runTime:" + this._runTime);
            if (this._runTime && this._runTime > 0) {
                if (this._runTime == RunTime.wei_xin_miniGame) {
                    enter = new WeiXinMiniGameEnter(this._mainVersion, this._versionObj, this._runTime);
                }
                else if (this._runTime == RunTime.vivo_miniGame) {
                    enter = new VivoMiniGameEnter(this._mainVersion, this._versionObj, this._runTime);
                }
                else if (this._runTime == RunTime.oppo_miniGame) {
                    enter = new OppoMiniGameEnter(this._mainVersion, this._versionObj, this._runTime);
                }
                else if (this._runTime == RunTime.hua_wei_minigGame) {
                    enter = new HuaWeiMiniGameEnter(this._mainVersion, this._versionObj, this._runTime);
                }
                else if (this._runTime == RunTime.tiktok_miniGame) {
                    enter = new TiktokMiniGameEnter(this._mainVersion, this._versionObj, this._runTime);
                }
                else if (this._runTime == RunTime.debug) {
                    this._versionObj = {};
                    EnterVersion.ins.init({});
                    enter = new DebugEnter(this._mainVersion, this._versionObj);
                }
            }
            else {
                enter = new ReleaseEnter(this._mainVersion, this._versionObj);
            }
            if (enter != null) {
                enter.platformType = this._platformId;
                enter.isAudit = this._isAudit;
                enter.eventUploader = this;
                enter.start();
            }
        }
    }

    class QuickGameEnter {
        constructor() {
            this._currentVersion = 0;
            this._versionLoader = new EnterLoader();
        }
        enter(updateLine, pid, platformType, runTime, currentVersion = -1) {
            if (currentVersion > 0) {
                this._currentVersion = currentVersion;
            }
            let versionUrl = Constants.rootDomain + "/version";
            this._versionLoader.load(versionUrl + "/" + updateLine + "/channel/" + runTime + ".json?v=" + Math.random(), EnterLoadSign.mainVersion, this, (response) => {
                var maxPassVersion = parseInt(response);
                var res;
                if (maxPassVersion >= this._currentVersion) {
                    ReleaseLoader.instance.loadMainVersion(platformType, pid, runTime);
                }
                else {
                    ReleaseLoader.instance.loadPoke(platformType, pid, runTime);
                }
            }, null, "");
        }
    }
    var win = window;
    win["QuickGameEnter"] = QuickGameEnter;

    var targetWindow = window;
    targetWindow['NativeBridge'] = NativeBridge;
    targetWindow['JsLoader'] = JsLoader;
    targetWindow['ReleaseLoader'] = ReleaseLoader;
    targetWindow['EnterLoader'] = EnterLoader;
    targetWindow['BaseEnter'] = BaseEnter;
    targetWindow['LoadingUI'] = LoadingUI;
    targetWindow["QuickGameEnter"] = QuickGameEnter;
    targetWindow["EnterLoadSign"] = EnterLoadSign;
    var releaseLoader = ReleaseLoader.instance;
    targetWindow['releaseLoader'] = releaseLoader;
    targetWindow['IosUtils'] = IosUtils;
    targetWindow['Constants'] = Constants;

})();

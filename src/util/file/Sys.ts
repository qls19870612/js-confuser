import {StringTool} from "./StringTool";

export var Sys:any={};


    Sys.mParseInt = function (v)
    {
        return parseInt(v);
    }

    Sys.mParserFloat = function (v)
    {
        return parseFloat(v) || 0;
    }

    Sys.log = function (__args)
    {
        var args = arguments;
        Sys.print("log", args, "#0080C0");
    }

    Sys.error = function (__args)
    {
        var args = arguments;
        Sys.print("error", args, "#FF0000");
    }

    Sys.warn = function (__args)
    {
        var args = arguments;
        Sys.print("warn", args, "#9B9B00");
    }

    Sys.plugin = function (__args)
    {
        var args = arguments;
        Sys.print("plugin", args, "#007300");
    }

    Sys.print = function (type, args, color)
    {
        var msg = "";
        for (var i = 0; i < args.length; i++)
        {
            msg += args[i] + " ";
        }
        console.log("%c [" + type + "]" + msg, "color: " + color + "");
    }

    Sys.alert = function (msg)
    {
    
            console.log(msg);

    }

    Sys.lang = function (body, __args)
    {
        var args = []; for (var i = 1, sz = arguments.length; i < sz; i++)args.push(arguments[i]);
        var i = 0, len = 0;
        len = args.length;
        if (Sys.langPack && Sys.langPack[body])
        {
            body = Sys.langPack[body];
        }
        for (i = 0; i < len; i++)
        {
            body = body.replace("{" + i + "}", args[i]);
        }
        return body;
    }

    Sys.adptLangPack = function ()
    {
        if (!Sys.langPack) return;
        var key;
        var newKey;
        for (key in Sys.langPack)
        {
            if (key.indexOf("\\n") >= 0)
            {
                newKey = StringTool.getReplace(key, "\\\\n", "\n");
                Sys.langPack[newKey] = StringTool.getReplace(Sys.langPack[key], "\\\\n", "\n");
            }
        }
    }

    Sys.langArr = function (txtList)
    {
        if (!Sys.langPack) return txtList;
        var i = 0, len = 0;
        len = txtList.length;
        var tTxt;
        for (i = 0; i < len; i++)
        {
            tTxt = txtList[i];
            if (Sys.langPack[tTxt])
            {
                txtList[i] = Sys.langPack[tTxt];
            }
        }
        return txtList;
    }

    Sys.langPack = null

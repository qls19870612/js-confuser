export var StringTool:any={};
export var StringTool$1:any=StringTool;

class PosItem
{
    private line: number;
    private index: number;
    private str: string;
    private oLine: number;
    constructor(line=0,index=0)
    {
        this.line = 0;
        this.index = 0;
        this.str = null;
        this.oLine = 0;

        this.line = line;
        this.index = index;
    }
    public static  pre(a, b)
    {
        if (a.line < b.line) return true;
        if (a.line > b.line) return false;
        return a.index < b.index;
    }
}
StringTool.toUpCase = function (str)
{
    return str.toUpperCase();
}

StringTool.toLowCase = function (str)
{
    return str.toLowerCase();
}

StringTool.toUpHead = function (str)
{
    var rst;
    if (str.length <= 1) return str.toUpperCase();
    rst = str.charAt(0).toUpperCase() + str.substr(1);
    return rst;
}

StringTool.toLowHead = function (str)
{
    var rst;
    if (str.length <= 1) return str.toLowerCase();
    rst = str.charAt(0).toLowerCase() + str.substr(1);
    return rst;
}

StringTool.packageToFolderPath = function (packageName)
{
    var rst;
    rst = packageName.replace(".", "/");
    return rst;
}

StringTool.insert = function (str, iStr, index)
{
    return str.substring(0, index) + iStr + str.substr(index);
}

StringTool.insertAfter = function (str, iStr, tarStr, isLast)
{
    (isLast === void 0) && (isLast = false);
    var i = 0;
    if (isLast)
    {
        i = str.lastIndexOf(tarStr);
    } else
    {
        i = str.indexOf(tarStr);
    }
    if (i >= 0)
    {
        return StringTool.insert(str, iStr, i + tarStr.length);
    }
    return str;
}

StringTool.insertBefore = function (str, iStr, tarStr, isLast)
{
    (isLast === void 0) && (isLast = false);
    var i = 0;
    if (isLast)
    {
        i = str.lastIndexOf(tarStr);
    } else
    {
        i = str.indexOf(tarStr);
    }
    if (i >= 0)
    {
        return StringTool.insert(str, iStr, i);
    }
    return str;
}

StringTool.insertParamToFun = function (funStr, params)
{
    var oldParam;
    oldParam = StringTool.getParamArr(funStr);
    var inserStr;
    inserStr = params.join(",");
    if (oldParam.length > 0)
    {
        inserStr = "," + inserStr;
    }
    return StringTool.insertBefore(funStr, inserStr, ")", true);
}

StringTool.trim = function (str, vList)
{
    if (!vList)
    {
        vList = [" ", "\r", "\n", "\t", String.fromCharCode(65279)];
    };
    var rst;
    var i = 0;
    var len = 0;
    rst = str;
    len = vList.length;
    for (i = 0; i < len; i++)
    {
        rst = StringTool.getReplace(rst, vList[i], "");
    }
    return rst;
}
StringTool.emptyStrDic = {
    " ": true,
    "\r": true,
    "\n": true,
    "\t": true
};
StringTool.isEmpty = function (str)
{
    if (str.length < 1) return true;
    return StringTool.emptyStrDic.hasOwnProperty(str);
}

StringTool.trimLeft = function (str)
{
    var i = 0;
    i = 0;
    var len = 0;
    len = str.length;
    while (StringTool.isEmpty(str.charAt(i)) && i < len)
    {
        i++;
    }
    if (i < len)
    {
        return str.substr(i);
    }
    return "";
}

StringTool.trimRight = function (str)
{
    var i = 0;
    i = str.length - 1;
    while (StringTool.isEmpty(str.charAt(i)) && i >= 0)
    {
        i--;
    };
    var rst;
    rst = str.substring(0, i)
    if (i >= 0)
    {
        return str.substring(0, i + 1);
    }
    return "";
}

StringTool.trimSide = function (str)
{
    var rst;
    rst = StringTool.trimLeft(str);
    rst = StringTool.trimRight(rst);
    return rst;
}

StringTool.trimButEmpty = function (str)
{
    return StringTool.trim(str, ["\r", "\n", "\t"]);
}

StringTool.removeEmptyStr = function (strArr)
{
    var i = 0;
    i = strArr.length - 1;
    var str;
    for (i = i; i >= 0; i--)
    {
        str = strArr[i];
        str = StringTool.trimSide(str);
        if (StringTool.isEmpty(str))
        {
            strArr.splice(i, 1);
        } else
        {
            strArr[i] = str;
        }
    }
    return strArr;
}

StringTool.ifNoAddToTail = function (str, sign)
{
    if (str.indexOf(sign) >= 0)
    {
        return str;
    }
    return str + sign;
}

StringTool.getSelectLinesStr = function (lines, startLine, endLine)
{
    var i = 0;
    var rLines;
    rLines = [];
    if (startLine < 0) startLine = 0;
    if (endLine > lines.length - 1) endLine = lines.length - 1;
    var tLine;
    for (i = startLine; i <= endLine; i++)
    {
        tLine = lines[i];
        rLines.push(tLine.lineStr);
    }
    return rLines.join("\n");
}

StringTool.getPiecesCode = function (pieces, ifTrim)
{
    (ifTrim === void 0) && (ifTrim = true);
    var pArr;
    pArr = [];
    var i = 0;
    var len = 0;
    var tPiece;
    len = pieces.length;
    for (i = 0; i < len; i++)
    {
        tPiece = pieces[i];
        pArr.push(tPiece.getCode());
    }
    if (ifTrim)
    {
        StringTool.trimLines(pieces);
    }
    return pArr.join("\n");
}

StringTool.trimEmptyLine = function (str)
{
    var i = 0;
    var len = 0;
    var tLines;
    var tLine;
    tLines = str.split("\n");
    for (i = tLines.length - 1; i >= 0; i--)
    {
        tLine = tLines[i];
        if (StringTool.isEmptyLine(tLine))
        {
            tLines.splice(i, 1);
        }
    }
    return tLines.join("\n");
}

StringTool.trimLines = function (lines)
{
    var i = 0;
    i = 0;
    while (lines.length > 0 && StringTool.isEmptyFunLineStr(lines[0]))
    {
        lines.shift();
    }
    while (lines.length > 0 && StringTool.isEmptyFunLineStr(lines[lines.length - 1]))
    {
        lines.pop();
    }
    return lines;
}
var Defines:any={};
Defines.isBWrap = function (str)
{
    return str == "{" || str == "}";
}
StringTool.isEmptyFunLineStr = function (str)
{
    str = StringTool.trim(str);
    if (Defines.isBWrap(str))
    {
        return true;
    }
    if (str == "") return true;
    return false;
}

StringTool.isEmptyLine = function (str)
{
    str = StringTool.trim(str);
    if (str == "") return true;
    return false;
}

StringTool.removeCommentLine = function (lines)
{
    var rst;
    rst = [];
    var i = 0;
    var tLine;
    var adptLine;
    i = 0;
    var len = 0;
    var index = 0;
    len = lines.length;
    while (i < len)
    {
        adptLine = tLine = lines[i];
        if ((index = tLine.indexOf("/**")) && (index >= 0))
        {
            adptLine = tLine.substring(0, index - 1);
            StringTool.addIfNotEmpty(rst, adptLine);
            while (i < len)
            {
                tLine = lines[i];
                if ((index = tLine.indexOf("*/")) && (index >= 0))
                {
                    adptLine = tLine.substring(index + 2);
                    StringTool.addIfNotEmpty(rst, adptLine);
                    break;
                }
                i++;
            }
        } else if (tLine.indexOf("//") >= 0)
        {
            if (StringTool.trim(tLine).indexOf("//") == 0)
            {
            } else
            {
                StringTool.addIfNotEmpty(rst, adptLine);
            }
        } else
        {
            StringTool.addIfNotEmpty(rst, adptLine);
        }
        i++;
    }
    return rst;
}

StringTool.removeCommentLineS = function (lines)
{
    var rst;
    rst = [];
    var i = 0;
    var tLine;
    var adptLine;
    i = 0;
    var len = 0;
    var index = 0;
    var tLineItem;
    len = lines.length;
    while (i < len)
    {
        tLineItem = lines[i];
        adptLine = tLine = tLineItem.lineStr;
        index = tLine.indexOf("/*");
        if (index >= 0)
        {
            adptLine = tLine.substring(0, index - 1);
            StringTool.addIfNotEmptyS(rst, adptLine, tLineItem);
            while (i < len)
            {
                tLineItem = lines[i];
                adptLine = tLine = tLineItem.lineStr;
                index = tLine.indexOf("*/");
                if (index >= 0)
                {
                    adptLine = tLine.substring(index + 2);
                    StringTool.addIfNotEmptyS(rst, adptLine, tLineItem);
                    break;
                }
                i++;
            }
        } else if (tLine.indexOf("//") >= 0)
        {
            if (StringTool.trim(tLine).indexOf("//") == 0)
            {
            } else
            {
                StringTool.addIfNotEmptyS(rst, adptLine, tLineItem);
            }
        } else
        {
            StringTool.addIfNotEmptyS(rst, adptLine, tLineItem);
        }
        i++;
    }
    return rst;
}

StringTool.addIfNotEmptyS = function (arr, str, lineItem)
{
    if (!str) return;
    var tStr;
    tStr = StringTool.trim(str);
    if (tStr != "")
    {
        arr.push(lineItem);
    }
}

StringTool.addIfNotEmpty = function (arr, str)
{
    if (!str) return;
    var tStr;
    tStr = StringTool.trim(str);
    if (tStr != "")
    {
        arr.push(str);
    }
}

StringTool.trimExt = function (str, vars)
{
    var rst;
    rst = StringTool.trim(str);
    var i = 0;
    var len = 0;
    len = vars.length;
    for (i = 0; i < len; i++)
    {
        rst = StringTool.getReplace(rst, vars[i], "");
    }
    return rst;
}

StringTool.getBetween = function (str, left, right, ifMax)
{
    (ifMax === void 0) && (ifMax = false);
    if (!str) return "";
    if (!left) return "";
    if (!right) return "";
    var lId = 0;
    var rId = 0;
    lId = str.indexOf(left);
    if (lId < 0) return "";
    if (ifMax)
    {
        rId = str.lastIndexOf(right);
        if (rId < lId) return "";
    } else
    {
        rId = str.indexOf(right, lId);
    }
    if (rId < 0) return "";
    return str.substring(lId + left.length, rId);
}

StringTool.getSplitLine = function (line, split)
{
    (split === void 0) && (split = " ");
    return line.split(split);
}

StringTool.getLeft = function (str, sign)
{
    var i = 0;
    i = str.indexOf(sign);
    return str.substr(0, i);
}

StringTool.getRight = function (str, sign)
{
    var i = 0;
    i = str.indexOf(sign);
    return str.substr(i + 1);
}

StringTool.delelteItem = function (arr)
{
    while (arr.length > 0)
    {
        if (arr[0] == "")
        {
            arr.shift();
        } else
        {
            break;
        }
    }
}

StringTool.getWords = function (line)
{
    var rst = StringTool.getSplitLine(line);
    StringTool.delelteItem(rst);
    return rst;
}

StringTool.getOLine = function (pos, lines, oLines)
{
    var tLine = lines[pos.line];
    return oLines.indexOf(tLine);
}

StringTool.getLines = function (posS, posE, lines, rawLines)
{
    var startLine = 0;
    startLine = posS.line;
    var endLine = 0;
    endLine = posE.line;
    if (rawLines)
    {
        startLine = StringTool.getOLine(posS, lines, rawLines);
        endLine = StringTool.getOLine(posE, lines, rawLines);
        lines = rawLines;
    }
    return StringTool.getLinesI(startLine, endLine, lines);
}

StringTool.getLinesI = function (startLine, endLine, lines)
{
    var i = 0;
    var rst = [];
    for (i = startLine; i <= endLine; i++)
    {
        rst.push(lines[i]);
    }
    return rst;
}

StringTool.structfy = function (str, inWidth, removeEmpty)
{
    (inWidth === void 0) && (inWidth = 4);
    (removeEmpty === void 0) && (removeEmpty = true);
    if (removeEmpty)
    {
        str = StringTool.trimEmptyLine(str);
    };
    var lines;
    var tIn = 0;
    tIn = 0;
    var tInStr;
    tInStr = StringTool.getEmptyStr(0);
    lines = str.split("\n");
    var i = 0;
    var len = 0;
    var tLineStr;
    len = lines.length;
    for (i = 0; i < len; i++)
    {
        tLineStr = lines[i];
        tLineStr = StringTool.trimLeft(tLineStr);
        tLineStr = StringTool.trimRight(tLineStr);
        tIn += StringTool.getPariCount(tLineStr);
        if (tLineStr.indexOf("}") >= 0)
        {
            tInStr = StringTool.getEmptyStr(tIn * inWidth);
        }
        tLineStr = tInStr + tLineStr;
        lines[i] = tLineStr;
        tInStr = StringTool.getEmptyStr(tIn * inWidth);
    }
    return lines.join("\n");
}

StringTool.getEmptyStr = function (width)
{
    if (!StringTool.emptyDic.hasOwnProperty(width))
    {
        var i = 0;
        var len = 0;
        len = width;
        var rst;
        rst = "";
        for (i = 0; i < len; i++)
        {
            rst += " ";
        }
        StringTool.emptyDic[width] = rst;
    }
    return StringTool.emptyDic[width];
}

StringTool.getPariCount = function (str, inChar, outChar)
{
    (inChar === void 0) && (inChar = "{");
    (outChar === void 0) && (outChar = "}");
    var varDic;
    varDic = {};
    varDic[inChar] = 1;
    varDic[outChar] = -1;
    var i = 0;
    var len = 0;
    var tChar;
    len = str.length;
    var rst = 0;
    rst = 0;
    for (i = 0; i < len; i++)
    {
        tChar = str.charAt(i);
        if (varDic.hasOwnProperty(tChar))
        {
            rst += varDic[tChar];
        }
    }
    return rst;
}

StringTool.readInt = function (str, startI)
{
    (startI === void 0) && (startI = 0);
    var rst = NaN;
    rst = 0;
    var tNum = 0;
    var tC;
    var i = 0;
    var isBegin = false;
    isBegin = false;
    var len = 0;
    len = str.length;
    for (i = startI; i < len; i++)
    {
        tC = str.charAt(i);
        if (Number(tC) > 0 || tC == "0")
        {
            rst = 10 * rst + Number(tC);
            if (rst > 0) isBegin = true;
        } else
        {
            if (isBegin) return rst;
        }
    }
    return rst;
}

StringTool.getReplace = function (str, oStr, nStr)
{
    if (!str) return "";
    str += "";
    var rst;
    rst = str.replace(new RegExp(oStr, "g"), nStr);
    return rst;
}

StringTool.getWordCount = function (str, findWord)
{
    var rg = new RegExp(findWord, "g")
    return str.match(rg).length;
}

StringTool.getResolvePath = function (path, basePath)
{
    if (StringTool.isAbsPath(path))
    {
        return path;
    };
    var tSign;
    tSign = "\\";
    if (basePath.indexOf("/") >= 0)
    {
        tSign = "/";
    }
    if (basePath.charAt(basePath.length - 1) == tSign)
    {
        basePath = basePath.substr(0, basePath.length - 1);
    };
    var parentSign;
    parentSign = ".." + tSign;
    var tISign;
    tISign = "." + tSign;
    var pCount = 0;
    pCount = StringTool.getWordCount(path, parentSign);
    path = StringTool.getReplace(path, parentSign, "");
    path = StringTool.getReplace(path, tISign, "");
    var i = 0;
    var len = 0;
    len = pCount;
    var iPos = 0;
    for (i = 0; i < len; i++)
    {
        basePath = StringTool.removeLastSign(path, tSign);
    }
    return basePath + tSign + path;
}

StringTool.isAbsPath = function (path)
{
    if (path.indexOf(":") >= 0) return true;
    return false;
}

StringTool.removeLastSign = function (str, sign)
{
    var iPos = 0;
    iPos = str.lastIndexOf(sign);
    str = str.substring(0, iPos);
    return str;
}

StringTool.getParamArr = function (str)
{
    var paramStr;
    paramStr = StringTool.getBetween(str, "(", ")", true);
    if (StringTool.trim(paramStr).length < 1) return [];
    return paramStr.split(",");
}

StringTool.nextIS = function (str, pos, lines)
{
    var tStr;
    var tLine;
    var i = 0;
    var len = 0;
    var tIndex = 0;
    tIndex = pos.index;
    len = lines.length;
    tStr = "";
    for (i = pos.line; i < len; i++)
    {
        tLine = lines[i];
        tStr += StringTool.trimLeft(tLine.lineStr.substr(tIndex));
        tIndex = 0;
        if (tStr.indexOf(str) == 0)
        {
            return true;
        } else
        {
            if (tStr.length > 0)
            {
                return false;
            }
        }
    }
    return false;
}

StringTool.findFirstMatchLineS = function (str, pos, lines)
{
    var i = 0;
    var len = 0;
    var tLine;
    var rst;
    len = lines.length;
    var tIndex = 0;
    if (!pos) pos = new PosItem();
    tIndex = pos.index;
    for (i = pos.line; i < len; i++)
    {
        tLine = lines[i].lineStr;
        tIndex = tLine.indexOf(str, tIndex);
        if (tIndex >= 0)
        {
            rst = new PosItem();
            rst.line = i;
            rst.index = tIndex;
            rst.oLine = lines[i].lineIndex;
            return rst;
        }
        tIndex = 0;
    }
    return rst;
}

StringTool.copyStr = function (str)
{
    return str.substring();
}

StringTool.findPair = function (l, r, pos, lines)
{
    var tCount = 0;
    var first = 0;
    var tPos;
    var rPos;
    var lPos;
    var valueDic;
    valueDic = {};
    valueDic[l] = 1;
    valueDic[r] = -1;
    tPos = StringTool.findFirstMatchLineS(l, pos, lines);
    var posList;
    posList = [];
    if (tPos)
    {
        setTPos(tPos, l);
        while (tCount > 0)
        {
            lPos = StringTool.findFirstMatchLineS(l, tPos, lines);
            rPos = StringTool.findFirstMatchLineS(r, tPos, lines);
            if (!lPos && !rPos)
            {
                break;
            }
            if (!lPos)
            {
                setTPos(rPos, r);
                continue;
            }
            if (!rPos)
            {
                setTPos(lPos, l);
                continue;
            }
            if (PosItem.pre(rPos, lPos))
            {
                setTPos(rPos, r);
            } else
            {
                setTPos(lPos, l);
            }
        }
        if (tCount == 0)
        {
            return posList;
        } else
        {
            return null;
        }
    }
    return null;
    function setTPos(pos, str)
    {
        tPos = pos;
        tPos.str = str;
        tPos.index++;
        posList.push(tPos);
        tCount += valueDic[str];
    }
}

StringTool.ArrayToString = function (arr)
{
    var rst;
    rst = "[{items}]".replace(new RegExp("\\{items\\}", "g"), StringTool.getArrayItems(arr));
    return rst;
}

StringTool.getArrayItems = function (arr)
{
    var rst;
    if (arr.length < 1) return "";
    rst = StringTool.parseItem(arr[0]);
    var i = 0;
    var len = 0;
    len = arr.length;
    for (i = 1; i < len; i++)
    {
        rst += "," + StringTool.parseItem(arr[i]);
    }
    return rst;
}

StringTool.parseItem = function (item)
{
    var rst;
    rst = "\"" + item + "\"";
    return "";
}

import {StringTool} from "./StringTool";
import {FileManager} from "./FileManager";

export var FileTools:any={};


    FileTools.getSep = function ()
    {
        return FileTools.path.sep;
    }

    FileTools.getPathSep = function (path)
    {
        var rst;
        rst = "/";
        if (path.indexOf(rst) >= 0) return rst;
        rst = "\\";
        if (path.indexOf(rst) >= 0) return rst;
        return FileTools.getSep();
    }

    FileTools.getAbsPath = function (path)
    {
        return path;
    }

    FileTools.isAbsPath = function (path)
    {
        if (!path) return false;
        if (path.indexOf(":") > 0) return true;
        if (path.substr(0, 1) == "/") return true;
        return false;
    }

    FileTools.getPath = function (basePath, relativePath)
    {
        return FileTools.path.join(basePath, relativePath);
    }

    FileTools.getRelativePath = function (basePath, targetPath)
    {
        return FileTools.path.relative(basePath, targetPath);
    }

    FileTools.getAppPath = function (path)
    {
        return FileTools.getPath(FileTools.appPath, path);
    }

    FileTools.getAppRelativePath = function (path)
    {
        return FileTools.getRelativePath(FileTools.appPath, path);
    }

    FileTools.getWorkPath = function (path)
    {
        return FileTools.getPath(FileTools.workPath, path);
    }

    FileTools.getWorkRelativePath = function (path)
    {
        return FileTools.getRelativePath(FileTools.workPath, path);
    }

    FileTools.getFileDir = function (path)
    {
        if (!path) return path;
        if (FileTools.isDirectory(path)) return path;
        return FileTools.path.dirname(path);
    }

    FileTools.getParent = function (path)
    {
        if (!path) return path;
        var lasti = 0;
        lasti = path.lastIndexOf(FileTools.path.sep);
        return path.substring(0, lasti);
    }

    FileTools.getFileName = function (path)
    {
        return FileManager.getFileName(path);
    }

    FileTools.getFileNameWithExtension = function (path)
    {
        if (path == null)
            return null;
        var a = path.split(FileTools.path.sep);
        var file = a[a.length - 1];
        return file;
    }

    FileTools.getExtensionName = function (path)
    {
        if (path == null)
            return null;
        var a = path.split(".");
        var file = a[a.length - 1];
        return file;
    }

    FileTools.createDirectory = function (path)
    {
        if (Boolean(path))
        {
            FileTools.ensurePath(path);
            if (!FileTools.fs.existsSync(path))
            {
                FileTools.fs.mkdirSync(path);
            }
        }
    }

    FileTools.ensurePath = function (pathStr)
    {
        FileTools.mkdirsSync(pathStr, null);
        return;
        if (pathStr == null) return;
        var sep;
        sep = FileTools.path.sep;
        var a = pathStr.split(sep);
        var i = 0, len = 0;
        var tPath;
        tPath = a[0];
        len = a.length - 1;
        for (i = 1; i < len; i++)
        {
            tPath += sep + a[i];
            if (!FileTools.exist(tPath))
            {
                FileTools.createDirectory(tPath);
            }
        }
    }

    FileTools.mkdirsSync = function (dirpath, mode)
    {
        if (!FileTools.fs.existsSync(dirpath))
        {
            var pathtmp;
            var pathParts = dirpath.split(FileTools.getPathSep(dirpath));
            pathParts.pop();
            // var onWindows = Browser.userAgent.indexOf("Windows") > -1;
            var onWindows = false;
            if (!onWindows)
            {
                pathtmp = "/" + pathParts[1];
                pathParts.splice(0, 2);
            }
            pathParts.forEach(function (dirname)
            {
                if (pathtmp)
                {
                    pathtmp = FileTools.path.join(pathtmp, dirname);
                }
                else
                {
                    pathtmp = dirname;
                }
                if (!FileTools.fs.existsSync(pathtmp))
                {

                    if (!FileTools.fs.mkdirSync(pathtmp, mode))
                    {
                        return false;
                    }
                }
            });
        }
        return true;
    }

    FileTools.createFile = function (path, value)
    {
        FileTools.ensurePath(path);
        FileTools.fs.writeFileSync(path, value);
    }

    FileTools.toBuffer = function (ab)
    {
        var buffer = new Buffer(ab.byteLength);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i)
        {
            buffer[i] = view[i];
        }
        return buffer;
    }

    FileTools.readFile = function (path, encoding)
    {
        (encoding === void 0) && (encoding = "utf8");
        if (FileTools.fs.existsSync(path))
        {
            var rst;
            rst = FileTools.fs.readFileSync(path, encoding);
            if (((typeof rst == 'string')) && rst.charCodeAt(0) == 65279 && encoding == "utf8")
            {
                rst = rst.substr(1);
            }
            return rst;
        }
        return null;
    }

    FileTools.appendFile = function (path, data)
    {
        FileTools.fs.appendFileSync(path, data);
    }

    FileTools.moveToTrash = function (path)
    {
        if (FileTools.exist(path))
        {
            if (FileTools.shell)
            {
                FileTools.shell.moveItemToTrash(path);
            } else
            {
                FileTools.removeE(path, false);
            }
        }
    }

    FileTools.removeFile = function (path, toTrash)
    {
        (toTrash === void 0) && (toTrash = true);
        if (toTrash)
        {
            FileTools.moveToTrash(path);
            return;
        }
        if (Boolean(path))
        {
            FileTools.fs.unlinkSync(path)
        }
    }

    FileTools.removeE = function (path, toTrash)
    {
        (toTrash === void 0) && (toTrash = true);
        if (!FileTools.exist(path))
            return;
        if (FileTools.isDirectory(path))
        {
            FileTools.removeDir(path, toTrash);
        }
        else
        {
            FileTools.removeFile(path, toTrash);
        }
    }

    FileTools.removeDir = function (path, toTrash)
    {
        (toTrash === void 0) && (toTrash = true);
        if (toTrash)
        {
            FileTools.moveToTrash(path);
            return;
        };
        var files = [];
        if (FileTools.fs.existsSync(path))
        {
            files = FileTools.fs.readdirSync(path);
            files.forEach(function (file, index)
            {
                var curPath = FileTools.getPath(path, file);
                if (FileTools.fs.statSync(curPath).isDirectory())
                {
                    FileTools.removeDir(curPath);
                }
                else
                {
                    FileTools.fs.unlinkSync(curPath);
                }
            });
            FileTools.fs.rmdirSync(path);
        }
    }

    FileTools.exist = function (path)
    {
        if (!path) return false;
        return FileTools.fs.existsSync(path);
    }

    FileTools.isDirSimple = function (path)
    {
        if (!path) return false;
        path = FileTools.adptToCommonUrl(path);
        var arrs;
        arrs = path.split("/");
        return arrs[arrs.length - 1].indexOf(".") < 0;
    }
FileTools.adptToCommonUrl = function (url)
{
    return StringTool.getReplace(url, "\\\\", "/");
}
    FileTools.isDirectory = function (path)
    {
        path = FileTools.adptToCommonUrl(path);
        var st;
        try
        {
            st = FileTools.fs.statSync(path);
        } catch (e)
        {
            return FileTools.isDirSimple(path);
            return false;
        }
        if (!st) return false;
        return st.isDirectory();
    }

    FileTools.getStat = function (path)
    {
        return FileTools.fs.statSync(path);
    }

    FileTools.getMTime = function (path)
    {
        if (!FileTools.exist(path)) return "";
        return FileTools.getStat(path).mtime;
    }

    FileTools.watch = function (path, callBack)
    {
        FileTools.watcherDic[path] = FileTools.fs.watch(path, callBack);
        return FileTools.watcherDic[path];
    }

    FileTools.isDirWatched = function (path)
    {
        return FileTools.watcherDic.hasOwnProperty(path);
    }

    FileTools.unwatch = function (path)
    {
        if (FileTools.watcherDic[path])
        {
            FileTools.watcherDic[path].close();
            delete FileTools.watcherDic[path];
        }
    }

    FileTools.copyE = function (from, to)
    {
        if (!FileTools.exist(from))
            return;
        if (FileTools.isDirectory(from))
        {
            FileTools.copyDir(from, to);
        }
        else
        {
            FileTools.copyFile(from, to);
        }
    }

    FileTools.copyFile = function (from, to)
    {
        FileTools.createFile(to, FileTools.readFile(from, null));
    }

    FileTools.copyDir = function (from, to)
    {
        var files = [];
        if (FileTools.fs.existsSync(from))
        {
            FileTools.createDirectory(to);
            files = FileTools.fs.readdirSync(from);
            files.forEach(function (file, index)
            {
                var curPath = FileTools.getPath(from, file);
                var tPath = FileTools.getPath(to, file);
                if (FileTools.fs.statSync(curPath).isDirectory())
                {
                    FileTools.copyDir(curPath, tPath);
                }
                else
                {
                    FileTools.copyFile(curPath, tPath);
                }
            });
        }
    }

    FileTools.walk = function (path, floor, handleFile, self)
    {
        (self === void 0) && (self = false);
        if (self)
            handleFile(path, floor);
        floor++;
        var files = FileTools.fs.readdirSync(path);
        files.forEach(function (item)
        {
            var tmpPath = FileTools.getPath(path, item);
            if (tmpPath.indexOf(".svn") > -1)
                return;
            var stats = FileTools.fs.statSync(tmpPath);
            if (stats.isDirectory())
            {
                FileTools.walk(tmpPath, floor, handleFile);
            }
            else
            {
                handleFile(tmpPath, floor);
            }
        });
    }

    FileTools.getFileList = function (path)
    {
        var arr = [];
        if (!FileTools.exist(path)) return arr;
        FileTools.walk(path, 0, findFiles);
        function findFiles(spath, floor)
        {
            arr.push(spath);
        }
        return arr;
    }

    FileTools.getFileDesO = function (path)
    {
        if (!FileTools.exist(path))
            return null;
        var rst:any = {};
        rst.label = FileTools.getFileName(path);
        rst.path = path;
        if (FileTools.isDirectory(path))
        {
            rst.files = [];
            rst.dirs = [];
            rst.childs = [];
            rst.isDirectory = true;
        } else
        {
            rst.isDirectory = false;
        }
        return rst;
    }

    FileTools.getDirChildDirs = function (p)
    {
        var files =  FileTools.getDirFiles(p);
        var i = 0, len = 0;
        var rst;
        rst = [];
        len = files.length;
        for (i = 0; i < len; i++)
        {
            files[i] = FileTools.path.join(p, files[i]);
            if (FileTools.isDirectory(files[i]))
            {
                rst.push(files[i]);
            }
        }
        return rst;
    }

    FileTools.getDirFiles = function (path)
    {
        var rst;
        rst = FileTools.fs.readdirSync(path);
        rst.sort(FileTools.folderFirst);
        return rst;
    }

    FileTools.folderFirst = function (pathA, pathB)
    {
        var isFolderA = false;
        isFolderA = pathA.indexOf(".") < 0;
        var isFolderB = false;
        isFolderB = pathB.indexOf(".") < 0;
        var right = -1;
        if (isFolderA)
        {
            if (!isFolderB)
            {
                return right;
            }
            return pathA < pathB ? right : -right;
        }
        if (isFolderB)
        {
            return -right;
        }
        return pathA < pathB ? right : -right;
    }

    FileTools.getFileTreeArr = function (path)
    {
        var tTreeO = FileTools.getFileTreeO(path);
        var rst = [];
        FileTools.getTreeArr(tTreeO, rst, false);
        return rst;
    }

    FileTools.getTreeArr = function (treeO, arr, add)
    {
        (add === void 0) && (add = true);
        if (add)
            arr.push(treeO);
        var tArr = treeO.childs;
        var i = 0, len = tArr.length;
        for (i = 0; i < len; i++)
        {
            if (!add)
            {
                tArr[i].nodeParent = null;
            }
            if (tArr[i].isDirectory)
            {
                FileTools.getTreeArr(tArr[i], arr);
            } else
            {
                arr.push(tArr[i]);
            }
        }
    }

    FileTools.getFileTreeO = function (path)
    {
        var rst = FileTools.getFileDesO(path);
        if (FileTools.fs.existsSync(path))
        {
            var files = FileTools.getDirFiles(path);
            var tO;
            files.forEach(function (file, index)
            {
                var curPath = FileTools.getPath(path, file);
                if (FileTools.fs.statSync(curPath).isDirectory())
                {
                    tO = FileTools.getFileTreeO(curPath);
                    tO.nodeParent = rst;
                    tO.hasChild = tO.childs.length > 0;
                    rst.dirs.push(tO);
                }
                else
                {
                    tO = FileTools.getFileDesO(curPath);
                    tO.nodeParent = rst;
                    tO.hasChild = false;
                    rst.files.push(tO);
                }
                tO.label = file;
                rst.childs.push(tO);
            });
            rst.hasChild = rst.childs.length > 0;
        }
        return rst;
    }

    FileTools.isPathSame = function (a, b)
    {
        if (a.toLocaleLowerCase() == b.toLocaleLowerCase()) return true;
        return false;
    }

    FileTools.rename = function (oldPath, newPath)
    {
        if (!FileTools.exist(oldPath))
            return;
        if (FileTools.isPathSame(oldPath, newPath))
        {
            console.error("在移动文件到同一个位置！！");
            return;
        }
        FileTools.copyE(oldPath, newPath);
        FileTools.moveToTrash(oldPath);
        return;
        FileTools.fs.renameSync(oldPath, newPath);
    }

    FileTools.openItem = function (path)
    {
        FileTools.shell.openItem(path);
    }

    FileTools.showItemInFolder = function (path)
    {
        FileTools.shell.showItemInFolder(path);
    }

    FileTools.getFolder = function (path)
    {
        path = StringTool.getReplace(path, "\\\\", "/");
        var idx = 0;
        idx = path.lastIndexOf(".");
        if (idx >= 0)
        {
            idx = path.lastIndexOf("/", idx);
            if (idx >= 0)
            {
                path = path.substr(0, idx);
            }
        }
        return path;
    }

    FileTools.win = null
    FileTools.fs = require("fs")
    FileTools.path = require("path")
    FileTools.shell = null
    FileTools.tempApp = null
    FileTools.watcherDic = {};

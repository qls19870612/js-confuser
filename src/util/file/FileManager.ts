import {FileTools} from "./FileTools";
import {Sys} from "./Sys";

import {StringTool} from "./StringTool";


class _FileManager
{
    public getPath(basePath, relativePath): any
    {
        return FileTools.getPath(basePath, relativePath);
    }

    public getRelativePath(basePath, targetPath): any
    {
        return FileManager.adptToCommonUrl(FileTools.getRelativePath(basePath, targetPath));
    }


    public getDataPath(path): any
    {
        // return FileManager.getPath(Device.dataPath, path);
    }





    public adptToCommonUrl(url): any
    {
        return StringTool.getReplace(url, "\\\\", "/");
    }

    public adptToLocalUrl(url): any
    {
        return FileTools.path.normalize(url);
    }



    public getFileName(path): any
    {
        return FileTools.path.basename(path).split(".")[0];
    }

    public createDirectory(path): any
    {
        try
        {
            FileTools.createDirectory(path);
        } catch (e)
        {
            Sys.alert("Create folder failed:" + path);
        }
    }

    public createTxtFile(path, value): any
    {
        try
        {
            FileTools.createFile(path, value);
        } catch (e)
        {
            Sys.alert("Create file failed:" + path);
        }
    }

    public createJSONFile(path, value): any
    {
        try
        {
            FileTools.createFile(path, JSON.stringify(value));
        } catch (e)
        {
            Sys.alert("Create file failed:" + path);
        }
    }

    public createBytesFile(path, bytes): any
    {
        try
        {
            FileTools.createFile(path, bytes);
        } catch (e)
        {
            Sys.alert("Create file failed:" + path);
        }
    }

    public removeFile(path): any
    {
        FileTools.removeE(path);
    }

    public copyFile(from, to): any
    {
        try
        {
            FileTools.copyE(from, to);
        } catch (e)
        {
            Sys.alert("Copy file failed:(from:" + from + " to:" + to + ")");
            console.log("Copy file failed:(from:" + from + " to:" + to + ")");
        }
    }

    public readTxtFile(path, errorAlert = null): any
    {
        (errorAlert === null) && (errorAlert = true);
        try
        {
            return FileTools.readFile(path);
        } catch (e)
        {
            if (errorAlert) Sys.alert("Read file failed:" + path);
        }
        return null;
    }

    // @ts-ignore
    public readJSONFile(path, errorAlert = null): any
    {
        (errorAlert === null) && (errorAlert = true);
        try
        {
            // @ts-ignore
            var str = this.readTxtFile(path);
            return JSON.parse(str);
        } catch (e)
        {
            if (errorAlert) Sys.alert("Read file failed:" + path);
            debugger;
        }
        return null;
    }

    public readByteFile(path, errorAlert = null): any
    {
        (errorAlert === null) && (errorAlert = true);
        try
        {
            return FileTools.readFile(path);
        } catch (e)
        {
            if (errorAlert) Sys.alert("Read file failed:" + path);
        }
        return null;
    }

    public getFileList(path): any
    {
        return FileTools.getFileList(path);
    }

    public exists(path): any
    {
        return FileTools.exist(path);
    }

    public getFileTree(path, hasExtension = null): any
    {
        // (hasExtension === null) && (hasExtension = false);
        // var xml = findFiles(path);
        // function findFiles(path)
        // {
        //     var node;
        //     if (FileTools.exist(path))
        //     {
        //         var fileName = FileTools.getFileName(path);
        //         node = new XMLElement("<item label='" + fileName + "' path='" + path + "' isDirectory='true'/>");
        //         var a = FileTools.getDirFiles(path);
        //         var f;
        //         for (var $each_f in a)
        //         {
        //             f = a[$each_f];
        //             f = FileTools.getPath(path, f);
        //             if (FileTools.isDirectory(f) && f.indexOf(".svn") == -1)
        //             {
        //                 node.appendChild(findFiles(f));
        //             }
        //         }
        //         var $each_f;
        //         for ($each_f in a)
        //         {
        //             f = a[$each_f];
        //             f = FileTools.getPath(path, f);
        //             if (FileTools.isDirectory(f) == false)
        //             {
        //                 if (fileName.indexOf("$") == -1 && fileName.indexOf("@") == -1)
        //                 {
        //                     node.appendChild(new XMLElement("<item label='" + fileName + "' path='" + f + "' isDirectory='false'/>"));
        //                 }
        //             }
        //         }
        //     }
        //     return node;
        // }
        // return xml
        return null;
    }

    public rename(oldPath, newPath): any
    {
        try
        {
            FileTools.rename(oldPath, newPath);
        } catch (e)
        {
            alert("Rename file failed:(from:" + oldPath + " to:" + newPath + ")");
        }
    }
}

export var FileManager: _FileManager = new _FileManager();


// @ts-ignore

import JsConfuser from "./src/index";
import {FileManager} from "./src/util/file/FileManager"

import Encoding from "./src/transforms/string/encoding";
import {ok} from "assert";
import {compileJsSync} from "./src/compiler";
import parseJS from "./src/parser";
import {ObfuscateOrder} from "./src/order";




// let rawFile = "./res/test.js"
// let rawFile = "./res/lib.js"
// let rawFile = "./res/bundle.js"
// let rawFile = "./res/test.js"
// let rawFile = "./res/ReleaseLoader.js"
// let rawFile = "./res/bundle.js"
// let rawFile = "D:\\workspace\\jsmix/code.js"
let rawFile = "./res/miniGame.js"
let path = require("path");

let fileName = path.basename(rawFile);
let fileNameNoExt = fileName.replace(".js","");
let stepFolder = rawFile.replace(".js", "_ts/");
stepFolder = path.resolve(stepFolder) + "\\";
exec(1);
async function exec(count: number)
{
    if (count <= 0)
    {
        return
    }
    let txt = FileManager.readTxtFile(rawFile)

    var start = new Date();
    console.log("startDate:" + start.toTimeString())


        var tree = await parseJS(txt);

        let result = compileJsSync(tree, {target: "browser", preset: "low", indent: "tabs"});
        FileManager.createTxtFile(stepFolder + fileNameNoExt+ "_prev.js" , result);
        let json = JSON.stringify(tree,null,4);
        FileManager.createTxtFile(stepFolder + fileNameNoExt+ ".json" , json);

    JsConfuser.obfuscate(txt, {
        target: "browser",
        preset: "low",
        // controlFlowFlattening:true,
        // hexadecimalNumbers:false,
        // stringConcealing:false,
        // stringConcealing:false,
        // indent: "tabs",
        // identifierGenerator:"mangled",
        stack:true,
        // dispatcher:true
    }, (completed, total, transform, tree) =>
    {
        if (transform.priority == ObfuscateOrder.Preparation) {
            let json = JSON.stringify(tree,null,4);
            FileManager.createTxtFile(stepFolder +   transform.className + ".json", json);
        }
        let result = compileJsSync(tree, {target: "browser", preset: "low", indent: "tabs", identifierGenerator:"mangled"});
        FileManager.createTxtFile(stepFolder +   transform.priority + "_" + transform.className + ".js", result);
    }).then(obfuscated =>
    {
        var end = new Date();
        console.log("endDate:%s", end.toTimeString());
        console.log(" end.getTime - start.getTime:%s", (end.getTime() - start.getTime()).toFixed(3));
        // console.log(obfuscated)
        FileManager.createTxtFile(stepFolder + fileNameNoExt + ".js", obfuscated);
        exec(--count);
    })
}


// let d = require("./bin/unzip.min").d;
// let bytes = FileManager.readTxtFile("D:\\workspace\\SpriteTT\\game\\wxlocal/string.zipB64");
// let start = new Date().getTime();
//
// let res = d(bytes);
//
// let end = new Date().getTime();
// console.log(" res:%s", res.substring(0,Math.min(100,res.length)));
// console.log(" end.start:%s", end - start);
// console.log(" self:%s", self);
// rawFile = "./bin/ReleaseLoader.js"
// let txt = FileManager.readTxtFile(rawFile)
//
//
// var g=typeof window==='object'&&window||typeof self==='object'&&self||exports;(function(c){if(c.atob){return}var f='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',d=function(i){var h={};for(var j=0,k=i.length;j<k;j++)h[i.charAt(j)]=j;return h}(f),b=String.fromCharCode,a=function(j){var h=j.length,i=h%4,k=(h>0?d[j.charAt(0)]<<18:0)|(h>1?d[j.charAt(1)]<<12:0)|(h>2?d[j.charAt(2)]<<6:0)|(h>3?d[j.charAt(3)]:0),l=[b(k>>>16),b(k>>>8&255),b(k&255)];l.length-=[0,0,2,1][i];return l.join('')},e=function(h){return h.replace(/\S{1,4}/g,a)};c.atob=function(h){return e(String(h).replace(/[^A-Za-z0-9\+\/]/g,''))}}(g),function(a){var x=8,z=true,y=void 0;function u(B){throw B}function m(D,B){var C,E;this.input=D,this.c=0;if(B||!(B={})){B.index&&(this.c=B.index),B.verify&&(this.N=B.verify)}C=D[this.c++],E=D[this.c++];switch(C&15){case x:this.method=x}0!==((C<<8)+E)%31&&u(Error('err:'+((C<<8)+E)%31)),E&32&&u(Error('not')),this.B=new l(D,{index:this.c,bufferSize:B.bufferSize,bufferType:B.bufferType,resize:B.resize})}m.prototype.p=function(){var D=this.input,B,C;B=this.B.p(),this.c=this.B.c,this.N&&(C=(D[this.c++]<<24|D[this.c++]<<16|D[this.c++]<<8|D[this.c++])>>>0,C!==jb(B)&&u(Error('invalid adler-32 checksum')));return B};var b=0,r=1;function l(C,B){this.l=[],this.m=32768,this.e=this.g=this.c=this.q=0,this.input=d?new Uint8Array(C):C,this.s=false,this.n=r,this.C=false;if(B||!(B={})){B.index&&(this.c=B.index),B.bufferSize&&(this.m=B.bufferSize),B.bufferType&&(this.n=B.bufferType),B.resize&&(this.C=B.resize)}switch(this.n){case b:this.b=32768,this.a=new(d?Uint8Array:Array)(32768+this.m+258);break;case r:this.b=0,this.a=new(d?Uint8Array:Array)(this.m),this.f=this.K,this.t=this.I,this.o=this.J;break;default:u(Error('invalid mode'))}}l.prototype.K=function(E){var B,D=this.input.length/this.c+1|0,F,C,G,g=this.input,H=this.a;E&&('number'===typeof E.v&&(D=E.v),'number'===typeof E.G&&(D+=E.G)),2>D?(F=(g.length-this.c)/this.u[2],G=258*(F/2)|0,C=G<H.length?H.length+G:H.length<<1):C=H.length*D,d?(B=new Uint8Array(C),B.set(H)):B=H;return this.a=B},l.prototype.I=function(){var C,B=this.b;d?this.C?(C=new Uint8Array(B),C.set(this.a.subarray(0,B))):C=this.a.subarray(0,B):(this.a.length>B&&(this.a.length=B),C=this.a);return this.buffer=C},l.prototype.J=function(E,B){var D=this.a,F=this.b;this.u=E;for(var C=D.length,G,g,H,I;256!==(G=n(this,E));)if(256>G){F>=C&&(D=this.f(),C=D.length),D[F++]=G}else{g=G-257,I=t[g],0<s[g]&&(I+=o(this,s[g])),G=n(this,B),H=A[G],0<c[G]&&(H+=o(this,c[G])),F+I>C&&(D=this.f(),C=D.length);for(;I--;)D[F]=D[F++-H]}for(;8<=this.e;)this.e-=8,this.c--;this.b=F};function k(E){var B=E.length,D=0,F=Number.POSITIVE_INFINITY,C,G,g,H,I,K,M,N,L,J;for(N=0;N<B;++N)E[N]>D&&(D=E[N]),E[N]<F&&(F=E[N]);C=1<<D,G=new(d?Uint32Array:Array)(C),g=1,H=0;for(I=2;g<=D;){for(N=0;N<B;++N)if(E[N]===g){K=0,M=H;for(L=0;L<g;++L)K=K<<1|M&1,M>>=1;J=g<<16|N;for(L=K;L<C;L+=I)G[L]=J;++H}++g,H<<=1,I<<=1}return[G,D,F]};function n(F,B){for(var E=F.g,G=F.e,D=F.input,H=F.c,g=D.length,I=B[0],J=B[1],K,C;G<J&&!(H>=g);)E|=D[H++]<<G,G+=8;K=I[E&(1<<J)-1],C=K>>>16,F.g=E>>C,F.e=G-C,F.c=H;return K&65535}function w(E){function B(B,C,D){var E,F=this.z,G,g;for(g=0;g<B;)Z:switch(E=n(this,C),E){case 16:for(G=3+o(this,2);G--;)D[g++]=F;break Z;case 17:for(G=3+o(this,3);G--;)D[g++]=0;F=0;break Z;case 18:for(G=11+o(this,7);G--;)D[g++]=0;F=0;break Z;default:F=D[g++]=E}this.z=F;return D}var D=o(E,5)+257,F=o(E,5)+1,C=o(E,4)+4,G=new(d?Uint8Array:Array)(v.length),g,H,I,J;for(J=0;J<C;++J)G[v[J]]=o(E,3);if(!d){J=C;for(C=G.length;J<C;++J)G[v[J]]=0}g=k(G),H=new(d?Uint8Array:Array)(D),I=new(d?Uint8Array:Array)(F),E.z=0,E.o(k(B.call(E,D,g,H)),k(B.call(E,F,g,I)))}function o(E,B){for(var D=E.g,F=E.e,C=E.input,G=E.c,g=C.length,H;F<B;)G>=g&&u(Error('broken')),D|=C[G++]<<F,F+=8;H=D&(1<<B)-1,E.g=D>>>B,E.e=F-B,E.c=G;return H}l.prototype.p=function(){for(;!this.s;){var E=o(this,3);E&1&&(this.s=z),E>>>=1;K:switch(E){case 0:var B=this.input;var D=this.c;var F=this.a;var C=this.b;var G=B.length;var g=y;var H=y;var I=F.length;var J=y;this.e=this.g=0,D+1>=G&&u(Error('invalid LEN')),g=B[D++]|B[D++]<<8,D+1>=G&&u(Error('invalid NLEN')),H=B[D++]|B[D++]<<8,g===~H&&u(Error('invalid header')),D+g>B.length&&u(Error('input broken'));R:switch(this.n){case b:for(;C+g>F.length;){J=I-C,g-=J;if(d){F.set(B.subarray(D,D+J),C),C+=J,D+=J}else{for(;J--;)F[C++]=B[D++]}this.b=C,F=this.f(),C=this.b}break R;case r:for(;C+g>F.length;)F=this.f({v:2});break R;default:u(Error('invalid mode'))}if(d){F.set(B.subarray(D,D+g),C),C+=g,D+=g}else{for(;g--;)F[C++]=B[D++]}this.c=D,this.b=C,this.a=F;break K;case 1:this.o(Ca,Da);break K;case 2:w(this);break K;default:u(Error('unknown BTYPE: '+E))}}return j(this.t())};var d='undefined'!==typeof Uint8Array&&'undefined'!==typeof Uint16Array&&'undefined'!==typeof Uint32Array&&'undefined'!==typeof DataView,i=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],v=d?new Uint16Array(i):i,h=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],t=d?new Uint16Array(h):h,f=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],s=d?new Uint8Array(f):f,e=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],A=d?new Uint16Array(e):e,q=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],c=d?new Uint8Array(q):q;function j(D){var G,E,C,B,H,F;G='',C=D.length,E=0;while(E<C){B=D[E++];W:switch(B>>4){case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:G+=String.fromCharCode(B);break W;case 12:case 13:H=D[E++],G+=String.fromCharCode((B&31)<<6|H&63);break W;case 14:H=D[E++],F=D[E++],G+=String.fromCharCode((B&15)<<12|(H&63)<<6|(F&63)<<0);break W}}return G}a.d=function(C){let D=new m(new Uint8Array(a.atob(C).split('').map(E=>E.charCodeAt(0)))),B=D.p();return B}}(g))
//
//
// let start = new Date().getTime();
// let raw = g.d(txt);
// console.log(" new.Date.getTime.start:%s", new Date().getTime() - start);
// console.log(" raw:%s", raw.length);

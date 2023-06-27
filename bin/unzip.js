var g = typeof window==="object"&&window||typeof self==="object"&&self||exports;
(function (exports){
    var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    var b64tab = function(bin) {

        var t = {};

        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;

        return t;

    }(b64chars);
    var fromCharCode = String.fromCharCode;
    var cb_decode = function(cccc) {

        var len = cccc.length,

            padlen = len % 4,

            n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)

                | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)

                | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)

                | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),

            chars = [

                fromCharCode( n >>> 16),

                fromCharCode((n >>>  8) & 0xff),

                fromCharCode( n         & 0xff)

            ];

        chars.length -= [0, 0, 2, 1][padlen];

        return chars.join('');

    };

    var _atob =  function(a){

        return a.replace(/\S{1,4}/g, cb_decode);

    };
    exports.atob = function(a) {
        return _atob(String(a).replace(/[^A-Za-z0-9\+\/]/g, ''));
    };
})(g);
(function (pp) {
    var lb = 8;
    var x = !0;
    var v = void 0;

    function l(d) {
        throw d;
    }

    function kb(d, a) {
        var c, e;
        this.input = d;
        this.c = 0;
        if (a || !(a = {}))
            a.index && (this.c = a.index), a.verify && (this.N = a.verify);
        c = d[this.c++];
        e = d[this.c++];
        switch (c & 15) {
            case lb:
                this.method = lb;
                break;
        }
        0 !== ((c << 8) + e) % 31 && l(Error("err:" + ((c << 8) + e) % 31));
        e & 32 && l(Error("not"));
        this.B = new T(d, {
            index: this.c,
            bufferSize: a.bufferSize,
            bufferType: a.bufferType,
            resize: a.resize
        })
    }

    kb.prototype.p = function () {
        var d = this.input, a, c;
        a = this.B.p();
        this.c = this.B.c;
        this.N && (c = (d[this.c++] << 24 | d[this.c++] << 16 | d[this.c++] << 8 | d[this.c++]) >>> 0, c !== jb(a) && l(Error("invalid adler-32 checksum")));
        return a
    };
    var Aa = 0, za = 1;

    function T(d, a) {
        this.l = [];
        this.m = 32768;
        this.e = this.g = this.c = this.q = 0;
        this.input = F ? new Uint8Array(d) : d;
        this.s = !1;
        this.n = za;
        this.C = !1;
        if (a || !(a = {}))
            a.index && (this.c = a.index), a.bufferSize && (this.m = a.bufferSize), a.bufferType && (this.n = a.bufferType), a.resize && (this.C = a.resize);
        switch (this.n) {
            case Aa:
                this.b = 32768;
                this.a = new (F ? Uint8Array : Array)(32768 + this.m + 258);
                break;
            case za:
                this.b = 0;
                this.a = new (F ? Uint8Array : Array)(this.m);
                this.f = this.K;
                this.t = this.I;
                this.o = this.J;
                break;
            default:
                l(Error("invalid mode"))
        }
    }

    T.prototype.K = function (d) {
        var a, c = this.input.length / this.c + 1 | 0, e, b, f, g = this.input, h = this.a;
        d && ("number" === typeof d.v && (c = d.v), "number" === typeof d.G && (c += d.G));
        2 > c ? (e = (g.length - this.c) / this.u[2], f = 258 * (e / 2) | 0, b = f < h.length ? h.length + f : h.length << 1) : b = h.length * c;
        F ? (a = new Uint8Array(b), a.set(h)) : a = h;
        return this.a = a
    };
    T.prototype.I = function () {
        var d, a = this.b;
        F ? this.C ? (d = new Uint8Array(a), d.set(this.a.subarray(0, a))) : d = this.a.subarray(0, a) : (this.a.length > a && (this.a.length = a), d = this.a);
        return this.buffer = d
    };
    T.prototype.J = function (d, a) {
        var c = this.a, e = this.b;
        this.u = d;
        for (var b = c.length, f, g, h, k; 256 !== (f = ib(this, d));)
            if (256 > f)
                e >= b && (c = this.f(), b = c.length), c[e++] = f; else {
                g = f - 257;
                k = Wa[g];
                0 < Ya[g] && (k += Y(this, Ya[g]));
                f = ib(this, a);
                h = $a[f];
                0 < bb[f] && (h += Y(this, bb[f]));
                e + k > b && (c = this.f(), b = c.length);
                for (; k--;)
                    c[e] = c[e++ - h]
            }
        for (; 8 <= this.e;)
            this.e -= 8, this.c--;
        this.b = e
    };

    function R(d) {
        var a = d.length, c = 0, e = Number.POSITIVE_INFINITY, b, f, g, h, k, n, q, r, p, m;
        for (r = 0; r < a; ++r)
            d[r] > c && (c = d[r]), d[r] < e && (e = d[r]);
        b = 1 << c;
        f = new (F ? Uint32Array : Array)(b);
        g = 1;
        h = 0;
        for (k = 2; g <= c;) {
            for (r = 0; r < a; ++r)
                if (d[r] === g) {
                    n = 0;
                    q = h;
                    for (p = 0; p < g; ++p)
                        n = n << 1 | q & 1, q >>= 1;
                    m = g << 16 | r;
                    for (p = n; p < b; p += k)
                        f[p] = m;
                    ++h
                }
            ++g;
            h <<= 1;
            k <<= 1
        }
        return [f, c, e]
    };

    function ib(d, a) {
        for (var c = d.g, e = d.e, b = d.input, f = d.c, g = b.length, h = a[0], k = a[1], n, q; e < k && !(f >= g);)
            c |= b[f++] << e, e += 8;
        n = h[c & (1 << k) - 1];
        q = n >>> 16;
        d.g = c >> q;
        d.e = e - q;
        d.c = f;
        return n & 65535
    }

    function Sa(d) {
        function a(a, b, c) {
            var d, e = this.z, f, g;
            for (g = 0; g < a;)
                switch (d = ib(this, b), d) {
                    case 16:
                        for (f = 3 + Y(this, 2); f--;)
                            c[g++] = e;
                        break;
                    case 17:
                        for (f = 3 + Y(this, 3); f--;)
                            c[g++] = 0;
                        e = 0;
                        break;
                    case 18:
                        for (f = 11 + Y(this, 7); f--;)
                            c[g++] = 0;
                        e = 0;
                        break;
                    default:
                        e = c[g++] = d
                }
            this.z = e;
            return c
        }

        var c = Y(d, 5) + 257, e = Y(d, 5) + 1, b = Y(d, 4) + 4,
            f = new (F ? Uint8Array : Array)(Ua.length), g, h, k, n;
        for (n = 0; n < b; ++n)
            f[Ua[n]] = Y(d, 3);
        if (!F) {
            n = b;
            for (b = f.length; n < b; ++n)
                f[Ua[n]] = 0
        }
        g = R(f);
        h = new (F ? Uint8Array : Array)(c);
        k = new (F ? Uint8Array : Array)(e);
        d.z = 0;
        d.o(R(a.call(d, c, g, h)), R(a.call(d, e, g, k)))
    }

    function Y(d, a) {
        for (var c = d.g, e = d.e, b = d.input, f = d.c, g = b.length, h; e < a;)
            f >= g && l(Error("broken")), c |= b[f++] << e, e += 8;
        h = c & (1 << a) - 1;
        d.g = c >>> a;
        d.e = e - a;
        d.c = f;
        return h
    }

    T.prototype.p = function () {
        for (; !this.s;) {
            var d = Y(this, 3);
            d & 1 && (this.s = x);
            d >>>= 1;
            switch (d) {
                case 0:
                    var a = this.input, c = this.c, e = this.a, b = this.b, f = a.length, g = v,
                        h = v,
                        k = e.length, n = v;
                    this.e = this.g = 0;
                    c + 1 >= f && l(Error("invalid LEN"));
                    g = a[c++] | a[c++] << 8;
                    c + 1 >= f && l(Error("invalid NLEN"));
                    h = a[c++] | a[c++] << 8;
                    g === ~h && l(Error("invalid header"));
                    c + g > a.length && l(Error("input broken"));
                    switch (this.n) {
                        case Aa:
                            for (; b + g > e.length;) {
                                n = k - b;
                                g -= n;
                                if (F)
                                    e.set(a.subarray(c, c + n), b), b += n, c += n; else
                                    for (; n--;)
                                        e[b++] = a[c++];
                                this.b = b;
                                e = this.f();
                                b = this.b
                            }
                            break;
                        case za:
                            for (; b + g > e.length;)
                                e = this.f({v: 2});
                            break;
                        default:
                            l(Error("invalid mode"))
                    }
                    if (F)
                        e.set(a.subarray(c, c + g), b), b += g, c += g; else
                        for (; g--;)
                            e[b++] = a[c++];
                    this.c = c;
                    this.b = b;
                    this.a = e;
                    break;
                case 1:
                    this.o(Ca, Da);
                    break;
                case 2:
                    Sa(this);
                    break;
                default:
                    l(Error("unknown BTYPE: " + d))
            }
        }
        return dt(this.t());
    };
    var F = "undefined" !== typeof Uint8Array && "undefined" !== typeof Uint16Array && "undefined" !== typeof Uint32Array && "undefined" !== typeof DataView;
    var Ta = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
        Ua = F ? new Uint16Array(Ta) : Ta;
    var Va = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258],
        Wa = F ? new Uint16Array(Va) : Va;
    var Xa = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0],
        Ya = F ? new Uint8Array(Xa) : Xa;
    var Za = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577],
        $a = F ? new Uint16Array(Za) : Za;
    var ab = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13],
        bb = F ? new Uint8Array(ab) : ab;

    function dt(array) {
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
                    out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                    break;
            }
        }
        return out;
    }
    pp['d'] = function (s) {

        let k = new kb(new Uint8Array(pp.atob(s).split('').map(c=>c.charCodeAt(0))),{});
        let res = k.p();
        return res;
    }
})(g);



"use strict";
// CanvaSVG: http://fuchsia-design.com/CanvaSVG/
var CanvasRenderingContext2DFont_svg = {
    'ctx': null,
    'fontFaces': {},
    'font': {},
    'load': function (family, svg) {
        if ((family in this.fontFaces) &&
            ('readyState' in this.fontFaces[family]) &&
            (this.fontFaces[family].readyState == 4)) {
            this.font = this.fontFaces[family];
            return;
        }
        this.fontFaces[family] = {
            'readyState': 2,
            'letter': {},
            'letters': {},
            'lettersw': {},
            'lettersn': {},
            'kern': [],
            'kernw': [],
            'kerns': []
        };
        var _ = this.fontFaces[family];
        var vars = {
            '<font': ['horiz-adv-x'],
            '<font-face': ['font-family', 'units-per-em', 'panose-1', 'ascent', 'descent', 'baseline'],
            '<missing-glyph': ['horiz-adv-x', 'd'],
            '<glyph': ['unicode', 'horiz-adv-x', 'd'],
            '<hkern': ['g1', 'g2', 'k']
        };
        var i = 0, ie = 0, il = svg.length;
        var l = '';
        il = svg.indexOf('</font');
        i = svg.indexOf('defs');
        if (!i)
            return false;
        i = svg.indexOf('<font', i);
        l = svg.substring(ie, svg.indexOf('>', ie));
        l = l.split('" ');
        var horadv = 0, fid = null;
        for (var ii = 0; ii < l.length; ii++) {
            if (l[ii].substr(0, 4) == 'id="')
                fid = l[ii].substr(4);
            else if (l[ii].substr(0, 13) == 'horiz-adv-x="')
                ;
            horadv = l[ii].substr(13);
        }
        i = svg.indexOf('<font-family');
        l = svg.substring(ie, svg.indexOf('>', ie));
        l = l.split('" ');
        var unitsperem = 1000, family = family;
        var ascent = unitsperem, descent = 0;
        var fontStyle = { fontWeight: 'all', fontStretch: 'all', fontStyle: 'all',
            fontVariant: 'normal', 'panose1': '0 0 0 0 0 0 0 0 0 0',
            slope: 0, ascent: null, descent: null, 'unicodeRange': null };
        // ascent: uniters-per-em - vert-origin-y, descent: vert-origin-y
        for (var ii = 0; ii < l.length; ii++) {
            if (l[ii].substr(0, 14) == 'units-per-em="')
                unitsperem = parseInt(l[ii].substr(14));
            else if (l[ii].substr(0, 8) == 'ascent="')
                ascent = parseInt(l[ii].substr(8));
            else if (l[ii].substr(0, 9) == 'descent="')
                descent = parseInt(l[ii].substr(9));
        }
        var tag = '<glyph';
        var lk, horadv, d, glyphname;
        while (i < il && 0 < (ie = svg.indexOf(tag, i))) {
            l = svg.substring(ie, svg.indexOf('>', ie));
            i = ie + 1;
            l = l.replace(/=" /g, '="&#x20;');
            l = l.substr(l.indexOf(' ') + 1).split('" ');
            lk = horadv = d = glyphname = '';
            for (var ii = 0; ii < l.length; ii++) {
                if (l[ii].substr(l[ii].length - 3, 3) == '"/>')
                    l[ii] = l[ii].substr(0, l[ii].length - 3);
                if (l[ii].substr(0, 9) == 'unicode="') {
                    lk = l[ii].substr(9);
                    if (lk.length > 1 && lk.substr(0, 1) == '&') {
                        var tmp = document.createElement('div');
                        tmp.innerHTML = lk;
                        lk = tmp.textContent || tmp.innerText; // IE fix
                    }
                    if (lk && lk.length && lk.length > 1)
                        ; // FIXME: Ligature
                    lk = lk.charCodeAt();
                }
                else if (l[ii].substr(0, 13) == 'horiz-adv-x="')
                    horadv = parseInt(l[ii].substr(13));
                else if (l[ii].substr(0, 3) == 'd="')
                    d = l[ii].substr(3);
                else if (l[ii].substr(0, 12) == 'glyph-name="')
                    glyphname = l[ii].substr(12);
            }
            // debug("Glyph" + glyphname + " H-adv: " + horadv + " lk: " + lk);
            if (!lk)
                continue;
            _.letters[lk] = d;
            if (horadv)
                _.lettersw[lk] = parseInt(horadv);
            if (glyphname)
                (glyphname in _.lettersn) ? _.lettersn[glyphname].push(lk) : (_.lettersn[glyphname] = [lk]);
        }
        if (32 in _.lettersw) { // Include the tab after the space info has been loaded
            var TAB = 9;
            _.letters[TAB] = '';
            _.lettersw[TAB] = _.lettersw[32] * 4;
            _.lettersn['tab'] = [TAB];
        }
        else {
            // programmerPanic("Whitespace has not been loaded! Tab will not work."); // TODO: How to handle this to the user?
        }
        /*
        // Letters not showing!
        debug("path.js: ? -> " + (63 in _.lettersw));
        debug("path.js: \" -> " + (34 in _.lettersw));
        debug("path.js: ' -> " + (39 in _.lettersw));
        debug("path.js: / -> " + (47 in _.lettersw));
        */
        tag = '<hkern';
        var xi = 0;
        var g1, g2, u1, u2, k, d;
        var lk, horadv;
        var xii;
        var kern = [];
        var kerns = [];
        while (xi < il && 0 < (ie = svg.indexOf(tag, xi))) {
            l = svg.substring(ie, svg.indexOf('>', ie));
            xi = ie + 1;
            l = l.substr(l.indexOf(' ') + 1).split('" ');
            lk = horadv = d = '';
            g1 = g2 = u1 = u2 = k = '';
            for (var ii = 0; ii < l.length; ii++) {
                if (l[ii].substr(0, 4) == 'g1="')
                    g1 = l[ii].substr(4);
                else if (l[ii].substr(0, 4) == 'g2="')
                    g2 = l[ii].substr(4);
                else if (l[ii].substr(0, 3) == 'k="')
                    k = l[ii].substr(3);
                else if (l[ii].substr(0, 4) == 'u1="')
                    u1 = l[ii].substr(4);
                else if (l[ii].substr(0, 4) == 'u2="')
                    u2 = l[ii].substr(4);
            }
            if (!((g1 || u1) && (g2 || u2)))
                continue;
            var kern = [];
            if (g1) {
                g1 = g1.split(',');
                for (i in g1)
                    if (g1[i] in _.lettersn)
                        for (ii in _.lettersn[g1[i]])
                            kern.push(_.lettersn[g1[i]][ii]);
            }
            if (u1) {
                u1 = u1.split(',');
                for (i in u1)
                    kern.push(u1);
            }
            var kerns = [];
            if (g2) {
                g2 = g2.split(',');
                for (i in g2)
                    if (g2[i] in _.lettersn)
                        for (ii in _.lettersn[g2[i]])
                            kerns.push(_.lettersn[g2[i]][ii]);
            }
            if (u2) {
                u2 = u2.split(',');
                for (i in u2)
                    kerns.push(u2);
            }
            if (!(kern.length && kerns.length))
                continue;
            xii = _.kerns.length;
            for (i in kern)
                _.kern[kern[i]] = xii;
            _.kerns.push(kerns);
            _.kernw.push(k);
        }
        this.fontFaces[family].readyState = 4;
        this.font = this.fontFaces[family];
    }
};
var CanvasRenderingContext2DPath = {
    'ctx': null,
    'closePathStroke': function () { if (this.ctx) {
        this.ctx.closePath();
        this.ctx.fill();
        if (0)
            this.ctx.stroke();
    } return ['Z']; },
    '_map': {
        "arcAbs": ['A', 'rx,ry,xAxisRotation,largeArcFlag,sweepFlag,x,y'],
        "arcRel": ['a', 'rx,ry,xAxisRotation,largeArcFlag,sweepFlag,x,y'],
        "curvetoCubicAbs": ['C', 'x1,y1,x2,y2,x,y'],
        "curvetoCubicRel": ['c', 'x1,y1,x2,y2,x,y'],
        "linetoHorizontalAbs": ['H', 'x'],
        "linetoHorizontalRel": ['h', 'x'],
        "linetoAbs": ['L', 'x,y'],
        "linetoRel": ['l', 'x,y'],
        "movetoAbs": ['M', 'x,y'],
        "movetoRel": ['m', 'x,y'],
        "curvetoQuadraticAbs": ['Q', 'x1, y1, x, y'],
        "curvetoQuadraticRel": ['q', 'x1, y1, x, y'],
        "curvetoCubicSmoothAbs": ['S', 'x2, y2, x, y'],
        "curvetoCubicSmoothRel": ['s', 'x2, y2, x, y'],
        "curvetoQuadraticSmoothAbs": ['T', 'x, y'],
        "curvetoQuadraticSmoothRel": ['t', 'x, y'],
        "linetoVerticalAbs": ['V', 'y'],
        "linetoVerticalRel": ['v', 'y'],
        "closePathStroke": ['Z', '', 'closePathStroke'],
        "closePathStroke": ['Z', '', 'closePathStroke']
    },
    '_path_': { A: 7, C: 6, H: 1, L: 2, M: 2, Q: 4, S: 4, T: 2, V: 1, Z: 0 },
    '_path': {},
    'cp': [0, 0],
    'cc': [0, 0],
    'scale': .1,
    'loadPath': function (path) {
        var i;
        if (!this._path.length)
            for (i in this._map) {
                this._path[this._map[i][0]] = i;
            }
        if (!path.length)
            return new Function('', 'return [""];');
        // fixme: allow exponentials (2e2)
        var reg = '';
        for (i in this._path)
            reg += i;
        var regex = new RegExp('[^0-9\\-\\.\\ ' + reg + '+]', 'g');
        var reg_ = new RegExp('(\\-[0-9\.]+)', 'g');
        var reg__ = new RegExp('(\\.[0-9]+)', 'g');
        var reg___ = new RegExp('\\ *([' + reg + '])\\ *', 'g');
        path = path.replace(regex, ' ').replace(reg_, ' $1 ').replace(reg__, '$1 ').replace(reg___, ' $1 ').replace(/\ +/g, ',');
        var pathl = path.length;
        var ic, pl, plf, ple;
        var peval = '';
        var i, x, cur, end;
        i = x = cur = end = 0;
        while (i < pathl) {
            ic = path.charAt(i);
            i++;
            if (ic in this._path) {
                while (i < pathl && path.charAt(i) == ',')
                    i++;
                pl = ic;
                plf = this._path[pl];
                ple = this._path_[pl];
            }
            else if (!pl)
                continue;
            cur = i;
            x = 0;
            while ((x < ple) && (i < pathl) && (i = path.indexOf(',', i))) {
                end = i;
                x++;
                i++;
            }
            if (ple)
                if (i < 0 || x < ple)
                    continue;
            var xes = path.substr(cur, end - cur).split(',');
            var is;
            for (is in xes)
                xes[is] = xes[is] * this.scale;
            peval += 'arialFontLib.' + plf + '(' + xes.join(',') + '),';
        }
        return new Function('', 'return [' + peval + '""];');
    },
    // FIXME: Debug. Does anyone use this function?
    // source: http://lists.freedesktothis.org/archives/cairo-commit/2006-April/006123.html
    'arcAbs': function (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
        if (!this.ctx)
            return ['A', rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y];
        var x1 = x;
        var y1 = y;
        var x2 = rx + x;
        var y2 = ry + y;
        if (x1 == x2 && y1 == y2)
            return;
        if (rx == 0.0 || yx == 0.0) {
            this.lineTo(x2, y2);
            return;
        }
        var v1 = (x1 - x2) / 2.0;
        var v2 = (y1 - y2) / 2.0;
        var angle = xAxisRotation * (Math.PI / 180.0);
        var angle_sin = Math.sin(angle);
        var angle_cos = Math.cos(angle);
        var x11 = (angle_cos * v1) + (angle_sin * v2);
        var y11 = -(angle_sin * v1) + (angle_cos * v2);
        rx = rx > 0.0 ? rx : rx * -1;
        ry = ry > 0.0 ? ry : ry * -1;
        var lambda = (x11 * x11) / (rx * rx) + (y11 * y11) / (ry * ry);
        if (lambda > 1.0) {
            var square_root = Math.sqrt(lambda);
            rx *= square_root;
            ry *= square_root;
        }
        var rx_squared = rx * rx;
        var ry_squared = ry * ry;
        var x11_squared = x11 * x11;
        var y11_squared = y11 * y11;
        var top = (rx_squared * ry_squared) - (rx_squared * y11_squared) - (ry_squared * x11_squared);
        if (top < 0.0)
            var c = 0.0;
        else {
            var bottom = (rx_squared * y11_squared) + (ry_squared * x11_squared);
            var c = sqrt(top / bottom);
        }
        var rx_squared = rx * rx;
        var ry_squared = ry * ry;
        var x11_squared = x11 * x11;
        var y11_squared = y11 * y11;
        var top = (rx_squared * ry_squared) - (rx_squared * y11_squared) - (ry_squared * x11_squared);
        if (top < 0.0)
            var c = 0.0;
        else {
            var bottom = (rx_squared * y11_squared) + (ry_squared * x11_squared);
            var c = sqrt(top / bottom);
        }
        if (largeArcFlag == sweepFlag)
            c = c * -1;
        var cx1 = c * ((rx * y11) / ry);
        var cy1 = c * (-(ry * x11) / rx);
        var cx = (angle_cos * cx1) - (angle_sin * cy1) + (x1 + x2) / 2;
        var cy = (angle_sin * cx1) + (angle_cos * cy1) + (y1 + y2) / 2;
        var v1 = (x11 - cx1) / rx;
        var v2 = (y11 - cy1) / ry;
        if (!this.calc_angle)
            this.calc_angle = function (ux, uy, vx, vy) {
                var top, u_magnitude, v_magnitude, angle_cos, angle;
                top = ux * vx + uy * vy;
                u_magnitude = Math.sqrt(ux * ux + uy * uy);
                v_magnitude = Math.sqrt(vx * vx + vy * vy);
                angle_cos = top / (u_magnitude * v_magnitude);
                if (angle_cos >= 1.0)
                    angle = 0.0;
                if (angle_cos <= -1.0)
                    angle = Math.PI;
                else
                    angle = Math.acos(angle_cos);
                if (ux * vy - uy * vx < 0)
                    angle = angle * -1;
                return angle;
            };
        var start_angle = this.calc_angle(1, 0, v1, v2);
        var angle_delta = this.calc_angle(v1, v2, (-x11 - cx1) / rx, (-y11 - cy1) / ry);
        if (sweepFlag == 0 && angle_delta > 0.0)
            angle_delta -= 2 * Math.PI;
        else if (sweepFlag == 1 && angle_delta < 0.0)
            angle_delta += 2 * Math.PI;
        c.save();
        c.translate(cx, cy);
        c.rotate(angle);
        c.scale(rx, ry);
        if (angle_delta > 0.0)
            c.arc(0.0, 0.0, 1.0, start_angle, start_angle + angle_delta, 1);
        else
            c.arc /*_negative*/(0.0, 0.0, 1.0, start_angle, start_angle + angle_delta);
        c.restore();
    },
    'arcRel': function (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
        x += this.cp[0];
        y += this.cp[1];
        return this.arcAbs(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y);
    },
    'curvetoCubicAbs': function (x1, y1, x2, y2, x, y) {
        this.bezierCurveTo(x1, y1, x2, y2, x, y);
        this.cp = [x, y];
        this.cc = [x2, y2];
        return ['Q', x1, y1, x2, y2, x, y];
    },
    'curvetoCubicRel': function (x1, y1, x2, y2, x, y) {
        x1 += this.cp[0];
        y1 += this.cp[1];
        x2 += this.cp[0];
        y2 += this.cp[1];
        x += this.cp[0];
        y += this.cp[1];
        if (this.ctx)
            this.ctx.bezierCurveTo(x1, y1, x2, y2, x, y);
        this.cp = [x, y];
        this.cc = [x2, y2];
        return ['Q', x1, y1, x2, y2, x, y];
    },
    'curvetoCubicSmoothAbs': function (x2, y2, x, y) {
        var x1 = this.cp[0] * 2 - this.cc[0];
        var y1 = this.cp[1] * 2 - this.cc[1];
        if (this.ctx)
            this.ctx.bezierCurveTo(x1, y1, x2, y2, x, y);
        this.cp = [x, y];
        this.cc = [x2, y2];
        return ['Q', x1, y1, x2, y2, x, y];
    },
    'curvetoCubicSmoothRel': function (x2, y2, x, y) {
        var x1 = this.cp[0] * 2 - this.cc[0];
        var y1 = this.cp[1] * 2 - this.cc[1];
        x2 += this.cp[0];
        y2 += this.cp[1];
        x += this.cp[0];
        y += this.cp[1];
        if (this.ctx)
            this.ctx.bezierCurveTo(x1, y1, x2, y2, x, y);
        this.cp = [x, y];
        this.cc = [x2, y2];
        return ['Q', x1, y1, x2, y2, x, y];
    },
    'linetoHorizontalAbs': function (x) {
        var y = this.cp[1];
        if (this.ctx)
            this.ctx.lineTo(x, y);
        this.cp = [x, y];
        this.cc = [x, y];
        return ['L', x, y];
    },
    'linetoHorizontalRel': function (x) {
        x += this.cp[0];
        var y = this.cp[1];
        if (this.ctx)
            this.ctx.lineTo(x, y);
        this.cp = [x, y];
        this.cc = [x, y];
        return ['L', x, y];
    },
    'linetoAbs': function (x, y) {
        if (this.ctx)
            this.ctx.lineTo(x, y);
        this.cp = [x, y];
        this.cc = [x, y];
        return ['L', x, y];
    },
    'linetoRel': function (x, y) {
        x += this.cp[0];
        y += this.cp[1];
        if (this.ctx)
            this.ctx.lineTo(x, y);
        this.cp = [x, y];
        this.cc = [x, y];
        return ['L', x, y];
    },
    'movetoAbs': function (x, y) {
        if (this.ctx) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
        }
        this.cp = [x, y];
        this.cc = [x, y];
        return ['M', x, y];
    },
    'movetoRel': function (x, y) {
        if (this.ctx)
            this.ctx.movetoAbs(this.cp[0] + x, this.cp[1] + y);
        return ['M', this.cp[0] + x, this.cp[1] + y];
    },
    'curvetoQuadraticAbs': function (x1, y1, x, y) {
        if (this.ctx)
            this.ctx.quadraticCurveTo(x1, y1, x, y);
        this.cp = [x, y];
        this.cc = [x1, y1];
        return ['C', x1, y1, x, y];
    },
    'curvetoQuadraticRel': function (x1, y1, x, y) {
        x1 += this.cp[0];
        y1 += this.cp[1];
        x += this.cp[0];
        y += this.cp[1];
        if (this.ctx)
            this.ctx.quadraticCurveTo(x1, y1, x, y);
        this.cp = [x, y];
        this.cc = [x1, y1];
        return ['C', x1, y1, x, y];
    },
    'curvetoQuadraticSmoothAbs': function (x, y) {
        var x1 = this.cp[0] * 2 - this.cc[0];
        var y1 = this.cp[1] * 2 - this.cc[1];
        if (this.ctx)
            this.ctx.quadraticCurveTo(x1, y1, x, y);
        this.cp = [x, y];
        this.cc = [x1, y1];
        return ['C', x1, y1, x, y];
    },
    'curvetoQuadraticSmoothRel': function (x, y) {
        var x1 = this.cp[0] * 2 - this.cc[0];
        var y1 = this.cp[1] * 2 - this.cc[1];
        x += this.cp[0];
        y += this.cp[1];
        if (this.ctx)
            this.ctx.quadraticCurveTo(x1, y1, x, y);
        this.cp = [x, y];
        this.cc = [x1, y1];
        return ['C', x1, y1, x, y];
    },
    'linetoVerticalAbs': function (y) {
        var x = this.cp[0];
        if (this.ctx)
            this.ctx.lineTo(x, y);
        this.cp = [x, y];
        this.cc = [x, y];
        return ['L', x, y];
    },
    'linetoVerticalRel': function (y) {
        var x = this.cp[0];
        y += this.cp[1];
        if (this.ctx)
            this.ctx.lineTo(x, y);
        this.cp = [x, y];
        this.cc = [x, y];
        return ['L', x, y];
    }
};

function W0(r, a) {
  for (var l = 0; l < a.length; l++) {
    const i = a[l];
    if (typeof i != "string" && !Array.isArray(i)) {
      for (const c in i)
        if (c !== "default" && !(c in r)) {
          const d = Object.getOwnPropertyDescriptor(i, c);
          d &&
            Object.defineProperty(
              r,
              c,
              d.get ? d : { enumerable: !0, get: () => i[c] },
            );
        }
    }
  }
  return Object.freeze(
    Object.defineProperty(r, Symbol.toStringTag, { value: "Module" }),
  );
}
(function () {
  const a = document.createElement("link").relList;
  if (a && a.supports && a.supports("modulepreload")) return;
  for (const c of document.querySelectorAll('link[rel="modulepreload"]')) i(c);
  new MutationObserver((c) => {
    for (const d of c)
      if (d.type === "childList")
        for (const f of d.addedNodes)
          f.tagName === "LINK" && f.rel === "modulepreload" && i(f);
  }).observe(document, { childList: !0, subtree: !0 });
  function l(c) {
    const d = {};
    return (
      c.integrity && (d.integrity = c.integrity),
      c.referrerPolicy && (d.referrerPolicy = c.referrerPolicy),
      c.crossOrigin === "use-credentials"
        ? (d.credentials = "include")
        : c.crossOrigin === "anonymous"
          ? (d.credentials = "omit")
          : (d.credentials = "same-origin"),
      d
    );
  }
  function i(c) {
    if (c.ep) return;
    c.ep = !0;
    const d = l(c);
    fetch(c.href, d);
  }
})();
function Kh(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default")
    ? r.default
    : r;
}
var xc = { exports: {} },
  _a = {},
  yc = { exports: {} },
  Fe = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var If;
function q0() {
  if (If) return Fe;
  If = 1;
  var r = Symbol.for("react.element"),
    a = Symbol.for("react.portal"),
    l = Symbol.for("react.fragment"),
    i = Symbol.for("react.strict_mode"),
    c = Symbol.for("react.profiler"),
    d = Symbol.for("react.provider"),
    f = Symbol.for("react.context"),
    m = Symbol.for("react.forward_ref"),
    g = Symbol.for("react.suspense"),
    x = Symbol.for("react.memo"),
    v = Symbol.for("react.lazy"),
    p = Symbol.iterator;
  function k(w) {
    return w === null || typeof w != "object"
      ? null
      : ((w = (p && w[p]) || w["@@iterator"]),
        typeof w == "function" ? w : null);
  }
  var R = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () {},
      enqueueReplaceState: function () {},
      enqueueSetState: function () {},
    },
    S = Object.assign,
    L = {};
  function j(w, _, W) {
    ((this.props = w),
      (this.context = _),
      (this.refs = L),
      (this.updater = W || R));
  }
  ((j.prototype.isReactComponent = {}),
    (j.prototype.setState = function (w, _) {
      if (typeof w != "object" && typeof w != "function" && w != null)
        throw Error(
          "setState(...): takes an object of state variables to update or a function which returns an object of state variables.",
        );
      this.updater.enqueueSetState(this, w, _, "setState");
    }),
    (j.prototype.forceUpdate = function (w) {
      this.updater.enqueueForceUpdate(this, w, "forceUpdate");
    }));
  function E() {}
  E.prototype = j.prototype;
  function D(w, _, W) {
    ((this.props = w),
      (this.context = _),
      (this.refs = L),
      (this.updater = W || R));
  }
  var H = (D.prototype = new E());
  ((H.constructor = D), S(H, j.prototype), (H.isPureReactComponent = !0));
  var G = Array.isArray,
    F = Object.prototype.hasOwnProperty,
    U = { current: null },
    P = { key: !0, ref: !0, __self: !0, __source: !0 };
  function Y(w, _, W) {
    var Z,
      q = {},
      ie = null,
      xe = null;
    if (_ != null)
      for (Z in (_.ref !== void 0 && (xe = _.ref),
      _.key !== void 0 && (ie = "" + _.key),
      _))
        F.call(_, Z) && !P.hasOwnProperty(Z) && (q[Z] = _[Z]);
    var fe = arguments.length - 2;
    if (fe === 1) q.children = W;
    else if (1 < fe) {
      for (var Ie = Array(fe), rt = 0; rt < fe; rt++)
        Ie[rt] = arguments[rt + 2];
      q.children = Ie;
    }
    if (w && w.defaultProps)
      for (Z in ((fe = w.defaultProps), fe)) q[Z] === void 0 && (q[Z] = fe[Z]);
    return {
      $$typeof: r,
      type: w,
      key: ie,
      ref: xe,
      props: q,
      _owner: U.current,
    };
  }
  function oe(w, _) {
    return {
      $$typeof: r,
      type: w.type,
      key: _,
      ref: w.ref,
      props: w.props,
      _owner: w._owner,
    };
  }
  function ce(w) {
    return typeof w == "object" && w !== null && w.$$typeof === r;
  }
  function Le(w) {
    var _ = { "=": "=0", ":": "=2" };
    return (
      "$" +
      w.replace(/[=:]/g, function (W) {
        return _[W];
      })
    );
  }
  var de = /\/+/g;
  function Re(w, _) {
    return typeof w == "object" && w !== null && w.key != null
      ? Le("" + w.key)
      : _.toString(36);
  }
  function ve(w, _, W, Z, q) {
    var ie = typeof w;
    (ie === "undefined" || ie === "boolean") && (w = null);
    var xe = !1;
    if (w === null) xe = !0;
    else
      switch (ie) {
        case "string":
        case "number":
          xe = !0;
          break;
        case "object":
          switch (w.$$typeof) {
            case r:
            case a:
              xe = !0;
          }
      }
    if (xe)
      return (
        (xe = w),
        (q = q(xe)),
        (w = Z === "" ? "." + Re(xe, 0) : Z),
        G(q)
          ? ((W = ""),
            w != null && (W = w.replace(de, "$&/") + "/"),
            ve(q, _, W, "", function (rt) {
              return rt;
            }))
          : q != null &&
            (ce(q) &&
              (q = oe(
                q,
                W +
                  (!q.key || (xe && xe.key === q.key)
                    ? ""
                    : ("" + q.key).replace(de, "$&/") + "/") +
                  w,
              )),
            _.push(q)),
        1
      );
    if (((xe = 0), (Z = Z === "" ? "." : Z + ":"), G(w)))
      for (var fe = 0; fe < w.length; fe++) {
        ie = w[fe];
        var Ie = Z + Re(ie, fe);
        xe += ve(ie, _, W, Ie, q);
      }
    else if (((Ie = k(w)), typeof Ie == "function"))
      for (w = Ie.call(w), fe = 0; !(ie = w.next()).done; )
        ((ie = ie.value), (Ie = Z + Re(ie, fe++)), (xe += ve(ie, _, W, Ie, q)));
    else if (ie === "object")
      throw (
        (_ = String(w)),
        Error(
          "Objects are not valid as a React child (found: " +
            (_ === "[object Object]"
              ? "object with keys {" + Object.keys(w).join(", ") + "}"
              : _) +
            "). If you meant to render a collection of children, use an array instead.",
        )
      );
    return xe;
  }
  function me(w, _, W) {
    if (w == null) return w;
    var Z = [],
      q = 0;
    return (
      ve(w, Z, "", "", function (ie) {
        return _.call(W, ie, q++);
      }),
      Z
    );
  }
  function Q(w) {
    if (w._status === -1) {
      var _ = w._result;
      ((_ = _()),
        _.then(
          function (W) {
            (w._status === 0 || w._status === -1) &&
              ((w._status = 1), (w._result = W));
          },
          function (W) {
            (w._status === 0 || w._status === -1) &&
              ((w._status = 2), (w._result = W));
          },
        ),
        w._status === -1 && ((w._status = 0), (w._result = _)));
    }
    if (w._status === 1) return w._result.default;
    throw w._result;
  }
  var ue = { current: null },
    V = { transition: null },
    ne = {
      ReactCurrentDispatcher: ue,
      ReactCurrentBatchConfig: V,
      ReactCurrentOwner: U,
    };
  function ee() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return (
    (Fe.Children = {
      map: me,
      forEach: function (w, _, W) {
        me(
          w,
          function () {
            _.apply(this, arguments);
          },
          W,
        );
      },
      count: function (w) {
        var _ = 0;
        return (
          me(w, function () {
            _++;
          }),
          _
        );
      },
      toArray: function (w) {
        return (
          me(w, function (_) {
            return _;
          }) || []
        );
      },
      only: function (w) {
        if (!ce(w))
          throw Error(
            "React.Children.only expected to receive a single React element child.",
          );
        return w;
      },
    }),
    (Fe.Component = j),
    (Fe.Fragment = l),
    (Fe.Profiler = c),
    (Fe.PureComponent = D),
    (Fe.StrictMode = i),
    (Fe.Suspense = g),
    (Fe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ne),
    (Fe.act = ee),
    (Fe.cloneElement = function (w, _, W) {
      if (w == null)
        throw Error(
          "React.cloneElement(...): The argument must be a React element, but you passed " +
            w +
            ".",
        );
      var Z = S({}, w.props),
        q = w.key,
        ie = w.ref,
        xe = w._owner;
      if (_ != null) {
        if (
          (_.ref !== void 0 && ((ie = _.ref), (xe = U.current)),
          _.key !== void 0 && (q = "" + _.key),
          w.type && w.type.defaultProps)
        )
          var fe = w.type.defaultProps;
        for (Ie in _)
          F.call(_, Ie) &&
            !P.hasOwnProperty(Ie) &&
            (Z[Ie] = _[Ie] === void 0 && fe !== void 0 ? fe[Ie] : _[Ie]);
      }
      var Ie = arguments.length - 2;
      if (Ie === 1) Z.children = W;
      else if (1 < Ie) {
        fe = Array(Ie);
        for (var rt = 0; rt < Ie; rt++) fe[rt] = arguments[rt + 2];
        Z.children = fe;
      }
      return {
        $$typeof: r,
        type: w.type,
        key: q,
        ref: ie,
        props: Z,
        _owner: xe,
      };
    }),
    (Fe.createContext = function (w) {
      return (
        (w = {
          $$typeof: f,
          _currentValue: w,
          _currentValue2: w,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
          _defaultValue: null,
          _globalName: null,
        }),
        (w.Provider = { $$typeof: d, _context: w }),
        (w.Consumer = w)
      );
    }),
    (Fe.createElement = Y),
    (Fe.createFactory = function (w) {
      var _ = Y.bind(null, w);
      return ((_.type = w), _);
    }),
    (Fe.createRef = function () {
      return { current: null };
    }),
    (Fe.forwardRef = function (w) {
      return { $$typeof: m, render: w };
    }),
    (Fe.isValidElement = ce),
    (Fe.lazy = function (w) {
      return { $$typeof: v, _payload: { _status: -1, _result: w }, _init: Q };
    }),
    (Fe.memo = function (w, _) {
      return { $$typeof: x, type: w, compare: _ === void 0 ? null : _ };
    }),
    (Fe.startTransition = function (w) {
      var _ = V.transition;
      V.transition = {};
      try {
        w();
      } finally {
        V.transition = _;
      }
    }),
    (Fe.unstable_act = ee),
    (Fe.useCallback = function (w, _) {
      return ue.current.useCallback(w, _);
    }),
    (Fe.useContext = function (w) {
      return ue.current.useContext(w);
    }),
    (Fe.useDebugValue = function () {}),
    (Fe.useDeferredValue = function (w) {
      return ue.current.useDeferredValue(w);
    }),
    (Fe.useEffect = function (w, _) {
      return ue.current.useEffect(w, _);
    }),
    (Fe.useId = function () {
      return ue.current.useId();
    }),
    (Fe.useImperativeHandle = function (w, _, W) {
      return ue.current.useImperativeHandle(w, _, W);
    }),
    (Fe.useInsertionEffect = function (w, _) {
      return ue.current.useInsertionEffect(w, _);
    }),
    (Fe.useLayoutEffect = function (w, _) {
      return ue.current.useLayoutEffect(w, _);
    }),
    (Fe.useMemo = function (w, _) {
      return ue.current.useMemo(w, _);
    }),
    (Fe.useReducer = function (w, _, W) {
      return ue.current.useReducer(w, _, W);
    }),
    (Fe.useRef = function (w) {
      return ue.current.useRef(w);
    }),
    (Fe.useState = function (w) {
      return ue.current.useState(w);
    }),
    (Fe.useSyncExternalStore = function (w, _, W) {
      return ue.current.useSyncExternalStore(w, _, W);
    }),
    (Fe.useTransition = function () {
      return ue.current.useTransition();
    }),
    (Fe.version = "18.3.1"),
    Fe
  );
}
var Ff;
function qc() {
  return (Ff || ((Ff = 1), (yc.exports = q0())), yc.exports);
}
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var $f;
function Y0() {
  if ($f) return _a;
  $f = 1;
  var r = qc(),
    a = Symbol.for("react.element"),
    l = Symbol.for("react.fragment"),
    i = Object.prototype.hasOwnProperty,
    c = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    d = { key: !0, ref: !0, __self: !0, __source: !0 };
  function f(m, g, x) {
    var v,
      p = {},
      k = null,
      R = null;
    (x !== void 0 && (k = "" + x),
      g.key !== void 0 && (k = "" + g.key),
      g.ref !== void 0 && (R = g.ref));
    for (v in g) i.call(g, v) && !d.hasOwnProperty(v) && (p[v] = g[v]);
    if (m && m.defaultProps)
      for (v in ((g = m.defaultProps), g)) p[v] === void 0 && (p[v] = g[v]);
    return {
      $$typeof: a,
      type: m,
      key: k,
      ref: R,
      props: p,
      _owner: c.current,
    };
  }
  return ((_a.Fragment = l), (_a.jsx = f), (_a.jsxs = f), _a);
}
var Uf;
function G0() {
  return (Uf || ((Uf = 1), (xc.exports = Y0())), xc.exports);
}
var n = G0(),
  io = {},
  vc = { exports: {} },
  Jt = {},
  wc = { exports: {} },
  bc = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Bf;
function K0() {
  return (
    Bf ||
      ((Bf = 1),
      (function (r) {
        function a(V, ne) {
          var ee = V.length;
          V.push(ne);
          e: for (; 0 < ee; ) {
            var w = (ee - 1) >>> 1,
              _ = V[w];
            if (0 < c(_, ne)) ((V[w] = ne), (V[ee] = _), (ee = w));
            else break e;
          }
        }
        function l(V) {
          return V.length === 0 ? null : V[0];
        }
        function i(V) {
          if (V.length === 0) return null;
          var ne = V[0],
            ee = V.pop();
          if (ee !== ne) {
            V[0] = ee;
            e: for (var w = 0, _ = V.length, W = _ >>> 1; w < W; ) {
              var Z = 2 * (w + 1) - 1,
                q = V[Z],
                ie = Z + 1,
                xe = V[ie];
              if (0 > c(q, ee))
                ie < _ && 0 > c(xe, q)
                  ? ((V[w] = xe), (V[ie] = ee), (w = ie))
                  : ((V[w] = q), (V[Z] = ee), (w = Z));
              else if (ie < _ && 0 > c(xe, ee))
                ((V[w] = xe), (V[ie] = ee), (w = ie));
              else break e;
            }
          }
          return ne;
        }
        function c(V, ne) {
          var ee = V.sortIndex - ne.sortIndex;
          return ee !== 0 ? ee : V.id - ne.id;
        }
        if (
          typeof performance == "object" &&
          typeof performance.now == "function"
        ) {
          var d = performance;
          r.unstable_now = function () {
            return d.now();
          };
        } else {
          var f = Date,
            m = f.now();
          r.unstable_now = function () {
            return f.now() - m;
          };
        }
        var g = [],
          x = [],
          v = 1,
          p = null,
          k = 3,
          R = !1,
          S = !1,
          L = !1,
          j = typeof setTimeout == "function" ? setTimeout : null,
          E = typeof clearTimeout == "function" ? clearTimeout : null,
          D = typeof setImmediate < "u" ? setImmediate : null;
        typeof navigator < "u" &&
          navigator.scheduling !== void 0 &&
          navigator.scheduling.isInputPending !== void 0 &&
          navigator.scheduling.isInputPending.bind(navigator.scheduling);
        function H(V) {
          for (var ne = l(x); ne !== null; ) {
            if (ne.callback === null) i(x);
            else if (ne.startTime <= V)
              (i(x), (ne.sortIndex = ne.expirationTime), a(g, ne));
            else break;
            ne = l(x);
          }
        }
        function G(V) {
          if (((L = !1), H(V), !S))
            if (l(g) !== null) ((S = !0), Q(F));
            else {
              var ne = l(x);
              ne !== null && ue(G, ne.startTime - V);
            }
        }
        function F(V, ne) {
          ((S = !1), L && ((L = !1), E(Y), (Y = -1)), (R = !0));
          var ee = k;
          try {
            for (
              H(ne), p = l(g);
              p !== null && (!(p.expirationTime > ne) || (V && !Le()));
            ) {
              var w = p.callback;
              if (typeof w == "function") {
                ((p.callback = null), (k = p.priorityLevel));
                var _ = w(p.expirationTime <= ne);
                ((ne = r.unstable_now()),
                  typeof _ == "function"
                    ? (p.callback = _)
                    : p === l(g) && i(g),
                  H(ne));
              } else i(g);
              p = l(g);
            }
            if (p !== null) var W = !0;
            else {
              var Z = l(x);
              (Z !== null && ue(G, Z.startTime - ne), (W = !1));
            }
            return W;
          } finally {
            ((p = null), (k = ee), (R = !1));
          }
        }
        var U = !1,
          P = null,
          Y = -1,
          oe = 5,
          ce = -1;
        function Le() {
          return !(r.unstable_now() - ce < oe);
        }
        function de() {
          if (P !== null) {
            var V = r.unstable_now();
            ce = V;
            var ne = !0;
            try {
              ne = P(!0, V);
            } finally {
              ne ? Re() : ((U = !1), (P = null));
            }
          } else U = !1;
        }
        var Re;
        if (typeof D == "function")
          Re = function () {
            D(de);
          };
        else if (typeof MessageChannel < "u") {
          var ve = new MessageChannel(),
            me = ve.port2;
          ((ve.port1.onmessage = de),
            (Re = function () {
              me.postMessage(null);
            }));
        } else
          Re = function () {
            j(de, 0);
          };
        function Q(V) {
          ((P = V), U || ((U = !0), Re()));
        }
        function ue(V, ne) {
          Y = j(function () {
            V(r.unstable_now());
          }, ne);
        }
        ((r.unstable_IdlePriority = 5),
          (r.unstable_ImmediatePriority = 1),
          (r.unstable_LowPriority = 4),
          (r.unstable_NormalPriority = 3),
          (r.unstable_Profiling = null),
          (r.unstable_UserBlockingPriority = 2),
          (r.unstable_cancelCallback = function (V) {
            V.callback = null;
          }),
          (r.unstable_continueExecution = function () {
            S || R || ((S = !0), Q(F));
          }),
          (r.unstable_forceFrameRate = function (V) {
            0 > V || 125 < V
              ? console.error(
                  "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
                )
              : (oe = 0 < V ? Math.floor(1e3 / V) : 5);
          }),
          (r.unstable_getCurrentPriorityLevel = function () {
            return k;
          }),
          (r.unstable_getFirstCallbackNode = function () {
            return l(g);
          }),
          (r.unstable_next = function (V) {
            switch (k) {
              case 1:
              case 2:
              case 3:
                var ne = 3;
                break;
              default:
                ne = k;
            }
            var ee = k;
            k = ne;
            try {
              return V();
            } finally {
              k = ee;
            }
          }),
          (r.unstable_pauseExecution = function () {}),
          (r.unstable_requestPaint = function () {}),
          (r.unstable_runWithPriority = function (V, ne) {
            switch (V) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break;
              default:
                V = 3;
            }
            var ee = k;
            k = V;
            try {
              return ne();
            } finally {
              k = ee;
            }
          }),
          (r.unstable_scheduleCallback = function (V, ne, ee) {
            var w = r.unstable_now();
            switch (
              (typeof ee == "object" && ee !== null
                ? ((ee = ee.delay),
                  (ee = typeof ee == "number" && 0 < ee ? w + ee : w))
                : (ee = w),
              V)
            ) {
              case 1:
                var _ = -1;
                break;
              case 2:
                _ = 250;
                break;
              case 5:
                _ = 1073741823;
                break;
              case 4:
                _ = 1e4;
                break;
              default:
                _ = 5e3;
            }
            return (
              (_ = ee + _),
              (V = {
                id: v++,
                callback: ne,
                priorityLevel: V,
                startTime: ee,
                expirationTime: _,
                sortIndex: -1,
              }),
              ee > w
                ? ((V.sortIndex = ee),
                  a(x, V),
                  l(g) === null &&
                    V === l(x) &&
                    (L ? (E(Y), (Y = -1)) : (L = !0), ue(G, ee - w)))
                : ((V.sortIndex = _), a(g, V), S || R || ((S = !0), Q(F))),
              V
            );
          }),
          (r.unstable_shouldYield = Le),
          (r.unstable_wrapCallback = function (V) {
            var ne = k;
            return function () {
              var ee = k;
              k = ne;
              try {
                return V.apply(this, arguments);
              } finally {
                k = ee;
              }
            };
          }));
      })(bc)),
    bc
  );
}
var Hf;
function Q0() {
  return (Hf || ((Hf = 1), (wc.exports = K0())), wc.exports);
}
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Vf;
function J0() {
  if (Vf) return Jt;
  Vf = 1;
  var r = qc(),
    a = Q0();
  function l(e) {
    for (
      var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e,
        s = 1;
      s < arguments.length;
      s++
    )
      t += "&args[]=" + encodeURIComponent(arguments[s]);
    return (
      "Minified React error #" +
      e +
      "; visit " +
      t +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  var i = new Set(),
    c = {};
  function d(e, t) {
    (f(e, t), f(e + "Capture", t));
  }
  function f(e, t) {
    for (c[e] = t, e = 0; e < t.length; e++) i.add(t[e]);
  }
  var m = !(
      typeof window > "u" ||
      typeof window.document > "u" ||
      typeof window.document.createElement > "u"
    ),
    g = Object.prototype.hasOwnProperty,
    x =
      /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
    v = {},
    p = {};
  function k(e) {
    return g.call(p, e)
      ? !0
      : g.call(v, e)
        ? !1
        : x.test(e)
          ? (p[e] = !0)
          : ((v[e] = !0), !1);
  }
  function R(e, t, s, o) {
    if (s !== null && s.type === 0) return !1;
    switch (typeof t) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return o
          ? !1
          : s !== null
            ? !s.acceptsBooleans
            : ((e = e.toLowerCase().slice(0, 5)),
              e !== "data-" && e !== "aria-");
      default:
        return !1;
    }
  }
  function S(e, t, s, o) {
    if (t === null || typeof t > "u" || R(e, t, s, o)) return !0;
    if (o) return !1;
    if (s !== null)
      switch (s.type) {
        case 3:
          return !t;
        case 4:
          return t === !1;
        case 5:
          return isNaN(t);
        case 6:
          return isNaN(t) || 1 > t;
      }
    return !1;
  }
  function L(e, t, s, o, u, h, y) {
    ((this.acceptsBooleans = t === 2 || t === 3 || t === 4),
      (this.attributeName = o),
      (this.attributeNamespace = u),
      (this.mustUseProperty = s),
      (this.propertyName = e),
      (this.type = t),
      (this.sanitizeURL = h),
      (this.removeEmptyString = y));
  }
  var j = {};
  ("children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
    .split(" ")
    .forEach(function (e) {
      j[e] = new L(e, 0, !1, e, null, !1, !1);
    }),
    [
      ["acceptCharset", "accept-charset"],
      ["className", "class"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
    ].forEach(function (e) {
      var t = e[0];
      j[t] = new L(t, 1, !1, e[1], null, !1, !1);
    }),
    ["contentEditable", "draggable", "spellCheck", "value"].forEach(
      function (e) {
        j[e] = new L(e, 2, !1, e.toLowerCase(), null, !1, !1);
      },
    ),
    [
      "autoReverse",
      "externalResourcesRequired",
      "focusable",
      "preserveAlpha",
    ].forEach(function (e) {
      j[e] = new L(e, 2, !1, e, null, !1, !1);
    }),
    "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
      .split(" ")
      .forEach(function (e) {
        j[e] = new L(e, 3, !1, e.toLowerCase(), null, !1, !1);
      }),
    ["checked", "multiple", "muted", "selected"].forEach(function (e) {
      j[e] = new L(e, 3, !0, e, null, !1, !1);
    }),
    ["capture", "download"].forEach(function (e) {
      j[e] = new L(e, 4, !1, e, null, !1, !1);
    }),
    ["cols", "rows", "size", "span"].forEach(function (e) {
      j[e] = new L(e, 6, !1, e, null, !1, !1);
    }),
    ["rowSpan", "start"].forEach(function (e) {
      j[e] = new L(e, 5, !1, e.toLowerCase(), null, !1, !1);
    }));
  var E = /[\-:]([a-z])/g;
  function D(e) {
    return e[1].toUpperCase();
  }
  ("accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
    .split(" ")
    .forEach(function (e) {
      var t = e.replace(E, D);
      j[t] = new L(t, 1, !1, e, null, !1, !1);
    }),
    "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
      .split(" ")
      .forEach(function (e) {
        var t = e.replace(E, D);
        j[t] = new L(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
      }),
    ["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
      var t = e.replace(E, D);
      j[t] = new L(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
    }),
    ["tabIndex", "crossOrigin"].forEach(function (e) {
      j[e] = new L(e, 1, !1, e.toLowerCase(), null, !1, !1);
    }),
    (j.xlinkHref = new L(
      "xlinkHref",
      1,
      !1,
      "xlink:href",
      "http://www.w3.org/1999/xlink",
      !0,
      !1,
    )),
    ["src", "href", "action", "formAction"].forEach(function (e) {
      j[e] = new L(e, 1, !1, e.toLowerCase(), null, !0, !0);
    }));
  function H(e, t, s, o) {
    var u = j.hasOwnProperty(t) ? j[t] : null;
    (u !== null
      ? u.type !== 0
      : o ||
        !(2 < t.length) ||
        (t[0] !== "o" && t[0] !== "O") ||
        (t[1] !== "n" && t[1] !== "N")) &&
      (S(t, s, u, o) && (s = null),
      o || u === null
        ? k(t) &&
          (s === null ? e.removeAttribute(t) : e.setAttribute(t, "" + s))
        : u.mustUseProperty
          ? (e[u.propertyName] = s === null ? (u.type === 3 ? !1 : "") : s)
          : ((t = u.attributeName),
            (o = u.attributeNamespace),
            s === null
              ? e.removeAttribute(t)
              : ((u = u.type),
                (s = u === 3 || (u === 4 && s === !0) ? "" : "" + s),
                o ? e.setAttributeNS(o, t, s) : e.setAttribute(t, s))));
  }
  var G = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    F = Symbol.for("react.element"),
    U = Symbol.for("react.portal"),
    P = Symbol.for("react.fragment"),
    Y = Symbol.for("react.strict_mode"),
    oe = Symbol.for("react.profiler"),
    ce = Symbol.for("react.provider"),
    Le = Symbol.for("react.context"),
    de = Symbol.for("react.forward_ref"),
    Re = Symbol.for("react.suspense"),
    ve = Symbol.for("react.suspense_list"),
    me = Symbol.for("react.memo"),
    Q = Symbol.for("react.lazy"),
    ue = Symbol.for("react.offscreen"),
    V = Symbol.iterator;
  function ne(e) {
    return e === null || typeof e != "object"
      ? null
      : ((e = (V && e[V]) || e["@@iterator"]),
        typeof e == "function" ? e : null);
  }
  var ee = Object.assign,
    w;
  function _(e) {
    if (w === void 0)
      try {
        throw Error();
      } catch (s) {
        var t = s.stack.trim().match(/\n( *(at )?)/);
        w = (t && t[1]) || "";
      }
    return (
      `
` +
      w +
      e
    );
  }
  var W = !1;
  function Z(e, t) {
    if (!e || W) return "";
    W = !0;
    var s = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (t)
        if (
          ((t = function () {
            throw Error();
          }),
          Object.defineProperty(t.prototype, "props", {
            set: function () {
              throw Error();
            },
          }),
          typeof Reflect == "object" && Reflect.construct)
        ) {
          try {
            Reflect.construct(t, []);
          } catch ($) {
            var o = $;
          }
          Reflect.construct(e, [], t);
        } else {
          try {
            t.call();
          } catch ($) {
            o = $;
          }
          e.call(t.prototype);
        }
      else {
        try {
          throw Error();
        } catch ($) {
          o = $;
        }
        e();
      }
    } catch ($) {
      if ($ && o && typeof $.stack == "string") {
        for (
          var u = $.stack.split(`
`),
            h = o.stack.split(`
`),
            y = u.length - 1,
            N = h.length - 1;
          1 <= y && 0 <= N && u[y] !== h[N];
        )
          N--;
        for (; 1 <= y && 0 <= N; y--, N--)
          if (u[y] !== h[N]) {
            if (y !== 1 || N !== 1)
              do
                if ((y--, N--, 0 > N || u[y] !== h[N])) {
                  var T =
                    `
` + u[y].replace(" at new ", " at ");
                  return (
                    e.displayName &&
                      T.includes("<anonymous>") &&
                      (T = T.replace("<anonymous>", e.displayName)),
                    T
                  );
                }
              while (1 <= y && 0 <= N);
            break;
          }
      }
    } finally {
      ((W = !1), (Error.prepareStackTrace = s));
    }
    return (e = e ? e.displayName || e.name : "") ? _(e) : "";
  }
  function q(e) {
    switch (e.tag) {
      case 5:
        return _(e.type);
      case 16:
        return _("Lazy");
      case 13:
        return _("Suspense");
      case 19:
        return _("SuspenseList");
      case 0:
      case 2:
      case 15:
        return ((e = Z(e.type, !1)), e);
      case 11:
        return ((e = Z(e.type.render, !1)), e);
      case 1:
        return ((e = Z(e.type, !0)), e);
      default:
        return "";
    }
  }
  function ie(e) {
    if (e == null) return null;
    if (typeof e == "function") return e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case P:
        return "Fragment";
      case U:
        return "Portal";
      case oe:
        return "Profiler";
      case Y:
        return "StrictMode";
      case Re:
        return "Suspense";
      case ve:
        return "SuspenseList";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case Le:
          return (e.displayName || "Context") + ".Consumer";
        case ce:
          return (e._context.displayName || "Context") + ".Provider";
        case de:
          var t = e.render;
          return (
            (e = e.displayName),
            e ||
              ((e = t.displayName || t.name || ""),
              (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
            e
          );
        case me:
          return (
            (t = e.displayName || null),
            t !== null ? t : ie(e.type) || "Memo"
          );
        case Q:
          ((t = e._payload), (e = e._init));
          try {
            return ie(e(t));
          } catch {}
      }
    return null;
  }
  function xe(e) {
    var t = e.type;
    switch (e.tag) {
      case 24:
        return "Cache";
      case 9:
        return (t.displayName || "Context") + ".Consumer";
      case 10:
        return (t._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return (
          (e = t.render),
          (e = e.displayName || e.name || ""),
          t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")
        );
      case 7:
        return "Fragment";
      case 5:
        return t;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return ie(t);
      case 8:
        return t === Y ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof t == "function") return t.displayName || t.name || null;
        if (typeof t == "string") return t;
    }
    return null;
  }
  function fe(e) {
    switch (typeof e) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function Ie(e) {
    var t = e.type;
    return (
      (e = e.nodeName) &&
      e.toLowerCase() === "input" &&
      (t === "checkbox" || t === "radio")
    );
  }
  function rt(e) {
    var t = Ie(e) ? "checked" : "value",
      s = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
      o = "" + e[t];
    if (
      !e.hasOwnProperty(t) &&
      typeof s < "u" &&
      typeof s.get == "function" &&
      typeof s.set == "function"
    ) {
      var u = s.get,
        h = s.set;
      return (
        Object.defineProperty(e, t, {
          configurable: !0,
          get: function () {
            return u.call(this);
          },
          set: function (y) {
            ((o = "" + y), h.call(this, y));
          },
        }),
        Object.defineProperty(e, t, { enumerable: s.enumerable }),
        {
          getValue: function () {
            return o;
          },
          setValue: function (y) {
            o = "" + y;
          },
          stopTracking: function () {
            ((e._valueTracker = null), delete e[t]);
          },
        }
      );
    }
  }
  function Ht(e) {
    e._valueTracker || (e._valueTracker = rt(e));
  }
  function qe(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var s = t.getValue(),
      o = "";
    return (
      e && (o = Ie(e) ? (e.checked ? "true" : "false") : e.value),
      (e = o),
      e !== s ? (t.setValue(e), !0) : !1
    );
  }
  function rr(e) {
    if (
      ((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u")
    )
      return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  function $r(e, t) {
    var s = t.checked;
    return ee({}, t, {
      defaultChecked: void 0,
      defaultValue: void 0,
      value: void 0,
      checked: s ?? e._wrapperState.initialChecked,
    });
  }
  function js(e, t) {
    var s = t.defaultValue == null ? "" : t.defaultValue,
      o = t.checked != null ? t.checked : t.defaultChecked;
    ((s = fe(t.value != null ? t.value : s)),
      (e._wrapperState = {
        initialChecked: o,
        initialValue: s,
        controlled:
          t.type === "checkbox" || t.type === "radio"
            ? t.checked != null
            : t.value != null,
      }));
  }
  function nr(e, t) {
    ((t = t.checked), t != null && H(e, "checked", t, !1));
  }
  function Cr(e, t) {
    nr(e, t);
    var s = fe(t.value),
      o = t.type;
    if (s != null)
      o === "number"
        ? ((s === 0 && e.value === "") || e.value != s) && (e.value = "" + s)
        : e.value !== "" + s && (e.value = "" + s);
    else if (o === "submit" || o === "reset") {
      e.removeAttribute("value");
      return;
    }
    (t.hasOwnProperty("value")
      ? Pt(e, t.type, s)
      : t.hasOwnProperty("defaultValue") && Pt(e, t.type, fe(t.defaultValue)),
      t.checked == null &&
        t.defaultChecked != null &&
        (e.defaultChecked = !!t.defaultChecked));
  }
  function Qn(e, t, s) {
    if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
      var o = t.type;
      if (
        !(
          (o !== "submit" && o !== "reset") ||
          (t.value !== void 0 && t.value !== null)
        )
      )
        return;
      ((t = "" + e._wrapperState.initialValue),
        s || t === e.value || (e.value = t),
        (e.defaultValue = t));
    }
    ((s = e.name),
      s !== "" && (e.name = ""),
      (e.defaultChecked = !!e._wrapperState.initialChecked),
      s !== "" && (e.name = s));
  }
  function Pt(e, t, s) {
    (t !== "number" || rr(e.ownerDocument) !== e) &&
      (s == null
        ? (e.defaultValue = "" + e._wrapperState.initialValue)
        : e.defaultValue !== "" + s && (e.defaultValue = "" + s));
  }
  var sn = Array.isArray;
  function Ur(e, t, s, o) {
    if (((e = e.options), t)) {
      t = {};
      for (var u = 0; u < s.length; u++) t["$" + s[u]] = !0;
      for (s = 0; s < e.length; s++)
        ((u = t.hasOwnProperty("$" + e[s].value)),
          e[s].selected !== u && (e[s].selected = u),
          u && o && (e[s].defaultSelected = !0));
    } else {
      for (s = "" + fe(s), t = null, u = 0; u < e.length; u++) {
        if (e[u].value === s) {
          ((e[u].selected = !0), o && (e[u].defaultSelected = !0));
          return;
        }
        t !== null || e[u].disabled || (t = e[u]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function yt(e, t) {
    if (t.dangerouslySetInnerHTML != null) throw Error(l(91));
    return ee({}, t, {
      value: void 0,
      defaultValue: void 0,
      children: "" + e._wrapperState.initialValue,
    });
  }
  function Er(e, t) {
    var s = t.value;
    if (s == null) {
      if (((s = t.children), (t = t.defaultValue), s != null)) {
        if (t != null) throw Error(l(92));
        if (sn(s)) {
          if (1 < s.length) throw Error(l(93));
          s = s[0];
        }
        t = s;
      }
      (t == null && (t = ""), (s = t));
    }
    e._wrapperState = { initialValue: fe(s) };
  }
  function hr(e, t) {
    var s = fe(t.value),
      o = fe(t.defaultValue);
    (s != null &&
      ((s = "" + s),
      s !== e.value && (e.value = s),
      t.defaultValue == null && e.defaultValue !== s && (e.defaultValue = s)),
      o != null && (e.defaultValue = "" + o));
  }
  function Br(e) {
    var t = e.textContent;
    t === e._wrapperState.initialValue &&
      t !== "" &&
      t !== null &&
      (e.value = t);
  }
  function Hr(e) {
    switch (e) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function an(e, t) {
    return e == null || e === "http://www.w3.org/1999/xhtml"
      ? Hr(t)
      : e === "http://www.w3.org/2000/svg" && t === "foreignObject"
        ? "http://www.w3.org/1999/xhtml"
        : e;
  }
  var Ct,
    Tt = (function (e) {
      return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction
        ? function (t, s, o, u) {
            MSApp.execUnsafeLocalFunction(function () {
              return e(t, s, o, u);
            });
          }
        : e;
    })(function (e, t) {
      if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e)
        e.innerHTML = t;
      else {
        for (
          Ct = Ct || document.createElement("div"),
            Ct.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
            t = Ct.firstChild;
          e.firstChild;
        )
          e.removeChild(e.firstChild);
        for (; t.firstChild; ) e.appendChild(t.firstChild);
      }
    });
  function It(e, t) {
    if (t) {
      var s = e.firstChild;
      if (s && s === e.lastChild && s.nodeType === 3) {
        s.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var Vr = {
      animationIterationCount: !0,
      aspectRatio: !0,
      borderImageOutset: !0,
      borderImageSlice: !0,
      borderImageWidth: !0,
      boxFlex: !0,
      boxFlexGroup: !0,
      boxOrdinalGroup: !0,
      columnCount: !0,
      columns: !0,
      flex: !0,
      flexGrow: !0,
      flexPositive: !0,
      flexShrink: !0,
      flexNegative: !0,
      flexOrder: !0,
      gridArea: !0,
      gridRow: !0,
      gridRowEnd: !0,
      gridRowSpan: !0,
      gridRowStart: !0,
      gridColumn: !0,
      gridColumnEnd: !0,
      gridColumnSpan: !0,
      gridColumnStart: !0,
      fontWeight: !0,
      lineClamp: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      tabSize: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0,
      fillOpacity: !0,
      floodOpacity: !0,
      stopOpacity: !0,
      strokeDasharray: !0,
      strokeDashoffset: !0,
      strokeMiterlimit: !0,
      strokeOpacity: !0,
      strokeWidth: !0,
    },
    mr = ["Webkit", "ms", "Moz", "O"];
  Object.keys(Vr).forEach(function (e) {
    mr.forEach(function (t) {
      ((t = t + e.charAt(0).toUpperCase() + e.substring(1)), (Vr[t] = Vr[e]));
    });
  });
  function ks(e, t, s) {
    return t == null || typeof t == "boolean" || t === ""
      ? ""
      : s || typeof t != "number" || t === 0 || (Vr.hasOwnProperty(e) && Vr[e])
        ? ("" + t).trim()
        : t + "px";
  }
  function Vt(e, t) {
    e = e.style;
    for (var s in t)
      if (t.hasOwnProperty(s)) {
        var o = s.indexOf("--") === 0,
          u = ks(s, t[s], o);
        (s === "float" && (s = "cssFloat"),
          o ? e.setProperty(s, u) : (e[s] = u));
      }
  }
  var Jn = ee(
    { menuitem: !0 },
    {
      area: !0,
      base: !0,
      br: !0,
      col: !0,
      embed: !0,
      hr: !0,
      img: !0,
      input: !0,
      keygen: !0,
      link: !0,
      meta: !0,
      param: !0,
      source: !0,
      track: !0,
      wbr: !0,
    },
  );
  function ln(e, t) {
    if (t) {
      if (Jn[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
        throw Error(l(137, e));
      if (t.dangerouslySetInnerHTML != null) {
        if (t.children != null) throw Error(l(60));
        if (
          typeof t.dangerouslySetInnerHTML != "object" ||
          !("__html" in t.dangerouslySetInnerHTML)
        )
          throw Error(l(61));
      }
      if (t.style != null && typeof t.style != "object") throw Error(l(62));
    }
  }
  function bn(e, t) {
    if (e.indexOf("-") === -1) return typeof t.is == "string";
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var on = null;
  function Ft(e) {
    return (
      (e = e.target || e.srcElement || window),
      e.correspondingUseElement && (e = e.correspondingUseElement),
      e.nodeType === 3 ? e.parentNode : e
    );
  }
  var Wr = null,
    Rr = null,
    sr = null;
  function Xn(e) {
    if ((e = ga(e))) {
      if (typeof Wr != "function") throw Error(l(280));
      var t = e.stateNode;
      t && ((t = kl(t)), Wr(e.stateNode, e.type, t));
    }
  }
  function Me(e) {
    Rr ? (sr ? sr.push(e) : (sr = [e])) : (Rr = e);
  }
  function nt() {
    if (Rr) {
      var e = Rr,
        t = sr;
      if (((sr = Rr = null), Xn(e), t)) for (e = 0; e < t.length; e++) Xn(t[e]);
    }
  }
  function it(e, t) {
    return e(t);
  }
  function ut() {}
  var ar = !1;
  function st(e, t, s) {
    if (ar) return e(t, s);
    ar = !0;
    try {
      return it(e, t, s);
    } finally {
      ((ar = !1), (Rr !== null || sr !== null) && (ut(), nt()));
    }
  }
  function pt(e, t) {
    var s = e.stateNode;
    if (s === null) return null;
    var o = kl(s);
    if (o === null) return null;
    s = o[t];
    e: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        ((o = !o.disabled) ||
          ((e = e.type),
          (o = !(
            e === "button" ||
            e === "input" ||
            e === "select" ||
            e === "textarea"
          ))),
          (e = !o));
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (s && typeof s != "function") throw Error(l(231, t, typeof s));
    return s;
  }
  var qr = !1;
  if (m)
    try {
      var C = {};
      (Object.defineProperty(C, "passive", {
        get: function () {
          qr = !0;
        },
      }),
        window.addEventListener("test", C, C),
        window.removeEventListener("test", C, C));
    } catch {
      qr = !1;
    }
  function O(e, t, s, o, u, h, y, N, T) {
    var $ = Array.prototype.slice.call(arguments, 3);
    try {
      t.apply(s, $);
    } catch (X) {
      this.onError(X);
    }
  }
  var I = !1,
    K = null,
    se = !1,
    ke = null,
    pe = {
      onError: function (e) {
        ((I = !0), (K = e));
      },
    };
  function be(e, t, s, o, u, h, y, N, T) {
    ((I = !1), (K = null), O.apply(pe, arguments));
  }
  function Se(e, t, s, o, u, h, y, N, T) {
    if ((be.apply(this, arguments), I)) {
      if (I) {
        var $ = K;
        ((I = !1), (K = null));
      } else throw Error(l(198));
      se || ((se = !0), (ke = $));
    }
  }
  function je(e) {
    var t = e,
      s = e;
    if (e.alternate) for (; t.return; ) t = t.return;
    else {
      e = t;
      do ((t = e), (t.flags & 4098) !== 0 && (s = t.return), (e = t.return));
      while (e);
    }
    return t.tag === 3 ? s : null;
  }
  function Ae(e) {
    if (e.tag === 13) {
      var t = e.memoizedState;
      if (
        (t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)),
        t !== null)
      )
        return t.dehydrated;
    }
    return null;
  }
  function Ce(e) {
    if (je(e) !== e) throw Error(l(188));
  }
  function He(e) {
    var t = e.alternate;
    if (!t) {
      if (((t = je(e)), t === null)) throw Error(l(188));
      return t !== e ? null : e;
    }
    for (var s = e, o = t; ; ) {
      var u = s.return;
      if (u === null) break;
      var h = u.alternate;
      if (h === null) {
        if (((o = u.return), o !== null)) {
          s = o;
          continue;
        }
        break;
      }
      if (u.child === h.child) {
        for (h = u.child; h; ) {
          if (h === s) return (Ce(u), e);
          if (h === o) return (Ce(u), t);
          h = h.sibling;
        }
        throw Error(l(188));
      }
      if (s.return !== o.return) ((s = u), (o = h));
      else {
        for (var y = !1, N = u.child; N; ) {
          if (N === s) {
            ((y = !0), (s = u), (o = h));
            break;
          }
          if (N === o) {
            ((y = !0), (o = u), (s = h));
            break;
          }
          N = N.sibling;
        }
        if (!y) {
          for (N = h.child; N; ) {
            if (N === s) {
              ((y = !0), (s = h), (o = u));
              break;
            }
            if (N === o) {
              ((y = !0), (o = h), (s = u));
              break;
            }
            N = N.sibling;
          }
          if (!y) throw Error(l(189));
        }
      }
      if (s.alternate !== o) throw Error(l(190));
    }
    if (s.tag !== 3) throw Error(l(188));
    return s.stateNode.current === s ? e : t;
  }
  function Ue(e) {
    return ((e = He(e)), e !== null ? gt(e) : null);
  }
  function gt(e) {
    if (e.tag === 5 || e.tag === 6) return e;
    for (e = e.child; e !== null; ) {
      var t = gt(e);
      if (t !== null) return t;
      e = e.sibling;
    }
    return null;
  }
  var dt = a.unstable_scheduleCallback,
    bt = a.unstable_cancelCallback,
    Ye = a.unstable_shouldYield,
    Wt = a.unstable_requestPaint,
    Ge = a.unstable_now,
    Zn = a.unstable_getCurrentPriorityLevel,
    pr = a.unstable_ImmediatePriority,
    lr = a.unstable_UserBlockingPriority,
    jn = a.unstable_NormalPriority,
    es = a.unstable_LowPriority,
    Yr = a.unstable_IdlePriority,
    cn = null,
    $t = null;
  function Be(e) {
    if ($t && typeof $t.onCommitFiberRoot == "function")
      try {
        $t.onCommitFiberRoot(cn, e, void 0, (e.current.flags & 128) === 128);
      } catch {}
  }
  var Qe = Math.clz32 ? Math.clz32 : et,
    kn = Math.log,
    un = Math.LN2;
  function et(e) {
    return ((e >>>= 0), e === 0 ? 32 : (31 - ((kn(e) / un) | 0)) | 0);
  }
  var dn = 64,
    ts = 4194304;
  function rs(e) {
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return e & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return e;
    }
  }
  function ol(e, t) {
    var s = e.pendingLanes;
    if (s === 0) return 0;
    var o = 0,
      u = e.suspendedLanes,
      h = e.pingedLanes,
      y = s & 268435455;
    if (y !== 0) {
      var N = y & ~u;
      N !== 0 ? (o = rs(N)) : ((h &= y), h !== 0 && (o = rs(h)));
    } else ((y = s & ~u), y !== 0 ? (o = rs(y)) : h !== 0 && (o = rs(h)));
    if (o === 0) return 0;
    if (
      t !== 0 &&
      t !== o &&
      (t & u) === 0 &&
      ((u = o & -o), (h = t & -t), u >= h || (u === 16 && (h & 4194240) !== 0))
    )
      return t;
    if (((o & 4) !== 0 && (o |= s & 16), (t = e.entangledLanes), t !== 0))
      for (e = e.entanglements, t &= o; 0 < t; )
        ((s = 31 - Qe(t)), (u = 1 << s), (o |= e[s]), (t &= ~u));
    return o;
  }
  function up(e, t) {
    switch (e) {
      case 1:
      case 2:
      case 4:
        return t + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function dp(e, t) {
    for (
      var s = e.suspendedLanes,
        o = e.pingedLanes,
        u = e.expirationTimes,
        h = e.pendingLanes;
      0 < h;
    ) {
      var y = 31 - Qe(h),
        N = 1 << y,
        T = u[y];
      (T === -1
        ? ((N & s) === 0 || (N & o) !== 0) && (u[y] = up(N, t))
        : T <= t && (e.expiredLanes |= N),
        (h &= ~N));
    }
  }
  function Io(e) {
    return (
      (e = e.pendingLanes & -1073741825),
      e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
    );
  }
  function mu() {
    var e = dn;
    return ((dn <<= 1), (dn & 4194240) === 0 && (dn = 64), e);
  }
  function Fo(e) {
    for (var t = [], s = 0; 31 > s; s++) t.push(e);
    return t;
  }
  function Zs(e, t, s) {
    ((e.pendingLanes |= t),
      t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
      (e = e.eventTimes),
      (t = 31 - Qe(t)),
      (e[t] = s));
  }
  function fp(e, t) {
    var s = e.pendingLanes & ~t;
    ((e.pendingLanes = t),
      (e.suspendedLanes = 0),
      (e.pingedLanes = 0),
      (e.expiredLanes &= t),
      (e.mutableReadLanes &= t),
      (e.entangledLanes &= t),
      (t = e.entanglements));
    var o = e.eventTimes;
    for (e = e.expirationTimes; 0 < s; ) {
      var u = 31 - Qe(s),
        h = 1 << u;
      ((t[u] = 0), (o[u] = -1), (e[u] = -1), (s &= ~h));
    }
  }
  function $o(e, t) {
    var s = (e.entangledLanes |= t);
    for (e = e.entanglements; s; ) {
      var o = 31 - Qe(s),
        u = 1 << o;
      ((u & t) | (e[o] & t) && (e[o] |= t), (s &= ~u));
    }
  }
  var Ke = 0;
  function pu(e) {
    return (
      (e &= -e),
      1 < e ? (4 < e ? ((e & 268435455) !== 0 ? 16 : 536870912) : 4) : 1
    );
  }
  var gu,
    Uo,
    xu,
    yu,
    vu,
    Bo = !1,
    il = [],
    Nn = null,
    Sn = null,
    Cn = null,
    ea = new Map(),
    ta = new Map(),
    En = [],
    hp =
      "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
        " ",
      );
  function wu(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        Nn = null;
        break;
      case "dragenter":
      case "dragleave":
        Sn = null;
        break;
      case "mouseover":
      case "mouseout":
        Cn = null;
        break;
      case "pointerover":
      case "pointerout":
        ea.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        ta.delete(t.pointerId);
    }
  }
  function ra(e, t, s, o, u, h) {
    return e === null || e.nativeEvent !== h
      ? ((e = {
          blockedOn: t,
          domEventName: s,
          eventSystemFlags: o,
          nativeEvent: h,
          targetContainers: [u],
        }),
        t !== null && ((t = ga(t)), t !== null && Uo(t)),
        e)
      : ((e.eventSystemFlags |= o),
        (t = e.targetContainers),
        u !== null && t.indexOf(u) === -1 && t.push(u),
        e);
  }
  function mp(e, t, s, o, u) {
    switch (t) {
      case "focusin":
        return ((Nn = ra(Nn, e, t, s, o, u)), !0);
      case "dragenter":
        return ((Sn = ra(Sn, e, t, s, o, u)), !0);
      case "mouseover":
        return ((Cn = ra(Cn, e, t, s, o, u)), !0);
      case "pointerover":
        var h = u.pointerId;
        return (ea.set(h, ra(ea.get(h) || null, e, t, s, o, u)), !0);
      case "gotpointercapture":
        return (
          (h = u.pointerId),
          ta.set(h, ra(ta.get(h) || null, e, t, s, o, u)),
          !0
        );
    }
    return !1;
  }
  function bu(e) {
    var t = ns(e.target);
    if (t !== null) {
      var s = je(t);
      if (s !== null) {
        if (((t = s.tag), t === 13)) {
          if (((t = Ae(s)), t !== null)) {
            ((e.blockedOn = t),
              vu(e.priority, function () {
                xu(s);
              }));
            return;
          }
        } else if (t === 3 && s.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = s.tag === 3 ? s.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function cl(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var s = Vo(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
      if (s === null) {
        s = e.nativeEvent;
        var o = new s.constructor(s.type, s);
        ((on = o), s.target.dispatchEvent(o), (on = null));
      } else return ((t = ga(s)), t !== null && Uo(t), (e.blockedOn = s), !1);
      t.shift();
    }
    return !0;
  }
  function ju(e, t, s) {
    cl(e) && s.delete(t);
  }
  function pp() {
    ((Bo = !1),
      Nn !== null && cl(Nn) && (Nn = null),
      Sn !== null && cl(Sn) && (Sn = null),
      Cn !== null && cl(Cn) && (Cn = null),
      ea.forEach(ju),
      ta.forEach(ju));
  }
  function na(e, t) {
    e.blockedOn === t &&
      ((e.blockedOn = null),
      Bo ||
        ((Bo = !0),
        a.unstable_scheduleCallback(a.unstable_NormalPriority, pp)));
  }
  function sa(e) {
    function t(u) {
      return na(u, e);
    }
    if (0 < il.length) {
      na(il[0], e);
      for (var s = 1; s < il.length; s++) {
        var o = il[s];
        o.blockedOn === e && (o.blockedOn = null);
      }
    }
    for (
      Nn !== null && na(Nn, e),
        Sn !== null && na(Sn, e),
        Cn !== null && na(Cn, e),
        ea.forEach(t),
        ta.forEach(t),
        s = 0;
      s < En.length;
      s++
    )
      ((o = En[s]), o.blockedOn === e && (o.blockedOn = null));
    for (; 0 < En.length && ((s = En[0]), s.blockedOn === null); )
      (bu(s), s.blockedOn === null && En.shift());
  }
  var Ns = G.ReactCurrentBatchConfig,
    ul = !0;
  function gp(e, t, s, o) {
    var u = Ke,
      h = Ns.transition;
    Ns.transition = null;
    try {
      ((Ke = 1), Ho(e, t, s, o));
    } finally {
      ((Ke = u), (Ns.transition = h));
    }
  }
  function xp(e, t, s, o) {
    var u = Ke,
      h = Ns.transition;
    Ns.transition = null;
    try {
      ((Ke = 4), Ho(e, t, s, o));
    } finally {
      ((Ke = u), (Ns.transition = h));
    }
  }
  function Ho(e, t, s, o) {
    if (ul) {
      var u = Vo(e, t, s, o);
      if (u === null) (oi(e, t, o, dl, s), wu(e, o));
      else if (mp(u, e, t, s, o)) o.stopPropagation();
      else if ((wu(e, o), t & 4 && -1 < hp.indexOf(e))) {
        for (; u !== null; ) {
          var h = ga(u);
          if (
            (h !== null && gu(h),
            (h = Vo(e, t, s, o)),
            h === null && oi(e, t, o, dl, s),
            h === u)
          )
            break;
          u = h;
        }
        u !== null && o.stopPropagation();
      } else oi(e, t, o, null, s);
    }
  }
  var dl = null;
  function Vo(e, t, s, o) {
    if (((dl = null), (e = Ft(o)), (e = ns(e)), e !== null))
      if (((t = je(e)), t === null)) e = null;
      else if (((s = t.tag), s === 13)) {
        if (((e = Ae(t)), e !== null)) return e;
        e = null;
      } else if (s === 3) {
        if (t.stateNode.current.memoizedState.isDehydrated)
          return t.tag === 3 ? t.stateNode.containerInfo : null;
        e = null;
      } else t !== e && (e = null);
    return ((dl = e), null);
  }
  function ku(e) {
    switch (e) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (Zn()) {
          case pr:
            return 1;
          case lr:
            return 4;
          case jn:
          case es:
            return 16;
          case Yr:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var Rn = null,
    Wo = null,
    fl = null;
  function Nu() {
    if (fl) return fl;
    var e,
      t = Wo,
      s = t.length,
      o,
      u = "value" in Rn ? Rn.value : Rn.textContent,
      h = u.length;
    for (e = 0; e < s && t[e] === u[e]; e++);
    var y = s - e;
    for (o = 1; o <= y && t[s - o] === u[h - o]; o++);
    return (fl = u.slice(e, 1 < o ? 1 - o : void 0));
  }
  function hl(e) {
    var t = e.keyCode;
    return (
      "charCode" in e
        ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
        : (e = t),
      e === 10 && (e = 13),
      32 <= e || e === 13 ? e : 0
    );
  }
  function ml() {
    return !0;
  }
  function Su() {
    return !1;
  }
  function or(e) {
    function t(s, o, u, h, y) {
      ((this._reactName = s),
        (this._targetInst = u),
        (this.type = o),
        (this.nativeEvent = h),
        (this.target = y),
        (this.currentTarget = null));
      for (var N in e)
        e.hasOwnProperty(N) && ((s = e[N]), (this[N] = s ? s(h) : h[N]));
      return (
        (this.isDefaultPrevented = (
          h.defaultPrevented != null ? h.defaultPrevented : h.returnValue === !1
        )
          ? ml
          : Su),
        (this.isPropagationStopped = Su),
        this
      );
    }
    return (
      ee(t.prototype, {
        preventDefault: function () {
          this.defaultPrevented = !0;
          var s = this.nativeEvent;
          s &&
            (s.preventDefault
              ? s.preventDefault()
              : typeof s.returnValue != "unknown" && (s.returnValue = !1),
            (this.isDefaultPrevented = ml));
        },
        stopPropagation: function () {
          var s = this.nativeEvent;
          s &&
            (s.stopPropagation
              ? s.stopPropagation()
              : typeof s.cancelBubble != "unknown" && (s.cancelBubble = !0),
            (this.isPropagationStopped = ml));
        },
        persist: function () {},
        isPersistent: ml,
      }),
      t
    );
  }
  var Ss = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function (e) {
        return e.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0,
    },
    qo = or(Ss),
    aa = ee({}, Ss, { view: 0, detail: 0 }),
    yp = or(aa),
    Yo,
    Go,
    la,
    pl = ee({}, aa, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: Qo,
      button: 0,
      buttons: 0,
      relatedTarget: function (e) {
        return e.relatedTarget === void 0
          ? e.fromElement === e.srcElement
            ? e.toElement
            : e.fromElement
          : e.relatedTarget;
      },
      movementX: function (e) {
        return "movementX" in e
          ? e.movementX
          : (e !== la &&
              (la && e.type === "mousemove"
                ? ((Yo = e.screenX - la.screenX), (Go = e.screenY - la.screenY))
                : (Go = Yo = 0),
              (la = e)),
            Yo);
      },
      movementY: function (e) {
        return "movementY" in e ? e.movementY : Go;
      },
    }),
    Cu = or(pl),
    vp = ee({}, pl, { dataTransfer: 0 }),
    wp = or(vp),
    bp = ee({}, aa, { relatedTarget: 0 }),
    Ko = or(bp),
    jp = ee({}, Ss, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
    kp = or(jp),
    Np = ee({}, Ss, {
      clipboardData: function (e) {
        return "clipboardData" in e ? e.clipboardData : window.clipboardData;
      },
    }),
    Sp = or(Np),
    Cp = ee({}, Ss, { data: 0 }),
    Eu = or(Cp),
    Ep = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified",
    },
    Rp = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta",
    },
    Pp = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey",
    };
  function Tp(e) {
    var t = this.nativeEvent;
    return t.getModifierState
      ? t.getModifierState(e)
      : (e = Pp[e])
        ? !!t[e]
        : !1;
  }
  function Qo() {
    return Tp;
  }
  var _p = ee({}, aa, {
      key: function (e) {
        if (e.key) {
          var t = Ep[e.key] || e.key;
          if (t !== "Unidentified") return t;
        }
        return e.type === "keypress"
          ? ((e = hl(e)), e === 13 ? "Enter" : String.fromCharCode(e))
          : e.type === "keydown" || e.type === "keyup"
            ? Rp[e.keyCode] || "Unidentified"
            : "";
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: Qo,
      charCode: function (e) {
        return e.type === "keypress" ? hl(e) : 0;
      },
      keyCode: function (e) {
        return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      },
      which: function (e) {
        return e.type === "keypress"
          ? hl(e)
          : e.type === "keydown" || e.type === "keyup"
            ? e.keyCode
            : 0;
      },
    }),
    Lp = or(_p),
    Ap = ee({}, pl, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0,
    }),
    Ru = or(Ap),
    Op = ee({}, aa, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: Qo,
    }),
    Dp = or(Op),
    Mp = ee({}, Ss, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
    zp = or(Mp),
    Ip = ee({}, pl, {
      deltaX: function (e) {
        return "deltaX" in e
          ? e.deltaX
          : "wheelDeltaX" in e
            ? -e.wheelDeltaX
            : 0;
      },
      deltaY: function (e) {
        return "deltaY" in e
          ? e.deltaY
          : "wheelDeltaY" in e
            ? -e.wheelDeltaY
            : "wheelDelta" in e
              ? -e.wheelDelta
              : 0;
      },
      deltaZ: 0,
      deltaMode: 0,
    }),
    Fp = or(Ip),
    $p = [9, 13, 27, 32],
    Jo = m && "CompositionEvent" in window,
    oa = null;
  m && "documentMode" in document && (oa = document.documentMode);
  var Up = m && "TextEvent" in window && !oa,
    Pu = m && (!Jo || (oa && 8 < oa && 11 >= oa)),
    Tu = " ",
    _u = !1;
  function Lu(e, t) {
    switch (e) {
      case "keyup":
        return $p.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function Au(e) {
    return (
      (e = e.detail),
      typeof e == "object" && "data" in e ? e.data : null
    );
  }
  var Cs = !1;
  function Bp(e, t) {
    switch (e) {
      case "compositionend":
        return Au(t);
      case "keypress":
        return t.which !== 32 ? null : ((_u = !0), Tu);
      case "textInput":
        return ((e = t.data), e === Tu && _u ? null : e);
      default:
        return null;
    }
  }
  function Hp(e, t) {
    if (Cs)
      return e === "compositionend" || (!Jo && Lu(e, t))
        ? ((e = Nu()), (fl = Wo = Rn = null), (Cs = !1), e)
        : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
          if (t.char && 1 < t.char.length) return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return Pu && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var Vp = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
  };
  function Ou(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!Vp[e.type] : t === "textarea";
  }
  function Du(e, t, s, o) {
    (Me(o),
      (t = wl(t, "onChange")),
      0 < t.length &&
        ((s = new qo("onChange", "change", null, s, o)),
        e.push({ event: s, listeners: t })));
  }
  var ia = null,
    ca = null;
  function Wp(e) {
    Zu(e, 0);
  }
  function gl(e) {
    var t = _s(e);
    if (qe(t)) return e;
  }
  function qp(e, t) {
    if (e === "change") return t;
  }
  var Mu = !1;
  if (m) {
    var Xo;
    if (m) {
      var Zo = "oninput" in document;
      if (!Zo) {
        var zu = document.createElement("div");
        (zu.setAttribute("oninput", "return;"),
          (Zo = typeof zu.oninput == "function"));
      }
      Xo = Zo;
    } else Xo = !1;
    Mu = Xo && (!document.documentMode || 9 < document.documentMode);
  }
  function Iu() {
    ia && (ia.detachEvent("onpropertychange", Fu), (ca = ia = null));
  }
  function Fu(e) {
    if (e.propertyName === "value" && gl(ca)) {
      var t = [];
      (Du(t, ca, e, Ft(e)), st(Wp, t));
    }
  }
  function Yp(e, t, s) {
    e === "focusin"
      ? (Iu(), (ia = t), (ca = s), ia.attachEvent("onpropertychange", Fu))
      : e === "focusout" && Iu();
  }
  function Gp(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return gl(ca);
  }
  function Kp(e, t) {
    if (e === "click") return gl(t);
  }
  function Qp(e, t) {
    if (e === "input" || e === "change") return gl(t);
  }
  function Jp(e, t) {
    return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
  }
  var Pr = typeof Object.is == "function" ? Object.is : Jp;
  function ua(e, t) {
    if (Pr(e, t)) return !0;
    if (
      typeof e != "object" ||
      e === null ||
      typeof t != "object" ||
      t === null
    )
      return !1;
    var s = Object.keys(e),
      o = Object.keys(t);
    if (s.length !== o.length) return !1;
    for (o = 0; o < s.length; o++) {
      var u = s[o];
      if (!g.call(t, u) || !Pr(e[u], t[u])) return !1;
    }
    return !0;
  }
  function $u(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function Uu(e, t) {
    var s = $u(e);
    e = 0;
    for (var o; s; ) {
      if (s.nodeType === 3) {
        if (((o = e + s.textContent.length), e <= t && o >= t))
          return { node: s, offset: t - e };
        e = o;
      }
      e: {
        for (; s; ) {
          if (s.nextSibling) {
            s = s.nextSibling;
            break e;
          }
          s = s.parentNode;
        }
        s = void 0;
      }
      s = $u(s);
    }
  }
  function Bu(e, t) {
    return e && t
      ? e === t
        ? !0
        : e && e.nodeType === 3
          ? !1
          : t && t.nodeType === 3
            ? Bu(e, t.parentNode)
            : "contains" in e
              ? e.contains(t)
              : e.compareDocumentPosition
                ? !!(e.compareDocumentPosition(t) & 16)
                : !1
      : !1;
  }
  function Hu() {
    for (var e = window, t = rr(); t instanceof e.HTMLIFrameElement; ) {
      try {
        var s = typeof t.contentWindow.location.href == "string";
      } catch {
        s = !1;
      }
      if (s) e = t.contentWindow;
      else break;
      t = rr(e.document);
    }
    return t;
  }
  function ei(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return (
      t &&
      ((t === "input" &&
        (e.type === "text" ||
          e.type === "search" ||
          e.type === "tel" ||
          e.type === "url" ||
          e.type === "password")) ||
        t === "textarea" ||
        e.contentEditable === "true")
    );
  }
  function Xp(e) {
    var t = Hu(),
      s = e.focusedElem,
      o = e.selectionRange;
    if (
      t !== s &&
      s &&
      s.ownerDocument &&
      Bu(s.ownerDocument.documentElement, s)
    ) {
      if (o !== null && ei(s)) {
        if (
          ((t = o.start),
          (e = o.end),
          e === void 0 && (e = t),
          "selectionStart" in s)
        )
          ((s.selectionStart = t),
            (s.selectionEnd = Math.min(e, s.value.length)));
        else if (
          ((e = ((t = s.ownerDocument || document) && t.defaultView) || window),
          e.getSelection)
        ) {
          e = e.getSelection();
          var u = s.textContent.length,
            h = Math.min(o.start, u);
          ((o = o.end === void 0 ? h : Math.min(o.end, u)),
            !e.extend && h > o && ((u = o), (o = h), (h = u)),
            (u = Uu(s, h)));
          var y = Uu(s, o);
          u &&
            y &&
            (e.rangeCount !== 1 ||
              e.anchorNode !== u.node ||
              e.anchorOffset !== u.offset ||
              e.focusNode !== y.node ||
              e.focusOffset !== y.offset) &&
            ((t = t.createRange()),
            t.setStart(u.node, u.offset),
            e.removeAllRanges(),
            h > o
              ? (e.addRange(t), e.extend(y.node, y.offset))
              : (t.setEnd(y.node, y.offset), e.addRange(t)));
        }
      }
      for (t = [], e = s; (e = e.parentNode); )
        e.nodeType === 1 &&
          t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
      for (typeof s.focus == "function" && s.focus(), s = 0; s < t.length; s++)
        ((e = t[s]),
          (e.element.scrollLeft = e.left),
          (e.element.scrollTop = e.top));
    }
  }
  var Zp = m && "documentMode" in document && 11 >= document.documentMode,
    Es = null,
    ti = null,
    da = null,
    ri = !1;
  function Vu(e, t, s) {
    var o =
      s.window === s ? s.document : s.nodeType === 9 ? s : s.ownerDocument;
    ri ||
      Es == null ||
      Es !== rr(o) ||
      ((o = Es),
      "selectionStart" in o && ei(o)
        ? (o = { start: o.selectionStart, end: o.selectionEnd })
        : ((o = (
            (o.ownerDocument && o.ownerDocument.defaultView) ||
            window
          ).getSelection()),
          (o = {
            anchorNode: o.anchorNode,
            anchorOffset: o.anchorOffset,
            focusNode: o.focusNode,
            focusOffset: o.focusOffset,
          })),
      (da && ua(da, o)) ||
        ((da = o),
        (o = wl(ti, "onSelect")),
        0 < o.length &&
          ((t = new qo("onSelect", "select", null, t, s)),
          e.push({ event: t, listeners: o }),
          (t.target = Es))));
  }
  function xl(e, t) {
    var s = {};
    return (
      (s[e.toLowerCase()] = t.toLowerCase()),
      (s["Webkit" + e] = "webkit" + t),
      (s["Moz" + e] = "moz" + t),
      s
    );
  }
  var Rs = {
      animationend: xl("Animation", "AnimationEnd"),
      animationiteration: xl("Animation", "AnimationIteration"),
      animationstart: xl("Animation", "AnimationStart"),
      transitionend: xl("Transition", "TransitionEnd"),
    },
    ni = {},
    Wu = {};
  m &&
    ((Wu = document.createElement("div").style),
    "AnimationEvent" in window ||
      (delete Rs.animationend.animation,
      delete Rs.animationiteration.animation,
      delete Rs.animationstart.animation),
    "TransitionEvent" in window || delete Rs.transitionend.transition);
  function yl(e) {
    if (ni[e]) return ni[e];
    if (!Rs[e]) return e;
    var t = Rs[e],
      s;
    for (s in t) if (t.hasOwnProperty(s) && s in Wu) return (ni[e] = t[s]);
    return e;
  }
  var qu = yl("animationend"),
    Yu = yl("animationiteration"),
    Gu = yl("animationstart"),
    Ku = yl("transitionend"),
    Qu = new Map(),
    Ju =
      "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
        " ",
      );
  function Pn(e, t) {
    (Qu.set(e, t), d(t, [e]));
  }
  for (var si = 0; si < Ju.length; si++) {
    var ai = Ju[si],
      e0 = ai.toLowerCase(),
      t0 = ai[0].toUpperCase() + ai.slice(1);
    Pn(e0, "on" + t0);
  }
  (Pn(qu, "onAnimationEnd"),
    Pn(Yu, "onAnimationIteration"),
    Pn(Gu, "onAnimationStart"),
    Pn("dblclick", "onDoubleClick"),
    Pn("focusin", "onFocus"),
    Pn("focusout", "onBlur"),
    Pn(Ku, "onTransitionEnd"),
    f("onMouseEnter", ["mouseout", "mouseover"]),
    f("onMouseLeave", ["mouseout", "mouseover"]),
    f("onPointerEnter", ["pointerout", "pointerover"]),
    f("onPointerLeave", ["pointerout", "pointerover"]),
    d(
      "onChange",
      "change click focusin focusout input keydown keyup selectionchange".split(
        " ",
      ),
    ),
    d(
      "onSelect",
      "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
        " ",
      ),
    ),
    d("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
    d(
      "onCompositionEnd",
      "compositionend focusout keydown keypress keyup mousedown".split(" "),
    ),
    d(
      "onCompositionStart",
      "compositionstart focusout keydown keypress keyup mousedown".split(" "),
    ),
    d(
      "onCompositionUpdate",
      "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
    ));
  var fa =
      "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
        " ",
      ),
    r0 = new Set(
      "cancel close invalid load scroll toggle".split(" ").concat(fa),
    );
  function Xu(e, t, s) {
    var o = e.type || "unknown-event";
    ((e.currentTarget = s), Se(o, t, void 0, e), (e.currentTarget = null));
  }
  function Zu(e, t) {
    t = (t & 4) !== 0;
    for (var s = 0; s < e.length; s++) {
      var o = e[s],
        u = o.event;
      o = o.listeners;
      e: {
        var h = void 0;
        if (t)
          for (var y = o.length - 1; 0 <= y; y--) {
            var N = o[y],
              T = N.instance,
              $ = N.currentTarget;
            if (((N = N.listener), T !== h && u.isPropagationStopped()))
              break e;
            (Xu(u, N, $), (h = T));
          }
        else
          for (y = 0; y < o.length; y++) {
            if (
              ((N = o[y]),
              (T = N.instance),
              ($ = N.currentTarget),
              (N = N.listener),
              T !== h && u.isPropagationStopped())
            )
              break e;
            (Xu(u, N, $), (h = T));
          }
      }
    }
    if (se) throw ((e = ke), (se = !1), (ke = null), e);
  }
  function Xe(e, t) {
    var s = t[hi];
    s === void 0 && (s = t[hi] = new Set());
    var o = e + "__bubble";
    s.has(o) || (ed(t, e, 2, !1), s.add(o));
  }
  function li(e, t, s) {
    var o = 0;
    (t && (o |= 4), ed(s, e, o, t));
  }
  var vl = "_reactListening" + Math.random().toString(36).slice(2);
  function ha(e) {
    if (!e[vl]) {
      ((e[vl] = !0),
        i.forEach(function (s) {
          s !== "selectionchange" && (r0.has(s) || li(s, !1, e), li(s, !0, e));
        }));
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[vl] || ((t[vl] = !0), li("selectionchange", !1, t));
    }
  }
  function ed(e, t, s, o) {
    switch (ku(t)) {
      case 1:
        var u = gp;
        break;
      case 4:
        u = xp;
        break;
      default:
        u = Ho;
    }
    ((s = u.bind(null, t, s, e)),
      (u = void 0),
      !qr ||
        (t !== "touchstart" && t !== "touchmove" && t !== "wheel") ||
        (u = !0),
      o
        ? u !== void 0
          ? e.addEventListener(t, s, { capture: !0, passive: u })
          : e.addEventListener(t, s, !0)
        : u !== void 0
          ? e.addEventListener(t, s, { passive: u })
          : e.addEventListener(t, s, !1));
  }
  function oi(e, t, s, o, u) {
    var h = o;
    if ((t & 1) === 0 && (t & 2) === 0 && o !== null)
      e: for (;;) {
        if (o === null) return;
        var y = o.tag;
        if (y === 3 || y === 4) {
          var N = o.stateNode.containerInfo;
          if (N === u || (N.nodeType === 8 && N.parentNode === u)) break;
          if (y === 4)
            for (y = o.return; y !== null; ) {
              var T = y.tag;
              if (
                (T === 3 || T === 4) &&
                ((T = y.stateNode.containerInfo),
                T === u || (T.nodeType === 8 && T.parentNode === u))
              )
                return;
              y = y.return;
            }
          for (; N !== null; ) {
            if (((y = ns(N)), y === null)) return;
            if (((T = y.tag), T === 5 || T === 6)) {
              o = h = y;
              continue e;
            }
            N = N.parentNode;
          }
        }
        o = o.return;
      }
    st(function () {
      var $ = h,
        X = Ft(s),
        te = [];
      e: {
        var J = Qu.get(e);
        if (J !== void 0) {
          var he = qo,
            ye = e;
          switch (e) {
            case "keypress":
              if (hl(s) === 0) break e;
            case "keydown":
            case "keyup":
              he = Lp;
              break;
            case "focusin":
              ((ye = "focus"), (he = Ko));
              break;
            case "focusout":
              ((ye = "blur"), (he = Ko));
              break;
            case "beforeblur":
            case "afterblur":
              he = Ko;
              break;
            case "click":
              if (s.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              he = Cu;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              he = wp;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              he = Dp;
              break;
            case qu:
            case Yu:
            case Gu:
              he = kp;
              break;
            case Ku:
              he = zp;
              break;
            case "scroll":
              he = yp;
              break;
            case "wheel":
              he = Fp;
              break;
            case "copy":
            case "cut":
            case "paste":
              he = Sp;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              he = Ru;
          }
          var we = (t & 4) !== 0,
            ft = !we && e === "scroll",
            M = we ? (J !== null ? J + "Capture" : null) : J;
          we = [];
          for (var A = $, z; A !== null; ) {
            z = A;
            var re = z.stateNode;
            if (
              (z.tag === 5 &&
                re !== null &&
                ((z = re),
                M !== null &&
                  ((re = pt(A, M)), re != null && we.push(ma(A, re, z)))),
              ft)
            )
              break;
            A = A.return;
          }
          0 < we.length &&
            ((J = new he(J, ye, null, s, X)),
            te.push({ event: J, listeners: we }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (
            ((J = e === "mouseover" || e === "pointerover"),
            (he = e === "mouseout" || e === "pointerout"),
            J &&
              s !== on &&
              (ye = s.relatedTarget || s.fromElement) &&
              (ns(ye) || ye[fn]))
          )
            break e;
          if (
            (he || J) &&
            ((J =
              X.window === X
                ? X
                : (J = X.ownerDocument)
                  ? J.defaultView || J.parentWindow
                  : window),
            he
              ? ((ye = s.relatedTarget || s.toElement),
                (he = $),
                (ye = ye ? ns(ye) : null),
                ye !== null &&
                  ((ft = je(ye)),
                  ye !== ft || (ye.tag !== 5 && ye.tag !== 6)) &&
                  (ye = null))
              : ((he = null), (ye = $)),
            he !== ye)
          ) {
            if (
              ((we = Cu),
              (re = "onMouseLeave"),
              (M = "onMouseEnter"),
              (A = "mouse"),
              (e === "pointerout" || e === "pointerover") &&
                ((we = Ru),
                (re = "onPointerLeave"),
                (M = "onPointerEnter"),
                (A = "pointer")),
              (ft = he == null ? J : _s(he)),
              (z = ye == null ? J : _s(ye)),
              (J = new we(re, A + "leave", he, s, X)),
              (J.target = ft),
              (J.relatedTarget = z),
              (re = null),
              ns(X) === $ &&
                ((we = new we(M, A + "enter", ye, s, X)),
                (we.target = z),
                (we.relatedTarget = ft),
                (re = we)),
              (ft = re),
              he && ye)
            )
              t: {
                for (we = he, M = ye, A = 0, z = we; z; z = Ps(z)) A++;
                for (z = 0, re = M; re; re = Ps(re)) z++;
                for (; 0 < A - z; ) ((we = Ps(we)), A--);
                for (; 0 < z - A; ) ((M = Ps(M)), z--);
                for (; A--; ) {
                  if (we === M || (M !== null && we === M.alternate)) break t;
                  ((we = Ps(we)), (M = Ps(M)));
                }
                we = null;
              }
            else we = null;
            (he !== null && td(te, J, he, we, !1),
              ye !== null && ft !== null && td(te, ft, ye, we, !0));
          }
        }
        e: {
          if (
            ((J = $ ? _s($) : window),
            (he = J.nodeName && J.nodeName.toLowerCase()),
            he === "select" || (he === "input" && J.type === "file"))
          )
            var Ne = qp;
          else if (Ou(J))
            if (Mu) Ne = Qp;
            else {
              Ne = Gp;
              var Te = Yp;
            }
          else
            (he = J.nodeName) &&
              he.toLowerCase() === "input" &&
              (J.type === "checkbox" || J.type === "radio") &&
              (Ne = Kp);
          if (Ne && (Ne = Ne(e, $))) {
            Du(te, Ne, s, X);
            break e;
          }
          (Te && Te(e, J, $),
            e === "focusout" &&
              (Te = J._wrapperState) &&
              Te.controlled &&
              J.type === "number" &&
              Pt(J, "number", J.value));
        }
        switch (((Te = $ ? _s($) : window), e)) {
          case "focusin":
            (Ou(Te) || Te.contentEditable === "true") &&
              ((Es = Te), (ti = $), (da = null));
            break;
          case "focusout":
            da = ti = Es = null;
            break;
          case "mousedown":
            ri = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            ((ri = !1), Vu(te, s, X));
            break;
          case "selectionchange":
            if (Zp) break;
          case "keydown":
          case "keyup":
            Vu(te, s, X);
        }
        var _e;
        if (Jo)
          e: {
            switch (e) {
              case "compositionstart":
                var ze = "onCompositionStart";
                break e;
              case "compositionend":
                ze = "onCompositionEnd";
                break e;
              case "compositionupdate":
                ze = "onCompositionUpdate";
                break e;
            }
            ze = void 0;
          }
        else
          Cs
            ? Lu(e, s) && (ze = "onCompositionEnd")
            : e === "keydown" &&
              s.keyCode === 229 &&
              (ze = "onCompositionStart");
        (ze &&
          (Pu &&
            s.locale !== "ko" &&
            (Cs || ze !== "onCompositionStart"
              ? ze === "onCompositionEnd" && Cs && (_e = Nu())
              : ((Rn = X),
                (Wo = "value" in Rn ? Rn.value : Rn.textContent),
                (Cs = !0))),
          (Te = wl($, ze)),
          0 < Te.length &&
            ((ze = new Eu(ze, e, null, s, X)),
            te.push({ event: ze, listeners: Te }),
            _e
              ? (ze.data = _e)
              : ((_e = Au(s)), _e !== null && (ze.data = _e)))),
          (_e = Up ? Bp(e, s) : Hp(e, s)) &&
            (($ = wl($, "onBeforeInput")),
            0 < $.length &&
              ((X = new Eu("onBeforeInput", "beforeinput", null, s, X)),
              te.push({ event: X, listeners: $ }),
              (X.data = _e))));
      }
      Zu(te, t);
    });
  }
  function ma(e, t, s) {
    return { instance: e, listener: t, currentTarget: s };
  }
  function wl(e, t) {
    for (var s = t + "Capture", o = []; e !== null; ) {
      var u = e,
        h = u.stateNode;
      (u.tag === 5 &&
        h !== null &&
        ((u = h),
        (h = pt(e, s)),
        h != null && o.unshift(ma(e, h, u)),
        (h = pt(e, t)),
        h != null && o.push(ma(e, h, u))),
        (e = e.return));
    }
    return o;
  }
  function Ps(e) {
    if (e === null) return null;
    do e = e.return;
    while (e && e.tag !== 5);
    return e || null;
  }
  function td(e, t, s, o, u) {
    for (var h = t._reactName, y = []; s !== null && s !== o; ) {
      var N = s,
        T = N.alternate,
        $ = N.stateNode;
      if (T !== null && T === o) break;
      (N.tag === 5 &&
        $ !== null &&
        ((N = $),
        u
          ? ((T = pt(s, h)), T != null && y.unshift(ma(s, T, N)))
          : u || ((T = pt(s, h)), T != null && y.push(ma(s, T, N)))),
        (s = s.return));
    }
    y.length !== 0 && e.push({ event: t, listeners: y });
  }
  var n0 = /\r\n?/g,
    s0 = /\u0000|\uFFFD/g;
  function rd(e) {
    return (typeof e == "string" ? e : "" + e)
      .replace(
        n0,
        `
`,
      )
      .replace(s0, "");
  }
  function bl(e, t, s) {
    if (((t = rd(t)), rd(e) !== t && s)) throw Error(l(425));
  }
  function jl() {}
  var ii = null,
    ci = null;
  function ui(e, t) {
    return (
      e === "textarea" ||
      e === "noscript" ||
      typeof t.children == "string" ||
      typeof t.children == "number" ||
      (typeof t.dangerouslySetInnerHTML == "object" &&
        t.dangerouslySetInnerHTML !== null &&
        t.dangerouslySetInnerHTML.__html != null)
    );
  }
  var di = typeof setTimeout == "function" ? setTimeout : void 0,
    a0 = typeof clearTimeout == "function" ? clearTimeout : void 0,
    nd = typeof Promise == "function" ? Promise : void 0,
    l0 =
      typeof queueMicrotask == "function"
        ? queueMicrotask
        : typeof nd < "u"
          ? function (e) {
              return nd.resolve(null).then(e).catch(o0);
            }
          : di;
  function o0(e) {
    setTimeout(function () {
      throw e;
    });
  }
  function fi(e, t) {
    var s = t,
      o = 0;
    do {
      var u = s.nextSibling;
      if ((e.removeChild(s), u && u.nodeType === 8))
        if (((s = u.data), s === "/$")) {
          if (o === 0) {
            (e.removeChild(u), sa(t));
            return;
          }
          o--;
        } else (s !== "$" && s !== "$?" && s !== "$!") || o++;
      s = u;
    } while (s);
    sa(t);
  }
  function Tn(e) {
    for (; e != null; e = e.nextSibling) {
      var t = e.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (((t = e.data), t === "$" || t === "$!" || t === "$?")) break;
        if (t === "/$") return null;
      }
    }
    return e;
  }
  function sd(e) {
    e = e.previousSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var s = e.data;
        if (s === "$" || s === "$!" || s === "$?") {
          if (t === 0) return e;
          t--;
        } else s === "/$" && t++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  var Ts = Math.random().toString(36).slice(2),
    Gr = "__reactFiber$" + Ts,
    pa = "__reactProps$" + Ts,
    fn = "__reactContainer$" + Ts,
    hi = "__reactEvents$" + Ts,
    i0 = "__reactListeners$" + Ts,
    c0 = "__reactHandles$" + Ts;
  function ns(e) {
    var t = e[Gr];
    if (t) return t;
    for (var s = e.parentNode; s; ) {
      if ((t = s[fn] || s[Gr])) {
        if (
          ((s = t.alternate),
          t.child !== null || (s !== null && s.child !== null))
        )
          for (e = sd(e); e !== null; ) {
            if ((s = e[Gr])) return s;
            e = sd(e);
          }
        return t;
      }
      ((e = s), (s = e.parentNode));
    }
    return null;
  }
  function ga(e) {
    return (
      (e = e[Gr] || e[fn]),
      !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3)
        ? null
        : e
    );
  }
  function _s(e) {
    if (e.tag === 5 || e.tag === 6) return e.stateNode;
    throw Error(l(33));
  }
  function kl(e) {
    return e[pa] || null;
  }
  var mi = [],
    Ls = -1;
  function _n(e) {
    return { current: e };
  }
  function Ze(e) {
    0 > Ls || ((e.current = mi[Ls]), (mi[Ls] = null), Ls--);
  }
  function Je(e, t) {
    (Ls++, (mi[Ls] = e.current), (e.current = t));
  }
  var Ln = {},
    _t = _n(Ln),
    qt = _n(!1),
    ss = Ln;
  function As(e, t) {
    var s = e.type.contextTypes;
    if (!s) return Ln;
    var o = e.stateNode;
    if (o && o.__reactInternalMemoizedUnmaskedChildContext === t)
      return o.__reactInternalMemoizedMaskedChildContext;
    var u = {},
      h;
    for (h in s) u[h] = t[h];
    return (
      o &&
        ((e = e.stateNode),
        (e.__reactInternalMemoizedUnmaskedChildContext = t),
        (e.__reactInternalMemoizedMaskedChildContext = u)),
      u
    );
  }
  function Yt(e) {
    return ((e = e.childContextTypes), e != null);
  }
  function Nl() {
    (Ze(qt), Ze(_t));
  }
  function ad(e, t, s) {
    if (_t.current !== Ln) throw Error(l(168));
    (Je(_t, t), Je(qt, s));
  }
  function ld(e, t, s) {
    var o = e.stateNode;
    if (((t = t.childContextTypes), typeof o.getChildContext != "function"))
      return s;
    o = o.getChildContext();
    for (var u in o) if (!(u in t)) throw Error(l(108, xe(e) || "Unknown", u));
    return ee({}, s, o);
  }
  function Sl(e) {
    return (
      (e =
        ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) ||
        Ln),
      (ss = _t.current),
      Je(_t, e),
      Je(qt, qt.current),
      !0
    );
  }
  function od(e, t, s) {
    var o = e.stateNode;
    if (!o) throw Error(l(169));
    (s
      ? ((e = ld(e, t, ss)),
        (o.__reactInternalMemoizedMergedChildContext = e),
        Ze(qt),
        Ze(_t),
        Je(_t, e))
      : Ze(qt),
      Je(qt, s));
  }
  var hn = null,
    Cl = !1,
    pi = !1;
  function id(e) {
    hn === null ? (hn = [e]) : hn.push(e);
  }
  function u0(e) {
    ((Cl = !0), id(e));
  }
  function An() {
    if (!pi && hn !== null) {
      pi = !0;
      var e = 0,
        t = Ke;
      try {
        var s = hn;
        for (Ke = 1; e < s.length; e++) {
          var o = s[e];
          do o = o(!0);
          while (o !== null);
        }
        ((hn = null), (Cl = !1));
      } catch (u) {
        throw (hn !== null && (hn = hn.slice(e + 1)), dt(pr, An), u);
      } finally {
        ((Ke = t), (pi = !1));
      }
    }
    return null;
  }
  var Os = [],
    Ds = 0,
    El = null,
    Rl = 0,
    gr = [],
    xr = 0,
    as = null,
    mn = 1,
    pn = "";
  function ls(e, t) {
    ((Os[Ds++] = Rl), (Os[Ds++] = El), (El = e), (Rl = t));
  }
  function cd(e, t, s) {
    ((gr[xr++] = mn), (gr[xr++] = pn), (gr[xr++] = as), (as = e));
    var o = mn;
    e = pn;
    var u = 32 - Qe(o) - 1;
    ((o &= ~(1 << u)), (s += 1));
    var h = 32 - Qe(t) + u;
    if (30 < h) {
      var y = u - (u % 5);
      ((h = (o & ((1 << y) - 1)).toString(32)),
        (o >>= y),
        (u -= y),
        (mn = (1 << (32 - Qe(t) + u)) | (s << u) | o),
        (pn = h + e));
    } else ((mn = (1 << h) | (s << u) | o), (pn = e));
  }
  function gi(e) {
    e.return !== null && (ls(e, 1), cd(e, 1, 0));
  }
  function xi(e) {
    for (; e === El; )
      ((El = Os[--Ds]), (Os[Ds] = null), (Rl = Os[--Ds]), (Os[Ds] = null));
    for (; e === as; )
      ((as = gr[--xr]),
        (gr[xr] = null),
        (pn = gr[--xr]),
        (gr[xr] = null),
        (mn = gr[--xr]),
        (gr[xr] = null));
  }
  var ir = null,
    cr = null,
    tt = !1,
    Tr = null;
  function ud(e, t) {
    var s = br(5, null, null, 0);
    ((s.elementType = "DELETED"),
      (s.stateNode = t),
      (s.return = e),
      (t = e.deletions),
      t === null ? ((e.deletions = [s]), (e.flags |= 16)) : t.push(s));
  }
  function dd(e, t) {
    switch (e.tag) {
      case 5:
        var s = e.type;
        return (
          (t =
            t.nodeType !== 1 || s.toLowerCase() !== t.nodeName.toLowerCase()
              ? null
              : t),
          t !== null
            ? ((e.stateNode = t), (ir = e), (cr = Tn(t.firstChild)), !0)
            : !1
        );
      case 6:
        return (
          (t = e.pendingProps === "" || t.nodeType !== 3 ? null : t),
          t !== null ? ((e.stateNode = t), (ir = e), (cr = null), !0) : !1
        );
      case 13:
        return (
          (t = t.nodeType !== 8 ? null : t),
          t !== null
            ? ((s = as !== null ? { id: mn, overflow: pn } : null),
              (e.memoizedState = {
                dehydrated: t,
                treeContext: s,
                retryLane: 1073741824,
              }),
              (s = br(18, null, null, 0)),
              (s.stateNode = t),
              (s.return = e),
              (e.child = s),
              (ir = e),
              (cr = null),
              !0)
            : !1
        );
      default:
        return !1;
    }
  }
  function yi(e) {
    return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
  }
  function vi(e) {
    if (tt) {
      var t = cr;
      if (t) {
        var s = t;
        if (!dd(e, t)) {
          if (yi(e)) throw Error(l(418));
          t = Tn(s.nextSibling);
          var o = ir;
          t && dd(e, t)
            ? ud(o, s)
            : ((e.flags = (e.flags & -4097) | 2), (tt = !1), (ir = e));
        }
      } else {
        if (yi(e)) throw Error(l(418));
        ((e.flags = (e.flags & -4097) | 2), (tt = !1), (ir = e));
      }
    }
  }
  function fd(e) {
    for (
      e = e.return;
      e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;
    )
      e = e.return;
    ir = e;
  }
  function Pl(e) {
    if (e !== ir) return !1;
    if (!tt) return (fd(e), (tt = !0), !1);
    var t;
    if (
      ((t = e.tag !== 3) &&
        !(t = e.tag !== 5) &&
        ((t = e.type),
        (t = t !== "head" && t !== "body" && !ui(e.type, e.memoizedProps))),
      t && (t = cr))
    ) {
      if (yi(e)) throw (hd(), Error(l(418)));
      for (; t; ) (ud(e, t), (t = Tn(t.nextSibling)));
    }
    if ((fd(e), e.tag === 13)) {
      if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
        throw Error(l(317));
      e: {
        for (e = e.nextSibling, t = 0; e; ) {
          if (e.nodeType === 8) {
            var s = e.data;
            if (s === "/$") {
              if (t === 0) {
                cr = Tn(e.nextSibling);
                break e;
              }
              t--;
            } else (s !== "$" && s !== "$!" && s !== "$?") || t++;
          }
          e = e.nextSibling;
        }
        cr = null;
      }
    } else cr = ir ? Tn(e.stateNode.nextSibling) : null;
    return !0;
  }
  function hd() {
    for (var e = cr; e; ) e = Tn(e.nextSibling);
  }
  function Ms() {
    ((cr = ir = null), (tt = !1));
  }
  function wi(e) {
    Tr === null ? (Tr = [e]) : Tr.push(e);
  }
  var d0 = G.ReactCurrentBatchConfig;
  function xa(e, t, s) {
    if (
      ((e = s.ref),
      e !== null && typeof e != "function" && typeof e != "object")
    ) {
      if (s._owner) {
        if (((s = s._owner), s)) {
          if (s.tag !== 1) throw Error(l(309));
          var o = s.stateNode;
        }
        if (!o) throw Error(l(147, e));
        var u = o,
          h = "" + e;
        return t !== null &&
          t.ref !== null &&
          typeof t.ref == "function" &&
          t.ref._stringRef === h
          ? t.ref
          : ((t = function (y) {
              var N = u.refs;
              y === null ? delete N[h] : (N[h] = y);
            }),
            (t._stringRef = h),
            t);
      }
      if (typeof e != "string") throw Error(l(284));
      if (!s._owner) throw Error(l(290, e));
    }
    return e;
  }
  function Tl(e, t) {
    throw (
      (e = Object.prototype.toString.call(t)),
      Error(
        l(
          31,
          e === "[object Object]"
            ? "object with keys {" + Object.keys(t).join(", ") + "}"
            : e,
        ),
      )
    );
  }
  function md(e) {
    var t = e._init;
    return t(e._payload);
  }
  function pd(e) {
    function t(M, A) {
      if (e) {
        var z = M.deletions;
        z === null ? ((M.deletions = [A]), (M.flags |= 16)) : z.push(A);
      }
    }
    function s(M, A) {
      if (!e) return null;
      for (; A !== null; ) (t(M, A), (A = A.sibling));
      return null;
    }
    function o(M, A) {
      for (M = new Map(); A !== null; )
        (A.key !== null ? M.set(A.key, A) : M.set(A.index, A), (A = A.sibling));
      return M;
    }
    function u(M, A) {
      return ((M = Un(M, A)), (M.index = 0), (M.sibling = null), M);
    }
    function h(M, A, z) {
      return (
        (M.index = z),
        e
          ? ((z = M.alternate),
            z !== null
              ? ((z = z.index), z < A ? ((M.flags |= 2), A) : z)
              : ((M.flags |= 2), A))
          : ((M.flags |= 1048576), A)
      );
    }
    function y(M) {
      return (e && M.alternate === null && (M.flags |= 2), M);
    }
    function N(M, A, z, re) {
      return A === null || A.tag !== 6
        ? ((A = dc(z, M.mode, re)), (A.return = M), A)
        : ((A = u(A, z)), (A.return = M), A);
    }
    function T(M, A, z, re) {
      var Ne = z.type;
      return Ne === P
        ? X(M, A, z.props.children, re, z.key)
        : A !== null &&
            (A.elementType === Ne ||
              (typeof Ne == "object" &&
                Ne !== null &&
                Ne.$$typeof === Q &&
                md(Ne) === A.type))
          ? ((re = u(A, z.props)), (re.ref = xa(M, A, z)), (re.return = M), re)
          : ((re = eo(z.type, z.key, z.props, null, M.mode, re)),
            (re.ref = xa(M, A, z)),
            (re.return = M),
            re);
    }
    function $(M, A, z, re) {
      return A === null ||
        A.tag !== 4 ||
        A.stateNode.containerInfo !== z.containerInfo ||
        A.stateNode.implementation !== z.implementation
        ? ((A = fc(z, M.mode, re)), (A.return = M), A)
        : ((A = u(A, z.children || [])), (A.return = M), A);
    }
    function X(M, A, z, re, Ne) {
      return A === null || A.tag !== 7
        ? ((A = ms(z, M.mode, re, Ne)), (A.return = M), A)
        : ((A = u(A, z)), (A.return = M), A);
    }
    function te(M, A, z) {
      if ((typeof A == "string" && A !== "") || typeof A == "number")
        return ((A = dc("" + A, M.mode, z)), (A.return = M), A);
      if (typeof A == "object" && A !== null) {
        switch (A.$$typeof) {
          case F:
            return (
              (z = eo(A.type, A.key, A.props, null, M.mode, z)),
              (z.ref = xa(M, null, A)),
              (z.return = M),
              z
            );
          case U:
            return ((A = fc(A, M.mode, z)), (A.return = M), A);
          case Q:
            var re = A._init;
            return te(M, re(A._payload), z);
        }
        if (sn(A) || ne(A))
          return ((A = ms(A, M.mode, z, null)), (A.return = M), A);
        Tl(M, A);
      }
      return null;
    }
    function J(M, A, z, re) {
      var Ne = A !== null ? A.key : null;
      if ((typeof z == "string" && z !== "") || typeof z == "number")
        return Ne !== null ? null : N(M, A, "" + z, re);
      if (typeof z == "object" && z !== null) {
        switch (z.$$typeof) {
          case F:
            return z.key === Ne ? T(M, A, z, re) : null;
          case U:
            return z.key === Ne ? $(M, A, z, re) : null;
          case Q:
            return ((Ne = z._init), J(M, A, Ne(z._payload), re));
        }
        if (sn(z) || ne(z)) return Ne !== null ? null : X(M, A, z, re, null);
        Tl(M, z);
      }
      return null;
    }
    function he(M, A, z, re, Ne) {
      if ((typeof re == "string" && re !== "") || typeof re == "number")
        return ((M = M.get(z) || null), N(A, M, "" + re, Ne));
      if (typeof re == "object" && re !== null) {
        switch (re.$$typeof) {
          case F:
            return (
              (M = M.get(re.key === null ? z : re.key) || null),
              T(A, M, re, Ne)
            );
          case U:
            return (
              (M = M.get(re.key === null ? z : re.key) || null),
              $(A, M, re, Ne)
            );
          case Q:
            var Te = re._init;
            return he(M, A, z, Te(re._payload), Ne);
        }
        if (sn(re) || ne(re))
          return ((M = M.get(z) || null), X(A, M, re, Ne, null));
        Tl(A, re);
      }
      return null;
    }
    function ye(M, A, z, re) {
      for (
        var Ne = null, Te = null, _e = A, ze = (A = 0), Nt = null;
        _e !== null && ze < z.length;
        ze++
      ) {
        _e.index > ze ? ((Nt = _e), (_e = null)) : (Nt = _e.sibling);
        var We = J(M, _e, z[ze], re);
        if (We === null) {
          _e === null && (_e = Nt);
          break;
        }
        (e && _e && We.alternate === null && t(M, _e),
          (A = h(We, A, ze)),
          Te === null ? (Ne = We) : (Te.sibling = We),
          (Te = We),
          (_e = Nt));
      }
      if (ze === z.length) return (s(M, _e), tt && ls(M, ze), Ne);
      if (_e === null) {
        for (; ze < z.length; ze++)
          ((_e = te(M, z[ze], re)),
            _e !== null &&
              ((A = h(_e, A, ze)),
              Te === null ? (Ne = _e) : (Te.sibling = _e),
              (Te = _e)));
        return (tt && ls(M, ze), Ne);
      }
      for (_e = o(M, _e); ze < z.length; ze++)
        ((Nt = he(_e, M, ze, z[ze], re)),
          Nt !== null &&
            (e &&
              Nt.alternate !== null &&
              _e.delete(Nt.key === null ? ze : Nt.key),
            (A = h(Nt, A, ze)),
            Te === null ? (Ne = Nt) : (Te.sibling = Nt),
            (Te = Nt)));
      return (
        e &&
          _e.forEach(function (Bn) {
            return t(M, Bn);
          }),
        tt && ls(M, ze),
        Ne
      );
    }
    function we(M, A, z, re) {
      var Ne = ne(z);
      if (typeof Ne != "function") throw Error(l(150));
      if (((z = Ne.call(z)), z == null)) throw Error(l(151));
      for (
        var Te = (Ne = null), _e = A, ze = (A = 0), Nt = null, We = z.next();
        _e !== null && !We.done;
        ze++, We = z.next()
      ) {
        _e.index > ze ? ((Nt = _e), (_e = null)) : (Nt = _e.sibling);
        var Bn = J(M, _e, We.value, re);
        if (Bn === null) {
          _e === null && (_e = Nt);
          break;
        }
        (e && _e && Bn.alternate === null && t(M, _e),
          (A = h(Bn, A, ze)),
          Te === null ? (Ne = Bn) : (Te.sibling = Bn),
          (Te = Bn),
          (_e = Nt));
      }
      if (We.done) return (s(M, _e), tt && ls(M, ze), Ne);
      if (_e === null) {
        for (; !We.done; ze++, We = z.next())
          ((We = te(M, We.value, re)),
            We !== null &&
              ((A = h(We, A, ze)),
              Te === null ? (Ne = We) : (Te.sibling = We),
              (Te = We)));
        return (tt && ls(M, ze), Ne);
      }
      for (_e = o(M, _e); !We.done; ze++, We = z.next())
        ((We = he(_e, M, ze, We.value, re)),
          We !== null &&
            (e &&
              We.alternate !== null &&
              _e.delete(We.key === null ? ze : We.key),
            (A = h(We, A, ze)),
            Te === null ? (Ne = We) : (Te.sibling = We),
            (Te = We)));
      return (
        e &&
          _e.forEach(function (V0) {
            return t(M, V0);
          }),
        tt && ls(M, ze),
        Ne
      );
    }
    function ft(M, A, z, re) {
      if (
        (typeof z == "object" &&
          z !== null &&
          z.type === P &&
          z.key === null &&
          (z = z.props.children),
        typeof z == "object" && z !== null)
      ) {
        switch (z.$$typeof) {
          case F:
            e: {
              for (var Ne = z.key, Te = A; Te !== null; ) {
                if (Te.key === Ne) {
                  if (((Ne = z.type), Ne === P)) {
                    if (Te.tag === 7) {
                      (s(M, Te.sibling),
                        (A = u(Te, z.props.children)),
                        (A.return = M),
                        (M = A));
                      break e;
                    }
                  } else if (
                    Te.elementType === Ne ||
                    (typeof Ne == "object" &&
                      Ne !== null &&
                      Ne.$$typeof === Q &&
                      md(Ne) === Te.type)
                  ) {
                    (s(M, Te.sibling),
                      (A = u(Te, z.props)),
                      (A.ref = xa(M, Te, z)),
                      (A.return = M),
                      (M = A));
                    break e;
                  }
                  s(M, Te);
                  break;
                } else t(M, Te);
                Te = Te.sibling;
              }
              z.type === P
                ? ((A = ms(z.props.children, M.mode, re, z.key)),
                  (A.return = M),
                  (M = A))
                : ((re = eo(z.type, z.key, z.props, null, M.mode, re)),
                  (re.ref = xa(M, A, z)),
                  (re.return = M),
                  (M = re));
            }
            return y(M);
          case U:
            e: {
              for (Te = z.key; A !== null; ) {
                if (A.key === Te)
                  if (
                    A.tag === 4 &&
                    A.stateNode.containerInfo === z.containerInfo &&
                    A.stateNode.implementation === z.implementation
                  ) {
                    (s(M, A.sibling),
                      (A = u(A, z.children || [])),
                      (A.return = M),
                      (M = A));
                    break e;
                  } else {
                    s(M, A);
                    break;
                  }
                else t(M, A);
                A = A.sibling;
              }
              ((A = fc(z, M.mode, re)), (A.return = M), (M = A));
            }
            return y(M);
          case Q:
            return ((Te = z._init), ft(M, A, Te(z._payload), re));
        }
        if (sn(z)) return ye(M, A, z, re);
        if (ne(z)) return we(M, A, z, re);
        Tl(M, z);
      }
      return (typeof z == "string" && z !== "") || typeof z == "number"
        ? ((z = "" + z),
          A !== null && A.tag === 6
            ? (s(M, A.sibling), (A = u(A, z)), (A.return = M), (M = A))
            : (s(M, A), (A = dc(z, M.mode, re)), (A.return = M), (M = A)),
          y(M))
        : s(M, A);
    }
    return ft;
  }
  var zs = pd(!0),
    gd = pd(!1),
    _l = _n(null),
    Ll = null,
    Is = null,
    bi = null;
  function ji() {
    bi = Is = Ll = null;
  }
  function ki(e) {
    var t = _l.current;
    (Ze(_l), (e._currentValue = t));
  }
  function Ni(e, t, s) {
    for (; e !== null; ) {
      var o = e.alternate;
      if (
        ((e.childLanes & t) !== t
          ? ((e.childLanes |= t), o !== null && (o.childLanes |= t))
          : o !== null && (o.childLanes & t) !== t && (o.childLanes |= t),
        e === s)
      )
        break;
      e = e.return;
    }
  }
  function Fs(e, t) {
    ((Ll = e),
      (bi = Is = null),
      (e = e.dependencies),
      e !== null &&
        e.firstContext !== null &&
        ((e.lanes & t) !== 0 && (Gt = !0), (e.firstContext = null)));
  }
  function yr(e) {
    var t = e._currentValue;
    if (bi !== e)
      if (((e = { context: e, memoizedValue: t, next: null }), Is === null)) {
        if (Ll === null) throw Error(l(308));
        ((Is = e), (Ll.dependencies = { lanes: 0, firstContext: e }));
      } else Is = Is.next = e;
    return t;
  }
  var os = null;
  function Si(e) {
    os === null ? (os = [e]) : os.push(e);
  }
  function xd(e, t, s, o) {
    var u = t.interleaved;
    return (
      u === null ? ((s.next = s), Si(t)) : ((s.next = u.next), (u.next = s)),
      (t.interleaved = s),
      gn(e, o)
    );
  }
  function gn(e, t) {
    e.lanes |= t;
    var s = e.alternate;
    for (s !== null && (s.lanes |= t), s = e, e = e.return; e !== null; )
      ((e.childLanes |= t),
        (s = e.alternate),
        s !== null && (s.childLanes |= t),
        (s = e),
        (e = e.return));
    return s.tag === 3 ? s.stateNode : null;
  }
  var On = !1;
  function Ci(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, interleaved: null, lanes: 0 },
      effects: null,
    };
  }
  function yd(e, t) {
    ((e = e.updateQueue),
      t.updateQueue === e &&
        (t.updateQueue = {
          baseState: e.baseState,
          firstBaseUpdate: e.firstBaseUpdate,
          lastBaseUpdate: e.lastBaseUpdate,
          shared: e.shared,
          effects: e.effects,
        }));
  }
  function xn(e, t) {
    return {
      eventTime: e,
      lane: t,
      tag: 0,
      payload: null,
      callback: null,
      next: null,
    };
  }
  function Dn(e, t, s) {
    var o = e.updateQueue;
    if (o === null) return null;
    if (((o = o.shared), (Ve & 2) !== 0)) {
      var u = o.pending;
      return (
        u === null ? (t.next = t) : ((t.next = u.next), (u.next = t)),
        (o.pending = t),
        gn(e, s)
      );
    }
    return (
      (u = o.interleaved),
      u === null ? ((t.next = t), Si(o)) : ((t.next = u.next), (u.next = t)),
      (o.interleaved = t),
      gn(e, s)
    );
  }
  function Al(e, t, s) {
    if (
      ((t = t.updateQueue), t !== null && ((t = t.shared), (s & 4194240) !== 0))
    ) {
      var o = t.lanes;
      ((o &= e.pendingLanes), (s |= o), (t.lanes = s), $o(e, s));
    }
  }
  function vd(e, t) {
    var s = e.updateQueue,
      o = e.alternate;
    if (o !== null && ((o = o.updateQueue), s === o)) {
      var u = null,
        h = null;
      if (((s = s.firstBaseUpdate), s !== null)) {
        do {
          var y = {
            eventTime: s.eventTime,
            lane: s.lane,
            tag: s.tag,
            payload: s.payload,
            callback: s.callback,
            next: null,
          };
          (h === null ? (u = h = y) : (h = h.next = y), (s = s.next));
        } while (s !== null);
        h === null ? (u = h = t) : (h = h.next = t);
      } else u = h = t;
      ((s = {
        baseState: o.baseState,
        firstBaseUpdate: u,
        lastBaseUpdate: h,
        shared: o.shared,
        effects: o.effects,
      }),
        (e.updateQueue = s));
      return;
    }
    ((e = s.lastBaseUpdate),
      e === null ? (s.firstBaseUpdate = t) : (e.next = t),
      (s.lastBaseUpdate = t));
  }
  function Ol(e, t, s, o) {
    var u = e.updateQueue;
    On = !1;
    var h = u.firstBaseUpdate,
      y = u.lastBaseUpdate,
      N = u.shared.pending;
    if (N !== null) {
      u.shared.pending = null;
      var T = N,
        $ = T.next;
      ((T.next = null), y === null ? (h = $) : (y.next = $), (y = T));
      var X = e.alternate;
      X !== null &&
        ((X = X.updateQueue),
        (N = X.lastBaseUpdate),
        N !== y &&
          (N === null ? (X.firstBaseUpdate = $) : (N.next = $),
          (X.lastBaseUpdate = T)));
    }
    if (h !== null) {
      var te = u.baseState;
      ((y = 0), (X = $ = T = null), (N = h));
      do {
        var J = N.lane,
          he = N.eventTime;
        if ((o & J) === J) {
          X !== null &&
            (X = X.next =
              {
                eventTime: he,
                lane: 0,
                tag: N.tag,
                payload: N.payload,
                callback: N.callback,
                next: null,
              });
          e: {
            var ye = e,
              we = N;
            switch (((J = t), (he = s), we.tag)) {
              case 1:
                if (((ye = we.payload), typeof ye == "function")) {
                  te = ye.call(he, te, J);
                  break e;
                }
                te = ye;
                break e;
              case 3:
                ye.flags = (ye.flags & -65537) | 128;
              case 0:
                if (
                  ((ye = we.payload),
                  (J = typeof ye == "function" ? ye.call(he, te, J) : ye),
                  J == null)
                )
                  break e;
                te = ee({}, te, J);
                break e;
              case 2:
                On = !0;
            }
          }
          N.callback !== null &&
            N.lane !== 0 &&
            ((e.flags |= 64),
            (J = u.effects),
            J === null ? (u.effects = [N]) : J.push(N));
        } else
          ((he = {
            eventTime: he,
            lane: J,
            tag: N.tag,
            payload: N.payload,
            callback: N.callback,
            next: null,
          }),
            X === null ? (($ = X = he), (T = te)) : (X = X.next = he),
            (y |= J));
        if (((N = N.next), N === null)) {
          if (((N = u.shared.pending), N === null)) break;
          ((J = N),
            (N = J.next),
            (J.next = null),
            (u.lastBaseUpdate = J),
            (u.shared.pending = null));
        }
      } while (!0);
      if (
        (X === null && (T = te),
        (u.baseState = T),
        (u.firstBaseUpdate = $),
        (u.lastBaseUpdate = X),
        (t = u.shared.interleaved),
        t !== null)
      ) {
        u = t;
        do ((y |= u.lane), (u = u.next));
        while (u !== t);
      } else h === null && (u.shared.lanes = 0);
      ((us |= y), (e.lanes = y), (e.memoizedState = te));
    }
  }
  function wd(e, t, s) {
    if (((e = t.effects), (t.effects = null), e !== null))
      for (t = 0; t < e.length; t++) {
        var o = e[t],
          u = o.callback;
        if (u !== null) {
          if (((o.callback = null), (o = s), typeof u != "function"))
            throw Error(l(191, u));
          u.call(o);
        }
      }
  }
  var ya = {},
    Kr = _n(ya),
    va = _n(ya),
    wa = _n(ya);
  function is(e) {
    if (e === ya) throw Error(l(174));
    return e;
  }
  function Ei(e, t) {
    switch ((Je(wa, t), Je(va, e), Je(Kr, ya), (e = t.nodeType), e)) {
      case 9:
      case 11:
        t = (t = t.documentElement) ? t.namespaceURI : an(null, "");
        break;
      default:
        ((e = e === 8 ? t.parentNode : t),
          (t = e.namespaceURI || null),
          (e = e.tagName),
          (t = an(t, e)));
    }
    (Ze(Kr), Je(Kr, t));
  }
  function $s() {
    (Ze(Kr), Ze(va), Ze(wa));
  }
  function bd(e) {
    is(wa.current);
    var t = is(Kr.current),
      s = an(t, e.type);
    t !== s && (Je(va, e), Je(Kr, s));
  }
  function Ri(e) {
    va.current === e && (Ze(Kr), Ze(va));
  }
  var at = _n(0);
  function Dl(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var s = t.memoizedState;
        if (
          s !== null &&
          ((s = s.dehydrated), s === null || s.data === "$?" || s.data === "$!")
        )
          return t;
      } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
        if ((t.flags & 128) !== 0) return t;
      } else if (t.child !== null) {
        ((t.child.return = t), (t = t.child));
        continue;
      }
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return null;
        t = t.return;
      }
      ((t.sibling.return = t.return), (t = t.sibling));
    }
    return null;
  }
  var Pi = [];
  function Ti() {
    for (var e = 0; e < Pi.length; e++)
      Pi[e]._workInProgressVersionPrimary = null;
    Pi.length = 0;
  }
  var Ml = G.ReactCurrentDispatcher,
    _i = G.ReactCurrentBatchConfig,
    cs = 0,
    lt = null,
    vt = null,
    jt = null,
    zl = !1,
    ba = !1,
    ja = 0,
    f0 = 0;
  function Lt() {
    throw Error(l(321));
  }
  function Li(e, t) {
    if (t === null) return !1;
    for (var s = 0; s < t.length && s < e.length; s++)
      if (!Pr(e[s], t[s])) return !1;
    return !0;
  }
  function Ai(e, t, s, o, u, h) {
    if (
      ((cs = h),
      (lt = t),
      (t.memoizedState = null),
      (t.updateQueue = null),
      (t.lanes = 0),
      (Ml.current = e === null || e.memoizedState === null ? g0 : x0),
      (e = s(o, u)),
      ba)
    ) {
      h = 0;
      do {
        if (((ba = !1), (ja = 0), 25 <= h)) throw Error(l(301));
        ((h += 1),
          (jt = vt = null),
          (t.updateQueue = null),
          (Ml.current = y0),
          (e = s(o, u)));
      } while (ba);
    }
    if (
      ((Ml.current = $l),
      (t = vt !== null && vt.next !== null),
      (cs = 0),
      (jt = vt = lt = null),
      (zl = !1),
      t)
    )
      throw Error(l(300));
    return e;
  }
  function Oi() {
    var e = ja !== 0;
    return ((ja = 0), e);
  }
  function Qr() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null,
    };
    return (jt === null ? (lt.memoizedState = jt = e) : (jt = jt.next = e), jt);
  }
  function vr() {
    if (vt === null) {
      var e = lt.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = vt.next;
    var t = jt === null ? lt.memoizedState : jt.next;
    if (t !== null) ((jt = t), (vt = e));
    else {
      if (e === null) throw Error(l(310));
      ((vt = e),
        (e = {
          memoizedState: vt.memoizedState,
          baseState: vt.baseState,
          baseQueue: vt.baseQueue,
          queue: vt.queue,
          next: null,
        }),
        jt === null ? (lt.memoizedState = jt = e) : (jt = jt.next = e));
    }
    return jt;
  }
  function ka(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function Di(e) {
    var t = vr(),
      s = t.queue;
    if (s === null) throw Error(l(311));
    s.lastRenderedReducer = e;
    var o = vt,
      u = o.baseQueue,
      h = s.pending;
    if (h !== null) {
      if (u !== null) {
        var y = u.next;
        ((u.next = h.next), (h.next = y));
      }
      ((o.baseQueue = u = h), (s.pending = null));
    }
    if (u !== null) {
      ((h = u.next), (o = o.baseState));
      var N = (y = null),
        T = null,
        $ = h;
      do {
        var X = $.lane;
        if ((cs & X) === X)
          (T !== null &&
            (T = T.next =
              {
                lane: 0,
                action: $.action,
                hasEagerState: $.hasEagerState,
                eagerState: $.eagerState,
                next: null,
              }),
            (o = $.hasEagerState ? $.eagerState : e(o, $.action)));
        else {
          var te = {
            lane: X,
            action: $.action,
            hasEagerState: $.hasEagerState,
            eagerState: $.eagerState,
            next: null,
          };
          (T === null ? ((N = T = te), (y = o)) : (T = T.next = te),
            (lt.lanes |= X),
            (us |= X));
        }
        $ = $.next;
      } while ($ !== null && $ !== h);
      (T === null ? (y = o) : (T.next = N),
        Pr(o, t.memoizedState) || (Gt = !0),
        (t.memoizedState = o),
        (t.baseState = y),
        (t.baseQueue = T),
        (s.lastRenderedState = o));
    }
    if (((e = s.interleaved), e !== null)) {
      u = e;
      do ((h = u.lane), (lt.lanes |= h), (us |= h), (u = u.next));
      while (u !== e);
    } else u === null && (s.lanes = 0);
    return [t.memoizedState, s.dispatch];
  }
  function Mi(e) {
    var t = vr(),
      s = t.queue;
    if (s === null) throw Error(l(311));
    s.lastRenderedReducer = e;
    var o = s.dispatch,
      u = s.pending,
      h = t.memoizedState;
    if (u !== null) {
      s.pending = null;
      var y = (u = u.next);
      do ((h = e(h, y.action)), (y = y.next));
      while (y !== u);
      (Pr(h, t.memoizedState) || (Gt = !0),
        (t.memoizedState = h),
        t.baseQueue === null && (t.baseState = h),
        (s.lastRenderedState = h));
    }
    return [h, o];
  }
  function jd() {}
  function kd(e, t) {
    var s = lt,
      o = vr(),
      u = t(),
      h = !Pr(o.memoizedState, u);
    if (
      (h && ((o.memoizedState = u), (Gt = !0)),
      (o = o.queue),
      zi(Cd.bind(null, s, o, e), [e]),
      o.getSnapshot !== t || h || (jt !== null && jt.memoizedState.tag & 1))
    ) {
      if (
        ((s.flags |= 2048),
        Na(9, Sd.bind(null, s, o, u, t), void 0, null),
        kt === null)
      )
        throw Error(l(349));
      (cs & 30) !== 0 || Nd(s, t, u);
    }
    return u;
  }
  function Nd(e, t, s) {
    ((e.flags |= 16384),
      (e = { getSnapshot: t, value: s }),
      (t = lt.updateQueue),
      t === null
        ? ((t = { lastEffect: null, stores: null }),
          (lt.updateQueue = t),
          (t.stores = [e]))
        : ((s = t.stores), s === null ? (t.stores = [e]) : s.push(e)));
  }
  function Sd(e, t, s, o) {
    ((t.value = s), (t.getSnapshot = o), Ed(t) && Rd(e));
  }
  function Cd(e, t, s) {
    return s(function () {
      Ed(t) && Rd(e);
    });
  }
  function Ed(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var s = t();
      return !Pr(e, s);
    } catch {
      return !0;
    }
  }
  function Rd(e) {
    var t = gn(e, 1);
    t !== null && Or(t, e, 1, -1);
  }
  function Pd(e) {
    var t = Qr();
    return (
      typeof e == "function" && (e = e()),
      (t.memoizedState = t.baseState = e),
      (e = {
        pending: null,
        interleaved: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: ka,
        lastRenderedState: e,
      }),
      (t.queue = e),
      (e = e.dispatch = p0.bind(null, lt, e)),
      [t.memoizedState, e]
    );
  }
  function Na(e, t, s, o) {
    return (
      (e = { tag: e, create: t, destroy: s, deps: o, next: null }),
      (t = lt.updateQueue),
      t === null
        ? ((t = { lastEffect: null, stores: null }),
          (lt.updateQueue = t),
          (t.lastEffect = e.next = e))
        : ((s = t.lastEffect),
          s === null
            ? (t.lastEffect = e.next = e)
            : ((o = s.next), (s.next = e), (e.next = o), (t.lastEffect = e))),
      e
    );
  }
  function Td() {
    return vr().memoizedState;
  }
  function Il(e, t, s, o) {
    var u = Qr();
    ((lt.flags |= e),
      (u.memoizedState = Na(1 | t, s, void 0, o === void 0 ? null : o)));
  }
  function Fl(e, t, s, o) {
    var u = vr();
    o = o === void 0 ? null : o;
    var h = void 0;
    if (vt !== null) {
      var y = vt.memoizedState;
      if (((h = y.destroy), o !== null && Li(o, y.deps))) {
        u.memoizedState = Na(t, s, h, o);
        return;
      }
    }
    ((lt.flags |= e), (u.memoizedState = Na(1 | t, s, h, o)));
  }
  function _d(e, t) {
    return Il(8390656, 8, e, t);
  }
  function zi(e, t) {
    return Fl(2048, 8, e, t);
  }
  function Ld(e, t) {
    return Fl(4, 2, e, t);
  }
  function Ad(e, t) {
    return Fl(4, 4, e, t);
  }
  function Od(e, t) {
    if (typeof t == "function")
      return (
        (e = e()),
        t(e),
        function () {
          t(null);
        }
      );
    if (t != null)
      return (
        (e = e()),
        (t.current = e),
        function () {
          t.current = null;
        }
      );
  }
  function Dd(e, t, s) {
    return (
      (s = s != null ? s.concat([e]) : null),
      Fl(4, 4, Od.bind(null, t, e), s)
    );
  }
  function Ii() {}
  function Md(e, t) {
    var s = vr();
    t = t === void 0 ? null : t;
    var o = s.memoizedState;
    return o !== null && t !== null && Li(t, o[1])
      ? o[0]
      : ((s.memoizedState = [e, t]), e);
  }
  function zd(e, t) {
    var s = vr();
    t = t === void 0 ? null : t;
    var o = s.memoizedState;
    return o !== null && t !== null && Li(t, o[1])
      ? o[0]
      : ((e = e()), (s.memoizedState = [e, t]), e);
  }
  function Id(e, t, s) {
    return (cs & 21) === 0
      ? (e.baseState && ((e.baseState = !1), (Gt = !0)), (e.memoizedState = s))
      : (Pr(s, t) ||
          ((s = mu()), (lt.lanes |= s), (us |= s), (e.baseState = !0)),
        t);
  }
  function h0(e, t) {
    var s = Ke;
    ((Ke = s !== 0 && 4 > s ? s : 4), e(!0));
    var o = _i.transition;
    _i.transition = {};
    try {
      (e(!1), t());
    } finally {
      ((Ke = s), (_i.transition = o));
    }
  }
  function Fd() {
    return vr().memoizedState;
  }
  function m0(e, t, s) {
    var o = Fn(e);
    if (
      ((s = {
        lane: o,
        action: s,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
      $d(e))
    )
      Ud(t, s);
    else if (((s = xd(e, t, s, o)), s !== null)) {
      var u = Bt();
      (Or(s, e, o, u), Bd(s, t, o));
    }
  }
  function p0(e, t, s) {
    var o = Fn(e),
      u = {
        lane: o,
        action: s,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      };
    if ($d(e)) Ud(t, u);
    else {
      var h = e.alternate;
      if (
        e.lanes === 0 &&
        (h === null || h.lanes === 0) &&
        ((h = t.lastRenderedReducer), h !== null)
      )
        try {
          var y = t.lastRenderedState,
            N = h(y, s);
          if (((u.hasEagerState = !0), (u.eagerState = N), Pr(N, y))) {
            var T = t.interleaved;
            (T === null
              ? ((u.next = u), Si(t))
              : ((u.next = T.next), (T.next = u)),
              (t.interleaved = u));
            return;
          }
        } catch {
        } finally {
        }
      ((s = xd(e, t, u, o)),
        s !== null && ((u = Bt()), Or(s, e, o, u), Bd(s, t, o)));
    }
  }
  function $d(e) {
    var t = e.alternate;
    return e === lt || (t !== null && t === lt);
  }
  function Ud(e, t) {
    ba = zl = !0;
    var s = e.pending;
    (s === null ? (t.next = t) : ((t.next = s.next), (s.next = t)),
      (e.pending = t));
  }
  function Bd(e, t, s) {
    if ((s & 4194240) !== 0) {
      var o = t.lanes;
      ((o &= e.pendingLanes), (s |= o), (t.lanes = s), $o(e, s));
    }
  }
  var $l = {
      readContext: yr,
      useCallback: Lt,
      useContext: Lt,
      useEffect: Lt,
      useImperativeHandle: Lt,
      useInsertionEffect: Lt,
      useLayoutEffect: Lt,
      useMemo: Lt,
      useReducer: Lt,
      useRef: Lt,
      useState: Lt,
      useDebugValue: Lt,
      useDeferredValue: Lt,
      useTransition: Lt,
      useMutableSource: Lt,
      useSyncExternalStore: Lt,
      useId: Lt,
      unstable_isNewReconciler: !1,
    },
    g0 = {
      readContext: yr,
      useCallback: function (e, t) {
        return ((Qr().memoizedState = [e, t === void 0 ? null : t]), e);
      },
      useContext: yr,
      useEffect: _d,
      useImperativeHandle: function (e, t, s) {
        return (
          (s = s != null ? s.concat([e]) : null),
          Il(4194308, 4, Od.bind(null, t, e), s)
        );
      },
      useLayoutEffect: function (e, t) {
        return Il(4194308, 4, e, t);
      },
      useInsertionEffect: function (e, t) {
        return Il(4, 2, e, t);
      },
      useMemo: function (e, t) {
        var s = Qr();
        return (
          (t = t === void 0 ? null : t),
          (e = e()),
          (s.memoizedState = [e, t]),
          e
        );
      },
      useReducer: function (e, t, s) {
        var o = Qr();
        return (
          (t = s !== void 0 ? s(t) : t),
          (o.memoizedState = o.baseState = t),
          (e = {
            pending: null,
            interleaved: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: e,
            lastRenderedState: t,
          }),
          (o.queue = e),
          (e = e.dispatch = m0.bind(null, lt, e)),
          [o.memoizedState, e]
        );
      },
      useRef: function (e) {
        var t = Qr();
        return ((e = { current: e }), (t.memoizedState = e));
      },
      useState: Pd,
      useDebugValue: Ii,
      useDeferredValue: function (e) {
        return (Qr().memoizedState = e);
      },
      useTransition: function () {
        var e = Pd(!1),
          t = e[0];
        return ((e = h0.bind(null, e[1])), (Qr().memoizedState = e), [t, e]);
      },
      useMutableSource: function () {},
      useSyncExternalStore: function (e, t, s) {
        var o = lt,
          u = Qr();
        if (tt) {
          if (s === void 0) throw Error(l(407));
          s = s();
        } else {
          if (((s = t()), kt === null)) throw Error(l(349));
          (cs & 30) !== 0 || Nd(o, t, s);
        }
        u.memoizedState = s;
        var h = { value: s, getSnapshot: t };
        return (
          (u.queue = h),
          _d(Cd.bind(null, o, h, e), [e]),
          (o.flags |= 2048),
          Na(9, Sd.bind(null, o, h, s, t), void 0, null),
          s
        );
      },
      useId: function () {
        var e = Qr(),
          t = kt.identifierPrefix;
        if (tt) {
          var s = pn,
            o = mn;
          ((s = (o & ~(1 << (32 - Qe(o) - 1))).toString(32) + s),
            (t = ":" + t + "R" + s),
            (s = ja++),
            0 < s && (t += "H" + s.toString(32)),
            (t += ":"));
        } else ((s = f0++), (t = ":" + t + "r" + s.toString(32) + ":"));
        return (e.memoizedState = t);
      },
      unstable_isNewReconciler: !1,
    },
    x0 = {
      readContext: yr,
      useCallback: Md,
      useContext: yr,
      useEffect: zi,
      useImperativeHandle: Dd,
      useInsertionEffect: Ld,
      useLayoutEffect: Ad,
      useMemo: zd,
      useReducer: Di,
      useRef: Td,
      useState: function () {
        return Di(ka);
      },
      useDebugValue: Ii,
      useDeferredValue: function (e) {
        var t = vr();
        return Id(t, vt.memoizedState, e);
      },
      useTransition: function () {
        var e = Di(ka)[0],
          t = vr().memoizedState;
        return [e, t];
      },
      useMutableSource: jd,
      useSyncExternalStore: kd,
      useId: Fd,
      unstable_isNewReconciler: !1,
    },
    y0 = {
      readContext: yr,
      useCallback: Md,
      useContext: yr,
      useEffect: zi,
      useImperativeHandle: Dd,
      useInsertionEffect: Ld,
      useLayoutEffect: Ad,
      useMemo: zd,
      useReducer: Mi,
      useRef: Td,
      useState: function () {
        return Mi(ka);
      },
      useDebugValue: Ii,
      useDeferredValue: function (e) {
        var t = vr();
        return vt === null ? (t.memoizedState = e) : Id(t, vt.memoizedState, e);
      },
      useTransition: function () {
        var e = Mi(ka)[0],
          t = vr().memoizedState;
        return [e, t];
      },
      useMutableSource: jd,
      useSyncExternalStore: kd,
      useId: Fd,
      unstable_isNewReconciler: !1,
    };
  function _r(e, t) {
    if (e && e.defaultProps) {
      ((t = ee({}, t)), (e = e.defaultProps));
      for (var s in e) t[s] === void 0 && (t[s] = e[s]);
      return t;
    }
    return t;
  }
  function Fi(e, t, s, o) {
    ((t = e.memoizedState),
      (s = s(o, t)),
      (s = s == null ? t : ee({}, t, s)),
      (e.memoizedState = s),
      e.lanes === 0 && (e.updateQueue.baseState = s));
  }
  var Ul = {
    isMounted: function (e) {
      return (e = e._reactInternals) ? je(e) === e : !1;
    },
    enqueueSetState: function (e, t, s) {
      e = e._reactInternals;
      var o = Bt(),
        u = Fn(e),
        h = xn(o, u);
      ((h.payload = t),
        s != null && (h.callback = s),
        (t = Dn(e, h, u)),
        t !== null && (Or(t, e, u, o), Al(t, e, u)));
    },
    enqueueReplaceState: function (e, t, s) {
      e = e._reactInternals;
      var o = Bt(),
        u = Fn(e),
        h = xn(o, u);
      ((h.tag = 1),
        (h.payload = t),
        s != null && (h.callback = s),
        (t = Dn(e, h, u)),
        t !== null && (Or(t, e, u, o), Al(t, e, u)));
    },
    enqueueForceUpdate: function (e, t) {
      e = e._reactInternals;
      var s = Bt(),
        o = Fn(e),
        u = xn(s, o);
      ((u.tag = 2),
        t != null && (u.callback = t),
        (t = Dn(e, u, o)),
        t !== null && (Or(t, e, o, s), Al(t, e, o)));
    },
  };
  function Hd(e, t, s, o, u, h, y) {
    return (
      (e = e.stateNode),
      typeof e.shouldComponentUpdate == "function"
        ? e.shouldComponentUpdate(o, h, y)
        : t.prototype && t.prototype.isPureReactComponent
          ? !ua(s, o) || !ua(u, h)
          : !0
    );
  }
  function Vd(e, t, s) {
    var o = !1,
      u = Ln,
      h = t.contextType;
    return (
      typeof h == "object" && h !== null
        ? (h = yr(h))
        : ((u = Yt(t) ? ss : _t.current),
          (o = t.contextTypes),
          (h = (o = o != null) ? As(e, u) : Ln)),
      (t = new t(s, h)),
      (e.memoizedState =
        t.state !== null && t.state !== void 0 ? t.state : null),
      (t.updater = Ul),
      (e.stateNode = t),
      (t._reactInternals = e),
      o &&
        ((e = e.stateNode),
        (e.__reactInternalMemoizedUnmaskedChildContext = u),
        (e.__reactInternalMemoizedMaskedChildContext = h)),
      t
    );
  }
  function Wd(e, t, s, o) {
    ((e = t.state),
      typeof t.componentWillReceiveProps == "function" &&
        t.componentWillReceiveProps(s, o),
      typeof t.UNSAFE_componentWillReceiveProps == "function" &&
        t.UNSAFE_componentWillReceiveProps(s, o),
      t.state !== e && Ul.enqueueReplaceState(t, t.state, null));
  }
  function $i(e, t, s, o) {
    var u = e.stateNode;
    ((u.props = s), (u.state = e.memoizedState), (u.refs = {}), Ci(e));
    var h = t.contextType;
    (typeof h == "object" && h !== null
      ? (u.context = yr(h))
      : ((h = Yt(t) ? ss : _t.current), (u.context = As(e, h))),
      (u.state = e.memoizedState),
      (h = t.getDerivedStateFromProps),
      typeof h == "function" && (Fi(e, t, h, s), (u.state = e.memoizedState)),
      typeof t.getDerivedStateFromProps == "function" ||
        typeof u.getSnapshotBeforeUpdate == "function" ||
        (typeof u.UNSAFE_componentWillMount != "function" &&
          typeof u.componentWillMount != "function") ||
        ((t = u.state),
        typeof u.componentWillMount == "function" && u.componentWillMount(),
        typeof u.UNSAFE_componentWillMount == "function" &&
          u.UNSAFE_componentWillMount(),
        t !== u.state && Ul.enqueueReplaceState(u, u.state, null),
        Ol(e, s, u, o),
        (u.state = e.memoizedState)),
      typeof u.componentDidMount == "function" && (e.flags |= 4194308));
  }
  function Us(e, t) {
    try {
      var s = "",
        o = t;
      do ((s += q(o)), (o = o.return));
      while (o);
      var u = s;
    } catch (h) {
      u =
        `
Error generating stack: ` +
        h.message +
        `
` +
        h.stack;
    }
    return { value: e, source: t, stack: u, digest: null };
  }
  function Ui(e, t, s) {
    return { value: e, source: null, stack: s ?? null, digest: t ?? null };
  }
  function Bi(e, t) {
    try {
      console.error(t.value);
    } catch (s) {
      setTimeout(function () {
        throw s;
      });
    }
  }
  var v0 = typeof WeakMap == "function" ? WeakMap : Map;
  function qd(e, t, s) {
    ((s = xn(-1, s)), (s.tag = 3), (s.payload = { element: null }));
    var o = t.value;
    return (
      (s.callback = function () {
        (Gl || ((Gl = !0), (nc = o)), Bi(e, t));
      }),
      s
    );
  }
  function Yd(e, t, s) {
    ((s = xn(-1, s)), (s.tag = 3));
    var o = e.type.getDerivedStateFromError;
    if (typeof o == "function") {
      var u = t.value;
      ((s.payload = function () {
        return o(u);
      }),
        (s.callback = function () {
          Bi(e, t);
        }));
    }
    var h = e.stateNode;
    return (
      h !== null &&
        typeof h.componentDidCatch == "function" &&
        (s.callback = function () {
          (Bi(e, t),
            typeof o != "function" &&
              (zn === null ? (zn = new Set([this])) : zn.add(this)));
          var y = t.stack;
          this.componentDidCatch(t.value, {
            componentStack: y !== null ? y : "",
          });
        }),
      s
    );
  }
  function Gd(e, t, s) {
    var o = e.pingCache;
    if (o === null) {
      o = e.pingCache = new v0();
      var u = new Set();
      o.set(t, u);
    } else ((u = o.get(t)), u === void 0 && ((u = new Set()), o.set(t, u)));
    u.has(s) || (u.add(s), (e = A0.bind(null, e, t, s)), t.then(e, e));
  }
  function Kd(e) {
    do {
      var t;
      if (
        ((t = e.tag === 13) &&
          ((t = e.memoizedState),
          (t = t !== null ? t.dehydrated !== null : !0)),
        t)
      )
        return e;
      e = e.return;
    } while (e !== null);
    return null;
  }
  function Qd(e, t, s, o, u) {
    return (e.mode & 1) === 0
      ? (e === t
          ? (e.flags |= 65536)
          : ((e.flags |= 128),
            (s.flags |= 131072),
            (s.flags &= -52805),
            s.tag === 1 &&
              (s.alternate === null
                ? (s.tag = 17)
                : ((t = xn(-1, 1)), (t.tag = 2), Dn(s, t, 1))),
            (s.lanes |= 1)),
        e)
      : ((e.flags |= 65536), (e.lanes = u), e);
  }
  var w0 = G.ReactCurrentOwner,
    Gt = !1;
  function Ut(e, t, s, o) {
    t.child = e === null ? gd(t, null, s, o) : zs(t, e.child, s, o);
  }
  function Jd(e, t, s, o, u) {
    s = s.render;
    var h = t.ref;
    return (
      Fs(t, u),
      (o = Ai(e, t, s, o, h, u)),
      (s = Oi()),
      e !== null && !Gt
        ? ((t.updateQueue = e.updateQueue),
          (t.flags &= -2053),
          (e.lanes &= ~u),
          yn(e, t, u))
        : (tt && s && gi(t), (t.flags |= 1), Ut(e, t, o, u), t.child)
    );
  }
  function Xd(e, t, s, o, u) {
    if (e === null) {
      var h = s.type;
      return typeof h == "function" &&
        !uc(h) &&
        h.defaultProps === void 0 &&
        s.compare === null &&
        s.defaultProps === void 0
        ? ((t.tag = 15), (t.type = h), Zd(e, t, h, o, u))
        : ((e = eo(s.type, null, o, t, t.mode, u)),
          (e.ref = t.ref),
          (e.return = t),
          (t.child = e));
    }
    if (((h = e.child), (e.lanes & u) === 0)) {
      var y = h.memoizedProps;
      if (
        ((s = s.compare), (s = s !== null ? s : ua), s(y, o) && e.ref === t.ref)
      )
        return yn(e, t, u);
    }
    return (
      (t.flags |= 1),
      (e = Un(h, o)),
      (e.ref = t.ref),
      (e.return = t),
      (t.child = e)
    );
  }
  function Zd(e, t, s, o, u) {
    if (e !== null) {
      var h = e.memoizedProps;
      if (ua(h, o) && e.ref === t.ref)
        if (((Gt = !1), (t.pendingProps = o = h), (e.lanes & u) !== 0))
          (e.flags & 131072) !== 0 && (Gt = !0);
        else return ((t.lanes = e.lanes), yn(e, t, u));
    }
    return Hi(e, t, s, o, u);
  }
  function ef(e, t, s) {
    var o = t.pendingProps,
      u = o.children,
      h = e !== null ? e.memoizedState : null;
    if (o.mode === "hidden")
      if ((t.mode & 1) === 0)
        ((t.memoizedState = {
          baseLanes: 0,
          cachePool: null,
          transitions: null,
        }),
          Je(Hs, ur),
          (ur |= s));
      else {
        if ((s & 1073741824) === 0)
          return (
            (e = h !== null ? h.baseLanes | s : s),
            (t.lanes = t.childLanes = 1073741824),
            (t.memoizedState = {
              baseLanes: e,
              cachePool: null,
              transitions: null,
            }),
            (t.updateQueue = null),
            Je(Hs, ur),
            (ur |= e),
            null
          );
        ((t.memoizedState = {
          baseLanes: 0,
          cachePool: null,
          transitions: null,
        }),
          (o = h !== null ? h.baseLanes : s),
          Je(Hs, ur),
          (ur |= o));
      }
    else
      (h !== null ? ((o = h.baseLanes | s), (t.memoizedState = null)) : (o = s),
        Je(Hs, ur),
        (ur |= o));
    return (Ut(e, t, u, s), t.child);
  }
  function tf(e, t) {
    var s = t.ref;
    ((e === null && s !== null) || (e !== null && e.ref !== s)) &&
      ((t.flags |= 512), (t.flags |= 2097152));
  }
  function Hi(e, t, s, o, u) {
    var h = Yt(s) ? ss : _t.current;
    return (
      (h = As(t, h)),
      Fs(t, u),
      (s = Ai(e, t, s, o, h, u)),
      (o = Oi()),
      e !== null && !Gt
        ? ((t.updateQueue = e.updateQueue),
          (t.flags &= -2053),
          (e.lanes &= ~u),
          yn(e, t, u))
        : (tt && o && gi(t), (t.flags |= 1), Ut(e, t, s, u), t.child)
    );
  }
  function rf(e, t, s, o, u) {
    if (Yt(s)) {
      var h = !0;
      Sl(t);
    } else h = !1;
    if ((Fs(t, u), t.stateNode === null))
      (Hl(e, t), Vd(t, s, o), $i(t, s, o, u), (o = !0));
    else if (e === null) {
      var y = t.stateNode,
        N = t.memoizedProps;
      y.props = N;
      var T = y.context,
        $ = s.contextType;
      typeof $ == "object" && $ !== null
        ? ($ = yr($))
        : (($ = Yt(s) ? ss : _t.current), ($ = As(t, $)));
      var X = s.getDerivedStateFromProps,
        te =
          typeof X == "function" ||
          typeof y.getSnapshotBeforeUpdate == "function";
      (te ||
        (typeof y.UNSAFE_componentWillReceiveProps != "function" &&
          typeof y.componentWillReceiveProps != "function") ||
        ((N !== o || T !== $) && Wd(t, y, o, $)),
        (On = !1));
      var J = t.memoizedState;
      ((y.state = J),
        Ol(t, o, y, u),
        (T = t.memoizedState),
        N !== o || J !== T || qt.current || On
          ? (typeof X == "function" && (Fi(t, s, X, o), (T = t.memoizedState)),
            (N = On || Hd(t, s, N, o, J, T, $))
              ? (te ||
                  (typeof y.UNSAFE_componentWillMount != "function" &&
                    typeof y.componentWillMount != "function") ||
                  (typeof y.componentWillMount == "function" &&
                    y.componentWillMount(),
                  typeof y.UNSAFE_componentWillMount == "function" &&
                    y.UNSAFE_componentWillMount()),
                typeof y.componentDidMount == "function" &&
                  (t.flags |= 4194308))
              : (typeof y.componentDidMount == "function" &&
                  (t.flags |= 4194308),
                (t.memoizedProps = o),
                (t.memoizedState = T)),
            (y.props = o),
            (y.state = T),
            (y.context = $),
            (o = N))
          : (typeof y.componentDidMount == "function" && (t.flags |= 4194308),
            (o = !1)));
    } else {
      ((y = t.stateNode),
        yd(e, t),
        (N = t.memoizedProps),
        ($ = t.type === t.elementType ? N : _r(t.type, N)),
        (y.props = $),
        (te = t.pendingProps),
        (J = y.context),
        (T = s.contextType),
        typeof T == "object" && T !== null
          ? (T = yr(T))
          : ((T = Yt(s) ? ss : _t.current), (T = As(t, T))));
      var he = s.getDerivedStateFromProps;
      ((X =
        typeof he == "function" ||
        typeof y.getSnapshotBeforeUpdate == "function") ||
        (typeof y.UNSAFE_componentWillReceiveProps != "function" &&
          typeof y.componentWillReceiveProps != "function") ||
        ((N !== te || J !== T) && Wd(t, y, o, T)),
        (On = !1),
        (J = t.memoizedState),
        (y.state = J),
        Ol(t, o, y, u));
      var ye = t.memoizedState;
      N !== te || J !== ye || qt.current || On
        ? (typeof he == "function" && (Fi(t, s, he, o), (ye = t.memoizedState)),
          ($ = On || Hd(t, s, $, o, J, ye, T) || !1)
            ? (X ||
                (typeof y.UNSAFE_componentWillUpdate != "function" &&
                  typeof y.componentWillUpdate != "function") ||
                (typeof y.componentWillUpdate == "function" &&
                  y.componentWillUpdate(o, ye, T),
                typeof y.UNSAFE_componentWillUpdate == "function" &&
                  y.UNSAFE_componentWillUpdate(o, ye, T)),
              typeof y.componentDidUpdate == "function" && (t.flags |= 4),
              typeof y.getSnapshotBeforeUpdate == "function" &&
                (t.flags |= 1024))
            : (typeof y.componentDidUpdate != "function" ||
                (N === e.memoizedProps && J === e.memoizedState) ||
                (t.flags |= 4),
              typeof y.getSnapshotBeforeUpdate != "function" ||
                (N === e.memoizedProps && J === e.memoizedState) ||
                (t.flags |= 1024),
              (t.memoizedProps = o),
              (t.memoizedState = ye)),
          (y.props = o),
          (y.state = ye),
          (y.context = T),
          (o = $))
        : (typeof y.componentDidUpdate != "function" ||
            (N === e.memoizedProps && J === e.memoizedState) ||
            (t.flags |= 4),
          typeof y.getSnapshotBeforeUpdate != "function" ||
            (N === e.memoizedProps && J === e.memoizedState) ||
            (t.flags |= 1024),
          (o = !1));
    }
    return Vi(e, t, s, o, h, u);
  }
  function Vi(e, t, s, o, u, h) {
    tf(e, t);
    var y = (t.flags & 128) !== 0;
    if (!o && !y) return (u && od(t, s, !1), yn(e, t, h));
    ((o = t.stateNode), (w0.current = t));
    var N =
      y && typeof s.getDerivedStateFromError != "function" ? null : o.render();
    return (
      (t.flags |= 1),
      e !== null && y
        ? ((t.child = zs(t, e.child, null, h)), (t.child = zs(t, null, N, h)))
        : Ut(e, t, N, h),
      (t.memoizedState = o.state),
      u && od(t, s, !0),
      t.child
    );
  }
  function nf(e) {
    var t = e.stateNode;
    (t.pendingContext
      ? ad(e, t.pendingContext, t.pendingContext !== t.context)
      : t.context && ad(e, t.context, !1),
      Ei(e, t.containerInfo));
  }
  function sf(e, t, s, o, u) {
    return (Ms(), wi(u), (t.flags |= 256), Ut(e, t, s, o), t.child);
  }
  var Wi = { dehydrated: null, treeContext: null, retryLane: 0 };
  function qi(e) {
    return { baseLanes: e, cachePool: null, transitions: null };
  }
  function af(e, t, s) {
    var o = t.pendingProps,
      u = at.current,
      h = !1,
      y = (t.flags & 128) !== 0,
      N;
    if (
      ((N = y) ||
        (N = e !== null && e.memoizedState === null ? !1 : (u & 2) !== 0),
      N
        ? ((h = !0), (t.flags &= -129))
        : (e === null || e.memoizedState !== null) && (u |= 1),
      Je(at, u & 1),
      e === null)
    )
      return (
        vi(t),
        (e = t.memoizedState),
        e !== null && ((e = e.dehydrated), e !== null)
          ? ((t.mode & 1) === 0
              ? (t.lanes = 1)
              : e.data === "$!"
                ? (t.lanes = 8)
                : (t.lanes = 1073741824),
            null)
          : ((y = o.children),
            (e = o.fallback),
            h
              ? ((o = t.mode),
                (h = t.child),
                (y = { mode: "hidden", children: y }),
                (o & 1) === 0 && h !== null
                  ? ((h.childLanes = 0), (h.pendingProps = y))
                  : (h = to(y, o, 0, null)),
                (e = ms(e, o, s, null)),
                (h.return = t),
                (e.return = t),
                (h.sibling = e),
                (t.child = h),
                (t.child.memoizedState = qi(s)),
                (t.memoizedState = Wi),
                e)
              : Yi(t, y))
      );
    if (((u = e.memoizedState), u !== null && ((N = u.dehydrated), N !== null)))
      return b0(e, t, y, o, N, u, s);
    if (h) {
      ((h = o.fallback), (y = t.mode), (u = e.child), (N = u.sibling));
      var T = { mode: "hidden", children: o.children };
      return (
        (y & 1) === 0 && t.child !== u
          ? ((o = t.child),
            (o.childLanes = 0),
            (o.pendingProps = T),
            (t.deletions = null))
          : ((o = Un(u, T)), (o.subtreeFlags = u.subtreeFlags & 14680064)),
        N !== null ? (h = Un(N, h)) : ((h = ms(h, y, s, null)), (h.flags |= 2)),
        (h.return = t),
        (o.return = t),
        (o.sibling = h),
        (t.child = o),
        (o = h),
        (h = t.child),
        (y = e.child.memoizedState),
        (y =
          y === null
            ? qi(s)
            : {
                baseLanes: y.baseLanes | s,
                cachePool: null,
                transitions: y.transitions,
              }),
        (h.memoizedState = y),
        (h.childLanes = e.childLanes & ~s),
        (t.memoizedState = Wi),
        o
      );
    }
    return (
      (h = e.child),
      (e = h.sibling),
      (o = Un(h, { mode: "visible", children: o.children })),
      (t.mode & 1) === 0 && (o.lanes = s),
      (o.return = t),
      (o.sibling = null),
      e !== null &&
        ((s = t.deletions),
        s === null ? ((t.deletions = [e]), (t.flags |= 16)) : s.push(e)),
      (t.child = o),
      (t.memoizedState = null),
      o
    );
  }
  function Yi(e, t) {
    return (
      (t = to({ mode: "visible", children: t }, e.mode, 0, null)),
      (t.return = e),
      (e.child = t)
    );
  }
  function Bl(e, t, s, o) {
    return (
      o !== null && wi(o),
      zs(t, e.child, null, s),
      (e = Yi(t, t.pendingProps.children)),
      (e.flags |= 2),
      (t.memoizedState = null),
      e
    );
  }
  function b0(e, t, s, o, u, h, y) {
    if (s)
      return t.flags & 256
        ? ((t.flags &= -257), (o = Ui(Error(l(422)))), Bl(e, t, y, o))
        : t.memoizedState !== null
          ? ((t.child = e.child), (t.flags |= 128), null)
          : ((h = o.fallback),
            (u = t.mode),
            (o = to({ mode: "visible", children: o.children }, u, 0, null)),
            (h = ms(h, u, y, null)),
            (h.flags |= 2),
            (o.return = t),
            (h.return = t),
            (o.sibling = h),
            (t.child = o),
            (t.mode & 1) !== 0 && zs(t, e.child, null, y),
            (t.child.memoizedState = qi(y)),
            (t.memoizedState = Wi),
            h);
    if ((t.mode & 1) === 0) return Bl(e, t, y, null);
    if (u.data === "$!") {
      if (((o = u.nextSibling && u.nextSibling.dataset), o)) var N = o.dgst;
      return (
        (o = N),
        (h = Error(l(419))),
        (o = Ui(h, o, void 0)),
        Bl(e, t, y, o)
      );
    }
    if (((N = (y & e.childLanes) !== 0), Gt || N)) {
      if (((o = kt), o !== null)) {
        switch (y & -y) {
          case 4:
            u = 2;
            break;
          case 16:
            u = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            u = 32;
            break;
          case 536870912:
            u = 268435456;
            break;
          default:
            u = 0;
        }
        ((u = (u & (o.suspendedLanes | y)) !== 0 ? 0 : u),
          u !== 0 &&
            u !== h.retryLane &&
            ((h.retryLane = u), gn(e, u), Or(o, e, u, -1)));
      }
      return (cc(), (o = Ui(Error(l(421)))), Bl(e, t, y, o));
    }
    return u.data === "$?"
      ? ((t.flags |= 128),
        (t.child = e.child),
        (t = O0.bind(null, e)),
        (u._reactRetry = t),
        null)
      : ((e = h.treeContext),
        (cr = Tn(u.nextSibling)),
        (ir = t),
        (tt = !0),
        (Tr = null),
        e !== null &&
          ((gr[xr++] = mn),
          (gr[xr++] = pn),
          (gr[xr++] = as),
          (mn = e.id),
          (pn = e.overflow),
          (as = t)),
        (t = Yi(t, o.children)),
        (t.flags |= 4096),
        t);
  }
  function lf(e, t, s) {
    e.lanes |= t;
    var o = e.alternate;
    (o !== null && (o.lanes |= t), Ni(e.return, t, s));
  }
  function Gi(e, t, s, o, u) {
    var h = e.memoizedState;
    h === null
      ? (e.memoizedState = {
          isBackwards: t,
          rendering: null,
          renderingStartTime: 0,
          last: o,
          tail: s,
          tailMode: u,
        })
      : ((h.isBackwards = t),
        (h.rendering = null),
        (h.renderingStartTime = 0),
        (h.last = o),
        (h.tail = s),
        (h.tailMode = u));
  }
  function of(e, t, s) {
    var o = t.pendingProps,
      u = o.revealOrder,
      h = o.tail;
    if ((Ut(e, t, o.children, s), (o = at.current), (o & 2) !== 0))
      ((o = (o & 1) | 2), (t.flags |= 128));
    else {
      if (e !== null && (e.flags & 128) !== 0)
        e: for (e = t.child; e !== null; ) {
          if (e.tag === 13) e.memoizedState !== null && lf(e, s, t);
          else if (e.tag === 19) lf(e, s, t);
          else if (e.child !== null) {
            ((e.child.return = e), (e = e.child));
            continue;
          }
          if (e === t) break e;
          for (; e.sibling === null; ) {
            if (e.return === null || e.return === t) break e;
            e = e.return;
          }
          ((e.sibling.return = e.return), (e = e.sibling));
        }
      o &= 1;
    }
    if ((Je(at, o), (t.mode & 1) === 0)) t.memoizedState = null;
    else
      switch (u) {
        case "forwards":
          for (s = t.child, u = null; s !== null; )
            ((e = s.alternate),
              e !== null && Dl(e) === null && (u = s),
              (s = s.sibling));
          ((s = u),
            s === null
              ? ((u = t.child), (t.child = null))
              : ((u = s.sibling), (s.sibling = null)),
            Gi(t, !1, u, s, h));
          break;
        case "backwards":
          for (s = null, u = t.child, t.child = null; u !== null; ) {
            if (((e = u.alternate), e !== null && Dl(e) === null)) {
              t.child = u;
              break;
            }
            ((e = u.sibling), (u.sibling = s), (s = u), (u = e));
          }
          Gi(t, !0, s, null, h);
          break;
        case "together":
          Gi(t, !1, null, null, void 0);
          break;
        default:
          t.memoizedState = null;
      }
    return t.child;
  }
  function Hl(e, t) {
    (t.mode & 1) === 0 &&
      e !== null &&
      ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
  }
  function yn(e, t, s) {
    if (
      (e !== null && (t.dependencies = e.dependencies),
      (us |= t.lanes),
      (s & t.childLanes) === 0)
    )
      return null;
    if (e !== null && t.child !== e.child) throw Error(l(153));
    if (t.child !== null) {
      for (
        e = t.child, s = Un(e, e.pendingProps), t.child = s, s.return = t;
        e.sibling !== null;
      )
        ((e = e.sibling),
          (s = s.sibling = Un(e, e.pendingProps)),
          (s.return = t));
      s.sibling = null;
    }
    return t.child;
  }
  function j0(e, t, s) {
    switch (t.tag) {
      case 3:
        (nf(t), Ms());
        break;
      case 5:
        bd(t);
        break;
      case 1:
        Yt(t.type) && Sl(t);
        break;
      case 4:
        Ei(t, t.stateNode.containerInfo);
        break;
      case 10:
        var o = t.type._context,
          u = t.memoizedProps.value;
        (Je(_l, o._currentValue), (o._currentValue = u));
        break;
      case 13:
        if (((o = t.memoizedState), o !== null))
          return o.dehydrated !== null
            ? (Je(at, at.current & 1), (t.flags |= 128), null)
            : (s & t.child.childLanes) !== 0
              ? af(e, t, s)
              : (Je(at, at.current & 1),
                (e = yn(e, t, s)),
                e !== null ? e.sibling : null);
        Je(at, at.current & 1);
        break;
      case 19:
        if (((o = (s & t.childLanes) !== 0), (e.flags & 128) !== 0)) {
          if (o) return of(e, t, s);
          t.flags |= 128;
        }
        if (
          ((u = t.memoizedState),
          u !== null &&
            ((u.rendering = null), (u.tail = null), (u.lastEffect = null)),
          Je(at, at.current),
          o)
        )
          break;
        return null;
      case 22:
      case 23:
        return ((t.lanes = 0), ef(e, t, s));
    }
    return yn(e, t, s);
  }
  var cf, Ki, uf, df;
  ((cf = function (e, t) {
    for (var s = t.child; s !== null; ) {
      if (s.tag === 5 || s.tag === 6) e.appendChild(s.stateNode);
      else if (s.tag !== 4 && s.child !== null) {
        ((s.child.return = s), (s = s.child));
        continue;
      }
      if (s === t) break;
      for (; s.sibling === null; ) {
        if (s.return === null || s.return === t) return;
        s = s.return;
      }
      ((s.sibling.return = s.return), (s = s.sibling));
    }
  }),
    (Ki = function () {}),
    (uf = function (e, t, s, o) {
      var u = e.memoizedProps;
      if (u !== o) {
        ((e = t.stateNode), is(Kr.current));
        var h = null;
        switch (s) {
          case "input":
            ((u = $r(e, u)), (o = $r(e, o)), (h = []));
            break;
          case "select":
            ((u = ee({}, u, { value: void 0 })),
              (o = ee({}, o, { value: void 0 })),
              (h = []));
            break;
          case "textarea":
            ((u = yt(e, u)), (o = yt(e, o)), (h = []));
            break;
          default:
            typeof u.onClick != "function" &&
              typeof o.onClick == "function" &&
              (e.onclick = jl);
        }
        ln(s, o);
        var y;
        s = null;
        for ($ in u)
          if (!o.hasOwnProperty($) && u.hasOwnProperty($) && u[$] != null)
            if ($ === "style") {
              var N = u[$];
              for (y in N) N.hasOwnProperty(y) && (s || (s = {}), (s[y] = ""));
            } else
              $ !== "dangerouslySetInnerHTML" &&
                $ !== "children" &&
                $ !== "suppressContentEditableWarning" &&
                $ !== "suppressHydrationWarning" &&
                $ !== "autoFocus" &&
                (c.hasOwnProperty($)
                  ? h || (h = [])
                  : (h = h || []).push($, null));
        for ($ in o) {
          var T = o[$];
          if (
            ((N = u?.[$]),
            o.hasOwnProperty($) && T !== N && (T != null || N != null))
          )
            if ($ === "style")
              if (N) {
                for (y in N)
                  !N.hasOwnProperty(y) ||
                    (T && T.hasOwnProperty(y)) ||
                    (s || (s = {}), (s[y] = ""));
                for (y in T)
                  T.hasOwnProperty(y) &&
                    N[y] !== T[y] &&
                    (s || (s = {}), (s[y] = T[y]));
              } else (s || (h || (h = []), h.push($, s)), (s = T));
            else
              $ === "dangerouslySetInnerHTML"
                ? ((T = T ? T.__html : void 0),
                  (N = N ? N.__html : void 0),
                  T != null && N !== T && (h = h || []).push($, T))
                : $ === "children"
                  ? (typeof T != "string" && typeof T != "number") ||
                    (h = h || []).push($, "" + T)
                  : $ !== "suppressContentEditableWarning" &&
                    $ !== "suppressHydrationWarning" &&
                    (c.hasOwnProperty($)
                      ? (T != null && $ === "onScroll" && Xe("scroll", e),
                        h || N === T || (h = []))
                      : (h = h || []).push($, T));
        }
        s && (h = h || []).push("style", s);
        var $ = h;
        (t.updateQueue = $) && (t.flags |= 4);
      }
    }),
    (df = function (e, t, s, o) {
      s !== o && (t.flags |= 4);
    }));
  function Sa(e, t) {
    if (!tt)
      switch (e.tailMode) {
        case "hidden":
          t = e.tail;
          for (var s = null; t !== null; )
            (t.alternate !== null && (s = t), (t = t.sibling));
          s === null ? (e.tail = null) : (s.sibling = null);
          break;
        case "collapsed":
          s = e.tail;
          for (var o = null; s !== null; )
            (s.alternate !== null && (o = s), (s = s.sibling));
          o === null
            ? t || e.tail === null
              ? (e.tail = null)
              : (e.tail.sibling = null)
            : (o.sibling = null);
      }
  }
  function At(e) {
    var t = e.alternate !== null && e.alternate.child === e.child,
      s = 0,
      o = 0;
    if (t)
      for (var u = e.child; u !== null; )
        ((s |= u.lanes | u.childLanes),
          (o |= u.subtreeFlags & 14680064),
          (o |= u.flags & 14680064),
          (u.return = e),
          (u = u.sibling));
    else
      for (u = e.child; u !== null; )
        ((s |= u.lanes | u.childLanes),
          (o |= u.subtreeFlags),
          (o |= u.flags),
          (u.return = e),
          (u = u.sibling));
    return ((e.subtreeFlags |= o), (e.childLanes = s), t);
  }
  function k0(e, t, s) {
    var o = t.pendingProps;
    switch ((xi(t), t.tag)) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return (At(t), null);
      case 1:
        return (Yt(t.type) && Nl(), At(t), null);
      case 3:
        return (
          (o = t.stateNode),
          $s(),
          Ze(qt),
          Ze(_t),
          Ti(),
          o.pendingContext &&
            ((o.context = o.pendingContext), (o.pendingContext = null)),
          (e === null || e.child === null) &&
            (Pl(t)
              ? (t.flags |= 4)
              : e === null ||
                (e.memoizedState.isDehydrated && (t.flags & 256) === 0) ||
                ((t.flags |= 1024), Tr !== null && (lc(Tr), (Tr = null)))),
          Ki(e, t),
          At(t),
          null
        );
      case 5:
        Ri(t);
        var u = is(wa.current);
        if (((s = t.type), e !== null && t.stateNode != null))
          (uf(e, t, s, o, u),
            e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152)));
        else {
          if (!o) {
            if (t.stateNode === null) throw Error(l(166));
            return (At(t), null);
          }
          if (((e = is(Kr.current)), Pl(t))) {
            ((o = t.stateNode), (s = t.type));
            var h = t.memoizedProps;
            switch (((o[Gr] = t), (o[pa] = h), (e = (t.mode & 1) !== 0), s)) {
              case "dialog":
                (Xe("cancel", o), Xe("close", o));
                break;
              case "iframe":
              case "object":
              case "embed":
                Xe("load", o);
                break;
              case "video":
              case "audio":
                for (u = 0; u < fa.length; u++) Xe(fa[u], o);
                break;
              case "source":
                Xe("error", o);
                break;
              case "img":
              case "image":
              case "link":
                (Xe("error", o), Xe("load", o));
                break;
              case "details":
                Xe("toggle", o);
                break;
              case "input":
                (js(o, h), Xe("invalid", o));
                break;
              case "select":
                ((o._wrapperState = { wasMultiple: !!h.multiple }),
                  Xe("invalid", o));
                break;
              case "textarea":
                (Er(o, h), Xe("invalid", o));
            }
            (ln(s, h), (u = null));
            for (var y in h)
              if (h.hasOwnProperty(y)) {
                var N = h[y];
                y === "children"
                  ? typeof N == "string"
                    ? o.textContent !== N &&
                      (h.suppressHydrationWarning !== !0 &&
                        bl(o.textContent, N, e),
                      (u = ["children", N]))
                    : typeof N == "number" &&
                      o.textContent !== "" + N &&
                      (h.suppressHydrationWarning !== !0 &&
                        bl(o.textContent, N, e),
                      (u = ["children", "" + N]))
                  : c.hasOwnProperty(y) &&
                    N != null &&
                    y === "onScroll" &&
                    Xe("scroll", o);
              }
            switch (s) {
              case "input":
                (Ht(o), Qn(o, h, !0));
                break;
              case "textarea":
                (Ht(o), Br(o));
                break;
              case "select":
              case "option":
                break;
              default:
                typeof h.onClick == "function" && (o.onclick = jl);
            }
            ((o = u), (t.updateQueue = o), o !== null && (t.flags |= 4));
          } else {
            ((y = u.nodeType === 9 ? u : u.ownerDocument),
              e === "http://www.w3.org/1999/xhtml" && (e = Hr(s)),
              e === "http://www.w3.org/1999/xhtml"
                ? s === "script"
                  ? ((e = y.createElement("div")),
                    (e.innerHTML = "<script><\/script>"),
                    (e = e.removeChild(e.firstChild)))
                  : typeof o.is == "string"
                    ? (e = y.createElement(s, { is: o.is }))
                    : ((e = y.createElement(s)),
                      s === "select" &&
                        ((y = e),
                        o.multiple
                          ? (y.multiple = !0)
                          : o.size && (y.size = o.size)))
                : (e = y.createElementNS(e, s)),
              (e[Gr] = t),
              (e[pa] = o),
              cf(e, t, !1, !1),
              (t.stateNode = e));
            e: {
              switch (((y = bn(s, o)), s)) {
                case "dialog":
                  (Xe("cancel", e), Xe("close", e), (u = o));
                  break;
                case "iframe":
                case "object":
                case "embed":
                  (Xe("load", e), (u = o));
                  break;
                case "video":
                case "audio":
                  for (u = 0; u < fa.length; u++) Xe(fa[u], e);
                  u = o;
                  break;
                case "source":
                  (Xe("error", e), (u = o));
                  break;
                case "img":
                case "image":
                case "link":
                  (Xe("error", e), Xe("load", e), (u = o));
                  break;
                case "details":
                  (Xe("toggle", e), (u = o));
                  break;
                case "input":
                  (js(e, o), (u = $r(e, o)), Xe("invalid", e));
                  break;
                case "option":
                  u = o;
                  break;
                case "select":
                  ((e._wrapperState = { wasMultiple: !!o.multiple }),
                    (u = ee({}, o, { value: void 0 })),
                    Xe("invalid", e));
                  break;
                case "textarea":
                  (Er(e, o), (u = yt(e, o)), Xe("invalid", e));
                  break;
                default:
                  u = o;
              }
              (ln(s, u), (N = u));
              for (h in N)
                if (N.hasOwnProperty(h)) {
                  var T = N[h];
                  h === "style"
                    ? Vt(e, T)
                    : h === "dangerouslySetInnerHTML"
                      ? ((T = T ? T.__html : void 0), T != null && Tt(e, T))
                      : h === "children"
                        ? typeof T == "string"
                          ? (s !== "textarea" || T !== "") && It(e, T)
                          : typeof T == "number" && It(e, "" + T)
                        : h !== "suppressContentEditableWarning" &&
                          h !== "suppressHydrationWarning" &&
                          h !== "autoFocus" &&
                          (c.hasOwnProperty(h)
                            ? T != null && h === "onScroll" && Xe("scroll", e)
                            : T != null && H(e, h, T, y));
                }
              switch (s) {
                case "input":
                  (Ht(e), Qn(e, o, !1));
                  break;
                case "textarea":
                  (Ht(e), Br(e));
                  break;
                case "option":
                  o.value != null && e.setAttribute("value", "" + fe(o.value));
                  break;
                case "select":
                  ((e.multiple = !!o.multiple),
                    (h = o.value),
                    h != null
                      ? Ur(e, !!o.multiple, h, !1)
                      : o.defaultValue != null &&
                        Ur(e, !!o.multiple, o.defaultValue, !0));
                  break;
                default:
                  typeof u.onClick == "function" && (e.onclick = jl);
              }
              switch (s) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  o = !!o.autoFocus;
                  break e;
                case "img":
                  o = !0;
                  break e;
                default:
                  o = !1;
              }
            }
            o && (t.flags |= 4);
          }
          t.ref !== null && ((t.flags |= 512), (t.flags |= 2097152));
        }
        return (At(t), null);
      case 6:
        if (e && t.stateNode != null) df(e, t, e.memoizedProps, o);
        else {
          if (typeof o != "string" && t.stateNode === null) throw Error(l(166));
          if (((s = is(wa.current)), is(Kr.current), Pl(t))) {
            if (
              ((o = t.stateNode),
              (s = t.memoizedProps),
              (o[Gr] = t),
              (h = o.nodeValue !== s) && ((e = ir), e !== null))
            )
              switch (e.tag) {
                case 3:
                  bl(o.nodeValue, s, (e.mode & 1) !== 0);
                  break;
                case 5:
                  e.memoizedProps.suppressHydrationWarning !== !0 &&
                    bl(o.nodeValue, s, (e.mode & 1) !== 0);
              }
            h && (t.flags |= 4);
          } else
            ((o = (s.nodeType === 9 ? s : s.ownerDocument).createTextNode(o)),
              (o[Gr] = t),
              (t.stateNode = o));
        }
        return (At(t), null);
      case 13:
        if (
          (Ze(at),
          (o = t.memoizedState),
          e === null ||
            (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
        ) {
          if (tt && cr !== null && (t.mode & 1) !== 0 && (t.flags & 128) === 0)
            (hd(), Ms(), (t.flags |= 98560), (h = !1));
          else if (((h = Pl(t)), o !== null && o.dehydrated !== null)) {
            if (e === null) {
              if (!h) throw Error(l(318));
              if (
                ((h = t.memoizedState),
                (h = h !== null ? h.dehydrated : null),
                !h)
              )
                throw Error(l(317));
              h[Gr] = t;
            } else
              (Ms(),
                (t.flags & 128) === 0 && (t.memoizedState = null),
                (t.flags |= 4));
            (At(t), (h = !1));
          } else (Tr !== null && (lc(Tr), (Tr = null)), (h = !0));
          if (!h) return t.flags & 65536 ? t : null;
        }
        return (t.flags & 128) !== 0
          ? ((t.lanes = s), t)
          : ((o = o !== null),
            o !== (e !== null && e.memoizedState !== null) &&
              o &&
              ((t.child.flags |= 8192),
              (t.mode & 1) !== 0 &&
                (e === null || (at.current & 1) !== 0
                  ? wt === 0 && (wt = 3)
                  : cc())),
            t.updateQueue !== null && (t.flags |= 4),
            At(t),
            null);
      case 4:
        return (
          $s(),
          Ki(e, t),
          e === null && ha(t.stateNode.containerInfo),
          At(t),
          null
        );
      case 10:
        return (ki(t.type._context), At(t), null);
      case 17:
        return (Yt(t.type) && Nl(), At(t), null);
      case 19:
        if ((Ze(at), (h = t.memoizedState), h === null)) return (At(t), null);
        if (((o = (t.flags & 128) !== 0), (y = h.rendering), y === null))
          if (o) Sa(h, !1);
          else {
            if (wt !== 0 || (e !== null && (e.flags & 128) !== 0))
              for (e = t.child; e !== null; ) {
                if (((y = Dl(e)), y !== null)) {
                  for (
                    t.flags |= 128,
                      Sa(h, !1),
                      o = y.updateQueue,
                      o !== null && ((t.updateQueue = o), (t.flags |= 4)),
                      t.subtreeFlags = 0,
                      o = s,
                      s = t.child;
                    s !== null;
                  )
                    ((h = s),
                      (e = o),
                      (h.flags &= 14680066),
                      (y = h.alternate),
                      y === null
                        ? ((h.childLanes = 0),
                          (h.lanes = e),
                          (h.child = null),
                          (h.subtreeFlags = 0),
                          (h.memoizedProps = null),
                          (h.memoizedState = null),
                          (h.updateQueue = null),
                          (h.dependencies = null),
                          (h.stateNode = null))
                        : ((h.childLanes = y.childLanes),
                          (h.lanes = y.lanes),
                          (h.child = y.child),
                          (h.subtreeFlags = 0),
                          (h.deletions = null),
                          (h.memoizedProps = y.memoizedProps),
                          (h.memoizedState = y.memoizedState),
                          (h.updateQueue = y.updateQueue),
                          (h.type = y.type),
                          (e = y.dependencies),
                          (h.dependencies =
                            e === null
                              ? null
                              : {
                                  lanes: e.lanes,
                                  firstContext: e.firstContext,
                                })),
                      (s = s.sibling));
                  return (Je(at, (at.current & 1) | 2), t.child);
                }
                e = e.sibling;
              }
            h.tail !== null &&
              Ge() > Vs &&
              ((t.flags |= 128), (o = !0), Sa(h, !1), (t.lanes = 4194304));
          }
        else {
          if (!o)
            if (((e = Dl(y)), e !== null)) {
              if (
                ((t.flags |= 128),
                (o = !0),
                (s = e.updateQueue),
                s !== null && ((t.updateQueue = s), (t.flags |= 4)),
                Sa(h, !0),
                h.tail === null &&
                  h.tailMode === "hidden" &&
                  !y.alternate &&
                  !tt)
              )
                return (At(t), null);
            } else
              2 * Ge() - h.renderingStartTime > Vs &&
                s !== 1073741824 &&
                ((t.flags |= 128), (o = !0), Sa(h, !1), (t.lanes = 4194304));
          h.isBackwards
            ? ((y.sibling = t.child), (t.child = y))
            : ((s = h.last),
              s !== null ? (s.sibling = y) : (t.child = y),
              (h.last = y));
        }
        return h.tail !== null
          ? ((t = h.tail),
            (h.rendering = t),
            (h.tail = t.sibling),
            (h.renderingStartTime = Ge()),
            (t.sibling = null),
            (s = at.current),
            Je(at, o ? (s & 1) | 2 : s & 1),
            t)
          : (At(t), null);
      case 22:
      case 23:
        return (
          ic(),
          (o = t.memoizedState !== null),
          e !== null && (e.memoizedState !== null) !== o && (t.flags |= 8192),
          o && (t.mode & 1) !== 0
            ? (ur & 1073741824) !== 0 &&
              (At(t), t.subtreeFlags & 6 && (t.flags |= 8192))
            : At(t),
          null
        );
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(l(156, t.tag));
  }
  function N0(e, t) {
    switch ((xi(t), t.tag)) {
      case 1:
        return (
          Yt(t.type) && Nl(),
          (e = t.flags),
          e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
        );
      case 3:
        return (
          $s(),
          Ze(qt),
          Ze(_t),
          Ti(),
          (e = t.flags),
          (e & 65536) !== 0 && (e & 128) === 0
            ? ((t.flags = (e & -65537) | 128), t)
            : null
        );
      case 5:
        return (Ri(t), null);
      case 13:
        if (
          (Ze(at), (e = t.memoizedState), e !== null && e.dehydrated !== null)
        ) {
          if (t.alternate === null) throw Error(l(340));
          Ms();
        }
        return (
          (e = t.flags),
          e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
        );
      case 19:
        return (Ze(at), null);
      case 4:
        return ($s(), null);
      case 10:
        return (ki(t.type._context), null);
      case 22:
      case 23:
        return (ic(), null);
      case 24:
        return null;
      default:
        return null;
    }
  }
  var Vl = !1,
    Ot = !1,
    S0 = typeof WeakSet == "function" ? WeakSet : Set,
    ge = null;
  function Bs(e, t) {
    var s = e.ref;
    if (s !== null)
      if (typeof s == "function")
        try {
          s(null);
        } catch (o) {
          ct(e, t, o);
        }
      else s.current = null;
  }
  function Qi(e, t, s) {
    try {
      s();
    } catch (o) {
      ct(e, t, o);
    }
  }
  var ff = !1;
  function C0(e, t) {
    if (((ii = ul), (e = Hu()), ei(e))) {
      if ("selectionStart" in e)
        var s = { start: e.selectionStart, end: e.selectionEnd };
      else
        e: {
          s = ((s = e.ownerDocument) && s.defaultView) || window;
          var o = s.getSelection && s.getSelection();
          if (o && o.rangeCount !== 0) {
            s = o.anchorNode;
            var u = o.anchorOffset,
              h = o.focusNode;
            o = o.focusOffset;
            try {
              (s.nodeType, h.nodeType);
            } catch {
              s = null;
              break e;
            }
            var y = 0,
              N = -1,
              T = -1,
              $ = 0,
              X = 0,
              te = e,
              J = null;
            t: for (;;) {
              for (
                var he;
                te !== s || (u !== 0 && te.nodeType !== 3) || (N = y + u),
                  te !== h || (o !== 0 && te.nodeType !== 3) || (T = y + o),
                  te.nodeType === 3 && (y += te.nodeValue.length),
                  (he = te.firstChild) !== null;
              )
                ((J = te), (te = he));
              for (;;) {
                if (te === e) break t;
                if (
                  (J === s && ++$ === u && (N = y),
                  J === h && ++X === o && (T = y),
                  (he = te.nextSibling) !== null)
                )
                  break;
                ((te = J), (J = te.parentNode));
              }
              te = he;
            }
            s = N === -1 || T === -1 ? null : { start: N, end: T };
          } else s = null;
        }
      s = s || { start: 0, end: 0 };
    } else s = null;
    for (
      ci = { focusedElem: e, selectionRange: s }, ul = !1, ge = t;
      ge !== null;
    )
      if (
        ((t = ge), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null)
      )
        ((e.return = t), (ge = e));
      else
        for (; ge !== null; ) {
          t = ge;
          try {
            var ye = t.alternate;
            if ((t.flags & 1024) !== 0)
              switch (t.tag) {
                case 0:
                case 11:
                case 15:
                  break;
                case 1:
                  if (ye !== null) {
                    var we = ye.memoizedProps,
                      ft = ye.memoizedState,
                      M = t.stateNode,
                      A = M.getSnapshotBeforeUpdate(
                        t.elementType === t.type ? we : _r(t.type, we),
                        ft,
                      );
                    M.__reactInternalSnapshotBeforeUpdate = A;
                  }
                  break;
                case 3:
                  var z = t.stateNode.containerInfo;
                  z.nodeType === 1
                    ? (z.textContent = "")
                    : z.nodeType === 9 &&
                      z.documentElement &&
                      z.removeChild(z.documentElement);
                  break;
                case 5:
                case 6:
                case 4:
                case 17:
                  break;
                default:
                  throw Error(l(163));
              }
          } catch (re) {
            ct(t, t.return, re);
          }
          if (((e = t.sibling), e !== null)) {
            ((e.return = t.return), (ge = e));
            break;
          }
          ge = t.return;
        }
    return ((ye = ff), (ff = !1), ye);
  }
  function Ca(e, t, s) {
    var o = t.updateQueue;
    if (((o = o !== null ? o.lastEffect : null), o !== null)) {
      var u = (o = o.next);
      do {
        if ((u.tag & e) === e) {
          var h = u.destroy;
          ((u.destroy = void 0), h !== void 0 && Qi(t, s, h));
        }
        u = u.next;
      } while (u !== o);
    }
  }
  function Wl(e, t) {
    if (
      ((t = t.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)
    ) {
      var s = (t = t.next);
      do {
        if ((s.tag & e) === e) {
          var o = s.create;
          s.destroy = o();
        }
        s = s.next;
      } while (s !== t);
    }
  }
  function Ji(e) {
    var t = e.ref;
    if (t !== null) {
      var s = e.stateNode;
      switch (e.tag) {
        case 5:
          e = s;
          break;
        default:
          e = s;
      }
      typeof t == "function" ? t(e) : (t.current = e);
    }
  }
  function hf(e) {
    var t = e.alternate;
    (t !== null && ((e.alternate = null), hf(t)),
      (e.child = null),
      (e.deletions = null),
      (e.sibling = null),
      e.tag === 5 &&
        ((t = e.stateNode),
        t !== null &&
          (delete t[Gr],
          delete t[pa],
          delete t[hi],
          delete t[i0],
          delete t[c0])),
      (e.stateNode = null),
      (e.return = null),
      (e.dependencies = null),
      (e.memoizedProps = null),
      (e.memoizedState = null),
      (e.pendingProps = null),
      (e.stateNode = null),
      (e.updateQueue = null));
  }
  function mf(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4;
  }
  function pf(e) {
    e: for (;;) {
      for (; e.sibling === null; ) {
        if (e.return === null || mf(e.return)) return null;
        e = e.return;
      }
      for (
        e.sibling.return = e.return, e = e.sibling;
        e.tag !== 5 && e.tag !== 6 && e.tag !== 18;
      ) {
        if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
        ((e.child.return = e), (e = e.child));
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function Xi(e, t, s) {
    var o = e.tag;
    if (o === 5 || o === 6)
      ((e = e.stateNode),
        t
          ? s.nodeType === 8
            ? s.parentNode.insertBefore(e, t)
            : s.insertBefore(e, t)
          : (s.nodeType === 8
              ? ((t = s.parentNode), t.insertBefore(e, s))
              : ((t = s), t.appendChild(e)),
            (s = s._reactRootContainer),
            s != null || t.onclick !== null || (t.onclick = jl)));
    else if (o !== 4 && ((e = e.child), e !== null))
      for (Xi(e, t, s), e = e.sibling; e !== null; )
        (Xi(e, t, s), (e = e.sibling));
  }
  function Zi(e, t, s) {
    var o = e.tag;
    if (o === 5 || o === 6)
      ((e = e.stateNode), t ? s.insertBefore(e, t) : s.appendChild(e));
    else if (o !== 4 && ((e = e.child), e !== null))
      for (Zi(e, t, s), e = e.sibling; e !== null; )
        (Zi(e, t, s), (e = e.sibling));
  }
  var Et = null,
    Lr = !1;
  function Mn(e, t, s) {
    for (s = s.child; s !== null; ) (gf(e, t, s), (s = s.sibling));
  }
  function gf(e, t, s) {
    if ($t && typeof $t.onCommitFiberUnmount == "function")
      try {
        $t.onCommitFiberUnmount(cn, s);
      } catch {}
    switch (s.tag) {
      case 5:
        Ot || Bs(s, t);
      case 6:
        var o = Et,
          u = Lr;
        ((Et = null),
          Mn(e, t, s),
          (Et = o),
          (Lr = u),
          Et !== null &&
            (Lr
              ? ((e = Et),
                (s = s.stateNode),
                e.nodeType === 8
                  ? e.parentNode.removeChild(s)
                  : e.removeChild(s))
              : Et.removeChild(s.stateNode)));
        break;
      case 18:
        Et !== null &&
          (Lr
            ? ((e = Et),
              (s = s.stateNode),
              e.nodeType === 8
                ? fi(e.parentNode, s)
                : e.nodeType === 1 && fi(e, s),
              sa(e))
            : fi(Et, s.stateNode));
        break;
      case 4:
        ((o = Et),
          (u = Lr),
          (Et = s.stateNode.containerInfo),
          (Lr = !0),
          Mn(e, t, s),
          (Et = o),
          (Lr = u));
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (
          !Ot &&
          ((o = s.updateQueue), o !== null && ((o = o.lastEffect), o !== null))
        ) {
          u = o = o.next;
          do {
            var h = u,
              y = h.destroy;
            ((h = h.tag),
              y !== void 0 && ((h & 2) !== 0 || (h & 4) !== 0) && Qi(s, t, y),
              (u = u.next));
          } while (u !== o);
        }
        Mn(e, t, s);
        break;
      case 1:
        if (
          !Ot &&
          (Bs(s, t),
          (o = s.stateNode),
          typeof o.componentWillUnmount == "function")
        )
          try {
            ((o.props = s.memoizedProps),
              (o.state = s.memoizedState),
              o.componentWillUnmount());
          } catch (N) {
            ct(s, t, N);
          }
        Mn(e, t, s);
        break;
      case 21:
        Mn(e, t, s);
        break;
      case 22:
        s.mode & 1
          ? ((Ot = (o = Ot) || s.memoizedState !== null), Mn(e, t, s), (Ot = o))
          : Mn(e, t, s);
        break;
      default:
        Mn(e, t, s);
    }
  }
  function xf(e) {
    var t = e.updateQueue;
    if (t !== null) {
      e.updateQueue = null;
      var s = e.stateNode;
      (s === null && (s = e.stateNode = new S0()),
        t.forEach(function (o) {
          var u = D0.bind(null, e, o);
          s.has(o) || (s.add(o), o.then(u, u));
        }));
    }
  }
  function Ar(e, t) {
    var s = t.deletions;
    if (s !== null)
      for (var o = 0; o < s.length; o++) {
        var u = s[o];
        try {
          var h = e,
            y = t,
            N = y;
          e: for (; N !== null; ) {
            switch (N.tag) {
              case 5:
                ((Et = N.stateNode), (Lr = !1));
                break e;
              case 3:
                ((Et = N.stateNode.containerInfo), (Lr = !0));
                break e;
              case 4:
                ((Et = N.stateNode.containerInfo), (Lr = !0));
                break e;
            }
            N = N.return;
          }
          if (Et === null) throw Error(l(160));
          (gf(h, y, u), (Et = null), (Lr = !1));
          var T = u.alternate;
          (T !== null && (T.return = null), (u.return = null));
        } catch ($) {
          ct(u, t, $);
        }
      }
    if (t.subtreeFlags & 12854)
      for (t = t.child; t !== null; ) (yf(t, e), (t = t.sibling));
  }
  function yf(e, t) {
    var s = e.alternate,
      o = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if ((Ar(t, e), Jr(e), o & 4)) {
          try {
            (Ca(3, e, e.return), Wl(3, e));
          } catch (we) {
            ct(e, e.return, we);
          }
          try {
            Ca(5, e, e.return);
          } catch (we) {
            ct(e, e.return, we);
          }
        }
        break;
      case 1:
        (Ar(t, e), Jr(e), o & 512 && s !== null && Bs(s, s.return));
        break;
      case 5:
        if (
          (Ar(t, e),
          Jr(e),
          o & 512 && s !== null && Bs(s, s.return),
          e.flags & 32)
        ) {
          var u = e.stateNode;
          try {
            It(u, "");
          } catch (we) {
            ct(e, e.return, we);
          }
        }
        if (o & 4 && ((u = e.stateNode), u != null)) {
          var h = e.memoizedProps,
            y = s !== null ? s.memoizedProps : h,
            N = e.type,
            T = e.updateQueue;
          if (((e.updateQueue = null), T !== null))
            try {
              (N === "input" &&
                h.type === "radio" &&
                h.name != null &&
                nr(u, h),
                bn(N, y));
              var $ = bn(N, h);
              for (y = 0; y < T.length; y += 2) {
                var X = T[y],
                  te = T[y + 1];
                X === "style"
                  ? Vt(u, te)
                  : X === "dangerouslySetInnerHTML"
                    ? Tt(u, te)
                    : X === "children"
                      ? It(u, te)
                      : H(u, X, te, $);
              }
              switch (N) {
                case "input":
                  Cr(u, h);
                  break;
                case "textarea":
                  hr(u, h);
                  break;
                case "select":
                  var J = u._wrapperState.wasMultiple;
                  u._wrapperState.wasMultiple = !!h.multiple;
                  var he = h.value;
                  he != null
                    ? Ur(u, !!h.multiple, he, !1)
                    : J !== !!h.multiple &&
                      (h.defaultValue != null
                        ? Ur(u, !!h.multiple, h.defaultValue, !0)
                        : Ur(u, !!h.multiple, h.multiple ? [] : "", !1));
              }
              u[pa] = h;
            } catch (we) {
              ct(e, e.return, we);
            }
        }
        break;
      case 6:
        if ((Ar(t, e), Jr(e), o & 4)) {
          if (e.stateNode === null) throw Error(l(162));
          ((u = e.stateNode), (h = e.memoizedProps));
          try {
            u.nodeValue = h;
          } catch (we) {
            ct(e, e.return, we);
          }
        }
        break;
      case 3:
        if (
          (Ar(t, e), Jr(e), o & 4 && s !== null && s.memoizedState.isDehydrated)
        )
          try {
            sa(t.containerInfo);
          } catch (we) {
            ct(e, e.return, we);
          }
        break;
      case 4:
        (Ar(t, e), Jr(e));
        break;
      case 13:
        (Ar(t, e),
          Jr(e),
          (u = e.child),
          u.flags & 8192 &&
            ((h = u.memoizedState !== null),
            (u.stateNode.isHidden = h),
            !h ||
              (u.alternate !== null && u.alternate.memoizedState !== null) ||
              (rc = Ge())),
          o & 4 && xf(e));
        break;
      case 22:
        if (
          ((X = s !== null && s.memoizedState !== null),
          e.mode & 1 ? ((Ot = ($ = Ot) || X), Ar(t, e), (Ot = $)) : Ar(t, e),
          Jr(e),
          o & 8192)
        ) {
          if (
            (($ = e.memoizedState !== null),
            (e.stateNode.isHidden = $) && !X && (e.mode & 1) !== 0)
          )
            for (ge = e, X = e.child; X !== null; ) {
              for (te = ge = X; ge !== null; ) {
                switch (((J = ge), (he = J.child), J.tag)) {
                  case 0:
                  case 11:
                  case 14:
                  case 15:
                    Ca(4, J, J.return);
                    break;
                  case 1:
                    Bs(J, J.return);
                    var ye = J.stateNode;
                    if (typeof ye.componentWillUnmount == "function") {
                      ((o = J), (s = J.return));
                      try {
                        ((t = o),
                          (ye.props = t.memoizedProps),
                          (ye.state = t.memoizedState),
                          ye.componentWillUnmount());
                      } catch (we) {
                        ct(o, s, we);
                      }
                    }
                    break;
                  case 5:
                    Bs(J, J.return);
                    break;
                  case 22:
                    if (J.memoizedState !== null) {
                      bf(te);
                      continue;
                    }
                }
                he !== null ? ((he.return = J), (ge = he)) : bf(te);
              }
              X = X.sibling;
            }
          e: for (X = null, te = e; ; ) {
            if (te.tag === 5) {
              if (X === null) {
                X = te;
                try {
                  ((u = te.stateNode),
                    $
                      ? ((h = u.style),
                        typeof h.setProperty == "function"
                          ? h.setProperty("display", "none", "important")
                          : (h.display = "none"))
                      : ((N = te.stateNode),
                        (T = te.memoizedProps.style),
                        (y =
                          T != null && T.hasOwnProperty("display")
                            ? T.display
                            : null),
                        (N.style.display = ks("display", y))));
                } catch (we) {
                  ct(e, e.return, we);
                }
              }
            } else if (te.tag === 6) {
              if (X === null)
                try {
                  te.stateNode.nodeValue = $ ? "" : te.memoizedProps;
                } catch (we) {
                  ct(e, e.return, we);
                }
            } else if (
              ((te.tag !== 22 && te.tag !== 23) ||
                te.memoizedState === null ||
                te === e) &&
              te.child !== null
            ) {
              ((te.child.return = te), (te = te.child));
              continue;
            }
            if (te === e) break e;
            for (; te.sibling === null; ) {
              if (te.return === null || te.return === e) break e;
              (X === te && (X = null), (te = te.return));
            }
            (X === te && (X = null),
              (te.sibling.return = te.return),
              (te = te.sibling));
          }
        }
        break;
      case 19:
        (Ar(t, e), Jr(e), o & 4 && xf(e));
        break;
      case 21:
        break;
      default:
        (Ar(t, e), Jr(e));
    }
  }
  function Jr(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        e: {
          for (var s = e.return; s !== null; ) {
            if (mf(s)) {
              var o = s;
              break e;
            }
            s = s.return;
          }
          throw Error(l(160));
        }
        switch (o.tag) {
          case 5:
            var u = o.stateNode;
            o.flags & 32 && (It(u, ""), (o.flags &= -33));
            var h = pf(e);
            Zi(e, h, u);
            break;
          case 3:
          case 4:
            var y = o.stateNode.containerInfo,
              N = pf(e);
            Xi(e, N, y);
            break;
          default:
            throw Error(l(161));
        }
      } catch (T) {
        ct(e, e.return, T);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function E0(e, t, s) {
    ((ge = e), vf(e));
  }
  function vf(e, t, s) {
    for (var o = (e.mode & 1) !== 0; ge !== null; ) {
      var u = ge,
        h = u.child;
      if (u.tag === 22 && o) {
        var y = u.memoizedState !== null || Vl;
        if (!y) {
          var N = u.alternate,
            T = (N !== null && N.memoizedState !== null) || Ot;
          N = Vl;
          var $ = Ot;
          if (((Vl = y), (Ot = T) && !$))
            for (ge = u; ge !== null; )
              ((y = ge),
                (T = y.child),
                y.tag === 22 && y.memoizedState !== null
                  ? jf(u)
                  : T !== null
                    ? ((T.return = y), (ge = T))
                    : jf(u));
          for (; h !== null; ) ((ge = h), vf(h), (h = h.sibling));
          ((ge = u), (Vl = N), (Ot = $));
        }
        wf(e);
      } else
        (u.subtreeFlags & 8772) !== 0 && h !== null
          ? ((h.return = u), (ge = h))
          : wf(e);
    }
  }
  function wf(e) {
    for (; ge !== null; ) {
      var t = ge;
      if ((t.flags & 8772) !== 0) {
        var s = t.alternate;
        try {
          if ((t.flags & 8772) !== 0)
            switch (t.tag) {
              case 0:
              case 11:
              case 15:
                Ot || Wl(5, t);
                break;
              case 1:
                var o = t.stateNode;
                if (t.flags & 4 && !Ot)
                  if (s === null) o.componentDidMount();
                  else {
                    var u =
                      t.elementType === t.type
                        ? s.memoizedProps
                        : _r(t.type, s.memoizedProps);
                    o.componentDidUpdate(
                      u,
                      s.memoizedState,
                      o.__reactInternalSnapshotBeforeUpdate,
                    );
                  }
                var h = t.updateQueue;
                h !== null && wd(t, h, o);
                break;
              case 3:
                var y = t.updateQueue;
                if (y !== null) {
                  if (((s = null), t.child !== null))
                    switch (t.child.tag) {
                      case 5:
                        s = t.child.stateNode;
                        break;
                      case 1:
                        s = t.child.stateNode;
                    }
                  wd(t, y, s);
                }
                break;
              case 5:
                var N = t.stateNode;
                if (s === null && t.flags & 4) {
                  s = N;
                  var T = t.memoizedProps;
                  switch (t.type) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                      T.autoFocus && s.focus();
                      break;
                    case "img":
                      T.src && (s.src = T.src);
                  }
                }
                break;
              case 6:
                break;
              case 4:
                break;
              case 12:
                break;
              case 13:
                if (t.memoizedState === null) {
                  var $ = t.alternate;
                  if ($ !== null) {
                    var X = $.memoizedState;
                    if (X !== null) {
                      var te = X.dehydrated;
                      te !== null && sa(te);
                    }
                  }
                }
                break;
              case 19:
              case 17:
              case 21:
              case 22:
              case 23:
              case 25:
                break;
              default:
                throw Error(l(163));
            }
          Ot || (t.flags & 512 && Ji(t));
        } catch (J) {
          ct(t, t.return, J);
        }
      }
      if (t === e) {
        ge = null;
        break;
      }
      if (((s = t.sibling), s !== null)) {
        ((s.return = t.return), (ge = s));
        break;
      }
      ge = t.return;
    }
  }
  function bf(e) {
    for (; ge !== null; ) {
      var t = ge;
      if (t === e) {
        ge = null;
        break;
      }
      var s = t.sibling;
      if (s !== null) {
        ((s.return = t.return), (ge = s));
        break;
      }
      ge = t.return;
    }
  }
  function jf(e) {
    for (; ge !== null; ) {
      var t = ge;
      try {
        switch (t.tag) {
          case 0:
          case 11:
          case 15:
            var s = t.return;
            try {
              Wl(4, t);
            } catch (T) {
              ct(t, s, T);
            }
            break;
          case 1:
            var o = t.stateNode;
            if (typeof o.componentDidMount == "function") {
              var u = t.return;
              try {
                o.componentDidMount();
              } catch (T) {
                ct(t, u, T);
              }
            }
            var h = t.return;
            try {
              Ji(t);
            } catch (T) {
              ct(t, h, T);
            }
            break;
          case 5:
            var y = t.return;
            try {
              Ji(t);
            } catch (T) {
              ct(t, y, T);
            }
        }
      } catch (T) {
        ct(t, t.return, T);
      }
      if (t === e) {
        ge = null;
        break;
      }
      var N = t.sibling;
      if (N !== null) {
        ((N.return = t.return), (ge = N));
        break;
      }
      ge = t.return;
    }
  }
  var R0 = Math.ceil,
    ql = G.ReactCurrentDispatcher,
    ec = G.ReactCurrentOwner,
    wr = G.ReactCurrentBatchConfig,
    Ve = 0,
    kt = null,
    xt = null,
    Rt = 0,
    ur = 0,
    Hs = _n(0),
    wt = 0,
    Ea = null,
    us = 0,
    Yl = 0,
    tc = 0,
    Ra = null,
    Kt = null,
    rc = 0,
    Vs = 1 / 0,
    vn = null,
    Gl = !1,
    nc = null,
    zn = null,
    Kl = !1,
    In = null,
    Ql = 0,
    Pa = 0,
    sc = null,
    Jl = -1,
    Xl = 0;
  function Bt() {
    return (Ve & 6) !== 0 ? Ge() : Jl !== -1 ? Jl : (Jl = Ge());
  }
  function Fn(e) {
    return (e.mode & 1) === 0
      ? 1
      : (Ve & 2) !== 0 && Rt !== 0
        ? Rt & -Rt
        : d0.transition !== null
          ? (Xl === 0 && (Xl = mu()), Xl)
          : ((e = Ke),
            e !== 0 ||
              ((e = window.event), (e = e === void 0 ? 16 : ku(e.type))),
            e);
  }
  function Or(e, t, s, o) {
    if (50 < Pa) throw ((Pa = 0), (sc = null), Error(l(185)));
    (Zs(e, s, o),
      ((Ve & 2) === 0 || e !== kt) &&
        (e === kt && ((Ve & 2) === 0 && (Yl |= s), wt === 4 && $n(e, Rt)),
        Qt(e, o),
        s === 1 &&
          Ve === 0 &&
          (t.mode & 1) === 0 &&
          ((Vs = Ge() + 500), Cl && An())));
  }
  function Qt(e, t) {
    var s = e.callbackNode;
    dp(e, t);
    var o = ol(e, e === kt ? Rt : 0);
    if (o === 0)
      (s !== null && bt(s), (e.callbackNode = null), (e.callbackPriority = 0));
    else if (((t = o & -o), e.callbackPriority !== t)) {
      if ((s != null && bt(s), t === 1))
        (e.tag === 0 ? u0(Nf.bind(null, e)) : id(Nf.bind(null, e)),
          l0(function () {
            (Ve & 6) === 0 && An();
          }),
          (s = null));
      else {
        switch (pu(o)) {
          case 1:
            s = pr;
            break;
          case 4:
            s = lr;
            break;
          case 16:
            s = jn;
            break;
          case 536870912:
            s = Yr;
            break;
          default:
            s = jn;
        }
        s = Lf(s, kf.bind(null, e));
      }
      ((e.callbackPriority = t), (e.callbackNode = s));
    }
  }
  function kf(e, t) {
    if (((Jl = -1), (Xl = 0), (Ve & 6) !== 0)) throw Error(l(327));
    var s = e.callbackNode;
    if (Ws() && e.callbackNode !== s) return null;
    var o = ol(e, e === kt ? Rt : 0);
    if (o === 0) return null;
    if ((o & 30) !== 0 || (o & e.expiredLanes) !== 0 || t) t = Zl(e, o);
    else {
      t = o;
      var u = Ve;
      Ve |= 2;
      var h = Cf();
      (kt !== e || Rt !== t) && ((vn = null), (Vs = Ge() + 500), fs(e, t));
      do
        try {
          _0();
          break;
        } catch (N) {
          Sf(e, N);
        }
      while (!0);
      (ji(),
        (ql.current = h),
        (Ve = u),
        xt !== null ? (t = 0) : ((kt = null), (Rt = 0), (t = wt)));
    }
    if (t !== 0) {
      if (
        (t === 2 && ((u = Io(e)), u !== 0 && ((o = u), (t = ac(e, u)))),
        t === 1)
      )
        throw ((s = Ea), fs(e, 0), $n(e, o), Qt(e, Ge()), s);
      if (t === 6) $n(e, o);
      else {
        if (
          ((u = e.current.alternate),
          (o & 30) === 0 &&
            !P0(u) &&
            ((t = Zl(e, o)),
            t === 2 && ((h = Io(e)), h !== 0 && ((o = h), (t = ac(e, h)))),
            t === 1))
        )
          throw ((s = Ea), fs(e, 0), $n(e, o), Qt(e, Ge()), s);
        switch (((e.finishedWork = u), (e.finishedLanes = o), t)) {
          case 0:
          case 1:
            throw Error(l(345));
          case 2:
            hs(e, Kt, vn);
            break;
          case 3:
            if (
              ($n(e, o),
              (o & 130023424) === o && ((t = rc + 500 - Ge()), 10 < t))
            ) {
              if (ol(e, 0) !== 0) break;
              if (((u = e.suspendedLanes), (u & o) !== o)) {
                (Bt(), (e.pingedLanes |= e.suspendedLanes & u));
                break;
              }
              e.timeoutHandle = di(hs.bind(null, e, Kt, vn), t);
              break;
            }
            hs(e, Kt, vn);
            break;
          case 4:
            if (($n(e, o), (o & 4194240) === o)) break;
            for (t = e.eventTimes, u = -1; 0 < o; ) {
              var y = 31 - Qe(o);
              ((h = 1 << y), (y = t[y]), y > u && (u = y), (o &= ~h));
            }
            if (
              ((o = u),
              (o = Ge() - o),
              (o =
                (120 > o
                  ? 120
                  : 480 > o
                    ? 480
                    : 1080 > o
                      ? 1080
                      : 1920 > o
                        ? 1920
                        : 3e3 > o
                          ? 3e3
                          : 4320 > o
                            ? 4320
                            : 1960 * R0(o / 1960)) - o),
              10 < o)
            ) {
              e.timeoutHandle = di(hs.bind(null, e, Kt, vn), o);
              break;
            }
            hs(e, Kt, vn);
            break;
          case 5:
            hs(e, Kt, vn);
            break;
          default:
            throw Error(l(329));
        }
      }
    }
    return (Qt(e, Ge()), e.callbackNode === s ? kf.bind(null, e) : null);
  }
  function ac(e, t) {
    var s = Ra;
    return (
      e.current.memoizedState.isDehydrated && (fs(e, t).flags |= 256),
      (e = Zl(e, t)),
      e !== 2 && ((t = Kt), (Kt = s), t !== null && lc(t)),
      e
    );
  }
  function lc(e) {
    Kt === null ? (Kt = e) : Kt.push.apply(Kt, e);
  }
  function P0(e) {
    for (var t = e; ; ) {
      if (t.flags & 16384) {
        var s = t.updateQueue;
        if (s !== null && ((s = s.stores), s !== null))
          for (var o = 0; o < s.length; o++) {
            var u = s[o],
              h = u.getSnapshot;
            u = u.value;
            try {
              if (!Pr(h(), u)) return !1;
            } catch {
              return !1;
            }
          }
      }
      if (((s = t.child), t.subtreeFlags & 16384 && s !== null))
        ((s.return = t), (t = s));
      else {
        if (t === e) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) return !0;
          t = t.return;
        }
        ((t.sibling.return = t.return), (t = t.sibling));
      }
    }
    return !0;
  }
  function $n(e, t) {
    for (
      t &= ~tc,
        t &= ~Yl,
        e.suspendedLanes |= t,
        e.pingedLanes &= ~t,
        e = e.expirationTimes;
      0 < t;
    ) {
      var s = 31 - Qe(t),
        o = 1 << s;
      ((e[s] = -1), (t &= ~o));
    }
  }
  function Nf(e) {
    if ((Ve & 6) !== 0) throw Error(l(327));
    Ws();
    var t = ol(e, 0);
    if ((t & 1) === 0) return (Qt(e, Ge()), null);
    var s = Zl(e, t);
    if (e.tag !== 0 && s === 2) {
      var o = Io(e);
      o !== 0 && ((t = o), (s = ac(e, o)));
    }
    if (s === 1) throw ((s = Ea), fs(e, 0), $n(e, t), Qt(e, Ge()), s);
    if (s === 6) throw Error(l(345));
    return (
      (e.finishedWork = e.current.alternate),
      (e.finishedLanes = t),
      hs(e, Kt, vn),
      Qt(e, Ge()),
      null
    );
  }
  function oc(e, t) {
    var s = Ve;
    Ve |= 1;
    try {
      return e(t);
    } finally {
      ((Ve = s), Ve === 0 && ((Vs = Ge() + 500), Cl && An()));
    }
  }
  function ds(e) {
    In !== null && In.tag === 0 && (Ve & 6) === 0 && Ws();
    var t = Ve;
    Ve |= 1;
    var s = wr.transition,
      o = Ke;
    try {
      if (((wr.transition = null), (Ke = 1), e)) return e();
    } finally {
      ((Ke = o), (wr.transition = s), (Ve = t), (Ve & 6) === 0 && An());
    }
  }
  function ic() {
    ((ur = Hs.current), Ze(Hs));
  }
  function fs(e, t) {
    ((e.finishedWork = null), (e.finishedLanes = 0));
    var s = e.timeoutHandle;
    if ((s !== -1 && ((e.timeoutHandle = -1), a0(s)), xt !== null))
      for (s = xt.return; s !== null; ) {
        var o = s;
        switch ((xi(o), o.tag)) {
          case 1:
            ((o = o.type.childContextTypes), o != null && Nl());
            break;
          case 3:
            ($s(), Ze(qt), Ze(_t), Ti());
            break;
          case 5:
            Ri(o);
            break;
          case 4:
            $s();
            break;
          case 13:
            Ze(at);
            break;
          case 19:
            Ze(at);
            break;
          case 10:
            ki(o.type._context);
            break;
          case 22:
          case 23:
            ic();
        }
        s = s.return;
      }
    if (
      ((kt = e),
      (xt = e = Un(e.current, null)),
      (Rt = ur = t),
      (wt = 0),
      (Ea = null),
      (tc = Yl = us = 0),
      (Kt = Ra = null),
      os !== null)
    ) {
      for (t = 0; t < os.length; t++)
        if (((s = os[t]), (o = s.interleaved), o !== null)) {
          s.interleaved = null;
          var u = o.next,
            h = s.pending;
          if (h !== null) {
            var y = h.next;
            ((h.next = u), (o.next = y));
          }
          s.pending = o;
        }
      os = null;
    }
    return e;
  }
  function Sf(e, t) {
    do {
      var s = xt;
      try {
        if ((ji(), (Ml.current = $l), zl)) {
          for (var o = lt.memoizedState; o !== null; ) {
            var u = o.queue;
            (u !== null && (u.pending = null), (o = o.next));
          }
          zl = !1;
        }
        if (
          ((cs = 0),
          (jt = vt = lt = null),
          (ba = !1),
          (ja = 0),
          (ec.current = null),
          s === null || s.return === null)
        ) {
          ((wt = 1), (Ea = t), (xt = null));
          break;
        }
        e: {
          var h = e,
            y = s.return,
            N = s,
            T = t;
          if (
            ((t = Rt),
            (N.flags |= 32768),
            T !== null && typeof T == "object" && typeof T.then == "function")
          ) {
            var $ = T,
              X = N,
              te = X.tag;
            if ((X.mode & 1) === 0 && (te === 0 || te === 11 || te === 15)) {
              var J = X.alternate;
              J
                ? ((X.updateQueue = J.updateQueue),
                  (X.memoizedState = J.memoizedState),
                  (X.lanes = J.lanes))
                : ((X.updateQueue = null), (X.memoizedState = null));
            }
            var he = Kd(y);
            if (he !== null) {
              ((he.flags &= -257),
                Qd(he, y, N, h, t),
                he.mode & 1 && Gd(h, $, t),
                (t = he),
                (T = $));
              var ye = t.updateQueue;
              if (ye === null) {
                var we = new Set();
                (we.add(T), (t.updateQueue = we));
              } else ye.add(T);
              break e;
            } else {
              if ((t & 1) === 0) {
                (Gd(h, $, t), cc());
                break e;
              }
              T = Error(l(426));
            }
          } else if (tt && N.mode & 1) {
            var ft = Kd(y);
            if (ft !== null) {
              ((ft.flags & 65536) === 0 && (ft.flags |= 256),
                Qd(ft, y, N, h, t),
                wi(Us(T, N)));
              break e;
            }
          }
          ((h = T = Us(T, N)),
            wt !== 4 && (wt = 2),
            Ra === null ? (Ra = [h]) : Ra.push(h),
            (h = y));
          do {
            switch (h.tag) {
              case 3:
                ((h.flags |= 65536), (t &= -t), (h.lanes |= t));
                var M = qd(h, T, t);
                vd(h, M);
                break e;
              case 1:
                N = T;
                var A = h.type,
                  z = h.stateNode;
                if (
                  (h.flags & 128) === 0 &&
                  (typeof A.getDerivedStateFromError == "function" ||
                    (z !== null &&
                      typeof z.componentDidCatch == "function" &&
                      (zn === null || !zn.has(z))))
                ) {
                  ((h.flags |= 65536), (t &= -t), (h.lanes |= t));
                  var re = Yd(h, N, t);
                  vd(h, re);
                  break e;
                }
            }
            h = h.return;
          } while (h !== null);
        }
        Rf(s);
      } catch (Ne) {
        ((t = Ne), xt === s && s !== null && (xt = s = s.return));
        continue;
      }
      break;
    } while (!0);
  }
  function Cf() {
    var e = ql.current;
    return ((ql.current = $l), e === null ? $l : e);
  }
  function cc() {
    ((wt === 0 || wt === 3 || wt === 2) && (wt = 4),
      kt === null ||
        ((us & 268435455) === 0 && (Yl & 268435455) === 0) ||
        $n(kt, Rt));
  }
  function Zl(e, t) {
    var s = Ve;
    Ve |= 2;
    var o = Cf();
    (kt !== e || Rt !== t) && ((vn = null), fs(e, t));
    do
      try {
        T0();
        break;
      } catch (u) {
        Sf(e, u);
      }
    while (!0);
    if ((ji(), (Ve = s), (ql.current = o), xt !== null)) throw Error(l(261));
    return ((kt = null), (Rt = 0), wt);
  }
  function T0() {
    for (; xt !== null; ) Ef(xt);
  }
  function _0() {
    for (; xt !== null && !Ye(); ) Ef(xt);
  }
  function Ef(e) {
    var t = _f(e.alternate, e, ur);
    ((e.memoizedProps = e.pendingProps),
      t === null ? Rf(e) : (xt = t),
      (ec.current = null));
  }
  function Rf(e) {
    var t = e;
    do {
      var s = t.alternate;
      if (((e = t.return), (t.flags & 32768) === 0)) {
        if (((s = k0(s, t, ur)), s !== null)) {
          xt = s;
          return;
        }
      } else {
        if (((s = N0(s, t)), s !== null)) {
          ((s.flags &= 32767), (xt = s));
          return;
        }
        if (e !== null)
          ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null));
        else {
          ((wt = 6), (xt = null));
          return;
        }
      }
      if (((t = t.sibling), t !== null)) {
        xt = t;
        return;
      }
      xt = t = e;
    } while (t !== null);
    wt === 0 && (wt = 5);
  }
  function hs(e, t, s) {
    var o = Ke,
      u = wr.transition;
    try {
      ((wr.transition = null), (Ke = 1), L0(e, t, s, o));
    } finally {
      ((wr.transition = u), (Ke = o));
    }
    return null;
  }
  function L0(e, t, s, o) {
    do Ws();
    while (In !== null);
    if ((Ve & 6) !== 0) throw Error(l(327));
    s = e.finishedWork;
    var u = e.finishedLanes;
    if (s === null) return null;
    if (((e.finishedWork = null), (e.finishedLanes = 0), s === e.current))
      throw Error(l(177));
    ((e.callbackNode = null), (e.callbackPriority = 0));
    var h = s.lanes | s.childLanes;
    if (
      (fp(e, h),
      e === kt && ((xt = kt = null), (Rt = 0)),
      ((s.subtreeFlags & 2064) === 0 && (s.flags & 2064) === 0) ||
        Kl ||
        ((Kl = !0),
        Lf(jn, function () {
          return (Ws(), null);
        })),
      (h = (s.flags & 15990) !== 0),
      (s.subtreeFlags & 15990) !== 0 || h)
    ) {
      ((h = wr.transition), (wr.transition = null));
      var y = Ke;
      Ke = 1;
      var N = Ve;
      ((Ve |= 4),
        (ec.current = null),
        C0(e, s),
        yf(s, e),
        Xp(ci),
        (ul = !!ii),
        (ci = ii = null),
        (e.current = s),
        E0(s),
        Wt(),
        (Ve = N),
        (Ke = y),
        (wr.transition = h));
    } else e.current = s;
    if (
      (Kl && ((Kl = !1), (In = e), (Ql = u)),
      (h = e.pendingLanes),
      h === 0 && (zn = null),
      Be(s.stateNode),
      Qt(e, Ge()),
      t !== null)
    )
      for (o = e.onRecoverableError, s = 0; s < t.length; s++)
        ((u = t[s]), o(u.value, { componentStack: u.stack, digest: u.digest }));
    if (Gl) throw ((Gl = !1), (e = nc), (nc = null), e);
    return (
      (Ql & 1) !== 0 && e.tag !== 0 && Ws(),
      (h = e.pendingLanes),
      (h & 1) !== 0 ? (e === sc ? Pa++ : ((Pa = 0), (sc = e))) : (Pa = 0),
      An(),
      null
    );
  }
  function Ws() {
    if (In !== null) {
      var e = pu(Ql),
        t = wr.transition,
        s = Ke;
      try {
        if (((wr.transition = null), (Ke = 16 > e ? 16 : e), In === null))
          var o = !1;
        else {
          if (((e = In), (In = null), (Ql = 0), (Ve & 6) !== 0))
            throw Error(l(331));
          var u = Ve;
          for (Ve |= 4, ge = e.current; ge !== null; ) {
            var h = ge,
              y = h.child;
            if ((ge.flags & 16) !== 0) {
              var N = h.deletions;
              if (N !== null) {
                for (var T = 0; T < N.length; T++) {
                  var $ = N[T];
                  for (ge = $; ge !== null; ) {
                    var X = ge;
                    switch (X.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Ca(8, X, h);
                    }
                    var te = X.child;
                    if (te !== null) ((te.return = X), (ge = te));
                    else
                      for (; ge !== null; ) {
                        X = ge;
                        var J = X.sibling,
                          he = X.return;
                        if ((hf(X), X === $)) {
                          ge = null;
                          break;
                        }
                        if (J !== null) {
                          ((J.return = he), (ge = J));
                          break;
                        }
                        ge = he;
                      }
                  }
                }
                var ye = h.alternate;
                if (ye !== null) {
                  var we = ye.child;
                  if (we !== null) {
                    ye.child = null;
                    do {
                      var ft = we.sibling;
                      ((we.sibling = null), (we = ft));
                    } while (we !== null);
                  }
                }
                ge = h;
              }
            }
            if ((h.subtreeFlags & 2064) !== 0 && y !== null)
              ((y.return = h), (ge = y));
            else
              e: for (; ge !== null; ) {
                if (((h = ge), (h.flags & 2048) !== 0))
                  switch (h.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Ca(9, h, h.return);
                  }
                var M = h.sibling;
                if (M !== null) {
                  ((M.return = h.return), (ge = M));
                  break e;
                }
                ge = h.return;
              }
          }
          var A = e.current;
          for (ge = A; ge !== null; ) {
            y = ge;
            var z = y.child;
            if ((y.subtreeFlags & 2064) !== 0 && z !== null)
              ((z.return = y), (ge = z));
            else
              e: for (y = A; ge !== null; ) {
                if (((N = ge), (N.flags & 2048) !== 0))
                  try {
                    switch (N.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Wl(9, N);
                    }
                  } catch (Ne) {
                    ct(N, N.return, Ne);
                  }
                if (N === y) {
                  ge = null;
                  break e;
                }
                var re = N.sibling;
                if (re !== null) {
                  ((re.return = N.return), (ge = re));
                  break e;
                }
                ge = N.return;
              }
          }
          if (
            ((Ve = u),
            An(),
            $t && typeof $t.onPostCommitFiberRoot == "function")
          )
            try {
              $t.onPostCommitFiberRoot(cn, e);
            } catch {}
          o = !0;
        }
        return o;
      } finally {
        ((Ke = s), (wr.transition = t));
      }
    }
    return !1;
  }
  function Pf(e, t, s) {
    ((t = Us(s, t)),
      (t = qd(e, t, 1)),
      (e = Dn(e, t, 1)),
      (t = Bt()),
      e !== null && (Zs(e, 1, t), Qt(e, t)));
  }
  function ct(e, t, s) {
    if (e.tag === 3) Pf(e, e, s);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          Pf(t, e, s);
          break;
        } else if (t.tag === 1) {
          var o = t.stateNode;
          if (
            typeof t.type.getDerivedStateFromError == "function" ||
            (typeof o.componentDidCatch == "function" &&
              (zn === null || !zn.has(o)))
          ) {
            ((e = Us(s, e)),
              (e = Yd(t, e, 1)),
              (t = Dn(t, e, 1)),
              (e = Bt()),
              t !== null && (Zs(t, 1, e), Qt(t, e)));
            break;
          }
        }
        t = t.return;
      }
  }
  function A0(e, t, s) {
    var o = e.pingCache;
    (o !== null && o.delete(t),
      (t = Bt()),
      (e.pingedLanes |= e.suspendedLanes & s),
      kt === e &&
        (Rt & s) === s &&
        (wt === 4 || (wt === 3 && (Rt & 130023424) === Rt && 500 > Ge() - rc)
          ? fs(e, 0)
          : (tc |= s)),
      Qt(e, t));
  }
  function Tf(e, t) {
    t === 0 &&
      ((e.mode & 1) === 0
        ? (t = 1)
        : ((t = ts), (ts <<= 1), (ts & 130023424) === 0 && (ts = 4194304)));
    var s = Bt();
    ((e = gn(e, t)), e !== null && (Zs(e, t, s), Qt(e, s)));
  }
  function O0(e) {
    var t = e.memoizedState,
      s = 0;
    (t !== null && (s = t.retryLane), Tf(e, s));
  }
  function D0(e, t) {
    var s = 0;
    switch (e.tag) {
      case 13:
        var o = e.stateNode,
          u = e.memoizedState;
        u !== null && (s = u.retryLane);
        break;
      case 19:
        o = e.stateNode;
        break;
      default:
        throw Error(l(314));
    }
    (o !== null && o.delete(t), Tf(e, s));
  }
  var _f;
  _f = function (e, t, s) {
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps || qt.current) Gt = !0;
      else {
        if ((e.lanes & s) === 0 && (t.flags & 128) === 0)
          return ((Gt = !1), j0(e, t, s));
        Gt = (e.flags & 131072) !== 0;
      }
    else ((Gt = !1), tt && (t.flags & 1048576) !== 0 && cd(t, Rl, t.index));
    switch (((t.lanes = 0), t.tag)) {
      case 2:
        var o = t.type;
        (Hl(e, t), (e = t.pendingProps));
        var u = As(t, _t.current);
        (Fs(t, s), (u = Ai(null, t, o, e, u, s)));
        var h = Oi();
        return (
          (t.flags |= 1),
          typeof u == "object" &&
          u !== null &&
          typeof u.render == "function" &&
          u.$$typeof === void 0
            ? ((t.tag = 1),
              (t.memoizedState = null),
              (t.updateQueue = null),
              Yt(o) ? ((h = !0), Sl(t)) : (h = !1),
              (t.memoizedState =
                u.state !== null && u.state !== void 0 ? u.state : null),
              Ci(t),
              (u.updater = Ul),
              (t.stateNode = u),
              (u._reactInternals = t),
              $i(t, o, e, s),
              (t = Vi(null, t, o, !0, h, s)))
            : ((t.tag = 0), tt && h && gi(t), Ut(null, t, u, s), (t = t.child)),
          t
        );
      case 16:
        o = t.elementType;
        e: {
          switch (
            (Hl(e, t),
            (e = t.pendingProps),
            (u = o._init),
            (o = u(o._payload)),
            (t.type = o),
            (u = t.tag = z0(o)),
            (e = _r(o, e)),
            u)
          ) {
            case 0:
              t = Hi(null, t, o, e, s);
              break e;
            case 1:
              t = rf(null, t, o, e, s);
              break e;
            case 11:
              t = Jd(null, t, o, e, s);
              break e;
            case 14:
              t = Xd(null, t, o, _r(o.type, e), s);
              break e;
          }
          throw Error(l(306, o, ""));
        }
        return t;
      case 0:
        return (
          (o = t.type),
          (u = t.pendingProps),
          (u = t.elementType === o ? u : _r(o, u)),
          Hi(e, t, o, u, s)
        );
      case 1:
        return (
          (o = t.type),
          (u = t.pendingProps),
          (u = t.elementType === o ? u : _r(o, u)),
          rf(e, t, o, u, s)
        );
      case 3:
        e: {
          if ((nf(t), e === null)) throw Error(l(387));
          ((o = t.pendingProps),
            (h = t.memoizedState),
            (u = h.element),
            yd(e, t),
            Ol(t, o, null, s));
          var y = t.memoizedState;
          if (((o = y.element), h.isDehydrated))
            if (
              ((h = {
                element: o,
                isDehydrated: !1,
                cache: y.cache,
                pendingSuspenseBoundaries: y.pendingSuspenseBoundaries,
                transitions: y.transitions,
              }),
              (t.updateQueue.baseState = h),
              (t.memoizedState = h),
              t.flags & 256)
            ) {
              ((u = Us(Error(l(423)), t)), (t = sf(e, t, o, s, u)));
              break e;
            } else if (o !== u) {
              ((u = Us(Error(l(424)), t)), (t = sf(e, t, o, s, u)));
              break e;
            } else
              for (
                cr = Tn(t.stateNode.containerInfo.firstChild),
                  ir = t,
                  tt = !0,
                  Tr = null,
                  s = gd(t, null, o, s),
                  t.child = s;
                s;
              )
                ((s.flags = (s.flags & -3) | 4096), (s = s.sibling));
          else {
            if ((Ms(), o === u)) {
              t = yn(e, t, s);
              break e;
            }
            Ut(e, t, o, s);
          }
          t = t.child;
        }
        return t;
      case 5:
        return (
          bd(t),
          e === null && vi(t),
          (o = t.type),
          (u = t.pendingProps),
          (h = e !== null ? e.memoizedProps : null),
          (y = u.children),
          ui(o, u) ? (y = null) : h !== null && ui(o, h) && (t.flags |= 32),
          tf(e, t),
          Ut(e, t, y, s),
          t.child
        );
      case 6:
        return (e === null && vi(t), null);
      case 13:
        return af(e, t, s);
      case 4:
        return (
          Ei(t, t.stateNode.containerInfo),
          (o = t.pendingProps),
          e === null ? (t.child = zs(t, null, o, s)) : Ut(e, t, o, s),
          t.child
        );
      case 11:
        return (
          (o = t.type),
          (u = t.pendingProps),
          (u = t.elementType === o ? u : _r(o, u)),
          Jd(e, t, o, u, s)
        );
      case 7:
        return (Ut(e, t, t.pendingProps, s), t.child);
      case 8:
        return (Ut(e, t, t.pendingProps.children, s), t.child);
      case 12:
        return (Ut(e, t, t.pendingProps.children, s), t.child);
      case 10:
        e: {
          if (
            ((o = t.type._context),
            (u = t.pendingProps),
            (h = t.memoizedProps),
            (y = u.value),
            Je(_l, o._currentValue),
            (o._currentValue = y),
            h !== null)
          )
            if (Pr(h.value, y)) {
              if (h.children === u.children && !qt.current) {
                t = yn(e, t, s);
                break e;
              }
            } else
              for (h = t.child, h !== null && (h.return = t); h !== null; ) {
                var N = h.dependencies;
                if (N !== null) {
                  y = h.child;
                  for (var T = N.firstContext; T !== null; ) {
                    if (T.context === o) {
                      if (h.tag === 1) {
                        ((T = xn(-1, s & -s)), (T.tag = 2));
                        var $ = h.updateQueue;
                        if ($ !== null) {
                          $ = $.shared;
                          var X = $.pending;
                          (X === null
                            ? (T.next = T)
                            : ((T.next = X.next), (X.next = T)),
                            ($.pending = T));
                        }
                      }
                      ((h.lanes |= s),
                        (T = h.alternate),
                        T !== null && (T.lanes |= s),
                        Ni(h.return, s, t),
                        (N.lanes |= s));
                      break;
                    }
                    T = T.next;
                  }
                } else if (h.tag === 10) y = h.type === t.type ? null : h.child;
                else if (h.tag === 18) {
                  if (((y = h.return), y === null)) throw Error(l(341));
                  ((y.lanes |= s),
                    (N = y.alternate),
                    N !== null && (N.lanes |= s),
                    Ni(y, s, t),
                    (y = h.sibling));
                } else y = h.child;
                if (y !== null) y.return = h;
                else
                  for (y = h; y !== null; ) {
                    if (y === t) {
                      y = null;
                      break;
                    }
                    if (((h = y.sibling), h !== null)) {
                      ((h.return = y.return), (y = h));
                      break;
                    }
                    y = y.return;
                  }
                h = y;
              }
          (Ut(e, t, u.children, s), (t = t.child));
        }
        return t;
      case 9:
        return (
          (u = t.type),
          (o = t.pendingProps.children),
          Fs(t, s),
          (u = yr(u)),
          (o = o(u)),
          (t.flags |= 1),
          Ut(e, t, o, s),
          t.child
        );
      case 14:
        return (
          (o = t.type),
          (u = _r(o, t.pendingProps)),
          (u = _r(o.type, u)),
          Xd(e, t, o, u, s)
        );
      case 15:
        return Zd(e, t, t.type, t.pendingProps, s);
      case 17:
        return (
          (o = t.type),
          (u = t.pendingProps),
          (u = t.elementType === o ? u : _r(o, u)),
          Hl(e, t),
          (t.tag = 1),
          Yt(o) ? ((e = !0), Sl(t)) : (e = !1),
          Fs(t, s),
          Vd(t, o, u),
          $i(t, o, u, s),
          Vi(null, t, o, !0, e, s)
        );
      case 19:
        return of(e, t, s);
      case 22:
        return ef(e, t, s);
    }
    throw Error(l(156, t.tag));
  };
  function Lf(e, t) {
    return dt(e, t);
  }
  function M0(e, t, s, o) {
    ((this.tag = e),
      (this.key = s),
      (this.sibling =
        this.child =
        this.return =
        this.stateNode =
        this.type =
        this.elementType =
          null),
      (this.index = 0),
      (this.ref = null),
      (this.pendingProps = t),
      (this.dependencies =
        this.memoizedState =
        this.updateQueue =
        this.memoizedProps =
          null),
      (this.mode = o),
      (this.subtreeFlags = this.flags = 0),
      (this.deletions = null),
      (this.childLanes = this.lanes = 0),
      (this.alternate = null));
  }
  function br(e, t, s, o) {
    return new M0(e, t, s, o);
  }
  function uc(e) {
    return ((e = e.prototype), !(!e || !e.isReactComponent));
  }
  function z0(e) {
    if (typeof e == "function") return uc(e) ? 1 : 0;
    if (e != null) {
      if (((e = e.$$typeof), e === de)) return 11;
      if (e === me) return 14;
    }
    return 2;
  }
  function Un(e, t) {
    var s = e.alternate;
    return (
      s === null
        ? ((s = br(e.tag, t, e.key, e.mode)),
          (s.elementType = e.elementType),
          (s.type = e.type),
          (s.stateNode = e.stateNode),
          (s.alternate = e),
          (e.alternate = s))
        : ((s.pendingProps = t),
          (s.type = e.type),
          (s.flags = 0),
          (s.subtreeFlags = 0),
          (s.deletions = null)),
      (s.flags = e.flags & 14680064),
      (s.childLanes = e.childLanes),
      (s.lanes = e.lanes),
      (s.child = e.child),
      (s.memoizedProps = e.memoizedProps),
      (s.memoizedState = e.memoizedState),
      (s.updateQueue = e.updateQueue),
      (t = e.dependencies),
      (s.dependencies =
        t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
      (s.sibling = e.sibling),
      (s.index = e.index),
      (s.ref = e.ref),
      s
    );
  }
  function eo(e, t, s, o, u, h) {
    var y = 2;
    if (((o = e), typeof e == "function")) uc(e) && (y = 1);
    else if (typeof e == "string") y = 5;
    else
      e: switch (e) {
        case P:
          return ms(s.children, u, h, t);
        case Y:
          ((y = 8), (u |= 8));
          break;
        case oe:
          return (
            (e = br(12, s, t, u | 2)),
            (e.elementType = oe),
            (e.lanes = h),
            e
          );
        case Re:
          return (
            (e = br(13, s, t, u)),
            (e.elementType = Re),
            (e.lanes = h),
            e
          );
        case ve:
          return (
            (e = br(19, s, t, u)),
            (e.elementType = ve),
            (e.lanes = h),
            e
          );
        case ue:
          return to(s, u, h, t);
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case ce:
                y = 10;
                break e;
              case Le:
                y = 9;
                break e;
              case de:
                y = 11;
                break e;
              case me:
                y = 14;
                break e;
              case Q:
                ((y = 16), (o = null));
                break e;
            }
          throw Error(l(130, e == null ? e : typeof e, ""));
      }
    return (
      (t = br(y, s, t, u)),
      (t.elementType = e),
      (t.type = o),
      (t.lanes = h),
      t
    );
  }
  function ms(e, t, s, o) {
    return ((e = br(7, e, o, t)), (e.lanes = s), e);
  }
  function to(e, t, s, o) {
    return (
      (e = br(22, e, o, t)),
      (e.elementType = ue),
      (e.lanes = s),
      (e.stateNode = { isHidden: !1 }),
      e
    );
  }
  function dc(e, t, s) {
    return ((e = br(6, e, null, t)), (e.lanes = s), e);
  }
  function fc(e, t, s) {
    return (
      (t = br(4, e.children !== null ? e.children : [], e.key, t)),
      (t.lanes = s),
      (t.stateNode = {
        containerInfo: e.containerInfo,
        pendingChildren: null,
        implementation: e.implementation,
      }),
      t
    );
  }
  function I0(e, t, s, o, u) {
    ((this.tag = t),
      (this.containerInfo = e),
      (this.finishedWork =
        this.pingCache =
        this.current =
        this.pendingChildren =
          null),
      (this.timeoutHandle = -1),
      (this.callbackNode = this.pendingContext = this.context = null),
      (this.callbackPriority = 0),
      (this.eventTimes = Fo(0)),
      (this.expirationTimes = Fo(-1)),
      (this.entangledLanes =
        this.finishedLanes =
        this.mutableReadLanes =
        this.expiredLanes =
        this.pingedLanes =
        this.suspendedLanes =
        this.pendingLanes =
          0),
      (this.entanglements = Fo(0)),
      (this.identifierPrefix = o),
      (this.onRecoverableError = u),
      (this.mutableSourceEagerHydrationData = null));
  }
  function hc(e, t, s, o, u, h, y, N, T) {
    return (
      (e = new I0(e, t, s, N, T)),
      t === 1 ? ((t = 1), h === !0 && (t |= 8)) : (t = 0),
      (h = br(3, null, null, t)),
      (e.current = h),
      (h.stateNode = e),
      (h.memoizedState = {
        element: o,
        isDehydrated: s,
        cache: null,
        transitions: null,
        pendingSuspenseBoundaries: null,
      }),
      Ci(h),
      e
    );
  }
  function F0(e, t, s) {
    var o =
      3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: U,
      key: o == null ? null : "" + o,
      children: e,
      containerInfo: t,
      implementation: s,
    };
  }
  function Af(e) {
    if (!e) return Ln;
    e = e._reactInternals;
    e: {
      if (je(e) !== e || e.tag !== 1) throw Error(l(170));
      var t = e;
      do {
        switch (t.tag) {
          case 3:
            t = t.stateNode.context;
            break e;
          case 1:
            if (Yt(t.type)) {
              t = t.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        t = t.return;
      } while (t !== null);
      throw Error(l(171));
    }
    if (e.tag === 1) {
      var s = e.type;
      if (Yt(s)) return ld(e, s, t);
    }
    return t;
  }
  function Of(e, t, s, o, u, h, y, N, T) {
    return (
      (e = hc(s, o, !0, e, u, h, y, N, T)),
      (e.context = Af(null)),
      (s = e.current),
      (o = Bt()),
      (u = Fn(s)),
      (h = xn(o, u)),
      (h.callback = t ?? null),
      Dn(s, h, u),
      (e.current.lanes = u),
      Zs(e, u, o),
      Qt(e, o),
      e
    );
  }
  function ro(e, t, s, o) {
    var u = t.current,
      h = Bt(),
      y = Fn(u);
    return (
      (s = Af(s)),
      t.context === null ? (t.context = s) : (t.pendingContext = s),
      (t = xn(h, y)),
      (t.payload = { element: e }),
      (o = o === void 0 ? null : o),
      o !== null && (t.callback = o),
      (e = Dn(u, t, y)),
      e !== null && (Or(e, u, y, h), Al(e, u, y)),
      y
    );
  }
  function no(e) {
    if (((e = e.current), !e.child)) return null;
    switch (e.child.tag) {
      case 5:
        return e.child.stateNode;
      default:
        return e.child.stateNode;
    }
  }
  function Df(e, t) {
    if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
      var s = e.retryLane;
      e.retryLane = s !== 0 && s < t ? s : t;
    }
  }
  function mc(e, t) {
    (Df(e, t), (e = e.alternate) && Df(e, t));
  }
  function $0() {
    return null;
  }
  var Mf =
    typeof reportError == "function"
      ? reportError
      : function (e) {
          console.error(e);
        };
  function pc(e) {
    this._internalRoot = e;
  }
  ((so.prototype.render = pc.prototype.render =
    function (e) {
      var t = this._internalRoot;
      if (t === null) throw Error(l(409));
      ro(e, t, null, null);
    }),
    (so.prototype.unmount = pc.prototype.unmount =
      function () {
        var e = this._internalRoot;
        if (e !== null) {
          this._internalRoot = null;
          var t = e.containerInfo;
          (ds(function () {
            ro(null, e, null, null);
          }),
            (t[fn] = null));
        }
      }));
  function so(e) {
    this._internalRoot = e;
  }
  so.prototype.unstable_scheduleHydration = function (e) {
    if (e) {
      var t = yu();
      e = { blockedOn: null, target: e, priority: t };
      for (var s = 0; s < En.length && t !== 0 && t < En[s].priority; s++);
      (En.splice(s, 0, e), s === 0 && bu(e));
    }
  };
  function gc(e) {
    return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
  }
  function ao(e) {
    return !(
      !e ||
      (e.nodeType !== 1 &&
        e.nodeType !== 9 &&
        e.nodeType !== 11 &&
        (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
    );
  }
  function zf() {}
  function U0(e, t, s, o, u) {
    if (u) {
      if (typeof o == "function") {
        var h = o;
        o = function () {
          var $ = no(y);
          h.call($);
        };
      }
      var y = Of(t, o, e, 0, null, !1, !1, "", zf);
      return (
        (e._reactRootContainer = y),
        (e[fn] = y.current),
        ha(e.nodeType === 8 ? e.parentNode : e),
        ds(),
        y
      );
    }
    for (; (u = e.lastChild); ) e.removeChild(u);
    if (typeof o == "function") {
      var N = o;
      o = function () {
        var $ = no(T);
        N.call($);
      };
    }
    var T = hc(e, 0, !1, null, null, !1, !1, "", zf);
    return (
      (e._reactRootContainer = T),
      (e[fn] = T.current),
      ha(e.nodeType === 8 ? e.parentNode : e),
      ds(function () {
        ro(t, T, s, o);
      }),
      T
    );
  }
  function lo(e, t, s, o, u) {
    var h = s._reactRootContainer;
    if (h) {
      var y = h;
      if (typeof u == "function") {
        var N = u;
        u = function () {
          var T = no(y);
          N.call(T);
        };
      }
      ro(t, y, e, u);
    } else y = U0(s, t, e, u, o);
    return no(y);
  }
  ((gu = function (e) {
    switch (e.tag) {
      case 3:
        var t = e.stateNode;
        if (t.current.memoizedState.isDehydrated) {
          var s = rs(t.pendingLanes);
          s !== 0 &&
            ($o(t, s | 1),
            Qt(t, Ge()),
            (Ve & 6) === 0 && ((Vs = Ge() + 500), An()));
        }
        break;
      case 13:
        (ds(function () {
          var o = gn(e, 1);
          if (o !== null) {
            var u = Bt();
            Or(o, e, 1, u);
          }
        }),
          mc(e, 1));
    }
  }),
    (Uo = function (e) {
      if (e.tag === 13) {
        var t = gn(e, 134217728);
        if (t !== null) {
          var s = Bt();
          Or(t, e, 134217728, s);
        }
        mc(e, 134217728);
      }
    }),
    (xu = function (e) {
      if (e.tag === 13) {
        var t = Fn(e),
          s = gn(e, t);
        if (s !== null) {
          var o = Bt();
          Or(s, e, t, o);
        }
        mc(e, t);
      }
    }),
    (yu = function () {
      return Ke;
    }),
    (vu = function (e, t) {
      var s = Ke;
      try {
        return ((Ke = e), t());
      } finally {
        Ke = s;
      }
    }),
    (Wr = function (e, t, s) {
      switch (t) {
        case "input":
          if ((Cr(e, s), (t = s.name), s.type === "radio" && t != null)) {
            for (s = e; s.parentNode; ) s = s.parentNode;
            for (
              s = s.querySelectorAll(
                "input[name=" + JSON.stringify("" + t) + '][type="radio"]',
              ),
                t = 0;
              t < s.length;
              t++
            ) {
              var o = s[t];
              if (o !== e && o.form === e.form) {
                var u = kl(o);
                if (!u) throw Error(l(90));
                (qe(o), Cr(o, u));
              }
            }
          }
          break;
        case "textarea":
          hr(e, s);
          break;
        case "select":
          ((t = s.value), t != null && Ur(e, !!s.multiple, t, !1));
      }
    }),
    (it = oc),
    (ut = ds));
  var B0 = { usingClientEntryPoint: !1, Events: [ga, _s, kl, Me, nt, oc] },
    Ta = {
      findFiberByHostInstance: ns,
      bundleType: 0,
      version: "18.3.1",
      rendererPackageName: "react-dom",
    },
    H0 = {
      bundleType: Ta.bundleType,
      version: Ta.version,
      rendererPackageName: Ta.rendererPackageName,
      rendererConfig: Ta.rendererConfig,
      overrideHookState: null,
      overrideHookStateDeletePath: null,
      overrideHookStateRenamePath: null,
      overrideProps: null,
      overridePropsDeletePath: null,
      overridePropsRenamePath: null,
      setErrorHandler: null,
      setSuspenseHandler: null,
      scheduleUpdate: null,
      currentDispatcherRef: G.ReactCurrentDispatcher,
      findHostInstanceByFiber: function (e) {
        return ((e = Ue(e)), e === null ? null : e.stateNode);
      },
      findFiberByHostInstance: Ta.findFiberByHostInstance || $0,
      findHostInstancesForRefresh: null,
      scheduleRefresh: null,
      scheduleRoot: null,
      setRefreshHandler: null,
      getCurrentFiber: null,
      reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
    };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var oo = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!oo.isDisabled && oo.supportsFiber)
      try {
        ((cn = oo.inject(H0)), ($t = oo));
      } catch {}
  }
  return (
    (Jt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = B0),
    (Jt.createPortal = function (e, t) {
      var s =
        2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!gc(t)) throw Error(l(200));
      return F0(e, t, null, s);
    }),
    (Jt.createRoot = function (e, t) {
      if (!gc(e)) throw Error(l(299));
      var s = !1,
        o = "",
        u = Mf;
      return (
        t != null &&
          (t.unstable_strictMode === !0 && (s = !0),
          t.identifierPrefix !== void 0 && (o = t.identifierPrefix),
          t.onRecoverableError !== void 0 && (u = t.onRecoverableError)),
        (t = hc(e, 1, !1, null, null, s, !1, o, u)),
        (e[fn] = t.current),
        ha(e.nodeType === 8 ? e.parentNode : e),
        new pc(t)
      );
    }),
    (Jt.findDOMNode = function (e) {
      if (e == null) return null;
      if (e.nodeType === 1) return e;
      var t = e._reactInternals;
      if (t === void 0)
        throw typeof e.render == "function"
          ? Error(l(188))
          : ((e = Object.keys(e).join(",")), Error(l(268, e)));
      return ((e = Ue(t)), (e = e === null ? null : e.stateNode), e);
    }),
    (Jt.flushSync = function (e) {
      return ds(e);
    }),
    (Jt.hydrate = function (e, t, s) {
      if (!ao(t)) throw Error(l(200));
      return lo(null, e, t, !0, s);
    }),
    (Jt.hydrateRoot = function (e, t, s) {
      if (!gc(e)) throw Error(l(405));
      var o = (s != null && s.hydratedSources) || null,
        u = !1,
        h = "",
        y = Mf;
      if (
        (s != null &&
          (s.unstable_strictMode === !0 && (u = !0),
          s.identifierPrefix !== void 0 && (h = s.identifierPrefix),
          s.onRecoverableError !== void 0 && (y = s.onRecoverableError)),
        (t = Of(t, null, e, 1, s ?? null, u, !1, h, y)),
        (e[fn] = t.current),
        ha(e),
        o)
      )
        for (e = 0; e < o.length; e++)
          ((s = o[e]),
            (u = s._getVersion),
            (u = u(s._source)),
            t.mutableSourceEagerHydrationData == null
              ? (t.mutableSourceEagerHydrationData = [s, u])
              : t.mutableSourceEagerHydrationData.push(s, u));
      return new so(t);
    }),
    (Jt.render = function (e, t, s) {
      if (!ao(t)) throw Error(l(200));
      return lo(null, e, t, !1, s);
    }),
    (Jt.unmountComponentAtNode = function (e) {
      if (!ao(e)) throw Error(l(40));
      return e._reactRootContainer
        ? (ds(function () {
            lo(null, null, e, !1, function () {
              ((e._reactRootContainer = null), (e[fn] = null));
            });
          }),
          !0)
        : !1;
    }),
    (Jt.unstable_batchedUpdates = oc),
    (Jt.unstable_renderSubtreeIntoContainer = function (e, t, s, o) {
      if (!ao(s)) throw Error(l(200));
      if (e == null || e._reactInternals === void 0) throw Error(l(38));
      return lo(e, t, s, !1, o);
    }),
    (Jt.version = "18.3.1-next-f1338f8080-20240426"),
    Jt
  );
}
var Wf;
function Qh() {
  if (Wf) return vc.exports;
  Wf = 1;
  function r() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(r);
      } catch (a) {
        console.error(a);
      }
  }
  return (r(), (vc.exports = J0()), vc.exports);
}
var qf;
function X0() {
  if (qf) return io;
  qf = 1;
  var r = Qh();
  return ((io.createRoot = r.createRoot), (io.hydrateRoot = r.hydrateRoot), io);
}
var Z0 = X0(),
  b = qc();
const le = Kh(b),
  eg = W0({ __proto__: null, default: le }, [b]);
/**
 * react-router v7.13.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ var Jh = (r) => {
    throw TypeError(r);
  },
  tg = (r, a, l) => a.has(r) || Jh("Cannot " + l),
  jc = (r, a, l) => (
    tg(r, a, "read from private field"),
    l ? l.call(r) : a.get(r)
  ),
  rg = (r, a, l) =>
    a.has(r)
      ? Jh("Cannot add the same private member more than once")
      : a instanceof WeakSet
        ? a.add(r)
        : a.set(r, l),
  Yf = "popstate";
function ng(r = {}) {
  function a(i, c) {
    let { pathname: d, search: f, hash: m } = i.location;
    return Ha(
      "",
      { pathname: d, search: f, hash: m },
      (c.state && c.state.usr) || null,
      (c.state && c.state.key) || "default",
    );
  }
  function l(i, c) {
    return typeof c == "string" ? c : nn(c);
  }
  return ag(a, l, null, r);
}
function $e(r, a) {
  if (r === !1 || r === null || typeof r > "u") throw new Error(a);
}
function ht(r, a) {
  if (!r) {
    typeof console < "u" && console.warn(a);
    try {
      throw new Error(a);
    } catch {}
  }
}
function sg() {
  return Math.random().toString(36).substring(2, 10);
}
function Gf(r, a) {
  return { usr: r.state, key: r.key, idx: a };
}
function Ha(r, a, l = null, i) {
  return {
    pathname: typeof r == "string" ? r : r.pathname,
    search: "",
    hash: "",
    ...(typeof a == "string" ? Gn(a) : a),
    state: l,
    key: (a && a.key) || i || sg(),
  };
}
function nn({ pathname: r = "/", search: a = "", hash: l = "" }) {
  return (
    a && a !== "?" && (r += a.charAt(0) === "?" ? a : "?" + a),
    l && l !== "#" && (r += l.charAt(0) === "#" ? l : "#" + l),
    r
  );
}
function Gn(r) {
  let a = {};
  if (r) {
    let l = r.indexOf("#");
    l >= 0 && ((a.hash = r.substring(l)), (r = r.substring(0, l)));
    let i = r.indexOf("?");
    (i >= 0 && ((a.search = r.substring(i)), (r = r.substring(0, i))),
      r && (a.pathname = r));
  }
  return a;
}
function ag(r, a, l, i = {}) {
  let { window: c = document.defaultView, v5Compat: d = !1 } = i,
    f = c.history,
    m = "POP",
    g = null,
    x = v();
  x == null && ((x = 0), f.replaceState({ ...f.state, idx: x }, ""));
  function v() {
    return (f.state || { idx: null }).idx;
  }
  function p() {
    m = "POP";
    let j = v(),
      E = j == null ? null : j - x;
    ((x = j), g && g({ action: m, location: L.location, delta: E }));
  }
  function k(j, E) {
    m = "PUSH";
    let D = Ha(L.location, j, E);
    x = v() + 1;
    let H = Gf(D, x),
      G = L.createHref(D);
    try {
      f.pushState(H, "", G);
    } catch (F) {
      if (F instanceof DOMException && F.name === "DataCloneError") throw F;
      c.location.assign(G);
    }
    d && g && g({ action: m, location: L.location, delta: 1 });
  }
  function R(j, E) {
    m = "REPLACE";
    let D = Ha(L.location, j, E);
    x = v();
    let H = Gf(D, x),
      G = L.createHref(D);
    (f.replaceState(H, "", G),
      d && g && g({ action: m, location: L.location, delta: 0 }));
  }
  function S(j) {
    return Xh(j);
  }
  let L = {
    get action() {
      return m;
    },
    get location() {
      return r(c, f);
    },
    listen(j) {
      if (g) throw new Error("A history only accepts one active listener");
      return (
        c.addEventListener(Yf, p),
        (g = j),
        () => {
          (c.removeEventListener(Yf, p), (g = null));
        }
      );
    },
    createHref(j) {
      return a(c, j);
    },
    createURL: S,
    encodeLocation(j) {
      let E = S(j);
      return { pathname: E.pathname, search: E.search, hash: E.hash };
    },
    push: k,
    replace: R,
    go(j) {
      return f.go(j);
    },
  };
  return L;
}
function Xh(r, a = !1) {
  let l = "http://localhost";
  (typeof window < "u" &&
    (l =
      window.location.origin !== "null"
        ? window.location.origin
        : window.location.href),
    $e(l, "No window.location.(origin|href) available to create URL"));
  let i = typeof r == "string" ? r : nn(r);
  return (
    (i = i.replace(/ $/, "%20")),
    !a && i.startsWith("//") && (i = l + i),
    new URL(i, l)
  );
}
var $a,
  Kf = class {
    constructor(r) {
      if ((rg(this, $a, new Map()), r)) for (let [a, l] of r) this.set(a, l);
    }
    get(r) {
      if (jc(this, $a).has(r)) return jc(this, $a).get(r);
      if (r.defaultValue !== void 0) return r.defaultValue;
      throw new Error("No value found for context");
    }
    set(r, a) {
      jc(this, $a).set(r, a);
    }
  };
$a = new WeakMap();
var lg = new Set(["lazy", "caseSensitive", "path", "id", "index", "children"]);
function og(r) {
  return lg.has(r);
}
var ig = new Set([
  "lazy",
  "caseSensitive",
  "path",
  "id",
  "index",
  "middleware",
  "children",
]);
function cg(r) {
  return ig.has(r);
}
function ug(r) {
  return r.index === !0;
}
function Va(r, a, l = [], i = {}, c = !1) {
  return r.map((d, f) => {
    let m = [...l, String(f)],
      g = typeof d.id == "string" ? d.id : m.join("-");
    if (
      ($e(
        d.index !== !0 || !d.children,
        "Cannot specify children on an index route",
      ),
      $e(
        c || !i[g],
        `Found a route id collision on id "${g}".  Route id's must be globally unique within Data Router usages`,
      ),
      ug(d))
    ) {
      let x = { ...d, id: g };
      return ((i[g] = Qf(x, a(x))), x);
    } else {
      let x = { ...d, id: g, children: void 0 };
      return (
        (i[g] = Qf(x, a(x))),
        d.children && (x.children = Va(d.children, a, m, i, c)),
        x
      );
    }
  });
}
function Qf(r, a) {
  return Object.assign(r, {
    ...a,
    ...(typeof a.lazy == "object" && a.lazy != null
      ? { lazy: { ...r.lazy, ...a.lazy } }
      : {}),
  });
}
function Hn(r, a, l = "/") {
  return Ua(r, a, l, !1);
}
function Ua(r, a, l, i) {
  let c = typeof a == "string" ? Gn(a) : a,
    d = Nr(c.pathname || "/", l);
  if (d == null) return null;
  let f = Zh(r);
  fg(f);
  let m = null;
  for (let g = 0; m == null && g < f.length; ++g) {
    let x = kg(d);
    m = bg(f[g], x, i);
  }
  return m;
}
function dg(r, a) {
  let { route: l, pathname: i, params: c } = r;
  return {
    id: l.id,
    pathname: i,
    params: c,
    data: a[l.id],
    loaderData: a[l.id],
    handle: l.handle,
  };
}
function Zh(r, a = [], l = [], i = "", c = !1) {
  let d = (f, m, g = c, x) => {
    let v = {
      relativePath: x === void 0 ? f.path || "" : x,
      caseSensitive: f.caseSensitive === !0,
      childrenIndex: m,
      route: f,
    };
    if (v.relativePath.startsWith("/")) {
      if (!v.relativePath.startsWith(i) && g) return;
      ($e(
        v.relativePath.startsWith(i),
        `Absolute route path "${v.relativePath}" nested under path "${i}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`,
      ),
        (v.relativePath = v.relativePath.slice(i.length)));
    }
    let p = en([i, v.relativePath]),
      k = l.concat(v);
    (f.children &&
      f.children.length > 0 &&
      ($e(
        f.index !== !0,
        `Index routes must not have child routes. Please remove all child routes from route path "${p}".`,
      ),
      Zh(f.children, a, k, p, g)),
      !(f.path == null && !f.index) &&
        a.push({ path: p, score: vg(p, f.index), routesMeta: k }));
  };
  return (
    r.forEach((f, m) => {
      if (f.path === "" || !f.path?.includes("?")) d(f, m);
      else for (let g of em(f.path)) d(f, m, !0, g);
    }),
    a
  );
}
function em(r) {
  let a = r.split("/");
  if (a.length === 0) return [];
  let [l, ...i] = a,
    c = l.endsWith("?"),
    d = l.replace(/\?$/, "");
  if (i.length === 0) return c ? [d, ""] : [d];
  let f = em(i.join("/")),
    m = [];
  return (
    m.push(...f.map((g) => (g === "" ? d : [d, g].join("/")))),
    c && m.push(...f),
    m.map((g) => (r.startsWith("/") && g === "" ? "/" : g))
  );
}
function fg(r) {
  r.sort((a, l) =>
    a.score !== l.score
      ? l.score - a.score
      : wg(
          a.routesMeta.map((i) => i.childrenIndex),
          l.routesMeta.map((i) => i.childrenIndex),
        ),
  );
}
var hg = /^:[\w-]+$/,
  mg = 3,
  pg = 2,
  gg = 1,
  xg = 10,
  yg = -2,
  Jf = (r) => r === "*";
function vg(r, a) {
  let l = r.split("/"),
    i = l.length;
  return (
    l.some(Jf) && (i += yg),
    a && (i += pg),
    l
      .filter((c) => !Jf(c))
      .reduce((c, d) => c + (hg.test(d) ? mg : d === "" ? gg : xg), i)
  );
}
function wg(r, a) {
  return r.length === a.length && r.slice(0, -1).every((i, c) => i === a[c])
    ? r[r.length - 1] - a[a.length - 1]
    : 0;
}
function bg(r, a, l = !1) {
  let { routesMeta: i } = r,
    c = {},
    d = "/",
    f = [];
  for (let m = 0; m < i.length; ++m) {
    let g = i[m],
      x = m === i.length - 1,
      v = d === "/" ? a : a.slice(d.length) || "/",
      p = Co(
        { path: g.relativePath, caseSensitive: g.caseSensitive, end: x },
        v,
      ),
      k = g.route;
    if (
      (!p &&
        x &&
        l &&
        !i[i.length - 1].route.index &&
        (p = Co(
          { path: g.relativePath, caseSensitive: g.caseSensitive, end: !1 },
          v,
        )),
      !p)
    )
      return null;
    (Object.assign(c, p.params),
      f.push({
        params: c,
        pathname: en([d, p.pathname]),
        pathnameBase: Cg(en([d, p.pathnameBase])),
        route: k,
      }),
      p.pathnameBase !== "/" && (d = en([d, p.pathnameBase])));
  }
  return f;
}
function Co(r, a) {
  typeof r == "string" && (r = { path: r, caseSensitive: !1, end: !0 });
  let [l, i] = jg(r.path, r.caseSensitive, r.end),
    c = a.match(l);
  if (!c) return null;
  let d = c[0],
    f = d.replace(/(.)\/+$/, "$1"),
    m = c.slice(1);
  return {
    params: i.reduce((x, { paramName: v, isOptional: p }, k) => {
      if (v === "*") {
        let S = m[k] || "";
        f = d.slice(0, d.length - S.length).replace(/(.)\/+$/, "$1");
      }
      const R = m[k];
      return (
        p && !R ? (x[v] = void 0) : (x[v] = (R || "").replace(/%2F/g, "/")),
        x
      );
    }, {}),
    pathname: d,
    pathnameBase: f,
    pattern: r,
  };
}
function jg(r, a = !1, l = !0) {
  ht(
    r === "*" || !r.endsWith("*") || r.endsWith("/*"),
    `Route path "${r}" will be treated as if it were "${r.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${r.replace(/\*$/, "/*")}".`,
  );
  let i = [],
    c =
      "^" +
      r
        .replace(/\/*\*?$/, "")
        .replace(/^\/*/, "/")
        .replace(/[\\.*+^${}|()[\]]/g, "\\$&")
        .replace(
          /\/:([\w-]+)(\?)?/g,
          (f, m, g) => (
            i.push({ paramName: m, isOptional: g != null }),
            g ? "/?([^\\/]+)?" : "/([^\\/]+)"
          ),
        )
        .replace(/\/([\w-]+)\?(\/|$)/g, "(/$1)?$2");
  return (
    r.endsWith("*")
      ? (i.push({ paramName: "*" }),
        (c += r === "*" || r === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$"))
      : l
        ? (c += "\\/*$")
        : r !== "" && r !== "/" && (c += "(?:(?=\\/|$))"),
    [new RegExp(c, a ? void 0 : "i"), i]
  );
}
function kg(r) {
  try {
    return r
      .split("/")
      .map((a) => decodeURIComponent(a).replace(/\//g, "%2F"))
      .join("/");
  } catch (a) {
    return (
      ht(
        !1,
        `The URL path "${r}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${a}).`,
      ),
      r
    );
  }
}
function Nr(r, a) {
  if (a === "/") return r;
  if (!r.toLowerCase().startsWith(a.toLowerCase())) return null;
  let l = a.endsWith("/") ? a.length - 1 : a.length,
    i = r.charAt(l);
  return i && i !== "/" ? null : r.slice(l) || "/";
}
function Ng({ basename: r, pathname: a }) {
  return a === "/" ? r : en([r, a]);
}
var tm = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  Yc = (r) => tm.test(r);
function Sg(r, a = "/") {
  let {
      pathname: l,
      search: i = "",
      hash: c = "",
    } = typeof r == "string" ? Gn(r) : r,
    d;
  return (
    l
      ? ((l = l.replace(/\/\/+/g, "/")),
        l.startsWith("/") ? (d = Xf(l.substring(1), "/")) : (d = Xf(l, a)))
      : (d = a),
    { pathname: d, search: Eg(i), hash: Rg(c) }
  );
}
function Xf(r, a) {
  let l = a.replace(/\/+$/, "").split("/");
  return (
    r.split("/").forEach((c) => {
      c === ".." ? l.length > 1 && l.pop() : c !== "." && l.push(c);
    }),
    l.length > 1 ? l.join("/") : "/"
  );
}
function kc(r, a, l, i) {
  return `Cannot include a '${r}' character in a manually specified \`to.${a}\` field [${JSON.stringify(i)}].  Please separate it out to the \`to.${l}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`;
}
function rm(r) {
  return r.filter(
    (a, l) => l === 0 || (a.route.path && a.route.path.length > 0),
  );
}
function Gc(r) {
  let a = rm(r);
  return a.map((l, i) => (i === a.length - 1 ? l.pathname : l.pathnameBase));
}
function Kc(r, a, l, i = !1) {
  let c;
  typeof r == "string"
    ? (c = Gn(r))
    : ((c = { ...r }),
      $e(
        !c.pathname || !c.pathname.includes("?"),
        kc("?", "pathname", "search", c),
      ),
      $e(
        !c.pathname || !c.pathname.includes("#"),
        kc("#", "pathname", "hash", c),
      ),
      $e(!c.search || !c.search.includes("#"), kc("#", "search", "hash", c)));
  let d = r === "" || c.pathname === "",
    f = d ? "/" : c.pathname,
    m;
  if (f == null) m = l;
  else {
    let p = a.length - 1;
    if (!i && f.startsWith("..")) {
      let k = f.split("/");
      for (; k[0] === ".."; ) (k.shift(), (p -= 1));
      c.pathname = k.join("/");
    }
    m = p >= 0 ? a[p] : "/";
  }
  let g = Sg(c, m),
    x = f && f !== "/" && f.endsWith("/"),
    v = (d || f === ".") && l.endsWith("/");
  return (!g.pathname.endsWith("/") && (x || v) && (g.pathname += "/"), g);
}
var en = (r) => r.join("/").replace(/\/\/+/g, "/"),
  Cg = (r) => r.replace(/\/+$/, "").replace(/^\/*/, "/"),
  Eg = (r) => (!r || r === "?" ? "" : r.startsWith("?") ? r : "?" + r),
  Rg = (r) => (!r || r === "#" ? "" : r.startsWith("#") ? r : "#" + r),
  Ka = class {
    constructor(r, a, l, i = !1) {
      ((this.status = r),
        (this.statusText = a || ""),
        (this.internal = i),
        l instanceof Error
          ? ((this.data = l.toString()), (this.error = l))
          : (this.data = l));
    }
  };
function Wa(r) {
  return (
    r != null &&
    typeof r.status == "number" &&
    typeof r.statusText == "string" &&
    typeof r.internal == "boolean" &&
    "data" in r
  );
}
function Qa(r) {
  return (
    r
      .map((a) => a.route.path)
      .filter(Boolean)
      .join("/")
      .replace(/\/\/*/g, "/") || "/"
  );
}
var nm =
  typeof window < "u" &&
  typeof window.document < "u" &&
  typeof window.document.createElement < "u";
function sm(r, a) {
  let l = r;
  if (typeof l != "string" || !tm.test(l))
    return { absoluteURL: void 0, isExternal: !1, to: l };
  let i = l,
    c = !1;
  if (nm)
    try {
      let d = new URL(window.location.href),
        f = l.startsWith("//") ? new URL(d.protocol + l) : new URL(l),
        m = Nr(f.pathname, a);
      f.origin === d.origin && m != null
        ? (l = m + f.search + f.hash)
        : (c = !0);
    } catch {
      ht(
        !1,
        `<Link to="${l}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`,
      );
    }
  return { absoluteURL: i, isExternal: c, to: l };
}
var Wn = Symbol("Uninstrumented");
function Pg(r, a) {
  let l = {
    lazy: [],
    "lazy.loader": [],
    "lazy.action": [],
    "lazy.middleware": [],
    middleware: [],
    loader: [],
    action: [],
  };
  r.forEach((c) =>
    c({
      id: a.id,
      index: a.index,
      path: a.path,
      instrument(d) {
        let f = Object.keys(l);
        for (let m of f) d[m] && l[m].push(d[m]);
      },
    }),
  );
  let i = {};
  if (typeof a.lazy == "function" && l.lazy.length > 0) {
    let c = Ys(l.lazy, a.lazy, () => {});
    c && (i.lazy = c);
  }
  if (typeof a.lazy == "object") {
    let c = a.lazy;
    ["middleware", "loader", "action"].forEach((d) => {
      let f = c[d],
        m = l[`lazy.${d}`];
      if (typeof f == "function" && m.length > 0) {
        let g = Ys(m, f, () => {});
        g && (i.lazy = Object.assign(i.lazy || {}, { [d]: g }));
      }
    });
  }
  return (
    ["loader", "action"].forEach((c) => {
      let d = a[c];
      if (typeof d == "function" && l[c].length > 0) {
        let f = d[Wn] ?? d,
          m = Ys(l[c], f, (...g) => Zf(g[0]));
        m &&
          (c === "loader" && f.hydrate === !0 && (m.hydrate = !0),
          (m[Wn] = f),
          (i[c] = m));
      }
    }),
    a.middleware &&
      a.middleware.length > 0 &&
      l.middleware.length > 0 &&
      (i.middleware = a.middleware.map((c) => {
        let d = c[Wn] ?? c,
          f = Ys(l.middleware, d, (...m) => Zf(m[0]));
        return f ? ((f[Wn] = d), f) : c;
      })),
    i
  );
}
function Tg(r, a) {
  let l = { navigate: [], fetch: [] };
  if (
    (a.forEach((i) =>
      i({
        instrument(c) {
          let d = Object.keys(c);
          for (let f of d) c[f] && l[f].push(c[f]);
        },
      }),
    ),
    l.navigate.length > 0)
  ) {
    let i = r.navigate[Wn] ?? r.navigate,
      c = Ys(l.navigate, i, (...d) => {
        let [f, m] = d;
        return {
          to:
            typeof f == "number" || typeof f == "string" ? f : f ? nn(f) : ".",
          ...eh(r, m ?? {}),
        };
      });
    c && ((c[Wn] = i), (r.navigate = c));
  }
  if (l.fetch.length > 0) {
    let i = r.fetch[Wn] ?? r.fetch,
      c = Ys(l.fetch, i, (...d) => {
        let [f, , m, g] = d;
        return { href: m ?? ".", fetcherKey: f, ...eh(r, g ?? {}) };
      });
    c && ((c[Wn] = i), (r.fetch = c));
  }
  return r;
}
function Ys(r, a, l) {
  return r.length === 0
    ? null
    : async (...i) => {
        let c = await am(r, l(...i), () => a(...i), r.length - 1);
        if (c.type === "error") throw c.value;
        return c.value;
      };
}
async function am(r, a, l, i) {
  let c = r[i],
    d;
  if (c) {
    let f,
      m = async () => (
        f
          ? console.error(
              "You cannot call instrumented handlers more than once",
            )
          : (f = am(r, a, l, i - 1)),
        (d = await f),
        $e(d, "Expected a result"),
        d.type === "error" && d.value instanceof Error
          ? { status: "error", error: d.value }
          : { status: "success", error: void 0 }
      );
    try {
      await c(m, a);
    } catch (g) {
      console.error("An instrumentation function threw an error:", g);
    }
    (f || (await m()), await f);
  } else
    try {
      d = { type: "success", value: await l() };
    } catch (f) {
      d = { type: "error", value: f };
    }
  return (
    d || {
      type: "error",
      value: new Error("No result assigned in instrumentation chain."),
    }
  );
}
function Zf(r) {
  let { request: a, context: l, params: i, unstable_pattern: c } = r;
  return {
    request: _g(a),
    params: { ...i },
    unstable_pattern: c,
    context: Lg(l),
  };
}
function eh(r, a) {
  return {
    currentUrl: nn(r.state.location),
    ...("formMethod" in a ? { formMethod: a.formMethod } : {}),
    ...("formEncType" in a ? { formEncType: a.formEncType } : {}),
    ...("formData" in a ? { formData: a.formData } : {}),
    ...("body" in a ? { body: a.body } : {}),
  };
}
function _g(r) {
  return {
    method: r.method,
    url: r.url,
    headers: { get: (...a) => r.headers.get(...a) },
  };
}
function Lg(r) {
  if (Og(r)) {
    let a = { ...r };
    return (Object.freeze(a), a);
  } else return { get: (a) => r.get(a) };
}
var Ag = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function Og(r) {
  if (r === null || typeof r != "object") return !1;
  const a = Object.getPrototypeOf(r);
  return (
    a === Object.prototype ||
    a === null ||
    Object.getOwnPropertyNames(a).sort().join("\0") === Ag
  );
}
var lm = ["POST", "PUT", "PATCH", "DELETE"],
  Dg = new Set(lm),
  Mg = ["GET", ...lm],
  zg = new Set(Mg),
  om = new Set([301, 302, 303, 307, 308]),
  Ig = new Set([307, 308]),
  Nc = {
    state: "idle",
    location: void 0,
    formMethod: void 0,
    formAction: void 0,
    formEncType: void 0,
    formData: void 0,
    json: void 0,
    text: void 0,
  },
  Fg = {
    state: "idle",
    data: void 0,
    formMethod: void 0,
    formAction: void 0,
    formEncType: void 0,
    formData: void 0,
    json: void 0,
    text: void 0,
  },
  La = { state: "unblocked", proceed: void 0, reset: void 0, location: void 0 },
  $g = (r) => ({ hasErrorBoundary: !!r.hasErrorBoundary }),
  im = "remix-router-transitions",
  cm = Symbol("ResetLoaderData");
function Ug(r) {
  const a = r.window ? r.window : typeof window < "u" ? window : void 0,
    l =
      typeof a < "u" &&
      typeof a.document < "u" &&
      typeof a.document.createElement < "u";
  $e(
    r.routes.length > 0,
    "You must provide a non-empty routes array to createRouter",
  );
  let i = r.hydrationRouteProperties || [],
    c = r.mapRouteProperties || $g,
    d = c;
  if (r.unstable_instrumentations) {
    let C = r.unstable_instrumentations;
    d = (O) => ({ ...c(O), ...Pg(C.map((I) => I.route).filter(Boolean), O) });
  }
  let f = {},
    m = Va(r.routes, d, void 0, f),
    g,
    x = r.basename || "/";
  x.startsWith("/") || (x = `/${x}`);
  let v = r.dataStrategy || qg,
    p = { ...r.future },
    k = null,
    R = new Set(),
    S = null,
    L = null,
    j = null,
    E = r.hydrationData != null,
    D = Hn(m, r.history.location, x),
    H = !1,
    G = null,
    F;
  if (D == null && !r.patchRoutesOnNavigation) {
    let C = kr(404, { pathname: r.history.location.pathname }),
      { matches: O, route: I } = co(m);
    ((F = !0), (D = O), (G = { [I.id]: C }));
  } else if (
    (D &&
      !r.hydrationData &&
      ut(D, m, r.history.location.pathname).active &&
      (D = null),
    D)
  )
    if (D.some((C) => C.route.lazy)) F = !1;
    else if (!D.some((C) => Qc(C.route))) F = !0;
    else {
      let C = r.hydrationData ? r.hydrationData.loaderData : null,
        O = r.hydrationData ? r.hydrationData.errors : null;
      if (O) {
        let I = D.findIndex((K) => O[K.route.id] !== void 0);
        F = D.slice(0, I + 1).every((K) => !Mc(K.route, C, O));
      } else F = D.every((I) => !Mc(I.route, C, O));
    }
  else {
    ((F = !1), (D = []));
    let C = ut(null, m, r.history.location.pathname);
    C.active && C.matches && ((H = !0), (D = C.matches));
  }
  let U,
    P = {
      historyAction: r.history.action,
      location: r.history.location,
      matches: D,
      initialized: F,
      navigation: Nc,
      restoreScrollPosition: r.hydrationData != null ? !1 : null,
      preventScrollReset: !1,
      revalidation: "idle",
      loaderData: (r.hydrationData && r.hydrationData.loaderData) || {},
      actionData: (r.hydrationData && r.hydrationData.actionData) || null,
      errors: (r.hydrationData && r.hydrationData.errors) || G,
      fetchers: new Map(),
      blockers: new Map(),
    },
    Y = "POP",
    oe = null,
    ce = !1,
    Le,
    de = !1,
    Re = new Map(),
    ve = null,
    me = !1,
    Q = !1,
    ue = new Set(),
    V = new Map(),
    ne = 0,
    ee = -1,
    w = new Map(),
    _ = new Set(),
    W = new Map(),
    Z = new Map(),
    q = new Set(),
    ie = new Map(),
    xe,
    fe = null;
  function Ie() {
    if (
      ((k = r.history.listen(({ action: C, location: O, delta: I }) => {
        if (xe) {
          (xe(), (xe = void 0));
          return;
        }
        ht(
          ie.size === 0 || I != null,
          "You are trying to use a blocker on a POP navigation to a location that was not created by @remix-run/router. This will fail silently in production. This can happen if you are navigating outside the router via `window.history.pushState`/`window.location.hash` instead of using router navigation APIs.  This can also happen if you are using createHashRouter and the user manually changes the URL.",
        );
        let K = Rr({
          currentLocation: P.location,
          nextLocation: O,
          historyAction: C,
        });
        if (K && I != null) {
          let se = new Promise((ke) => {
            xe = ke;
          });
          (r.history.go(I * -1),
            Wr(K, {
              state: "blocked",
              location: O,
              proceed() {
                (Wr(K, {
                  state: "proceeding",
                  proceed: void 0,
                  reset: void 0,
                  location: O,
                }),
                  se.then(() => r.history.go(I)));
              },
              reset() {
                let ke = new Map(P.blockers);
                (ke.set(K, La), qe({ blockers: ke }));
              },
            }),
            oe?.resolve(),
            (oe = null));
          return;
        }
        return nr(C, O);
      })),
      l)
    ) {
      ux(a, Re);
      let C = () => dx(a, Re);
      (a.addEventListener("pagehide", C),
        (ve = () => a.removeEventListener("pagehide", C)));
    }
    return (
      P.initialized || nr("POP", P.location, { initialHydration: !0 }),
      U
    );
  }
  function rt() {
    (k && k(),
      ve && ve(),
      R.clear(),
      Le && Le.abort(),
      P.fetchers.forEach((C, O) => mr(O)),
      P.blockers.forEach((C, O) => Ft(O)));
  }
  function Ht(C) {
    return (R.add(C), () => R.delete(C));
  }
  function qe(C, O = {}) {
    (C.matches &&
      (C.matches = C.matches.map((se) => {
        let ke = f[se.route.id],
          pe = se.route;
        return pe.element !== ke.element ||
          pe.errorElement !== ke.errorElement ||
          pe.hydrateFallbackElement !== ke.hydrateFallbackElement
          ? { ...se, route: ke }
          : se;
      })),
      (P = { ...P, ...C }));
    let I = [],
      K = [];
    (P.fetchers.forEach((se, ke) => {
      se.state === "idle" && (q.has(ke) ? I.push(ke) : K.push(ke));
    }),
      q.forEach((se) => {
        !P.fetchers.has(se) && !V.has(se) && I.push(se);
      }),
      [...R].forEach((se) =>
        se(P, {
          deletedFetchers: I,
          newErrors: C.errors ?? null,
          viewTransitionOpts: O.viewTransitionOpts,
          flushSync: O.flushSync === !0,
        }),
      ),
      I.forEach((se) => mr(se)),
      K.forEach((se) => P.fetchers.delete(se)));
  }
  function rr(C, O, { flushSync: I } = {}) {
    let K =
        P.actionData != null &&
        P.navigation.formMethod != null &&
        Dt(P.navigation.formMethod) &&
        P.navigation.state === "loading" &&
        C.state?._isRedirect !== !0,
      se;
    O.actionData
      ? Object.keys(O.actionData).length > 0
        ? (se = O.actionData)
        : (se = null)
      : K
        ? (se = P.actionData)
        : (se = null);
    let ke = O.loaderData
        ? uh(P.loaderData, O.loaderData, O.matches || [], O.errors)
        : P.loaderData,
      pe = P.blockers;
    pe.size > 0 && ((pe = new Map(pe)), pe.forEach((Ae, Ce) => pe.set(Ce, La)));
    let be = me ? !1 : it(C, O.matches || P.matches),
      Se =
        ce === !0 ||
        (P.navigation.formMethod != null &&
          Dt(P.navigation.formMethod) &&
          C.state?._isRedirect !== !0);
    (g && ((m = g), (g = void 0)),
      me ||
        Y === "POP" ||
        (Y === "PUSH"
          ? r.history.push(C, C.state)
          : Y === "REPLACE" && r.history.replace(C, C.state)));
    let je;
    if (Y === "POP") {
      let Ae = Re.get(P.location.pathname);
      Ae && Ae.has(C.pathname)
        ? (je = { currentLocation: P.location, nextLocation: C })
        : Re.has(C.pathname) &&
          (je = { currentLocation: C, nextLocation: P.location });
    } else if (de) {
      let Ae = Re.get(P.location.pathname);
      (Ae
        ? Ae.add(C.pathname)
        : ((Ae = new Set([C.pathname])), Re.set(P.location.pathname, Ae)),
        (je = { currentLocation: P.location, nextLocation: C }));
    }
    (qe(
      {
        ...O,
        actionData: se,
        loaderData: ke,
        historyAction: Y,
        location: C,
        initialized: !0,
        navigation: Nc,
        revalidation: "idle",
        restoreScrollPosition: be,
        preventScrollReset: Se,
        blockers: pe,
      },
      { viewTransitionOpts: je, flushSync: I === !0 },
    ),
      (Y = "POP"),
      (ce = !1),
      (de = !1),
      (me = !1),
      (Q = !1),
      oe?.resolve(),
      (oe = null),
      fe?.resolve(),
      (fe = null));
  }
  async function $r(C, O) {
    if ((oe?.resolve(), (oe = null), typeof C == "number")) {
      oe || (oe = mh());
      let Ue = oe.promise;
      return (r.history.go(C), Ue);
    }
    let I = Dc(P.location, P.matches, x, C, O?.fromRouteId, O?.relative),
      { path: K, submission: se, error: ke } = th(!1, I, O),
      pe = P.location,
      be = Ha(P.location, K, O && O.state);
    be = { ...be, ...r.history.encodeLocation(be) };
    let Se = O && O.replace != null ? O.replace : void 0,
      je = "PUSH";
    Se === !0
      ? (je = "REPLACE")
      : Se === !1 ||
        (se != null &&
          Dt(se.formMethod) &&
          se.formAction === P.location.pathname + P.location.search &&
          (je = "REPLACE"));
    let Ae =
        O && "preventScrollReset" in O ? O.preventScrollReset === !0 : void 0,
      Ce = (O && O.flushSync) === !0,
      He = Rr({ currentLocation: pe, nextLocation: be, historyAction: je });
    if (He) {
      Wr(He, {
        state: "blocked",
        location: be,
        proceed() {
          (Wr(He, {
            state: "proceeding",
            proceed: void 0,
            reset: void 0,
            location: be,
          }),
            $r(C, O));
        },
        reset() {
          let Ue = new Map(P.blockers);
          (Ue.set(He, La), qe({ blockers: Ue }));
        },
      });
      return;
    }
    await nr(je, be, {
      submission: se,
      pendingError: ke,
      preventScrollReset: Ae,
      replace: O && O.replace,
      enableViewTransition: O && O.viewTransition,
      flushSync: Ce,
      callSiteDefaultShouldRevalidate: O && O.unstable_defaultShouldRevalidate,
    });
  }
  function js() {
    (fe || (fe = mh()), an(), qe({ revalidation: "loading" }));
    let C = fe.promise;
    return P.navigation.state === "submitting"
      ? C
      : P.navigation.state === "idle"
        ? (nr(P.historyAction, P.location, {
            startUninterruptedRevalidation: !0,
          }),
          C)
        : (nr(Y || P.historyAction, P.navigation.location, {
            overrideNavigation: P.navigation,
            enableViewTransition: de === !0,
          }),
          C);
  }
  async function nr(C, O, I) {
    (Le && Le.abort(),
      (Le = null),
      (Y = C),
      (me = (I && I.startUninterruptedRevalidation) === !0),
      nt(P.location, P.matches),
      (ce = (I && I.preventScrollReset) === !0),
      (de = (I && I.enableViewTransition) === !0));
    let K = g || m,
      se = I && I.overrideNavigation,
      ke =
        I?.initialHydration && P.matches && P.matches.length > 0 && !H
          ? P.matches
          : Hn(K, O, x),
      pe = (I && I.flushSync) === !0;
    if (
      ke &&
      P.initialized &&
      !Q &&
      ex(P.location, O) &&
      !(I && I.submission && Dt(I.submission.formMethod))
    ) {
      rr(O, { matches: ke }, { flushSync: pe });
      return;
    }
    let be = ut(ke, K, O.pathname);
    if ((be.active && be.matches && (ke = be.matches), !ke)) {
      let { error: dt, notFoundMatches: bt, route: Ye } = sr(O.pathname);
      rr(
        O,
        { matches: bt, loaderData: {}, errors: { [Ye.id]: dt } },
        { flushSync: pe },
      );
      return;
    }
    Le = new AbortController();
    let Se = qs(r.history, O, Le.signal, I && I.submission),
      je = r.getContext ? await r.getContext() : new Kf(),
      Ae;
    if (I && I.pendingError)
      Ae = [Vn(ke).route.id, { type: "error", error: I.pendingError }];
    else if (I && I.submission && Dt(I.submission.formMethod)) {
      let dt = await Cr(
        Se,
        O,
        I.submission,
        ke,
        je,
        be.active,
        I && I.initialHydration === !0,
        { replace: I.replace, flushSync: pe },
      );
      if (dt.shortCircuited) return;
      if (dt.pendingActionResult) {
        let [bt, Ye] = dt.pendingActionResult;
        if (dr(Ye) && Wa(Ye.error) && Ye.error.status === 404) {
          ((Le = null),
            rr(O, {
              matches: dt.matches,
              loaderData: {},
              errors: { [bt]: Ye.error },
            }));
          return;
        }
      }
      ((ke = dt.matches || ke),
        (Ae = dt.pendingActionResult),
        (se = Sc(O, I.submission)),
        (pe = !1),
        (be.active = !1),
        (Se = qs(r.history, Se.url, Se.signal)));
    }
    let {
      shortCircuited: Ce,
      matches: He,
      loaderData: Ue,
      errors: gt,
    } = await Qn(
      Se,
      O,
      ke,
      je,
      be.active,
      se,
      I && I.submission,
      I && I.fetcherSubmission,
      I && I.replace,
      I && I.initialHydration === !0,
      pe,
      Ae,
      I && I.callSiteDefaultShouldRevalidate,
    );
    Ce ||
      ((Le = null),
      rr(O, { matches: He || ke, ...dh(Ae), loaderData: Ue, errors: gt }));
  }
  async function Cr(C, O, I, K, se, ke, pe, be = {}) {
    an();
    let Se = ix(O, I);
    if ((qe({ navigation: Se }, { flushSync: be.flushSync === !0 }), ke)) {
      let Ce = await ar(K, O.pathname, C.signal);
      if (Ce.type === "aborted") return { shortCircuited: !0 };
      if (Ce.type === "error") {
        if (Ce.partialMatches.length === 0) {
          let { matches: Ue, route: gt } = co(m);
          return {
            matches: Ue,
            pendingActionResult: [gt.id, { type: "error", error: Ce.error }],
          };
        }
        let He = Vn(Ce.partialMatches).route.id;
        return {
          matches: Ce.partialMatches,
          pendingActionResult: [He, { type: "error", error: Ce.error }],
        };
      } else if (Ce.matches) K = Ce.matches;
      else {
        let { notFoundMatches: He, error: Ue, route: gt } = sr(O.pathname);
        return {
          matches: He,
          pendingActionResult: [gt.id, { type: "error", error: Ue }],
        };
      }
    }
    let je,
      Ae = vo(K, O);
    if (!Ae.route.action && !Ae.route.lazy)
      je = {
        type: "error",
        error: kr(405, {
          method: C.method,
          pathname: O.pathname,
          routeId: Ae.route.id,
        }),
      };
    else {
      let Ce = Gs(d, f, C, K, Ae, pe ? [] : i, se),
        He = await Br(C, Ce, se, null);
      if (((je = He[Ae.route.id]), !je)) {
        for (let Ue of K)
          if (He[Ue.route.id]) {
            je = He[Ue.route.id];
            break;
          }
      }
      if (C.signal.aborted) return { shortCircuited: !0 };
    }
    if (gs(je)) {
      let Ce;
      return (
        be && be.replace != null
          ? (Ce = be.replace)
          : (Ce =
              oh(
                je.response.headers.get("Location"),
                new URL(C.url),
                x,
                r.history,
              ) ===
              P.location.pathname + P.location.search),
        await hr(C, je, !0, { submission: I, replace: Ce }),
        { shortCircuited: !0 }
      );
    }
    if (dr(je)) {
      let Ce = Vn(K, Ae.route.id);
      return (
        (be && be.replace) !== !0 && (Y = "PUSH"),
        { matches: K, pendingActionResult: [Ce.route.id, je, Ae.route.id] }
      );
    }
    return { matches: K, pendingActionResult: [Ae.route.id, je] };
  }
  async function Qn(C, O, I, K, se, ke, pe, be, Se, je, Ae, Ce, He) {
    let Ue = ke || Sc(O, pe),
      gt = pe || be || hh(Ue),
      dt = !me && !je;
    if (se) {
      if (dt) {
        let Qe = Pt(Ce);
        qe(
          { navigation: Ue, ...(Qe !== void 0 ? { actionData: Qe } : {}) },
          { flushSync: Ae },
        );
      }
      let Be = await ar(I, O.pathname, C.signal);
      if (Be.type === "aborted") return { shortCircuited: !0 };
      if (Be.type === "error") {
        if (Be.partialMatches.length === 0) {
          let { matches: kn, route: un } = co(m);
          return { matches: kn, loaderData: {}, errors: { [un.id]: Be.error } };
        }
        let Qe = Vn(Be.partialMatches).route.id;
        return {
          matches: Be.partialMatches,
          loaderData: {},
          errors: { [Qe]: Be.error },
        };
      } else if (Be.matches) I = Be.matches;
      else {
        let { error: Qe, notFoundMatches: kn, route: un } = sr(O.pathname);
        return { matches: kn, loaderData: {}, errors: { [un.id]: Qe } };
      }
    }
    let bt = g || m,
      { dsMatches: Ye, revalidatingFetchers: Wt } = rh(
        C,
        K,
        d,
        f,
        r.history,
        P,
        I,
        gt,
        O,
        je ? [] : i,
        je === !0,
        Q,
        ue,
        q,
        W,
        _,
        bt,
        x,
        r.patchRoutesOnNavigation != null,
        Ce,
        He,
      );
    if (
      ((ee = ++ne),
      !r.dataStrategy &&
        !Ye.some((Be) => Be.shouldLoad) &&
        !Ye.some(
          (Be) => Be.route.middleware && Be.route.middleware.length > 0,
        ) &&
        Wt.length === 0)
    ) {
      let Be = ln();
      return (
        rr(
          O,
          {
            matches: I,
            loaderData: {},
            errors: Ce && dr(Ce[1]) ? { [Ce[0]]: Ce[1].error } : null,
            ...dh(Ce),
            ...(Be ? { fetchers: new Map(P.fetchers) } : {}),
          },
          { flushSync: Ae },
        ),
        { shortCircuited: !0 }
      );
    }
    if (dt) {
      let Be = {};
      if (!se) {
        Be.navigation = Ue;
        let Qe = Pt(Ce);
        Qe !== void 0 && (Be.actionData = Qe);
      }
      (Wt.length > 0 && (Be.fetchers = sn(Wt)), qe(Be, { flushSync: Ae }));
    }
    Wt.forEach((Be) => {
      (Vt(Be.key), Be.controller && V.set(Be.key, Be.controller));
    });
    let Ge = () => Wt.forEach((Be) => Vt(Be.key));
    Le && Le.signal.addEventListener("abort", Ge);
    let { loaderResults: Zn, fetcherResults: pr } = await Hr(Ye, Wt, C, K);
    if (C.signal.aborted) return { shortCircuited: !0 };
    (Le && Le.signal.removeEventListener("abort", Ge),
      Wt.forEach((Be) => V.delete(Be.key)));
    let lr = uo(Zn);
    if (lr)
      return (
        await hr(C, lr.result, !0, { replace: Se }),
        { shortCircuited: !0 }
      );
    if (((lr = uo(pr)), lr))
      return (
        _.add(lr.key),
        await hr(C, lr.result, !0, { replace: Se }),
        { shortCircuited: !0 }
      );
    let { loaderData: jn, errors: es } = ch(P, I, Zn, Ce, Wt, pr);
    je && P.errors && (es = { ...P.errors, ...es });
    let Yr = ln(),
      cn = bn(ee),
      $t = Yr || cn || Wt.length > 0;
    return {
      matches: I,
      loaderData: jn,
      errors: es,
      ...($t ? { fetchers: new Map(P.fetchers) } : {}),
    };
  }
  function Pt(C) {
    if (C && !dr(C[1])) return { [C[0]]: C[1].data };
    if (P.actionData)
      return Object.keys(P.actionData).length === 0 ? null : P.actionData;
  }
  function sn(C) {
    return (
      C.forEach((O) => {
        let I = P.fetchers.get(O.key),
          K = Aa(void 0, I ? I.data : void 0);
        P.fetchers.set(O.key, K);
      }),
      new Map(P.fetchers)
    );
  }
  async function Ur(C, O, I, K) {
    Vt(C);
    let se = (K && K.flushSync) === !0,
      ke = g || m,
      pe = Dc(P.location, P.matches, x, I, O, K?.relative),
      be = Hn(ke, pe, x),
      Se = ut(be, ke, pe);
    if ((Se.active && Se.matches && (be = Se.matches), !be)) {
      Tt(C, O, kr(404, { pathname: pe }), { flushSync: se });
      return;
    }
    let { path: je, submission: Ae, error: Ce } = th(!0, pe, K);
    if (Ce) {
      Tt(C, O, Ce, { flushSync: se });
      return;
    }
    let He = r.getContext ? await r.getContext() : new Kf(),
      Ue = (K && K.preventScrollReset) === !0;
    if (Ae && Dt(Ae.formMethod)) {
      await yt(
        C,
        O,
        je,
        be,
        He,
        Se.active,
        se,
        Ue,
        Ae,
        K && K.unstable_defaultShouldRevalidate,
      );
      return;
    }
    (W.set(C, { routeId: O, path: je }),
      await Er(C, O, je, be, He, Se.active, se, Ue, Ae));
  }
  async function yt(C, O, I, K, se, ke, pe, be, Se, je) {
    (an(), W.delete(C));
    let Ae = P.fetchers.get(C);
    Ct(C, cx(Se, Ae), { flushSync: pe });
    let Ce = new AbortController(),
      He = qs(r.history, I, Ce.signal, Se);
    if (ke) {
      let et = await ar(K, new URL(He.url).pathname, He.signal, C);
      if (et.type === "aborted") return;
      if (et.type === "error") {
        Tt(C, O, et.error, { flushSync: pe });
        return;
      } else if (et.matches) K = et.matches;
      else {
        Tt(C, O, kr(404, { pathname: I }), { flushSync: pe });
        return;
      }
    }
    let Ue = vo(K, I);
    if (!Ue.route.action && !Ue.route.lazy) {
      let et = kr(405, { method: Se.formMethod, pathname: I, routeId: O });
      Tt(C, O, et, { flushSync: pe });
      return;
    }
    V.set(C, Ce);
    let gt = ne,
      dt = Gs(d, f, He, K, Ue, i, se),
      bt = await Br(He, dt, se, C),
      Ye = bt[Ue.route.id];
    if (!Ye) {
      for (let et of dt)
        if (bt[et.route.id]) {
          Ye = bt[et.route.id];
          break;
        }
    }
    if (He.signal.aborted) {
      V.get(C) === Ce && V.delete(C);
      return;
    }
    if (q.has(C)) {
      if (gs(Ye) || dr(Ye)) {
        Ct(C, wn(void 0));
        return;
      }
    } else {
      if (gs(Ye))
        if ((V.delete(C), ee > gt)) {
          Ct(C, wn(void 0));
          return;
        } else
          return (
            _.add(C),
            Ct(C, Aa(Se)),
            hr(He, Ye, !1, { fetcherSubmission: Se, preventScrollReset: be })
          );
      if (dr(Ye)) {
        Tt(C, O, Ye.error);
        return;
      }
    }
    let Wt = P.navigation.location || P.location,
      Ge = qs(r.history, Wt, Ce.signal),
      Zn = g || m,
      pr =
        P.navigation.state !== "idle"
          ? Hn(Zn, P.navigation.location, x)
          : P.matches;
    $e(pr, "Didn't find any matches after fetcher action");
    let lr = ++ne;
    w.set(C, lr);
    let jn = Aa(Se, Ye.data);
    P.fetchers.set(C, jn);
    let { dsMatches: es, revalidatingFetchers: Yr } = rh(
      Ge,
      se,
      d,
      f,
      r.history,
      P,
      pr,
      Se,
      Wt,
      i,
      !1,
      Q,
      ue,
      q,
      W,
      _,
      Zn,
      x,
      r.patchRoutesOnNavigation != null,
      [Ue.route.id, Ye],
      je,
    );
    (Yr.filter((et) => et.key !== C).forEach((et) => {
      let dn = et.key,
        ts = P.fetchers.get(dn),
        rs = Aa(void 0, ts ? ts.data : void 0);
      (P.fetchers.set(dn, rs),
        Vt(dn),
        et.controller && V.set(dn, et.controller));
    }),
      qe({ fetchers: new Map(P.fetchers) }));
    let cn = () => Yr.forEach((et) => Vt(et.key));
    Ce.signal.addEventListener("abort", cn);
    let { loaderResults: $t, fetcherResults: Be } = await Hr(es, Yr, Ge, se);
    if (Ce.signal.aborted) return;
    if (
      (Ce.signal.removeEventListener("abort", cn),
      w.delete(C),
      V.delete(C),
      Yr.forEach((et) => V.delete(et.key)),
      P.fetchers.has(C))
    ) {
      let et = wn(Ye.data);
      P.fetchers.set(C, et);
    }
    let Qe = uo($t);
    if (Qe) return hr(Ge, Qe.result, !1, { preventScrollReset: be });
    if (((Qe = uo(Be)), Qe))
      return (_.add(Qe.key), hr(Ge, Qe.result, !1, { preventScrollReset: be }));
    let { loaderData: kn, errors: un } = ch(P, pr, $t, void 0, Yr, Be);
    (bn(lr),
      P.navigation.state === "loading" && lr > ee
        ? ($e(Y, "Expected pending action"),
          Le && Le.abort(),
          rr(P.navigation.location, {
            matches: pr,
            loaderData: kn,
            errors: un,
            fetchers: new Map(P.fetchers),
          }))
        : (qe({
            errors: un,
            loaderData: uh(P.loaderData, kn, pr, un),
            fetchers: new Map(P.fetchers),
          }),
          (Q = !1)));
  }
  async function Er(C, O, I, K, se, ke, pe, be, Se) {
    let je = P.fetchers.get(C);
    Ct(C, Aa(Se, je ? je.data : void 0), { flushSync: pe });
    let Ae = new AbortController(),
      Ce = qs(r.history, I, Ae.signal);
    if (ke) {
      let Ye = await ar(K, new URL(Ce.url).pathname, Ce.signal, C);
      if (Ye.type === "aborted") return;
      if (Ye.type === "error") {
        Tt(C, O, Ye.error, { flushSync: pe });
        return;
      } else if (Ye.matches) K = Ye.matches;
      else {
        Tt(C, O, kr(404, { pathname: I }), { flushSync: pe });
        return;
      }
    }
    let He = vo(K, I);
    V.set(C, Ae);
    let Ue = ne,
      gt = Gs(d, f, Ce, K, He, i, se),
      bt = (await Br(Ce, gt, se, C))[He.route.id];
    if ((V.get(C) === Ae && V.delete(C), !Ce.signal.aborted)) {
      if (q.has(C)) {
        Ct(C, wn(void 0));
        return;
      }
      if (gs(bt))
        if (ee > Ue) {
          Ct(C, wn(void 0));
          return;
        } else {
          (_.add(C), await hr(Ce, bt, !1, { preventScrollReset: be }));
          return;
        }
      if (dr(bt)) {
        Tt(C, O, bt.error);
        return;
      }
      Ct(C, wn(bt.data));
    }
  }
  async function hr(
    C,
    O,
    I,
    {
      submission: K,
      fetcherSubmission: se,
      preventScrollReset: ke,
      replace: pe,
    } = {},
  ) {
    (I || (oe?.resolve(), (oe = null)),
      O.response.headers.has("X-Remix-Revalidate") && (Q = !0));
    let be = O.response.headers.get("Location");
    ($e(be, "Expected a Location header on the redirect Response"),
      (be = oh(be, new URL(C.url), x, r.history)));
    let Se = Ha(P.location, be, { _isRedirect: !0 });
    if (l) {
      let gt = !1;
      if (O.response.headers.has("X-Remix-Reload-Document")) gt = !0;
      else if (Yc(be)) {
        const dt = Xh(be, !0);
        gt = dt.origin !== a.location.origin || Nr(dt.pathname, x) == null;
      }
      if (gt) {
        pe ? a.location.replace(be) : a.location.assign(be);
        return;
      }
    }
    Le = null;
    let je =
        pe === !0 || O.response.headers.has("X-Remix-Replace")
          ? "REPLACE"
          : "PUSH",
      { formMethod: Ae, formAction: Ce, formEncType: He } = P.navigation;
    !K && !se && Ae && Ce && He && (K = hh(P.navigation));
    let Ue = K || se;
    if (Ig.has(O.response.status) && Ue && Dt(Ue.formMethod))
      await nr(je, Se, {
        submission: { ...Ue, formAction: be },
        preventScrollReset: ke || ce,
        enableViewTransition: I ? de : void 0,
      });
    else {
      let gt = Sc(Se, K);
      await nr(je, Se, {
        overrideNavigation: gt,
        fetcherSubmission: se,
        preventScrollReset: ke || ce,
        enableViewTransition: I ? de : void 0,
      });
    }
  }
  async function Br(C, O, I, K) {
    let se,
      ke = {};
    try {
      se = await Gg(v, C, O, K, I, !1);
    } catch (pe) {
      return (
        O.filter((be) => be.shouldLoad).forEach((be) => {
          ke[be.route.id] = { type: "error", error: pe };
        }),
        ke
      );
    }
    if (C.signal.aborted) return ke;
    if (!Dt(C.method))
      for (let pe of O) {
        if (se[pe.route.id]?.type === "error") break;
        !se.hasOwnProperty(pe.route.id) &&
          !P.loaderData.hasOwnProperty(pe.route.id) &&
          (!P.errors || !P.errors.hasOwnProperty(pe.route.id)) &&
          pe.shouldCallHandler() &&
          (se[pe.route.id] = {
            type: "error",
            result: new Error(
              `No result returned from dataStrategy for route ${pe.route.id}`,
            ),
          });
      }
    for (let [pe, be] of Object.entries(se))
      if (sx(be)) {
        let Se = be.result;
        ke[pe] = { type: "redirect", response: Xg(Se, C, pe, O, x) };
      } else ke[pe] = await Jg(be);
    return ke;
  }
  async function Hr(C, O, I, K) {
    let se = Br(I, C, K, null),
      ke = Promise.all(
        O.map(async (Se) => {
          if (Se.matches && Se.match && Se.request && Se.controller) {
            let Ae = (await Br(Se.request, Se.matches, K, Se.key))[
              Se.match.route.id
            ];
            return { [Se.key]: Ae };
          } else
            return Promise.resolve({
              [Se.key]: {
                type: "error",
                error: kr(404, { pathname: Se.path }),
              },
            });
        }),
      ),
      pe = await se,
      be = (await ke).reduce((Se, je) => Object.assign(Se, je), {});
    return { loaderResults: pe, fetcherResults: be };
  }
  function an() {
    ((Q = !0),
      W.forEach((C, O) => {
        (V.has(O) && ue.add(O), Vt(O));
      }));
  }
  function Ct(C, O, I = {}) {
    (P.fetchers.set(C, O),
      qe(
        { fetchers: new Map(P.fetchers) },
        { flushSync: (I && I.flushSync) === !0 },
      ));
  }
  function Tt(C, O, I, K = {}) {
    let se = Vn(P.matches, O);
    (mr(C),
      qe(
        { errors: { [se.route.id]: I }, fetchers: new Map(P.fetchers) },
        { flushSync: (K && K.flushSync) === !0 },
      ));
  }
  function It(C) {
    return (
      Z.set(C, (Z.get(C) || 0) + 1),
      q.has(C) && q.delete(C),
      P.fetchers.get(C) || Fg
    );
  }
  function Vr(C, O) {
    (Vt(C, O?.reason), Ct(C, wn(null)));
  }
  function mr(C) {
    let O = P.fetchers.get(C);
    (V.has(C) && !(O && O.state === "loading" && w.has(C)) && Vt(C),
      W.delete(C),
      w.delete(C),
      _.delete(C),
      q.delete(C),
      ue.delete(C),
      P.fetchers.delete(C));
  }
  function ks(C) {
    let O = (Z.get(C) || 0) - 1;
    (O <= 0 ? (Z.delete(C), q.add(C)) : Z.set(C, O),
      qe({ fetchers: new Map(P.fetchers) }));
  }
  function Vt(C, O) {
    let I = V.get(C);
    I && (I.abort(O), V.delete(C));
  }
  function Jn(C) {
    for (let O of C) {
      let I = It(O),
        K = wn(I.data);
      P.fetchers.set(O, K);
    }
  }
  function ln() {
    let C = [],
      O = !1;
    for (let I of _) {
      let K = P.fetchers.get(I);
      ($e(K, `Expected fetcher: ${I}`),
        K.state === "loading" && (_.delete(I), C.push(I), (O = !0)));
    }
    return (Jn(C), O);
  }
  function bn(C) {
    let O = [];
    for (let [I, K] of w)
      if (K < C) {
        let se = P.fetchers.get(I);
        ($e(se, `Expected fetcher: ${I}`),
          se.state === "loading" && (Vt(I), w.delete(I), O.push(I)));
      }
    return (Jn(O), O.length > 0);
  }
  function on(C, O) {
    let I = P.blockers.get(C) || La;
    return (ie.get(C) !== O && ie.set(C, O), I);
  }
  function Ft(C) {
    (P.blockers.delete(C), ie.delete(C));
  }
  function Wr(C, O) {
    let I = P.blockers.get(C) || La;
    $e(
      (I.state === "unblocked" && O.state === "blocked") ||
        (I.state === "blocked" && O.state === "blocked") ||
        (I.state === "blocked" && O.state === "proceeding") ||
        (I.state === "blocked" && O.state === "unblocked") ||
        (I.state === "proceeding" && O.state === "unblocked"),
      `Invalid blocker state transition: ${I.state} -> ${O.state}`,
    );
    let K = new Map(P.blockers);
    (K.set(C, O), qe({ blockers: K }));
  }
  function Rr({ currentLocation: C, nextLocation: O, historyAction: I }) {
    if (ie.size === 0) return;
    ie.size > 1 && ht(!1, "A router only supports one blocker at a time");
    let K = Array.from(ie.entries()),
      [se, ke] = K[K.length - 1],
      pe = P.blockers.get(se);
    if (
      !(pe && pe.state === "proceeding") &&
      ke({ currentLocation: C, nextLocation: O, historyAction: I })
    )
      return se;
  }
  function sr(C) {
    let O = kr(404, { pathname: C }),
      I = g || m,
      { matches: K, route: se } = co(I);
    return { notFoundMatches: K, route: se, error: O };
  }
  function Xn(C, O, I) {
    if (((S = C), (j = O), (L = I || null), !E && P.navigation === Nc)) {
      E = !0;
      let K = it(P.location, P.matches);
      K != null && qe({ restoreScrollPosition: K });
    }
    return () => {
      ((S = null), (j = null), (L = null));
    };
  }
  function Me(C, O) {
    return (
      (L &&
        L(
          C,
          O.map((K) => dg(K, P.loaderData)),
        )) ||
      C.key
    );
  }
  function nt(C, O) {
    if (S && j) {
      let I = Me(C, O);
      S[I] = j();
    }
  }
  function it(C, O) {
    if (S) {
      let I = Me(C, O),
        K = S[I];
      if (typeof K == "number") return K;
    }
    return null;
  }
  function ut(C, O, I) {
    if (r.patchRoutesOnNavigation)
      if (C) {
        if (Object.keys(C[0].params).length > 0)
          return { active: !0, matches: Ua(O, I, x, !0) };
      } else return { active: !0, matches: Ua(O, I, x, !0) || [] };
    return { active: !1, matches: null };
  }
  async function ar(C, O, I, K) {
    if (!r.patchRoutesOnNavigation) return { type: "success", matches: C };
    let se = C;
    for (;;) {
      let ke = g == null,
        pe = g || m,
        be = f;
      try {
        await r.patchRoutesOnNavigation({
          signal: I,
          path: O,
          matches: se,
          fetcherKey: K,
          patch: (Ae, Ce) => {
            I.aborted || nh(Ae, Ce, pe, be, d, !1);
          },
        });
      } catch (Ae) {
        return { type: "error", error: Ae, partialMatches: se };
      } finally {
        ke && !I.aborted && (m = [...m]);
      }
      if (I.aborted) return { type: "aborted" };
      let Se = Hn(pe, O, x),
        je = null;
      if (Se) {
        if (Object.keys(Se[0].params).length === 0)
          return { type: "success", matches: Se };
        if (
          ((je = Ua(pe, O, x, !0)),
          !(je && se.length < je.length && st(se, je.slice(0, se.length))))
        )
          return { type: "success", matches: Se };
      }
      if ((je || (je = Ua(pe, O, x, !0)), !je || st(se, je)))
        return { type: "success", matches: null };
      se = je;
    }
  }
  function st(C, O) {
    return (
      C.length === O.length && C.every((I, K) => I.route.id === O[K].route.id)
    );
  }
  function pt(C) {
    ((f = {}), (g = Va(C, d, void 0, f)));
  }
  function qr(C, O, I = !1) {
    let K = g == null;
    (nh(C, O, g || m, f, d, I), K && ((m = [...m]), qe({})));
  }
  return (
    (U = {
      get basename() {
        return x;
      },
      get future() {
        return p;
      },
      get state() {
        return P;
      },
      get routes() {
        return m;
      },
      get window() {
        return a;
      },
      initialize: Ie,
      subscribe: Ht,
      enableScrollRestoration: Xn,
      navigate: $r,
      fetch: Ur,
      revalidate: js,
      createHref: (C) => r.history.createHref(C),
      encodeLocation: (C) => r.history.encodeLocation(C),
      getFetcher: It,
      resetFetcher: Vr,
      deleteFetcher: ks,
      dispose: rt,
      getBlocker: on,
      deleteBlocker: Ft,
      patchRoutes: qr,
      _internalFetchControllers: V,
      _internalSetRoutes: pt,
      _internalSetStateDoNotUseOrYouWillBreakYourApp(C) {
        qe(C);
      },
    }),
    r.unstable_instrumentations &&
      (U = Tg(
        U,
        r.unstable_instrumentations.map((C) => C.router).filter(Boolean),
      )),
    U
  );
}
function Bg(r) {
  return (
    r != null &&
    (("formData" in r && r.formData != null) ||
      ("body" in r && r.body !== void 0))
  );
}
function Dc(r, a, l, i, c, d) {
  let f, m;
  if (c) {
    f = [];
    for (let x of a)
      if ((f.push(x), x.route.id === c)) {
        m = x;
        break;
      }
  } else ((f = a), (m = a[a.length - 1]));
  let g = Kc(i || ".", Gc(f), Nr(r.pathname, l) || r.pathname, d === "path");
  if (
    (i == null && ((g.search = r.search), (g.hash = r.hash)),
    (i == null || i === "" || i === ".") && m)
  ) {
    let x = Xc(g.search);
    if (m.route.index && !x)
      g.search = g.search ? g.search.replace(/^\?/, "?index&") : "?index";
    else if (!m.route.index && x) {
      let v = new URLSearchParams(g.search),
        p = v.getAll("index");
      (v.delete("index"),
        p.filter((R) => R).forEach((R) => v.append("index", R)));
      let k = v.toString();
      g.search = k ? `?${k}` : "";
    }
  }
  return (
    l !== "/" && (g.pathname = Ng({ basename: l, pathname: g.pathname })),
    nn(g)
  );
}
function th(r, a, l) {
  if (!l || !Bg(l)) return { path: a };
  if (l.formMethod && !ox(l.formMethod))
    return { path: a, error: kr(405, { method: l.formMethod }) };
  let i = () => ({ path: a, error: kr(400, { type: "invalid-body" }) }),
    d = (l.formMethod || "get").toUpperCase(),
    f = pm(a);
  if (l.body !== void 0) {
    if (l.formEncType === "text/plain") {
      if (!Dt(d)) return i();
      let p =
        typeof l.body == "string"
          ? l.body
          : l.body instanceof FormData || l.body instanceof URLSearchParams
            ? Array.from(l.body.entries()).reduce(
                (k, [R, S]) => `${k}${R}=${S}
`,
                "",
              )
            : String(l.body);
      return {
        path: a,
        submission: {
          formMethod: d,
          formAction: f,
          formEncType: l.formEncType,
          formData: void 0,
          json: void 0,
          text: p,
        },
      };
    } else if (l.formEncType === "application/json") {
      if (!Dt(d)) return i();
      try {
        let p = typeof l.body == "string" ? JSON.parse(l.body) : l.body;
        return {
          path: a,
          submission: {
            formMethod: d,
            formAction: f,
            formEncType: l.formEncType,
            formData: void 0,
            json: p,
            text: void 0,
          },
        };
      } catch {
        return i();
      }
    }
  }
  $e(
    typeof FormData == "function",
    "FormData is not available in this environment",
  );
  let m, g;
  if (l.formData) ((m = Ic(l.formData)), (g = l.formData));
  else if (l.body instanceof FormData) ((m = Ic(l.body)), (g = l.body));
  else if (l.body instanceof URLSearchParams) ((m = l.body), (g = ih(m)));
  else if (l.body == null) ((m = new URLSearchParams()), (g = new FormData()));
  else
    try {
      ((m = new URLSearchParams(l.body)), (g = ih(m)));
    } catch {
      return i();
    }
  let x = {
    formMethod: d,
    formAction: f,
    formEncType: (l && l.formEncType) || "application/x-www-form-urlencoded",
    formData: g,
    json: void 0,
    text: void 0,
  };
  if (Dt(x.formMethod)) return { path: a, submission: x };
  let v = Gn(a);
  return (
    r && v.search && Xc(v.search) && m.append("index", ""),
    (v.search = `?${m}`),
    { path: nn(v), submission: x }
  );
}
function rh(r, a, l, i, c, d, f, m, g, x, v, p, k, R, S, L, j, E, D, H, G) {
  let F = H ? (dr(H[1]) ? H[1].error : H[1].data) : void 0,
    U = c.createURL(d.location),
    P = c.createURL(g),
    Y;
  if (v && d.errors) {
    let me = Object.keys(d.errors)[0];
    Y = f.findIndex((Q) => Q.route.id === me);
  } else if (H && dr(H[1])) {
    let me = H[0];
    Y = f.findIndex((Q) => Q.route.id === me) - 1;
  }
  let oe = H ? H[1].statusCode : void 0,
    ce = oe && oe >= 400,
    Le = {
      currentUrl: U,
      currentParams: d.matches[0]?.params || {},
      nextUrl: P,
      nextParams: f[0].params,
      ...m,
      actionResult: F,
      actionStatus: oe,
    },
    de = Qa(f),
    Re = f.map((me, Q) => {
      let { route: ue } = me,
        V = null;
      if (
        (Y != null && Q > Y
          ? (V = !1)
          : ue.lazy
            ? (V = !0)
            : Qc(ue)
              ? v
                ? (V = Mc(ue, d.loaderData, d.errors))
                : Hg(d.loaderData, d.matches[Q], me) && (V = !0)
              : (V = !1),
        V !== null)
      )
        return zc(l, i, r, de, me, x, a, V);
      let ne = !1;
      typeof G == "boolean"
        ? (ne = G)
        : ce
          ? (ne = !1)
          : (p ||
              U.pathname + U.search === P.pathname + P.search ||
              U.search !== P.search ||
              Vg(d.matches[Q], me)) &&
            (ne = !0);
      let ee = { ...Le, defaultShouldRevalidate: ne },
        w = Ba(me, ee);
      return zc(l, i, r, de, me, x, a, w, ee, G);
    }),
    ve = [];
  return (
    S.forEach((me, Q) => {
      if (v || !f.some((Z) => Z.route.id === me.routeId) || R.has(Q)) return;
      let ue = d.fetchers.get(Q),
        V = ue && ue.state !== "idle" && ue.data === void 0,
        ne = Hn(j, me.path, E);
      if (!ne) {
        if (D && V) return;
        ve.push({
          key: Q,
          routeId: me.routeId,
          path: me.path,
          matches: null,
          match: null,
          request: null,
          controller: null,
        });
        return;
      }
      if (L.has(Q)) return;
      let ee = vo(ne, me.path),
        w = new AbortController(),
        _ = qs(c, me.path, w.signal),
        W = null;
      if (k.has(Q)) (k.delete(Q), (W = Gs(l, i, _, ne, ee, x, a)));
      else if (V) p && (W = Gs(l, i, _, ne, ee, x, a));
      else {
        let Z;
        typeof G == "boolean" ? (Z = G) : ce ? (Z = !1) : (Z = p);
        let q = { ...Le, defaultShouldRevalidate: Z };
        Ba(ee, q) && (W = Gs(l, i, _, ne, ee, x, a, q));
      }
      W &&
        ve.push({
          key: Q,
          routeId: me.routeId,
          path: me.path,
          matches: W,
          match: ee,
          request: _,
          controller: w,
        });
    }),
    { dsMatches: Re, revalidatingFetchers: ve }
  );
}
function Qc(r) {
  return r.loader != null || (r.middleware != null && r.middleware.length > 0);
}
function Mc(r, a, l) {
  if (r.lazy) return !0;
  if (!Qc(r)) return !1;
  let i = a != null && r.id in a,
    c = l != null && l[r.id] !== void 0;
  return !i && c
    ? !1
    : typeof r.loader == "function" && r.loader.hydrate === !0
      ? !0
      : !i && !c;
}
function Hg(r, a, l) {
  let i = !a || l.route.id !== a.route.id,
    c = !r.hasOwnProperty(l.route.id);
  return i || c;
}
function Vg(r, a) {
  let l = r.route.path;
  return (
    r.pathname !== a.pathname ||
    (l != null && l.endsWith("*") && r.params["*"] !== a.params["*"])
  );
}
function Ba(r, a) {
  if (r.route.shouldRevalidate) {
    let l = r.route.shouldRevalidate(a);
    if (typeof l == "boolean") return l;
  }
  return a.defaultShouldRevalidate;
}
function nh(r, a, l, i, c, d) {
  let f;
  if (r) {
    let x = i[r];
    ($e(x, `No route found to patch children into: routeId = ${r}`),
      x.children || (x.children = []),
      (f = x.children));
  } else f = l;
  let m = [],
    g = [];
  if (
    (a.forEach((x) => {
      let v = f.find((p) => um(x, p));
      v ? g.push({ existingRoute: v, newRoute: x }) : m.push(x);
    }),
    m.length > 0)
  ) {
    let x = Va(m, c, [r || "_", "patch", String(f?.length || "0")], i);
    f.push(...x);
  }
  if (d && g.length > 0)
    for (let x = 0; x < g.length; x++) {
      let { existingRoute: v, newRoute: p } = g[x],
        k = v,
        [R] = Va([p], c, [], {}, !0);
      Object.assign(k, {
        element: R.element ? R.element : k.element,
        errorElement: R.errorElement ? R.errorElement : k.errorElement,
        hydrateFallbackElement: R.hydrateFallbackElement
          ? R.hydrateFallbackElement
          : k.hydrateFallbackElement,
      });
    }
}
function um(r, a) {
  return "id" in r && "id" in a && r.id === a.id
    ? !0
    : r.index === a.index &&
        r.path === a.path &&
        r.caseSensitive === a.caseSensitive
      ? (!r.children || r.children.length === 0) &&
        (!a.children || a.children.length === 0)
        ? !0
        : r.children.every((l, i) => a.children?.some((c) => um(l, c)))
      : !1;
}
var sh = new WeakMap(),
  dm = ({ key: r, route: a, manifest: l, mapRouteProperties: i }) => {
    let c = l[a.id];
    if (
      ($e(c, "No route found in manifest"),
      !c.lazy || typeof c.lazy != "object")
    )
      return;
    let d = c.lazy[r];
    if (!d) return;
    let f = sh.get(c);
    f || ((f = {}), sh.set(c, f));
    let m = f[r];
    if (m) return m;
    let g = (async () => {
      let x = og(r),
        p = c[r] !== void 0 && r !== "hasErrorBoundary";
      if (x)
        (ht(
          !x,
          "Route property " +
            r +
            " is not a supported lazy route property. This property will be ignored.",
        ),
          (f[r] = Promise.resolve()));
      else if (p)
        ht(
          !1,
          `Route "${c.id}" has a static property "${r}" defined. The lazy property will be ignored.`,
        );
      else {
        let k = await d();
        k != null && (Object.assign(c, { [r]: k }), Object.assign(c, i(c)));
      }
      typeof c.lazy == "object" &&
        ((c.lazy[r] = void 0),
        Object.values(c.lazy).every((k) => k === void 0) && (c.lazy = void 0));
    })();
    return ((f[r] = g), g);
  },
  ah = new WeakMap();
function Wg(r, a, l, i, c) {
  let d = l[r.id];
  if (($e(d, "No route found in manifest"), !r.lazy))
    return { lazyRoutePromise: void 0, lazyHandlerPromise: void 0 };
  if (typeof r.lazy == "function") {
    let v = ah.get(d);
    if (v) return { lazyRoutePromise: v, lazyHandlerPromise: v };
    let p = (async () => {
      $e(typeof r.lazy == "function", "No lazy route function found");
      let k = await r.lazy(),
        R = {};
      for (let S in k) {
        let L = k[S];
        if (L === void 0) continue;
        let j = cg(S),
          D = d[S] !== void 0 && S !== "hasErrorBoundary";
        j
          ? ht(
              !j,
              "Route property " +
                S +
                " is not a supported property to be returned from a lazy route function. This property will be ignored.",
            )
          : D
            ? ht(
                !D,
                `Route "${d.id}" has a static property "${S}" defined but its lazy function is also returning a value for this property. The lazy route property "${S}" will be ignored.`,
              )
            : (R[S] = L);
      }
      (Object.assign(d, R), Object.assign(d, { ...i(d), lazy: void 0 }));
    })();
    return (
      ah.set(d, p),
      p.catch(() => {}),
      { lazyRoutePromise: p, lazyHandlerPromise: p }
    );
  }
  let f = Object.keys(r.lazy),
    m = [],
    g;
  for (let v of f) {
    if (c && c.includes(v)) continue;
    let p = dm({ key: v, route: r, manifest: l, mapRouteProperties: i });
    p && (m.push(p), v === a && (g = p));
  }
  let x = m.length > 0 ? Promise.all(m).then(() => {}) : void 0;
  return (
    x?.catch(() => {}),
    g?.catch(() => {}),
    { lazyRoutePromise: x, lazyHandlerPromise: g }
  );
}
async function lh(r) {
  let a = r.matches.filter((c) => c.shouldLoad),
    l = {};
  return (
    (await Promise.all(a.map((c) => c.resolve()))).forEach((c, d) => {
      l[a[d].route.id] = c;
    }),
    l
  );
}
async function qg(r) {
  return r.matches.some((a) => a.route.middleware) ? fm(r, () => lh(r)) : lh(r);
}
function fm(r, a) {
  return Yg(
    r,
    a,
    (i) => {
      if (lx(i)) throw i;
      return i;
    },
    rx,
    l,
  );
  function l(i, c, d) {
    if (d)
      return Promise.resolve(
        Object.assign(d.value, { [c]: { type: "error", result: i } }),
      );
    {
      let { matches: f } = r,
        m = Math.min(
          Math.max(
            f.findIndex((x) => x.route.id === c),
            0,
          ),
          Math.max(
            f.findIndex((x) => x.shouldCallHandler()),
            0,
          ),
        ),
        g = Vn(f, f[m].route.id).route.id;
      return Promise.resolve({ [g]: { type: "error", result: i } });
    }
  }
}
async function Yg(r, a, l, i, c) {
  let {
      matches: d,
      request: f,
      params: m,
      context: g,
      unstable_pattern: x,
    } = r,
    v = d.flatMap((k) =>
      k.route.middleware ? k.route.middleware.map((R) => [k.route.id, R]) : [],
    );
  return await hm(
    { request: f, params: m, context: g, unstable_pattern: x },
    v,
    a,
    l,
    i,
    c,
  );
}
async function hm(r, a, l, i, c, d, f = 0) {
  let { request: m } = r;
  if (m.signal.aborted)
    throw m.signal.reason ?? new Error(`Request aborted: ${m.method} ${m.url}`);
  let g = a[f];
  if (!g) return await l();
  let [x, v] = g,
    p,
    k = async () => {
      if (p) throw new Error("You may only call `next()` once per middleware");
      try {
        return ((p = { value: await hm(r, a, l, i, c, d, f + 1) }), p.value);
      } catch (R) {
        return ((p = { value: await d(R, x, p) }), p.value);
      }
    };
  try {
    let R = await v(r, k),
      S = R != null ? i(R) : void 0;
    return c(S)
      ? S
      : p
        ? (S ?? p.value)
        : ((p = { value: await k() }), p.value);
  } catch (R) {
    return await d(R, x, p);
  }
}
function mm(r, a, l, i, c) {
  let d = dm({
      key: "middleware",
      route: i.route,
      manifest: a,
      mapRouteProperties: r,
    }),
    f = Wg(i.route, Dt(l.method) ? "action" : "loader", a, r, c);
  return {
    middleware: d,
    route: f.lazyRoutePromise,
    handler: f.lazyHandlerPromise,
  };
}
function zc(r, a, l, i, c, d, f, m, g = null, x) {
  let v = !1,
    p = mm(r, a, l, c, d);
  return {
    ...c,
    _lazyPromises: p,
    shouldLoad: m,
    shouldRevalidateArgs: g,
    shouldCallHandler(k) {
      return (
        (v = !0),
        g
          ? typeof x == "boolean"
            ? Ba(c, { ...g, defaultShouldRevalidate: x })
            : typeof k == "boolean"
              ? Ba(c, { ...g, defaultShouldRevalidate: k })
              : Ba(c, g)
          : m
      );
    },
    resolve(k) {
      let { lazy: R, loader: S, middleware: L } = c.route,
        j = v || m || (k && !Dt(l.method) && (R || S)),
        E = L && L.length > 0 && !S && !R;
      return j && (Dt(l.method) || !E)
        ? Kg({
            request: l,
            unstable_pattern: i,
            match: c,
            lazyHandlerPromise: p?.handler,
            lazyRoutePromise: p?.route,
            handlerOverride: k,
            scopedContext: f,
          })
        : Promise.resolve({ type: "data", result: void 0 });
    },
  };
}
function Gs(r, a, l, i, c, d, f, m = null) {
  return i.map((g) =>
    g.route.id !== c.route.id
      ? {
          ...g,
          shouldLoad: !1,
          shouldRevalidateArgs: m,
          shouldCallHandler: () => !1,
          _lazyPromises: mm(r, a, l, g, d),
          resolve: () => Promise.resolve({ type: "data", result: void 0 }),
        }
      : zc(r, a, l, Qa(i), g, d, f, !0, m),
  );
}
async function Gg(r, a, l, i, c, d) {
  l.some((x) => x._lazyPromises?.middleware) &&
    (await Promise.all(l.map((x) => x._lazyPromises?.middleware)));
  let f = {
      request: a,
      unstable_pattern: Qa(l),
      params: l[0].params,
      context: c,
      matches: l,
    },
    g = await r({
      ...f,
      fetcherKey: i,
      runClientMiddleware: (x) => {
        let v = f;
        return fm(v, () =>
          x({
            ...v,
            fetcherKey: i,
            runClientMiddleware: () => {
              throw new Error(
                "Cannot call `runClientMiddleware()` from within an `runClientMiddleware` handler",
              );
            },
          }),
        );
      },
    });
  try {
    await Promise.all(
      l.flatMap((x) => [x._lazyPromises?.handler, x._lazyPromises?.route]),
    );
  } catch {}
  return g;
}
async function Kg({
  request: r,
  unstable_pattern: a,
  match: l,
  lazyHandlerPromise: i,
  lazyRoutePromise: c,
  handlerOverride: d,
  scopedContext: f,
}) {
  let m,
    g,
    x = Dt(r.method),
    v = x ? "action" : "loader",
    p = (k) => {
      let R,
        S = new Promise((E, D) => (R = D));
      ((g = () => R()), r.signal.addEventListener("abort", g));
      let L = (E) =>
          typeof k != "function"
            ? Promise.reject(
                new Error(
                  `You cannot call the handler for a route which defines a boolean "${v}" [routeId: ${l.route.id}]`,
                ),
              )
            : k(
                {
                  request: r,
                  unstable_pattern: a,
                  params: l.params,
                  context: f,
                },
                ...(E !== void 0 ? [E] : []),
              ),
        j = (async () => {
          try {
            return { type: "data", result: await (d ? d((D) => L(D)) : L()) };
          } catch (E) {
            return { type: "error", result: E };
          }
        })();
      return Promise.race([j, S]);
    };
  try {
    let k = x ? l.route.action : l.route.loader;
    if (i || c)
      if (k) {
        let R,
          [S] = await Promise.all([
            p(k).catch((L) => {
              R = L;
            }),
            i,
            c,
          ]);
        if (R !== void 0) throw R;
        m = S;
      } else {
        await i;
        let R = x ? l.route.action : l.route.loader;
        if (R) [m] = await Promise.all([p(R), c]);
        else if (v === "action") {
          let S = new URL(r.url),
            L = S.pathname + S.search;
          throw kr(405, { method: r.method, pathname: L, routeId: l.route.id });
        } else return { type: "data", result: void 0 };
      }
    else if (k) m = await p(k);
    else {
      let R = new URL(r.url),
        S = R.pathname + R.search;
      throw kr(404, { pathname: S });
    }
  } catch (k) {
    return { type: "error", result: k };
  } finally {
    g && r.signal.removeEventListener("abort", g);
  }
  return m;
}
async function Qg(r) {
  let a = r.headers.get("Content-Type");
  return a && /\bapplication\/json\b/.test(a)
    ? r.body == null
      ? null
      : r.json()
    : r.text();
}
async function Jg(r) {
  let { result: a, type: l } = r;
  if (Jc(a)) {
    let i;
    try {
      i = await Qg(a);
    } catch (c) {
      return { type: "error", error: c };
    }
    return l === "error"
      ? {
          type: "error",
          error: new Ka(a.status, a.statusText, i),
          statusCode: a.status,
          headers: a.headers,
        }
      : { type: "data", data: i, statusCode: a.status, headers: a.headers };
  }
  return l === "error"
    ? fh(a)
      ? a.data instanceof Error
        ? {
            type: "error",
            error: a.data,
            statusCode: a.init?.status,
            headers: a.init?.headers ? new Headers(a.init.headers) : void 0,
          }
        : {
            type: "error",
            error: tx(a),
            statusCode: Wa(a) ? a.status : void 0,
            headers: a.init?.headers ? new Headers(a.init.headers) : void 0,
          }
      : { type: "error", error: a, statusCode: Wa(a) ? a.status : void 0 }
    : fh(a)
      ? {
          type: "data",
          data: a.data,
          statusCode: a.init?.status,
          headers: a.init?.headers ? new Headers(a.init.headers) : void 0,
        }
      : { type: "data", data: a };
}
function Xg(r, a, l, i, c) {
  let d = r.headers.get("Location");
  if (
    ($e(
      d,
      "Redirects returned/thrown from loaders/actions must have a Location header",
    ),
    !Yc(d))
  ) {
    let f = i.slice(0, i.findIndex((m) => m.route.id === l) + 1);
    ((d = Dc(new URL(a.url), f, c, d)), r.headers.set("Location", d));
  }
  return r;
}
function oh(r, a, l, i) {
  let c = [
    "about:",
    "blob:",
    "chrome:",
    "chrome-untrusted:",
    "content:",
    "data:",
    "devtools:",
    "file:",
    "filesystem:",
    "javascript:",
  ];
  if (Yc(r)) {
    let d = r,
      f = d.startsWith("//") ? new URL(a.protocol + d) : new URL(d);
    if (c.includes(f.protocol)) throw new Error("Invalid redirect location");
    let m = Nr(f.pathname, l) != null;
    if (f.origin === a.origin && m) return f.pathname + f.search + f.hash;
  }
  try {
    let d = i.createURL(r);
    if (c.includes(d.protocol)) throw new Error("Invalid redirect location");
  } catch {}
  return r;
}
function qs(r, a, l, i) {
  let c = r.createURL(pm(a)).toString(),
    d = { signal: l };
  if (i && Dt(i.formMethod)) {
    let { formMethod: f, formEncType: m } = i;
    ((d.method = f.toUpperCase()),
      m === "application/json"
        ? ((d.headers = new Headers({ "Content-Type": m })),
          (d.body = JSON.stringify(i.json)))
        : m === "text/plain"
          ? (d.body = i.text)
          : m === "application/x-www-form-urlencoded" && i.formData
            ? (d.body = Ic(i.formData))
            : (d.body = i.formData));
  }
  return new Request(c, d);
}
function Ic(r) {
  let a = new URLSearchParams();
  for (let [l, i] of r.entries())
    a.append(l, typeof i == "string" ? i : i.name);
  return a;
}
function ih(r) {
  let a = new FormData();
  for (let [l, i] of r.entries()) a.append(l, i);
  return a;
}
function Zg(r, a, l, i = !1, c = !1) {
  let d = {},
    f = null,
    m,
    g = !1,
    x = {},
    v = l && dr(l[1]) ? l[1].error : void 0;
  return (
    r.forEach((p) => {
      if (!(p.route.id in a)) return;
      let k = p.route.id,
        R = a[k];
      if (
        ($e(!gs(R), "Cannot handle redirect results in processLoaderData"),
        dr(R))
      ) {
        let S = R.error;
        if ((v !== void 0 && ((S = v), (v = void 0)), (f = f || {}), c))
          f[k] = S;
        else {
          let L = Vn(r, k);
          f[L.route.id] == null && (f[L.route.id] = S);
        }
        (i || (d[k] = cm),
          g || ((g = !0), (m = Wa(R.error) ? R.error.status : 500)),
          R.headers && (x[k] = R.headers));
      } else
        ((d[k] = R.data),
          R.statusCode && R.statusCode !== 200 && !g && (m = R.statusCode),
          R.headers && (x[k] = R.headers));
    }),
    v !== void 0 && l && ((f = { [l[0]]: v }), l[2] && (d[l[2]] = void 0)),
    { loaderData: d, errors: f, statusCode: m || 200, loaderHeaders: x }
  );
}
function ch(r, a, l, i, c, d) {
  let { loaderData: f, errors: m } = Zg(a, l, i);
  return (
    c
      .filter((g) => !g.matches || g.matches.some((x) => x.shouldLoad))
      .forEach((g) => {
        let { key: x, match: v, controller: p } = g;
        if (p && p.signal.aborted) return;
        let k = d[x];
        if (($e(k, "Did not find corresponding fetcher result"), dr(k))) {
          let R = Vn(r.matches, v?.route.id);
          ((m && m[R.route.id]) || (m = { ...m, [R.route.id]: k.error }),
            r.fetchers.delete(x));
        } else if (gs(k)) $e(!1, "Unhandled fetcher revalidation redirect");
        else {
          let R = wn(k.data);
          r.fetchers.set(x, R);
        }
      }),
    { loaderData: f, errors: m }
  );
}
function uh(r, a, l, i) {
  let c = Object.entries(a)
    .filter(([, d]) => d !== cm)
    .reduce((d, [f, m]) => ((d[f] = m), d), {});
  for (let d of l) {
    let f = d.route.id;
    if (
      (!a.hasOwnProperty(f) &&
        r.hasOwnProperty(f) &&
        d.route.loader &&
        (c[f] = r[f]),
      i && i.hasOwnProperty(f))
    )
      break;
  }
  return c;
}
function dh(r) {
  return r
    ? dr(r[1])
      ? { actionData: {} }
      : { actionData: { [r[0]]: r[1].data } }
    : {};
}
function Vn(r, a) {
  return (
    (a ? r.slice(0, r.findIndex((i) => i.route.id === a) + 1) : [...r])
      .reverse()
      .find((i) => i.route.hasErrorBoundary === !0) || r[0]
  );
}
function co(r) {
  let a =
    r.length === 1
      ? r[0]
      : r.find((l) => l.index || !l.path || l.path === "/") || {
          id: "__shim-error-route__",
        };
  return {
    matches: [{ params: {}, pathname: "", pathnameBase: "", route: a }],
    route: a,
  };
}
function kr(
  r,
  { pathname: a, routeId: l, method: i, type: c, message: d } = {},
) {
  let f = "Unknown Server Error",
    m = "Unknown @remix-run/router error";
  return (
    r === 400
      ? ((f = "Bad Request"),
        i && a && l
          ? (m = `You made a ${i} request to "${a}" but did not provide a \`loader\` for route "${l}", so there is no way to handle the request.`)
          : c === "invalid-body" && (m = "Unable to encode submission body"))
      : r === 403
        ? ((f = "Forbidden"), (m = `Route "${l}" does not match URL "${a}"`))
        : r === 404
          ? ((f = "Not Found"), (m = `No route matches URL "${a}"`))
          : r === 405 &&
            ((f = "Method Not Allowed"),
            i && a && l
              ? (m = `You made a ${i.toUpperCase()} request to "${a}" but did not provide an \`action\` for route "${l}", so there is no way to handle the request.`)
              : i && (m = `Invalid request method "${i.toUpperCase()}"`)),
    new Ka(r || 500, f, new Error(m), !0)
  );
}
function uo(r) {
  let a = Object.entries(r);
  for (let l = a.length - 1; l >= 0; l--) {
    let [i, c] = a[l];
    if (gs(c)) return { key: i, result: c };
  }
}
function pm(r) {
  let a = typeof r == "string" ? Gn(r) : r;
  return nn({ ...a, hash: "" });
}
function ex(r, a) {
  return r.pathname !== a.pathname || r.search !== a.search
    ? !1
    : r.hash === ""
      ? a.hash !== ""
      : r.hash === a.hash
        ? !0
        : a.hash !== "";
}
function tx(r) {
  return new Ka(
    r.init?.status ?? 500,
    r.init?.statusText ?? "Internal Server Error",
    r.data,
  );
}
function rx(r) {
  return (
    r != null &&
    typeof r == "object" &&
    Object.entries(r).every(([a, l]) => typeof a == "string" && nx(l))
  );
}
function nx(r) {
  return (
    r != null &&
    typeof r == "object" &&
    "type" in r &&
    "result" in r &&
    (r.type === "data" || r.type === "error")
  );
}
function sx(r) {
  return Jc(r.result) && om.has(r.result.status);
}
function dr(r) {
  return r.type === "error";
}
function gs(r) {
  return (r && r.type) === "redirect";
}
function fh(r) {
  return (
    typeof r == "object" &&
    r != null &&
    "type" in r &&
    "data" in r &&
    "init" in r &&
    r.type === "DataWithResponseInit"
  );
}
function Jc(r) {
  return (
    r != null &&
    typeof r.status == "number" &&
    typeof r.statusText == "string" &&
    typeof r.headers == "object" &&
    typeof r.body < "u"
  );
}
function ax(r) {
  return om.has(r);
}
function lx(r) {
  return Jc(r) && ax(r.status) && r.headers.has("Location");
}
function ox(r) {
  return zg.has(r.toUpperCase());
}
function Dt(r) {
  return Dg.has(r.toUpperCase());
}
function Xc(r) {
  return new URLSearchParams(r).getAll("index").some((a) => a === "");
}
function vo(r, a) {
  let l = typeof a == "string" ? Gn(a).search : a.search;
  if (r[r.length - 1].route.index && Xc(l || "")) return r[r.length - 1];
  let i = rm(r);
  return i[i.length - 1];
}
function hh(r) {
  let {
    formMethod: a,
    formAction: l,
    formEncType: i,
    text: c,
    formData: d,
    json: f,
  } = r;
  if (!(!a || !l || !i)) {
    if (c != null)
      return {
        formMethod: a,
        formAction: l,
        formEncType: i,
        formData: void 0,
        json: void 0,
        text: c,
      };
    if (d != null)
      return {
        formMethod: a,
        formAction: l,
        formEncType: i,
        formData: d,
        json: void 0,
        text: void 0,
      };
    if (f !== void 0)
      return {
        formMethod: a,
        formAction: l,
        formEncType: i,
        formData: void 0,
        json: f,
        text: void 0,
      };
  }
}
function Sc(r, a) {
  return a
    ? {
        state: "loading",
        location: r,
        formMethod: a.formMethod,
        formAction: a.formAction,
        formEncType: a.formEncType,
        formData: a.formData,
        json: a.json,
        text: a.text,
      }
    : {
        state: "loading",
        location: r,
        formMethod: void 0,
        formAction: void 0,
        formEncType: void 0,
        formData: void 0,
        json: void 0,
        text: void 0,
      };
}
function ix(r, a) {
  return {
    state: "submitting",
    location: r,
    formMethod: a.formMethod,
    formAction: a.formAction,
    formEncType: a.formEncType,
    formData: a.formData,
    json: a.json,
    text: a.text,
  };
}
function Aa(r, a) {
  return r
    ? {
        state: "loading",
        formMethod: r.formMethod,
        formAction: r.formAction,
        formEncType: r.formEncType,
        formData: r.formData,
        json: r.json,
        text: r.text,
        data: a,
      }
    : {
        state: "loading",
        formMethod: void 0,
        formAction: void 0,
        formEncType: void 0,
        formData: void 0,
        json: void 0,
        text: void 0,
        data: a,
      };
}
function cx(r, a) {
  return {
    state: "submitting",
    formMethod: r.formMethod,
    formAction: r.formAction,
    formEncType: r.formEncType,
    formData: r.formData,
    json: r.json,
    text: r.text,
    data: a ? a.data : void 0,
  };
}
function wn(r) {
  return {
    state: "idle",
    formMethod: void 0,
    formAction: void 0,
    formEncType: void 0,
    formData: void 0,
    json: void 0,
    text: void 0,
    data: r,
  };
}
function ux(r, a) {
  try {
    let l = r.sessionStorage.getItem(im);
    if (l) {
      let i = JSON.parse(l);
      for (let [c, d] of Object.entries(i || {}))
        d && Array.isArray(d) && a.set(c, new Set(d || []));
    }
  } catch {}
}
function dx(r, a) {
  if (a.size > 0) {
    let l = {};
    for (let [i, c] of a) l[i] = [...c];
    try {
      r.sessionStorage.setItem(im, JSON.stringify(l));
    } catch (i) {
      ht(
        !1,
        `Failed to save applied view transitions in sessionStorage (${i}).`,
      );
    }
  }
}
function mh() {
  let r,
    a,
    l = new Promise((i, c) => {
      ((r = async (d) => {
        i(d);
        try {
          await l;
        } catch {}
      }),
        (a = async (d) => {
          c(d);
          try {
            await l;
          } catch {}
        }));
    });
  return { promise: l, resolve: r, reject: a };
}
var ws = b.createContext(null);
ws.displayName = "DataRouter";
var Ja = b.createContext(null);
Ja.displayName = "DataRouterState";
var gm = b.createContext(!1);
function fx() {
  return b.useContext(gm);
}
var Zc = b.createContext({ isTransitioning: !1 });
Zc.displayName = "ViewTransition";
var xm = b.createContext(new Map());
xm.displayName = "Fetchers";
var hx = b.createContext(null);
hx.displayName = "Await";
var Sr = b.createContext(null);
Sr.displayName = "Navigation";
var _o = b.createContext(null);
_o.displayName = "Location";
var zr = b.createContext({ outlet: null, matches: [], isDataRoute: !1 });
zr.displayName = "Route";
var eu = b.createContext(null);
eu.displayName = "RouteError";
var ym = "REACT_ROUTER_ERROR",
  mx = "REDIRECT",
  px = "ROUTE_ERROR_RESPONSE";
function gx(r) {
  if (r.startsWith(`${ym}:${mx}:{`))
    try {
      let a = JSON.parse(r.slice(28));
      if (
        typeof a == "object" &&
        a &&
        typeof a.status == "number" &&
        typeof a.statusText == "string" &&
        typeof a.location == "string" &&
        typeof a.reloadDocument == "boolean" &&
        typeof a.replace == "boolean"
      )
        return a;
    } catch {}
}
function xx(r) {
  if (r.startsWith(`${ym}:${px}:{`))
    try {
      let a = JSON.parse(r.slice(40));
      if (
        typeof a == "object" &&
        a &&
        typeof a.status == "number" &&
        typeof a.statusText == "string"
      )
        return new Ka(a.status, a.statusText, a.data);
    } catch {}
}
function yx(r, { relative: a } = {}) {
  $e(
    Xa(),
    "useHref() may be used only in the context of a <Router> component.",
  );
  let { basename: l, navigator: i } = b.useContext(Sr),
    { hash: c, pathname: d, search: f } = Za(r, { relative: a }),
    m = d;
  return (
    l !== "/" && (m = d === "/" ? l : en([l, d])),
    i.createHref({ pathname: m, search: f, hash: c })
  );
}
function Xa() {
  return b.useContext(_o) != null;
}
function Ir() {
  return (
    $e(
      Xa(),
      "useLocation() may be used only in the context of a <Router> component.",
    ),
    b.useContext(_o).location
  );
}
var vm =
  "You should call navigate() in a React.useEffect(), not when your component is first rendered.";
function wm(r) {
  b.useContext(Sr).static || b.useLayoutEffect(r);
}
function zt() {
  let { isDataRoute: r } = b.useContext(zr);
  return r ? Ax() : vx();
}
function vx() {
  $e(
    Xa(),
    "useNavigate() may be used only in the context of a <Router> component.",
  );
  let r = b.useContext(ws),
    { basename: a, navigator: l } = b.useContext(Sr),
    { matches: i } = b.useContext(zr),
    { pathname: c } = Ir(),
    d = JSON.stringify(Gc(i)),
    f = b.useRef(!1);
  return (
    wm(() => {
      f.current = !0;
    }),
    b.useCallback(
      (g, x = {}) => {
        if ((ht(f.current, vm), !f.current)) return;
        if (typeof g == "number") {
          l.go(g);
          return;
        }
        let v = Kc(g, JSON.parse(d), c, x.relative === "path");
        (r == null &&
          a !== "/" &&
          (v.pathname = v.pathname === "/" ? a : en([a, v.pathname])),
          (x.replace ? l.replace : l.push)(v, x.state, x));
      },
      [a, l, d, c, r],
    )
  );
}
var wx = b.createContext(null);
function bx(r) {
  let a = b.useContext(zr).outlet;
  return b.useMemo(
    () => a && b.createElement(wx.Provider, { value: r }, a),
    [a, r],
  );
}
function tu() {
  let { matches: r } = b.useContext(zr),
    a = r[r.length - 1];
  return a ? a.params : {};
}
function Za(r, { relative: a } = {}) {
  let { matches: l } = b.useContext(zr),
    { pathname: i } = Ir(),
    c = JSON.stringify(Gc(l));
  return b.useMemo(() => Kc(r, JSON.parse(c), i, a === "path"), [r, c, i, a]);
}
function jx(r, a, l, i, c) {
  $e(
    Xa(),
    "useRoutes() may be used only in the context of a <Router> component.",
  );
  let { navigator: d } = b.useContext(Sr),
    { matches: f } = b.useContext(zr),
    m = f[f.length - 1],
    g = m ? m.params : {},
    x = m ? m.pathname : "/",
    v = m ? m.pathnameBase : "/",
    p = m && m.route;
  {
    let D = (p && p.path) || "";
    jm(
      x,
      !p || D.endsWith("*") || D.endsWith("*?"),
      `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${x}" (under <Route path="${D}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${D}"> to <Route path="${D === "/" ? "*" : `${D}/*`}">.`,
    );
  }
  let k = Ir(),
    R;
  R = k;
  let S = R.pathname || "/",
    L = S;
  if (v !== "/") {
    let D = v.replace(/^\//, "").split("/");
    L = "/" + S.replace(/^\//, "").split("/").slice(D.length).join("/");
  }
  let j = Hn(r, { pathname: L });
  return (
    ht(
      p || j != null,
      `No routes matched location "${R.pathname}${R.search}${R.hash}" `,
    ),
    ht(
      j == null ||
        j[j.length - 1].route.element !== void 0 ||
        j[j.length - 1].route.Component !== void 0 ||
        j[j.length - 1].route.lazy !== void 0,
      `Matched leaf route at location "${R.pathname}${R.search}${R.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`,
    ),
    Ex(
      j &&
        j.map((D) =>
          Object.assign({}, D, {
            params: Object.assign({}, g, D.params),
            pathname: en([
              v,
              d.encodeLocation
                ? d.encodeLocation(
                    D.pathname.replace(/\?/g, "%3F").replace(/#/g, "%23"),
                  ).pathname
                : D.pathname,
            ]),
            pathnameBase:
              D.pathnameBase === "/"
                ? v
                : en([
                    v,
                    d.encodeLocation
                      ? d.encodeLocation(
                          D.pathnameBase
                            .replace(/\?/g, "%3F")
                            .replace(/#/g, "%23"),
                        ).pathname
                      : D.pathnameBase,
                  ]),
          }),
        ),
      f,
      l,
      i,
      c,
    )
  );
}
function kx() {
  let r = Lx(),
    a = Wa(r)
      ? `${r.status} ${r.statusText}`
      : r instanceof Error
        ? r.message
        : JSON.stringify(r),
    l = r instanceof Error ? r.stack : null,
    i = "rgba(200,200,200, 0.5)",
    c = { padding: "0.5rem", backgroundColor: i },
    d = { padding: "2px 4px", backgroundColor: i },
    f = null;
  return (
    console.error("Error handled by React Router default ErrorBoundary:", r),
    (f = b.createElement(
      b.Fragment,
      null,
      b.createElement("p", null, "💿 Hey developer 👋"),
      b.createElement(
        "p",
        null,
        "You can provide a way better UX than this when your app throws errors by providing your own ",
        b.createElement("code", { style: d }, "ErrorBoundary"),
        " or",
        " ",
        b.createElement("code", { style: d }, "errorElement"),
        " prop on your route.",
      ),
    )),
    b.createElement(
      b.Fragment,
      null,
      b.createElement("h2", null, "Unexpected Application Error!"),
      b.createElement("h3", { style: { fontStyle: "italic" } }, a),
      l ? b.createElement("pre", { style: c }, l) : null,
      f,
    )
  );
}
var Nx = b.createElement(kx, null),
  bm = class extends b.Component {
    constructor(r) {
      (super(r),
        (this.state = {
          location: r.location,
          revalidation: r.revalidation,
          error: r.error,
        }));
    }
    static getDerivedStateFromError(r) {
      return { error: r };
    }
    static getDerivedStateFromProps(r, a) {
      return a.location !== r.location ||
        (a.revalidation !== "idle" && r.revalidation === "idle")
        ? { error: r.error, location: r.location, revalidation: r.revalidation }
        : {
            error: r.error !== void 0 ? r.error : a.error,
            location: a.location,
            revalidation: r.revalidation || a.revalidation,
          };
    }
    componentDidCatch(r, a) {
      this.props.onError
        ? this.props.onError(r, a)
        : console.error(
            "React Router caught the following error during render",
            r,
          );
    }
    render() {
      let r = this.state.error;
      if (
        this.context &&
        typeof r == "object" &&
        r &&
        "digest" in r &&
        typeof r.digest == "string"
      ) {
        const l = xx(r.digest);
        l && (r = l);
      }
      let a =
        r !== void 0
          ? b.createElement(
              zr.Provider,
              { value: this.props.routeContext },
              b.createElement(eu.Provider, {
                value: r,
                children: this.props.component,
              }),
            )
          : this.props.children;
      return this.context ? b.createElement(Sx, { error: r }, a) : a;
    }
  };
bm.contextType = gm;
var Cc = new WeakMap();
function Sx({ children: r, error: a }) {
  let { basename: l } = b.useContext(Sr);
  if (
    typeof a == "object" &&
    a &&
    "digest" in a &&
    typeof a.digest == "string"
  ) {
    let i = gx(a.digest);
    if (i) {
      let c = Cc.get(a);
      if (c) throw c;
      let d = sm(i.location, l);
      if (nm && !Cc.get(a))
        if (d.isExternal || i.reloadDocument)
          window.location.href = d.absoluteURL || d.to;
        else {
          const f = Promise.resolve().then(() =>
            window.__reactRouterDataRouter.navigate(d.to, {
              replace: i.replace,
            }),
          );
          throw (Cc.set(a, f), f);
        }
      return b.createElement("meta", {
        httpEquiv: "refresh",
        content: `0;url=${d.absoluteURL || d.to}`,
      });
    }
  }
  return r;
}
function Cx({ routeContext: r, match: a, children: l }) {
  let i = b.useContext(ws);
  return (
    i &&
      i.static &&
      i.staticContext &&
      (a.route.errorElement || a.route.ErrorBoundary) &&
      (i.staticContext._deepestRenderedBoundaryId = a.route.id),
    b.createElement(zr.Provider, { value: r }, l)
  );
}
function Ex(r, a = [], l = null, i = null, c = null) {
  if (r == null) {
    if (!l) return null;
    if (l.errors) r = l.matches;
    else if (a.length === 0 && !l.initialized && l.matches.length > 0)
      r = l.matches;
    else return null;
  }
  let d = r,
    f = l?.errors;
  if (f != null) {
    let v = d.findIndex((p) => p.route.id && f?.[p.route.id] !== void 0);
    ($e(
      v >= 0,
      `Could not find a matching route for errors on route IDs: ${Object.keys(f).join(",")}`,
    ),
      (d = d.slice(0, Math.min(d.length, v + 1))));
  }
  let m = !1,
    g = -1;
  if (l)
    for (let v = 0; v < d.length; v++) {
      let p = d[v];
      if (
        ((p.route.HydrateFallback || p.route.hydrateFallbackElement) && (g = v),
        p.route.id)
      ) {
        let { loaderData: k, errors: R } = l,
          S =
            p.route.loader &&
            !k.hasOwnProperty(p.route.id) &&
            (!R || R[p.route.id] === void 0);
        if (p.route.lazy || S) {
          ((m = !0), g >= 0 ? (d = d.slice(0, g + 1)) : (d = [d[0]]));
          break;
        }
      }
    }
  let x =
    l && i
      ? (v, p) => {
          i(v, {
            location: l.location,
            params: l.matches?.[0]?.params ?? {},
            unstable_pattern: Qa(l.matches),
            errorInfo: p,
          });
        }
      : void 0;
  return d.reduceRight((v, p, k) => {
    let R,
      S = !1,
      L = null,
      j = null;
    l &&
      ((R = f && p.route.id ? f[p.route.id] : void 0),
      (L = p.route.errorElement || Nx),
      m &&
        (g < 0 && k === 0
          ? (jm(
              "route-fallback",
              !1,
              "No `HydrateFallback` element provided to render during initial hydration",
            ),
            (S = !0),
            (j = null))
          : g === k &&
            ((S = !0), (j = p.route.hydrateFallbackElement || null))));
    let E = a.concat(d.slice(0, k + 1)),
      D = () => {
        let H;
        return (
          R
            ? (H = L)
            : S
              ? (H = j)
              : p.route.Component
                ? (H = b.createElement(p.route.Component, null))
                : p.route.element
                  ? (H = p.route.element)
                  : (H = v),
          b.createElement(Cx, {
            match: p,
            routeContext: { outlet: v, matches: E, isDataRoute: l != null },
            children: H,
          })
        );
      };
    return l && (p.route.ErrorBoundary || p.route.errorElement || k === 0)
      ? b.createElement(bm, {
          location: l.location,
          revalidation: l.revalidation,
          component: L,
          error: R,
          children: D(),
          routeContext: { outlet: null, matches: E, isDataRoute: !0 },
          onError: x,
        })
      : D();
  }, null);
}
function ru(r) {
  return `${r} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function Rx(r) {
  let a = b.useContext(ws);
  return ($e(a, ru(r)), a);
}
function Px(r) {
  let a = b.useContext(Ja);
  return ($e(a, ru(r)), a);
}
function Tx(r) {
  let a = b.useContext(zr);
  return ($e(a, ru(r)), a);
}
function nu(r) {
  let a = Tx(r),
    l = a.matches[a.matches.length - 1];
  return (
    $e(
      l.route.id,
      `${r} can only be used on routes that contain a unique "id"`,
    ),
    l.route.id
  );
}
function _x() {
  return nu("useRouteId");
}
function Lx() {
  let r = b.useContext(eu),
    a = Px("useRouteError"),
    l = nu("useRouteError");
  return r !== void 0 ? r : a.errors?.[l];
}
function Ax() {
  let { router: r } = Rx("useNavigate"),
    a = nu("useNavigate"),
    l = b.useRef(!1);
  return (
    wm(() => {
      l.current = !0;
    }),
    b.useCallback(
      async (c, d = {}) => {
        (ht(l.current, vm),
          l.current &&
            (typeof c == "number"
              ? await r.navigate(c)
              : await r.navigate(c, { fromRouteId: a, ...d })));
      },
      [r, a],
    )
  );
}
var ph = {};
function jm(r, a, l) {
  !a && !ph[r] && ((ph[r] = !0), ht(!1, l));
}
var gh = {};
function xh(r, a) {
  !r && !gh[a] && ((gh[a] = !0), console.warn(a));
}
var Ox = "useOptimistic",
  yh = eg[Ox],
  Dx = () => {};
function Mx(r) {
  return yh ? yh(r) : [r, Dx];
}
function zx(r) {
  let a = {
    hasErrorBoundary:
      r.hasErrorBoundary || r.ErrorBoundary != null || r.errorElement != null,
  };
  return (
    r.Component &&
      (r.element &&
        ht(
          !1,
          "You should not include both `Component` and `element` on your route - `Component` will be used.",
        ),
      Object.assign(a, {
        element: b.createElement(r.Component),
        Component: void 0,
      })),
    r.HydrateFallback &&
      (r.hydrateFallbackElement &&
        ht(
          !1,
          "You should not include both `HydrateFallback` and `hydrateFallbackElement` on your route - `HydrateFallback` will be used.",
        ),
      Object.assign(a, {
        hydrateFallbackElement: b.createElement(r.HydrateFallback),
        HydrateFallback: void 0,
      })),
    r.ErrorBoundary &&
      (r.errorElement &&
        ht(
          !1,
          "You should not include both `ErrorBoundary` and `errorElement` on your route - `ErrorBoundary` will be used.",
        ),
      Object.assign(a, {
        errorElement: b.createElement(r.ErrorBoundary),
        ErrorBoundary: void 0,
      })),
    a
  );
}
var Ix = ["HydrateFallback", "hydrateFallbackElement"],
  Fx = class {
    constructor() {
      ((this.status = "pending"),
        (this.promise = new Promise((r, a) => {
          ((this.resolve = (l) => {
            this.status === "pending" && ((this.status = "resolved"), r(l));
          }),
            (this.reject = (l) => {
              this.status === "pending" && ((this.status = "rejected"), a(l));
            }));
        })));
    }
  };
function $x({
  router: r,
  flushSync: a,
  onError: l,
  unstable_useTransitions: i,
}) {
  i = fx() || i;
  let [d, f] = b.useState(r.state),
    [m, g] = Mx(d),
    [x, v] = b.useState(),
    [p, k] = b.useState({ isTransitioning: !1 }),
    [R, S] = b.useState(),
    [L, j] = b.useState(),
    [E, D] = b.useState(),
    H = b.useRef(new Map()),
    G = b.useCallback(
      (
        Y,
        {
          deletedFetchers: oe,
          newErrors: ce,
          flushSync: Le,
          viewTransitionOpts: de,
        },
      ) => {
        (ce &&
          l &&
          Object.values(ce).forEach((ve) =>
            l(ve, {
              location: Y.location,
              params: Y.matches[0]?.params ?? {},
              unstable_pattern: Qa(Y.matches),
            }),
          ),
          Y.fetchers.forEach((ve, me) => {
            ve.data !== void 0 && H.current.set(me, ve.data);
          }),
          oe.forEach((ve) => H.current.delete(ve)),
          xh(
            Le === !1 || a != null,
            'You provided the `flushSync` option to a router update, but you are not using the `<RouterProvider>` from `react-router/dom` so `ReactDOM.flushSync()` is unavailable.  Please update your app to `import { RouterProvider } from "react-router/dom"` and ensure you have `react-dom` installed as a dependency to use the `flushSync` option.',
          ));
        let Re =
          r.window != null &&
          r.window.document != null &&
          typeof r.window.document.startViewTransition == "function";
        if (
          (xh(
            de == null || Re,
            "You provided the `viewTransition` option to a router update, but you do not appear to be running in a DOM environment as `window.startViewTransition` is not available.",
          ),
          !de || !Re)
        ) {
          a && Le
            ? a(() => f(Y))
            : i === !1
              ? f(Y)
              : b.startTransition(() => {
                  (i === !0 && g((ve) => vh(ve, Y)), f(Y));
                });
          return;
        }
        if (a && Le) {
          a(() => {
            (L && (R?.resolve(), L.skipTransition()),
              k({
                isTransitioning: !0,
                flushSync: !0,
                currentLocation: de.currentLocation,
                nextLocation: de.nextLocation,
              }));
          });
          let ve = r.window.document.startViewTransition(() => {
            a(() => f(Y));
          });
          (ve.finished.finally(() => {
            a(() => {
              (S(void 0), j(void 0), v(void 0), k({ isTransitioning: !1 }));
            });
          }),
            a(() => j(ve)));
          return;
        }
        L
          ? (R?.resolve(),
            L.skipTransition(),
            D({
              state: Y,
              currentLocation: de.currentLocation,
              nextLocation: de.nextLocation,
            }))
          : (v(Y),
            k({
              isTransitioning: !0,
              flushSync: !1,
              currentLocation: de.currentLocation,
              nextLocation: de.nextLocation,
            }));
      },
      [r.window, a, L, R, i, g, l],
    );
  (b.useLayoutEffect(() => r.subscribe(G), [r, G]),
    b.useEffect(() => {
      p.isTransitioning && !p.flushSync && S(new Fx());
    }, [p]),
    b.useEffect(() => {
      if (R && x && r.window) {
        let Y = x,
          oe = R.promise,
          ce = r.window.document.startViewTransition(async () => {
            (i === !1
              ? f(Y)
              : b.startTransition(() => {
                  (i === !0 && g((Le) => vh(Le, Y)), f(Y));
                }),
              await oe);
          });
        (ce.finished.finally(() => {
          (S(void 0), j(void 0), v(void 0), k({ isTransitioning: !1 }));
        }),
          j(ce));
      }
    }, [x, R, r.window, i, g]),
    b.useEffect(() => {
      R && x && m.location.key === x.location.key && R.resolve();
    }, [R, L, m.location, x]),
    b.useEffect(() => {
      !p.isTransitioning &&
        E &&
        (v(E.state),
        k({
          isTransitioning: !0,
          flushSync: !1,
          currentLocation: E.currentLocation,
          nextLocation: E.nextLocation,
        }),
        D(void 0));
    }, [p.isTransitioning, E]));
  let F = b.useMemo(
      () => ({
        createHref: r.createHref,
        encodeLocation: r.encodeLocation,
        go: (Y) => r.navigate(Y),
        push: (Y, oe, ce) =>
          r.navigate(Y, {
            state: oe,
            preventScrollReset: ce?.preventScrollReset,
          }),
        replace: (Y, oe, ce) =>
          r.navigate(Y, {
            replace: !0,
            state: oe,
            preventScrollReset: ce?.preventScrollReset,
          }),
      }),
      [r],
    ),
    U = r.basename || "/",
    P = b.useMemo(
      () => ({ router: r, navigator: F, static: !1, basename: U, onError: l }),
      [r, F, U, l],
    );
  return b.createElement(
    b.Fragment,
    null,
    b.createElement(
      ws.Provider,
      { value: P },
      b.createElement(
        Ja.Provider,
        { value: m },
        b.createElement(
          xm.Provider,
          { value: H.current },
          b.createElement(
            Zc.Provider,
            { value: p },
            b.createElement(
              Vx,
              {
                basename: U,
                location: m.location,
                navigationType: m.historyAction,
                navigator: F,
                unstable_useTransitions: i,
              },
              b.createElement(Ux, {
                routes: r.routes,
                future: r.future,
                state: m,
                onError: l,
              }),
            ),
          ),
        ),
      ),
    ),
    null,
  );
}
function vh(r, a) {
  return {
    ...r,
    navigation: a.navigation.state !== "idle" ? a.navigation : r.navigation,
    revalidation: a.revalidation !== "idle" ? a.revalidation : r.revalidation,
    actionData:
      a.navigation.state !== "submitting" ? a.actionData : r.actionData,
    fetchers: a.fetchers,
  };
}
var Ux = b.memo(Bx);
function Bx({ routes: r, future: a, state: l, onError: i }) {
  return jx(r, void 0, l, i, a);
}
function Hx(r) {
  return bx(r.context);
}
function Vx({
  basename: r = "/",
  children: a = null,
  location: l,
  navigationType: i = "POP",
  navigator: c,
  static: d = !1,
  unstable_useTransitions: f,
}) {
  $e(
    !Xa(),
    "You cannot render a <Router> inside another <Router>. You should never have more than one in your app.",
  );
  let m = r.replace(/^\/*/, "/"),
    g = b.useMemo(
      () => ({
        basename: m,
        navigator: c,
        static: d,
        unstable_useTransitions: f,
        future: {},
      }),
      [m, c, d, f],
    );
  typeof l == "string" && (l = Gn(l));
  let {
      pathname: x = "/",
      search: v = "",
      hash: p = "",
      state: k = null,
      key: R = "default",
    } = l,
    S = b.useMemo(() => {
      let L = Nr(x, m);
      return L == null
        ? null
        : {
            location: { pathname: L, search: v, hash: p, state: k, key: R },
            navigationType: i,
          };
    }, [m, x, v, p, k, R, i]);
  return (
    ht(
      S != null,
      `<Router basename="${m}"> is not able to match the URL "${x}${v}${p}" because it does not start with the basename, so the <Router> won't render anything.`,
    ),
    S == null
      ? null
      : b.createElement(
          Sr.Provider,
          { value: g },
          b.createElement(_o.Provider, { children: a, value: S }),
        )
  );
}
var wo = "get",
  bo = "application/x-www-form-urlencoded";
function Lo(r) {
  return typeof HTMLElement < "u" && r instanceof HTMLElement;
}
function Wx(r) {
  return Lo(r) && r.tagName.toLowerCase() === "button";
}
function qx(r) {
  return Lo(r) && r.tagName.toLowerCase() === "form";
}
function Yx(r) {
  return Lo(r) && r.tagName.toLowerCase() === "input";
}
function Gx(r) {
  return !!(r.metaKey || r.altKey || r.ctrlKey || r.shiftKey);
}
function Kx(r, a) {
  return r.button === 0 && (!a || a === "_self") && !Gx(r);
}
function Fc(r = "") {
  return new URLSearchParams(
    typeof r == "string" || Array.isArray(r) || r instanceof URLSearchParams
      ? r
      : Object.keys(r).reduce((a, l) => {
          let i = r[l];
          return a.concat(Array.isArray(i) ? i.map((c) => [l, c]) : [[l, i]]);
        }, []),
  );
}
function Qx(r, a) {
  let l = Fc(r);
  return (
    a &&
      a.forEach((i, c) => {
        l.has(c) ||
          a.getAll(c).forEach((d) => {
            l.append(c, d);
          });
      }),
    l
  );
}
var fo = null;
function Jx() {
  if (fo === null)
    try {
      (new FormData(document.createElement("form"), 0), (fo = !1));
    } catch {
      fo = !0;
    }
  return fo;
}
var Xx = new Set([
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
]);
function Ec(r) {
  return r != null && !Xx.has(r)
    ? (ht(
        !1,
        `"${r}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${bo}"`,
      ),
      null)
    : r;
}
function Zx(r, a) {
  let l, i, c, d, f;
  if (qx(r)) {
    let m = r.getAttribute("action");
    ((i = m ? Nr(m, a) : null),
      (l = r.getAttribute("method") || wo),
      (c = Ec(r.getAttribute("enctype")) || bo),
      (d = new FormData(r)));
  } else if (Wx(r) || (Yx(r) && (r.type === "submit" || r.type === "image"))) {
    let m = r.form;
    if (m == null)
      throw new Error(
        'Cannot submit a <button> or <input type="submit"> without a <form>',
      );
    let g = r.getAttribute("formaction") || m.getAttribute("action");
    if (
      ((i = g ? Nr(g, a) : null),
      (l = r.getAttribute("formmethod") || m.getAttribute("method") || wo),
      (c =
        Ec(r.getAttribute("formenctype")) ||
        Ec(m.getAttribute("enctype")) ||
        bo),
      (d = new FormData(m, r)),
      !Jx())
    ) {
      let { name: x, type: v, value: p } = r;
      if (v === "image") {
        let k = x ? `${x}.` : "";
        (d.append(`${k}x`, "0"), d.append(`${k}y`, "0"));
      } else x && d.append(x, p);
    }
  } else {
    if (Lo(r))
      throw new Error(
        'Cannot submit element that is not <form>, <button>, or <input type="submit|image">',
      );
    ((l = wo), (i = null), (c = bo), (f = r));
  }
  return (
    d && c === "text/plain" && ((f = d), (d = void 0)),
    { action: i, method: l.toLowerCase(), encType: c, formData: d, body: f }
  );
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function su(r, a) {
  if (r === !1 || r === null || typeof r > "u") throw new Error(a);
}
function ey(r, a, l, i) {
  let c =
    typeof r == "string"
      ? new URL(
          r,
          typeof window > "u"
            ? "server://singlefetch/"
            : window.location.origin,
        )
      : r;
  return (
    l
      ? c.pathname.endsWith("/")
        ? (c.pathname = `${c.pathname}_.${i}`)
        : (c.pathname = `${c.pathname}.${i}`)
      : c.pathname === "/"
        ? (c.pathname = `_root.${i}`)
        : a && Nr(c.pathname, a) === "/"
          ? (c.pathname = `${a.replace(/\/$/, "")}/_root.${i}`)
          : (c.pathname = `${c.pathname.replace(/\/$/, "")}.${i}`),
    c
  );
}
async function ty(r, a) {
  if (r.id in a) return a[r.id];
  try {
    let l = await import(r.module);
    return ((a[r.id] = l), l);
  } catch (l) {
    return (
      console.error(
        `Error loading route module \`${r.module}\`, reloading page...`,
      ),
      console.error(l),
      window.__reactRouterContext && window.__reactRouterContext.isSpaMode,
      window.location.reload(),
      new Promise(() => {})
    );
  }
}
function ry(r) {
  return r == null
    ? !1
    : r.href == null
      ? r.rel === "preload" &&
        typeof r.imageSrcSet == "string" &&
        typeof r.imageSizes == "string"
      : typeof r.rel == "string" && typeof r.href == "string";
}
async function ny(r, a, l) {
  let i = await Promise.all(
    r.map(async (c) => {
      let d = a.routes[c.route.id];
      if (d) {
        let f = await ty(d, l);
        return f.links ? f.links() : [];
      }
      return [];
    }),
  );
  return oy(
    i
      .flat(1)
      .filter(ry)
      .filter((c) => c.rel === "stylesheet" || c.rel === "preload")
      .map((c) =>
        c.rel === "stylesheet"
          ? { ...c, rel: "prefetch", as: "style" }
          : { ...c, rel: "prefetch" },
      ),
  );
}
function wh(r, a, l, i, c, d) {
  let f = (g, x) => (l[x] ? g.route.id !== l[x].route.id : !0),
    m = (g, x) =>
      l[x].pathname !== g.pathname ||
      (l[x].route.path?.endsWith("*") && l[x].params["*"] !== g.params["*"]);
  return d === "assets"
    ? a.filter((g, x) => f(g, x) || m(g, x))
    : d === "data"
      ? a.filter((g, x) => {
          let v = i.routes[g.route.id];
          if (!v || !v.hasLoader) return !1;
          if (f(g, x) || m(g, x)) return !0;
          if (g.route.shouldRevalidate) {
            let p = g.route.shouldRevalidate({
              currentUrl: new URL(
                c.pathname + c.search + c.hash,
                window.origin,
              ),
              currentParams: l[0]?.params || {},
              nextUrl: new URL(r, window.origin),
              nextParams: g.params,
              defaultShouldRevalidate: !0,
            });
            if (typeof p == "boolean") return p;
          }
          return !0;
        })
      : [];
}
function sy(r, a, { includeHydrateFallback: l } = {}) {
  return ay(
    r
      .map((i) => {
        let c = a.routes[i.route.id];
        if (!c) return [];
        let d = [c.module];
        return (
          c.clientActionModule && (d = d.concat(c.clientActionModule)),
          c.clientLoaderModule && (d = d.concat(c.clientLoaderModule)),
          l &&
            c.hydrateFallbackModule &&
            (d = d.concat(c.hydrateFallbackModule)),
          c.imports && (d = d.concat(c.imports)),
          d
        );
      })
      .flat(1),
  );
}
function ay(r) {
  return [...new Set(r)];
}
function ly(r) {
  let a = {},
    l = Object.keys(r).sort();
  for (let i of l) a[i] = r[i];
  return a;
}
function oy(r, a) {
  let l = new Set();
  return (
    new Set(a),
    r.reduce((i, c) => {
      let d = JSON.stringify(ly(c));
      return (l.has(d) || (l.add(d), i.push({ key: d, link: c })), i);
    }, [])
  );
}
function km() {
  let r = b.useContext(ws);
  return (
    su(
      r,
      "You must render this element inside a <DataRouterContext.Provider> element",
    ),
    r
  );
}
function iy() {
  let r = b.useContext(Ja);
  return (
    su(
      r,
      "You must render this element inside a <DataRouterStateContext.Provider> element",
    ),
    r
  );
}
var au = b.createContext(void 0);
au.displayName = "FrameworkContext";
function Nm() {
  let r = b.useContext(au);
  return (
    su(r, "You must render this element inside a <HydratedRouter> element"),
    r
  );
}
function cy(r, a) {
  let l = b.useContext(au),
    [i, c] = b.useState(!1),
    [d, f] = b.useState(!1),
    {
      onFocus: m,
      onBlur: g,
      onMouseEnter: x,
      onMouseLeave: v,
      onTouchStart: p,
    } = a,
    k = b.useRef(null);
  (b.useEffect(() => {
    if ((r === "render" && f(!0), r === "viewport")) {
      let L = (E) => {
          E.forEach((D) => {
            f(D.isIntersecting);
          });
        },
        j = new IntersectionObserver(L, { threshold: 0.5 });
      return (
        k.current && j.observe(k.current),
        () => {
          j.disconnect();
        }
      );
    }
  }, [r]),
    b.useEffect(() => {
      if (i) {
        let L = setTimeout(() => {
          f(!0);
        }, 100);
        return () => {
          clearTimeout(L);
        };
      }
    }, [i]));
  let R = () => {
      c(!0);
    },
    S = () => {
      (c(!1), f(!1));
    };
  return l
    ? r !== "intent"
      ? [d, k, {}]
      : [
          d,
          k,
          {
            onFocus: Oa(m, R),
            onBlur: Oa(g, S),
            onMouseEnter: Oa(x, R),
            onMouseLeave: Oa(v, S),
            onTouchStart: Oa(p, R),
          },
        ]
    : [!1, k, {}];
}
function Oa(r, a) {
  return (l) => {
    (r && r(l), l.defaultPrevented || a(l));
  };
}
function uy({ page: r, ...a }) {
  let { router: l } = km(),
    i = b.useMemo(() => Hn(l.routes, r, l.basename), [l.routes, r, l.basename]);
  return i ? b.createElement(fy, { page: r, matches: i, ...a }) : null;
}
function dy(r) {
  let { manifest: a, routeModules: l } = Nm(),
    [i, c] = b.useState([]);
  return (
    b.useEffect(() => {
      let d = !1;
      return (
        ny(r, a, l).then((f) => {
          d || c(f);
        }),
        () => {
          d = !0;
        }
      );
    }, [r, a, l]),
    i
  );
}
function fy({ page: r, matches: a, ...l }) {
  let i = Ir(),
    { future: c, manifest: d, routeModules: f } = Nm(),
    { basename: m } = km(),
    { loaderData: g, matches: x } = iy(),
    v = b.useMemo(() => wh(r, a, x, d, i, "data"), [r, a, x, d, i]),
    p = b.useMemo(() => wh(r, a, x, d, i, "assets"), [r, a, x, d, i]),
    k = b.useMemo(() => {
      if (r === i.pathname + i.search + i.hash) return [];
      let L = new Set(),
        j = !1;
      if (
        (a.forEach((D) => {
          let H = d.routes[D.route.id];
          !H ||
            !H.hasLoader ||
            ((!v.some((G) => G.route.id === D.route.id) &&
              D.route.id in g &&
              f[D.route.id]?.shouldRevalidate) ||
            H.hasClientLoader
              ? (j = !0)
              : L.add(D.route.id));
        }),
        L.size === 0)
      )
        return [];
      let E = ey(r, m, c.unstable_trailingSlashAwareDataRequests, "data");
      return (
        j &&
          L.size > 0 &&
          E.searchParams.set(
            "_routes",
            a
              .filter((D) => L.has(D.route.id))
              .map((D) => D.route.id)
              .join(","),
          ),
        [E.pathname + E.search]
      );
    }, [m, c.unstable_trailingSlashAwareDataRequests, g, i, d, v, a, r, f]),
    R = b.useMemo(() => sy(p, d), [p, d]),
    S = dy(p);
  return b.createElement(
    b.Fragment,
    null,
    k.map((L) =>
      b.createElement("link", {
        key: L,
        rel: "prefetch",
        as: "fetch",
        href: L,
        ...l,
      }),
    ),
    R.map((L) =>
      b.createElement("link", { key: L, rel: "modulepreload", href: L, ...l }),
    ),
    S.map(({ key: L, link: j }) =>
      b.createElement("link", {
        key: L,
        nonce: l.nonce,
        ...j,
        crossOrigin: j.crossOrigin ?? l.crossOrigin,
      }),
    ),
  );
}
function hy(...r) {
  return (a) => {
    r.forEach((l) => {
      typeof l == "function" ? l(a) : l != null && (l.current = a);
    });
  };
}
var my =
  typeof window < "u" &&
  typeof window.document < "u" &&
  typeof window.document.createElement < "u";
try {
  my && (window.__reactRouterVersion = "7.13.0");
} catch {}
function py(r, a) {
  return Ug({
    basename: a?.basename,
    getContext: a?.getContext,
    future: a?.future,
    history: ng({ window: a?.window }),
    hydrationData: gy(),
    routes: r,
    mapRouteProperties: zx,
    hydrationRouteProperties: Ix,
    dataStrategy: a?.dataStrategy,
    patchRoutesOnNavigation: a?.patchRoutesOnNavigation,
    window: a?.window,
    unstable_instrumentations: a?.unstable_instrumentations,
  }).initialize();
}
function gy() {
  let r = window?.__staticRouterHydrationData;
  return (r && r.errors && (r = { ...r, errors: xy(r.errors) }), r);
}
function xy(r) {
  if (!r) return null;
  let a = Object.entries(r),
    l = {};
  for (let [i, c] of a)
    if (c && c.__type === "RouteErrorResponse")
      l[i] = new Ka(c.status, c.statusText, c.data, c.internal === !0);
    else if (c && c.__type === "Error") {
      if (c.__subType) {
        let d = window[c.__subType];
        if (typeof d == "function")
          try {
            let f = new d(c.message);
            ((f.stack = ""), (l[i] = f));
          } catch {}
      }
      if (l[i] == null) {
        let d = new Error(c.message);
        ((d.stack = ""), (l[i] = d));
      }
    } else l[i] = c;
  return l;
}
var Sm = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  Cm = b.forwardRef(function (
    {
      onClick: a,
      discover: l = "render",
      prefetch: i = "none",
      relative: c,
      reloadDocument: d,
      replace: f,
      state: m,
      target: g,
      to: x,
      preventScrollReset: v,
      viewTransition: p,
      unstable_defaultShouldRevalidate: k,
      ...R
    },
    S,
  ) {
    let { basename: L, unstable_useTransitions: j } = b.useContext(Sr),
      E = typeof x == "string" && Sm.test(x),
      D = sm(x, L);
    x = D.to;
    let H = yx(x, { relative: c }),
      [G, F, U] = cy(i, R),
      P = by(x, {
        replace: f,
        state: m,
        target: g,
        preventScrollReset: v,
        relative: c,
        viewTransition: p,
        unstable_defaultShouldRevalidate: k,
        unstable_useTransitions: j,
      });
    function Y(ce) {
      (a && a(ce), ce.defaultPrevented || P(ce));
    }
    let oe = b.createElement("a", {
      ...R,
      ...U,
      href: D.absoluteURL || H,
      onClick: D.isExternal || d ? a : Y,
      ref: hy(S, F),
      target: g,
      "data-discover": !E && l === "render" ? "true" : void 0,
    });
    return G && !E
      ? b.createElement(b.Fragment, null, oe, b.createElement(uy, { page: H }))
      : oe;
  });
Cm.displayName = "Link";
var yy = b.forwardRef(function (
  {
    "aria-current": a = "page",
    caseSensitive: l = !1,
    className: i = "",
    end: c = !1,
    style: d,
    to: f,
    viewTransition: m,
    children: g,
    ...x
  },
  v,
) {
  let p = Za(f, { relative: x.relative }),
    k = Ir(),
    R = b.useContext(Ja),
    { navigator: S, basename: L } = b.useContext(Sr),
    j = R != null && Ey(p) && m === !0,
    E = S.encodeLocation ? S.encodeLocation(p).pathname : p.pathname,
    D = k.pathname,
    H =
      R && R.navigation && R.navigation.location
        ? R.navigation.location.pathname
        : null;
  (l ||
    ((D = D.toLowerCase()),
    (H = H ? H.toLowerCase() : null),
    (E = E.toLowerCase())),
    H && L && (H = Nr(H, L) || H));
  const G = E !== "/" && E.endsWith("/") ? E.length - 1 : E.length;
  let F = D === E || (!c && D.startsWith(E) && D.charAt(G) === "/"),
    U =
      H != null &&
      (H === E || (!c && H.startsWith(E) && H.charAt(E.length) === "/")),
    P = { isActive: F, isPending: U, isTransitioning: j },
    Y = F ? a : void 0,
    oe;
  typeof i == "function"
    ? (oe = i(P))
    : (oe = [
        i,
        F ? "active" : null,
        U ? "pending" : null,
        j ? "transitioning" : null,
      ]
        .filter(Boolean)
        .join(" "));
  let ce = typeof d == "function" ? d(P) : d;
  return b.createElement(
    Cm,
    {
      ...x,
      "aria-current": Y,
      className: oe,
      ref: v,
      style: ce,
      to: f,
      viewTransition: m,
    },
    typeof g == "function" ? g(P) : g,
  );
});
yy.displayName = "NavLink";
var vy = b.forwardRef(
  (
    {
      discover: r = "render",
      fetcherKey: a,
      navigate: l,
      reloadDocument: i,
      replace: c,
      state: d,
      method: f = wo,
      action: m,
      onSubmit: g,
      relative: x,
      preventScrollReset: v,
      viewTransition: p,
      unstable_defaultShouldRevalidate: k,
      ...R
    },
    S,
  ) => {
    let { unstable_useTransitions: L } = b.useContext(Sr),
      j = Sy(),
      E = Cy(m, { relative: x }),
      D = f.toLowerCase() === "get" ? "get" : "post",
      H = typeof m == "string" && Sm.test(m),
      G = (F) => {
        if ((g && g(F), F.defaultPrevented)) return;
        F.preventDefault();
        let U = F.nativeEvent.submitter,
          P = U?.getAttribute("formmethod") || f,
          Y = () =>
            j(U || F.currentTarget, {
              fetcherKey: a,
              method: P,
              navigate: l,
              replace: c,
              state: d,
              relative: x,
              preventScrollReset: v,
              viewTransition: p,
              unstable_defaultShouldRevalidate: k,
            });
        L && l !== !1 ? b.startTransition(() => Y()) : Y();
      };
    return b.createElement("form", {
      ref: S,
      method: D,
      action: E,
      onSubmit: i ? g : G,
      ...R,
      "data-discover": !H && r === "render" ? "true" : void 0,
    });
  },
);
vy.displayName = "Form";
function wy(r) {
  return `${r} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function Em(r) {
  let a = b.useContext(ws);
  return ($e(a, wy(r)), a);
}
function by(
  r,
  {
    target: a,
    replace: l,
    state: i,
    preventScrollReset: c,
    relative: d,
    viewTransition: f,
    unstable_defaultShouldRevalidate: m,
    unstable_useTransitions: g,
  } = {},
) {
  let x = zt(),
    v = Ir(),
    p = Za(r, { relative: d });
  return b.useCallback(
    (k) => {
      if (Kx(k, a)) {
        k.preventDefault();
        let R = l !== void 0 ? l : nn(v) === nn(p),
          S = () =>
            x(r, {
              replace: R,
              state: i,
              preventScrollReset: c,
              relative: d,
              viewTransition: f,
              unstable_defaultShouldRevalidate: m,
            });
        g ? b.startTransition(() => S()) : S();
      }
    },
    [v, x, p, l, i, a, r, c, d, f, m, g],
  );
}
function jy(r) {
  ht(
    typeof URLSearchParams < "u",
    "You cannot use the `useSearchParams` hook in a browser that does not support the URLSearchParams API. If you need to support Internet Explorer 11, we recommend you load a polyfill such as https://github.com/ungap/url-search-params.",
  );
  let a = b.useRef(Fc(r)),
    l = b.useRef(!1),
    i = Ir(),
    c = b.useMemo(() => Qx(i.search, l.current ? null : a.current), [i.search]),
    d = zt(),
    f = b.useCallback(
      (m, g) => {
        const x = Fc(typeof m == "function" ? m(new URLSearchParams(c)) : m);
        ((l.current = !0), d("?" + x, g));
      },
      [d, c],
    );
  return [c, f];
}
var ky = 0,
  Ny = () => `__${String(++ky)}__`;
function Sy() {
  let { router: r } = Em("useSubmit"),
    { basename: a } = b.useContext(Sr),
    l = _x(),
    i = r.fetch,
    c = r.navigate;
  return b.useCallback(
    async (d, f = {}) => {
      let { action: m, method: g, encType: x, formData: v, body: p } = Zx(d, a);
      if (f.navigate === !1) {
        let k = f.fetcherKey || Ny();
        await i(k, l, f.action || m, {
          unstable_defaultShouldRevalidate: f.unstable_defaultShouldRevalidate,
          preventScrollReset: f.preventScrollReset,
          formData: v,
          body: p,
          formMethod: f.method || g,
          formEncType: f.encType || x,
          flushSync: f.flushSync,
        });
      } else
        await c(f.action || m, {
          unstable_defaultShouldRevalidate: f.unstable_defaultShouldRevalidate,
          preventScrollReset: f.preventScrollReset,
          formData: v,
          body: p,
          formMethod: f.method || g,
          formEncType: f.encType || x,
          replace: f.replace,
          state: f.state,
          fromRouteId: l,
          flushSync: f.flushSync,
          viewTransition: f.viewTransition,
        });
    },
    [i, c, a, l],
  );
}
function Cy(r, { relative: a } = {}) {
  let { basename: l } = b.useContext(Sr),
    i = b.useContext(zr);
  $e(i, "useFormAction must be used inside a RouteContext");
  let [c] = i.matches.slice(-1),
    d = { ...Za(r || ".", { relative: a }) },
    f = Ir();
  if (r == null) {
    d.search = f.search;
    let m = new URLSearchParams(d.search),
      g = m.getAll("index");
    if (g.some((v) => v === "")) {
      (m.delete("index"),
        g.filter((p) => p).forEach((p) => m.append("index", p)));
      let v = m.toString();
      d.search = v ? `?${v}` : "";
    }
  }
  return (
    (!r || r === ".") &&
      c.route.index &&
      (d.search = d.search ? d.search.replace(/^\?/, "?index&") : "?index"),
    l !== "/" && (d.pathname = d.pathname === "/" ? l : en([l, d.pathname])),
    nn(d)
  );
}
function Ey(r, { relative: a } = {}) {
  let l = b.useContext(Zc);
  $e(
    l != null,
    "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?",
  );
  let { basename: i } = Em("useViewTransitionState"),
    c = Za(r, { relative: a });
  if (!l.isTransitioning) return !1;
  let d = Nr(l.currentLocation.pathname, i) || l.currentLocation.pathname,
    f = Nr(l.nextLocation.pathname, i) || l.nextLocation.pathname;
  return Co(c.pathname, f) != null || Co(c.pathname, d) != null;
}
const Xt = {
    p1e81d8f0:
      "M32.4548 27.5734L31.2598 24.8066C31.1845 24.6344 31.12 24.4515 31.0338 24.2146C32.1319 24.2254 35.4154 24.0101 36.3412 23.6334C36.6104 23.5256 36.8364 23.3318 36.9764 23.0735C37.4069 22.2877 37.7298 21.4479 38.1821 20.6729C38.5481 20.027 38.591 19.4563 38.279 18.7782C37.8698 17.863 37.9236 17.863 36.901 17.8308C36.6857 17.8308 35.6845 17.8954 35.5229 17.6263C35.2969 17.2387 35.114 16.8296 34.8771 16.3452L37.0086 16.4959C36.8364 16.033 36.6104 15.5162 36.4919 15.1287C36.3412 14.6335 36.029 14.3536 35.5769 14.149C34.1881 13.5246 32.8102 12.8572 31.4323 12.2113C30.7217 11.8775 30.0112 11.5438 29.2576 11.1993C27.8797 14.0306 26.5124 16.8404 25.1452 19.6501C24.3809 20.113 20.0855 21.9647 19.4395 22.3846C19.2243 22.5244 19.009 22.7291 18.869 22.9442C15.564 28.2732 11.9469 34.0972 8.65269 39.4477H17.9862C18.1478 39.4368 18.3738 39.2646 18.4491 39.1139C19.009 37.962 19.5473 36.7994 20.0855 35.6475C20.5054 34.7647 20.9145 33.882 21.345 32.9668C22.6585 33.7851 23.9179 34.5494 25.1452 35.3568C25.339 35.486 25.4897 35.7766 25.5221 36.0134L25.8342 39.4584H33.9512L34.791 33.8389C34.8448 33.462 34.791 33.0853 34.651 32.7301L32.4548 27.5842V27.5734Z",
    p2b292500:
      "M91.8904 36.5949C91.5997 37.3701 91.0829 37.7468 90.3617 37.7468H83.9348C83.7302 37.7468 83.5473 37.6822 83.3857 37.5423C83.2459 37.3808 83.1812 37.1978 83.1812 36.9932L83.2135 36.7887L90.62 15.075C90.7062 14.7843 90.8785 14.5152 91.126 14.2891C91.3736 14.0631 91.7181 13.9446 92.1488 13.9446H101.59C102.021 13.9446 102.354 14.0631 102.613 14.2891C102.86 14.5152 103.032 14.7736 103.119 15.075L110.525 36.7887L110.557 36.9932C110.557 37.1978 110.482 37.3808 110.321 37.5423C110.181 37.6822 110.019 37.7468 109.815 37.7468H103.398C102.677 37.7468 102.161 37.3592 101.87 36.5949L101.019 34.2158H92.73L91.8797 36.5949H91.8904ZM96.8855 20.5223L94.474 27.5951H99.2969L96.8855 20.5223Z",
    p2c3d1bc0:
      "M231.57 13.6214C233.756 13.6214 235.672 13.9981 237.298 14.741C238.924 15.4838 240.172 16.4957 241.034 17.7768C241.894 19.0579 242.325 20.4896 242.325 22.0722C242.325 24.6773 241.506 26.7335 239.882 28.2192C238.256 29.6832 235.479 30.4261 231.56 30.4261H226.941V37.1329C226.941 37.3913 226.844 37.6066 226.662 37.8003C226.479 37.9834 226.253 38.0803 225.994 38.0803H218.481C218.222 38.0803 218.006 37.9834 217.813 37.8003C217.629 37.6173 217.532 37.3913 217.532 37.1329V14.5687C217.532 14.3104 217.629 14.095 217.813 13.9013C217.996 13.7182 218.222 13.6214 218.481 13.6214H231.55H231.57ZM231.431 23.9668C231.991 23.9668 232.432 23.8054 232.755 23.4825C233.077 23.1379 233.249 22.6751 233.249 22.1153C233.249 21.5554 233.089 21.0603 232.755 20.6834C232.432 20.3066 231.991 20.1237 231.431 20.1237H226.996V23.9668H231.431Z",
    p2d766b80:
      "M272.92 38.091L281.943 13.6214H285.053L294.031 38.091H290.887L283.481 17.2923L275.999 38.091H272.92ZM277.044 31.7932L277.884 29.4141H288.962L289.801 31.7932H277.044Z",
    p2e3c1a00:
      "M156.622 31.1256C156.87 31.1256 157.085 31.2118 157.268 31.3947C157.451 31.5779 157.537 31.793 157.537 32.0408V36.8313C157.537 37.0789 157.451 37.2942 157.268 37.4772C157.085 37.6603 156.87 37.7463 156.622 37.7463H135.146C134.898 37.7463 134.683 37.6603 134.5 37.4772C134.317 37.2942 134.231 37.0789 134.231 36.8313V14.8807C134.231 14.6331 134.317 14.4178 134.5 14.2348C134.683 14.0518 134.898 13.9657 135.146 13.9657H156.278C156.526 13.9657 156.741 14.0518 156.924 14.2348C157.107 14.4178 157.193 14.6331 157.193 14.8807V19.6713C157.193 19.9189 157.107 20.1342 156.924 20.3172C156.741 20.5003 156.526 20.5863 156.278 20.5863H143.058V22.7287H154.405C154.652 22.7287 154.868 22.8147 155.051 22.9978C155.234 23.1808 155.32 23.3961 155.32 23.6437V28.0575C155.32 28.3051 155.234 28.5204 155.051 28.7034C154.868 28.8865 154.652 28.9725 154.405 28.9725H143.058V31.1149H156.612L156.622 31.1256Z",
    p323808f0:
      "M73.74 22.5894C76.2267 22.8585 78.2291 23.2999 79.7255 23.9135C81.2435 24.5272 82.3416 25.3346 83.0197 26.3249C83.6979 27.3261 84.0424 28.5642 84.0424 30.0606C84.0424 31.6861 83.515 33.1178 82.4492 34.3451C81.4048 35.5508 79.9624 36.4766 78.1 37.1334C76.2376 37.7685 74.1276 38.0808 71.7485 38.0808C69.1002 38.0808 66.8502 37.747 65.02 37.0903C63.19 36.4335 61.8119 35.5616 60.9078 34.4744C60.0035 33.3654 59.5512 32.1491 59.5512 30.8356C59.5512 30.6096 59.6159 30.4265 59.7559 30.2973C59.9173 30.1575 60.111 30.0928 60.3371 30.0928H67.3023C67.7761 30.0928 68.1635 30.2435 68.4542 30.5342C68.8417 30.9003 69.2724 31.1478 69.7461 31.277C70.2197 31.3954 70.8873 31.4492 71.7485 31.4492C73.9014 31.4492 74.9779 31.1156 74.9779 30.4589C74.9779 30.1897 74.8273 29.9637 74.5366 29.7806C74.2674 29.5761 73.7616 29.4039 73.0402 29.2747C72.3405 29.1132 71.2962 28.9625 69.9183 28.801C66.8179 28.4349 64.4388 27.6706 62.7809 26.4865C61.1229 25.2808 60.3048 23.6013 60.3048 21.4266C60.3048 19.8873 60.7678 18.5308 61.6936 17.3466C62.6193 16.1732 63.9328 15.2474 65.6336 14.5907C67.3562 13.934 69.3478 13.6003 71.6192 13.6003C73.8907 13.6003 76.0329 13.9771 77.7985 14.7199C79.564 15.4412 80.9097 16.3562 81.8462 17.4435C82.7721 18.5308 83.235 19.5966 83.235 20.6408C83.235 20.867 83.1597 21.0499 82.9981 21.1791C82.8583 21.3191 82.6645 21.3837 82.4169 21.3837H75.1073C74.7197 21.3837 74.3752 21.2437 74.0523 20.9746C73.8047 20.7485 73.514 20.5654 73.1695 20.4256C72.825 20.2856 72.3083 20.221 71.6085 20.221C70.0905 20.221 69.3369 20.5332 69.3369 21.1684C69.3369 21.5128 69.6276 21.782 70.2197 21.9865C70.8117 22.1696 71.9852 22.3634 73.7507 22.5679L73.74 22.5894Z",
    p3498c380:
      "M266.096 31.2765C266.353 31.2765 266.568 31.3734 266.763 31.5565C266.946 31.7394 267.043 31.9654 267.043 32.2239V37.1544C267.043 37.4129 266.946 37.628 266.763 37.8218C266.581 38.0049 266.353 38.1018 266.096 38.1018H244.005C243.746 38.1018 243.531 38.0049 243.337 37.8218C243.155 37.6389 243.058 37.4129 243.058 37.1544V14.5687C243.058 14.3104 243.155 14.095 243.337 13.9013C243.52 13.7182 243.746 13.6214 244.005 13.6214H265.751C266.01 13.6214 266.224 13.7182 266.418 13.9013C266.601 14.0843 266.698 14.3104 266.698 14.5687V19.4992C266.698 19.7577 266.601 19.9729 266.418 20.1666C266.236 20.3497 266.01 20.4466 265.751 20.4466H252.155V22.6535H263.824C264.082 22.6535 264.298 22.7504 264.491 22.9334C264.674 23.1165 264.772 23.3425 264.772 23.6008V28.1439C264.772 28.4022 264.674 28.6175 264.491 28.8113C264.308 28.9942 264.082 29.0911 263.824 29.0911H252.155V31.298H266.106L266.096 31.2765Z",
    p35052900:
      "M42.6066 33.0853L38.4943 23.2565L35.846 28.6608C35.5983 29.1666 35.5445 29.6404 35.6092 30.1894C35.706 31.0075 35.7921 31.8258 35.8674 32.6439L36.6319 39.4475C37.7407 39.4475 39.9367 39.4475 41.0457 39.4475C41.2609 39.4475 41.6378 39.3615 41.6807 39.1461C41.8207 38.4034 42.5635 34.7861 42.6928 34.3341C42.8435 33.7851 42.725 33.4191 42.585 33.0853H42.6066Z",
    p3b7d6000:
      "M0.00811262 4.75109C-0.153368 2.03823 2.11812 -0.20097 4.831 0.0143366L46.3745 3.36237C48.7536 3.55614 50.5623 5.58002 50.476 7.96994L49.2919 41.2025C49.2057 43.6032 47.2357 45.5087 44.835 45.5087H24.8007C24.2733 45.5087 23.8641 45.9608 23.9073 46.4775L24.5747 54.1963C24.65 55.036 23.6273 55.4989 23.0459 54.8961L15.2841 46.8651C14.4444 45.9932 13.2818 45.5087 12.0761 45.5087H6.86563C4.51879 45.5087 2.57027 43.6785 2.40879 41.3318L0.00811262 4.75109Z",
    p3c9d0680:
      "M172.512 22.5894C175.01 22.8585 177.001 23.2999 178.498 23.9135C180.015 24.5272 181.113 25.3346 181.793 26.3249C182.47 27.3261 182.815 28.5642 182.815 30.0606C182.815 31.6861 182.287 33.1178 181.222 34.3451C180.177 35.5508 178.724 36.4766 176.872 37.1334C175.01 37.7685 172.899 38.0808 170.521 38.0808C167.872 38.0808 165.633 37.747 163.792 37.0903C161.951 36.4335 160.584 35.5616 159.68 34.4744C158.776 33.3654 158.323 32.1491 158.323 30.8356C158.323 30.6096 158.388 30.4265 158.528 30.2973C158.689 30.1575 158.883 30.0928 159.109 30.0928H166.074C166.548 30.0928 166.936 30.2435 167.226 30.5342C167.614 30.9003 168.044 31.1478 168.518 31.277C168.992 31.3954 169.659 31.4492 170.521 31.4492C172.674 31.4492 173.749 31.1156 173.749 30.4589C173.749 30.1897 173.599 29.9637 173.308 29.7806C173.039 29.5761 172.544 29.4039 171.812 29.2747C171.113 29.1132 170.068 28.9625 168.69 28.801C165.59 28.4349 163.211 27.6706 161.553 26.4865C159.895 25.2808 159.077 23.6013 159.077 21.4266C159.077 19.8873 159.54 18.5308 160.466 17.3466C161.391 16.1732 162.705 15.2474 164.406 14.5907C166.128 13.934 168.12 13.6003 170.381 13.6003C172.641 13.6003 174.794 13.9771 176.56 14.7199C178.325 15.4412 179.67 16.3562 180.608 17.4435C181.534 18.5308 181.996 19.5966 181.996 20.6408C181.996 20.867 181.92 21.0499 181.76 21.1791C181.62 21.3191 181.425 21.3837 181.179 21.3837H173.868C173.481 21.3837 173.136 21.2437 172.813 20.9746C172.567 20.7485 172.265 20.5654 171.931 20.4256C171.586 20.2856 171.069 20.221 170.37 20.221C168.852 20.221 168.098 20.5332 168.098 21.1684C168.098 21.5128 168.389 21.782 168.981 21.9865C169.573 22.1696 170.747 22.3634 172.512 22.5679V22.5894Z",
    p3f026000: "M296.077 38.091V13.6214H299.015V38.091H296.077Z",
    p49900c0:
      "M197.639 36.8961C197.337 37.6927 196.81 38.0803 196.067 38.0803H189.456C189.241 38.0803 189.058 38.0049 188.898 37.8758C188.756 37.7142 188.682 37.5311 188.682 37.316L188.713 37.1113L196.336 14.7733C196.432 14.4718 196.605 14.2027 196.863 13.9659C197.122 13.729 197.467 13.6214 197.908 13.6214H207.629C208.07 13.6214 208.425 13.7398 208.674 13.9659C208.931 14.2027 209.103 14.4718 209.201 14.7733L216.822 37.1113L216.855 37.316C216.855 37.5204 216.779 37.7142 216.606 37.8758C216.467 38.0156 216.294 38.0803 216.079 38.0803H209.47C208.727 38.0803 208.199 37.682 207.898 36.8961L207.025 34.4523H198.499L197.627 36.8961H197.639ZM202.774 20.3713L200.287 27.6379H205.249L202.774 20.3713Z",
    p846adf0:
      "M31.5076 9.55264C32.8424 9.7249 33.8867 10.7799 34.059 12.1148C34.0805 12.2655 34.2957 12.2655 34.3066 12.1148C34.4788 10.7799 35.5338 9.7249 36.8686 9.55264C37.0193 9.53113 37.0193 9.31582 36.8686 9.30506C35.5338 9.1328 34.4788 8.08856 34.3066 6.75366C34.285 6.60295 34.0697 6.60295 34.059 6.75366C33.8867 8.08856 32.8424 9.1328 31.5076 9.30506C31.3567 9.32657 31.3567 9.54188 31.5076 9.55264Z",
    p8ed2400:
      "M132.185 30.7811C132.433 30.7811 132.648 30.8673 132.831 31.0503C133.014 31.2334 133.1 31.4485 133.1 31.6963V36.8313C133.1 37.0789 133.014 37.2942 132.831 37.4772C132.648 37.6603 132.433 37.7463 132.185 37.7463H112.344C112.097 37.7463 111.882 37.6603 111.699 37.4772C111.516 37.2942 111.429 37.0789 111.429 36.8313V14.8807C111.429 14.6331 111.516 14.4178 111.699 14.2348C111.882 14.0518 112.097 13.9657 112.344 13.9657H119.687C119.934 13.9657 120.149 14.0518 120.332 14.2348C120.515 14.4178 120.602 14.6331 120.602 14.8807V30.7811H132.185Z",
  },
  bh =
    "data:image/svg+xml,%3Csvg%20preserveAspectRatio%3D%22none%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20overflow%3D%22visible%22%20style%3D%22display%3A%20block%3B%22%20viewBox%3D%220%200%20299.007%2055.1724%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cg%20id%3D%22clip0_24_90%22%3E%0A%3Cpath%20id%3D%22Vector%22%20d%3D%22M299.007%200H0V55.1724H299.007V0Z%22%20fill%3D%22var(--fill-0%2C%20black)%22%2F%3E%0A%3C%2Fg%3E%0A%3C%2Fsvg%3E%0A";
function Ry() {
  return n.jsx("div", {
    className:
      "absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat",
    "data-name": "Group",
    style: {
      maskImage: `url('${bh}')`,
      WebkitMaskImage: `url('${bh}')`,
      maskSize: "100% 100%",
      WebkitMaskSize: "100% 100%",
    },
    children: n.jsx("svg", {
      className: "block size-full",
      fill: "none",
      preserveAspectRatio: "xMidYMid meet",
      viewBox: "0 0 299.015 55.17",
      children: n.jsxs("g", {
        id: "Group",
        children: [
          n.jsx("path", {
            d: Xt.p3f026000,
            fill: "currentColor",
            className: "text-gray-900 dark:text-white",
            id: "Vector",
          }),
          n.jsx("path", {
            d: Xt.p2d766b80,
            fill: "currentColor",
            className: "text-gray-900 dark:text-white",
            id: "Vector_2",
          }),
          n.jsx("path", {
            d: Xt.p3498c380,
            fill: "currentColor",
            className: "text-gray-900 dark:text-white",
            id: "Vector_3",
          }),
          n.jsx("path", {
            d: Xt.p2c3d1bc0,
            fill: "currentColor",
            className: "text-gray-900 dark:text-white",
            id: "Vector_4",
          }),
          n.jsx("path", {
            d: Xt.p49900c0,
            fill: "currentColor",
            className: "text-gray-900 dark:text-white",
            id: "Vector_5",
          }),
          n.jsx("path", {
            d: Xt.p3c9d0680,
            fill: "currentColor",
            className: "text-gray-900 dark:text-white",
            id: "Vector_6",
          }),
          n.jsx("path", {
            d: Xt.p2e3c1a00,
            fill: "currentColor",
            className: "text-gray-900 dark:text-white",
            id: "Vector_7",
          }),
          n.jsx("path", {
            d: Xt.p8ed2400,
            fill: "currentColor",
            className: "text-gray-900 dark:text-white",
            id: "Vector_8",
          }),
          n.jsx("path", {
            d: Xt.p2b292500,
            fill: "currentColor",
            className: "text-gray-900 dark:text-white",
            id: "Vector_9",
          }),
          n.jsx("path", {
            d: Xt.p323808f0,
            fill: "currentColor",
            className: "text-gray-900 dark:text-white",
            id: "Vector_10",
          }),
          n.jsx("path", { d: Xt.p3b7d6000, fill: "#F724DE", id: "Vector_11" }),
          n.jsx("path", {
            d: Xt.p1e81d8f0,
            fill: "#000000",
            className: "dark:fill-white",
            id: "Vector_12",
          }),
          n.jsx("path", {
            d: Xt.p35052900,
            fill: "#000000",
            className: "dark:fill-white",
            id: "Vector_13",
          }),
          n.jsx("path", {
            d: Xt.p846adf0,
            fill: "#000000",
            className: "dark:fill-white",
            id: "Vector_14",
          }),
        ],
      }),
    }),
  });
}
function Py() {
  return n.jsx("div", {
    className: "relative size-full",
    "data-name": "Clip path group",
    children: n.jsx(Ry, {}),
  });
}
function Mr({ className: r = "", variant: a = "full", size: l = "md" }) {
  if (a === "icon") {
    const c = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-16 h-16" };
    return n.jsx("div", {
      className: `relative ${c[l]} ${r}`,
      children: n.jsx("div", {
        className: "absolute inset-0 flex items-center justify-center",
        style: {
          backgroundColor: "#f724de",
          borderRadius: "8px",
          transform: "rotate(-5deg)",
        },
        children: n.jsxs("svg", {
          viewBox: "0 0 50 50",
          className: "w-3/4 h-3/4",
          fill: "none",
          children: [
            n.jsx("path", {
              d: "M32.4548 27.5734L31.2598 24.8066C31.1845 24.6344 31.12 24.4515 31.0338 24.2146C32.1319 24.2254 35.4154 24.0101 36.3412 23.6334C36.6104 23.5256 36.8364 23.3318 36.9764 23.0735C37.4069 22.2877 37.7298 21.4479 38.1821 20.6729C38.5481 20.027 38.591 19.4563 38.279 18.7782C37.8698 17.863 37.9236 17.863 36.901 17.8308C36.6857 17.8308 35.6845 17.8954 35.5229 17.6263C35.2969 17.2387 35.114 16.8296 34.8771 16.3452L37.0086 16.4959C36.8364 16.033 36.6104 15.5162 36.4919 15.1287C36.3412 14.6335 36.029 14.3536 35.5769 14.149C34.1881 13.5246 32.8102 12.8572 31.4323 12.2113C30.7217 11.8775 30.0112 11.5438 29.2576 11.1993C27.8797 14.0306 26.5124 16.8404 25.1452 19.6501C24.3809 20.113 20.0855 21.9647 19.4395 22.3846C19.2243 22.5244 19.009 22.7291 18.869 22.9442C15.564 28.2732 11.9469 34.0972 8.65269 39.4477H17.9862C18.1478 39.4368 18.3738 39.2646 18.4491 39.1139C19.009 37.962 19.5473 36.7994 20.0855 35.6475C20.5054 34.7647 20.9145 33.882 21.345 32.9668C22.6585 33.7851 23.9179 34.5494 25.1452 35.3568C25.339 35.486 25.4897 35.7766 25.5221 36.0134L25.8342 39.4584H33.9512L34.791 33.8389C34.8448 33.462 34.791 33.0853 34.651 32.7301L32.4548 27.5842V27.5734Z",
              fill: "black",
            }),
            n.jsx("path", {
              d: "M31.5076 9.55264C32.8424 9.7249 33.8867 10.7799 34.059 12.1148C34.0805 12.2655 34.2957 12.2655 34.3066 12.1148C34.4788 10.7799 35.5338 9.7249 36.8686 9.55264C37.0193 9.53113 37.0193 9.31582 36.8686 9.30506C35.5338 9.1328 34.4788 8.08856 34.3066 6.75366C34.285 6.60295 34.0697 6.60295 34.059 6.75366C33.8867 8.08856 32.8424 9.1328 31.5076 9.30506C31.3567 9.32657 31.3567 9.54188 31.5076 9.55264Z",
              fill: "black",
            }),
          ],
        }),
      }),
    });
  }
  const i = {
    sm: "w-[150px] h-[28px]",
    md: "w-[200px] h-[37px]",
    lg: "w-[299px] h-[55px]",
  };
  return n.jsx("div", {
    className: `flex items-center ${r}`,
    children: n.jsx("div", {
      className: `${i[l]} relative`,
      children: n.jsx(Py, {}),
    }),
  });
}
function ae({
  variant: r = "primary",
  size: a = "md",
  children: l,
  className: i = "",
  style: c,
  as: d,
  ...f
}) {
  const m =
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
    g = {
      primary: "text-white hover:opacity-90 shadow-sm",
      secondary:
        "bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600",
      outline:
        "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800",
      ghost:
        "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
    },
    x = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-6 py-3 text-lg",
    },
    v = { ...(r === "primary" ? { backgroundColor: "#f724de" } : {}), ...c },
    p = d || "button";
  return n.jsx(p, {
    className: `${m} ${g[r]} ${x[a]} ${i}`,
    style: v,
    ...f,
    children: l,
  });
}
const St = b.forwardRef(
  ({ label: r, error: a, className: l = "", ...i }, c) => {
    const d =
      i.id || i.name || `input-${Math.random().toString(36).substring(7)}`;
    return n.jsxs("div", {
      className: "flex flex-col gap-1.5",
      children: [
        r &&
          n.jsxs("label", {
            htmlFor: d,
            className: "text-sm font-medium text-gray-700 dark:text-gray-300",
            children: [
              r,
              i.required &&
                n.jsx("span", {
                  className: "text-red-500 ml-1",
                  "aria-label": "required",
                  children: "*",
                }),
            ],
          }),
        n.jsx("input", {
          ref: c,
          id: d,
          "aria-label":
            r ?? (i["aria-label"] ? String(i["aria-label"]) : void 0),
          "aria-invalid": a ? "true" : "false",
          "aria-describedby": a ? `${d}-error` : void 0,
          className: `px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all ${a ? "border-red-500 focus:ring-red-500" : "focus:ring-pink-500"} ${l}`,
          style: { "--tw-ring-color": a ? "#ef4444" : "#f724de" },
          ...i,
        }),
        a &&
          n.jsx("span", {
            id: `${d}-error`,
            className: "text-sm text-red-600",
            role: "alert",
            children: a,
          }),
      ],
    });
  },
);
St.displayName = "Input";
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ty = (r) => r.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  _y = (r) =>
    r.replace(/^([A-Z])|[\s-_]+(\w)/g, (a, l, i) =>
      i ? i.toUpperCase() : l.toLowerCase(),
    ),
  jh = (r) => {
    const a = _y(r);
    return a.charAt(0).toUpperCase() + a.slice(1);
  },
  Rm = (...r) =>
    r
      .filter((a, l, i) => !!a && a.trim() !== "" && i.indexOf(a) === l)
      .join(" ")
      .trim();
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var Ly = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ay = b.forwardRef(
  (
    {
      color: r = "currentColor",
      size: a = 24,
      strokeWidth: l = 2,
      absoluteStrokeWidth: i,
      className: c = "",
      children: d,
      iconNode: f,
      ...m
    },
    g,
  ) =>
    b.createElement(
      "svg",
      {
        ref: g,
        ...Ly,
        width: a,
        height: a,
        stroke: r,
        strokeWidth: i ? (Number(l) * 24) / Number(a) : l,
        className: Rm("lucide", c),
        ...m,
      },
      [
        ...f.map(([x, v]) => b.createElement(x, v)),
        ...(Array.isArray(d) ? d : [d]),
      ],
    ),
);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Oe = (r, a) => {
  const l = b.forwardRef(({ className: i, ...c }, d) =>
    b.createElement(Ay, {
      ref: d,
      iconNode: a,
      className: Rm(`lucide-${Ty(jh(r))}`, `lucide-${r}`, i),
      ...c,
    }),
  );
  return ((l.displayName = jh(r)), l);
};
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Oy = [
    ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
    ["path", { d: "M19 12H5", key: "x3x0zl" }],
  ],
  Js = Oe("arrow-left", Oy);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Dy = [
    ["path", { d: "M5 12h14", key: "1ays0h" }],
    ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }],
  ],
  Pm = Oe("arrow-right", Dy);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const My = [
    ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
    [
      "path",
      {
        d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
        key: "11g9vi",
      },
    ],
  ],
  zy = Oe("bell", My);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Iy = [
    ["path", { d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z", key: "1b4qmf" }],
    ["path", { d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", key: "i71pzd" }],
    ["path", { d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", key: "10jefs" }],
    ["path", { d: "M10 6h4", key: "1itunk" }],
    ["path", { d: "M10 10h4", key: "tcdvrf" }],
    ["path", { d: "M10 14h4", key: "kelpxr" }],
    ["path", { d: "M10 18h4", key: "1ulq68" }],
  ],
  Fy = Oe("building-2", Iy);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $y = [
    ["path", { d: "M8 2v4", key: "1cmpym" }],
    ["path", { d: "M16 2v4", key: "4m81vk" }],
    [
      "rect",
      { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" },
    ],
    ["path", { d: "M3 10h18", key: "8toen8" }],
  ],
  tn = Oe("calendar", $y);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Uy = [
    ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
    ["path", { d: "M18 17V9", key: "2bz60n" }],
    ["path", { d: "M13 17V5", key: "1frdt8" }],
    ["path", { d: "M8 17v-3", key: "17ska0" }],
  ],
  By = Oe("chart-column", Uy);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Hy = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]],
  lu = Oe("check", Hy);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Vy = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
    ["line", { x1: "21.17", x2: "12", y1: "8", y2: "8", key: "a0cw5f" }],
    ["line", { x1: "3.95", x2: "8.54", y1: "6.06", y2: "14", key: "1kftof" }],
    [
      "line",
      { x1: "10.88", x2: "15.46", y1: "21.94", y2: "14", key: "1ymyh8" },
    ],
  ],
  Wy = Oe("chrome", Vy);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const qy = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
    ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }],
  ],
  rn = Oe("circle-alert", qy);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Yy = [
    ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
    ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }],
  ],
  Yn = Oe("circle-check-big", Yy);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Gy = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }],
  ],
  kh = Oe("clock", Gy);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ky = [
    [
      "path",
      {
        d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
        key: "1vdc57",
      },
    ],
    ["path", { d: "M5 21h14", key: "11awu3" }],
  ],
  Ks = Oe("crown", Ky);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Qy = [
    ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
    ["path", { d: "M10 14 21 3", key: "gplh6r" }],
    [
      "path",
      {
        d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
        key: "a6xqqp",
      },
    ],
  ],
  Tm = Oe("external-link", Qy);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Jy = [
    [
      "path",
      {
        d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
        key: "1nclc0",
      },
    ],
    ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
  ],
  ou = Oe("eye", Jy);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Xy = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    [
      "path",
      { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" },
    ],
    ["path", { d: "M2 12h20", key: "9i4pu4" }],
  ],
  Nh = Oe("globe", Xy);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Zy = [
    [
      "path",
      { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" },
    ],
    [
      "path",
      {
        d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
        key: "1d0kgt",
      },
    ],
  ],
  e1 = Oe("house", Zy);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const t1 = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]],
  qa = Oe("loader-circle", t1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const r1 = [
    ["path", { d: "M12 2v4", key: "3427ic" }],
    ["path", { d: "m16.2 7.8 2.9-2.9", key: "r700ao" }],
    ["path", { d: "M18 12h4", key: "wj9ykh" }],
    ["path", { d: "m16.2 16.2 2.9 2.9", key: "1bxg5t" }],
    ["path", { d: "M12 18v4", key: "jadmvz" }],
    ["path", { d: "m4.9 19.1 2.9-2.9", key: "bwix9q" }],
    ["path", { d: "M2 12h4", key: "j09sii" }],
    ["path", { d: "m4.9 4.9 2.9 2.9", key: "giyufr" }],
  ],
  jo = Oe("loader", r1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const n1 = [
    [
      "rect",
      {
        width: "18",
        height: "11",
        x: "3",
        y: "11",
        rx: "2",
        ry: "2",
        key: "1w4ew1",
      },
    ],
    ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }],
  ],
  s1 = Oe("lock", n1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const a1 = [
    ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }],
    ["polyline", { points: "16 17 21 12 16 7", key: "1gabdz" }],
    ["line", { x1: "21", x2: "9", y1: "12", y2: "12", key: "1uyos4" }],
  ],
  l1 = Oe("log-out", a1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const o1 = [
    [
      "rect",
      { width: "20", height: "16", x: "2", y: "4", rx: "2", key: "18n3k1" },
    ],
    ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", key: "1ocrg3" }],
  ],
  Eo = Oe("mail", o1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const i1 = [
    ["line", { x1: "4", x2: "20", y1: "12", y2: "12", key: "1e0a9i" }],
    ["line", { x1: "4", x2: "20", y1: "6", y2: "6", key: "1owob3" }],
    ["line", { x1: "4", x2: "20", y1: "18", y2: "18", key: "yk5zj1" }],
  ],
  c1 = Oe("menu", i1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const u1 = [
    ["line", { x1: "2", x2: "22", y1: "2", y2: "22", key: "a6p6uj" }],
    ["path", { d: "M18.89 13.23A7.12 7.12 0 0 0 19 12v-2", key: "80xlxr" }],
    ["path", { d: "M5 10v2a7 7 0 0 0 12 5", key: "p2k8kg" }],
    ["path", { d: "M15 9.34V5a3 3 0 0 0-5.68-1.33", key: "1gzdoj" }],
    ["path", { d: "M9 9v3a3 3 0 0 0 5.12 2.12", key: "r2i35w" }],
    ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }],
  ],
  d1 = Oe("mic-off", u1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const f1 = [
    [
      "path",
      {
        d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z",
        key: "131961",
      },
    ],
    ["path", { d: "M19 10v2a7 7 0 0 1-14 0v-2", key: "1vc78b" }],
    ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }],
  ],
  Sh = Oe("mic", f1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const h1 = [
    [
      "rect",
      { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" },
    ],
    ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
    ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }],
  ],
  _m = Oe("monitor", h1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const m1 = [
    ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }],
  ],
  p1 = Oe("moon", m1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const g1 = [
    ["path", { d: "M12 20h9", key: "t2du7b" }],
    [
      "path",
      {
        d: "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",
        key: "1ykcvy",
      },
    ],
  ],
  ho = Oe("pen-line", g1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const x1 = [
    [
      "path",
      {
        d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
        key: "1a8usu",
      },
    ],
  ],
  y1 = Oe("pen", x1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const v1 = [
    [
      "path",
      {
        d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
        key: "foiqr5",
      },
    ],
  ],
  w1 = Oe("phone", v1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const b1 = [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]],
  j1 = Oe("play", b1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const k1 = [
    ["path", { d: "M5 12h14", key: "1ays0h" }],
    ["path", { d: "M12 5v14", key: "s699le" }],
  ],
  Ro = Oe("plus", k1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const N1 = [
    [
      "path",
      {
        d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
        key: "v9h5vc",
      },
    ],
    ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
    [
      "path",
      {
        d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
        key: "3uifl3",
      },
    ],
    ["path", { d: "M8 16H3v5", key: "1cv678" }],
  ],
  S1 = Oe("refresh-cw", N1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const C1 = [
    ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
    ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }],
  ],
  Ya = Oe("search", C1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const E1 = [
    [
      "path",
      {
        d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
        key: "1ffxy3",
      },
    ],
    ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }],
  ],
  R1 = Oe("send", E1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const P1 = [
    [
      "path",
      {
        d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
        key: "1qme2f",
      },
    ],
    ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
  ],
  T1 = Oe("settings", P1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const _1 = [
    ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
    ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
    ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
    [
      "line",
      { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" },
    ],
    [
      "line",
      { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" },
    ],
  ],
  L1 = Oe("share-2", _1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const A1 = [
    [
      "path",
      {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
        key: "oel41y",
      },
    ],
  ],
  Lm = Oe("shield", A1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const O1 = [
    [
      "rect",
      {
        width: "14",
        height: "20",
        x: "5",
        y: "2",
        rx: "2",
        ry: "2",
        key: "1yt0o3",
      },
    ],
    ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ],
  D1 = Oe("smartphone", O1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const M1 = [
    [
      "path",
      {
        d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
        key: "4pj2yx",
      },
    ],
    ["path", { d: "M20 3v4", key: "1olli1" }],
    ["path", { d: "M22 5h-4", key: "1gvqau" }],
    ["path", { d: "M4 17v2", key: "vumght" }],
    ["path", { d: "M5 18H3", key: "zchphs" }],
  ],
  Po = Oe("sparkles", M1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const z1 = [
    ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
    ["path", { d: "M12 2v2", key: "tus03m" }],
    ["path", { d: "M12 20v2", key: "1lh1kg" }],
    ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
    ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
    ["path", { d: "M2 12h2", key: "1t8f8n" }],
    ["path", { d: "M20 12h2", key: "1q8mjw" }],
    ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
    ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }],
  ],
  I1 = Oe("sun", z1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const F1 = [
    ["path", { d: "M3 6h18", key: "d0wm0j" }],
    ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
    ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
    ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
    ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }],
  ],
  Am = Oe("trash-2", F1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $1 = [
    ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }],
    ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }],
  ],
  iu = Oe("trending-up", $1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const U1 = [
    [
      "path",
      {
        d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
        key: "wmoenq",
      },
    ],
    ["path", { d: "M12 9v4", key: "juzpu7" }],
    ["path", { d: "M12 17h.01", key: "p32p05" }],
  ],
  B1 = Oe("triangle-alert", U1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const H1 = [
    ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
    ["polyline", { points: "17 8 12 3 7 8", key: "t8dd8p" }],
    ["line", { x1: "12", x2: "12", y1: "3", y2: "15", key: "widbto" }],
  ],
  V1 = Oe("upload", H1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const W1 = [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
    ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
    ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
    ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75", key: "1da9ce" }],
  ],
  Ch = Oe("users", W1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const q1 = [
    [
      "path",
      {
        d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
        key: "uqj9uw",
      },
    ],
    ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
    ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }],
  ],
  Y1 = Oe("volume-2", q1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const G1 = [
    [
      "path",
      {
        d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
        key: "uqj9uw",
      },
    ],
    ["line", { x1: "22", x2: "16", y1: "9", y2: "15", key: "1ewh16" }],
    ["line", { x1: "16", x2: "22", y1: "9", y2: "15", key: "5ykzw1" }],
  ],
  K1 = Oe("volume-x", G1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Q1 = [
    ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
    ["path", { d: "m6 6 12 12", key: "d8bk6v" }],
  ],
  Ga = Oe("x", Q1);
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const J1 = [
    [
      "path",
      {
        d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
        key: "1xq2db",
      },
    ],
  ],
  el = Oe("zap", J1),
  Om = b.createContext(void 0);
function X1() {
  return typeof window > "u" || typeof window.matchMedia != "function"
    ? !1
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function Z1({ children: r }) {
  const [a, l] = b.useState(() => {
    try {
      return (
        (typeof window < "u" ? localStorage.getItem("theme") : null) || "system"
      );
    } catch {
      return "system";
    }
  });
  b.useEffect(() => {
    try {
      localStorage.setItem("theme", a);
    } catch {}
    const d = (f) => {
      f
        ? document.documentElement.classList.add("dark")
        : document.documentElement.classList.remove("dark");
    };
    if (a === "system") {
      d(X1());
      const f = window.matchMedia("(prefers-color-scheme: dark)"),
        m = (g) => d(g.matches);
      return (
        f.addEventListener ? f.addEventListener("change", m) : f.addListener(m),
        () => {
          f.removeEventListener
            ? f.removeEventListener("change", m)
            : f.removeListener(m);
        }
      );
    } else d(a === "dark");
  }, [a]);
  const i = (d) => l(d),
    c = () => {
      l((d) => (d === "light" ? "dark" : d === "dark" ? "system" : "light"));
    };
  return n.jsx(Om.Provider, {
    value: { theme: a, setTheme: i, toggleTheme: c },
    children: r,
  });
}
function ev() {
  const r = b.useContext(Om);
  if (r === void 0)
    throw new Error("useTheme must be used within a ThemeProvider");
  return r;
}
function bs() {
  const { theme: r, toggleTheme: a } = ev(),
    l = `Theme: ${r}`;
  return n.jsxs("button", {
    onClick: a,
    className:
      "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
    "aria-label": l,
    title: l,
    children: [
      r === "light" && n.jsx(I1, { className: "w-5 h-5 text-gray-700" }),
      r === "dark" && n.jsx(p1, { className: "w-5 h-5 text-gray-300" }),
      r === "system" && n.jsx(_m, { className: "w-5 h-5 text-gray-500" }),
    ],
  });
}
const Rc = "https://hoblkikpxqfsnhunlpqs.supabase.co",
  Pc =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvYmxraWtweHFmc25odW5scHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NjMzNjAsImV4cCI6MjA4NTMzOTM2MH0.nDqMXRZfTS3-2KFHty99jJi0nnW7GuvyXOKY6O42ZfQ",
  Tc = {
    auth: {
      async signUp(r, a) {
        console.log("Supabase SignUp:", r);
        const i = await (
          await fetch(`${Rc}/auth/v1/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: Pc },
            body: JSON.stringify({ email: r, password: a }),
          })
        ).json();
        return (
          console.log("SignUp response:", i),
          i.session &&
            (localStorage.setItem(
              "supabase.auth.token",
              i.session.access_token,
            ),
            localStorage.setItem(
              "supabase.refresh.token",
              i.session.refresh_token || "",
            )),
          { data: i.user, error: i.error }
        );
      },
      async signIn(r, a) {
        console.log("Supabase SignIn:", r);
        const i = await (
          await fetch(`${Rc}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: Pc },
            body: JSON.stringify({ email: r, password: a }),
          })
        ).json();
        return (
          console.log("SignIn response:", { hasToken: !!i.access_token }),
          i.access_token &&
            (localStorage.setItem("supabase.auth.token", i.access_token),
            localStorage.setItem(
              "supabase.refresh.token",
              i.refresh_token || "",
            ),
            console.log("Token saved to localStorage")),
          { data: { session: i, user: i.user }, error: i.error }
        );
      },
      async signOut() {
        const r = localStorage.getItem("supabase.auth.token");
        (r &&
          (await fetch(`${Rc}/auth/v1/logout`, {
            method: "POST",
            headers: { Authorization: `Bearer ${r}`, apikey: Pc },
          }).catch(() => {})),
          localStorage.removeItem("supabase.auth.token"),
          localStorage.removeItem("supabase.refresh.token"));
      },
      async getSession() {
        const r = localStorage.getItem("supabase.auth.token");
        return { data: { session: r ? { access_token: r } : null } };
      },
      onAuthStateChange(r) {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
  },
  tv = () =>
    typeof window < "u"
      ? `http://${window.location.hostname}:3001`
      : "http://localhost:3001",
  Dm = b.createContext(void 0),
  rv = 300 * 1e3;
function nv(r) {
  if (!r) return null;
  try {
    const a = r.split(".");
    if (a.length !== 3) return null;
    const l = a[1].replace(/-/g, "+").replace(/_/g, "/"),
      i = decodeURIComponent(
        atob(l)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
    return JSON.parse(i);
  } catch {
    return null;
  }
}
function sv({ children: r }) {
  const [a, l] = b.useState(null),
    [i, c] = b.useState(!1),
    d = b.useRef(null),
    f = () => {
      (d.current && clearTimeout(d.current),
        localStorage.getItem("supabase.auth.token") &&
          (d.current = setTimeout(() => {
            (console.log("Inactivity timeout - auto signing out"),
              localStorage.removeItem("supabase.auth.token"),
              localStorage.removeItem("supabase.refresh.token"),
              l(null),
              window.dispatchEvent(new Event("auth:inactivity-logout")));
          }, rv)));
    };
  b.useEffect(() => {
    (console.log("=== AuthProvider useEffect initializing ==="),
      (async () => {
        try {
          const E = localStorage.getItem("supabase.auth.token");
          if (
            (console.log(
              "Token from localStorage:",
              E ? `${E.substring(0, 20)}...` : "NOT FOUND",
            ),
            E)
          ) {
            const D = nv(E);
            (console.log("Parsed JWT payload:", D),
              D && D.sub
                ? (l({ id: D.sub, email: D.email }),
                  console.log("User set from token:", D.sub))
                : (console.log("Invalid token payload"),
                  localStorage.removeItem("supabase.auth.token"),
                  localStorage.removeItem("supabase.refresh.token")));
          }
        } catch (E) {
          console.error("Error loading session:", E);
        }
      })());
    const L = ["mousedown", "keydown", "scroll", "touchstart", "click"],
      j = () => {
        f();
      };
    return (
      L.forEach((E) => {
        document.addEventListener(E, j);
      }),
      f(),
      () => {
        (L.forEach((E) => {
          document.removeEventListener(E, j);
        }),
          d.current && clearTimeout(d.current));
      }
    );
  }, []);
  const m = async (S, L) => {
      c(!0);
      try {
        console.log("=== Supabase SignIn START ===");
        const { data: j, error: E } = await Tc.auth.signIn(S, L);
        if (E)
          throw (
            console.error("SignIn error:", E),
            new Error(E.message || "Sign in failed")
          );
        const D = localStorage.getItem("supabase.auth.token");
        (console.log("Token saved:", !!D),
          j?.user &&
            (l({
              id: j.user.id,
              email: j.user.email,
              full_name: j.user.user_metadata?.full_name,
            }),
            console.log("User set:", j.user.email)),
          f(),
          console.log("=== Supabase SignIn SUCCESS ==="));
      } catch (j) {
        throw (
          console.error("=== SignIn FAILED ===", j.message),
          alert(`Sign in failed: ${j.message}`),
          j
        );
      } finally {
        c(!1);
      }
    },
    g = async (S, L, j) => {
      c(!0);
      try {
        console.log("=== Supabase SignUp START ===");
        const { data: E, error: D } = await Tc.auth.signUp(S, L);
        if (D)
          throw (
            console.error("SignUp error:", D),
            new Error(D.message || "Sign up failed")
          );
        const H = localStorage.getItem("supabase.auth.token");
        (console.log("Token saved:", !!H),
          E?.user &&
            (l({ id: E.user.id, email: E.user.email, full_name: j }),
            console.log("User set:", E.user.email)),
          f(),
          console.log("=== Supabase SignUp SUCCESS ==="));
      } catch (E) {
        throw (
          console.error("=== SignUp FAILED ===", E.message),
          alert(`Sign up failed: ${E.message}`),
          E
        );
      } finally {
        c(!1);
      }
    },
    x = async () => {
      c(!0);
      try {
        (console.log("=== SignOut START ==="),
          await Tc.auth.signOut(),
          l(null),
          d.current && (clearTimeout(d.current), (d.current = null)),
          console.log("=== SignOut SUCCESS ==="));
      } finally {
        c(!1);
      }
    },
    v = async () => {
      const S = "http://localhost:3001".replace(/\/+$/g, "");
      window.location.href = `${S}/auth/google`;
    },
    p = async () => {
      const S = "http://localhost:3001".replace(/\/+$/g, "");
      window.location.href = `${S}/auth/apple`;
    },
    k = async (S) => {
      c(!0);
      try {
        const L = tv().replace(/\/+$/g, "");
        await fetch(`${L}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: S }),
        });
      } catch (L) {
        console.error("Password reset error:", L);
      } finally {
        c(!1);
      }
    },
    R = () => localStorage.getItem("supabase.auth.token");
  return n.jsx(Dm.Provider, {
    value: {
      user: a,
      loading: i,
      signIn: m,
      signUp: g,
      signOut: x,
      signInWithGoogle: v,
      signInWithApple: p,
      resetPassword: k,
      getToken: R,
    },
    children: r,
  });
}
function Kn() {
  const r = b.useContext(Dm);
  if (r === void 0)
    throw new Error("useAuth must be used within an AuthProvider");
  return r;
}
var av = Qh();
const lv = Kh(av);
function ov(r) {
  if (typeof document > "u") return;
  let a = document.head || document.getElementsByTagName("head")[0],
    l = document.createElement("style");
  ((l.type = "text/css"),
    a.appendChild(l),
    l.styleSheet
      ? (l.styleSheet.cssText = r)
      : l.appendChild(document.createTextNode(r)));
}
const iv = (r) => {
    switch (r) {
      case "success":
        return dv;
      case "info":
        return hv;
      case "warning":
        return fv;
      case "error":
        return mv;
      default:
        return null;
    }
  },
  cv = Array(12).fill(0),
  uv = ({ visible: r, className: a }) =>
    le.createElement(
      "div",
      {
        className: ["sonner-loading-wrapper", a].filter(Boolean).join(" "),
        "data-visible": r,
      },
      le.createElement(
        "div",
        { className: "sonner-spinner" },
        cv.map((l, i) =>
          le.createElement("div", {
            className: "sonner-loading-bar",
            key: `spinner-bar-${i}`,
          }),
        ),
      ),
    ),
  dv = le.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 20 20",
      fill: "currentColor",
      height: "20",
      width: "20",
    },
    le.createElement("path", {
      fillRule: "evenodd",
      d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
      clipRule: "evenodd",
    }),
  ),
  fv = le.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      height: "20",
      width: "20",
    },
    le.createElement("path", {
      fillRule: "evenodd",
      d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z",
      clipRule: "evenodd",
    }),
  ),
  hv = le.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 20 20",
      fill: "currentColor",
      height: "20",
      width: "20",
    },
    le.createElement("path", {
      fillRule: "evenodd",
      d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z",
      clipRule: "evenodd",
    }),
  ),
  mv = le.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 20 20",
      fill: "currentColor",
      height: "20",
      width: "20",
    },
    le.createElement("path", {
      fillRule: "evenodd",
      d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z",
      clipRule: "evenodd",
    }),
  ),
  pv = le.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    le.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
    le.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }),
  ),
  gv = () => {
    const [r, a] = le.useState(document.hidden);
    return (
      le.useEffect(() => {
        const l = () => {
          a(document.hidden);
        };
        return (
          document.addEventListener("visibilitychange", l),
          () => window.removeEventListener("visibilitychange", l)
        );
      }, []),
      r
    );
  };
let $c = 1;
class xv {
  constructor() {
    ((this.subscribe = (a) => (
      this.subscribers.push(a),
      () => {
        const l = this.subscribers.indexOf(a);
        this.subscribers.splice(l, 1);
      }
    )),
      (this.publish = (a) => {
        this.subscribers.forEach((l) => l(a));
      }),
      (this.addToast = (a) => {
        (this.publish(a), (this.toasts = [...this.toasts, a]));
      }),
      (this.create = (a) => {
        var l;
        const { message: i, ...c } = a,
          d =
            typeof a?.id == "number" ||
            ((l = a.id) == null ? void 0 : l.length) > 0
              ? a.id
              : $c++,
          f = this.toasts.find((g) => g.id === d),
          m = a.dismissible === void 0 ? !0 : a.dismissible;
        return (
          this.dismissedToasts.has(d) && this.dismissedToasts.delete(d),
          f
            ? (this.toasts = this.toasts.map((g) =>
                g.id === d
                  ? (this.publish({ ...g, ...a, id: d, title: i }),
                    { ...g, ...a, id: d, dismissible: m, title: i })
                  : g,
              ))
            : this.addToast({ title: i, ...c, dismissible: m, id: d }),
          d
        );
      }),
      (this.dismiss = (a) => (
        a
          ? (this.dismissedToasts.add(a),
            requestAnimationFrame(() =>
              this.subscribers.forEach((l) => l({ id: a, dismiss: !0 })),
            ))
          : this.toasts.forEach((l) => {
              this.subscribers.forEach((i) => i({ id: l.id, dismiss: !0 }));
            }),
        a
      )),
      (this.message = (a, l) => this.create({ ...l, message: a })),
      (this.error = (a, l) => this.create({ ...l, message: a, type: "error" })),
      (this.success = (a, l) =>
        this.create({ ...l, type: "success", message: a })),
      (this.info = (a, l) => this.create({ ...l, type: "info", message: a })),
      (this.warning = (a, l) =>
        this.create({ ...l, type: "warning", message: a })),
      (this.loading = (a, l) =>
        this.create({ ...l, type: "loading", message: a })),
      (this.promise = (a, l) => {
        if (!l) return;
        let i;
        l.loading !== void 0 &&
          (i = this.create({
            ...l,
            promise: a,
            type: "loading",
            message: l.loading,
            description:
              typeof l.description != "function" ? l.description : void 0,
          }));
        const c = Promise.resolve(a instanceof Function ? a() : a);
        let d = i !== void 0,
          f;
        const m = c
            .then(async (x) => {
              if (((f = ["resolve", x]), le.isValidElement(x)))
                ((d = !1), this.create({ id: i, type: "default", message: x }));
              else if (vv(x) && !x.ok) {
                d = !1;
                const p =
                    typeof l.error == "function"
                      ? await l.error(`HTTP error! status: ${x.status}`)
                      : l.error,
                  k =
                    typeof l.description == "function"
                      ? await l.description(`HTTP error! status: ${x.status}`)
                      : l.description,
                  S =
                    typeof p == "object" && !le.isValidElement(p)
                      ? p
                      : { message: p };
                this.create({ id: i, type: "error", description: k, ...S });
              } else if (x instanceof Error) {
                d = !1;
                const p =
                    typeof l.error == "function" ? await l.error(x) : l.error,
                  k =
                    typeof l.description == "function"
                      ? await l.description(x)
                      : l.description,
                  S =
                    typeof p == "object" && !le.isValidElement(p)
                      ? p
                      : { message: p };
                this.create({ id: i, type: "error", description: k, ...S });
              } else if (l.success !== void 0) {
                d = !1;
                const p =
                    typeof l.success == "function"
                      ? await l.success(x)
                      : l.success,
                  k =
                    typeof l.description == "function"
                      ? await l.description(x)
                      : l.description,
                  S =
                    typeof p == "object" && !le.isValidElement(p)
                      ? p
                      : { message: p };
                this.create({ id: i, type: "success", description: k, ...S });
              }
            })
            .catch(async (x) => {
              if (((f = ["reject", x]), l.error !== void 0)) {
                d = !1;
                const v =
                    typeof l.error == "function" ? await l.error(x) : l.error,
                  p =
                    typeof l.description == "function"
                      ? await l.description(x)
                      : l.description,
                  R =
                    typeof v == "object" && !le.isValidElement(v)
                      ? v
                      : { message: v };
                this.create({ id: i, type: "error", description: p, ...R });
              }
            })
            .finally(() => {
              (d && (this.dismiss(i), (i = void 0)),
                l.finally == null || l.finally.call(l));
            }),
          g = () =>
            new Promise((x, v) =>
              m.then(() => (f[0] === "reject" ? v(f[1]) : x(f[1]))).catch(v),
            );
        return typeof i != "string" && typeof i != "number"
          ? { unwrap: g }
          : Object.assign(i, { unwrap: g });
      }),
      (this.custom = (a, l) => {
        const i = l?.id || $c++;
        return (this.create({ jsx: a(i), id: i, ...l }), i);
      }),
      (this.getActiveToasts = () =>
        this.toasts.filter((a) => !this.dismissedToasts.has(a.id))),
      (this.subscribers = []),
      (this.toasts = []),
      (this.dismissedToasts = new Set()));
  }
}
const Zt = new xv(),
  yv = (r, a) => {
    const l = a?.id || $c++;
    return (Zt.addToast({ title: r, ...a, id: l }), l);
  },
  vv = (r) =>
    r &&
    typeof r == "object" &&
    "ok" in r &&
    typeof r.ok == "boolean" &&
    "status" in r &&
    typeof r.status == "number",
  wv = yv,
  bv = () => Zt.toasts,
  jv = () => Zt.getActiveToasts(),
  Eh = Object.assign(
    wv,
    {
      success: Zt.success,
      info: Zt.info,
      warning: Zt.warning,
      error: Zt.error,
      custom: Zt.custom,
      message: Zt.message,
      promise: Zt.promise,
      dismiss: Zt.dismiss,
      loading: Zt.loading,
    },
    { getHistory: bv, getToasts: jv },
  );
ov(
  "[data-sonner-toaster][dir=ltr],html[dir=ltr]{--toast-icon-margin-start:-3px;--toast-icon-margin-end:4px;--toast-svg-margin-start:-1px;--toast-svg-margin-end:0px;--toast-button-margin-start:auto;--toast-button-margin-end:0;--toast-close-button-start:0;--toast-close-button-end:unset;--toast-close-button-transform:translate(-35%, -35%)}[data-sonner-toaster][dir=rtl],html[dir=rtl]{--toast-icon-margin-start:4px;--toast-icon-margin-end:-3px;--toast-svg-margin-start:0px;--toast-svg-margin-end:-1px;--toast-button-margin-start:0;--toast-button-margin-end:auto;--toast-close-button-start:unset;--toast-close-button-end:0;--toast-close-button-transform:translate(35%, -35%)}[data-sonner-toaster]{position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1:hsl(0, 0%, 99%);--gray2:hsl(0, 0%, 97.3%);--gray3:hsl(0, 0%, 95.1%);--gray4:hsl(0, 0%, 93%);--gray5:hsl(0, 0%, 90.9%);--gray6:hsl(0, 0%, 88.7%);--gray7:hsl(0, 0%, 85.8%);--gray8:hsl(0, 0%, 78%);--gray9:hsl(0, 0%, 56.1%);--gray10:hsl(0, 0%, 52.3%);--gray11:hsl(0, 0%, 43.5%);--gray12:hsl(0, 0%, 9%);--border-radius:8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:0;z-index:999999999;transition:transform .4s ease}@media (hover:none) and (pointer:coarse){[data-sonner-toaster][data-lifted=true]{transform:none}}[data-sonner-toaster][data-x-position=right]{right:var(--offset-right)}[data-sonner-toaster][data-x-position=left]{left:var(--offset-left)}[data-sonner-toaster][data-x-position=center]{left:50%;transform:translateX(-50%)}[data-sonner-toaster][data-y-position=top]{top:var(--offset-top)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--offset-bottom)}[data-sonner-toast]{--y:translateY(100%);--lift-amount:calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:0;overflow-wrap:anywhere}[data-sonner-toast][data-styled=true]{padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px rgba(0,0,0,.1);width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}[data-sonner-toast]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-y-position=top]{top:0;--y:translateY(-100%);--lift:1;--lift-amount:calc(1 * var(--gap))}[data-sonner-toast][data-y-position=bottom]{bottom:0;--y:translateY(100%);--lift:-1;--lift-amount:calc(var(--lift) * var(--gap))}[data-sonner-toast][data-styled=true] [data-description]{font-weight:400;line-height:1.4;color:#3f3f3f}[data-rich-colors=true][data-sonner-toast][data-styled=true] [data-description]{color:inherit}[data-sonner-toaster][data-sonner-theme=dark] [data-description]{color:#e8e8e8}[data-sonner-toast][data-styled=true] [data-title]{font-weight:500;line-height:1.5;color:inherit}[data-sonner-toast][data-styled=true] [data-icon]{display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}[data-sonner-toast][data-promise=true] [data-icon]>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}[data-sonner-toast][data-styled=true] [data-icon]>*{flex-shrink:0}[data-sonner-toast][data-styled=true] [data-icon] svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}[data-sonner-toast][data-styled=true] [data-content]{display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;font-weight:500;cursor:pointer;outline:0;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}[data-sonner-toast][data-styled=true] [data-button]:focus-visible{box-shadow:0 0 0 2px rgba(0,0,0,.4)}[data-sonner-toast][data-styled=true] [data-button]:first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}[data-sonner-toast][data-styled=true] [data-cancel]{color:var(--normal-text);background:rgba(0,0,0,.08)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-styled=true] [data-cancel]{background:rgba(255,255,255,.3)}[data-sonner-toast][data-styled=true] [data-close-button]{position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);background:var(--normal-bg);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast][data-styled=true] [data-close-button]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-styled=true] [data-disabled=true]{cursor:not-allowed}[data-sonner-toast][data-styled=true]:hover [data-close-button]:hover{background:var(--gray2);border-color:var(--gray5)}[data-sonner-toast][data-swiping=true]::before{content:'';position:absolute;left:-100%;right:-100%;height:100%;z-index:-1}[data-sonner-toast][data-y-position=top][data-swiping=true]::before{bottom:50%;transform:scaleY(3) translateY(50%)}[data-sonner-toast][data-y-position=bottom][data-swiping=true]::before{top:50%;transform:scaleY(3) translateY(-50%)}[data-sonner-toast][data-swiping=false][data-removed=true]::before{content:'';position:absolute;inset:0;transform:scaleY(2)}[data-sonner-toast][data-expanded=true]::after{content:'';position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}[data-sonner-toast][data-mounted=true]{--y:translateY(0);opacity:1}[data-sonner-toast][data-expanded=false][data-front=false]{--scale:var(--toasts-before) * 0.05 + 1;--y:translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}[data-sonner-toast]>*{transition:opacity .4s}[data-sonner-toast][data-x-position=right]{right:0}[data-sonner-toast][data-x-position=left]{left:0}[data-sonner-toast][data-expanded=false][data-front=false][data-styled=true]>*{opacity:0}[data-sonner-toast][data-visible=false]{opacity:0;pointer-events:none}[data-sonner-toast][data-mounted=true][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}[data-sonner-toast][data-removed=true][data-front=true][data-swipe-out=false]{--y:translateY(calc(var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=false]{--y:translateY(40%);opacity:0;transition:transform .5s,opacity .2s}[data-sonner-toast][data-removed=true][data-front=false]::before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y,0)) translateX(var(--swipe-amount-x,0));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width:600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-sonner-theme=light]{--normal-bg:#fff;--normal-border:var(--gray4);--normal-text:var(--gray12);--success-bg:hsl(143, 85%, 96%);--success-border:hsl(145, 92%, 87%);--success-text:hsl(140, 100%, 27%);--info-bg:hsl(208, 100%, 97%);--info-border:hsl(221, 91%, 93%);--info-text:hsl(210, 92%, 45%);--warning-bg:hsl(49, 100%, 97%);--warning-border:hsl(49, 91%, 84%);--warning-text:hsl(31, 92%, 45%);--error-bg:hsl(359, 100%, 97%);--error-border:hsl(359, 100%, 94%);--error-text:hsl(360, 100%, 45%)}[data-sonner-toaster][data-sonner-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg:#fff;--normal-border:var(--gray3);--normal-text:var(--gray12)}[data-sonner-toaster][data-sonner-theme=dark]{--normal-bg:#000;--normal-bg-hover:hsl(0, 0%, 12%);--normal-border:hsl(0, 0%, 20%);--normal-border-hover:hsl(0, 0%, 25%);--normal-text:var(--gray1);--success-bg:hsl(150, 100%, 6%);--success-border:hsl(147, 100%, 12%);--success-text:hsl(150, 86%, 65%);--info-bg:hsl(215, 100%, 6%);--info-border:hsl(223, 43%, 17%);--info-text:hsl(216, 87%, 65%);--warning-bg:hsl(64, 100%, 6%);--warning-border:hsl(60, 100%, 9%);--warning-text:hsl(46, 87%, 65%);--error-bg:hsl(358, 76%, 10%);--error-border:hsl(357, 89%, 16%);--error-text:hsl(358, 100%, 81%)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size:16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:first-child{animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}100%{opacity:.15}}@media (prefers-reduced-motion){.sonner-loading-bar,[data-sonner-toast],[data-sonner-toast]>*{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}",
);
function mo(r) {
  return r.label !== void 0;
}
const kv = 3,
  Nv = "24px",
  Sv = "16px",
  Rh = 4e3,
  Cv = 356,
  Ev = 14,
  Rv = 45,
  Pv = 200;
function Xr(...r) {
  return r.filter(Boolean).join(" ");
}
function Tv(r) {
  const [a, l] = r.split("-"),
    i = [];
  return (a && i.push(a), l && i.push(l), i);
}
const _v = (r) => {
  var a, l, i, c, d, f, m, g, x;
  const {
      invert: v,
      toast: p,
      unstyled: k,
      interacting: R,
      setHeights: S,
      visibleToasts: L,
      heights: j,
      index: E,
      toasts: D,
      expanded: H,
      removeToast: G,
      defaultRichColors: F,
      closeButton: U,
      style: P,
      cancelButtonStyle: Y,
      actionButtonStyle: oe,
      className: ce = "",
      descriptionClassName: Le = "",
      duration: de,
      position: Re,
      gap: ve,
      expandByDefault: me,
      classNames: Q,
      icons: ue,
      closeButtonAriaLabel: V = "Close toast",
    } = r,
    [ne, ee] = le.useState(null),
    [w, _] = le.useState(null),
    [W, Z] = le.useState(!1),
    [q, ie] = le.useState(!1),
    [xe, fe] = le.useState(!1),
    [Ie, rt] = le.useState(!1),
    [Ht, qe] = le.useState(!1),
    [rr, $r] = le.useState(0),
    [js, nr] = le.useState(0),
    Cr = le.useRef(p.duration || de || Rh),
    Qn = le.useRef(null),
    Pt = le.useRef(null),
    sn = E === 0,
    Ur = E + 1 <= L,
    yt = p.type,
    Er = p.dismissible !== !1,
    hr = p.className || "",
    Br = p.descriptionClassName || "",
    Hr = le.useMemo(
      () => j.findIndex((Me) => Me.toastId === p.id) || 0,
      [j, p.id],
    ),
    an = le.useMemo(() => {
      var Me;
      return (Me = p.closeButton) != null ? Me : U;
    }, [p.closeButton, U]),
    Ct = le.useMemo(() => p.duration || de || Rh, [p.duration, de]),
    Tt = le.useRef(0),
    It = le.useRef(0),
    Vr = le.useRef(0),
    mr = le.useRef(null),
    [ks, Vt] = Re.split("-"),
    Jn = le.useMemo(
      () => j.reduce((Me, nt, it) => (it >= Hr ? Me : Me + nt.height), 0),
      [j, Hr],
    ),
    ln = gv(),
    bn = p.invert || v,
    on = yt === "loading";
  ((It.current = le.useMemo(() => Hr * ve + Jn, [Hr, Jn])),
    le.useEffect(() => {
      Cr.current = Ct;
    }, [Ct]),
    le.useEffect(() => {
      Z(!0);
    }, []),
    le.useEffect(() => {
      const Me = Pt.current;
      if (Me) {
        const nt = Me.getBoundingClientRect().height;
        return (
          nr(nt),
          S((it) => [
            { toastId: p.id, height: nt, position: p.position },
            ...it,
          ]),
          () => S((it) => it.filter((ut) => ut.toastId !== p.id))
        );
      }
    }, [S, p.id]),
    le.useLayoutEffect(() => {
      if (!W) return;
      const Me = Pt.current,
        nt = Me.style.height;
      Me.style.height = "auto";
      const it = Me.getBoundingClientRect().height;
      ((Me.style.height = nt),
        nr(it),
        S((ut) =>
          ut.find((st) => st.toastId === p.id)
            ? ut.map((st) => (st.toastId === p.id ? { ...st, height: it } : st))
            : [{ toastId: p.id, height: it, position: p.position }, ...ut],
        ));
    }, [W, p.title, p.description, S, p.id, p.jsx, p.action, p.cancel]));
  const Ft = le.useCallback(() => {
    (ie(!0),
      $r(It.current),
      S((Me) => Me.filter((nt) => nt.toastId !== p.id)),
      setTimeout(() => {
        G(p);
      }, Pv));
  }, [p, G, S, It]);
  (le.useEffect(() => {
    if (
      (p.promise && yt === "loading") ||
      p.duration === 1 / 0 ||
      p.type === "loading"
    )
      return;
    let Me;
    return (
      H || R || ln
        ? (() => {
            if (Vr.current < Tt.current) {
              const ut = new Date().getTime() - Tt.current;
              Cr.current = Cr.current - ut;
            }
            Vr.current = new Date().getTime();
          })()
        : (() => {
            Cr.current !== 1 / 0 &&
              ((Tt.current = new Date().getTime()),
              (Me = setTimeout(() => {
                (p.onAutoClose == null || p.onAutoClose.call(p, p), Ft());
              }, Cr.current)));
          })(),
      () => clearTimeout(Me)
    );
  }, [H, R, p, yt, ln, Ft]),
    le.useEffect(() => {
      p.delete && (Ft(), p.onDismiss == null || p.onDismiss.call(p, p));
    }, [Ft, p.delete]));
  function Wr() {
    var Me;
    if (ue?.loading) {
      var nt;
      return le.createElement(
        "div",
        {
          className: Xr(
            Q?.loader,
            p == null || (nt = p.classNames) == null ? void 0 : nt.loader,
            "sonner-loader",
          ),
          "data-visible": yt === "loading",
        },
        ue.loading,
      );
    }
    return le.createElement(uv, {
      className: Xr(
        Q?.loader,
        p == null || (Me = p.classNames) == null ? void 0 : Me.loader,
      ),
      visible: yt === "loading",
    });
  }
  const Rr = p.icon || ue?.[yt] || iv(yt);
  var sr, Xn;
  return le.createElement(
    "li",
    {
      tabIndex: 0,
      ref: Pt,
      className: Xr(
        ce,
        hr,
        Q?.toast,
        p == null || (a = p.classNames) == null ? void 0 : a.toast,
        Q?.default,
        Q?.[yt],
        p == null || (l = p.classNames) == null ? void 0 : l[yt],
      ),
      "data-sonner-toast": "",
      "data-rich-colors": (sr = p.richColors) != null ? sr : F,
      "data-styled": !(p.jsx || p.unstyled || k),
      "data-mounted": W,
      "data-promise": !!p.promise,
      "data-swiped": Ht,
      "data-removed": q,
      "data-visible": Ur,
      "data-y-position": ks,
      "data-x-position": Vt,
      "data-index": E,
      "data-front": sn,
      "data-swiping": xe,
      "data-dismissible": Er,
      "data-type": yt,
      "data-invert": bn,
      "data-swipe-out": Ie,
      "data-swipe-direction": w,
      "data-expanded": !!(H || (me && W)),
      "data-testid": p.testId,
      style: {
        "--index": E,
        "--toasts-before": E,
        "--z-index": D.length - E,
        "--offset": `${q ? rr : It.current}px`,
        "--initial-height": me ? "auto" : `${js}px`,
        ...P,
        ...p.style,
      },
      onDragEnd: () => {
        (fe(!1), ee(null), (mr.current = null));
      },
      onPointerDown: (Me) => {
        Me.button !== 2 &&
          (on ||
            !Er ||
            ((Qn.current = new Date()),
            $r(It.current),
            Me.target.setPointerCapture(Me.pointerId),
            Me.target.tagName !== "BUTTON" &&
              (fe(!0), (mr.current = { x: Me.clientX, y: Me.clientY }))));
      },
      onPointerUp: () => {
        var Me, nt, it;
        if (Ie || !Er) return;
        mr.current = null;
        const ut = Number(
            ((Me = Pt.current) == null
              ? void 0
              : Me.style
                  .getPropertyValue("--swipe-amount-x")
                  .replace("px", "")) || 0,
          ),
          ar = Number(
            ((nt = Pt.current) == null
              ? void 0
              : nt.style
                  .getPropertyValue("--swipe-amount-y")
                  .replace("px", "")) || 0,
          ),
          st =
            new Date().getTime() -
            ((it = Qn.current) == null ? void 0 : it.getTime()),
          pt = ne === "x" ? ut : ar,
          qr = Math.abs(pt) / st;
        if (Math.abs(pt) >= Rv || qr > 0.11) {
          ($r(It.current),
            p.onDismiss == null || p.onDismiss.call(p, p),
            _(
              ne === "x" ? (ut > 0 ? "right" : "left") : ar > 0 ? "down" : "up",
            ),
            Ft(),
            rt(!0));
          return;
        } else {
          var C, O;
          ((C = Pt.current) == null ||
            C.style.setProperty("--swipe-amount-x", "0px"),
            (O = Pt.current) == null ||
              O.style.setProperty("--swipe-amount-y", "0px"));
        }
        (qe(!1), fe(!1), ee(null));
      },
      onPointerMove: (Me) => {
        var nt, it, ut;
        if (
          !mr.current ||
          !Er ||
          ((nt = window.getSelection()) == null
            ? void 0
            : nt.toString().length) > 0
        )
          return;
        const st = Me.clientY - mr.current.y,
          pt = Me.clientX - mr.current.x;
        var qr;
        const C = (qr = r.swipeDirections) != null ? qr : Tv(Re);
        !ne &&
          (Math.abs(pt) > 1 || Math.abs(st) > 1) &&
          ee(Math.abs(pt) > Math.abs(st) ? "x" : "y");
        let O = { x: 0, y: 0 };
        const I = (K) => 1 / (1.5 + Math.abs(K) / 20);
        if (ne === "y") {
          if (C.includes("top") || C.includes("bottom"))
            if (
              (C.includes("top") && st < 0) ||
              (C.includes("bottom") && st > 0)
            )
              O.y = st;
            else {
              const K = st * I(st);
              O.y = Math.abs(K) < Math.abs(st) ? K : st;
            }
        } else if (ne === "x" && (C.includes("left") || C.includes("right")))
          if ((C.includes("left") && pt < 0) || (C.includes("right") && pt > 0))
            O.x = pt;
          else {
            const K = pt * I(pt);
            O.x = Math.abs(K) < Math.abs(pt) ? K : pt;
          }
        ((Math.abs(O.x) > 0 || Math.abs(O.y) > 0) && qe(!0),
          (it = Pt.current) == null ||
            it.style.setProperty("--swipe-amount-x", `${O.x}px`),
          (ut = Pt.current) == null ||
            ut.style.setProperty("--swipe-amount-y", `${O.y}px`));
      },
    },
    an && !p.jsx && yt !== "loading"
      ? le.createElement(
          "button",
          {
            "aria-label": V,
            "data-disabled": on,
            "data-close-button": !0,
            onClick:
              on || !Er
                ? () => {}
                : () => {
                    (Ft(), p.onDismiss == null || p.onDismiss.call(p, p));
                  },
            className: Xr(
              Q?.closeButton,
              p == null || (i = p.classNames) == null ? void 0 : i.closeButton,
            ),
          },
          (Xn = ue?.close) != null ? Xn : pv,
        )
      : null,
    (yt || p.icon || p.promise) &&
      p.icon !== null &&
      (ue?.[yt] !== null || p.icon)
      ? le.createElement(
          "div",
          {
            "data-icon": "",
            className: Xr(
              Q?.icon,
              p == null || (c = p.classNames) == null ? void 0 : c.icon,
            ),
          },
          p.promise || (p.type === "loading" && !p.icon)
            ? p.icon || Wr()
            : null,
          p.type !== "loading" ? Rr : null,
        )
      : null,
    le.createElement(
      "div",
      {
        "data-content": "",
        className: Xr(
          Q?.content,
          p == null || (d = p.classNames) == null ? void 0 : d.content,
        ),
      },
      le.createElement(
        "div",
        {
          "data-title": "",
          className: Xr(
            Q?.title,
            p == null || (f = p.classNames) == null ? void 0 : f.title,
          ),
        },
        p.jsx ? p.jsx : typeof p.title == "function" ? p.title() : p.title,
      ),
      p.description
        ? le.createElement(
            "div",
            {
              "data-description": "",
              className: Xr(
                Le,
                Br,
                Q?.description,
                p == null || (m = p.classNames) == null
                  ? void 0
                  : m.description,
              ),
            },
            typeof p.description == "function"
              ? p.description()
              : p.description,
          )
        : null,
    ),
    le.isValidElement(p.cancel)
      ? p.cancel
      : p.cancel && mo(p.cancel)
        ? le.createElement(
            "button",
            {
              "data-button": !0,
              "data-cancel": !0,
              style: p.cancelButtonStyle || Y,
              onClick: (Me) => {
                mo(p.cancel) &&
                  Er &&
                  (p.cancel.onClick == null ||
                    p.cancel.onClick.call(p.cancel, Me),
                  Ft());
              },
              className: Xr(
                Q?.cancelButton,
                p == null || (g = p.classNames) == null
                  ? void 0
                  : g.cancelButton,
              ),
            },
            p.cancel.label,
          )
        : null,
    le.isValidElement(p.action)
      ? p.action
      : p.action && mo(p.action)
        ? le.createElement(
            "button",
            {
              "data-button": !0,
              "data-action": !0,
              style: p.actionButtonStyle || oe,
              onClick: (Me) => {
                mo(p.action) &&
                  (p.action.onClick == null ||
                    p.action.onClick.call(p.action, Me),
                  !Me.defaultPrevented && Ft());
              },
              className: Xr(
                Q?.actionButton,
                p == null || (x = p.classNames) == null
                  ? void 0
                  : x.actionButton,
              ),
            },
            p.action.label,
          )
        : null,
  );
};
function Ph() {
  if (typeof window > "u" || typeof document > "u") return "ltr";
  const r = document.documentElement.getAttribute("dir");
  return r === "auto" || !r
    ? window.getComputedStyle(document.documentElement).direction
    : r;
}
function Lv(r, a) {
  const l = {};
  return (
    [r, a].forEach((i, c) => {
      const d = c === 1,
        f = d ? "--mobile-offset" : "--offset",
        m = d ? Sv : Nv;
      function g(x) {
        ["top", "right", "bottom", "left"].forEach((v) => {
          l[`${f}-${v}`] = typeof x == "number" ? `${x}px` : x;
        });
      }
      typeof i == "number" || typeof i == "string"
        ? g(i)
        : typeof i == "object"
          ? ["top", "right", "bottom", "left"].forEach((x) => {
              i[x] === void 0
                ? (l[`${f}-${x}`] = m)
                : (l[`${f}-${x}`] =
                    typeof i[x] == "number" ? `${i[x]}px` : i[x]);
            })
          : g(m);
    }),
    l
  );
}
const Av = le.forwardRef(function (a, l) {
  const {
      id: i,
      invert: c,
      position: d = "bottom-right",
      hotkey: f = ["altKey", "KeyT"],
      expand: m,
      closeButton: g,
      className: x,
      offset: v,
      mobileOffset: p,
      theme: k = "light",
      richColors: R,
      duration: S,
      style: L,
      visibleToasts: j = kv,
      toastOptions: E,
      dir: D = Ph(),
      gap: H = Ev,
      icons: G,
      containerAriaLabel: F = "Notifications",
    } = a,
    [U, P] = le.useState([]),
    Y = le.useMemo(
      () =>
        i ? U.filter((W) => W.toasterId === i) : U.filter((W) => !W.toasterId),
      [U, i],
    ),
    oe = le.useMemo(
      () =>
        Array.from(
          new Set(
            [d].concat(Y.filter((W) => W.position).map((W) => W.position)),
          ),
        ),
      [Y, d],
    ),
    [ce, Le] = le.useState([]),
    [de, Re] = le.useState(!1),
    [ve, me] = le.useState(!1),
    [Q, ue] = le.useState(
      k !== "system"
        ? k
        : typeof window < "u" &&
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
    ),
    V = le.useRef(null),
    ne = f.join("+").replace(/Key/g, "").replace(/Digit/g, ""),
    ee = le.useRef(null),
    w = le.useRef(!1),
    _ = le.useCallback((W) => {
      P((Z) => {
        var q;
        return (
          ((q = Z.find((ie) => ie.id === W.id)) != null && q.delete) ||
            Zt.dismiss(W.id),
          Z.filter(({ id: ie }) => ie !== W.id)
        );
      });
    }, []);
  return (
    le.useEffect(
      () =>
        Zt.subscribe((W) => {
          if (W.dismiss) {
            requestAnimationFrame(() => {
              P((Z) =>
                Z.map((q) => (q.id === W.id ? { ...q, delete: !0 } : q)),
              );
            });
            return;
          }
          setTimeout(() => {
            lv.flushSync(() => {
              P((Z) => {
                const q = Z.findIndex((ie) => ie.id === W.id);
                return q !== -1
                  ? [...Z.slice(0, q), { ...Z[q], ...W }, ...Z.slice(q + 1)]
                  : [W, ...Z];
              });
            });
          });
        }),
      [U],
    ),
    le.useEffect(() => {
      if (k !== "system") {
        ue(k);
        return;
      }
      if (
        (k === "system" &&
          (window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? ue("dark")
            : ue("light")),
        typeof window > "u")
      )
        return;
      const W = window.matchMedia("(prefers-color-scheme: dark)");
      try {
        W.addEventListener("change", ({ matches: Z }) => {
          ue(Z ? "dark" : "light");
        });
      } catch {
        W.addListener(({ matches: q }) => {
          try {
            ue(q ? "dark" : "light");
          } catch (ie) {
            console.error(ie);
          }
        });
      }
    }, [k]),
    le.useEffect(() => {
      U.length <= 1 && Re(!1);
    }, [U]),
    le.useEffect(() => {
      const W = (Z) => {
        var q;
        if (f.every((fe) => Z[fe] || Z.code === fe)) {
          var xe;
          (Re(!0), (xe = V.current) == null || xe.focus());
        }
        Z.code === "Escape" &&
          (document.activeElement === V.current ||
            ((q = V.current) != null && q.contains(document.activeElement))) &&
          Re(!1);
      };
      return (
        document.addEventListener("keydown", W),
        () => document.removeEventListener("keydown", W)
      );
    }, [f]),
    le.useEffect(() => {
      if (V.current)
        return () => {
          ee.current &&
            (ee.current.focus({ preventScroll: !0 }),
            (ee.current = null),
            (w.current = !1));
        };
    }, [V.current]),
    le.createElement(
      "section",
      {
        ref: l,
        "aria-label": `${F} ${ne}`,
        tabIndex: -1,
        "aria-live": "polite",
        "aria-relevant": "additions text",
        "aria-atomic": "false",
        suppressHydrationWarning: !0,
      },
      oe.map((W, Z) => {
        var q;
        const [ie, xe] = W.split("-");
        return Y.length
          ? le.createElement(
              "ol",
              {
                key: W,
                dir: D === "auto" ? Ph() : D,
                tabIndex: -1,
                ref: V,
                className: x,
                "data-sonner-toaster": !0,
                "data-sonner-theme": Q,
                "data-y-position": ie,
                "data-x-position": xe,
                style: {
                  "--front-toast-height": `${((q = ce[0]) == null ? void 0 : q.height) || 0}px`,
                  "--width": `${Cv}px`,
                  "--gap": `${H}px`,
                  ...L,
                  ...Lv(v, p),
                },
                onBlur: (fe) => {
                  w.current &&
                    !fe.currentTarget.contains(fe.relatedTarget) &&
                    ((w.current = !1),
                    ee.current &&
                      (ee.current.focus({ preventScroll: !0 }),
                      (ee.current = null)));
                },
                onFocus: (fe) => {
                  (fe.target instanceof HTMLElement &&
                    fe.target.dataset.dismissible === "false") ||
                    w.current ||
                    ((w.current = !0), (ee.current = fe.relatedTarget));
                },
                onMouseEnter: () => Re(!0),
                onMouseMove: () => Re(!0),
                onMouseLeave: () => {
                  ve || Re(!1);
                },
                onDragEnd: () => Re(!1),
                onPointerDown: (fe) => {
                  (fe.target instanceof HTMLElement &&
                    fe.target.dataset.dismissible === "false") ||
                    me(!0);
                },
                onPointerUp: () => me(!1),
              },
              Y.filter(
                (fe) => (!fe.position && Z === 0) || fe.position === W,
              ).map((fe, Ie) => {
                var rt, Ht;
                return le.createElement(_v, {
                  key: fe.id,
                  icons: G,
                  index: Ie,
                  toast: fe,
                  defaultRichColors: R,
                  duration: (rt = E?.duration) != null ? rt : S,
                  className: E?.className,
                  descriptionClassName: E?.descriptionClassName,
                  invert: c,
                  visibleToasts: j,
                  closeButton: (Ht = E?.closeButton) != null ? Ht : g,
                  interacting: ve,
                  position: W,
                  style: E?.style,
                  unstyled: E?.unstyled,
                  classNames: E?.classNames,
                  cancelButtonStyle: E?.cancelButtonStyle,
                  actionButtonStyle: E?.actionButtonStyle,
                  closeButtonAriaLabel: E?.closeButtonAriaLabel,
                  removeToast: _,
                  toasts: Y.filter((qe) => qe.position == fe.position),
                  heights: ce.filter((qe) => qe.position == fe.position),
                  setHeights: Le,
                  expandByDefault: m,
                  gap: H,
                  expanded: de,
                  swipeDirections: a.swipeDirections,
                });
              }),
            )
          : null;
      }),
    )
  );
});
function Th() {
  const r = zt(),
    {
      signIn: a,
      signUp: l,
      resetPassword: i,
      loading: c,
      signInWithGoogle: d,
      signInWithApple: f,
    } = Kn(),
    [m, g] = b.useState(!1),
    [x, v] = b.useState(""),
    [p, k] = b.useState(""),
    [R, S] = b.useState(""),
    [L, j] = b.useState(!1),
    [E, D] = b.useState(""),
    [H, G] = b.useState(!1),
    [F, U] = b.useState(""),
    [P, Y] = b.useState(!1);
  b.useEffect(() => {
    localStorage.getItem("visited-auth-screen") ||
      (Y(!0), localStorage.setItem("visited-auth-screen", "true"));
  }, []);
  const oe = async (de) => {
      if ((de.preventDefault(), U(""), !x || !p)) {
        U("Email and password are required");
        return;
      }
      if (m && !R.trim()) {
        U("Full name is required");
        return;
      }
      try {
        (console.log("handleSubmit: Attempting", m ? "sign up" : "sign in"),
          m
            ? (await l(x, p, R), console.log("handleSubmit: Sign up succeeded"))
            : (await a(x, p), console.log("handleSubmit: Sign in succeeded")));
        const Re = localStorage.getItem("supabase.auth.token");
        (console.log(
          "handleSubmit: Token check before navigation -",
          Re ? "FOUND" : "NOT FOUND",
        ),
          r("/dashboard"));
      } catch (Re) {
        const ve = Re?.message || Re?.error || "Authentication failed";
        (console.error("handleSubmit: Auth error -", ve), U(ve));
      }
    },
    ce = async (de) => {
      de.preventDefault();
      try {
        (await i(E),
          G(!0),
          Eh.success("Password reset email sent!", {
            description: `Check your inbox at ${E}`,
          }));
      } catch {
        Eh.error("Failed to send reset email", {
          description: "Please try again later",
        });
      }
    },
    Le = () => {
      (j(!1), D(""), G(!1));
    };
  return n.jsxs("div", {
    className:
      "min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900",
    style: { backgroundColor: "#f4f0e5" },
    children: [
      n.jsx("style", {
        children: `
        @keyframes bounce-highlight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow-pulse {
          0%, 100% { 
            filter: drop-shadow(0 0 6px rgba(247, 36, 222, 0.8)) drop-shadow(0 0 12px rgba(247, 36, 222, 0.6)) drop-shadow(0 0 18px rgba(247, 36, 222, 0.4));
          }
          50% { 
            filter: drop-shadow(0 0 10px rgba(247, 36, 222, 1)) drop-shadow(0 0 20px rgba(247, 36, 222, 0.8)) drop-shadow(0 0 30px rgba(247, 36, 222, 0.6));
          }
        }
        .audit-button-wrapper {
          animation: glow-pulse 2s ease-in-out infinite !important;
          display: inline-block;
          will-change: filter;
        }
        .audit-button-wrapper.bounce {
          animation: bounce-highlight 0.6s ease-in-out infinite, glow-pulse 2s ease-in-out infinite !important;
        }
        .audit-button-wrapper.no-bounce {
          animation: glow-pulse 2s ease-in-out infinite !important;
        }
        
        /* Responsive layout for audit controls */
        #audit-controls {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }
        
        @media (min-width: 1024px) {
          #audit-controls {
            flex-direction: row;
            align-items: center;
            gap: 0.75rem;
          }
        }
      `,
      }),
      n.jsxs("div", {
        id: "audit-controls",
        className: "absolute top-4 right-4 z-50 pointer-events-auto",
        children: [
          n.jsx(
            "div",
            {
              className: `audit-button-wrapper ${P ? "bounce" : "no-bounce"}`,
              children: n.jsx(ae, {
                onClick: () => r("/audit"),
                variant: "outline",
                size: "sm",
                className: "text-xs px-2 sm:px-3 py-1 h-auto whitespace-nowrap",
                style: {
                  backgroundColor: "rgba(247, 36, 222, 0.1)",
                  borderColor: "rgba(247, 36, 222, 0.6)",
                  boxShadow:
                    "0 0 10px rgba(247, 36, 222, 0.8), 0 0 20px rgba(247, 36, 222, 0.6), 0 0 30px rgba(247, 36, 222, 0.4)",
                },
                children: "Free SEO Audit",
              }),
            },
            `bounce-${P}`,
          ),
          n.jsx("div", { children: n.jsx(bs, {}) }),
        ],
      }),
      n.jsxs("div", {
        className: "w-full max-w-md",
        children: [
          n.jsxs("div", {
            className: "text-center mb-8",
            children: [
              n.jsx("div", {
                className: "flex justify-center mb-4",
                children: n.jsx(Mr, { size: "md" }),
              }),
              n.jsx("h1", {
                className:
                  "text-3xl font-bold text-gray-900 dark:text-white mb-2",
                children: m ? "Create your account" : "Welcome back",
              }),
              n.jsx("p", {
                className: "text-gray-600 dark:text-gray-400 max-w-sm mx-auto",
                children:
                  "Transform your business into a fully operational website with AI-powered lead capture and booking",
              }),
            ],
          }),
          n.jsxs("div", {
            className:
              "bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700",
            children: [
              n.jsxs("form", {
                onSubmit: oe,
                className: "space-y-4",
                children: [
                  m &&
                    n.jsx(St, {
                      type: "text",
                      name: "fullName",
                      label: "Full name",
                      placeholder: "John Smith",
                      value: R,
                      onChange: (de) => S(de.target.value),
                      onKeyDown: (de) => {
                        de.key === "Enter" && !m && oe(de);
                      },
                      required: !0,
                    }),
                  n.jsx(St, {
                    type: "email",
                    name: "email",
                    label: "Email address",
                    placeholder: "you@business.com",
                    value: x,
                    onChange: (de) => v(de.target.value),
                    onKeyDown: (de) => {
                      de.key === "Enter" && oe(de);
                    },
                    required: !0,
                    autoComplete: "email",
                  }),
                  n.jsx(St, {
                    type: "password",
                    name: "password",
                    label: "Password",
                    placeholder: "••••••••",
                    value: p,
                    onChange: (de) => k(de.target.value),
                    onKeyDown: (de) => {
                      de.key === "Enter" && oe(de);
                    },
                    required: !0,
                    autoComplete: m ? "new-password" : "current-password",
                  }),
                  F &&
                    n.jsx("div", {
                      className:
                        "p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm",
                      children: F,
                    }),
                  !m &&
                    n.jsxs("div", {
                      className: "flex items-center justify-between text-sm",
                      children: [
                        n.jsxs("label", {
                          className: "flex items-center gap-2",
                          children: [
                            n.jsx("input", {
                              type: "checkbox",
                              className: "rounded",
                            }),
                            n.jsx("span", {
                              className: "text-gray-600 dark:text-gray-400",
                              children: "Remember me",
                            }),
                          ],
                        }),
                        n.jsx("button", {
                          type: "button",
                          onClick: () => j(!0),
                          className: "font-medium hover:underline",
                          style: { color: "#f724de" },
                          children: "Forgot password?",
                        }),
                      ],
                    }),
                  n.jsxs(ae, {
                    type: "submit",
                    variant: "primary",
                    size: "lg",
                    className: "w-full",
                    disabled: c,
                    children: [
                      n.jsx(Po, { className: "w-5 h-5" }),
                      c ? "Loading..." : m ? "Get Started" : "Sign In",
                    ],
                  }),
                ],
              }),
              n.jsxs("div", {
                className: "relative my-6",
                children: [
                  n.jsx("div", {
                    className: "absolute inset-0 flex items-center",
                    children: n.jsx("div", {
                      className:
                        "w-full border-t border-gray-200 dark:border-gray-700",
                    }),
                  }),
                  n.jsx("div", {
                    className: "relative flex justify-center text-sm",
                    children: n.jsx("span", {
                      className:
                        "px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400",
                      children: "Or continue with",
                    }),
                  }),
                ],
              }),
              n.jsxs("div", {
                className: "grid grid-cols-2 gap-3",
                children: [
                  n.jsxs(ae, {
                    variant: "outline",
                    className: "w-full",
                    onClick: () => d(),
                    children: [n.jsx(Wy, { className: "w-5 h-5" }), "Google"],
                  }),
                  n.jsxs(ae, {
                    variant: "outline",
                    className: "w-full",
                    onClick: () => f(),
                    children: [n.jsx(Eo, { className: "w-5 h-5" }), "Apple"],
                  }),
                ],
              }),
              n.jsxs("div", {
                className: "mt-6 text-center text-sm",
                children: [
                  n.jsx("span", {
                    className: "text-gray-600 dark:text-gray-400",
                    children: m
                      ? "Already have an account?"
                      : "Don't have an account?",
                  }),
                  " ",
                  n.jsx("button", {
                    type: "button",
                    onClick: () => {
                      (g(!m), U(""));
                    },
                    className: "font-medium",
                    style: { color: "#f724de" },
                    children: m ? "Sign in" : "Sign up",
                  }),
                ],
              }),
            ],
          }),
          n.jsx("div", {
            className: "mt-8 text-center",
            children: n.jsxs("div", {
              className: "flex items-center justify-center gap-6 text-sm",
              style: { color: "#000000" },
              children: [
                n.jsxs("div", {
                  className: "flex items-center gap-1",
                  children: [
                    n.jsx(Po, {
                      className: "w-4 h-4",
                      style: { color: "#f724de" },
                    }),
                    n.jsx("span", { children: "AI-Powered" }),
                  ],
                }),
                n.jsx("div", { children: "•" }),
                n.jsx("div", { children: "No Credit Card Required" }),
                n.jsx("div", { children: "•" }),
                n.jsx("div", { children: "5 min setup" }),
              ],
            }),
          }),
        ],
      }),
      L &&
        n.jsx("div", {
          className:
            "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50",
          onClick: Le,
          children: n.jsx("div", {
            className:
              "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700",
            onClick: (de) => de.stopPropagation(),
            children: H
              ? n.jsx(n.Fragment, {
                  children: n.jsxs("div", {
                    className: "text-center",
                    children: [
                      n.jsx("div", {
                        className:
                          "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
                        style: { backgroundColor: "rgba(247, 36, 222, 0.1)" },
                        children: n.jsx(Yn, {
                          className: "w-8 h-8",
                          style: { color: "#f724de" },
                        }),
                      }),
                      n.jsx("h2", {
                        className:
                          "text-2xl font-bold text-gray-900 dark:text-white mb-3",
                        children: "Check your email",
                      }),
                      n.jsxs("p", {
                        className: "text-gray-600 dark:text-gray-400 mb-6",
                        children: [
                          "We've sent a password reset link to ",
                          n.jsx("span", {
                            className: "font-medium",
                            style: { color: "#f724de" },
                            children: E,
                          }),
                        ],
                      }),
                      n.jsxs("div", {
                        className:
                          "bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 text-sm text-gray-600 dark:text-gray-400",
                        children: [
                          n.jsx("p", {
                            className: "mb-2",
                            children: n.jsx("strong", {
                              className: "text-gray-900 dark:text-white",
                              children: "Didn't receive the email?",
                            }),
                          }),
                          n.jsxs("ul", {
                            className: "space-y-1 list-disc list-inside",
                            children: [
                              n.jsx("li", {
                                children: "Check your spam folder",
                              }),
                              n.jsx("li", {
                                children: "Verify the email address is correct",
                              }),
                              n.jsx("li", {
                                children: "Wait a few minutes and try again",
                              }),
                            ],
                          }),
                        ],
                      }),
                      n.jsx(ae, {
                        variant: "primary",
                        className: "w-full",
                        onClick: Le,
                        children: "Back to Sign In",
                      }),
                    ],
                  }),
                })
              : n.jsxs(n.Fragment, {
                  children: [
                    n.jsxs("div", {
                      className: "flex items-start justify-between mb-6",
                      children: [
                        n.jsxs("div", {
                          children: [
                            n.jsx("h2", {
                              className:
                                "text-2xl font-bold text-gray-900 dark:text-white mb-2",
                              children: "Reset your password",
                            }),
                            n.jsx("p", {
                              className:
                                "text-gray-600 dark:text-gray-400 text-sm",
                              children:
                                "Enter your email address and we'll send you a link to reset your password.",
                            }),
                          ],
                        }),
                        n.jsx("button", {
                          onClick: Le,
                          className:
                            "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors",
                          children: n.jsx(Ga, { className: "w-6 h-6" }),
                        }),
                      ],
                    }),
                    n.jsxs("form", {
                      onSubmit: ce,
                      className: "space-y-4",
                      children: [
                        n.jsx(St, {
                          type: "email",
                          label: "Email address",
                          placeholder: "you@business.com",
                          value: E,
                          onChange: (de) => D(de.target.value),
                          required: !0,
                        }),
                        n.jsxs("div", {
                          className: "flex gap-3 pt-2",
                          children: [
                            n.jsx(ae, {
                              type: "button",
                              variant: "outline",
                              className: "flex-1",
                              onClick: Le,
                              children: "Cancel",
                            }),
                            n.jsx(ae, {
                              type: "submit",
                              variant: "primary",
                              className: "flex-1",
                              disabled: c,
                              children: c ? "Sending..." : "Send Reset Link",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
          }),
        }),
    ],
  });
}
function Ee({ children: r, className: a = "", hover: l = !1, style: i }) {
  return n.jsx("div", {
    style: i,
    className: `bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${l ? "hover:shadow-md transition-shadow duration-200" : ""} ${a}`,
    children: r,
  });
}
function ot({ children: r, className: a = "" }) {
  return n.jsx("div", {
    className: `p-6 border-b border-gray-100 dark:border-gray-700 ${a}`,
    children: r,
  });
}
function Pe({ children: r, className: a = "" }) {
  return n.jsx("div", { className: `p-6 ${a}`, children: r });
}
function po({
  title: r,
  value: a,
  icon: l,
  trend: i,
  iconColor: c = "text-[#f724de]",
}) {
  return n.jsx(Ee, {
    hover: !0,
    children: n.jsxs(Pe, {
      className: "flex items-start justify-between",
      children: [
        n.jsxs("div", {
          className: "flex-1",
          children: [
            n.jsx("p", {
              className: "text-sm text-gray-600 dark:text-gray-400 mb-1",
              children: r,
            }),
            n.jsx("p", {
              className:
                "text-3xl font-bold text-gray-900 dark:text-white mb-2",
              children: a,
            }),
            i &&
              n.jsxs("span", {
                className: `text-sm ${i.positive ? "text-green-600" : "text-red-600"}`,
                children: [i.positive ? "↑" : "↓", " ", i.value],
              }),
          ],
        }),
        n.jsx("div", {
          className: `p-3 rounded-lg ${c}`,
          style: { backgroundColor: "#f4f0e5" },
          children: n.jsx(l, { className: "w-6 h-6" }),
        }),
      ],
    }),
  });
}
function fr({
  children: r,
  variant: a = "primary",
  className: l = "",
  style: i,
  ...c
}) {
  const d = {
    primary: "text-white",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
  };
  return n.jsx("span", {
    className: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${d[a] || ""} ${l}`,
    style: a === "primary" ? { ...(i || {}), backgroundColor: "#f724de" } : i,
    ...c,
    children: r,
  });
}
var Ov = "clover",
  Mm = "https://js.stripe.com",
  Dv = "".concat(Mm, "/").concat(Ov, "/stripe.js"),
  Mv = /^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/,
  zv = /^https:\/\/js\.stripe\.com\/(v3|[a-z]+)\/stripe\.js(\?.*)?$/;
var Iv = function (a) {
    return Mv.test(a) || zv.test(a);
  },
  Fv = function () {
    for (
      var a = document.querySelectorAll('script[src^="'.concat(Mm, '"]')),
        l = 0;
      l < a.length;
      l++
    ) {
      var i = a[l];
      if (Iv(i.src)) return i;
    }
    return null;
  },
  _h = function (a) {
    var l = "",
      i = document.createElement("script");
    i.src = "".concat(Dv).concat(l);
    var c = document.head || document.body;
    if (!c)
      throw new Error(
        "Expected document.body not to be null. Stripe.js requires a <body> element.",
      );
    return (c.appendChild(i), i);
  },
  Da = null,
  go = null,
  xo = null,
  $v = function (a) {
    return function (l) {
      a(new Error("Failed to load Stripe.js", { cause: l }));
    };
  },
  Uv = function (a, l) {
    return function () {
      window.Stripe
        ? a(window.Stripe)
        : l(new Error("Stripe.js not available"));
    };
  },
  Bv = function (a) {
    return Da !== null
      ? Da
      : ((Da = new Promise(function (l, i) {
          if (typeof window > "u" || typeof document > "u") {
            l(null);
            return;
          }
          if (window.Stripe) {
            l(window.Stripe);
            return;
          }
          try {
            var c = Fv();
            if (!(c && a)) {
              if (!c) c = _h(a);
              else if (c && xo !== null && go !== null) {
                var d;
                (c.removeEventListener("load", xo),
                  c.removeEventListener("error", go),
                  (d = c.parentNode) === null ||
                    d === void 0 ||
                    d.removeChild(c),
                  (c = _h(a)));
              }
            }
            ((xo = Uv(l, i)),
              (go = $v(i)),
              c.addEventListener("load", xo),
              c.addEventListener("error", go));
          } catch (f) {
            i(f);
            return;
          }
        })),
        Da.catch(function (l) {
          return ((Da = null), Promise.reject(l));
        }));
  },
  Ma,
  Hv = function () {
    return (
      Ma ||
      ((Ma = Bv(null).catch(function (a) {
        return ((Ma = null), Promise.reject(a));
      })),
      Ma)
    );
  };
Promise.resolve()
  .then(function () {
    return Hv();
  })
  .catch(function (r) {
    console.warn(r);
  });
const Dr = {
  free: {
    name: "Free",
    price: 0,
    interval: "forever",
    features: [
      "1 Website",
      "10 Leads per month",
      "2 SEO Audits",
      "Basic templates",
      "Email support",
    ],
    limits: { websites: 1, leads: 10, seoAudits: 2 },
  },
  pro: {
    name: "Pro",
    price: 29,
    interval: "month",
    stripePriceId: "price_pro_monthly",
    features: [
      "Unlimited Websites",
      "Unlimited Leads",
      "Unlimited SEO Audits",
      "Advanced AI customization",
      "Custom domains",
      "Priority support",
      "Remove SalesAPE.ai branding",
      "Advanced analytics",
    ],
    limits: { websites: 1 / 0, leads: 1 / 0, seoAudits: 1 / 0 },
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    interval: "month",
    stripePriceId: "price_enterprise_monthly",
    features: [
      "Everything in Pro",
      "White-label solution",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "24/7 phone support",
    ],
    limits: { websites: 1 / 0, leads: 1 / 0, seoAudits: 1 / 0 },
  },
};
function Uc({ isOpen: r, onClose: a, highlightPlan: l }) {
  const { user: i } = Kn(),
    [c, d] = b.useState(null);
  if (!r) return null;
  const f = async (g) => {
      if (g === "free") {
        a();
        return;
      }
      d(g);
      try {
        (await new Promise((x) => setTimeout(x, 1500)),
          alert(`Redirecting to Stripe checkout for ${Dr[g].name} plan...`));
      } catch (x) {
        (console.error("Error creating checkout session:", x),
          alert("Failed to start checkout. Please try again."));
      } finally {
        d(null);
      }
    },
    m = { free: el, pro: Ks, enterprise: Fy };
  return n.jsx("div", {
    className:
      "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm",
    children: n.jsxs("div", {
      className:
        "relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl",
      children: [
        n.jsx("button", {
          onClick: a,
          className:
            "absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10",
          children: n.jsx(Ga, { className: "w-5 h-5 text-gray-500" }),
        }),
        n.jsxs("div", {
          className:
            "p-8 text-center border-b border-gray-200 dark:border-gray-700",
          children: [
            n.jsx("h2", {
              className:
                "text-4xl font-bold text-gray-900 dark:text-white mb-3",
              children: "Choose Your Plan",
            }),
            n.jsx("p", {
              className:
                "text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto",
              children:
                "Unlock unlimited websites, leads, and SEO audits with our Pro plan",
            }),
          ],
        }),
        n.jsx("div", {
          className: "p-8 grid md:grid-cols-3 gap-6",
          children: Object.keys(Dr).map((g) => {
            const x = Dr[g],
              v = m[g],
              p = g === l || g === "pro",
              k = c === g;
            return n.jsxs(
              Ee,
              {
                className: `relative ${p ? "ring-2 ring-offset-2 dark:ring-offset-gray-800 shadow-xl scale-105" : ""}`,
                style: p ? { "--tw-ring-color": "#f724de" } : void 0,
                children: [
                  p &&
                    n.jsx("div", {
                      className:
                        "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-medium",
                      style: { backgroundColor: "#f724de" },
                      children: "Most Popular",
                    }),
                  n.jsxs(Pe, {
                    className: "p-6",
                    children: [
                      n.jsxs("div", {
                        className: "flex items-center gap-3 mb-4",
                        children: [
                          n.jsx("div", {
                            className: "p-3 rounded-lg",
                            style: {
                              backgroundColor:
                                g === "pro" ? "#f724de" : "#f4f0e5",
                            },
                            children: n.jsx(v, {
                              className: "w-6 h-6",
                              style: {
                                color: g === "pro" ? "white" : "#f724de",
                              },
                            }),
                          }),
                          n.jsx("div", {
                            children: n.jsx("h3", {
                              className:
                                "text-2xl font-bold text-gray-900 dark:text-white",
                              children: x.name,
                            }),
                          }),
                        ],
                      }),
                      n.jsx("div", {
                        className: "mb-6",
                        children: n.jsxs("div", {
                          className: "flex items-baseline gap-2",
                          children: [
                            n.jsxs("span", {
                              className:
                                "text-5xl font-bold text-gray-900 dark:text-white",
                              children: ["$", x.price],
                            }),
                            n.jsxs("span", {
                              className: "text-gray-500 dark:text-gray-400",
                              children: ["/", x.interval],
                            }),
                          ],
                        }),
                      }),
                      n.jsx("ul", {
                        className: "space-y-3 mb-8",
                        children: x.features.map((R, S) =>
                          n.jsxs(
                            "li",
                            {
                              className: "flex items-start gap-3",
                              children: [
                                n.jsx(lu, {
                                  className: "w-5 h-5 flex-shrink-0 mt-0.5",
                                  style: { color: "#f724de" },
                                }),
                                n.jsx("span", {
                                  className: "text-gray-600 dark:text-gray-400",
                                  children: R,
                                }),
                              ],
                            },
                            S,
                          ),
                        ),
                      }),
                      n.jsx(ae, {
                        variant: p ? "primary" : "outline",
                        className: "w-full",
                        onClick: () => f(g),
                        disabled: k,
                        children: k
                          ? n.jsxs(n.Fragment, {
                              children: [
                                n.jsx(qa, {
                                  className: "w-5 h-5 animate-spin",
                                }),
                                "Processing...",
                              ],
                            })
                          : g === "free"
                            ? "Current Plan"
                            : g === "enterprise"
                              ? "Contact Sales"
                              : "Get Started",
                      }),
                    ],
                  }),
                ],
              },
              g,
            );
          }),
        }),
        n.jsx("div", {
          className:
            "p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700",
          children: n.jsxs("div", {
            className: "text-center text-sm text-gray-600 dark:text-gray-400",
            children: [
              n.jsx("p", {
                className: "mb-2",
                children:
                  "🔒 Secure payment powered by Stripe • Cancel anytime",
              }),
              n.jsxs("p", {
                children: [
                  "Need help choosing? ",
                  n.jsx("a", {
                    href: "#",
                    className: "font-medium",
                    style: { color: "#f724de" },
                    children: "Contact our sales team",
                  }),
                ],
              }),
            ],
          }),
        }),
      ],
    }),
  });
}
const za = "http://localhost:3001".replace(/\/+$/g, ""),
  zm = b.createContext(void 0);
function Vv({ children: r }) {
  const { user: a, getToken: l } = Kn(),
    [i, c] = b.useState("free"),
    [d, f] = b.useState(!1),
    [m, g] = b.useState({ websites: 0, leads: 0, seoAudits: 0 });
  b.useEffect(() => {
    a && (x(), v());
  }, [a]);
  const x = async () => {
      f(!0);
      try {
        const E = l ? l() : null;
        if (!E || !a) {
          c("free");
          return;
        }
        const D = await fetch(`${za}/businesses`, {
          headers: { Authorization: `Bearer ${E}` },
        });
        if (!D.ok) {
          c("free");
          return;
        }
        const H = await D.json(),
          G = Array.isArray(H) && H.length > 0 ? H[0] : null;
        if (!G || !G.id) {
          c("free");
          return;
        }
        const F = await fetch(`${za}/businesses/${G.id}/subscription`, {
          headers: { Authorization: `Bearer ${E}` },
        });
        if (!F.ok) {
          c("free");
          return;
        }
        const U = await F.json(),
          P = { basic: "free", pro: "pro", enterprise: "enterprise" },
          Y = (U && U.planId && P[U.planId]) || "free";
        c(Y);
      } catch (E) {
        (console.error("Error fetching subscription:", E), c("free"));
      } finally {
        f(!1);
      }
    },
    v = async () => {
      try {
        const E = l ? l() : null;
        if (!E || !a) {
          g({ websites: 0, leads: 0, seoAudits: 0 });
          return;
        }
        const D = await fetch(`${za}/businesses`, {
          headers: { Authorization: `Bearer ${E}` },
        });
        if (!D.ok) {
          g({ websites: 0, leads: 0, seoAudits: 0 });
          return;
        }
        const H = await D.json(),
          G = Array.isArray(H) ? H.length : 0,
          F = G > 0 ? H[0] : null;
        let U = {};
        if (F && F.id)
          try {
            const oe = await fetch(`${za}/businesses/${F.id}/analytics`, {
              headers: { Authorization: `Bearer ${E}` },
            });
            oe.ok && (U = await oe.json());
          } catch (oe) {
            console.warn("Unable to fetch analytics for first business:", oe);
          }
        const P = U?.summary?.totalLeads ?? U?.summary?.leadsCreated ?? 0;
        let Y = 0;
        if (F && F.id)
          try {
            const oe = await fetch(`${za}/businesses/${F.id}/usage`, {
              headers: { Authorization: `Bearer ${E}` },
            });
            oe.ok && (Y = (await oe.json())?.seoAudits ?? 0);
          } catch (oe) {
            console.warn("Unable to fetch seo audit usage:", oe);
          }
        g({ websites: G, leads: P, seoAudits: Y });
      } catch (E) {
        (console.error("Error fetching usage:", E),
          g({ websites: 0, leads: 0, seoAudits: 0 }));
      }
    },
    p = async () => {
      await v();
    },
    k = Dr[i].limits,
    R = Math.max(0, k.seoAudits - m.seoAudits),
    S = m.websites < k.websites,
    L = m.leads < k.leads,
    j = m.seoAudits < k.seoAudits;
  return n.jsx(zm.Provider, {
    value: {
      currentPlan: i,
      loading: d,
      usage: m,
      seoAuditsRemaining: R,
      canCreateWebsite: S,
      canCaptureLead: L,
      canRunSEOAudit: j,
      refreshUsage: p,
    },
    children: r,
  });
}
function cu() {
  const r = b.useContext(zm);
  if (r === void 0)
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  return r;
}
function Im({ feature: r, onUpgrade: a }) {
  const { usage: l, currentPlan: i } = cu(),
    d = {
      website: {
        title: "🚀 Create Unlimited Websites",
        description:
          "Upgrade to Pro to create unlimited AI-powered websites for all your clients and projects.",
        stat: `${l.websites} / ${Dr[i].limits.websites} websites used`,
      },
      leads: {
        title: "📈 Capture Unlimited Leads",
        description:
          "Never miss a potential customer. Upgrade to Pro for unlimited lead capture and management.",
        stat: `${l.leads} / ${Dr[i].limits.leads} leads this month`,
      },
      seoAudit: {
        title: "🔍 Unlimited SEO Audits",
        description:
          "Run unlimited SEO audits to optimize all your websites and boost search rankings.",
        stat: `${l.seoAudits} / ${Dr[i].limits.seoAudits} audits used`,
      },
    }[r];
  return n.jsx(Ee, {
    className: "border-2",
    style: { borderColor: "#f724de" },
    children: n.jsx(Pe, {
      className: "p-8",
      children: n.jsxs("div", {
        className: "flex items-start gap-6",
        children: [
          n.jsx("div", {
            className: "p-4 rounded-xl",
            style: { backgroundColor: "#f724de" },
            children: n.jsx(Ks, { className: "w-8 h-8 text-white" }),
          }),
          n.jsxs("div", {
            className: "flex-1",
            children: [
              n.jsx("h3", {
                className:
                  "text-2xl font-bold text-gray-900 dark:text-white mb-2",
                children: d.title,
              }),
              n.jsx("p", {
                className: "text-gray-600 dark:text-gray-400 mb-4",
                children: d.description,
              }),
              n.jsxs("div", {
                className: "flex items-center gap-3 mb-6",
                children: [
                  n.jsx("div", {
                    className:
                      "flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden",
                    children: n.jsx("div", {
                      className: "h-full transition-all duration-300",
                      style: {
                        width: `${Math.min((l[r === "website" ? "websites" : r === "leads" ? "leads" : "seoAudits"] / Dr[i].limits[r === "website" ? "websites" : r === "leads" ? "leads" : "seoAudits"]) * 100, 100)}%`,
                        backgroundColor: "#f724de",
                      },
                    }),
                  }),
                  n.jsx("span", {
                    className:
                      "text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap",
                    children: d.stat,
                  }),
                ],
              }),
              n.jsxs("div", {
                className: "flex flex-wrap gap-3",
                children: [
                  n.jsxs(ae, {
                    variant: "primary",
                    onClick: a,
                    children: [
                      n.jsx(Po, { className: "w-5 h-5" }),
                      "Upgrade to Pro - $29/month",
                    ],
                  }),
                  n.jsxs("div", {
                    className:
                      "flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400",
                    children: [
                      n.jsx(iu, { className: "w-4 h-4" }),
                      n.jsx("span", {
                        children: "Join 1,000+ businesses growing with Pro",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
var Wv = {};
function Fm({ isOpen: r, onClose: a }) {
  const [l, i] = b.useState(null),
    [c, d] = b.useState(!1),
    [f, m] = b.useState(!1),
    [g, x] = b.useState(""),
    v = async () => {
      try {
        (d(!0), x(""));
        const k = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${Wv.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID"}&redirect_uri=${window.location.origin}/auth/google/callback&response_type=code&scope=https://www.googleapis.com/auth/calendar`;
        (console.log("Google Calendar OAuth URL:", k),
          m(!0),
          setTimeout(() => {
            (alert(
              "Google Calendar integration is configured in development. In production, you would be redirected to Google OAuth.",
            ),
              a());
          }, 2e3));
      } catch (k) {
        (x("Failed to connect Google Calendar"), console.error(k));
      } finally {
        d(!1);
      }
    },
    p = async () => {
      try {
        (d(!0), x(""));
        const k = prompt(
          "Enter your Calendly URL (e.g., https://calendly.com/username)",
        );
        if (!k) return;
        if (!k.includes("calendly.com")) {
          x("Invalid Calendly URL");
          return;
        }
        (m(!0),
          setTimeout(() => {
            (alert(`Calendly integrated! Bookings will sync with ${k}`), a());
          }, 2e3));
      } catch (k) {
        (x("Failed to connect Calendly"), console.error(k));
      } finally {
        d(!1);
      }
    };
  return r
    ? n.jsx("div", {
        className:
          "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",
        children: n.jsxs(Ee, {
          className: "max-w-md w-full",
          children: [
            n.jsxs("div", {
              className:
                "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700",
              children: [
                n.jsx("h2", {
                  className: "text-xl font-bold text-gray-900 dark:text-white",
                  children: "Connect Calendar",
                }),
                n.jsx("button", {
                  onClick: a,
                  className:
                    "p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors",
                  children: n.jsx(Ga, { className: "w-5 h-5" }),
                }),
              ],
            }),
            n.jsxs(Pe, {
              className: "py-6",
              children: [
                g &&
                  n.jsx("div", {
                    className:
                      "mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm",
                    children: g,
                  }),
                f
                  ? n.jsxs("div", {
                      className: "text-center py-8",
                      children: [
                        n.jsx("div", {
                          className:
                            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100 dark:bg-green-900",
                          children: n.jsx(lu, {
                            className:
                              "w-8 h-8 text-green-600 dark:text-green-400",
                          }),
                        }),
                        n.jsx("p", {
                          className:
                            "text-gray-900 dark:text-white font-semibold mb-2",
                          children: "Calendar Connected!",
                        }),
                        n.jsx("p", {
                          className: "text-sm text-gray-600 dark:text-gray-400",
                          children:
                            "Your calendar is now synced. Bookings will be reflected across all your websites.",
                        }),
                      ],
                    })
                  : n.jsxs("div", {
                      className: "space-y-4",
                      children: [
                        n.jsx("p", {
                          className:
                            "text-sm text-gray-600 dark:text-gray-400 mb-6",
                          children:
                            "Connect your calendar to sync bookings across all your websites and prevent double scheduling.",
                        }),
                        l
                          ? n.jsxs("div", {
                              children: [
                                n.jsx("button", {
                                  onClick: () => i(null),
                                  className:
                                    "mb-4 text-sm text-blue-600 dark:text-blue-400 hover:underline",
                                  children: "← Back",
                                }),
                                n.jsxs("div", {
                                  className: "mb-6",
                                  children: [
                                    l === "google" &&
                                      n.jsxs("div", {
                                        children: [
                                          n.jsx("p", {
                                            className:
                                              "font-semibold text-gray-900 dark:text-white mb-2",
                                            children: "Connect Google Calendar",
                                          }),
                                          n.jsx("p", {
                                            className:
                                              "text-sm text-gray-600 dark:text-gray-400 mb-4",
                                            children:
                                              "You'll be redirected to Google to authorize calendar access.",
                                          }),
                                        ],
                                      }),
                                    l === "calendly" &&
                                      n.jsxs("div", {
                                        children: [
                                          n.jsx("p", {
                                            className:
                                              "font-semibold text-gray-900 dark:text-white mb-2",
                                            children: "Connect Calendly",
                                          }),
                                          n.jsx("p", {
                                            className:
                                              "text-sm text-gray-600 dark:text-gray-400 mb-4",
                                            children:
                                              "Enter your Calendly URL to sync bookings.",
                                          }),
                                        ],
                                      }),
                                  ],
                                }),
                                n.jsx(ae, {
                                  variant: "primary",
                                  className: "w-full",
                                  onClick: l === "google" ? v : p,
                                  disabled: c,
                                  children: c
                                    ? n.jsxs(n.Fragment, {
                                        children: [
                                          n.jsx(qa, {
                                            className: "w-4 h-4 animate-spin",
                                          }),
                                          "Connecting...",
                                        ],
                                      })
                                    : n.jsxs(n.Fragment, {
                                        children: [
                                          n.jsx(tn, { className: "w-4 h-4" }),
                                          "Connect ",
                                          l === "google"
                                            ? "Google"
                                            : "Calendly",
                                        ],
                                      }),
                                }),
                              ],
                            })
                          : n.jsxs("div", {
                              className: "space-y-3",
                              children: [
                                n.jsx("button", {
                                  onClick: () => i("google"),
                                  className:
                                    "w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left",
                                  children: n.jsxs("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                      n.jsx("div", {
                                        className:
                                          "w-10 h-10 rounded bg-red-100 dark:bg-red-900 flex items-center justify-center text-lg font-bold text-red-600 dark:text-red-400",
                                        children: "G",
                                      }),
                                      n.jsxs("div", {
                                        children: [
                                          n.jsx("p", {
                                            className:
                                              "font-semibold text-gray-900 dark:text-white",
                                            children: "Google Calendar",
                                          }),
                                          n.jsx("p", {
                                            className:
                                              "text-xs text-gray-600 dark:text-gray-400",
                                            children:
                                              "Sync with Google Calendar",
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                }),
                                n.jsx("button", {
                                  onClick: () => i("calendly"),
                                  className:
                                    "w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left",
                                  children: n.jsxs("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                      n.jsx("div", {
                                        className:
                                          "w-10 h-10 rounded bg-purple-100 dark:bg-purple-900 flex items-center justify-center",
                                        children: n.jsx(tn, {
                                          className:
                                            "w-5 h-5 text-purple-600 dark:text-purple-400",
                                        }),
                                      }),
                                      n.jsxs("div", {
                                        children: [
                                          n.jsx("p", {
                                            className:
                                              "font-semibold text-gray-900 dark:text-white",
                                            children: "Calendly",
                                          }),
                                          n.jsx("p", {
                                            className:
                                              "text-xs text-gray-600 dark:text-gray-400",
                                            children: "Sync with Calendly",
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                }),
                              ],
                            }),
                      ],
                    }),
              ],
            }),
          ],
        }),
      })
    : null;
}
function qv() {
  const r = zt(),
    {
      currentPlan: a,
      canCreateWebsite: l,
      canRunSEOAudit: i,
      usage: c,
      seoAuditsRemaining: d,
      refreshUsage: f,
    } = cu(),
    [m, g] = b.useState(!1),
    [x, v] = b.useState(!1),
    [p, k] = b.useState([]),
    [R, S] = b.useState(!0),
    [L, j] = b.useState(null),
    [E, D] = b.useState(null);
  le.useEffect(() => {
    (async () => {
      try {
        S(!0);
        const U = localStorage.getItem("supabase.auth.token");
        if (!U) {
          (k([]), D(null));
          return;
        }
        const P = await fetch("http://localhost:3001/businesses", {
          headers: { Authorization: `Bearer ${U}` },
        });
        if (P.ok) {
          const Y = await P.json(),
            oe = (Array.isArray(Y) ? Y : []).map((ce) => ({
              id: ce.id,
              name: ce.name,
              url: ce.slug
                ? `${ce.slug}.salesape.ai`
                : `website-${ce.id.substring(0, 8)}.salesape.ai`,
              status: ce.isPublished ? "Live" : "Draft",
              leads: ce.leads?.length || 0,
              bookings: ce.bookings?.length || 0,
              lastUpdated: new Date(
                ce.updatedAt || ce.createdAt,
              ).toLocaleDateString(),
            }));
          k(oe);
        }
        try {
          const Y = await fetch("http://localhost:3001/dashboard/stats", {
            headers: { Authorization: `Bearer ${U}` },
          });
          if (Y.ok) {
            const oe = await Y.json();
            D(oe.summary || oe);
          }
        } catch (Y) {
          console.warn(
            "Failed to fetch dashboard stats, using local calculations:",
            Y,
          );
        }
      } catch (U) {
        (console.error("Failed to fetch data:", U), k([]), D(null));
      } finally {
        S(!1);
      }
    })();
  }, []);
  const H = () => {
      if (!l) {
        g(!0);
        return;
      }
      r("/create-website");
    },
    G = async (F, U) => {
      if (
        window.confirm(
          `Are you sure you want to delete "${U}"? This action cannot be undone.`,
        )
      )
        try {
          j(F);
          const Y = localStorage.getItem("supabase.auth.token"),
            oe = await fetch(`http://localhost:3001/businesses/${F}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${Y}` },
            });
          if (oe.ok) {
            (k(p.filter((ce) => ce.id !== F)),
              alert(`Website "${U}" deleted successfully`));
            try {
              f && (await f());
            } catch (ce) {
              console.warn("Failed to refresh usage after delete", ce);
            }
          } else {
            const ce = await oe.json();
            alert(`Error: ${ce.error || "Failed to delete website"}`);
          }
        } catch (Y) {
          (console.error("Delete error:", Y),
            alert("Error deleting website. Please try again."));
        } finally {
          j(null);
        }
    };
  return n.jsxs("div", {
    className: "min-h-screen bg-gray-50 dark:bg-gray-900",
    children: [
      n.jsx(Uc, { isOpen: m, onClose: () => g(!1), highlightPlan: "pro" }),
      n.jsxs("main", {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
        children: [
          n.jsxs("div", {
            className: "mb-8 flex items-start justify-between",
            children: [
              n.jsxs("div", {
                children: [
                  n.jsx("h1", {
                    className:
                      "text-3xl font-bold text-gray-900 dark:text-white mb-2",
                    children: "Welcome back! 👋",
                  }),
                  n.jsx("p", {
                    className: "text-gray-600 dark:text-gray-400",
                    children:
                      "Here's what's happening with your websites today",
                  }),
                ],
              }),
              n.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  a !== "free" &&
                    n.jsxs(fr, {
                      variant: "warning",
                      style: {
                        backgroundColor: "#f724de",
                        color: "white",
                        border: "none",
                      },
                      children: [
                        n.jsx(Ks, { className: "w-3 h-3" }),
                        Dr[a].name,
                      ],
                    }),
                  a === "free" &&
                    n.jsxs(ae, {
                      variant: "primary",
                      onClick: () => g(!0),
                      children: [
                        n.jsx(Ks, { className: "w-5 h-5" }),
                        "Upgrade Now",
                      ],
                    }),
                ],
              }),
            ],
          }),
          a === "free" &&
            !l &&
            n.jsx("div", {
              className: "mb-8",
              children: n.jsx(Im, {
                feature: "website",
                onUpgrade: () => g(!0),
              }),
            }),
          n.jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-8",
            children: [
              n.jsxs(ae, {
                variant: "primary",
                size: "lg",
                className: "w-full",
                onClick: H,
                children: [
                  n.jsx(Ro, { className: "w-5 h-5" }),
                  "Create New Website",
                  !l && n.jsx(Ks, { className: "w-4 h-4 ml-2" }),
                ],
              }),
              n.jsxs(ae, {
                variant: "outline",
                size: "lg",
                className: "w-full",
                onClick: () => {
                  a === "free" && !i ? g(!0) : r("/seo-audit");
                },
                disabled: a === "free" && !i,
                children: [
                  n.jsx(Ya, { className: "w-5 h-5" }),
                  "Run SEO Audit",
                  n.jsx("span", {
                    className: "text-xs font-semibold",
                    children: a === "free" ? `(${d}/2)` : "",
                  }),
                ],
              }),
              n.jsxs(ae, {
                variant: "outline",
                size: "lg",
                className: "w-full",
                onClick: () => r("/manage-bookings"),
                children: [
                  n.jsx(tn, { className: "w-5 h-5" }),
                  "Manage Bookings",
                ],
              }),
            ],
          }),
          !R &&
            n.jsxs("div", {
              className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8",
              children: [
                n.jsx(po, {
                  title: "Active Websites",
                  value:
                    E?.liveWebsites ??
                    p.filter((F) => F.status === "Live").length,
                  icon: Nh,
                  trend: {
                    value: `${E?.totalWebsites ?? p.length} total`,
                    positive: (E?.totalWebsites ?? p.length) > 0,
                  },
                }),
                n.jsx(po, {
                  title: "Total Leads",
                  value: E?.totalLeads ?? p.reduce((F, U) => F + U.leads, 0),
                  icon: Ch,
                  trend: {
                    value: E?.totalLeads
                      ? "+0 this week"
                      : "Start with a website",
                    positive: !0,
                  },
                }),
                n.jsx(po, {
                  title: "Conversion Rate",
                  value: E?.conversionRate
                    ? `${(E.conversionRate * 100).toFixed(1)}%`
                    : "0%",
                  icon: iu,
                  trend: {
                    value: "Leads to Bookings",
                    positive: (E?.conversionRate ?? 0) > 0,
                  },
                }),
                n.jsx(po, {
                  title: "Avg SEO Score",
                  value: E?.avgSeoScore ? Math.round(E.avgSeoScore) : "N/A",
                  icon: Ya,
                  trend: {
                    value: "Domain Authority",
                    positive: (E?.avgSeoScore ?? 0) > 50,
                  },
                }),
              ],
            }),
          n.jsxs(Ee, {
            children: [
              n.jsx(ot, {
                children: n.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    n.jsx("h2", {
                      className:
                        "text-xl font-bold text-gray-900 dark:text-white",
                      children: "Your Websites",
                    }),
                    n.jsxs(fr, {
                      variant: "info",
                      children: [
                        p.filter((F) => F.status === "Live").length,
                        " Live",
                      ],
                    }),
                  ],
                }),
              }),
              n.jsx(Pe, {
                className: "p-0",
                children: n.jsx("div", {
                  className: "divide-y divide-gray-100 dark:divide-gray-700",
                  children: p.map((F) =>
                    n.jsxs(
                      "div",
                      {
                        className:
                          "p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer",
                        onClick: () => r(`/website-preview/${F.id}`),
                        children: [
                          n.jsxs("div", {
                            className: "flex items-start justify-between mb-3",
                            children: [
                              n.jsxs("div", {
                                className: "flex-1",
                                children: [
                                  n.jsx("h3", {
                                    className:
                                      "font-semibold text-gray-900 dark:text-white mb-1",
                                    children: F.name,
                                  }),
                                  n.jsxs("a", {
                                    href: `https://${F.url}`,
                                    className:
                                      "text-sm flex items-center gap-1",
                                    style: { color: "#f724de" },
                                    onClick: (U) => U.stopPropagation(),
                                    children: [
                                      F.url,
                                      n.jsx(Tm, { className: "w-3 h-3" }),
                                    ],
                                  }),
                                ],
                              }),
                              n.jsx(fr, {
                                variant: "success",
                                children: F.status,
                              }),
                            ],
                          }),
                          n.jsxs("div", {
                            className: "grid grid-cols-3 gap-4 mb-3",
                            children: [
                              n.jsxs("div", {
                                className: "flex items-center gap-2 text-sm",
                                children: [
                                  n.jsx(Ch, {
                                    className: "w-4 h-4 text-gray-400",
                                  }),
                                  n.jsxs("span", {
                                    className:
                                      "text-gray-600 dark:text-gray-400",
                                    children: [F.leads, " leads"],
                                  }),
                                ],
                              }),
                              n.jsxs("div", {
                                className: "flex items-center gap-2 text-sm",
                                children: [
                                  n.jsx(tn, {
                                    className: "w-4 h-4 text-gray-400",
                                  }),
                                  n.jsxs("span", {
                                    className:
                                      "text-gray-600 dark:text-gray-400",
                                    children: [F.bookings, " bookings"],
                                  }),
                                ],
                              }),
                              n.jsxs("div", {
                                className: "flex items-center gap-2 text-sm",
                                children: [
                                  n.jsx(Zap, {
                                    className: "w-4 h-4 text-gray-400",
                                  }),
                                  n.jsxs("span", {
                                    className:
                                      "text-gray-600 dark:text-gray-400",
                                    children: ["Updated ", F.lastUpdated],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          n.jsxs("div", {
                            className: "flex gap-2",
                            children: [
                              n.jsxs(ae, {
                                variant: "outline",
                                size: "sm",
                                className: "flex-1 md:flex-none",
                                onClick: (U) => {
                                  (U.stopPropagation(),
                                    r(`/website-preview/${F.id}`));
                                },
                                children: [
                                  n.jsx(ou, { className: "w-4 h-4" }),
                                  "View & Edit",
                                ],
                              }),
                              n.jsxs("button", {
                                type: "button",
                                onClick: (U) => {
                                  (U.stopPropagation(), G(F.id, F.name));
                                },
                                disabled: L === F.id,
                                style: {
                                  border: "2px solid #dc2626",
                                  color: "#dc2626",
                                  backgroundColor: "transparent",
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  cursor:
                                    L === F.id ? "not-allowed" : "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  opacity: L === F.id ? 0.6 : 1,
                                  transition: "all 0.2s",
                                },
                                onMouseEnter: (U) => {
                                  L !== F.id &&
                                    (U.currentTarget.style.backgroundColor =
                                      "#fee2e2");
                                },
                                onMouseLeave: (U) => {
                                  U.currentTarget.style.backgroundColor =
                                    "transparent";
                                },
                                children: [
                                  n.jsx(Am, { className: "w-4 h-4" }),
                                  L === F.id ? "Deleting..." : "Delete",
                                ],
                              }),
                            ],
                          }),
                        ],
                      },
                      F.id,
                    ),
                  ),
                }),
              }),
            ],
          }),
          p.length === 0 &&
            n.jsx(Ee, {
              children: n.jsxs(Pe, {
                className: "py-16 text-center",
                children: [
                  n.jsx("div", {
                    className:
                      "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                    style: { backgroundColor: "#f4f0e5" },
                    children: n.jsx(Nh, {
                      className: "w-8 h-8",
                      style: { color: "#f724de" },
                    }),
                  }),
                  n.jsx("h3", {
                    className:
                      "text-xl font-bold text-gray-900 dark:text-white mb-2",
                    children: "No websites yet",
                  }),
                  n.jsx("p", {
                    className:
                      "text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto",
                    children:
                      "Create your first AI-powered website in just 2 minutes. We'll handle everything from design to lead capture.",
                  }),
                  n.jsxs(ae, {
                    variant: "primary",
                    onClick: () => r("/create-website"),
                    children: [
                      n.jsx(Ro, { className: "w-5 h-5" }),
                      "Create Your First Website",
                    ],
                  }),
                ],
              }),
            }),
          n.jsx("div", {
            className: "fixed bottom-8 right-8",
            children: n.jsxs(ae, {
              variant: "primary",
              onClick: () => v(!0),
              className: "rounded-full shadow-lg hover:shadow-xl",
              children: [
                n.jsx(tn, { className: "w-5 h-5" }),
                n.jsx("span", {
                  className: "hidden sm:inline",
                  children: "Connect Calendar",
                }),
              ],
            }),
          }),
          n.jsx(Uc, { isOpen: m, onClose: () => g(!1), plans: Dr }),
          n.jsx(Fm, { isOpen: x, onClose: () => v(!1) }),
        ],
      }),
    ],
  });
}
function $m(r, a) {
  return function () {
    return r.apply(a, arguments);
  };
}
const { toString: Yv } = Object.prototype,
  { getPrototypeOf: uu } = Object,
  { iterator: Ao, toStringTag: Um } = Symbol,
  Oo = ((r) => (a) => {
    const l = Yv.call(a);
    return r[l] || (r[l] = l.slice(8, -1).toLowerCase());
  })(Object.create(null)),
  Fr = (r) => ((r = r.toLowerCase()), (a) => Oo(a) === r),
  Do = (r) => (a) => typeof a === r,
  { isArray: Xs } = Array,
  Qs = Do("undefined");
function tl(r) {
  return (
    r !== null &&
    !Qs(r) &&
    r.constructor !== null &&
    !Qs(r.constructor) &&
    er(r.constructor.isBuffer) &&
    r.constructor.isBuffer(r)
  );
}
const Bm = Fr("ArrayBuffer");
function Gv(r) {
  let a;
  return (
    typeof ArrayBuffer < "u" && ArrayBuffer.isView
      ? (a = ArrayBuffer.isView(r))
      : (a = r && r.buffer && Bm(r.buffer)),
    a
  );
}
const Kv = Do("string"),
  er = Do("function"),
  Hm = Do("number"),
  rl = (r) => r !== null && typeof r == "object",
  Qv = (r) => r === !0 || r === !1,
  ko = (r) => {
    if (Oo(r) !== "object") return !1;
    const a = uu(r);
    return (
      (a === null ||
        a === Object.prototype ||
        Object.getPrototypeOf(a) === null) &&
      !(Um in r) &&
      !(Ao in r)
    );
  },
  Jv = (r) => {
    if (!rl(r) || tl(r)) return !1;
    try {
      return (
        Object.keys(r).length === 0 &&
        Object.getPrototypeOf(r) === Object.prototype
      );
    } catch {
      return !1;
    }
  },
  Xv = Fr("Date"),
  Zv = Fr("File"),
  e2 = Fr("Blob"),
  t2 = Fr("FileList"),
  r2 = (r) => rl(r) && er(r.pipe),
  n2 = (r) => {
    let a;
    return (
      r &&
      ((typeof FormData == "function" && r instanceof FormData) ||
        (er(r.append) &&
          ((a = Oo(r)) === "formdata" ||
            (a === "object" &&
              er(r.toString) &&
              r.toString() === "[object FormData]"))))
    );
  },
  s2 = Fr("URLSearchParams"),
  [a2, l2, o2, i2] = ["ReadableStream", "Request", "Response", "Headers"].map(
    Fr,
  ),
  c2 = (r) =>
    r.trim ? r.trim() : r.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function nl(r, a, { allOwnKeys: l = !1 } = {}) {
  if (r === null || typeof r > "u") return;
  let i, c;
  if ((typeof r != "object" && (r = [r]), Xs(r)))
    for (i = 0, c = r.length; i < c; i++) a.call(null, r[i], i, r);
  else {
    if (tl(r)) return;
    const d = l ? Object.getOwnPropertyNames(r) : Object.keys(r),
      f = d.length;
    let m;
    for (i = 0; i < f; i++) ((m = d[i]), a.call(null, r[m], m, r));
  }
}
function Vm(r, a) {
  if (tl(r)) return null;
  a = a.toLowerCase();
  const l = Object.keys(r);
  let i = l.length,
    c;
  for (; i-- > 0; ) if (((c = l[i]), a === c.toLowerCase())) return c;
  return null;
}
const xs =
    typeof globalThis < "u"
      ? globalThis
      : typeof self < "u"
        ? self
        : typeof window < "u"
          ? window
          : global,
  Wm = (r) => !Qs(r) && r !== xs;
function Bc() {
  const { caseless: r, skipUndefined: a } = (Wm(this) && this) || {},
    l = {},
    i = (c, d) => {
      const f = (r && Vm(l, d)) || d;
      ko(l[f]) && ko(c)
        ? (l[f] = Bc(l[f], c))
        : ko(c)
          ? (l[f] = Bc({}, c))
          : Xs(c)
            ? (l[f] = c.slice())
            : (!a || !Qs(c)) && (l[f] = c);
    };
  for (let c = 0, d = arguments.length; c < d; c++)
    arguments[c] && nl(arguments[c], i);
  return l;
}
const u2 = (r, a, l, { allOwnKeys: i } = {}) => (
    nl(
      a,
      (c, d) => {
        l && er(c)
          ? Object.defineProperty(r, d, {
              value: $m(c, l),
              writable: !0,
              enumerable: !0,
              configurable: !0,
            })
          : Object.defineProperty(r, d, {
              value: c,
              writable: !0,
              enumerable: !0,
              configurable: !0,
            });
      },
      { allOwnKeys: i },
    ),
    r
  ),
  d2 = (r) => (r.charCodeAt(0) === 65279 && (r = r.slice(1)), r),
  f2 = (r, a, l, i) => {
    ((r.prototype = Object.create(a.prototype, i)),
      Object.defineProperty(r.prototype, "constructor", {
        value: r,
        writable: !0,
        enumerable: !1,
        configurable: !0,
      }),
      Object.defineProperty(r, "super", { value: a.prototype }),
      l && Object.assign(r.prototype, l));
  },
  h2 = (r, a, l, i) => {
    let c, d, f;
    const m = {};
    if (((a = a || {}), r == null)) return a;
    do {
      for (c = Object.getOwnPropertyNames(r), d = c.length; d-- > 0; )
        ((f = c[d]),
          (!i || i(f, r, a)) && !m[f] && ((a[f] = r[f]), (m[f] = !0)));
      r = l !== !1 && uu(r);
    } while (r && (!l || l(r, a)) && r !== Object.prototype);
    return a;
  },
  m2 = (r, a, l) => {
    ((r = String(r)),
      (l === void 0 || l > r.length) && (l = r.length),
      (l -= a.length));
    const i = r.indexOf(a, l);
    return i !== -1 && i === l;
  },
  p2 = (r) => {
    if (!r) return null;
    if (Xs(r)) return r;
    let a = r.length;
    if (!Hm(a)) return null;
    const l = new Array(a);
    for (; a-- > 0; ) l[a] = r[a];
    return l;
  },
  g2 = (
    (r) => (a) =>
      r && a instanceof r
  )(typeof Uint8Array < "u" && uu(Uint8Array)),
  x2 = (r, a) => {
    const i = (r && r[Ao]).call(r);
    let c;
    for (; (c = i.next()) && !c.done; ) {
      const d = c.value;
      a.call(r, d[0], d[1]);
    }
  },
  y2 = (r, a) => {
    let l;
    const i = [];
    for (; (l = r.exec(a)) !== null; ) i.push(l);
    return i;
  },
  v2 = Fr("HTMLFormElement"),
  w2 = (r) =>
    r.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (l, i, c) {
      return i.toUpperCase() + c;
    }),
  Lh = (
    ({ hasOwnProperty: r }) =>
    (a, l) =>
      r.call(a, l)
  )(Object.prototype),
  b2 = Fr("RegExp"),
  qm = (r, a) => {
    const l = Object.getOwnPropertyDescriptors(r),
      i = {};
    (nl(l, (c, d) => {
      let f;
      (f = a(c, d, r)) !== !1 && (i[d] = f || c);
    }),
      Object.defineProperties(r, i));
  },
  j2 = (r) => {
    qm(r, (a, l) => {
      if (er(r) && ["arguments", "caller", "callee"].indexOf(l) !== -1)
        return !1;
      const i = r[l];
      if (er(i)) {
        if (((a.enumerable = !1), "writable" in a)) {
          a.writable = !1;
          return;
        }
        a.set ||
          (a.set = () => {
            throw Error("Can not rewrite read-only method '" + l + "'");
          });
      }
    });
  },
  k2 = (r, a) => {
    const l = {},
      i = (c) => {
        c.forEach((d) => {
          l[d] = !0;
        });
      };
    return (Xs(r) ? i(r) : i(String(r).split(a)), l);
  },
  N2 = () => {},
  S2 = (r, a) => (r != null && Number.isFinite((r = +r)) ? r : a);
function C2(r) {
  return !!(r && er(r.append) && r[Um] === "FormData" && r[Ao]);
}
const E2 = (r) => {
    const a = new Array(10),
      l = (i, c) => {
        if (rl(i)) {
          if (a.indexOf(i) >= 0) return;
          if (tl(i)) return i;
          if (!("toJSON" in i)) {
            a[c] = i;
            const d = Xs(i) ? [] : {};
            return (
              nl(i, (f, m) => {
                const g = l(f, c + 1);
                !Qs(g) && (d[m] = g);
              }),
              (a[c] = void 0),
              d
            );
          }
        }
        return i;
      };
    return l(r, 0);
  },
  R2 = Fr("AsyncFunction"),
  P2 = (r) => r && (rl(r) || er(r)) && er(r.then) && er(r.catch),
  Ym = ((r, a) =>
    r
      ? setImmediate
      : a
        ? ((l, i) => (
            xs.addEventListener(
              "message",
              ({ source: c, data: d }) => {
                c === xs && d === l && i.length && i.shift()();
              },
              !1,
            ),
            (c) => {
              (i.push(c), xs.postMessage(l, "*"));
            }
          ))(`axios@${Math.random()}`, [])
        : (l) => setTimeout(l))(
    typeof setImmediate == "function",
    er(xs.postMessage),
  ),
  T2 =
    typeof queueMicrotask < "u"
      ? queueMicrotask.bind(xs)
      : (typeof process < "u" && process.nextTick) || Ym,
  _2 = (r) => r != null && er(r[Ao]),
  B = {
    isArray: Xs,
    isArrayBuffer: Bm,
    isBuffer: tl,
    isFormData: n2,
    isArrayBufferView: Gv,
    isString: Kv,
    isNumber: Hm,
    isBoolean: Qv,
    isObject: rl,
    isPlainObject: ko,
    isEmptyObject: Jv,
    isReadableStream: a2,
    isRequest: l2,
    isResponse: o2,
    isHeaders: i2,
    isUndefined: Qs,
    isDate: Xv,
    isFile: Zv,
    isBlob: e2,
    isRegExp: b2,
    isFunction: er,
    isStream: r2,
    isURLSearchParams: s2,
    isTypedArray: g2,
    isFileList: t2,
    forEach: nl,
    merge: Bc,
    extend: u2,
    trim: c2,
    stripBOM: d2,
    inherits: f2,
    toFlatObject: h2,
    kindOf: Oo,
    kindOfTest: Fr,
    endsWith: m2,
    toArray: p2,
    forEachEntry: x2,
    matchAll: y2,
    isHTMLForm: v2,
    hasOwnProperty: Lh,
    hasOwnProp: Lh,
    reduceDescriptors: qm,
    freezeMethods: j2,
    toObjectSet: k2,
    toCamelCase: w2,
    noop: N2,
    toFiniteNumber: S2,
    findKey: Vm,
    global: xs,
    isContextDefined: Wm,
    isSpecCompliantForm: C2,
    toJSONObject: E2,
    isAsyncFn: R2,
    isThenable: P2,
    setImmediate: Ym,
    asap: T2,
    isIterable: _2,
  };
let De = class Gm extends Error {
  static from(a, l, i, c, d, f) {
    const m = new Gm(a.message, l || a.code, i, c, d);
    return ((m.cause = a), (m.name = a.name), f && Object.assign(m, f), m);
  }
  constructor(a, l, i, c, d) {
    (super(a),
      (this.name = "AxiosError"),
      (this.isAxiosError = !0),
      l && (this.code = l),
      i && (this.config = i),
      c && (this.request = c),
      d && ((this.response = d), (this.status = d.status)));
  }
  toJSON() {
    return {
      message: this.message,
      name: this.name,
      description: this.description,
      number: this.number,
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      config: B.toJSONObject(this.config),
      code: this.code,
      status: this.status,
    };
  }
};
De.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
De.ERR_BAD_OPTION = "ERR_BAD_OPTION";
De.ECONNABORTED = "ECONNABORTED";
De.ETIMEDOUT = "ETIMEDOUT";
De.ERR_NETWORK = "ERR_NETWORK";
De.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
De.ERR_DEPRECATED = "ERR_DEPRECATED";
De.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
De.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
De.ERR_CANCELED = "ERR_CANCELED";
De.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
De.ERR_INVALID_URL = "ERR_INVALID_URL";
const L2 = null;
function Hc(r) {
  return B.isPlainObject(r) || B.isArray(r);
}
function Km(r) {
  return B.endsWith(r, "[]") ? r.slice(0, -2) : r;
}
function Ah(r, a, l) {
  return r
    ? r
        .concat(a)
        .map(function (c, d) {
          return ((c = Km(c)), !l && d ? "[" + c + "]" : c);
        })
        .join(l ? "." : "")
    : a;
}
function A2(r) {
  return B.isArray(r) && !r.some(Hc);
}
const O2 = B.toFlatObject(B, {}, null, function (a) {
  return /^is[A-Z]/.test(a);
});
function Mo(r, a, l) {
  if (!B.isObject(r)) throw new TypeError("target must be an object");
  ((a = a || new FormData()),
    (l = B.toFlatObject(
      l,
      { metaTokens: !0, dots: !1, indexes: !1 },
      !1,
      function (L, j) {
        return !B.isUndefined(j[L]);
      },
    )));
  const i = l.metaTokens,
    c = l.visitor || v,
    d = l.dots,
    f = l.indexes,
    g = (l.Blob || (typeof Blob < "u" && Blob)) && B.isSpecCompliantForm(a);
  if (!B.isFunction(c)) throw new TypeError("visitor must be a function");
  function x(S) {
    if (S === null) return "";
    if (B.isDate(S)) return S.toISOString();
    if (B.isBoolean(S)) return S.toString();
    if (!g && B.isBlob(S))
      throw new De("Blob is not supported. Use a Buffer instead.");
    return B.isArrayBuffer(S) || B.isTypedArray(S)
      ? g && typeof Blob == "function"
        ? new Blob([S])
        : Buffer.from(S)
      : S;
  }
  function v(S, L, j) {
    let E = S;
    if (S && !j && typeof S == "object") {
      if (B.endsWith(L, "{}"))
        ((L = i ? L : L.slice(0, -2)), (S = JSON.stringify(S)));
      else if (
        (B.isArray(S) && A2(S)) ||
        ((B.isFileList(S) || B.endsWith(L, "[]")) && (E = B.toArray(S)))
      )
        return (
          (L = Km(L)),
          E.forEach(function (H, G) {
            !(B.isUndefined(H) || H === null) &&
              a.append(
                f === !0 ? Ah([L], G, d) : f === null ? L : L + "[]",
                x(H),
              );
          }),
          !1
        );
    }
    return Hc(S) ? !0 : (a.append(Ah(j, L, d), x(S)), !1);
  }
  const p = [],
    k = Object.assign(O2, {
      defaultVisitor: v,
      convertValue: x,
      isVisitable: Hc,
    });
  function R(S, L) {
    if (!B.isUndefined(S)) {
      if (p.indexOf(S) !== -1)
        throw Error("Circular reference detected in " + L.join("."));
      (p.push(S),
        B.forEach(S, function (E, D) {
          (!(B.isUndefined(E) || E === null) &&
            c.call(a, E, B.isString(D) ? D.trim() : D, L, k)) === !0 &&
            R(E, L ? L.concat(D) : [D]);
        }),
        p.pop());
    }
  }
  if (!B.isObject(r)) throw new TypeError("data must be an object");
  return (R(r), a);
}
function Oh(r) {
  const a = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0",
  };
  return encodeURIComponent(r).replace(/[!'()~]|%20|%00/g, function (i) {
    return a[i];
  });
}
function du(r, a) {
  ((this._pairs = []), r && Mo(r, this, a));
}
const Qm = du.prototype;
Qm.append = function (a, l) {
  this._pairs.push([a, l]);
};
Qm.toString = function (a) {
  const l = a
    ? function (i) {
        return a.call(this, i, Oh);
      }
    : Oh;
  return this._pairs
    .map(function (c) {
      return l(c[0]) + "=" + l(c[1]);
    }, "")
    .join("&");
};
function D2(r) {
  return encodeURIComponent(r)
    .replace(/%3A/gi, ":")
    .replace(/%24/g, "$")
    .replace(/%2C/gi, ",")
    .replace(/%20/g, "+");
}
function Jm(r, a, l) {
  if (!a) return r;
  const i = (l && l.encode) || D2,
    c = B.isFunction(l) ? { serialize: l } : l,
    d = c && c.serialize;
  let f;
  if (
    (d
      ? (f = d(a, c))
      : (f = B.isURLSearchParams(a) ? a.toString() : new du(a, c).toString(i)),
    f)
  ) {
    const m = r.indexOf("#");
    (m !== -1 && (r = r.slice(0, m)),
      (r += (r.indexOf("?") === -1 ? "?" : "&") + f));
  }
  return r;
}
class Dh {
  constructor() {
    this.handlers = [];
  }
  use(a, l, i) {
    return (
      this.handlers.push({
        fulfilled: a,
        rejected: l,
        synchronous: i ? i.synchronous : !1,
        runWhen: i ? i.runWhen : null,
      }),
      this.handlers.length - 1
    );
  }
  eject(a) {
    this.handlers[a] && (this.handlers[a] = null);
  }
  clear() {
    this.handlers && (this.handlers = []);
  }
  forEach(a) {
    B.forEach(this.handlers, function (i) {
      i !== null && a(i);
    });
  }
}
const Xm = {
    silentJSONParsing: !0,
    forcedJSONParsing: !0,
    clarifyTimeoutError: !1,
  },
  M2 = typeof URLSearchParams < "u" ? URLSearchParams : du,
  z2 = typeof FormData < "u" ? FormData : null,
  I2 = typeof Blob < "u" ? Blob : null,
  F2 = {
    isBrowser: !0,
    classes: { URLSearchParams: M2, FormData: z2, Blob: I2 },
    protocols: ["http", "https", "file", "blob", "url", "data"],
  },
  fu = typeof window < "u" && typeof document < "u",
  Vc = (typeof navigator == "object" && navigator) || void 0,
  $2 =
    fu &&
    (!Vc || ["ReactNative", "NativeScript", "NS"].indexOf(Vc.product) < 0),
  U2 =
    typeof WorkerGlobalScope < "u" &&
    self instanceof WorkerGlobalScope &&
    typeof self.importScripts == "function",
  B2 = (fu && window.location.href) || "http://localhost",
  H2 = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        hasBrowserEnv: fu,
        hasStandardBrowserEnv: $2,
        hasStandardBrowserWebWorkerEnv: U2,
        navigator: Vc,
        origin: B2,
      },
      Symbol.toStringTag,
      { value: "Module" },
    ),
  ),
  Mt = { ...H2, ...F2 };
function V2(r, a) {
  return Mo(r, new Mt.classes.URLSearchParams(), {
    visitor: function (l, i, c, d) {
      return Mt.isNode && B.isBuffer(l)
        ? (this.append(i, l.toString("base64")), !1)
        : d.defaultVisitor.apply(this, arguments);
    },
    ...a,
  });
}
function W2(r) {
  return B.matchAll(/\w+|\[(\w*)]/g, r).map((a) =>
    a[0] === "[]" ? "" : a[1] || a[0],
  );
}
function q2(r) {
  const a = {},
    l = Object.keys(r);
  let i;
  const c = l.length;
  let d;
  for (i = 0; i < c; i++) ((d = l[i]), (a[d] = r[d]));
  return a;
}
function Zm(r) {
  function a(l, i, c, d) {
    let f = l[d++];
    if (f === "__proto__") return !0;
    const m = Number.isFinite(+f),
      g = d >= l.length;
    return (
      (f = !f && B.isArray(c) ? c.length : f),
      g
        ? (B.hasOwnProp(c, f) ? (c[f] = [c[f], i]) : (c[f] = i), !m)
        : ((!c[f] || !B.isObject(c[f])) && (c[f] = []),
          a(l, i, c[f], d) && B.isArray(c[f]) && (c[f] = q2(c[f])),
          !m)
    );
  }
  if (B.isFormData(r) && B.isFunction(r.entries)) {
    const l = {};
    return (
      B.forEachEntry(r, (i, c) => {
        a(W2(i), c, l, 0);
      }),
      l
    );
  }
  return null;
}
function Y2(r, a, l) {
  if (B.isString(r))
    try {
      return ((a || JSON.parse)(r), B.trim(r));
    } catch (i) {
      if (i.name !== "SyntaxError") throw i;
    }
  return (l || JSON.stringify)(r);
}
const sl = {
  transitional: Xm,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function (a, l) {
      const i = l.getContentType() || "",
        c = i.indexOf("application/json") > -1,
        d = B.isObject(a);
      if ((d && B.isHTMLForm(a) && (a = new FormData(a)), B.isFormData(a)))
        return c ? JSON.stringify(Zm(a)) : a;
      if (
        B.isArrayBuffer(a) ||
        B.isBuffer(a) ||
        B.isStream(a) ||
        B.isFile(a) ||
        B.isBlob(a) ||
        B.isReadableStream(a)
      )
        return a;
      if (B.isArrayBufferView(a)) return a.buffer;
      if (B.isURLSearchParams(a))
        return (
          l.setContentType(
            "application/x-www-form-urlencoded;charset=utf-8",
            !1,
          ),
          a.toString()
        );
      let m;
      if (d) {
        if (i.indexOf("application/x-www-form-urlencoded") > -1)
          return V2(a, this.formSerializer).toString();
        if ((m = B.isFileList(a)) || i.indexOf("multipart/form-data") > -1) {
          const g = this.env && this.env.FormData;
          return Mo(
            m ? { "files[]": a } : a,
            g && new g(),
            this.formSerializer,
          );
        }
      }
      return d || c ? (l.setContentType("application/json", !1), Y2(a)) : a;
    },
  ],
  transformResponse: [
    function (a) {
      const l = this.transitional || sl.transitional,
        i = l && l.forcedJSONParsing,
        c = this.responseType === "json";
      if (B.isResponse(a) || B.isReadableStream(a)) return a;
      if (a && B.isString(a) && ((i && !this.responseType) || c)) {
        const f = !(l && l.silentJSONParsing) && c;
        try {
          return JSON.parse(a, this.parseReviver);
        } catch (m) {
          if (f)
            throw m.name === "SyntaxError"
              ? De.from(m, De.ERR_BAD_RESPONSE, this, null, this.response)
              : m;
        }
      }
      return a;
    },
  ],
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: { FormData: Mt.classes.FormData, Blob: Mt.classes.Blob },
  validateStatus: function (a) {
    return a >= 200 && a < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0,
    },
  },
};
B.forEach(["delete", "get", "head", "post", "put", "patch"], (r) => {
  sl.headers[r] = {};
});
const G2 = B.toObjectSet([
    "age",
    "authorization",
    "content-length",
    "content-type",
    "etag",
    "expires",
    "from",
    "host",
    "if-modified-since",
    "if-unmodified-since",
    "last-modified",
    "location",
    "max-forwards",
    "proxy-authorization",
    "referer",
    "retry-after",
    "user-agent",
  ]),
  K2 = (r) => {
    const a = {};
    let l, i, c;
    return (
      r &&
        r
          .split(
            `
`,
          )
          .forEach(function (f) {
            ((c = f.indexOf(":")),
              (l = f.substring(0, c).trim().toLowerCase()),
              (i = f.substring(c + 1).trim()),
              !(!l || (a[l] && G2[l])) &&
                (l === "set-cookie"
                  ? a[l]
                    ? a[l].push(i)
                    : (a[l] = [i])
                  : (a[l] = a[l] ? a[l] + ", " + i : i)));
          }),
      a
    );
  },
  Mh = Symbol("internals");
function Ia(r) {
  return r && String(r).trim().toLowerCase();
}
function No(r) {
  return r === !1 || r == null ? r : B.isArray(r) ? r.map(No) : String(r);
}
function Q2(r) {
  const a = Object.create(null),
    l = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let i;
  for (; (i = l.exec(r)); ) a[i[1]] = i[2];
  return a;
}
const J2 = (r) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(r.trim());
function _c(r, a, l, i, c) {
  if (B.isFunction(i)) return i.call(this, a, l);
  if ((c && (a = l), !!B.isString(a))) {
    if (B.isString(i)) return a.indexOf(i) !== -1;
    if (B.isRegExp(i)) return i.test(a);
  }
}
function X2(r) {
  return r
    .trim()
    .toLowerCase()
    .replace(/([a-z\d])(\w*)/g, (a, l, i) => l.toUpperCase() + i);
}
function Z2(r, a) {
  const l = B.toCamelCase(" " + a);
  ["get", "set", "has"].forEach((i) => {
    Object.defineProperty(r, i + l, {
      value: function (c, d, f) {
        return this[i].call(this, a, c, d, f);
      },
      configurable: !0,
    });
  });
}
let tr = class {
  constructor(a) {
    a && this.set(a);
  }
  set(a, l, i) {
    const c = this;
    function d(m, g, x) {
      const v = Ia(g);
      if (!v) throw new Error("header name must be a non-empty string");
      const p = B.findKey(c, v);
      (!p || c[p] === void 0 || x === !0 || (x === void 0 && c[p] !== !1)) &&
        (c[p || g] = No(m));
    }
    const f = (m, g) => B.forEach(m, (x, v) => d(x, v, g));
    if (B.isPlainObject(a) || a instanceof this.constructor) f(a, l);
    else if (B.isString(a) && (a = a.trim()) && !J2(a)) f(K2(a), l);
    else if (B.isObject(a) && B.isIterable(a)) {
      let m = {},
        g,
        x;
      for (const v of a) {
        if (!B.isArray(v))
          throw TypeError("Object iterator must return a key-value pair");
        m[(x = v[0])] = (g = m[x])
          ? B.isArray(g)
            ? [...g, v[1]]
            : [g, v[1]]
          : v[1];
      }
      f(m, l);
    } else a != null && d(l, a, i);
    return this;
  }
  get(a, l) {
    if (((a = Ia(a)), a)) {
      const i = B.findKey(this, a);
      if (i) {
        const c = this[i];
        if (!l) return c;
        if (l === !0) return Q2(c);
        if (B.isFunction(l)) return l.call(this, c, i);
        if (B.isRegExp(l)) return l.exec(c);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(a, l) {
    if (((a = Ia(a)), a)) {
      const i = B.findKey(this, a);
      return !!(i && this[i] !== void 0 && (!l || _c(this, this[i], i, l)));
    }
    return !1;
  }
  delete(a, l) {
    const i = this;
    let c = !1;
    function d(f) {
      if (((f = Ia(f)), f)) {
        const m = B.findKey(i, f);
        m && (!l || _c(i, i[m], m, l)) && (delete i[m], (c = !0));
      }
    }
    return (B.isArray(a) ? a.forEach(d) : d(a), c);
  }
  clear(a) {
    const l = Object.keys(this);
    let i = l.length,
      c = !1;
    for (; i--; ) {
      const d = l[i];
      (!a || _c(this, this[d], d, a, !0)) && (delete this[d], (c = !0));
    }
    return c;
  }
  normalize(a) {
    const l = this,
      i = {};
    return (
      B.forEach(this, (c, d) => {
        const f = B.findKey(i, d);
        if (f) {
          ((l[f] = No(c)), delete l[d]);
          return;
        }
        const m = a ? X2(d) : String(d).trim();
        (m !== d && delete l[d], (l[m] = No(c)), (i[m] = !0));
      }),
      this
    );
  }
  concat(...a) {
    return this.constructor.concat(this, ...a);
  }
  toJSON(a) {
    const l = Object.create(null);
    return (
      B.forEach(this, (i, c) => {
        i != null && i !== !1 && (l[c] = a && B.isArray(i) ? i.join(", ") : i);
      }),
      l
    );
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([a, l]) => a + ": " + l).join(`
`);
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(a) {
    return a instanceof this ? a : new this(a);
  }
  static concat(a, ...l) {
    const i = new this(a);
    return (l.forEach((c) => i.set(c)), i);
  }
  static accessor(a) {
    const i = (this[Mh] = this[Mh] = { accessors: {} }).accessors,
      c = this.prototype;
    function d(f) {
      const m = Ia(f);
      i[m] || (Z2(c, f), (i[m] = !0));
    }
    return (B.isArray(a) ? a.forEach(d) : d(a), this);
  }
};
tr.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization",
]);
B.reduceDescriptors(tr.prototype, ({ value: r }, a) => {
  let l = a[0].toUpperCase() + a.slice(1);
  return {
    get: () => r,
    set(i) {
      this[l] = i;
    },
  };
});
B.freezeMethods(tr);
function Lc(r, a) {
  const l = this || sl,
    i = a || l,
    c = tr.from(i.headers);
  let d = i.data;
  return (
    B.forEach(r, function (m) {
      d = m.call(l, d, c.normalize(), a ? a.status : void 0);
    }),
    c.normalize(),
    d
  );
}
function ep(r) {
  return !!(r && r.__CANCEL__);
}
let al = class extends De {
  constructor(a, l, i) {
    (super(a ?? "canceled", De.ERR_CANCELED, l, i),
      (this.name = "CanceledError"),
      (this.__CANCEL__ = !0));
  }
};
function tp(r, a, l) {
  const i = l.config.validateStatus;
  !l.status || !i || i(l.status)
    ? r(l)
    : a(
        new De(
          "Request failed with status code " + l.status,
          [De.ERR_BAD_REQUEST, De.ERR_BAD_RESPONSE][
            Math.floor(l.status / 100) - 4
          ],
          l.config,
          l.request,
          l,
        ),
      );
}
function ew(r) {
  const a = /^([-+\w]{1,25})(:?\/\/|:)/.exec(r);
  return (a && a[1]) || "";
}
function tw(r, a) {
  r = r || 10;
  const l = new Array(r),
    i = new Array(r);
  let c = 0,
    d = 0,
    f;
  return (
    (a = a !== void 0 ? a : 1e3),
    function (g) {
      const x = Date.now(),
        v = i[d];
      (f || (f = x), (l[c] = g), (i[c] = x));
      let p = d,
        k = 0;
      for (; p !== c; ) ((k += l[p++]), (p = p % r));
      if (((c = (c + 1) % r), c === d && (d = (d + 1) % r), x - f < a)) return;
      const R = v && x - v;
      return R ? Math.round((k * 1e3) / R) : void 0;
    }
  );
}
function rw(r, a) {
  let l = 0,
    i = 1e3 / a,
    c,
    d;
  const f = (x, v = Date.now()) => {
    ((l = v), (c = null), d && (clearTimeout(d), (d = null)), r(...x));
  };
  return [
    (...x) => {
      const v = Date.now(),
        p = v - l;
      p >= i
        ? f(x, v)
        : ((c = x),
          d ||
            (d = setTimeout(() => {
              ((d = null), f(c));
            }, i - p)));
    },
    () => c && f(c),
  ];
}
const To = (r, a, l = 3) => {
    let i = 0;
    const c = tw(50, 250);
    return rw((d) => {
      const f = d.loaded,
        m = d.lengthComputable ? d.total : void 0,
        g = f - i,
        x = c(g),
        v = f <= m;
      i = f;
      const p = {
        loaded: f,
        total: m,
        progress: m ? f / m : void 0,
        bytes: g,
        rate: x || void 0,
        estimated: x && m && v ? (m - f) / x : void 0,
        event: d,
        lengthComputable: m != null,
        [a ? "download" : "upload"]: !0,
      };
      r(p);
    }, l);
  },
  zh = (r, a) => {
    const l = r != null;
    return [(i) => a[0]({ lengthComputable: l, total: r, loaded: i }), a[1]];
  },
  Ih =
    (r) =>
    (...a) =>
      B.asap(() => r(...a)),
  nw = Mt.hasStandardBrowserEnv
    ? ((r, a) => (l) => (
        (l = new URL(l, Mt.origin)),
        r.protocol === l.protocol &&
          r.host === l.host &&
          (a || r.port === l.port)
      ))(
        new URL(Mt.origin),
        Mt.navigator && /(msie|trident)/i.test(Mt.navigator.userAgent),
      )
    : () => !0,
  sw = Mt.hasStandardBrowserEnv
    ? {
        write(r, a, l, i, c, d, f) {
          if (typeof document > "u") return;
          const m = [`${r}=${encodeURIComponent(a)}`];
          (B.isNumber(l) && m.push(`expires=${new Date(l).toUTCString()}`),
            B.isString(i) && m.push(`path=${i}`),
            B.isString(c) && m.push(`domain=${c}`),
            d === !0 && m.push("secure"),
            B.isString(f) && m.push(`SameSite=${f}`),
            (document.cookie = m.join("; ")));
        },
        read(r) {
          if (typeof document > "u") return null;
          const a = document.cookie.match(
            new RegExp("(?:^|; )" + r + "=([^;]*)"),
          );
          return a ? decodeURIComponent(a[1]) : null;
        },
        remove(r) {
          this.write(r, "", Date.now() - 864e5, "/");
        },
      }
    : {
        write() {},
        read() {
          return null;
        },
        remove() {},
      };
function aw(r) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(r);
}
function lw(r, a) {
  return a ? r.replace(/\/?\/$/, "") + "/" + a.replace(/^\/+/, "") : r;
}
function rp(r, a, l) {
  let i = !aw(a);
  return r && (i || l == !1) ? lw(r, a) : a;
}
const Fh = (r) => (r instanceof tr ? { ...r } : r);
function vs(r, a) {
  a = a || {};
  const l = {};
  function i(x, v, p, k) {
    return B.isPlainObject(x) && B.isPlainObject(v)
      ? B.merge.call({ caseless: k }, x, v)
      : B.isPlainObject(v)
        ? B.merge({}, v)
        : B.isArray(v)
          ? v.slice()
          : v;
  }
  function c(x, v, p, k) {
    if (B.isUndefined(v)) {
      if (!B.isUndefined(x)) return i(void 0, x, p, k);
    } else return i(x, v, p, k);
  }
  function d(x, v) {
    if (!B.isUndefined(v)) return i(void 0, v);
  }
  function f(x, v) {
    if (B.isUndefined(v)) {
      if (!B.isUndefined(x)) return i(void 0, x);
    } else return i(void 0, v);
  }
  function m(x, v, p) {
    if (p in a) return i(x, v);
    if (p in r) return i(void 0, x);
  }
  const g = {
    url: d,
    method: d,
    data: d,
    baseURL: f,
    transformRequest: f,
    transformResponse: f,
    paramsSerializer: f,
    timeout: f,
    timeoutMessage: f,
    withCredentials: f,
    withXSRFToken: f,
    adapter: f,
    responseType: f,
    xsrfCookieName: f,
    xsrfHeaderName: f,
    onUploadProgress: f,
    onDownloadProgress: f,
    decompress: f,
    maxContentLength: f,
    maxBodyLength: f,
    beforeRedirect: f,
    transport: f,
    httpAgent: f,
    httpsAgent: f,
    cancelToken: f,
    socketPath: f,
    responseEncoding: f,
    validateStatus: m,
    headers: (x, v, p) => c(Fh(x), Fh(v), p, !0),
  };
  return (
    B.forEach(Object.keys({ ...r, ...a }), function (v) {
      const p = g[v] || c,
        k = p(r[v], a[v], v);
      (B.isUndefined(k) && p !== m) || (l[v] = k);
    }),
    l
  );
}
const np = (r) => {
    const a = vs({}, r);
    let {
      data: l,
      withXSRFToken: i,
      xsrfHeaderName: c,
      xsrfCookieName: d,
      headers: f,
      auth: m,
    } = a;
    if (
      ((a.headers = f = tr.from(f)),
      (a.url = Jm(
        rp(a.baseURL, a.url, a.allowAbsoluteUrls),
        r.params,
        r.paramsSerializer,
      )),
      m &&
        f.set(
          "Authorization",
          "Basic " +
            btoa(
              (m.username || "") +
                ":" +
                (m.password ? unescape(encodeURIComponent(m.password)) : ""),
            ),
        ),
      B.isFormData(l))
    ) {
      if (Mt.hasStandardBrowserEnv || Mt.hasStandardBrowserWebWorkerEnv)
        f.setContentType(void 0);
      else if (B.isFunction(l.getHeaders)) {
        const g = l.getHeaders(),
          x = ["content-type", "content-length"];
        Object.entries(g).forEach(([v, p]) => {
          x.includes(v.toLowerCase()) && f.set(v, p);
        });
      }
    }
    if (
      Mt.hasStandardBrowserEnv &&
      (i && B.isFunction(i) && (i = i(a)), i || (i !== !1 && nw(a.url)))
    ) {
      const g = c && d && sw.read(d);
      g && f.set(c, g);
    }
    return a;
  },
  ow = typeof XMLHttpRequest < "u",
  iw =
    ow &&
    function (r) {
      return new Promise(function (l, i) {
        const c = np(r);
        let d = c.data;
        const f = tr.from(c.headers).normalize();
        let { responseType: m, onUploadProgress: g, onDownloadProgress: x } = c,
          v,
          p,
          k,
          R,
          S;
        function L() {
          (R && R(),
            S && S(),
            c.cancelToken && c.cancelToken.unsubscribe(v),
            c.signal && c.signal.removeEventListener("abort", v));
        }
        let j = new XMLHttpRequest();
        (j.open(c.method.toUpperCase(), c.url, !0), (j.timeout = c.timeout));
        function E() {
          if (!j) return;
          const H = tr.from(
              "getAllResponseHeaders" in j && j.getAllResponseHeaders(),
            ),
            F = {
              data:
                !m || m === "text" || m === "json"
                  ? j.responseText
                  : j.response,
              status: j.status,
              statusText: j.statusText,
              headers: H,
              config: r,
              request: j,
            };
          (tp(
            function (P) {
              (l(P), L());
            },
            function (P) {
              (i(P), L());
            },
            F,
          ),
            (j = null));
        }
        ("onloadend" in j
          ? (j.onloadend = E)
          : (j.onreadystatechange = function () {
              !j ||
                j.readyState !== 4 ||
                (j.status === 0 &&
                  !(j.responseURL && j.responseURL.indexOf("file:") === 0)) ||
                setTimeout(E);
            }),
          (j.onabort = function () {
            j &&
              (i(new De("Request aborted", De.ECONNABORTED, r, j)), (j = null));
          }),
          (j.onerror = function (G) {
            const F = G && G.message ? G.message : "Network Error",
              U = new De(F, De.ERR_NETWORK, r, j);
            ((U.event = G || null), i(U), (j = null));
          }),
          (j.ontimeout = function () {
            let G = c.timeout
              ? "timeout of " + c.timeout + "ms exceeded"
              : "timeout exceeded";
            const F = c.transitional || Xm;
            (c.timeoutErrorMessage && (G = c.timeoutErrorMessage),
              i(
                new De(
                  G,
                  F.clarifyTimeoutError ? De.ETIMEDOUT : De.ECONNABORTED,
                  r,
                  j,
                ),
              ),
              (j = null));
          }),
          d === void 0 && f.setContentType(null),
          "setRequestHeader" in j &&
            B.forEach(f.toJSON(), function (G, F) {
              j.setRequestHeader(F, G);
            }),
          B.isUndefined(c.withCredentials) ||
            (j.withCredentials = !!c.withCredentials),
          m && m !== "json" && (j.responseType = c.responseType),
          x && (([k, S] = To(x, !0)), j.addEventListener("progress", k)),
          g &&
            j.upload &&
            (([p, R] = To(g)),
            j.upload.addEventListener("progress", p),
            j.upload.addEventListener("loadend", R)),
          (c.cancelToken || c.signal) &&
            ((v = (H) => {
              j &&
                (i(!H || H.type ? new al(null, r, j) : H),
                j.abort(),
                (j = null));
            }),
            c.cancelToken && c.cancelToken.subscribe(v),
            c.signal &&
              (c.signal.aborted
                ? v()
                : c.signal.addEventListener("abort", v))));
        const D = ew(c.url);
        if (D && Mt.protocols.indexOf(D) === -1) {
          i(new De("Unsupported protocol " + D + ":", De.ERR_BAD_REQUEST, r));
          return;
        }
        j.send(d || null);
      });
    },
  cw = (r, a) => {
    const { length: l } = (r = r ? r.filter(Boolean) : []);
    if (a || l) {
      let i = new AbortController(),
        c;
      const d = function (x) {
        if (!c) {
          ((c = !0), m());
          const v = x instanceof Error ? x : this.reason;
          i.abort(
            v instanceof De ? v : new al(v instanceof Error ? v.message : v),
          );
        }
      };
      let f =
        a &&
        setTimeout(() => {
          ((f = null), d(new De(`timeout of ${a}ms exceeded`, De.ETIMEDOUT)));
        }, a);
      const m = () => {
        r &&
          (f && clearTimeout(f),
          (f = null),
          r.forEach((x) => {
            x.unsubscribe
              ? x.unsubscribe(d)
              : x.removeEventListener("abort", d);
          }),
          (r = null));
      };
      r.forEach((x) => x.addEventListener("abort", d));
      const { signal: g } = i;
      return ((g.unsubscribe = () => B.asap(m)), g);
    }
  },
  uw = function* (r, a) {
    let l = r.byteLength;
    if (l < a) {
      yield r;
      return;
    }
    let i = 0,
      c;
    for (; i < l; ) ((c = i + a), yield r.slice(i, c), (i = c));
  },
  dw = async function* (r, a) {
    for await (const l of fw(r)) yield* uw(l, a);
  },
  fw = async function* (r) {
    if (r[Symbol.asyncIterator]) {
      yield* r;
      return;
    }
    const a = r.getReader();
    try {
      for (;;) {
        const { done: l, value: i } = await a.read();
        if (l) break;
        yield i;
      }
    } finally {
      await a.cancel();
    }
  },
  $h = (r, a, l, i) => {
    const c = dw(r, a);
    let d = 0,
      f,
      m = (g) => {
        f || ((f = !0), i && i(g));
      };
    return new ReadableStream(
      {
        async pull(g) {
          try {
            const { done: x, value: v } = await c.next();
            if (x) {
              (m(), g.close());
              return;
            }
            let p = v.byteLength;
            if (l) {
              let k = (d += p);
              l(k);
            }
            g.enqueue(new Uint8Array(v));
          } catch (x) {
            throw (m(x), x);
          }
        },
        cancel(g) {
          return (m(g), c.return());
        },
      },
      { highWaterMark: 2 },
    );
  },
  Uh = 64 * 1024,
  { isFunction: yo } = B,
  hw = (({ Request: r, Response: a }) => ({ Request: r, Response: a }))(
    B.global,
  ),
  { ReadableStream: Bh, TextEncoder: Hh } = B.global,
  Vh = (r, ...a) => {
    try {
      return !!r(...a);
    } catch {
      return !1;
    }
  },
  mw = (r) => {
    r = B.merge.call({ skipUndefined: !0 }, hw, r);
    const { fetch: a, Request: l, Response: i } = r,
      c = a ? yo(a) : typeof fetch == "function",
      d = yo(l),
      f = yo(i);
    if (!c) return !1;
    const m = c && yo(Bh),
      g =
        c &&
        (typeof Hh == "function"
          ? (
              (S) => (L) =>
                S.encode(L)
            )(new Hh())
          : async (S) => new Uint8Array(await new l(S).arrayBuffer())),
      x =
        d &&
        m &&
        Vh(() => {
          let S = !1;
          const L = new l(Mt.origin, {
            body: new Bh(),
            method: "POST",
            get duplex() {
              return ((S = !0), "half");
            },
          }).headers.has("Content-Type");
          return S && !L;
        }),
      v = f && m && Vh(() => B.isReadableStream(new i("").body)),
      p = { stream: v && ((S) => S.body) };
    c &&
      ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((S) => {
        !p[S] &&
          (p[S] = (L, j) => {
            let E = L && L[S];
            if (E) return E.call(L);
            throw new De(
              `Response type '${S}' is not supported`,
              De.ERR_NOT_SUPPORT,
              j,
            );
          });
      });
    const k = async (S) => {
        if (S == null) return 0;
        if (B.isBlob(S)) return S.size;
        if (B.isSpecCompliantForm(S))
          return (
            await new l(Mt.origin, { method: "POST", body: S }).arrayBuffer()
          ).byteLength;
        if (B.isArrayBufferView(S) || B.isArrayBuffer(S)) return S.byteLength;
        if ((B.isURLSearchParams(S) && (S = S + ""), B.isString(S)))
          return (await g(S)).byteLength;
      },
      R = async (S, L) => {
        const j = B.toFiniteNumber(S.getContentLength());
        return j ?? k(L);
      };
    return async (S) => {
      let {
          url: L,
          method: j,
          data: E,
          signal: D,
          cancelToken: H,
          timeout: G,
          onDownloadProgress: F,
          onUploadProgress: U,
          responseType: P,
          headers: Y,
          withCredentials: oe = "same-origin",
          fetchOptions: ce,
        } = np(S),
        Le = a || fetch;
      P = P ? (P + "").toLowerCase() : "text";
      let de = cw([D, H && H.toAbortSignal()], G),
        Re = null;
      const ve =
        de &&
        de.unsubscribe &&
        (() => {
          de.unsubscribe();
        });
      let me;
      try {
        if (
          U &&
          x &&
          j !== "get" &&
          j !== "head" &&
          (me = await R(Y, E)) !== 0
        ) {
          let w = new l(L, { method: "POST", body: E, duplex: "half" }),
            _;
          if (
            (B.isFormData(E) &&
              (_ = w.headers.get("content-type")) &&
              Y.setContentType(_),
            w.body)
          ) {
            const [W, Z] = zh(me, To(Ih(U)));
            E = $h(w.body, Uh, W, Z);
          }
        }
        B.isString(oe) || (oe = oe ? "include" : "omit");
        const Q = d && "credentials" in l.prototype,
          ue = {
            ...ce,
            signal: de,
            method: j.toUpperCase(),
            headers: Y.normalize().toJSON(),
            body: E,
            duplex: "half",
            credentials: Q ? oe : void 0,
          };
        Re = d && new l(L, ue);
        let V = await (d ? Le(Re, ce) : Le(L, ue));
        const ne = v && (P === "stream" || P === "response");
        if (v && (F || (ne && ve))) {
          const w = {};
          ["status", "statusText", "headers"].forEach((q) => {
            w[q] = V[q];
          });
          const _ = B.toFiniteNumber(V.headers.get("content-length")),
            [W, Z] = (F && zh(_, To(Ih(F), !0))) || [];
          V = new i(
            $h(V.body, Uh, W, () => {
              (Z && Z(), ve && ve());
            }),
            w,
          );
        }
        P = P || "text";
        let ee = await p[B.findKey(p, P) || "text"](V, S);
        return (
          !ne && ve && ve(),
          await new Promise((w, _) => {
            tp(w, _, {
              data: ee,
              headers: tr.from(V.headers),
              status: V.status,
              statusText: V.statusText,
              config: S,
              request: Re,
            });
          })
        );
      } catch (Q) {
        throw (
          ve && ve(),
          Q && Q.name === "TypeError" && /Load failed|fetch/i.test(Q.message)
            ? Object.assign(new De("Network Error", De.ERR_NETWORK, S, Re), {
                cause: Q.cause || Q,
              })
            : De.from(Q, Q && Q.code, S, Re)
        );
      }
    };
  },
  pw = new Map(),
  sp = (r) => {
    let a = (r && r.env) || {};
    const { fetch: l, Request: i, Response: c } = a,
      d = [i, c, l];
    let f = d.length,
      m = f,
      g,
      x,
      v = pw;
    for (; m--; )
      ((g = d[m]),
        (x = v.get(g)),
        x === void 0 && v.set(g, (x = m ? new Map() : mw(a))),
        (v = x));
    return x;
  };
sp();
const hu = { http: L2, xhr: iw, fetch: { get: sp } };
B.forEach(hu, (r, a) => {
  if (r) {
    try {
      Object.defineProperty(r, "name", { value: a });
    } catch {}
    Object.defineProperty(r, "adapterName", { value: a });
  }
});
const Wh = (r) => `- ${r}`,
  gw = (r) => B.isFunction(r) || r === null || r === !1;
function xw(r, a) {
  r = B.isArray(r) ? r : [r];
  const { length: l } = r;
  let i, c;
  const d = {};
  for (let f = 0; f < l; f++) {
    i = r[f];
    let m;
    if (
      ((c = i),
      !gw(i) && ((c = hu[(m = String(i)).toLowerCase()]), c === void 0))
    )
      throw new De(`Unknown adapter '${m}'`);
    if (c && (B.isFunction(c) || (c = c.get(a)))) break;
    d[m || "#" + f] = c;
  }
  if (!c) {
    const f = Object.entries(d).map(
      ([g, x]) =>
        `adapter ${g} ` +
        (x === !1
          ? "is not supported by the environment"
          : "is not available in the build"),
    );
    let m = l
      ? f.length > 1
        ? `since :
` +
          f.map(Wh).join(`
`)
        : " " + Wh(f[0])
      : "as no adapter specified";
    throw new De(
      "There is no suitable adapter to dispatch the request " + m,
      "ERR_NOT_SUPPORT",
    );
  }
  return c;
}
const ap = { getAdapter: xw, adapters: hu };
function Ac(r) {
  if (
    (r.cancelToken && r.cancelToken.throwIfRequested(),
    r.signal && r.signal.aborted)
  )
    throw new al(null, r);
}
function qh(r) {
  return (
    Ac(r),
    (r.headers = tr.from(r.headers)),
    (r.data = Lc.call(r, r.transformRequest)),
    ["post", "put", "patch"].indexOf(r.method) !== -1 &&
      r.headers.setContentType("application/x-www-form-urlencoded", !1),
    ap
      .getAdapter(
        r.adapter || sl.adapter,
        r,
      )(r)
      .then(
        function (i) {
          return (
            Ac(r),
            (i.data = Lc.call(r, r.transformResponse, i)),
            (i.headers = tr.from(i.headers)),
            i
          );
        },
        function (i) {
          return (
            ep(i) ||
              (Ac(r),
              i &&
                i.response &&
                ((i.response.data = Lc.call(
                  r,
                  r.transformResponse,
                  i.response,
                )),
                (i.response.headers = tr.from(i.response.headers)))),
            Promise.reject(i)
          );
        },
      )
  );
}
const lp = "1.13.4",
  zo = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach(
  (r, a) => {
    zo[r] = function (i) {
      return typeof i === r || "a" + (a < 1 ? "n " : " ") + r;
    };
  },
);
const Yh = {};
zo.transitional = function (a, l, i) {
  function c(d, f) {
    return (
      "[Axios v" +
      lp +
      "] Transitional option '" +
      d +
      "'" +
      f +
      (i ? ". " + i : "")
    );
  }
  return (d, f, m) => {
    if (a === !1)
      throw new De(
        c(f, " has been removed" + (l ? " in " + l : "")),
        De.ERR_DEPRECATED,
      );
    return (
      l &&
        !Yh[f] &&
        ((Yh[f] = !0),
        console.warn(
          c(
            f,
            " has been deprecated since v" +
              l +
              " and will be removed in the near future",
          ),
        )),
      a ? a(d, f, m) : !0
    );
  };
};
zo.spelling = function (a) {
  return (l, i) => (console.warn(`${i} is likely a misspelling of ${a}`), !0);
};
function yw(r, a, l) {
  if (typeof r != "object")
    throw new De("options must be an object", De.ERR_BAD_OPTION_VALUE);
  const i = Object.keys(r);
  let c = i.length;
  for (; c-- > 0; ) {
    const d = i[c],
      f = a[d];
    if (f) {
      const m = r[d],
        g = m === void 0 || f(m, d, r);
      if (g !== !0)
        throw new De("option " + d + " must be " + g, De.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (l !== !0) throw new De("Unknown option " + d, De.ERR_BAD_OPTION);
  }
}
const So = { assertOptions: yw, validators: zo },
  Zr = So.validators;
let ys = class {
  constructor(a) {
    ((this.defaults = a || {}),
      (this.interceptors = { request: new Dh(), response: new Dh() }));
  }
  async request(a, l) {
    try {
      return await this._request(a, l);
    } catch (i) {
      if (i instanceof Error) {
        let c = {};
        Error.captureStackTrace
          ? Error.captureStackTrace(c)
          : (c = new Error());
        const d = c.stack ? c.stack.replace(/^.+\n/, "") : "";
        try {
          i.stack
            ? d &&
              !String(i.stack).endsWith(d.replace(/^.+\n.+\n/, "")) &&
              (i.stack +=
                `
` + d)
            : (i.stack = d);
        } catch {}
      }
      throw i;
    }
  }
  _request(a, l) {
    (typeof a == "string" ? ((l = l || {}), (l.url = a)) : (l = a || {}),
      (l = vs(this.defaults, l)));
    const { transitional: i, paramsSerializer: c, headers: d } = l;
    (i !== void 0 &&
      So.assertOptions(
        i,
        {
          silentJSONParsing: Zr.transitional(Zr.boolean),
          forcedJSONParsing: Zr.transitional(Zr.boolean),
          clarifyTimeoutError: Zr.transitional(Zr.boolean),
        },
        !1,
      ),
      c != null &&
        (B.isFunction(c)
          ? (l.paramsSerializer = { serialize: c })
          : So.assertOptions(
              c,
              { encode: Zr.function, serialize: Zr.function },
              !0,
            )),
      l.allowAbsoluteUrls !== void 0 ||
        (this.defaults.allowAbsoluteUrls !== void 0
          ? (l.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls)
          : (l.allowAbsoluteUrls = !0)),
      So.assertOptions(
        l,
        {
          baseUrl: Zr.spelling("baseURL"),
          withXsrfToken: Zr.spelling("withXSRFToken"),
        },
        !0,
      ),
      (l.method = (l.method || this.defaults.method || "get").toLowerCase()));
    let f = d && B.merge(d.common, d[l.method]);
    (d &&
      B.forEach(
        ["delete", "get", "head", "post", "put", "patch", "common"],
        (S) => {
          delete d[S];
        },
      ),
      (l.headers = tr.concat(f, d)));
    const m = [];
    let g = !0;
    this.interceptors.request.forEach(function (L) {
      (typeof L.runWhen == "function" && L.runWhen(l) === !1) ||
        ((g = g && L.synchronous), m.unshift(L.fulfilled, L.rejected));
    });
    const x = [];
    this.interceptors.response.forEach(function (L) {
      x.push(L.fulfilled, L.rejected);
    });
    let v,
      p = 0,
      k;
    if (!g) {
      const S = [qh.bind(this), void 0];
      for (
        S.unshift(...m), S.push(...x), k = S.length, v = Promise.resolve(l);
        p < k;
      )
        v = v.then(S[p++], S[p++]);
      return v;
    }
    k = m.length;
    let R = l;
    for (; p < k; ) {
      const S = m[p++],
        L = m[p++];
      try {
        R = S(R);
      } catch (j) {
        L.call(this, j);
        break;
      }
    }
    try {
      v = qh.call(this, R);
    } catch (S) {
      return Promise.reject(S);
    }
    for (p = 0, k = x.length; p < k; ) v = v.then(x[p++], x[p++]);
    return v;
  }
  getUri(a) {
    a = vs(this.defaults, a);
    const l = rp(a.baseURL, a.url, a.allowAbsoluteUrls);
    return Jm(l, a.params, a.paramsSerializer);
  }
};
B.forEach(["delete", "get", "head", "options"], function (a) {
  ys.prototype[a] = function (l, i) {
    return this.request(
      vs(i || {}, { method: a, url: l, data: (i || {}).data }),
    );
  };
});
B.forEach(["post", "put", "patch"], function (a) {
  function l(i) {
    return function (d, f, m) {
      return this.request(
        vs(m || {}, {
          method: a,
          headers: i ? { "Content-Type": "multipart/form-data" } : {},
          url: d,
          data: f,
        }),
      );
    };
  }
  ((ys.prototype[a] = l()), (ys.prototype[a + "Form"] = l(!0)));
});
let vw = class op {
  constructor(a) {
    if (typeof a != "function")
      throw new TypeError("executor must be a function.");
    let l;
    this.promise = new Promise(function (d) {
      l = d;
    });
    const i = this;
    (this.promise.then((c) => {
      if (!i._listeners) return;
      let d = i._listeners.length;
      for (; d-- > 0; ) i._listeners[d](c);
      i._listeners = null;
    }),
      (this.promise.then = (c) => {
        let d;
        const f = new Promise((m) => {
          (i.subscribe(m), (d = m));
        }).then(c);
        return (
          (f.cancel = function () {
            i.unsubscribe(d);
          }),
          f
        );
      }),
      a(function (d, f, m) {
        i.reason || ((i.reason = new al(d, f, m)), l(i.reason));
      }));
  }
  throwIfRequested() {
    if (this.reason) throw this.reason;
  }
  subscribe(a) {
    if (this.reason) {
      a(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(a) : (this._listeners = [a]);
  }
  unsubscribe(a) {
    if (!this._listeners) return;
    const l = this._listeners.indexOf(a);
    l !== -1 && this._listeners.splice(l, 1);
  }
  toAbortSignal() {
    const a = new AbortController(),
      l = (i) => {
        a.abort(i);
      };
    return (
      this.subscribe(l),
      (a.signal.unsubscribe = () => this.unsubscribe(l)),
      a.signal
    );
  }
  static source() {
    let a;
    return {
      token: new op(function (c) {
        a = c;
      }),
      cancel: a,
    };
  }
};
function ww(r) {
  return function (l) {
    return r.apply(null, l);
  };
}
function bw(r) {
  return B.isObject(r) && r.isAxiosError === !0;
}
const Wc = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526,
};
Object.entries(Wc).forEach(([r, a]) => {
  Wc[a] = r;
});
function ip(r) {
  const a = new ys(r),
    l = $m(ys.prototype.request, a);
  return (
    B.extend(l, ys.prototype, a, { allOwnKeys: !0 }),
    B.extend(l, a, null, { allOwnKeys: !0 }),
    (l.create = function (c) {
      return ip(vs(r, c));
    }),
    l
  );
}
const mt = ip(sl);
mt.Axios = ys;
mt.CanceledError = al;
mt.CancelToken = vw;
mt.isCancel = ep;
mt.VERSION = lp;
mt.toFormData = Mo;
mt.AxiosError = De;
mt.Cancel = mt.CanceledError;
mt.all = function (a) {
  return Promise.all(a);
};
mt.spread = ww;
mt.isAxiosError = bw;
mt.mergeConfig = vs;
mt.AxiosHeaders = tr;
mt.formToJSON = (r) => Zm(B.isHTMLForm(r) ? new FormData(r) : r);
mt.getAdapter = ap.getAdapter;
mt.HttpStatusCode = Wc;
mt.default = mt;
const {
    Axios: t3,
    AxiosError: r3,
    CanceledError: n3,
    isCancel: s3,
    CancelToken: a3,
    VERSION: l3,
    all: o3,
    Cancel: i3,
    isAxiosError: c3,
    spread: u3,
    toFormData: d3,
    AxiosHeaders: f3,
    HttpStatusCode: h3,
    formToJSON: m3,
    getAdapter: p3,
    mergeConfig: g3,
  } = mt,
  jw = "http://localhost:3001".replace(/\/+$/g, ""),
  ll = mt.create({ baseURL: jw });
ll.interceptors.request.use((r) => {
  try {
    const a = localStorage.getItem("supabase.auth.token");
    a && r.headers && (r.headers.Authorization = `Bearer ${a}`);
  } catch {}
  return r;
});
ll.interceptors.response.use(
  (r) => r,
  (r) => Promise.reject(r.response?.data || r),
);
async function kw(r) {
  return (await ll.post("/generate-website-config", { businessId: r })).data;
}
async function cp() {
  return (await ll.post("/conversation/start", {})).data;
}
async function Nw(r, a) {
  return (await ll.post("/conversation/message", { sessionId: r, message: a }))
    .data;
}
function Sw() {
  const r = zt(),
    { getToken: a } = Kn(),
    [l, i] = b.useState(null);
  return (
    b.useEffect(() => {
      (async () => {
        try {
          const d = a();
          if (!d) {
            (i("Not authenticated. Redirecting to login..."),
              setTimeout(() => r("/login"), 2e3));
            return;
          }
          console.log(
            "Starting conversation with token:",
            d.substring(0, 20) + "...",
          );
          const f = await cp();
          if ((console.log("Conversation started:", f), f?.sessionId)) {
            const m = {
              sessionId: f.sessionId,
              stage: f.stage || "initial",
              currentQuestion:
                f.currentQuestion || "What is your business name?",
              extracted: f.extracted || {},
              isComplete: f.isComplete || !1,
              questionNumber: f.questionNumber || 1,
              totalQuestions: f.totalQuestions || 10,
            };
            (sessionStorage.setItem(`conv_${f.sessionId}`, JSON.stringify(m)),
              r(`/conversation/${f.sessionId}/question`));
          } else throw new Error("No session ID received from server");
        } catch (d) {
          console.error("Error starting conversation:", d);
          const f =
            d?.response?.data?.message ||
            d?.response?.data?.error ||
            d?.message ||
            "Failed to start conversation";
          (i(`Error: ${f}. Redirecting...`),
            setTimeout(() => r("/dashboard"), 3e3));
        }
      })();
    }, [r, a]),
    n.jsx("div", {
      className:
        "min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4",
      children: n.jsx("div", {
        className: "text-center",
        children: l
          ? n.jsx("div", {
              className: "max-w-md",
              children: n.jsxs("div", {
                className:
                  "mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3",
                children: [
                  n.jsx(rn, {
                    className:
                      "w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5",
                  }),
                  n.jsx("div", {
                    children: n.jsx("p", {
                      className: "text-sm text-red-700 dark:text-red-300",
                      children: l,
                    }),
                  }),
                ],
              }),
            })
          : n.jsxs(n.Fragment, {
              children: [
                n.jsx(qa, {
                  className:
                    "w-12 h-12 animate-spin mx-auto mb-4 text-blue-600",
                }),
                n.jsx("h2", {
                  className:
                    "text-xl font-semibold text-gray-900 dark:text-white mb-2",
                  children: "Starting conversation...",
                }),
                n.jsx("p", {
                  className: "text-gray-600 dark:text-gray-400",
                  children: "Initializing AI conversation for your website",
                }),
              ],
            }),
      }),
    })
  );
}
function Cw() {
  const r = zt(),
    l = Ir().state?.businessUnderstanding,
    [i, c] = b.useState(!1),
    [d, f] = b.useState(
      l || {
        name: "",
        category: "",
        location: "",
        services: [],
        valueProposition: "",
        targetAudience: "",
        brandTone: "professional",
        brandColors: ["#3B82F6"],
        trustSignals: [],
        seoKeywords: [],
        contactPreferences: { email: !0, phone: !0, booking: !0 },
      },
    ),
    [m, g] = b.useState([]),
    x = () => {
      r(-1);
    },
    v = (j, E) => {
      f({ ...d, [j]: E });
    },
    p = (j, E, D) => {
      const H = [...d[j]];
      ((H[E] = D), v(j, H));
    },
    k = (j) => {
      const E = d[j] || [];
      v(j, [...E, ""]);
    },
    R = (j, E) => {
      const D = d[j].filter((H, G) => G !== E);
      v(j, D);
    },
    S = () => {
      const j = [];
      return (
        (!d.name || d.name.trim().length === 0) &&
          j.push("Business name is required"),
        (!d.category || d.category.trim().length === 0) &&
          j.push("Category is required"),
        (!d.location || d.location.trim().length === 0) &&
          j.push("Location is required"),
        (!d.services || d.services.length === 0) &&
          j.push("At least one service is required"),
        (!d.valueProposition || d.valueProposition.trim().length < 10) &&
          j.push("Value proposition must be at least 10 characters"),
        (!d.targetAudience || d.targetAudience.trim().length === 0) &&
          j.push("Target audience is required"),
        (!d.trustSignals || d.trustSignals.length === 0) &&
          j.push("At least one trust signal is required"),
        (!d.seoKeywords || d.seoKeywords.length < 5) &&
          j.push("At least 5 SEO keywords are required"),
        g(j),
        j.length === 0
      );
    },
    L = async () => {
      S() && r("/create-website", { state: { businessUnderstanding: d } });
    };
  return l
    ? n.jsxs("div", {
        className:
          "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900",
        children: [
          n.jsx("header", {
            className:
              "border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50",
            children: n.jsxs("div", {
              className:
                "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center",
              children: [
                n.jsx(Mr, {}),
                n.jsx("div", {
                  className: "flex items-center gap-4",
                  children: n.jsx(bs, {}),
                }),
              ],
            }),
          }),
          n.jsxs("main", {
            className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
            children: [
              n.jsxs("div", {
                className: "mb-8",
                children: [
                  n.jsx("h1", {
                    className:
                      "text-3xl font-bold text-slate-900 dark:text-white mb-2",
                    children: "Review Your Business Profile",
                  }),
                  n.jsx("p", {
                    className: "text-slate-600 dark:text-slate-400",
                    children: i
                      ? "Edit your business information before we create your website"
                      : "Here's what we understand about your business. Edit anything that needs adjustment.",
                  }),
                ],
              }),
              m.length > 0 &&
                n.jsx(Ee, {
                  className:
                    "border-red-200 dark:border-red-900 mb-6 bg-red-50 dark:bg-red-950/20",
                  children: n.jsx(Pe, {
                    className: "pt-6",
                    children: n.jsxs("div", {
                      className: "flex gap-3",
                      children: [
                        n.jsx(rn, {
                          className:
                            "w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5",
                        }),
                        n.jsxs("div", {
                          children: [
                            n.jsx("h3", {
                              className:
                                "font-semibold text-red-600 dark:text-red-400 mb-2",
                              children: "Please fix the following issues:",
                            }),
                            n.jsx("ul", {
                              className: "space-y-1",
                              children: m.map((j, E) =>
                                n.jsxs(
                                  "li",
                                  {
                                    className:
                                      "text-sm text-red-700 dark:text-red-300",
                                    children: ["• ", j],
                                  },
                                  E,
                                ),
                              ),
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                }),
              n.jsxs(Ee, {
                className: "mb-6",
                children: [
                  n.jsx(ot, {
                    children: n.jsx("h2", {
                      className:
                        "text-xl font-bold text-slate-900 dark:text-white",
                      children: "Core Information",
                    }),
                  }),
                  n.jsxs(Pe, {
                    className: "space-y-6",
                    children: [
                      n.jsxs("div", {
                        className: "grid md:grid-cols-2 gap-6",
                        children: [
                          n.jsxs("div", {
                            children: [
                              n.jsx("label", {
                                className:
                                  "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2",
                                children: "Business Name",
                              }),
                              n.jsx(St, {
                                value: d.name,
                                onChange: (j) => v("name", j.target.value),
                                disabled: !i,
                                placeholder: "Your business name",
                              }),
                            ],
                          }),
                          n.jsxs("div", {
                            children: [
                              n.jsx("label", {
                                className:
                                  "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2",
                                children: "Category / Industry",
                              }),
                              n.jsx(St, {
                                value: d.category,
                                onChange: (j) => v("category", j.target.value),
                                disabled: !i,
                                placeholder:
                                  "e.g., Consulting, Design, Photography",
                              }),
                            ],
                          }),
                          n.jsxs("div", {
                            children: [
                              n.jsx("label", {
                                className:
                                  "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2",
                                children: "Location",
                              }),
                              n.jsx(St, {
                                value: d.location,
                                onChange: (j) => v("location", j.target.value),
                                disabled: !i,
                                placeholder: "City, State or Service Area",
                              }),
                            ],
                          }),
                          n.jsxs("div", {
                            children: [
                              n.jsx("label", {
                                className:
                                  "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2",
                                children: "Brand Tone",
                              }),
                              n.jsxs("select", {
                                value: d.brandTone,
                                onChange: (j) => v("brandTone", j.target.value),
                                disabled: !i,
                                className:
                                  "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50",
                                children: [
                                  n.jsx("option", {
                                    value: "professional",
                                    children: "Professional",
                                  }),
                                  n.jsx("option", {
                                    value: "friendly",
                                    children: "Friendly",
                                  }),
                                  n.jsx("option", {
                                    value: "luxury",
                                    children: "Luxury",
                                  }),
                                  n.jsx("option", {
                                    value: "bold",
                                    children: "Bold",
                                  }),
                                  n.jsx("option", {
                                    value: "casual",
                                    children: "Casual",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      n.jsxs("div", {
                        children: [
                          n.jsx("label", {
                            className:
                              "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2",
                            children: "Value Proposition",
                          }),
                          n.jsx("textarea", {
                            value: d.valueProposition,
                            onChange: (j) =>
                              v("valueProposition", j.target.value),
                            disabled: !i,
                            placeholder: "What makes your business unique?",
                            rows: 3,
                            className:
                              "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50",
                          }),
                        ],
                      }),
                      n.jsxs("div", {
                        children: [
                          n.jsx("label", {
                            className:
                              "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2",
                            children: "Target Audience",
                          }),
                          n.jsx(St, {
                            value: d.targetAudience,
                            onChange: (j) =>
                              v("targetAudience", j.target.value),
                            disabled: !i,
                            placeholder: "Who do you serve?",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              n.jsxs(Ee, {
                className: "mb-6",
                children: [
                  n.jsx(ot, {
                    children: n.jsx("h2", {
                      className:
                        "text-xl font-bold text-slate-900 dark:text-white",
                      children: "Services",
                    }),
                  }),
                  n.jsxs(Pe, {
                    className: "space-y-3",
                    children: [
                      (d.services || []).map((j, E) =>
                        n.jsxs(
                          "div",
                          {
                            className: "flex gap-2 items-end",
                            children: [
                              n.jsx(St, {
                                value: j,
                                onChange: (D) =>
                                  p("services", E, D.target.value),
                                disabled: !i,
                                placeholder: "Service name",
                                className: "flex-1",
                              }),
                              i &&
                                n.jsx(ae, {
                                  onClick: () => R("services", E),
                                  variant: "outline",
                                  size: "sm",
                                  children: "Remove",
                                }),
                            ],
                          },
                          E,
                        ),
                      ),
                      i &&
                        n.jsx(ae, {
                          onClick: () => k("services"),
                          variant: "outline",
                          size: "sm",
                          children: "+ Add Service",
                        }),
                    ],
                  }),
                ],
              }),
              n.jsxs(Ee, {
                className: "mb-6",
                children: [
                  n.jsx(ot, {
                    children: n.jsx("h2", {
                      className:
                        "text-xl font-bold text-slate-900 dark:text-white",
                      children: "Trust Signals",
                    }),
                  }),
                  n.jsxs(Pe, {
                    className: "space-y-3",
                    children: [
                      (d.trustSignals || []).map((j, E) =>
                        n.jsxs(
                          "div",
                          {
                            className: "flex gap-2 items-end",
                            children: [
                              n.jsx(St, {
                                value: j,
                                onChange: (D) =>
                                  p("trustSignals", E, D.target.value),
                                disabled: !i,
                                placeholder:
                                  "e.g., Award-winning, 10+ years experience",
                                className: "flex-1",
                              }),
                              i &&
                                n.jsx(ae, {
                                  onClick: () => R("trustSignals", E),
                                  variant: "outline",
                                  size: "sm",
                                  children: "Remove",
                                }),
                            ],
                          },
                          E,
                        ),
                      ),
                      i &&
                        n.jsx(ae, {
                          onClick: () => k("trustSignals"),
                          variant: "outline",
                          size: "sm",
                          children: "+ Add Trust Signal",
                        }),
                    ],
                  }),
                ],
              }),
              n.jsxs(Ee, {
                className: "mb-6",
                children: [
                  n.jsx(ot, {
                    children: n.jsx("h2", {
                      className:
                        "text-xl font-bold text-slate-900 dark:text-white",
                      children: "SEO Keywords (Minimum 5 required)",
                    }),
                  }),
                  n.jsxs(Pe, {
                    className: "space-y-3",
                    children: [
                      n.jsx("div", {
                        className: "grid md:grid-cols-2 gap-3",
                        children: (d.seoKeywords || []).map((j, E) =>
                          n.jsxs(
                            "div",
                            {
                              className: "flex gap-2",
                              children: [
                                n.jsx(St, {
                                  value: j,
                                  onChange: (D) =>
                                    p("seoKeywords", E, D.target.value),
                                  disabled: !i,
                                  placeholder: "Keyword",
                                  className: "flex-1",
                                }),
                                i &&
                                  n.jsx(ae, {
                                    onClick: () => R("seoKeywords", E),
                                    variant: "outline",
                                    size: "sm",
                                    children: "Remove",
                                  }),
                              ],
                            },
                            E,
                          ),
                        ),
                      }),
                      i &&
                        n.jsx(ae, {
                          onClick: () => k("seoKeywords"),
                          variant: "outline",
                          size: "sm",
                          children: "+ Add Keyword",
                        }),
                    ],
                  }),
                ],
              }),
              n.jsxs(Ee, {
                className: "mb-6",
                children: [
                  n.jsx(ot, {
                    children: n.jsx("h2", {
                      className:
                        "text-xl font-bold text-slate-900 dark:text-white",
                      children: "Brand Colors",
                    }),
                  }),
                  n.jsxs(Pe, {
                    className: "space-y-3",
                    children: [
                      n.jsx("div", {
                        className: "grid md:grid-cols-2 gap-3",
                        children: (d.brandColors || []).map((j, E) =>
                          n.jsxs(
                            "div",
                            {
                              className: "flex gap-2 items-end",
                              children: [
                                n.jsx(St, {
                                  type: "text",
                                  value: j,
                                  onChange: (D) =>
                                    p("brandColors", E, D.target.value),
                                  disabled: !i,
                                  placeholder: "#FF0000",
                                  className: "flex-1",
                                }),
                                n.jsx("div", {
                                  className:
                                    "w-10 h-10 rounded border-2 border-slate-300 dark:border-slate-600",
                                  style: { backgroundColor: j || "#fff" },
                                }),
                                i &&
                                  n.jsx(ae, {
                                    onClick: () => R("brandColors", E),
                                    variant: "outline",
                                    size: "sm",
                                    children: "Remove",
                                  }),
                              ],
                            },
                            E,
                          ),
                        ),
                      }),
                      i &&
                        n.jsx(ae, {
                          onClick: () => k("brandColors"),
                          variant: "outline",
                          size: "sm",
                          children: "+ Add Color",
                        }),
                    ],
                  }),
                ],
              }),
              n.jsxs(Ee, {
                className: "mb-8",
                children: [
                  n.jsx(ot, {
                    children: n.jsx("h2", {
                      className:
                        "text-xl font-bold text-slate-900 dark:text-white",
                      children: "Contact Preferences",
                    }),
                  }),
                  n.jsxs(Pe, {
                    className: "space-y-4",
                    children: [
                      n.jsxs("label", {
                        className: "flex items-center gap-3 cursor-pointer",
                        children: [
                          n.jsx("input", {
                            type: "checkbox",
                            checked: d.contactPreferences.email,
                            onChange: (j) =>
                              v("contactPreferences", {
                                ...d.contactPreferences,
                                email: j.target.checked,
                              }),
                            disabled: !i,
                          }),
                          n.jsx("span", {
                            className: "text-slate-700 dark:text-slate-300",
                            children: "Email contact enabled",
                          }),
                        ],
                      }),
                      n.jsxs("label", {
                        className: "flex items-center gap-3 cursor-pointer",
                        children: [
                          n.jsx("input", {
                            type: "checkbox",
                            checked: d.contactPreferences.phone,
                            onChange: (j) =>
                              v("contactPreferences", {
                                ...d.contactPreferences,
                                phone: j.target.checked,
                              }),
                            disabled: !i,
                          }),
                          n.jsx("span", {
                            className: "text-slate-700 dark:text-slate-300",
                            children: "Phone contact enabled",
                          }),
                        ],
                      }),
                      n.jsxs("label", {
                        className: "flex items-center gap-3 cursor-pointer",
                        children: [
                          n.jsx("input", {
                            type: "checkbox",
                            checked: d.contactPreferences.booking,
                            onChange: (j) =>
                              v("contactPreferences", {
                                ...d.contactPreferences,
                                booking: j.target.checked,
                              }),
                            disabled: !i,
                          }),
                          n.jsx("span", {
                            className: "text-slate-700 dark:text-slate-300",
                            children: "Calendar booking enabled",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              n.jsxs("div", {
                className: "flex gap-4 justify-between",
                children: [
                  n.jsxs(ae, {
                    onClick: x,
                    variant: "outline",
                    className: "flex items-center gap-2",
                    children: [n.jsx(Js, { className: "w-4 h-4" }), "Back"],
                  }),
                  n.jsxs("div", {
                    className: "flex gap-4",
                    children: [
                      n.jsx(ae, {
                        onClick: () => c(!i),
                        variant: "outline",
                        className: "flex items-center gap-2",
                        children: i
                          ? n.jsxs(n.Fragment, {
                              children: [
                                n.jsx(lu, { className: "w-4 h-4" }),
                                "Done Editing",
                              ],
                            })
                          : n.jsxs(n.Fragment, {
                              children: [
                                n.jsx(y1, { className: "w-4 h-4" }),
                                "Edit",
                              ],
                            }),
                      }),
                      n.jsxs(ae, {
                        onClick: L,
                        disabled: m.length > 0,
                        className: "flex items-center gap-2",
                        children: [
                          "Create Website",
                          n.jsx(Pm, { className: "w-4 h-4" }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    : n.jsx("div", {
        className:
          "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center",
        children: n.jsx(Ee, {
          className: "max-w-md",
          children: n.jsxs(Pe, {
            className: "pt-6",
            children: [
              n.jsx(rn, { className: "w-12 h-12 text-yellow-600 mb-4" }),
              n.jsx("h2", {
                className:
                  "text-xl font-bold text-slate-900 dark:text-white mb-2",
                children: "No Data Found",
              }),
              n.jsx("p", {
                className: "text-slate-600 dark:text-slate-400 mb-6",
                children:
                  "Unable to load business data. Please start from the onboarding flow.",
              }),
              n.jsx(ae, {
                onClick: () => r("/"),
                className: "w-full",
                children: "Go Back to Onboarding",
              }),
            ],
          }),
        }),
      });
}
function qn({ value: r, size: a = 120, strokeWidth: l = 8, label: i }) {
  const c = (a - l) / 2,
    d = c * 2 * Math.PI,
    f = d - (r / 100) * d,
    g = ((x) => (x >= 90 ? "#10b981" : x >= 50 ? "#f59e0b" : "#ef4444"))(r);
  return n.jsxs("div", {
    className: "flex flex-col items-center gap-2",
    children: [
      n.jsxs("div", {
        className: "relative flex-shrink-0",
        style: { width: a, height: a },
        children: [
          n.jsxs("svg", {
            width: a,
            height: a,
            className: "transform -rotate-90",
            viewBox: `0 0 ${a} ${a}`,
            preserveAspectRatio: "xMidYMid meet",
            children: [
              n.jsx("circle", {
                cx: a / 2,
                cy: a / 2,
                r: c,
                stroke: "#e5e7eb",
                strokeWidth: l,
                fill: "none",
              }),
              n.jsx("circle", {
                cx: a / 2,
                cy: a / 2,
                r: c,
                stroke: g,
                strokeWidth: l,
                fill: "none",
                strokeDasharray: d,
                strokeDashoffset: f,
                strokeLinecap: "round",
                className:
                  "transition-all duration-1000 ease-out will-change-auto",
                style: {
                  backfaceVisibility: "hidden",
                  WebkitFontSmoothing: "antialiased",
                },
              }),
            ],
          }),
          n.jsx("div", {
            className: "absolute inset-0 flex items-center justify-center",
            children: n.jsx("span", {
              className: "text-2xl font-bold text-center leading-none",
              style: { color: g },
              children: r,
            }),
          }),
        ],
      }),
      i &&
        n.jsx("span", {
          className: "text-sm font-medium text-gray-700 text-center",
          children: i,
        }),
    ],
  });
}
const Oc = "http://localhost:3001".replace(/\/+$/g, "");
function Ew() {
  const r = zt(),
    { canRunSEOAudit: a, currentPlan: l, usage: i, refreshUsage: c } = cu(),
    { user: d } = Kn(),
    [f, m] = b.useState(""),
    [g, x] = b.useState(!1),
    [v, p] = b.useState(!1),
    [k, R] = b.useState(!1),
    [S, L] = b.useState(null),
    [j, E] = b.useState(""),
    D = l === "free" ? Dr.free.limits.seoAudits - i.seoAudits : 1 / 0,
    H = async () => {
      if (!a) {
        R(!0);
        return;
      }
      if (!f) {
        alert("Please enter a URL");
        return;
      }
      let F = f.trim();
      (F && !F.match(/^https?:\/\//) && (F = `https://${F}`),
        x(!0),
        E(""),
        console.log("=== Starting SEO Audit ==="),
        console.log("Normalized URL:", F),
        console.log("API_BASE:", Oc),
        console.log("localStorage keys:", Object.keys(localStorage)));
      try {
        const U = localStorage.getItem("supabase.auth.token");
        if (
          (console.log("=== SEO Audit Token Check ==="),
          console.log(
            "Token from localStorage:",
            U ? `${U.substring(0, 30)}...` : "NOT FOUND",
          ),
          console.log("Token exists:", !!U),
          console.log("Token type:", typeof U),
          console.log("Token length:", U ? U.length : 0),
          console.log("All localStorage keys:", Object.keys(localStorage)),
          !U || U.trim() === "")
        ) {
          const ce =
            "No authentication token found. Please log in and try again.";
          (console.error("=== SEO Audit Authentication Failed ===", ce),
            console.log(
              "Current auth state - Check browser DevTools > Application > localStorage",
            ),
            E(ce),
            x(!1),
            alert(ce));
          return;
        }
        const P = { url: F };
        (console.log("Request body:", P),
          console.log("Sending request to:", `${Oc}/seo-audit`),
          console.log(
            "Authorization header:",
            `Bearer ${U.substring(0, 20)}...`,
          ));
        const Y = await fetch(`${Oc}/seo-audit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${U}`,
          },
          body: JSON.stringify(P),
        });
        (console.log("Response status:", Y.status),
          console.log("Response headers:", Object.fromEntries(Y.headers)));
        const oe = await Y.json();
        if ((console.log("Response data:", oe), !Y.ok)) {
          const ce = oe.error || `HTTP ${Y.status}`;
          throw (console.error("API Error:", ce), new Error(ce));
        }
        (console.log("Setting audit results:", oe.audit),
          L(oe.audit),
          p(!0),
          c && (console.log("Refreshing usage"), await c()));
      } catch (U) {
        console.error("Audit error details:", {
          message: U.message,
          stack: U.stack,
          err: U,
        });
        const P = U.message || "Failed to run SEO audit";
        (E(P), alert(`Error: ${P}`));
      } finally {
        x(!1);
      }
    },
    G = (F) => {
      (F.preventDefault(), H());
    };
  return n.jsxs("div", {
    className: "min-h-screen bg-gray-50 dark:bg-gray-900",
    children: [
      n.jsx(Uc, { isOpen: k, onClose: () => R(!1), highlightPlan: "pro" }),
      n.jsx("header", {
        className:
          "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
        children: n.jsx("div", {
          className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4",
          children: n.jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              n.jsx(Mr, { size: "sm", className: "md:hidden" }),
              n.jsx(Mr, { size: "md", className: "hidden md:block" }),
              n.jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  n.jsx(bs, {}),
                  n.jsxs(ae, {
                    variant: "ghost",
                    onClick: () => r("/dashboard"),
                    children: [
                      n.jsx(Js, { className: "w-4 h-4" }),
                      n.jsx("span", {
                        className: "hidden sm:inline",
                        children: "Back to Dashboard",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
      }),
      n.jsxs("main", {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
        children: [
          n.jsxs("div", {
            className: "text-center mb-12",
            children: [
              n.jsxs("div", {
                className: "flex items-center justify-center gap-2 mb-4",
                children: [
                  n.jsx("h1", {
                    className:
                      "text-4xl font-bold text-gray-900 dark:text-white",
                    children: "Free SEO Audit",
                  }),
                  l === "free" &&
                    n.jsxs(fr, {
                      variant: "warning",
                      children: [D, " remaining"],
                    }),
                  l !== "free" &&
                    n.jsxs(fr, {
                      variant: "success",
                      style: {
                        backgroundColor: "#f724de",
                        color: "white",
                        border: "none",
                      },
                      children: [
                        n.jsx(Ks, { className: "w-3 h-3" }),
                        "Unlimited",
                      ],
                    }),
                ],
              }),
              n.jsx("p", {
                className:
                  "text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto",
                children:
                  "Get actionable insights to improve your website's search ranking and performance",
              }),
            ],
          }),
          l === "free" &&
            !a &&
            n.jsx("div", {
              className: "mb-8",
              children: n.jsx(Im, {
                feature: "seoAudit",
                onUpgrade: () => R(!0),
              }),
            }),
          !v &&
            n.jsx(Ee, {
              className: "max-w-2xl mx-auto",
              children: n.jsx(Pe, {
                className: "p-8",
                children: n.jsxs("form", {
                  onSubmit: G,
                  className: "space-y-6",
                  children: [
                    n.jsx("div", {
                      children: n.jsx(St, {
                        label: "Website URL",
                        type: "text",
                        placeholder: "google.com or https://yourbusiness.com",
                        value: f,
                        onChange: (F) => m(F.target.value),
                        required: !0,
                      }),
                    }),
                    n.jsx(ae, {
                      type: "submit",
                      variant: "primary",
                      size: "lg",
                      className: "w-full",
                      disabled: g,
                      children: g
                        ? n.jsxs(n.Fragment, {
                            children: [
                              n.jsx("div", {
                                className:
                                  "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin",
                              }),
                              "Analyzing...",
                            ],
                          })
                        : n.jsxs(n.Fragment, {
                            children: [
                              n.jsx(Ya, { className: "w-5 h-5" }),
                              "Run SEO Audit",
                            ],
                          }),
                    }),
                  ],
                }),
              }),
            }),
          v &&
            n.jsxs("div", {
              className: "space-y-6",
              children: [
                n.jsxs(Ee, {
                  children: [
                    n.jsx(ot, {
                      children: n.jsxs("div", {
                        className: "flex items-center justify-between",
                        children: [
                          n.jsxs("div", {
                            children: [
                              n.jsx("h2", {
                                className:
                                  "text-2xl font-bold text-gray-900 dark:text-white",
                                children: "Audit Results",
                              }),
                              n.jsxs("p", {
                                className: "text-gray-600 dark:text-gray-400",
                                children: ["for ", f],
                              }),
                            ],
                          }),
                          n.jsxs(ae, {
                            variant: "outline",
                            onClick: () => p(!1),
                            children: [
                              n.jsx(Ya, { className: "w-4 h-4" }),
                              "New Audit",
                            ],
                          }),
                        ],
                      }),
                    }),
                    n.jsx(Pe, {
                      children: n.jsxs("div", {
                        className: "grid grid-cols-2 md:grid-cols-4 gap-8",
                        children: [
                          n.jsx(qn, {
                            value: S?.performance || 0,
                            label: "Performance",
                          }),
                          n.jsx(qn, { value: S?.seoScore || 0, label: "SEO" }),
                          n.jsx(qn, {
                            value: S?.accessibility || 0,
                            label: "Accessibility",
                          }),
                          n.jsx(qn, {
                            value: S?.bestPractices || 0,
                            label: "Best Practices",
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
                n.jsxs(Ee, {
                  children: [
                    n.jsx(ot, {
                      children: n.jsx("h3", {
                        className: "text-xl font-bold text-gray-900",
                        children: "Issues Found",
                      }),
                    }),
                    n.jsx(Pe, {
                      className: "p-0",
                      children: n.jsx("div", {
                        className: "divide-y divide-gray-100",
                        children: (() => {
                          const F = S?.issues || {},
                            U = [];
                          return (
                            Array.isArray(F.critical) &&
                              F.critical.forEach((P) => {
                                U.push({ text: P, severity: "high" });
                              }),
                            Array.isArray(F.warnings) &&
                              F.warnings.forEach((P) => {
                                U.push({ text: P, severity: "medium" });
                              }),
                            Array.isArray(F.opportunities) &&
                              F.opportunities.forEach((P) => {
                                U.push({ text: P, severity: "low" });
                              }),
                            U.length === 0
                              ? n.jsx("p", {
                                  className:
                                    "p-6 text-gray-600 dark:text-gray-400",
                                  children: "No issues found!",
                                })
                              : U.map((P, Y) =>
                                  n.jsxs(
                                    "div",
                                    {
                                      className: "p-6 flex items-start gap-4",
                                      children: [
                                        n.jsxs("div", {
                                          className: `p-2 rounded-lg shrink-0 ${P.severity === "high" ? "bg-red-100 dark:bg-red-900/20" : P.severity === "medium" ? "bg-amber-100 dark:bg-amber-900/20" : "bg-blue-100 dark:bg-blue-900/20"}`,
                                          children: [
                                            P.severity === "high" &&
                                              n.jsx(rn, {
                                                className:
                                                  "w-5 h-5 text-red-600 dark:text-red-400",
                                              }),
                                            P.severity === "medium" &&
                                              n.jsx(rn, {
                                                className:
                                                  "w-5 h-5 text-amber-600 dark:text-amber-400",
                                              }),
                                            P.severity === "low" &&
                                              n.jsx(rn, {
                                                className:
                                                  "w-5 h-5 text-blue-600 dark:text-blue-400",
                                              }),
                                          ],
                                        }),
                                        n.jsx("div", {
                                          className: "flex-1",
                                          children: n.jsx("div", {
                                            className:
                                              "flex items-center gap-2 mb-1",
                                            children: n.jsxs("h4", {
                                              className:
                                                "font-semibold text-gray-900 dark:text-white",
                                              children: [
                                                P.severity === "high" && "🔴 ",
                                                P.severity === "medium" &&
                                                  "🟡 ",
                                                P.severity === "low" && "🔵 ",
                                                P.text,
                                              ],
                                            }),
                                          }),
                                        }),
                                      ],
                                    },
                                    Y,
                                  ),
                                )
                          );
                        })(),
                      }),
                    }),
                  ],
                }),
                n.jsxs(Ee, {
                  children: [
                    n.jsx(ot, {
                      children: n.jsx("h3", {
                        className: "text-xl font-bold text-gray-900",
                        children: "Recommendations",
                      }),
                    }),
                    n.jsx(Pe, {
                      children: n.jsx("div", {
                        className: "space-y-3",
                        children: (S?.recommendations || []).map((F, U) =>
                          n.jsxs(
                            "div",
                            {
                              className: "flex items-start gap-3",
                              children: [
                                n.jsx(Yn, {
                                  className:
                                    "w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5",
                                }),
                                n.jsx("p", {
                                  className: "text-gray-700 dark:text-gray-300",
                                  children: F,
                                }),
                              ],
                            },
                            U,
                          ),
                        ),
                      }),
                    }),
                  ],
                }),
                n.jsx(Ee, {
                  className: "border-2",
                  style: { backgroundColor: "#f4f0e5", borderColor: "#f724de" },
                  children: n.jsxs(Pe, {
                    className: "py-12 text-center",
                    children: [
                      n.jsx("div", {
                        className:
                          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                        style: { backgroundColor: "#f724de" },
                        children: n.jsx(el, {
                          className: "w-8 h-8 text-white",
                        }),
                      }),
                      n.jsx("h3", {
                        className:
                          "text-2xl font-bold text-gray-900 dark:text-white mb-2",
                        children: "Want us to fix these issues?",
                      }),
                      n.jsx("p", {
                        className:
                          "text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto",
                        children:
                          "Let SalesAPE.ai create an optimized website for you with perfect SEO, accessibility, and performance - all automatically handled.",
                      }),
                      n.jsx(ae, {
                        variant: "primary",
                        size: "lg",
                        onClick: () => r("/create-website"),
                        children: "Create Optimized Website",
                      }),
                    ],
                  }),
                }),
              ],
            }),
        ],
      }),
    ],
  });
}
const Rw = "http://localhost:3001".replace(/\/+$/g, "");
function Pw() {
  const r = zt(),
    [a, l] = b.useState(""),
    [i, c] = b.useState(""),
    [d, f] = b.useState(""),
    [m, g] = b.useState(!1),
    [x, v] = b.useState(null),
    [p, k] = b.useState(""),
    [R, S] = b.useState(!1);
  b.useEffect(() => {
    localStorage.getItem("visited-public-audit") ||
      (S(!0), localStorage.setItem("visited-public-audit", "true"));
  }, []);
  const L = async (E) => {
      if ((E.preventDefault(), !a.trim())) {
        k("Please enter your name");
        return;
      }
      if (!i.trim()) {
        k("Please enter your email address");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i)) {
        k("Please enter a valid email address");
        return;
      }
      if (!d.trim()) {
        k("Please enter a website URL");
        return;
      }
      (g(!0), k(""));
      try {
        const D = d.trim().match(/^https?:\/\//)
            ? d.trim()
            : `https://${d.trim()}`,
          H = await fetch(`${Rw}/seo-audit-public`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ website: D, email: i.trim() }),
          });
        if (!H.ok) {
          if (H.status === 429)
            k(
              "You can run one free audit per week. Please try again next week.",
            );
          else
            try {
              const F = await H.json();
              k(F.error || "Failed to run audit");
            } catch {
              k(`Error: ${H.statusText}`);
            }
          g(!1);
          return;
        }
        const G = await H.json();
        v(G);
      } catch (D) {
        (console.error("Audit error:", D),
          k("Failed to run audit. Please try again."));
      } finally {
        g(!1);
      }
    },
    j = (E) =>
      E >= 80 ? "text-green-600" : E >= 60 ? "text-yellow-600" : "text-red-600";
  return n.jsxs("div", {
    className:
      "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900",
    children: [
      n.jsx("header", {
        className:
          "border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50",
        children: n.jsxs("div", {
          className:
            "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center",
          children: [
            n.jsx(Mr, {}),
            n.jsxs("div", {
              className: "flex items-center gap-4",
              children: [
                n.jsx(bs, {}),
                n.jsx(ae, {
                  onClick: () => r("/"),
                  variant: "outline",
                  size: "sm",
                  children: "Sign In",
                }),
              ],
            }),
          ],
        }),
      }),
      n.jsx("main", {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
        children: x
          ? n.jsxs(n.Fragment, {
              children: [
                n.jsx("div", {
                  className: "mb-8",
                  children: n.jsx(ae, {
                    onClick: () => {
                      (v(null), f(""), c(""), k(""));
                    },
                    variant: "outline",
                    size: "sm",
                    children: "← Run Another Audit",
                  }),
                }),
                n.jsxs("section", {
                  className: "max-w-4xl mx-auto",
                  children: [
                    n.jsxs("div", {
                      className: "mb-8",
                      children: [
                        n.jsxs("h2", {
                          className:
                            "text-3xl font-bold text-slate-900 dark:text-white mb-2",
                          children: [
                            "Audit Results for ",
                            n.jsx("code", {
                              className: "text-blue-600 break-all",
                              children: x.url,
                            }),
                          ],
                        }),
                        n.jsxs("p", {
                          className: "text-slate-600 dark:text-slate-400",
                          children: [
                            "Analysis completed on ",
                            new Date(x.createdAt).toLocaleDateString(),
                          ],
                        }),
                      ],
                    }),
                    n.jsx(Ee, {
                      className:
                        "border-2 border-blue-200 dark:border-blue-900 mb-8 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-900",
                      children: n.jsx(Pe, {
                        className: "pt-6 sm:pt-8",
                        children: n.jsxs("div", {
                          className:
                            "flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8",
                          children: [
                            n.jsxs("div", {
                              className: "text-center flex-shrink-0",
                              children: [
                                n.jsx("p", {
                                  className:
                                    "text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 sm:mb-3",
                                  children: "Overall Score",
                                }),
                                n.jsx("div", {
                                  className: "flex justify-center mb-2 px-2",
                                  children: n.jsx(qn, {
                                    value: x.overallScore,
                                    size: 120,
                                  }),
                                }),
                              ],
                            }),
                            n.jsxs("div", {
                              className:
                                "flex-1 space-y-4 w-full md:w-auto px-2 sm:px-0",
                              children: [
                                n.jsxs("p", {
                                  className:
                                    "text-base sm:text-lg font-semibold text-slate-900 dark:text-white",
                                  children: [
                                    "Your website is performing",
                                    n.jsx("span", {
                                      className: `ml-2 ${j(x.overallScore)} font-bold`,
                                      children:
                                        x.overallScore >= 80
                                          ? "Excellent"
                                          : x.overallScore >= 60
                                            ? "Good"
                                            : "Needs Improvement",
                                    }),
                                  ],
                                }),
                                n.jsx("p", {
                                  className:
                                    "text-sm sm:text-base text-slate-600 dark:text-slate-400",
                                  children:
                                    x.overallScore >= 80
                                      ? "Your website is well-optimized! Keep maintaining these high standards."
                                      : x.overallScore >= 60
                                        ? "Your website is performing well, but there's room for improvement."
                                        : "Your website needs some attention. Focus on the recommendations below.",
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                    }),
                    n.jsxs("div", {
                      className:
                        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8",
                      children: [
                        n.jsx(Ee, {
                          children: n.jsx(Pe, {
                            className: "pt-4 sm:pt-6",
                            children: n.jsxs("div", {
                              className: "text-center",
                              children: [
                                n.jsx("p", {
                                  className:
                                    "text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 sm:mb-3",
                                  children: "SEO Score",
                                }),
                                n.jsx("div", {
                                  className: "flex justify-center px-2",
                                  children: n.jsx(qn, {
                                    value: x.seoScore,
                                    size: 100,
                                  }),
                                }),
                                n.jsxs("p", {
                                  className: `mt-2 text-xs sm:text-sm font-semibold ${j(x.seoScore)}`,
                                  children: [x.seoScore, "/100"],
                                }),
                              ],
                            }),
                          }),
                        }),
                        n.jsx(Ee, {
                          children: n.jsx(Pe, {
                            className: "pt-4 sm:pt-6",
                            children: n.jsxs("div", {
                              className: "text-center",
                              children: [
                                n.jsx("p", {
                                  className:
                                    "text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 sm:mb-3",
                                  children: "Performance",
                                }),
                                n.jsx("div", {
                                  className: "flex justify-center px-2",
                                  children: n.jsx(qn, {
                                    value: x.performanceScore,
                                    size: 100,
                                  }),
                                }),
                                n.jsxs("p", {
                                  className: `mt-2 text-xs sm:text-sm font-semibold ${j(x.performanceScore)}`,
                                  children: [x.performanceScore, "/100"],
                                }),
                              ],
                            }),
                          }),
                        }),
                        n.jsx(Ee, {
                          className: "sm:col-span-2 lg:col-span-1",
                          children: n.jsx(Pe, {
                            className: "pt-4 sm:pt-6",
                            children: n.jsxs("div", {
                              className: "text-center",
                              children: [
                                n.jsx("p", {
                                  className:
                                    "text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 sm:mb-3",
                                  children: "Mobile Score",
                                }),
                                n.jsx("div", {
                                  className: "flex justify-center px-2",
                                  children: n.jsx(qn, {
                                    value: x.mobileScore,
                                    size: 100,
                                  }),
                                }),
                                n.jsxs("p", {
                                  className: `mt-2 text-xs sm:text-sm font-semibold ${j(x.mobileScore)}`,
                                  children: [x.mobileScore, "/100"],
                                }),
                              ],
                            }),
                          }),
                        }),
                      ],
                    }),
                    x.issues &&
                      x.issues.length > 0 &&
                      n.jsxs(Ee, {
                        className: "mb-8 border-red-200 dark:border-red-900",
                        children: [
                          n.jsx(ot, {
                            children: n.jsxs("h3", {
                              className:
                                "text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2",
                              children: [
                                n.jsx(rn, { className: "w-5 h-5" }),
                                "Issues Found (",
                                x.issues.length,
                                ")",
                              ],
                            }),
                          }),
                          n.jsx(Pe, {
                            children: n.jsx("ul", {
                              className: "space-y-2",
                              children: x.issues.map((E, D) =>
                                n.jsxs(
                                  "li",
                                  {
                                    className: "flex gap-3",
                                    children: [
                                      n.jsx(rn, {
                                        className:
                                          "w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-1",
                                      }),
                                      n.jsx("span", {
                                        className:
                                          "text-sm text-slate-700 dark:text-slate-300",
                                        children: E,
                                      }),
                                    ],
                                  },
                                  D,
                                ),
                              ),
                            }),
                          }),
                        ],
                      }),
                    x.recommendations &&
                      x.recommendations.length > 0 &&
                      n.jsxs(Ee, {
                        className:
                          "mb-8 border-green-200 dark:border-green-900",
                        children: [
                          n.jsx(ot, {
                            children: n.jsxs("h3", {
                              className:
                                "text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2",
                              children: [
                                n.jsx(Yn, { className: "w-5 h-5" }),
                                "Recommendations (",
                                x.recommendations.length,
                                ")",
                              ],
                            }),
                          }),
                          n.jsx(Pe, {
                            children: n.jsx("ul", {
                              className: "space-y-3",
                              children: x.recommendations.map((E, D) =>
                                n.jsxs(
                                  "li",
                                  {
                                    className: "flex gap-3",
                                    children: [
                                      n.jsx(Yn, {
                                        className:
                                          "w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-1",
                                      }),
                                      n.jsx("span", {
                                        className:
                                          "text-sm text-slate-700 dark:text-slate-300",
                                        children: E,
                                      }),
                                    ],
                                  },
                                  D,
                                ),
                              ),
                            }),
                          }),
                        ],
                      }),
                    n.jsx(Ee, {
                      className:
                        "bg-gradient-to-r from-blue-600 to-purple-600 border-0",
                      children: n.jsxs(Pe, {
                        className: "pt-8 text-center",
                        children: [
                          n.jsx("h3", {
                            className: "text-2xl font-bold text-white mb-2",
                            children: "Create My Better Website",
                          }),
                          n.jsx("p", {
                            className: "text-blue-100 mb-6 max-w-2xl mx-auto",
                            children:
                              "Sign up for SalesAPE to implement these recommendations automatically and generate a high-converting website powered by AI.",
                          }),
                          n.jsx(ae, {
                            onClick: () => r("/"),
                            className:
                              "bg-white text-blue-600 hover:bg-slate-50 font-semibold",
                            children: n.jsxs("div", {
                              className: "flex items-center gap-2",
                              children: [
                                "Get Started Free",
                                n.jsx(Pm, { className: "w-4 h-4" }),
                              ],
                            }),
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            })
          : n.jsxs(n.Fragment, {
              children: [
                n.jsxs("section", {
                  className: "mb-8 sm:mb-16 text-center px-4 sm:px-0",
                  children: [
                    n.jsx("h1", {
                      className: `text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 leading-tight ${R ? "animate-bounce" : ""}`,
                      children: "Free SEO Audit",
                    }),
                    n.jsx("p", {
                      className:
                        "text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed",
                      children:
                        "Get instant insights into your website's SEO, performance, and mobile readiness. No credit card needed.",
                    }),
                    n.jsx("p", {
                      className:
                        "text-xs sm:text-sm text-slate-500 dark:text-slate-500",
                      children: "Free audit per week",
                    }),
                  ],
                }),
                n.jsx("div", {
                  className: `max-w-2xl mx-auto mb-8 sm:mb-16 px-4 sm:px-0 ${R ? "animate-bounce" : ""}`,
                  style: R ? { animationDelay: "0.1s" } : {},
                  children: n.jsxs(Ee, {
                    className:
                      "border-2 border-slate-200 dark:border-slate-800",
                    children: [
                      n.jsx(ot, {
                        children: n.jsxs("h2", {
                          className:
                            "text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2",
                          children: [
                            n.jsx(Ya, { className: "w-6 h-6 text-blue-600" }),
                            "Analyze Your Website",
                          ],
                        }),
                      }),
                      n.jsx(Pe, {
                        children: n.jsxs("form", {
                          onSubmit: L,
                          className: "space-y-6",
                          children: [
                            n.jsxs("div", {
                              children: [
                                n.jsx("label", {
                                  className:
                                    "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2",
                                  children: "Your Name",
                                }),
                                n.jsx(St, {
                                  type: "text",
                                  placeholder: "John Smith",
                                  value: a,
                                  onChange: (E) => l(E.target.value),
                                  disabled: m,
                                }),
                              ],
                            }),
                            n.jsxs("div", {
                              children: [
                                n.jsx("label", {
                                  className:
                                    "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2",
                                  children: "Your Email",
                                }),
                                n.jsx(St, {
                                  type: "email",
                                  placeholder: "you@example.com",
                                  value: i,
                                  onChange: (E) => c(E.target.value),
                                  disabled: m,
                                }),
                              ],
                            }),
                            n.jsxs("div", {
                              children: [
                                n.jsx("label", {
                                  className:
                                    "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2",
                                  children: "Website URL",
                                }),
                                n.jsx(St, {
                                  type: "text",
                                  placeholder:
                                    "example.com or https://example.com",
                                  value: d,
                                  onChange: (E) => f(E.target.value),
                                  disabled: m,
                                }),
                              ],
                            }),
                            p &&
                              n.jsxs("div", {
                                className:
                                  "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3",
                                children: [
                                  n.jsx(rn, {
                                    className:
                                      "w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5",
                                  }),
                                  n.jsx("p", {
                                    className:
                                      "text-sm text-red-700 dark:text-red-300",
                                    children: p,
                                  }),
                                ],
                              }),
                            n.jsx(ae, {
                              type: "submit",
                              disabled: m,
                              className: "w-full",
                              children: m
                                ? n.jsxs("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                      n.jsx("div", {
                                        className:
                                          "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin",
                                      }),
                                      "Running Audit...",
                                    ],
                                  })
                                : n.jsxs("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                      n.jsx(el, { className: "w-4 h-4" }),
                                      "Run Free Audit",
                                    ],
                                  }),
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                }),
                n.jsxs("section", {
                  className:
                    "grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto px-4 sm:px-0",
                  children: [
                    n.jsx(Ee, {
                      className: `text-center h-full ${R ? "animate-bounce" : ""}`,
                      style: R ? { animationDelay: "0.2s" } : {},
                      children: n.jsxs(Pe, {
                        className: "pt-4 sm:pt-6 flex flex-col h-full",
                        children: [
                          n.jsx(ou, {
                            className:
                              "w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 text-blue-600 flex-shrink-0",
                          }),
                          n.jsx("h3", {
                            className:
                              "font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base",
                            children: "Performance Analysis",
                          }),
                          n.jsx("p", {
                            className:
                              "text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex-grow",
                            children:
                              "Get detailed insights into your website's loading speed and performance metrics.",
                          }),
                        ],
                      }),
                    }),
                    n.jsx(Ee, {
                      className: `text-center h-full ${R ? "animate-bounce" : ""}`,
                      style: R ? { animationDelay: "0.3s" } : {},
                      children: n.jsxs(Pe, {
                        className: "pt-4 sm:pt-6 flex flex-col h-full",
                        children: [
                          n.jsx(iu, {
                            className:
                              "w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 text-green-600 flex-shrink-0",
                          }),
                          n.jsx("h3", {
                            className:
                              "font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base",
                            children: "SEO Optimization",
                          }),
                          n.jsx("p", {
                            className:
                              "text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex-grow",
                            children:
                              "Discover SEO opportunities and recommendations to improve your search rankings.",
                          }),
                        ],
                      }),
                    }),
                    n.jsx(Ee, {
                      className: `text-center h-full ${R ? "animate-bounce" : ""}`,
                      style: R ? { animationDelay: "0.4s" } : {},
                      children: n.jsxs(Pe, {
                        className: "pt-4 sm:pt-6 flex flex-col h-full",
                        children: [
                          n.jsx(Lm, {
                            className:
                              "w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 text-purple-600 flex-shrink-0",
                          }),
                          n.jsx("h3", {
                            className:
                              "font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base",
                            children: "Mobile Readiness",
                          }),
                          n.jsx("p", {
                            className:
                              "text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex-grow",
                            children:
                              "Ensure your site is optimized for mobile devices and provides great UX.",
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
      }),
      n.jsx("footer", {
        className: "border-t border-slate-200 dark:border-slate-800 mt-16 py-8",
        children: n.jsx("div", {
          className:
            "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-600 dark:text-slate-400",
          children: n.jsx("p", {
            children: "© 2026 SalesAPE. All rights reserved.",
          }),
        }),
      }),
    ],
  });
}
function Tw() {
  const r = zt(),
    { id: a } = tu(),
    [l, i] = b.useState("desktop"),
    [c, d] = b.useState(!1),
    [f, m] = b.useState(null),
    [g, x] = b.useState(null),
    [v, p] = b.useState(!1),
    [k, R] = b.useState([]),
    [S, L] = b.useState(!1),
    [j, E] = b.useState({ phone: "", address: "" }),
    [D, H] = b.useState(!1),
    [G, F] = b.useState([]),
    [U, P] = b.useState([]),
    [Y, oe] = b.useState(null),
    [ce, Le] = b.useState([]),
    [de, Re] = b.useState(!1),
    [ve, me] = b.useState({
      clientName: "",
      clientTitle: "",
      content: "",
      rating: 5,
      imageUrl: "",
    }),
    [Q, ue] = b.useState(!1),
    V = "http://localhost:3001".replace(/\/+$/g, ""),
    ne = (w) => ce.some((_) => _.toLowerCase().includes(w.toLowerCase())),
    ee = (w) => {
      const _ = {
        bgColor: "#ffffff",
        textColor: "#000000",
        accent: "#0066cc",
        secondary: "#f0f0f0",
        tertiary: "#333333",
        font: "system-ui, -apple-system, sans-serif",
        headingFont: "system-ui, -apple-system, sans-serif",
      };
      return w?.style ? { ..._, ...w.style } : _;
    };
  return (
    b.useEffect(() => {
      async function w() {
        if (a)
          try {
            const _ = localStorage.getItem("supabase.auth.token");
            (console.log("🔍 Fetching business & templates..."),
              console.log("Token present:", !!_),
              console.log("Business ID:", a));
            const [W, Z] = await Promise.all([
              fetch(`${V}/businesses/${a}`, {
                headers: { Authorization: `Bearer ${_}` },
              }),
              fetch(`${V}/businesses/${a}/template`, {
                headers: { Authorization: `Bearer ${_}` },
              }),
            ]);
            if (
              (console.log(
                "📊 Response statuses - Business:",
                W.status,
                "Templates:",
                Z.status,
              ),
              W.ok)
            ) {
              const q = await W.json();
              (console.log("✅ Business data received:", q?.name),
                m(q),
                E({ phone: q.phone || "", address: q.address || "" }));
            } else
              console.error(
                "❌ Business fetch failed:",
                W.status,
                W.statusText,
              );
            if (Z.ok) {
              const q = await Z.json();
              (console.log("✅ Template response received"),
                console.log("Full response:", q),
                console.log("Templates array length:", q.templates?.length),
                console.log(
                  "Template IDs:",
                  q.templates?.map((ie) => ie.id),
                ),
                console.log(
                  "Testimonials received:",
                  q.testimonials?.length || 0,
                ),
                console.log("Branding data:", q.branding),
                console.log("🎯 Desired features:", q.desiredFeatures),
                x(q.recommended || q.templates?.[0] || null),
                F(q.templates || []),
                P(q.testimonials || []),
                oe(q.branding || null),
                Le(q.desiredFeatures || []));
            } else {
              console.error(
                "❌ Template fetch failed:",
                Z.status,
                Z.statusText,
              );
              const q = await Z.text();
              console.error("Error response:", q);
            }
          } catch (_) {
            console.error("❌ Fetch error:", _);
          }
      }
      w();
    }, [a]),
    n.jsxs("div", {
      className: "min-h-screen bg-gray-50 dark:bg-gray-900",
      children: [
        n.jsx("header", {
          className:
            "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
          children: n.jsx("div", {
            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4",
            children: n.jsxs("div", {
              className: "flex items-center justify-between",
              children: [
                n.jsxs("div", {
                  className: "flex items-center gap-6",
                  children: [
                    n.jsx(Mr, { size: "sm", className: "md:hidden" }),
                    n.jsx(Mr, { size: "md", className: "hidden md:block" }),
                    n.jsxs("div", {
                      className:
                        "hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400",
                      children: [
                        n.jsx(fr, { variant: "success", children: "Live" }),
                        n.jsx("span", { children: "•" }),
                        n.jsx("span", {
                          children:
                            f?.publishedUrl || "your-website.salesape.ai/web",
                        }),
                      ],
                    }),
                  ],
                }),
                n.jsxs("div", {
                  className: "flex items-center gap-3",
                  children: [
                    n.jsx(bs, {}),
                    n.jsxs(ae, {
                      variant: "outline",
                      size: "sm",
                      className: "hidden sm:flex",
                      onClick: () => {
                        const w = f?.publishedUrl;
                        w
                          ? window.open(w, "_blank")
                          : alert(
                              'This site is not yet published. Click the "Publish Site" button in the sidebar to make it live on the web.',
                            );
                      },
                      children: [
                        n.jsx(Tm, { className: "w-4 h-4" }),
                        n.jsx("span", {
                          className: "hidden lg:inline",
                          children: "View Live",
                        }),
                      ],
                    }),
                    n.jsxs(ae, {
                      variant: "outline",
                      size: "sm",
                      className: "hidden sm:flex text-xs",
                      style: { borderColor: "#f724de", color: "#f724de" },
                      onClick: () => {
                        if (!a) return alert("Business ID not found");
                        const w = `http://localhost:3001/public/business?id=${a}`;
                        window.open(w, "_blank");
                      },
                      title: "Development preview - will be removed later",
                      children: [
                        n.jsx(ou, { className: "w-4 h-4" }),
                        n.jsx("span", {
                          className: "hidden lg:inline text-xs",
                          children: "(DEV) Preview",
                        }),
                      ],
                    }),
                    n.jsxs(ae, {
                      variant: "ghost",
                      size: "sm",
                      onClick: () => r("/dashboard"),
                      children: [
                        n.jsx(Js, { className: "w-4 h-4" }),
                        n.jsx("span", {
                          className: "hidden sm:inline",
                          children: "Dashboard",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          }),
        }),
        n.jsxs("div", {
          className: "flex",
          children: [
            n.jsx("aside", {
              className:
                "w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-73px)] overflow-y-auto",
              children: n.jsxs("div", {
                className: "p-6",
                children: [
                  n.jsx("h2", {
                    className:
                      "text-lg font-bold text-gray-900 dark:text-white mb-6",
                    children: "Preview Settings",
                  }),
                  n.jsxs("div", {
                    className: "mb-6",
                    children: [
                      n.jsx("label", {
                        className:
                          "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block",
                        children: "Preview Mode",
                      }),
                      n.jsxs("div", {
                        className: "flex gap-2",
                        children: [
                          n.jsxs(ae, {
                            variant: l === "desktop" ? "primary" : "outline",
                            size: "sm",
                            onClick: () => i("desktop"),
                            className: "flex-1",
                            children: [
                              n.jsx(_m, { className: "w-4 h-4" }),
                              "Desktop",
                            ],
                          }),
                          n.jsxs(ae, {
                            variant: l === "mobile" ? "primary" : "outline",
                            size: "sm",
                            onClick: () => i("mobile"),
                            className: "flex-1",
                            children: [
                              n.jsx(D1, { className: "w-4 h-4" }),
                              "Mobile",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  n.jsx("div", {
                    className: "mb-6",
                    children: n.jsxs(ae, {
                      variant: c ? "primary" : "outline",
                      onClick: () => d(!c),
                      className: "w-full",
                      children: [
                        n.jsx(ho, { className: "w-4 h-4" }),
                        c ? "Editing Mode" : "Enable Editing",
                      ],
                    }),
                  }),
                  G.length > 0 &&
                    n.jsx(Ee, {
                      className: "mb-6 border-2",
                      style: { borderColor: "#f724de" },
                      children: n.jsxs(Pe, {
                        className: "p-4",
                        children: [
                          n.jsxs("div", {
                            className:
                              "mb-4 pb-4 border-b border-gray-200 dark:border-gray-700",
                            children: [
                              n.jsx("h3", {
                                className:
                                  "font-bold text-lg text-gray-900 dark:text-white",
                                style: { color: "#f724de" },
                                children: "✨ Design Studio",
                              }),
                              n.jsxs("div", {
                                className:
                                  "text-xs text-gray-500 dark:text-gray-400 mt-1",
                                children: [
                                  G.length,
                                  " premium template",
                                  G.length !== 1 ? "s" : "",
                                ],
                              }),
                            ],
                          }),
                          n.jsx("div", {
                            className: "space-y-2 max-h-96 overflow-y-auto",
                            children: G.map((w, _) =>
                              n.jsx(
                                "button",
                                {
                                  onClick: () => x(w),
                                  className: `w-full px-4 py-3 text-left rounded-lg border-2 transition-all transform hover:scale-105 ${g?.id === w.id ? "border-2" : "border-gray-300 dark:border-gray-600 hover:border-gray-400"}`,
                                  style: {
                                    backgroundColor:
                                      g?.id === w.id
                                        ? "#f724de20"
                                        : "transparent",
                                    borderColor:
                                      g?.id === w.id ? "#f724de" : "inherit",
                                  },
                                  children: n.jsxs("div", {
                                    className:
                                      "flex items-start justify-between",
                                    children: [
                                      n.jsxs("div", {
                                        className: "flex-1",
                                        children: [
                                          n.jsxs("div", {
                                            className:
                                              "font-bold text-gray-900 dark:text-white text-sm",
                                            style: {
                                              color:
                                                g?.id === w.id
                                                  ? "#f724de"
                                                  : "inherit",
                                            },
                                            children: [_ + 1, ". ", w.name],
                                          }),
                                          n.jsx("div", {
                                            className:
                                              "text-gray-600 dark:text-gray-400 text-xs mt-1",
                                            children: w.description,
                                          }),
                                        ],
                                      }),
                                      g?.id === w.id &&
                                        n.jsx("div", {
                                          className: "ml-2 text-lg",
                                          children: "✓",
                                        }),
                                    ],
                                  }),
                                },
                                w.id,
                              ),
                            ),
                          }),
                        ],
                      }),
                    }),
                  c &&
                    n.jsx(Ee, {
                      className: "mb-6",
                      children: n.jsxs(Pe, {
                        className: "p-4",
                        children: [
                          n.jsx("h3", {
                            className:
                              "font-semibold text-gray-900 dark:text-white mb-3",
                            children: "Contact Info",
                          }),
                          n.jsxs("div", {
                            className: "space-y-2",
                            children: [
                              n.jsx("input", {
                                type: "tel",
                                placeholder: "Phone",
                                value: j.phone,
                                onChange: (w) =>
                                  E({ ...j, phone: w.target.value }),
                                className:
                                  "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500",
                              }),
                              n.jsx("input", {
                                type: "text",
                                placeholder: "Address",
                                value: j.address,
                                onChange: (w) =>
                                  E({ ...j, address: w.target.value }),
                                className:
                                  "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500",
                              }),
                              n.jsx(ae, {
                                size: "sm",
                                className: "w-full",
                                onClick: async () => {
                                  if (a)
                                    try {
                                      const w = localStorage.getItem(
                                          "supabase.auth.token",
                                        ),
                                        _ = await fetch(
                                          `${V}/businesses/${a}`,
                                          {
                                            method: "PATCH",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                              Authorization: `Bearer ${w}`,
                                            },
                                            body: JSON.stringify(j),
                                          },
                                        );
                                      if (!_.ok)
                                        throw new Error("Failed to update");
                                      const W = await _.json();
                                      (m(W), alert("Contact info updated!"));
                                    } catch (w) {
                                      (console.error(w),
                                        alert("Failed to save"));
                                    }
                                },
                                children: "Save Changes",
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  n.jsx(Ee, {
                    className: "mb-6",
                    children: n.jsxs(Pe, {
                      className: "p-4",
                      children: [
                        n.jsxs("div", {
                          className: "flex items-center justify-between mb-3",
                          children: [
                            n.jsx("h3", {
                              className:
                                "font-semibold text-gray-900 dark:text-white",
                              children: "Testimonials",
                            }),
                            n.jsx("span", {
                              className:
                                "text-xs bg-violet-100 dark:bg-violet-900 text-violet-900 dark:text-violet-100 px-2 py-1 rounded",
                              children: U.length,
                            }),
                          ],
                        }),
                        U.length > 0 &&
                          n.jsx("div", {
                            className:
                              "space-y-2 mb-4 max-h-48 overflow-y-auto",
                            children: U.map((w) =>
                              n.jsxs(
                                "div",
                                {
                                  className:
                                    "p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm",
                                  children: [
                                    n.jsx("div", {
                                      className:
                                        "font-semibold text-gray-900 dark:text-white text-xs",
                                      children: w.clientName,
                                    }),
                                    n.jsxs("div", {
                                      className:
                                        "text-gray-600 dark:text-gray-400 text-xs line-clamp-2 mt-1",
                                      children: ['"', w.content, '"'],
                                    }),
                                    n.jsxs("div", {
                                      className:
                                        "flex items-center justify-between mt-2",
                                      children: [
                                        n.jsxs("span", {
                                          className: "text-xs text-gray-500",
                                          children: ["⭐ ", w.rating, "/5"],
                                        }),
                                        n.jsx(ae, {
                                          variant: "ghost",
                                          size: "sm",
                                          className: "h-6 px-2 text-xs",
                                          onClick: async () => {
                                            if (
                                              a &&
                                              confirm(
                                                "Delete this testimonial?",
                                              )
                                            )
                                              try {
                                                const _ = localStorage.getItem(
                                                  "supabase.auth.token",
                                                );
                                                if (
                                                  !(
                                                    await fetch(
                                                      `${V}/businesses/${a}/testimonials/${w.id}`,
                                                      {
                                                        method: "DELETE",
                                                        headers: {
                                                          Authorization: `Bearer ${_}`,
                                                        },
                                                      },
                                                    )
                                                  ).ok
                                                )
                                                  throw new Error(
                                                    "Failed to delete",
                                                  );
                                                P(
                                                  U.filter(
                                                    (Z) => Z.id !== w.id,
                                                  ),
                                                );
                                              } catch (_) {
                                                (console.error(_),
                                                  alert(
                                                    "Failed to delete testimonial",
                                                  ));
                                              }
                                          },
                                          children: "Delete",
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                w.id,
                              ),
                            ),
                          }),
                        n.jsx(ae, {
                          variant: "outline",
                          size: "sm",
                          className: "w-full",
                          onClick: () => Re(!de),
                          children: de ? "✕ Cancel" : "+ Add Testimonial",
                        }),
                        de &&
                          n.jsxs("div", {
                            className:
                              "mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded space-y-2",
                            children: [
                              n.jsx("input", {
                                type: "text",
                                placeholder: "Client Name",
                                value: ve.clientName,
                                onChange: (w) =>
                                  me({ ...ve, clientName: w.target.value }),
                                className:
                                  "w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500",
                              }),
                              n.jsx("input", {
                                type: "text",
                                placeholder: "Client Title (e.g., CEO)",
                                value: ve.clientTitle,
                                onChange: (w) =>
                                  me({ ...ve, clientTitle: w.target.value }),
                                className:
                                  "w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500",
                              }),
                              n.jsx("textarea", {
                                placeholder: "Testimonial text",
                                value: ve.content,
                                onChange: (w) =>
                                  me({ ...ve, content: w.target.value }),
                                className:
                                  "w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none",
                                rows: 2,
                              }),
                              n.jsxs("select", {
                                value: ve.rating,
                                onChange: (w) =>
                                  me({
                                    ...ve,
                                    rating: parseInt(w.target.value),
                                  }),
                                className:
                                  "w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500",
                                children: [
                                  n.jsx("option", {
                                    value: "5",
                                    children: "⭐ 5 Stars",
                                  }),
                                  n.jsx("option", {
                                    value: "4",
                                    children: "⭐ 4 Stars",
                                  }),
                                  n.jsx("option", {
                                    value: "3",
                                    children: "⭐ 3 Stars",
                                  }),
                                  n.jsx("option", {
                                    value: "2",
                                    children: "⭐ 2 Stars",
                                  }),
                                  n.jsx("option", {
                                    value: "1",
                                    children: "⭐ 1 Star",
                                  }),
                                ],
                              }),
                              n.jsx("input", {
                                type: "url",
                                placeholder: "Image URL (optional)",
                                value: ve.imageUrl,
                                onChange: (w) =>
                                  me({ ...ve, imageUrl: w.target.value }),
                                className:
                                  "w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-500",
                              }),
                              n.jsx(ae, {
                                size: "sm",
                                className: "w-full",
                                disabled: Q || !ve.clientName || !ve.content,
                                onClick: async () => {
                                  if (a) {
                                    ue(!0);
                                    try {
                                      const w = localStorage.getItem(
                                          "supabase.auth.token",
                                        ),
                                        _ = await fetch(
                                          `${V}/businesses/${a}/testimonials`,
                                          {
                                            method: "POST",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                              Authorization: `Bearer ${w}`,
                                            },
                                            body: JSON.stringify(ve),
                                          },
                                        );
                                      if (!_.ok)
                                        throw new Error("Failed to create");
                                      const W = await _.json();
                                      (P([...U, W]),
                                        me({
                                          clientName: "",
                                          clientTitle: "",
                                          content: "",
                                          rating: 5,
                                          imageUrl: "",
                                        }),
                                        Re(!1));
                                    } catch (w) {
                                      (console.error(w),
                                        alert("Failed to add testimonial"));
                                    } finally {
                                      ue(!1);
                                    }
                                  }
                                },
                                children: Q ? "Adding..." : "Add",
                              }),
                            ],
                          }),
                      ],
                    }),
                  }),
                  n.jsx(Ee, {
                    className: "mb-6",
                    children: n.jsxs(Pe, {
                      className: "p-4",
                      children: [
                        n.jsx("h3", {
                          className:
                            "font-semibold text-gray-900 dark:text-white mb-3",
                          children: "Performance",
                        }),
                        n.jsxs("div", {
                          className: "space-y-3",
                          children: [
                            n.jsxs("div", {
                              className: "flex justify-between items-center",
                              children: [
                                n.jsx("span", {
                                  className:
                                    "text-sm text-gray-600 dark:text-gray-400",
                                  children: "Total Views",
                                }),
                                n.jsx("span", {
                                  className:
                                    "font-semibold text-gray-900 dark:text-white",
                                  children: f?.views || 0,
                                }),
                              ],
                            }),
                            n.jsxs("div", {
                              className: "flex justify-between items-center",
                              children: [
                                n.jsx("span", {
                                  className:
                                    "text-sm text-gray-600 dark:text-gray-400",
                                  children: "Leads Captured",
                                }),
                                n.jsx("span", {
                                  className: "font-semibold text-green-600",
                                  children: f?.leads?.length || 0,
                                }),
                              ],
                            }),
                            n.jsxs("div", {
                              className: "flex justify-between items-center",
                              children: [
                                n.jsx("span", {
                                  className:
                                    "text-sm text-gray-600 dark:text-gray-400",
                                  children: "Bookings",
                                }),
                                n.jsx("span", {
                                  className: "font-semibold",
                                  style: { color: "#f724de" },
                                  children: f?.bookings?.length || 0,
                                }),
                              ],
                            }),
                            f?.leads?.length && f?.bookings?.length
                              ? n.jsxs("div", {
                                  className:
                                    "flex justify-between items-center",
                                  children: [
                                    n.jsx("span", {
                                      className:
                                        "text-sm text-gray-600 dark:text-gray-400",
                                      children: "Conversion Rate",
                                    }),
                                    n.jsxs("span", {
                                      className:
                                        "font-semibold text-gray-900 dark:text-white",
                                      children: [
                                        (
                                          (f.bookings.length / f.leads.length) *
                                          100
                                        ).toFixed(1),
                                        "%",
                                      ],
                                    }),
                                  ],
                                })
                              : null,
                          ],
                        }),
                      ],
                    }),
                  }),
                  !f?.isPublished &&
                    n.jsx(ae, {
                      variant: "primary",
                      className: "w-full mb-6",
                      disabled: D,
                      onClick: async () => {
                        if (a) {
                          H(!0);
                          try {
                            const w = localStorage.getItem(
                                "supabase.auth.token",
                              ),
                              _ = await fetch(`${V}/businesses/${a}/publish`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${w}`,
                                },
                              });
                            if (!_.ok) throw new Error("Failed to publish");
                            const W = await _.json();
                            (m(W),
                              alert(`Site published at: ${W.publishedUrl}`));
                          } catch (w) {
                            (console.error(w), alert("Failed to publish site"));
                          } finally {
                            H(!1);
                          }
                        }
                      },
                      children: D ? "Publishing..." : "Publish Site",
                    }),
                  n.jsxs("div", {
                    className: "space-y-2",
                    children: [
                      n.jsxs(ae, {
                        variant: "outline",
                        size: "sm",
                        className: "w-full justify-start",
                        onClick: () => L(!0),
                        children: [
                          n.jsx(tn, { className: "w-4 h-4" }),
                          "Calendar Settings",
                        ],
                      }),
                      n.jsxs(ae, {
                        variant: "outline",
                        size: "sm",
                        className: "w-full justify-start",
                        onClick: async () => {
                          if (a)
                            try {
                              const w = localStorage.getItem(
                                  "supabase.auth.token",
                                ),
                                _ = await fetch(`${V}/businesses/${a}/leads`, {
                                  headers: { Authorization: `Bearer ${w}` },
                                });
                              if (!_.ok)
                                throw new Error("Failed to fetch leads");
                              const W = await _.json();
                              (R(W || []), p(!0));
                            } catch (w) {
                              (console.error(w), alert("Unable to load leads"));
                            }
                        },
                        children: [
                          n.jsx(Eo, { className: "w-4 h-4" }),
                          "View Leads",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            }),
            n.jsx(Fm, { isOpen: S, onClose: () => L(!1) }),
            n.jsx("main", {
              className: "flex-1 p-8",
              children: n.jsx("div", {
                className: "max-w-6xl mx-auto",
                children: n.jsx("div", {
                  className: `bg-white rounded-lg shadow-2xl transition-all duration-300 ${l === "mobile" ? "max-w-[375px] mx-auto overflow-y-auto" : "overflow-hidden"}`,
                  style: { height: l === "mobile" ? "667px" : "auto" },
                  children: n.jsxs("div", {
                    className: "relative",
                    children: [
                      c &&
                        n.jsx("div", {
                          className:
                            "absolute inset-0 pointer-events-none z-10",
                          children: n.jsx("div", {
                            className:
                              "h-full w-full border-4 border-violet-500 border-dashed rounded-lg",
                          }),
                        }),
                      g &&
                        (() => {
                          const w = ee(g);
                          return n.jsxs(n.Fragment, {
                            children: [
                              g?.layout === "modern" &&
                                n.jsx("section", {
                                  className:
                                    "relative bg-white text-gray-900 p-8 md:p-16",
                                  children: n.jsxs("div", {
                                    className: "max-w-4xl",
                                    children: [
                                      n.jsx("h1", {
                                        className:
                                          "text-5xl md:text-6xl font-bold mb-6",
                                        style: { color: w.accent },
                                        children: f?.name,
                                      }),
                                      n.jsx("p", {
                                        className:
                                          "text-xl text-gray-600 mb-8 max-w-2xl",
                                        children:
                                          f?.description ||
                                          "Professional solutions for modern business",
                                      }),
                                      n.jsx(ae, {
                                        variant: "primary",
                                        size: "lg",
                                        children: "Get Started Today",
                                      }),
                                    ],
                                  }),
                                }),
                              g?.layout === "creative" &&
                                n.jsxs("section", {
                                  className: "relative overflow-hidden p-0",
                                  style: {
                                    backgroundColor: w.bgColor,
                                    minHeight: "500px",
                                  },
                                  children: [
                                    n.jsx("div", {
                                      className: "absolute inset-0",
                                      style: {
                                        background: `linear-gradient(135deg, ${w.bgColor} 0%, ${w.secondary} 100%)`,
                                      },
                                    }),
                                    n.jsx("div", {
                                      className:
                                        "absolute bottom-0 left-0 right-0 h-1",
                                      style: { backgroundColor: w.accent },
                                    }),
                                    n.jsxs("div", {
                                      className:
                                        "relative p-12 md:p-20 flex flex-col justify-center h-full",
                                      style: { minHeight: "500px" },
                                      children: [
                                        n.jsx("h1", {
                                          className:
                                            "text-6xl md:text-7xl font-black mb-4 leading-tight",
                                          style: { color: w.accent },
                                          children: f?.name,
                                        }),
                                        n.jsx("p", {
                                          className: "text-2xl mb-8 max-w-3xl",
                                          style: { color: w.textColor },
                                          children:
                                            f?.description ||
                                            "Create. Inspire. Transform.",
                                        }),
                                        n.jsx("div", {
                                          children: n.jsx(ae, {
                                            variant: "primary",
                                            size: "lg",
                                            style: {
                                              backgroundColor: w.accent,
                                              color: "#ffffff",
                                            },
                                            children: "Explore Our Work",
                                          }),
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              g?.layout === "minimal" &&
                                n.jsx("section", {
                                  className:
                                    "relative p-16 md:p-24 text-center",
                                  style: {
                                    backgroundColor: w.bgColor,
                                    color: w.textColor,
                                  },
                                  children: n.jsxs("div", {
                                    className: "max-w-2xl mx-auto",
                                    children: [
                                      n.jsx("p", {
                                        className:
                                          "text-sm uppercase tracking-widest mb-6",
                                        style: { color: w.accent },
                                        children: "Welcome",
                                      }),
                                      n.jsx("h1", {
                                        className:
                                          "text-5xl md:text-6xl font-light mb-6",
                                        style: {
                                          fontFamily: "Georgia, serif",
                                          fontWeight: 300,
                                        },
                                        children: f?.name,
                                      }),
                                      n.jsx("p", {
                                        className:
                                          "text-xl mb-8 leading-relaxed",
                                        style: { fontFamily: "Georgia, serif" },
                                        children:
                                          f?.description ||
                                          "Experience timeless elegance and sophistication",
                                      }),
                                      n.jsx(ae, {
                                        variant: "primary",
                                        size: "lg",
                                        children: "Begin",
                                      }),
                                    ],
                                  }),
                                }),
                              g?.layout === "bold" &&
                                n.jsxs("section", {
                                  className:
                                    "relative overflow-hidden p-8 md:p-16",
                                  style: { backgroundColor: w.bgColor },
                                  children: [
                                    n.jsx("div", {
                                      className:
                                        "absolute -top-40 -right-40 w-80 h-80 rounded-full",
                                      style: {
                                        backgroundColor: w.accent,
                                        opacity: 0.1,
                                      },
                                    }),
                                    n.jsx("div", {
                                      className:
                                        "absolute -bottom-20 -left-40 w-96 h-96 rounded-full",
                                      style: {
                                        backgroundColor: w.secondary,
                                        opacity: 0.1,
                                      },
                                    }),
                                    n.jsxs("div", {
                                      className: "relative max-w-4xl",
                                      children: [
                                        n.jsx("h1", {
                                          className:
                                            "text-6xl md:text-7xl font-black mb-6",
                                          style: { color: w.accent },
                                          children: f?.name,
                                        }),
                                        n.jsx("p", {
                                          className: "text-2xl mb-8 max-w-2xl",
                                          style: { color: w.textColor },
                                          children:
                                            f?.description ||
                                            "Bold Ideas. Real Results. Your Success.",
                                        }),
                                        n.jsxs("div", {
                                          className: "flex gap-4",
                                          children: [
                                            n.jsx(ae, {
                                              variant: "primary",
                                              size: "lg",
                                              style: {
                                                backgroundColor: w.accent,
                                              },
                                              children: "Get Started",
                                            }),
                                            n.jsx(ae, {
                                              variant: "outline",
                                              size: "lg",
                                              children: "Learn More",
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              g?.layout === "sleek" &&
                                n.jsx("section", {
                                  className: "relative p-12 md:p-20",
                                  style: {
                                    backgroundColor: w.bgColor,
                                    background: `linear-gradient(135deg, ${w.secondary} 0%, ${w.bgColor} 100%)`,
                                  },
                                  children: n.jsxs("div", {
                                    className: "max-w-3xl",
                                    children: [
                                      n.jsx("div", {
                                        className:
                                          "inline-block px-4 py-2 rounded-full mb-6",
                                        style: {
                                          backgroundColor: w.secondary,
                                          color: w.accent,
                                        },
                                        children: "Featured",
                                      }),
                                      n.jsx("h1", {
                                        className:
                                          "text-5xl md:text-6xl font-bold mb-6",
                                        style: { color: w.accent },
                                        children: f?.name,
                                      }),
                                      n.jsx("p", {
                                        className: "text-lg mb-8",
                                        style: { color: w.textColor },
                                        children:
                                          f?.description ||
                                          "Next-generation solutions for the modern world",
                                      }),
                                      n.jsx(ae, {
                                        variant: "primary",
                                        size: "lg",
                                        children: "Explore Now",
                                      }),
                                    ],
                                  }),
                                }),
                              n.jsxs("section", {
                                className:
                                  "p-8 md:p-12 border-b border-gray-100 relative",
                                children: [
                                  c &&
                                    n.jsx("div", {
                                      className: "absolute top-4 right-4 z-20",
                                      children: n.jsxs(ae, {
                                        size: "sm",
                                        variant: "secondary",
                                        children: [
                                          n.jsx(ho, { className: "w-3 h-3" }),
                                          "Edit About",
                                        ],
                                      }),
                                    }),
                                  n.jsxs("div", {
                                    className: "max-w-3xl",
                                    children: [
                                      n.jsx("h2", {
                                        className:
                                          "text-3xl font-bold text-gray-900 dark:text-white mb-4",
                                        children:
                                          g?.sections?.[0]?.heading || "About",
                                      }),
                                      n.jsx("p", {
                                        className:
                                          "text-gray-600 dark:text-gray-400 text-lg leading-relaxed",
                                        children:
                                          g?.sections?.[0]?.content ||
                                          f?.description ||
                                          "A custom website generated for your business.",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              g?.sections?.slice(1).map((_, W) => {
                                const Z =
                                    _.type === "cta-section" ||
                                    _.type === "cta-full" ||
                                    _.type === "cta-bold" ||
                                    _.type === "cta-tech"
                                      ? w.secondary
                                      : "transparent",
                                  q = w.textColor || "#000";
                                if (_.type === "feature-grid")
                                  return n.jsxs(
                                    "section",
                                    {
                                      className: "p-8 md:p-12",
                                      style: { backgroundColor: Z },
                                      children: [
                                        n.jsx("h2", {
                                          className: "text-4xl font-bold mb-2",
                                          style: { color: g.style.accent },
                                          children: _.heading,
                                        }),
                                        n.jsx("p", {
                                          className: "text-lg mb-12",
                                          children: _.content,
                                        }),
                                        n.jsx("div", {
                                          className:
                                            "grid md:grid-cols-3 gap-6",
                                          children: _.items?.map((ie, xe) =>
                                            n.jsx(
                                              "div",
                                              {
                                                className: "p-6 rounded-lg",
                                                style: {
                                                  backgroundColor:
                                                    g.style.bgColor,
                                                  border: `2px solid ${g.style.accent}`,
                                                },
                                                children: n.jsx("p", {
                                                  style: { color: q },
                                                  className: "font-semibold",
                                                  children: ie,
                                                }),
                                              },
                                              xe,
                                            ),
                                          ),
                                        }),
                                      ],
                                    },
                                    W,
                                  );
                                if (_.type === "gallery-grid") {
                                  if (!ne("gallery") && !ne("portfolio"))
                                    return null;
                                  const ie = Y?.images || [],
                                    xe =
                                      ie.length > 0 ? ie : [1, 2, 3, 4, 5, 6];
                                  return n.jsxs(
                                    "section",
                                    {
                                      className: "p-8 md:p-12",
                                      style: { backgroundColor: Z },
                                      children: [
                                        n.jsx("h2", {
                                          className: "text-4xl font-bold mb-2",
                                          style: { color: g.style.accent },
                                          children: _.heading,
                                        }),
                                        n.jsx("p", {
                                          className: "text-lg mb-12",
                                          children: _.content,
                                        }),
                                        n.jsx("div", {
                                          className:
                                            "grid md:grid-cols-2 lg:grid-cols-3 gap-8",
                                          children: xe.map((fe, Ie) =>
                                            n.jsx(
                                              "div",
                                              {
                                                className:
                                                  "aspect-square rounded-lg overflow-hidden",
                                                style: {
                                                  backgroundColor:
                                                    g.style.secondary,
                                                },
                                                children:
                                                  typeof fe == "object" &&
                                                  fe.url
                                                    ? n.jsx("img", {
                                                        src: fe.url,
                                                        alt:
                                                          fe.title ||
                                                          `Gallery ${Ie + 1}`,
                                                        className:
                                                          "w-full h-full object-cover",
                                                        onError: (rt) => {
                                                          rt.currentTarget.style.display =
                                                            "none";
                                                          const Ht =
                                                            rt.currentTarget
                                                              .parentElement;
                                                          if (Ht) {
                                                            const qe =
                                                              document.createElement(
                                                                "div",
                                                              );
                                                            ((qe.className =
                                                              "w-full h-full flex items-center justify-center text-gray-500"),
                                                              (qe.textContent =
                                                                fe.title ||
                                                                `Gallery ${Ie + 1}`),
                                                              Ht.appendChild(
                                                                qe,
                                                              ));
                                                          }
                                                        },
                                                      })
                                                    : n.jsxs("div", {
                                                        className:
                                                          "w-full h-full flex items-center justify-center text-gray-500",
                                                        children: [
                                                          "Gallery Item ",
                                                          Ie + 1,
                                                        ],
                                                      }),
                                              },
                                              Ie,
                                            ),
                                          ),
                                        }),
                                      ],
                                    },
                                    W,
                                  );
                                }
                                if (_.type === "testimonial-carousel") {
                                  if (!ne("testimonial")) return null;
                                  const ie =
                                    U && U.length > 0
                                      ? U
                                      : (_.items || []).map((xe, fe) => ({
                                          clientName: `Client ${fe + 1}`,
                                          content: xe,
                                        }));
                                  return n.jsxs(
                                    "section",
                                    {
                                      className: "p-8 md:p-12",
                                      style: { backgroundColor: Z },
                                      children: [
                                        n.jsx("h2", {
                                          className:
                                            "text-3xl font-bold mb-12 text-center",
                                          children: _.heading,
                                        }),
                                        n.jsx("div", {
                                          className:
                                            "grid md:grid-cols-3 gap-6",
                                          children: ie.map((xe, fe) =>
                                            n.jsxs(
                                              "div",
                                              {
                                                className: "p-6 rounded-lg",
                                                style: {
                                                  backgroundColor:
                                                    g.style.bgColor,
                                                  borderLeft: `4px solid ${g.style.accent}`,
                                                },
                                                children: [
                                                  xe.imageUrl &&
                                                    n.jsx("div", {
                                                      className:
                                                        "mb-4 flex justify-center",
                                                      children: n.jsx("img", {
                                                        src: xe.imageUrl,
                                                        alt: xe.clientName,
                                                        className:
                                                          "w-12 h-12 rounded-full object-cover",
                                                        onError: (Ie) => {
                                                          Ie.currentTarget.style.display =
                                                            "none";
                                                        },
                                                      }),
                                                    }),
                                                  n.jsxs("p", {
                                                    style: { color: q },
                                                    className: "mb-4",
                                                    children: [
                                                      '"',
                                                      xe.content || xe,
                                                      '"',
                                                    ],
                                                  }),
                                                  n.jsx("p", {
                                                    className: "font-semibold",
                                                    style: {
                                                      color: g.style.accent,
                                                    },
                                                    children: xe.clientName,
                                                  }),
                                                  xe.clientTitle &&
                                                    n.jsx("p", {
                                                      style: { color: q },
                                                      className:
                                                        "text-sm opacity-75",
                                                      children: xe.clientTitle,
                                                    }),
                                                  xe.rating &&
                                                    n.jsxs("p", {
                                                      className: "text-sm mt-2",
                                                      children: [
                                                        "⭐ ",
                                                        xe.rating,
                                                        "/5",
                                                      ],
                                                    }),
                                                ],
                                              },
                                              fe,
                                            ),
                                          ),
                                        }),
                                      ],
                                    },
                                    W,
                                  );
                                }
                                return _.type === "feature-tech"
                                  ? n.jsxs(
                                      "section",
                                      {
                                        className: "p-8 md:p-12",
                                        style: { backgroundColor: Z },
                                        children: [
                                          n.jsx("h2", {
                                            className:
                                              "text-4xl font-bold mb-2",
                                            style: { color: g.style.accent },
                                            children: _.heading,
                                          }),
                                          n.jsx("div", {
                                            className:
                                              "grid md:grid-cols-3 gap-8 mt-12",
                                            children: _.items?.map((ie, xe) =>
                                              n.jsxs(
                                                "div",
                                                {
                                                  className: "text-center",
                                                  children: [
                                                    n.jsx("div", {
                                                      className:
                                                        "mb-4 flex justify-center",
                                                      children: n.jsx("div", {
                                                        className:
                                                          "w-16 h-16 rounded-full flex items-center justify-center",
                                                        style: {
                                                          backgroundColor:
                                                            g.style.accent,
                                                        },
                                                        children: n.jsx(
                                                          "span",
                                                          {
                                                            style: {
                                                              color:
                                                                g.style.bgColor,
                                                            },
                                                            className:
                                                              "text-2xl font-bold",
                                                            children: xe + 1,
                                                          },
                                                        ),
                                                      }),
                                                    }),
                                                    n.jsx("h3", {
                                                      className:
                                                        "text-xl font-semibold mb-2",
                                                      style: { color: q },
                                                      children: ie,
                                                    }),
                                                  ],
                                                },
                                                xe,
                                              ),
                                            ),
                                          }),
                                        ],
                                      },
                                      W,
                                    )
                                  : _.type === "benefit-cards"
                                    ? n.jsxs(
                                        "section",
                                        {
                                          className: "p-8 md:p-12",
                                          style: { backgroundColor: Z },
                                          children: [
                                            n.jsx("h2", {
                                              className:
                                                "text-4xl font-bold mb-12 text-center",
                                              style: { color: g.style.accent },
                                              children: _.heading,
                                            }),
                                            n.jsx("div", {
                                              className:
                                                "grid md:grid-cols-3 gap-8",
                                              children: _.items?.map((ie, xe) =>
                                                n.jsxs(
                                                  "div",
                                                  {
                                                    className:
                                                      "p-8 rounded-lg text-center",
                                                    style: {
                                                      backgroundColor:
                                                        g.style.secondary,
                                                    },
                                                    children: [
                                                      n.jsx("div", {
                                                        className:
                                                          "text-5xl mb-4",
                                                        children: ie.icon,
                                                      }),
                                                      n.jsx("h3", {
                                                        className:
                                                          "text-xl font-bold",
                                                        style: { color: q },
                                                        children: ie.title,
                                                      }),
                                                    ],
                                                  },
                                                  xe,
                                                ),
                                              ),
                                            }),
                                          ],
                                        },
                                        W,
                                      )
                                    : _.type === "social-proof"
                                      ? n.jsxs(
                                          "section",
                                          {
                                            className: "p-8 md:p-12",
                                            style: { backgroundColor: Z },
                                            children: [
                                              n.jsx("h2", {
                                                className:
                                                  "text-4xl font-bold mb-12 text-center",
                                                style: {
                                                  color: g.style.accent,
                                                },
                                                children: _.heading,
                                              }),
                                              n.jsx("div", {
                                                className:
                                                  "grid md:grid-cols-3 gap-8",
                                                children: _.stats?.map(
                                                  (ie, xe) =>
                                                    n.jsxs(
                                                      "div",
                                                      {
                                                        className:
                                                          "text-center",
                                                        children: [
                                                          n.jsx("p", {
                                                            className:
                                                              "text-5xl font-bold mb-2",
                                                            style: {
                                                              color:
                                                                g.style.accent,
                                                            },
                                                            children: ie.number,
                                                          }),
                                                          n.jsx("p", {
                                                            style: { color: q },
                                                            className:
                                                              "text-lg",
                                                            children: ie.label,
                                                          }),
                                                        ],
                                                      },
                                                      xe,
                                                    ),
                                                ),
                                              }),
                                            ],
                                          },
                                          W,
                                        )
                                      : _.type === "quote-section"
                                        ? n.jsxs(
                                            "section",
                                            {
                                              className:
                                                "p-12 md:p-20 text-center",
                                              style: { backgroundColor: Z },
                                              children: [
                                                n.jsxs("p", {
                                                  className:
                                                    "text-3xl mb-6 italic",
                                                  style: {
                                                    color: q,
                                                    fontFamily:
                                                      "Georgia, serif",
                                                  },
                                                  children: [
                                                    '"',
                                                    _.content,
                                                    '"',
                                                  ],
                                                }),
                                                n.jsxs("p", {
                                                  style: {
                                                    color: g.style.accent,
                                                  },
                                                  className: "font-semibold",
                                                  children: ["— ", _.author],
                                                }),
                                              ],
                                            },
                                            W,
                                          )
                                        : _.type === "feature-minimal" ||
                                            _.type === "two-column" ||
                                            _.type === "timeline-section"
                                          ? n.jsxs(
                                              "section",
                                              {
                                                className:
                                                  "p-8 md:p-12 border-b",
                                                style: {
                                                  borderColor:
                                                    g.style.secondary,
                                                },
                                                children: [
                                                  n.jsx("h2", {
                                                    className:
                                                      "text-3xl font-light mb-6",
                                                    style: {
                                                      color: g.style.accent,
                                                      fontFamily:
                                                        "Georgia, serif",
                                                    },
                                                    children: _.heading,
                                                  }),
                                                  _.items
                                                    ? n.jsx("div", {
                                                        className: "space-y-4",
                                                        children: _.items.map(
                                                          (ie, xe) =>
                                                            n.jsxs(
                                                              "p",
                                                              {
                                                                style: {
                                                                  color: q,
                                                                },
                                                                children: [
                                                                  "• ",
                                                                  ie,
                                                                ],
                                                              },
                                                              xe,
                                                            ),
                                                        ),
                                                      })
                                                    : n.jsx("p", {
                                                        style: { color: q },
                                                        children: _.content,
                                                      }),
                                                ],
                                              },
                                              W,
                                            )
                                          : _.type === "pricing-table"
                                            ? ne("pricing")
                                              ? n.jsxs(
                                                  "section",
                                                  {
                                                    className: "p-8 md:p-12",
                                                    style: {
                                                      backgroundColor: Z,
                                                    },
                                                    children: [
                                                      n.jsx("h2", {
                                                        className:
                                                          "text-3xl font-bold mb-4 text-center",
                                                        style: {
                                                          color: g.style.accent,
                                                        },
                                                        children: _.heading,
                                                      }),
                                                      _.content &&
                                                        n.jsx("p", {
                                                          className:
                                                            "text-center mb-12",
                                                          style: { color: q },
                                                          children: _.content,
                                                        }),
                                                      n.jsxs("div", {
                                                        className:
                                                          "grid md:grid-cols-3 gap-6 max-w-4xl mx-auto",
                                                        children: [
                                                          n.jsxs("div", {
                                                            className:
                                                              "p-6 rounded-lg text-center",
                                                            style: {
                                                              backgroundColor:
                                                                g.style
                                                                  .secondary,
                                                            },
                                                            children: [
                                                              n.jsx("h3", {
                                                                className:
                                                                  "text-xl font-bold mb-2",
                                                                style: {
                                                                  color: q,
                                                                },
                                                                children:
                                                                  "Basic",
                                                              }),
                                                              n.jsx("p", {
                                                                className:
                                                                  "text-3xl font-bold mb-4",
                                                                style: {
                                                                  color:
                                                                    g.style
                                                                      .accent,
                                                                },
                                                                children: "$99",
                                                              }),
                                                              n.jsx("p", {
                                                                style: {
                                                                  color: q,
                                                                },
                                                                className:
                                                                  "text-sm",
                                                                children:
                                                                  "Perfect for getting started",
                                                              }),
                                                            ],
                                                          }),
                                                          n.jsxs("div", {
                                                            className:
                                                              "p-6 rounded-lg text-center border-2",
                                                            style: {
                                                              backgroundColor:
                                                                g.style.bgColor,
                                                              borderColor:
                                                                g.style.accent,
                                                            },
                                                            children: [
                                                              n.jsx("h3", {
                                                                className:
                                                                  "text-xl font-bold mb-2",
                                                                style: {
                                                                  color: q,
                                                                },
                                                                children:
                                                                  "Professional",
                                                              }),
                                                              n.jsx("p", {
                                                                className:
                                                                  "text-3xl font-bold mb-4",
                                                                style: {
                                                                  color:
                                                                    g.style
                                                                      .accent,
                                                                },
                                                                children:
                                                                  "$199",
                                                              }),
                                                              n.jsx("p", {
                                                                style: {
                                                                  color: q,
                                                                },
                                                                className:
                                                                  "text-sm",
                                                                children:
                                                                  "Most popular choice",
                                                              }),
                                                            ],
                                                          }),
                                                          n.jsxs("div", {
                                                            className:
                                                              "p-6 rounded-lg text-center",
                                                            style: {
                                                              backgroundColor:
                                                                g.style
                                                                  .secondary,
                                                            },
                                                            children: [
                                                              n.jsx("h3", {
                                                                className:
                                                                  "text-xl font-bold mb-2",
                                                                style: {
                                                                  color: q,
                                                                },
                                                                children:
                                                                  "Enterprise",
                                                              }),
                                                              n.jsx("p", {
                                                                className:
                                                                  "text-3xl font-bold mb-4",
                                                                style: {
                                                                  color:
                                                                    g.style
                                                                      .accent,
                                                                },
                                                                children:
                                                                  "Custom",
                                                              }),
                                                              n.jsx("p", {
                                                                style: {
                                                                  color: q,
                                                                },
                                                                className:
                                                                  "text-sm",
                                                                children:
                                                                  "Contact us for details",
                                                              }),
                                                            ],
                                                          }),
                                                        ],
                                                      }),
                                                    ],
                                                  },
                                                  W,
                                                )
                                              : null
                                            : _.type === "blog-preview"
                                              ? ne("blog")
                                                ? n.jsxs(
                                                    "section",
                                                    {
                                                      className: "p-8 md:p-12",
                                                      style: {
                                                        backgroundColor: Z,
                                                      },
                                                      children: [
                                                        n.jsx("h2", {
                                                          className:
                                                            "text-3xl font-bold mb-4 text-center",
                                                          style: {
                                                            color:
                                                              g.style.accent,
                                                          },
                                                          children: _.heading,
                                                        }),
                                                        _.content &&
                                                          n.jsx("p", {
                                                            className:
                                                              "text-center mb-12",
                                                            style: { color: q },
                                                            children: _.content,
                                                          }),
                                                        n.jsx("div", {
                                                          className:
                                                            "grid md:grid-cols-3 gap-6 max-w-5xl mx-auto",
                                                          children: [
                                                            1, 2, 3,
                                                          ].map((ie) =>
                                                            n.jsxs(
                                                              "div",
                                                              {
                                                                className:
                                                                  "rounded-lg overflow-hidden",
                                                                style: {
                                                                  backgroundColor:
                                                                    g.style
                                                                      .secondary,
                                                                },
                                                                children: [
                                                                  n.jsx("div", {
                                                                    className:
                                                                      "h-40 bg-gradient-to-br from-gray-200 to-gray-300",
                                                                  }),
                                                                  n.jsxs(
                                                                    "div",
                                                                    {
                                                                      className:
                                                                        "p-4",
                                                                      children:
                                                                        [
                                                                          n.jsx(
                                                                            "p",
                                                                            {
                                                                              className:
                                                                                "text-xs mb-2",
                                                                              style:
                                                                                {
                                                                                  color:
                                                                                    g
                                                                                      .style
                                                                                      .accent,
                                                                                },
                                                                              children:
                                                                                "Blog Post",
                                                                            },
                                                                          ),
                                                                          n.jsxs(
                                                                            "h3",
                                                                            {
                                                                              className:
                                                                                "font-bold mb-2",
                                                                              style:
                                                                                {
                                                                                  color:
                                                                                    q,
                                                                                },
                                                                              children:
                                                                                [
                                                                                  "Article Title ",
                                                                                  ie,
                                                                                ],
                                                                            },
                                                                          ),
                                                                          n.jsx(
                                                                            "p",
                                                                            {
                                                                              className:
                                                                                "text-sm",
                                                                              style:
                                                                                {
                                                                                  color:
                                                                                    q,
                                                                                  opacity: 0.7,
                                                                                },
                                                                              children:
                                                                                "A preview of your blog content will appear here...",
                                                                            },
                                                                          ),
                                                                        ],
                                                                    },
                                                                  ),
                                                                ],
                                                              },
                                                              ie,
                                                            ),
                                                          ),
                                                        }),
                                                      ],
                                                    },
                                                    W,
                                                  )
                                                : null
                                              : _.type === "live-chat"
                                                ? ne("chat")
                                                  ? n.jsx(
                                                      "section",
                                                      {
                                                        className:
                                                          "p-8 md:p-12",
                                                        style: {
                                                          backgroundColor:
                                                            g.style.accent,
                                                        },
                                                        children: n.jsxs(
                                                          "div",
                                                          {
                                                            className:
                                                              "max-w-2xl mx-auto text-center text-white",
                                                            children: [
                                                              n.jsx("div", {
                                                                className:
                                                                  "w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center",
                                                                children: n.jsx(
                                                                  "svg",
                                                                  {
                                                                    className:
                                                                      "w-8 h-8",
                                                                    fill: "currentColor",
                                                                    viewBox:
                                                                      "0 0 24 24",
                                                                    children:
                                                                      n.jsx(
                                                                        "path",
                                                                        {
                                                                          d: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z",
                                                                        },
                                                                      ),
                                                                  },
                                                                ),
                                                              }),
                                                              n.jsx("h2", {
                                                                className:
                                                                  "text-2xl font-bold mb-2",
                                                                children:
                                                                  _.heading,
                                                              }),
                                                              n.jsx("p", {
                                                                className:
                                                                  "opacity-90 mb-4",
                                                                children:
                                                                  _.content,
                                                              }),
                                                              n.jsx("p", {
                                                                className:
                                                                  "text-sm opacity-75",
                                                                children:
                                                                  "Live chat widget will appear in the bottom-right corner",
                                                              }),
                                                            ],
                                                          },
                                                        ),
                                                      },
                                                      W,
                                                    )
                                                  : null
                                                : n.jsx(
                                                    "section",
                                                    {
                                                      className:
                                                        "p-8 md:p-12 border-b border-gray-100",
                                                      children: n.jsxs("div", {
                                                        className: "max-w-3xl",
                                                        children: [
                                                          n.jsx("h3", {
                                                            className:
                                                              "text-2xl font-semibold mb-3",
                                                            children: _.heading,
                                                          }),
                                                          n.jsx("p", {
                                                            className:
                                                              "text-gray-600 dark:text-gray-400",
                                                            children: _.content,
                                                          }),
                                                        ],
                                                      }),
                                                    },
                                                    W,
                                                  );
                              }),
                              ne("contact") &&
                                n.jsxs("section", {
                                  className: "p-8 md:p-12 relative",
                                  style: { backgroundColor: "#f4f0e5" },
                                  children: [
                                    c &&
                                      n.jsx("div", {
                                        className:
                                          "absolute top-4 right-4 z-20",
                                        children: n.jsxs(ae, {
                                          size: "sm",
                                          variant: "secondary",
                                          children: [
                                            n.jsx(ho, { className: "w-3 h-3" }),
                                            "Edit Form",
                                          ],
                                        }),
                                      }),
                                    n.jsxs("div", {
                                      className: "max-w-2xl mx-auto",
                                      children: [
                                        n.jsxs("div", {
                                          className: "text-center mb-8",
                                          children: [
                                            n.jsx("h2", {
                                              className:
                                                "text-3xl font-bold text-gray-900 mb-2",
                                              children: f?.name
                                                ? `Contact ${f.name}`
                                                : "Join Our Mailing List",
                                            }),
                                            n.jsx("p", {
                                              className: "text-gray-600",
                                              children: f?.contactEmail
                                                ? `Leads will be sent to ${f.contactEmail}`
                                                : "Get exclusive offers and updates delivered to your inbox",
                                            }),
                                          ],
                                        }),
                                        n.jsx(Ee, {
                                          children: n.jsx(Pe, {
                                            className: "p-6",
                                            children: n.jsxs("form", {
                                              className: "space-y-4",
                                              onSubmit: async (_) => {
                                                _.preventDefault();
                                                const W = new FormData(
                                                    _.currentTarget,
                                                  ),
                                                  Z = {
                                                    name: `${W.get("firstName") || ""} ${W.get("lastName") || ""}`.trim(),
                                                    email: W.get("email"),
                                                    company: W.get("company"),
                                                    message:
                                                      W.get("message") || "",
                                                  };
                                                try {
                                                  if (a) {
                                                    const q =
                                                        localStorage.getItem(
                                                          "supabase.auth.token",
                                                        ),
                                                      ie = {
                                                        "Content-Type":
                                                          "application/json",
                                                      };
                                                    if (
                                                      (q &&
                                                        (ie.Authorization = `Bearer ${q}`),
                                                      !(
                                                        await fetch(
                                                          `${V}/businesses/${a}/leads`,
                                                          {
                                                            method: "POST",
                                                            headers: ie,
                                                            body: JSON.stringify(
                                                              Z,
                                                            ),
                                                          },
                                                        )
                                                      ).ok)
                                                    )
                                                      throw new Error(
                                                        "Failed to submit lead",
                                                      );
                                                    alert(
                                                      "Thanks — your message was sent",
                                                    );
                                                  } else
                                                    alert(
                                                      "This site is not available to receive leads yet",
                                                    );
                                                } catch (q) {
                                                  (console.error(q),
                                                    alert(
                                                      "Unable to send – try again later",
                                                    ));
                                                }
                                              },
                                              children: [
                                                n.jsxs("div", {
                                                  className:
                                                    "grid md:grid-cols-2 gap-4",
                                                  children: [
                                                    n.jsx("input", {
                                                      name: "firstName",
                                                      type: "text",
                                                      placeholder: "First Name",
                                                      className:
                                                        "px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500",
                                                    }),
                                                    n.jsx("input", {
                                                      name: "lastName",
                                                      type: "text",
                                                      placeholder: "Last Name",
                                                      className:
                                                        "px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500",
                                                    }),
                                                  ],
                                                }),
                                                n.jsx("input", {
                                                  name: "email",
                                                  type: "email",
                                                  placeholder: "Email Address",
                                                  className:
                                                    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500",
                                                }),
                                                n.jsx("input", {
                                                  name: "company",
                                                  type: "text",
                                                  placeholder:
                                                    "Company (optional)",
                                                  className:
                                                    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500",
                                                }),
                                                n.jsx("textarea", {
                                                  name: "message",
                                                  placeholder: "Message",
                                                  className:
                                                    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 h-24",
                                                }),
                                                n.jsxs(ae, {
                                                  variant: "primary",
                                                  size: "lg",
                                                  className: "w-full",
                                                  children: [
                                                    n.jsx(Yn, {
                                                      className: "w-5 h-5",
                                                    }),
                                                    "Sign Me Up",
                                                  ],
                                                }),
                                              ],
                                            }),
                                          }),
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ne("booking") &&
                                n.jsxs("section", {
                                  className: "p-8 md:p-12 relative",
                                  children: [
                                    c &&
                                      n.jsx("div", {
                                        className:
                                          "absolute top-4 right-4 z-20",
                                        children: n.jsxs(ae, {
                                          size: "sm",
                                          variant: "secondary",
                                          children: [
                                            n.jsx(ho, { className: "w-3 h-3" }),
                                            "Edit Calendar",
                                          ],
                                        }),
                                      }),
                                    n.jsxs("div", {
                                      className: "max-w-3xl mx-auto",
                                      children: [
                                        n.jsx("h2", {
                                          className:
                                            "text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center",
                                          children: "Book Your Visit",
                                        }),
                                        n.jsx(Ee, {
                                          children: n.jsx(Pe, {
                                            className: "p-8",
                                            children: n.jsx("div", {
                                              className:
                                                "aspect-video bg-gray-100 rounded-lg flex items-center justify-center",
                                              children: n.jsxs("div", {
                                                className: "text-center",
                                                children: [
                                                  n.jsx(tn, {
                                                    className:
                                                      "w-12 h-12 text-gray-400 mx-auto mb-3",
                                                  }),
                                                  n.jsx("p", {
                                                    className:
                                                      "text-gray-600 font-medium",
                                                    children: g?.name
                                                      ? `${g.name} — Booking Widget`
                                                      : "Calendar Booking Widget",
                                                  }),
                                                  n.jsx("p", {
                                                    className:
                                                      "text-sm text-gray-500",
                                                    children: g
                                                      ? "Configured calendar integration."
                                                      : "Integration with Google Calendar, Calendly, etc.",
                                                  }),
                                                ],
                                              }),
                                            }),
                                          }),
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              n.jsxs("footer", {
                                style: {
                                  backgroundColor:
                                    g?.style?.bgColor || "#1a202c",
                                  color: g?.style?.textColor || "#fff",
                                },
                                className: "p-8 md:p-12",
                                children: [
                                  n.jsxs("div", {
                                    className:
                                      "max-w-4xl mx-auto grid md:grid-cols-3 gap-8",
                                    children: [
                                      n.jsxs("div", {
                                        children: [
                                          n.jsx("h3", {
                                            className: "font-bold mb-3",
                                            style: { color: g?.style?.accent },
                                            children: "Contact",
                                          }),
                                          n.jsxs("div", {
                                            className: "space-y-2 text-sm",
                                            style: {
                                              color: g?.style?.textColor,
                                            },
                                            children: [
                                              n.jsxs("div", {
                                                className:
                                                  "flex items-center gap-2",
                                                children: [
                                                  n.jsx(w1, {
                                                    className: "w-4 h-4",
                                                  }),
                                                  n.jsx("span", {
                                                    children:
                                                      f?.phone ||
                                                      "(555) 123-4567",
                                                  }),
                                                ],
                                              }),
                                              n.jsxs("div", {
                                                className:
                                                  "flex items-center gap-2",
                                                children: [
                                                  n.jsx(Eo, {
                                                    className: "w-4 h-4",
                                                  }),
                                                  n.jsx("span", {
                                                    children:
                                                      f?.contactEmail ||
                                                      "hello@business.com",
                                                  }),
                                                ],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                      n.jsxs("div", {
                                        children: [
                                          n.jsx("h3", {
                                            className: "font-bold mb-3",
                                            style: { color: g?.style?.accent },
                                            children: "Hours",
                                          }),
                                          n.jsxs("div", {
                                            className: "space-y-1 text-sm",
                                            style: {
                                              color: g?.style?.textColor,
                                            },
                                            children: [
                                              n.jsx("p", {
                                                children: "Mon-Fri: 7am - 8pm",
                                              }),
                                              n.jsx("p", {
                                                children: "Sat-Sun: 8am - 9pm",
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                      n.jsxs("div", {
                                        children: [
                                          n.jsx("h3", {
                                            className: "font-bold mb-3",
                                            style: { color: g?.style?.accent },
                                            children: "Location",
                                          }),
                                          n.jsx("p", {
                                            className: "text-sm",
                                            style: {
                                              color: g?.style?.textColor,
                                            },
                                            children: f?.address
                                              ? n.jsx(n.Fragment, {
                                                  children: f.address,
                                                })
                                              : n.jsxs(n.Fragment, {
                                                  children: [
                                                    "123 Main Street",
                                                    n.jsx("br", {}),
                                                    "Downtown, CA 90210",
                                                  ],
                                                }),
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  n.jsx("div", {
                                    className: "max-w-4xl mx-auto mt-8 pt-8",
                                    style: {
                                      borderTopColor:
                                        g?.style?.secondary || "#333",
                                      borderTopWidth: 1,
                                    },
                                    children: n.jsxs("p", {
                                      className: "text-sm text-center",
                                      style: {
                                        color: g?.style?.secondary || "#aaa",
                                      },
                                      children: [
                                        "Powered by ",
                                        n.jsx("span", {
                                          style: { color: g?.style?.accent },
                                          className: "font-medium",
                                          children: "SalesAPE.ai",
                                        }),
                                      ],
                                    }),
                                  }),
                                ],
                              }),
                            ],
                          });
                        })(),
                    ],
                  }),
                }),
              }),
            }),
          ],
        }),
        v &&
          n.jsxs("div", {
            className:
              "fixed right-6 top-24 w-96 bg-white dark:bg-gray-800 border rounded shadow-lg p-4 z-50",
            children: [
              n.jsxs("div", {
                className: "flex items-center justify-between mb-3",
                children: [
                  n.jsx("h3", {
                    className: "font-semibold",
                    children: "Leads",
                  }),
                  n.jsx(ae, {
                    size: "sm",
                    variant: "ghost",
                    onClick: () => p(!1),
                    children: "Close",
                  }),
                ],
              }),
              k.length === 0
                ? n.jsx("div", {
                    className: "text-sm text-gray-500",
                    children: "No leads yet.",
                  })
                : n.jsx("div", {
                    className: "space-y-2 max-h-80 overflow-auto",
                    children: k.map((w) =>
                      n.jsxs(
                        "div",
                        {
                          className: "p-2 border rounded",
                          children: [
                            n.jsxs("div", {
                              className: "font-semibold",
                              children: [w.name, " — ", w.email],
                            }),
                            n.jsx("div", {
                              className: "text-sm text-gray-600",
                              children: w.message,
                            }),
                          ],
                        },
                        w.id,
                      ),
                    ),
                  }),
            ],
          }),
      ],
    })
  );
}
function _w() {
  const r = zt();
  jy();
  const [a, l] = b.useState(5);
  return (
    b.useEffect(() => {
      const i = setInterval(() => {
        l((c) => (c <= 1 ? (clearInterval(i), r("/dashboard"), 0) : c - 1));
      }, 1e3);
      return () => clearInterval(i);
    }, [r]),
    n.jsx("div", {
      className:
        "min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4",
      children: n.jsxs("div", {
        className: "max-w-2xl w-full",
        children: [
          n.jsx("div", {
            className: "text-center mb-8",
            children: n.jsx(Mr, {
              size: "md",
              className: "justify-center mb-8",
            }),
          }),
          n.jsxs("div", {
            className:
              "bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-200 dark:border-gray-700",
            children: [
              n.jsx("div", {
                className:
                  "inline-flex items-center justify-center w-20 h-20 rounded-full mb-6",
                style: { backgroundColor: "#f724de" },
                children: n.jsx(Yn, { className: "w-12 h-12 text-white" }),
              }),
              n.jsx("h1", {
                className:
                  "text-4xl font-bold text-gray-900 dark:text-white mb-4",
                children: "Welcome to Pro! 🎉",
              }),
              n.jsx("p", {
                className:
                  "text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto",
                children:
                  "Your payment was successful! You now have access to unlimited websites, leads, and SEO audits.",
              }),
              n.jsxs("div", {
                className:
                  "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-8",
                children: [
                  n.jsxs("h3", {
                    className:
                      "text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2",
                    children: [
                      n.jsx(Po, {
                        className: "w-5 h-5",
                        style: { color: "#f724de" },
                      }),
                      "Features Unlocked",
                    ],
                  }),
                  n.jsxs("div", {
                    className: "grid md:grid-cols-3 gap-4 text-sm",
                    children: [
                      n.jsxs("div", {
                        className: "bg-white dark:bg-gray-800 rounded-lg p-3",
                        children: [
                          n.jsx("div", {
                            className:
                              "font-semibold text-gray-900 dark:text-white mb-1",
                            children: "∞",
                          }),
                          n.jsx("div", {
                            className: "text-gray-600 dark:text-gray-400",
                            children: "Unlimited Websites",
                          }),
                        ],
                      }),
                      n.jsxs("div", {
                        className: "bg-white dark:bg-gray-800 rounded-lg p-3",
                        children: [
                          n.jsx("div", {
                            className:
                              "font-semibold text-gray-900 dark:text-white mb-1",
                            children: "∞",
                          }),
                          n.jsx("div", {
                            className: "text-gray-600 dark:text-gray-400",
                            children: "Unlimited Leads",
                          }),
                        ],
                      }),
                      n.jsxs("div", {
                        className: "bg-white dark:bg-gray-800 rounded-lg p-3",
                        children: [
                          n.jsx("div", {
                            className:
                              "font-semibold text-gray-900 dark:text-white mb-1",
                            children: "∞",
                          }),
                          n.jsx("div", {
                            className: "text-gray-600 dark:text-gray-400",
                            children: "Unlimited SEO Audits",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              n.jsxs("div", {
                className: "space-y-4",
                children: [
                  n.jsx(ae, {
                    variant: "primary",
                    size: "lg",
                    onClick: () => r("/dashboard"),
                    children: "Go to Dashboard",
                  }),
                  n.jsxs("p", {
                    className: "text-sm text-gray-500 dark:text-gray-400",
                    children: ["Redirecting in ", a, " seconds..."],
                  }),
                ],
              }),
              n.jsx("div", {
                className:
                  "mt-8 pt-6 border-t border-gray-200 dark:border-gray-700",
                children: n.jsx("p", {
                  className: "text-sm text-gray-600 dark:text-gray-400",
                  children: "A receipt has been sent to your email address.",
                }),
              }),
            ],
          }),
        ],
      }),
    })
  );
}
function Lw() {
  const r = zt(),
    { user: a } = Kn(),
    [l, i] = b.useState([]),
    [c, d] = b.useState(!0),
    [f, m] = b.useState(""),
    [g, x] = b.useState(null),
    [v, p] = b.useState(!1),
    [k, R] = b.useState(null),
    [S, L] = b.useState(!1);
  b.useEffect(() => {
    (async () => {
      try {
        d(!0);
        const H = localStorage.getItem("supabase.auth.token");
        if (!H) {
          (m("Please log in to view bookings"), r("/"));
          return;
        }
        const G = await fetch("http://localhost:3001/businesses", {
          headers: { Authorization: `Bearer ${H}` },
        });
        if (!G.ok) throw new Error("Failed to fetch businesses");
        const F = await G.json(),
          U = [];
        for (const P of F)
          try {
            const Y = await fetch(
              `http://localhost:3001/businesses/${P.id}/bookings`,
              { headers: { Authorization: `Bearer ${H}` } },
            );
            if (Y.ok) {
              const ce = (await Y.json()).map((Le) => ({
                ...Le,
                businessName: P.name,
                businessId: P.id,
              }));
              U.push(...ce);
            }
          } catch (Y) {
            console.error(`Failed to fetch bookings for business ${P.id}:`, Y);
          }
        (U.sort((P, Y) => {
          const oe = new Date(`${P.date} ${P.time}`);
          return new Date(`${Y.date} ${Y.time}`).getTime() - oe.getTime();
        }),
          i(U),
          m(""));
      } catch (H) {
        (console.error("Failed to fetch bookings:", H),
          m(H.message || "Failed to load bookings"));
      } finally {
        d(!1);
      }
    })();
  }, [r]);
  const j = async () => {
      if (k)
        try {
          L(!0);
          const D = localStorage.getItem("supabase.auth.token"),
            H = l.find((F) => F.id === k);
          if (!H) return;
          if (
            !(
              await fetch(
                `http://localhost:3001/businesses/${H.businessId}/bookings/${k}`,
                { method: "DELETE", headers: { Authorization: `Bearer ${D}` } },
              )
            ).ok
          )
            throw new Error("Failed to delete booking");
          (i(l.filter((F) => F.id !== k)), p(!1), R(null));
        } catch (D) {
          (console.error("Failed to delete booking:", D),
            m("Failed to delete booking"));
        } finally {
          L(!1);
        }
    },
    E = (D) => {
      const H = new Date(D),
        G = new Date();
      return (
        G.setHours(0, 0, 0, 0),
        H < G
          ? { status: "completed", color: "text-green-600", badge: "completed" }
          : H.toDateString() === G.toDateString()
            ? { status: "today", color: "text-blue-600", badge: "today" }
            : {
                status: "upcoming",
                color: "text-orange-600",
                badge: "upcoming",
              }
      );
    };
  return n.jsxs("div", {
    className: "min-h-screen bg-gray-50 dark:bg-gray-900",
    children: [
      n.jsx("header", {
        className:
          "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
        children: n.jsx("div", {
          className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4",
          children: n.jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              n.jsxs("div", {
                className: "flex items-center gap-4",
                children: [
                  n.jsx(ae, {
                    variant: "ghost",
                    size: "sm",
                    onClick: () => r("/dashboard"),
                    children: n.jsx(Js, { className: "w-4 h-4" }),
                  }),
                  n.jsxs("div", {
                    children: [
                      n.jsx("h1", {
                        className:
                          "text-2xl font-bold text-gray-900 dark:text-white",
                        children: "Manage Bookings",
                      }),
                      n.jsx("p", {
                        className: "text-sm text-gray-600 dark:text-gray-400",
                        children:
                          "View and manage all booking across your websites",
                      }),
                    ],
                  }),
                ],
              }),
              n.jsx(bs, {}),
            ],
          }),
        }),
      }),
      n.jsxs("main", {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
        children: [
          f &&
            n.jsx("div", {
              className:
                "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700",
              children: n.jsxs("div", {
                className: "flex gap-2",
                children: [
                  n.jsx(rn, { className: "w-5 h-5 shrink-0" }),
                  n.jsx("p", { children: f }),
                ],
              }),
            }),
          !c &&
            n.jsxs("div", {
              className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-8",
              children: [
                n.jsx(Ee, {
                  children: n.jsx(Pe, {
                    className: "py-6",
                    children: n.jsxs("div", {
                      className: "flex items-center gap-4",
                      children: [
                        n.jsx("div", {
                          className:
                            "w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center",
                          children: n.jsx(tn, {
                            className:
                              "w-6 h-6 text-blue-600 dark:text-blue-400",
                          }),
                        }),
                        n.jsxs("div", {
                          children: [
                            n.jsx("p", {
                              className:
                                "text-sm text-gray-600 dark:text-gray-400",
                              children: "Total Bookings",
                            }),
                            n.jsx("p", {
                              className:
                                "text-2xl font-bold text-gray-900 dark:text-white",
                              children: l.length,
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                }),
                n.jsx(Ee, {
                  children: n.jsx(Pe, {
                    className: "py-6",
                    children: n.jsxs("div", {
                      className: "flex items-center gap-4",
                      children: [
                        n.jsx("div", {
                          className:
                            "w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center",
                          children: n.jsx(kh, {
                            className:
                              "w-6 h-6 text-orange-600 dark:text-orange-400",
                          }),
                        }),
                        n.jsxs("div", {
                          children: [
                            n.jsx("p", {
                              className:
                                "text-sm text-gray-600 dark:text-gray-400",
                              children: "Upcoming",
                            }),
                            n.jsx("p", {
                              className:
                                "text-2xl font-bold text-gray-900 dark:text-white",
                              children: l.filter(
                                (D) => new Date(D.date) >= new Date(),
                              ).length,
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                }),
                n.jsx(Ee, {
                  children: n.jsx(Pe, {
                    className: "py-6",
                    children: n.jsxs("div", {
                      className: "flex items-center gap-4",
                      children: [
                        n.jsx("div", {
                          className:
                            "w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center",
                          children: n.jsx(Yn, {
                            className:
                              "w-6 h-6 text-green-600 dark:text-green-400",
                          }),
                        }),
                        n.jsxs("div", {
                          children: [
                            n.jsx("p", {
                              className:
                                "text-sm text-gray-600 dark:text-gray-400",
                              children: "Completed",
                            }),
                            n.jsx("p", {
                              className:
                                "text-2xl font-bold text-gray-900 dark:text-white",
                              children: l.filter(
                                (D) => new Date(D.date) < new Date(),
                              ).length,
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                }),
              ],
            }),
          c
            ? n.jsx(Ee, {
                children: n.jsxs(Pe, {
                  className: "py-16 text-center",
                  children: [
                    n.jsx(qa, {
                      className:
                        "w-8 h-8 animate-spin mx-auto mb-4 text-gray-400",
                    }),
                    n.jsx("p", {
                      className: "text-gray-600 dark:text-gray-400",
                      children: "Loading bookings...",
                    }),
                  ],
                }),
              })
            : l.length === 0
              ? n.jsx(Ee, {
                  children: n.jsxs(Pe, {
                    className: "py-16 text-center",
                    children: [
                      n.jsx("div", {
                        className:
                          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100 dark:bg-gray-700",
                        children: n.jsx(tn, {
                          className: "w-8 h-8 text-gray-400",
                        }),
                      }),
                      n.jsx("h3", {
                        className:
                          "text-lg font-semibold text-gray-900 dark:text-white mb-2",
                        children: "No bookings yet",
                      }),
                      n.jsx("p", {
                        className: "text-gray-600 dark:text-gray-400 mb-6",
                        children:
                          "Bookings from your websites will appear here",
                      }),
                      n.jsx(ae, {
                        variant: "primary",
                        onClick: () => r("/dashboard"),
                        children: "Back to Dashboard",
                      }),
                    ],
                  }),
                })
              : n.jsxs(Ee, {
                  children: [
                    n.jsx(ot, {
                      children: n.jsx("h2", {
                        className:
                          "text-xl font-bold text-gray-900 dark:text-white",
                        children: "All Bookings",
                      }),
                    }),
                    n.jsx(Pe, {
                      className: "p-0",
                      children: n.jsx("div", {
                        className:
                          "divide-y divide-gray-100 dark:divide-gray-700",
                        children: l.map((D) => {
                          const { badge: H, color: G } = E(D.date),
                            U = new Date(D.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            });
                          return n.jsxs(
                            "div",
                            {
                              className:
                                "p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                              children: [
                                n.jsxs("div", {
                                  className:
                                    "flex items-start justify-between mb-4",
                                  children: [
                                    n.jsxs("div", {
                                      className: "flex-1",
                                      children: [
                                        n.jsxs("div", {
                                          className:
                                            "flex items-center gap-3 mb-2",
                                          children: [
                                            n.jsx("h3", {
                                              className:
                                                "text-lg font-semibold text-gray-900 dark:text-white",
                                              children: D.name,
                                            }),
                                            n.jsx(fr, {
                                              className: `${G} bg-opacity-10`,
                                              children: H,
                                            }),
                                          ],
                                        }),
                                        n.jsxs("p", {
                                          className:
                                            "text-sm text-gray-600 dark:text-gray-400",
                                          children: ["From: ", D.businessName],
                                        }),
                                      ],
                                    }),
                                    n.jsx(ae, {
                                      variant: "ghost",
                                      size: "sm",
                                      onClick: () => {
                                        (R(D.id), p(!0));
                                      },
                                      className:
                                        "text-red-600 hover:text-red-700",
                                      children: n.jsx(Am, {
                                        className: "w-4 h-4",
                                      }),
                                    }),
                                  ],
                                }),
                                n.jsxs("div", {
                                  className:
                                    "grid grid-cols-1 md:grid-cols-3 gap-4",
                                  children: [
                                    n.jsxs("div", {
                                      className:
                                        "flex items-center gap-2 text-sm",
                                      children: [
                                        n.jsx(tn, {
                                          className: "w-4 h-4 text-gray-400",
                                        }),
                                        n.jsx("span", {
                                          className:
                                            "text-gray-600 dark:text-gray-400",
                                          children: U,
                                        }),
                                      ],
                                    }),
                                    n.jsxs("div", {
                                      className:
                                        "flex items-center gap-2 text-sm",
                                      children: [
                                        n.jsx(kh, {
                                          className: "w-4 h-4 text-gray-400",
                                        }),
                                        n.jsx("span", {
                                          className:
                                            "text-gray-600 dark:text-gray-400",
                                          children: D.time,
                                        }),
                                      ],
                                    }),
                                    n.jsxs("div", {
                                      className:
                                        "flex items-center gap-2 text-sm",
                                      children: [
                                        n.jsx(Eo, {
                                          className: "w-4 h-4 text-gray-400",
                                        }),
                                        n.jsx("a", {
                                          href: `mailto:${D.email}`,
                                          className:
                                            "text-blue-600 dark:text-blue-400 hover:underline",
                                          children: D.email,
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            },
                            D.id,
                          );
                        }),
                      }),
                    }),
                  ],
                }),
          v &&
            n.jsx("div", {
              className:
                "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",
              children: n.jsx(Ee, {
                className: "max-w-sm w-full",
                children: n.jsxs(Pe, {
                  className: "py-6",
                  children: [
                    n.jsx("h3", {
                      className:
                        "text-lg font-semibold text-gray-900 dark:text-white mb-2",
                      children: "Delete Booking?",
                    }),
                    n.jsx("p", {
                      className: "text-gray-600 dark:text-gray-400 mb-6",
                      children:
                        "Are you sure you want to delete this booking? This action cannot be undone.",
                    }),
                    n.jsxs("div", {
                      className: "flex gap-3",
                      children: [
                        n.jsx(ae, {
                          variant: "outline",
                          className: "flex-1",
                          onClick: () => p(!1),
                          disabled: S,
                          children: "Cancel",
                        }),
                        n.jsx(ae, {
                          variant: "primary",
                          className: "flex-1 bg-red-600 hover:bg-red-700",
                          onClick: j,
                          disabled: S,
                          children: S
                            ? n.jsxs(n.Fragment, {
                                children: [
                                  n.jsx(qa, {
                                    className: "w-4 h-4 animate-spin",
                                  }),
                                  "Deleting...",
                                ],
                              })
                            : "Delete",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            }),
        ],
      }),
    ],
  });
}
const Aw = () => {
    const r = zt(),
      [a, l] = b.useState(null),
      [i, c] = b.useState(!0);
    return (
      b.useEffect(() => {
        (async () => {
          try {
            c(!0);
            const f = await cp(),
              m = {
                sessionId: f.sessionId,
                stage: f.stage,
                currentQuestion: f.messages[0]?.content || "",
                extracted: {},
                isComplete: !1,
                questionNumber: 1,
                totalQuestions: 12,
              };
            (sessionStorage.setItem(`conv_${f.sessionId}`, JSON.stringify(m)),
              l(null),
              r(`/conversation/${f.sessionId}/question`));
          } catch (f) {
            (l(f instanceof Error ? f.message : "Failed to start conversation"),
              console.error("Conversation init error", f));
          } finally {
            c(!1);
          }
        })();
      }, [r]),
      a
        ? n.jsx("div", {
            className:
              "min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4",
            children: n.jsx(Ee, {
              className: "w-full max-w-md",
              children: n.jsxs("div", {
                className: "space-y-4",
                children: [
                  n.jsx("p", {
                    className: "text-red-600 dark:text-red-400",
                    children: a,
                  }),
                  n.jsx(ae, {
                    onClick: () => r(-1),
                    variant: "outline",
                    children: "Go Back",
                  }),
                ],
              }),
            }),
          })
        : n.jsx("div", {
            className:
              "min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4",
            children: n.jsxs("div", {
              className: "text-center",
              children: [
                n.jsx(jo, {
                  className: "w-8 h-8 animate-spin mx-auto mb-4 text-blue-600",
                }),
                n.jsx("p", {
                  className: "text-gray-600 dark:text-gray-400",
                  children: "Starting conversation...",
                }),
              ],
            }),
          })
    );
  },
  Ow = () => {
    const r = zt(),
      { sessionId: a } = tu(),
      l = b.useRef(null),
      i = b.useRef(null),
      [c, d] = b.useState(null),
      [f, m] = b.useState(""),
      [g, x] = b.useState(!0),
      [v, p] = b.useState(!1),
      [k, R] = b.useState(!1),
      [S, L] = b.useState(null),
      [j, E] = b.useState(!1),
      [D, H] = b.useState(!1),
      [G, F] = b.useState(!1),
      [U, P] = b.useState(!0),
      [Y, oe] = b.useState(!0);
    b.useEffect(() => {
      const me = window.SpeechRecognition || window.webkitSpeechRecognition;
      return (
        me &&
          (F(!0),
          (i.current = new me()),
          (i.current.continuous = !1),
          (i.current.interimResults = !0),
          (i.current.lang = "en-US"),
          (i.current.onstart = () => {
            (E(!0), L(null));
          }),
          (i.current.onresult = (Q) => {
            let ue = "";
            for (let V = Q.resultIndex; V < Q.results.length; V++)
              ue += Q.results[V][0].transcript;
            m(ue);
          }),
          (i.current.onerror = (Q) => {
            L(`Voice error: ${Q.error}`);
          }),
          (i.current.onend = () => {
            E(!1);
          })),
        () => {
          i.current && i.current.abort();
        }
      );
    }, []);
    const ce = () => {
        i.current && !j && (m(""), i.current.start());
      },
      Le = () => {
        i.current && j && i.current.stop();
      },
      de = (me) => {
        if (!Y) return;
        window.speechSynthesis.cancel();
        const Q = new SpeechSynthesisUtterance(me);
        ((Q.rate = 1),
          (Q.pitch = 1),
          (Q.onstart = () => H(!0)),
          (Q.onend = () => H(!1)),
          (Q.onerror = () => H(!1)),
          window.speechSynthesis.speak(Q));
      };
    b.useEffect(() => {
      if (!a) {
        (L("No session ID provided"), x(!1));
        return;
      }
      const me = sessionStorage.getItem(`conv_${a}`);
      if (me)
        try {
          const Q = JSON.parse(me);
          (d(Q), Y && de(Q.currentQuestion), x(!1));
        } catch {
          (L("Failed to load conversation state"), x(!1));
        }
      else (L("Conversation session not found"), x(!1));
    }, [a, Y]);
    const Re = async (me) => {
        if ((me.preventDefault(), !(!f.trim() || v || !c))) {
          (p(!0), L(null));
          try {
            const Q = await Nw(c.sessionId, f);
            if (Q.isComplete)
              (d((ue) => (ue ? { ...ue, isComplete: !0 } : null)),
                R(!0),
                setTimeout(async () => {
                  try {
                    const ue = await kw(c.sessionId);
                    r("/dashboard", { state: { websiteConfig: ue } });
                  } catch {
                    (L("Failed to generate website config"), R(!1));
                  }
                }, 2e3));
            else {
              const ue = {
                sessionId: Q.sessionId,
                stage: Q.stage,
                currentQuestion:
                  Q.messages[Q.messages.length - 1]?.content || "",
                extracted: Q.extracted || c.extracted,
                isComplete: !1,
                questionNumber: c.questionNumber + 1,
                totalQuestions: c.totalQuestions,
              };
              (d(ue),
                sessionStorage.setItem(
                  `conv_${c.sessionId}`,
                  JSON.stringify(ue),
                ),
                m(""),
                Y && de(ue.currentQuestion),
                setTimeout(() => l.current?.focus(), 100));
            }
          } catch (Q) {
            L(Q instanceof Error ? Q.message : "Failed to send message");
          } finally {
            p(!1);
          }
        }
      },
      ve = () => {
        r(-1);
      };
    return k
      ? n.jsx("div", {
          className:
            "min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4",
          children: n.jsxs("div", {
            className: "text-center",
            children: [
              n.jsx(jo, {
                className: "w-8 h-8 animate-spin mx-auto mb-4 text-blue-600",
              }),
              n.jsx("p", {
                className: "text-gray-600 dark:text-gray-400 mb-2",
                children: "Generating your website...",
              }),
              n.jsx("p", {
                className: "text-sm text-gray-500 dark:text-gray-500",
                children: "This may take a moment",
              }),
            ],
          }),
        })
      : g
        ? n.jsx("div", {
            className:
              "min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4",
            children: n.jsxs("div", {
              className: "text-center",
              children: [
                n.jsx(jo, {
                  className: "w-8 h-8 animate-spin mx-auto mb-4 text-blue-600",
                }),
                n.jsx("p", {
                  className: "text-gray-600 dark:text-gray-400",
                  children: "Loading question...",
                }),
              ],
            }),
          })
        : c
          ? n.jsxs("div", {
              className:
                "min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 flex flex-col overflow-hidden",
              children: [
                n.jsxs("div", {
                  className:
                    "sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between",
                  children: [
                    n.jsx("button", {
                      onClick: ve,
                      className:
                        "p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors",
                      "aria-label": "Go back",
                      children: n.jsx(Js, {
                        className: "w-5 h-5 text-gray-700 dark:text-gray-300",
                      }),
                    }),
                    n.jsxs("div", {
                      className: "flex-1 text-center mx-4",
                      children: [
                        n.jsxs("p", {
                          className:
                            "text-xs text-gray-500 dark:text-gray-400 mb-2",
                          children: [
                            "Question ",
                            c.questionNumber,
                            " of ",
                            c.totalQuestions,
                          ],
                        }),
                        n.jsx("div", {
                          className:
                            "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2",
                          children: n.jsx("div", {
                            className:
                              "bg-blue-600 h-2 rounded-full transition-all duration-300",
                            style: {
                              width: `${(c.questionNumber / c.totalQuestions) * 100}%`,
                            },
                          }),
                        }),
                      ],
                    }),
                    n.jsx(bs, {}),
                  ],
                }),
                n.jsx("div", {
                  className:
                    "flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 md:py-10",
                  children: n.jsxs("div", {
                    className: "max-w-3xl w-full space-y-6",
                    children: [
                      n.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          n.jsx("p", {
                            className:
                              "text-base sm:text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300",
                            children: c.currentQuestion.split(`
`)[0],
                          }),
                          c.currentQuestion.includes(`
`) &&
                            n.jsx("h1", {
                              className:
                                "text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight",
                              children: c.currentQuestion
                                .split(
                                  `
`,
                                )
                                .slice(1).join(`
`).split(`
`)[0],
                            }),
                        ],
                      }),
                      Object.keys(c.extracted).length > 0 &&
                        n.jsx("div", {
                          className:
                            "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4",
                          children: n.jsxs("p", {
                            className:
                              "text-sm text-blue-900 dark:text-blue-300",
                            children: [
                              "✓ ",
                              Object.keys(c.extracted).length,
                              " field",
                              Object.keys(c.extracted).length !== 1 ? "s" : "",
                              " captured so far",
                            ],
                          }),
                        }),
                    ],
                  }),
                }),
                S &&
                  n.jsx("div", {
                    className:
                      "px-4 sm:px-6 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mx-4 rounded-lg mb-4",
                    children: n.jsx("p", {
                      className: "text-sm text-red-600 dark:text-red-400",
                      children: S,
                    }),
                  }),
                n.jsxs("div", {
                  className:
                    "sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 md:p-6 space-y-3 shadow-lg",
                  children: [
                    G &&
                      n.jsxs("div", {
                        className: "flex gap-2 justify-center flex-wrap",
                        children: [
                          n.jsx("button", {
                            type: "button",
                            onClick: () => P(!U),
                            className: `flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs font-medium ${U ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`,
                            title: "Toggle voice input",
                            children: U
                              ? n.jsxs(n.Fragment, {
                                  children: [
                                    n.jsx(Sh, { className: "w-4 h-4" }),
                                    n.jsx("span", { children: "Voice On" }),
                                  ],
                                })
                              : n.jsxs(n.Fragment, {
                                  children: [
                                    n.jsx(d1, { className: "w-4 h-4" }),
                                    n.jsx("span", { children: "Voice Off" }),
                                  ],
                                }),
                          }),
                          n.jsx("button", {
                            type: "button",
                            onClick: () => oe(!Y),
                            className: `flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs font-medium ${Y ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`,
                            title: "Toggle voice output",
                            children: Y
                              ? n.jsxs(n.Fragment, {
                                  children: [
                                    n.jsx(Y1, { className: "w-4 h-4" }),
                                    n.jsx("span", { children: "Audio On" }),
                                  ],
                                })
                              : n.jsxs(n.Fragment, {
                                  children: [
                                    n.jsx(K1, { className: "w-4 h-4" }),
                                    n.jsx("span", { children: "Audio Off" }),
                                  ],
                                }),
                          }),
                        ],
                      }),
                    n.jsxs("form", {
                      onSubmit: Re,
                      className: "flex flex-col sm:flex-row gap-2 w-full",
                      children: [
                        n.jsx(St, {
                          ref: l,
                          type: "text",
                          value: f,
                          onChange: (me) => m(me.target.value),
                          placeholder: j
                            ? "🎤 Listening..."
                            : "Type or speak your answer...",
                          disabled: v,
                          className: "flex-1 text-sm w-full sm:w-auto",
                          autoComplete: "off",
                          autoFocus: !0,
                        }),
                        n.jsxs("div", {
                          className: "flex gap-2 w-full sm:w-auto",
                          children: [
                            G &&
                              U &&
                              n.jsx(ae, {
                                type: "button",
                                onClick: j ? Le : ce,
                                disabled: v,
                                className: `px-3 py-2 flex-shrink-0 ${j ? "bg-red-600 hover:bg-red-700" : ""}`,
                                title: j
                                  ? "Stop listening"
                                  : "Start voice input",
                                children: n.jsx(Sh, {
                                  className: `w-4 h-4 ${j ? "animate-pulse" : ""}`,
                                }),
                              }),
                            n.jsx(ae, {
                              type: "submit",
                              disabled: v || !f.trim(),
                              className: "px-4 py-2 flex-1 sm:flex-none",
                              children: v
                                ? n.jsx(jo, {
                                    className: "w-4 h-4 animate-spin",
                                  })
                                : c.isComplete
                                  ? n.jsx(Yn, { className: "w-4 h-4" })
                                  : n.jsx(R1, { className: "w-4 h-4" }),
                            }),
                          ],
                        }),
                      ],
                    }),
                    n.jsx("p", {
                      className:
                        "text-xs text-gray-500 dark:text-gray-400 text-center mt-2",
                      children: D
                        ? "🔊 AI is speaking..."
                        : "Powered by SalesAPE AI",
                    }),
                  ],
                }),
              ],
            })
          : n.jsx("div", {
              className:
                "min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4",
              children: n.jsxs("div", {
                className: "text-center space-y-4",
                children: [
                  n.jsx("p", {
                    className: "text-lg text-red-600 dark:text-red-400",
                    children: S,
                  }),
                  n.jsx(ae, {
                    onClick: () => r("/"),
                    variant: "outline",
                    children: "Start Over",
                  }),
                ],
              }),
            });
  },
  Fa = {
    queued: { label: "Preparing", progress: 5, icon: "⏳" },
    scraping: { label: "Analyzing your website", progress: 20, icon: "🔍" },
    analyzing: {
      label: "Understanding your business",
      progress: 40,
      icon: "🧠",
    },
    selecting_template: {
      label: "Selecting the perfect template",
      progress: 60,
      icon: "🎨",
    },
    generating_config: {
      label: "Generating website content",
      progress: 80,
      icon: "✍️",
    },
    enriching_images: { label: "Optimizing images", progress: 90, icon: "🖼️" },
    completed: { label: "Complete!", progress: 100, icon: "✅" },
    failed: { label: "Generation failed", progress: 0, icon: "❌" },
  },
  Dw = () => {
    const { id: r } = tu(),
      a = zt(),
      { getToken: l } = Kn(),
      i = l(),
      [c, d] = b.useState("idle"),
      [f, m] = b.useState("queued"),
      [g, x] = b.useState("Starting website generation..."),
      [v, p] = b.useState(0),
      [k, R] = b.useState(null),
      [S, L] = b.useState(0),
      j = "http://localhost:3001",
      E = b.useCallback(async () => {
        if (!(!r || !i))
          try {
            const G = await fetch(`${j}/businesses/${r}/website-status`, {
              headers: { Authorization: `Bearer ${i}` },
            });
            if (!G.ok) throw new Error("Failed to fetch status");
            const F = await G.json();
            (d(F.status), m(F.step || F.status), x(F.message));
            const U = Fa[F.step || F.status] || Fa.queued;
            (p(U.progress),
              F.status === "completed" &&
                setTimeout(() => {
                  a(`/website-preview/${r}`);
                }, 1500),
              F.status === "failed" &&
                R(F.message || "Website generation failed. Please try again."),
              L((P) => P + 1));
          } catch (G) {
            (console.error("Status fetch error:", G),
              S > 30 && R("Connection lost. Please refresh the page."));
          }
      }, [r, i, S, a, j]);
    (b.useEffect(() => {
      (async () => {
        if (!(!r || !i))
          try {
            const F = await fetch(`${j}/businesses/${r}/generate-website`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${i}`,
                  "Content-Type": "application/json",
                },
              }),
              U = await F.json();
            if (F.ok)
              (d(U.status || "queued"),
                U.status === "completed" && a(`/website-preview/${r}`));
            else if (F.status === 409) d("processing");
            else throw new Error(U.error || "Failed to start generation");
          } catch (F) {
            R(F.message || "Failed to start website generation");
          }
      })();
    }, [r, i, a, j]),
      b.useEffect(() => {
        if (c === "completed" || c === "failed" || c === "idle") return;
        const G = setInterval(E, 2e3);
        return () => clearInterval(G);
      }, [c, E]));
    const D = () => {
        (R(null), d("idle"), L(0), p(0), window.location.reload());
      },
      H = Fa[f] || Fa.queued;
    return n.jsx("div", {
      className:
        "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4",
      children: n.jsxs("div", {
        className: "max-w-md w-full",
        children: [
          n.jsxs("div", {
            className:
              "bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20",
            children: [
              n.jsxs("div", {
                className: "text-center mb-8",
                children: [
                  n.jsx("div", {
                    className:
                      "w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg",
                    children: n.jsx("span", {
                      className: "text-4xl",
                      children: H.icon,
                    }),
                  }),
                  n.jsx("h1", {
                    className: "text-2xl font-bold text-white mb-2",
                    children:
                      c === "completed"
                        ? "Website Ready!"
                        : "Creating Your Website",
                  }),
                  n.jsx("p", {
                    className: "text-white/70 text-sm",
                    children:
                      c === "completed"
                        ? "Redirecting to your website..."
                        : "This usually takes less than a minute",
                  }),
                ],
              }),
              !k &&
                n.jsxs("div", {
                  className: "mb-8",
                  children: [
                    n.jsxs("div", {
                      className:
                        "flex justify-between text-sm text-white/70 mb-2",
                      children: [
                        n.jsx("span", { children: H.label }),
                        n.jsxs("span", { children: [v, "%"] }),
                      ],
                    }),
                    n.jsx("div", {
                      className: "h-3 bg-white/10 rounded-full overflow-hidden",
                      children: n.jsx("div", {
                        className:
                          "h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500 ease-out",
                        style: { width: `${v}%` },
                      }),
                    }),
                  ],
                }),
              !k &&
                n.jsxs("div", {
                  className: "text-center",
                  children: [
                    n.jsx("p", { className: "text-white/80", children: g }),
                    c !== "completed" &&
                      n.jsx("div", {
                        className: "flex justify-center gap-1 mt-4",
                        children: [0, 1, 2].map((G) =>
                          n.jsx(
                            "div",
                            {
                              className:
                                "w-2 h-2 bg-purple-400 rounded-full animate-bounce",
                              style: { animationDelay: `${G * 0.15}s` },
                            },
                            G,
                          ),
                        ),
                      }),
                  ],
                }),
              k &&
                n.jsxs("div", {
                  className: "text-center",
                  children: [
                    n.jsx("div", {
                      className: "bg-red-500/20 rounded-xl p-4 mb-6",
                      children: n.jsx("p", {
                        className: "text-red-300",
                        children: k,
                      }),
                    }),
                    n.jsx("button", {
                      onClick: D,
                      className:
                        "w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity",
                      children: "Try Again",
                    }),
                    n.jsx("button", {
                      onClick: () => a("/dashboard"),
                      className:
                        "w-full py-3 mt-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors",
                      children: "Back to Dashboard",
                    }),
                  ],
                }),
              !k &&
                n.jsx("div", {
                  className: "mt-8 pt-6 border-t border-white/10",
                  children: n.jsx("div", {
                    className: "grid grid-cols-6 gap-2",
                    children: Object.entries(Fa)
                      .filter(([G]) => !["completed", "failed"].includes(G))
                      .map(([G, F], U) => {
                        const P = G === f,
                          Y = F.progress < H.progress;
                        return n.jsx(
                          "div",
                          {
                            className: `h-1 rounded-full transition-all ${P ? "bg-purple-400" : Y ? "bg-purple-600" : "bg-white/10"}`,
                          },
                          G,
                        );
                      }),
                  }),
                }),
            ],
          }),
          n.jsx("p", {
            className: "text-center text-white/40 text-xs mt-6",
            children:
              "Your website is being generated with AI. Please don't close this page.",
          }),
        ],
      }),
    });
  };
function Mw() {
  zt();
  const [r, a] = b.useState([]),
    [l, i] = b.useState(!0),
    [c, d] = b.useState(!1),
    [f, m] = b.useState(null);
  b.useEffect(() => {
    g();
  }, []);
  const g = async () => {
      try {
        i(!0);
        const p = localStorage.getItem("supabase.auth.token");
        if (!p) return;
        const k = await fetch("http://localhost:3001/businesses", {
          headers: { Authorization: `Bearer ${p}` },
        });
        if (k.ok) {
          const R = await k.json();
          if (R.length > 0) {
            const S = R[0].id,
              L = await fetch(
                `http://localhost:3001/businesses/${S}/content-projects`,
                { headers: { Authorization: `Bearer ${p}` } },
              );
            if (L.ok) {
              const j = await L.json();
              a(j);
            }
          }
        }
      } catch (p) {
        console.error("Failed to fetch projects:", p);
      } finally {
        i(!1);
      }
    },
    x = async (p) => {
      try {
        const k = localStorage.getItem("supabase.auth.token");
        (
          await fetch("http://localhost:3001/businesses/1/content-projects", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${k}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(p),
          })
        ).ok && (d(!1), g());
      } catch (k) {
        console.error("Failed to create project:", k);
      }
    },
    v = (p) =>
      ({ processing: "warning", ready: "success", published: "default" })[p] ||
      "info";
  return f
    ? n.jsx("div", {
        className: "min-h-screen bg-gray-50 dark:bg-gray-900",
        children: n.jsxs("div", {
          className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
          children: [
            n.jsxs("button", {
              onClick: () => m(null),
              className:
                "mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700",
              children: [
                n.jsx(Js, { className: "w-4 h-4" }),
                "Back to Projects",
              ],
            }),
            n.jsxs(Ee, {
              children: [
                n.jsxs(ot, {
                  children: [
                    n.jsx("h2", {
                      className:
                        "text-2xl font-bold text-gray-900 dark:text-white",
                      children: f.title,
                    }),
                    n.jsxs("p", {
                      className: "text-gray-600 dark:text-gray-400 mt-2",
                      children: [
                        "Status: ",
                        n.jsx(fr, { variant: v(f.status), children: f.status }),
                      ],
                    }),
                  ],
                }),
                n.jsx(Pe, {
                  children: n.jsx("div", {
                    className: "space-y-6",
                    children:
                      f.reels && f.reels.length > 0
                        ? n.jsxs("div", {
                            children: [
                              n.jsx("h3", {
                                className: "font-semibold mb-4",
                                children: "Generated Reels",
                              }),
                              n.jsx("div", {
                                className:
                                  "grid grid-cols-1 md:grid-cols-2 gap-4",
                                children: f.reels.map((p) =>
                                  n.jsxs(
                                    "div",
                                    {
                                      className:
                                        "border border-gray-200 dark:border-gray-700 rounded-lg p-4",
                                      children: [
                                        n.jsxs("div", {
                                          className:
                                            "flex justify-between items-start mb-2",
                                          children: [
                                            n.jsx("h4", {
                                              className: "font-semibold",
                                              children: p.title,
                                            }),
                                            n.jsx(fr, {
                                              variant: "info",
                                              children: p.platform,
                                            }),
                                          ],
                                        }),
                                        n.jsx("p", {
                                          className:
                                            "text-sm text-gray-600 dark:text-gray-400 mb-3",
                                          children: p.hook,
                                        }),
                                        n.jsxs("div", {
                                          className:
                                            "grid grid-cols-3 gap-2 mb-3 text-xs",
                                          children: [
                                            n.jsxs("div", {
                                              children: [
                                                n.jsx("span", {
                                                  className: "text-gray-500",
                                                  children: "Score",
                                                }),
                                                n.jsxs("p", {
                                                  className: "font-semibold",
                                                  children: [
                                                    Math.round(
                                                      p.prePublishScore,
                                                    ),
                                                    "/100",
                                                  ],
                                                }),
                                              ],
                                            }),
                                            n.jsxs("div", {
                                              children: [
                                                n.jsx("span", {
                                                  className: "text-gray-500",
                                                  children: "Duration",
                                                }),
                                                n.jsxs("p", {
                                                  className: "font-semibold",
                                                  children: [p.duration, "s"],
                                                }),
                                              ],
                                            }),
                                            n.jsxs("div", {
                                              children: [
                                                n.jsx("span", {
                                                  className: "text-gray-500",
                                                  children: "Status",
                                                }),
                                                n.jsx("p", {
                                                  className: "font-semibold",
                                                  children: p.status,
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                        n.jsxs("div", {
                                          className: "flex gap-2",
                                          children: [
                                            n.jsxs(ae, {
                                              variant: "outline",
                                              size: "sm",
                                              className: "flex-1",
                                              children: [
                                                n.jsx(j1, {
                                                  className: "w-4 h-4",
                                                }),
                                                "Preview",
                                              ],
                                            }),
                                            n.jsxs(ae, {
                                              variant: "outline",
                                              size: "sm",
                                              className: "flex-1",
                                              children: [
                                                n.jsx(L1, {
                                                  className: "w-4 h-4",
                                                }),
                                                "Publish",
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    },
                                    p.id,
                                  ),
                                ),
                              }),
                            ],
                          })
                        : n.jsx("p", {
                            className: "text-gray-500",
                            children:
                              "No reels generated yet. Processing content...",
                          }),
                  }),
                }),
              ],
            }),
          ],
        }),
      })
    : n.jsx("div", {
        className: "min-h-screen bg-gray-50 dark:bg-gray-900",
        children: n.jsxs("div", {
          className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
          children: [
            n.jsxs("div", {
              className: "mb-8 flex items-center justify-between",
              children: [
                n.jsxs("div", {
                  children: [
                    n.jsx("h1", {
                      className:
                        "text-3xl font-bold text-gray-900 dark:text-white",
                      children: "Content Studio",
                    }),
                    n.jsx("p", {
                      className: "text-gray-600 dark:text-gray-400 mt-2",
                      children:
                        "Transform your content into engaging social media reels",
                    }),
                  ],
                }),
                n.jsxs(ae, {
                  variant: "primary",
                  onClick: () => d(!0),
                  children: [
                    n.jsx(Ro, { className: "w-5 h-5" }),
                    "New Project",
                  ],
                }),
              ],
            }),
            c &&
              n.jsxs(Ee, {
                className: "mb-8",
                children: [
                  n.jsx(ot, {
                    children: n.jsx("h2", {
                      className: "text-xl font-bold",
                      children: "Create New Project",
                    }),
                  }),
                  n.jsx(Pe, {
                    children: n.jsx(zw, { onSubmit: x, onCancel: () => d(!1) }),
                  }),
                ],
              }),
            l
              ? n.jsx("div", {
                  className: "text-center py-12",
                  children: n.jsx("p", {
                    className: "text-gray-500",
                    children: "Loading projects...",
                  }),
                })
              : r.length === 0
                ? n.jsx(Ee, {
                    children: n.jsxs(Pe, {
                      className: "py-12 text-center",
                      children: [
                        n.jsx(V1, {
                          className: "w-12 h-12 mx-auto mb-4 text-gray-400",
                        }),
                        n.jsx("h3", {
                          className:
                            "text-lg font-semibold mb-2 text-gray-900 dark:text-white",
                          children: "No projects yet",
                        }),
                        n.jsx("p", {
                          className: "text-gray-600 dark:text-gray-400 mb-6",
                          children:
                            "Create your first content project to get started",
                        }),
                        n.jsxs(ae, {
                          variant: "primary",
                          onClick: () => d(!0),
                          children: [
                            n.jsx(Ro, { className: "w-5 h-5" }),
                            "Create Project",
                          ],
                        }),
                      ],
                    }),
                  })
                : n.jsx("div", {
                    className:
                      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                    children: r.map((p) =>
                      n.jsxs(
                        Ee,
                        {
                          className:
                            "cursor-pointer hover:shadow-lg transition-shadow",
                          children: [
                            n.jsxs(ot, {
                              children: [
                                n.jsxs("div", {
                                  className: "flex justify-between items-start",
                                  children: [
                                    n.jsx("h3", {
                                      className:
                                        "font-semibold text-gray-900 dark:text-white truncate flex-1",
                                      children:
                                        p.inputText?.substring(0, 30) ||
                                        `Project ${p.id.substring(0, 8)}`,
                                    }),
                                    n.jsx(fr, {
                                      variant: v(p.status),
                                      children: p.status,
                                    }),
                                  ],
                                }),
                                n.jsxs("p", {
                                  className:
                                    "text-sm text-gray-600 dark:text-gray-400 mt-2",
                                  children: ["Input: ", p.inputType],
                                }),
                              ],
                            }),
                            n.jsx(Pe, {
                              children: n.jsxs("div", {
                                className: "flex items-center justify-between",
                                children: [
                                  n.jsxs("div", {
                                    className: "text-sm text-gray-500",
                                    children: [p.reels?.length || 0, " reels"],
                                  }),
                                  n.jsx("button", {
                                    onClick: () => m(p),
                                    className:
                                      "text-blue-600 hover:text-blue-700 font-semibold text-sm",
                                    children: "View →",
                                  }),
                                ],
                              }),
                            }),
                          ],
                        },
                        p.id,
                      ),
                    ),
                  }),
          ],
        }),
      });
}
function zw({ onSubmit: r, onCancel: a }) {
  const [l, i] = b.useState({
      inputType: "text",
      inputText: "",
      style: "educational",
      reelsRequested: 3,
    }),
    c = (d) => {
      (d.preventDefault(), r(l));
    };
  return n.jsxs("form", {
    onSubmit: c,
    className: "space-y-4",
    children: [
      n.jsxs("div", {
        children: [
          n.jsx("label", {
            className: "block text-sm font-medium mb-2",
            children: "Input Type",
          }),
          n.jsxs("select", {
            value: l.inputType,
            onChange: (d) => i({ ...l, inputType: d.target.value }),
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600",
            children: [
              n.jsx("option", { value: "text", children: "Text" }),
              n.jsx("option", { value: "blog", children: "Blog URL" }),
              n.jsx("option", { value: "video", children: "Video URL" }),
              n.jsx("option", { value: "voice", children: "Voice/Audio" }),
            ],
          }),
        ],
      }),
      n.jsxs("div", {
        children: [
          n.jsx("label", {
            className: "block text-sm font-medium mb-2",
            children: "Content",
          }),
          n.jsx("textarea", {
            value: l.inputText,
            onChange: (d) => i({ ...l, inputText: d.target.value }),
            placeholder: "Paste your content here...",
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-lg h-24 dark:bg-gray-800 dark:border-gray-600",
          }),
        ],
      }),
      n.jsxs("div", {
        className: "grid grid-cols-2 gap-4",
        children: [
          n.jsxs("div", {
            children: [
              n.jsx("label", {
                className: "block text-sm font-medium mb-2",
                children: "Style",
              }),
              n.jsxs("select", {
                value: l.style,
                onChange: (d) => i({ ...l, style: d.target.value }),
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600",
                children: [
                  n.jsx("option", {
                    value: "educational",
                    children: "Educational",
                  }),
                  n.jsx("option", {
                    value: "storytelling",
                    children: "Storytelling",
                  }),
                  n.jsx("option", {
                    value: "entertaining",
                    children: "Entertaining",
                  }),
                  n.jsx("option", { value: "bold", children: "Bold" }),
                ],
              }),
            ],
          }),
          n.jsxs("div", {
            children: [
              n.jsx("label", {
                className: "block text-sm font-medium mb-2",
                children: "Reels",
              }),
              n.jsx("input", {
                type: "number",
                min: "1",
                max: "10",
                value: l.reelsRequested,
                onChange: (d) =>
                  i({ ...l, reelsRequested: parseInt(d.target.value) }),
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600",
              }),
            ],
          }),
        ],
      }),
      n.jsxs("div", {
        className: "flex gap-4 pt-4",
        children: [
          n.jsx(ae, {
            variant: "primary",
            className: "flex-1",
            type: "submit",
            children: "Create Project",
          }),
          n.jsx(ae, {
            variant: "outline",
            className: "flex-1",
            type: "button",
            onClick: a,
            children: "Cancel",
          }),
        ],
      }),
    ],
  });
}
function Iw() {
  const [r, a] = b.useState(null),
    [l, i] = b.useState("BALANCED"),
    [c, d] = b.useState(!0),
    [f, m] = b.useState(!1);
  b.useEffect(() => {
    g();
  }, []);
  const g = async () => {
      try {
        d(!0);
        const v = localStorage.getItem("supabase.auth.token");
        if (!v) return;
        const p = await fetch("http://localhost:3001/businesses", {
          headers: { Authorization: `Bearer ${v}` },
        });
        if (p.ok) {
          const k = await p.json();
          k.length > 0 && (a(k[0]), i(k[0].growthMode || "BALANCED"));
        }
      } catch (v) {
        console.error("Failed to fetch business data:", v);
      } finally {
        d(!1);
      }
    },
    x = async () => {
      try {
        if (!r?.id) return;
        const v = localStorage.getItem("supabase.auth.token");
        (
          await fetch(`http://localhost:3001/businesses/${r.id}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${v}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ growthMode: l }),
          })
        ).ok && (m(!0), setTimeout(() => m(!1), 3e3));
      } catch (v) {
        console.error("Failed to save growth mode:", v);
      }
    };
  return c
    ? n.jsx("div", {
        className: "min-h-screen bg-gray-50 dark:bg-gray-900",
        children: n.jsx("div", {
          className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
          children: n.jsx("p", {
            className: "text-gray-500",
            children: "Loading settings...",
          }),
        }),
      })
    : n.jsx("div", {
        className: "min-h-screen bg-gray-50 dark:bg-gray-900",
        children: n.jsxs("div", {
          className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
          children: [
            n.jsx("h1", {
              className:
                "text-3xl font-bold text-gray-900 dark:text-white mb-8",
              children: "Settings",
            }),
            n.jsxs("div", {
              className: "space-y-6",
              children: [
                n.jsxs(Ee, {
                  children: [
                    n.jsxs(ot, {
                      children: [
                        n.jsxs("div", {
                          className: "flex items-center gap-3",
                          children: [
                            n.jsx(el, { className: "w-5 h-5 text-blue-600" }),
                            n.jsx("h2", {
                              className: "text-xl font-bold",
                              children: "Growth Strategy",
                            }),
                          ],
                        }),
                        n.jsx("p", {
                          className:
                            "text-sm text-gray-600 dark:text-gray-400 mt-2",
                          children:
                            "Choose how aggressively your content repurposing system works",
                        }),
                      ],
                    }),
                    n.jsxs(Pe, {
                      className: "space-y-4",
                      children: [
                        n.jsxs("div", {
                          className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                          children: [
                            n.jsxs("div", {
                              onClick: () => i("CONSERVATIVE"),
                              className: `p-4 border rounded-lg cursor-pointer transition-all ${l === "CONSERVATIVE" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400"}`,
                              children: [
                                n.jsx("h3", {
                                  className: "font-semibold mb-2",
                                  children: "Conservative",
                                }),
                                n.jsx("p", {
                                  className:
                                    "text-sm text-gray-600 dark:text-gray-400 mb-3",
                                  children:
                                    "Minimal rewriting, minimal variants",
                                }),
                                n.jsx(fr, {
                                  variant: "info",
                                  children: "1 variant",
                                }),
                              ],
                            }),
                            n.jsxs("div", {
                              onClick: () => i("BALANCED"),
                              className: `p-4 border rounded-lg cursor-pointer transition-all ${l === "BALANCED" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400"}`,
                              children: [
                                n.jsx("h3", {
                                  className: "font-semibold mb-2",
                                  children: "Balanced",
                                }),
                                n.jsx("p", {
                                  className:
                                    "text-sm text-gray-600 dark:text-gray-400 mb-3",
                                  children: "3-5 variants, moderate rewriting",
                                }),
                                n.jsx(fr, {
                                  variant: "success",
                                  children: "3 variants",
                                }),
                              ],
                            }),
                            n.jsxs("div", {
                              onClick: () => i("AGGRESSIVE"),
                              className: `p-4 border rounded-lg cursor-pointer transition-all ${l === "AGGRESSIVE" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400"}`,
                              children: [
                                n.jsx("h3", {
                                  className: "font-semibold mb-2",
                                  children: "Aggressive",
                                }),
                                n.jsx("p", {
                                  className:
                                    "text-sm text-gray-600 dark:text-gray-400 mb-3",
                                  children: "5-10 variants, stronger hooks",
                                }),
                                n.jsx(fr, {
                                  variant: "warning",
                                  children: "5+ variants",
                                }),
                              ],
                            }),
                          ],
                        }),
                        n.jsxs("div", {
                          className: "pt-4",
                          children: [
                            n.jsx(ae, {
                              variant: "primary",
                              onClick: x,
                              children: "Save Growth Strategy",
                            }),
                            f &&
                              n.jsx("p", {
                                className: "text-green-600 text-sm mt-2",
                                children: "✓ Settings saved successfully",
                              }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                n.jsxs(Ee, {
                  children: [
                    n.jsx(ot, {
                      children: n.jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                          n.jsx(Lm, { className: "w-5 h-5 text-green-600" }),
                          n.jsx("h2", {
                            className: "text-xl font-bold",
                            children: "Account",
                          }),
                        ],
                      }),
                    }),
                    n.jsxs(Pe, {
                      className: "space-y-4",
                      children: [
                        n.jsxs("div", {
                          children: [
                            n.jsx("label", {
                              className: "block text-sm font-medium mb-2",
                              children: "Business Name",
                            }),
                            n.jsx("input", {
                              type: "text",
                              value: r?.name || "",
                              disabled: !0,
                              className:
                                "w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50",
                            }),
                          ],
                        }),
                        n.jsxs("div", {
                          children: [
                            n.jsx("label", {
                              className: "block text-sm font-medium mb-2",
                              children: "Business Email",
                            }),
                            n.jsx("input", {
                              type: "email",
                              value: r?.email || "",
                              disabled: !0,
                              className:
                                "w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                n.jsxs(Ee, {
                  children: [
                    n.jsx(ot, {
                      children: n.jsx("h2", {
                        className: "text-xl font-bold",
                        children: "Brand Identity",
                      }),
                    }),
                    n.jsxs(Pe, {
                      className: "space-y-4",
                      children: [
                        n.jsxs("div", {
                          children: [
                            n.jsx("label", {
                              className: "block text-sm font-medium mb-2",
                              children: "Brand Voice",
                            }),
                            n.jsxs("select", {
                              className:
                                "w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600",
                              children: [
                                n.jsx("option", { children: "Professional" }),
                                n.jsx("option", { children: "Casual" }),
                                n.jsx("option", { children: "Creative" }),
                                n.jsx("option", { children: "Authoritative" }),
                              ],
                            }),
                          ],
                        }),
                        n.jsxs("div", {
                          children: [
                            n.jsx("label", {
                              className: "block text-sm font-medium mb-2",
                              children: "Primary Colors",
                            }),
                            n.jsxs("div", {
                              className: "flex gap-3",
                              children: [
                                n.jsx("input", {
                                  type: "color",
                                  defaultValue: "#f724de",
                                  className: "w-12 h-10 rounded",
                                }),
                                n.jsx("input", {
                                  type: "color",
                                  defaultValue: "#ffffff",
                                  className: "w-12 h-10 rounded",
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                n.jsxs(Ee, {
                  children: [
                    n.jsx(ot, {
                      children: n.jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                          n.jsx(zy, { className: "w-5 h-5 text-orange-600" }),
                          n.jsx("h2", {
                            className: "text-xl font-bold",
                            children: "Notifications",
                          }),
                        ],
                      }),
                    }),
                    n.jsxs(Pe, {
                      className: "space-y-4",
                      children: [
                        n.jsxs("label", {
                          className: "flex items-center gap-3",
                          children: [
                            n.jsx("input", {
                              type: "checkbox",
                              defaultChecked: !0,
                              className: "w-4 h-4",
                            }),
                            n.jsx("span", {
                              children: "Content generation completed",
                            }),
                          ],
                        }),
                        n.jsxs("label", {
                          className: "flex items-center gap-3",
                          children: [
                            n.jsx("input", {
                              type: "checkbox",
                              defaultChecked: !0,
                              className: "w-4 h-4",
                            }),
                            n.jsx("span", {
                              children: "Weekly performance digest",
                            }),
                          ],
                        }),
                        n.jsxs("label", {
                          className: "flex items-center gap-3",
                          children: [
                            n.jsx("input", {
                              type: "checkbox",
                              className: "w-4 h-4",
                            }),
                            n.jsx("span", {
                              children: "New features announced",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                n.jsxs(Ee, {
                  children: [
                    n.jsx(ot, {
                      children: n.jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                          n.jsx(s1, { className: "w-5 h-5 text-red-600" }),
                          n.jsx("h2", {
                            className: "text-xl font-bold",
                            children: "Security",
                          }),
                        ],
                      }),
                    }),
                    n.jsxs(Pe, {
                      className: "space-y-4",
                      children: [
                        n.jsx(ae, {
                          variant: "outline",
                          className: "w-full",
                          children: "Change Password",
                        }),
                        n.jsx(ae, {
                          variant: "outline",
                          className: "w-full",
                          children: "Two-Factor Authentication",
                        }),
                        n.jsx(ae, {
                          variant: "outline",
                          className: "w-full",
                          children: "Connected Accounts",
                        }),
                      ],
                    }),
                  ],
                }),
                n.jsxs(Ee, {
                  className: "border-red-200 dark:border-red-900",
                  children: [
                    n.jsx(ot, {
                      children: n.jsx("h2", {
                        className: "text-xl font-bold text-red-600",
                        children: "Danger Zone",
                      }),
                    }),
                    n.jsxs(Pe, {
                      className: "space-y-4",
                      children: [
                        n.jsx(ae, {
                          variant: "outline",
                          className:
                            "w-full border-red-500 text-red-600 hover:bg-red-50",
                          children: "Delete All Content",
                        }),
                        n.jsx(ae, {
                          variant: "outline",
                          className:
                            "w-full border-red-500 text-red-600 hover:bg-red-50",
                          children: "Delete Business Account",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      });
}
function Fw({ children: r }) {
  const a = Ir(),
    l = zt(),
    { user: i, signOut: c } = Kn(),
    [d, f] = b.useState(!1);
  if (
    ["/auth", "/login", "/register", "/onboarding", "/conversation"].some((v) =>
      a.pathname.includes(v),
    ) ||
    !i
  )
    return n.jsx(n.Fragment, { children: r });
  const g = [
      { label: "Dashboard", path: "/dashboard", icon: e1 },
      { label: "Content Studio", path: "/content-studio", icon: el },
      { label: "Analytics", path: "/analytics", icon: By },
      { label: "Settings", path: "/settings", icon: T1 },
    ],
    x = async () => {
      try {
        (await c(), l("/"));
      } catch (v) {
        console.error("Logout failed:", v);
      }
    };
  return n.jsxs("div", {
    className: "flex h-screen bg-gray-50 dark:bg-gray-900",
    children: [
      n.jsxs("aside", {
        className: `
          fixed sm:relative inset-y-0 left-0 z-50 sm:z-auto
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform sm:transform-none transition-transform duration-300 ease-in-out
          ${d ? "translate-x-0 w-64" : "-translate-x-full w-64 sm:translate-x-0 sm:w-20 md:w-64"}
        `,
        "aria-label": "Navigation",
        children: [
          n.jsxs("div", {
            className:
              "flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700",
            children: [
              n.jsxs("div", {
                className:
                  "flex-shrink-0 cursor-pointer flex items-center justify-center sm:justify-start w-full",
                onClick: () => l("/dashboard"),
                role: "button",
                tabIndex: 0,
                onKeyDown: (v) => {
                  v.key === "Enter" && l("/dashboard");
                },
                "aria-label": "Home",
                children: [
                  n.jsx("div", {
                    className: "hidden sm:block",
                    children: n.jsx(Mr, { size: "sm" }),
                  }),
                  n.jsx("div", {
                    className: "sm:hidden",
                    children: d && n.jsx(Mr, { size: "sm" }),
                  }),
                ],
              }),
              n.jsx("button", {
                onClick: () => f(!1),
                className:
                  "sm:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg -mr-2",
                "aria-label": "Close sidebar",
                children: n.jsx(Ga, { className: "w-5 h-5" }),
              }),
            ],
          }),
          n.jsx("nav", {
            className: "flex-1 px-2 py-4 space-y-2 overflow-y-auto",
            "aria-label": "Main navigation",
            children: g.map((v) =>
              n.jsxs(
                "button",
                {
                  onClick: () => {
                    (l(v.path), f(!1));
                  },
                  className: `w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors justify-center sm:justify-start ${a.pathname === v.path ? "bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`,
                  "aria-current": a.pathname === v.path ? "page" : void 0,
                  title: v.label,
                  children: [
                    n.jsx(v.icon, { className: "w-5 h-5 flex-shrink-0" }),
                    n.jsx("span", {
                      className: "hidden sm:inline text-sm",
                      children: v.label,
                    }),
                  ],
                },
                v.path,
              ),
            ),
          }),
          n.jsxs("div", {
            className:
              "border-t border-gray-200 dark:border-gray-700 px-2 py-4 space-y-2",
            children: [
              n.jsx("div", {
                className:
                  "hidden sm:block px-3 py-2 text-xs text-gray-600 dark:text-gray-400 truncate text-center",
                children: i?.email,
              }),
              n.jsxs("button", {
                onClick: () => {
                  (x(), f(!1));
                },
                className:
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors justify-center sm:justify-start",
                "aria-label": "Sign out",
                title: "Sign out",
                children: [
                  n.jsx(l1, { className: "w-5 h-5 flex-shrink-0" }),
                  n.jsx("span", {
                    className: "hidden sm:inline text-sm",
                    children: "Sign Out",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      n.jsxs("div", {
        className: "flex-1 flex flex-col overflow-hidden",
        children: [
          n.jsxs("header", {
            className:
              "sticky top-0 z-40 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-3 sm:px-4 md:px-6 gap-3 sm:gap-4",
            children: [
              n.jsxs("div", {
                className: "flex items-center gap-2 sm:hidden flex-shrink-0",
                children: [
                  n.jsx("button", {
                    onClick: () => f(!d),
                    className:
                      "p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg",
                    "aria-label": "Toggle sidebar",
                    "aria-expanded": d,
                    "aria-controls": "navigation",
                    children: d
                      ? n.jsx(Ga, { className: "w-6 h-6" })
                      : n.jsx(c1, { className: "w-6 h-6" }),
                  }),
                  n.jsx("div", {
                    className: "w-20",
                    children: n.jsx(Mr, { size: "sm", variant: "icon" }),
                  }),
                ],
              }),
              n.jsx("div", { className: "flex-1" }),
            ],
          }),
          n.jsx("main", { className: "flex-1 overflow-y-auto", children: r }),
        ],
      }),
      d &&
        n.jsx("div", {
          className: "fixed inset-0 z-40 sm:hidden bg-black/50",
          onClick: () => f(!1),
          "aria-hidden": "true",
        }),
      n.jsx("a", {
        href: "#main-content",
        className:
          "sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-pink-600 text-white px-4 py-2 rounded-br-lg",
        children: "Skip to main content",
      }),
    ],
  });
}
const Gh = {
  "/": {
    title: "SalesAPE - Transform Your Business Into A Website With AI",
    description:
      "Turn your business into a fully operational website with AI-powered lead capture and booking in minutes.",
    keywords: ["website builder", "AI", "lead capture", "small business"],
  },
  "/audit": {
    title: "Free SEO & AEO Audit - SalesAPE",
    description:
      "Get a comprehensive audit of your website's SEO and Answer Engine Optimization performance.",
    keywords: ["SEO audit", "AEO", "website audit", "free tool"],
  },
  "/dashboard": {
    title: "Dashboard - SalesAPE",
    description: "Manage your websites, leads, and bookings in one place.",
    keywords: ["dashboard", "leads", "booking", "websites"],
  },
  "/create-website": {
    title: "Create Website - SalesAPE",
    description:
      "Create a professional website for your business in minutes with AI.",
    keywords: ["create website", "AI website builder", "web design"],
  },
  "/seo-audit": {
    title: "SEO Audit - SalesAPE",
    description:
      "Complete SEO audit of your website with actionable recommendations.",
    keywords: ["SEO audit", "optimization", "recommendations"],
  },
  "/manage-bookings": {
    title: "Manage Bookings - SalesAPE",
    description: "Manage and organize all your client bookings in one place.",
    keywords: ["bookings", "calendar", "appointments", "scheduling"],
  },
  "/payment-success": {
    title: "Payment Successful - SalesAPE",
    description: "Your payment has been processed successfully.",
    keywords: ["payment", "success", "subscription"],
  },
};
function $w() {
  const r = Ir();
  b.useEffect(() => {
    const a = Gh[r.pathname] || Gh["/"];
    ((document.title = a.title),
      ps("description", a.description || ""),
      ps("keywords", a.keywords?.join(", ") || ""),
      ps("og:title", a.title, "property"),
      ps("og:description", a.description || "", "property"),
      a.ogImage && ps("og:image", a.ogImage, "property"),
      ps("twitter:title", a.title, "name"),
      ps("twitter:description", a.description || "", "name"));
  }, [r.pathname]);
}
function ps(r, a, l = "name") {
  if (!a) return;
  let i = document.querySelector(`meta[${l}="${r}"]`);
  (i ||
    ((i = document.createElement("meta")),
    i.setAttribute(l, r),
    document.head.appendChild(i)),
    (i.content = a));
}
const Uw = () => ($w(), n.jsx(Hx, {})),
  jr = ({ children: r }) => n.jsx(Fw, { children: r }),
  Bw = [
    {
      path: "/",
      element: n.jsx(Uw, {}),
      children: [
        { path: "", element: n.jsx(Th, {}) },
        { path: "/login", element: n.jsx(Th, {}) },
        { path: "/audit", element: n.jsx(Pw, {}) },
        {
          path: "/onboarding",
          element: n.jsx(jr, { children: n.jsx(Aw, {}) }),
        },
        {
          path: "/conversation/:sessionId/question",
          element: n.jsx(jr, { children: n.jsx(Ow, {}) }),
        },
        { path: "/recap", element: n.jsx(jr, { children: n.jsx(Cw, {}) }) },
        { path: "/dashboard", element: n.jsx(jr, { children: n.jsx(qv, {}) }) },
        {
          path: "/content-studio",
          element: n.jsx(jr, { children: n.jsx(Mw, {}) }),
        },
        { path: "/settings", element: n.jsx(jr, { children: n.jsx(Iw, {}) }) },
        {
          path: "/create-website",
          element: n.jsx(jr, { children: n.jsx(Sw, {}) }),
        },
        {
          path: "/manage-bookings",
          element: n.jsx(jr, { children: n.jsx(Lw, {}) }),
        },
        { path: "/seo-audit", element: n.jsx(jr, { children: n.jsx(Ew, {}) }) },
        {
          path: "/website-preview/:id",
          element: n.jsx(jr, { children: n.jsx(Tw, {}) }),
        },
        {
          path: "/generating/:id",
          element: n.jsx(jr, { children: n.jsx(Dw, {}) }),
        },
        {
          path: "/payment-success",
          element: n.jsx(jr, { children: n.jsx(_w, {}) }),
        },
      ],
    },
  ],
  Hw = py(Bw);
var Vw = (r, a, l, i, c, d, f, m) => {
    let g = document.documentElement,
      x = ["light", "dark"];
    function v(R) {
      ((Array.isArray(r) ? r : [r]).forEach((S) => {
        let L = S === "class",
          j = L && d ? c.map((E) => d[E] || E) : c;
        L
          ? (g.classList.remove(...j), g.classList.add(d && d[R] ? d[R] : R))
          : g.setAttribute(S, R);
      }),
        p(R));
    }
    function p(R) {
      m && x.includes(R) && (g.style.colorScheme = R);
    }
    function k() {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    if (i) v(i);
    else
      try {
        let R = localStorage.getItem(a) || l,
          S = f && R === "system" ? k() : R;
        v(S);
      } catch {}
  },
  Ww = b.createContext(void 0),
  qw = { setTheme: (r) => {}, themes: [] },
  Yw = () => {
    var r;
    return (r = b.useContext(Ww)) != null ? r : qw;
  };
b.memo(
  ({
    forcedTheme: r,
    storageKey: a,
    attribute: l,
    enableSystem: i,
    enableColorScheme: c,
    defaultTheme: d,
    value: f,
    themes: m,
    nonce: g,
    scriptProps: x,
  }) => {
    let v = JSON.stringify([l, a, d, r, m, f, i, c]).slice(1, -1);
    return b.createElement("script", {
      ...x,
      suppressHydrationWarning: !0,
      nonce: typeof window > "u" ? g : "",
      dangerouslySetInnerHTML: { __html: `(${Vw.toString()})(${v})` },
    });
  },
);
const Gw = ({ ...r }) => {
  const { theme: a = "system" } = Yw();
  return n.jsx(Av, {
    theme: a,
    className: "toaster group",
    style: {
      "--normal-bg": "var(--popover)",
      "--normal-text": "var(--popover-foreground)",
      "--normal-border": "var(--border)",
    },
    ...r,
  });
};
class Kw extends le.Component {
  constructor(a) {
    (super(a), (this.state = { hasError: !1, error: null, errorInfo: null }));
  }
  static getDerivedStateFromError(a) {
    return { hasError: !0, error: a };
  }
  componentDidCatch(a, l) {
    (console.error("Error caught by boundary:", a, l),
      this.setState({
        errorInfo: {
          componentStack: l.componentStack || "Unknown component stack",
        },
      }));
  }
  handleReset = () => {
    (this.setState({ hasError: !1, error: null, errorInfo: null }),
      (window.location.href = "/dashboard"));
  };
  render() {
    return this.state.hasError
      ? n.jsx("div", {
          className:
            "min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900",
          children: n.jsxs("div", {
            className: "max-w-md w-full",
            children: [
              n.jsx("div", {
                className: "flex justify-center mb-6",
                children: n.jsx("div", {
                  className: "rounded-full bg-red-100 dark:bg-red-900/20 p-4",
                  children: n.jsx(B1, {
                    className: "w-12 h-12 text-red-600 dark:text-red-400",
                  }),
                }),
              }),
              n.jsxs("div", {
                className: "text-center mb-8",
                children: [
                  n.jsx("h1", {
                    className:
                      "text-2xl font-bold text-gray-900 dark:text-white mb-2",
                    children: "Oops! Something went wrong",
                  }),
                  n.jsx("p", {
                    className: "text-gray-600 dark:text-gray-400 mb-4",
                    children:
                      "We apologize for the inconvenience. An unexpected error occurred in the application.",
                  }),
                  !1,
                ],
              }),
              n.jsxs("div", {
                className: "space-y-3",
                children: [
                  n.jsxs(ae, {
                    onClick: this.handleReset,
                    variant: "primary",
                    size: "lg",
                    className: "w-full",
                    children: [
                      n.jsx(S1, { className: "w-4 h-4" }),
                      "Return to Dashboard",
                    ],
                  }),
                  n.jsx(ae, {
                    onClick: () => window.location.reload(),
                    variant: "outline",
                    size: "lg",
                    className: "w-full",
                    children: "Refresh Page",
                  }),
                ],
              }),
              n.jsxs("p", {
                className:
                  "mt-6 text-center text-sm text-gray-500 dark:text-gray-400",
                children: [
                  "If the problem persists,",
                  n.jsx("br", {}),
                  n.jsx("a", {
                    href: "mailto:support@salesape.com",
                    className:
                      "text-pink-600 dark:text-pink-400 hover:underline",
                    children: "contact our support team",
                  }),
                ],
              }),
            ],
          }),
        })
      : this.props.children;
  }
}
function Qw() {
  return n.jsx($x, { router: Hw });
}
function Jw() {
  return n.jsx(Kw, {
    children: n.jsx(Z1, {
      children: n.jsx(sv, {
        children: n.jsxs(Vv, { children: [n.jsx(Qw, {}), n.jsx(Gw, {})] }),
      }),
    }),
  });
}
Z0.createRoot(document.getElementById("root")).render(n.jsx(Jw, {}));

#!/usr/bin/env node
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/ajv/dist/compile/codegen/code.js
var require_code = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = undefined;

  class _CodeOrName {
  }
  exports._CodeOrName = _CodeOrName;
  exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;

  class Name extends _CodeOrName {
    constructor(s) {
      super();
      if (!exports.IDENTIFIER.test(s))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = s;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return false;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  exports.Name = Name;

  class _Code extends _CodeOrName {
    constructor(code) {
      super();
      this._items = typeof code === "string" ? [code] : code;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return false;
      const item = this._items[0];
      return item === "" || item === '""';
    }
    get str() {
      var _a;
      return (_a = this._str) !== null && _a !== undefined ? _a : this._str = this._items.reduce((s, c) => `${s}${c}`, "");
    }
    get names() {
      var _a;
      return (_a = this._names) !== null && _a !== undefined ? _a : this._names = this._items.reduce((names, c) => {
        if (c instanceof Name)
          names[c.str] = (names[c.str] || 0) + 1;
        return names;
      }, {});
    }
  }
  exports._Code = _Code;
  exports.nil = new _Code("");
  function _(strs, ...args) {
    const code = [strs[0]];
    let i2 = 0;
    while (i2 < args.length) {
      addCodeArg(code, args[i2]);
      code.push(strs[++i2]);
    }
    return new _Code(code);
  }
  exports._ = _;
  var plus = new _Code("+");
  function str2(strs, ...args) {
    const expr = [safeStringify(strs[0])];
    let i2 = 0;
    while (i2 < args.length) {
      expr.push(plus);
      addCodeArg(expr, args[i2]);
      expr.push(plus, safeStringify(strs[++i2]));
    }
    optimize(expr);
    return new _Code(expr);
  }
  exports.str = str2;
  function addCodeArg(code, arg) {
    if (arg instanceof _Code)
      code.push(...arg._items);
    else if (arg instanceof Name)
      code.push(arg);
    else
      code.push(interpolate(arg));
  }
  exports.addCodeArg = addCodeArg;
  function optimize(expr) {
    let i2 = 1;
    while (i2 < expr.length - 1) {
      if (expr[i2] === plus) {
        const res = mergeExprItems(expr[i2 - 1], expr[i2 + 1]);
        if (res !== undefined) {
          expr.splice(i2 - 1, 3, res);
          continue;
        }
        expr[i2++] = "+";
      }
      i2++;
    }
  }
  function mergeExprItems(a, b) {
    if (b === '""')
      return a;
    if (a === '""')
      return b;
    if (typeof a == "string") {
      if (b instanceof Name || a[a.length - 1] !== '"')
        return;
      if (typeof b != "string")
        return `${a.slice(0, -1)}${b}"`;
      if (b[0] === '"')
        return a.slice(0, -1) + b.slice(1);
      return;
    }
    if (typeof b == "string" && b[0] === '"' && !(a instanceof Name))
      return `"${a}${b.slice(1)}`;
    return;
  }
  function strConcat(c1, c2) {
    return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str2`${c1}${c2}`;
  }
  exports.strConcat = strConcat;
  function interpolate(x) {
    return typeof x == "number" || typeof x == "boolean" || x === null ? x : safeStringify(Array.isArray(x) ? x.join(",") : x);
  }
  function stringify(x) {
    return new _Code(safeStringify(x));
  }
  exports.stringify = stringify;
  function safeStringify(x) {
    return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  exports.safeStringify = safeStringify;
  function getProperty(key) {
    return typeof key == "string" && exports.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _`[${key}]`;
  }
  exports.getProperty = getProperty;
  function getEsmExportName(key) {
    if (typeof key == "string" && exports.IDENTIFIER.test(key)) {
      return new _Code(`${key}`);
    }
    throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
  }
  exports.getEsmExportName = getEsmExportName;
  function regexpCode(rx) {
    return new _Code(rx.toString());
  }
  exports.regexpCode = regexpCode;
});

// node_modules/ajv/dist/compile/codegen/scope.js
var require_scope = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = undefined;
  var code_1 = require_code();

  class ValueError extends Error {
    constructor(name) {
      super(`CodeGen: "code" for ${name} not defined`);
      this.value = name.value;
    }
  }
  var UsedValueState;
  (function(UsedValueState2) {
    UsedValueState2[UsedValueState2["Started"] = 0] = "Started";
    UsedValueState2[UsedValueState2["Completed"] = 1] = "Completed";
  })(UsedValueState || (exports.UsedValueState = UsedValueState = {}));
  exports.varKinds = {
    const: new code_1.Name("const"),
    let: new code_1.Name("let"),
    var: new code_1.Name("var")
  };

  class Scope {
    constructor({ prefixes, parent } = {}) {
      this._names = {};
      this._prefixes = prefixes;
      this._parent = parent;
    }
    toName(nameOrPrefix) {
      return nameOrPrefix instanceof code_1.Name ? nameOrPrefix : this.name(nameOrPrefix);
    }
    name(prefix) {
      return new code_1.Name(this._newName(prefix));
    }
    _newName(prefix) {
      const ng = this._names[prefix] || this._nameGroup(prefix);
      return `${prefix}${ng.index++}`;
    }
    _nameGroup(prefix) {
      var _a, _b;
      if (((_b = (_a = this._parent) === null || _a === undefined ? undefined : _a._prefixes) === null || _b === undefined ? undefined : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) {
        throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
      }
      return this._names[prefix] = { prefix, index: 0 };
    }
  }
  exports.Scope = Scope;

  class ValueScopeName extends code_1.Name {
    constructor(prefix, nameStr) {
      super(nameStr);
      this.prefix = prefix;
    }
    setValue(value, { property, itemIndex }) {
      this.value = value;
      this.scopePath = (0, code_1._)`.${new code_1.Name(property)}[${itemIndex}]`;
    }
  }
  exports.ValueScopeName = ValueScopeName;
  var line = (0, code_1._)`\n`;

  class ValueScope extends Scope {
    constructor(opts) {
      super(opts);
      this._values = {};
      this._scope = opts.scope;
      this.opts = { ...opts, _n: opts.lines ? line : code_1.nil };
    }
    get() {
      return this._scope;
    }
    name(prefix) {
      return new ValueScopeName(prefix, this._newName(prefix));
    }
    value(nameOrPrefix, value) {
      var _a;
      if (value.ref === undefined)
        throw new Error("CodeGen: ref must be passed in value");
      const name = this.toName(nameOrPrefix);
      const { prefix } = name;
      const valueKey = (_a = value.key) !== null && _a !== undefined ? _a : value.ref;
      let vs = this._values[prefix];
      if (vs) {
        const _name = vs.get(valueKey);
        if (_name)
          return _name;
      } else {
        vs = this._values[prefix] = new Map;
      }
      vs.set(valueKey, name);
      const s = this._scope[prefix] || (this._scope[prefix] = []);
      const itemIndex = s.length;
      s[itemIndex] = value.ref;
      name.setValue(value, { property: prefix, itemIndex });
      return name;
    }
    getValue(prefix, keyOrRef) {
      const vs = this._values[prefix];
      if (!vs)
        return;
      return vs.get(keyOrRef);
    }
    scopeRefs(scopeName, values = this._values) {
      return this._reduceValues(values, (name) => {
        if (name.scopePath === undefined)
          throw new Error(`CodeGen: name "${name}" has no value`);
        return (0, code_1._)`${scopeName}${name.scopePath}`;
      });
    }
    scopeCode(values = this._values, usedValues, getCode) {
      return this._reduceValues(values, (name) => {
        if (name.value === undefined)
          throw new Error(`CodeGen: name "${name}" has no value`);
        return name.value.code;
      }, usedValues, getCode);
    }
    _reduceValues(values, valueCode, usedValues = {}, getCode) {
      let code = code_1.nil;
      for (const prefix in values) {
        const vs = values[prefix];
        if (!vs)
          continue;
        const nameSet = usedValues[prefix] = usedValues[prefix] || new Map;
        vs.forEach((name) => {
          if (nameSet.has(name))
            return;
          nameSet.set(name, UsedValueState.Started);
          let c = valueCode(name);
          if (c) {
            const def = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
            code = (0, code_1._)`${code}${def} ${name} = ${c};${this.opts._n}`;
          } else if (c = getCode === null || getCode === undefined ? undefined : getCode(name)) {
            code = (0, code_1._)`${code}${c}${this.opts._n}`;
          } else {
            throw new ValueError(name);
          }
          nameSet.set(name, UsedValueState.Completed);
        });
      }
      return code;
    }
  }
  exports.ValueScope = ValueScope;
});

// node_modules/ajv/dist/compile/codegen/index.js
var require_codegen = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = undefined;
  var code_1 = require_code();
  var scope_1 = require_scope();
  var code_2 = require_code();
  Object.defineProperty(exports, "_", { enumerable: true, get: function() {
    return code_2._;
  } });
  Object.defineProperty(exports, "str", { enumerable: true, get: function() {
    return code_2.str;
  } });
  Object.defineProperty(exports, "strConcat", { enumerable: true, get: function() {
    return code_2.strConcat;
  } });
  Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
    return code_2.nil;
  } });
  Object.defineProperty(exports, "getProperty", { enumerable: true, get: function() {
    return code_2.getProperty;
  } });
  Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
    return code_2.stringify;
  } });
  Object.defineProperty(exports, "regexpCode", { enumerable: true, get: function() {
    return code_2.regexpCode;
  } });
  Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
    return code_2.Name;
  } });
  var scope_2 = require_scope();
  Object.defineProperty(exports, "Scope", { enumerable: true, get: function() {
    return scope_2.Scope;
  } });
  Object.defineProperty(exports, "ValueScope", { enumerable: true, get: function() {
    return scope_2.ValueScope;
  } });
  Object.defineProperty(exports, "ValueScopeName", { enumerable: true, get: function() {
    return scope_2.ValueScopeName;
  } });
  Object.defineProperty(exports, "varKinds", { enumerable: true, get: function() {
    return scope_2.varKinds;
  } });
  exports.operators = {
    GT: new code_1._Code(">"),
    GTE: new code_1._Code(">="),
    LT: new code_1._Code("<"),
    LTE: new code_1._Code("<="),
    EQ: new code_1._Code("==="),
    NEQ: new code_1._Code("!=="),
    NOT: new code_1._Code("!"),
    OR: new code_1._Code("||"),
    AND: new code_1._Code("&&"),
    ADD: new code_1._Code("+")
  };

  class Node {
    optimizeNodes() {
      return this;
    }
    optimizeNames(_names, _constants) {
      return this;
    }
  }

  class Def extends Node {
    constructor(varKind, name, rhs) {
      super();
      this.varKind = varKind;
      this.name = name;
      this.rhs = rhs;
    }
    render({ es5, _n }) {
      const varKind = es5 ? scope_1.varKinds.var : this.varKind;
      const rhs = this.rhs === undefined ? "" : ` = ${this.rhs}`;
      return `${varKind} ${this.name}${rhs};` + _n;
    }
    optimizeNames(names, constants) {
      if (!names[this.name.str])
        return;
      if (this.rhs)
        this.rhs = optimizeExpr(this.rhs, names, constants);
      return this;
    }
    get names() {
      return this.rhs instanceof code_1._CodeOrName ? this.rhs.names : {};
    }
  }

  class Assign extends Node {
    constructor(lhs, rhs, sideEffects) {
      super();
      this.lhs = lhs;
      this.rhs = rhs;
      this.sideEffects = sideEffects;
    }
    render({ _n }) {
      return `${this.lhs} = ${this.rhs};` + _n;
    }
    optimizeNames(names, constants) {
      if (this.lhs instanceof code_1.Name && !names[this.lhs.str] && !this.sideEffects)
        return;
      this.rhs = optimizeExpr(this.rhs, names, constants);
      return this;
    }
    get names() {
      const names = this.lhs instanceof code_1.Name ? {} : { ...this.lhs.names };
      return addExprNames(names, this.rhs);
    }
  }

  class AssignOp extends Assign {
    constructor(lhs, op, rhs, sideEffects) {
      super(lhs, rhs, sideEffects);
      this.op = op;
    }
    render({ _n }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
    }
  }

  class Label extends Node {
    constructor(label) {
      super();
      this.label = label;
      this.names = {};
    }
    render({ _n }) {
      return `${this.label}:` + _n;
    }
  }

  class Break extends Node {
    constructor(label) {
      super();
      this.label = label;
      this.names = {};
    }
    render({ _n }) {
      const label = this.label ? ` ${this.label}` : "";
      return `break${label};` + _n;
    }
  }

  class Throw extends Node {
    constructor(error) {
      super();
      this.error = error;
    }
    render({ _n }) {
      return `throw ${this.error};` + _n;
    }
    get names() {
      return this.error.names;
    }
  }

  class AnyCode extends Node {
    constructor(code) {
      super();
      this.code = code;
    }
    render({ _n }) {
      return `${this.code};` + _n;
    }
    optimizeNodes() {
      return `${this.code}` ? this : undefined;
    }
    optimizeNames(names, constants) {
      this.code = optimizeExpr(this.code, names, constants);
      return this;
    }
    get names() {
      return this.code instanceof code_1._CodeOrName ? this.code.names : {};
    }
  }

  class ParentNode extends Node {
    constructor(nodes = []) {
      super();
      this.nodes = nodes;
    }
    render(opts) {
      return this.nodes.reduce((code, n) => code + n.render(opts), "");
    }
    optimizeNodes() {
      const { nodes } = this;
      let i2 = nodes.length;
      while (i2--) {
        const n = nodes[i2].optimizeNodes();
        if (Array.isArray(n))
          nodes.splice(i2, 1, ...n);
        else if (n)
          nodes[i2] = n;
        else
          nodes.splice(i2, 1);
      }
      return nodes.length > 0 ? this : undefined;
    }
    optimizeNames(names, constants) {
      const { nodes } = this;
      let i2 = nodes.length;
      while (i2--) {
        const n = nodes[i2];
        if (n.optimizeNames(names, constants))
          continue;
        subtractNames(names, n.names);
        nodes.splice(i2, 1);
      }
      return nodes.length > 0 ? this : undefined;
    }
    get names() {
      return this.nodes.reduce((names, n) => addNames(names, n.names), {});
    }
  }

  class BlockNode extends ParentNode {
    render(opts) {
      return "{" + opts._n + super.render(opts) + "}" + opts._n;
    }
  }

  class Root extends ParentNode {
  }

  class Else extends BlockNode {
  }
  Else.kind = "else";

  class If extends BlockNode {
    constructor(condition, nodes) {
      super(nodes);
      this.condition = condition;
    }
    render(opts) {
      let code = `if(${this.condition})` + super.render(opts);
      if (this.else)
        code += "else " + this.else.render(opts);
      return code;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const cond = this.condition;
      if (cond === true)
        return this.nodes;
      let e = this.else;
      if (e) {
        const ns = e.optimizeNodes();
        e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
      }
      if (e) {
        if (cond === false)
          return e instanceof If ? e : e.nodes;
        if (this.nodes.length)
          return this;
        return new If(not(cond), e instanceof If ? [e] : e.nodes);
      }
      if (cond === false || !this.nodes.length)
        return;
      return this;
    }
    optimizeNames(names, constants) {
      var _a;
      this.else = (_a = this.else) === null || _a === undefined ? undefined : _a.optimizeNames(names, constants);
      if (!(super.optimizeNames(names, constants) || this.else))
        return;
      this.condition = optimizeExpr(this.condition, names, constants);
      return this;
    }
    get names() {
      const names = super.names;
      addExprNames(names, this.condition);
      if (this.else)
        addNames(names, this.else.names);
      return names;
    }
  }
  If.kind = "if";

  class For extends BlockNode {
  }
  For.kind = "for";

  class ForLoop extends For {
    constructor(iteration) {
      super();
      this.iteration = iteration;
    }
    render(opts) {
      return `for(${this.iteration})` + super.render(opts);
    }
    optimizeNames(names, constants) {
      if (!super.optimizeNames(names, constants))
        return;
      this.iteration = optimizeExpr(this.iteration, names, constants);
      return this;
    }
    get names() {
      return addNames(super.names, this.iteration.names);
    }
  }

  class ForRange extends For {
    constructor(varKind, name, from, to) {
      super();
      this.varKind = varKind;
      this.name = name;
      this.from = from;
      this.to = to;
    }
    render(opts) {
      const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
      const { name, from, to } = this;
      return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
    }
    get names() {
      const names = addExprNames(super.names, this.from);
      return addExprNames(names, this.to);
    }
  }

  class ForIter extends For {
    constructor(loop, varKind, name, iterable) {
      super();
      this.loop = loop;
      this.varKind = varKind;
      this.name = name;
      this.iterable = iterable;
    }
    render(opts) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
    }
    optimizeNames(names, constants) {
      if (!super.optimizeNames(names, constants))
        return;
      this.iterable = optimizeExpr(this.iterable, names, constants);
      return this;
    }
    get names() {
      return addNames(super.names, this.iterable.names);
    }
  }

  class Func extends BlockNode {
    constructor(name, args, async) {
      super();
      this.name = name;
      this.args = args;
      this.async = async;
    }
    render(opts) {
      const _async = this.async ? "async " : "";
      return `${_async}function ${this.name}(${this.args})` + super.render(opts);
    }
  }
  Func.kind = "func";

  class Return extends ParentNode {
    render(opts) {
      return "return " + super.render(opts);
    }
  }
  Return.kind = "return";

  class Try extends BlockNode {
    render(opts) {
      let code = "try" + super.render(opts);
      if (this.catch)
        code += this.catch.render(opts);
      if (this.finally)
        code += this.finally.render(opts);
      return code;
    }
    optimizeNodes() {
      var _a, _b;
      super.optimizeNodes();
      (_a = this.catch) === null || _a === undefined || _a.optimizeNodes();
      (_b = this.finally) === null || _b === undefined || _b.optimizeNodes();
      return this;
    }
    optimizeNames(names, constants) {
      var _a, _b;
      super.optimizeNames(names, constants);
      (_a = this.catch) === null || _a === undefined || _a.optimizeNames(names, constants);
      (_b = this.finally) === null || _b === undefined || _b.optimizeNames(names, constants);
      return this;
    }
    get names() {
      const names = super.names;
      if (this.catch)
        addNames(names, this.catch.names);
      if (this.finally)
        addNames(names, this.finally.names);
      return names;
    }
  }

  class Catch extends BlockNode {
    constructor(error) {
      super();
      this.error = error;
    }
    render(opts) {
      return `catch(${this.error})` + super.render(opts);
    }
  }
  Catch.kind = "catch";

  class Finally extends BlockNode {
    render(opts) {
      return "finally" + super.render(opts);
    }
  }
  Finally.kind = "finally";

  class CodeGen {
    constructor(extScope, opts = {}) {
      this._values = {};
      this._blockStarts = [];
      this._constants = {};
      this.opts = { ...opts, _n: opts.lines ? `
` : "" };
      this._extScope = extScope;
      this._scope = new scope_1.Scope({ parent: extScope });
      this._nodes = [new Root];
    }
    toString() {
      return this._root.render(this.opts);
    }
    name(prefix) {
      return this._scope.name(prefix);
    }
    scopeName(prefix) {
      return this._extScope.name(prefix);
    }
    scopeValue(prefixOrName, value) {
      const name = this._extScope.value(prefixOrName, value);
      const vs = this._values[name.prefix] || (this._values[name.prefix] = new Set);
      vs.add(name);
      return name;
    }
    getScopeValue(prefix, keyOrRef) {
      return this._extScope.getValue(prefix, keyOrRef);
    }
    scopeRefs(scopeName) {
      return this._extScope.scopeRefs(scopeName, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(varKind, nameOrPrefix, rhs, constant) {
      const name = this._scope.toName(nameOrPrefix);
      if (rhs !== undefined && constant)
        this._constants[name.str] = rhs;
      this._leafNode(new Def(varKind, name, rhs));
      return name;
    }
    const(nameOrPrefix, rhs, _constant) {
      return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
    }
    let(nameOrPrefix, rhs, _constant) {
      return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
    }
    var(nameOrPrefix, rhs, _constant) {
      return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
    }
    assign(lhs, rhs, sideEffects) {
      return this._leafNode(new Assign(lhs, rhs, sideEffects));
    }
    add(lhs, rhs) {
      return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
    }
    code(c) {
      if (typeof c == "function")
        c();
      else if (c !== code_1.nil)
        this._leafNode(new AnyCode(c));
      return this;
    }
    object(...keyValues) {
      const code = ["{"];
      for (const [key, value] of keyValues) {
        if (code.length > 1)
          code.push(",");
        code.push(key);
        if (key !== value || this.opts.es5) {
          code.push(":");
          (0, code_1.addCodeArg)(code, value);
        }
      }
      code.push("}");
      return new code_1._Code(code);
    }
    if(condition, thenBody, elseBody) {
      this._blockNode(new If(condition));
      if (thenBody && elseBody) {
        this.code(thenBody).else().code(elseBody).endIf();
      } else if (thenBody) {
        this.code(thenBody).endIf();
      } else if (elseBody) {
        throw new Error('CodeGen: "else" body without "then" body');
      }
      return this;
    }
    elseIf(condition) {
      return this._elseNode(new If(condition));
    }
    else() {
      return this._elseNode(new Else);
    }
    endIf() {
      return this._endBlockNode(If, Else);
    }
    _for(node, forBody) {
      this._blockNode(node);
      if (forBody)
        this.code(forBody).endFor();
      return this;
    }
    for(iteration, forBody) {
      return this._for(new ForLoop(iteration), forBody);
    }
    forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
      const name = this._scope.toName(nameOrPrefix);
      return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
    }
    forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
      const name = this._scope.toName(nameOrPrefix);
      if (this.opts.es5) {
        const arr = iterable instanceof code_1.Name ? iterable : this.var("_arr", iterable);
        return this.forRange("_i", 0, (0, code_1._)`${arr}.length`, (i2) => {
          this.var(name, (0, code_1._)`${arr}[${i2}]`);
          forBody(name);
        });
      }
      return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
    }
    forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
      if (this.opts.ownProperties) {
        return this.forOf(nameOrPrefix, (0, code_1._)`Object.keys(${obj})`, forBody);
      }
      const name = this._scope.toName(nameOrPrefix);
      return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
    }
    endFor() {
      return this._endBlockNode(For);
    }
    label(label) {
      return this._leafNode(new Label(label));
    }
    break(label) {
      return this._leafNode(new Break(label));
    }
    return(value) {
      const node = new Return;
      this._blockNode(node);
      this.code(value);
      if (node.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(Return);
    }
    try(tryBody, catchCode, finallyCode) {
      if (!catchCode && !finallyCode)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const node = new Try;
      this._blockNode(node);
      this.code(tryBody);
      if (catchCode) {
        const error = this.name("e");
        this._currNode = node.catch = new Catch(error);
        catchCode(error);
      }
      if (finallyCode) {
        this._currNode = node.finally = new Finally;
        this.code(finallyCode);
      }
      return this._endBlockNode(Catch, Finally);
    }
    throw(error) {
      return this._leafNode(new Throw(error));
    }
    block(body, nodeCount) {
      this._blockStarts.push(this._nodes.length);
      if (body)
        this.code(body).endBlock(nodeCount);
      return this;
    }
    endBlock(nodeCount) {
      const len = this._blockStarts.pop();
      if (len === undefined)
        throw new Error("CodeGen: not in self-balancing block");
      const toClose = this._nodes.length - len;
      if (toClose < 0 || nodeCount !== undefined && toClose !== nodeCount) {
        throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
      }
      this._nodes.length = len;
      return this;
    }
    func(name, args = code_1.nil, async, funcBody) {
      this._blockNode(new Func(name, args, async));
      if (funcBody)
        this.code(funcBody).endFunc();
      return this;
    }
    endFunc() {
      return this._endBlockNode(Func);
    }
    optimize(n = 1) {
      while (n-- > 0) {
        this._root.optimizeNodes();
        this._root.optimizeNames(this._root.names, this._constants);
      }
    }
    _leafNode(node) {
      this._currNode.nodes.push(node);
      return this;
    }
    _blockNode(node) {
      this._currNode.nodes.push(node);
      this._nodes.push(node);
    }
    _endBlockNode(N1, N2) {
      const n = this._currNode;
      if (n instanceof N1 || N2 && n instanceof N2) {
        this._nodes.pop();
        return this;
      }
      throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
    }
    _elseNode(node) {
      const n = this._currNode;
      if (!(n instanceof If)) {
        throw new Error('CodeGen: "else" without "if"');
      }
      this._currNode = n.else = node;
      return this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const ns = this._nodes;
      return ns[ns.length - 1];
    }
    set _currNode(node) {
      const ns = this._nodes;
      ns[ns.length - 1] = node;
    }
  }
  exports.CodeGen = CodeGen;
  function addNames(names, from) {
    for (const n in from)
      names[n] = (names[n] || 0) + (from[n] || 0);
    return names;
  }
  function addExprNames(names, from) {
    return from instanceof code_1._CodeOrName ? addNames(names, from.names) : names;
  }
  function optimizeExpr(expr, names, constants) {
    if (expr instanceof code_1.Name)
      return replaceName(expr);
    if (!canOptimize(expr))
      return expr;
    return new code_1._Code(expr._items.reduce((items, c) => {
      if (c instanceof code_1.Name)
        c = replaceName(c);
      if (c instanceof code_1._Code)
        items.push(...c._items);
      else
        items.push(c);
      return items;
    }, []));
    function replaceName(n) {
      const c = constants[n.str];
      if (c === undefined || names[n.str] !== 1)
        return n;
      delete names[n.str];
      return c;
    }
    function canOptimize(e) {
      return e instanceof code_1._Code && e._items.some((c) => c instanceof code_1.Name && names[c.str] === 1 && constants[c.str] !== undefined);
    }
  }
  function subtractNames(names, from) {
    for (const n in from)
      names[n] = (names[n] || 0) - (from[n] || 0);
  }
  function not(x) {
    return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_1._)`!${par(x)}`;
  }
  exports.not = not;
  var andCode = mappend(exports.operators.AND);
  function and(...args) {
    return args.reduce(andCode);
  }
  exports.and = and;
  var orCode = mappend(exports.operators.OR);
  function or(...args) {
    return args.reduce(orCode);
  }
  exports.or = or;
  function mappend(op) {
    return (x, y) => x === code_1.nil ? y : y === code_1.nil ? x : (0, code_1._)`${par(x)} ${op} ${par(y)}`;
  }
  function par(x) {
    return x instanceof code_1.Name ? x : (0, code_1._)`(${x})`;
  }
});

// node_modules/ajv/dist/compile/util.js
var require_util = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.checkStrictMode = exports.getErrorPath = exports.Type = exports.useFunc = exports.setEvaluated = exports.evaluatedPropsToName = exports.mergeEvaluated = exports.eachItem = exports.unescapeJsonPointer = exports.escapeJsonPointer = exports.escapeFragment = exports.unescapeFragment = exports.schemaRefOrVal = exports.schemaHasRulesButRef = exports.schemaHasRules = exports.checkUnknownRules = exports.alwaysValidSchema = exports.toHash = undefined;
  var codegen_1 = require_codegen();
  var code_1 = require_code();
  function toHash(arr) {
    const hash = {};
    for (const item of arr)
      hash[item] = true;
    return hash;
  }
  exports.toHash = toHash;
  function alwaysValidSchema(it, schema2) {
    if (typeof schema2 == "boolean")
      return schema2;
    if (Object.keys(schema2).length === 0)
      return true;
    checkUnknownRules(it, schema2);
    return !schemaHasRules(schema2, it.self.RULES.all);
  }
  exports.alwaysValidSchema = alwaysValidSchema;
  function checkUnknownRules(it, schema2 = it.schema) {
    const { opts, self } = it;
    if (!opts.strictSchema)
      return;
    if (typeof schema2 === "boolean")
      return;
    const rules = self.RULES.keywords;
    for (const key in schema2) {
      if (!rules[key])
        checkStrictMode(it, `unknown keyword: "${key}"`);
    }
  }
  exports.checkUnknownRules = checkUnknownRules;
  function schemaHasRules(schema2, rules) {
    if (typeof schema2 == "boolean")
      return !schema2;
    for (const key in schema2)
      if (rules[key])
        return true;
    return false;
  }
  exports.schemaHasRules = schemaHasRules;
  function schemaHasRulesButRef(schema2, RULES) {
    if (typeof schema2 == "boolean")
      return !schema2;
    for (const key in schema2)
      if (key !== "$ref" && RULES.all[key])
        return true;
    return false;
  }
  exports.schemaHasRulesButRef = schemaHasRulesButRef;
  function schemaRefOrVal({ topSchemaRef, schemaPath }, schema2, keyword, $data) {
    if (!$data) {
      if (typeof schema2 == "number" || typeof schema2 == "boolean")
        return schema2;
      if (typeof schema2 == "string")
        return (0, codegen_1._)`${schema2}`;
    }
    return (0, codegen_1._)`${topSchemaRef}${schemaPath}${(0, codegen_1.getProperty)(keyword)}`;
  }
  exports.schemaRefOrVal = schemaRefOrVal;
  function unescapeFragment(str2) {
    return unescapeJsonPointer(decodeURIComponent(str2));
  }
  exports.unescapeFragment = unescapeFragment;
  function escapeFragment(str2) {
    return encodeURIComponent(escapeJsonPointer(str2));
  }
  exports.escapeFragment = escapeFragment;
  function escapeJsonPointer(str2) {
    if (typeof str2 == "number")
      return `${str2}`;
    return str2.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  exports.escapeJsonPointer = escapeJsonPointer;
  function unescapeJsonPointer(str2) {
    return str2.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  exports.unescapeJsonPointer = unescapeJsonPointer;
  function eachItem(xs, f) {
    if (Array.isArray(xs)) {
      for (const x of xs)
        f(x);
    } else {
      f(xs);
    }
  }
  exports.eachItem = eachItem;
  function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues, resultToName }) {
    return (gen, from, to, toName) => {
      const res = to === undefined ? from : to instanceof codegen_1.Name ? (from instanceof codegen_1.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
      return toName === codegen_1.Name && !(res instanceof codegen_1.Name) ? resultToName(gen, res) : res;
    };
  }
  exports.mergeEvaluated = {
    props: makeMergeEvaluated({
      mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => {
        gen.if((0, codegen_1._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1._)`${to} || {}`).code((0, codegen_1._)`Object.assign(${to}, ${from})`));
      }),
      mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => {
        if (from === true) {
          gen.assign(to, true);
        } else {
          gen.assign(to, (0, codegen_1._)`${to} || {}`);
          setEvaluated(gen, to, from);
        }
      }),
      mergeValues: (from, to) => from === true ? true : { ...from, ...to },
      resultToName: evaluatedPropsToName
    }),
    items: makeMergeEvaluated({
      mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
      mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1._)`${to} > ${from} ? ${to} : ${from}`)),
      mergeValues: (from, to) => from === true ? true : Math.max(from, to),
      resultToName: (gen, items) => gen.var("items", items)
    })
  };
  function evaluatedPropsToName(gen, ps) {
    if (ps === true)
      return gen.var("props", true);
    const props = gen.var("props", (0, codegen_1._)`{}`);
    if (ps !== undefined)
      setEvaluated(gen, props, ps);
    return props;
  }
  exports.evaluatedPropsToName = evaluatedPropsToName;
  function setEvaluated(gen, props, ps) {
    Object.keys(ps).forEach((p) => gen.assign((0, codegen_1._)`${props}${(0, codegen_1.getProperty)(p)}`, true));
  }
  exports.setEvaluated = setEvaluated;
  var snippets = {};
  function useFunc(gen, f) {
    return gen.scopeValue("func", {
      ref: f,
      code: snippets[f.code] || (snippets[f.code] = new code_1._Code(f.code))
    });
  }
  exports.useFunc = useFunc;
  var Type;
  (function(Type2) {
    Type2[Type2["Num"] = 0] = "Num";
    Type2[Type2["Str"] = 1] = "Str";
  })(Type || (exports.Type = Type = {}));
  function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
    if (dataProp instanceof codegen_1.Name) {
      const isNumber = dataPropType === Type.Num;
      return jsPropertySyntax ? isNumber ? (0, codegen_1._)`"[" + ${dataProp} + "]"` : (0, codegen_1._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1._)`"/" + ${dataProp}` : (0, codegen_1._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return jsPropertySyntax ? (0, codegen_1.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
  }
  exports.getErrorPath = getErrorPath;
  function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
    if (!mode)
      return;
    msg = `strict mode: ${msg}`;
    if (mode === true)
      throw new Error(msg);
    it.self.logger.warn(msg);
  }
  exports.checkStrictMode = checkStrictMode;
});

// node_modules/ajv/dist/compile/names.js
var require_names = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var names = {
    data: new codegen_1.Name("data"),
    valCxt: new codegen_1.Name("valCxt"),
    instancePath: new codegen_1.Name("instancePath"),
    parentData: new codegen_1.Name("parentData"),
    parentDataProperty: new codegen_1.Name("parentDataProperty"),
    rootData: new codegen_1.Name("rootData"),
    dynamicAnchors: new codegen_1.Name("dynamicAnchors"),
    vErrors: new codegen_1.Name("vErrors"),
    errors: new codegen_1.Name("errors"),
    this: new codegen_1.Name("this"),
    self: new codegen_1.Name("self"),
    scope: new codegen_1.Name("scope"),
    json: new codegen_1.Name("json"),
    jsonPos: new codegen_1.Name("jsonPos"),
    jsonLen: new codegen_1.Name("jsonLen"),
    jsonPart: new codegen_1.Name("jsonPart")
  };
  exports.default = names;
});

// node_modules/ajv/dist/compile/errors.js
var require_errors = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = undefined;
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var names_1 = require_names();
  exports.keywordError = {
    message: ({ keyword }) => (0, codegen_1.str)`must pass "${keyword}" keyword validation`
  };
  exports.keyword$DataError = {
    message: ({ keyword, schemaType }) => schemaType ? (0, codegen_1.str)`"${keyword}" keyword must be ${schemaType} ($data)` : (0, codegen_1.str)`"${keyword}" keyword is invalid ($data)`
  };
  function reportError(cxt, error = exports.keywordError, errorPaths, overrideAllErrors) {
    const { it } = cxt;
    const { gen, compositeRule, allErrors } = it;
    const errObj = errorObjectCode(cxt, error, errorPaths);
    if (overrideAllErrors !== null && overrideAllErrors !== undefined ? overrideAllErrors : compositeRule || allErrors) {
      addError(gen, errObj);
    } else {
      returnErrors(it, (0, codegen_1._)`[${errObj}]`);
    }
  }
  exports.reportError = reportError;
  function reportExtraError(cxt, error = exports.keywordError, errorPaths) {
    const { it } = cxt;
    const { gen, compositeRule, allErrors } = it;
    const errObj = errorObjectCode(cxt, error, errorPaths);
    addError(gen, errObj);
    if (!(compositeRule || allErrors)) {
      returnErrors(it, names_1.default.vErrors);
    }
  }
  exports.reportExtraError = reportExtraError;
  function resetErrorsCount(gen, errsCount) {
    gen.assign(names_1.default.errors, errsCount);
    gen.if((0, codegen_1._)`${names_1.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_1._)`${names_1.default.vErrors}.length`, errsCount), () => gen.assign(names_1.default.vErrors, null)));
  }
  exports.resetErrorsCount = resetErrorsCount;
  function extendErrors({ gen, keyword, schemaValue, data, errsCount, it }) {
    if (errsCount === undefined)
      throw new Error("ajv implementation error");
    const err = gen.name("err");
    gen.forRange("i", errsCount, names_1.default.errors, (i2) => {
      gen.const(err, (0, codegen_1._)`${names_1.default.vErrors}[${i2}]`);
      gen.if((0, codegen_1._)`${err}.instancePath === undefined`, () => gen.assign((0, codegen_1._)`${err}.instancePath`, (0, codegen_1.strConcat)(names_1.default.instancePath, it.errorPath)));
      gen.assign((0, codegen_1._)`${err}.schemaPath`, (0, codegen_1.str)`${it.errSchemaPath}/${keyword}`);
      if (it.opts.verbose) {
        gen.assign((0, codegen_1._)`${err}.schema`, schemaValue);
        gen.assign((0, codegen_1._)`${err}.data`, data);
      }
    });
  }
  exports.extendErrors = extendErrors;
  function addError(gen, errObj) {
    const err = gen.const("err", errObj);
    gen.if((0, codegen_1._)`${names_1.default.vErrors} === null`, () => gen.assign(names_1.default.vErrors, (0, codegen_1._)`[${err}]`), (0, codegen_1._)`${names_1.default.vErrors}.push(${err})`);
    gen.code((0, codegen_1._)`${names_1.default.errors}++`);
  }
  function returnErrors(it, errs) {
    const { gen, validateName, schemaEnv } = it;
    if (schemaEnv.$async) {
      gen.throw((0, codegen_1._)`new ${it.ValidationError}(${errs})`);
    } else {
      gen.assign((0, codegen_1._)`${validateName}.errors`, errs);
      gen.return(false);
    }
  }
  var E = {
    keyword: new codegen_1.Name("keyword"),
    schemaPath: new codegen_1.Name("schemaPath"),
    params: new codegen_1.Name("params"),
    propertyName: new codegen_1.Name("propertyName"),
    message: new codegen_1.Name("message"),
    schema: new codegen_1.Name("schema"),
    parentSchema: new codegen_1.Name("parentSchema")
  };
  function errorObjectCode(cxt, error, errorPaths) {
    const { createErrors } = cxt.it;
    if (createErrors === false)
      return (0, codegen_1._)`{}`;
    return errorObject(cxt, error, errorPaths);
  }
  function errorObject(cxt, error, errorPaths = {}) {
    const { gen, it } = cxt;
    const keyValues = [
      errorInstancePath(it, errorPaths),
      errorSchemaPath(cxt, errorPaths)
    ];
    extraErrorProps(cxt, error, keyValues);
    return gen.object(...keyValues);
  }
  function errorInstancePath({ errorPath }, { instancePath }) {
    const instPath = instancePath ? (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(instancePath, util_1.Type.Str)}` : errorPath;
    return [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, instPath)];
  }
  function errorSchemaPath({ keyword, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
    let schPath = parentSchema ? errSchemaPath : (0, codegen_1.str)`${errSchemaPath}/${keyword}`;
    if (schemaPath) {
      schPath = (0, codegen_1.str)`${schPath}${(0, util_1.getErrorPath)(schemaPath, util_1.Type.Str)}`;
    }
    return [E.schemaPath, schPath];
  }
  function extraErrorProps(cxt, { params, message }, keyValues) {
    const { keyword, data, schemaValue, it } = cxt;
    const { opts, propertyName, topSchemaRef, schemaPath } = it;
    keyValues.push([E.keyword, keyword], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_1._)`{}`]);
    if (opts.messages) {
      keyValues.push([E.message, typeof message == "function" ? message(cxt) : message]);
    }
    if (opts.verbose) {
      keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_1._)`${topSchemaRef}${schemaPath}`], [names_1.default.data, data]);
    }
    if (propertyName)
      keyValues.push([E.propertyName, propertyName]);
  }
});

// node_modules/ajv/dist/compile/validate/boolSchema.js
var require_boolSchema = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.boolOrEmptySchema = exports.topBoolOrEmptySchema = undefined;
  var errors_1 = require_errors();
  var codegen_1 = require_codegen();
  var names_1 = require_names();
  var boolError = {
    message: "boolean schema is false"
  };
  function topBoolOrEmptySchema(it) {
    const { gen, schema: schema2, validateName } = it;
    if (schema2 === false) {
      falseSchemaError(it, false);
    } else if (typeof schema2 == "object" && schema2.$async === true) {
      gen.return(names_1.default.data);
    } else {
      gen.assign((0, codegen_1._)`${validateName}.errors`, null);
      gen.return(true);
    }
  }
  exports.topBoolOrEmptySchema = topBoolOrEmptySchema;
  function boolOrEmptySchema(it, valid) {
    const { gen, schema: schema2 } = it;
    if (schema2 === false) {
      gen.var(valid, false);
      falseSchemaError(it);
    } else {
      gen.var(valid, true);
    }
  }
  exports.boolOrEmptySchema = boolOrEmptySchema;
  function falseSchemaError(it, overrideAllErrors) {
    const { gen, data } = it;
    const cxt = {
      gen,
      keyword: "false schema",
      data,
      schema: false,
      schemaCode: false,
      schemaValue: false,
      params: {},
      it
    };
    (0, errors_1.reportError)(cxt, boolError, undefined, overrideAllErrors);
  }
});

// node_modules/ajv/dist/compile/rules.js
var require_rules = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getRules = exports.isJSONType = undefined;
  var _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"];
  var jsonTypes = new Set(_jsonTypes);
  function isJSONType(x) {
    return typeof x == "string" && jsonTypes.has(x);
  }
  exports.isJSONType = isJSONType;
  function getRules() {
    const groups = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...groups, integer: true, boolean: true, null: true },
      rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  exports.getRules = getRules;
});

// node_modules/ajv/dist/compile/validate/applicability.js
var require_applicability = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.shouldUseRule = exports.shouldUseGroup = exports.schemaHasRulesForType = undefined;
  function schemaHasRulesForType({ schema: schema2, self }, type2) {
    const group = self.RULES.types[type2];
    return group && group !== true && shouldUseGroup(schema2, group);
  }
  exports.schemaHasRulesForType = schemaHasRulesForType;
  function shouldUseGroup(schema2, group) {
    return group.rules.some((rule) => shouldUseRule(schema2, rule));
  }
  exports.shouldUseGroup = shouldUseGroup;
  function shouldUseRule(schema2, rule) {
    var _a;
    return schema2[rule.keyword] !== undefined || ((_a = rule.definition.implements) === null || _a === undefined ? undefined : _a.some((kwd) => schema2[kwd] !== undefined));
  }
  exports.shouldUseRule = shouldUseRule;
});

// node_modules/ajv/dist/compile/validate/dataType.js
var require_dataType = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.reportTypeError = exports.checkDataTypes = exports.checkDataType = exports.coerceAndCheckDataType = exports.getJSONTypes = exports.getSchemaTypes = exports.DataType = undefined;
  var rules_1 = require_rules();
  var applicability_1 = require_applicability();
  var errors_1 = require_errors();
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var DataType;
  (function(DataType2) {
    DataType2[DataType2["Correct"] = 0] = "Correct";
    DataType2[DataType2["Wrong"] = 1] = "Wrong";
  })(DataType || (exports.DataType = DataType = {}));
  function getSchemaTypes(schema2) {
    const types = getJSONTypes(schema2.type);
    const hasNull = types.includes("null");
    if (hasNull) {
      if (schema2.nullable === false)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!types.length && schema2.nullable !== undefined) {
        throw new Error('"nullable" cannot be used without "type"');
      }
      if (schema2.nullable === true)
        types.push("null");
    }
    return types;
  }
  exports.getSchemaTypes = getSchemaTypes;
  function getJSONTypes(ts) {
    const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
    if (types.every(rules_1.isJSONType))
      return types;
    throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
  }
  exports.getJSONTypes = getJSONTypes;
  function coerceAndCheckDataType(it, types) {
    const { gen, data, opts } = it;
    const coerceTo = coerceToTypes(types, opts.coerceTypes);
    const checkTypes = types.length > 0 && !(coerceTo.length === 0 && types.length === 1 && (0, applicability_1.schemaHasRulesForType)(it, types[0]));
    if (checkTypes) {
      const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType.Wrong);
      gen.if(wrongType, () => {
        if (coerceTo.length)
          coerceData(it, types, coerceTo);
        else
          reportTypeError(it);
      });
    }
    return checkTypes;
  }
  exports.coerceAndCheckDataType = coerceAndCheckDataType;
  var COERCIBLE = new Set(["string", "number", "integer", "boolean", "null"]);
  function coerceToTypes(types, coerceTypes) {
    return coerceTypes ? types.filter((t) => COERCIBLE.has(t) || coerceTypes === "array" && t === "array") : [];
  }
  function coerceData(it, types, coerceTo) {
    const { gen, data, opts } = it;
    const dataType = gen.let("dataType", (0, codegen_1._)`typeof ${data}`);
    const coerced = gen.let("coerced", (0, codegen_1._)`undefined`);
    if (opts.coerceTypes === "array") {
      gen.if((0, codegen_1._)`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1._)`${data}[0]`).assign(dataType, (0, codegen_1._)`typeof ${data}`).if(checkDataTypes(types, data, opts.strictNumbers), () => gen.assign(coerced, data)));
    }
    gen.if((0, codegen_1._)`${coerced} !== undefined`);
    for (const t of coerceTo) {
      if (COERCIBLE.has(t) || t === "array" && opts.coerceTypes === "array") {
        coerceSpecificType(t);
      }
    }
    gen.else();
    reportTypeError(it);
    gen.endIf();
    gen.if((0, codegen_1._)`${coerced} !== undefined`, () => {
      gen.assign(data, coerced);
      assignParentData(it, coerced);
    });
    function coerceSpecificType(t) {
      switch (t) {
        case "string":
          gen.elseIf((0, codegen_1._)`${dataType} == "number" || ${dataType} == "boolean"`).assign(coerced, (0, codegen_1._)`"" + ${data}`).elseIf((0, codegen_1._)`${data} === null`).assign(coerced, (0, codegen_1._)`""`);
          return;
        case "number":
          gen.elseIf((0, codegen_1._)`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1._)`+${data}`);
          return;
        case "integer":
          gen.elseIf((0, codegen_1._)`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1._)`+${data}`);
          return;
        case "boolean":
          gen.elseIf((0, codegen_1._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
          return;
        case "null":
          gen.elseIf((0, codegen_1._)`${data} === "" || ${data} === 0 || ${data} === false`);
          gen.assign(coerced, null);
          return;
        case "array":
          gen.elseIf((0, codegen_1._)`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1._)`[${data}]`);
      }
    }
  }
  function assignParentData({ gen, parentData, parentDataProperty }, expr) {
    gen.if((0, codegen_1._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1._)`${parentData}[${parentDataProperty}]`, expr));
  }
  function checkDataType(dataType, data, strictNums, correct = DataType.Correct) {
    const EQ = correct === DataType.Correct ? codegen_1.operators.EQ : codegen_1.operators.NEQ;
    let cond;
    switch (dataType) {
      case "null":
        return (0, codegen_1._)`${data} ${EQ} null`;
      case "array":
        cond = (0, codegen_1._)`Array.isArray(${data})`;
        break;
      case "object":
        cond = (0, codegen_1._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
        break;
      case "integer":
        cond = numCond((0, codegen_1._)`!(${data} % 1) && !isNaN(${data})`);
        break;
      case "number":
        cond = numCond();
        break;
      default:
        return (0, codegen_1._)`typeof ${data} ${EQ} ${dataType}`;
    }
    return correct === DataType.Correct ? cond : (0, codegen_1.not)(cond);
    function numCond(_cond = codegen_1.nil) {
      return (0, codegen_1.and)((0, codegen_1._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1._)`isFinite(${data})` : codegen_1.nil);
    }
  }
  exports.checkDataType = checkDataType;
  function checkDataTypes(dataTypes, data, strictNums, correct) {
    if (dataTypes.length === 1) {
      return checkDataType(dataTypes[0], data, strictNums, correct);
    }
    let cond;
    const types = (0, util_1.toHash)(dataTypes);
    if (types.array && types.object) {
      const notObj = (0, codegen_1._)`typeof ${data} != "object"`;
      cond = types.null ? notObj : (0, codegen_1._)`!${data} || ${notObj}`;
      delete types.null;
      delete types.array;
      delete types.object;
    } else {
      cond = codegen_1.nil;
    }
    if (types.number)
      delete types.integer;
    for (const t in types)
      cond = (0, codegen_1.and)(cond, checkDataType(t, data, strictNums, correct));
    return cond;
  }
  exports.checkDataTypes = checkDataTypes;
  var typeError = {
    message: ({ schema: schema2 }) => `must be ${schema2}`,
    params: ({ schema: schema2, schemaValue }) => typeof schema2 == "string" ? (0, codegen_1._)`{type: ${schema2}}` : (0, codegen_1._)`{type: ${schemaValue}}`
  };
  function reportTypeError(it) {
    const cxt = getTypeErrorContext(it);
    (0, errors_1.reportError)(cxt, typeError);
  }
  exports.reportTypeError = reportTypeError;
  function getTypeErrorContext(it) {
    const { gen, data, schema: schema2 } = it;
    const schemaCode = (0, util_1.schemaRefOrVal)(it, schema2, "type");
    return {
      gen,
      keyword: "type",
      data,
      schema: schema2.type,
      schemaCode,
      schemaValue: schemaCode,
      parentSchema: schema2,
      params: {},
      it
    };
  }
});

// node_modules/ajv/dist/compile/validate/defaults.js
var require_defaults = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.assignDefaults = undefined;
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  function assignDefaults(it, ty) {
    const { properties, items } = it.schema;
    if (ty === "object" && properties) {
      for (const key in properties) {
        assignDefault(it, key, properties[key].default);
      }
    } else if (ty === "array" && Array.isArray(items)) {
      items.forEach((sch, i2) => assignDefault(it, i2, sch.default));
    }
  }
  exports.assignDefaults = assignDefaults;
  function assignDefault(it, prop, defaultValue) {
    const { gen, compositeRule, data, opts } = it;
    if (defaultValue === undefined)
      return;
    const childData = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(prop)}`;
    if (compositeRule) {
      (0, util_1.checkStrictMode)(it, `default is ignored for: ${childData}`);
      return;
    }
    let condition = (0, codegen_1._)`${childData} === undefined`;
    if (opts.useDefaults === "empty") {
      condition = (0, codegen_1._)`${condition} || ${childData} === null || ${childData} === ""`;
    }
    gen.if(condition, (0, codegen_1._)`${childData} = ${(0, codegen_1.stringify)(defaultValue)}`);
  }
});

// node_modules/ajv/dist/vocabularies/code.js
var require_code2 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.validateUnion = exports.validateArray = exports.usePattern = exports.callValidateCode = exports.schemaProperties = exports.allSchemaProperties = exports.noPropertyInData = exports.propertyInData = exports.isOwnProperty = exports.hasPropFunc = exports.reportMissingProp = exports.checkMissingProp = exports.checkReportMissingProp = undefined;
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var names_1 = require_names();
  var util_2 = require_util();
  function checkReportMissingProp(cxt, prop) {
    const { gen, data, it } = cxt;
    gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
      cxt.setParams({ missingProperty: (0, codegen_1._)`${prop}` }, true);
      cxt.error();
    });
  }
  exports.checkReportMissingProp = checkReportMissingProp;
  function checkMissingProp({ gen, data, it: { opts } }, properties, missing) {
    return (0, codegen_1.or)(...properties.map((prop) => (0, codegen_1.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1._)`${missing} = ${prop}`)));
  }
  exports.checkMissingProp = checkMissingProp;
  function reportMissingProp(cxt, missing) {
    cxt.setParams({ missingProperty: missing }, true);
    cxt.error();
  }
  exports.reportMissingProp = reportMissingProp;
  function hasPropFunc(gen) {
    return gen.scopeValue("func", {
      ref: Object.prototype.hasOwnProperty,
      code: (0, codegen_1._)`Object.prototype.hasOwnProperty`
    });
  }
  exports.hasPropFunc = hasPropFunc;
  function isOwnProperty(gen, data, property) {
    return (0, codegen_1._)`${hasPropFunc(gen)}.call(${data}, ${property})`;
  }
  exports.isOwnProperty = isOwnProperty;
  function propertyInData(gen, data, property, ownProperties) {
    const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
    return ownProperties ? (0, codegen_1._)`${cond} && ${isOwnProperty(gen, data, property)}` : cond;
  }
  exports.propertyInData = propertyInData;
  function noPropertyInData(gen, data, property, ownProperties) {
    const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} === undefined`;
    return ownProperties ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property))) : cond;
  }
  exports.noPropertyInData = noPropertyInData;
  function allSchemaProperties(schemaMap) {
    return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
  }
  exports.allSchemaProperties = allSchemaProperties;
  function schemaProperties(it, schemaMap) {
    return allSchemaProperties(schemaMap).filter((p) => !(0, util_1.alwaysValidSchema)(it, schemaMap[p]));
  }
  exports.schemaProperties = schemaProperties;
  function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
    const dataAndSchema = passSchema ? (0, codegen_1._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
    const valCxt = [
      [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, errorPath)],
      [names_1.default.parentData, it.parentData],
      [names_1.default.parentDataProperty, it.parentDataProperty],
      [names_1.default.rootData, names_1.default.rootData]
    ];
    if (it.opts.dynamicRef)
      valCxt.push([names_1.default.dynamicAnchors, names_1.default.dynamicAnchors]);
    const args = (0, codegen_1._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
    return context !== codegen_1.nil ? (0, codegen_1._)`${func}.call(${context}, ${args})` : (0, codegen_1._)`${func}(${args})`;
  }
  exports.callValidateCode = callValidateCode;
  var newRegExp = (0, codegen_1._)`new RegExp`;
  function usePattern({ gen, it: { opts } }, pattern) {
    const u = opts.unicodeRegExp ? "u" : "";
    const { regExp } = opts.code;
    const rx = regExp(pattern, u);
    return gen.scopeValue("pattern", {
      key: rx.toString(),
      ref: rx,
      code: (0, codegen_1._)`${regExp.code === "new RegExp" ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`
    });
  }
  exports.usePattern = usePattern;
  function validateArray(cxt) {
    const { gen, data, keyword, it } = cxt;
    const valid = gen.name("valid");
    if (it.allErrors) {
      const validArr = gen.let("valid", true);
      validateItems(() => gen.assign(validArr, false));
      return validArr;
    }
    gen.var(valid, true);
    validateItems(() => gen.break());
    return valid;
    function validateItems(notValid) {
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      gen.forRange("i", 0, len, (i2) => {
        cxt.subschema({
          keyword,
          dataProp: i2,
          dataPropType: util_1.Type.Num
        }, valid);
        gen.if((0, codegen_1.not)(valid), notValid);
      });
    }
  }
  exports.validateArray = validateArray;
  function validateUnion(cxt) {
    const { gen, schema: schema2, keyword, it } = cxt;
    if (!Array.isArray(schema2))
      throw new Error("ajv implementation error");
    const alwaysValid = schema2.some((sch) => (0, util_1.alwaysValidSchema)(it, sch));
    if (alwaysValid && !it.opts.unevaluated)
      return;
    const valid = gen.let("valid", false);
    const schValid = gen.name("_valid");
    gen.block(() => schema2.forEach((_sch, i2) => {
      const schCxt = cxt.subschema({
        keyword,
        schemaProp: i2,
        compositeRule: true
      }, schValid);
      gen.assign(valid, (0, codegen_1._)`${valid} || ${schValid}`);
      const merged = cxt.mergeValidEvaluated(schCxt, schValid);
      if (!merged)
        gen.if((0, codegen_1.not)(valid));
    }));
    cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
  }
  exports.validateUnion = validateUnion;
});

// node_modules/ajv/dist/compile/validate/keyword.js
var require_keyword = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.validateKeywordUsage = exports.validSchemaType = exports.funcKeywordCode = exports.macroKeywordCode = undefined;
  var codegen_1 = require_codegen();
  var names_1 = require_names();
  var code_1 = require_code2();
  var errors_1 = require_errors();
  function macroKeywordCode(cxt, def) {
    const { gen, keyword, schema: schema2, parentSchema, it } = cxt;
    const macroSchema = def.macro.call(it.self, schema2, parentSchema, it);
    const schemaRef = useKeyword(gen, keyword, macroSchema);
    if (it.opts.validateSchema !== false)
      it.self.validateSchema(macroSchema, true);
    const valid = gen.name("valid");
    cxt.subschema({
      schema: macroSchema,
      schemaPath: codegen_1.nil,
      errSchemaPath: `${it.errSchemaPath}/${keyword}`,
      topSchemaRef: schemaRef,
      compositeRule: true
    }, valid);
    cxt.pass(valid, () => cxt.error(true));
  }
  exports.macroKeywordCode = macroKeywordCode;
  function funcKeywordCode(cxt, def) {
    var _a;
    const { gen, keyword, schema: schema2, parentSchema, $data, it } = cxt;
    checkAsyncKeyword(it, def);
    const validate = !$data && def.compile ? def.compile.call(it.self, schema2, parentSchema, it) : def.validate;
    const validateRef = useKeyword(gen, keyword, validate);
    const valid = gen.let("valid");
    cxt.block$data(valid, validateKeyword);
    cxt.ok((_a = def.valid) !== null && _a !== undefined ? _a : valid);
    function validateKeyword() {
      if (def.errors === false) {
        assignValid();
        if (def.modifying)
          modifyData(cxt);
        reportErrs(() => cxt.error());
      } else {
        const ruleErrs = def.async ? validateAsync() : validateSync();
        if (def.modifying)
          modifyData(cxt);
        reportErrs(() => addErrs(cxt, ruleErrs));
      }
    }
    function validateAsync() {
      const ruleErrs = gen.let("ruleErrs", null);
      gen.try(() => assignValid((0, codegen_1._)`await `), (e) => gen.assign(valid, false).if((0, codegen_1._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1._)`${e}.errors`), () => gen.throw(e)));
      return ruleErrs;
    }
    function validateSync() {
      const validateErrs = (0, codegen_1._)`${validateRef}.errors`;
      gen.assign(validateErrs, null);
      assignValid(codegen_1.nil);
      return validateErrs;
    }
    function assignValid(_await = def.async ? (0, codegen_1._)`await ` : codegen_1.nil) {
      const passCxt = it.opts.passContext ? names_1.default.this : names_1.default.self;
      const passSchema = !(("compile" in def) && !$data || def.schema === false);
      gen.assign(valid, (0, codegen_1._)`${_await}${(0, code_1.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def.modifying);
    }
    function reportErrs(errors) {
      var _a2;
      gen.if((0, codegen_1.not)((_a2 = def.valid) !== null && _a2 !== undefined ? _a2 : valid), errors);
    }
  }
  exports.funcKeywordCode = funcKeywordCode;
  function modifyData(cxt) {
    const { gen, data, it } = cxt;
    gen.if(it.parentData, () => gen.assign(data, (0, codegen_1._)`${it.parentData}[${it.parentDataProperty}]`));
  }
  function addErrs(cxt, errs) {
    const { gen } = cxt;
    gen.if((0, codegen_1._)`Array.isArray(${errs})`, () => {
      gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`).assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
      (0, errors_1.extendErrors)(cxt);
    }, () => cxt.error());
  }
  function checkAsyncKeyword({ schemaEnv }, def) {
    if (def.async && !schemaEnv.$async)
      throw new Error("async keyword in sync schema");
  }
  function useKeyword(gen, keyword, result) {
    if (result === undefined)
      throw new Error(`keyword "${keyword}" failed to compile`);
    return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1.stringify)(result) });
  }
  function validSchemaType(schema2, schemaType, allowUndefined = false) {
    return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema2) : st === "object" ? schema2 && typeof schema2 == "object" && !Array.isArray(schema2) : typeof schema2 == st || allowUndefined && typeof schema2 == "undefined");
  }
  exports.validSchemaType = validSchemaType;
  function validateKeywordUsage({ schema: schema2, opts, self, errSchemaPath }, def, keyword) {
    if (Array.isArray(def.keyword) ? !def.keyword.includes(keyword) : def.keyword !== keyword) {
      throw new Error("ajv implementation error");
    }
    const deps = def.dependencies;
    if (deps === null || deps === undefined ? undefined : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema2, kwd))) {
      throw new Error(`parent schema must have dependencies of ${keyword}: ${deps.join(",")}`);
    }
    if (def.validateSchema) {
      const valid = def.validateSchema(schema2[keyword]);
      if (!valid) {
        const msg = `keyword "${keyword}" value is invalid at path "${errSchemaPath}": ` + self.errorsText(def.validateSchema.errors);
        if (opts.validateSchema === "log")
          self.logger.error(msg);
        else
          throw new Error(msg);
      }
    }
  }
  exports.validateKeywordUsage = validateKeywordUsage;
});

// node_modules/ajv/dist/compile/validate/subschema.js
var require_subschema = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.extendSubschemaMode = exports.extendSubschemaData = exports.getSubschema = undefined;
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  function getSubschema(it, { keyword, schemaProp, schema: schema2, schemaPath, errSchemaPath, topSchemaRef }) {
    if (keyword !== undefined && schema2 !== undefined) {
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    }
    if (keyword !== undefined) {
      const sch = it.schema[keyword];
      return schemaProp === undefined ? {
        schema: sch,
        schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}`,
        errSchemaPath: `${it.errSchemaPath}/${keyword}`
      } : {
        schema: sch[schemaProp],
        schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}${(0, codegen_1.getProperty)(schemaProp)}`,
        errSchemaPath: `${it.errSchemaPath}/${keyword}/${(0, util_1.escapeFragment)(schemaProp)}`
      };
    }
    if (schema2 !== undefined) {
      if (schemaPath === undefined || errSchemaPath === undefined || topSchemaRef === undefined) {
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      }
      return {
        schema: schema2,
        schemaPath,
        topSchemaRef,
        errSchemaPath
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  exports.getSubschema = getSubschema;
  function extendSubschemaData(subschema, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
    if (data !== undefined && dataProp !== undefined) {
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    }
    const { gen } = it;
    if (dataProp !== undefined) {
      const { errorPath, dataPathArr, opts } = it;
      const nextData = gen.let("data", (0, codegen_1._)`${it.data}${(0, codegen_1.getProperty)(dataProp)}`, true);
      dataContextProps(nextData);
      subschema.errorPath = (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
      subschema.parentDataProperty = (0, codegen_1._)`${dataProp}`;
      subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
    }
    if (data !== undefined) {
      const nextData = data instanceof codegen_1.Name ? data : gen.let("data", data, true);
      dataContextProps(nextData);
      if (propertyName !== undefined)
        subschema.propertyName = propertyName;
    }
    if (dataTypes)
      subschema.dataTypes = dataTypes;
    function dataContextProps(_nextData) {
      subschema.data = _nextData;
      subschema.dataLevel = it.dataLevel + 1;
      subschema.dataTypes = [];
      it.definedProperties = new Set;
      subschema.parentData = it.data;
      subschema.dataNames = [...it.dataNames, _nextData];
    }
  }
  exports.extendSubschemaData = extendSubschemaData;
  function extendSubschemaMode(subschema, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
    if (compositeRule !== undefined)
      subschema.compositeRule = compositeRule;
    if (createErrors !== undefined)
      subschema.createErrors = createErrors;
    if (allErrors !== undefined)
      subschema.allErrors = allErrors;
    subschema.jtdDiscriminator = jtdDiscriminator;
    subschema.jtdMetadata = jtdMetadata;
  }
  exports.extendSubschemaMode = extendSubschemaMode;
});

// node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS((exports, module) => {
  module.exports = function equal(a, b) {
    if (a === b)
      return true;
    if (a && b && typeof a == "object" && typeof b == "object") {
      if (a.constructor !== b.constructor)
        return false;
      var length, i2, keys;
      if (Array.isArray(a)) {
        length = a.length;
        if (length != b.length)
          return false;
        for (i2 = length;i2-- !== 0; )
          if (!equal(a[i2], b[i2]))
            return false;
        return true;
      }
      if (a.constructor === RegExp)
        return a.source === b.source && a.flags === b.flags;
      if (a.valueOf !== Object.prototype.valueOf)
        return a.valueOf() === b.valueOf();
      if (a.toString !== Object.prototype.toString)
        return a.toString() === b.toString();
      keys = Object.keys(a);
      length = keys.length;
      if (length !== Object.keys(b).length)
        return false;
      for (i2 = length;i2-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(b, keys[i2]))
          return false;
      for (i2 = length;i2-- !== 0; ) {
        var key = keys[i2];
        if (!equal(a[key], b[key]))
          return false;
      }
      return true;
    }
    return a !== a && b !== b;
  };
});

// node_modules/json-schema-traverse/index.js
var require_json_schema_traverse = __commonJS((exports, module) => {
  var traverse = module.exports = function(schema2, opts, cb) {
    if (typeof opts == "function") {
      cb = opts;
      opts = {};
    }
    cb = opts.cb || cb;
    var pre = typeof cb == "function" ? cb : cb.pre || function() {};
    var post = cb.post || function() {};
    _traverse(opts, pre, post, schema2, "", schema2);
  };
  traverse.keywords = {
    additionalItems: true,
    items: true,
    contains: true,
    additionalProperties: true,
    propertyNames: true,
    not: true,
    if: true,
    then: true,
    else: true
  };
  traverse.arrayKeywords = {
    items: true,
    allOf: true,
    anyOf: true,
    oneOf: true
  };
  traverse.propsKeywords = {
    $defs: true,
    definitions: true,
    properties: true,
    patternProperties: true,
    dependencies: true
  };
  traverse.skipKeywords = {
    default: true,
    enum: true,
    const: true,
    required: true,
    maximum: true,
    minimum: true,
    exclusiveMaximum: true,
    exclusiveMinimum: true,
    multipleOf: true,
    maxLength: true,
    minLength: true,
    pattern: true,
    format: true,
    maxItems: true,
    minItems: true,
    uniqueItems: true,
    maxProperties: true,
    minProperties: true
  };
  function _traverse(opts, pre, post, schema2, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
    if (schema2 && typeof schema2 == "object" && !Array.isArray(schema2)) {
      pre(schema2, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
      for (var key in schema2) {
        var sch = schema2[key];
        if (Array.isArray(sch)) {
          if (key in traverse.arrayKeywords) {
            for (var i2 = 0;i2 < sch.length; i2++)
              _traverse(opts, pre, post, sch[i2], jsonPtr + "/" + key + "/" + i2, rootSchema, jsonPtr, key, schema2, i2);
          }
        } else if (key in traverse.propsKeywords) {
          if (sch && typeof sch == "object") {
            for (var prop in sch)
              _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema2, prop);
          }
        } else if (key in traverse.keywords || opts.allKeys && !(key in traverse.skipKeywords)) {
          _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema2);
        }
      }
      post(schema2, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    }
  }
  function escapeJsonPtr(str2) {
    return str2.replace(/~/g, "~0").replace(/\//g, "~1");
  }
});

// node_modules/ajv/dist/compile/resolve.js
var require_resolve = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getSchemaRefs = exports.resolveUrl = exports.normalizeId = exports._getFullPath = exports.getFullPath = exports.inlineRef = undefined;
  var util_1 = require_util();
  var equal = require_fast_deep_equal();
  var traverse = require_json_schema_traverse();
  var SIMPLE_INLINED = new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function inlineRef(schema2, limit = true) {
    if (typeof schema2 == "boolean")
      return true;
    if (limit === true)
      return !hasRef(schema2);
    if (!limit)
      return false;
    return countKeys(schema2) <= limit;
  }
  exports.inlineRef = inlineRef;
  var REF_KEYWORDS = new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function hasRef(schema2) {
    for (const key in schema2) {
      if (REF_KEYWORDS.has(key))
        return true;
      const sch = schema2[key];
      if (Array.isArray(sch) && sch.some(hasRef))
        return true;
      if (typeof sch == "object" && hasRef(sch))
        return true;
    }
    return false;
  }
  function countKeys(schema2) {
    let count = 0;
    for (const key in schema2) {
      if (key === "$ref")
        return Infinity;
      count++;
      if (SIMPLE_INLINED.has(key))
        continue;
      if (typeof schema2[key] == "object") {
        (0, util_1.eachItem)(schema2[key], (sch) => count += countKeys(sch));
      }
      if (count === Infinity)
        return Infinity;
    }
    return count;
  }
  function getFullPath(resolver, id = "", normalize) {
    if (normalize !== false)
      id = normalizeId(id);
    const p = resolver.parse(id);
    return _getFullPath(resolver, p);
  }
  exports.getFullPath = getFullPath;
  function _getFullPath(resolver, p) {
    const serialized = resolver.serialize(p);
    return serialized.split("#")[0] + "#";
  }
  exports._getFullPath = _getFullPath;
  var TRAILING_SLASH_HASH = /#\/?$/;
  function normalizeId(id) {
    return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
  }
  exports.normalizeId = normalizeId;
  function resolveUrl(resolver, baseId, id) {
    id = normalizeId(id);
    return resolver.resolve(baseId, id);
  }
  exports.resolveUrl = resolveUrl;
  var ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
  function getSchemaRefs(schema2, baseId) {
    if (typeof schema2 == "boolean")
      return {};
    const { schemaId, uriResolver } = this.opts;
    const schId = normalizeId(schema2[schemaId] || baseId);
    const baseIds = { "": schId };
    const pathPrefix = getFullPath(uriResolver, schId, false);
    const localRefs = {};
    const schemaRefs = new Set;
    traverse(schema2, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
      if (parentJsonPtr === undefined)
        return;
      const fullPath = pathPrefix + jsonPtr;
      let innerBaseId = baseIds[parentJsonPtr];
      if (typeof sch[schemaId] == "string")
        innerBaseId = addRef.call(this, sch[schemaId]);
      addAnchor.call(this, sch.$anchor);
      addAnchor.call(this, sch.$dynamicAnchor);
      baseIds[jsonPtr] = innerBaseId;
      function addRef(ref) {
        const _resolve = this.opts.uriResolver.resolve;
        ref = normalizeId(innerBaseId ? _resolve(innerBaseId, ref) : ref);
        if (schemaRefs.has(ref))
          throw ambiguos(ref);
        schemaRefs.add(ref);
        let schOrRef = this.refs[ref];
        if (typeof schOrRef == "string")
          schOrRef = this.refs[schOrRef];
        if (typeof schOrRef == "object") {
          checkAmbiguosRef(sch, schOrRef.schema, ref);
        } else if (ref !== normalizeId(fullPath)) {
          if (ref[0] === "#") {
            checkAmbiguosRef(sch, localRefs[ref], ref);
            localRefs[ref] = sch;
          } else {
            this.refs[ref] = fullPath;
          }
        }
        return ref;
      }
      function addAnchor(anchor) {
        if (typeof anchor == "string") {
          if (!ANCHOR.test(anchor))
            throw new Error(`invalid anchor "${anchor}"`);
          addRef.call(this, `#${anchor}`);
        }
      }
    });
    return localRefs;
    function checkAmbiguosRef(sch1, sch2, ref) {
      if (sch2 !== undefined && !equal(sch1, sch2))
        throw ambiguos(ref);
    }
    function ambiguos(ref) {
      return new Error(`reference "${ref}" resolves to more than one schema`);
    }
  }
  exports.getSchemaRefs = getSchemaRefs;
});

// node_modules/ajv/dist/compile/validate/index.js
var require_validate = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getData = exports.KeywordCxt = exports.validateFunctionCode = undefined;
  var boolSchema_1 = require_boolSchema();
  var dataType_1 = require_dataType();
  var applicability_1 = require_applicability();
  var dataType_2 = require_dataType();
  var defaults_1 = require_defaults();
  var keyword_1 = require_keyword();
  var subschema_1 = require_subschema();
  var codegen_1 = require_codegen();
  var names_1 = require_names();
  var resolve_1 = require_resolve();
  var util_1 = require_util();
  var errors_1 = require_errors();
  function validateFunctionCode(it) {
    if (isSchemaObj(it)) {
      checkKeywords(it);
      if (schemaCxtHasRules(it)) {
        topSchemaObjCode(it);
        return;
      }
    }
    validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
  }
  exports.validateFunctionCode = validateFunctionCode;
  function validateFunction({ gen, validateName, schema: schema2, schemaEnv, opts }, body) {
    if (opts.code.es5) {
      gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${names_1.default.valCxt}`, schemaEnv.$async, () => {
        gen.code((0, codegen_1._)`"use strict"; ${funcSourceUrl(schema2, opts)}`);
        destructureValCxtES5(gen, opts);
        gen.code(body);
      });
    } else {
      gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema2, opts)).code(body));
    }
  }
  function destructureValCxt(opts) {
    return (0, codegen_1._)`{${names_1.default.instancePath}="", ${names_1.default.parentData}, ${names_1.default.parentDataProperty}, ${names_1.default.rootData}=${names_1.default.data}${opts.dynamicRef ? (0, codegen_1._)`, ${names_1.default.dynamicAnchors}={}` : codegen_1.nil}}={}`;
  }
  function destructureValCxtES5(gen, opts) {
    gen.if(names_1.default.valCxt, () => {
      gen.var(names_1.default.instancePath, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.instancePath}`);
      gen.var(names_1.default.parentData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentData}`);
      gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentDataProperty}`);
      gen.var(names_1.default.rootData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.rootData}`);
      if (opts.dynamicRef)
        gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.dynamicAnchors}`);
    }, () => {
      gen.var(names_1.default.instancePath, (0, codegen_1._)`""`);
      gen.var(names_1.default.parentData, (0, codegen_1._)`undefined`);
      gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`undefined`);
      gen.var(names_1.default.rootData, names_1.default.data);
      if (opts.dynamicRef)
        gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`{}`);
    });
  }
  function topSchemaObjCode(it) {
    const { schema: schema2, opts, gen } = it;
    validateFunction(it, () => {
      if (opts.$comment && schema2.$comment)
        commentKeyword(it);
      checkNoDefault(it);
      gen.let(names_1.default.vErrors, null);
      gen.let(names_1.default.errors, 0);
      if (opts.unevaluated)
        resetEvaluated(it);
      typeAndKeywords(it);
      returnResults(it);
    });
    return;
  }
  function resetEvaluated(it) {
    const { gen, validateName } = it;
    it.evaluated = gen.const("evaluated", (0, codegen_1._)`${validateName}.evaluated`);
    gen.if((0, codegen_1._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1._)`${it.evaluated}.props`, (0, codegen_1._)`undefined`));
    gen.if((0, codegen_1._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1._)`${it.evaluated}.items`, (0, codegen_1._)`undefined`));
  }
  function funcSourceUrl(schema2, opts) {
    const schId = typeof schema2 == "object" && schema2[opts.schemaId];
    return schId && (opts.code.source || opts.code.process) ? (0, codegen_1._)`/*# sourceURL=${schId} */` : codegen_1.nil;
  }
  function subschemaCode(it, valid) {
    if (isSchemaObj(it)) {
      checkKeywords(it);
      if (schemaCxtHasRules(it)) {
        subSchemaObjCode(it, valid);
        return;
      }
    }
    (0, boolSchema_1.boolOrEmptySchema)(it, valid);
  }
  function schemaCxtHasRules({ schema: schema2, self }) {
    if (typeof schema2 == "boolean")
      return !schema2;
    for (const key in schema2)
      if (self.RULES.all[key])
        return true;
    return false;
  }
  function isSchemaObj(it) {
    return typeof it.schema != "boolean";
  }
  function subSchemaObjCode(it, valid) {
    const { schema: schema2, gen, opts } = it;
    if (opts.$comment && schema2.$comment)
      commentKeyword(it);
    updateContext(it);
    checkAsyncSchema(it);
    const errsCount = gen.const("_errs", names_1.default.errors);
    typeAndKeywords(it, errsCount);
    gen.var(valid, (0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
  }
  function checkKeywords(it) {
    (0, util_1.checkUnknownRules)(it);
    checkRefsAndKeywords(it);
  }
  function typeAndKeywords(it, errsCount) {
    if (it.opts.jtd)
      return schemaKeywords(it, [], false, errsCount);
    const types = (0, dataType_1.getSchemaTypes)(it.schema);
    const checkedTypes = (0, dataType_1.coerceAndCheckDataType)(it, types);
    schemaKeywords(it, types, !checkedTypes, errsCount);
  }
  function checkRefsAndKeywords(it) {
    const { schema: schema2, errSchemaPath, opts, self } = it;
    if (schema2.$ref && opts.ignoreKeywordsWithRef && (0, util_1.schemaHasRulesButRef)(schema2, self.RULES)) {
      self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
    }
  }
  function checkNoDefault(it) {
    const { schema: schema2, opts } = it;
    if (schema2.default !== undefined && opts.useDefaults && opts.strictSchema) {
      (0, util_1.checkStrictMode)(it, "default is ignored in the schema root");
    }
  }
  function updateContext(it) {
    const schId = it.schema[it.opts.schemaId];
    if (schId)
      it.baseId = (0, resolve_1.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
  }
  function checkAsyncSchema(it) {
    if (it.schema.$async && !it.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function commentKeyword({ gen, schemaEnv, schema: schema2, errSchemaPath, opts }) {
    const msg = schema2.$comment;
    if (opts.$comment === true) {
      gen.code((0, codegen_1._)`${names_1.default.self}.logger.log(${msg})`);
    } else if (typeof opts.$comment == "function") {
      const schemaPath = (0, codegen_1.str)`${errSchemaPath}/$comment`;
      const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
      gen.code((0, codegen_1._)`${names_1.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
    }
  }
  function returnResults(it) {
    const { gen, schemaEnv, validateName, ValidationError, opts } = it;
    if (schemaEnv.$async) {
      gen.if((0, codegen_1._)`${names_1.default.errors} === 0`, () => gen.return(names_1.default.data), () => gen.throw((0, codegen_1._)`new ${ValidationError}(${names_1.default.vErrors})`));
    } else {
      gen.assign((0, codegen_1._)`${validateName}.errors`, names_1.default.vErrors);
      if (opts.unevaluated)
        assignEvaluated(it);
      gen.return((0, codegen_1._)`${names_1.default.errors} === 0`);
    }
  }
  function assignEvaluated({ gen, evaluated, props, items }) {
    if (props instanceof codegen_1.Name)
      gen.assign((0, codegen_1._)`${evaluated}.props`, props);
    if (items instanceof codegen_1.Name)
      gen.assign((0, codegen_1._)`${evaluated}.items`, items);
  }
  function schemaKeywords(it, types, typeErrors, errsCount) {
    const { gen, schema: schema2, data, allErrors, opts, self } = it;
    const { RULES } = self;
    if (schema2.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1.schemaHasRulesButRef)(schema2, RULES))) {
      gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition));
      return;
    }
    if (!opts.jtd)
      checkStrictTypes(it, types);
    gen.block(() => {
      for (const group of RULES.rules)
        groupKeywords(group);
      groupKeywords(RULES.post);
    });
    function groupKeywords(group) {
      if (!(0, applicability_1.shouldUseGroup)(schema2, group))
        return;
      if (group.type) {
        gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
        iterateKeywords(it, group);
        if (types.length === 1 && types[0] === group.type && typeErrors) {
          gen.else();
          (0, dataType_2.reportTypeError)(it);
        }
        gen.endIf();
      } else {
        iterateKeywords(it, group);
      }
      if (!allErrors)
        gen.if((0, codegen_1._)`${names_1.default.errors} === ${errsCount || 0}`);
    }
  }
  function iterateKeywords(it, group) {
    const { gen, schema: schema2, opts: { useDefaults } } = it;
    if (useDefaults)
      (0, defaults_1.assignDefaults)(it, group.type);
    gen.block(() => {
      for (const rule of group.rules) {
        if ((0, applicability_1.shouldUseRule)(schema2, rule)) {
          keywordCode(it, rule.keyword, rule.definition, group.type);
        }
      }
    });
  }
  function checkStrictTypes(it, types) {
    if (it.schemaEnv.meta || !it.opts.strictTypes)
      return;
    checkContextTypes(it, types);
    if (!it.opts.allowUnionTypes)
      checkMultipleTypes(it, types);
    checkKeywordTypes(it, it.dataTypes);
  }
  function checkContextTypes(it, types) {
    if (!types.length)
      return;
    if (!it.dataTypes.length) {
      it.dataTypes = types;
      return;
    }
    types.forEach((t) => {
      if (!includesType(it.dataTypes, t)) {
        strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
      }
    });
    narrowSchemaTypes(it, types);
  }
  function checkMultipleTypes(it, ts) {
    if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
      strictTypesError(it, "use allowUnionTypes to allow union type keyword");
    }
  }
  function checkKeywordTypes(it, ts) {
    const rules = it.self.RULES.all;
    for (const keyword in rules) {
      const rule = rules[keyword];
      if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
        const { type: type2 } = rule.definition;
        if (type2.length && !type2.some((t) => hasApplicableType(ts, t))) {
          strictTypesError(it, `missing type "${type2.join(",")}" for keyword "${keyword}"`);
        }
      }
    }
  }
  function hasApplicableType(schTs, kwdT) {
    return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
  }
  function includesType(ts, t) {
    return ts.includes(t) || t === "integer" && ts.includes("number");
  }
  function narrowSchemaTypes(it, withTypes) {
    const ts = [];
    for (const t of it.dataTypes) {
      if (includesType(withTypes, t))
        ts.push(t);
      else if (withTypes.includes("integer") && t === "number")
        ts.push("integer");
    }
    it.dataTypes = ts;
  }
  function strictTypesError(it, msg) {
    const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
    msg += ` at "${schemaPath}" (strictTypes)`;
    (0, util_1.checkStrictMode)(it, msg, it.opts.strictTypes);
  }

  class KeywordCxt {
    constructor(it, def, keyword) {
      (0, keyword_1.validateKeywordUsage)(it, def, keyword);
      this.gen = it.gen;
      this.allErrors = it.allErrors;
      this.keyword = keyword;
      this.data = it.data;
      this.schema = it.schema[keyword];
      this.$data = def.$data && it.opts.$data && this.schema && this.schema.$data;
      this.schemaValue = (0, util_1.schemaRefOrVal)(it, this.schema, keyword, this.$data);
      this.schemaType = def.schemaType;
      this.parentSchema = it.schema;
      this.params = {};
      this.it = it;
      this.def = def;
      if (this.$data) {
        this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
      } else {
        this.schemaCode = this.schemaValue;
        if (!(0, keyword_1.validSchemaType)(this.schema, def.schemaType, def.allowUndefined)) {
          throw new Error(`${keyword} value must be ${JSON.stringify(def.schemaType)}`);
        }
      }
      if ("code" in def ? def.trackErrors : def.errors !== false) {
        this.errsCount = it.gen.const("_errs", names_1.default.errors);
      }
    }
    result(condition, successAction, failAction) {
      this.failResult((0, codegen_1.not)(condition), successAction, failAction);
    }
    failResult(condition, successAction, failAction) {
      this.gen.if(condition);
      if (failAction)
        failAction();
      else
        this.error();
      if (successAction) {
        this.gen.else();
        successAction();
        if (this.allErrors)
          this.gen.endIf();
      } else {
        if (this.allErrors)
          this.gen.endIf();
        else
          this.gen.else();
      }
    }
    pass(condition, failAction) {
      this.failResult((0, codegen_1.not)(condition), undefined, failAction);
    }
    fail(condition) {
      if (condition === undefined) {
        this.error();
        if (!this.allErrors)
          this.gen.if(false);
        return;
      }
      this.gen.if(condition);
      this.error();
      if (this.allErrors)
        this.gen.endIf();
      else
        this.gen.else();
    }
    fail$data(condition) {
      if (!this.$data)
        return this.fail(condition);
      const { schemaCode } = this;
      this.fail((0, codegen_1._)`${schemaCode} !== undefined && (${(0, codegen_1.or)(this.invalid$data(), condition)})`);
    }
    error(append, errorParams, errorPaths) {
      if (errorParams) {
        this.setParams(errorParams);
        this._error(append, errorPaths);
        this.setParams({});
        return;
      }
      this._error(append, errorPaths);
    }
    _error(append, errorPaths) {
      (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
    }
    $dataError() {
      (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
    }
    reset() {
      if (this.errsCount === undefined)
        throw new Error('add "trackErrors" to keyword definition');
      (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(cond) {
      if (!this.allErrors)
        this.gen.if(cond);
    }
    setParams(obj, assign) {
      if (assign)
        Object.assign(this.params, obj);
      else
        this.params = obj;
    }
    block$data(valid, codeBlock, $dataValid = codegen_1.nil) {
      this.gen.block(() => {
        this.check$data(valid, $dataValid);
        codeBlock();
      });
    }
    check$data(valid = codegen_1.nil, $dataValid = codegen_1.nil) {
      if (!this.$data)
        return;
      const { gen, schemaCode, schemaType, def } = this;
      gen.if((0, codegen_1.or)((0, codegen_1._)`${schemaCode} === undefined`, $dataValid));
      if (valid !== codegen_1.nil)
        gen.assign(valid, true);
      if (schemaType.length || def.validateSchema) {
        gen.elseIf(this.invalid$data());
        this.$dataError();
        if (valid !== codegen_1.nil)
          gen.assign(valid, false);
      }
      gen.else();
    }
    invalid$data() {
      const { gen, schemaCode, schemaType, def, it } = this;
      return (0, codegen_1.or)(wrong$DataType(), invalid$DataSchema());
      function wrong$DataType() {
        if (schemaType.length) {
          if (!(schemaCode instanceof codegen_1.Name))
            throw new Error("ajv implementation error");
          const st = Array.isArray(schemaType) ? schemaType : [schemaType];
          return (0, codegen_1._)`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
        }
        return codegen_1.nil;
      }
      function invalid$DataSchema() {
        if (def.validateSchema) {
          const validateSchemaRef = gen.scopeValue("validate$data", { ref: def.validateSchema });
          return (0, codegen_1._)`!${validateSchemaRef}(${schemaCode})`;
        }
        return codegen_1.nil;
      }
    }
    subschema(appl, valid) {
      const subschema = (0, subschema_1.getSubschema)(this.it, appl);
      (0, subschema_1.extendSubschemaData)(subschema, this.it, appl);
      (0, subschema_1.extendSubschemaMode)(subschema, appl);
      const nextContext = { ...this.it, ...subschema, items: undefined, props: undefined };
      subschemaCode(nextContext, valid);
      return nextContext;
    }
    mergeEvaluated(schemaCxt, toName) {
      const { it, gen } = this;
      if (!it.opts.unevaluated)
        return;
      if (it.props !== true && schemaCxt.props !== undefined) {
        it.props = util_1.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
      }
      if (it.items !== true && schemaCxt.items !== undefined) {
        it.items = util_1.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
      }
    }
    mergeValidEvaluated(schemaCxt, valid) {
      const { it, gen } = this;
      if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
        gen.if(valid, () => this.mergeEvaluated(schemaCxt, codegen_1.Name));
        return true;
      }
    }
  }
  exports.KeywordCxt = KeywordCxt;
  function keywordCode(it, keyword, def, ruleType) {
    const cxt = new KeywordCxt(it, def, keyword);
    if ("code" in def) {
      def.code(cxt, ruleType);
    } else if (cxt.$data && def.validate) {
      (0, keyword_1.funcKeywordCode)(cxt, def);
    } else if ("macro" in def) {
      (0, keyword_1.macroKeywordCode)(cxt, def);
    } else if (def.compile || def.validate) {
      (0, keyword_1.funcKeywordCode)(cxt, def);
    }
  }
  var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
  var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function getData($data, { dataLevel, dataNames, dataPathArr }) {
    let jsonPointer;
    let data;
    if ($data === "")
      return names_1.default.rootData;
    if ($data[0] === "/") {
      if (!JSON_POINTER.test($data))
        throw new Error(`Invalid JSON-pointer: ${$data}`);
      jsonPointer = $data;
      data = names_1.default.rootData;
    } else {
      const matches = RELATIVE_JSON_POINTER.exec($data);
      if (!matches)
        throw new Error(`Invalid JSON-pointer: ${$data}`);
      const up = +matches[1];
      jsonPointer = matches[2];
      if (jsonPointer === "#") {
        if (up >= dataLevel)
          throw new Error(errorMsg("property/index", up));
        return dataPathArr[dataLevel - up];
      }
      if (up > dataLevel)
        throw new Error(errorMsg("data", up));
      data = dataNames[dataLevel - up];
      if (!jsonPointer)
        return data;
    }
    let expr = data;
    const segments = jsonPointer.split("/");
    for (const segment of segments) {
      if (segment) {
        data = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)((0, util_1.unescapeJsonPointer)(segment))}`;
        expr = (0, codegen_1._)`${expr} && ${data}`;
      }
    }
    return expr;
    function errorMsg(pointerType, up) {
      return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
    }
  }
  exports.getData = getData;
});

// node_modules/ajv/dist/runtime/validation_error.js
var require_validation_error = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });

  class ValidationError extends Error {
    constructor(errors) {
      super("validation failed");
      this.errors = errors;
      this.ajv = this.validation = true;
    }
  }
  exports.default = ValidationError;
});

// node_modules/ajv/dist/compile/ref_error.js
var require_ref_error = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var resolve_1 = require_resolve();

  class MissingRefError extends Error {
    constructor(resolver, baseId, ref, msg) {
      super(msg || `can't resolve reference ${ref} from id ${baseId}`);
      this.missingRef = (0, resolve_1.resolveUrl)(resolver, baseId, ref);
      this.missingSchema = (0, resolve_1.normalizeId)((0, resolve_1.getFullPath)(resolver, this.missingRef));
    }
  }
  exports.default = MissingRefError;
});

// node_modules/ajv/dist/compile/index.js
var require_compile = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.resolveSchema = exports.getCompilingSchema = exports.resolveRef = exports.compileSchema = exports.SchemaEnv = undefined;
  var codegen_1 = require_codegen();
  var validation_error_1 = require_validation_error();
  var names_1 = require_names();
  var resolve_1 = require_resolve();
  var util_1 = require_util();
  var validate_1 = require_validate();

  class SchemaEnv {
    constructor(env) {
      var _a;
      this.refs = {};
      this.dynamicAnchors = {};
      let schema2;
      if (typeof env.schema == "object")
        schema2 = env.schema;
      this.schema = env.schema;
      this.schemaId = env.schemaId;
      this.root = env.root || this;
      this.baseId = (_a = env.baseId) !== null && _a !== undefined ? _a : (0, resolve_1.normalizeId)(schema2 === null || schema2 === undefined ? undefined : schema2[env.schemaId || "$id"]);
      this.schemaPath = env.schemaPath;
      this.localRefs = env.localRefs;
      this.meta = env.meta;
      this.$async = schema2 === null || schema2 === undefined ? undefined : schema2.$async;
      this.refs = {};
    }
  }
  exports.SchemaEnv = SchemaEnv;
  function compileSchema(sch) {
    const _sch = getCompilingSchema.call(this, sch);
    if (_sch)
      return _sch;
    const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId);
    const { es5, lines } = this.opts.code;
    const { ownProperties } = this.opts;
    const gen = new codegen_1.CodeGen(this.scope, { es5, lines, ownProperties });
    let _ValidationError;
    if (sch.$async) {
      _ValidationError = gen.scopeValue("Error", {
        ref: validation_error_1.default,
        code: (0, codegen_1._)`require("ajv/dist/runtime/validation_error").default`
      });
    }
    const validateName = gen.scopeName("validate");
    sch.validateName = validateName;
    const schemaCxt = {
      gen,
      allErrors: this.opts.allErrors,
      data: names_1.default.data,
      parentData: names_1.default.parentData,
      parentDataProperty: names_1.default.parentDataProperty,
      dataNames: [names_1.default.data],
      dataPathArr: [codegen_1.nil],
      dataLevel: 0,
      dataTypes: [],
      definedProperties: new Set,
      topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? { ref: sch.schema, code: (0, codegen_1.stringify)(sch.schema) } : { ref: sch.schema }),
      validateName,
      ValidationError: _ValidationError,
      schema: sch.schema,
      schemaEnv: sch,
      rootId,
      baseId: sch.baseId || rootId,
      schemaPath: codegen_1.nil,
      errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, codegen_1._)`""`,
      opts: this.opts,
      self: this
    };
    let sourceCode;
    try {
      this._compilations.add(sch);
      (0, validate_1.validateFunctionCode)(schemaCxt);
      gen.optimize(this.opts.code.optimize);
      const validateCode = gen.toString();
      sourceCode = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`;
      if (this.opts.code.process)
        sourceCode = this.opts.code.process(sourceCode, sch);
      const makeValidate = new Function(`${names_1.default.self}`, `${names_1.default.scope}`, sourceCode);
      const validate = makeValidate(this, this.scope.get());
      this.scope.value(validateName, { ref: validate });
      validate.errors = null;
      validate.schema = sch.schema;
      validate.schemaEnv = sch;
      if (sch.$async)
        validate.$async = true;
      if (this.opts.code.source === true) {
        validate.source = { validateName, validateCode, scopeValues: gen._values };
      }
      if (this.opts.unevaluated) {
        const { props, items } = schemaCxt;
        validate.evaluated = {
          props: props instanceof codegen_1.Name ? undefined : props,
          items: items instanceof codegen_1.Name ? undefined : items,
          dynamicProps: props instanceof codegen_1.Name,
          dynamicItems: items instanceof codegen_1.Name
        };
        if (validate.source)
          validate.source.evaluated = (0, codegen_1.stringify)(validate.evaluated);
      }
      sch.validate = validate;
      return sch;
    } catch (e) {
      delete sch.validate;
      delete sch.validateName;
      if (sourceCode)
        this.logger.error("Error compiling schema, function code:", sourceCode);
      throw e;
    } finally {
      this._compilations.delete(sch);
    }
  }
  exports.compileSchema = compileSchema;
  function resolveRef(root, baseId, ref) {
    var _a;
    ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref);
    const schOrFunc = root.refs[ref];
    if (schOrFunc)
      return schOrFunc;
    let _sch = resolve.call(this, root, ref);
    if (_sch === undefined) {
      const schema2 = (_a = root.localRefs) === null || _a === undefined ? undefined : _a[ref];
      const { schemaId } = this.opts;
      if (schema2)
        _sch = new SchemaEnv({ schema: schema2, schemaId, root, baseId });
    }
    if (_sch === undefined)
      return;
    return root.refs[ref] = inlineOrCompile.call(this, _sch);
  }
  exports.resolveRef = resolveRef;
  function inlineOrCompile(sch) {
    if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs))
      return sch.schema;
    return sch.validate ? sch : compileSchema.call(this, sch);
  }
  function getCompilingSchema(schEnv) {
    for (const sch of this._compilations) {
      if (sameSchemaEnv(sch, schEnv))
        return sch;
    }
  }
  exports.getCompilingSchema = getCompilingSchema;
  function sameSchemaEnv(s1, s2) {
    return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
  }
  function resolve(root, ref) {
    let sch;
    while (typeof (sch = this.refs[ref]) == "string")
      ref = sch;
    return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
  }
  function resolveSchema(root, ref) {
    const p = this.opts.uriResolver.parse(ref);
    const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p);
    let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, undefined);
    if (Object.keys(root.schema).length > 0 && refPath === baseId) {
      return getJsonPointer.call(this, p, root);
    }
    const id = (0, resolve_1.normalizeId)(refPath);
    const schOrRef = this.refs[id] || this.schemas[id];
    if (typeof schOrRef == "string") {
      const sch = resolveSchema.call(this, root, schOrRef);
      if (typeof (sch === null || sch === undefined ? undefined : sch.schema) !== "object")
        return;
      return getJsonPointer.call(this, p, sch);
    }
    if (typeof (schOrRef === null || schOrRef === undefined ? undefined : schOrRef.schema) !== "object")
      return;
    if (!schOrRef.validate)
      compileSchema.call(this, schOrRef);
    if (id === (0, resolve_1.normalizeId)(ref)) {
      const { schema: schema2 } = schOrRef;
      const { schemaId } = this.opts;
      const schId = schema2[schemaId];
      if (schId)
        baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
      return new SchemaEnv({ schema: schema2, schemaId, root, baseId });
    }
    return getJsonPointer.call(this, p, schOrRef);
  }
  exports.resolveSchema = resolveSchema;
  var PREVENT_SCOPE_CHANGE = new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function getJsonPointer(parsedRef, { baseId, schema: schema2, root }) {
    var _a;
    if (((_a = parsedRef.fragment) === null || _a === undefined ? undefined : _a[0]) !== "/")
      return;
    for (const part of parsedRef.fragment.slice(1).split("/")) {
      if (typeof schema2 === "boolean")
        return;
      const partSchema = schema2[(0, util_1.unescapeFragment)(part)];
      if (partSchema === undefined)
        return;
      schema2 = partSchema;
      const schId = typeof schema2 === "object" && schema2[this.opts.schemaId];
      if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
        baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
      }
    }
    let env;
    if (typeof schema2 != "boolean" && schema2.$ref && !(0, util_1.schemaHasRulesButRef)(schema2, this.RULES)) {
      const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema2.$ref);
      env = resolveSchema.call(this, root, $ref);
    }
    const { schemaId } = this.opts;
    env = env || new SchemaEnv({ schema: schema2, schemaId, root, baseId });
    if (env.schema !== env.root.schema)
      return env;
    return;
  }
});

// node_modules/ajv/dist/refs/data.json
var require_data = __commonJS((exports, module) => {
  module.exports = {
    $id: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
    description: "Meta-schema for $data reference (JSON AnySchema extension proposal)",
    type: "object",
    required: ["$data"],
    properties: {
      $data: {
        type: "string",
        anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }]
      }
    },
    additionalProperties: false
  };
});

// node_modules/fast-uri/lib/utils.js
var require_utils = __commonJS((exports, module) => {
  var isUUID = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu);
  var isIPv4 = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function stringArrayToHexStripped(input) {
    let acc = "";
    let code = 0;
    let i2 = 0;
    for (i2 = 0;i2 < input.length; i2++) {
      code = input[i2].charCodeAt(0);
      if (code === 48) {
        continue;
      }
      if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
        return "";
      }
      acc += input[i2];
      break;
    }
    for (i2 += 1;i2 < input.length; i2++) {
      code = input[i2].charCodeAt(0);
      if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
        return "";
      }
      acc += input[i2];
    }
    return acc;
  }
  var nonSimpleDomain = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function consumeIsZone(buffer) {
    buffer.length = 0;
    return true;
  }
  function consumeHextets(buffer, address, output) {
    if (buffer.length) {
      const hex = stringArrayToHexStripped(buffer);
      if (hex !== "") {
        address.push(hex);
      } else {
        output.error = true;
        return false;
      }
      buffer.length = 0;
    }
    return true;
  }
  function getIPV6(input) {
    let tokenCount = 0;
    const output = { error: false, address: "", zone: "" };
    const address = [];
    const buffer = [];
    let endipv6Encountered = false;
    let endIpv6 = false;
    let consume = consumeHextets;
    for (let i2 = 0;i2 < input.length; i2++) {
      const cursor = input[i2];
      if (cursor === "[" || cursor === "]") {
        continue;
      }
      if (cursor === ":") {
        if (endipv6Encountered === true) {
          endIpv6 = true;
        }
        if (!consume(buffer, address, output)) {
          break;
        }
        if (++tokenCount > 7) {
          output.error = true;
          break;
        }
        if (i2 > 0 && input[i2 - 1] === ":") {
          endipv6Encountered = true;
        }
        address.push(":");
        continue;
      } else if (cursor === "%") {
        if (!consume(buffer, address, output)) {
          break;
        }
        consume = consumeIsZone;
      } else {
        buffer.push(cursor);
        continue;
      }
    }
    if (buffer.length) {
      if (consume === consumeIsZone) {
        output.zone = buffer.join("");
      } else if (endIpv6) {
        address.push(buffer.join(""));
      } else {
        address.push(stringArrayToHexStripped(buffer));
      }
    }
    output.address = address.join("");
    return output;
  }
  function normalizeIPv6(host) {
    if (findToken(host, ":") < 2) {
      return { host, isIPV6: false };
    }
    const ipv6 = getIPV6(host);
    if (!ipv6.error) {
      let newHost = ipv6.address;
      let escapedHost = ipv6.address;
      if (ipv6.zone) {
        newHost += "%" + ipv6.zone;
        escapedHost += "%25" + ipv6.zone;
      }
      return { host: newHost, isIPV6: true, escapedHost };
    } else {
      return { host, isIPV6: false };
    }
  }
  function findToken(str2, token) {
    let ind = 0;
    for (let i2 = 0;i2 < str2.length; i2++) {
      if (str2[i2] === token)
        ind++;
    }
    return ind;
  }
  function removeDotSegments(path2) {
    let input = path2;
    const output = [];
    let nextSlash = -1;
    let len = 0;
    while (len = input.length) {
      if (len === 1) {
        if (input === ".") {
          break;
        } else if (input === "/") {
          output.push("/");
          break;
        } else {
          output.push(input);
          break;
        }
      } else if (len === 2) {
        if (input[0] === ".") {
          if (input[1] === ".") {
            break;
          } else if (input[1] === "/") {
            input = input.slice(2);
            continue;
          }
        } else if (input[0] === "/") {
          if (input[1] === "." || input[1] === "/") {
            output.push("/");
            break;
          }
        }
      } else if (len === 3) {
        if (input === "/..") {
          if (output.length !== 0) {
            output.pop();
          }
          output.push("/");
          break;
        }
      }
      if (input[0] === ".") {
        if (input[1] === ".") {
          if (input[2] === "/") {
            input = input.slice(3);
            continue;
          }
        } else if (input[1] === "/") {
          input = input.slice(2);
          continue;
        }
      } else if (input[0] === "/") {
        if (input[1] === ".") {
          if (input[2] === "/") {
            input = input.slice(2);
            continue;
          } else if (input[2] === ".") {
            if (input[3] === "/") {
              input = input.slice(3);
              if (output.length !== 0) {
                output.pop();
              }
              continue;
            }
          }
        }
      }
      if ((nextSlash = input.indexOf("/", 1)) === -1) {
        output.push(input);
        break;
      } else {
        output.push(input.slice(0, nextSlash));
        input = input.slice(nextSlash);
      }
    }
    return output.join("");
  }
  function normalizeComponentEncoding(component, esc) {
    const func = esc !== true ? escape : unescape;
    if (component.scheme !== undefined) {
      component.scheme = func(component.scheme);
    }
    if (component.userinfo !== undefined) {
      component.userinfo = func(component.userinfo);
    }
    if (component.host !== undefined) {
      component.host = func(component.host);
    }
    if (component.path !== undefined) {
      component.path = func(component.path);
    }
    if (component.query !== undefined) {
      component.query = func(component.query);
    }
    if (component.fragment !== undefined) {
      component.fragment = func(component.fragment);
    }
    return component;
  }
  function recomposeAuthority(component) {
    const uriTokens = [];
    if (component.userinfo !== undefined) {
      uriTokens.push(component.userinfo);
      uriTokens.push("@");
    }
    if (component.host !== undefined) {
      let host = unescape(component.host);
      if (!isIPv4(host)) {
        const ipV6res = normalizeIPv6(host);
        if (ipV6res.isIPV6 === true) {
          host = `[${ipV6res.escapedHost}]`;
        } else {
          host = component.host;
        }
      }
      uriTokens.push(host);
    }
    if (typeof component.port === "number" || typeof component.port === "string") {
      uriTokens.push(":");
      uriTokens.push(String(component.port));
    }
    return uriTokens.length ? uriTokens.join("") : undefined;
  }
  module.exports = {
    nonSimpleDomain,
    recomposeAuthority,
    normalizeComponentEncoding,
    removeDotSegments,
    isIPv4,
    isUUID,
    normalizeIPv6,
    stringArrayToHexStripped
  };
});

// node_modules/fast-uri/lib/schemes.js
var require_schemes = __commonJS((exports, module) => {
  var { isUUID } = require_utils();
  var URN_REG = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
  var supportedSchemeNames = [
    "http",
    "https",
    "ws",
    "wss",
    "urn",
    "urn:uuid"
  ];
  function isValidSchemeName(name) {
    return supportedSchemeNames.indexOf(name) !== -1;
  }
  function wsIsSecure(wsComponent) {
    if (wsComponent.secure === true) {
      return true;
    } else if (wsComponent.secure === false) {
      return false;
    } else if (wsComponent.scheme) {
      return wsComponent.scheme.length === 3 && (wsComponent.scheme[0] === "w" || wsComponent.scheme[0] === "W") && (wsComponent.scheme[1] === "s" || wsComponent.scheme[1] === "S") && (wsComponent.scheme[2] === "s" || wsComponent.scheme[2] === "S");
    } else {
      return false;
    }
  }
  function httpParse(component) {
    if (!component.host) {
      component.error = component.error || "HTTP URIs must have a host.";
    }
    return component;
  }
  function httpSerialize(component) {
    const secure = String(component.scheme).toLowerCase() === "https";
    if (component.port === (secure ? 443 : 80) || component.port === "") {
      component.port = undefined;
    }
    if (!component.path) {
      component.path = "/";
    }
    return component;
  }
  function wsParse(wsComponent) {
    wsComponent.secure = wsIsSecure(wsComponent);
    wsComponent.resourceName = (wsComponent.path || "/") + (wsComponent.query ? "?" + wsComponent.query : "");
    wsComponent.path = undefined;
    wsComponent.query = undefined;
    return wsComponent;
  }
  function wsSerialize(wsComponent) {
    if (wsComponent.port === (wsIsSecure(wsComponent) ? 443 : 80) || wsComponent.port === "") {
      wsComponent.port = undefined;
    }
    if (typeof wsComponent.secure === "boolean") {
      wsComponent.scheme = wsComponent.secure ? "wss" : "ws";
      wsComponent.secure = undefined;
    }
    if (wsComponent.resourceName) {
      const [path2, query] = wsComponent.resourceName.split("?");
      wsComponent.path = path2 && path2 !== "/" ? path2 : undefined;
      wsComponent.query = query;
      wsComponent.resourceName = undefined;
    }
    wsComponent.fragment = undefined;
    return wsComponent;
  }
  function urnParse(urnComponent, options) {
    if (!urnComponent.path) {
      urnComponent.error = "URN can not be parsed";
      return urnComponent;
    }
    const matches = urnComponent.path.match(URN_REG);
    if (matches) {
      const scheme = options.scheme || urnComponent.scheme || "urn";
      urnComponent.nid = matches[1].toLowerCase();
      urnComponent.nss = matches[2];
      const urnScheme = `${scheme}:${options.nid || urnComponent.nid}`;
      const schemeHandler = getSchemeHandler(urnScheme);
      urnComponent.path = undefined;
      if (schemeHandler) {
        urnComponent = schemeHandler.parse(urnComponent, options);
      }
    } else {
      urnComponent.error = urnComponent.error || "URN can not be parsed.";
    }
    return urnComponent;
  }
  function urnSerialize(urnComponent, options) {
    if (urnComponent.nid === undefined) {
      throw new Error("URN without nid cannot be serialized");
    }
    const scheme = options.scheme || urnComponent.scheme || "urn";
    const nid = urnComponent.nid.toLowerCase();
    const urnScheme = `${scheme}:${options.nid || nid}`;
    const schemeHandler = getSchemeHandler(urnScheme);
    if (schemeHandler) {
      urnComponent = schemeHandler.serialize(urnComponent, options);
    }
    const uriComponent = urnComponent;
    const nss = urnComponent.nss;
    uriComponent.path = `${nid || options.nid}:${nss}`;
    options.skipEscape = true;
    return uriComponent;
  }
  function urnuuidParse(urnComponent, options) {
    const uuidComponent = urnComponent;
    uuidComponent.uuid = uuidComponent.nss;
    uuidComponent.nss = undefined;
    if (!options.tolerant && (!uuidComponent.uuid || !isUUID(uuidComponent.uuid))) {
      uuidComponent.error = uuidComponent.error || "UUID is not valid.";
    }
    return uuidComponent;
  }
  function urnuuidSerialize(uuidComponent) {
    const urnComponent = uuidComponent;
    urnComponent.nss = (uuidComponent.uuid || "").toLowerCase();
    return urnComponent;
  }
  var http = {
    scheme: "http",
    domainHost: true,
    parse: httpParse,
    serialize: httpSerialize
  };
  var https = {
    scheme: "https",
    domainHost: http.domainHost,
    parse: httpParse,
    serialize: httpSerialize
  };
  var ws = {
    scheme: "ws",
    domainHost: true,
    parse: wsParse,
    serialize: wsSerialize
  };
  var wss = {
    scheme: "wss",
    domainHost: ws.domainHost,
    parse: ws.parse,
    serialize: ws.serialize
  };
  var urn = {
    scheme: "urn",
    parse: urnParse,
    serialize: urnSerialize,
    skipNormalize: true
  };
  var urnuuid = {
    scheme: "urn:uuid",
    parse: urnuuidParse,
    serialize: urnuuidSerialize,
    skipNormalize: true
  };
  var SCHEMES = {
    http,
    https,
    ws,
    wss,
    urn,
    "urn:uuid": urnuuid
  };
  Object.setPrototypeOf(SCHEMES, null);
  function getSchemeHandler(scheme) {
    return scheme && (SCHEMES[scheme] || SCHEMES[scheme.toLowerCase()]) || undefined;
  }
  module.exports = {
    wsIsSecure,
    SCHEMES,
    isValidSchemeName,
    getSchemeHandler
  };
});

// node_modules/fast-uri/index.js
var require_fast_uri = __commonJS((exports, module) => {
  var { normalizeIPv6, removeDotSegments, recomposeAuthority, normalizeComponentEncoding, isIPv4, nonSimpleDomain } = require_utils();
  var { SCHEMES, getSchemeHandler } = require_schemes();
  function normalize(uri, options) {
    if (typeof uri === "string") {
      uri = serialize(parse(uri, options), options);
    } else if (typeof uri === "object") {
      uri = parse(serialize(uri, options), options);
    }
    return uri;
  }
  function resolve(baseURI, relativeURI, options) {
    const schemelessOptions = options ? Object.assign({ scheme: "null" }, options) : { scheme: "null" };
    const resolved = resolveComponent(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true);
    schemelessOptions.skipEscape = true;
    return serialize(resolved, schemelessOptions);
  }
  function resolveComponent(base, relative, options, skipNormalization) {
    const target = {};
    if (!skipNormalization) {
      base = parse(serialize(base, options), options);
      relative = parse(serialize(relative, options), options);
    }
    options = options || {};
    if (!options.tolerant && relative.scheme) {
      target.scheme = relative.scheme;
      target.userinfo = relative.userinfo;
      target.host = relative.host;
      target.port = relative.port;
      target.path = removeDotSegments(relative.path || "");
      target.query = relative.query;
    } else {
      if (relative.userinfo !== undefined || relative.host !== undefined || relative.port !== undefined) {
        target.userinfo = relative.userinfo;
        target.host = relative.host;
        target.port = relative.port;
        target.path = removeDotSegments(relative.path || "");
        target.query = relative.query;
      } else {
        if (!relative.path) {
          target.path = base.path;
          if (relative.query !== undefined) {
            target.query = relative.query;
          } else {
            target.query = base.query;
          }
        } else {
          if (relative.path[0] === "/") {
            target.path = removeDotSegments(relative.path);
          } else {
            if ((base.userinfo !== undefined || base.host !== undefined || base.port !== undefined) && !base.path) {
              target.path = "/" + relative.path;
            } else if (!base.path) {
              target.path = relative.path;
            } else {
              target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
            }
            target.path = removeDotSegments(target.path);
          }
          target.query = relative.query;
        }
        target.userinfo = base.userinfo;
        target.host = base.host;
        target.port = base.port;
      }
      target.scheme = base.scheme;
    }
    target.fragment = relative.fragment;
    return target;
  }
  function equal(uriA, uriB, options) {
    if (typeof uriA === "string") {
      uriA = unescape(uriA);
      uriA = serialize(normalizeComponentEncoding(parse(uriA, options), true), { ...options, skipEscape: true });
    } else if (typeof uriA === "object") {
      uriA = serialize(normalizeComponentEncoding(uriA, true), { ...options, skipEscape: true });
    }
    if (typeof uriB === "string") {
      uriB = unescape(uriB);
      uriB = serialize(normalizeComponentEncoding(parse(uriB, options), true), { ...options, skipEscape: true });
    } else if (typeof uriB === "object") {
      uriB = serialize(normalizeComponentEncoding(uriB, true), { ...options, skipEscape: true });
    }
    return uriA.toLowerCase() === uriB.toLowerCase();
  }
  function serialize(cmpts, opts) {
    const component = {
      host: cmpts.host,
      scheme: cmpts.scheme,
      userinfo: cmpts.userinfo,
      port: cmpts.port,
      path: cmpts.path,
      query: cmpts.query,
      nid: cmpts.nid,
      nss: cmpts.nss,
      uuid: cmpts.uuid,
      fragment: cmpts.fragment,
      reference: cmpts.reference,
      resourceName: cmpts.resourceName,
      secure: cmpts.secure,
      error: ""
    };
    const options = Object.assign({}, opts);
    const uriTokens = [];
    const schemeHandler = getSchemeHandler(options.scheme || component.scheme);
    if (schemeHandler && schemeHandler.serialize)
      schemeHandler.serialize(component, options);
    if (component.path !== undefined) {
      if (!options.skipEscape) {
        component.path = escape(component.path);
        if (component.scheme !== undefined) {
          component.path = component.path.split("%3A").join(":");
        }
      } else {
        component.path = unescape(component.path);
      }
    }
    if (options.reference !== "suffix" && component.scheme) {
      uriTokens.push(component.scheme, ":");
    }
    const authority = recomposeAuthority(component);
    if (authority !== undefined) {
      if (options.reference !== "suffix") {
        uriTokens.push("//");
      }
      uriTokens.push(authority);
      if (component.path && component.path[0] !== "/") {
        uriTokens.push("/");
      }
    }
    if (component.path !== undefined) {
      let s = component.path;
      if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
        s = removeDotSegments(s);
      }
      if (authority === undefined && s[0] === "/" && s[1] === "/") {
        s = "/%2F" + s.slice(2);
      }
      uriTokens.push(s);
    }
    if (component.query !== undefined) {
      uriTokens.push("?", component.query);
    }
    if (component.fragment !== undefined) {
      uriTokens.push("#", component.fragment);
    }
    return uriTokens.join("");
  }
  var URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function parse(uri, opts) {
    const options = Object.assign({}, opts);
    const parsed = {
      scheme: undefined,
      userinfo: undefined,
      host: "",
      port: undefined,
      path: "",
      query: undefined,
      fragment: undefined
    };
    let isIP = false;
    if (options.reference === "suffix") {
      if (options.scheme) {
        uri = options.scheme + ":" + uri;
      } else {
        uri = "//" + uri;
      }
    }
    const matches = uri.match(URI_PARSE);
    if (matches) {
      parsed.scheme = matches[1];
      parsed.userinfo = matches[3];
      parsed.host = matches[4];
      parsed.port = parseInt(matches[5], 10);
      parsed.path = matches[6] || "";
      parsed.query = matches[7];
      parsed.fragment = matches[8];
      if (isNaN(parsed.port)) {
        parsed.port = matches[5];
      }
      if (parsed.host) {
        const ipv4result = isIPv4(parsed.host);
        if (ipv4result === false) {
          const ipv6result = normalizeIPv6(parsed.host);
          parsed.host = ipv6result.host.toLowerCase();
          isIP = ipv6result.isIPV6;
        } else {
          isIP = true;
        }
      }
      if (parsed.scheme === undefined && parsed.userinfo === undefined && parsed.host === undefined && parsed.port === undefined && parsed.query === undefined && !parsed.path) {
        parsed.reference = "same-document";
      } else if (parsed.scheme === undefined) {
        parsed.reference = "relative";
      } else if (parsed.fragment === undefined) {
        parsed.reference = "absolute";
      } else {
        parsed.reference = "uri";
      }
      if (options.reference && options.reference !== "suffix" && options.reference !== parsed.reference) {
        parsed.error = parsed.error || "URI is not a " + options.reference + " reference.";
      }
      const schemeHandler = getSchemeHandler(options.scheme || parsed.scheme);
      if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
        if (parsed.host && (options.domainHost || schemeHandler && schemeHandler.domainHost) && isIP === false && nonSimpleDomain(parsed.host)) {
          try {
            parsed.host = URL.domainToASCII(parsed.host.toLowerCase());
          } catch (e) {
            parsed.error = parsed.error || "Host's domain name can not be converted to ASCII: " + e;
          }
        }
      }
      if (!schemeHandler || schemeHandler && !schemeHandler.skipNormalize) {
        if (uri.indexOf("%") !== -1) {
          if (parsed.scheme !== undefined) {
            parsed.scheme = unescape(parsed.scheme);
          }
          if (parsed.host !== undefined) {
            parsed.host = unescape(parsed.host);
          }
        }
        if (parsed.path) {
          parsed.path = escape(unescape(parsed.path));
        }
        if (parsed.fragment) {
          parsed.fragment = encodeURI(decodeURIComponent(parsed.fragment));
        }
      }
      if (schemeHandler && schemeHandler.parse) {
        schemeHandler.parse(parsed, options);
      }
    } else {
      parsed.error = parsed.error || "URI can not be parsed.";
    }
    return parsed;
  }
  var fastUri = {
    SCHEMES,
    normalize,
    resolve,
    resolveComponent,
    equal,
    serialize,
    parse
  };
  module.exports = fastUri;
  module.exports.default = fastUri;
  module.exports.fastUri = fastUri;
});

// node_modules/ajv/dist/runtime/uri.js
var require_uri = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var uri = require_fast_uri();
  uri.code = 'require("ajv/dist/runtime/uri").default';
  exports.default = uri;
});

// node_modules/ajv/dist/core.js
var require_core = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = undefined;
  var validate_1 = require_validate();
  Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
    return validate_1.KeywordCxt;
  } });
  var codegen_1 = require_codegen();
  Object.defineProperty(exports, "_", { enumerable: true, get: function() {
    return codegen_1._;
  } });
  Object.defineProperty(exports, "str", { enumerable: true, get: function() {
    return codegen_1.str;
  } });
  Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
    return codegen_1.stringify;
  } });
  Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
    return codegen_1.nil;
  } });
  Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
    return codegen_1.Name;
  } });
  Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
    return codegen_1.CodeGen;
  } });
  var validation_error_1 = require_validation_error();
  var ref_error_1 = require_ref_error();
  var rules_1 = require_rules();
  var compile_1 = require_compile();
  var codegen_2 = require_codegen();
  var resolve_1 = require_resolve();
  var dataType_1 = require_dataType();
  var util_1 = require_util();
  var $dataRefSchema = require_data();
  var uri_1 = require_uri();
  var defaultRegExp = (str2, flags) => new RegExp(str2, flags);
  defaultRegExp.code = "new RegExp";
  var META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
  var EXT_SCOPE_NAMES = new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]);
  var removedOptions = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  };
  var deprecatedOptions = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  };
  var MAX_EXPRESSION = 200;
  function requiredOptions(o) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    const s = o.strict;
    const _optz = (_a = o.code) === null || _a === undefined ? undefined : _a.optimize;
    const optimize = _optz === true || _optz === undefined ? 1 : _optz || 0;
    const regExp = (_c = (_b = o.code) === null || _b === undefined ? undefined : _b.regExp) !== null && _c !== undefined ? _c : defaultRegExp;
    const uriResolver = (_d = o.uriResolver) !== null && _d !== undefined ? _d : uri_1.default;
    return {
      strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== undefined ? _e : s) !== null && _f !== undefined ? _f : true,
      strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== undefined ? _g : s) !== null && _h !== undefined ? _h : true,
      strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== undefined ? _j : s) !== null && _k !== undefined ? _k : "log",
      strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== undefined ? _l : s) !== null && _m !== undefined ? _m : "log",
      strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== undefined ? _o : s) !== null && _p !== undefined ? _p : false,
      code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
      loopRequired: (_q = o.loopRequired) !== null && _q !== undefined ? _q : MAX_EXPRESSION,
      loopEnum: (_r = o.loopEnum) !== null && _r !== undefined ? _r : MAX_EXPRESSION,
      meta: (_s = o.meta) !== null && _s !== undefined ? _s : true,
      messages: (_t = o.messages) !== null && _t !== undefined ? _t : true,
      inlineRefs: (_u = o.inlineRefs) !== null && _u !== undefined ? _u : true,
      schemaId: (_v = o.schemaId) !== null && _v !== undefined ? _v : "$id",
      addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== undefined ? _w : true,
      validateSchema: (_x = o.validateSchema) !== null && _x !== undefined ? _x : true,
      validateFormats: (_y = o.validateFormats) !== null && _y !== undefined ? _y : true,
      unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== undefined ? _z : true,
      int32range: (_0 = o.int32range) !== null && _0 !== undefined ? _0 : true,
      uriResolver
    };
  }

  class Ajv {
    constructor(opts = {}) {
      this.schemas = {};
      this.refs = {};
      this.formats = {};
      this._compilations = new Set;
      this._loading = {};
      this._cache = new Map;
      opts = this.opts = { ...opts, ...requiredOptions(opts) };
      const { es5, lines } = this.opts.code;
      this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
      this.logger = getLogger(opts.logger);
      const formatOpt = opts.validateFormats;
      opts.validateFormats = false;
      this.RULES = (0, rules_1.getRules)();
      checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
      checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
      this._metaOpts = getMetaSchemaOptions.call(this);
      if (opts.formats)
        addInitialFormats.call(this);
      this._addVocabularies();
      this._addDefaultMetaSchema();
      if (opts.keywords)
        addInitialKeywords.call(this, opts.keywords);
      if (typeof opts.meta == "object")
        this.addMetaSchema(opts.meta);
      addInitialSchemas.call(this);
      opts.validateFormats = formatOpt;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data, meta, schemaId } = this.opts;
      let _dataRefSchema = $dataRefSchema;
      if (schemaId === "id") {
        _dataRefSchema = { ...$dataRefSchema };
        _dataRefSchema.id = _dataRefSchema.$id;
        delete _dataRefSchema.$id;
      }
      if (meta && $data)
        this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
    }
    defaultMeta() {
      const { meta, schemaId } = this.opts;
      return this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : undefined;
    }
    validate(schemaKeyRef, data) {
      let v;
      if (typeof schemaKeyRef == "string") {
        v = this.getSchema(schemaKeyRef);
        if (!v)
          throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
      } else {
        v = this.compile(schemaKeyRef);
      }
      const valid = v(data);
      if (!("$async" in v))
        this.errors = v.errors;
      return valid;
    }
    compile(schema2, _meta) {
      const sch = this._addSchema(schema2, _meta);
      return sch.validate || this._compileSchemaEnv(sch);
    }
    compileAsync(schema2, meta) {
      if (typeof this.opts.loadSchema != "function") {
        throw new Error("options.loadSchema should be a function");
      }
      const { loadSchema } = this.opts;
      return runCompileAsync.call(this, schema2, meta);
      async function runCompileAsync(_schema, _meta) {
        await loadMetaSchema.call(this, _schema.$schema);
        const sch = this._addSchema(_schema, _meta);
        return sch.validate || _compileAsync.call(this, sch);
      }
      async function loadMetaSchema($ref) {
        if ($ref && !this.getSchema($ref)) {
          await runCompileAsync.call(this, { $ref }, true);
        }
      }
      async function _compileAsync(sch) {
        try {
          return this._compileSchemaEnv(sch);
        } catch (e) {
          if (!(e instanceof ref_error_1.default))
            throw e;
          checkLoaded.call(this, e);
          await loadMissingSchema.call(this, e.missingSchema);
          return _compileAsync.call(this, sch);
        }
      }
      function checkLoaded({ missingSchema: ref, missingRef }) {
        if (this.refs[ref]) {
          throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
        }
      }
      async function loadMissingSchema(ref) {
        const _schema = await _loadSchema.call(this, ref);
        if (!this.refs[ref])
          await loadMetaSchema.call(this, _schema.$schema);
        if (!this.refs[ref])
          this.addSchema(_schema, ref, meta);
      }
      async function _loadSchema(ref) {
        const p = this._loading[ref];
        if (p)
          return p;
        try {
          return await (this._loading[ref] = loadSchema(ref));
        } finally {
          delete this._loading[ref];
        }
      }
    }
    addSchema(schema2, key, _meta, _validateSchema = this.opts.validateSchema) {
      if (Array.isArray(schema2)) {
        for (const sch of schema2)
          this.addSchema(sch, undefined, _meta, _validateSchema);
        return this;
      }
      let id;
      if (typeof schema2 === "object") {
        const { schemaId } = this.opts;
        id = schema2[schemaId];
        if (id !== undefined && typeof id != "string") {
          throw new Error(`schema ${schemaId} must be string`);
        }
      }
      key = (0, resolve_1.normalizeId)(key || id);
      this._checkUnique(key);
      this.schemas[key] = this._addSchema(schema2, _meta, key, _validateSchema, true);
      return this;
    }
    addMetaSchema(schema2, key, _validateSchema = this.opts.validateSchema) {
      this.addSchema(schema2, key, true, _validateSchema);
      return this;
    }
    validateSchema(schema2, throwOrLogError) {
      if (typeof schema2 == "boolean")
        return true;
      let $schema;
      $schema = schema2.$schema;
      if ($schema !== undefined && typeof $schema != "string") {
        throw new Error("$schema must be a string");
      }
      $schema = $schema || this.opts.defaultMeta || this.defaultMeta();
      if (!$schema) {
        this.logger.warn("meta-schema not available");
        this.errors = null;
        return true;
      }
      const valid = this.validate($schema, schema2);
      if (!valid && throwOrLogError) {
        const message = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(message);
        else
          throw new Error(message);
      }
      return valid;
    }
    getSchema(keyRef) {
      let sch;
      while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
        keyRef = sch;
      if (sch === undefined) {
        const { schemaId } = this.opts;
        const root = new compile_1.SchemaEnv({ schema: {}, schemaId });
        sch = compile_1.resolveSchema.call(this, root, keyRef);
        if (!sch)
          return;
        this.refs[keyRef] = sch;
      }
      return sch.validate || this._compileSchemaEnv(sch);
    }
    removeSchema(schemaKeyRef) {
      if (schemaKeyRef instanceof RegExp) {
        this._removeAllSchemas(this.schemas, schemaKeyRef);
        this._removeAllSchemas(this.refs, schemaKeyRef);
        return this;
      }
      switch (typeof schemaKeyRef) {
        case "undefined":
          this._removeAllSchemas(this.schemas);
          this._removeAllSchemas(this.refs);
          this._cache.clear();
          return this;
        case "string": {
          const sch = getSchEnv.call(this, schemaKeyRef);
          if (typeof sch == "object")
            this._cache.delete(sch.schema);
          delete this.schemas[schemaKeyRef];
          delete this.refs[schemaKeyRef];
          return this;
        }
        case "object": {
          const cacheKey = schemaKeyRef;
          this._cache.delete(cacheKey);
          let id = schemaKeyRef[this.opts.schemaId];
          if (id) {
            id = (0, resolve_1.normalizeId)(id);
            delete this.schemas[id];
            delete this.refs[id];
          }
          return this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    addVocabulary(definitions) {
      for (const def of definitions)
        this.addKeyword(def);
      return this;
    }
    addKeyword(kwdOrDef, def) {
      let keyword;
      if (typeof kwdOrDef == "string") {
        keyword = kwdOrDef;
        if (typeof def == "object") {
          this.logger.warn("these parameters are deprecated, see docs for addKeyword");
          def.keyword = keyword;
        }
      } else if (typeof kwdOrDef == "object" && def === undefined) {
        def = kwdOrDef;
        keyword = def.keyword;
        if (Array.isArray(keyword) && !keyword.length) {
          throw new Error("addKeywords: keyword must be string or non-empty array");
        }
      } else {
        throw new Error("invalid addKeywords parameters");
      }
      checkKeyword.call(this, keyword, def);
      if (!def) {
        (0, util_1.eachItem)(keyword, (kwd) => addRule.call(this, kwd));
        return this;
      }
      keywordMetaschema.call(this, def);
      const definition = {
        ...def,
        type: (0, dataType_1.getJSONTypes)(def.type),
        schemaType: (0, dataType_1.getJSONTypes)(def.schemaType)
      };
      (0, util_1.eachItem)(keyword, definition.type.length === 0 ? (k) => addRule.call(this, k, definition) : (k) => definition.type.forEach((t) => addRule.call(this, k, definition, t)));
      return this;
    }
    getKeyword(keyword) {
      const rule = this.RULES.all[keyword];
      return typeof rule == "object" ? rule.definition : !!rule;
    }
    removeKeyword(keyword) {
      const { RULES } = this;
      delete RULES.keywords[keyword];
      delete RULES.all[keyword];
      for (const group of RULES.rules) {
        const i2 = group.rules.findIndex((rule) => rule.keyword === keyword);
        if (i2 >= 0)
          group.rules.splice(i2, 1);
      }
      return this;
    }
    addFormat(name, format) {
      if (typeof format == "string")
        format = new RegExp(format);
      this.formats[name] = format;
      return this;
    }
    errorsText(errors = this.errors, { separator = ", ", dataVar = "data" } = {}) {
      if (!errors || errors.length === 0)
        return "No errors";
      return errors.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
    }
    $dataMetaSchema(metaSchema, keywordsJsonPointers) {
      const rules = this.RULES.all;
      metaSchema = JSON.parse(JSON.stringify(metaSchema));
      for (const jsonPointer of keywordsJsonPointers) {
        const segments = jsonPointer.split("/").slice(1);
        let keywords = metaSchema;
        for (const seg of segments)
          keywords = keywords[seg];
        for (const key in rules) {
          const rule = rules[key];
          if (typeof rule != "object")
            continue;
          const { $data } = rule.definition;
          const schema2 = keywords[key];
          if ($data && schema2)
            keywords[key] = schemaOrData(schema2);
        }
      }
      return metaSchema;
    }
    _removeAllSchemas(schemas, regex) {
      for (const keyRef in schemas) {
        const sch = schemas[keyRef];
        if (!regex || regex.test(keyRef)) {
          if (typeof sch == "string") {
            delete schemas[keyRef];
          } else if (sch && !sch.meta) {
            this._cache.delete(sch.schema);
            delete schemas[keyRef];
          }
        }
      }
    }
    _addSchema(schema2, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
      let id;
      const { schemaId } = this.opts;
      if (typeof schema2 == "object") {
        id = schema2[schemaId];
      } else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        else if (typeof schema2 != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let sch = this._cache.get(schema2);
      if (sch !== undefined)
        return sch;
      baseId = (0, resolve_1.normalizeId)(id || baseId);
      const localRefs = resolve_1.getSchemaRefs.call(this, schema2, baseId);
      sch = new compile_1.SchemaEnv({ schema: schema2, schemaId, meta, baseId, localRefs });
      this._cache.set(sch.schema, sch);
      if (addSchema && !baseId.startsWith("#")) {
        if (baseId)
          this._checkUnique(baseId);
        this.refs[baseId] = sch;
      }
      if (validateSchema)
        this.validateSchema(schema2, true);
      return sch;
    }
    _checkUnique(id) {
      if (this.schemas[id] || this.refs[id]) {
        throw new Error(`schema with key or id "${id}" already exists`);
      }
    }
    _compileSchemaEnv(sch) {
      if (sch.meta)
        this._compileMetaSchema(sch);
      else
        compile_1.compileSchema.call(this, sch);
      if (!sch.validate)
        throw new Error("ajv implementation error");
      return sch.validate;
    }
    _compileMetaSchema(sch) {
      const currentOpts = this.opts;
      this.opts = this._metaOpts;
      try {
        compile_1.compileSchema.call(this, sch);
      } finally {
        this.opts = currentOpts;
      }
    }
  }
  Ajv.ValidationError = validation_error_1.default;
  Ajv.MissingRefError = ref_error_1.default;
  exports.default = Ajv;
  function checkOptions(checkOpts, options, msg, log = "error") {
    for (const key in checkOpts) {
      const opt = key;
      if (opt in options)
        this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
    }
  }
  function getSchEnv(keyRef) {
    keyRef = (0, resolve_1.normalizeId)(keyRef);
    return this.schemas[keyRef] || this.refs[keyRef];
  }
  function addInitialSchemas() {
    const optsSchemas = this.opts.schemas;
    if (!optsSchemas)
      return;
    if (Array.isArray(optsSchemas))
      this.addSchema(optsSchemas);
    else
      for (const key in optsSchemas)
        this.addSchema(optsSchemas[key], key);
  }
  function addInitialFormats() {
    for (const name in this.opts.formats) {
      const format = this.opts.formats[name];
      if (format)
        this.addFormat(name, format);
    }
  }
  function addInitialKeywords(defs) {
    if (Array.isArray(defs)) {
      this.addVocabulary(defs);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const keyword in defs) {
      const def = defs[keyword];
      if (!def.keyword)
        def.keyword = keyword;
      this.addKeyword(def);
    }
  }
  function getMetaSchemaOptions() {
    const metaOpts = { ...this.opts };
    for (const opt of META_IGNORE_OPTIONS)
      delete metaOpts[opt];
    return metaOpts;
  }
  var noLogs = { log() {}, warn() {}, error() {} };
  function getLogger(logger) {
    if (logger === false)
      return noLogs;
    if (logger === undefined)
      return console;
    if (logger.log && logger.warn && logger.error)
      return logger;
    throw new Error("logger must implement log, warn and error methods");
  }
  var KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
  function checkKeyword(keyword, def) {
    const { RULES } = this;
    (0, util_1.eachItem)(keyword, (kwd) => {
      if (RULES.keywords[kwd])
        throw new Error(`Keyword ${kwd} is already defined`);
      if (!KEYWORD_NAME.test(kwd))
        throw new Error(`Keyword ${kwd} has invalid name`);
    });
    if (!def)
      return;
    if (def.$data && !(("code" in def) || ("validate" in def))) {
      throw new Error('$data keyword must have "code" or "validate" function');
    }
  }
  function addRule(keyword, definition, dataType) {
    var _a;
    const post = definition === null || definition === undefined ? undefined : definition.post;
    if (dataType && post)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES } = this;
    let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
    if (!ruleGroup) {
      ruleGroup = { type: dataType, rules: [] };
      RULES.rules.push(ruleGroup);
    }
    RULES.keywords[keyword] = true;
    if (!definition)
      return;
    const rule = {
      keyword,
      definition: {
        ...definition,
        type: (0, dataType_1.getJSONTypes)(definition.type),
        schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType)
      }
    };
    if (definition.before)
      addBeforeRule.call(this, ruleGroup, rule, definition.before);
    else
      ruleGroup.rules.push(rule);
    RULES.all[keyword] = rule;
    (_a = definition.implements) === null || _a === undefined || _a.forEach((kwd) => this.addKeyword(kwd));
  }
  function addBeforeRule(ruleGroup, rule, before) {
    const i2 = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
    if (i2 >= 0) {
      ruleGroup.rules.splice(i2, 0, rule);
    } else {
      ruleGroup.rules.push(rule);
      this.logger.warn(`rule ${before} is not defined`);
    }
  }
  function keywordMetaschema(def) {
    let { metaSchema } = def;
    if (metaSchema === undefined)
      return;
    if (def.$data && this.opts.$data)
      metaSchema = schemaOrData(metaSchema);
    def.validateSchema = this.compile(metaSchema, true);
  }
  var $dataRef = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function schemaOrData(schema2) {
    return { anyOf: [schema2, $dataRef] };
  }
});

// node_modules/ajv/dist/vocabularies/core/id.js
var require_id = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var def = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/core/ref.js
var require_ref = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.callRef = exports.getValidate = undefined;
  var ref_error_1 = require_ref_error();
  var code_1 = require_code2();
  var codegen_1 = require_codegen();
  var names_1 = require_names();
  var compile_1 = require_compile();
  var util_1 = require_util();
  var def = {
    keyword: "$ref",
    schemaType: "string",
    code(cxt) {
      const { gen, schema: $ref, it } = cxt;
      const { baseId, schemaEnv: env, validateName, opts, self } = it;
      const { root } = env;
      if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
        return callRootRef();
      const schOrEnv = compile_1.resolveRef.call(self, root, baseId, $ref);
      if (schOrEnv === undefined)
        throw new ref_error_1.default(it.opts.uriResolver, baseId, $ref);
      if (schOrEnv instanceof compile_1.SchemaEnv)
        return callValidate(schOrEnv);
      return inlineRefSchema(schOrEnv);
      function callRootRef() {
        if (env === root)
          return callRef(cxt, validateName, env, env.$async);
        const rootName = gen.scopeValue("root", { ref: root });
        return callRef(cxt, (0, codegen_1._)`${rootName}.validate`, root, root.$async);
      }
      function callValidate(sch) {
        const v = getValidate(cxt, sch);
        callRef(cxt, v, sch, sch.$async);
      }
      function inlineRefSchema(sch) {
        const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1.stringify)(sch) } : { ref: sch });
        const valid = gen.name("valid");
        const schCxt = cxt.subschema({
          schema: sch,
          dataTypes: [],
          schemaPath: codegen_1.nil,
          topSchemaRef: schName,
          errSchemaPath: $ref
        }, valid);
        cxt.mergeEvaluated(schCxt);
        cxt.ok(valid);
      }
    }
  };
  function getValidate(cxt, sch) {
    const { gen } = cxt;
    return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
  }
  exports.getValidate = getValidate;
  function callRef(cxt, v, sch, $async) {
    const { gen, it } = cxt;
    const { allErrors, schemaEnv: env, opts } = it;
    const passCxt = opts.passContext ? names_1.default.this : codegen_1.nil;
    if ($async)
      callAsyncRef();
    else
      callSyncRef();
    function callAsyncRef() {
      if (!env.$async)
        throw new Error("async schema referenced by sync schema");
      const valid = gen.let("valid");
      gen.try(() => {
        gen.code((0, codegen_1._)`await ${(0, code_1.callValidateCode)(cxt, v, passCxt)}`);
        addEvaluatedFrom(v);
        if (!allErrors)
          gen.assign(valid, true);
      }, (e) => {
        gen.if((0, codegen_1._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
        addErrorsFrom(e);
        if (!allErrors)
          gen.assign(valid, false);
      });
      cxt.ok(valid);
    }
    function callSyncRef() {
      cxt.result((0, code_1.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
    }
    function addErrorsFrom(source) {
      const errs = (0, codegen_1._)`${source}.errors`;
      gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`);
      gen.assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
    }
    function addEvaluatedFrom(source) {
      var _a;
      if (!it.opts.unevaluated)
        return;
      const schEvaluated = (_a = sch === null || sch === undefined ? undefined : sch.validate) === null || _a === undefined ? undefined : _a.evaluated;
      if (it.props !== true) {
        if (schEvaluated && !schEvaluated.dynamicProps) {
          if (schEvaluated.props !== undefined) {
            it.props = util_1.mergeEvaluated.props(gen, schEvaluated.props, it.props);
          }
        } else {
          const props = gen.var("props", (0, codegen_1._)`${source}.evaluated.props`);
          it.props = util_1.mergeEvaluated.props(gen, props, it.props, codegen_1.Name);
        }
      }
      if (it.items !== true) {
        if (schEvaluated && !schEvaluated.dynamicItems) {
          if (schEvaluated.items !== undefined) {
            it.items = util_1.mergeEvaluated.items(gen, schEvaluated.items, it.items);
          }
        } else {
          const items = gen.var("items", (0, codegen_1._)`${source}.evaluated.items`);
          it.items = util_1.mergeEvaluated.items(gen, items, it.items, codegen_1.Name);
        }
      }
    }
  }
  exports.callRef = callRef;
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/core/index.js
var require_core2 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var id_1 = require_id();
  var ref_1 = require_ref();
  var core2 = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    id_1.default,
    ref_1.default
  ];
  exports.default = core2;
});

// node_modules/ajv/dist/vocabularies/validation/limitNumber.js
var require_limitNumber = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var ops = codegen_1.operators;
  var KWDs = {
    maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
    minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
    exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
    exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
  };
  var error = {
    message: ({ keyword, schemaCode }) => (0, codegen_1.str)`must be ${KWDs[keyword].okStr} ${schemaCode}`,
    params: ({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
  };
  var def = {
    keyword: Object.keys(KWDs),
    type: "number",
    schemaType: "number",
    $data: true,
    error,
    code(cxt) {
      const { keyword, data, schemaCode } = cxt;
      cxt.fail$data((0, codegen_1._)`${data} ${KWDs[keyword].fail} ${schemaCode} || isNaN(${data})`);
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/validation/multipleOf.js
var require_multipleOf = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var error = {
    message: ({ schemaCode }) => (0, codegen_1.str)`must be multiple of ${schemaCode}`,
    params: ({ schemaCode }) => (0, codegen_1._)`{multipleOf: ${schemaCode}}`
  };
  var def = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: true,
    error,
    code(cxt) {
      const { gen, data, schemaCode, it } = cxt;
      const prec = it.opts.multipleOfPrecision;
      const res = gen.let("res");
      const invalid = prec ? (0, codegen_1._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1._)`${res} !== parseInt(${res})`;
      cxt.fail$data((0, codegen_1._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  function ucs2length(str2) {
    const len = str2.length;
    let length = 0;
    let pos = 0;
    let value;
    while (pos < len) {
      length++;
      value = str2.charCodeAt(pos++);
      if (value >= 55296 && value <= 56319 && pos < len) {
        value = str2.charCodeAt(pos);
        if ((value & 64512) === 56320)
          pos++;
      }
    }
    return length;
  }
  exports.default = ucs2length;
  ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
});

// node_modules/ajv/dist/vocabularies/validation/limitLength.js
var require_limitLength = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var ucs2length_1 = require_ucs2length();
  var error = {
    message({ keyword, schemaCode }) {
      const comp = keyword === "maxLength" ? "more" : "fewer";
      return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} characters`;
    },
    params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
  };
  var def = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: true,
    error,
    code(cxt) {
      const { keyword, data, schemaCode, it } = cxt;
      const op = keyword === "maxLength" ? codegen_1.operators.GT : codegen_1.operators.LT;
      const len = it.opts.unicode === false ? (0, codegen_1._)`${data}.length` : (0, codegen_1._)`${(0, util_1.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
      cxt.fail$data((0, codegen_1._)`${len} ${op} ${schemaCode}`);
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/validation/pattern.js
var require_pattern = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var code_1 = require_code2();
  var util_1 = require_util();
  var codegen_1 = require_codegen();
  var error = {
    message: ({ schemaCode }) => (0, codegen_1.str)`must match pattern "${schemaCode}"`,
    params: ({ schemaCode }) => (0, codegen_1._)`{pattern: ${schemaCode}}`
  };
  var def = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: true,
    error,
    code(cxt) {
      const { gen, data, $data, schema: schema2, schemaCode, it } = cxt;
      const u = it.opts.unicodeRegExp ? "u" : "";
      if ($data) {
        const { regExp } = it.opts.code;
        const regExpCode = regExp.code === "new RegExp" ? (0, codegen_1._)`new RegExp` : (0, util_1.useFunc)(gen, regExp);
        const valid = gen.let("valid");
        gen.try(() => gen.assign(valid, (0, codegen_1._)`${regExpCode}(${schemaCode}, ${u}).test(${data})`), () => gen.assign(valid, false));
        cxt.fail$data((0, codegen_1._)`!${valid}`);
      } else {
        const regExp = (0, code_1.usePattern)(cxt, schema2);
        cxt.fail$data((0, codegen_1._)`!${regExp}.test(${data})`);
      }
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/validation/limitProperties.js
var require_limitProperties = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var error = {
    message({ keyword, schemaCode }) {
      const comp = keyword === "maxProperties" ? "more" : "fewer";
      return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} properties`;
    },
    params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
  };
  var def = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: true,
    error,
    code(cxt) {
      const { keyword, data, schemaCode } = cxt;
      const op = keyword === "maxProperties" ? codegen_1.operators.GT : codegen_1.operators.LT;
      cxt.fail$data((0, codegen_1._)`Object.keys(${data}).length ${op} ${schemaCode}`);
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/validation/required.js
var require_required = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var code_1 = require_code2();
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var error = {
    message: ({ params: { missingProperty } }) => (0, codegen_1.str)`must have required property '${missingProperty}'`,
    params: ({ params: { missingProperty } }) => (0, codegen_1._)`{missingProperty: ${missingProperty}}`
  };
  var def = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: true,
    error,
    code(cxt) {
      const { gen, schema: schema2, schemaCode, data, $data, it } = cxt;
      const { opts } = it;
      if (!$data && schema2.length === 0)
        return;
      const useLoop = schema2.length >= opts.loopRequired;
      if (it.allErrors)
        allErrorsMode();
      else
        exitOnErrorMode();
      if (opts.strictRequired) {
        const props = cxt.parentSchema.properties;
        const { definedProperties } = cxt.it;
        for (const requiredKey of schema2) {
          if ((props === null || props === undefined ? undefined : props[requiredKey]) === undefined && !definedProperties.has(requiredKey)) {
            const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
            const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
            (0, util_1.checkStrictMode)(it, msg, it.opts.strictRequired);
          }
        }
      }
      function allErrorsMode() {
        if (useLoop || $data) {
          cxt.block$data(codegen_1.nil, loopAllRequired);
        } else {
          for (const prop of schema2) {
            (0, code_1.checkReportMissingProp)(cxt, prop);
          }
        }
      }
      function exitOnErrorMode() {
        const missing = gen.let("missing");
        if (useLoop || $data) {
          const valid = gen.let("valid", true);
          cxt.block$data(valid, () => loopUntilMissing(missing, valid));
          cxt.ok(valid);
        } else {
          gen.if((0, code_1.checkMissingProp)(cxt, schema2, missing));
          (0, code_1.reportMissingProp)(cxt, missing);
          gen.else();
        }
      }
      function loopAllRequired() {
        gen.forOf("prop", schemaCode, (prop) => {
          cxt.setParams({ missingProperty: prop });
          gen.if((0, code_1.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
        });
      }
      function loopUntilMissing(missing, valid) {
        cxt.setParams({ missingProperty: missing });
        gen.forOf(missing, schemaCode, () => {
          gen.assign(valid, (0, code_1.propertyInData)(gen, data, missing, opts.ownProperties));
          gen.if((0, codegen_1.not)(valid), () => {
            cxt.error();
            gen.break();
          });
        }, codegen_1.nil);
      }
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/validation/limitItems.js
var require_limitItems = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var error = {
    message({ keyword, schemaCode }) {
      const comp = keyword === "maxItems" ? "more" : "fewer";
      return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} items`;
    },
    params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
  };
  var def = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: true,
    error,
    code(cxt) {
      const { keyword, data, schemaCode } = cxt;
      const op = keyword === "maxItems" ? codegen_1.operators.GT : codegen_1.operators.LT;
      cxt.fail$data((0, codegen_1._)`${data}.length ${op} ${schemaCode}`);
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/runtime/equal.js
var require_equal = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var equal = require_fast_deep_equal();
  equal.code = 'require("ajv/dist/runtime/equal").default';
  exports.default = equal;
});

// node_modules/ajv/dist/vocabularies/validation/uniqueItems.js
var require_uniqueItems = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var dataType_1 = require_dataType();
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var equal_1 = require_equal();
  var error = {
    message: ({ params: { i: i2, j } }) => (0, codegen_1.str)`must NOT have duplicate items (items ## ${j} and ${i2} are identical)`,
    params: ({ params: { i: i2, j } }) => (0, codegen_1._)`{i: ${i2}, j: ${j}}`
  };
  var def = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: true,
    error,
    code(cxt) {
      const { gen, data, $data, schema: schema2, parentSchema, schemaCode, it } = cxt;
      if (!$data && !schema2)
        return;
      const valid = gen.let("valid");
      const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
      cxt.block$data(valid, validateUniqueItems, (0, codegen_1._)`${schemaCode} === false`);
      cxt.ok(valid);
      function validateUniqueItems() {
        const i2 = gen.let("i", (0, codegen_1._)`${data}.length`);
        const j = gen.let("j");
        cxt.setParams({ i: i2, j });
        gen.assign(valid, true);
        gen.if((0, codegen_1._)`${i2} > 1`, () => (canOptimize() ? loopN : loopN2)(i2, j));
      }
      function canOptimize() {
        return itemTypes.length > 0 && !itemTypes.some((t) => t === "object" || t === "array");
      }
      function loopN(i2, j) {
        const item = gen.name("item");
        const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
        const indices = gen.const("indices", (0, codegen_1._)`{}`);
        gen.for((0, codegen_1._)`;${i2}--;`, () => {
          gen.let(item, (0, codegen_1._)`${data}[${i2}]`);
          gen.if(wrongType, (0, codegen_1._)`continue`);
          if (itemTypes.length > 1)
            gen.if((0, codegen_1._)`typeof ${item} == "string"`, (0, codegen_1._)`${item} += "_"`);
          gen.if((0, codegen_1._)`typeof ${indices}[${item}] == "number"`, () => {
            gen.assign(j, (0, codegen_1._)`${indices}[${item}]`);
            cxt.error();
            gen.assign(valid, false).break();
          }).code((0, codegen_1._)`${indices}[${item}] = ${i2}`);
        });
      }
      function loopN2(i2, j) {
        const eql = (0, util_1.useFunc)(gen, equal_1.default);
        const outer = gen.name("outer");
        gen.label(outer).for((0, codegen_1._)`;${i2}--;`, () => gen.for((0, codegen_1._)`${j} = ${i2}; ${j}--;`, () => gen.if((0, codegen_1._)`${eql}(${data}[${i2}], ${data}[${j}])`, () => {
          cxt.error();
          gen.assign(valid, false).break(outer);
        })));
      }
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/validation/const.js
var require_const = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var equal_1 = require_equal();
  var error = {
    message: "must be equal to constant",
    params: ({ schemaCode }) => (0, codegen_1._)`{allowedValue: ${schemaCode}}`
  };
  var def = {
    keyword: "const",
    $data: true,
    error,
    code(cxt) {
      const { gen, data, $data, schemaCode, schema: schema2 } = cxt;
      if ($data || schema2 && typeof schema2 == "object") {
        cxt.fail$data((0, codegen_1._)`!${(0, util_1.useFunc)(gen, equal_1.default)}(${data}, ${schemaCode})`);
      } else {
        cxt.fail((0, codegen_1._)`${schema2} !== ${data}`);
      }
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/validation/enum.js
var require_enum = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var equal_1 = require_equal();
  var error = {
    message: "must be equal to one of the allowed values",
    params: ({ schemaCode }) => (0, codegen_1._)`{allowedValues: ${schemaCode}}`
  };
  var def = {
    keyword: "enum",
    schemaType: "array",
    $data: true,
    error,
    code(cxt) {
      const { gen, data, $data, schema: schema2, schemaCode, it } = cxt;
      if (!$data && schema2.length === 0)
        throw new Error("enum must have non-empty array");
      const useLoop = schema2.length >= it.opts.loopEnum;
      let eql;
      const getEql = () => eql !== null && eql !== undefined ? eql : eql = (0, util_1.useFunc)(gen, equal_1.default);
      let valid;
      if (useLoop || $data) {
        valid = gen.let("valid");
        cxt.block$data(valid, loopEnum);
      } else {
        if (!Array.isArray(schema2))
          throw new Error("ajv implementation error");
        const vSchema = gen.const("vSchema", schemaCode);
        valid = (0, codegen_1.or)(...schema2.map((_x, i2) => equalCode(vSchema, i2)));
      }
      cxt.pass(valid);
      function loopEnum() {
        gen.assign(valid, false);
        gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1._)`${getEql()}(${data}, ${v})`, () => gen.assign(valid, true).break()));
      }
      function equalCode(vSchema, i2) {
        const sch = schema2[i2];
        return typeof sch === "object" && sch !== null ? (0, codegen_1._)`${getEql()}(${data}, ${vSchema}[${i2}])` : (0, codegen_1._)`${data} === ${sch}`;
      }
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/validation/index.js
var require_validation = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var limitNumber_1 = require_limitNumber();
  var multipleOf_1 = require_multipleOf();
  var limitLength_1 = require_limitLength();
  var pattern_1 = require_pattern();
  var limitProperties_1 = require_limitProperties();
  var required_1 = require_required();
  var limitItems_1 = require_limitItems();
  var uniqueItems_1 = require_uniqueItems();
  var const_1 = require_const();
  var enum_1 = require_enum();
  var validation = [
    limitNumber_1.default,
    multipleOf_1.default,
    limitLength_1.default,
    pattern_1.default,
    limitProperties_1.default,
    required_1.default,
    limitItems_1.default,
    uniqueItems_1.default,
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    const_1.default,
    enum_1.default
  ];
  exports.default = validation;
});

// node_modules/ajv/dist/vocabularies/applicator/additionalItems.js
var require_additionalItems = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.validateAdditionalItems = undefined;
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var error = {
    message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
    params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
  };
  var def = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error,
    code(cxt) {
      const { parentSchema, it } = cxt;
      const { items } = parentSchema;
      if (!Array.isArray(items)) {
        (0, util_1.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      validateAdditionalItems(cxt, items);
    }
  };
  function validateAdditionalItems(cxt, items) {
    const { gen, schema: schema2, data, keyword, it } = cxt;
    it.items = true;
    const len = gen.const("len", (0, codegen_1._)`${data}.length`);
    if (schema2 === false) {
      cxt.setParams({ len: items.length });
      cxt.pass((0, codegen_1._)`${len} <= ${items.length}`);
    } else if (typeof schema2 == "object" && !(0, util_1.alwaysValidSchema)(it, schema2)) {
      const valid = gen.var("valid", (0, codegen_1._)`${len} <= ${items.length}`);
      gen.if((0, codegen_1.not)(valid), () => validateItems(valid));
      cxt.ok(valid);
    }
    function validateItems(valid) {
      gen.forRange("i", items.length, len, (i2) => {
        cxt.subschema({ keyword, dataProp: i2, dataPropType: util_1.Type.Num }, valid);
        if (!it.allErrors)
          gen.if((0, codegen_1.not)(valid), () => gen.break());
      });
    }
  }
  exports.validateAdditionalItems = validateAdditionalItems;
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/items.js
var require_items = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.validateTuple = undefined;
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var code_1 = require_code2();
  var def = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(cxt) {
      const { schema: schema2, it } = cxt;
      if (Array.isArray(schema2))
        return validateTuple(cxt, "additionalItems", schema2);
      it.items = true;
      if ((0, util_1.alwaysValidSchema)(it, schema2))
        return;
      cxt.ok((0, code_1.validateArray)(cxt));
    }
  };
  function validateTuple(cxt, extraItems, schArr = cxt.schema) {
    const { gen, parentSchema, data, keyword, it } = cxt;
    checkStrictTuple(parentSchema);
    if (it.opts.unevaluated && schArr.length && it.items !== true) {
      it.items = util_1.mergeEvaluated.items(gen, schArr.length, it.items);
    }
    const valid = gen.name("valid");
    const len = gen.const("len", (0, codegen_1._)`${data}.length`);
    schArr.forEach((sch, i2) => {
      if ((0, util_1.alwaysValidSchema)(it, sch))
        return;
      gen.if((0, codegen_1._)`${len} > ${i2}`, () => cxt.subschema({
        keyword,
        schemaProp: i2,
        dataProp: i2
      }, valid));
      cxt.ok(valid);
    });
    function checkStrictTuple(sch) {
      const { opts, errSchemaPath } = it;
      const l = schArr.length;
      const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
      if (opts.strictTuples && !fullTuple) {
        const msg = `"${keyword}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
        (0, util_1.checkStrictMode)(it, msg, opts.strictTuples);
      }
    }
  }
  exports.validateTuple = validateTuple;
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/prefixItems.js
var require_prefixItems = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var items_1 = require_items();
  var def = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (cxt) => (0, items_1.validateTuple)(cxt, "items")
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/items2020.js
var require_items2020 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var code_1 = require_code2();
  var additionalItems_1 = require_additionalItems();
  var error = {
    message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
    params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
  };
  var def = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error,
    code(cxt) {
      const { schema: schema2, parentSchema, it } = cxt;
      const { prefixItems } = parentSchema;
      it.items = true;
      if ((0, util_1.alwaysValidSchema)(it, schema2))
        return;
      if (prefixItems)
        (0, additionalItems_1.validateAdditionalItems)(cxt, prefixItems);
      else
        cxt.ok((0, code_1.validateArray)(cxt));
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/contains.js
var require_contains = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var error = {
    message: ({ params: { min, max } }) => max === undefined ? (0, codegen_1.str)`must contain at least ${min} valid item(s)` : (0, codegen_1.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
    params: ({ params: { min, max } }) => max === undefined ? (0, codegen_1._)`{minContains: ${min}}` : (0, codegen_1._)`{minContains: ${min}, maxContains: ${max}}`
  };
  var def = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: true,
    error,
    code(cxt) {
      const { gen, schema: schema2, parentSchema, data, it } = cxt;
      let min;
      let max;
      const { minContains, maxContains } = parentSchema;
      if (it.opts.next) {
        min = minContains === undefined ? 1 : minContains;
        max = maxContains;
      } else {
        min = 1;
      }
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      cxt.setParams({ min, max });
      if (max === undefined && min === 0) {
        (0, util_1.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
        return;
      }
      if (max !== undefined && min > max) {
        (0, util_1.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
        cxt.fail();
        return;
      }
      if ((0, util_1.alwaysValidSchema)(it, schema2)) {
        let cond = (0, codegen_1._)`${len} >= ${min}`;
        if (max !== undefined)
          cond = (0, codegen_1._)`${cond} && ${len} <= ${max}`;
        cxt.pass(cond);
        return;
      }
      it.items = true;
      const valid = gen.name("valid");
      if (max === undefined && min === 1) {
        validateItems(valid, () => gen.if(valid, () => gen.break()));
      } else if (min === 0) {
        gen.let(valid, true);
        if (max !== undefined)
          gen.if((0, codegen_1._)`${data}.length > 0`, validateItemsWithCount);
      } else {
        gen.let(valid, false);
        validateItemsWithCount();
      }
      cxt.result(valid, () => cxt.reset());
      function validateItemsWithCount() {
        const schValid = gen.name("_valid");
        const count = gen.let("count", 0);
        validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
      }
      function validateItems(_valid, block) {
        gen.forRange("i", 0, len, (i2) => {
          cxt.subschema({
            keyword: "contains",
            dataProp: i2,
            dataPropType: util_1.Type.Num,
            compositeRule: true
          }, _valid);
          block();
        });
      }
      function checkLimits(count) {
        gen.code((0, codegen_1._)`${count}++`);
        if (max === undefined) {
          gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true).break());
        } else {
          gen.if((0, codegen_1._)`${count} > ${max}`, () => gen.assign(valid, false).break());
          if (min === 1)
            gen.assign(valid, true);
          else
            gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true));
        }
      }
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/dependencies.js
var require_dependencies = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = undefined;
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var code_1 = require_code2();
  exports.error = {
    message: ({ params: { property, depsCount, deps } }) => {
      const property_ies = depsCount === 1 ? "property" : "properties";
      return (0, codegen_1.str)`must have ${property_ies} ${deps} when property ${property} is present`;
    },
    params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_1._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
  };
  var def = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: exports.error,
    code(cxt) {
      const [propDeps, schDeps] = splitDependencies(cxt);
      validatePropertyDeps(cxt, propDeps);
      validateSchemaDeps(cxt, schDeps);
    }
  };
  function splitDependencies({ schema: schema2 }) {
    const propertyDeps = {};
    const schemaDeps = {};
    for (const key in schema2) {
      if (key === "__proto__")
        continue;
      const deps = Array.isArray(schema2[key]) ? propertyDeps : schemaDeps;
      deps[key] = schema2[key];
    }
    return [propertyDeps, schemaDeps];
  }
  function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
    const { gen, data, it } = cxt;
    if (Object.keys(propertyDeps).length === 0)
      return;
    const missing = gen.let("missing");
    for (const prop in propertyDeps) {
      const deps = propertyDeps[prop];
      if (deps.length === 0)
        continue;
      const hasProperty = (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties);
      cxt.setParams({
        property: prop,
        depsCount: deps.length,
        deps: deps.join(", ")
      });
      if (it.allErrors) {
        gen.if(hasProperty, () => {
          for (const depProp of deps) {
            (0, code_1.checkReportMissingProp)(cxt, depProp);
          }
        });
      } else {
        gen.if((0, codegen_1._)`${hasProperty} && (${(0, code_1.checkMissingProp)(cxt, deps, missing)})`);
        (0, code_1.reportMissingProp)(cxt, missing);
        gen.else();
      }
    }
  }
  exports.validatePropertyDeps = validatePropertyDeps;
  function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
    const { gen, data, keyword, it } = cxt;
    const valid = gen.name("valid");
    for (const prop in schemaDeps) {
      if ((0, util_1.alwaysValidSchema)(it, schemaDeps[prop]))
        continue;
      gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties), () => {
        const schCxt = cxt.subschema({ keyword, schemaProp: prop }, valid);
        cxt.mergeValidEvaluated(schCxt, valid);
      }, () => gen.var(valid, true));
      cxt.ok(valid);
    }
  }
  exports.validateSchemaDeps = validateSchemaDeps;
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/propertyNames.js
var require_propertyNames = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var error = {
    message: "property name must be valid",
    params: ({ params }) => (0, codegen_1._)`{propertyName: ${params.propertyName}}`
  };
  var def = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error,
    code(cxt) {
      const { gen, schema: schema2, data, it } = cxt;
      if ((0, util_1.alwaysValidSchema)(it, schema2))
        return;
      const valid = gen.name("valid");
      gen.forIn("key", data, (key) => {
        cxt.setParams({ propertyName: key });
        cxt.subschema({
          keyword: "propertyNames",
          data: key,
          dataTypes: ["string"],
          propertyName: key,
          compositeRule: true
        }, valid);
        gen.if((0, codegen_1.not)(valid), () => {
          cxt.error(true);
          if (!it.allErrors)
            gen.break();
        });
      });
      cxt.ok(valid);
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js
var require_additionalProperties = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var code_1 = require_code2();
  var codegen_1 = require_codegen();
  var names_1 = require_names();
  var util_1 = require_util();
  var error = {
    message: "must NOT have additional properties",
    params: ({ params }) => (0, codegen_1._)`{additionalProperty: ${params.additionalProperty}}`
  };
  var def = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: true,
    trackErrors: true,
    error,
    code(cxt) {
      const { gen, schema: schema2, parentSchema, data, errsCount, it } = cxt;
      if (!errsCount)
        throw new Error("ajv implementation error");
      const { allErrors, opts } = it;
      it.props = true;
      if (opts.removeAdditional !== "all" && (0, util_1.alwaysValidSchema)(it, schema2))
        return;
      const props = (0, code_1.allSchemaProperties)(parentSchema.properties);
      const patProps = (0, code_1.allSchemaProperties)(parentSchema.patternProperties);
      checkAdditionalProperties();
      cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
      function checkAdditionalProperties() {
        gen.forIn("key", data, (key) => {
          if (!props.length && !patProps.length)
            additionalPropertyCode(key);
          else
            gen.if(isAdditional(key), () => additionalPropertyCode(key));
        });
      }
      function isAdditional(key) {
        let definedProp;
        if (props.length > 8) {
          const propsSchema = (0, util_1.schemaRefOrVal)(it, parentSchema.properties, "properties");
          definedProp = (0, code_1.isOwnProperty)(gen, propsSchema, key);
        } else if (props.length) {
          definedProp = (0, codegen_1.or)(...props.map((p) => (0, codegen_1._)`${key} === ${p}`));
        } else {
          definedProp = codegen_1.nil;
        }
        if (patProps.length) {
          definedProp = (0, codegen_1.or)(definedProp, ...patProps.map((p) => (0, codegen_1._)`${(0, code_1.usePattern)(cxt, p)}.test(${key})`));
        }
        return (0, codegen_1.not)(definedProp);
      }
      function deleteAdditional(key) {
        gen.code((0, codegen_1._)`delete ${data}[${key}]`);
      }
      function additionalPropertyCode(key) {
        if (opts.removeAdditional === "all" || opts.removeAdditional && schema2 === false) {
          deleteAdditional(key);
          return;
        }
        if (schema2 === false) {
          cxt.setParams({ additionalProperty: key });
          cxt.error();
          if (!allErrors)
            gen.break();
          return;
        }
        if (typeof schema2 == "object" && !(0, util_1.alwaysValidSchema)(it, schema2)) {
          const valid = gen.name("valid");
          if (opts.removeAdditional === "failing") {
            applyAdditionalSchema(key, valid, false);
            gen.if((0, codegen_1.not)(valid), () => {
              cxt.reset();
              deleteAdditional(key);
            });
          } else {
            applyAdditionalSchema(key, valid);
            if (!allErrors)
              gen.if((0, codegen_1.not)(valid), () => gen.break());
          }
        }
      }
      function applyAdditionalSchema(key, valid, errors) {
        const subschema = {
          keyword: "additionalProperties",
          dataProp: key,
          dataPropType: util_1.Type.Str
        };
        if (errors === false) {
          Object.assign(subschema, {
            compositeRule: true,
            createErrors: false,
            allErrors: false
          });
        }
        cxt.subschema(subschema, valid);
      }
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/properties.js
var require_properties = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var validate_1 = require_validate();
  var code_1 = require_code2();
  var util_1 = require_util();
  var additionalProperties_1 = require_additionalProperties();
  var def = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(cxt) {
      const { gen, schema: schema2, parentSchema, data, it } = cxt;
      if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === undefined) {
        additionalProperties_1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1.default, "additionalProperties"));
      }
      const allProps = (0, code_1.allSchemaProperties)(schema2);
      for (const prop of allProps) {
        it.definedProperties.add(prop);
      }
      if (it.opts.unevaluated && allProps.length && it.props !== true) {
        it.props = util_1.mergeEvaluated.props(gen, (0, util_1.toHash)(allProps), it.props);
      }
      const properties = allProps.filter((p) => !(0, util_1.alwaysValidSchema)(it, schema2[p]));
      if (properties.length === 0)
        return;
      const valid = gen.name("valid");
      for (const prop of properties) {
        if (hasDefault(prop)) {
          applyPropertySchema(prop);
        } else {
          gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties));
          applyPropertySchema(prop);
          if (!it.allErrors)
            gen.else().var(valid, true);
          gen.endIf();
        }
        cxt.it.definedProperties.add(prop);
        cxt.ok(valid);
      }
      function hasDefault(prop) {
        return it.opts.useDefaults && !it.compositeRule && schema2[prop].default !== undefined;
      }
      function applyPropertySchema(prop) {
        cxt.subschema({
          keyword: "properties",
          schemaProp: prop,
          dataProp: prop
        }, valid);
      }
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/patternProperties.js
var require_patternProperties = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var code_1 = require_code2();
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var util_2 = require_util();
  var def = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(cxt) {
      const { gen, schema: schema2, data, parentSchema, it } = cxt;
      const { opts } = it;
      const patterns = (0, code_1.allSchemaProperties)(schema2);
      const alwaysValidPatterns = patterns.filter((p) => (0, util_1.alwaysValidSchema)(it, schema2[p]));
      if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) {
        return;
      }
      const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
      const valid = gen.name("valid");
      if (it.props !== true && !(it.props instanceof codegen_1.Name)) {
        it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
      }
      const { props } = it;
      validatePatternProperties();
      function validatePatternProperties() {
        for (const pat of patterns) {
          if (checkProperties)
            checkMatchingProperties(pat);
          if (it.allErrors) {
            validateProperties(pat);
          } else {
            gen.var(valid, true);
            validateProperties(pat);
            gen.if(valid);
          }
        }
      }
      function checkMatchingProperties(pat) {
        for (const prop in checkProperties) {
          if (new RegExp(pat).test(prop)) {
            (0, util_1.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
          }
        }
      }
      function validateProperties(pat) {
        gen.forIn("key", data, (key) => {
          gen.if((0, codegen_1._)`${(0, code_1.usePattern)(cxt, pat)}.test(${key})`, () => {
            const alwaysValid = alwaysValidPatterns.includes(pat);
            if (!alwaysValid) {
              cxt.subschema({
                keyword: "patternProperties",
                schemaProp: pat,
                dataProp: key,
                dataPropType: util_2.Type.Str
              }, valid);
            }
            if (it.opts.unevaluated && props !== true) {
              gen.assign((0, codegen_1._)`${props}[${key}]`, true);
            } else if (!alwaysValid && !it.allErrors) {
              gen.if((0, codegen_1.not)(valid), () => gen.break());
            }
          });
        });
      }
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/not.js
var require_not = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var util_1 = require_util();
  var def = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: true,
    code(cxt) {
      const { gen, schema: schema2, it } = cxt;
      if ((0, util_1.alwaysValidSchema)(it, schema2)) {
        cxt.fail();
        return;
      }
      const valid = gen.name("valid");
      cxt.subschema({
        keyword: "not",
        compositeRule: true,
        createErrors: false,
        allErrors: false
      }, valid);
      cxt.failResult(valid, () => cxt.reset(), () => cxt.error());
    },
    error: { message: "must NOT be valid" }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/anyOf.js
var require_anyOf = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var code_1 = require_code2();
  var def = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: true,
    code: code_1.validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/oneOf.js
var require_oneOf = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var error = {
    message: "must match exactly one schema in oneOf",
    params: ({ params }) => (0, codegen_1._)`{passingSchemas: ${params.passing}}`
  };
  var def = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: true,
    error,
    code(cxt) {
      const { gen, schema: schema2, parentSchema, it } = cxt;
      if (!Array.isArray(schema2))
        throw new Error("ajv implementation error");
      if (it.opts.discriminator && parentSchema.discriminator)
        return;
      const schArr = schema2;
      const valid = gen.let("valid", false);
      const passing = gen.let("passing", null);
      const schValid = gen.name("_valid");
      cxt.setParams({ passing });
      gen.block(validateOneOf);
      cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
      function validateOneOf() {
        schArr.forEach((sch, i2) => {
          let schCxt;
          if ((0, util_1.alwaysValidSchema)(it, sch)) {
            gen.var(schValid, true);
          } else {
            schCxt = cxt.subschema({
              keyword: "oneOf",
              schemaProp: i2,
              compositeRule: true
            }, schValid);
          }
          if (i2 > 0) {
            gen.if((0, codegen_1._)`${schValid} && ${valid}`).assign(valid, false).assign(passing, (0, codegen_1._)`[${passing}, ${i2}]`).else();
          }
          gen.if(schValid, () => {
            gen.assign(valid, true);
            gen.assign(passing, i2);
            if (schCxt)
              cxt.mergeEvaluated(schCxt, codegen_1.Name);
          });
        });
      }
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/allOf.js
var require_allOf = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var util_1 = require_util();
  var def = {
    keyword: "allOf",
    schemaType: "array",
    code(cxt) {
      const { gen, schema: schema2, it } = cxt;
      if (!Array.isArray(schema2))
        throw new Error("ajv implementation error");
      const valid = gen.name("valid");
      schema2.forEach((sch, i2) => {
        if ((0, util_1.alwaysValidSchema)(it, sch))
          return;
        const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i2 }, valid);
        cxt.ok(valid);
        cxt.mergeEvaluated(schCxt);
      });
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/if.js
var require_if = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var util_1 = require_util();
  var error = {
    message: ({ params }) => (0, codegen_1.str)`must match "${params.ifClause}" schema`,
    params: ({ params }) => (0, codegen_1._)`{failingKeyword: ${params.ifClause}}`
  };
  var def = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: true,
    error,
    code(cxt) {
      const { gen, parentSchema, it } = cxt;
      if (parentSchema.then === undefined && parentSchema.else === undefined) {
        (0, util_1.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
      }
      const hasThen = hasSchema(it, "then");
      const hasElse = hasSchema(it, "else");
      if (!hasThen && !hasElse)
        return;
      const valid = gen.let("valid", true);
      const schValid = gen.name("_valid");
      validateIf();
      cxt.reset();
      if (hasThen && hasElse) {
        const ifClause = gen.let("ifClause");
        cxt.setParams({ ifClause });
        gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
      } else if (hasThen) {
        gen.if(schValid, validateClause("then"));
      } else {
        gen.if((0, codegen_1.not)(schValid), validateClause("else"));
      }
      cxt.pass(valid, () => cxt.error(true));
      function validateIf() {
        const schCxt = cxt.subschema({
          keyword: "if",
          compositeRule: true,
          createErrors: false,
          allErrors: false
        }, schValid);
        cxt.mergeEvaluated(schCxt);
      }
      function validateClause(keyword, ifClause) {
        return () => {
          const schCxt = cxt.subschema({ keyword }, schValid);
          gen.assign(valid, schValid);
          cxt.mergeValidEvaluated(schCxt, valid);
          if (ifClause)
            gen.assign(ifClause, (0, codegen_1._)`${keyword}`);
          else
            cxt.setParams({ ifClause: keyword });
        };
      }
    }
  };
  function hasSchema(it, keyword) {
    const schema2 = it.schema[keyword];
    return schema2 !== undefined && !(0, util_1.alwaysValidSchema)(it, schema2);
  }
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/thenElse.js
var require_thenElse = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var util_1 = require_util();
  var def = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword, parentSchema, it }) {
      if (parentSchema.if === undefined)
        (0, util_1.checkStrictMode)(it, `"${keyword}" without "if" is ignored`);
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/applicator/index.js
var require_applicator = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var additionalItems_1 = require_additionalItems();
  var prefixItems_1 = require_prefixItems();
  var items_1 = require_items();
  var items2020_1 = require_items2020();
  var contains_1 = require_contains();
  var dependencies_1 = require_dependencies();
  var propertyNames_1 = require_propertyNames();
  var additionalProperties_1 = require_additionalProperties();
  var properties_1 = require_properties();
  var patternProperties_1 = require_patternProperties();
  var not_1 = require_not();
  var anyOf_1 = require_anyOf();
  var oneOf_1 = require_oneOf();
  var allOf_1 = require_allOf();
  var if_1 = require_if();
  var thenElse_1 = require_thenElse();
  function getApplicator(draft2020 = false) {
    const applicator = [
      not_1.default,
      anyOf_1.default,
      oneOf_1.default,
      allOf_1.default,
      if_1.default,
      thenElse_1.default,
      propertyNames_1.default,
      additionalProperties_1.default,
      dependencies_1.default,
      properties_1.default,
      patternProperties_1.default
    ];
    if (draft2020)
      applicator.push(prefixItems_1.default, items2020_1.default);
    else
      applicator.push(additionalItems_1.default, items_1.default);
    applicator.push(contains_1.default);
    return applicator;
  }
  exports.default = getApplicator;
});

// node_modules/ajv/dist/vocabularies/format/format.js
var require_format = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var error = {
    message: ({ schemaCode }) => (0, codegen_1.str)`must match format "${schemaCode}"`,
    params: ({ schemaCode }) => (0, codegen_1._)`{format: ${schemaCode}}`
  };
  var def = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: true,
    error,
    code(cxt, ruleType) {
      const { gen, data, $data, schema: schema2, schemaCode, it } = cxt;
      const { opts, errSchemaPath, schemaEnv, self } = it;
      if (!opts.validateFormats)
        return;
      if ($data)
        validate$DataFormat();
      else
        validateFormat();
      function validate$DataFormat() {
        const fmts = gen.scopeValue("formats", {
          ref: self.formats,
          code: opts.code.formats
        });
        const fDef = gen.const("fDef", (0, codegen_1._)`${fmts}[${schemaCode}]`);
        const fType = gen.let("fType");
        const format = gen.let("format");
        gen.if((0, codegen_1._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1._)`${fDef}.type || "string"`).assign(format, (0, codegen_1._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1._)`"string"`).assign(format, fDef));
        cxt.fail$data((0, codegen_1.or)(unknownFmt(), invalidFmt()));
        function unknownFmt() {
          if (opts.strictSchema === false)
            return codegen_1.nil;
          return (0, codegen_1._)`${schemaCode} && !${format}`;
        }
        function invalidFmt() {
          const callFormat = schemaEnv.$async ? (0, codegen_1._)`(${fDef}.async ? await ${format}(${data}) : ${format}(${data}))` : (0, codegen_1._)`${format}(${data})`;
          const validData = (0, codegen_1._)`(typeof ${format} == "function" ? ${callFormat} : ${format}.test(${data}))`;
          return (0, codegen_1._)`${format} && ${format} !== true && ${fType} === ${ruleType} && !${validData}`;
        }
      }
      function validateFormat() {
        const formatDef = self.formats[schema2];
        if (!formatDef) {
          unknownFormat();
          return;
        }
        if (formatDef === true)
          return;
        const [fmtType, format, fmtRef] = getFormat(formatDef);
        if (fmtType === ruleType)
          cxt.pass(validCondition());
        function unknownFormat() {
          if (opts.strictSchema === false) {
            self.logger.warn(unknownMsg());
            return;
          }
          throw new Error(unknownMsg());
          function unknownMsg() {
            return `unknown format "${schema2}" ignored in schema at path "${errSchemaPath}"`;
          }
        }
        function getFormat(fmtDef) {
          const code = fmtDef instanceof RegExp ? (0, codegen_1.regexpCode)(fmtDef) : opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(schema2)}` : undefined;
          const fmt = gen.scopeValue("formats", { key: schema2, ref: fmtDef, code });
          if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
            return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1._)`${fmt}.validate`];
          }
          return ["string", fmtDef, fmt];
        }
        function validCondition() {
          if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
            if (!schemaEnv.$async)
              throw new Error("async format in sync schema");
            return (0, codegen_1._)`await ${fmtRef}(${data})`;
          }
          return typeof format == "function" ? (0, codegen_1._)`${fmtRef}(${data})` : (0, codegen_1._)`${fmtRef}.test(${data})`;
        }
      }
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/vocabularies/format/index.js
var require_format2 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var format_1 = require_format();
  var format = [format_1.default];
  exports.default = format;
});

// node_modules/ajv/dist/vocabularies/metadata.js
var require_metadata = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.contentVocabulary = exports.metadataVocabulary = undefined;
  exports.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ];
  exports.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ];
});

// node_modules/ajv/dist/vocabularies/draft7.js
var require_draft7 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var core_1 = require_core2();
  var validation_1 = require_validation();
  var applicator_1 = require_applicator();
  var format_1 = require_format2();
  var metadata_1 = require_metadata();
  var draft7Vocabularies = [
    core_1.default,
    validation_1.default,
    (0, applicator_1.default)(),
    format_1.default,
    metadata_1.metadataVocabulary,
    metadata_1.contentVocabulary
  ];
  exports.default = draft7Vocabularies;
});

// node_modules/ajv/dist/vocabularies/discriminator/types.js
var require_types = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.DiscrError = undefined;
  var DiscrError;
  (function(DiscrError2) {
    DiscrError2["Tag"] = "tag";
    DiscrError2["Mapping"] = "mapping";
  })(DiscrError || (exports.DiscrError = DiscrError = {}));
});

// node_modules/ajv/dist/vocabularies/discriminator/index.js
var require_discriminator = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var codegen_1 = require_codegen();
  var types_1 = require_types();
  var compile_1 = require_compile();
  var ref_error_1 = require_ref_error();
  var util_1 = require_util();
  var error = {
    message: ({ params: { discrError, tagName } }) => discrError === types_1.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
    params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
  };
  var def = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error,
    code(cxt) {
      const { gen, data, schema: schema2, parentSchema, it } = cxt;
      const { oneOf } = parentSchema;
      if (!it.opts.discriminator) {
        throw new Error("discriminator: requires discriminator option");
      }
      const tagName = schema2.propertyName;
      if (typeof tagName != "string")
        throw new Error("discriminator: requires propertyName");
      if (schema2.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!oneOf)
        throw new Error("discriminator: requires oneOf keyword");
      const valid = gen.let("valid", false);
      const tag = gen.const("tag", (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(tagName)}`);
      gen.if((0, codegen_1._)`typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag, tagName }));
      cxt.ok(valid);
      function validateMapping() {
        const mapping = getMapping();
        gen.if(false);
        for (const tagValue in mapping) {
          gen.elseIf((0, codegen_1._)`${tag} === ${tagValue}`);
          gen.assign(valid, applyTagSchema(mapping[tagValue]));
        }
        gen.else();
        cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag, tagName });
        gen.endIf();
      }
      function applyTagSchema(schemaProp) {
        const _valid = gen.name("valid");
        const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
        cxt.mergeEvaluated(schCxt, codegen_1.Name);
        return _valid;
      }
      function getMapping() {
        var _a;
        const oneOfMapping = {};
        const topRequired = hasRequired(parentSchema);
        let tagRequired = true;
        for (let i2 = 0;i2 < oneOf.length; i2++) {
          let sch = oneOf[i2];
          if ((sch === null || sch === undefined ? undefined : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
            const ref = sch.$ref;
            sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref);
            if (sch instanceof compile_1.SchemaEnv)
              sch = sch.schema;
            if (sch === undefined)
              throw new ref_error_1.default(it.opts.uriResolver, it.baseId, ref);
          }
          const propSch = (_a = sch === null || sch === undefined ? undefined : sch.properties) === null || _a === undefined ? undefined : _a[tagName];
          if (typeof propSch != "object") {
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
          }
          tagRequired = tagRequired && (topRequired || hasRequired(sch));
          addMappings(propSch, i2);
        }
        if (!tagRequired)
          throw new Error(`discriminator: "${tagName}" must be required`);
        return oneOfMapping;
        function hasRequired({ required }) {
          return Array.isArray(required) && required.includes(tagName);
        }
        function addMappings(sch, i2) {
          if (sch.const) {
            addMapping(sch.const, i2);
          } else if (sch.enum) {
            for (const tagValue of sch.enum) {
              addMapping(tagValue, i2);
            }
          } else {
            throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
          }
        }
        function addMapping(tagValue, i2) {
          if (typeof tagValue != "string" || tagValue in oneOfMapping) {
            throw new Error(`discriminator: "${tagName}" values must be unique strings`);
          }
          oneOfMapping[tagValue] = i2;
        }
      }
    }
  };
  exports.default = def;
});

// node_modules/ajv/dist/refs/json-schema-draft-07.json
var require_json_schema_draft_07 = __commonJS((exports, module) => {
  module.exports = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "http://json-schema.org/draft-07/schema#",
    title: "Core schema meta-schema",
    definitions: {
      schemaArray: {
        type: "array",
        minItems: 1,
        items: { $ref: "#" }
      },
      nonNegativeInteger: {
        type: "integer",
        minimum: 0
      },
      nonNegativeIntegerDefault0: {
        allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }]
      },
      simpleTypes: {
        enum: ["array", "boolean", "integer", "null", "number", "object", "string"]
      },
      stringArray: {
        type: "array",
        items: { type: "string" },
        uniqueItems: true,
        default: []
      }
    },
    type: ["object", "boolean"],
    properties: {
      $id: {
        type: "string",
        format: "uri-reference"
      },
      $schema: {
        type: "string",
        format: "uri"
      },
      $ref: {
        type: "string",
        format: "uri-reference"
      },
      $comment: {
        type: "string"
      },
      title: {
        type: "string"
      },
      description: {
        type: "string"
      },
      default: true,
      readOnly: {
        type: "boolean",
        default: false
      },
      examples: {
        type: "array",
        items: true
      },
      multipleOf: {
        type: "number",
        exclusiveMinimum: 0
      },
      maximum: {
        type: "number"
      },
      exclusiveMaximum: {
        type: "number"
      },
      minimum: {
        type: "number"
      },
      exclusiveMinimum: {
        type: "number"
      },
      maxLength: { $ref: "#/definitions/nonNegativeInteger" },
      minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
      pattern: {
        type: "string",
        format: "regex"
      },
      additionalItems: { $ref: "#" },
      items: {
        anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }],
        default: true
      },
      maxItems: { $ref: "#/definitions/nonNegativeInteger" },
      minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
      uniqueItems: {
        type: "boolean",
        default: false
      },
      contains: { $ref: "#" },
      maxProperties: { $ref: "#/definitions/nonNegativeInteger" },
      minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
      required: { $ref: "#/definitions/stringArray" },
      additionalProperties: { $ref: "#" },
      definitions: {
        type: "object",
        additionalProperties: { $ref: "#" },
        default: {}
      },
      properties: {
        type: "object",
        additionalProperties: { $ref: "#" },
        default: {}
      },
      patternProperties: {
        type: "object",
        additionalProperties: { $ref: "#" },
        propertyNames: { format: "regex" },
        default: {}
      },
      dependencies: {
        type: "object",
        additionalProperties: {
          anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }]
        }
      },
      propertyNames: { $ref: "#" },
      const: true,
      enum: {
        type: "array",
        items: true,
        minItems: 1,
        uniqueItems: true
      },
      type: {
        anyOf: [
          { $ref: "#/definitions/simpleTypes" },
          {
            type: "array",
            items: { $ref: "#/definitions/simpleTypes" },
            minItems: 1,
            uniqueItems: true
          }
        ]
      },
      format: { type: "string" },
      contentMediaType: { type: "string" },
      contentEncoding: { type: "string" },
      if: { $ref: "#" },
      then: { $ref: "#" },
      else: { $ref: "#" },
      allOf: { $ref: "#/definitions/schemaArray" },
      anyOf: { $ref: "#/definitions/schemaArray" },
      oneOf: { $ref: "#/definitions/schemaArray" },
      not: { $ref: "#" }
    },
    default: true
  };
});

// node_modules/ajv/dist/ajv.js
var require_ajv = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv = undefined;
  var core_1 = require_core();
  var draft7_1 = require_draft7();
  var discriminator_1 = require_discriminator();
  var draft7MetaSchema = require_json_schema_draft_07();
  var META_SUPPORT_DATA = ["/properties"];
  var META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";

  class Ajv extends core_1.default {
    _addVocabularies() {
      super._addVocabularies();
      draft7_1.default.forEach((v) => this.addVocabulary(v));
      if (this.opts.discriminator)
        this.addKeyword(discriminator_1.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      if (!this.opts.meta)
        return;
      const metaSchema = this.opts.$data ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) : draft7MetaSchema;
      this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
      this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : undefined);
    }
  }
  exports.Ajv = Ajv;
  module.exports = exports = Ajv;
  module.exports.Ajv = Ajv;
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.default = Ajv;
  var validate_1 = require_validate();
  Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
    return validate_1.KeywordCxt;
  } });
  var codegen_1 = require_codegen();
  Object.defineProperty(exports, "_", { enumerable: true, get: function() {
    return codegen_1._;
  } });
  Object.defineProperty(exports, "str", { enumerable: true, get: function() {
    return codegen_1.str;
  } });
  Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
    return codegen_1.stringify;
  } });
  Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
    return codegen_1.nil;
  } });
  Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
    return codegen_1.Name;
  } });
  Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
    return codegen_1.CodeGen;
  } });
  var validation_error_1 = require_validation_error();
  Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function() {
    return validation_error_1.default;
  } });
  var ref_error_1 = require_ref_error();
  Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: function() {
    return ref_error_1.default;
  } });
});

// node_modules/ajv-formats/dist/formats.js
var require_formats = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.formatNames = exports.fastFormats = exports.fullFormats = undefined;
  function fmtDef(validate, compare) {
    return { validate, compare };
  }
  exports.fullFormats = {
    date: fmtDef(date, compareDate),
    time: fmtDef(getTime(true), compareTime),
    "date-time": fmtDef(getDateTime(true), compareDateTime),
    "iso-time": fmtDef(getTime(), compareIsoTime),
    "iso-date-time": fmtDef(getDateTime(), compareIsoDateTime),
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri,
    "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
    "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
    url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
    ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
    regex,
    uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
    "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
    "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
    byte,
    int32: { type: "number", validate: validateInt32 },
    int64: { type: "number", validate: validateInt64 },
    float: { type: "number", validate: validateNumber },
    double: { type: "number", validate: validateNumber },
    password: true,
    binary: true
  };
  exports.fastFormats = {
    ...exports.fullFormats,
    date: fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, compareDate),
    time: fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareTime),
    "date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareDateTime),
    "iso-time": fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoTime),
    "iso-date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoDateTime),
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  };
  exports.formatNames = Object.keys(exports.fullFormats);
  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }
  var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
  var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function date(str2) {
    const matches = DATE.exec(str2);
    if (!matches)
      return false;
    const year = +matches[1];
    const month = +matches[2];
    const day = +matches[3];
    return month >= 1 && month <= 12 && day >= 1 && day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month]);
  }
  function compareDate(d1, d2) {
    if (!(d1 && d2))
      return;
    if (d1 > d2)
      return 1;
    if (d1 < d2)
      return -1;
    return 0;
  }
  var TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function getTime(strictTimeZone) {
    return function time(str2) {
      const matches = TIME.exec(str2);
      if (!matches)
        return false;
      const hr = +matches[1];
      const min = +matches[2];
      const sec = +matches[3];
      const tz = matches[4];
      const tzSign = matches[5] === "-" ? -1 : 1;
      const tzH = +(matches[6] || 0);
      const tzM = +(matches[7] || 0);
      if (tzH > 23 || tzM > 59 || strictTimeZone && !tz)
        return false;
      if (hr <= 23 && min <= 59 && sec < 60)
        return true;
      const utcMin = min - tzM * tzSign;
      const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
      return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
    };
  }
  function compareTime(s1, s2) {
    if (!(s1 && s2))
      return;
    const t1 = new Date("2020-01-01T" + s1).valueOf();
    const t2 = new Date("2020-01-01T" + s2).valueOf();
    if (!(t1 && t2))
      return;
    return t1 - t2;
  }
  function compareIsoTime(t1, t2) {
    if (!(t1 && t2))
      return;
    const a1 = TIME.exec(t1);
    const a2 = TIME.exec(t2);
    if (!(a1 && a2))
      return;
    t1 = a1[1] + a1[2] + a1[3];
    t2 = a2[1] + a2[2] + a2[3];
    if (t1 > t2)
      return 1;
    if (t1 < t2)
      return -1;
    return 0;
  }
  var DATE_TIME_SEPARATOR = /t|\s/i;
  function getDateTime(strictTimeZone) {
    const time = getTime(strictTimeZone);
    return function date_time(str2) {
      const dateTime = str2.split(DATE_TIME_SEPARATOR);
      return dateTime.length === 2 && date(dateTime[0]) && time(dateTime[1]);
    };
  }
  function compareDateTime(dt1, dt2) {
    if (!(dt1 && dt2))
      return;
    const d1 = new Date(dt1).valueOf();
    const d2 = new Date(dt2).valueOf();
    if (!(d1 && d2))
      return;
    return d1 - d2;
  }
  function compareIsoDateTime(dt1, dt2) {
    if (!(dt1 && dt2))
      return;
    const [d1, t1] = dt1.split(DATE_TIME_SEPARATOR);
    const [d2, t2] = dt2.split(DATE_TIME_SEPARATOR);
    const res = compareDate(d1, d2);
    if (res === undefined)
      return;
    return res || compareTime(t1, t2);
  }
  var NOT_URI_FRAGMENT = /\/|:/;
  var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function uri(str2) {
    return NOT_URI_FRAGMENT.test(str2) && URI.test(str2);
  }
  var BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function byte(str2) {
    BYTE.lastIndex = 0;
    return BYTE.test(str2);
  }
  var MIN_INT32 = -(2 ** 31);
  var MAX_INT32 = 2 ** 31 - 1;
  function validateInt32(value) {
    return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
  }
  function validateInt64(value) {
    return Number.isInteger(value);
  }
  function validateNumber() {
    return true;
  }
  var Z_ANCHOR = /[^\\]\\Z/;
  function regex(str2) {
    if (Z_ANCHOR.test(str2))
      return false;
    try {
      new RegExp(str2);
      return true;
    } catch (e) {
      return false;
    }
  }
});

// node_modules/ajv-formats/dist/limit.js
var require_limit = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.formatLimitDefinition = undefined;
  var ajv_1 = require_ajv();
  var codegen_1 = require_codegen();
  var ops = codegen_1.operators;
  var KWDs = {
    formatMaximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
    formatMinimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
    formatExclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
  };
  var error = {
    message: ({ keyword, schemaCode }) => (0, codegen_1.str)`should be ${KWDs[keyword].okStr} ${schemaCode}`,
    params: ({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
  };
  exports.formatLimitDefinition = {
    keyword: Object.keys(KWDs),
    type: "string",
    schemaType: "string",
    $data: true,
    error,
    code(cxt) {
      const { gen, data, schemaCode, keyword, it } = cxt;
      const { opts, self } = it;
      if (!opts.validateFormats)
        return;
      const fCxt = new ajv_1.KeywordCxt(it, self.RULES.all.format.definition, "format");
      if (fCxt.$data)
        validate$DataFormat();
      else
        validateFormat();
      function validate$DataFormat() {
        const fmts = gen.scopeValue("formats", {
          ref: self.formats,
          code: opts.code.formats
        });
        const fmt = gen.const("fmt", (0, codegen_1._)`${fmts}[${fCxt.schemaCode}]`);
        cxt.fail$data((0, codegen_1.or)((0, codegen_1._)`typeof ${fmt} != "object"`, (0, codegen_1._)`${fmt} instanceof RegExp`, (0, codegen_1._)`typeof ${fmt}.compare != "function"`, compareCode(fmt)));
      }
      function validateFormat() {
        const format = fCxt.schema;
        const fmtDef = self.formats[format];
        if (!fmtDef || fmtDef === true)
          return;
        if (typeof fmtDef != "object" || fmtDef instanceof RegExp || typeof fmtDef.compare != "function") {
          throw new Error(`"${keyword}": format "${format}" does not define "compare" function`);
        }
        const fmt = gen.scopeValue("formats", {
          key: format,
          ref: fmtDef,
          code: opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(format)}` : undefined
        });
        cxt.fail$data(compareCode(fmt));
      }
      function compareCode(fmt) {
        return (0, codegen_1._)`${fmt}.compare(${data}, ${schemaCode}) ${KWDs[keyword].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  var formatLimitPlugin = (ajv) => {
    ajv.addKeyword(exports.formatLimitDefinition);
    return ajv;
  };
  exports.default = formatLimitPlugin;
});

// node_modules/ajv-formats/dist/index.js
var require_dist = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var formats_1 = require_formats();
  var limit_1 = require_limit();
  var codegen_1 = require_codegen();
  var fullName = new codegen_1.Name("fullFormats");
  var fastName = new codegen_1.Name("fastFormats");
  var formatsPlugin = (ajv, opts = { keywords: true }) => {
    if (Array.isArray(opts)) {
      addFormats(ajv, opts, formats_1.fullFormats, fullName);
      return ajv;
    }
    const [formats, exportName] = opts.mode === "fast" ? [formats_1.fastFormats, fastName] : [formats_1.fullFormats, fullName];
    const list = opts.formats || formats_1.formatNames;
    addFormats(ajv, list, formats, exportName);
    if (opts.keywords)
      (0, limit_1.default)(ajv);
    return ajv;
  };
  formatsPlugin.get = (name, mode = "full") => {
    const formats = mode === "fast" ? formats_1.fastFormats : formats_1.fullFormats;
    const f = formats[name];
    if (!f)
      throw new Error(`Unknown format "${name}"`);
    return f;
  };
  function addFormats(ajv, list, fs, exportName) {
    var _a;
    var _b;
    (_a = (_b = ajv.opts.code).formats) !== null && _a !== undefined || (_b.formats = (0, codegen_1._)`require("ajv-formats/dist/formats").${exportName}`);
    for (const f of list)
      ajv.addFormat(f, fs[f]);
  }
  module.exports = exports = formatsPlugin;
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.default = formatsPlugin;
});

// src/strict-spec-cli.ts
import { fileURLToPath as fileURLToPath3 } from "url";
import { realpathSync } from "fs";

// src/cli/argv.ts
var CHANGE_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function normalizeCliInvocation(argv) {
  const [subcommand, ...subcommandArgs] = argv;
  return { subcommand, subcommandArgs };
}
function isHelpRequest(argv) {
  return argv.length === 1 && (argv[0] === "--help" || argv[0] === "-h");
}

// src/cli/output.ts
function writeJson(result) {
  process.stdout.write(JSON.stringify(result) + `
`);
}
function writeOut(text) {
  process.stdout.write(text);
}
function writeErr(text) {
  process.stderr.write(text);
}
function writeUsage(usage) {
  process.stderr.write(usage);
}
function writeHelp(usage) {
  process.stdout.write(usage);
}
function writeError(message) {
  process.stderr.write(`Error: ${message}
`);
}

// src/cli/usage.ts
function getRegisteredCommandNames(commands) {
  return Object.keys(commands);
}
function formatCliUsage(commands) {
  const commandNames = getRegisteredCommandNames(commands);
  let usage = `Usage: strict-spec-driven <command>
`;
  if (commandNames.length > 0) {
    usage += `Commands: ${commandNames.join(", ")}
`;
  }
  usage += `Run 'strict-spec-driven <command> --help' for command usage.
`;
  return usage;
}
function writeCliUsage(commands) {
  process.stderr.write(formatCliUsage(commands));
}

// src/cli/entrypoint.ts
function runCliEntrypoint(argv, commands) {
  const { subcommand, subcommandArgs } = normalizeCliInvocation(argv);
  if (isHelpRequest(argv)) {
    writeOut(formatCliUsage(commands));
    return 0;
  }
  if (!subcommand || !(subcommand in commands)) {
    writeCliUsage(commands);
    return 1;
  }
  const status = commands[subcommand](subcommandArgs);
  return typeof status === "number" ? status : 0;
}
function exitCliEntrypoint(argv, commands) {
  process.exit(runCliEntrypoint(argv, commands));
}

// src/cli/registry.ts
var COMMAND_REGISTRATION_ORDER = [
  "init",
  "check-workflow-state",
  "propose",
  "generate",
  "apply",
  "verify",
  "ready",
  "next",
  "verify-spec-mappings",
  "validate-skills",
  "schema-list",
  "schema-show",
  "template-list",
  "template-show",
  "dev-session-plan",
  "dev-session-start",
  "dev-session-status",
  "dev-session-logs",
  "dev-session-trial",
  "dev-session-stop",
  "debug-session-create",
  "debug-session-validate",
  "debug-session-archive",
  "migrate",
  "roadmap-status",
  "roadmap-overview",
  "roadmap-sync",
  "roadmap-recommend",
  "maintenance",
  "ship",
  "commit-and-push",
  "archive",
  "list",
  "modify",
  "cancel"
];
function createCliCommandTable(registry) {
  const commands = {};
  for (const commandName of COMMAND_REGISTRATION_ORDER) {
    commands[commandName] = registry[commandName];
  }
  return commands;
}

// src/scaffold.ts
import { copyFileSync, existsSync, mkdirSync, readFileSync as readFileSync2, readdirSync, statSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// src/embedded-templates.ts
var EMBEDDED_TEMPLATES = {
  "strict-spec-driven/scaffold/changes/design.yaml": `schema: strict-spec-driven/change-design/v1
schema_version: 1
artifact_type: change_design
schema_file: templates/strict-spec-driven/schemas/change-design.yaml
change: {{change_name}}
approach:
  - Describe the implementation approach.
decisions:
  sample-decision:
    decision: Describe what was decided.
    rationale: Explain the independent reasoning, tradeoff, or constraint behind this decision.
alternatives:
  # Replace the sample entry below with real alternatives considered.
  - option: [Alternative approach description].
    reason: [Why it was accepted or rejected].
risks:
  # Replace the sample entry below with real risks, or remove if none.
  - [Risk description and mitigation].
`,
  "strict-spec-driven/scaffold/changes/proposal.yaml": `schema: strict-spec-driven/change-proposal/v1
schema_version: 1
artifact_type: change_proposal
schema_file: templates/strict-spec-driven/schemas/change-proposal.yaml
change:
  id: {{change_name}}
  status: proposed
summary:
  what:
    # Replace the sample entry below with real observable behavior descriptions.
    - Add [observable workflow behavior] for [target artifact family].
  why:
    # Replace the sample entry below with the real motivation.
    - The behavior is needed to support [workflow scenario or user need].
scope:
  in:
    # Replace sample entries with real scope items.
    - Add [specific behavior] to [target artifact].
  out:
    - Implement unrelated workflow behavior.
unchanged_behavior:
  - Existing strict workflow behavior remains unchanged unless explicitly listed in scope.
`,
  "strict-spec-driven/scaffold/changes/questions.yaml": `schema: strict-spec-driven/question-list/v1
schema_version: 1
artifact_type: question_list
schema_file: templates/strict-spec-driven/schemas/question-list.yaml
change: {{change_name}}
# open questions block the change — keep empty until real questions arise.
# Sample entry shape: { id: kebab-id, question: "...", context: "...", status: open }
open: []
resolved:
  # Replace or remove the sample entry below. Move questions here once answered.
  - id: sample-resolved
    question: Is [assumption] valid?
    context: Confirmation needed before proceeding.
    answer: Yes, confirmed by [source].
    status: resolved
`,
  "strict-spec-driven/scaffold/changes/tasks.yaml": `schema: strict-spec-driven/task-list/v2
schema_version: 2
artifact_type: task_list
schema_file: templates/strict-spec-driven/schemas/task-list.yaml
change: {{change_name}}
sections:
  Implementation:
    implement-change:
      text: Implement the scoped workflow behavior.
      status: pending
  Testing:
    run-build:
      text: Run build validation.
      status: pending
      command: bun run build
    run-lint:
      text: Run lint checks.
      status: pending
      command: bun run lint
    run-tests:
      text: Run unit tests.
      status: pending
      command: bun test/run.ts
  Verification:
    verify-scope:
      text: Verify implementation matches proposal scope.
      status: pending
testing_gates:
  validation_task: run-build
  unit_test_task: run-tests
`,
  "strict-spec-driven/scaffold/config.yaml": `schema: strict-spec-driven/config/v1
schema_version: 1
artifact_type: workflow_config
context: |
  [Project context — populated by user, injected into skill prompts]
rules:
  specs:
    - Describe observable behavior only — no implementation details, technology choices, or internal structure
    - MUST = required with no exceptions; SHOULD = default unless explicitly justified; MAY = genuinely optional
    - Each requirement must be independently verifiable from outside the system
  change:
    - Implement only what is in scope in proposal.yaml — if scope needs to expand, use strict-spec-modify first, never expand silently
    - When a requirement or task is ambiguous, ask the user before proceeding — do not assume or guess
    - Delta specs must reflect what was actually built, not the original plan
    - Mark tasks done immediately upon completion — never batch at the end
    - Every change must include test tasks (validation + unit tests at minimum)
  code:
    - Read existing code before modifying it
    - Implement only what the current task requires — no speculative features
    - No abstractions for hypothetical future needs (YAGNI)
  test:
    - Tests must verify observable behavior described in specs, not internal implementation details
    - Each test must be independent — no shared mutable state between tests
    - Prefer real dependencies over mocks for code the project owns
review_evidence:
  project_regression:
    method: complete_project_regression
    command: bun run build && bun test/run.ts
    meaning: >-
      Passing this command is required review evidence before strict-spec-review recommends archive
      or strict-spec-auto performs archive. This command represents the complete project-level
      regression suite, not only the Testing section tasks for an individual change.
    unavailable_behavior: >-
      If the command cannot run because required dependencies, services, credentials, fixtures, or
      other test conditions are unavailable, review or auto archive is blocked until a human
      prepares the environment or explicitly provides the missing evidence.
# maintenance:
#   checks:
#     - type: roadmap-sync-check
`,
  "strict-spec-driven/scaffold/debug-sessions/session.yaml": `schema: strict-spec-driven/debug-session/v1
schema_version: 1
artifact_type: debug_session
schema_file: ../../../templates/strict-spec-driven/schemas/debug-session.yaml
debug_session:
  id: "{{session_id}}"
  status: proposed
issue:
  summary: Describe the failure under investigation.
  observed_behavior: Describe what actually happens.
  expected_behavior: Describe what should happen instead.
scope:
  layers:
    - frontend
  out_of_scope: []
targets:
  primary-target:
    layer: frontend
    kind: browser_page
    label: Primary debug target.
    url: "http://127.0.0.1:3000"
    notes: []
reproduction:
  preconditions: []
  steps:
    - id: reproduce
      target: primary-target
      action: Reproduce the failure.
      expected: The failure is visible or captured in evidence.
  expected_failure: Describe the expected failing observation.
evidence:
  directory: evidence/
  entries: []
hypotheses: []
findings: []
human_checkpoints: []
manual_actions: []
cdp_health:
  required: false
  checks: []
dev_session:
  declaration: .strict-spec-driven/dev-session.yaml
  services: []
  lifecycle:
    plan:
      command: strict-spec-driven dev-session-plan
      status: not_run
      evidence: []
    start:
      command: strict-spec-driven dev-session-start
      status: not_run
      evidence: []
    status:
      command: strict-spec-driven dev-session-status
      status: not_run
      evidence: []
    logs: []
    stop:
      command: strict-spec-driven dev-session-stop
      status: not_run
      evidence: []
    cleanup_status: not_started
  unavailable_conditions: []
replay:
  commands: []
verification:
  status: not_started
  steps: []
  evidence: []
`,
  "strict-spec-driven/scaffold/dev-session.yaml": `schema: strict-spec-driven/dev-session/v1
schema_version: 1
artifact_type: dev_session
schema_file: templates/strict-spec-driven/schemas/dev-session.yaml
session:
  id: default
  description: Replace the sample values with this repository's local development session details.
  services:
    app:
      description: Replace with the primary local development service for this project.
      command: replace-with-project-dev-command
      working_directory: "."
      environment:
        required: []
        optional: []
      urls: []
      ports: []
      readiness:
        type: manual
        timeout_seconds: 60
        interval_seconds: 5
        notes:
          - Replace manual readiness with HTTP or TCP readiness when known.
      browser_targets: []
      cleanup:
        mode: none
        grace_period_seconds: 0
      unavailable_conditions: []
  browser_targets: {}
`,
  "strict-spec-driven/scaffold/roadmap/INDEX.yaml": `schema: strict-spec-driven/roadmap-index/v2
schema_version: 2
artifact_type: roadmap_index
schema_file: ../schemas/roadmap-index.yaml
milestones:
  0001-sample-milestone:
    title: Sample Milestone Title
    path: .strict-spec-driven/roadmap/milestones/0001-sample-milestone.yaml
    status: proposed
`,
  "strict-spec-driven/scaffold/specs/INDEX.yaml": `schema: strict-spec-driven/spec-index/v1
schema_version: 1
artifact_type: spec_index
schema_file: ../schemas/spec-index.yaml
specs:
  # Replace the sample entry below with real specs, or remove if unused.
  - id: sample-spec
    title: Sample Spec Title
    path: .strict-spec-driven/specs/sample-area.yaml
`,
  "strict-spec-driven/schemas/change-design.yaml": `schema: strict-spec-driven/schema/v1
schema_version: 1
schema_id: strict-spec-driven/change-design/v1
artifact_type: change_design
artifact_name: change-design
description: Strict YAML change design artifact.
example_ref: ../../../examples/strict-spec-driven/change-design.yaml
json_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  additionalProperties: false
  required:
    - schema
    - schema_version
    - artifact_type
    - schema_file
    - change
    - approach
    - decisions
    - alternatives
  properties:
    schema:
      type: string
      const: strict-spec-driven/change-design/v1
    schema_version:
      type: integer
      const: 1
    artifact_type:
      type: string
      const: change_design
    schema_file:
      type: string
    change:
      type: string
    approach:
      type: array
      minItems: 1
      items:
        type: string
    decisions:
      type: object
      description: "Map of design decisions keyed by short kebab-case identifier (max 60 chars). Each value has a decision (what was decided) and a rationale (why it was decided this way — must provide independent justification, not restate the decision)."
      propertyNames:
        type: string
        maxLength: 60
      additionalProperties:
        type: object
        additionalProperties: false
        required:
          - decision
          - rationale
        properties:
          decision:
            type: string
            description: "What was decided. A concise statement of the chosen approach or constraint."
          rationale:
            type: string
            description: "Why this decision was made. Must provide independent justification beyond restating the decision text — explain the reasoning, tradeoff, or constraint that motivates the choice."
    alternatives:
      type: array
      description: "Alternative approaches that were considered and rejected."
      items:
        type: object
        additionalProperties: false
        required:
          - option
          - reason
        properties:
          option:
            type: string
            description: "The alternative approach that was considered."
          reason:
            type: string
            description: "Why this alternative was rejected. Must explain the specific disadvantage or constraint that ruled it out, not merely restate what the option is."
    risks:
      type: array
      items:
        type: string
`,
  "strict-spec-driven/schemas/change-proposal.yaml": `schema: strict-spec-driven/schema/v1
schema_version: 1
schema_id: strict-spec-driven/change-proposal/v1
artifact_type: change_proposal
artifact_name: change-proposal
description: Strict YAML change proposal artifact.
example_ref: ../../../examples/strict-spec-driven/change-proposal.yaml
json_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  additionalProperties: false
  required:
    - schema
    - schema_version
    - artifact_type
    - schema_file
    - change
    - summary
    - scope
    - unchanged_behavior
  properties:
    schema:
      type: string
      const: strict-spec-driven/change-proposal/v1
    schema_version:
      type: integer
      const: 1
    artifact_type:
      type: string
      const: change_proposal
    schema_file:
      type: string
    change:
      type: object
      additionalProperties: false
      required:
        - id
        - status
      properties:
        id:
          type: string
        status:
          type: string
          enum:
            - proposed
            - active
            - complete
    summary:
      type: object
      additionalProperties: false
      required:
        - what
        - why
      properties:
        what:
          type: array
          minItems: 1
          items:
            type: string
        why:
          type: array
          minItems: 1
          items:
            type: string
    scope:
      type: object
      additionalProperties: false
      required:
        - in
        - out
      properties:
        in:
          type: array
          items:
            type: string
        out:
          type: array
          items:
            type: string
    unchanged_behavior:
      type: array
      items:
        type: string
    roadmap:
      type: object
      additionalProperties: false
      required:
        - milestone
        - planned_change
      properties:
        milestone:
          type: string
        planned_change:
          type: string
`,
  "strict-spec-driven/schemas/debug-session.yaml": `schema: strict-spec-driven/schema/v1
schema_version: 1
schema_id: strict-spec-driven/debug-session/v1
artifact_type: debug_session
artifact_name: debug-session
description: Strict YAML debug-session investigation artifact.
example_ref: ../../../examples/strict-spec-driven/debug-session.yaml
json_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  additionalProperties: false
  required:
    - schema
    - schema_version
    - artifact_type
    - schema_file
    - debug_session
    - issue
    - scope
    - targets
    - reproduction
    - evidence
    - hypotheses
    - findings
    - human_checkpoints
    - manual_actions
    - cdp_health
    - replay
    - verification
  properties:
    schema:
      type: string
      const: strict-spec-driven/debug-session/v1
    schema_version:
      type: integer
      const: 1
    artifact_type:
      type: string
      const: debug_session
    schema_file:
      type: string
      minLength: 1
    debug_session:
      type: object
      additionalProperties: false
      required:
        - id
        - status
      properties:
        id:
          type: string
          pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
        status:
          type: string
          enum:
            - proposed
            - reproducing
            - capturing
            - localizing
            - waiting_for_human
            - verifying
            - resolved
            - blocked
        owner:
          type: string
          minLength: 1
        created_at:
          type: string
          format: date-time
    issue:
      type: object
      additionalProperties: false
      required:
        - summary
        - observed_behavior
        - expected_behavior
      properties:
        summary:
          type: string
          minLength: 1
        observed_behavior:
          type: string
          minLength: 1
        expected_behavior:
          type: string
          minLength: 1
    scope:
      type: object
      additionalProperties: false
      required:
        - layers
        - out_of_scope
      properties:
        layers:
          type: array
          minItems: 1
          uniqueItems: true
          items:
            type: string
            enum:
              - web_api
              - frontend
              - electron
              - cdp_access
        out_of_scope:
          type: array
          items:
            type: string
            minLength: 1
    targets:
      type: object
      additionalProperties: false
      minProperties: 1
      patternProperties:
        "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$":
          type: object
          additionalProperties: false
          required:
            - layer
            - kind
            - label
            - notes
          properties:
            layer:
              type: string
              enum:
                - web_api
                - frontend
                - electron
                - cdp_access
            kind:
              type: string
              enum:
                - http_endpoint
                - browser_page
                - electron_app
                - cdp_target
            label:
              type: string
              minLength: 1
            url:
              type: string
              minLength: 1
            command:
              type: string
              minLength: 1
            cdp_endpoint:
              type: string
              minLength: 1
            notes:
              type: array
              items:
                type: string
                minLength: 1
    reproduction:
      type: object
      additionalProperties: false
      required:
        - preconditions
        - steps
        - expected_failure
      properties:
        preconditions:
          type: array
          items:
            type: string
            minLength: 1
        steps:
          type: array
          minItems: 1
          items:
            type: object
            additionalProperties: false
            required:
              - id
              - action
            properties:
              id:
                type: string
                pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
              action:
                type: string
                minLength: 1
              expected:
                type: string
                minLength: 1
              target:
                type: string
                pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
        expected_failure:
          type: string
          minLength: 1
    evidence:
      type: object
      additionalProperties: false
      required:
        - directory
        - entries
      properties:
        directory:
          type: string
          minLength: 1
        entries:
          type: array
          items:
            $ref: "#/definitions/evidence_entry"
    hypotheses:
      type: array
      items:
        type: object
        additionalProperties: false
        required:
          - id
          - statement
          - layer
          - status
          - evidence
        properties:
          id:
            type: string
            pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
          statement:
            type: string
            minLength: 1
          layer:
            $ref: "#/definitions/layer"
          status:
            type: string
            enum:
              - open
              - supported
              - rejected
              - verified
          evidence:
            type: array
            items:
              type: string
              pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
    findings:
      type: array
      items:
        type: object
        additionalProperties: false
        required:
          - id
          - layer
          - summary
          - status
          - evidence
        properties:
          id:
            type: string
            pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
          layer:
            $ref: "#/definitions/layer"
          target:
            type: string
            pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
          summary:
            type: string
            minLength: 1
          status:
            type: string
            enum:
              - suspected
              - confirmed
              - fixed
              - wont_fix
          evidence:
            type: array
            items:
              type: string
              pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
    human_checkpoints:
      type: array
      items:
        type: object
        additionalProperties: false
        required:
          - id
          - reason
          - requested_action
          - sensitive
          - status
          - resume_condition
          - evidence_before
          - evidence_after
        properties:
          id:
            type: string
            pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
          reason:
            type: string
            minLength: 1
          requested_action:
            type: string
            minLength: 1
          sensitive:
            type: boolean
          status:
            type: string
            enum:
              - pending
              - completed
              - skipped
          resume_condition:
            type: string
            minLength: 1
          evidence_before:
            type: array
            items:
              type: string
              pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
          evidence_after:
            type: array
            items:
              type: string
              pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
    manual_actions:
      type: array
      items:
        type: object
        additionalProperties: false
        required:
          - id
          - checkpoint
          - actor
          - summary
          - secrets_recorded
          - status
          - evidence
        properties:
          id:
            type: string
            pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
          checkpoint:
            type: string
            pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
          actor:
            type: string
            enum:
              - human
              - agent
          summary:
            type: string
            minLength: 1
          secrets_recorded:
            type: boolean
            const: false
          status:
            type: string
            enum:
              - completed
              - skipped
          evidence:
            type: array
            items:
              type: string
              pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
    cdp_health:
      type: object
      additionalProperties: false
      required:
        - required
        - checks
      properties:
        required:
          type: boolean
        checks:
          type: array
          items:
            type: object
            additionalProperties: false
            required:
              - id
              - target
              - status
              - notes
            properties:
              id:
                type: string
                pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
              target:
                type: string
                pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
              status:
                type: string
                enum:
                  - not_checked
                  - ok
                  - failed
                  - unavailable
              endpoint:
                type: string
                minLength: 1
              selected_target:
                type: string
                minLength: 1
              notes:
                type: array
                items:
                  type: string
                  minLength: 1
    dev_session:
      type: object
      additionalProperties: false
      required:
        - declaration
        - services
        - lifecycle
        - unavailable_conditions
      properties:
        declaration:
          type: string
          minLength: 1
        session_id:
          type: string
          pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
        services:
          type: array
          items:
            type: string
            pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
        lifecycle:
          type: object
          additionalProperties: false
          required:
            - plan
            - start
            - status
            - logs
            - stop
            - cleanup_status
          properties:
            plan:
              $ref: "#/definitions/lifecycle_command"
            start:
              $ref: "#/definitions/lifecycle_command"
            status:
              $ref: "#/definitions/lifecycle_command"
            logs:
              type: array
              items:
                type: object
                additionalProperties: false
                required:
                  - service
                  - command
                  - evidence
                properties:
                  service:
                    type: string
                    pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
                  command:
                    type: string
                    minLength: 1
                  evidence:
                    type: array
                    items:
                      type: string
                      pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
            stop:
              $ref: "#/definitions/lifecycle_command"
            cleanup_status:
              type: string
              enum:
                - not_started
                - not_needed
                - pending
                - stopped
                - failed
                - blocked
        unavailable_conditions:
          type: array
          items:
            type: string
            minLength: 1
    replay:
      type: object
      additionalProperties: false
      required:
        - commands
      properties:
        commands:
          type: array
          items:
            type: object
            additionalProperties: false
            required:
              - id
              - command
              - working_directory
              - layer
              - expected_result
            properties:
              id:
                type: string
                pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
              command:
                type: string
                minLength: 1
              working_directory:
                type: string
                minLength: 1
              layer:
                $ref: "#/definitions/layer"
              target:
                type: string
                pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
              expected_result:
                type: string
                minLength: 1
    verification:
      type: object
      additionalProperties: false
      required:
        - status
        - steps
        - evidence
      properties:
        status:
          type: string
          enum:
            - not_started
            - pending
            - passed
            - failed
            - blocked
        steps:
          type: array
          items:
            type: object
            additionalProperties: false
            required:
              - id
              - action
              - expected
              - status
            properties:
              id:
                type: string
                pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
              action:
                type: string
                minLength: 1
              expected:
                type: string
                minLength: 1
              status:
                type: string
                enum:
                  - pending
                  - passed
                  - failed
                  - blocked
        evidence:
          type: array
          items:
            type: string
            pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
        conclusion:
          type: string
          minLength: 1
  definitions:
    layer:
      type: string
      enum:
        - web_api
        - frontend
        - electron
        - cdp_access
    evidence_entry:
      type: object
      additionalProperties: false
      required:
        - id
        - type
        - path
        - layer
        - description
        - redacted
      properties:
        id:
          type: string
          pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
        type:
          type: string
          enum:
            - screenshot
            - network_log
            - console_log
            - api_trace
            - dom_snapshot
            - cdp_snapshot
            - video
            - text_log
            - other
        path:
          type: string
          minLength: 1
        layer:
          $ref: "#/definitions/layer"
        target:
          type: string
          pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
        description:
          type: string
          minLength: 1
        redacted:
          type: boolean
        captured_at:
          type: string
          format: date-time
    lifecycle_command:
      type: object
      additionalProperties: false
      required:
        - command
        - status
        - evidence
      properties:
        command:
          type: string
          minLength: 1
        status:
          type: string
          enum:
            - not_run
            - passed
            - failed
            - blocked
        evidence:
          type: array
          items:
            type: string
            pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
        notes:
          type: array
          items:
            type: string
            minLength: 1
`,
  "strict-spec-driven/schemas/delta-spec.yaml": `schema: strict-spec-driven/schema/v1
schema_version: 1
schema_id: strict-spec-driven/delta-spec/v1
artifact_type: delta_spec
artifact_name: delta-spec
description: Strict YAML delta spec artifact.
example_ref: ../../../examples/strict-spec-driven/delta-spec.yaml
coverage_examples:
  - ../../../examples/strict-spec-driven/delta-spec.operations.yaml
merge_rules:
  exclusive_active_target: |
    A requirement ID that appears as a MODIFIED or REMOVED target in one active change
    MUST NOT appear as a MODIFIED or REMOVED target in any other active change.
    Verify must enforce this constraint and report it as a deterministic validation failure.
  added_existing_target: |
    A requirement ID that appears as an ADDED entry MUST NOT already exist in the target
    main spec at archive time. Verify must enforce this constraint and report it as a
    deterministic validation failure before archive can rewrite main specs.
  modified_missing_target: |
    If a MODIFIED entry targets a requirement ID that does not exist in the main spec at
    archive time, the entry is treated as ADDED and recorded in the archive merge report.
  removed_missing_target: |
    If a REMOVED entry targets a requirement ID that does not exist in the main spec at
    archive time, the entry is silently skipped and recorded as a skipped removal in the
    archive merge report.
json_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  definitions:
    step:
      type: object
      properties:
        GIVEN: { type: string }
        WHEN: { type: string }
        THEN: { type: string }
        AND: { type: string }
      additionalProperties: false
      minProperties: 1
      maxProperties: 1
    requirement_value:
      type: object
      additionalProperties: false
      required:
        - strength
        - statement
        - scenarios
      properties:
        strength:
          type: string
          enum:
            - MUST
            - SHOULD
            - MAY
        statement:
          type: string
        scenarios:
          type: object
          additionalProperties:
            type: array
            items:
              "$ref": "#/definitions/step"
            minItems: 1
  type: object
  additionalProperties: false
  required:
    - schema
    - schema_version
    - artifact_type
    - schema_file
    - target_spec
    - mapping
    - operations
  properties:
    schema:
      type: string
      const: strict-spec-driven/delta-spec/v1
    schema_version:
      type: integer
      const: 1
    artifact_type:
      type: string
      const: delta_spec
    schema_file:
      type: string
    target_spec:
      type: string
    mapping:
      type: object
      additionalProperties: false
      required:
        - implementation
        - tests
      properties:
        implementation:
          type: array
          items:
            type: string
        tests:
          type: array
          items:
            type: string
    operations:
      type: object
      additionalProperties: false
      required:
        - ADDED
        - MODIFIED
        - REMOVED
      properties:
        ADDED:
          type: object
          additionalProperties:
            "$ref": "#/definitions/requirement_value"
        MODIFIED:
          type: object
          additionalProperties:
            "$ref": "#/definitions/requirement_value"
        REMOVED:
          type: object
          additionalProperties:
            type: object
            additionalProperties: false
            required:
              - reason
            properties:
              reason:
                type: string
`,
  "strict-spec-driven/schemas/dev-session.yaml": `schema: strict-spec-driven/schema/v1
schema_version: 1
schema_id: strict-spec-driven/dev-session/v1
artifact_type: dev_session
artifact_name: dev-session
description: Strict YAML development-session declaration artifact.
example_ref: ../../../examples/strict-spec-driven/dev-session.yaml
json_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  additionalProperties: false
  required:
    - schema
    - schema_version
    - artifact_type
    - schema_file
    - session
  properties:
    schema:
      type: string
      const: strict-spec-driven/dev-session/v1
    schema_version:
      type: integer
      const: 1
    artifact_type:
      type: string
      const: dev_session
    schema_file:
      type: string
    session:
      type: object
      additionalProperties: false
      required:
        - id
        - services
        - browser_targets
      properties:
        id:
          type: string
          pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
        description:
          type: string
          minLength: 1
        services:
          type: object
          minProperties: 1
          additionalProperties: false
          patternProperties:
            "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$":
              type: object
              additionalProperties: false
              required:
                - command
                - working_directory
                - environment
                - urls
                - ports
                - readiness
                - browser_targets
                - cleanup
                - unavailable_conditions
              properties:
                description:
                  type: string
                  minLength: 1
                command:
                  type: string
                  minLength: 1
                working_directory:
                  type: string
                  minLength: 1
                environment:
                  type: object
                  additionalProperties: false
                  required:
                    - required
                    - optional
                  properties:
                    required:
                      type: array
                      items:
                        type: string
                        pattern: "^[A-Z][A-Z0-9_]*$"
                    optional:
                      type: array
                      items:
                        type: string
                        pattern: "^[A-Z][A-Z0-9_]*$"
                urls:
                  type: array
                  items:
                    type: string
                    format: uri
                ports:
                  type: array
                  items:
                    type: integer
                    minimum: 1
                    maximum: 65535
                readiness:
                  type: object
                  additionalProperties: false
                  required:
                    - type
                    - timeout_seconds
                    - interval_seconds
                  properties:
                    type:
                      type: string
                      enum:
                        - http
                        - tcp
                        - manual
                    url:
                      type: string
                      format: uri
                    port:
                      type: integer
                      minimum: 1
                      maximum: 65535
                    timeout_seconds:
                      type: integer
                      minimum: 1
                    interval_seconds:
                      type: integer
                      minimum: 1
                    notes:
                      type: array
                      items:
                        type: string
                        minLength: 1
                  allOf:
                    - if:
                        properties:
                          type:
                            const: http
                      then:
                        required:
                          - url
                    - if:
                        properties:
                          type:
                            const: tcp
                      then:
                        required:
                          - port
                browser_targets:
                  type: array
                  items:
                    type: string
                    pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
                cleanup:
                  type: object
                  additionalProperties: false
                  required:
                    - mode
                    - grace_period_seconds
                  properties:
                    mode:
                      type: string
                      enum:
                        - signal
                        - command
                        - none
                    signal:
                      type: string
                      minLength: 1
                    command:
                      type: string
                      minLength: 1
                    grace_period_seconds:
                      type: integer
                      minimum: 0
                  allOf:
                    - if:
                        properties:
                          mode:
                            const: signal
                      then:
                        required:
                          - signal
                    - if:
                        properties:
                          mode:
                            const: command
                      then:
                        required:
                          - command
                unavailable_conditions:
                  type: array
                  items:
                    type: string
                    minLength: 1
        browser_targets:
          type: object
          additionalProperties: false
          patternProperties:
            "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$":
              type: object
              additionalProperties: false
              required:
                - url
                - smoke_paths
                - evidence_labels
                - local_only
              properties:
                url:
                  type: string
                  format: uri
                smoke_paths:
                  type: array
                  minItems: 1
                  items:
                    type: string
                    minLength: 1
                evidence_labels:
                  type: array
                  minItems: 1
                  items:
                    type: string
                    minLength: 1
                local_only:
                  type: boolean
                service:
                  type: string
                  pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
                notes:
                  type: array
                  items:
                    type: string
                    minLength: 1
`,
  "strict-spec-driven/schemas/main-spec.yaml": `schema: strict-spec-driven/schema/v1
schema_version: 1
schema_id: strict-spec-driven/main-spec/v1
artifact_type: main_spec
artifact_name: main-spec
description: Strict YAML main spec artifact.
example_ref: ../../../examples/strict-spec-driven/main-spec.yaml
json_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  definitions:
    step:
      type: object
      properties:
        GIVEN: { type: string }
        WHEN: { type: string }
        THEN: { type: string }
        AND: { type: string }
      additionalProperties: false
      minProperties: 1
      maxProperties: 1
  type: object
  additionalProperties: false
  required:
    - schema
    - schema_version
    - artifact_type
    - schema_file
    - spec
    - mapping
    - requirements
  properties:
    schema:
      type: string
      const: strict-spec-driven/main-spec/v1
    schema_version:
      type: integer
      const: 1
    artifact_type:
      type: string
      const: main_spec
    schema_file:
      type: string
    spec:
      type: object
      additionalProperties: false
      required:
        - id
        - title
      properties:
        id:
          type: string
        title:
          type: string
    mapping:
      type: object
      additionalProperties: false
      required:
        - implementation
        - tests
      properties:
        implementation:
          type: array
          items:
            type: string
        tests:
          type: array
          items:
            type: string
    requirements:
      type: object
      additionalProperties:
        type: object
        additionalProperties: false
        required:
          - strength
          - statement
          - scenarios
        properties:
          strength:
            type: string
            enum:
              - MUST
              - SHOULD
              - MAY
          statement:
            type: string
          scenarios:
            type: object
            additionalProperties:
              type: array
              items:
                "$ref": "#/definitions/step"
              minItems: 1
`,
  "strict-spec-driven/schemas/planned-change.yaml": `schema: strict-spec-driven/schema/v1
schema_version: 1
schema_id: strict-spec-driven/planned-change/v1
artifact_type: planned_change
artifact_name: planned-change
description: Strict YAML standalone roadmap planned-change artifact.
example_ref: ../../../examples/strict-spec-driven/planned-change.yaml
json_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  additionalProperties: false
  required:
    - schema
    - schema_version
    - artifact_type
    - schema_file
    - planned_change
    - status
    - summary
    - details
    - depends_on
  properties:
    schema:
      type: string
      const: strict-spec-driven/planned-change/v1
    schema_version:
      type: integer
      const: 1
    artifact_type:
      type: string
      const: planned_change
    schema_file:
      type: string
    planned_change:
      type: object
      additionalProperties: false
      required:
        - id
        - milestone
      properties:
        id:
          type: string
          pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$"
        milestone:
          type: string
          pattern: "^\\\\d{4}-"
    status:
      type: string
      enum:
        - planned
        - complete
    summary:
      type: string
      minLength: 1
    details:
      type: string
      minLength: 1
    depends_on:
      type: array
      items:
        type: string
    team:
      type: object
      additionalProperties: false
      properties:
        owner:
          type: string
          minLength: 1
        reviewers:
          type: array
          items:
            type: string
            minLength: 1
        blocked:
          type: object
          additionalProperties: false
          required:
            - status
          properties:
            status:
              type: boolean
            reason:
              type: string
              minLength: 1
        labels:
          type: array
          items:
            type: string
            minLength: 1
        external_refs:
          type: array
          items:
            type: object
            additionalProperties: false
            required:
              - label
              - target
            properties:
              label:
                type: string
                minLength: 1
              target:
                type: string
                minLength: 1
    extensions:
      type: object
      additionalProperties: true
`,
  "strict-spec-driven/schemas/question-list.yaml": `schema: strict-spec-driven/schema/v1
schema_version: 1
schema_id: strict-spec-driven/question-list/v1
artifact_type: question_list
artifact_name: question-list
description: Strict YAML question list artifact.
example_ref: ../../../examples/strict-spec-driven/question-list.yaml
coverage_examples:
  - ../../../examples/strict-spec-driven/question-list.open.yaml
json_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  additionalProperties: false
  required:
    - schema
    - schema_version
    - artifact_type
    - schema_file
    - change
    - open
    - resolved
  properties:
    schema:
      type: string
      const: strict-spec-driven/question-list/v1
    schema_version:
      type: integer
      const: 1
    artifact_type:
      type: string
      const: question_list
    schema_file:
      type: string
    change:
      type: string
    open:
      type: array
      items:
        type: object
        additionalProperties: false
        required:
          - id
          - question
          - context
          - status
        properties:
          id:
            type: string
          question:
            type: string
          context:
            type: string
          status:
            type: string
            const: open
    resolved:
      type: array
      items:
        type: object
        additionalProperties: false
        required:
          - id
          - question
          - context
          - answer
          - status
        properties:
          id:
            type: string
          question:
            type: string
          context:
            type: string
          answer:
            type: string
          status:
            type: string
            const: resolved
`,
  "strict-spec-driven/schemas/registry.yaml": `schema: strict-spec-driven/schema-registry/v1
schema_version: 1
artifact_type: schema_registry
schema_file: schema-registry.yaml
registry:
  id: strict-spec-driven-schema-registry
  status: current
entries:
  - schema_id: strict-spec-driven/main-spec/v1
    schema_version: 1
    artifact_type: main_spec
    artifact_name: main-spec
    schema_file: main-spec.yaml
    primary_example: ../../../examples/strict-spec-driven/main-spec.yaml
    compatibility:
      status: current
      introduced_in: 1
      supersedes: []
      compatible_with: []
      notes: []
  - schema_id: strict-spec-driven/delta-spec/v1
    schema_version: 1
    artifact_type: delta_spec
    artifact_name: delta-spec
    schema_file: delta-spec.yaml
    primary_example: ../../../examples/strict-spec-driven/delta-spec.yaml
    compatibility:
      status: current
      introduced_in: 1
      supersedes: []
      compatible_with: []
      notes: []
  - schema_id: strict-spec-driven/change-proposal/v1
    schema_version: 1
    artifact_type: change_proposal
    artifact_name: change-proposal
    schema_file: change-proposal.yaml
    primary_example: ../../../examples/strict-spec-driven/change-proposal.yaml
    compatibility:
      status: current
      introduced_in: 1
      supersedes: []
      compatible_with: []
      notes: []
  - schema_id: strict-spec-driven/change-design/v1
    schema_version: 1
    artifact_type: change_design
    artifact_name: change-design
    schema_file: change-design.yaml
    primary_example: ../../../examples/strict-spec-driven/change-design.yaml
    compatibility:
      status: current
      introduced_in: 1
      supersedes: []
      compatible_with: []
      notes: []
  - schema_id: strict-spec-driven/task-list/v1
    schema_version: 1
    artifact_type: task_list
    artifact_name: task-list
    schema_file: task-list.yaml
    primary_example: ../../../examples/strict-spec-driven/task-list.yaml
    compatibility:
      status: superseded
      introduced_in: 1
      supersedes: []
      superseded_by: strict-spec-driven/task-list/v2
      compatible_with: []
      notes:
        - Superseded by v2 keyed-map format.
  - schema_id: strict-spec-driven/task-list/v2
    schema_version: 2
    artifact_type: task_list
    artifact_name: task-list
    schema_file: task-list.yaml
    primary_example: ../../../examples/strict-spec-driven/task-list.yaml
    compatibility:
      status: current
      introduced_in: 2
      supersedes:
        - strict-spec-driven/task-list/v1
      compatible_with:
        - strict-spec-driven/task-list/v1
      notes:
        - Sections and tasks use keyed maps instead of arrays.
  - schema_id: strict-spec-driven/question-list/v1
    schema_version: 1
    artifact_type: question_list
    artifact_name: question-list
    schema_file: question-list.yaml
    primary_example: ../../../examples/strict-spec-driven/question-list.yaml
    compatibility:
      status: current
      introduced_in: 1
      supersedes: []
      compatible_with: []
      notes: []
  - schema_id: strict-spec-driven/spec-index/v1
    schema_version: 1
    artifact_type: spec_index
    artifact_name: spec-index
    schema_file: spec-index.yaml
    primary_example: ../../../examples/strict-spec-driven/spec-index.yaml
    compatibility:
      status: current
      introduced_in: 1
      supersedes: []
      compatible_with: []
      notes: []
  - schema_id: strict-spec-driven/roadmap-index/v1
    schema_version: 1
    artifact_type: roadmap_index
    artifact_name: roadmap-index
    schema_file: roadmap-index.yaml
    primary_example: ../../../examples/strict-spec-driven/roadmap-index.yaml
    compatibility:
      status: superseded
      introduced_in: 1
      supersedes: []
      superseded_by: strict-spec-driven/roadmap-index/v2
      compatible_with: []
      notes:
        - Superseded by v2 keyed milestone map format.
  - schema_id: strict-spec-driven/roadmap-index/v2
    schema_version: 2
    artifact_type: roadmap_index
    artifact_name: roadmap-index
    schema_file: roadmap-index.yaml
    primary_example: ../../../examples/strict-spec-driven/roadmap-index.yaml
    compatibility:
      status: current
      introduced_in: 2
      supersedes:
        - strict-spec-driven/roadmap-index/v1
      compatible_with: []
      notes:
        - Milestones use keyed map with 4-digit-prefixed IDs instead of array.
  - schema_id: strict-spec-driven/roadmap-milestone/v1
    schema_version: 1
    artifact_type: roadmap_milestone
    artifact_name: roadmap-milestone
    schema_file: roadmap-milestone.yaml
    primary_example: ../../../examples/strict-spec-driven/roadmap-milestone.yaml
    compatibility:
      status: superseded
      introduced_in: 1
      supersedes: []
      superseded_by: strict-spec-driven/roadmap-milestone/v2
      compatible_with: []
      notes:
        - Superseded by v2 keyed identity and keyed planned changes format.
  - schema_id: strict-spec-driven/roadmap-milestone/v2
    schema_version: 2
    artifact_type: roadmap_milestone
    artifact_name: roadmap-milestone
    schema_file: roadmap-milestone.yaml
    primary_example: ../../../examples/strict-spec-driven/roadmap-milestone.yaml
    compatibility:
      status: current
      introduced_in: 2
      supersedes:
        - strict-spec-driven/roadmap-milestone/v1
      compatible_with: []
      notes:
        - Milestone identity is a keyed map with 4-digit-prefixed key.
        - Milestone files keep planned_changes empty in normal split-file roadmap usage; non-empty inline entries are legacy data for explicit materialization.
        - Planned-change-entry no longer exists as independent artifact type.
  - schema_id: strict-spec-driven/planned-change/v1
    schema_version: 1
    artifact_type: planned_change
    artifact_name: planned-change
    schema_file: planned-change.yaml
    primary_example: ../../../examples/strict-spec-driven/planned-change.yaml
    compatibility:
      status: current
      introduced_in: 1
      supersedes: []
      compatible_with: []
      notes:
        - Standalone planned changes are the normal roadmap work-item surface; materialize legacy inline milestone entries before running ordinary roadmap commands.
        - Optional team metadata is advisory coordination data and is not a locking or permission mechanism.
  - schema_id: strict-spec-driven/dev-session/v1
    schema_version: 1
    artifact_type: dev_session
    artifact_name: dev-session
    schema_file: dev-session.yaml
    primary_example: ../../../examples/strict-spec-driven/dev-session.yaml
    compatibility:
      status: current
      introduced_in: 1
      supersedes: []
      compatible_with: []
      notes:
        - Development-session artifacts declare local services, browser targets, and cleanup guidance without storing secret values.
  - schema_id: strict-spec-driven/debug-session/v1
    schema_version: 1
    artifact_type: debug_session
    artifact_name: debug-session
    schema_file: debug-session.yaml
    primary_example: ../../../examples/strict-spec-driven/debug-session.yaml
    compatibility:
      status: current
      introduced_in: 1
      supersedes: []
      compatible_with: []
      notes:
        - Debug-session artifacts record local investigations, evidence, layer localization, human checkpoints, manual actions, CDP health, replay, and verification without storing secret values.
  - schema_id: strict-spec-driven/schema-registry/v1
    schema_version: 1
    artifact_type: schema_registry
    artifact_name: schema-registry
    schema_file: schema-registry.yaml
    primary_example: ../../../examples/strict-spec-driven/schema-registry.yaml
    compatibility:
      status: current
      introduced_in: 1
      supersedes: []
      compatible_with: []
      notes: []
migration:
  legacy_root: .spec-driven
  strict_root: .strict-spec-driven
  role_mappings:
    - legacy_role: main_spec_markdown
      artifact_type: main_spec
      schema_id: strict-spec-driven/main-spec/v1
    - legacy_role: delta_spec_markdown
      artifact_type: delta_spec
      schema_id: strict-spec-driven/delta-spec/v1
    - legacy_role: change_proposal_markdown
      artifact_type: change_proposal
      schema_id: strict-spec-driven/change-proposal/v1
    - legacy_role: change_design_markdown
      artifact_type: change_design
      schema_id: strict-spec-driven/change-design/v1
    - legacy_role: task_list_markdown
      artifact_type: task_list
      schema_id: strict-spec-driven/task-list/v1
    - legacy_role: question_list_markdown
      artifact_type: question_list
      schema_id: strict-spec-driven/question-list/v1
    - legacy_role: spec_index_markdown
      artifact_type: spec_index
      schema_id: strict-spec-driven/spec-index/v1
    - legacy_role: roadmap_index_markdown
      artifact_type: roadmap_index
      schema_id: strict-spec-driven/roadmap-index/v2
    - legacy_role: roadmap_milestone_markdown
      artifact_type: roadmap_milestone
      schema_id: strict-spec-driven/roadmap-milestone/v2
  unsupported_shape_reporting:
    warning_fields:
      - source_path
      - legacy_role
      - reason
      - manual_follow_up
    manual_follow_up_field: manual_follow_up
`,
  "strict-spec-driven/schemas/roadmap-index.yaml": `schema: strict-spec-driven/schema/v1
schema_version: 1
schema_id: strict-spec-driven/roadmap-index/v2
artifact_type: roadmap_index
artifact_name: roadmap-index
description: Strict YAML roadmap index artifact (v2 — keyed milestone map).
example_ref: ../../../examples/strict-spec-driven/roadmap-index.yaml
json_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  additionalProperties: false
  required:
    - schema
    - schema_version
    - artifact_type
    - schema_file
    - milestones
  properties:
    schema:
      type: string
      const: strict-spec-driven/roadmap-index/v2
    schema_version:
      type: integer
      const: 2
    artifact_type:
      type: string
      const: roadmap_index
    schema_file:
      type: string
    milestones:
      type: object
      additionalProperties: false
      patternProperties:
        "^\\\\d{4}-":
          type: object
          additionalProperties: false
          required:
            - title
            - path
            - status
          properties:
            title:
              type: string
            path:
              type: string
            status:
              type: string
              enum:
                - proposed
                - active
                - blocked
                - complete
`,
  "strict-spec-driven/schemas/roadmap-milestone.yaml": `schema: strict-spec-driven/schema/v1
schema_version: 1
schema_id: strict-spec-driven/roadmap-milestone/v2
artifact_type: roadmap_milestone
artifact_name: roadmap-milestone
description: Strict YAML roadmap milestone artifact (v2 — keyed milestone identity plus reserved planned_changes mapping for explicit legacy materialization workflows).
example_ref: ../../../examples/strict-spec-driven/roadmap-milestone.yaml
json_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  additionalProperties: false
  required:
    - schema
    - schema_version
    - artifact_type
    - schema_file
    - milestone
    - goal
    - scope
    - done_criteria
    - planned_changes
    - dependencies
    - risks
    - status
    - notes
  properties:
    schema:
      type: string
      const: strict-spec-driven/roadmap-milestone/v2
    schema_version:
      type: integer
      const: 2
    artifact_type:
      type: string
      const: roadmap_milestone
    schema_file:
      type: string
    milestone:
      type: object
      additionalProperties: false
      minProperties: 1
      maxProperties: 1
      patternProperties:
        "^\\\\d{4}-":
          type: object
          additionalProperties: false
          required:
            - title
          properties:
            title:
              type: string
    goal:
      type: string
    scope:
      type: object
      additionalProperties: false
      required:
        - in
        - out
      properties:
        in:
          type: array
          items:
            type: string
        out:
          type: array
          items:
            type: string
    done_criteria:
      type: array
      items:
        type: string
    planned_changes:
      type: object
      additionalProperties: false
      patternProperties:
        "^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$":
          type: object
          additionalProperties: false
          required:
            - status
            - summary
            - details
            - depends_on
          properties:
            status:
              type: string
              enum:
                - planned
                - complete
            summary:
              type: string
            details:
              type: string
              minLength: 1
            depends_on:
              type: array
              items:
                type: string
    dependencies:
      type: array
      items:
        type: string
    risks:
      type: array
      items:
        type: string
    status:
      type: string
      enum:
        - proposed
        - active
        - blocked
        - complete
    notes:
      type: array
      items:
        type: string
    details:
      type: string
`,
  "strict-spec-driven/schemas/schema-registry.yaml": `schema: strict-spec-driven/schema/v1
schema_version: 1
schema_id: strict-spec-driven/schema-registry/v1
artifact_type: schema_registry
artifact_name: schema-registry
description: Strict YAML schema registry artifact.
example_ref: ../../../examples/strict-spec-driven/schema-registry.yaml
additional_fields: false
fields:
  schema:
    type: string
    required: true
    const: strict-spec-driven/schema-registry/v1
  schema_version:
    type: integer
    required: true
    const: 1
  artifact_type:
    type: string
    required: true
    const: schema_registry
  schema_file:
    type: string
    required: true
  registry:
    type: mapping
    required: true
    additional_fields: false
    fields:
      id:
        type: string
        required: true
        identifier: registry
      status:
        type: string
        required: true
        enum:
          - current
          - deprecated
          - superseded
  entries:
    type: sequence
    required: true
    min_items: 1
    unique_by: schema_id
    items:
      type: mapping
      additional_fields: false
      fields:
        schema_id:
          type: string
          required: true
          identifier: schema
        schema_version:
          type: integer
          required: true
        artifact_type:
          type: string
          required: true
        artifact_name:
          type: string
          required: true
        schema_file:
          type: string
          required: true
        primary_example:
          type: string
          required: true
        compatibility:
          type: mapping
          required: true
          additional_fields: false
          fields:
            status:
              type: string
              required: true
              enum:
                - current
                - deprecated
                - superseded
            introduced_in:
              type: integer
              required: true
            supersedes:
              type: sequence
              required: true
              items:
                type: string
            superseded_by:
              type: string
              required: false
            compatible_with:
              type: sequence
              required: true
              items:
                type: string
            notes:
              type: sequence
              required: true
              items:
                type: string
  migration:
    type: mapping
    required: true
    additional_fields: false
    fields:
      legacy_root:
        type: string
        required: true
      strict_root:
        type: string
        required: true
      role_mappings:
        type: sequence
        required: true
        min_items: 1
        unique_by: legacy_role
        items:
          type: mapping
          additional_fields: false
          fields:
            legacy_role:
              type: string
              required: true
            artifact_type:
              type: string
              required: true
            schema_id:
              type: string
              required: true
              references: entries.schema_id
      unsupported_shape_reporting:
        type: mapping
        required: true
        additional_fields: false
        fields:
          warning_fields:
            type: sequence
            required: true
            min_items: 1
            items:
              type: string
          manual_follow_up_field:
            type: string
            required: true
`,
  "strict-spec-driven/schemas/spec-index.yaml": `schema: strict-spec-driven/schema/v1
schema_version: 1
schema_id: strict-spec-driven/spec-index/v1
artifact_type: spec_index
artifact_name: spec-index
description: Strict YAML spec index artifact.
example_ref: ../../../examples/strict-spec-driven/spec-index.yaml
json_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  additionalProperties: false
  required:
    - schema
    - schema_version
    - artifact_type
    - schema_file
    - specs
  properties:
    schema:
      type: string
      const: strict-spec-driven/spec-index/v1
    schema_version:
      type: integer
      const: 1
    artifact_type:
      type: string
      const: spec_index
    schema_file:
      type: string
    specs:
      type: array
      items:
        type: object
        additionalProperties: false
        required:
          - id
          - title
          - path
        properties:
          id:
            type: string
          title:
            type: string
          path:
            type: string
`,
  "strict-spec-driven/schemas/task-list.yaml": `schema: strict-spec-driven/schema/v1
schema_version: 1
schema_id: strict-spec-driven/task-list/v2
artifact_type: task_list
artifact_name: task-list
description: Strict YAML task list artifact (v2 keyed-map format).
example_ref: ../../../examples/strict-spec-driven/task-list.yaml
json_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  additionalProperties: false
  required:
    - schema
    - schema_version
    - artifact_type
    - schema_file
    - change
    - sections
    - testing_gates
  properties:
    schema:
      type: string
      const: strict-spec-driven/task-list/v2
    schema_version:
      type: integer
      const: 2
    artifact_type:
      type: string
      const: task_list
    schema_file:
      type: string
    change:
      type: string
    sections:
      type: object
      additionalProperties: false
      properties:
        Implementation:
          type: object
          minProperties: 1
          additionalProperties:
            type: object
            additionalProperties: false
            required:
              - text
              - status
            properties:
              text:
                type: string
              status:
                type: string
                enum:
                  - pending
                  - complete
              command:
                type: string
        Testing:
          type: object
          minProperties: 1
          additionalProperties:
            type: object
            additionalProperties: false
            required:
              - text
              - status
            properties:
              text:
                type: string
              status:
                type: string
                enum:
                  - pending
                  - complete
              command:
                type: string
        Verification:
          type: object
          minProperties: 1
          additionalProperties:
            type: object
            additionalProperties: false
            required:
              - text
              - status
            properties:
              text:
                type: string
              status:
                type: string
                enum:
                  - pending
                  - complete
              command:
                type: string
    testing_gates:
      type: object
      additionalProperties: false
      required:
        - validation_task
        - unit_test_task
      properties:
        validation_task:
          type: string
        unit_test_task:
          type: string
`
};
function hasEmbeddedTemplate(key) {
  return key in EMBEDDED_TEMPLATES;
}
function getEmbeddedTemplateKeys() {
  return Object.keys(EMBEDDED_TEMPLATES).sort();
}
function readEmbeddedTemplate(key) {
  return EMBEDDED_TEMPLATES[key];
}

// src/yaml.ts
import { readFileSync } from "fs";

// node_modules/js-yaml/dist/js-yaml.mjs
/*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT */
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence))
    return sequence;
  else if (isNothing(sequence))
    return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length;index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0;cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
};
function formatError(exception, compact) {
  var where = "", message = exception.reason || "(unknown reason)";
  if (!exception.mark)
    return message;
  if (exception.mark.name) {
    where += 'in "' + exception.mark.name + '" ';
  }
  where += "(" + (exception.mark.line + 1) + ":" + (exception.mark.column + 1) + ")";
  if (!compact && exception.mark.snippet) {
    where += `

` + exception.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$1(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "→") + tail,
    pos: position - lineStart + head.length
  };
}
function padStart(string, max) {
  return common.repeat(" ", max - string.length) + string;
}
function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer)
    return null;
  if (!options.maxLength)
    options.maxLength = 79;
  if (typeof options.indent !== "number")
    options.indent = 1;
  if (typeof options.linesBefore !== "number")
    options.linesBefore = 3;
  if (typeof options.linesAfter !== "number")
    options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0)
    foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i = 1;i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0)
      break;
    line = getLine(mark.buffer, lineStarts[foundLineNo - i], lineEnds[foundLineNo - i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]), maxLineLength);
    result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + `
` + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + `
`;
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^" + `
`;
  for (i = 1;i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length)
      break;
    line = getLine(mark.buffer, lineStarts[foundLineNo + i], lineEnds[foundLineNo + i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]), maxLineLength);
    result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + `
`;
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map) {
  var result = {};
  if (map !== null) {
    Object.keys(map).forEach(function(style) {
      map[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$1;
function compileList(schema, name) {
  var result = [];
  schema[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length;index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof type) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit)
      implicit = implicit.concat(definition.implicit);
    if (definition.explicit)
      explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception("Schema.extend argument should be a Type, [ Type ], " + "or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type$1.loadKind && type$1.loadKind !== "scalar") {
      throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type$1.multi) {
      throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var str = new type("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var seq = new type("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var map = new type("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});
function resolveYamlNull(data) {
  if (data === null)
    return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new type("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
  if (data === null)
    return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new type("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null)
    return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max)
    return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max)
      return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (;index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (ch !== "0" && ch !== "1")
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (;index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isHexCode(data.charCodeAt(index)))
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (;index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isOctCode(data.charCodeAt(index)))
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_")
    return false;
  for (;index < max; index++) {
    ch = data[index];
    if (ch === "_")
      continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_")
    return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-")
      sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0")
    return 0;
  if (ch === "0") {
    if (value[1] === "b")
      return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x")
      return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o")
      return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
var int = new type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var YAML_FLOAT_PATTERN = new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?" + "|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?" + "|[-+]?\\.(?:inf|Inf|INF)" + "|\\.(?:nan|NaN|NAN))$");
function resolveYamlFloat(data) {
  if (data === null)
    return false;
  if (!YAML_FLOAT_PATTERN.test(data) || data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
var float = new type("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" + "-([0-9][0-9])" + "-([0-9][0-9])$");
var YAML_TIMESTAMP_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" + "-([0-9][0-9]?)" + "-([0-9][0-9]?)" + "(?:[Tt]|[ \\t]+)" + "([0-9][0-9]?)" + ":([0-9][0-9])" + ":([0-9][0-9])" + "(?:\\.([0-9]*))?" + "(?:[ \\t]*(Z|([-+])([0-9][0-9]?)" + "(?::([0-9][0-9]))?))?$");
function resolveYamlTimestamp(data) {
  if (data === null)
    return false;
  if (YAML_DATE_REGEXP.exec(data) !== null)
    return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null)
    return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null)
    match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null)
    throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000;
    if (match[9] === "-")
      delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta)
    date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new type("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var BASE64_MAP = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function resolveYamlBinary(data) {
  if (data === null)
    return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0;idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64)
      continue;
    if (code < 0)
      return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0;idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0;idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new type("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null)
    return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length;index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]")
      return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey)
          pairHasKey = true;
        else
          return false;
      }
    }
    if (!pairHasKey)
      return false;
    if (objectKeys.indexOf(pairKey) === -1)
      objectKeys.push(pairKey);
    else
      return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null)
    return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length;index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]")
      return false;
    keys = Object.keys(pair);
    if (keys.length !== 1)
      return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null)
    return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length;index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new type("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null)
    return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null)
        return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\x00" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "\t" : c === 9 ? "\t" : c === 110 ? `
` : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "" : c === 95 ? " " : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode((c - 65536 >> 10) + 55296, (c - 65536 & 1023) + 56320);
}
function setProperty(object, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    });
  } else {
    object[key] = value;
  }
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (i = 0;i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
var i;
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length;_position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length;index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      setProperty(destination, key, source[key]);
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length;index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length;index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    setProperty(_result, keyNode, valueNode);
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat(`
`, count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (;hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat(`
`, didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += `
`;
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat(`
`, didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat(`
`, emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat(`
`, emptyLines);
      }
    } else {
      state.result += common.repeat(`
`, didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1)
    return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1)
    return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33)
    return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38)
    return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42)
    return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length;typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length;typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = Object.create(null);
  state.anchorMap = Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch))
        break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0)
      readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += `
`;
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\x00");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\x00";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length;index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = "\\\"";
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null)
    return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length;index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
var QUOTING_TYPE_SINGLE = 1;
var QUOTING_TYPE_DOUBLE = 2;
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf(`
`, position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== `
`)
      result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return `
` + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length;index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (inblock ? cIsNsCharOrWhitespace : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar;
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
var STYLE_PLAIN = 1;
var STYLE_SINGLE = 2;
var STYLE_LITERAL = 3;
var STYLE_FOLDED = 4;
var STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i2;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i2 = 0;i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
      char = codePointAt(string, i2);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i2 = 0;i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
      char = codePointAt(string, i2);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i2;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = function() {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  }();
}
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === `
`;
  var keep = clip && (string[string.length - 2] === `
` || string === `
`);
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + `
`;
}
function dropEndingNewline(string) {
  return string[string.length - 1] === `
` ? string.slice(0, -1) : string;
}
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = function() {
    var nextLF = string.indexOf(`
`);
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }();
  var prevMoreIndented = string[0] === `
` || string[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? `
` : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ")
    return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += `
` + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += `
`;
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + `
` + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i2 = 0;i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
    char = codePointAt(string, i2);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string[i2];
      if (char >= 65536)
        result += string[i2 + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length;index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "")
        _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length;index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length;index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "")
      pairBuffer += ", ";
    if (state.condenseFlow)
      pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024)
      pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length;index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length;index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid)
        return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(state.tag[0] === "!" ? state.tag.slice(1) : state.tag).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length;index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length;index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length;index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs)
    getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true))
    return state.dump + `
`;
  return "";
}
var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. " + "Use yaml." + to + " instead, which is now safe by default.");
  };
}
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var YAMLException = exception;
var safeLoad = renamed("safeLoad", "load");
var safeLoadAll = renamed("safeLoadAll", "loadAll");
var safeDump = renamed("safeDump", "dump");

// src/yaml.ts
function describeCodePoint(codePoint) {
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;
}
function escapeCharacterForDisplay(value) {
  switch (value) {
    case "\\":
      return "\\\\";
    case "'":
      return "\\'";
    case "\x00":
      return "\\0";
    case "\b":
      return "\\b";
    case "\t":
      return "\\t";
    case `
`:
      return "\\n";
    case "\v":
      return "\\v";
    case "\f":
      return "\\f";
    case "\r":
      return "\\r";
    default:
      return value;
  }
}
function describeCharacterLabel(value) {
  switch (value) {
    case "\x00":
      return "null byte";
    case "\b":
      return "backspace";
    case "\t":
      return "tab";
    case `
`:
      return "newline";
    case "\v":
      return "vertical tab";
    case "\f":
      return "form feed";
    case "\r":
      return "carriage return";
    case " ":
      return "space";
    default:
      return null;
  }
}
function describeOffendingCharacter(mark) {
  if (!mark || typeof mark.position !== "number" || mark.position < 0 || mark.position >= mark.buffer.length) {
    return;
  }
  const character = mark.buffer.slice(mark.position, mark.position + 1);
  if (!character) {
    return;
  }
  const codePoint = character.codePointAt(0);
  if (codePoint === undefined) {
    return;
  }
  const label = describeCharacterLabel(character);
  const display = escapeCharacterForDisplay(character);
  return label ? `'${display}' (${label}, ${describeCodePoint(codePoint)})` : `'${display}' (${describeCodePoint(codePoint)})`;
}
function buildYamlParseDetails(error, source) {
  return {
    errorType: error.name || "YAMLException",
    reason: typeof error.reason === "string" ? error.reason : undefined,
    line: typeof error.mark?.line === "number" ? error.mark.line + 1 : undefined,
    column: typeof error.mark?.column === "number" ? error.mark.column + 1 : undefined,
    snippet: typeof error.mark?.snippet === "string" && error.mark.snippet.trim().length > 0 ? error.mark.snippet : undefined,
    offendingCharacter: describeOffendingCharacter(error.mark),
    source
  };
}
function formatLocation(details) {
  if (typeof details.line !== "number") {
    return;
  }
  if (typeof details.column !== "number") {
    return `line ${details.line}`;
  }
  return `line ${details.line}, column ${details.column}`;
}
function formatYamlParseSummary(input) {
  const details = isYamlParseDetails(input) ? input : getYamlParseDetails(input);
  if (!details) {
    return input instanceof Error ? input.message : String(input);
  }
  const parts = [];
  if (details.reason) {
    parts.push(details.reason);
  } else {
    parts.push("failed to parse YAML");
  }
  const location = formatLocation(details);
  if (location) {
    parts.push(location);
  }
  if (details.offendingCharacter) {
    parts.push(`offending character ${details.offendingCharacter}`);
  }
  return parts.join("; ");
}
function formatYamlParseMessage(details) {
  const summary = formatYamlParseSummary(details);
  if (details.source) {
    return `${details.source}: ${summary}`;
  }
  return summary;
}
function isYamlParseDetails(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const candidate = value;
  return typeof candidate.errorType === "string";
}

class YamlParseError extends Error {
  errorType;
  reason;
  line;
  column;
  snippet;
  offendingCharacter;
  source;
  constructor(details) {
    super(formatYamlParseMessage(details));
    this.name = "YamlParseError";
    this.errorType = details.errorType;
    this.reason = details.reason;
    this.line = details.line;
    this.column = details.column;
    this.snippet = details.snippet;
    this.offendingCharacter = details.offendingCharacter;
    this.source = details.source;
  }
}
function getYamlParseDetails(error) {
  if (error instanceof YamlParseError) {
    return {
      errorType: error.errorType,
      reason: error.reason,
      line: error.line,
      column: error.column,
      snippet: error.snippet,
      offendingCharacter: error.offendingCharacter,
      source: error.source
    };
  }
  if (error instanceof YAMLException) {
    return buildYamlParseDetails(error);
  }
  return null;
}
function getYamlDiagnosticDetails(error) {
  const details = getYamlParseDetails(error);
  if (!details) {
    return null;
  }
  return {
    errorType: details.errorType,
    reason: details.reason,
    line: details.line,
    column: details.column,
    snippet: details.snippet,
    offendingCharacter: details.offendingCharacter
  };
}
function parseYamlDocument(input, options) {
  try {
    return load(input);
  } catch (error) {
    if (error instanceof YamlParseError) {
      throw error;
    }
    if (error instanceof YAMLException) {
      throw new YamlParseError(buildYamlParseDetails(error, options?.source));
    }
    throw error;
  }
}
function stringifyYamlDocument(value) {
  return dump(value, { lineWidth: 100 });
}
function parseYamlFile(path) {
  return parseYamlDocument(readFileSync(path, "utf8"), { source: path });
}

// src/scaffold.ts
function getBundledDir(...segments) {
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.join(thisDir, "templates", ...segments);
  if (existsSync(distPath))
    return distPath;
  return path.join(thisDir, "..", "templates", ...segments);
}
var BUNDLED_SCAFFOLD_DIR = getBundledDir("strict-spec-driven", "scaffold");
function scaffoldTemplateKey(relativePath) {
  return `strict-spec-driven/scaffold/${relativePath}`;
}
var REQUIRED_SCAFFOLD_ASSETS = [
  "config.yaml",
  "dev-session.yaml",
  "specs/INDEX.yaml",
  "roadmap/INDEX.yaml"
];
var REQUIRED_CHANGE_TEMPLATE_ASSETS = [
  "changes/proposal.yaml",
  "changes/design.yaml",
  "changes/tasks.yaml",
  "changes/questions.yaml"
];
var CHANGE_TEMPLATE_NAME_PLACEHOLDER = "{{change_name}}";
var STRICT_WORKFLOW_DIR = ".strict-spec-driven";
var LEGACY_WORKFLOW_DIR = ".spec-driven";
function normalizeRelativeScaffoldPath(relativePath) {
  const normalized = relativePath.split("\\").join("/");
  if (path.isAbsolute(normalized)) {
    throw new Error(`Scaffold asset path must be repo-relative, got '${relativePath}'`);
  }
  const parts = normalized.split("/");
  if (!normalized || parts.some((part) => part.length === 0 || part === "." || part === "..")) {
    throw new Error(`Scaffold asset path must be normalized, got '${relativePath}'`);
  }
  return normalized;
}
function toRepoRelativePath(rootDir, absolutePath) {
  return path.relative(rootDir, absolutePath).split(path.sep).join("/");
}
function directoryTreeContainsFiles(directoryPath) {
  for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (directoryTreeContainsFiles(path.join(directoryPath, entry.name))) {
        return true;
      }
      continue;
    }
    return true;
  }
  return false;
}
function getBundledScaffoldPath(relativePath) {
  const normalized = normalizeRelativeScaffoldPath(relativePath);
  const resolved = path.resolve(BUNDLED_SCAFFOLD_DIR, normalized);
  const relativeToRoot = path.relative(BUNDLED_SCAFFOLD_DIR, resolved);
  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    throw new Error(`Scaffold asset path escapes scaffold root: '${relativePath}'`);
  }
  return resolved;
}
function readBundledScaffoldTemplate(relativePath) {
  const embedded = readEmbeddedTemplate(scaffoldTemplateKey(relativePath));
  if (embedded !== undefined)
    return embedded;
  return readFileSync2(getBundledScaffoldPath(relativePath), "utf8");
}
function loadBundledScaffoldYaml(relativePath) {
  return parseYamlDocument(readBundledScaffoldTemplate(relativePath));
}
function getRequiredBundledScaffoldAssets() {
  return [...REQUIRED_SCAFFOLD_ASSETS];
}
function findMissingRequiredScaffoldAssets() {
  return getRequiredBundledScaffoldAssets().filter((relativePath) => !hasEmbeddedTemplate(scaffoldTemplateKey(relativePath)) && !existsSync(getBundledScaffoldPath(relativePath)));
}
function getRequiredBundledChangeTemplateAssets() {
  return [...REQUIRED_CHANGE_TEMPLATE_ASSETS];
}
function findMissingRequiredChangeTemplateAssets() {
  return getRequiredBundledChangeTemplateAssets().filter((relativePath) => !hasEmbeddedTemplate(scaffoldTemplateKey(relativePath)) && !existsSync(getBundledScaffoldPath(relativePath)));
}
function initializeStrictChangeScaffold(rootDir, changeName) {
  const strictChangesRootDir = path.join(rootDir, STRICT_WORKFLOW_DIR, "changes");
  const changeDir = path.join(strictChangesRootDir, changeName);
  const repoRelativeChangeDir = toRepoRelativePath(rootDir, changeDir);
  if (existsSync(changeDir)) {
    if (!statSync(changeDir).isDirectory()) {
      throw new Error(`change '${changeName}' already exists at ${repoRelativeChangeDir}`);
    }
    if (directoryTreeContainsFiles(changeDir)) {
      throw new Error(`change '${changeName}' already exists at ${repoRelativeChangeDir}`);
    }
  }
  mkdirSync(changeDir, { recursive: true });
  const planningArtifacts = [];
  for (const templateAssetPath of getRequiredBundledChangeTemplateAssets()) {
    const outputFileName = path.basename(templateAssetPath);
    const outputPath = path.join(changeDir, outputFileName);
    const templateContent = readBundledScaffoldTemplate(templateAssetPath);
    const outputContent = templateContent.replaceAll(CHANGE_TEMPLATE_NAME_PLACEHOLDER, changeName);
    writeFileSync(outputPath, outputContent, "utf8");
    planningArtifacts.push(toRepoRelativePath(rootDir, outputPath));
  }
  const specsDir = path.join(changeDir, "specs");
  mkdirSync(specsDir, { recursive: true });
  return {
    changeDir: repoRelativeChangeDir,
    planningArtifacts,
    specsDir: `${toRepoRelativePath(rootDir, specsDir)}/`
  };
}
function initializeStrictScaffold(rootDir) {
  const warnings = [];
  const created = [];
  const skipped = [];
  const strictRootDir = path.join(rootDir, STRICT_WORKFLOW_DIR);
  const legacyRootDir = path.join(rootDir, LEGACY_WORKFLOW_DIR);
  if (existsSync(legacyRootDir) && statSync(legacyRootDir).isDirectory()) {
    warnings.push("Warning: detected legacy '.spec-driven/' directory; strict init will continue using '.strict-spec-driven/'.");
  }
  for (const assetPath of getRequiredBundledScaffoldAssets()) {
    const targetPath = path.join(strictRootDir, assetPath);
    if (existsSync(targetPath)) {
      skipped.push(assetPath);
      continue;
    }
    mkdirSync(path.dirname(targetPath), { recursive: true });
    const embedded = readEmbeddedTemplate(scaffoldTemplateKey(assetPath));
    if (embedded !== undefined) {
      writeFileSync(targetPath, embedded, "utf8");
    } else {
      copyFileSync(getBundledScaffoldPath(assetPath), targetPath);
    }
    created.push(assetPath);
  }
  return {
    rootDir: strictRootDir,
    created,
    skipped,
    warnings
  };
}

// src/cli/cmd-scaffold.ts
function runInit(argv = []) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven init
`);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(`Usage: strict-spec-driven init
`);
    return 1;
  }
  const missingAssets = findMissingRequiredScaffoldAssets();
  if (missingAssets.length > 0) {
    writeError("missing bundled scaffold assets required by init:");
    for (const assetPath of missingAssets) {
      writeErr(`- ${assetPath}
`);
    }
    return 1;
  }
  const result = initializeStrictScaffold(process.cwd());
  for (const warning of result.warnings) {
    writeErr(`${warning}
`);
  }
  writeOut(`Initialized ${result.rootDir}
`);
  writeOut(`Created ${result.created.length} scaffold file(s).
`);
  writeOut(`Skipped ${result.skipped.length} existing scaffold file(s).
`);
  return 0;
}
function runPropose(argv) {
  const [changeName, ...extraArgs] = argv;
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven propose <change-name>
`);
    return 0;
  }
  if (!changeName || extraArgs.length > 0) {
    writeUsage(`Usage: strict-spec-driven propose <change-name>
`);
    return 1;
  }
  if (!CHANGE_NAME_PATTERN.test(changeName)) {
    writeError("change name must be kebab-case (lowercase letters, numbers, and hyphens)");
    return 1;
  }
  const missingAssets = findMissingRequiredChangeTemplateAssets();
  if (missingAssets.length > 0) {
    writeError("missing bundled change templates required by propose:");
    for (const assetPath of missingAssets) {
      writeErr(`- ${assetPath}
`);
    }
    return 1;
  }
  try {
    const result = initializeStrictChangeScaffold(process.cwd(), changeName);
    writeOut(`Created strict change scaffold at ${result.changeDir}/
`);
    writeOut(`Planning artifacts:
`);
    for (const artifactPath of result.planningArtifacts) {
      writeOut(`- ${artifactPath}
`);
    }
    writeOut(`- ${result.specsDir}
`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeError(message);
    return 1;
  }
}

// src/cli/cmd-generation.ts
import { existsSync as existsSync4, readFileSync as readFileSync5 } from "fs";
import path4 from "path";

// src/propose-generation.ts
import { existsSync as existsSync3, mkdirSync as mkdirSync2, readFileSync as readFileSync4, statSync as statSync2, writeFileSync as writeFileSync2 } from "fs";
import path3 from "path";

// src/validation.ts
var import_ajv = __toESM(require_ajv(), 1);
var import_ajv_formats = __toESM(require_dist(), 1);
import { existsSync as existsSync2, readFileSync as readFileSync3 } from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
function getBundledDir2(...segments) {
  const thisDir = path2.dirname(fileURLToPath2(import.meta.url));
  const distPath = path2.join(thisDir, "templates", ...segments);
  if (existsSync2(distPath))
    return distPath;
  return path2.join(thisDir, "..", "templates", ...segments);
}
var BUNDLED_SCHEMA_DIR = getBundledDir2("strict-spec-driven", "schemas");
function schemaTemplateKey(schemaFile) {
  return `strict-spec-driven/schemas/${schemaFile}`;
}
function readBundledSchemaContent(schemaFile) {
  const embedded = readEmbeddedTemplate(schemaTemplateKey(schemaFile));
  if (embedded !== undefined)
    return embedded;
  return readFileSync3(getBundledSchemaPath(schemaFile), "utf8");
}
function resolveAjvConstructor() {
  const value = import_ajv.default;
  return value.default ?? import_ajv.default;
}
function resolveFormatsPlugin() {
  const value = import_ajv_formats.default;
  return value.default ?? import_ajv_formats.default;
}
function asObject(value, description) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${description} must be a YAML mapping`);
  }
  return value;
}
function asSequence(value) {
  return Array.isArray(value) ? value : [];
}
function stringifyValue(value) {
  if (value === undefined) {
    return "undefined";
  }
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
}
function escapeJsonPointerSegment(value) {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}
function decodeJsonPointerSegment(value) {
  return value.replaceAll("~1", "/").replaceAll("~0", "~");
}
function jsonPointerToFieldPath(pointer) {
  if (!pointer || pointer === "/") {
    return "$";
  }
  const segments = pointer.split("/").slice(1).map(decodeJsonPointerSegment).map((segment) => /^\d+$/.test(segment) ? `[${segment}]` : `.${segment}`);
  return `$${segments.join("")}`;
}
function dotPathToFieldRoot(pathValue) {
  if (!pathValue.trim()) {
    return "$";
  }
  return `$${pathValue.split(".").map((segment) => `.${segment}`).join("")}`;
}
function getValueByDotPath(root, dotPath) {
  if (!dotPath.trim()) {
    return root;
  }
  let current = root;
  for (const segment of dotPath.split(".")) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return;
    }
    current = current[segment];
  }
  return current;
}
function getObjectCollection(root, dotPath) {
  const value = getValueByDotPath(root, dotPath);
  return asSequence(value).filter((item) => Boolean(item) && typeof item === "object" && !Array.isArray(item));
}
function normalizeDiagnostics(diagnostics) {
  return diagnostics.sort((left, right) => {
    const leftKey = [
      left.source,
      left.artifactPath,
      left.fieldPath,
      left.message,
      left.expected ?? "",
      left.actual ?? ""
    ].join("|");
    const rightKey = [
      right.source,
      right.artifactPath,
      right.fieldPath,
      right.message,
      right.expected ?? "",
      right.actual ?? ""
    ].join("|");
    return leftKey.localeCompare(rightKey);
  });
}
function fieldPathForCollectionItem(collectionPath, index, fieldName) {
  return `${dotPathToFieldRoot(collectionPath)}[${index}].${fieldName}`;
}
function schemaExpectedValue(error) {
  const params = error.params;
  if (error.keyword === "required") {
    return "required property";
  }
  if (error.keyword === "additionalProperties") {
    return "no additional properties";
  }
  if (error.keyword === "type" && typeof params.type !== "undefined") {
    return stringifyValue(params.type);
  }
  if (error.keyword === "enum" && Array.isArray(params.allowedValues)) {
    return stringifyValue(params.allowedValues);
  }
  if (error.keyword === "const" && typeof params.allowedValue !== "undefined") {
    return stringifyValue(params.allowedValue);
  }
  return;
}
function schemaActualValue(error) {
  const params = error.params;
  if (error.keyword === "required") {
    return "missing";
  }
  if (error.keyword === "additionalProperties" && typeof params.additionalProperty !== "undefined") {
    return stringifyValue(params.additionalProperty);
  }
  if ("data" in error) {
    return stringifyValue(error.data);
  }
  return;
}
function schemaFieldPath(error) {
  const params = error.params;
  if (error.keyword === "required" && typeof params.missingProperty === "string") {
    const pointer = `${error.instancePath}/${escapeJsonPointerSegment(params.missingProperty)}`;
    return jsonPointerToFieldPath(pointer);
  }
  if (error.keyword === "additionalProperties" && typeof params.additionalProperty === "string") {
    const pointer = `${error.instancePath}/${escapeJsonPointerSegment(params.additionalProperty)}`;
    return jsonPointerToFieldPath(pointer);
  }
  return jsonPointerToFieldPath(error.instancePath);
}
function schemaErrorToDiagnostic(error, artifactPath) {
  return {
    source: "schema",
    artifactPath,
    fieldPath: schemaFieldPath(error),
    message: error.message ?? "schema validation failure",
    expected: schemaExpectedValue(error),
    actual: schemaActualValue(error)
  };
}
function createSchemaValidator() {
  const AjvCtor = resolveAjvConstructor();
  const validator = new AjvCtor({ allErrors: true, strict: false, verbose: true });
  resolveFormatsPlugin()(validator);
  return validator;
}
function compileSchema(schema2) {
  return createSchemaValidator().compile(schema2);
}
function getBundledSchemaPath(schemaFile) {
  return path2.join(BUNDLED_SCHEMA_DIR, schemaFile);
}
function loadBundledSchema(schemaFile) {
  const raw = parseYamlDocument(readBundledSchemaContent(schemaFile));
  if ("json_schema" in raw && raw.json_schema && typeof raw.json_schema === "object") {
    return raw.json_schema;
  }
  return asObject(raw, `Schema file ${schemaFile}`);
}
function loadBundledSchemaRegistry() {
  const registry = loadBundledSchema("registry.yaml");
  const objectRegistry = asObject(registry, "Bundled schema registry");
  const entries = objectRegistry.entries;
  if (!Array.isArray(entries)) {
    throw new Error("Bundled schema registry is missing an entries sequence");
  }
  return objectRegistry;
}
function loadBundledSchemaByArtifactType(artifactType) {
  const registry = loadBundledSchemaRegistry();
  const entry = registry.entries.find((candidate) => candidate.artifact_type === artifactType);
  if (!entry) {
    throw new Error(`No bundled schema found for artifact type '${artifactType}'`);
  }
  return loadBundledSchema(entry.schema_file);
}
function validateWithSchema(schema2, artifact, artifactPath) {
  const validator = compileSchema(schema2);
  const valid = validator(artifact) === true;
  const diagnostics = normalizeDiagnostics((validator.errors ?? []).map((error) => schemaErrorToDiagnostic(error, artifactPath)));
  return { valid: valid && diagnostics.length === 0, diagnostics };
}
function runDuplicateIdChecks(artifact, artifactPath, rules) {
  const diagnostics = [];
  for (const rule of rules) {
    const seen = new Set;
    const collection = getObjectCollection(artifact, rule.collectionPath);
    for (const [index, item] of collection.entries()) {
      const idValue = item[rule.idField];
      if (typeof idValue !== "string" || idValue.length === 0) {
        continue;
      }
      if (seen.has(idValue)) {
        diagnostics.push({
          source: "duplicate_id",
          artifactPath,
          fieldPath: fieldPathForCollectionItem(rule.collectionPath, index, rule.idField),
          message: rule.description ?? `duplicate identifier '${idValue}'`,
          expected: "unique identifier",
          actual: idValue
        });
        continue;
      }
      seen.add(idValue);
    }
  }
  return normalizeDiagnostics(diagnostics);
}
function runReferenceChecks(artifact, artifactPath, rules) {
  const diagnostics = [];
  for (const rule of rules) {
    const targetCollection = getObjectCollection(artifact, rule.targetCollectionPath);
    const targetValues = new Set(targetCollection.map((item) => item[rule.targetField]).filter((value) => typeof value === "string" && value.length > 0));
    const sourceCollection = getObjectCollection(artifact, rule.sourceCollectionPath);
    for (const [index, item] of sourceCollection.entries()) {
      const sourceValue = item[rule.sourceField];
      if (typeof sourceValue !== "string" || sourceValue.length === 0) {
        continue;
      }
      if (targetValues.has(sourceValue)) {
        continue;
      }
      diagnostics.push({
        source: "reference",
        artifactPath,
        fieldPath: fieldPathForCollectionItem(rule.sourceCollectionPath, index, rule.sourceField),
        message: rule.description ?? `missing reference '${sourceValue}'`,
        expected: `${rule.targetCollectionPath}.${rule.targetField}`,
        actual: sourceValue
      });
    }
  }
  return normalizeDiagnostics(diagnostics);
}
function validateArtifact(schema2, artifact, artifactPath, options = {}) {
  const schemaResult = validateWithSchema(schema2, artifact, artifactPath);
  const duplicateDiagnostics = runDuplicateIdChecks(artifact, artifactPath, options.duplicateIdRules ?? []);
  const referenceDiagnostics = runReferenceChecks(artifact, artifactPath, options.referenceRules ?? []);
  const diagnostics = normalizeDiagnostics([
    ...schemaResult.diagnostics,
    ...duplicateDiagnostics,
    ...referenceDiagnostics
  ]);
  return { valid: diagnostics.length === 0, diagnostics };
}

// src/propose-generation.ts
var STRICT_WORKFLOW_DIR2 = ".strict-spec-driven";
var GENERATABLE_ARTIFACTS = ["proposal", "design", "questions", "delta-spec"];
function normalizeRepoRelativePath(rootDir, absolutePath) {
  return path3.relative(rootDir, absolutePath).split(path3.sep).join("/");
}
function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function asRecord(value, fieldPath) {
  if (!isRecord(value)) {
    throw new Error(`input field '${fieldPath}' must be an object`);
  }
  return value;
}
function asOptionalRecord(value, fieldPath) {
  if (value === undefined)
    return;
  return asRecord(value, fieldPath);
}
function asString(value, fieldPath) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`input field '${fieldPath}' must be a non-empty string`);
  }
  return value;
}
function asOptionalString(value, fieldPath) {
  if (value === undefined)
    return;
  return asString(value, fieldPath);
}
function asStringArray(value, fieldPath, options = {}) {
  if (!Array.isArray(value)) {
    throw new Error(`input field '${fieldPath}' must be an array of strings`);
  }
  if (options.minItems !== undefined && value.length < options.minItems) {
    throw new Error(`input field '${fieldPath}' must contain at least ${options.minItems} item(s)`);
  }
  return value.map((item, index) => asString(item, `${fieldPath}[${index}]`));
}
function asOptionalStringArray(value, fieldPath) {
  if (value === undefined)
    return;
  return asStringArray(value, fieldPath);
}
function validateGeneratedArtifact(artifactType, artifact, artifactPath) {
  const schema2 = loadBundledSchemaByArtifactType(artifactType);
  const result = validateArtifact(schema2, artifact, artifactPath);
  return result.diagnostics;
}
function formatDiagnostics(diagnostics) {
  return diagnostics.map((diagnostic) => `${diagnostic.artifactPath} ${diagnostic.fieldPath}: ${diagnostic.message}`).join("; ");
}
function mapGeneratedFieldToInputField(artifact, fieldPath) {
  if (fieldPath === "$")
    return "$";
  const directPrefixes = {
    proposal: ["$.summary", "$.scope", "$.unchanged_behavior", "$.roadmap"],
    design: ["$.approach", "$.decisions", "$.alternatives", "$.risks"],
    questions: ["$.open", "$.resolved"],
    "delta-spec": ["$.target_spec", "$.mapping", "$.operations"]
  };
  for (const prefix of directPrefixes[artifact]) {
    if (fieldPath === prefix || fieldPath.startsWith(`${prefix}.`) || fieldPath.startsWith(`${prefix}[`)) {
      return fieldPath;
    }
  }
  if (artifact === "proposal") {
    if (fieldPath === "$.change.status")
      return "$.status";
    if (fieldPath === "$.change.id")
      return "<change-name>";
  }
  if (artifact === "design" || artifact === "questions") {
    if (fieldPath === "$.change")
      return "<change-name>";
  }
  if (artifact === "questions") {
    const openStatusMatch = fieldPath.match(/^\$\.open\[(\d+)\]\.status$/);
    if (openStatusMatch)
      return `$.open[${openStatusMatch[1]}]`;
    const resolvedStatusMatch = fieldPath.match(/^\$\.resolved\[(\d+)\]\.status$/);
    if (resolvedStatusMatch)
      return `$.resolved[${resolvedStatusMatch[1]}]`;
  }
  if (artifact === "delta-spec" && fieldPath === "$.schema_file") {
    return "<generated schema_file>";
  }
  if (fieldPath === "$.schema" || fieldPath === "$.schema_version" || fieldPath === "$.artifact_type" || fieldPath === "$.schema_file") {
    return `<generated ${fieldPath.slice(2)}>`;
  }
  return fieldPath;
}
function formatGenerationDiagnostics(artifact, inputLabel, diagnostics) {
  const lines = diagnostics.map((diagnostic) => {
    const inputField = mapGeneratedFieldToInputField(artifact, diagnostic.fieldPath);
    const details = [
      diagnostic.message,
      diagnostic.expected ? `expected ${diagnostic.expected}` : undefined,
      diagnostic.actual ? `actual ${diagnostic.actual}` : undefined,
      `generated field ${diagnostic.fieldPath}`
    ].filter((value) => Boolean(value));
    return `- ${inputField}: ${details.join("; ")}`;
  });
  return [
    `${inputLabel} is invalid for ${artifact}; fix these field(s):`,
    ...lines
  ].join(`
`);
}
function ensureExistingChangeDir(rootDir, changeName) {
  const changeDir = path3.join(rootDir, STRICT_WORKFLOW_DIR2, "changes", changeName);
  if (!existsSync3(changeDir) || !statSync2(changeDir).isDirectory()) {
    throw new Error(`change '${changeName}' not found`);
  }
  return changeDir;
}
function buildProposalArtifact(changeName, input) {
  const summary = asRecord(input.summary, "$.summary");
  const scope = asRecord(input.scope, "$.scope");
  const status = asOptionalString(input.status, "$.status") ?? "proposed";
  const artifact = {
    schema: "strict-spec-driven/change-proposal/v1",
    schema_version: 1,
    artifact_type: "change_proposal",
    schema_file: "templates/strict-spec-driven/schemas/change-proposal.yaml",
    change: {
      id: changeName,
      status
    },
    summary: {
      what: asStringArray(summary.what, "$.summary.what", { minItems: 1 }),
      why: asStringArray(summary.why, "$.summary.why", { minItems: 1 })
    },
    scope: {
      in: asStringArray(scope.in, "$.scope.in"),
      out: asStringArray(scope.out, "$.scope.out")
    },
    unchanged_behavior: asStringArray(input.unchanged_behavior, "$.unchanged_behavior")
  };
  const roadmap = asOptionalRecord(input.roadmap, "$.roadmap");
  if (roadmap) {
    artifact.roadmap = {
      milestone: asString(roadmap.milestone, "$.roadmap.milestone"),
      planned_change: asString(roadmap.planned_change, "$.roadmap.planned_change")
    };
  }
  return artifact;
}
function buildDesignArtifact(changeName, input) {
  const decisions = asRecord(input.decisions, "$.decisions");
  for (const [decisionId, decision] of Object.entries(decisions)) {
    const decisionRecord = asRecord(decision, `$.decisions.${decisionId}`);
    decisions[decisionId] = {
      decision: asString(decisionRecord.decision, `$.decisions.${decisionId}.decision`),
      rationale: asString(decisionRecord.rationale, `$.decisions.${decisionId}.rationale`)
    };
  }
  const alternativesInput = input.alternatives;
  if (!Array.isArray(alternativesInput)) {
    throw new Error("input field '$.alternatives' must be an array");
  }
  const alternatives = alternativesInput.map((alternative, index) => {
    const record = asRecord(alternative, `$.alternatives[${index}]`);
    return {
      option: asString(record.option, `$.alternatives[${index}].option`),
      reason: asString(record.reason, `$.alternatives[${index}].reason`)
    };
  });
  return {
    schema: "strict-spec-driven/change-design/v1",
    schema_version: 1,
    artifact_type: "change_design",
    schema_file: "templates/strict-spec-driven/schemas/change-design.yaml",
    change: changeName,
    approach: asStringArray(input.approach, "$.approach", { minItems: 1 }),
    decisions,
    alternatives,
    risks: asOptionalStringArray(input.risks, "$.risks") ?? []
  };
}
function normalizeOpenQuestion(question, index) {
  const record = asRecord(question, `$.open[${index}]`);
  return {
    id: asString(record.id, `$.open[${index}].id`),
    question: asString(record.question, `$.open[${index}].question`),
    context: asString(record.context, `$.open[${index}].context`),
    status: "open"
  };
}
function normalizeResolvedQuestion(question, index) {
  const record = asRecord(question, `$.resolved[${index}]`);
  return {
    id: asString(record.id, `$.resolved[${index}].id`),
    question: asString(record.question, `$.resolved[${index}].question`),
    context: asString(record.context, `$.resolved[${index}].context`),
    answer: asString(record.answer, `$.resolved[${index}].answer`),
    status: "resolved"
  };
}
function buildQuestionsArtifact(changeName, input) {
  const open = input.open ?? [];
  const resolved = input.resolved ?? [];
  if (!Array.isArray(open)) {
    throw new Error("input field '$.open' must be an array");
  }
  if (!Array.isArray(resolved)) {
    throw new Error("input field '$.resolved' must be an array");
  }
  return {
    schema: "strict-spec-driven/question-list/v1",
    schema_version: 1,
    artifact_type: "question_list",
    schema_file: "templates/strict-spec-driven/schemas/question-list.yaml",
    change: changeName,
    open: open.map(normalizeOpenQuestion),
    resolved: resolved.map(normalizeResolvedQuestion)
  };
}
function normalizeDeltaSpecRelativePath(relativePath) {
  let normalized = relativePath.replaceAll("\\", "/");
  const strictSpecsPrefix = `${STRICT_WORKFLOW_DIR2}/specs/`;
  if (normalized.startsWith(strictSpecsPrefix)) {
    normalized = normalized.slice(strictSpecsPrefix.length);
  }
  if (path3.isAbsolute(normalized)) {
    throw new Error("input field '$.spec_path' must be relative to the strict specs directory");
  }
  const parts = normalized.split("/");
  if (normalized.length === 0 || parts.some((part) => part.length === 0 || part === "." || part === "..") || path3.basename(normalized) === "INDEX.yaml" || !(normalized.endsWith(".yaml") || normalized.endsWith(".yml"))) {
    throw new Error("input field '$.spec_path' must be a normalized YAML path under the strict specs directory");
  }
  return normalized;
}
function readSpecIndexPathForTarget(rootDir, targetSpec) {
  const indexPath = path3.join(rootDir, STRICT_WORKFLOW_DIR2, "specs", "INDEX.yaml");
  if (!existsSync3(indexPath))
    return;
  const index = parseYamlDocument(readFileSync4(indexPath, "utf8"), { source: normalizeRepoRelativePath(rootDir, indexPath) });
  const match = (index.specs ?? []).find((candidate) => candidate.id === targetSpec);
  return typeof match?.path === "string" ? match.path : undefined;
}
function resolveDeltaSpecRelativePath(rootDir, targetSpec, input) {
  const explicitPath = asOptionalString(input.spec_path, "$.spec_path");
  if (explicitPath) {
    return normalizeDeltaSpecRelativePath(explicitPath);
  }
  const indexedPath = readSpecIndexPathForTarget(rootDir, targetSpec);
  if (indexedPath) {
    return normalizeDeltaSpecRelativePath(indexedPath);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(targetSpec)) {
    throw new Error("input field '$.spec_path' is required when target_spec is not a kebab-case spec id");
  }
  return `${targetSpec}.yaml`;
}
function buildDeltaSpecArtifact(rootDir, input) {
  const targetSpec = asString(input.target_spec, "$.target_spec");
  const mapping = asRecord(input.mapping, "$.mapping");
  const operations = asRecord(input.operations ?? {}, "$.operations");
  const relativePath = resolveDeltaSpecRelativePath(rootDir, targetSpec, input);
  return {
    relativePath,
    artifact: {
      schema: "strict-spec-driven/delta-spec/v1",
      schema_version: 1,
      artifact_type: "delta_spec",
      schema_file: "templates/strict-spec-driven/schemas/delta-spec.yaml",
      target_spec: targetSpec,
      mapping: {
        implementation: asStringArray(mapping.implementation ?? [], "$.mapping.implementation"),
        tests: asStringArray(mapping.tests ?? [], "$.mapping.tests")
      },
      operations: {
        ADDED: asRecord(operations.ADDED ?? {}, "$.operations.ADDED"),
        MODIFIED: asRecord(operations.MODIFIED ?? {}, "$.operations.MODIFIED"),
        REMOVED: asRecord(operations.REMOVED ?? {}, "$.operations.REMOVED")
      }
    }
  };
}
function buildTarget(rootDir, changeDir, changeName, artifact, input) {
  switch (artifact) {
    case "proposal":
      return {
        artifact: buildProposalArtifact(changeName, input),
        artifactType: "change_proposal",
        absolutePath: path3.join(changeDir, "proposal.yaml")
      };
    case "design":
      return {
        artifact: buildDesignArtifact(changeName, input),
        artifactType: "change_design",
        absolutePath: path3.join(changeDir, "design.yaml")
      };
    case "questions":
      return {
        artifact: buildQuestionsArtifact(changeName, input),
        artifactType: "question_list",
        absolutePath: path3.join(changeDir, "questions.yaml")
      };
    case "delta-spec": {
      const deltaSpec = buildDeltaSpecArtifact(rootDir, input);
      return {
        artifact: deltaSpec.artifact,
        artifactType: "delta_spec",
        absolutePath: path3.join(changeDir, "specs", deltaSpec.relativePath)
      };
    }
  }
}
function isGeneratableArtifact(value) {
  return GENERATABLE_ARTIFACTS.includes(value);
}
function writeGeneratedArtifact(rootDir, changeName, artifact, input, inputLabel) {
  const changeDir = ensureExistingChangeDir(rootDir, changeName);
  const target = buildTarget(rootDir, changeDir, changeName, artifact, input);
  const artifactPath = normalizeRepoRelativePath(rootDir, target.absolutePath);
  const preWriteDiagnostics = validateGeneratedArtifact(target.artifactType, target.artifact, artifactPath);
  if (preWriteDiagnostics.length > 0) {
    throw new Error(formatGenerationDiagnostics(artifact, inputLabel, preWriteDiagnostics));
  }
  const replaced = existsSync3(target.absolutePath);
  mkdirSync2(path3.dirname(target.absolutePath), { recursive: true });
  writeFileSync2(target.absolutePath, stringifyYamlDocument(target.artifact), "utf8");
  const writtenArtifact = parseYamlDocument(readFileSync4(target.absolutePath, "utf8"), { source: artifactPath });
  const diagnostics = validateGeneratedArtifact(target.artifactType, writtenArtifact, artifactPath);
  if (diagnostics.length > 0) {
    throw new Error(`written ${artifact} artifact is invalid: ${formatDiagnostics(diagnostics)}`);
  }
  return {
    changeName,
    artifact,
    artifactPath,
    replaced,
    valid: true,
    diagnostics
  };
}
function generateChangeArtifactFromInput(rootDir, changeName, artifact, input) {
  return writeGeneratedArtifact(rootDir, changeName, artifact, input, "command input");
}

// src/cli/cmd-generation.ts
var STRICT_WORKFLOW_DIR3 = ".strict-spec-driven";
var BOOLEAN_FLAGS = new Set(["reset"]);
function usage() {
  return [
    "Usage: strict-spec-driven generate <change-name> <proposal|design|questions|delta-spec> --<named-args>",
    "",
    "Examples:",
    "  strict-spec-driven generate <change-name> proposal --what <text> --why <text> [--in <text>] [--out <text>] [--unchanged <text>]",
    "  strict-spec-driven generate <change-name> design [--reset] --approach <text> [--decision <id> --decision-text <text> --rationale <text>]",
    "  strict-spec-driven generate <change-name> questions [--reset] [(--open <id> --question <text> --context <text>)|(--resolved <id> --question <text> --context <text> --answer <text>)|(--resolve <id> --answer <text>)]...",
    "  strict-spec-driven generate <change-name> delta-spec --target-spec <id> [--spec-path <path>] [--reset] [--implementation <path>] [--test <path>] [--operation <ADDED|MODIFIED|REMOVED> --requirement <id> ...]..."
  ].join(`
`) + `
`;
}
function parseFlagMap(argv, rootDir) {
  const flags = {};
  for (let index = 0;index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--") || token.length === 2) {
      throw new Error(`expected named argument, got '${token ?? ""}'`);
    }
    const name = token.slice(2);
    flags[name] ??= [];
    if (BOOLEAN_FLAGS.has(name)) {
      flags[name].push("true");
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`missing value for --${name}`);
    }
    flags[name].push(resolveStringValue(value, rootDir));
    index += 1;
  }
  return flags;
}
function resolveStringValue(value, rootDir) {
  if (!value.startsWith("@") || value === "@") {
    return value;
  }
  const inputPath = path4.resolve(rootDir, value.slice(1));
  return readFileSync5(inputPath, "utf8");
}
function ensureAllowedFlags(flags, allowed) {
  const allowedSet = new Set(allowed);
  const unsupported = Object.keys(flags).filter((flag) => !allowedSet.has(flag));
  if (unsupported.length > 0) {
    throw new Error(`unsupported argument(s): ${unsupported.map((flag) => `--${flag}`).join(", ")}`);
  }
}
function values(flags, name) {
  return flags[name] ?? [];
}
function optionalOne(flags, name) {
  const all = values(flags, name);
  if (all.length > 1) {
    throw new Error(`--${name} may only be supplied once`);
  }
  return all[0];
}
function hasFlag(flags, name) {
  return values(flags, name).length > 0;
}
function uniqueStrings(input) {
  const seen = new Set;
  const output = [];
  for (const item of input) {
    if (!seen.has(item)) {
      seen.add(item);
      output.push(item);
    }
  }
  return output;
}
function isRecord2(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function readYamlIfExists(rootDir, repoRelativePath) {
  const absolutePath = path4.join(rootDir, repoRelativePath);
  if (!existsSync4(absolutePath))
    return;
  return parseYamlDocument(readFileSync5(absolutePath, "utf8"), { source: repoRelativePath });
}
function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
function upsertKeyedItem(collection, id, item, fieldName) {
  const existing = collection[id];
  if (existing === undefined) {
    collection[id] = item;
    return;
  }
  if (!deepEqual(existing, item)) {
    throw new Error(`duplicate ${fieldName} '${id}' has conflicting content`);
  }
}
function upsertListItem(collection, item, id, fieldName) {
  const existing = collection.find((candidate) => candidate.id === id);
  if (!existing) {
    return [...collection, item];
  }
  if (!deepEqual(existing, item)) {
    throw new Error(`duplicate ${fieldName} '${id}' has conflicting content`);
  }
  return collection;
}
function buildProposalInput(flags) {
  ensureAllowedFlags(flags, [
    "what",
    "why",
    "in",
    "out",
    "unchanged",
    "status",
    "milestone",
    "planned-change",
    "roadmap-milestone",
    "roadmap-planned-change"
  ]);
  const what = uniqueStrings(values(flags, "what"));
  const why = uniqueStrings(values(flags, "why"));
  if (what.length === 0)
    throw new Error("missing required argument --what");
  if (why.length === 0)
    throw new Error("missing required argument --why");
  const input = {
    summary: { what, why },
    scope: {
      in: uniqueStrings(values(flags, "in")),
      out: uniqueStrings(values(flags, "out"))
    },
    unchanged_behavior: uniqueStrings(values(flags, "unchanged"))
  };
  const status = optionalOne(flags, "status");
  if (status)
    input.status = status;
  const milestone = optionalOne(flags, "milestone") ?? optionalOne(flags, "roadmap-milestone");
  const plannedChange = optionalOne(flags, "planned-change") ?? optionalOne(flags, "roadmap-planned-change");
  if (milestone || plannedChange) {
    if (!milestone)
      throw new Error("missing required argument --milestone");
    if (!plannedChange)
      throw new Error("missing required argument --planned-change");
    input.roadmap = { milestone, planned_change: plannedChange };
  }
  return input;
}
function existingDesignInput(rootDir, changeName, reset) {
  if (reset) {
    return { approach: [], decisions: {}, alternatives: [], risks: [] };
  }
  const artifact = readYamlIfExists(rootDir, `${STRICT_WORKFLOW_DIR3}/changes/${changeName}/design.yaml`);
  return {
    approach: Array.isArray(artifact?.approach) ? artifact.approach : [],
    decisions: isRecord2(artifact?.decisions) ? artifact.decisions : {},
    alternatives: Array.isArray(artifact?.alternatives) ? artifact.alternatives : [],
    risks: Array.isArray(artifact?.risks) ? artifact.risks : []
  };
}
function buildDesignInput(rootDir, changeName, flags) {
  ensureAllowedFlags(flags, [
    "reset",
    "approach",
    "decision",
    "decision-text",
    "rationale",
    "alternative",
    "reason",
    "risk"
  ]);
  const input = existingDesignInput(rootDir, changeName, hasFlag(flags, "reset"));
  input.approach = uniqueStrings([...Array.isArray(input.approach) ? input.approach : [], ...values(flags, "approach")]);
  input.risks = uniqueStrings([...Array.isArray(input.risks) ? input.risks : [], ...values(flags, "risk")]);
  const decisions = isRecord2(input.decisions) ? input.decisions : {};
  const decisionIds = values(flags, "decision");
  const decisionTexts = values(flags, "decision-text");
  const rationales = values(flags, "rationale");
  if (decisionIds.length !== decisionTexts.length || decisionIds.length !== rationales.length) {
    throw new Error("--decision, --decision-text, and --rationale must be supplied the same number of times");
  }
  for (let index = 0;index < decisionIds.length; index += 1) {
    upsertKeyedItem(decisions, decisionIds[index], {
      decision: decisionTexts[index],
      rationale: rationales[index]
    }, "decision");
  }
  input.decisions = decisions;
  const alternatives = Array.isArray(input.alternatives) ? input.alternatives : [];
  const alternativeOptions = values(flags, "alternative");
  const reasons = values(flags, "reason");
  if (alternativeOptions.length !== reasons.length) {
    throw new Error("--alternative and --reason must be supplied the same number of times");
  }
  for (let index = 0;index < alternativeOptions.length; index += 1) {
    const item = { option: alternativeOptions[index], reason: reasons[index] };
    if (!alternatives.some((alternative) => deepEqual(alternative, item))) {
      alternatives.push(item);
    }
  }
  input.alternatives = alternatives;
  return input;
}
function parseQuestionCommandInput(argv, rootDir) {
  const input = { reset: false, items: [] };
  let currentItem;
  function readValue(name, index) {
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`missing value for --${name}`);
    }
    return resolveStringValue(value, rootDir);
  }
  function setField(field, value, flagName) {
    if (!currentItem) {
      throw new Error("missing required argument --open or --resolved");
    }
    if (currentItem[field] !== undefined) {
      throw new Error(`--${flagName} may only be supplied once per question`);
    }
    currentItem[field] = value;
  }
  for (let index = 0;index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--") || token.length === 2) {
      throw new Error(`expected named argument, got '${token ?? ""}'`);
    }
    const name = token.slice(2);
    if (name === "reset") {
      input.reset = true;
      continue;
    }
    if (name === "open" || name === "resolved" || name === "resolve") {
      currentItem = { kind: name, id: readValue(name, index) };
      input.items.push(currentItem);
      index += 1;
      continue;
    }
    if (name === "question" || name === "context" || name === "answer") {
      setField(name, readValue(name, index), name);
      index += 1;
      continue;
    }
    throw new Error(`unsupported argument(s): --${name}`);
  }
  return input;
}
function existingQuestionsInput(rootDir, changeName, reset) {
  if (reset) {
    return { open: [], resolved: [] };
  }
  const artifact = readYamlIfExists(rootDir, `${STRICT_WORKFLOW_DIR3}/changes/${changeName}/questions.yaml`);
  return {
    open: Array.isArray(artifact?.open) ? artifact.open : [],
    resolved: Array.isArray(artifact?.resolved) ? artifact.resolved : []
  };
}
function buildQuestionsInputFromArgs(rootDir, changeName, argv) {
  const commandInput = parseQuestionCommandInput(argv, rootDir);
  const input = existingQuestionsInput(rootDir, changeName, commandInput.reset);
  let open = Array.isArray(input.open) ? input.open : [];
  let resolved = Array.isArray(input.resolved) ? input.resolved : [];
  for (const item of commandInput.items) {
    if (item.kind === "open") {
      if (!item.question)
        throw new Error(`missing required argument --question for question '${item.id}'`);
      if (!item.context)
        throw new Error(`missing required argument --context for question '${item.id}'`);
      if (item.answer !== undefined) {
        throw new Error(`--answer is only valid with --resolved for question '${item.id}'`);
      }
      open = upsertListItem(open, {
        id: item.id,
        question: item.question,
        context: item.context
      }, item.id, "open question");
      continue;
    }
    if (item.kind === "resolve") {
      if (!item.answer)
        throw new Error(`missing required argument --answer for resolved question '${item.id}'`);
      const existingOpen = open.find((candidate) => candidate.id === item.id);
      const existingRecord = isRecord2(existingOpen) ? existingOpen : undefined;
      const question = item.question ?? (typeof existingRecord?.question === "string" ? existingRecord.question : undefined);
      const context = item.context ?? (typeof existingRecord?.context === "string" ? existingRecord.context : undefined);
      if (!question)
        throw new Error(`missing required argument --question for unresolved question '${item.id}'`);
      if (!context)
        throw new Error(`missing required argument --context for unresolved question '${item.id}'`);
      open = open.filter((candidate) => candidate.id !== item.id);
      resolved = upsertListItem(resolved, {
        id: item.id,
        question,
        context,
        answer: item.answer
      }, item.id, "resolved question");
      continue;
    }
    if (!item.question)
      throw new Error(`missing required argument --question for question '${item.id}'`);
    if (!item.context)
      throw new Error(`missing required argument --context for question '${item.id}'`);
    if (!item.answer)
      throw new Error(`missing required argument --answer for resolved question '${item.id}'`);
    resolved = upsertListItem(resolved, {
      id: item.id,
      question: item.question,
      context: item.context,
      answer: item.answer
    }, item.id, "resolved question");
  }
  input.open = open;
  input.resolved = resolved;
  return input;
}
function normalizeDeltaSpecRelativePath2(relativePath) {
  let normalized = relativePath.replaceAll("\\", "/");
  const strictSpecsPrefix = `${STRICT_WORKFLOW_DIR3}/specs/`;
  if (normalized.startsWith(strictSpecsPrefix)) {
    normalized = normalized.slice(strictSpecsPrefix.length);
  }
  return normalized;
}
function readSpecIndexPathForTarget2(rootDir, targetSpec) {
  const index = readYamlIfExists(rootDir, `${STRICT_WORKFLOW_DIR3}/specs/INDEX.yaml`);
  const match = (index?.specs ?? []).find((candidate) => candidate.id === targetSpec);
  return typeof match?.path === "string" ? normalizeDeltaSpecRelativePath2(match.path) : undefined;
}
function resolveDeltaExistingPath(rootDir, targetSpec, specPath) {
  if (specPath) {
    return normalizeDeltaSpecRelativePath2(specPath);
  }
  const indexedPath = readSpecIndexPathForTarget2(rootDir, targetSpec);
  if (indexedPath)
    return indexedPath;
  return `${targetSpec}.yaml`;
}
function existingDeltaInput(rootDir, changeName, targetSpec, specPath, reset) {
  const relativeSpecPath = resolveDeltaExistingPath(rootDir, targetSpec, specPath);
  if (reset) {
    return emptyDeltaInput(targetSpec, relativeSpecPath);
  }
  const artifact = readYamlIfExists(rootDir, `${STRICT_WORKFLOW_DIR3}/changes/${changeName}/specs/${relativeSpecPath}`);
  if (!artifact) {
    return emptyDeltaInput(targetSpec, relativeSpecPath);
  }
  return {
    target_spec: artifact.target_spec ?? targetSpec,
    spec_path: relativeSpecPath,
    mapping: isRecord2(artifact.mapping) ? artifact.mapping : { implementation: [], tests: [] },
    operations: isRecord2(artifact.operations) ? artifact.operations : { ADDED: {}, MODIFIED: {}, REMOVED: {} }
  };
}
function emptyDeltaInput(targetSpec, specPath) {
  return {
    target_spec: targetSpec,
    spec_path: specPath,
    mapping: { implementation: [], tests: [] },
    operations: { ADDED: {}, MODIFIED: {}, REMOVED: {} }
  };
}
function parseDeltaCommandInput(argv, rootDir) {
  const input = {
    reset: false,
    implementation: [],
    tests: [],
    requirements: []
  };
  let currentOperation;
  let hasPendingOperation = false;
  let currentRequirement;
  let currentScenario;
  function readValue(name, index) {
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`missing value for --${name}`);
    }
    return resolveStringValue(value, rootDir);
  }
  function ensureRequirement(flagName) {
    if (!currentRequirement) {
      throw new Error(`missing required argument --requirement before --${flagName}`);
    }
    return currentRequirement;
  }
  function finalizeScenario() {
    if (!currentScenario)
      return;
    if (currentScenario.steps.length === 0) {
      throw new Error(`--scenario '${currentScenario.id}' requires at least one --given, --when, --then, or --and`);
    }
    ensureRequirement("scenario").scenarios.push(currentScenario);
    currentScenario = undefined;
  }
  function finalizeRequirement() {
    if (!currentRequirement)
      return;
    finalizeScenario();
    input.requirements.push(currentRequirement);
    currentRequirement = undefined;
  }
  for (let index = 0;index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--") || token.length === 2) {
      throw new Error(`expected named argument, got '${token ?? ""}'`);
    }
    const name = token.slice(2);
    if (name === "reset") {
      input.reset = true;
      continue;
    }
    if (name === "target-spec") {
      if (input.targetSpec !== undefined)
        throw new Error("--target-spec may only be supplied once");
      input.targetSpec = readValue(name, index);
      index += 1;
      continue;
    }
    if (name === "spec-path") {
      if (input.specPath !== undefined)
        throw new Error("--spec-path may only be supplied once");
      input.specPath = readValue(name, index);
      index += 1;
      continue;
    }
    if (name === "implementation") {
      input.implementation.push(readValue(name, index));
      index += 1;
      continue;
    }
    if (name === "test") {
      input.tests.push(readValue(name, index));
      index += 1;
      continue;
    }
    if (name === "operation") {
      finalizeRequirement();
      currentOperation = readValue(name, index);
      hasPendingOperation = true;
      index += 1;
      continue;
    }
    if (name === "requirement") {
      finalizeRequirement();
      if (!currentOperation) {
        throw new Error("missing required argument --operation before --requirement");
      }
      currentRequirement = {
        operation: currentOperation,
        id: readValue(name, index),
        scenarios: []
      };
      hasPendingOperation = false;
      index += 1;
      continue;
    }
    if (name === "strength" || name === "statement" || name === "reason") {
      const requirement = ensureRequirement(name);
      if (requirement[name] !== undefined) {
        throw new Error(`--${name} may only be supplied once per requirement`);
      }
      requirement[name] = readValue(name, index);
      index += 1;
      continue;
    }
    if (name === "scenario") {
      const requirement = ensureRequirement(name);
      finalizeScenario();
      currentScenario = {
        id: readValue(name, index),
        steps: []
      };
      if (requirement.operation === "REMOVED") {
        throw new Error(`--scenario is not valid for removed requirement '${requirement.id}'`);
      }
      index += 1;
      continue;
    }
    if (name === "given" || name === "when" || name === "then" || name === "and") {
      if (!currentScenario) {
        throw new Error(`missing required argument --scenario before --${name}`);
      }
      currentScenario.steps.push({ [name.toUpperCase()]: readValue(name, index) });
      index += 1;
      continue;
    }
    throw new Error(`unsupported argument(s): --${name}`);
  }
  finalizeRequirement();
  if (hasPendingOperation) {
    throw new Error("missing required argument --requirement");
  }
  return input;
}
function buildDeltaInputFromArgs(rootDir, changeName, argv) {
  const commandInput = parseDeltaCommandInput(argv, rootDir);
  const targetSpec = commandInput.targetSpec;
  if (!targetSpec) {
    throw new Error("missing required argument --target-spec");
  }
  const input = existingDeltaInput(rootDir, changeName, targetSpec, commandInput.specPath, commandInput.reset);
  const mapping = isRecord2(input.mapping) ? input.mapping : {};
  mapping.implementation = uniqueStrings([
    ...Array.isArray(mapping.implementation) ? mapping.implementation : [],
    ...commandInput.implementation
  ]);
  mapping.tests = uniqueStrings([
    ...Array.isArray(mapping.tests) ? mapping.tests : [],
    ...commandInput.tests
  ]);
  input.mapping = mapping;
  const operations = isRecord2(input.operations) ? input.operations : {};
  for (const requirement of commandInput.requirements) {
    if (!["ADDED", "MODIFIED", "REMOVED"].includes(requirement.operation)) {
      throw new Error("--operation must be one of: ADDED, MODIFIED, REMOVED");
    }
    const operationMap = isRecord2(operations[requirement.operation]) ? operations[requirement.operation] : {};
    if (requirement.operation === "REMOVED") {
      if (!requirement.reason)
        throw new Error(`missing required argument --reason for removed requirement '${requirement.id}'`);
      if (requirement.strength || requirement.statement || requirement.scenarios.length > 0) {
        throw new Error(`removed requirement '${requirement.id}' only supports --reason`);
      }
      upsertKeyedItem(operationMap, requirement.id, { reason: requirement.reason }, "delta requirement");
      operations[requirement.operation] = operationMap;
      continue;
    }
    if (!requirement.strength)
      throw new Error(`missing required argument --strength for requirement '${requirement.id}'`);
    if (!requirement.statement)
      throw new Error(`missing required argument --statement for requirement '${requirement.id}'`);
    if (requirement.reason) {
      throw new Error(`--reason is only valid with removed requirement '${requirement.id}'`);
    }
    const scenarios = {};
    for (const scenario of requirement.scenarios) {
      const existingScenario = scenarios[scenario.id];
      if (existingScenario === undefined) {
        scenarios[scenario.id] = scenario.steps;
        continue;
      }
      if (!deepEqual(existingScenario, scenario.steps)) {
        throw new Error(`duplicate scenario '${scenario.id}' has conflicting content`);
      }
    }
    upsertKeyedItem(operationMap, requirement.id, {
      strength: requirement.strength,
      statement: requirement.statement,
      scenarios
    }, "delta requirement");
    operations[requirement.operation] = operationMap;
  }
  input.operations = operations;
  return input;
}
function buildInputFromNamedArgs(rootDir, changeName, artifact, argv) {
  switch (artifact) {
    case "proposal":
      return buildProposalInput(parseFlagMap(argv, rootDir));
    case "design":
      return buildDesignInput(rootDir, changeName, parseFlagMap(argv, rootDir));
    case "questions":
      return buildQuestionsInputFromArgs(rootDir, changeName, argv);
    case "delta-spec":
      return buildDeltaInputFromArgs(rootDir, changeName, argv);
  }
}
function runGenerate(argv) {
  const [changeName, artifact, firstInputArg, ...extraArgs] = argv;
  if (isHelpRequest(argv)) {
    writeHelp(usage());
    return 0;
  }
  if (!changeName || !artifact || !firstInputArg) {
    writeUsage(usage());
    return 1;
  }
  if (!CHANGE_NAME_PATTERN.test(changeName)) {
    writeError("change name must be kebab-case (lowercase letters, numbers, and hyphens)");
    return 1;
  }
  if (!isGeneratableArtifact(artifact)) {
    writeError("artifact must be one of: proposal, design, questions, delta-spec");
    return 1;
  }
  try {
    if (!firstInputArg.startsWith("--")) {
      writeUsage(usage());
      return 1;
    }
    const namedArgs = [firstInputArg, ...extraArgs];
    const input = buildInputFromNamedArgs(process.cwd(), changeName, artifact, namedArgs);
    const result = generateChangeArtifactFromInput(process.cwd(), changeName, artifact, input);
    writeJson(result);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeError(message);
    return 1;
  }
}

// src/cli/cmd-change.ts
import { existsSync as existsSync15, rmSync, statSync as statSync9 } from "fs";
import path16 from "path";

// src/apply.ts
import { existsSync as existsSync5, readFileSync as readFileSync6, writeFileSync as writeFileSync3 } from "fs";
import path5 from "path";
function applyTask(tasksYamlContent) {
  const artifact = parseYamlDocument(tasksYamlContent);
  let totalTasks = 0;
  let targetSectionName = "";
  let targetTaskId = "";
  let targetTaskText = "";
  for (const [sectionName, taskMap] of Object.entries(artifact.sections)) {
    for (const [taskId, task] of Object.entries(taskMap)) {
      totalTasks += 1;
      if (!targetTaskId && task.status === "pending") {
        targetSectionName = sectionName;
        targetTaskId = taskId;
        targetTaskText = task.text;
        task.status = "complete";
      }
    }
  }
  if (!targetTaskId) {
    throw new Error("no pending tasks remain");
  }
  let complete = 0;
  for (const taskMap of Object.values(artifact.sections)) {
    for (const task of Object.values(taskMap)) {
      if (task.status === "complete")
        complete++;
    }
  }
  return {
    result: {
      sectionName: targetSectionName,
      taskId: targetTaskId,
      taskText: targetTaskText,
      totalTasks,
      remainingPending: totalTasks - complete
    },
    updatedYaml: stringifyYamlDocument(artifact)
  };
}
function readChangeTasks(rootDir, changeName) {
  const tasksPath = path5.join(rootDir, ".strict-spec-driven", "changes", changeName, "tasks.yaml");
  if (!existsSync5(tasksPath)) {
    throw new Error(`change '${changeName}' not found`);
  }
  return readFileSync6(tasksPath, "utf8");
}
function writeChangeTasks(rootDir, changeName, content) {
  const tasksPath = path5.join(rootDir, ".strict-spec-driven", "changes", changeName, "tasks.yaml");
  writeFileSync3(tasksPath, content, "utf8");
}

// src/archive.ts
import {
  existsSync as existsSync12,
  mkdirSync as mkdirSync4,
  readdirSync as readdirSync5,
  readFileSync as readFileSync11,
  renameSync,
  writeFileSync as writeFileSync5
} from "fs";
import path13 from "path";

// src/roadmap.ts
import { existsSync as existsSync10, statSync as statSync6 } from "fs";
import path11 from "path";

// src/roadmap/model.ts
var STRICT_WORKFLOW_DIR4 = ".strict-spec-driven";
var ROADMAP_DIR = `${STRICT_WORKFLOW_DIR4}/roadmap`;
var ROADMAP_INDEX_PATH = `${ROADMAP_DIR}/INDEX.yaml`;
var ROADMAP_MILESTONES_DIR = `${ROADMAP_DIR}/milestones`;
var DECLARED_ROADMAP_STATUSES = ["proposed", "active", "blocked", "complete"];
var DECLARED_PLANNED_CHANGE_STATUSES = ["planned", "complete"];
var ROADMAP_INDEX_SCHEMA_ID = "strict-spec-driven/roadmap-index/v2";
var ROADMAP_MILESTONE_SCHEMA_ID = "strict-spec-driven/roadmap-milestone/v2";
var PLANNED_CHANGE_SCHEMA_ID = "strict-spec-driven/planned-change/v1";

// src/roadmap/shared.ts
import { existsSync as existsSync6, readdirSync as readdirSync2, statSync as statSync3 } from "fs";
import path7 from "path";

// src/diagnostics.ts
import path6 from "node:path";
function toPosix(value) {
  return value.split(path6.sep).join("/");
}
function buildDeterministicSortKey(parts) {
  return parts.map((part) => part == null ? "" : String(part)).join("|");
}
function sortByDeterministicKey(values2, getParts) {
  return values2.sort((left, right) => {
    const leftKey = buildDeterministicSortKey(getParts(left));
    const rightKey = buildDeterministicSortKey(getParts(right));
    return leftKey.localeCompare(rightKey);
  });
}

// src/roadmap/shared.ts
function normalizeRepoRelativePath2(rootDir, absolutePath) {
  return toPosix(path7.relative(rootDir, absolutePath));
}
function resolveStrictWorkflowPath(rootDir, workflowRelativePath) {
  const normalized = toPosix(workflowRelativePath);
  if (normalized.startsWith(`${STRICT_WORKFLOW_DIR4}/`)) {
    return path7.join(rootDir, normalized);
  }
  return path7.join(rootDir, STRICT_WORKFLOW_DIR4, normalized);
}
function ensureTrailingNewline(value) {
  return value.endsWith(`
`) ? value : `${value}
`;
}
function makeDiagnostic(source, artifactPath, fieldPath, message, expected, actual) {
  return { source, artifactPath, fieldPath, message, expected, actual };
}
function sortDiagnostics(diagnostics) {
  return sortByDeterministicKey(diagnostics, (diagnostic) => [
    diagnostic.source,
    diagnostic.artifactPath,
    diagnostic.fieldPath,
    diagnostic.message,
    diagnostic.expected ?? "",
    diagnostic.actual ?? ""
  ]);
}
function isRecord3(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function listYamlFiles(directoryPath) {
  if (!existsSync6(directoryPath) || !statSync3(directoryPath).isDirectory()) {
    return [];
  }
  const files = [];
  function walk(currentPath) {
    const entries = readdirSync2(currentPath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const fullPath = path7.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.isFile() && (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml"))) {
        files.push(fullPath);
      }
    }
  }
  walk(directoryPath);
  return files;
}
function isRepoRelativePath(value) {
  if (path7.isAbsolute(value))
    return false;
  const normalized = path7.posix.normalize(toPosix(value));
  return normalized !== ".." && !normalized.startsWith("../");
}
function isDeclaredRoadmapStatus(value) {
  return typeof value === "string" && DECLARED_ROADMAP_STATUSES.includes(value);
}
function isDeclaredPlannedChangeStatus(value) {
  return typeof value === "string" && DECLARED_PLANNED_CHANGE_STATUSES.includes(value);
}
function readYamlFile(filePath) {
  return parseYamlFile(filePath);
}

// src/roadmap/load.ts
import { existsSync as existsSync7, readFileSync as readFileSync8, statSync as statSync4 } from "fs";
import path8 from "path";

// src/roadmap/validate.ts
var MILESTONE_ID_PATTERN = /^\d{4}-/;
function validateString(parent, key, artifactPath, fieldPath, diagnostics) {
  const value = parent[key];
  if (typeof value !== "string" || value.length === 0) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, fieldPath, "value must be a non-empty string", "non-empty string", String(value)));
    return null;
  }
  return value;
}
function validateStringArray(parent, key, artifactPath, fieldPath, diagnostics) {
  const value = parent[key];
  if (!Array.isArray(value)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, fieldPath, "value must be a string sequence", "string[]", String(value)));
    return null;
  }
  const result = [];
  for (const [index, entry] of value.entries()) {
    if (typeof entry !== "string" || entry.length === 0) {
      diagnostics.push(makeDiagnostic("schema", artifactPath, `${fieldPath}[${index}]`, "sequence item must be a non-empty string", "non-empty string", String(entry)));
      continue;
    }
    result.push(entry);
  }
  return result;
}
function validateOptionalString(parent, key, artifactPath, fieldPath, diagnostics) {
  if (!(key in parent) || parent[key] === undefined)
    return;
  return validateString(parent, key, artifactPath, fieldPath, diagnostics);
}
function validateOptionalStringArray(parent, key, artifactPath, fieldPath, diagnostics) {
  if (!(key in parent) || parent[key] === undefined)
    return;
  return validateStringArray(parent, key, artifactPath, fieldPath, diagnostics);
}
function extractKeyedMapKey(obj) {
  const keys = Object.keys(obj);
  return keys.length === 1 ? keys[0] : null;
}
function validateRoadmapIndexArtifact(artifact, artifactPath, diagnostics) {
  if (!isRecord3(artifact)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$", "artifact must be a YAML mapping", "mapping", typeof artifact));
    return null;
  }
  if (artifact.schema !== ROADMAP_INDEX_SCHEMA_ID) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.schema", "schema mismatch", ROADMAP_INDEX_SCHEMA_ID, String(artifact.schema)));
  }
  if (artifact.schema_version !== 2) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.schema_version", "schema_version mismatch", "2", String(artifact.schema_version)));
  }
  if (artifact.artifact_type !== "roadmap_index") {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.artifact_type", "artifact_type mismatch", "roadmap_index", String(artifact.artifact_type)));
  }
  const schemaFile = validateString(artifact, "schema_file", artifactPath, "$.schema_file", diagnostics);
  const rawMilestones = artifact.milestones;
  if (!isRecord3(rawMilestones)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.milestones", "milestones must be a keyed mapping", "keyed mapping", String(rawMilestones)));
    return null;
  }
  const milestones = [];
  const seenIds = new Set;
  for (const [key, value] of Object.entries(rawMilestones)) {
    if (!MILESTONE_ID_PATTERN.test(key)) {
      diagnostics.push(makeDiagnostic("schema", artifactPath, `$.milestones.${key}`, "milestone key must start with 4 digits followed by a hyphen", "NNNN- prefix", key));
      continue;
    }
    if (!isRecord3(value)) {
      diagnostics.push(makeDiagnostic("schema", artifactPath, `$.milestones.${key}`, "milestone entry must be a mapping", "mapping", typeof value));
      continue;
    }
    if (seenIds.has(key)) {
      diagnostics.push(makeDiagnostic("schema", artifactPath, `$.milestones.${key}`, "duplicate milestone id", "unique milestone id", key));
      continue;
    }
    seenIds.add(key);
    const title = validateString(value, "title", artifactPath, `$.milestones.${key}.title`, diagnostics);
    const milestonePath = validateString(value, "path", artifactPath, `$.milestones.${key}.path`, diagnostics);
    const statusValue = value.status;
    if (!isDeclaredRoadmapStatus(statusValue)) {
      diagnostics.push(makeDiagnostic("schema", artifactPath, `$.milestones.${key}.status`, "unsupported milestone status", "proposed, active, blocked, complete", String(statusValue)));
    }
    if (milestonePath && !isRepoRelativePath(milestonePath)) {
      diagnostics.push(makeDiagnostic("schema", artifactPath, `$.milestones.${key}.path`, "milestone path must be repo-relative", "repo-relative path", milestonePath));
    }
    if (!title || !milestonePath || !isDeclaredRoadmapStatus(statusValue)) {
      continue;
    }
    milestones.push({
      id: key,
      title,
      path: milestonePath,
      status: statusValue
    });
  }
  if (!schemaFile) {
    return null;
  }
  return {
    schema: ROADMAP_INDEX_SCHEMA_ID,
    schema_version: 2,
    artifact_type: "roadmap_index",
    schema_file: schemaFile,
    milestones
  };
}
function validatePlannedChangeEntry(value, changeKey, artifactPath, fieldPath, diagnostics) {
  if (!isRecord3(value)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, fieldPath, "planned change entry must be a mapping", "mapping", typeof value));
    return null;
  }
  const summary = validateString(value, "summary", artifactPath, `${fieldPath}.summary`, diagnostics);
  const details = validateString(value, "details", artifactPath, `${fieldPath}.details`, diagnostics);
  const dependsOn = validateStringArray(value, "depends_on", artifactPath, `${fieldPath}.depends_on`, diagnostics);
  const statusValue = value.status;
  if (!isDeclaredPlannedChangeStatus(statusValue)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, `${fieldPath}.status`, "unsupported planned change status", "planned, complete", String(statusValue)));
  }
  if (!summary || !details || !dependsOn || !isDeclaredPlannedChangeStatus(statusValue)) {
    return null;
  }
  return {
    status: statusValue,
    summary,
    details,
    depends_on: dependsOn
  };
}
function validateBlockedMetadata(value, artifactPath, fieldPath, diagnostics) {
  if (!isRecord3(value)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, fieldPath, "blocked must be a mapping", "mapping", typeof value));
    return null;
  }
  let valid = true;
  for (const key of Object.keys(value)) {
    if (key !== "status" && key !== "reason") {
      diagnostics.push(makeDiagnostic("schema", artifactPath, `${fieldPath}.${key}`, "unsupported blocked metadata field", "status or reason", key));
      valid = false;
    }
  }
  if (typeof value.status !== "boolean") {
    diagnostics.push(makeDiagnostic("schema", artifactPath, `${fieldPath}.status`, "blocked status must be a boolean", "boolean", String(value.status)));
    valid = false;
  }
  const reason = validateOptionalString(value, "reason", artifactPath, `${fieldPath}.reason`, diagnostics);
  if (reason === null)
    valid = false;
  if (!valid)
    return null;
  return {
    status: value.status,
    ...typeof reason === "string" ? { reason } : {}
  };
}
function validateExternalRefsMetadata(value, artifactPath, fieldPath, diagnostics) {
  if (!Array.isArray(value)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, fieldPath, "external_refs must be a sequence", "external reference[]", String(value)));
    return null;
  }
  const result = [];
  let valid = true;
  for (const [index, entry] of value.entries()) {
    const entryPath = `${fieldPath}[${index}]`;
    if (!isRecord3(entry)) {
      diagnostics.push(makeDiagnostic("schema", artifactPath, entryPath, "external reference must be a mapping", "mapping", typeof entry));
      valid = false;
      continue;
    }
    for (const key of Object.keys(entry)) {
      if (key !== "label" && key !== "target") {
        diagnostics.push(makeDiagnostic("schema", artifactPath, `${entryPath}.${key}`, "unsupported external reference field", "label or target", key));
        valid = false;
      }
    }
    const label = validateString(entry, "label", artifactPath, `${entryPath}.label`, diagnostics);
    const target = validateString(entry, "target", artifactPath, `${entryPath}.target`, diagnostics);
    if (!label || !target) {
      valid = false;
      continue;
    }
    result.push({ label, target });
  }
  return valid ? result : null;
}
function validateTeamMetadata(value, artifactPath, diagnostics) {
  if (!isRecord3(value)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.team", "team must be a mapping", "mapping", typeof value));
    return null;
  }
  let valid = true;
  for (const key of Object.keys(value)) {
    if (!["owner", "reviewers", "blocked", "labels", "external_refs"].includes(key)) {
      diagnostics.push(makeDiagnostic("schema", artifactPath, `$.team.${key}`, "unsupported team metadata field", "owner, reviewers, blocked, labels, or external_refs", key));
      valid = false;
    }
  }
  const owner = validateOptionalString(value, "owner", artifactPath, "$.team.owner", diagnostics);
  const reviewers = validateOptionalStringArray(value, "reviewers", artifactPath, "$.team.reviewers", diagnostics);
  const labels = validateOptionalStringArray(value, "labels", artifactPath, "$.team.labels", diagnostics);
  const blocked = "blocked" in value && value.blocked !== undefined ? validateBlockedMetadata(value.blocked, artifactPath, "$.team.blocked", diagnostics) : undefined;
  const externalRefs = "external_refs" in value && value.external_refs !== undefined ? validateExternalRefsMetadata(value.external_refs, artifactPath, "$.team.external_refs", diagnostics) : undefined;
  if (owner === null || reviewers === null || labels === null || blocked === null || externalRefs === null) {
    valid = false;
  }
  if (!valid)
    return null;
  return {
    ...typeof owner === "string" ? { owner } : {},
    ...Array.isArray(reviewers) ? { reviewers } : {},
    ...blocked && typeof blocked.status === "boolean" ? { blocked } : {},
    ...Array.isArray(labels) ? { labels } : {},
    ...Array.isArray(externalRefs) ? { external_refs: externalRefs } : {}
  };
}
function validateStandalonePlannedChangeArtifact(artifact, artifactPath, diagnostics) {
  if (!isRecord3(artifact)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$", "artifact must be a YAML mapping", "mapping", typeof artifact));
    return null;
  }
  if (artifact.schema !== PLANNED_CHANGE_SCHEMA_ID) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.schema", "schema mismatch", PLANNED_CHANGE_SCHEMA_ID, String(artifact.schema)));
  }
  if (artifact.schema_version !== 1) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.schema_version", "schema_version mismatch", "1", String(artifact.schema_version)));
  }
  if (artifact.artifact_type !== "planned_change") {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.artifact_type", "artifact_type mismatch", "planned_change", String(artifact.artifact_type)));
  }
  const schemaFile = validateString(artifact, "schema_file", artifactPath, "$.schema_file", diagnostics);
  const summary = validateString(artifact, "summary", artifactPath, "$.summary", diagnostics);
  const details = validateString(artifact, "details", artifactPath, "$.details", diagnostics);
  const dependsOn = validateStringArray(artifact, "depends_on", artifactPath, "$.depends_on", diagnostics);
  const statusValue = artifact.status;
  if (!isDeclaredPlannedChangeStatus(statusValue)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.status", "unsupported planned change status", "planned, complete", String(statusValue)));
  }
  const rawPlannedChange = artifact.planned_change;
  let plannedChange = null;
  if (!isRecord3(rawPlannedChange)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.planned_change", "planned_change must be a mapping", "mapping", typeof rawPlannedChange));
  } else {
    const id = validateString(rawPlannedChange, "id", artifactPath, "$.planned_change.id", diagnostics);
    const milestone = validateString(rawPlannedChange, "milestone", artifactPath, "$.planned_change.milestone", diagnostics);
    if (id && milestone) {
      plannedChange = { id, milestone };
    }
  }
  const extensions = artifact.extensions;
  if (extensions !== undefined && !isRecord3(extensions)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.extensions", "extensions must be a mapping", "mapping", typeof extensions));
  }
  const team = "team" in artifact && artifact.team !== undefined ? validateTeamMetadata(artifact.team, artifactPath, diagnostics) : undefined;
  if (!schemaFile || !summary || !details || !dependsOn || !plannedChange || !isDeclaredPlannedChangeStatus(statusValue) || team === null) {
    return null;
  }
  return {
    schema: PLANNED_CHANGE_SCHEMA_ID,
    schema_version: 1,
    artifact_type: "planned_change",
    schema_file: schemaFile,
    planned_change: plannedChange,
    status: statusValue,
    summary,
    details,
    depends_on: dependsOn,
    ...team !== undefined ? { team } : {},
    ...isRecord3(extensions) ? { extensions } : {}
  };
}
function validateMilestoneArtifact(artifact, artifactPath, diagnostics) {
  if (!isRecord3(artifact)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$", "artifact must be a YAML mapping", "mapping", typeof artifact));
    return null;
  }
  if (artifact.schema !== ROADMAP_MILESTONE_SCHEMA_ID) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.schema", "schema mismatch", ROADMAP_MILESTONE_SCHEMA_ID, String(artifact.schema)));
  }
  if (artifact.schema_version !== 2) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.schema_version", "schema_version mismatch", "2", String(artifact.schema_version)));
  }
  if (artifact.artifact_type !== "roadmap_milestone") {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.artifact_type", "artifact_type mismatch", "roadmap_milestone", String(artifact.artifact_type)));
  }
  const schemaFile = validateString(artifact, "schema_file", artifactPath, "$.schema_file", diagnostics);
  const goal = validateString(artifact, "goal", artifactPath, "$.goal", diagnostics);
  const doneCriteria = validateStringArray(artifact, "done_criteria", artifactPath, "$.done_criteria", diagnostics);
  const dependencies = validateStringArray(artifact, "dependencies", artifactPath, "$.dependencies", diagnostics);
  const risks = validateStringArray(artifact, "risks", artifactPath, "$.risks", diagnostics);
  const notes = validateStringArray(artifact, "notes", artifactPath, "$.notes", diagnostics);
  const details = "details" in artifact && artifact.details !== undefined ? (() => {
    if (typeof artifact.details !== "string") {
      diagnostics.push(makeDiagnostic("schema", artifactPath, "$.details", "value must be a string", "string", typeof artifact.details));
      return null;
    }
    return artifact.details;
  })() : undefined;
  const statusValue = artifact.status;
  if (!isDeclaredRoadmapStatus(statusValue)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.status", "unsupported milestone status", "proposed, active, blocked, complete", String(statusValue)));
  }
  const rawMilestone = artifact.milestone;
  let milestone = null;
  if (!isRecord3(rawMilestone)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.milestone", "milestone must be a keyed mapping", "keyed mapping", typeof rawMilestone));
  } else {
    const milestoneKey = extractKeyedMapKey(rawMilestone);
    if (!milestoneKey) {
      diagnostics.push(makeDiagnostic("schema", artifactPath, "$.milestone", "milestone must contain exactly one keyed entry", "single keyed entry", `${Object.keys(rawMilestone).length} keys`));
    } else if (!MILESTONE_ID_PATTERN.test(milestoneKey)) {
      diagnostics.push(makeDiagnostic("schema", artifactPath, `$.milestone.${milestoneKey}`, "milestone key must start with 4 digits followed by a hyphen", "NNNN- prefix", milestoneKey));
    } else {
      const milestoneValue = rawMilestone[milestoneKey];
      if (!isRecord3(milestoneValue)) {
        diagnostics.push(makeDiagnostic("schema", artifactPath, `$.milestone.${milestoneKey}`, "milestone value must be a mapping", "mapping", typeof milestoneValue));
      } else {
        const milestoneTitle = validateString(milestoneValue, "title", artifactPath, `$.milestone.${milestoneKey}.title`, diagnostics);
        if (milestoneTitle) {
          milestone = {
            id: milestoneKey,
            title: milestoneTitle
          };
        }
      }
    }
  }
  const rawScope = artifact.scope;
  let scope = null;
  if (!isRecord3(rawScope)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.scope", "scope must be a mapping", "mapping", typeof rawScope));
  } else {
    const scopeIn = validateStringArray(rawScope, "in", artifactPath, "$.scope.in", diagnostics);
    const scopeOut = validateStringArray(rawScope, "out", artifactPath, "$.scope.out", diagnostics);
    if (scopeIn && scopeOut) {
      scope = { in: scopeIn, out: scopeOut };
    }
  }
  const rawPlannedChanges = artifact.planned_changes;
  if (!isRecord3(rawPlannedChanges)) {
    diagnostics.push(makeDiagnostic("schema", artifactPath, "$.planned_changes", "planned_changes must be a keyed mapping", "keyed mapping", String(rawPlannedChanges)));
    return null;
  }
  const plannedChanges = {};
  const seenIds = new Set;
  for (const [changeKey, changeValue] of Object.entries(rawPlannedChanges)) {
    if (seenIds.has(changeKey)) {
      diagnostics.push(makeDiagnostic("schema", artifactPath, `$.planned_changes.${changeKey}`, "duplicate planned change id", "unique planned change id", changeKey));
      continue;
    }
    seenIds.add(changeKey);
    const parsed = validatePlannedChangeEntry(changeValue, changeKey, artifactPath, `$.planned_changes.${changeKey}`, diagnostics);
    if (parsed) {
      plannedChanges[changeKey] = parsed;
    }
  }
  const plannedChangeIds = new Set(Object.keys(plannedChanges));
  const plannedChangeKeys = Object.keys(plannedChanges);
  for (const [changeKey, entry] of Object.entries(plannedChanges)) {
    for (const [dependsOnIndex, dependsOn] of entry.depends_on.entries()) {
      if (dependsOn === changeKey) {
        diagnostics.push(makeDiagnostic("semantic", artifactPath, `$.planned_changes.${changeKey}.depends_on[${dependsOnIndex}]`, "planned change cannot depend on itself", "different planned change id", dependsOn));
        continue;
      }
      if (!plannedChangeIds.has(dependsOn)) {
        diagnostics.push(makeDiagnostic("reference", artifactPath, `$.planned_changes.${changeKey}.depends_on[${dependsOnIndex}]`, "planned change dependency is missing from this milestone", "$.planned_changes keys", dependsOn));
      }
    }
  }
  const visiting = new Set;
  const visited = new Set;
  const reportedCycles = new Set;
  function visit(id, trail) {
    if (visiting.has(id)) {
      const cycleStart = trail.indexOf(id);
      const cycle = [...trail.slice(cycleStart), id];
      const cycleKey = cycle.join("->");
      if (reportedCycles.has(cycleKey))
        return;
      reportedCycles.add(cycleKey);
      diagnostics.push(makeDiagnostic("semantic", artifactPath, `$.planned_changes.${id}.depends_on`, "planned change dependencies must be acyclic", "acyclic dependency graph", cycle.join(" -> ")));
      return;
    }
    if (visited.has(id))
      return;
    visiting.add(id);
    const entry = plannedChanges[id];
    for (const dependsOn of entry?.depends_on ?? []) {
      if (plannedChangeIds.has(dependsOn) && dependsOn !== id) {
        visit(dependsOn, [...trail, id]);
      }
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const changeKey of plannedChangeKeys) {
    visit(changeKey, []);
  }
  if (!schemaFile || !milestone || !goal || !scope || !doneCriteria || !dependencies || !risks || !notes || !isDeclaredRoadmapStatus(statusValue)) {
    return null;
  }
  return {
    schema: ROADMAP_MILESTONE_SCHEMA_ID,
    schema_version: 2,
    artifact_type: "roadmap_milestone",
    schema_file: schemaFile,
    milestone,
    goal,
    scope,
    done_criteria: doneCriteria,
    planned_changes: plannedChanges,
    dependencies,
    risks,
    status: statusValue,
    notes,
    details: details ?? undefined
  };
}

// src/roadmap/load.ts
function isInsideDirectory(filePath, directoryPath) {
  const relativePath = path8.relative(directoryPath, filePath);
  return relativePath.length > 0 && !relativePath.startsWith("..") && !path8.isAbsolute(relativePath);
}
function listStandalonePlannedChangeFiles(roadmapDir, indexPath, milestonesDir) {
  return listYamlFiles(roadmapDir).filter((filePath) => {
    if (filePath === indexPath)
      return false;
    if (isInsideDirectory(filePath, milestonesDir))
      return false;
    return true;
  });
}
function appendLegacyInlinePlannedChangeDiagnostic(artifactPath, plannedChangeIds, diagnostics) {
  diagnostics.push(makeDiagnostic("semantic", artifactPath, "$.planned_changes", "inline milestone planned_changes are no longer supported; run the materialization form of the strict-roadmap-sync command from SKILL.md (repository equivalent: `node scripts/strict-spec-driven.js roadmap-sync --materialize-planned-changes`) to convert them into standalone planned-change files", "empty mapping after materialization", plannedChangeIds.join(", ")));
}
function loadRoadmap(rootDir, options = {}) {
  const warnings = [];
  const diagnostics = [];
  const roadmapDir = path8.join(rootDir, ROADMAP_DIR);
  const indexPath = path8.join(rootDir, ROADMAP_INDEX_PATH);
  const milestonesDir = path8.join(rootDir, ROADMAP_MILESTONES_DIR);
  if (!existsSync7(roadmapDir) || !statSync4(roadmapDir).isDirectory()) {
    diagnostics.push(makeDiagnostic("schema", ROADMAP_DIR, "$", "strict roadmap directory not found", ROADMAP_DIR, "missing"));
    return { warnings, diagnostics, indexArtifact: null, milestones: [], plannedChanges: [] };
  }
  let indexArtifact = null;
  if (existsSync7(indexPath)) {
    try {
      indexArtifact = validateRoadmapIndexArtifact(readYamlFile(indexPath), ROADMAP_INDEX_PATH, diagnostics);
    } catch (error) {
      const yamlDetails = getYamlParseDetails(error);
      const yamlDiagnosticDetails = getYamlDiagnosticDetails(error);
      diagnostics.push({
        ...makeDiagnostic("schema", ROADMAP_INDEX_PATH, "$", "failed to parse roadmap index YAML", "parseable YAML mapping", yamlDetails ? formatYamlParseSummary(yamlDetails) : error instanceof Error ? error.message : String(error)),
        ...yamlDiagnosticDetails
      });
    }
  } else {
    diagnostics.push(makeDiagnostic("schema", ROADMAP_INDEX_PATH, "$", "roadmap index is missing", ROADMAP_INDEX_PATH, "missing"));
  }
  const milestoneFiles = listYamlFiles(milestonesDir);
  if (milestoneFiles.length === 0) {
    warnings.push("roadmap/milestones/ is empty");
  }
  const milestones = [];
  for (const absolutePath of milestoneFiles) {
    const artifactPath = normalizeRepoRelativePath2(rootDir, absolutePath);
    try {
      const raw = readFileSync8(absolutePath, "utf8");
      const artifact = validateMilestoneArtifact(readYamlFile(absolutePath), artifactPath, diagnostics);
      if (!artifact)
        continue;
      const inlinePlannedChangeIds = Object.keys(artifact.planned_changes);
      if (!options.allowInlinePlannedChanges && inlinePlannedChangeIds.length > 0) {
        appendLegacyInlinePlannedChangeDiagnostic(artifactPath, inlinePlannedChangeIds, diagnostics);
      }
      const relativeMilestonePath = toPosix(path8.relative(milestonesDir, absolutePath));
      milestones.push({
        absolutePath,
        artifactPath,
        file: path8.basename(relativeMilestonePath),
        relativeMilestonePath,
        repoRelativePath: normalizeRepoRelativePath2(rootDir, absolutePath),
        raw,
        artifact
      });
    } catch (error) {
      const yamlDetails = getYamlParseDetails(error);
      const yamlDiagnosticDetails = getYamlDiagnosticDetails(error);
      diagnostics.push({
        ...makeDiagnostic("schema", artifactPath, "$", "failed to parse roadmap milestone YAML", "parseable YAML mapping", yamlDetails ? formatYamlParseSummary(yamlDetails) : error instanceof Error ? error.message : String(error)),
        ...yamlDiagnosticDetails
      });
    }
  }
  const plannedChanges = [];
  for (const absolutePath of listStandalonePlannedChangeFiles(roadmapDir, indexPath, milestonesDir)) {
    const artifactPath = normalizeRepoRelativePath2(rootDir, absolutePath);
    try {
      const raw = readFileSync8(absolutePath, "utf8");
      const artifact = validateStandalonePlannedChangeArtifact(readYamlFile(absolutePath), artifactPath, diagnostics);
      if (!artifact)
        continue;
      const relativeRoadmapPath = toPosix(path8.relative(roadmapDir, absolutePath));
      plannedChanges.push({
        absolutePath,
        artifactPath,
        file: path8.basename(relativeRoadmapPath),
        relativeRoadmapPath,
        repoRelativePath: normalizeRepoRelativePath2(rootDir, absolutePath),
        raw,
        artifact
      });
    } catch (error) {
      const yamlDetails = getYamlParseDetails(error);
      const yamlDiagnosticDetails = getYamlDiagnosticDetails(error);
      diagnostics.push({
        ...makeDiagnostic("schema", artifactPath, "$", "failed to parse roadmap planned-change YAML", "parseable YAML mapping", yamlDetails ? formatYamlParseSummary(yamlDetails) : error instanceof Error ? error.message : String(error)),
        ...yamlDiagnosticDetails
      });
    }
  }
  return {
    warnings,
    diagnostics: sortDiagnostics(diagnostics),
    indexArtifact,
    milestones,
    plannedChanges
  };
}

// src/roadmap/status.ts
import { existsSync as existsSync8, readdirSync as readdirSync3, statSync as statSync5 } from "fs";
import path9 from "path";
function getChangeStateIndex(rootDir) {
  const changesDir = path9.join(rootDir, STRICT_WORKFLOW_DIR4, "changes");
  const active = new Set;
  const archived = new Set;
  if (!existsSync8(changesDir) || !statSync5(changesDir).isDirectory()) {
    return { active, archived };
  }
  for (const entry of readdirSync3(changesDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "archive")
      continue;
    active.add(entry.name);
  }
  const archiveDir = path9.join(changesDir, "archive");
  if (existsSync8(archiveDir) && statSync5(archiveDir).isDirectory()) {
    for (const entry of readdirSync3(archiveDir, { withFileTypes: true })) {
      if (!entry.isDirectory())
        continue;
      const match = entry.name.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
      archived.add(match ? match[1] : entry.name);
    }
  }
  return { active, archived };
}
function derivePlannedChangeState(changeStates, id) {
  const isActive = changeStates.active.has(id);
  const isArchived = changeStates.archived.has(id);
  if (isActive && isArchived)
    return "ambiguous";
  if (isArchived)
    return "archived";
  if (isActive)
    return "active";
  return "missing";
}
function derivePlannedChangeDeclaredStatus(state) {
  return state === "archived" ? "complete" : "planned";
}
function deriveMilestoneStatus(states) {
  if (states.length === 0)
    return "proposed";
  if (states.every((state) => state === "archived"))
    return "complete";
  if (states.some((state) => state === "active" || state === "ambiguous"))
    return "active";
  return "proposed";
}
function buildPlannedChangeReferences(roadmap) {
  const references = [];
  for (const milestone of roadmap.milestones) {
    for (const [id, entry] of Object.entries(milestone.artifact.planned_changes)) {
      references.push({
        id,
        entry,
        artifactPath: milestone.artifactPath,
        fieldPath: `$.planned_changes.${id}`,
        dependsOnFieldPath: `$.planned_changes.${id}.depends_on`,
        milestoneId: milestone.artifact.milestone.id,
        source: "inline"
      });
    }
  }
  for (const plannedChange of roadmap.plannedChanges) {
    references.push({
      id: plannedChange.artifact.planned_change.id,
      entry: {
        status: plannedChange.artifact.status,
        summary: plannedChange.artifact.summary,
        details: plannedChange.artifact.details,
        depends_on: [...plannedChange.artifact.depends_on]
      },
      artifactPath: plannedChange.artifactPath,
      fieldPath: "$.planned_change.id",
      dependsOnFieldPath: "$.depends_on",
      milestoneId: plannedChange.artifact.planned_change.milestone,
      source: "standalone",
      loadedPlannedChange: plannedChange
    });
  }
  return references.sort((left, right) => {
    const byId = left.id.localeCompare(right.id);
    if (byId !== 0)
      return byId;
    const byArtifact = left.artifactPath.localeCompare(right.artifactPath);
    if (byArtifact !== 0)
      return byArtifact;
    return left.fieldPath.localeCompare(right.fieldPath);
  });
}
function reportDuplicatePlannedChangeIds(references, changeStates, diagnostics) {
  const referencesById = new Map;
  for (const reference of references) {
    const existing = referencesById.get(reference.id) ?? [];
    existing.push(reference);
    referencesById.set(reference.id, existing);
  }
  for (const [id, duplicateReferences] of referencesById) {
    if (duplicateReferences.length < 2)
      continue;
    const locations = duplicateReferences.map((reference) => reference.artifactPath).join(", ");
    for (const reference of duplicateReferences) {
      diagnostics.push(makeDiagnostic("semantic", reference.artifactPath, reference.fieldPath, "duplicate planned change id across roadmap planned-change sources", "unique planned change id", `${id} in ${locations}`));
    }
    if (changeStates.active.has(id)) {
      for (const reference of duplicateReferences) {
        diagnostics.push(makeDiagnostic("semantic", reference.artifactPath, reference.fieldPath, "duplicate planned change id conflicts with active strict change state", "one roadmap entry for the active planned change", id));
      }
    }
  }
}
function reportMissingMilestoneReferences(roadmap, references, diagnostics) {
  const milestoneIds = new Set(roadmap.milestones.map((milestone) => milestone.artifact.milestone.id));
  for (const reference of references) {
    if (reference.source !== "standalone" || milestoneIds.has(reference.milestoneId))
      continue;
    diagnostics.push(makeDiagnostic("reference", reference.artifactPath, "$.planned_change.milestone", "standalone planned change references a missing milestone", "existing roadmap milestone id", reference.milestoneId));
  }
}
function reportDependencyReferenceErrors(references, diagnostics) {
  const knownIds = new Set(references.map((reference) => reference.id));
  const graph = new Map;
  for (const reference of references) {
    const dependencies = graph.get(reference.id) ?? new Set;
    for (const [index, dependencyId] of reference.entry.depends_on.entries()) {
      const fieldPath = `${reference.dependsOnFieldPath}[${index}]`;
      if (dependencyId === reference.id) {
        diagnostics.push(makeDiagnostic("semantic", reference.artifactPath, fieldPath, "planned change cannot depend on itself", "different planned change id", dependencyId));
        continue;
      }
      if (!knownIds.has(dependencyId)) {
        diagnostics.push(makeDiagnostic("reference", reference.artifactPath, fieldPath, "planned change dependency is missing from roadmap planned-change sources", "planned change id present in roadmap planned-change sources", dependencyId));
        continue;
      }
      dependencies.add(dependencyId);
    }
    graph.set(reference.id, dependencies);
  }
  const byId = new Map;
  for (const reference of references) {
    if (!byId.has(reference.id)) {
      byId.set(reference.id, reference);
    }
  }
  const visiting = new Set;
  const visited = new Set;
  const reportedCycles = new Set;
  function visit(id, trail) {
    if (visiting.has(id)) {
      const cycleStart = trail.indexOf(id);
      const cycle = [...trail.slice(cycleStart), id];
      const cycleKey = cycle.join("->");
      if (reportedCycles.has(cycleKey))
        return;
      reportedCycles.add(cycleKey);
      const reference = byId.get(id);
      diagnostics.push(makeDiagnostic("semantic", reference?.artifactPath ?? "$", reference?.dependsOnFieldPath ?? "$.depends_on", "planned change dependencies must be acyclic across roadmap planned-change sources", "acyclic dependency graph", cycle.join(" -> ")));
      return;
    }
    if (visited.has(id))
      return;
    visiting.add(id);
    for (const dependencyId of graph.get(id) ?? []) {
      visit(dependencyId, [...trail, id]);
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of Array.from(graph.keys()).sort((left, right) => left.localeCompare(right))) {
    visit(id, []);
  }
}
function reportAmbiguousOwnershipMetadata(references, diagnostics) {
  for (const reference of references) {
    const teamOwner = reference.loadedPlannedChange?.artifact.team?.owner;
    const extensions = reference.loadedPlannedChange?.artifact.extensions;
    if (!extensions)
      continue;
    const hasOwner = Object.prototype.hasOwnProperty.call(extensions, "owner");
    const owners = extensions.owners;
    const hasOwners = Object.prototype.hasOwnProperty.call(extensions, "owners");
    const multipleOwners = Array.isArray(owners) && owners.length > 1;
    if (teamOwner && (hasOwner || hasOwners) || hasOwner && hasOwners || multipleOwners) {
      const fieldPath = teamOwner && (hasOwner || hasOwners) ? "$.team.owner" : "$.extensions";
      const actual = teamOwner && (hasOwner || hasOwners) ? "team owner and extension owner metadata" : hasOwner && hasOwners ? "owner and owners" : "multiple owners";
      diagnostics.push(makeDiagnostic("semantic", reference.artifactPath, fieldPath, "planned change ownership metadata is ambiguous", "zero or one advisory owner signal", actual));
    }
  }
}
function appendRoadmapCrossFileDiagnostics(roadmap, changeStates) {
  const references = buildPlannedChangeReferences(roadmap);
  reportDuplicatePlannedChangeIds(references, changeStates, roadmap.diagnostics);
  reportMissingMilestoneReferences(roadmap, references, roadmap.diagnostics);
  reportDependencyReferenceErrors(references, roadmap.diagnostics);
  reportAmbiguousOwnershipMetadata(references, roadmap.diagnostics);
}
function getStandalonePlannedChangesForMilestone(roadmap, milestone) {
  return roadmap.plannedChanges.filter((plannedChange) => plannedChange.artifact.planned_change.milestone === milestone.artifact.milestone.id).sort((left, right) => left.relativeRoadmapPath.localeCompare(right.relativeRoadmapPath));
}
function getMergedPlannedChangesForMilestone(milestone, standalonePlannedChanges) {
  const merged = new Map;
  for (const [id, entry] of Object.entries(milestone.artifact.planned_changes)) {
    merged.set(id, {
      id,
      entry,
      source: "inline",
      path: toPosix(path9.join("roadmap", "milestones", milestone.relativeMilestonePath))
    });
  }
  for (const plannedChange of standalonePlannedChanges) {
    const id = plannedChange.artifact.planned_change.id;
    merged.set(id, {
      id,
      source: "standalone",
      path: toPosix(path9.join("roadmap", plannedChange.relativeRoadmapPath)),
      loadedPlannedChange: plannedChange,
      entry: {
        status: plannedChange.artifact.status,
        summary: plannedChange.artifact.summary,
        details: plannedChange.artifact.details,
        depends_on: [...plannedChange.artifact.depends_on]
      }
    });
  }
  return Array.from(merged.values());
}
function buildMilestoneStatus(milestone, changeStates, plannedChangeEntries = getMergedPlannedChangesForMilestone(milestone, [])) {
  const plannedChanges = plannedChangeEntries.map(({ id, entry, source, path: plannedChangePath }) => {
    const state = derivePlannedChangeState(changeStates, id);
    const derivedStatus2 = derivePlannedChangeDeclaredStatus(state);
    const mismatches2 = [];
    if (state === "ambiguous") {
      mismatches2.push("planned change exists in both active and archived strict change state; resolve the duplicate history");
    }
    if (entry.status !== derivedStatus2) {
      mismatches2.push(`declared planned change status '${entry.status}' does not match derived planned change status '${derivedStatus2}'`);
    }
    return {
      id,
      source,
      path: plannedChangePath,
      summary: entry.summary,
      declaredStatus: entry.status,
      derivedStatus: derivedStatus2,
      state,
      mismatches: mismatches2
    };
  });
  const derivedStatus = deriveMilestoneStatus(plannedChanges.map((entry) => entry.state));
  const mismatches = [];
  if (milestone.artifact.status !== derivedStatus) {
    mismatches.push(`declared status '${milestone.artifact.status}' does not match derived status '${derivedStatus}'`);
  }
  return {
    file: milestone.file,
    path: toPosix(path9.join("roadmap", "milestones", milestone.relativeMilestonePath)),
    id: milestone.artifact.milestone.id,
    title: milestone.artifact.milestone.title,
    goal: milestone.artifact.goal,
    declaredStatus: milestone.artifact.status,
    derivedStatus,
    plannedChanges,
    mismatches
  };
}
function orderMilestoneStatuses(rootDir, roadmap, statuses, roadmapIndexPath) {
  const ordered = [];
  const seenPaths = new Set;
  const diagnostics = roadmap.diagnostics;
  if (roadmap.indexArtifact) {
    for (const entry of roadmap.indexArtifact.milestones) {
      const normalizedPath = toPosix(entry.path);
      const status = statuses.get(normalizedPath);
      const absolutePath = resolveStrictWorkflowPath(rootDir, normalizedPath);
      if (!existsSync8(absolutePath)) {
        diagnostics.push(makeDiagnostic("reference", roadmapIndexPath, `$.milestones.${entry.id}.path`, "roadmap index entry references a missing milestone file", "existing roadmap milestone file", normalizedPath));
        continue;
      }
      if (!status)
        continue;
      seenPaths.add(normalizedPath);
      if (entry.id !== status.id) {
        diagnostics.push(makeDiagnostic("semantic", roadmapIndexPath, `$.milestones.${entry.id}.id`, "roadmap index milestone id must match the milestone artifact", status.id, entry.id));
      }
      if (entry.title !== status.title) {
        diagnostics.push(makeDiagnostic("semantic", roadmapIndexPath, `$.milestones.${entry.id}.title`, "roadmap index milestone title must match the milestone artifact", status.title, entry.title));
      }
      if (entry.status !== status.declaredStatus) {
        diagnostics.push(makeDiagnostic("semantic", roadmapIndexPath, `$.milestones.${entry.id}.status`, "roadmap index milestone status must match the milestone declared status", status.declaredStatus, entry.status));
      }
      ordered.push(status);
    }
  }
  for (const milestone of roadmap.milestones) {
    const milestonePath = toPosix(path9.join("roadmap", "milestones", milestone.relativeMilestonePath));
    if (seenPaths.has(milestonePath))
      continue;
    if (roadmap.indexArtifact) {
      diagnostics.push(makeDiagnostic("reference", roadmapIndexPath, "$.milestones", "roadmap index is missing a milestone file present under roadmap/milestones/", milestonePath));
    }
    const status = statuses.get(milestonePath);
    if (status)
      ordered.push(status);
  }
  return ordered;
}

// src/roadmap/sync.ts
import { existsSync as existsSync9, mkdirSync as mkdirSync3, readFileSync as readFileSync9, writeFileSync as writeFileSync4 } from "fs";
import path10 from "path";
function writeFileIfChanged(filePath, nextContent, updatedFiles, rootDir) {
  const normalized = ensureTrailingNewline(nextContent);
  const current = existsSync9(filePath) ? ensureTrailingNewline(readFileSync9(filePath, "utf8")) : null;
  if (current === normalized)
    return;
  writeFileSync4(filePath, normalized, "utf8");
  updatedFiles.push(normalizeRepoRelativePath2(rootDir, filePath));
}
function buildCanonicalMilestoneArtifact(milestone, status, options = {}) {
  const plannedChanges = {};
  for (const [id, entry] of Object.entries(milestone.artifact.planned_changes)) {
    if (options.omitInlinePlannedChangeIds?.has(id))
      continue;
    const plannedStatus = status.plannedChanges.find((candidate) => candidate.id === id);
    plannedChanges[id] = {
      status: plannedStatus?.derivedStatus ?? entry.status,
      summary: entry.summary,
      details: entry.details,
      depends_on: [...entry.depends_on]
    };
  }
  const milestoneKeyed = {};
  milestoneKeyed[milestone.artifact.milestone.id] = { title: milestone.artifact.milestone.title };
  return {
    schema: ROADMAP_MILESTONE_SCHEMA_ID,
    schema_version: 2,
    artifact_type: "roadmap_milestone",
    schema_file: milestone.artifact.schema_file,
    milestone: milestoneKeyed,
    goal: milestone.artifact.goal,
    scope: {
      in: [...milestone.artifact.scope.in],
      out: [...milestone.artifact.scope.out]
    },
    done_criteria: [...milestone.artifact.done_criteria],
    planned_changes: plannedChanges,
    dependencies: [...milestone.artifact.dependencies],
    risks: [...milestone.artifact.risks],
    status: status.derivedStatus,
    notes: [...milestone.artifact.notes],
    ...milestone.artifact.details != null ? { details: milestone.artifact.details } : {}
  };
}
function buildMaterializedPlannedChangeArtifact(milestone, id, entry, status) {
  const plannedStatus = status.plannedChanges.find((candidate) => candidate.id === id);
  return {
    schema: PLANNED_CHANGE_SCHEMA_ID,
    schema_version: 1,
    artifact_type: "planned_change",
    schema_file: "../../templates/strict-spec-driven/schemas/planned-change.yaml",
    planned_change: {
      id,
      milestone: milestone.artifact.milestone.id
    },
    status: plannedStatus?.derivedStatus ?? entry.status,
    summary: entry.summary,
    details: entry.details,
    depends_on: [...entry.depends_on]
  };
}
function buildCanonicalPlannedChangeArtifact(plannedChange, status) {
  const plannedStatus = status.plannedChanges.find((candidate) => candidate.id === plannedChange.artifact.planned_change.id);
  return {
    schema: plannedChange.artifact.schema,
    schema_version: 1,
    artifact_type: "planned_change",
    schema_file: plannedChange.artifact.schema_file,
    planned_change: {
      id: plannedChange.artifact.planned_change.id,
      milestone: plannedChange.artifact.planned_change.milestone
    },
    status: plannedStatus?.derivedStatus ?? plannedChange.artifact.status,
    summary: plannedChange.artifact.summary,
    details: plannedChange.artifact.details,
    depends_on: [...plannedChange.artifact.depends_on],
    ...plannedChange.artifact.team != null ? { team: plannedChange.artifact.team } : {},
    ...plannedChange.artifact.extensions != null ? { extensions: plannedChange.artifact.extensions } : {}
  };
}
function materializedPlannedChangePath(rootDir, milestone, plannedChangeId) {
  return path10.join(rootDir, ROADMAP_DIR, "planned-changes", `${milestone.artifact.milestone.id}-${plannedChangeId}.yaml`);
}
function ensurePlannedChangeDirectory(filePath) {
  mkdirSync3(path10.dirname(filePath), { recursive: true });
}
function extractMilestoneId(artifact) {
  const milestoneField = artifact.milestone;
  const key = Object.keys(milestoneField)[0];
  return typeof key === "string" ? key : artifact.milestone.id;
}
function extractMilestoneTitle(artifact) {
  const milestoneField = artifact.milestone;
  const key = Object.keys(milestoneField)[0];
  if (key) {
    const value = milestoneField[key];
    if (value && typeof value.title === "string")
      return value.title;
  }
  return artifact.milestone.title;
}
function buildRoadmapIndexArtifact(milestones) {
  const milestoneEntries = milestones.slice().sort((left, right) => left.relativeMilestonePath.localeCompare(right.relativeMilestonePath));
  const milestonesMap = {};
  for (const milestone of milestoneEntries) {
    milestonesMap[extractMilestoneId(milestone.artifact)] = {
      title: extractMilestoneTitle(milestone.artifact),
      path: toPosix(path10.join("roadmap", "milestones", milestone.relativeMilestonePath)),
      status: milestone.artifact.status
    };
  }
  return {
    schema: ROADMAP_INDEX_SCHEMA_ID,
    schema_version: 2,
    artifact_type: "roadmap_index",
    schema_file: "../schemas/roadmap-index.yaml",
    milestones: milestonesMap
  };
}

// src/roadmap.ts
function padTableCell(value, width, align = "left") {
  return align === "right" ? value.padStart(width, " ") : value.padEnd(width, " ");
}
function renderTextTable(rows, columns) {
  const widths = columns.map((column) => Math.max(column.header.length, ...rows.map((row) => column.value(row).length)));
  const header = columns.map((column, index) => padTableCell(column.header, widths[index], column.align)).join("  ");
  const separator = widths.map((width) => "-".repeat(width)).join("  ");
  const body = rows.map((row) => columns.map((column, index) => padTableCell(column.value(row), widths[index], column.align)).join("  "));
  return [header, separator, ...body];
}
function appendWarnings(lines, warnings) {
  if (warnings.length === 0)
    return;
  lines.push("Warnings:");
  for (const warning of warnings) {
    lines.push(`- ${warning}`);
  }
  lines.push("");
}
function appendDiagnostics(lines, diagnostics) {
  if (diagnostics.length === 0)
    return;
  lines.push("Diagnostics:");
  for (const diagnostic of diagnostics) {
    lines.push(`- [${diagnostic.source}] ${diagnostic.artifactPath} ${diagnostic.fieldPath}`);
    lines.push(`  message: ${diagnostic.message}`);
    if (diagnostic.expected !== undefined) {
      lines.push(`  expected: ${diagnostic.expected}`);
    }
    if (diagnostic.actual !== undefined) {
      lines.push(`  actual: ${diagnostic.actual}`);
    }
  }
  lines.push("");
}
function milestoneIssueCount(milestone) {
  return milestone.mismatches.length + milestone.plannedChanges.reduce((count, plannedChange) => count + plannedChange.mismatches.length, 0);
}
function appendPlannedChangeDetail(lines, plannedChange) {
  lines.push(`  - ${plannedChange.id} | state=${plannedChange.state} | declared=${plannedChange.declaredStatus} | derived=${plannedChange.derivedStatus} | path=${plannedChange.path}`);
  lines.push(`    summary: ${plannedChange.summary}`);
  if (plannedChange.mismatches.length === 0)
    return;
  for (const mismatch of plannedChange.mismatches) {
    lines.push(`    issue: ${mismatch}`);
  }
}
function loadRoadmapStatusContext(rootDir) {
  const roadmap = loadRoadmap(rootDir);
  const changeStates = getChangeStateIndex(rootDir);
  appendRoadmapCrossFileDiagnostics(roadmap, changeStates);
  const statusMap = new Map;
  for (const milestone of roadmap.milestones) {
    const milestonePath = `roadmap/milestones/${milestone.relativeMilestonePath}`;
    const standalonePlannedChanges = getStandalonePlannedChangesForMilestone(roadmap, milestone);
    const plannedChangeEntries = getMergedPlannedChangesForMilestone(milestone, standalonePlannedChanges);
    statusMap.set(milestonePath, buildMilestoneStatus(milestone, changeStates, plannedChangeEntries));
  }
  const milestones = orderMilestoneStatuses(rootDir, roadmap, statusMap, ROADMAP_INDEX_PATH);
  const diagnostics = sortDiagnostics(roadmap.diagnostics);
  return {
    roadmap,
    warnings: roadmap.warnings,
    diagnostics,
    milestones
  };
}
function formatRoadmapOverview(result) {
  const lines = [`Roadmap overview (${result.valid ? "valid" : "invalid"})`, ""];
  appendWarnings(lines, result.warnings);
  appendDiagnostics(lines, result.diagnostics);
  lines.push("Milestone summary:");
  if (result.milestones.length === 0) {
    lines.push("(none)");
  } else {
    const summaryRows = renderTextTable(result.milestones, [
      { header: "ID", value: (milestone) => milestone.id },
      { header: "Declared", value: (milestone) => milestone.declaredStatus },
      { header: "Derived", value: (milestone) => milestone.derivedStatus },
      { header: "Planned", value: (milestone) => String(milestone.plannedChanges.length), align: "right" },
      {
        header: "Complete",
        value: (milestone) => String(milestone.plannedChanges.filter((plannedChange) => plannedChange.derivedStatus === "complete").length),
        align: "right"
      },
      { header: "Issues", value: (milestone) => String(milestoneIssueCount(milestone)), align: "right" },
      { header: "Title", value: (milestone) => milestone.title }
    ]);
    lines.push(...summaryRows);
  }
  lines.push("");
  lines.push("Milestone detail:");
  if (result.milestones.length === 0) {
    lines.push("(none)");
  } else {
    for (const milestone of result.milestones) {
      lines.push(`[${milestone.id}] ${milestone.title}`);
      lines.push(`path: ${milestone.path}`);
      lines.push(`goal: ${milestone.goal}`);
      lines.push(`status: declared=${milestone.declaredStatus} derived=${milestone.derivedStatus}`);
      if (milestone.mismatches.length > 0) {
        for (const mismatch of milestone.mismatches) {
          lines.push(`issue: ${mismatch}`);
        }
      }
      if (milestone.plannedChanges.length === 0) {
        lines.push("planned changes: (none)");
      } else {
        lines.push("planned changes:");
        for (const plannedChange of milestone.plannedChanges) {
          appendPlannedChangeDetail(lines, plannedChange);
        }
      }
      lines.push("");
    }
    while (lines[lines.length - 1] === "") {
      lines.pop();
    }
  }
  return `${lines.join(`
`)}
`;
}
function getRoadmapStatus(rootDir) {
  const { warnings, diagnostics, milestones } = loadRoadmapStatusContext(rootDir);
  return {
    valid: diagnostics.length === 0,
    warnings,
    diagnostics,
    milestones
  };
}
function createPlannedChangeStatusIndex(milestones) {
  const index = new Map;
  for (const milestone of milestones) {
    for (const plannedChange of milestone.plannedChanges) {
      index.set(plannedChange.id, plannedChange);
    }
  }
  return index;
}
function findPlannedChangeStatus(milestoneStatus, plannedChangeId, plannedChangePath) {
  return milestoneStatus.plannedChanges.find((plannedChange) => plannedChange.id === plannedChangeId && plannedChange.path === plannedChangePath);
}
function buildCandidateSkipReasons(plannedChangeStatus, dependencyStatusIndex, dependencyIds) {
  const skipReasons = [];
  if (plannedChangeStatus.state === "active") {
    skipReasons.push({
      code: "workflow-state-active",
      message: "active strict change conflicts with this planned change"
    });
  } else if (plannedChangeStatus.state === "archived") {
    skipReasons.push({
      code: "workflow-state-archived",
      message: "planned change is already complete in archived strict workflow state"
    });
  } else if (plannedChangeStatus.state === "ambiguous") {
    skipReasons.push({
      code: "workflow-state-ambiguous",
      message: "planned change exists in both active and archived strict workflow state"
    });
  }
  for (const mismatch of plannedChangeStatus.mismatches) {
    skipReasons.push({
      code: "planned-change-mismatch",
      message: mismatch
    });
  }
  for (const dependencyId of dependencyIds) {
    const dependencyStatus = dependencyStatusIndex.get(dependencyId);
    if (dependencyStatus?.derivedStatus === "complete")
      continue;
    skipReasons.push({
      code: "dependency-incomplete",
      message: dependencyStatus ? `dependency '${dependencyId}' is not complete (state=${dependencyStatus.state})` : `dependency '${dependencyId}' is missing from roadmap status`
    });
  }
  return skipReasons;
}
function recommendRoadmapChange(rootDir) {
  const { roadmap, warnings, diagnostics, milestones } = loadRoadmapStatusContext(rootDir);
  if (diagnostics.length > 0) {
    return {
      valid: false,
      warnings,
      diagnostics,
      recommendation: null,
      candidates: []
    };
  }
  const milestoneByPath = new Map(roadmap.milestones.map((milestone) => [`roadmap/milestones/${milestone.relativeMilestonePath}`, milestone]));
  const dependencyStatusIndex = createPlannedChangeStatusIndex(milestones);
  const candidates = [];
  const recommendationReason = "first eligible standalone planned change in roadmap order with complete dependencies and no roadmap mismatches";
  let recommendation = null;
  for (const milestoneStatus of milestones) {
    const milestone = milestoneByPath.get(milestoneStatus.path);
    if (!milestone)
      continue;
    for (const standalonePlannedChange of getStandalonePlannedChangesForMilestone(roadmap, milestone)) {
      const plannedChangePath = `roadmap/${standalonePlannedChange.relativeRoadmapPath}`;
      const plannedChangeStatus = findPlannedChangeStatus(milestoneStatus, standalonePlannedChange.artifact.planned_change.id, plannedChangePath);
      if (!plannedChangeStatus)
        continue;
      const skipReasons = buildCandidateSkipReasons(plannedChangeStatus, dependencyStatusIndex, standalonePlannedChange.artifact.depends_on);
      const candidate = {
        id: standalonePlannedChange.artifact.planned_change.id,
        changeName: standalonePlannedChange.artifact.planned_change.id,
        summary: standalonePlannedChange.artifact.summary,
        path: plannedChangePath,
        milestone: {
          id: milestoneStatus.id,
          title: milestoneStatus.title,
          path: milestoneStatus.path
        },
        eligible: skipReasons.length === 0,
        skipReasons
      };
      candidates.push(candidate);
      if (!candidate.eligible || recommendation)
        continue;
      recommendation = {
        id: candidate.id,
        changeName: candidate.changeName,
        summary: candidate.summary,
        path: candidate.path,
        milestone: candidate.milestone,
        reason: recommendationReason
      };
    }
  }
  return {
    valid: true,
    warnings,
    diagnostics,
    recommendation,
    candidates
  };
}
function syncRoadmap(rootDir, options = {}) {
  const roadmap = loadRoadmap(rootDir, {
    allowInlinePlannedChanges: options.materializePlannedChanges === true
  });
  const changeStates = getChangeStateIndex(rootDir);
  appendRoadmapCrossFileDiagnostics(roadmap, changeStates);
  const blockingDiagnostics = roadmap.diagnostics.filter((diagnostic) => diagnostic.artifactPath !== ROADMAP_INDEX_PATH);
  if (blockingDiagnostics.length > 0) {
    return {
      valid: false,
      warnings: roadmap.warnings,
      diagnostics: sortDiagnostics(blockingDiagnostics),
      updatedFiles: [],
      milestones: []
    };
  }
  const roadmapDir = path11.join(rootDir, ROADMAP_DIR);
  if (!existsSync10(roadmapDir) || !statSync6(roadmapDir).isDirectory()) {
    return {
      valid: false,
      warnings: roadmap.warnings,
      diagnostics: [
        makeDiagnostic("schema", ROADMAP_DIR, "$", "strict roadmap directory not found", ROADMAP_DIR, "missing")
      ],
      updatedFiles: [],
      milestones: []
    };
  }
  const updatedFiles = [];
  for (const milestone of roadmap.milestones) {
    const standalonePlannedChanges = getStandalonePlannedChangesForMilestone(roadmap, milestone);
    const plannedChangeEntries = getMergedPlannedChangesForMilestone(milestone, standalonePlannedChanges);
    const status2 = buildMilestoneStatus(milestone, changeStates, plannedChangeEntries);
    const materializedInlineIds = options.materializePlannedChanges ? new Set(Object.keys(milestone.artifact.planned_changes)) : undefined;
    if (options.materializePlannedChanges) {
      for (const [id, entry] of Object.entries(milestone.artifact.planned_changes)) {
        const plannedChangePath = materializedPlannedChangePath(rootDir, milestone, id);
        ensurePlannedChangeDirectory(plannedChangePath);
        const plannedChangeArtifact = buildMaterializedPlannedChangeArtifact(milestone, id, entry, status2);
        writeFileIfChanged(plannedChangePath, stringifyYamlDocument(plannedChangeArtifact), updatedFiles, rootDir);
      }
    }
    const nextArtifact = buildCanonicalMilestoneArtifact(milestone, status2, {
      omitInlinePlannedChangeIds: materializedInlineIds
    });
    writeFileIfChanged(milestone.absolutePath, stringifyYamlDocument(nextArtifact), updatedFiles, rootDir);
    milestone.artifact = nextArtifact;
    milestone.raw = ensureTrailingNewline(stringifyYamlDocument(nextArtifact));
    for (const plannedChange of standalonePlannedChanges) {
      const nextPlannedChangeArtifact = buildCanonicalPlannedChangeArtifact(plannedChange, status2);
      writeFileIfChanged(plannedChange.absolutePath, stringifyYamlDocument(nextPlannedChangeArtifact), updatedFiles, rootDir);
      plannedChange.artifact = nextPlannedChangeArtifact;
      plannedChange.raw = ensureTrailingNewline(stringifyYamlDocument(nextPlannedChangeArtifact));
    }
  }
  const indexPath = path11.join(rootDir, ROADMAP_INDEX_PATH);
  const nextIndex = buildRoadmapIndexArtifact(roadmap.milestones);
  writeFileIfChanged(indexPath, stringifyYamlDocument(nextIndex), updatedFiles, rootDir);
  const status = getRoadmapStatus(rootDir);
  return {
    valid: status.valid,
    warnings: status.warnings,
    diagnostics: status.diagnostics,
    updatedFiles,
    milestones: status.milestones
  };
}

// src/verify.ts
import { existsSync as existsSync11, readdirSync as readdirSync4, readFileSync as readFileSync10, statSync as statSync7 } from "fs";
import path12 from "path";
var STRICT_WORKFLOW_DIR5 = ".strict-spec-driven";
var FORBIDDEN_SPEC_SUBDIRS = new Set([".strict-spec-driven", "changes", "archive"]);
function collectDiagnostics(results) {
  return results.map((d) => ({
    source: d.source,
    artifactPath: d.artifactPath,
    fieldPath: d.fieldPath,
    message: d.message,
    expected: d.expected,
    actual: d.actual
  }));
}
function makeYamlParseDiagnostic(artifactPath, message, error) {
  const yamlDetails = getYamlParseDetails(error);
  const yamlDiagnosticDetails = getYamlDiagnosticDetails(error);
  return {
    source: "yaml_parse",
    artifactPath,
    fieldPath: "$",
    message,
    expected: "parseable YAML mapping",
    actual: yamlDetails ? formatYamlParseSummary(yamlDetails) : error instanceof Error ? error.message : String(error),
    ...yamlDiagnosticDetails
  };
}
function validateArtifactSchema(artifactType, artifact, artifactPath) {
  const diagnostics = [];
  const record = artifact;
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    diagnostics.push({
      source: "schema",
      artifactPath,
      fieldPath: "$",
      message: "artifact is not a YAML mapping",
      expected: "YAML mapping",
      actual: String(typeof artifact)
    });
    return diagnostics;
  }
  const expectedArtifactType = artifactType;
  if (record.artifact_type !== expectedArtifactType) {
    diagnostics.push({
      source: "schema",
      artifactPath,
      fieldPath: "$.artifact_type",
      message: `artifact_type mismatch`,
      expected: expectedArtifactType,
      actual: String(record.artifact_type)
    });
  }
  const schema2 = loadBundledSchemaByArtifactType(artifactType);
  const result = validateArtifact(schema2, artifact, artifactPath);
  diagnostics.push(...collectDiagnostics(result.diagnostics));
  return diagnostics;
}
function checkTaskCompletion(artifact, artifactPath) {
  let totalTasks = 0;
  let completeTasks = 0;
  const diagnostics = [];
  for (const [sectionName, taskMap] of Object.entries(artifact.sections ?? {})) {
    for (const [taskId, task] of Object.entries(taskMap ?? {})) {
      totalTasks += 1;
      if (task.status === "complete") {
        completeTasks += 1;
      } else {
        diagnostics.push({
          source: "task_completion",
          artifactPath,
          fieldPath: `$.sections.${sectionName}.${taskId}`,
          message: `task '${taskId}' has status '${task.status}', expected 'complete'`,
          expected: "complete",
          actual: task.status
        });
      }
    }
  }
  return { diagnostics, totalTasks, completeTasks };
}
function checkOpenQuestions(artifact, artifactPath) {
  const open = artifact.open ?? [];
  const diagnostics = [];
  if (open.length > 0) {
    diagnostics.push({
      source: "open_questions",
      artifactPath,
      fieldPath: "$.open",
      message: `questions.yaml has ${open.length} unresolved open question(s)`,
      expected: "0 open questions",
      actual: `${open.length} open question(s)`
    });
  }
  return { diagnostics, openCount: open.length };
}
function checkTestingGates(artifact, artifactPath) {
  const diagnostics = [];
  const gates = artifact.testing_gates;
  if (!gates)
    return diagnostics;
  const testingMap = artifact.sections?.["Testing"];
  const testingTaskIds = new Set(testingMap ? Object.keys(testingMap) : []);
  const gateRefs = [
    ["validation_task", gates.validation_task],
    ["unit_test_task", gates.unit_test_task]
  ];
  for (const [gateName, taskId] of gateRefs) {
    if (taskId !== undefined && !testingTaskIds.has(taskId)) {
      diagnostics.push({
        source: "testing_gates",
        artifactPath,
        fieldPath: `$.testing_gates.${gateName}`,
        message: `testing gate '${gateName}' references task '${taskId}' which does not exist in the Testing section`,
        expected: "existing Testing section task ID",
        actual: taskId
      });
    }
  }
  return diagnostics;
}
function validateDeltaSpecs(changeDir, artifactPathPrefix) {
  const specsDir = path12.join(changeDir, "specs");
  if (!existsSync11(specsDir))
    return [];
  const diagnostics = [];
  function scanDir(dir) {
    for (const entry of readdirSync4(dir, { withFileTypes: true })) {
      const fullPath = path12.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml"))) {
        const relativePath = path12.relative(specsDir, fullPath).split(path12.sep).join("/");
        const content = readFileSync10(fullPath, "utf8");
        const artifactPath = `${artifactPathPrefix}/${relativePath}`;
        let artifact;
        try {
          artifact = parseYamlDocument(content, { source: artifactPath });
        } catch (error) {
          diagnostics.push(makeYamlParseDiagnostic(artifactPath, "delta spec is not valid YAML", error));
          continue;
        }
        diagnostics.push(...validateArtifactSchema("delta_spec", artifact, artifactPath));
      }
    }
  }
  scanDir(specsDir);
  return diagnostics;
}
function listYamlFiles2(directoryPath) {
  if (!existsSync11(directoryPath)) {
    return [];
  }
  const files = [];
  function walk(currentPath) {
    const entries = readdirSync4(currentPath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const fullPath = path12.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.isFile() && (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml"))) {
        files.push(fullPath);
      }
    }
  }
  walk(directoryPath);
  return files;
}
function buildMainSpecRequirementIndex(rootDir) {
  const specsRoot = path12.join(rootDir, STRICT_WORKFLOW_DIR5, "specs");
  const diagnostics = [];
  const specsById = new Map;
  for (const specPath of listYamlFiles2(specsRoot)) {
    if (path12.basename(specPath) === "INDEX.yaml") {
      continue;
    }
    const artifactPath = path12.relative(rootDir, specPath).split(path12.sep).join("/");
    const content = readFileSync10(specPath, "utf8");
    let artifact;
    try {
      artifact = parseYamlDocument(content, { source: artifactPath });
    } catch (error) {
      diagnostics.push(makeYamlParseDiagnostic(artifactPath, "main spec is not valid YAML", error));
      continue;
    }
    if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) {
      continue;
    }
    const record = artifact;
    if (record.artifact_type !== "main_spec") {
      continue;
    }
    const spec = record.spec;
    if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
      continue;
    }
    const specId = spec.id;
    if (typeof specId !== "string" || specId.length === 0) {
      continue;
    }
    const requirements = record.requirements;
    if (!requirements || typeof requirements !== "object" || Array.isArray(requirements)) {
      continue;
    }
    specsById.set(specId, {
      artifactPath,
      requirementIds: new Set(Object.keys(requirements))
    });
  }
  return { diagnostics, specsById };
}
function checkAddedRequirementCollisions(rootDir, changeDir) {
  const diagnostics = [];
  const { diagnostics: mainSpecDiagnostics, specsById } = buildMainSpecRequirementIndex(rootDir);
  diagnostics.push(...mainSpecDiagnostics);
  const specsDir = path12.join(changeDir, "specs");
  for (const deltaSpecPath of listYamlFiles2(specsDir)) {
    const artifactPath = path12.relative(rootDir, deltaSpecPath).split(path12.sep).join("/");
    const content = readFileSync10(deltaSpecPath, "utf8");
    let artifact;
    try {
      artifact = parseYamlDocument(content, { source: artifactPath });
    } catch {
      continue;
    }
    if (typeof artifact.target_spec !== "string" || artifact.target_spec.length === 0) {
      continue;
    }
    const targetSpec = specsById.get(artifact.target_spec);
    if (!targetSpec) {
      continue;
    }
    const added = artifact.operations?.ADDED;
    if (!added || typeof added !== "object" || Array.isArray(added)) {
      continue;
    }
    for (const requirementId of Object.keys(added).sort()) {
      if (!targetSpec.requirementIds.has(requirementId)) {
        continue;
      }
      diagnostics.push({
        source: "added_requirement_collision",
        artifactPath,
        fieldPath: `$.operations.ADDED.${requirementId}`,
        message: `ADDED requirement '${requirementId}' already exists in target main spec '${artifact.target_spec}'`,
        expected: "ADDED requirement id absent from target main spec",
        actual: `existing requirement '${requirementId}' in ${targetSpec.artifactPath}`
      });
    }
  }
  return diagnostics;
}
function checkExclusiveActiveTargets(rootDir, changeName) {
  const changesDir = path12.join(rootDir, STRICT_WORKFLOW_DIR5, "changes");
  if (!existsSync11(changesDir))
    return [];
  const diagnostics = [];
  const targetMap = new Map;
  const activeDirs = readdirSync4(changesDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  for (const activeChange of activeDirs) {
    let scanDir = function(dir) {
      for (const entry of readdirSync4(dir, { withFileTypes: true })) {
        const fullPath = path12.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml"))) {
          const artifactPath = path12.relative(rootDir, fullPath).split(path12.sep).join("/");
          const content = readFileSync10(fullPath, "utf8");
          let artifact;
          try {
            artifact = parseYamlDocument(content, { source: artifactPath });
          } catch (error) {
            if (activeChange !== changeName) {
              diagnostics.push(makeYamlParseDiagnostic(artifactPath, "delta spec is not valid YAML", error));
            }
            continue;
          }
          const ops = artifact.operations ?? {};
          for (const [opName, entries] of Object.entries(ops)) {
            if (opName !== "MODIFIED" && opName !== "REMOVED")
              continue;
            if (!entries || typeof entries !== "object" || Array.isArray(entries))
              continue;
            for (const target of Object.keys(entries)) {
              if (!targetMap.has(target))
                targetMap.set(target, []);
              targetMap.get(target).push({
                changeName: activeChange,
                operation: opName
              });
            }
          }
        }
      }
    };
    const specsDir = path12.join(changesDir, activeChange, "specs");
    if (!existsSync11(specsDir))
      continue;
    scanDir(specsDir);
  }
  for (const [requirementId, changes] of targetMap) {
    if (changes.length <= 1)
      continue;
    const changeNames = [...new Set(changes.map((c) => c.changeName))];
    if (!changeNames.includes(changeName))
      continue;
    if (changeNames.length <= 1)
      continue;
    diagnostics.push({
      source: "exclusive_active_target",
      artifactPath: `.strict-spec-driven/changes/${changeName}/specs/`,
      fieldPath: `$.operations`,
      message: `requirement '${requirementId}' is MODIFIED/REMOVED in multiple active changes: ${changeNames.join(", ")}`,
      expected: "unique MODIFIED/REMOVED target across active changes",
      actual: `conflict between ${changes.map((c) => c.changeName).join(" and ")}`
    });
  }
  return diagnostics;
}
function verifyChange(rootDir, changeName) {
  const changeDir = path12.join(rootDir, STRICT_WORKFLOW_DIR5, "changes", changeName);
  if (!existsSync11(changeDir)) {
    throw new Error(`change '${changeName}' not found`);
  }
  const allDiagnostics = [];
  let totalTasks = 0;
  let completeTasks = 0;
  let openQuestionCount = 0;
  const specsRoot = path12.join(rootDir, STRICT_WORKFLOW_DIR5, "specs");
  if (existsSync11(specsRoot) && statSync7(specsRoot).isDirectory()) {
    for (const entry of readdirSync4(specsRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && FORBIDDEN_SPEC_SUBDIRS.has(entry.name)) {
        allDiagnostics.push({
          source: "directory_structure",
          artifactPath: `.strict-spec-driven/specs/${entry.name}`,
          fieldPath: "$",
          message: `.strict-spec-driven/specs/ must not contain a '${entry.name}' subdirectory; workflow state directories belong under .strict-spec-driven/ directly`,
          expected: `no '${entry.name}' subdirectory under .strict-spec-driven/specs/`,
          actual: `found .strict-spec-driven/specs/${entry.name}/`
        });
      }
    }
  }
  const artifactConfigs = [
    ["change_proposal", "proposal.yaml"],
    ["change_design", "design.yaml"],
    ["task_list", "tasks.yaml"],
    ["question_list", "questions.yaml"]
  ];
  for (const [artifactType, fileName] of artifactConfigs) {
    const filePath = path12.join(changeDir, fileName);
    const artifactPath = `.strict-spec-driven/changes/${changeName}/${fileName}`;
    if (!existsSync11(filePath)) {
      allDiagnostics.push({
        source: "schema",
        artifactPath,
        fieldPath: "$",
        message: `required artifact '${fileName}' is missing`
      });
      continue;
    }
    const content = readFileSync10(filePath, "utf8");
    let artifact;
    try {
      artifact = parseYamlDocument(content, { source: artifactPath });
    } catch (error) {
      allDiagnostics.push(makeYamlParseDiagnostic(artifactPath, `artifact '${fileName}' is not valid YAML`, error));
      continue;
    }
    allDiagnostics.push(...validateArtifactSchema(artifactType, artifact, artifactPath));
    if (artifactType === "task_list") {
      const taskArtifact = artifact;
      const taskResult = checkTaskCompletion(taskArtifact, artifactPath);
      allDiagnostics.push(...taskResult.diagnostics);
      totalTasks = taskResult.totalTasks;
      completeTasks = taskResult.completeTasks;
      allDiagnostics.push(...checkTestingGates(taskArtifact, artifactPath));
    }
    if (artifactType === "question_list") {
      const questionArtifact = artifact;
      const questionResult = checkOpenQuestions(questionArtifact, artifactPath);
      allDiagnostics.push(...questionResult.diagnostics);
      openQuestionCount = questionResult.openCount;
    }
  }
  const specsPrefix = `.strict-spec-driven/changes/${changeName}/specs`;
  allDiagnostics.push(...validateDeltaSpecs(changeDir, specsPrefix));
  allDiagnostics.push(...checkAddedRequirementCollisions(rootDir, changeDir));
  allDiagnostics.push(...checkExclusiveActiveTargets(rootDir, changeName));
  allDiagnostics.sort((a, b) => {
    const aKey = [a.source, a.artifactPath, a.fieldPath, a.message].join("|");
    const bKey = [b.source, b.artifactPath, b.fieldPath, b.message].join("|");
    return aKey.localeCompare(bKey);
  });
  return {
    valid: allDiagnostics.length === 0,
    diagnostics: allDiagnostics,
    changeName,
    totalTasks,
    completeTasks,
    remainingPending: totalTasks - completeTasks,
    openQuestionCount
  };
}

// src/archive.ts
var STRICT_WORKFLOW_DIR6 = ".strict-spec-driven";
function normalizeRepoRelativePath3(rootDir, absolutePath) {
  return path13.relative(rootDir, absolutePath).split(path13.sep).join("/");
}
function formatLocalDate(date = new Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function asObject2(value, description) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${description} must be a YAML mapping`);
  }
  return value;
}
function listYamlFiles3(directoryPath) {
  if (!existsSync12(directoryPath)) {
    return [];
  }
  const files = [];
  function walk(currentPath) {
    const entries = readdirSync5(currentPath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const fullPath = path13.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.isFile() && (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml"))) {
        files.push(fullPath);
      }
    }
  }
  walk(directoryPath);
  return files;
}
function readYamlFile2(filePath) {
  const content = readFileSync11(filePath, "utf8");
  return parseYamlDocument(content);
}
function writeYamlFile(filePath, value) {
  writeFileSync5(filePath, stringifyYamlDocument(value), "utf8");
}
function assertUniqueRequirementIds(requirements, specPath) {}
function formatVerifyDiagnostic(diagnostic) {
  return `${diagnostic.source} ${diagnostic.artifactPath} ${diagnostic.fieldPath}: ${diagnostic.message}`;
}
function formatVerificationFailure(result) {
  const diagnosticSummary = result.diagnostics.slice(0, 5).map(formatVerifyDiagnostic).join("; ");
  const suffix = diagnosticSummary.length > 0 ? `: ${diagnosticSummary}` : "";
  return `change '${result.changeName}' failed verification (${result.diagnostics.length} diagnostic(s))${suffix}`;
}
function collectMainSpecPathsById(rootDir) {
  const specsRoot = path13.join(rootDir, STRICT_WORKFLOW_DIR6, "specs");
  const byId = new Map;
  for (const specPath of listYamlFiles3(specsRoot)) {
    if (path13.basename(specPath) === "INDEX.yaml") {
      continue;
    }
    const parsed = readYamlFile2(specPath);
    const artifact = asObject2(parsed, `main spec '${specPath}'`);
    if (artifact.artifact_type !== "main_spec") {
      continue;
    }
    const spec = asObject2(artifact.spec, `main spec '${specPath}' field 'spec'`);
    const specId = spec.id;
    if (typeof specId !== "string" || specId.length === 0) {
      throw new Error(`main spec '${specPath}' is missing spec.id`);
    }
    if (byId.has(specId)) {
      throw new Error(`duplicate main spec id '${specId}' in '${specPath}' and '${byId.get(specId)}'`);
    }
    byId.set(specId, specPath);
  }
  return byId;
}
function applyDeltaToMainSpec(mainSpec, deltaSpec, report, specPath) {
  if (!mainSpec.requirements || typeof mainSpec.requirements !== "object" || Array.isArray(mainSpec.requirements)) {
    throw new Error(`main spec '${specPath}' is missing requirements`);
  }
  const operations = deltaSpec.operations ?? {};
  for (const [reqId, value] of Object.entries(operations.ADDED ?? {})) {
    if (reqId in mainSpec.requirements) {
      throw new Error(`ADDED requirement '${reqId}' already exists in target main spec '${deltaSpec.target_spec}'`);
    }
    mainSpec.requirements[reqId] = { ...value };
    report.added += 1;
  }
  for (const [targetRequirement, replacement] of Object.entries(operations.MODIFIED ?? {})) {
    if (!(targetRequirement in mainSpec.requirements)) {
      mainSpec.requirements[targetRequirement] = { ...replacement };
      report.modifiedMissingTargetAsAdded.push(targetRequirement);
      continue;
    }
    mainSpec.requirements[targetRequirement] = { ...replacement };
    report.modified += 1;
  }
  for (const targetRequirement of Object.keys(operations.REMOVED ?? {})) {
    if (!(targetRequirement in mainSpec.requirements)) {
      report.removedMissingTargetSkipped.push(targetRequirement);
      continue;
    }
    delete mainSpec.requirements[targetRequirement];
    report.removed += 1;
  }
  assertUniqueRequirementIds(mainSpec.requirements, specPath);
}
function buildArchiveDestination(rootDir, changeName) {
  const archiveRoot = path13.join(rootDir, STRICT_WORKFLOW_DIR6, "changes", "archive");
  mkdirSync4(archiveRoot, { recursive: true });
  const datePrefix = formatLocalDate();
  const baseName = `${datePrefix}-${changeName}`;
  let candidate = path13.join(archiveRoot, baseName);
  let sequence = 2;
  while (existsSync12(candidate)) {
    candidate = path13.join(archiveRoot, `${baseName}-${sequence}`);
    sequence += 1;
  }
  return candidate;
}
function regenerateSpecIndex(rootDir) {
  const specsRoot = path13.join(rootDir, STRICT_WORKFLOW_DIR6, "specs");
  const indexPath = path13.join(specsRoot, "INDEX.yaml");
  const specs = listYamlFiles3(specsRoot).filter((filePath) => path13.basename(filePath) !== "INDEX.yaml").map((filePath) => {
    const parsed = readYamlFile2(filePath);
    const artifact = asObject2(parsed, `spec '${filePath}'`);
    if (artifact.artifact_type !== "main_spec") {
      return null;
    }
    const spec = asObject2(artifact.spec, `spec '${filePath}' field 'spec'`);
    const specId = spec.id;
    const title = spec.title;
    if (typeof specId !== "string" || specId.length === 0) {
      throw new Error(`main spec '${filePath}' is missing spec.id`);
    }
    if (typeof title !== "string" || title.length === 0) {
      throw new Error(`main spec '${filePath}' is missing spec.title`);
    }
    return {
      id: specId,
      title,
      path: normalizeRepoRelativePath3(rootDir, filePath)
    };
  }).filter((value) => value !== null).sort((left, right) => {
    const byPath = left.path.localeCompare(right.path);
    if (byPath !== 0) {
      return byPath;
    }
    return left.id.localeCompare(right.id);
  });
  let indexArtifact = {
    schema: "strict-spec-driven/spec-index/v1",
    schema_version: 1,
    artifact_type: "spec_index",
    schema_file: "templates/strict-spec-driven/schemas/spec-index.yaml",
    specs: []
  };
  if (existsSync12(indexPath)) {
    const parsed = readYamlFile2(indexPath);
    const artifact = asObject2(parsed, `spec index '${indexPath}'`);
    indexArtifact = {
      ...artifact,
      specs: []
    };
  } else {
    mkdirSync4(path13.dirname(indexPath), { recursive: true });
  }
  indexArtifact.specs = specs;
  writeYamlFile(indexPath, indexArtifact);
}
function syncRoadmapAfterArchive(rootDir) {
  const roadmapDir = path13.join(rootDir, ROADMAP_DIR);
  if (!existsSync12(roadmapDir)) {
    return null;
  }
  return syncRoadmap(rootDir);
}
function archiveChange(rootDir, changeName) {
  const changeDir = path13.join(rootDir, STRICT_WORKFLOW_DIR6, "changes", changeName);
  if (!existsSync12(changeDir)) {
    throw new Error(`change '${changeName}' not found`);
  }
  const verifyResult = verifyChange(rootDir, changeName);
  if (!verifyResult.valid) {
    throw new Error(formatVerificationFailure(verifyResult));
  }
  const requiredArtifacts = ["proposal.yaml", "design.yaml", "tasks.yaml", "questions.yaml"];
  for (const artifactName of requiredArtifacts) {
    const artifactPath = path13.join(changeDir, artifactName);
    if (!existsSync12(artifactPath)) {
      throw new Error(`required artifact '${artifactName}' is missing`);
    }
    readYamlFile2(artifactPath);
  }
  const mainSpecPathsById = collectMainSpecPathsById(rootDir);
  const deltaSpecsDir = path13.join(changeDir, "specs");
  const deltaSpecPaths = listYamlFiles3(deltaSpecsDir);
  const mainSpecCache = new Map;
  const mergeReports = new Map;
  for (const deltaSpecPath of deltaSpecPaths) {
    const deltaSpec = readYamlFile2(deltaSpecPath);
    if (typeof deltaSpec.target_spec !== "string" || deltaSpec.target_spec.length === 0) {
      throw new Error(`delta spec '${deltaSpecPath}' is missing target_spec`);
    }
    const targetSpecPath = mainSpecPathsById.get(deltaSpec.target_spec);
    if (!targetSpecPath) {
      throw new Error(`delta spec '${deltaSpecPath}' targets missing main spec '${deltaSpec.target_spec}'`);
    }
    let mainSpec = mainSpecCache.get(targetSpecPath);
    if (!mainSpec) {
      mainSpec = readYamlFile2(targetSpecPath);
      if (mainSpec.artifact_type !== "main_spec") {
        throw new Error(`target spec '${targetSpecPath}' is not a main_spec artifact`);
      }
      mainSpecCache.set(targetSpecPath, mainSpec);
    }
    let report = mergeReports.get(deltaSpec.target_spec);
    if (!report) {
      report = {
        targetSpec: deltaSpec.target_spec,
        specPath: normalizeRepoRelativePath3(rootDir, targetSpecPath),
        added: 0,
        modified: 0,
        removed: 0,
        modifiedMissingTargetAsAdded: [],
        removedMissingTargetSkipped: []
      };
      mergeReports.set(deltaSpec.target_spec, report);
    }
    applyDeltaToMainSpec(mainSpec, deltaSpec, report, targetSpecPath);
  }
  for (const [mainSpecPath, mainSpecArtifact] of mainSpecCache) {
    writeYamlFile(mainSpecPath, mainSpecArtifact);
  }
  regenerateSpecIndex(rootDir);
  const archiveDestination = buildArchiveDestination(rootDir, changeName);
  renameSync(changeDir, archiveDestination);
  const roadmapSync = syncRoadmapAfterArchive(rootDir);
  const mergedSpecs = Array.from(mergeReports.values()).sort((left, right) => {
    const bySpecPath = left.specPath.localeCompare(right.specPath);
    if (bySpecPath !== 0) {
      return bySpecPath;
    }
    return left.targetSpec.localeCompare(right.targetSpec);
  });
  const mergeSummary = mergedSpecs.reduce((summary, report) => {
    summary.specsUpdated += 1;
    summary.added += report.added;
    summary.modified += report.modified;
    summary.removed += report.removed;
    summary.modifiedMissingTargetAsAdded += report.modifiedMissingTargetAsAdded.length;
    summary.removedMissingTargetSkipped += report.removedMissingTargetSkipped.length;
    return summary;
  }, {
    specsUpdated: 0,
    added: 0,
    modified: 0,
    removed: 0,
    modifiedMissingTargetAsAdded: 0,
    removedMissingTargetSkipped: 0
  });
  return {
    valid: true,
    changeName,
    archiveDestination: normalizeRepoRelativePath3(rootDir, archiveDestination),
    mergeSummary,
    mergedSpecs,
    roadmapSync
  };
}

// src/cli/changes.ts
import { existsSync as existsSync14, readFileSync as readFileSync12 } from "fs";
import path15 from "path";

// src/cli/fs.ts
import { existsSync as existsSync13, readdirSync as readdirSync6, statSync as statSync8 } from "fs";
import path14 from "path";
function normalizeRepoRelativePath4(rootDir, absolutePath) {
  return path14.relative(rootDir, absolutePath).split(path14.sep).join("/");
}
function normalizePathSeparators(value) {
  return value.split(path14.sep).join("/");
}
function listDirectoryNames(directoryPath) {
  if (!existsSync13(directoryPath) || !statSync8(directoryPath).isDirectory()) {
    return [];
  }
  return readdirSync6(directoryPath, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort((a, b) => a.localeCompare(b));
}
function listYamlFiles4(directoryPath) {
  if (!existsSync13(directoryPath) || !statSync8(directoryPath).isDirectory()) {
    return [];
  }
  const files = [];
  function walk(currentPath) {
    const entries = readdirSync6(currentPath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const fullPath = path14.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.isFile() && (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml"))) {
        files.push(fullPath);
      }
    }
  }
  walk(directoryPath);
  return files;
}
function listFilesRecursive(directoryPath) {
  if (!existsSync13(directoryPath) || !statSync8(directoryPath).isDirectory()) {
    return [];
  }
  const files = [];
  function walk(currentPath) {
    const entries = readdirSync6(currentPath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const fullPath = path14.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }
  walk(directoryPath);
  return files;
}

// src/cli/changes.ts
var STRICT_WORKFLOW_DIR7 = ".strict-spec-driven";
function getChangesDir(rootDir) {
  return path15.join(rootDir, STRICT_WORKFLOW_DIR7, "changes");
}
function getArchiveDir(rootDir) {
  return path15.join(getChangesDir(rootDir), "archive");
}
function readActiveChangeStatus(rootDir, changeName) {
  const changeDir = path15.join(getChangesDir(rootDir), changeName);
  const questionsPath = path15.join(changeDir, "questions.yaml");
  const tasksPath = path15.join(changeDir, "tasks.yaml");
  try {
    if (existsSync14(questionsPath)) {
      const questionsArtifact = parseYamlDocument(readFileSync12(questionsPath, "utf8"));
      if (Array.isArray(questionsArtifact.open) && questionsArtifact.open.length > 0) {
        return "blocked";
      }
    }
    if (!existsSync14(tasksPath)) {
      return "proposed";
    }
    const tasksArtifact = parseYamlDocument(readFileSync12(tasksPath, "utf8"));
    let total = 0;
    let complete = 0;
    for (const taskMap of Object.values(tasksArtifact.sections ?? {})) {
      for (const task of Object.values(taskMap ?? {})) {
        total += 1;
        if (task.status === "complete") {
          complete += 1;
        }
      }
    }
    if (total === 0 || complete === 0) {
      return "proposed";
    }
    if (complete === total) {
      return "done";
    }
    return `in-progress (${complete}/${total})`;
  } catch {
    return "invalid";
  }
}
function listActiveChanges(rootDir) {
  return listDirectoryNames(getChangesDir(rootDir)).filter((name) => name !== "archive").map((name) => ({
    name,
    status: readActiveChangeStatus(rootDir, name)
  }));
}
function listArchivedChanges(rootDir) {
  return listDirectoryNames(getArchiveDir(rootDir));
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function findArchivedMatchesByBareName(rootDir, bareName) {
  const archivedChangePattern = new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${escapeRegExp(bareName)}(?:-\\d+)?$`);
  return listArchivedChanges(rootDir).filter((archiveDirName) => archivedChangePattern.test(archiveDirName));
}

// src/cli/cmd-change.ts
function printChangeArtifacts(rootDir, name, changeDir) {
  writeOut(`Artifacts for '${name}':
`);
  for (const artifact of ["proposal.yaml", "design.yaml", "tasks.yaml", "questions.yaml"]) {
    const artifactPath = path16.join(changeDir, artifact);
    const displayPath = normalizeRepoRelativePath4(rootDir, artifactPath);
    writeOut(`  ${displayPath}${existsSync15(artifactPath) ? "" : " (missing)"}
`);
  }
  const specsDir = path16.join(changeDir, "specs");
  const specFiles = listYamlFiles4(specsDir);
  if (specFiles.length === 0) {
    writeOut(`  ${normalizeRepoRelativePath4(rootDir, specsDir)}/ (empty)
`);
    return;
  }
  for (const specFile of specFiles) {
    writeOut(`  ${normalizeRepoRelativePath4(rootDir, specFile)}
`);
  }
}
function runApply(argv) {
  const [changeName, ...extraArgs] = argv;
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven apply <change-name>
`);
    return 0;
  }
  if (!changeName || extraArgs.length > 0) {
    writeUsage(`Usage: strict-spec-driven apply <change-name>
`);
    return 1;
  }
  if (!CHANGE_NAME_PATTERN.test(changeName)) {
    writeError("change name must be kebab-case (lowercase letters, numbers, and hyphens)");
    return 1;
  }
  try {
    const tasksYaml = readChangeTasks(process.cwd(), changeName);
    const { result, updatedYaml } = applyTask(tasksYaml);
    writeChangeTasks(process.cwd(), changeName, updatedYaml);
    writeJson(result);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeError(message);
    return 1;
  }
}
function runVerify(argv) {
  const [changeName, ...extraArgs] = argv;
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven verify <change-name>
`);
    return 0;
  }
  if (!changeName || extraArgs.length > 0) {
    writeUsage(`Usage: strict-spec-driven verify <change-name>
`);
    return 1;
  }
  if (!CHANGE_NAME_PATTERN.test(changeName)) {
    writeError("change name must be kebab-case (lowercase letters, numbers, and hyphens)");
    return 1;
  }
  try {
    const result = verifyChange(process.cwd(), changeName);
    writeJson(result);
    return result.valid ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeError(message);
    return 1;
  }
}
function runArchive(argv) {
  const [changeName, ...extraArgs] = argv;
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven archive <change-name>
`);
    return 0;
  }
  if (!changeName || extraArgs.length > 0) {
    writeUsage(`Usage: strict-spec-driven archive <change-name>
`);
    return 1;
  }
  if (!CHANGE_NAME_PATTERN.test(changeName)) {
    writeError("change name must be kebab-case (lowercase letters, numbers, and hyphens)");
    return 1;
  }
  try {
    const result = archiveChange(process.cwd(), changeName);
    writeJson(result);
    return result.valid ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeError(message);
    return 1;
  }
}
function runList(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven list
`);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(`Usage: strict-spec-driven list
`);
    return 1;
  }
  const rootDir = process.cwd();
  const changesDir = getChangesDir(rootDir);
  if (!existsSync15(changesDir) || !statSync9(changesDir).isDirectory()) {
    writeOut(`No .strict-spec-driven/changes/ directory found.
`);
    return 0;
  }
  const activeChanges = listActiveChanges(rootDir);
  if (activeChanges.length > 0) {
    writeOut(`Active:
`);
    for (const activeChange of activeChanges) {
      writeOut(`  ${activeChange.name}    ${activeChange.status}
`);
    }
  }
  const archivedChanges = listArchivedChanges(rootDir);
  if (archivedChanges.length > 0) {
    writeOut(`Archived:
`);
    for (const archivedChange of archivedChanges) {
      writeOut(`  ${archivedChange}
`);
    }
  }
  if (activeChanges.length === 0 && archivedChanges.length === 0) {
    writeOut(`No changes.
`);
  }
  return 0;
}
function runModify(argv) {
  const [target, ...extraArgs] = argv;
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven modify [change-name|archive-dir]
`);
    return 0;
  }
  if (extraArgs.length > 0) {
    writeUsage(`Usage: strict-spec-driven modify [change-name|archive-dir]
`);
    return 1;
  }
  const rootDir = process.cwd();
  if (!target) {
    const activeChanges = listActiveChanges(rootDir);
    if (activeChanges.length === 0) {
      writeOut(`No active changes.
`);
      return 0;
    }
    writeOut(`Active changes:
`);
    for (const activeChange of activeChanges) {
      writeOut(`  ${activeChange.name}    ${activeChange.status}
`);
    }
    return 0;
  }
  const activeTargetDir = path16.join(getChangesDir(rootDir), target);
  if (existsSync15(activeTargetDir) && statSync9(activeTargetDir).isDirectory()) {
    printChangeArtifacts(rootDir, target, activeTargetDir);
    return 0;
  }
  const archiveRoot = getArchiveDir(rootDir);
  const archivedTargetDir = path16.join(archiveRoot, target);
  if (existsSync15(archivedTargetDir) && statSync9(archivedTargetDir).isDirectory()) {
    printChangeArtifacts(rootDir, target, archivedTargetDir);
    return 0;
  }
  const archivedBareMatches = findArchivedMatchesByBareName(rootDir, target);
  if (archivedBareMatches.length > 0) {
    writeError(`archived targets require exact archive directory names (YYYY-MM-DD-<name>); matched: ${archivedBareMatches.join(", ")}`);
    return 1;
  }
  writeError(`change '${target}' not found`);
  return 1;
}
function runCancel(argv) {
  const [target, ...extraArgs] = argv;
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven cancel <change-name>
`);
    return 0;
  }
  if (!target || extraArgs.length > 0) {
    writeUsage(`Usage: strict-spec-driven cancel <change-name>
`);
    return 1;
  }
  if (!CHANGE_NAME_PATTERN.test(target)) {
    writeError("change name must be kebab-case (lowercase letters, numbers, and hyphens)");
    return 1;
  }
  const rootDir = process.cwd();
  const archiveRoot = getArchiveDir(rootDir);
  const archivedTargetDir = path16.join(archiveRoot, target);
  if (existsSync15(archivedTargetDir) && statSync9(archivedTargetDir).isDirectory()) {
    writeError(`cancel is limited to active changes; archived target '${target}' cannot be cancelled`);
    return 1;
  }
  const activeTargetDir = path16.join(getChangesDir(rootDir), target);
  if (existsSync15(activeTargetDir) && statSync9(activeTargetDir).isDirectory()) {
    rmSync(activeTargetDir, { recursive: true, force: true });
    writeOut(`Cancelled: ${normalizeRepoRelativePath4(rootDir, activeTargetDir)}
`);
    return 0;
  }
  const archivedBareMatches = findArchivedMatchesByBareName(rootDir, target);
  if (archivedBareMatches.length > 0) {
    writeError(`cancel is limited to active changes; '${target}' is archived as ${archivedBareMatches.join(", ")}`);
    return 1;
  }
  writeError(`change '${target}' not found`);
  return 1;
}

// src/cli/cmd-workflow.ts
import { existsSync as existsSync17, statSync as statSync10 } from "node:fs";
import path18 from "node:path";

// src/workflow-state.ts
import { existsSync as existsSync16, readdirSync as readdirSync7, readFileSync as readFileSync13 } from "fs";
import path17 from "path";

// src/task-list.ts
function flattenTasks(artifact) {
  const sections = artifact.sections;
  if (!sections)
    return [];
  const result = [];
  for (const [sectionName, taskMap] of Object.entries(sections)) {
    for (const [taskId, task] of Object.entries(taskMap ?? {})) {
      result.push({ sectionName, taskId, text: task.text, status: task.status, command: task.command });
    }
  }
  return result;
}

// src/workflow-state.ts
var STRICT_WORKFLOW_DIR8 = ".strict-spec-driven";
function changeDir(rootDir, changeName) {
  return path17.join(rootDir, STRICT_WORKFLOW_DIR8, "changes", changeName);
}
function toRepoPath(rootDir, absolutePath) {
  return path17.relative(rootDir, absolutePath).split(path17.sep).join("/");
}
function listDeltaSpecFiles(rootDir, changeName) {
  const specsDir = path17.join(changeDir(rootDir, changeName), "specs");
  if (!existsSync16(specsDir))
    return [];
  const files = [];
  function walk(currentPath) {
    for (const entry of readdirSync7(currentPath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const fullPath = path17.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.isFile() && (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml"))) {
        files.push(toRepoPath(rootDir, fullPath));
      }
    }
  }
  walk(specsDir);
  return files;
}
function readOpenQuestionIds(rootDir, changeName) {
  const questionsPath = path17.join(changeDir(rootDir, changeName), "questions.yaml");
  if (!existsSync16(questionsPath))
    return [];
  const artifact = parseYamlDocument(readFileSync13(questionsPath, "utf8"), {
    source: toRepoPath(rootDir, questionsPath)
  });
  return (artifact.open ?? []).map((question) => question.id).filter((id) => typeof id === "string" && id.length > 0).sort();
}
function readFirstPendingTask(rootDir, changeName) {
  const tasksPath = path17.join(changeDir(rootDir, changeName), "tasks.yaml");
  if (!existsSync16(tasksPath))
    return;
  const artifact = parseYamlDocument(readFileSync13(tasksPath, "utf8"), { source: toRepoPath(rootDir, tasksPath) });
  return flattenTasks(artifact).find((task) => task.status !== "complete");
}
function suggestionsForDiagnostics(rootDir, changeName, diagnostics) {
  const suggestions = [];
  const openQuestionIds = readOpenQuestionIds(rootDir, changeName);
  for (const questionId of openQuestionIds) {
    suggestions.push({
      command: `strict-spec-driven generate ${changeName} questions --resolve ${questionId} --answer <answer>`,
      reason: `Resolve open question '${questionId}' after a human supplies the answer.`
    });
  }
  const firstPendingTask = readFirstPendingTask(rootDir, changeName);
  if (firstPendingTask) {
    if (firstPendingTask.command) {
      suggestions.push({
        command: firstPendingTask.command,
        reason: `Run the command for pending task '${firstPendingTask.taskId}' before marking it complete.`
      });
    }
    suggestions.push({
      command: `strict-spec-driven apply ${changeName}`,
      reason: `Mark pending task '${firstPendingTask.taskId}' complete after the work is done.`
    });
  }
  if (diagnostics.some((diagnostic) => diagnostic.source !== "task_completion" && diagnostic.source !== "open_questions")) {
    suggestions.push({
      command: `strict-spec-driven verify ${changeName}`,
      reason: "Rerun strict verification after fixing reported artifact or workflow diagnostics."
    });
  }
  if (diagnostics.length === 0) {
    suggestions.push({
      command: `/strict-spec-review ${changeName}`,
      reason: "Perform skill-driven code review after the change verifies cleanly."
    });
  }
  return suggestions;
}
function getWorkflowState(rootDir, changeName) {
  const verification = verifyChange(rootDir, changeName);
  return {
    changeName,
    valid: verification.valid,
    totalTasks: verification.totalTasks,
    completeTasks: verification.completeTasks,
    remainingPending: verification.remainingPending,
    openQuestionCount: verification.openQuestionCount,
    blockers: verification.diagnostics,
    suggestions: suggestionsForDiagnostics(rootDir, changeName, verification.diagnostics)
  };
}
function checkProposalReadiness(rootDir, changeName) {
  const verification = verifyChange(rootDir, changeName);
  const diagnostics = verification.diagnostics.filter((diagnostic) => diagnostic.source !== "task_completion");
  if (listDeltaSpecFiles(rootDir, changeName).length === 0) {
    diagnostics.push({
      source: "proposal_readiness",
      artifactPath: `.strict-spec-driven/changes/${changeName}/specs/`,
      fieldPath: "$",
      message: "change has no delta spec files for proposal handoff",
      expected: "at least one delta spec file or an explicit empty-spec decision",
      actual: "no delta spec files"
    });
  }
  diagnostics.sort((a, b) => {
    const aKey = [a.source, a.artifactPath, a.fieldPath, a.message].join("|");
    const bKey = [b.source, b.artifactPath, b.fieldPath, b.message].join("|");
    return aKey.localeCompare(bKey);
  });
  const suggestions = suggestionsForDiagnostics(rootDir, changeName, diagnostics);
  if (diagnostics.some((diagnostic) => diagnostic.source === "proposal_readiness")) {
    suggestions.push({
      command: `strict-spec-driven generate ${changeName} delta-spec --target-spec <spec-id> ...`,
      reason: "Create a target-spec-scoped delta spec when the change has strict spec impact."
    });
  }
  return {
    changeName,
    ready: diagnostics.length === 0,
    diagnostics,
    suggestions
  };
}

// src/cli/cmd-workflow.ts
var STRICT_WORKFLOW_STATE_DIR = ".strict-spec-driven";
function runCheckWorkflowState(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven check-workflow-state
`);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(`Usage: strict-spec-driven check-workflow-state
`);
    return 1;
  }
  const workflowStatePath = path18.join(process.cwd(), STRICT_WORKFLOW_STATE_DIR);
  if (existsSync17(workflowStatePath) && statSync10(workflowStatePath).isDirectory()) {
    writeOut(`strict workflow state exists: .strict-spec-driven/
`);
    return 0;
  }
  writeError("strict workflow state is missing: .strict-spec-driven/");
  writeUsage(`Run /strict-spec-init before using strict workflow commands.
`);
  return 1;
}
function runReady(argv) {
  const [changeName, ...extraArgs] = argv;
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven ready <change-name>
`);
    return 0;
  }
  if (!changeName || extraArgs.length > 0) {
    writeUsage(`Usage: strict-spec-driven ready <change-name>
`);
    return 1;
  }
  if (!CHANGE_NAME_PATTERN.test(changeName)) {
    writeError("change name must be kebab-case (lowercase letters, numbers, and hyphens)");
    return 1;
  }
  try {
    const result = checkProposalReadiness(process.cwd(), changeName);
    writeJson(result);
    return result.ready ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeError(message);
    return 1;
  }
}
function runNext(argv) {
  const [changeName, ...extraArgs] = argv;
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven next <change-name>
`);
    return 0;
  }
  if (!changeName || extraArgs.length > 0) {
    writeUsage(`Usage: strict-spec-driven next <change-name>
`);
    return 1;
  }
  if (!CHANGE_NAME_PATTERN.test(changeName)) {
    writeError("change name must be kebab-case (lowercase letters, numbers, and hyphens)");
    return 1;
  }
  try {
    writeJson(getWorkflowState(process.cwd(), changeName));
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeError(message);
    return 1;
  }
}

// src/cli/cmd-roadmap.ts
function runRoadmapStatus(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven roadmap-status
`);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(`Usage: strict-spec-driven roadmap-status
`);
    return 1;
  }
  const result = getRoadmapStatus(process.cwd());
  writeJson(result);
  return result.valid ? 0 : 1;
}
function runRoadmapOverview(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven roadmap-overview
`);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(`Usage: strict-spec-driven roadmap-overview
`);
    return 1;
  }
  const result = getRoadmapStatus(process.cwd());
  writeOut(formatRoadmapOverview(result));
  return result.valid ? 0 : 1;
}
function runRoadmapSync(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven roadmap-sync [--materialize-planned-changes]
`);
    return 0;
  }
  const materializePlannedChanges = argv.length === 1 && argv[0] === "--materialize-planned-changes";
  if (argv.length > 0 && !materializePlannedChanges) {
    writeUsage(`Usage: strict-spec-driven roadmap-sync [--materialize-planned-changes]
`);
    return 1;
  }
  const result = syncRoadmap(process.cwd(), { materializePlannedChanges });
  writeJson(result);
  return result.valid ? 0 : 1;
}
function runRoadmapRecommend(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven roadmap-recommend
`);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(`Usage: strict-spec-driven roadmap-recommend
`);
    return 1;
  }
  const result = recommendRoadmapChange(process.cwd());
  writeJson(result);
  return result.valid && result.recommendation !== null ? 0 : 1;
}

// src/maintenance.ts
import { existsSync as existsSync18, readdirSync as readdirSync8, statSync as statSync11, writeFileSync as writeFileSync6 } from "fs";
import path19 from "path";
var STRICT_WORKFLOW_DIR9 = ".strict-spec-driven";
var FORBIDDEN_SPEC_SUBDIRS2 = new Set([".strict-spec-driven", "changes", "archive"]);
function getChangesDir2(rootDir) {
  return path19.join(rootDir, STRICT_WORKFLOW_DIR9, "changes");
}
function generateChangeName(rootDir, date) {
  const changesDir = getChangesDir2(rootDir);
  let candidate = `maintenance-${date}`;
  if (!existsSync18(path19.join(changesDir, candidate)))
    return candidate;
  for (let i2 = 2;i2 <= 99; i2++) {
    candidate = `maintenance-${date}-${i2}`;
    if (!existsSync18(path19.join(changesDir, candidate)))
      return candidate;
  }
  throw new Error(`Could not generate a unique maintenance change name for date ${date}`);
}
function runRoadmapSyncCheck(rootDir) {
  const result = syncRoadmap(rootDir);
  return result.updatedFiles.map((file) => ({
    check: "roadmap-sync-check",
    description: `Synced roadmap file: ${file}`
  }));
}
function runSpecsDirectoryStructureCheck(rootDir) {
  const specsDir = path19.join(rootDir, STRICT_WORKFLOW_DIR9, "specs");
  if (!existsSync18(specsDir) || !statSync11(specsDir).isDirectory())
    return [];
  const findings = [];
  for (const entry of readdirSync8(specsDir, { withFileTypes: true })) {
    if (entry.isDirectory() && FORBIDDEN_SPEC_SUBDIRS2.has(entry.name)) {
      findings.push({
        check: "specs-directory-structure-check",
        description: `Remove misplaced .strict-spec-driven/specs/${entry.name}/ directory; workflow state directories belong under .strict-spec-driven/ directly`
      });
    }
  }
  return findings;
}
function buildProposalYaml(changeName, findings) {
  const checkTypes = [...new Set(findings.map((f) => f.check))];
  return {
    schema: "strict-spec-driven/change-proposal/v1",
    schema_version: 1,
    artifact_type: "change_proposal",
    schema_file: "templates/strict-spec-driven/schemas/change-proposal.yaml",
    change: { id: changeName, status: "proposed" },
    summary: {
      what: checkTypes.map((t) => `Applied ${t} findings.`),
      why: ["Automated maintenance run detected and applied repository drift corrections."]
    },
    scope: {
      in: findings.map((f) => f.description),
      out: []
    },
    unchanged_behavior: []
  };
}
function buildTasksYaml(changeName, findings) {
  const implementationTasks = {};
  for (const [i2, f] of findings.entries()) {
    implementationTasks[`finding-${i2 + 1}`] = {
      text: `[${f.check}] ${f.description}`,
      status: "pending"
    };
  }
  return {
    schema: "strict-spec-driven/task-list/v2",
    schema_version: 2,
    artifact_type: "task_list",
    schema_file: "templates/strict-spec-driven/schemas/task-list.yaml",
    change: changeName,
    sections: {
      Implementation: implementationTasks,
      Testing: {
        "run-build": { text: "Run build validation.", status: "pending", command: "bun run build" },
        "run-tests": { text: "Run unit tests.", status: "pending", command: "bun test/run.ts" }
      },
      Verification: {
        "verify-scope": { text: "Verify maintenance scope matches findings.", status: "pending" }
      }
    },
    testing_gates: {
      validation_task: "run-build",
      unit_test_task: "run-tests"
    }
  };
}
function runMaintenance(rootDir) {
  const configPath = path19.join(rootDir, STRICT_WORKFLOW_DIR9, "config.yaml");
  if (!existsSync18(configPath)) {
    return { valid: true, checksRun: 0, findingsCount: 0, generatedChange: null };
  }
  let config;
  try {
    config = parseYamlFile(configPath);
  } catch {
    return { valid: false, checksRun: 0, findingsCount: 0, generatedChange: null };
  }
  const maintenanceCfg = config.maintenance;
  if (!maintenanceCfg?.checks?.length) {
    return { valid: true, checksRun: 0, findingsCount: 0, generatedChange: null };
  }
  const findings = [];
  let checksRun = 0;
  for (const check of maintenanceCfg.checks) {
    if (check.type === "roadmap-sync-check") {
      findings.push(...runRoadmapSyncCheck(rootDir));
      checksRun++;
    }
    if (check.type === "specs-directory-structure-check") {
      findings.push(...runSpecsDirectoryStructureCheck(rootDir));
      checksRun++;
    }
  }
  if (findings.length === 0) {
    return { valid: true, checksRun, findingsCount: 0, generatedChange: null };
  }
  const date = new Date().toISOString().slice(0, 10);
  const changeName = generateChangeName(rootDir, date);
  initializeStrictChangeScaffold(rootDir, changeName);
  const changeDir2 = path19.join(getChangesDir2(rootDir), changeName);
  writeFileSync6(path19.join(changeDir2, "proposal.yaml"), stringifyYamlDocument(buildProposalYaml(changeName, findings)), "utf8");
  writeFileSync6(path19.join(changeDir2, "tasks.yaml"), stringifyYamlDocument(buildTasksYaml(changeName, findings)), "utf8");
  return { valid: true, checksRun, findingsCount: findings.length, generatedChange: changeName };
}

// src/migrate.ts
import {
  existsSync as existsSync24,
  readdirSync as readdirSync10,
  statSync as statSync17,
  writeFileSync as writeFileSync8
} from "fs";
import path25 from "path";

// src/migrate/converters/changes.ts
import {
  existsSync as existsSync20,
  readFileSync as readFileSync15,
  statSync as statSync13
} from "fs";
import path21 from "path";

// src/migrate/parsers/shared.ts
function isRecord4(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function asObject3(value, description) {
  if (!isRecord4(value)) {
    throw new Error(`${description} must be a YAML mapping`);
  }
  return value;
}
function normalizeWhitespace(value) {
  return value.trim().replace(/\s+/g, " ");
}
function toKebabCase(value) {
  const collapsed = value.toLowerCase().replace(/[`*_]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return collapsed.length > 0 ? collapsed : "item";
}
function makeUniqueId(baseId, usedIds) {
  let candidate = baseId;
  let sequence = 2;
  while (usedIds.has(candidate)) {
    candidate = `${baseId}-${sequence}`;
    sequence += 1;
  }
  usedIds.add(candidate);
  return candidate;
}
function normalizeMappingPathList(value, description) {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`${description} must be a YAML sequence of strings`);
  }
  return value.map((entry) => normalizeWhitespace(entry));
}
function extractMarkdownFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, `
`);
  if (!normalized.startsWith(`---
`)) {
    return { frontmatter: null, body: normalized };
  }
  const endIndex = normalized.indexOf(`
---
`, 4);
  if (endIndex === -1) {
    throw new Error("frontmatter is missing a closing '---' line");
  }
  const frontmatter = parseYamlDocument(normalized.slice(4, endIndex));
  if (!isRecord4(frontmatter)) {
    throw new Error("frontmatter must decode to a YAML mapping");
  }
  return {
    frontmatter,
    body: normalized.slice(endIndex + `
---
`.length)
  };
}
function getLegacySpecMapping(frontmatter) {
  if (!frontmatter) {
    return {
      implementation: [],
      tests: []
    };
  }
  const rawMapping = frontmatter.mapping;
  if (rawMapping === undefined) {
    return {
      implementation: [],
      tests: []
    };
  }
  const mapping = asObject3(rawMapping, "legacy markdown frontmatter field 'mapping'");
  return {
    implementation: normalizeMappingPathList(mapping.implementation, "legacy mapping.implementation"),
    tests: normalizeMappingPathList(mapping.tests, "legacy mapping.tests")
  };
}
function parseRequirementStrength(statement, context) {
  const match = statement.match(/\b(MUST|SHOULD|MAY)\b/);
  if (!match) {
    throw new Error(`${context} is missing an RFC 2119 keyword (MUST/SHOULD/MAY)`);
  }
  return match[1];
}
function extractMarkdownSections(content) {
  const sections = new Map;
  let currentHeading = null;
  let currentLines = [];
  for (const line of content.replace(/\r\n/g, `
`).split(`
`)) {
    const headingMatch = line.match(/^## (.+)$/);
    if (headingMatch) {
      if (currentHeading) {
        sections.set(currentHeading, currentLines.join(`
`));
      }
      currentHeading = headingMatch[1].trim();
      currentLines = [];
      continue;
    }
    if (currentHeading) {
      currentLines.push(line);
    }
  }
  if (currentHeading) {
    sections.set(currentHeading, currentLines.join(`
`));
  }
  return sections;
}
function extractMarkdownHeading(content) {
  for (const line of content.replace(/\r\n/g, `
`).split(`
`)) {
    const headingMatch = line.match(/^# (.+)$/);
    if (headingMatch) {
      return normalizeWhitespace(headingMatch[1]);
    }
  }
  return null;
}
function splitFirstSentence(text) {
  const normalized = normalizeWhitespace(text);
  const sentenceBreaks = [". ", " — ", ": "];
  for (const marker of sentenceBreaks) {
    const index = normalized.indexOf(marker);
    if (index !== -1) {
      return {
        first: normalized.slice(0, index + (marker === ". " ? 1 : 0)).trim(),
        rest: normalized.slice(index + marker.length).trim()
      };
    }
  }
  return {
    first: normalized,
    rest: ""
  };
}
function parseMarkdownItems(sectionText, mode = "list") {
  const items = [];
  let current = "";
  let currentKind = null;
  function flushCurrent() {
    const normalized = normalizeWhitespace(current);
    if (normalized.length > 0) {
      items.push(normalized);
    }
    current = "";
    currentKind = null;
  }
  for (const rawLine of sectionText.split(`
`)) {
    const trimmed = rawLine.trim();
    if (trimmed.length === 0 || trimmed.startsWith("<!--")) {
      continue;
    }
    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (mode === "approach" && orderedMatch) {
      flushCurrent();
      current = orderedMatch[1];
      currentKind = "ordered";
      continue;
    }
    const bulletMatch = trimmed.match(/^- (.+)$/);
    if (bulletMatch) {
      if (mode === "approach" && currentKind === "ordered") {
        current = `${current} ${bulletMatch[1]}`.trim();
        continue;
      }
      flushCurrent();
      current = bulletMatch[1];
      currentKind = "bullet";
      continue;
    }
    if (!current) {
      current = trimmed;
      currentKind = "paragraph";
      continue;
    }
    current = `${current} ${trimmed}`.trim();
  }
  flushCurrent();
  return items;
}
function parseScopeItems(sectionText) {
  const inScope = [];
  const outOfScope = [];
  let currentTarget = null;
  let currentItem = "";
  function flushCurrent() {
    const normalized = normalizeWhitespace(currentItem);
    if (normalized.length === 0 || !currentTarget) {
      currentItem = "";
      return;
    }
    if (currentTarget === "in") {
      inScope.push(normalized);
    } else {
      outOfScope.push(normalized);
    }
    currentItem = "";
  }
  for (const rawLine of sectionText.split(`
`)) {
    const trimmed = rawLine.trim();
    if (trimmed.length === 0 || trimmed.startsWith("<!--")) {
      continue;
    }
    if (trimmed === "In scope:") {
      flushCurrent();
      currentTarget = "in";
      continue;
    }
    if (trimmed === "Out of scope:") {
      flushCurrent();
      currentTarget = "out";
      continue;
    }
    if (!currentTarget) {
      continue;
    }
    if (trimmed.startsWith("- ")) {
      flushCurrent();
      currentItem = trimmed.slice(2);
      continue;
    }
    currentItem = `${currentItem} ${trimmed}`.trim();
  }
  flushCurrent();
  return { inScope, outOfScope };
}
function extractBacktickCommand(text) {
  const match = text.match(/`([^`]+)`/);
  return match ? match[1].trim() : undefined;
}

// src/migrate/parsers/change-artifacts.ts
var CHANGE_PROPOSAL_SCHEMA_FILE = "templates/strict-spec-driven/schemas/change-proposal.yaml";
var CHANGE_DESIGN_SCHEMA_FILE = "templates/strict-spec-driven/schemas/change-design.yaml";
var TASK_LIST_SCHEMA_FILE = "templates/strict-spec-driven/schemas/task-list.yaml";
var QUESTION_LIST_SCHEMA_FILE = "templates/strict-spec-driven/schemas/question-list.yaml";
var MAX_DECISION_ID_LENGTH = 60;
function truncateId(id, maxLen) {
  if (id.length <= maxLen)
    return id;
  const words = id.split("-");
  let result = words[0];
  for (let i2 = 1;i2 < words.length; i2++) {
    const candidate = `${result}-${words[i2]}`;
    if (candidate.length <= maxLen) {
      result = candidate;
    } else {
      break;
    }
  }
  return result.length > 0 ? result : id.slice(0, maxLen).replace(/-+$/, "");
}
function parseLegacyProposal(sourcePath, content, fallbackChangeId, archived) {
  const body = content.replace(/\r\n/g, `
`);
  const sections = extractMarkdownSections(body);
  const what = parseMarkdownItems(sections.get("What") ?? "");
  const why = parseMarkdownItems(sections.get("Why") ?? "");
  const scope = parseScopeItems(sections.get("Scope") ?? "");
  const unchangedBehavior = parseMarkdownItems(sections.get("Unchanged Behavior") ?? "").filter((item) => item !== "Behaviors that must not change as a result of this change (leave blank if nothing is at risk):");
  const heading = extractMarkdownHeading(body);
  const changeId = heading ? toKebabCase(heading) : fallbackChangeId;
  if (what.length === 0) {
    throw new Error(`proposal '${sourcePath}' is missing ## What content`);
  }
  if (why.length === 0) {
    throw new Error(`proposal '${sourcePath}' is missing ## Why content`);
  }
  return {
    schema: "strict-spec-driven/change-proposal/v1",
    schema_version: 1,
    artifact_type: "change_proposal",
    schema_file: CHANGE_PROPOSAL_SCHEMA_FILE,
    change: {
      id: changeId,
      status: archived ? "complete" : "active"
    },
    summary: {
      what,
      why
    },
    scope: {
      in: scope.inScope,
      out: scope.outOfScope
    },
    unchanged_behavior: unchangedBehavior
  };
}
function parseLegacyDesign(sourcePath, content, changeId) {
  const sections = extractMarkdownSections(content.replace(/\r\n/g, `
`));
  const approach = parseMarkdownItems(sections.get("Approach") ?? "", "approach");
  const decisionItems = parseMarkdownItems(sections.get("Key Decisions") ?? "");
  const alternativeItems = parseMarkdownItems(sections.get("Alternatives Considered") ?? "");
  const riskItems = parseMarkdownItems(sections.get("Risks") ?? "");
  if (approach.length === 0) {
    throw new Error(`design '${sourcePath}' is missing ## Approach content`);
  }
  const usedDecisionIds = new Set;
  const decisions = {};
  for (const item of decisionItems) {
    const boldMatch = item.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
    const decisionText = boldMatch ? boldMatch[2] : item;
    const { first, rest } = splitFirstSentence(decisionText);
    const idSource = boldMatch ? boldMatch[1] : first;
    const rawId = toKebabCase(idSource);
    const truncatedId = rawId.length > MAX_DECISION_ID_LENGTH ? truncateId(rawId, MAX_DECISION_ID_LENGTH) : rawId;
    const id = makeUniqueId(truncatedId, usedDecisionIds);
    decisions[id] = {
      decision: first,
      rationale: rest.length > 0 ? rest : normalizeWhitespace(decisionText)
    };
  }
  const alternatives = alternativeItems.map((item) => {
    const boldMatch = item.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
    const optionText = boldMatch ? boldMatch[1] : splitFirstSentence(item).first;
    const reasonText = boldMatch ? boldMatch[2] : splitFirstSentence(item).rest || item;
    return {
      option: normalizeWhitespace(optionText),
      reason: normalizeWhitespace(reasonText)
    };
  });
  return {
    schema: "strict-spec-driven/change-design/v1",
    schema_version: 1,
    artifact_type: "change_design",
    schema_file: CHANGE_DESIGN_SCHEMA_FILE,
    change: changeId,
    approach,
    decisions,
    alternatives,
    risks: riskItems.length > 0 ? riskItems : undefined
  };
}
function parseLegacyTasks(sourcePath, content, changeId) {
  const sections = extractMarkdownSections(content.replace(/\r\n/g, `
`));
  function parseTaskSection(sectionName) {
    const sectionText = sections.get(sectionName) ?? "";
    const tasks = [];
    let currentText = "";
    let currentStatus = null;
    let index = 0;
    function flushCurrent() {
      if (!currentStatus) {
        return;
      }
      const text = normalizeWhitespace(currentText);
      if (text.length === 0) {
        throw new Error(`${sectionName} task in '${sourcePath}' is missing text`);
      }
      index += 1;
      const task = {
        id: `${toKebabCase(sectionName)}-${index}`,
        text,
        status: currentStatus
      };
      if (sectionName === "Testing") {
        const command = extractBacktickCommand(text);
        if (!command) {
          throw new Error(`Testing task '${text}' in '${sourcePath}' is missing a backticked command`);
        }
        task.command = command;
      }
      tasks.push(task);
      currentText = "";
      currentStatus = null;
    }
    for (const rawLine of sectionText.split(`
`)) {
      const trimmed = rawLine.trim();
      if (trimmed.length === 0 || trimmed.startsWith("<!--")) {
        continue;
      }
      const taskMatch = trimmed.match(/^- \[(x| )\]\s+(.+)$/i);
      if (taskMatch) {
        flushCurrent();
        currentStatus = taskMatch[1].toLowerCase() === "x" ? "complete" : "pending";
        currentText = taskMatch[2];
        continue;
      }
      if (!currentStatus) {
        continue;
      }
      currentText = `${currentText} ${trimmed}`.trim();
    }
    flushCurrent();
    if (tasks.length === 0) {
      throw new Error(`tasks '${sourcePath}' is missing the required ${sectionName} tasks`);
    }
    return tasks;
  }
  const implementationTasks = parseTaskSection("Implementation");
  const testingTasks = parseTaskSection("Testing");
  const verificationTasks = parseTaskSection("Verification");
  if (testingTasks.length < 2) {
    throw new Error(`tasks '${sourcePath}' must contain at least two Testing tasks for validation and unit test gates`);
  }
  function toTaskMap(tasks) {
    const map2 = {};
    for (const t of tasks) {
      const { id, ...rest } = t;
      map2[id] = rest;
    }
    return map2;
  }
  return {
    schema: "strict-spec-driven/task-list/v2",
    schema_version: 2,
    artifact_type: "task_list",
    schema_file: TASK_LIST_SCHEMA_FILE,
    change: changeId,
    sections: {
      Implementation: toTaskMap(implementationTasks),
      Testing: toTaskMap(testingTasks),
      Verification: toTaskMap(verificationTasks)
    },
    testing_gates: {
      validation_task: testingTasks[0].id,
      unit_test_task: testingTasks[1].id
    }
  };
}
function parseLegacyQuestions(sourcePath, content, changeId) {
  const sections = extractMarkdownSections(content.replace(/\r\n/g, `
`));
  const usedIds = new Set;
  function parseQuestionSection(sectionName) {
    const results = [];
    let currentQuestion = "";
    let contextLines = [];
    let answerLines = [];
    let currentField = null;
    function flushCurrent() {
      const question = normalizeWhitespace(currentQuestion);
      if (question.length === 0) {
        currentQuestion = "";
        contextLines = [];
        answerLines = [];
        currentField = null;
        return;
      }
      const context = normalizeWhitespace(contextLines.join(" "));
      if (context.length === 0) {
        throw new Error(`question '${question}' in '${sourcePath}' is missing Context`);
      }
      const record = {
        id: makeUniqueId(toKebabCase(question), usedIds),
        question,
        context,
        status: sectionName === "Open" ? "open" : "resolved"
      };
      if (sectionName === "Resolved") {
        const answer = normalizeWhitespace(answerLines.join(" "));
        if (answer.length === 0) {
          throw new Error(`resolved question '${question}' in '${sourcePath}' is missing an answer`);
        }
        results.push({
          ...record,
          answer
        });
      } else {
        results.push(record);
      }
      currentQuestion = "";
      contextLines = [];
      answerLines = [];
      currentField = null;
    }
    const sectionText = sections.get(sectionName) ?? "";
    for (const rawLine of sectionText.split(`
`)) {
      const trimmed = rawLine.trim();
      if (trimmed.length === 0 || trimmed.startsWith("<!--")) {
        continue;
      }
      const questionMatch = trimmed.match(/^- \[(x| )\]\s+Q:\s+(.+)$/i);
      if (questionMatch) {
        flushCurrent();
        currentQuestion = questionMatch[2];
        currentField = "question";
        continue;
      }
      const contextMatch = trimmed.match(/^Context:\s+(.+)$/);
      if (contextMatch) {
        contextLines.push(contextMatch[1]);
        currentField = "context";
        continue;
      }
      const answerMatch = trimmed.match(/^A:\s+(.+)$/);
      if (answerMatch) {
        answerLines.push(answerMatch[1]);
        currentField = "answer";
        continue;
      }
      if (currentField === "context") {
        contextLines.push(trimmed);
      } else if (currentField === "answer") {
        answerLines.push(trimmed);
      } else if (currentField === "question") {
        currentQuestion = `${currentQuestion} ${trimmed}`.trim();
      }
    }
    flushCurrent();
    return results;
  }
  const openQuestions = parseQuestionSection("Open");
  const resolvedQuestions = parseQuestionSection("Resolved");
  return {
    schema: "strict-spec-driven/question-list/v1",
    schema_version: 1,
    artifact_type: "question_list",
    schema_file: QUESTION_LIST_SCHEMA_FILE,
    change: changeId,
    open: openQuestions.map((entry) => ({
      id: entry.id,
      question: entry.question,
      context: entry.context,
      status: "open"
    })),
    resolved: resolvedQuestions.map((entry) => ({
      id: entry.id,
      question: entry.question,
      context: entry.context,
      answer: entry.answer ?? "",
      status: "resolved"
    }))
  };
}

// src/migrate/parsers/specs.ts
var MAIN_SPEC_SCHEMA_FILE = "templates/strict-spec-driven/schemas/main-spec.yaml";
var DELTA_SPEC_SCHEMA_FILE = "templates/strict-spec-driven/schemas/delta-spec.yaml";
function buildSpecIdFromRelativePath(relativeSpecPath) {
  return toKebabCase(relativeSpecPath.replace(/\.md$/i, "").replace(/\//g, "-"));
}
function buildStep(kind, text) {
  return { [kind]: text };
}
function parseLegacyMainSpec(sourcePath, content) {
  const { frontmatter, body } = extractMarkdownFrontmatter(content);
  const mapping = getLegacySpecMapping(frontmatter);
  const title = extractMarkdownHeading(body);
  if (!title) {
    throw new Error(`main spec '${sourcePath}' is missing a top-level '# <title>' heading`);
  }
  const requirements = {};
  const requirementIds = new Set;
  let currentRequirementId = null;
  let currentStatementLines = [];
  let currentScenarios = {};
  let currentScenarioTitle = null;
  let currentScenarioSteps = [];
  let currentScenarioIds = new Set;
  function flushScenario() {
    if (!currentScenarioTitle) {
      return;
    }
    if (currentScenarioSteps.length === 0) {
      throw new Error(`scenario '${currentScenarioTitle}' in '${sourcePath}' is missing steps`);
    }
    const id = makeUniqueId(toKebabCase(currentScenarioTitle), currentScenarioIds);
    currentScenarios[id] = currentScenarioSteps;
    currentScenarioTitle = null;
    currentScenarioSteps = [];
  }
  function flushRequirement() {
    if (!currentRequirementId) {
      return;
    }
    flushScenario();
    const statement = normalizeWhitespace(currentStatementLines.join(" "));
    if (statement.length === 0) {
      throw new Error(`requirement '${currentRequirementId}' in '${sourcePath}' is missing a statement`);
    }
    const id = makeUniqueId(currentRequirementId, requirementIds);
    requirements[id] = {
      strength: parseRequirementStrength(statement, `requirement '${currentRequirementId}' in '${sourcePath}'`),
      statement,
      scenarios: currentScenarios
    };
    currentRequirementId = null;
    currentStatementLines = [];
    currentScenarios = {};
    currentScenarioIds = new Set;
  }
  for (const rawLine of body.split(`
`)) {
    const trimmed = rawLine.trim();
    if (trimmed.length === 0) {
      continue;
    }
    const requirementMatch = trimmed.match(/^### Requirement:\s+(.+)$/);
    if (requirementMatch) {
      flushRequirement();
      currentRequirementId = normalizeWhitespace(requirementMatch[1]);
      continue;
    }
    const scenarioMatch = trimmed.match(/^#### Scenario:\s+(.+)$/);
    if (scenarioMatch) {
      if (!currentRequirementId) {
        throw new Error(`scenario '${scenarioMatch[1]}' in '${sourcePath}' appears before any requirement`);
      }
      flushScenario();
      currentScenarioTitle = normalizeWhitespace(scenarioMatch[1]);
      continue;
    }
    const stepMatch = trimmed.match(/^- (GIVEN|WHEN|THEN|AND)\s+(.+)$/);
    if (stepMatch) {
      if (!currentScenarioTitle) {
        throw new Error(`step '${trimmed}' in '${sourcePath}' appears outside a scenario`);
      }
      currentScenarioSteps.push(buildStep(stepMatch[1], normalizeWhitespace(stepMatch[2])));
      continue;
    }
    if (trimmed.startsWith("# ")) {
      continue;
    }
    if (currentScenarioTitle && currentScenarioSteps.length > 0) {
      const lastStep = currentScenarioSteps[currentScenarioSteps.length - 1];
      const kind = Object.keys(lastStep)[0];
      lastStep[kind] = normalizeWhitespace(`${lastStep[kind]} ${trimmed}`);
      continue;
    }
    if (!currentRequirementId) {
      continue;
    }
    currentStatementLines.push(trimmed);
  }
  flushRequirement();
  if (Object.keys(requirements).length === 0) {
    throw new Error(`main spec '${sourcePath}' does not contain any requirements`);
  }
  const relativeSpecPath = sourcePath.replace(".spec-driven/specs/", "");
  return {
    schema: "strict-spec-driven/main-spec/v1",
    schema_version: 1,
    artifact_type: "main_spec",
    schema_file: MAIN_SPEC_SCHEMA_FILE,
    spec: {
      id: buildSpecIdFromRelativePath(relativeSpecPath),
      title
    },
    mapping,
    requirements
  };
}
function parseLegacyDeltaSpec(sourcePath, content) {
  const { frontmatter, body } = extractMarkdownFrontmatter(content);
  const mapping = getLegacySpecMapping(frontmatter);
  const relativePathMatch = sourcePath.match(/^\.spec-driven\/changes\/(?:archive\/[^/]+\/|[^/]+\/)specs\/(.+)\.md$/);
  if (!relativePathMatch) {
    throw new Error(`delta spec '${sourcePath}' is not under a recognized change specs directory`);
  }
  const operations = {
    ADDED: {},
    MODIFIED: {},
    REMOVED: {}
  };
  let currentOperation = null;
  let currentRequirementId = null;
  let currentScenarioTitle = null;
  let currentScenarioSteps = [];
  let currentScenarioIds = new Set;
  let currentStatementLines = [];
  let currentPreviousLines = [];
  let currentReasonLines = [];
  let currentScenarios = {};
  function flushScenario() {
    if (!currentScenarioTitle || currentScenarioSteps.length === 0) {
      return;
    }
    const id = makeUniqueId(toKebabCase(currentScenarioTitle), currentScenarioIds);
    currentScenarios[id] = currentScenarioSteps;
    currentScenarioTitle = null;
    currentScenarioSteps = [];
  }
  function flushRequirement() {
    if (!currentRequirementId || !currentOperation) {
      return;
    }
    flushScenario();
    if (currentOperation === "ADDED") {
      const statement = normalizeWhitespace(currentStatementLines.join(" "));
      if (statement.length === 0) {
        throw new Error(`ADDED requirement '${currentRequirementId}' in '${sourcePath}' is missing a statement`);
      }
      operations.ADDED[currentRequirementId] = {
        strength: parseRequirementStrength(statement, `ADDED requirement '${currentRequirementId}' in '${sourcePath}'`),
        statement,
        scenarios: currentScenarios
      };
    } else if (currentOperation === "MODIFIED") {
      const statement = normalizeWhitespace(currentStatementLines.join(" "));
      if (statement.length === 0) {
        throw new Error(`MODIFIED requirement '${currentRequirementId}' in '${sourcePath}' is missing a replacement statement`);
      }
      operations.MODIFIED[currentRequirementId] = {
        strength: parseRequirementStrength(statement, `MODIFIED requirement '${currentRequirementId}' in '${sourcePath}'`),
        statement,
        scenarios: currentScenarios
      };
    } else {
      const reason = normalizeWhitespace(currentReasonLines.join(" "));
      if (reason.length === 0) {
        throw new Error(`REMOVED requirement '${currentRequirementId}' in '${sourcePath}' is missing a reason`);
      }
      operations.REMOVED[currentRequirementId] = { reason };
    }
    currentRequirementId = null;
    currentScenarioTitle = null;
    currentScenarioSteps = [];
    currentScenarioIds = new Set;
    currentStatementLines = [];
    currentPreviousLines = [];
    currentReasonLines = [];
    currentScenarios = {};
  }
  for (const rawLine of body.split(`
`)) {
    const trimmed = rawLine.trim();
    if (trimmed.length === 0) {
      continue;
    }
    const operationMatch = trimmed.match(/^## (ADDED|MODIFIED|REMOVED) Requirements$/);
    if (operationMatch) {
      flushRequirement();
      currentOperation = operationMatch[1];
      continue;
    }
    const requirementMatch = trimmed.match(/^### Requirement:\s+(.+)$/);
    if (requirementMatch) {
      if (!currentOperation) {
        throw new Error(`requirement '${requirementMatch[1]}' in '${sourcePath}' appears before any delta operation section`);
      }
      flushRequirement();
      currentRequirementId = normalizeWhitespace(requirementMatch[1]);
      continue;
    }
    const scenarioMatch = trimmed.match(/^#### Scenario:\s+(.+)$/);
    if (scenarioMatch) {
      if (!currentRequirementId || currentOperation === "REMOVED") {
        throw new Error(`scenario '${scenarioMatch[1]}' in '${sourcePath}' is not valid in the current delta section`);
      }
      flushScenario();
      currentScenarioTitle = normalizeWhitespace(scenarioMatch[1]);
      continue;
    }
    const stepMatch = trimmed.match(/^- (GIVEN|WHEN|THEN|AND)\s+(.+)$/);
    if (stepMatch) {
      if (!currentScenarioTitle) {
        throw new Error(`step '${trimmed}' in '${sourcePath}' appears outside a scenario`);
      }
      currentScenarioSteps.push(buildStep(stepMatch[1], normalizeWhitespace(stepMatch[2])));
      continue;
    }
    if (!currentRequirementId || !currentOperation) {
      continue;
    }
    if (currentScenarioTitle && currentScenarioSteps.length > 0) {
      const lastStep = currentScenarioSteps[currentScenarioSteps.length - 1];
      const kind = Object.keys(lastStep)[0];
      lastStep[kind] = normalizeWhitespace(`${lastStep[kind]} ${trimmed}`);
      continue;
    }
    if (currentOperation === "REMOVED") {
      const reasonMatch = trimmed.match(/^Reason:\s*(.+)$/);
      if (reasonMatch) {
        currentReasonLines.push(reasonMatch[1]);
      } else if (currentReasonLines.length > 0) {
        currentReasonLines.push(trimmed);
      } else {
        throw new Error(`REMOVED requirement '${currentRequirementId}' in '${sourcePath}' is missing a 'Reason:' line`);
      }
      continue;
    }
    if (currentOperation === "MODIFIED" && trimmed.startsWith("Previously:")) {
      currentPreviousLines.push(trimmed.slice("Previously:".length).trim());
      continue;
    }
    if (currentOperation === "MODIFIED" && currentStatementLines.length === 0 && currentPreviousLines.length > 0) {
      if (/^The system (MUST|SHOULD|MAY)\b/.test(trimmed)) {
        currentStatementLines.push(trimmed);
      } else {
        currentPreviousLines.push(trimmed);
      }
      continue;
    }
    currentStatementLines.push(trimmed);
  }
  flushRequirement();
  return {
    schema: "strict-spec-driven/delta-spec/v1",
    schema_version: 1,
    artifact_type: "delta_spec",
    schema_file: DELTA_SPEC_SCHEMA_FILE,
    target_spec: buildSpecIdFromRelativePath(relativePathMatch[1]),
    mapping,
    operations
  };
}

// src/migrate/shared.ts
import {
  existsSync as existsSync19,
  mkdirSync as mkdirSync5,
  readdirSync as readdirSync9,
  readFileSync as readFileSync14,
  statSync as statSync12,
  writeFileSync as writeFileSync7
} from "fs";
import path20 from "path";
var LEGACY_WORKFLOW_DIR2 = ".spec-driven";
var STRICT_WORKFLOW_DIR10 = ".strict-spec-driven";
function toRepoRelativePath2(rootDir, absolutePath) {
  return toPosix(path20.relative(rootDir, absolutePath));
}
function listFilesRecursive2(directoryPath) {
  if (!existsSync19(directoryPath) || !statSync12(directoryPath).isDirectory()) {
    return [];
  }
  const files = [];
  function walk(currentPath) {
    const entries = readdirSync9(currentPath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const fullPath = path20.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }
  walk(directoryPath);
  return files;
}
function makeDiagnostic2(code, message, sourcePath, targetPath) {
  return { code, message, sourcePath, targetPath };
}
function readYamlFile3(filePath) {
  return parseYamlDocument(readFileSync14(filePath, "utf8"));
}
function writeYamlFile2(filePath, value) {
  mkdirSync5(path20.dirname(filePath), { recursive: true });
  writeFileSync7(filePath, stringifyYamlDocument(value), "utf8");
}
function replaceMarkdownExtension(repoRelativePath) {
  return repoRelativePath.replace(/\.md$/i, ".yaml");
}
function buildStrictMarkdownTargetPath(rootDir, repoRelativeTargetPath) {
  return path20.join(rootDir, ...repoRelativeTargetPath.split("/"));
}
function listLegacyChangeDirectories(rootDir) {
  const changesRoot = path20.join(rootDir, LEGACY_WORKFLOW_DIR2, "changes");
  if (!existsSync19(changesRoot) || !statSync12(changesRoot).isDirectory()) {
    return [];
  }
  const directories = [];
  const changeEntries = readdirSync9(changesRoot, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of changeEntries) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name === "archive") {
      const archiveRoot = path20.join(changesRoot, "archive");
      if (!existsSync19(archiveRoot) || !statSync12(archiveRoot).isDirectory()) {
        continue;
      }
      const archiveEntries = readdirSync9(archiveRoot, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
      for (const archiveEntry of archiveEntries) {
        if (!archiveEntry.isDirectory()) {
          continue;
        }
        directories.push({
          legacyDirectoryPath: path20.join(archiveRoot, archiveEntry.name),
          repoRelativeDirectory: `${LEGACY_WORKFLOW_DIR2}/changes/archive/${archiveEntry.name}`,
          strictDirectoryPath: path20.join(rootDir, STRICT_WORKFLOW_DIR10, "changes", "archive", archiveEntry.name),
          directoryName: archiveEntry.name,
          archived: true
        });
      }
      continue;
    }
    directories.push({
      legacyDirectoryPath: path20.join(changesRoot, entry.name),
      repoRelativeDirectory: `${LEGACY_WORKFLOW_DIR2}/changes/${entry.name}`,
      strictDirectoryPath: path20.join(rootDir, STRICT_WORKFLOW_DIR10, "changes", entry.name),
      directoryName: entry.name,
      archived: false
    });
  }
  return directories;
}
function recordDeferredArtifact(result, sourcePath, reason, recommendation, kind = "legacy_markdown_artifact", code = "converter_unavailable") {
  result.skipped.push({
    kind,
    sourcePath,
    reason
  });
  result.warnings.push(makeDiagnostic2(code, reason, sourcePath));
  result.manualFollowUp.push({
    sourcePath,
    reason,
    recommendation
  });
}
function makeConversionFailure(sourcePath, error) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    kind: "legacy_markdown_artifact",
    reason: `Legacy core workflow artifact uses an unsupported or ambiguous Markdown shape: ${message}`,
    recommendation: "Review this legacy artifact and either normalize it to the canonical Markdown structure or extend the converter before treating the migration as complete."
  };
}

// src/migrate/converters/changes.ts
function convertLegacyChangeArtifacts(rootDir, result, handledLegacyFiles) {
  for (const changeDirectory of listLegacyChangeDirectories(rootDir)) {
    const fallbackChangeId = changeDirectory.archived ? toKebabCase(changeDirectory.directoryName.replace(/^\d{4}-\d{2}-\d{2}-/, "")) : toKebabCase(changeDirectory.directoryName);
    let changeId = fallbackChangeId;
    const legacyProposalPath = path21.join(changeDirectory.legacyDirectoryPath, "proposal.md");
    const repoRelativeProposalPath = `${changeDirectory.repoRelativeDirectory}/proposal.md`;
    if (existsSync20(legacyProposalPath) && statSync13(legacyProposalPath).isFile()) {
      handledLegacyFiles.add(repoRelativeProposalPath);
      try {
        const proposalArtifact = parseLegacyProposal(repoRelativeProposalPath, readFileSync15(legacyProposalPath, "utf8"), fallbackChangeId, changeDirectory.archived);
        changeId = proposalArtifact.change.id;
        const strictTargetPath = `${changeDirectory.strictDirectoryPath.replace(`${rootDir}/`, "")}/proposal.yaml`;
        writeYamlFile2(path21.join(changeDirectory.strictDirectoryPath, "proposal.yaml"), proposalArtifact);
        result.converted.push({
          kind: "change_proposal",
          sourcePath: repoRelativeProposalPath,
          targetPath: toPosix(strictTargetPath),
          note: "Migrated legacy Markdown proposal into a strict YAML change_proposal artifact."
        });
      } catch (error) {
        const deferredArtifact = makeConversionFailure(repoRelativeProposalPath, error);
        recordDeferredArtifact(result, repoRelativeProposalPath, deferredArtifact.reason, deferredArtifact.recommendation, deferredArtifact.kind, "conversion_ambiguous");
      }
    }
    const changeArtifactFiles = [
      {
        legacyName: "design.md",
        targetName: "design.yaml",
        kind: "change_design",
        convert: parseLegacyDesign,
        note: "Migrated legacy Markdown design into a strict YAML change_design artifact."
      },
      {
        legacyName: "tasks.md",
        targetName: "tasks.yaml",
        kind: "task_list",
        convert: parseLegacyTasks,
        note: "Migrated legacy Markdown tasks into a strict YAML task_list artifact."
      },
      {
        legacyName: "questions.md",
        targetName: "questions.yaml",
        kind: "question_list",
        convert: parseLegacyQuestions,
        note: "Migrated legacy Markdown questions into a strict YAML question_list artifact."
      }
    ];
    for (const artifactFile of changeArtifactFiles) {
      const legacyFilePath = path21.join(changeDirectory.legacyDirectoryPath, artifactFile.legacyName);
      const repoRelativeLegacyFilePath = `${changeDirectory.repoRelativeDirectory}/${artifactFile.legacyName}`;
      if (!existsSync20(legacyFilePath) || !statSync13(legacyFilePath).isFile()) {
        continue;
      }
      handledLegacyFiles.add(repoRelativeLegacyFilePath);
      try {
        const artifact = artifactFile.convert(repoRelativeLegacyFilePath, readFileSync15(legacyFilePath, "utf8"), changeId);
        const strictTargetPath = `${changeDirectory.strictDirectoryPath.replace(`${rootDir}/`, "")}/${artifactFile.targetName}`;
        writeYamlFile2(path21.join(changeDirectory.strictDirectoryPath, artifactFile.targetName), artifact);
        result.converted.push({
          kind: artifactFile.kind,
          sourcePath: repoRelativeLegacyFilePath,
          targetPath: toPosix(strictTargetPath),
          note: artifactFile.note
        });
      } catch (error) {
        const deferredArtifact = makeConversionFailure(repoRelativeLegacyFilePath, error);
        recordDeferredArtifact(result, repoRelativeLegacyFilePath, deferredArtifact.reason, deferredArtifact.recommendation, deferredArtifact.kind, "conversion_ambiguous");
      }
    }
    const legacyDeltaSpecsRoot = path21.join(changeDirectory.legacyDirectoryPath, "specs");
    if (existsSync20(legacyDeltaSpecsRoot) && statSync13(legacyDeltaSpecsRoot).isDirectory()) {
      const deltaSpecFiles = listFilesRecursive2(legacyDeltaSpecsRoot).map((absolutePath) => toRepoRelativePath2(rootDir, absolutePath)).filter((repoRelativePath) => path21.basename(repoRelativePath) !== "README.md").filter((repoRelativePath) => repoRelativePath.endsWith(".md")).sort((left, right) => left.localeCompare(right));
      for (const legacyDeltaSpecPath of deltaSpecFiles) {
        handledLegacyFiles.add(legacyDeltaSpecPath);
        try {
          const deltaArtifact = parseLegacyDeltaSpec(legacyDeltaSpecPath, readFileSync15(path21.join(rootDir, legacyDeltaSpecPath), "utf8"));
          const strictTargetPath = replaceMarkdownExtension(legacyDeltaSpecPath.replace(`${LEGACY_WORKFLOW_DIR2}/changes/`, `${STRICT_WORKFLOW_DIR10}/changes/`).replace("/specs/", "/specs/"));
          writeYamlFile2(buildStrictMarkdownTargetPath(rootDir, strictTargetPath), deltaArtifact);
          result.converted.push({
            kind: "delta_spec",
            sourcePath: legacyDeltaSpecPath,
            targetPath: strictTargetPath,
            note: "Migrated legacy Markdown delta spec into a strict YAML delta_spec artifact."
          });
        } catch (error) {
          const deferredArtifact = makeConversionFailure(legacyDeltaSpecPath, error);
          recordDeferredArtifact(result, legacyDeltaSpecPath, deferredArtifact.reason, deferredArtifact.recommendation, deferredArtifact.kind, "conversion_ambiguous");
        }
      }
    }
  }
}

// src/migrate/converters/roadmap.ts
import {
  existsSync as existsSync21,
  readFileSync as readFileSync16,
  statSync as statSync14
} from "fs";
import path22 from "path";

// src/converters/roadmap.ts
var ROADMAP_INDEX_SCHEMA_FILE = "templates/strict-spec-driven/schemas/roadmap-index.yaml";
var ROADMAP_MILESTONE_SCHEMA_FILE = "templates/strict-spec-driven/schemas/roadmap-milestone.yaml";
var SPEC_INDEX_SCHEMA_FILE = "templates/strict-spec-driven/schemas/spec-index.yaml";
var STRICT_WORKFLOW_DIR11 = ".strict-spec-driven";
var DECLARED_ROADMAP_STATUSES2 = ["proposed", "active", "blocked", "complete"];
function normalizeWhitespace2(value) {
  return value.trim().replace(/\s+/g, " ");
}
function toKebabCase2(value) {
  const collapsed = value.toLowerCase().replace(/[`*_]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return collapsed.length > 0 ? collapsed : "item";
}
function extractMarkdownHeading2(content) {
  for (const line of content.replace(/\r\n/g, `
`).split(`
`)) {
    const match = line.match(/^# (.+)$/);
    if (match) {
      return normalizeWhitespace2(match[1]);
    }
  }
  return null;
}
function extractMarkdownSections2(content) {
  const sections = new Map;
  let currentHeading = null;
  let currentLines = [];
  for (const line of content.replace(/\r\n/g, `
`).split(`
`)) {
    const headingMatch = line.match(/^## (.+)$/);
    if (headingMatch) {
      if (currentHeading) {
        sections.set(currentHeading, currentLines.join(`
`));
      }
      currentHeading = headingMatch[1].trim();
      currentLines = [];
      continue;
    }
    if (currentHeading) {
      currentLines.push(line);
    }
  }
  if (currentHeading) {
    sections.set(currentHeading, currentLines.join(`
`));
  }
  return sections;
}
function parseMarkdownBulletList(sectionText) {
  const items = [];
  let current = "";
  for (const rawLine of sectionText.split(`
`)) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("<!--")) {
      continue;
    }
    const bulletMatch = trimmed.match(/^- (.+)$/);
    if (bulletMatch) {
      if (current) {
        items.push(normalizeWhitespace2(current));
      }
      current = bulletMatch[1];
      continue;
    }
    if (current) {
      current = `${current} ${trimmed}`.trim();
    }
  }
  if (current) {
    items.push(normalizeWhitespace2(current));
  }
  return items;
}
function parseSectionText(sectionText) {
  return normalizeWhitespace2(sectionText.split(`
`).map((line) => line.trim()).filter((line) => line && !line.startsWith("<!--")).join(" "));
}
function normalizeDeclaredRoadmapStatus(raw) {
  const normalized = raw.trim().toLowerCase();
  if (DECLARED_ROADMAP_STATUSES2.includes(normalized)) {
    return normalized;
  }
  return "proposed";
}
function parsePlannedChangeEntries(sectionText) {
  const entries = {};
  for (const rawLine of sectionText.split(`
`)) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("<!--")) {
      continue;
    }
    const match = trimmed.match(/^- `([^`]+)` - Declared: (\w+) - (.+)$/);
    if (!match) {
      continue;
    }
    const [, id, rawStatus, summary] = match;
    const declaredStatus = rawStatus === "complete" ? "complete" : "planned";
    entries[id.trim()] = {
      status: declaredStatus,
      summary: normalizeWhitespace2(summary),
      details: "Migration placeholder: add technical and design context for this planned change.",
      depends_on: []
    };
  }
  return entries;
}
function parseDeclaredStatusFromSection(sectionText) {
  for (const rawLine of sectionText.split(`
`)) {
    const trimmed = rawLine.trim();
    const match = trimmed.match(/^- Declared:\s*(.+)$/);
    if (match) {
      return normalizeDeclaredRoadmapStatus(match[1]);
    }
  }
  return null;
}
function toFourDigitId(id) {
  const match = id.match(/^(\d+)-/);
  if (!match)
    return id;
  const digits = match[1].padStart(4, "0");
  return `${digits}${id.slice(match[1].length)}`;
}
function convertRoadmapIndex(markdown) {
  try {
    const sections = extractMarkdownSections2(markdown);
    const milestonesText = sections.get("Milestones") ?? "";
    const milestones = {};
    for (const rawLine of milestonesText.split(`
`)) {
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed.startsWith("<!--")) {
        continue;
      }
      const match = trimmed.match(/^- \[([^\]]+)\]\(([^)]+)\) - (.+) - (\w+)$/);
      if (!match) {
        continue;
      }
      const [, linkText, href, title, rawStatus] = match;
      const rawId = linkText.trim().replace(/\.md$/i, "");
      const id = toFourDigitId(rawId);
      const strictPath = `roadmap/${href.trim().replace(/\.md$/i, ".yaml")}`.replace(/milestones\/\d+-/, (match2) => match2.replace(/\d+/, (digits) => digits.padStart(4, "0")));
      const status = normalizeDeclaredRoadmapStatus(rawStatus);
      milestones[id] = {
        title: normalizeWhitespace2(title),
        path: strictPath,
        status
      };
    }
    return {
      ok: true,
      artifact: {
        schema: "strict-spec-driven/roadmap-index/v2",
        schema_version: 2,
        artifact_type: "roadmap_index",
        schema_file: ROADMAP_INDEX_SCHEMA_FILE,
        milestones
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      reason: `Legacy roadmap index uses an unsupported Markdown shape: ${message}`,
      recommendation: "Review the roadmap INDEX.md structure and ensure the ## Milestones section contains valid link-list entries before treating the migration as complete."
    };
  }
}
function convertRoadmapMilestone(markdown, filename) {
  try {
    const rawId = filename.replace(/\.md$/i, "");
    const id = toFourDigitId(rawId);
    const title = extractMarkdownHeading2(markdown);
    if (!title) {
      return {
        ok: false,
        reason: `Milestone '${filename}' is missing a top-level '# <title>' heading.`,
        recommendation: "Add a top-level heading to the milestone file and ensure all required sections are present before migrating."
      };
    }
    const sections = extractMarkdownSections2(markdown);
    const goalText = sections.get("Goal");
    if (!goalText) {
      return {
        ok: false,
        reason: `Milestone '${filename}' is missing a required '## Goal' section.`,
        recommendation: "Add a '## Goal' section describing the milestone objective and rerun migration."
      };
    }
    const goal = parseSectionText(goalText);
    if (!goal) {
      return {
        ok: false,
        reason: `Milestone '${filename}' has an empty '## Goal' section.`,
        recommendation: "Provide a goal description in the '## Goal' section and rerun migration."
      };
    }
    const statusText = sections.get("Status");
    if (!statusText) {
      return {
        ok: false,
        reason: `Milestone '${filename}' is missing a required '## Status' section.`,
        recommendation: "Add a '## Status' section with a '- Declared: <status>' line and rerun migration."
      };
    }
    const declaredStatus = parseDeclaredStatusFromSection(statusText);
    if (declaredStatus === null) {
      return {
        ok: false,
        reason: `Milestone '${filename}' has a '## Status' section with no recognizable '- Declared: <status>' line.`,
        recommendation: "Add a '- Declared: <proposed|active|blocked|complete>' line to the Status section and rerun migration."
      };
    }
    const scopeIn = parseMarkdownBulletList(sections.get("In Scope") ?? "");
    const scopeOut = parseMarkdownBulletList(sections.get("Out of Scope") ?? "");
    const doneCriteria = parseMarkdownBulletList(sections.get("Done Criteria") ?? "");
    const plannedChanges = parsePlannedChangeEntries(sections.get("Planned Changes") ?? "");
    const dependencies = parseMarkdownBulletList(sections.get("Dependencies") ?? "");
    const risks = parseMarkdownBulletList(sections.get("Risks") ?? "");
    const notes = parseMarkdownBulletList(sections.get("Notes") ?? "");
    const detailsText = parseSectionText(sections.get("Details") ?? "");
    const milestoneKeyed = {};
    milestoneKeyed[id] = { title };
    return {
      ok: true,
      artifact: {
        schema: "strict-spec-driven/roadmap-milestone/v2",
        schema_version: 2,
        artifact_type: "roadmap_milestone",
        schema_file: ROADMAP_MILESTONE_SCHEMA_FILE,
        milestone: milestoneKeyed,
        goal,
        scope: { in: scopeIn, out: scopeOut },
        done_criteria: doneCriteria,
        planned_changes: plannedChanges,
        dependencies,
        risks,
        status: declaredStatus,
        notes,
        ...detailsText ? { details: detailsText } : {}
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      reason: `Milestone '${filename}' uses an unsupported Markdown shape: ${message}`,
      recommendation: "Review the milestone file structure and ensure all required sections are present before treating the migration as complete."
    };
  }
}
function convertSpecsIndex(markdown) {
  try {
    const specs = [];
    for (const rawLine of markdown.replace(/\r\n/g, `
`).split(`
`)) {
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed.startsWith("<!--") || trimmed.startsWith("#")) {
        continue;
      }
      const match = trimmed.match(/^- \[([^\]]+)\]\(([^)]+)\) - (.+)$/);
      if (!match) {
        continue;
      }
      const [, , href, title] = match;
      const hrefNorm = href.trim();
      const id = toKebabCase2(hrefNorm.replace(/\.md$/i, "").replace(/\//g, "-"));
      const strictPath = `${STRICT_WORKFLOW_DIR11}/specs/${hrefNorm.replace(/\.md$/i, ".yaml")}`;
      specs.push({ id, title: normalizeWhitespace2(title), path: strictPath });
    }
    return {
      ok: true,
      artifact: {
        schema: "strict-spec-driven/spec-index/v1",
        schema_version: 1,
        artifact_type: "spec_index",
        schema_file: SPEC_INDEX_SCHEMA_FILE,
        specs
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      reason: `Legacy specs index uses an unsupported Markdown shape: ${message}`,
      recommendation: "Review the specs INDEX.md structure and ensure entries follow the '- [path.md](path.md) - Title' format before treating the migration as complete."
    };
  }
}

// src/migrate/converters/roadmap.ts
var LEGACY_ROADMAP_DIR = `${LEGACY_WORKFLOW_DIR2}/roadmap`;
var STRICT_ROADMAP_DIR = `${STRICT_WORKFLOW_DIR10}/roadmap`;
function convertLegacyRoadmapArtifacts(rootDir, result, handledLegacyFiles) {
  const legacyRoadmapRoot = path22.join(rootDir, LEGACY_ROADMAP_DIR);
  if (!existsSync21(legacyRoadmapRoot) || !statSync14(legacyRoadmapRoot).isDirectory()) {
    return;
  }
  const legacyIndexPath = `${LEGACY_ROADMAP_DIR}/INDEX.md`;
  const legacyIndexAbsPath = path22.join(legacyRoadmapRoot, "INDEX.md");
  if (existsSync21(legacyIndexAbsPath) && statSync14(legacyIndexAbsPath).isFile()) {
    handledLegacyFiles.add(legacyIndexPath);
    try {
      const content = readFileSync16(legacyIndexAbsPath, "utf8");
      const conversionResult = convertRoadmapIndex(content);
      if (!conversionResult.ok) {
        recordDeferredArtifact(result, legacyIndexPath, conversionResult.reason, conversionResult.recommendation, "legacy_markdown_artifact", "conversion_ambiguous");
      } else {
        const strictIndexPath = `${STRICT_ROADMAP_DIR}/INDEX.yaml`;
        writeYamlFile2(buildStrictMarkdownTargetPath(rootDir, strictIndexPath), conversionResult.artifact);
        result.converted.push({
          kind: "roadmap_index",
          sourcePath: legacyIndexPath,
          targetPath: strictIndexPath,
          note: "Migrated legacy roadmap index into a strict YAML roadmap_index artifact."
        });
      }
    } catch (error) {
      const deferredArtifact = makeConversionFailure(legacyIndexPath, error);
      recordDeferredArtifact(result, legacyIndexPath, deferredArtifact.reason, deferredArtifact.recommendation, deferredArtifact.kind, "conversion_ambiguous");
    }
  }
  const legacyMilestonesRoot = path22.join(legacyRoadmapRoot, "milestones");
  if (!existsSync21(legacyMilestonesRoot) || !statSync14(legacyMilestonesRoot).isDirectory()) {
    return;
  }
  const milestoneFiles = listFilesRecursive2(legacyMilestonesRoot).map((absolutePath) => toRepoRelativePath2(rootDir, absolutePath)).filter((repoRelativePath) => path22.basename(repoRelativePath) !== "README.md").filter((repoRelativePath) => repoRelativePath.endsWith(".md")).sort((left, right) => left.localeCompare(right));
  for (const legacyMilestoneFile of milestoneFiles) {
    handledLegacyFiles.add(legacyMilestoneFile);
    try {
      const content = readFileSync16(path22.join(rootDir, legacyMilestoneFile), "utf8");
      const filename = path22.basename(legacyMilestoneFile);
      const conversionResult = convertRoadmapMilestone(content, filename);
      if (!conversionResult.ok) {
        recordDeferredArtifact(result, legacyMilestoneFile, conversionResult.reason, conversionResult.recommendation, "legacy_markdown_artifact", "conversion_ambiguous");
        continue;
      }
      const strictMilestonePath = toPosix(legacyMilestoneFile.replace(`${LEGACY_ROADMAP_DIR}/`, `${STRICT_ROADMAP_DIR}/`).replace(/\.md$/i, ".yaml").replace(/milestones\/\d+-/, (match) => match.replace(/\d+/, (digits) => digits.padStart(4, "0"))));
      writeYamlFile2(buildStrictMarkdownTargetPath(rootDir, strictMilestonePath), conversionResult.artifact);
      result.converted.push({
        kind: "roadmap_milestone",
        sourcePath: legacyMilestoneFile,
        targetPath: strictMilestonePath,
        note: "Migrated legacy roadmap milestone into a strict YAML roadmap_milestone artifact."
      });
    } catch (error) {
      const deferredArtifact = makeConversionFailure(legacyMilestoneFile, error);
      recordDeferredArtifact(result, legacyMilestoneFile, deferredArtifact.reason, deferredArtifact.recommendation, deferredArtifact.kind, "conversion_ambiguous");
    }
  }
}
function convertLegacySpecsIndex(rootDir, result, handledLegacyFiles) {
  const legacySpecsIndexPath = `${LEGACY_WORKFLOW_DIR2}/specs/INDEX.md`;
  const legacySpecsIndexAbsPath = path22.join(rootDir, LEGACY_WORKFLOW_DIR2, "specs", "INDEX.md");
  if (!existsSync21(legacySpecsIndexAbsPath) || !statSync14(legacySpecsIndexAbsPath).isFile()) {
    return;
  }
  handledLegacyFiles.add(legacySpecsIndexPath);
  const strictSpecsIndexPath = `${STRICT_WORKFLOW_DIR10}/specs/INDEX.yaml`;
  const strictSpecsIndexAbsPath = path22.join(rootDir, STRICT_WORKFLOW_DIR10, "specs", "INDEX.yaml");
  if (existsSync21(strictSpecsIndexAbsPath)) {
    result.converted.push({
      kind: "spec_index",
      sourcePath: legacySpecsIndexPath,
      targetPath: strictSpecsIndexPath,
      note: "Legacy specs index converted: strict spec index regenerated from migrated spec artifacts."
    });
    return;
  }
  try {
    const content = readFileSync16(legacySpecsIndexAbsPath, "utf8");
    const conversionResult = convertSpecsIndex(content);
    if (!conversionResult.ok) {
      recordDeferredArtifact(result, legacySpecsIndexPath, conversionResult.reason, conversionResult.recommendation, "legacy_markdown_artifact", "conversion_ambiguous");
      return;
    }
    writeYamlFile2(strictSpecsIndexAbsPath, conversionResult.artifact);
    result.converted.push({
      kind: "spec_index",
      sourcePath: legacySpecsIndexPath,
      targetPath: strictSpecsIndexPath,
      note: "Migrated legacy specs index into a strict YAML spec_index artifact."
    });
  } catch (error) {
    const deferredArtifact = makeConversionFailure(legacySpecsIndexPath, error);
    recordDeferredArtifact(result, legacySpecsIndexPath, deferredArtifact.reason, deferredArtifact.recommendation, deferredArtifact.kind, "conversion_ambiguous");
  }
}

// src/migrate/converters/specs.ts
import {
  existsSync as existsSync22,
  readFileSync as readFileSync17,
  statSync as statSync15
} from "fs";
import path23 from "path";
var SPEC_INDEX_SCHEMA_FILE2 = "templates/strict-spec-driven/schemas/spec-index.yaml";
function regenerateStrictSpecIndex(rootDir) {
  const specsRoot = path23.join(rootDir, STRICT_WORKFLOW_DIR10, "specs");
  const indexPath = path23.join(specsRoot, "INDEX.yaml");
  const specs = listFilesRecursive2(specsRoot).map((absolutePath) => ({
    absolutePath,
    repoRelativePath: toRepoRelativePath2(rootDir, absolutePath)
  })).filter(({ absolutePath }) => absolutePath.endsWith(".yaml") || absolutePath.endsWith(".yml")).filter(({ absolutePath }) => path23.basename(absolutePath) !== "INDEX.yaml").map(({ absolutePath, repoRelativePath }) => {
    const artifact = readYamlFile3(absolutePath);
    if (!isRecord4(artifact) || artifact.artifact_type !== "main_spec") {
      return null;
    }
    const spec = asObject3(artifact.spec, `main spec '${repoRelativePath}' field 'spec'`);
    if (typeof spec.id !== "string" || typeof spec.title !== "string") {
      throw new Error(`main spec '${repoRelativePath}' is missing spec.id or spec.title`);
    }
    return {
      id: spec.id,
      title: spec.title,
      path: repoRelativePath
    };
  }).filter((value) => value !== null).sort((left, right) => {
    const byPath = left.path.localeCompare(right.path);
    if (byPath !== 0) {
      return byPath;
    }
    return left.id.localeCompare(right.id);
  });
  const indexArtifact = existsSync22(indexPath) ? {
    ...readYamlFile3(indexPath),
    schema: "strict-spec-driven/spec-index/v1",
    schema_version: 1,
    artifact_type: "spec_index",
    schema_file: SPEC_INDEX_SCHEMA_FILE2,
    specs
  } : {
    schema: "strict-spec-driven/spec-index/v1",
    schema_version: 1,
    artifact_type: "spec_index",
    schema_file: SPEC_INDEX_SCHEMA_FILE2,
    specs
  };
  writeYamlFile2(indexPath, indexArtifact);
}
function convertLegacySpecArtifacts(rootDir, result, handledLegacyFiles) {
  const legacySpecsRoot = path23.join(rootDir, LEGACY_WORKFLOW_DIR2, "specs");
  if (!existsSync22(legacySpecsRoot) || !statSync15(legacySpecsRoot).isDirectory()) {
    return false;
  }
  let convertedAny = false;
  const legacySpecFiles = listFilesRecursive2(legacySpecsRoot).map((absolutePath) => toRepoRelativePath2(rootDir, absolutePath)).filter((repoRelativePath) => repoRelativePath.endsWith(".md")).filter((repoRelativePath) => path23.basename(repoRelativePath) !== "INDEX.md").filter((repoRelativePath) => path23.basename(repoRelativePath) !== "README.md").sort((left, right) => left.localeCompare(right));
  for (const legacySpecFile of legacySpecFiles) {
    handledLegacyFiles.add(legacySpecFile);
    try {
      const strictArtifact = parseLegacyMainSpec(legacySpecFile, readFileSync17(path23.join(rootDir, legacySpecFile), "utf8"));
      const strictTargetPath = replaceMarkdownExtension(legacySpecFile.replace(`${LEGACY_WORKFLOW_DIR2}/specs/`, `${STRICT_WORKFLOW_DIR10}/specs/`));
      writeYamlFile2(buildStrictMarkdownTargetPath(rootDir, strictTargetPath), strictArtifact);
      result.converted.push({
        kind: "main_spec",
        sourcePath: legacySpecFile,
        targetPath: strictTargetPath,
        note: "Migrated legacy Markdown main spec into a strict YAML main_spec artifact."
      });
      convertedAny = true;
    } catch (error) {
      const deferredArtifact = makeConversionFailure(legacySpecFile, error);
      recordDeferredArtifact(result, legacySpecFile, deferredArtifact.reason, deferredArtifact.recommendation, deferredArtifact.kind, "conversion_ambiguous");
    }
  }
  if (convertedAny) {
    regenerateStrictSpecIndex(rootDir);
  }
  return convertedAny;
}

// src/migrate/reporting.ts
function describeDeferredLegacyArtifact(repoRelativePath) {
  if (repoRelativePath === `${LEGACY_WORKFLOW_DIR2}/specs/INDEX.md`) {
    return {
      kind: "legacy_markdown_artifact",
      reason: "Legacy specs index content is a project-state artifact that still requires a dedicated strict YAML converter.",
      recommendation: "Implement roadmap and project-state migration converters before attempting to migrate specs index state."
    };
  }
  if (repoRelativePath.startsWith(`${LEGACY_WORKFLOW_DIR2}/changes/`)) {
    return {
      kind: "legacy_markdown_artifact",
      reason: "Legacy change artifacts require dedicated migration converters before they can become strict YAML change artifacts.",
      recommendation: "Implement the core-workflow migration converters before attempting to self-host migrated changes."
    };
  }
  if (repoRelativePath.startsWith(`${LEGACY_WORKFLOW_DIR2}/roadmap/`)) {
    return {
      kind: "legacy_markdown_artifact",
      reason: "Legacy roadmap artifacts require dedicated migration converters before they can become strict roadmap YAML artifacts.",
      recommendation: "Implement roadmap and project-state migration converters before attempting to migrate roadmap state."
    };
  }
  if (repoRelativePath.startsWith(`${LEGACY_WORKFLOW_DIR2}/specs/`)) {
    return {
      kind: "legacy_markdown_artifact",
      reason: "Legacy spec artifacts require dedicated migration converters before they can become strict YAML specs and deltas.",
      recommendation: "Implement spec and delta migration converters before attempting to migrate legacy spec content."
    };
  }
  return {
    kind: repoRelativePath.endsWith(".md") ? "legacy_markdown_artifact" : "legacy_project_state",
    reason: "This legacy workflow artifact does not have a dedicated migration converter in the current migrate command.",
    recommendation: "Add a dedicated migration converter for this artifact type before treating the migration as complete."
  };
}
function sortMigrationResult(result) {
  sortByDeterministicKey(result.converted, (artifact) => [artifact.targetPath, artifact.sourcePath ?? "", artifact.kind, artifact.note]);
  sortByDeterministicKey(result.skipped, (artifact) => [artifact.sourcePath, artifact.kind, artifact.reason]);
  sortByDeterministicKey(result.warnings, (diagnostic) => [diagnostic.code, diagnostic.sourcePath ?? "", diagnostic.targetPath ?? "", diagnostic.message]);
  sortByDeterministicKey(result.errors, (diagnostic) => [diagnostic.code, diagnostic.sourcePath ?? "", diagnostic.targetPath ?? "", diagnostic.message]);
  sortByDeterministicKey(result.manualFollowUp, (entry) => [entry.sourcePath, entry.reason, entry.recommendation]);
  return result;
}

// src/migrate/preflight.ts
import {
  existsSync as existsSync23,
  readFileSync as readFileSync18,
  statSync as statSync16
} from "fs";
import path24 from "path";
var LEGACY_CONFIG_PATH = `${LEGACY_WORKFLOW_DIR2}/config.yaml`;
var STRICT_CONFIG_PATH = `${STRICT_WORKFLOW_DIR10}/config.yaml`;
var LEGACY_CONFIG_TEXT_REPLACEMENTS = [
  [/\bproposal\.md\b/g, "proposal.yaml"],
  [/\bdesign\.md\b/g, "design.yaml"],
  [/\btasks\.md\b/g, "tasks.yaml"],
  [/\bquestions\.md\b/g, "questions.yaml"],
  [/\/spec-driven-modify\b/g, "strict-spec-modify"],
  [/Mark tasks \[x\] immediately upon completion/g, "Mark tasks done immediately upon completion"],
  [/\(lint \+ unit tests at minimum\)/g, "(validation + unit tests at minimum)"]
];
function normalizeLegacyConfigText(value) {
  let normalized = value;
  for (const [pattern, replacement] of LEGACY_CONFIG_TEXT_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized;
}
function normalizeLegacyConfigValue(value) {
  if (typeof value === "string") {
    return normalizeLegacyConfigText(value);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeLegacyConfigValue(entry));
  }
  if (isRecord4(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalizeLegacyConfigValue(entry)]));
  }
  return value;
}
function loadStrictConfigFromLegacy(rootDir, errors) {
  const legacyConfigAbsolutePath = path24.join(rootDir, LEGACY_CONFIG_PATH);
  if (!existsSync23(legacyConfigAbsolutePath) || !statSync16(legacyConfigAbsolutePath).isFile()) {
    errors.push(makeDiagnostic2("legacy_config_missing", "Bootstrap migration requires .spec-driven/config.yaml to exist before migrate can initialize strict workflow state.", LEGACY_CONFIG_PATH));
    return null;
  }
  let legacyConfigArtifact;
  try {
    legacyConfigArtifact = parseYamlDocument(readFileSync18(legacyConfigAbsolutePath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(makeDiagnostic2("legacy_config_invalid", `Legacy workflow config could not be parsed as YAML: ${message}`, LEGACY_CONFIG_PATH));
    return null;
  }
  if (!isRecord4(legacyConfigArtifact)) {
    errors.push(makeDiagnostic2("legacy_config_invalid", "Legacy workflow config must decode to a YAML mapping before migrate can continue.", LEGACY_CONFIG_PATH));
    return null;
  }
  const { context, rules } = legacyConfigArtifact;
  if (typeof context !== "string" || context.length === 0) {
    errors.push(makeDiagnostic2("legacy_config_invalid", "Legacy workflow config must provide a non-empty string context before migrate can continue.", LEGACY_CONFIG_PATH));
    return null;
  }
  if (!isRecord4(rules)) {
    errors.push(makeDiagnostic2("legacy_config_invalid", "Legacy workflow config must provide a rules mapping before migrate can continue.", LEGACY_CONFIG_PATH));
    return null;
  }
  const scaffoldConfig = loadBundledScaffoldYaml("config.yaml");
  return {
    ...scaffoldConfig,
    context,
    rules: normalizeLegacyConfigValue(rules)
  };
}
function getReportedStrictScaffoldAssets() {
  return getRequiredBundledScaffoldAssets().filter((assetPath) => assetPath !== "config.yaml").sort((left, right) => left.localeCompare(right));
}

// src/migrate.ts
function migrateLegacyWorkflow(rootDir, options) {
  const legacyRootAbsolutePath = path25.join(rootDir, LEGACY_WORKFLOW_DIR2);
  const strictRootAbsolutePath = path25.join(rootDir, STRICT_WORKFLOW_DIR10);
  const result = {
    valid: false,
    targetRoot: STRICT_WORKFLOW_DIR10,
    converted: [],
    skipped: [],
    warnings: [],
    errors: [],
    manualFollowUp: []
  };
  if (!existsSync24(legacyRootAbsolutePath) || !statSync17(legacyRootAbsolutePath).isDirectory()) {
    result.errors.push(makeDiagnostic2("legacy_source_missing", "Bootstrap migration requires a .spec-driven/ directory at the repository root.", LEGACY_WORKFLOW_DIR2));
    return sortMigrationResult(result);
  }
  if (existsSync24(strictRootAbsolutePath)) {
    const strictRootStat = statSync17(strictRootAbsolutePath);
    if (!strictRootStat.isDirectory()) {
      result.errors.push(makeDiagnostic2("strict_target_conflict", "Cannot migrate into .strict-spec-driven because a non-directory entry already exists at that path.", undefined, STRICT_WORKFLOW_DIR10));
      return sortMigrationResult(result);
    }
    if (readdirSync10(strictRootAbsolutePath).length > 0) {
      result.errors.push(makeDiagnostic2("strict_target_conflict", "Cannot migrate into a non-empty .strict-spec-driven directory. You must manually delete it before running migration. Do NOT delete it automatically — ask the user to run: rm -rf .strict-spec-driven", undefined, STRICT_WORKFLOW_DIR10));
      return sortMigrationResult(result);
    }
  }
  const strictConfig = loadStrictConfigFromLegacy(rootDir, result.errors);
  if (!strictConfig) {
    return sortMigrationResult(result);
  }
  const legacyFiles = listFilesRecursive2(legacyRootAbsolutePath).map((absolutePath) => toRepoRelativePath2(rootDir, absolutePath)).sort((left, right) => left.localeCompare(right));
  options?.onProgress?.(`scanning: found ${legacyFiles.length} legacy files`);
  initializeStrictScaffold(rootDir);
  const strictConfigAbsolutePath = path25.join(rootDir, STRICT_CONFIG_PATH);
  writeFileSync8(strictConfigAbsolutePath, stringifyYamlDocument(strictConfig), "utf8");
  result.converted.push({
    kind: "workflow_config",
    sourcePath: LEGACY_CONFIG_PATH,
    targetPath: STRICT_CONFIG_PATH,
    note: "Migrated legacy workflow config into strict workflow config metadata."
  });
  const handledLegacyFiles = new Set([LEGACY_CONFIG_PATH]);
  for (const scaffoldAsset of getReportedStrictScaffoldAssets()) {
    result.converted.push({
      kind: "strict_scaffold_asset",
      targetPath: `${STRICT_WORKFLOW_DIR10}/${scaffoldAsset}`,
      note: "Ensured required strict scaffold asset is available for migration output."
    });
  }
  options?.onProgress?.("converting: specs");
  convertLegacySpecArtifacts(rootDir, result, handledLegacyFiles);
  options?.onProgress?.("converting: changes");
  convertLegacyChangeArtifacts(rootDir, result, handledLegacyFiles);
  options?.onProgress?.("converting: roadmap");
  convertLegacyRoadmapArtifacts(rootDir, result, handledLegacyFiles);
  convertLegacySpecsIndex(rootDir, result, handledLegacyFiles);
  const unhandled = legacyFiles.filter((f) => !handledLegacyFiles.has(f) && path25.basename(f) !== "README.md");
  if (unhandled.length > 0) {
    options?.onProgress?.(`deferring: ${unhandled.length} unhandled files`);
  }
  for (const legacyFile of unhandled) {
    const deferredArtifact = describeDeferredLegacyArtifact(legacyFile);
    recordDeferredArtifact(result, legacyFile, deferredArtifact.reason, deferredArtifact.recommendation, deferredArtifact.kind, "converter_unavailable");
  }
  options?.onProgress?.(`done: ${result.converted.length} converted, ${result.skipped.length} skipped, ${result.warnings.length} warnings, ${result.errors.length} errors`);
  result.valid = true;
  return sortMigrationResult(result);
}

// src/cli/cmd-migration.ts
function runMigrate(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven migrate
`);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(`Usage: strict-spec-driven migrate
`);
    return 1;
  }
  try {
    const result = migrateLegacyWorkflow(process.cwd(), {
      onProgress: (phase) => writeErr(`[migrate ${new Date().toISOString()}] ${phase}
`)
    });
    writeJson(result);
    return result.valid ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeError(message);
    return 1;
  }
}
function runMaintenanceCommand(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven maintenance
`);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(`Usage: strict-spec-driven maintenance
`);
    return 1;
  }
  const result = runMaintenance(process.cwd());
  writeJson(result);
  return result.valid ? 0 : 1;
}

// src/cli/cmd-operations.ts
import { existsSync as existsSync28, readFileSync as readFileSync22, statSync as statSync21 } from "fs";
import { execSync } from "child_process";
import path29 from "path";

// src/skills.ts
import { existsSync as existsSync26, readdirSync as readdirSync11, readFileSync as readFileSync20, statSync as statSync19 } from "node:fs";
import path27 from "node:path";

// src/skills/model.ts
var REQUIRED_METADATA_FIELDS = ["skill_id", "author", "type", "version"];
var EXPECTED_SCRIPT_SYMLINK = "../../dist/scripts";
var COMMAND_PREFIX = "node {{SKILL_DIR}}/scripts/strict-spec-driven.js";
var GENERIC_COMMAND_PLACEHOLDER = `${COMMAND_PREFIX} <command>`;
var GENERATE_NAMED_ARGS_COMMAND = `${COMMAND_PREFIX} generate <change-name> <proposal|design|questions|delta-spec> --<named-args>`;
var READY_COMMAND = `${COMMAND_PREFIX} ready <change-name>`;
var NEXT_COMMAND = `${COMMAND_PREFIX} next <change-name>`;
var CHECK_WORKFLOW_STATE_COMMAND = `${COMMAND_PREFIX} check-workflow-state`;
var STRICT_WORKFLOW_EXISTENCE_STEP_SNIPPET = `Before any other step, run \`${CHECK_WORKFLOW_STATE_COMMAND}\``;
var STRICT_WORKFLOW_INIT_GUIDANCE_SNIPPET = "stop immediately and tell the user to run `/strict-spec-init`";
var STRICT_WORKFLOW_NO_INIT_SNIPPET = "Do not run `init` from this skill.";
var ROADMAP_DETAILS_GUIDANCE_SNIPPET = "`details` field";
var ROADMAP_SPLIT_PLANNED_CHANGE_SNIPPET = "standalone planned-change";
var ROADMAP_ACTIVE_CONFLICT_SNIPPET = "active strict change conflicts";
var ROADMAP_PLAN_EXECUTABLE_DETAIL_SNIPPET = "executable planning context";
var ROADMAP_PLAN_REVIEW_SNIPPET = "Review the roadmap plan before handoff";
var ROADMAP_SCRIPTED_RECOMMEND_SNIPPET = "treat the command's selected planned change as authoritative";
var ROADMAP_RECOMMEND_BEFORE_CONTEXT_SNIPPET = "before reading broad roadmap context";
var ROADMAP_READY_HANDOFF_SNIPPET = "Use `ready` as the proposal handoff validation";
var ROADMAP_AUTO_POPULATED_HANDOFF_SNIPPET = "populated change scaffold";
var AUTO_TARGETED_CONTEXT_RESET_SNIPPET = "Reset context from targeted files";
var AUTO_RESUME_POPULATED_SCAFFOLD_SNIPPET = "resume the existing populated strict change scaffold without regenerating planning artifacts";
var AUTO_REUSE_REGRESSION_EVIDENCE_SNIPPET = "exactly matches the configured complete project regression command";
var PROPOSAL_ARTIFACT_REVIEW_SNIPPET = "Review and refine the generated planning artifacts";
var REVIEW_AUTO_FIX_SNIPPET = "Automatically fix safe in-scope review findings";
var REVIEW_POST_FIX_REGRESSION_SNIPPET = "rerun strict verification plus the configured complete regression command after review-time changes";
var CORE_STRICT_SKILL_EXPECTATIONS = {
  "strict-spec-init": {
    requiredCommands: {
      init: `${COMMAND_PREFIX} init`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [".strict-spec-driven/"]
  },
  "strict-spec-propose": {
    requiredCommands: {
      propose: `${COMMAND_PREFIX} propose <change-name>`,
      generate: GENERATE_NAMED_ARGS_COMMAND,
      ready: READY_COMMAND,
      verify: `${COMMAND_PREFIX} verify <change-name>`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [".strict-spec-driven/", "/strict-spec-auto", PROPOSAL_ARTIFACT_REVIEW_SNIPPET],
    forbiddenSnippets: [
      "Scaffolds proposal.yaml, design.yaml, tasks.yaml, questions.yaml, and strict YAML delta specs under .strict-spec-driven/changes/<name>/."
    ]
  },
  "strict-spec-apply": {
    requiredCommands: {
      modify: `${COMMAND_PREFIX} modify [change-name|archive-dir]`,
      apply: `${COMMAND_PREFIX} apply <change-name>`,
      verify: `${COMMAND_PREFIX} verify <change-name>`
    },
    requiredHeadings: ["## Steps", "## Rules", "## Dev Session Guidance"],
    requiredSnippets: [".strict-spec-driven/", "dev-session-plan"]
  },
  "strict-spec-verify": {
    requiredCommands: {
      modify: `${COMMAND_PREFIX} modify [change-name|archive-dir]`,
      verify: `${COMMAND_PREFIX} verify <change-name>`,
      "verify-spec-mappings": `${COMMAND_PREFIX} verify-spec-mappings`
    },
    requiredHeadings: ["## Steps", "## Rules", "## Dev Session Guidance"],
    requiredSnippets: [".strict-spec-driven/", "dev-session-trial"]
  },
  "strict-spec-review": {
    requiredCommands: {
      modify: `${COMMAND_PREFIX} modify [change-name|archive-dir]`,
      verify: `${COMMAND_PREFIX} verify <change-name>`
    },
    requiredHeadings: ["## Steps", "## Rules", "## Dev Session Guidance"],
    requiredSnippets: [
      ".strict-spec-driven/",
      "dev-session-trial",
      "direct code review evidence",
      REVIEW_AUTO_FIX_SNIPPET,
      REVIEW_POST_FIX_REGRESSION_SNIPPET,
      "Do not call or rely on a `strict-spec-driven review` command"
    ],
    forbiddenSnippets: [
      `${COMMAND_PREFIX} review <change-name>`
    ]
  },
  "strict-spec-archive": {
    requiredCommands: {
      modify: `${COMMAND_PREFIX} modify [change-name|archive-dir]`,
      verify: `${COMMAND_PREFIX} verify <change-name>`,
      "verify-spec-mappings": `${COMMAND_PREFIX} verify-spec-mappings`,
      archive: `${COMMAND_PREFIX} archive <change-name>`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [".strict-spec-driven/"],
    forbiddenSnippets: [
      "any change to roadmap state caused by archive",
      "ask the user to confirm the change truly has no observable"
    ]
  },
  "strict-spec-auto": {
    requiredCommands: {
      propose: `${COMMAND_PREFIX} propose <change-name>`,
      generate: GENERATE_NAMED_ARGS_COMMAND,
      apply: `${COMMAND_PREFIX} apply <change-name>`,
      verify: `${COMMAND_PREFIX} verify <change-name>`,
      ready: READY_COMMAND,
      next: NEXT_COMMAND,
      "verify-spec-mappings": `${COMMAND_PREFIX} verify-spec-mappings`,
      archive: `${COMMAND_PREFIX} archive <change-name>`
    },
    requiredHeadings: ["## Steps", "## Rules", "## Dev Session Guidance"],
    requiredSnippets: [
      ".strict-spec-driven/",
      "/strict-spec-ship <change-name>",
      AUTO_TARGETED_CONTEXT_RESET_SNIPPET,
      AUTO_RESUME_POPULATED_SCAFFOLD_SNIPPET,
      AUTO_REUSE_REGRESSION_EVIDENCE_SNIPPET,
      PROPOSAL_ARTIFACT_REVIEW_SNIPPET,
      "dev-session-plan",
      "direct code review evidence",
      REVIEW_AUTO_FIX_SNIPPET,
      REVIEW_POST_FIX_REGRESSION_SNIPPET,
      "Do not call or rely on a `strict-spec-driven review` command"
    ],
    forbiddenSnippets: [
      "empty-spec-impact decisions block progress",
      "empty-spec-impact decision has been explicitly confirmed",
      `${COMMAND_PREFIX} review <change-name>`
    ]
  },
  "strict-spec-modify": {
    requiredCommands: {
      modify: `${COMMAND_PREFIX} modify [change-name|archive-dir]`,
      verify: `${COMMAND_PREFIX} verify <change-name>`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [".strict-spec-driven/"]
  },
  "strict-spec-cancel": {
    requiredCommands: {
      modify: `${COMMAND_PREFIX} modify [change-name|archive-dir]`,
      cancel: `${COMMAND_PREFIX} cancel <change-name>`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [".strict-spec-driven/"]
  },
  "strict-spec-ship": {
    requiredCommands: {
      ship: `${COMMAND_PREFIX} ship <change-name>`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [".strict-spec-driven/"]
  }
};
var ROADMAP_STRICT_SKILL_EXPECTATIONS = {
  "strict-roadmap-plan": {
    requiredCommands: {
      "roadmap-status": `${COMMAND_PREFIX} roadmap-status`,
      "roadmap-sync": `${COMMAND_PREFIX} roadmap-sync`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [
      ".strict-spec-driven/roadmap/",
      ROADMAP_PLAN_EXECUTABLE_DETAIL_SNIPPET,
      ROADMAP_PLAN_REVIEW_SNIPPET
    ]
  },
  "strict-roadmap-milestone": {
    requiredCommands: {
      "roadmap-status": `${COMMAND_PREFIX} roadmap-status`,
      "roadmap-sync": `${COMMAND_PREFIX} roadmap-sync`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [".strict-spec-driven/roadmap/"]
  },
  "strict-roadmap-recommend": {
    requiredCommands: {
      "roadmap-status": `${COMMAND_PREFIX} roadmap-status`,
      "roadmap-recommend": `${COMMAND_PREFIX} roadmap-recommend`,
      propose: `${COMMAND_PREFIX} propose <change-name>`,
      generate: GENERATE_NAMED_ARGS_COMMAND,
      ready: READY_COMMAND
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [
      ".strict-spec-driven/roadmap/",
      ROADMAP_DETAILS_GUIDANCE_SNIPPET,
      ROADMAP_SPLIT_PLANNED_CHANGE_SNIPPET,
      ROADMAP_ACTIVE_CONFLICT_SNIPPET,
      ROADMAP_SCRIPTED_RECOMMEND_SNIPPET,
      ROADMAP_RECOMMEND_BEFORE_CONTEXT_SNIPPET,
      ROADMAP_READY_HANDOFF_SNIPPET,
      ROADMAP_AUTO_POPULATED_HANDOFF_SNIPPET,
      "/strict-spec-auto"
    ]
  },
  "strict-roadmap-propose": {
    requiredCommands: {
      "roadmap-status": `${COMMAND_PREFIX} roadmap-status`,
      propose: `${COMMAND_PREFIX} propose <change-name>`,
      generate: GENERATE_NAMED_ARGS_COMMAND,
      ready: READY_COMMAND,
      verify: `${COMMAND_PREFIX} verify <change-name>`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [
      ".strict-spec-driven/roadmap/",
      ROADMAP_DETAILS_GUIDANCE_SNIPPET,
      ROADMAP_SPLIT_PLANNED_CHANGE_SNIPPET,
      ROADMAP_ACTIVE_CONFLICT_SNIPPET
    ]
  },
  "strict-roadmap-sync": {
    requiredCommands: {
      "roadmap-status": `${COMMAND_PREFIX} roadmap-status`,
      "roadmap-sync": `${COMMAND_PREFIX} roadmap-sync`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [".strict-spec-driven/roadmap/"]
  }
};
var PLANNING_STRICT_SKILL_EXPECTATIONS = {
  "strict-spec-brainstorm": {
    requiredCommands: {
      propose: `${COMMAND_PREFIX} propose <change-name>`,
      generate: GENERATE_NAMED_ARGS_COMMAND,
      ready: READY_COMMAND,
      verify: `${COMMAND_PREFIX} verify <change-name>`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [
      ".strict-spec-driven/",
      "proposal.yaml",
      "questions.yaml",
      PROPOSAL_ARTIFACT_REVIEW_SNIPPET
    ]
  },
  "strict-spec-simple-task": {
    requiredCommands: {
      "list-changes": `${COMMAND_PREFIX} list`,
      "inspect-change": `${COMMAND_PREFIX} modify [change-name|archive-dir]`,
      "verify-spec-mappings": `${COMMAND_PREFIX} verify-spec-mappings`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [".strict-spec-driven/", ".strict-spec-driven/changes/"]
  },
  "strict-spec-spec-edit": {
    requiredCommands: {
      "verify-spec-mappings": `${COMMAND_PREFIX} verify-spec-mappings`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [".strict-spec-driven/specs/", "mapping.implementation", "mapping.tests"]
  },
  "strict-spec-sync-specs": {
    requiredCommands: {
      "verify-spec-mappings": `${COMMAND_PREFIX} verify-spec-mappings`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [".strict-spec-driven/specs/", "INDEX.yaml"]
  },
  "strict-spec-resync-code-mapping": {
    requiredCommands: {
      "verify-spec-mappings": `${COMMAND_PREFIX} verify-spec-mappings`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [".strict-spec-driven/specs/", "mapping.implementation", "mapping.tests"]
  }
};
var MIGRATION_STRICT_SKILL_EXPECTATIONS = {
  "strict-spec-migrate": {
    requiredCommands: {
      migrate: `${COMMAND_PREFIX} migrate`,
      "roadmap-status": `${COMMAND_PREFIX} roadmap-status`,
      "verify-spec-mappings": `${COMMAND_PREFIX} verify-spec-mappings`
    },
    requiredHeadings: ["## Steps", "## Rules"],
    requiredSnippets: [".spec-driven/", ".strict-spec-driven/"]
  }
};
function makeDiagnostic3(code, diagPath, message, expected, actual) {
  return { code, path: toPosix(diagPath), message, expected, actual };
}

// src/skills/content.ts
function requiresExistingStrictWorkflowState(skillName) {
  return (skillName.startsWith("strict-spec-") || skillName.startsWith("strict-roadmap-")) && skillName !== "strict-spec-init" && skillName !== "strict-spec-migrate";
}
function validateStrictWorkflowStateGuidance(skillName, content, commands, skillPath, diagnostics) {
  if (!requiresExistingStrictWorkflowState(skillName))
    return;
  const normalizedContent = content.replace(/\s+/g, " ");
  const checkWorkflowStateCommand = commands["check-workflow-state"];
  if (!checkWorkflowStateCommand) {
    diagnostics.push(makeDiagnostic3("skill.strict_workflow.check_command.missing", `${skillPath}#commands.check-workflow-state`, "non-init strict skills must expose the scripted strict workflow state check command", CHECK_WORKFLOW_STATE_COMMAND));
  } else if (!checkWorkflowStateCommand.includes(CHECK_WORKFLOW_STATE_COMMAND)) {
    diagnostics.push(makeDiagnostic3("skill.strict_workflow.check_command.invalid", `${skillPath}#commands.check-workflow-state`, "non-init strict skills must run the scripted strict workflow state check command before workflow work", CHECK_WORKFLOW_STATE_COMMAND, checkWorkflowStateCommand));
  }
  for (const snippet2 of [
    STRICT_WORKFLOW_EXISTENCE_STEP_SNIPPET,
    STRICT_WORKFLOW_INIT_GUIDANCE_SNIPPET,
    STRICT_WORKFLOW_NO_INIT_SNIPPET
  ]) {
    if (normalizedContent.includes(snippet2.replace(/\s+/g, " ")))
      continue;
    diagnostics.push(makeDiagnostic3("skill.strict_workflow.precheck.missing", skillPath, "non-init strict skills must check for existing .strict-spec-driven/ state before any other step and stop with init guidance when it is missing", snippet2));
  }
  if (commands.init) {
    diagnostics.push(makeDiagnostic3("skill.strict_workflow.init_command.forbidden", `${skillPath}#commands.init`, "non-init strict skills must not declare the bundled init command as a fallback", "no init command entry", commands.init));
  }
}
function validateSkillContentAgainstExpectation(skillName, content, commands, skillPath, diagnostics, expectationMap, diagnosticPrefix, label) {
  const expectation = expectationMap[skillName];
  if (!expectation)
    return;
  const normalizedContent = content.replace(/\s+/g, " ");
  if (content.includes(GENERIC_COMMAND_PLACEHOLDER)) {
    diagnostics.push(makeDiagnostic3(`${diagnosticPrefix}.placeholder_command`, skillPath, `${label} must replace the generic placeholder command mapping with explicit commands`, "explicit command mapping", GENERIC_COMMAND_PLACEHOLDER));
  }
  for (const heading of expectation.requiredHeadings) {
    if (!content.includes(heading)) {
      diagnostics.push(makeDiagnostic3(`${diagnosticPrefix}.required_heading.missing`, skillPath, `${label} is missing required section heading '${heading}'`, heading));
    }
  }
  for (const snippet2 of expectation.requiredSnippets) {
    if (!normalizedContent.includes(snippet2.replace(/\s+/g, " "))) {
      diagnostics.push(makeDiagnostic3(`${diagnosticPrefix}.required_snippet.missing`, skillPath, `${label} must reference '${snippet2}'`, snippet2));
    }
  }
  for (const snippet2 of expectation.forbiddenSnippets ?? []) {
    if (normalizedContent.includes(snippet2.replace(/\s+/g, " "))) {
      diagnostics.push(makeDiagnostic3(`${diagnosticPrefix}.forbidden_snippet.present`, skillPath, `${label} contains misleading prompt text '${snippet2}'`, "prompt text aligned with implemented CLI behavior", snippet2));
    }
  }
  for (const [commandName, expectedValue] of Object.entries(expectation.requiredCommands)) {
    const actualValue = commands[commandName];
    if (!actualValue) {
      diagnostics.push(makeDiagnostic3(`${diagnosticPrefix}.command.missing`, `${skillPath}#commands.${commandName}`, `${label} is missing required command entry '${commandName}'`, expectedValue));
      continue;
    }
    if (!actualValue.includes(expectedValue)) {
      diagnostics.push(makeDiagnostic3(`${diagnosticPrefix}.command.invalid`, `${skillPath}#commands.${commandName}`, `${label} command '${commandName}' must reference the expected strict CLI subcommand`, expectedValue, actualValue));
    }
  }
}
function validateCoreSkillContent(skillName, content, commands, skillPath, diagnostics) {
  validateSkillContentAgainstExpectation(skillName, content, commands, skillPath, diagnostics, CORE_STRICT_SKILL_EXPECTATIONS, "skill.core", "core strict skill");
}
function validateRoadmapSkillContent(skillName, content, commands, skillPath, diagnostics) {
  validateSkillContentAgainstExpectation(skillName, content, commands, skillPath, diagnostics, ROADMAP_STRICT_SKILL_EXPECTATIONS, "skill.roadmap", "strict roadmap skill");
}
function validatePlanningSkillContent(skillName, content, commands, skillPath, diagnostics) {
  validateSkillContentAgainstExpectation(skillName, content, commands, skillPath, diagnostics, PLANNING_STRICT_SKILL_EXPECTATIONS, "skill.planning", "strict planning skill");
}
function validateMigrationSkillContent(skillName, content, commands, skillPath, diagnostics) {
  validateSkillContentAgainstExpectation(skillName, content, commands, skillPath, diagnostics, MIGRATION_STRICT_SKILL_EXPECTATIONS, "skill.migration", "strict migration skill");
}
function validateCommandSection(skillName, content, skillPath, diagnostics) {
  const sectionMatch = content.match(/## This Skill's Commands[\s\S]*?```yaml\s*([\s\S]*?)```/m);
  if (!sectionMatch) {
    diagnostics.push(makeDiagnostic3("skill.commands_section.missing", skillPath, "skills that use the CLI must include a '## This Skill's Commands' section with a yaml command mapping"));
    return;
  }
  const yamlBlock = sectionMatch[1].trim();
  if (!yamlBlock) {
    diagnostics.push(makeDiagnostic3("skill.commands_section.empty", skillPath, "command mapping block cannot be empty"));
    return;
  }
  let commands;
  try {
    commands = parseYamlDocument(yamlBlock, { source: skillPath });
  } catch (error) {
    const yamlDetails = getYamlParseDetails(error);
    const yamlDiagnosticDetails = getYamlDiagnosticDetails(error);
    diagnostics.push({
      ...makeDiagnostic3("skill.commands_section.parse_error", skillPath, "command mapping block is not valid YAML", "parseable YAML mapping", yamlDetails ? formatYamlParseSummary(yamlDetails) : error instanceof Error ? error.message : String(error)),
      ...yamlDiagnosticDetails
    });
    return;
  }
  if (!commands || typeof commands !== "object" || Array.isArray(commands)) {
    diagnostics.push(makeDiagnostic3("skill.commands_section.invalid_shape", skillPath, "command mapping block must be a YAML mapping"));
    return;
  }
  const entries = Object.entries(commands);
  if (entries.length === 0) {
    diagnostics.push(makeDiagnostic3("skill.commands_section.no_commands", skillPath, "command mapping must declare at least one command entry"));
    return;
  }
  const normalizedCommands = {};
  for (const [name, value] of entries) {
    if (typeof value !== "string" || value.trim().length === 0) {
      diagnostics.push(makeDiagnostic3("skill.commands_section.command.invalid", `${skillPath}#commands.${name}`, "command mapping values must be non-empty strings"));
      continue;
    }
    normalizedCommands[name] = value;
    if (!value.includes(COMMAND_PREFIX)) {
      diagnostics.push(makeDiagnostic3("skill.commands_section.command.reference", `${skillPath}#commands.${name}`, "command entries must reference the strict bundled script", COMMAND_PREFIX, value));
      continue;
    }
    const commandSuffix = value.slice(value.indexOf(COMMAND_PREFIX) + COMMAND_PREFIX.length).trim();
    if (commandSuffix.length === 0 || commandSuffix === "<command>" || value.includes(GENERIC_COMMAND_PLACEHOLDER)) {
      diagnostics.push(makeDiagnostic3("skill.commands_section.command.placeholder", `${skillPath}#commands.${name}`, "command entries must replace the generic strict CLI placeholder with an explicit subcommand and parameters", `${COMMAND_PREFIX} <explicit-subcommand>`, value));
    }
  }
  validateCoreSkillContent(skillName, content, normalizedCommands, skillPath, diagnostics);
  validateRoadmapSkillContent(skillName, content, normalizedCommands, skillPath, diagnostics);
  validatePlanningSkillContent(skillName, content, normalizedCommands, skillPath, diagnostics);
  validateMigrationSkillContent(skillName, content, normalizedCommands, skillPath, diagnostics);
  validateStrictWorkflowStateGuidance(skillName, content, normalizedCommands, skillPath, diagnostics);
}

// src/skills/diagnostics.ts
function sortDiagnostics2(diagnostics) {
  return sortByDeterministicKey(diagnostics, (diagnostic) => [
    diagnostic.code,
    diagnostic.path,
    diagnostic.message,
    diagnostic.expected ?? "",
    diagnostic.actual ?? ""
  ]);
}

// src/skills/fs-checks.ts
import { existsSync as existsSync25, lstatSync, readFileSync as readFileSync19, readlinkSync, statSync as statSync18 } from "node:fs";
import path26 from "node:path";
function validateRequiredSymlink(skillDir, skillName, entryName, expectedTarget, diagnostics) {
  const entryPath = path26.join(skillDir, entryName);
  const relativeSkillPath = path26.join("skills", skillName, entryName);
  if (!existsSync25(entryPath)) {
    diagnostics.push(makeDiagnostic3(`skill.${entryName}_symlink.missing`, relativeSkillPath, `skill '${skillName}' is missing required ${entryName} symlink`));
    return;
  }
  const stats = lstatSync(entryPath);
  if (!stats.isSymbolicLink()) {
    diagnostics.push(makeDiagnostic3(`skill.${entryName}_symlink.invalid_type`, relativeSkillPath, `skill '${skillName}' ${entryName} entry must be a symlink`));
    return;
  }
  const target = toPosix(readlinkSync(entryPath));
  const normalizedExpected = toPosix(expectedTarget);
  if (target !== normalizedExpected) {
    diagnostics.push(makeDiagnostic3(`skill.${entryName}_symlink.invalid_target`, relativeSkillPath, `skill '${skillName}' ${entryName} symlink must point to '${normalizedExpected}'`, normalizedExpected, target));
    return;
  }
  const resolved = path26.resolve(skillDir, target);
  if (!existsSync25(resolved) || !statSync18(resolved).isDirectory()) {
    diagnostics.push(makeDiagnostic3(`skill.${entryName}_symlink.broken`, relativeSkillPath, `skill '${skillName}' ${entryName} symlink target does not resolve to a directory`));
  }
}
function validateMarketplaceMetadata(rootDir, skillNames, diagnostics) {
  const metadataPath = path26.join(rootDir, "skills", "marketplace.json");
  const relativeMetadataPath = path26.join("skills", "marketplace.json");
  if (!existsSync25(metadataPath)) {
    diagnostics.push(makeDiagnostic3("skills.marketplace.missing", relativeMetadataPath, "skills marketplace metadata file is missing"));
    return 0;
  }
  let parsed;
  try {
    parsed = JSON.parse(readFileSync19(metadataPath, "utf8"));
  } catch (error) {
    diagnostics.push(makeDiagnostic3("skills.marketplace.parse_error", relativeMetadataPath, "skills marketplace metadata must be valid JSON", "valid JSON", error instanceof Error ? error.message : String(error)));
    return 0;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    diagnostics.push(makeDiagnostic3("skills.marketplace.invalid_shape", relativeMetadataPath, "skills marketplace metadata must be a JSON object"));
    return 0;
  }
  const manifest = parsed;
  if (!Array.isArray(manifest.skills)) {
    diagnostics.push(makeDiagnostic3("skills.marketplace.skills.missing", relativeMetadataPath, "skills marketplace metadata must include a skills array"));
    return 0;
  }
  const marketplaceNames = [];
  for (let index = 0;index < manifest.skills.length; index += 1) {
    const entry = manifest.skills[index];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      diagnostics.push(makeDiagnostic3("skills.marketplace.skills.entry.invalid", `${relativeMetadataPath}#skills[${index}]`, "skills marketplace entries must be objects"));
      continue;
    }
    if (typeof entry.name !== "string" || entry.name.trim().length === 0) {
      diagnostics.push(makeDiagnostic3("skills.marketplace.skills.entry.name.missing", `${relativeMetadataPath}#skills[${index}].name`, "skills marketplace entry names must be non-empty strings"));
      continue;
    }
    marketplaceNames.push(entry.name);
    if (!entry.name.startsWith("strict-spec-") && !entry.name.startsWith("strict-roadmap-")) {
      diagnostics.push(makeDiagnostic3("skills.marketplace.skills.entry.name.legacy", `${relativeMetadataPath}#skills[${index}].name`, "skills marketplace entries must use strict skill name prefixes", "strict-spec-* or strict-roadmap-*", entry.name));
    }
  }
  const normalizeList = (values2) => [...new Set(values2)].sort((a, b) => a.localeCompare(b));
  const expected = normalizeList(skillNames);
  const actual = normalizeList(marketplaceNames);
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    diagnostics.push(makeDiagnostic3("skills.marketplace.skills.mismatch", relativeMetadataPath, "skills marketplace names must match skill directories exactly", JSON.stringify(expected), JSON.stringify(actual)));
  }
  return actual.length;
}

// src/skills/frontmatter.ts
function parseFrontmatter(content, skillPath, diagnostics) {
  const normalized = content.replace(/\r\n?/g, `
`);
  const lines = normalized.split(`
`);
  if (lines[0] !== "---") {
    diagnostics.push(makeDiagnostic3("skill.frontmatter.missing", skillPath, "SKILL.md must start with YAML frontmatter"));
    return null;
  }
  const closeIndex = lines.findIndex((line, index) => index > 0 && line === "---");
  if (closeIndex === -1) {
    diagnostics.push(makeDiagnostic3("skill.frontmatter.unterminated", skillPath, "SKILL.md frontmatter must be terminated with a closing --- line"));
    return null;
  }
  const rawFrontmatter = lines.slice(1, closeIndex).join(`
`);
  try {
    const parsed = parseYamlDocument(rawFrontmatter, { source: skillPath });
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      diagnostics.push(makeDiagnostic3("skill.frontmatter.invalid_shape", skillPath, "SKILL.md frontmatter must parse to a YAML mapping", "mapping", typeof parsed));
      return null;
    }
    return parsed;
  } catch (error) {
    const yamlDetails = getYamlParseDetails(error);
    const yamlDiagnosticDetails = getYamlDiagnosticDetails(error);
    diagnostics.push({
      ...makeDiagnostic3("skill.frontmatter.parse_error", skillPath, "SKILL.md frontmatter is not valid YAML", "parseable YAML mapping", yamlDetails ? formatYamlParseSummary(yamlDetails) : error instanceof Error ? error.message : String(error)),
      ...yamlDiagnosticDetails
    });
    return null;
  }
}
function validateFrontmatterFields(frontmatter, skillName, skillPath, diagnostics) {
  if (typeof frontmatter.name !== "string" || frontmatter.name.trim().length === 0) {
    diagnostics.push(makeDiagnostic3("skill.frontmatter.name.missing", skillPath, "frontmatter.name must be a non-empty string"));
  } else if (frontmatter.name !== skillName) {
    diagnostics.push(makeDiagnostic3("skill.frontmatter.name.mismatch", skillPath, "frontmatter.name must match the skill directory name", skillName, frontmatter.name));
  }
  if (typeof frontmatter.description !== "string" || frontmatter.description.trim().length === 0) {
    diagnostics.push(makeDiagnostic3("skill.frontmatter.description.missing", skillPath, "frontmatter.description must be a non-empty string"));
  }
  if (!frontmatter.metadata || typeof frontmatter.metadata !== "object" || Array.isArray(frontmatter.metadata)) {
    diagnostics.push(makeDiagnostic3("skill.frontmatter.metadata.missing", skillPath, "frontmatter.metadata must be a mapping"));
    return;
  }
  for (const field of REQUIRED_METADATA_FIELDS) {
    const value = frontmatter.metadata[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      diagnostics.push(makeDiagnostic3("skill.frontmatter.metadata.required", `${skillPath}#metadata.${field}`, `frontmatter.metadata.${field} must be a non-empty string`));
    }
  }
  if (frontmatter.metadata.type !== "agent_skill") {
    diagnostics.push(makeDiagnostic3("skill.frontmatter.metadata.type.invalid", `${skillPath}#metadata.type`, "frontmatter.metadata.type must be 'agent_skill'", "agent_skill", typeof frontmatter.metadata.type === "string" ? frontmatter.metadata.type : String(frontmatter.metadata.type)));
  }
}
function validateLegacyReferences(skillName, content, skillPath, diagnostics) {
  const contentWithoutStrictRoadmapCommands = content.replace(/node \{\{SKILL_DIR\}\}\/scripts\/strict-spec-driven\.js\s+roadmap-(?:status|sync|plan|milestone|recommend|propose)\b/g, "node {{SKILL_DIR}}/scripts/strict-spec-driven.js <roadmap-command>");
  const checks = [
    {
      code: "skill.reference.legacy_spec_prefix",
      regex: /(?<!strict-)spec-driven-/g,
      message: "stale legacy spec skill prefix found; use strict-spec-* names"
    },
    {
      code: "skill.reference.legacy_roadmap_prefix",
      regex: /(?<!strict-)roadmap-(?:plan|milestone|recommend|propose|sync)\b(?![-:])/g,
      message: "stale legacy roadmap skill prefix found; use strict-roadmap-* names"
    }
  ];
  if (skillName !== "strict-spec-migrate") {
    checks.unshift({
      code: "skill.reference.legacy_workflow_dir",
      regex: /\.spec-driven\//g,
      message: "stale legacy workflow directory reference found; use .strict-spec-driven/"
    });
  }
  for (const check of checks) {
    const sourceContent = check.code === "skill.reference.legacy_roadmap_prefix" ? contentWithoutStrictRoadmapCommands : content;
    const match = check.regex.exec(sourceContent);
    check.regex.lastIndex = 0;
    if (!match)
      continue;
    diagnostics.push(makeDiagnostic3(check.code, skillPath, check.message));
  }
}

// src/skills.ts
function validateStrictSkillPackaging(rootDir) {
  const diagnostics = [];
  const skillsRoot = path27.join(rootDir, "skills");
  const relativeSkillsRoot = "skills";
  if (!existsSync26(skillsRoot) || !statSync19(skillsRoot).isDirectory()) {
    diagnostics.push(makeDiagnostic3("skills.directory.missing", relativeSkillsRoot, "skills directory is missing"));
    return {
      valid: false,
      diagnostics,
      summary: {
        skillCount: 0,
        marketplaceCount: 0,
        diagnosticsCount: diagnostics.length
      }
    };
  }
  const skillNames = readdirSync11(skillsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort((a, b) => a.localeCompare(b));
  for (const skillName of skillNames) {
    const skillDir = path27.join(skillsRoot, skillName);
    const skillPath = path27.join("skills", skillName, "SKILL.md");
    if (!skillName.startsWith("strict-spec-") && !skillName.startsWith("strict-roadmap-")) {
      diagnostics.push(makeDiagnostic3("skill.directory.legacy_name", path27.join("skills", skillName), "skill directory must use strict prefix", "strict-spec-* or strict-roadmap-*", skillName));
    }
    const skillFilePath = path27.join(skillDir, "SKILL.md");
    if (!existsSync26(skillFilePath)) {
      diagnostics.push(makeDiagnostic3("skill.file.missing", skillPath, "skill directory must include SKILL.md"));
      continue;
    }
    const content = readFileSync20(skillFilePath, "utf8");
    const frontmatter = parseFrontmatter(content, skillPath, diagnostics);
    if (frontmatter) {
      validateFrontmatterFields(frontmatter, skillName, skillPath, diagnostics);
    }
    validateLegacyReferences(skillName, content, skillPath, diagnostics);
    validateCommandSection(skillName, content, skillPath, diagnostics);
    validateRequiredSymlink(skillDir, skillName, "scripts", EXPECTED_SCRIPT_SYMLINK, diagnostics);
  }
  const marketplaceCount = validateMarketplaceMetadata(rootDir, skillNames, diagnostics);
  const sorted = sortDiagnostics2(diagnostics);
  return {
    valid: sorted.length === 0,
    diagnostics: sorted,
    summary: {
      skillCount: skillNames.length,
      marketplaceCount,
      diagnosticsCount: sorted.length
    }
  };
}

// src/cli/spec-mapping.ts
import { existsSync as existsSync27, readdirSync as readdirSync12, readFileSync as readFileSync21, statSync as statSync20 } from "fs";
import path28 from "path";
var STRICT_SPECS_DIR = path28.join(".strict-spec-driven", "specs");
var FORBIDDEN_SPEC_SUBDIRS3 = new Set([".strict-spec-driven", "changes", "archive"]);
var EXCLUDED_MAPPING_SPEC_BASENAMES = new Set(["INDEX.yaml"]);
function makeMappingDiagnostic(source, artifactPath, fieldPath, message, expected, actual) {
  return { source, artifactPath, fieldPath, message, expected, actual };
}
function normalizeMappedPath(rootDir, artifactPath, field, index, rawPath, diagnostics) {
  const fieldPath = `$.mapping.${field}[${index}]`;
  if (typeof rawPath !== "string" || rawPath.trim().length === 0) {
    diagnostics.push(makeMappingDiagnostic("mapping_coverage", artifactPath, fieldPath, "mapping entry must be a non-empty string", "non-empty repo-relative path", String(rawPath)));
    return null;
  }
  const normalizedInput = rawPath.trim().replaceAll("\\", "/");
  if (path28.isAbsolute(normalizedInput)) {
    diagnostics.push(makeMappingDiagnostic("mapping_coverage", artifactPath, fieldPath, "mapping entry must be repo-relative", "repo-relative path", normalizedInput));
    return null;
  }
  const resolved = path28.resolve(rootDir, normalizedInput);
  const repoRelative = normalizeRepoRelativePath4(rootDir, resolved);
  if (repoRelative === ".." || repoRelative.startsWith("../")) {
    diagnostics.push(makeMappingDiagnostic("mapping_coverage", artifactPath, fieldPath, "mapping entry cannot traverse outside repository", "path inside repository", normalizedInput));
    return null;
  }
  if (repoRelative !== normalizedInput) {
    diagnostics.push(makeMappingDiagnostic("mapping_coverage", artifactPath, fieldPath, "mapping entry must be normalized repo-relative path", repoRelative, normalizedInput));
    return null;
  }
  if (!existsSync27(path28.join(rootDir, repoRelative))) {
    diagnostics.push(makeMappingDiagnostic("mapping_coverage", artifactPath, fieldPath, "mapping entry points to a file that does not exist", "existing file path", normalizedInput));
    return null;
  }
  return repoRelative;
}
function parseSpecMapping(rootDir, specPath, diagnostics) {
  const artifactPath = normalizeRepoRelativePath4(rootDir, specPath);
  const content = readFileSync21(specPath, "utf8");
  let doc;
  try {
    doc = parseYamlDocument(content, { source: artifactPath });
  } catch (error) {
    const yamlDetails = getYamlParseDetails(error);
    const yamlDiagnosticDetails = getYamlDiagnosticDetails(error);
    diagnostics.push({
      ...makeMappingDiagnostic("mapping_coverage", artifactPath, "$.mapping", "spec file is not valid YAML", "parseable YAML mapping", yamlDetails ? formatYamlParseSummary(yamlDetails) : error instanceof Error ? error.message : String(error)),
      ...yamlDiagnosticDetails
    });
    return null;
  }
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    diagnostics.push(makeMappingDiagnostic("mapping_coverage", artifactPath, "$.mapping", "spec file must contain a YAML mapping", "YAML mapping"));
    return null;
  }
  const mappingValue = doc.mapping;
  if (!mappingValue || typeof mappingValue !== "object" || Array.isArray(mappingValue)) {
    diagnostics.push(makeMappingDiagnostic("mapping_coverage", artifactPath, "$.mapping", "spec must define mapping.implementation and mapping.tests arrays", "mapping object"));
    return null;
  }
  const mapping = mappingValue;
  const normalized = {
    implementation: [],
    tests: []
  };
  for (const field of ["implementation", "tests"]) {
    const value = mapping[field];
    const fieldPath = `$.mapping.${field}`;
    if (!Array.isArray(value)) {
      diagnostics.push(makeMappingDiagnostic("mapping_coverage", artifactPath, fieldPath, `mapping.${field} must be an array`, "array of repo-relative paths", String(value)));
      continue;
    }
    if (value.length === 0) {
      diagnostics.push(makeMappingDiagnostic("mapping_coverage", artifactPath, fieldPath, `mapping.${field} must contain at least one mapped path`, "non-empty array", "[]"));
      continue;
    }
    value.forEach((entry, index) => {
      const mappedPath = normalizeMappedPath(rootDir, artifactPath, field, index, entry, diagnostics);
      if (mappedPath) {
        normalized[field].push(mappedPath);
      }
    });
  }
  return normalized;
}
function collectEvidenceCandidates(rootDir) {
  const implementation = listFilesRecursive(path28.join(rootDir, "src")).filter((file) => file.endsWith(".ts")).map((file) => normalizeRepoRelativePath4(rootDir, file));
  for (const file of ["package.json", "tsconfig.json"]) {
    if (existsSync27(path28.join(rootDir, file))) {
      implementation.push(file);
    }
  }
  const tests = listFilesRecursive(path28.join(rootDir, "test")).filter((file) => file.endsWith(".ts")).map((file) => normalizeRepoRelativePath4(rootDir, file));
  const dedupeSort = (values2) => [...new Set(values2.map((value) => normalizePathSeparators(value)))].sort();
  return {
    implementation: dedupeSort(implementation),
    tests: dedupeSort(tests)
  };
}
function sortMappingDiagnostics(diagnostics) {
  return diagnostics.sort((left, right) => {
    const leftKey = [
      left.source,
      left.artifactPath,
      left.fieldPath,
      left.message,
      left.expected ?? "",
      left.actual ?? ""
    ].join("|");
    const rightKey = [
      right.source,
      right.artifactPath,
      right.fieldPath,
      right.message,
      right.expected ?? "",
      right.actual ?? ""
    ].join("|");
    return leftKey.localeCompare(rightKey);
  });
}
function verifySpecMappings(rootDir) {
  const diagnostics = [];
  const specsDir = path28.join(rootDir, STRICT_SPECS_DIR);
  const mapped = {
    implementation: new Set,
    tests: new Set
  };
  if (!existsSync27(specsDir) || !statSync20(specsDir).isDirectory()) {
    diagnostics.push(makeMappingDiagnostic("mapping_input", STRICT_SPECS_DIR, "$", "spec mapping inputs are unavailable because .strict-spec-driven/specs/ does not exist", "existing .strict-spec-driven/specs/ directory"));
  }
  if (diagnostics.length === 0) {
    for (const entry of readdirSync12(specsDir, { withFileTypes: true })) {
      if (entry.isDirectory() && FORBIDDEN_SPEC_SUBDIRS3.has(entry.name)) {
        diagnostics.push(makeMappingDiagnostic("mapping_input", path28.join(STRICT_SPECS_DIR, entry.name), "$", `.strict-spec-driven/specs/ must not contain a '${entry.name}' subdirectory; workflow state directories belong under .strict-spec-driven/ directly`, `no '${entry.name}' subdirectory under .strict-spec-driven/specs/`, `found .strict-spec-driven/specs/${entry.name}/`));
      }
    }
  }
  const specFiles = diagnostics.length === 0 ? listFilesRecursive(specsDir).filter((filePath) => {
    const basename = path28.basename(filePath);
    return basename.endsWith(".yaml") && !EXCLUDED_MAPPING_SPEC_BASENAMES.has(basename);
  }) : [];
  if (diagnostics.length === 0 && specFiles.length === 0) {
    diagnostics.push(makeMappingDiagnostic("mapping_input", STRICT_SPECS_DIR, "$", "spec mapping inputs are unavailable because no main spec files were found", "at least one main spec YAML file"));
  }
  for (const specFile of specFiles) {
    const mapping = parseSpecMapping(rootDir, specFile, diagnostics);
    if (!mapping) {
      continue;
    }
    mapping.implementation.forEach((value) => mapped.implementation.add(value));
    mapping.tests.forEach((value) => mapped.tests.add(value));
  }
  let evidenceCandidates = { implementation: [], tests: [] };
  let unmappedImplementation = [];
  let unmappedTests = [];
  const hasInputErrors = diagnostics.some((diagnostic) => diagnostic.source === "mapping_input");
  if (!hasInputErrors) {
    evidenceCandidates = collectEvidenceCandidates(rootDir);
    unmappedImplementation = evidenceCandidates.implementation.filter((file) => !mapped.implementation.has(file));
    unmappedTests = evidenceCandidates.tests.filter((file) => !mapped.tests.has(file));
    for (const unmappedPath of unmappedImplementation) {
      diagnostics.push(makeMappingDiagnostic("unmapped_evidence", unmappedPath, "$", "implementation file is not referenced by any spec mapping", "mapped by at least one spec mapping.implementation entry", "unmapped"));
    }
    for (const unmappedPath of unmappedTests) {
      diagnostics.push(makeMappingDiagnostic("unmapped_evidence", unmappedPath, "$", "test file is not referenced by any spec mapping", "mapped by at least one spec mapping.tests entry", "unmapped"));
    }
  }
  return {
    valid: diagnostics.length === 0,
    diagnostics: sortMappingDiagnostics(diagnostics),
    summary: {
      specCount: specFiles.length,
      mappedImplementationCount: mapped.implementation.size,
      mappedTestCount: mapped.tests.size,
      candidateImplementationCount: evidenceCandidates.implementation.length,
      candidateTestCount: evidenceCandidates.tests.length,
      unmappedImplementationCount: unmappedImplementation.length,
      unmappedTestCount: unmappedTests.length
    }
  };
}

// src/cli/cmd-operations.ts
function runShip(argv) {
  const [target, ...extraArgs] = argv;
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven ship <change-name>
`);
    return 0;
  }
  if (!target || extraArgs.length > 0) {
    writeUsage(`Usage: strict-spec-driven ship <change-name>
`);
    return 1;
  }
  const rootDir = process.cwd();
  const archiveRoot = getArchiveDir(rootDir);
  let resolvedArchiveName = null;
  const exactDir = path29.join(archiveRoot, target);
  if (existsSync28(exactDir) && statSync21(exactDir).isDirectory()) {
    resolvedArchiveName = target;
  } else {
    const bareMatches = findArchivedMatchesByBareName(rootDir, target);
    if (bareMatches.length > 1) {
      writeError(`ambiguous archived change name '${target}'; matched: ${bareMatches.join(", ")}`);
      writeErr(`Specify the full archive directory name to disambiguate.
`);
      return 1;
    }
    if (bareMatches.length === 1) {
      resolvedArchiveName = bareMatches[0];
    }
  }
  if (!resolvedArchiveName) {
    writeError(`archived change '${target}' not found`);
    return 1;
  }
  const resolvedArchiveDir = path29.join(archiveRoot, resolvedArchiveName);
  const archivePath = normalizeRepoRelativePath4(rootDir, resolvedArchiveDir);
  let proposalSummary = "";
  const proposalPath = path29.join(resolvedArchiveDir, "proposal.yaml");
  if (existsSync28(proposalPath)) {
    try {
      const proposalDoc = parseYamlDocument(readFileSync22(proposalPath, "utf8"));
      const summary = proposalDoc.summary;
      if (summary && typeof summary === "object" && !Array.isArray(summary)) {
        const what = summary.what;
        if (Array.isArray(what)) {
          proposalSummary = what.filter((item) => typeof item === "string").join(" ");
        } else if (typeof what === "string") {
          proposalSummary = what;
        }
      }
    } catch {}
  }
  const roadmapSnapshot = getRoadmapStatus(rootDir);
  const result = {
    changeName: resolvedArchiveName,
    archivePath,
    proposalSummary,
    roadmapSnapshot
  };
  writeJson(result);
  return 0;
}
function runValidateSkills(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven validate-skills
`);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(`Usage: strict-spec-driven validate-skills
`);
    return 1;
  }
  const result = validateStrictSkillPackaging(process.cwd());
  writeJson(result);
  return result.valid ? 0 : 1;
}
function runVerifySpecMappings(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven verify-spec-mappings
`);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(`Usage: strict-spec-driven verify-spec-mappings
`);
    return 1;
  }
  const result = verifySpecMappings(process.cwd());
  writeJson(result);
  return result.valid ? 0 : 1;
}
var ARCHIVE_DATE_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)$/;
function runCommitAndPush(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven commit-and-push
`);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(`Usage: strict-spec-driven commit-and-push
`);
    return 1;
  }
  const rootDir = process.cwd();
  const archived = listArchivedChanges(rootDir);
  if (archived.length === 0) {
    writeError("no archived changes found under .strict-spec-driven/changes/archive/");
    return 1;
  }
  const dated = archived.map((name) => {
    const match = ARCHIVE_DATE_PATTERN.exec(name);
    return match ? { dirName: name, date: match[1], bareName: match[2] } : null;
  }).filter((entry) => entry !== null).sort((a, b) => b.date.localeCompare(a.date) || b.dirName.localeCompare(a.dirName));
  if (dated.length === 0) {
    writeError("no date-prefixed archived changes found under .strict-spec-driven/changes/archive/");
    return 1;
  }
  const latest = dated[0];
  const commitMessage = `feat: ${latest.bareName}`;
  try {
    execSync("git add .", { cwd: rootDir, stdio: "pipe" });
  } catch (e) {
    writeError(`git add failed: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
  try {
    execSync(`git commit -m ${JSON.stringify(commitMessage)}`, { cwd: rootDir, stdio: "pipe" });
  } catch (e) {
    const output = e instanceof Error && "stdout" in e ? String(e.stdout) : "";
    if (output.includes("nothing to commit")) {
      writeError("nothing to commit, working tree clean");
      return 1;
    }
    writeError(`git commit failed: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
  try {
    execSync("git push", { cwd: rootDir, stdio: "pipe" });
  } catch (e) {
    writeJson({ changeName: latest.bareName, archiveDir: latest.dirName, commitMessage, pushed: false, pushError: e instanceof Error ? e.message : String(e) });
    return 1;
  }
  writeJson({ changeName: latest.bareName, archiveDir: latest.dirName, commitMessage, pushed: true });
  return 0;
}

// src/cli/cmd-templates.ts
function normalizeTemplateKey(key) {
  return key.startsWith("strict-spec-driven/") ? key : `strict-spec-driven/${key}`;
}
function normalizeSchemaKey(name) {
  if (name.startsWith("strict-spec-driven/schemas/"))
    return name;
  if (name.startsWith("schemas/"))
    return `strict-spec-driven/${name}`;
  return `strict-spec-driven/schemas/${name.endsWith(".yaml") ? name : `${name}.yaml`}`;
}
function listKeys(prefix) {
  const keys = getEmbeddedTemplateKeys().filter((key) => key.startsWith(prefix));
  writeOut(keys.join(`
`) + (keys.length > 0 ? `
` : ""));
  return 0;
}
function showKey(key, usage2) {
  const content = readEmbeddedTemplate(key);
  if (content === undefined) {
    writeError(`embedded template asset '${key}' not found`);
    writeUsage(usage2);
    return 1;
  }
  writeOut(content);
  return 0;
}
function runTemplateList(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven template-list
`);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(`Usage: strict-spec-driven template-list
`);
    return 1;
  }
  return listKeys("strict-spec-driven/");
}
function runTemplateShow(argv) {
  const [key, ...extraArgs] = argv;
  const usage2 = `Usage: strict-spec-driven template-show <template-key>
`;
  if (isHelpRequest(argv)) {
    writeHelp(usage2);
    return 0;
  }
  if (!key || extraArgs.length > 0) {
    writeUsage(usage2);
    return 1;
  }
  return showKey(normalizeTemplateKey(key), usage2);
}
function runSchemaList(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(`Usage: strict-spec-driven schema-list
`);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(`Usage: strict-spec-driven schema-list
`);
    return 1;
  }
  return listKeys("strict-spec-driven/schemas/");
}
function runSchemaShow(argv) {
  const [name, ...extraArgs] = argv;
  const usage2 = `Usage: strict-spec-driven schema-show <schema-name|schema-key>
`;
  if (isHelpRequest(argv)) {
    writeHelp(usage2);
    return 0;
  }
  if (!name || extraArgs.length > 0) {
    writeUsage(usage2);
    return 1;
  }
  return showKey(normalizeSchemaKey(name), usage2);
}

// src/dev-session.ts
import { closeSync, existsSync as existsSync29, mkdirSync as mkdirSync6, openSync, readFileSync as readFileSync23, rmSync as rmSync2, writeFileSync as writeFileSync9 } from "fs";
import { spawn, spawnSync } from "child_process";
import path30 from "path";
var DEV_SESSION_DECLARATION_PATH = ".strict-spec-driven/dev-session.yaml";
var DEV_SESSION_RUNTIME_DIR = ".strict-spec-driven/.runtime/dev-session";
var DEV_SESSION_RUNTIME_STATE_PATH = `${DEV_SESSION_RUNTIME_DIR}/state.json`;
var DEV_SESSION_LOGS_DIR = `${DEV_SESSION_RUNTIME_DIR}/logs`;
var SLEEP_SIGNAL = new Int32Array(new SharedArrayBuffer(4));

class DevSessionDeclarationNotFoundError extends Error {
  artifactPath;
  constructor(artifactPath) {
    super(`dev-session declaration not found at ${artifactPath}`);
    this.name = "DevSessionDeclarationNotFoundError";
    this.artifactPath = artifactPath;
  }
}

class DevSessionDeclarationValidationError extends Error {
  artifactPath;
  diagnostics;
  constructor(artifactPath, diagnostics) {
    super(`dev-session declaration is invalid at ${artifactPath}`);
    this.name = "DevSessionDeclarationValidationError";
    this.artifactPath = artifactPath;
    this.diagnostics = diagnostics;
  }
}
function sortEntries(record) {
  return Object.entries(record).sort(([left], [right]) => left.localeCompare(right));
}
function getRuntimePaths(rootDir) {
  const absoluteRuntimeDir = path30.join(rootDir, DEV_SESSION_RUNTIME_DIR);
  const absoluteLogsDir = path30.join(rootDir, DEV_SESSION_LOGS_DIR);
  const absoluteStatePath = path30.join(rootDir, DEV_SESSION_RUNTIME_STATE_PATH);
  return {
    absoluteRuntimeDir,
    absoluteLogsDir,
    absoluteStatePath,
    relativeStatePath: normalizeRepoRelativePath4(rootDir, absoluteStatePath)
  };
}
function ensureRuntimeDirectories(rootDir) {
  const runtimePaths = getRuntimePaths(rootDir);
  mkdirSync6(runtimePaths.absoluteLogsDir, { recursive: true });
  return runtimePaths;
}
function sleepSync(milliseconds) {
  if (milliseconds <= 0) {
    return;
  }
  Atomics.wait(SLEEP_SIGNAL, 0, 0, milliseconds);
}
function isProcessAlive(pid) {
  if (pid === null) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ESRCH") {
      return false;
    }
    return true;
  }
}
function createLifecycleDiagnostic(artifactPath, fieldPath, message, options) {
  return {
    source: options?.source ?? "dev_session",
    artifactPath,
    fieldPath,
    message,
    expected: options?.expected,
    actual: options?.actual,
    serviceId: options?.serviceId,
    phase: options?.phase
  };
}
function createRuntimeRecord(service, logPath, pid) {
  return {
    serviceId: service.id,
    description: service.description,
    command: service.command,
    workingDirectory: service.workingDirectory,
    environment: {
      required: [...service.environment.required],
      optional: [...service.environment.optional]
    },
    urls: [...service.urls],
    ports: [...service.ports],
    readiness: {
      type: service.readiness.type,
      url: service.readiness.url,
      port: service.readiness.port,
      timeoutSeconds: service.readiness.timeoutSeconds,
      intervalSeconds: service.readiness.intervalSeconds,
      notes: [...service.readiness.notes]
    },
    browserTargets: [...service.browserTargets],
    cleanup: {
      mode: service.cleanup.mode,
      signal: service.cleanup.signal,
      command: service.cleanup.command,
      gracePeriodSeconds: service.cleanup.gracePeriodSeconds
    },
    unavailableConditions: [...service.unavailableConditions],
    pid,
    logPath,
    status: "running",
    startedAt: new Date().toISOString()
  };
}
function getOrderedServiceIds(state) {
  const seen = new Set(state.serviceOrder);
  const remaining = Object.keys(state.services).filter((serviceId) => !seen.has(serviceId)).sort((left, right) => left.localeCompare(right));
  return [...state.serviceOrder, ...remaining];
}
function deriveServiceSnapshot(record) {
  const alive = isProcessAlive(record.pid);
  if (record.status === "failed") {
    return {
      id: record.serviceId,
      status: "failed",
      pid: record.pid,
      logPath: record.logPath,
      urls: [...record.urls],
      ports: [...record.ports],
      message: record.failureReason
    };
  }
  if (record.status === "stopped") {
    return {
      id: record.serviceId,
      status: alive ? "running" : "stopped",
      pid: record.pid,
      logPath: record.logPath,
      urls: [...record.urls],
      ports: [...record.ports],
      message: alive ? "managed process is still live despite a stopped record" : undefined
    };
  }
  return {
    id: record.serviceId,
    status: alive ? "running" : "stale",
    pid: record.pid,
    logPath: record.logPath,
    urls: [...record.urls],
    ports: [...record.ports],
    message: alive ? undefined : "managed process record is stale"
  };
}
function summarizeRuntimeState(state) {
  return getOrderedServiceIds(state).map((serviceId) => state.services[serviceId]).filter((record) => record !== undefined).map((record) => deriveServiceSnapshot(record));
}
function readRuntimeState(rootDir) {
  const runtimePaths = getRuntimePaths(rootDir);
  if (!existsSync29(runtimePaths.absoluteStatePath)) {
    return { ok: true, state: null };
  }
  try {
    const raw = JSON.parse(readFileSync23(runtimePaths.absoluteStatePath, "utf8"));
    if (typeof raw !== "object" || raw === null || raw.version !== 1 || typeof raw.artifactPath !== "string" || typeof raw.sessionId !== "string" || !Array.isArray(raw.serviceOrder) || typeof raw.services !== "object" || raw.services === null) {
      return {
        ok: false,
        diagnostic: createLifecycleDiagnostic(DEV_SESSION_DECLARATION_PATH, "$", "dev-session runtime state is malformed", {
          source: "runtime_state",
          phase: "runtime_state",
          expected: "versioned runtime-state object",
          actual: "invalid-json-shape"
        })
      };
    }
    return { ok: true, state: raw };
  } catch (error) {
    return {
      ok: false,
      diagnostic: createLifecycleDiagnostic(DEV_SESSION_DECLARATION_PATH, "$", "dev-session runtime state is not valid JSON", {
        source: "runtime_state",
        phase: "runtime_state",
        actual: error instanceof Error ? error.message : String(error)
      })
    };
  }
}
function writeRuntimeState(rootDir, state) {
  const runtimePaths = ensureRuntimeDirectories(rootDir);
  writeFileSync9(runtimePaths.absoluteStatePath, JSON.stringify(state, null, 2) + `
`, "utf8");
}
function clearRuntimeState(rootDir) {
  rmSync2(getRuntimePaths(rootDir).absoluteRuntimeDir, { recursive: true, force: true });
}
function getMissingRequiredEnvironment(service) {
  return service.environment.required.filter((name) => !(name in process.env));
}
function runHttpReadinessCheck(url) {
  const script = [
    "const http = require('http');",
    "const https = require('https');",
    "const target = new URL(process.argv[1]);",
    "const client = target.protocol === 'https:' ? https : http;",
    "const req = client.request(target, { method: 'GET' }, (res) => {",
    "  const status = typeof res.statusCode === 'number' ? res.statusCode : 0;",
    "  process.exit(status >= 200 && status < 400 ? 0 : 1);",
    "});",
    "req.on('error', () => process.exit(1));",
    "req.end();"
  ].join("");
  const result = spawnSync(process.execPath, ["-e", script, url], { stdio: "ignore" });
  return result.status === 0;
}
function runTcpReadinessCheck(port) {
  const script = [
    "const net = require('net');",
    "const socket = net.createConnection({ host: '127.0.0.1', port: Number(process.argv[1]) }, () => {",
    "  socket.end();",
    "  process.exit(0);",
    "});",
    "socket.on('error', () => process.exit(1));"
  ].join("");
  const result = spawnSync(process.execPath, ["-e", script, String(port)], { stdio: "ignore" });
  return result.status === 0;
}
function canProbeHttpUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
function isBrowserTrialTargetAvailable(service, target) {
  if (service?.readiness.type === "http") {
    return service.readiness.url !== undefined && runHttpReadinessCheck(service.readiness.url);
  }
  if (service?.readiness.type === "tcp") {
    return service.readiness.port !== undefined && runTcpReadinessCheck(service.readiness.port);
  }
  return canProbeHttpUrl(target.url) && runHttpReadinessCheck(target.url);
}
function deriveBrowserTrialTarget(plan, target, runtimeState) {
  const service = target.service === undefined ? undefined : plan.session.services.find((candidate) => candidate.id === target.service);
  const managedRecord = service !== undefined && runtimeState !== null ? runtimeState.services[service.id] : undefined;
  const managedSnapshot = managedRecord === undefined ? undefined : deriveServiceSnapshot(managedRecord);
  const provenance = managedSnapshot !== undefined ? "started_by_strict" : isBrowserTrialTargetAvailable(service, target) ? "already_available" : "unavailable";
  return {
    id: target.id,
    url: target.url,
    smokePaths: [...target.smokePaths],
    evidenceLabels: [...target.evidenceLabels],
    localOnly: target.localOnly,
    service: target.service,
    notes: [...target.notes],
    provenance,
    trialReady: provenance === "started_by_strict" ? managedSnapshot?.status === "running" : provenance === "already_available",
    managedServiceStatus: managedSnapshot?.status
  };
}
function waitForReadiness(record) {
  if (record.readiness.type === "manual") {
    return { ok: true };
  }
  const deadline = Date.now() + record.readiness.timeoutSeconds * 1000;
  const intervalMs = Math.max(1, record.readiness.intervalSeconds) * 1000;
  while (Date.now() <= deadline) {
    if (!isProcessAlive(record.pid)) {
      return { ok: false, message: "service exited before readiness checks succeeded" };
    }
    const ready = record.readiness.type === "http" ? record.readiness.url !== undefined && runHttpReadinessCheck(record.readiness.url) : record.readiness.port !== undefined && runTcpReadinessCheck(record.readiness.port);
    if (ready) {
      return { ok: true };
    }
    sleepSync(Math.min(intervalMs, Math.max(0, deadline - Date.now())));
  }
  return {
    ok: false,
    message: `service did not satisfy ${record.readiness.type} readiness within ${record.readiness.timeoutSeconds} seconds`
  };
}
function stopServiceProcess(rootDir, record) {
  const live = isProcessAlive(record.pid);
  if (!live) {
    return record.status === "stopped" ? { status: "stopped" } : record.status === "failed" ? { status: "failed", message: record.failureReason } : { status: "stale", message: "managed process record is stale" };
  }
  if (record.cleanup.mode === "none") {
    return {
      status: "failed",
      message: "cleanup mode 'none' does not define how to stop a running managed process"
    };
  }
  if (record.cleanup.mode === "command") {
    const workingDirectory = path30.join(rootDir, record.workingDirectory);
    const result = spawnSync(record.cleanup.command ?? "", [], {
      cwd: workingDirectory,
      env: process.env,
      shell: true,
      encoding: "utf8"
    });
    if (result.status !== 0) {
      const details = result.stderr.trim() || result.stdout.trim();
      return {
        status: "failed",
        message: details.length > 0 ? `cleanup command failed: ${details}` : "cleanup command failed"
      };
    }
  } else {
    try {
      process.kill(record.pid ?? 0, record.cleanup.signal ?? "SIGTERM");
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ESRCH") {
        return { status: "stale", message: "managed process record is stale" };
      }
      return {
        status: "failed",
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }
  const deadline = Date.now() + record.cleanup.gracePeriodSeconds * 1000;
  while (Date.now() <= deadline) {
    if (!isProcessAlive(record.pid)) {
      return { status: "stopped" };
    }
    sleepSync(Math.min(250, Math.max(0, deadline - Date.now())));
  }
  return {
    status: "failed",
    message: "managed process did not stop within the configured grace period"
  };
}
function stopStartedServices(rootDir, state, serviceIds, failedServiceId, failureReason) {
  for (const serviceId of [...serviceIds].reverse()) {
    const record = state.services[serviceId];
    if (record === undefined) {
      continue;
    }
    const outcome = stopServiceProcess(rootDir, record);
    if (serviceId === failedServiceId) {
      record.status = "failed";
      record.failureReason = failureReason ?? outcome.message ?? record.failureReason;
      continue;
    }
    if (outcome.status === "stopped") {
      record.status = "stopped";
      delete record.failureReason;
      continue;
    }
    if (outcome.status === "failed") {
      record.status = "failed";
      record.failureReason = outcome.message;
      continue;
    }
  }
}
function createPlanFailureResult(rootDir, planResult) {
  return {
    ok: false,
    artifactPath: planResult.artifactPath,
    runtimeStatePath: getRuntimePaths(rootDir).relativeStatePath,
    services: [],
    diagnostics: planResult.diagnostics.map((diagnostic) => ({
      ...diagnostic,
      phase: "declaration"
    }))
  };
}
function createRuntimeStateConflictDiagnostics(artifactPath, state) {
  return summarizeRuntimeState(state).filter((service) => service.status === "running").map((service) => createLifecycleDiagnostic(artifactPath, "$", "dev-session-start found existing managed runtime state for a still-running service", {
    source: "runtime_state",
    phase: "runtime_state",
    serviceId: service.id,
    actual: service.id
  }));
}
function deriveDevSessionPlan(rootDir) {
  const absolutePath = path30.join(rootDir, DEV_SESSION_DECLARATION_PATH);
  const artifactPath = normalizeRepoRelativePath4(rootDir, absolutePath);
  if (!existsSync29(absolutePath)) {
    throw new DevSessionDeclarationNotFoundError(artifactPath);
  }
  const artifact = parseYamlFile(absolutePath);
  const schema2 = loadBundledSchemaByArtifactType("dev_session");
  const validation = validateArtifact(schema2, artifact, artifactPath);
  if (!validation.valid) {
    throw new DevSessionDeclarationValidationError(artifactPath, validation.diagnostics);
  }
  return {
    artifactPath,
    session: {
      id: artifact.session.id,
      description: artifact.session.description,
      services: sortEntries(artifact.session.services).map(([id, service]) => ({
        id,
        description: service.description,
        command: service.command,
        workingDirectory: service.working_directory,
        environment: {
          required: [...service.environment.required ?? []],
          optional: [...service.environment.optional ?? []]
        },
        urls: [...service.urls],
        ports: [...service.ports],
        readiness: {
          type: service.readiness.type,
          url: service.readiness.url,
          port: service.readiness.port,
          timeoutSeconds: service.readiness.timeout_seconds,
          intervalSeconds: service.readiness.interval_seconds,
          notes: [...service.readiness.notes ?? []]
        },
        browserTargets: [...service.browser_targets],
        cleanup: {
          mode: service.cleanup.mode,
          signal: service.cleanup.signal,
          command: service.cleanup.command,
          gracePeriodSeconds: service.cleanup.grace_period_seconds
        },
        unavailableConditions: [...service.unavailable_conditions]
      })),
      browserTargets: sortEntries(artifact.session.browser_targets).map(([id, target]) => ({
        id,
        url: target.url,
        smokePaths: [...target.smoke_paths],
        evidenceLabels: [...target.evidence_labels],
        localOnly: target.local_only,
        service: target.service,
        notes: [...target.notes ?? []]
      }))
    }
  };
}
function getDevSessionPlanResult(rootDir) {
  const absolutePath = path30.join(rootDir, DEV_SESSION_DECLARATION_PATH);
  const artifactPath = normalizeRepoRelativePath4(rootDir, absolutePath);
  try {
    const plan = deriveDevSessionPlan(rootDir);
    return {
      valid: true,
      artifactPath: plan.artifactPath,
      diagnostics: [],
      session: plan.session
    };
  } catch (error) {
    if (error instanceof DevSessionDeclarationNotFoundError) {
      return {
        valid: false,
        artifactPath,
        diagnostics: [{
          source: "filesystem",
          artifactPath,
          fieldPath: "$",
          message: "dev-session declaration file is missing",
          expected: DEV_SESSION_DECLARATION_PATH,
          actual: "missing"
        }]
      };
    }
    if (error instanceof DevSessionDeclarationValidationError) {
      return {
        valid: false,
        artifactPath,
        diagnostics: error.diagnostics
      };
    }
    return {
      valid: false,
      artifactPath,
      diagnostics: [{
        source: "yaml_parse",
        artifactPath,
        fieldPath: "$",
        message: "dev-session declaration is not parseable YAML",
        expected: "parseable YAML mapping",
        actual: formatYamlParseSummary(error),
        ...getYamlDiagnosticDetails(error) ?? {}
      }]
    };
  }
}
function startDevSession(rootDir) {
  const runtimePaths = getRuntimePaths(rootDir);
  const planResult = getDevSessionPlanResult(rootDir);
  if (!planResult.valid) {
    return createPlanFailureResult(rootDir, planResult);
  }
  const runtimeState = readRuntimeState(rootDir);
  if (!runtimeState.ok) {
    return {
      ok: false,
      artifactPath: planResult.artifactPath,
      runtimeStatePath: runtimePaths.relativeStatePath,
      sessionId: planResult.session.id,
      services: [],
      diagnostics: [runtimeState.diagnostic]
    };
  }
  if (runtimeState.state !== null) {
    const conflicts = createRuntimeStateConflictDiagnostics(planResult.artifactPath, runtimeState.state);
    if (conflicts.length > 0) {
      return {
        ok: false,
        artifactPath: planResult.artifactPath,
        runtimeStatePath: runtimePaths.relativeStatePath,
        sessionId: planResult.session.id,
        services: summarizeRuntimeState(runtimeState.state),
        diagnostics: conflicts
      };
    }
  }
  clearRuntimeState(rootDir);
  const writableRuntimePaths = ensureRuntimeDirectories(rootDir);
  const state = {
    version: 1,
    artifactPath: planResult.artifactPath,
    runtimeStatePath: writableRuntimePaths.relativeStatePath,
    sessionId: planResult.session.id,
    serviceOrder: planResult.session.services.map((service) => service.id),
    services: {}
  };
  const startedServiceIds = [];
  for (const service of planResult.session.services) {
    const logAbsolutePath = path30.join(writableRuntimePaths.absoluteLogsDir, `${service.id}.log`);
    const logPath = normalizeRepoRelativePath4(rootDir, logAbsolutePath);
    const missingEnvironment = getMissingRequiredEnvironment(service);
    if (missingEnvironment.length > 0) {
      const record2 = createRuntimeRecord(service, logPath, null);
      record2.status = "failed";
      record2.failureReason = `missing required environment variables: ${missingEnvironment.join(", ")}`;
      state.services[service.id] = record2;
      writeRuntimeState(rootDir, state);
      return {
        ok: false,
        artifactPath: planResult.artifactPath,
        runtimeStatePath: writableRuntimePaths.relativeStatePath,
        sessionId: planResult.session.id,
        services: summarizeRuntimeState(state),
        diagnostics: [
          createLifecycleDiagnostic(planResult.artifactPath, `$.session.services.${service.id}.environment.required`, "required environment variables are missing for dev-session-start", {
            source: "environment",
            phase: "environment",
            serviceId: service.id,
            expected: service.environment.required.join(", "),
            actual: missingEnvironment.join(", ")
          })
        ]
      };
    }
    writeFileSync9(logAbsolutePath, "", "utf8");
    const logDescriptor = openSync(logAbsolutePath, "a");
    const child = spawn(service.command, [], {
      cwd: path30.join(rootDir, service.workingDirectory),
      env: process.env,
      shell: true,
      detached: true,
      stdio: ["ignore", logDescriptor, logDescriptor]
    });
    closeSync(logDescriptor);
    child.unref();
    const record = createRuntimeRecord(service, logPath, typeof child.pid === "number" ? child.pid : null);
    state.services[service.id] = record;
    writeRuntimeState(rootDir, state);
    if (typeof child.pid !== "number") {
      record.status = "failed";
      record.failureReason = "service process did not provide a pid";
      writeRuntimeState(rootDir, state);
      return {
        ok: false,
        artifactPath: planResult.artifactPath,
        runtimeStatePath: writableRuntimePaths.relativeStatePath,
        sessionId: planResult.session.id,
        services: summarizeRuntimeState(state),
        diagnostics: [
          createLifecycleDiagnostic(planResult.artifactPath, `$.session.services.${service.id}.command`, "dev-session-start could not determine the managed process identifier", {
            source: "spawn",
            phase: "spawn",
            serviceId: service.id
          })
        ]
      };
    }
    const readiness = waitForReadiness(record);
    if (!readiness.ok) {
      record.status = "failed";
      record.failureReason = readiness.message;
      stopStartedServices(rootDir, state, [...startedServiceIds, service.id], service.id, readiness.message);
      writeRuntimeState(rootDir, state);
      return {
        ok: false,
        artifactPath: planResult.artifactPath,
        runtimeStatePath: writableRuntimePaths.relativeStatePath,
        sessionId: planResult.session.id,
        services: summarizeRuntimeState(state),
        diagnostics: [
          createLifecycleDiagnostic(planResult.artifactPath, `$.session.services.${service.id}.readiness`, readiness.message, {
            source: "readiness",
            phase: "readiness",
            serviceId: service.id
          })
        ]
      };
    }
    startedServiceIds.push(service.id);
    writeRuntimeState(rootDir, state);
  }
  return {
    ok: true,
    artifactPath: planResult.artifactPath,
    runtimeStatePath: writableRuntimePaths.relativeStatePath,
    sessionId: planResult.session.id,
    services: summarizeRuntimeState(state),
    diagnostics: []
  };
}
function getDevSessionStatus(rootDir) {
  const runtimePaths = getRuntimePaths(rootDir);
  const runtimeState = readRuntimeState(rootDir);
  if (!runtimeState.ok) {
    return {
      ok: false,
      artifactPath: DEV_SESSION_DECLARATION_PATH,
      runtimeStatePath: runtimePaths.relativeStatePath,
      services: [],
      diagnostics: [runtimeState.diagnostic]
    };
  }
  if (runtimeState.state === null) {
    return {
      ok: true,
      artifactPath: DEV_SESSION_DECLARATION_PATH,
      runtimeStatePath: runtimePaths.relativeStatePath,
      services: [],
      diagnostics: []
    };
  }
  return {
    ok: true,
    artifactPath: runtimeState.state.artifactPath,
    runtimeStatePath: runtimeState.state.runtimeStatePath,
    sessionId: runtimeState.state.sessionId,
    services: summarizeRuntimeState(runtimeState.state),
    diagnostics: []
  };
}
function getDevSessionLogs(rootDir, requestedServiceId) {
  const runtimePaths = getRuntimePaths(rootDir);
  const runtimeState = readRuntimeState(rootDir);
  if (!runtimeState.ok) {
    return {
      ok: false,
      artifactPath: DEV_SESSION_DECLARATION_PATH,
      runtimeStatePath: runtimePaths.relativeStatePath,
      diagnostics: [runtimeState.diagnostic]
    };
  }
  if (runtimeState.state === null) {
    return {
      ok: false,
      artifactPath: DEV_SESSION_DECLARATION_PATH,
      runtimeStatePath: runtimePaths.relativeStatePath,
      diagnostics: [
        createLifecycleDiagnostic(DEV_SESSION_DECLARATION_PATH, "$", "dev-session-logs requires runtime state created by dev-session-start", {
          source: "runtime_state",
          phase: "logs"
        })
      ]
    };
  }
  const serviceIds = getOrderedServiceIds(runtimeState.state);
  const serviceId = requestedServiceId ?? (serviceIds.length === 1 ? serviceIds[0] : undefined);
  if (serviceId === undefined) {
    return {
      ok: false,
      artifactPath: runtimeState.state.artifactPath,
      runtimeStatePath: runtimeState.state.runtimeStatePath,
      diagnostics: [
        createLifecycleDiagnostic(runtimeState.state.artifactPath, "$", "dev-session-logs requires a declared service id when multiple managed services exist", {
          source: "logs",
          phase: "logs",
          expected: serviceIds.join(", ")
        })
      ]
    };
  }
  const record = runtimeState.state.services[serviceId];
  if (record === undefined) {
    return {
      ok: false,
      artifactPath: runtimeState.state.artifactPath,
      runtimeStatePath: runtimeState.state.runtimeStatePath,
      diagnostics: [
        createLifecycleDiagnostic(runtimeState.state.artifactPath, "$", "dev-session-logs received an unknown declared service id", {
          source: "logs",
          phase: "logs",
          serviceId,
          expected: serviceIds.join(", "),
          actual: serviceId
        })
      ]
    };
  }
  const logAbsolutePath = path30.join(rootDir, record.logPath);
  if (!existsSync29(logAbsolutePath)) {
    return {
      ok: false,
      artifactPath: runtimeState.state.artifactPath,
      runtimeStatePath: runtimeState.state.runtimeStatePath,
      serviceId,
      logPath: record.logPath,
      diagnostics: [
        createLifecycleDiagnostic(runtimeState.state.artifactPath, "$", "dev-session-logs could not find the managed service log file", {
          source: "logs",
          phase: "logs",
          serviceId,
          expected: record.logPath,
          actual: "missing"
        })
      ]
    };
  }
  return {
    ok: true,
    artifactPath: runtimeState.state.artifactPath,
    runtimeStatePath: runtimeState.state.runtimeStatePath,
    serviceId,
    logPath: record.logPath,
    content: readFileSync23(logAbsolutePath, "utf8"),
    diagnostics: []
  };
}
function getDevSessionTrialResult(rootDir) {
  const runtimePaths = getRuntimePaths(rootDir);
  const planResult = getDevSessionPlanResult(rootDir);
  if (!planResult.valid) {
    return {
      ok: false,
      artifactPath: planResult.artifactPath,
      runtimeStatePath: runtimePaths.relativeStatePath,
      browserTargets: [],
      diagnostics: planResult.diagnostics.map((diagnostic) => ({
        ...diagnostic,
        phase: "declaration"
      }))
    };
  }
  const runtimeState = readRuntimeState(rootDir);
  if (!runtimeState.ok) {
    return {
      ok: false,
      artifactPath: planResult.artifactPath,
      runtimeStatePath: runtimePaths.relativeStatePath,
      sessionId: planResult.session.id,
      browserTargets: [],
      diagnostics: [runtimeState.diagnostic]
    };
  }
  return {
    ok: true,
    artifactPath: planResult.artifactPath,
    runtimeStatePath: runtimeState.state?.runtimeStatePath ?? runtimePaths.relativeStatePath,
    sessionId: planResult.session.id,
    browserTargets: planResult.session.browserTargets.map((target) => deriveBrowserTrialTarget(planResult, target, runtimeState.state)),
    diagnostics: []
  };
}
function stopDevSession(rootDir) {
  const runtimePaths = getRuntimePaths(rootDir);
  const runtimeState = readRuntimeState(rootDir);
  if (!runtimeState.ok) {
    return {
      ok: false,
      artifactPath: DEV_SESSION_DECLARATION_PATH,
      runtimeStatePath: runtimePaths.relativeStatePath,
      services: [],
      diagnostics: [runtimeState.diagnostic]
    };
  }
  if (runtimeState.state === null) {
    return {
      ok: true,
      artifactPath: DEV_SESSION_DECLARATION_PATH,
      runtimeStatePath: runtimePaths.relativeStatePath,
      services: [],
      diagnostics: []
    };
  }
  const diagnostics = [];
  for (const serviceId of [...getOrderedServiceIds(runtimeState.state)].reverse()) {
    const record = runtimeState.state.services[serviceId];
    if (record === undefined) {
      continue;
    }
    const wasAlreadyFailed = record.status === "failed" && !isProcessAlive(record.pid);
    const outcome = stopServiceProcess(rootDir, record);
    if (outcome.status === "stopped") {
      record.status = "stopped";
      delete record.failureReason;
      continue;
    }
    if (outcome.status === "failed") {
      record.status = "failed";
      record.failureReason = outcome.message;
      if (!wasAlreadyFailed) {
        diagnostics.push(createLifecycleDiagnostic(runtimeState.state.artifactPath, `$.session.services.${serviceId}.cleanup`, outcome.message ?? "managed service cleanup failed", {
          source: "cleanup",
          phase: "cleanup",
          serviceId
        }));
      }
    }
  }
  writeRuntimeState(rootDir, runtimeState.state);
  return {
    ok: diagnostics.length === 0,
    artifactPath: runtimeState.state.artifactPath,
    runtimeStatePath: runtimeState.state.runtimeStatePath,
    sessionId: runtimeState.state.sessionId,
    services: summarizeRuntimeState(runtimeState.state),
    diagnostics
  };
}

// src/cli/cmd-dev-session.ts
var DEV_SESSION_PLAN_USAGE = `Usage: strict-spec-driven dev-session-plan
`;
var DEV_SESSION_START_USAGE = `Usage: strict-spec-driven dev-session-start
`;
var DEV_SESSION_STATUS_USAGE = `Usage: strict-spec-driven dev-session-status
`;
var DEV_SESSION_LOGS_USAGE = `Usage: strict-spec-driven dev-session-logs [service-id]
`;
var DEV_SESSION_TRIAL_USAGE = `Usage: strict-spec-driven dev-session-trial
`;
var DEV_SESSION_STOP_USAGE = `Usage: strict-spec-driven dev-session-stop
`;
function runDevSessionPlan(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(DEV_SESSION_PLAN_USAGE);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(DEV_SESSION_PLAN_USAGE);
    return 1;
  }
  const result = getDevSessionPlanResult(process.cwd());
  writeJson(result);
  return result.valid ? 0 : 1;
}
function runDevSessionStart(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(DEV_SESSION_START_USAGE);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(DEV_SESSION_START_USAGE);
    return 1;
  }
  const result = startDevSession(process.cwd());
  writeJson(result);
  return result.ok ? 0 : 1;
}
function runDevSessionStatus(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(DEV_SESSION_STATUS_USAGE);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(DEV_SESSION_STATUS_USAGE);
    return 1;
  }
  const result = getDevSessionStatus(process.cwd());
  writeJson(result);
  return result.ok ? 0 : 1;
}
function runDevSessionLogs(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(DEV_SESSION_LOGS_USAGE);
    return 0;
  }
  if (argv.length > 1) {
    writeUsage(DEV_SESSION_LOGS_USAGE);
    return 1;
  }
  const result = getDevSessionLogs(process.cwd(), argv[0]);
  if (!result.ok) {
    writeJson(result);
    return 1;
  }
  writeOut(result.content ?? "");
  return 0;
}
function runDevSessionTrial(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(DEV_SESSION_TRIAL_USAGE);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(DEV_SESSION_TRIAL_USAGE);
    return 1;
  }
  const result = getDevSessionTrialResult(process.cwd());
  writeJson(result);
  return result.ok ? 0 : 1;
}
function runDevSessionStop(argv) {
  if (isHelpRequest(argv)) {
    writeHelp(DEV_SESSION_STOP_USAGE);
    return 0;
  }
  if (argv.length > 0) {
    writeUsage(DEV_SESSION_STOP_USAGE);
    return 1;
  }
  const result = stopDevSession(process.cwd());
  writeJson(result);
  return result.ok ? 0 : 1;
}

// src/debug-session.ts
import { existsSync as existsSync30, mkdirSync as mkdirSync7, renameSync as renameSync2, statSync as statSync22, writeFileSync as writeFileSync10 } from "fs";
import path31 from "path";
var DEBUG_SESSIONS_DIR = ".strict-spec-driven/debug-sessions";
var DEBUG_SESSION_ARCHIVE_DIR = `${DEBUG_SESSIONS_DIR}/archive`;
var DEBUG_SESSION_FILE_NAME = "session.yaml";
var DEBUG_SESSION_TEMPLATE_PATH = "debug-sessions/session.yaml";
var DEBUG_SESSION_ID_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
var TEMPLATE_SESSION_ID_PLACEHOLDER = "{{session_id}}";
function createDiagnostic(artifactPath, fieldPath, message, options) {
  return {
    source: options?.source ?? "filesystem",
    artifactPath,
    fieldPath,
    message,
    expected: options?.expected,
    actual: options?.actual
  };
}
function normalizeDebugSessionPath(rootDir, target) {
  const normalized = target.split("\\").join("/");
  const looksLikePath = normalized.includes("/") || normalized.endsWith(".yaml");
  const repoRelativePath = looksLikePath ? normalized : `${DEBUG_SESSIONS_DIR}/${normalized}/${DEBUG_SESSION_FILE_NAME}`;
  const absolutePath = path31.resolve(rootDir, repoRelativePath);
  return {
    artifactPath: normalizeRepoRelativePath4(rootDir, absolutePath),
    absolutePath
  };
}
function formatLocalDate2(date = new Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function buildDebugSessionArchiveDestination(rootDir, sessionId) {
  const archiveRoot = path31.join(rootDir, DEBUG_SESSION_ARCHIVE_DIR);
  mkdirSync7(archiveRoot, { recursive: true });
  const baseName = `${formatLocalDate2()}-${sessionId}`;
  let candidate = path31.join(archiveRoot, baseName);
  let sequence = 2;
  while (existsSync30(candidate)) {
    candidate = path31.join(archiveRoot, `${baseName}-${sequence}`);
    sequence += 1;
  }
  return candidate;
}
function isDirectory(filePath) {
  return existsSync30(filePath) && statSync22(filePath).isDirectory();
}
function yamlDiagnosticFromError(artifactPath, error) {
  const details = getYamlDiagnosticDetails(error);
  return {
    source: "yaml",
    artifactPath,
    fieldPath: "$",
    message: formatYamlParseSummary(error),
    actual: "invalid-yaml",
    errorType: details?.errorType,
    reason: details?.reason,
    line: details?.line,
    column: details?.column,
    snippet: details?.snippet,
    offendingCharacter: details?.offendingCharacter
  };
}
function createDebugSession(rootDir, sessionId) {
  const sessionDir = path31.join(rootDir, DEBUG_SESSIONS_DIR, sessionId);
  const sessionPath = path31.join(sessionDir, DEBUG_SESSION_FILE_NAME);
  const evidenceDir = path31.join(sessionDir, "evidence");
  const relativeSessionDir = normalizeRepoRelativePath4(rootDir, sessionDir);
  const relativeSessionPath = normalizeRepoRelativePath4(rootDir, sessionPath);
  const relativeEvidenceDir = normalizeRepoRelativePath4(rootDir, evidenceDir);
  if (!DEBUG_SESSION_ID_PATTERN.test(sessionId) || sessionId === "archive") {
    return {
      ok: false,
      sessionId,
      sessionDir: relativeSessionDir,
      sessionPath: relativeSessionPath,
      evidenceDir: relativeEvidenceDir,
      created: [],
      diagnostics: [
        createDiagnostic(relativeSessionPath, "$.debug_session.id", "debug-session id must be kebab-case and not reserved", {
          expected: "lowercase letters, numbers, hyphens, and not 'archive'",
          actual: sessionId
        })
      ]
    };
  }
  if (existsSync30(sessionPath) || existsSync30(evidenceDir)) {
    return {
      ok: false,
      sessionId,
      sessionDir: relativeSessionDir,
      sessionPath: relativeSessionPath,
      evidenceDir: relativeEvidenceDir,
      created: [],
      diagnostics: [
        createDiagnostic(relativeSessionPath, "$", "debug-session already exists", {
          expected: "new debug-session directory",
          actual: relativeSessionDir
        })
      ]
    };
  }
  mkdirSync7(evidenceDir, { recursive: true });
  const template = readBundledScaffoldTemplate(DEBUG_SESSION_TEMPLATE_PATH);
  writeFileSync10(sessionPath, template.replaceAll(TEMPLATE_SESSION_ID_PLACEHOLDER, sessionId), "utf8");
  return {
    ok: true,
    sessionId,
    sessionDir: relativeSessionDir,
    sessionPath: relativeSessionPath,
    evidenceDir: `${relativeEvidenceDir}/`,
    created: [relativeSessionPath, `${relativeEvidenceDir}/`],
    diagnostics: []
  };
}
function validateDebugSession(rootDir, target) {
  const { artifactPath, absolutePath } = normalizeDebugSessionPath(rootDir, target);
  if (!existsSync30(absolutePath)) {
    return {
      valid: false,
      artifactPath,
      diagnostics: [
        createDiagnostic(artifactPath, "$", "debug-session artifact not found", {
          expected: "session.yaml file",
          actual: "missing"
        })
      ]
    };
  }
  let artifact;
  try {
    artifact = parseYamlFile(absolutePath);
  } catch (error) {
    return {
      valid: false,
      artifactPath,
      diagnostics: [yamlDiagnosticFromError(artifactPath, error)]
    };
  }
  const schema2 = loadBundledSchemaByArtifactType("debug_session");
  const result = validateArtifact(schema2, artifact, artifactPath);
  return {
    valid: result.valid,
    artifactPath,
    diagnostics: result.diagnostics
  };
}
function archiveDebugSession(rootDir, target) {
  const { artifactPath, absolutePath } = normalizeDebugSessionPath(rootDir, target);
  const sourceDir = path31.dirname(absolutePath);
  const relativeSourceDir = normalizeRepoRelativePath4(rootDir, sourceDir);
  const missingResult = {
    ok: false,
    sessionId: null,
    sourceDir: relativeSourceDir,
    sourcePath: artifactPath,
    archiveDir: null,
    archivePath: null
  };
  if (!existsSync30(absolutePath)) {
    return {
      ...missingResult,
      diagnostics: [
        createDiagnostic(artifactPath, "$", "debug-session artifact not found", {
          expected: "session.yaml file",
          actual: "missing"
        })
      ]
    };
  }
  const activeRoot = path31.resolve(rootDir, DEBUG_SESSIONS_DIR);
  const sourceParent = path31.dirname(path31.resolve(sourceDir));
  if (path31.basename(absolutePath) !== DEBUG_SESSION_FILE_NAME || sourceParent !== activeRoot || !isDirectory(sourceDir)) {
    return {
      ...missingResult,
      diagnostics: [
        createDiagnostic(artifactPath, "$", "debug-session archive target must be an active session.yaml artifact", {
          expected: `${DEBUG_SESSIONS_DIR}/<session-id>/${DEBUG_SESSION_FILE_NAME}`,
          actual: artifactPath
        })
      ]
    };
  }
  const validation = validateDebugSession(rootDir, artifactPath);
  if (!validation.valid) {
    return {
      ...missingResult,
      diagnostics: validation.diagnostics
    };
  }
  let artifact;
  try {
    artifact = parseYamlFile(absolutePath);
  } catch (error) {
    return {
      ...missingResult,
      diagnostics: [yamlDiagnosticFromError(artifactPath, error)]
    };
  }
  const sessionId = artifact.debug_session?.id;
  const status = artifact.debug_session?.status;
  if (typeof sessionId !== "string" || sessionId.length === 0) {
    return {
      ...missingResult,
      diagnostics: [
        createDiagnostic(artifactPath, "$.debug_session.id", "debug-session artifact is missing a session id", {
          expected: "non-empty debug_session.id",
          actual: typeof sessionId
        })
      ]
    };
  }
  if (sessionId === "archive") {
    return {
      ...missingResult,
      sessionId,
      diagnostics: [
        createDiagnostic(artifactPath, "$.debug_session.id", "debug-session id is reserved for archived sessions", {
          expected: "non-reserved debug-session id",
          actual: sessionId
        })
      ]
    };
  }
  if (path31.basename(sourceDir) !== sessionId) {
    return {
      ...missingResult,
      sessionId,
      diagnostics: [
        createDiagnostic(artifactPath, "$.debug_session.id", "debug-session id must match its active directory name", {
          expected: path31.basename(sourceDir),
          actual: sessionId
        })
      ]
    };
  }
  if (status !== "resolved" && status !== "blocked") {
    return {
      ...missingResult,
      sessionId,
      diagnostics: [
        createDiagnostic(artifactPath, "$.debug_session.status", "debug-session must be resolved or blocked before archive", {
          expected: "resolved or blocked",
          actual: typeof status === "string" ? status : typeof status
        })
      ]
    };
  }
  const archiveDestination = buildDebugSessionArchiveDestination(rootDir, sessionId);
  const archivePath = path31.join(archiveDestination, DEBUG_SESSION_FILE_NAME);
  renameSync2(sourceDir, archiveDestination);
  return {
    ok: true,
    sessionId,
    sourceDir: relativeSourceDir,
    sourcePath: artifactPath,
    archiveDir: normalizeRepoRelativePath4(rootDir, archiveDestination),
    archivePath: normalizeRepoRelativePath4(rootDir, archivePath),
    diagnostics: []
  };
}

// src/cli/cmd-debug-session.ts
var DEBUG_SESSION_CREATE_USAGE = `Usage: strict-spec-driven debug-session-create <session-id>
`;
var DEBUG_SESSION_VALIDATE_USAGE = `Usage: strict-spec-driven debug-session-validate <session-id|session.yaml>
`;
var DEBUG_SESSION_ARCHIVE_USAGE = `Usage: strict-spec-driven debug-session-archive <session-id|session.yaml>
`;
function runDebugSessionCreate(argv) {
  const [sessionId, ...extraArgs] = argv;
  if (isHelpRequest(argv)) {
    writeHelp(DEBUG_SESSION_CREATE_USAGE);
    return 0;
  }
  if (!sessionId || extraArgs.length > 0) {
    writeUsage(DEBUG_SESSION_CREATE_USAGE);
    return 1;
  }
  if (!CHANGE_NAME_PATTERN.test(sessionId)) {
    writeError("debug-session id must be kebab-case (lowercase letters, numbers, and hyphens)");
    return 1;
  }
  const result = createDebugSession(process.cwd(), sessionId);
  writeJson(result);
  return result.ok ? 0 : 1;
}
function runDebugSessionValidate(argv) {
  const [target, ...extraArgs] = argv;
  if (isHelpRequest(argv)) {
    writeHelp(DEBUG_SESSION_VALIDATE_USAGE);
    return 0;
  }
  if (!target || extraArgs.length > 0) {
    writeUsage(DEBUG_SESSION_VALIDATE_USAGE);
    return 1;
  }
  const result = validateDebugSession(process.cwd(), target);
  writeJson(result);
  return result.valid ? 0 : 1;
}
function runDebugSessionArchive(argv) {
  const [target, ...extraArgs] = argv;
  if (isHelpRequest(argv)) {
    writeHelp(DEBUG_SESSION_ARCHIVE_USAGE);
    return 0;
  }
  if (!target || extraArgs.length > 0) {
    writeUsage(DEBUG_SESSION_ARCHIVE_USAGE);
    return 1;
  }
  const result = archiveDebugSession(process.cwd(), target);
  writeJson(result);
  return result.ok ? 0 : 1;
}

// src/strict-spec-cli.ts
var commands = createCliCommandTable({
  init: (argv) => runInit(argv),
  "check-workflow-state": (argv) => runCheckWorkflowState(argv),
  propose: (argv) => runPropose(argv),
  generate: (argv) => runGenerate(argv),
  apply: (argv) => runApply(argv),
  verify: (argv) => runVerify(argv),
  ready: (argv) => runReady(argv),
  next: (argv) => runNext(argv),
  "verify-spec-mappings": (argv) => runVerifySpecMappings(argv),
  "validate-skills": (argv) => runValidateSkills(argv),
  "schema-list": (argv) => runSchemaList(argv),
  "schema-show": (argv) => runSchemaShow(argv),
  "template-list": (argv) => runTemplateList(argv),
  "template-show": (argv) => runTemplateShow(argv),
  "dev-session-plan": (argv) => runDevSessionPlan(argv),
  "dev-session-start": (argv) => runDevSessionStart(argv),
  "dev-session-status": (argv) => runDevSessionStatus(argv),
  "dev-session-logs": (argv) => runDevSessionLogs(argv),
  "dev-session-trial": (argv) => runDevSessionTrial(argv),
  "dev-session-stop": (argv) => runDevSessionStop(argv),
  "debug-session-create": (argv) => runDebugSessionCreate(argv),
  "debug-session-validate": (argv) => runDebugSessionValidate(argv),
  "debug-session-archive": (argv) => runDebugSessionArchive(argv),
  migrate: (argv) => runMigrate(argv),
  "roadmap-status": (argv) => runRoadmapStatus(argv),
  "roadmap-overview": (argv) => runRoadmapOverview(argv),
  "roadmap-sync": (argv) => runRoadmapSync(argv),
  "roadmap-recommend": (argv) => runRoadmapRecommend(argv),
  maintenance: (argv) => runMaintenanceCommand(argv),
  ship: (argv) => runShip(argv),
  "commit-and-push": (argv) => runCommitAndPush(argv),
  archive: (argv) => runArchive(argv),
  list: (argv) => runList(argv),
  modify: (argv) => runModify(argv),
  cancel: (argv) => runCancel(argv)
});
function run(argv) {
  return runCliEntrypoint(argv, commands);
}
if (realpathSync(process.argv[1]) === realpathSync(fileURLToPath3(import.meta.url))) {
  exitCliEntrypoint(process.argv.slice(2), commands);
}
export {
  writeChangeTasks,
  verifyChange,
  syncRoadmap,
  stringifyYamlDocument,
  runMaintenance,
  run,
  recommendRoadmapChange,
  readChangeTasks,
  readBundledScaffoldTemplate,
  parseYamlDocument,
  migrateLegacyWorkflow,
  loadBundledScaffoldYaml,
  initializeStrictScaffold,
  initializeStrictChangeScaffold,
  getWorkflowState,
  getRoadmapStatus,
  getRequiredBundledScaffoldAssets,
  getRequiredBundledChangeTemplateAssets,
  getBundledScaffoldPath,
  findMissingRequiredScaffoldAssets,
  findMissingRequiredChangeTemplateAssets,
  createSchemaValidator,
  compileSchema,
  commands,
  checkProposalReadiness,
  archiveChange,
  applyTask
};

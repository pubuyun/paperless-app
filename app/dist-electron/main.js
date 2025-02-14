import electron, { BrowserWindow as BrowserWindow$1, app as app$1, dialog, shell, Menu, ipcMain } from "electron";
import { promises } from "fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process$1 from "node:process";
import require$$1 from "tty";
import require$$1$1 from "util";
import require$$0 from "os";
const fileApi = {
  async readFile(filePath) {
    try {
      return await promises.readFile(filePath, "utf-8");
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  },
  async writeFile(filePath, content) {
    try {
      await promises.writeFile(filePath, content, "utf-8");
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  },
  async readDir(dirPath) {
    try {
      const items = await promises.readdir(dirPath);
      return items;
    } catch (error) {
      throw new Error(`Failed to read directory: ${error.message}`);
    }
  },
  async stat(itemPath) {
    try {
      const stats = await promises.stat(itemPath);
      return {
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime,
        ctime: stats.ctime
      };
    } catch (error) {
      throw new Error(`Failed to get item stats: ${error.message}`);
    }
  },
  async exists(itemPath) {
    try {
      await promises.access(itemPath);
      return true;
    } catch {
      return false;
    }
  },
  async mkdir(dirPath) {
    try {
      await promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory: ${error.message}`);
    }
  },
  async delete(itemPath) {
    try {
      const stats = await promises.stat(itemPath);
      if (stats.isDirectory()) {
        await promises.rm(itemPath, { recursive: true });
      } else {
        await promises.unlink(itemPath);
      }
    } catch (error) {
      throw new Error(`Failed to delete item: ${error.message}`);
    }
  },
  async rename(oldPath, newPath) {
    try {
      await promises.rename(oldPath, newPath);
    } catch (error) {
      throw new Error(`Failed to rename item: ${error.message}`);
    }
  },
  async copy(src2, dest) {
    try {
      const stats = await promises.stat(src2);
      if (stats.isDirectory()) {
        await promises.cp(src2, dest, { recursive: true });
      } else {
        await promises.copyFile(src2, dest);
      }
    } catch (error) {
      throw new Error(`Failed to copy item: ${error.message}`);
    }
  }
};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
const modifiers$1 = /^(Command|Cmd|Control|Ctrl|CommandOrControl|CmdOrCtrl|Alt|Option|AltGr|Shift|Super)$/;
const keyCodes$1 = /^([0-9A-Z)!@#$%^&*(:+<_>?~{|}";=,\-./`[\\\]']|F1*[1-9]|F10|F2[0-4]|Plus|Space|Tab|Backspace|Delete|Insert|Return|Enter|Up|Down|Left|Right|Home|End|PageUp|PageDown|Escape|Esc|VolumeUp|VolumeDown|VolumeMute|MediaNextTrack|MediaPreviousTrack|MediaStop|MediaPlayPause|PrintScreen)$/;
var electronIsAccelerator = function(str) {
  let parts = str.split("+");
  let keyFound = false;
  return parts.every((val, index) => {
    const isKey = keyCodes$1.test(val);
    const isModifier = modifiers$1.test(val);
    if (isKey) {
      if (keyFound) return false;
      keyFound = true;
    }
    if (index === parts.length - 1 && !keyFound) return false;
    return isKey || isModifier;
  });
};
function _lower(key) {
  if (typeof key !== "string") {
    return key;
  }
  return key.toLowerCase();
}
function areEqual(ev1, ev2) {
  if (ev1 === ev2) {
    return true;
  }
  for (const prop of ["altKey", "ctrlKey", "shiftKey", "metaKey"]) {
    const [value1, value2] = [ev1[prop], ev2[prop]];
    if (Boolean(value1) !== Boolean(value2)) {
      return false;
    }
  }
  if (_lower(ev1.key) === _lower(ev2.key) && ev1.key !== void 0 || ev1.code === ev2.code && ev1.code !== void 0) {
    return true;
  }
  return false;
}
var keyboardeventsAreequal = areEqual;
const modifiers = /^(CommandOrControl|CmdOrCtrl|Command|Cmd|Control|Ctrl|AltGr|Option|Alt|Shift|Super)/i;
const keyCodes = /^(Plus|Space|Tab|Backspace|Delete|Insert|Return|Enter|Up|Down|Left|Right|Home|End|PageUp|PageDown|Escape|Esc|VolumeUp|VolumeDown|VolumeMute|MediaNextTrack|MediaPreviousTrack|MediaStop|MediaPlayPause|PrintScreen|F24|F23|F22|F21|F20|F19|F18|F17|F16|F15|F14|F13|F12|F11|F10|F9|F8|F7|F6|F5|F4|F3|F2|F1|[0-9A-Z)!@#$%^&*(:+<_>?~{|}";=,\-./`[\\\]'])/i;
const UNSUPPORTED = {};
function _command(accelerator, event, modifier) {
  if (process.platform !== "darwin") {
    return UNSUPPORTED;
  }
  if (event.metaKey) {
    throw new Error("Double `Command` modifier specified.");
  }
  return {
    event: Object.assign({}, event, { metaKey: true }),
    accelerator: accelerator.slice(modifier.length)
  };
}
function _super(accelerator, event, modifier) {
  if (event.metaKey) {
    throw new Error("Double `Super` modifier specified.");
  }
  return {
    event: Object.assign({}, event, { metaKey: true }),
    accelerator: accelerator.slice(modifier.length)
  };
}
function _commandorcontrol(accelerator, event, modifier) {
  if (process.platform === "darwin") {
    if (event.metaKey) {
      throw new Error("Double `Command` modifier specified.");
    }
    return {
      event: Object.assign({}, event, { metaKey: true }),
      accelerator: accelerator.slice(modifier.length)
    };
  }
  if (event.ctrlKey) {
    throw new Error("Double `Control` modifier specified.");
  }
  return {
    event: Object.assign({}, event, { ctrlKey: true }),
    accelerator: accelerator.slice(modifier.length)
  };
}
function _alt(accelerator, event, modifier) {
  if (modifier === "option" && process.platform !== "darwin") {
    return UNSUPPORTED;
  }
  if (event.altKey) {
    throw new Error("Double `Alt` modifier specified.");
  }
  return {
    event: Object.assign({}, event, { altKey: true }),
    accelerator: accelerator.slice(modifier.length)
  };
}
function _shift(accelerator, event, modifier) {
  if (event.shiftKey) {
    throw new Error("Double `Shift` modifier specified.");
  }
  return {
    event: Object.assign({}, event, { shiftKey: true }),
    accelerator: accelerator.slice(modifier.length)
  };
}
function _control(accelerator, event, modifier) {
  if (event.ctrlKey) {
    throw new Error("Double `Control` modifier specified.");
  }
  return {
    event: Object.assign({}, event, { ctrlKey: true }),
    accelerator: accelerator.slice(modifier.length)
  };
}
function reduceModifier({ accelerator, event }, modifier) {
  switch (modifier) {
    case "command":
    case "cmd": {
      return _command(accelerator, event, modifier);
    }
    case "super": {
      return _super(accelerator, event, modifier);
    }
    case "control":
    case "ctrl": {
      return _control(accelerator, event, modifier);
    }
    case "commandorcontrol":
    case "cmdorctrl": {
      return _commandorcontrol(accelerator, event, modifier);
    }
    case "option":
    case "altgr":
    case "alt": {
      return _alt(accelerator, event, modifier);
    }
    case "shift": {
      return _shift(accelerator, event, modifier);
    }
    default:
      console.error(modifier);
  }
}
function reducePlus({ accelerator, event }) {
  return {
    event,
    accelerator: accelerator.trim().slice(1)
  };
}
const virtualKeyCodes = {
  0: "Digit0",
  1: "Digit1",
  2: "Digit2",
  3: "Digit3",
  4: "Digit4",
  5: "Digit5",
  6: "Digit6",
  7: "Digit7",
  8: "Digit8",
  9: "Digit9",
  "-": "Minus",
  "=": "Equal",
  Q: "KeyQ",
  W: "KeyW",
  E: "KeyE",
  R: "KeyR",
  T: "KeyT",
  Y: "KeyY",
  U: "KeyU",
  I: "KeyI",
  O: "KeyO",
  P: "KeyP",
  "[": "BracketLeft",
  "]": "BracketRight",
  A: "KeyA",
  S: "KeyS",
  D: "KeyD",
  F: "KeyF",
  G: "KeyG",
  H: "KeyH",
  J: "KeyJ",
  K: "KeyK",
  L: "KeyL",
  ";": "Semicolon",
  "'": "Quote",
  "`": "Backquote",
  "/": "Backslash",
  Z: "KeyZ",
  X: "KeyX",
  C: "KeyC",
  V: "KeyV",
  B: "KeyB",
  N: "KeyN",
  M: "KeyM",
  ",": "Comma",
  ".": "Period",
  "\\": "Slash",
  " ": "Space"
};
function reduceKey({ accelerator, event }, key) {
  if (key.length > 1 || event.key) {
    throw new Error(`Unvalid keycode \`${key}\`.`);
  }
  const code = key.toUpperCase() in virtualKeyCodes ? virtualKeyCodes[key.toUpperCase()] : null;
  return {
    event: Object.assign({}, event, { key }, code ? { code } : null),
    accelerator: accelerator.trim().slice(key.length)
  };
}
const domKeys = Object.assign(/* @__PURE__ */ Object.create(null), {
  plus: "Add",
  space: "Space",
  tab: "Tab",
  backspace: "Backspace",
  delete: "Delete",
  insert: "Insert",
  return: "Return",
  enter: "Return",
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  home: "Home",
  end: "End",
  pageup: "PageUp",
  pagedown: "PageDown",
  escape: "Escape",
  esc: "Escape",
  volumeup: "AudioVolumeUp",
  volumedown: "AudioVolumeDown",
  volumemute: "AudioVolumeMute",
  medianexttrack: "MediaTrackNext",
  mediaprevioustrack: "MediaTrackPrevious",
  mediastop: "MediaStop",
  mediaplaypause: "MediaPlayPause",
  printscreen: "PrintScreen"
});
for (let i = 1; i <= 24; i++) {
  domKeys[`f${i}`] = `F${i}`;
}
function reduceCode({ accelerator, event }, { code, key }) {
  if (event.code) {
    throw new Error(`Duplicated keycode \`${key}\`.`);
  }
  return {
    event: Object.assign({}, event, { key }, code ? { code } : null),
    accelerator: accelerator.trim().slice(key && key.length || 0)
  };
}
function toKeyEvent$1(accelerator) {
  let state = { accelerator, event: {} };
  while (state.accelerator !== "") {
    const modifierMatch = state.accelerator.match(modifiers);
    if (modifierMatch) {
      const modifier = modifierMatch[0].toLowerCase();
      state = reduceModifier(state, modifier);
      if (state === UNSUPPORTED) {
        return { unsupportedKeyForPlatform: true };
      }
    } else if (state.accelerator.trim()[0] === "+") {
      state = reducePlus(state);
    } else {
      const codeMatch = state.accelerator.match(keyCodes);
      if (codeMatch) {
        const code = codeMatch[0].toLowerCase();
        if (code in domKeys) {
          state = reduceCode(state, {
            code: domKeys[code],
            key: code
          });
        } else {
          state = reduceKey(state, code);
        }
      } else {
        throw new Error(`Unvalid accelerator: "${state.accelerator}"`);
      }
    }
  }
  return state.event;
}
var keyboardeventFromElectronAccelerator = {
  toKeyEvent: toKeyEvent$1
};
var src = { exports: {} };
var browser = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  ms = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return plural(ms2, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms2, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms2, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms2, msAbs, s, "second");
    }
    return ms2 + " ms";
  }
  function plural(ms2, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
  }
  return ms;
}
var common;
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  function setup(env2) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = requireMs();
    createDebug.destroy = destroy;
    Object.keys(env2).forEach((key) => {
      createDebug[key] = env2[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0; i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug2(...args) {
        if (!debug2.enabled) {
          return;
        }
        const self = debug2;
        const curr = Number(/* @__PURE__ */ new Date());
        const ms2 = curr - (prevTime || curr);
        self.diff = ms2;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self, args);
        const logFn = self.log || createDebug.log;
        logFn.apply(self, args);
      }
      debug2.namespace = namespace;
      debug2.useColors = createDebug.useColors();
      debug2.color = createDebug.selectColor(namespace);
      debug2.extend = extend;
      debug2.destroy = createDebug.destroy;
      Object.defineProperty(debug2, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug2);
      }
      return debug2;
    }
    function extend(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(" ", ",").split(",").filter(Boolean);
      for (const ns of split) {
        if (ns[0] === "-") {
          createDebug.skips.push(ns.slice(1));
        } else {
          createDebug.names.push(ns);
        }
      }
    }
    function matchesTemplate(search, template2) {
      let searchIndex = 0;
      let templateIndex = 0;
      let starIndex = -1;
      let matchIndex = 0;
      while (searchIndex < search.length) {
        if (templateIndex < template2.length && (template2[templateIndex] === search[searchIndex] || template2[templateIndex] === "*")) {
          if (template2[templateIndex] === "*") {
            starIndex = templateIndex;
            matchIndex = searchIndex;
            templateIndex++;
          } else {
            searchIndex++;
            templateIndex++;
          }
        } else if (starIndex !== -1) {
          templateIndex = starIndex + 1;
          matchIndex++;
          searchIndex = matchIndex;
        } else {
          return false;
        }
      }
      while (templateIndex < template2.length && template2[templateIndex] === "*") {
        templateIndex++;
      }
      return templateIndex === template2.length;
    }
    function disable() {
      const namespaces = [
        ...createDebug.names,
        ...createDebug.skips.map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      for (const skip of createDebug.skips) {
        if (matchesTemplate(name, skip)) {
          return false;
        }
      }
      for (const ns of createDebug.names) {
        if (matchesTemplate(name, ns)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  common = setup;
  return common;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module, exports) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = requireCommon()(exports);
    const { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
var hasFlag;
var hasRequiredHasFlag;
function requireHasFlag() {
  if (hasRequiredHasFlag) return hasFlag;
  hasRequiredHasFlag = 1;
  hasFlag = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
  return hasFlag;
}
var supportsColor_1;
var hasRequiredSupportsColor;
function requireSupportsColor() {
  if (hasRequiredSupportsColor) return supportsColor_1;
  hasRequiredSupportsColor = 1;
  const os = require$$0;
  const tty = require$$1;
  const hasFlag2 = requireHasFlag();
  const { env: env2 } = process;
  let flagForceColor;
  if (hasFlag2("no-color") || hasFlag2("no-colors") || hasFlag2("color=false") || hasFlag2("color=never")) {
    flagForceColor = 0;
  } else if (hasFlag2("color") || hasFlag2("colors") || hasFlag2("color=true") || hasFlag2("color=always")) {
    flagForceColor = 1;
  }
  function envForceColor() {
    if ("FORCE_COLOR" in env2) {
      if (env2.FORCE_COLOR === "true") {
        return 1;
      }
      if (env2.FORCE_COLOR === "false") {
        return 0;
      }
      return env2.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env2.FORCE_COLOR, 10), 3);
    }
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
    const noFlagForceColor = envForceColor();
    if (noFlagForceColor !== void 0) {
      flagForceColor = noFlagForceColor;
    }
    const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
    if (forceColor === 0) {
      return 0;
    }
    if (sniffFlags) {
      if (hasFlag2("color=16m") || hasFlag2("color=full") || hasFlag2("color=truecolor")) {
        return 3;
      }
      if (hasFlag2("color=256")) {
        return 2;
      }
    }
    if (haveStream && !streamIsTTY && forceColor === void 0) {
      return 0;
    }
    const min = forceColor || 0;
    if (env2.TERM === "dumb") {
      return min;
    }
    if (process.platform === "win32") {
      const osRelease = os.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env2) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE", "DRONE"].some((sign) => sign in env2) || env2.CI_NAME === "codeship") {
        return 1;
      }
      return min;
    }
    if ("TEAMCITY_VERSION" in env2) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env2.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env2.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env2) {
      const version = Number.parseInt((env2.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env2.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env2.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env2.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env2) {
      return 1;
    }
    return min;
  }
  function getSupportLevel(stream, options = {}) {
    const level = supportsColor(stream, {
      streamIsTTY: stream && stream.isTTY,
      ...options
    });
    return translateLevel(level);
  }
  supportsColor_1 = {
    supportsColor: getSupportLevel,
    stdout: getSupportLevel({ isTTY: tty.isatty(1) }),
    stderr: getSupportLevel({ isTTY: tty.isatty(2) })
  };
  return supportsColor_1;
}
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module, exports) {
    const tty = require$$1;
    const util = require$$1$1;
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = requireSupportsColor();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      const keys = Object.keys(exports.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug2.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    module.exports = requireCommon()(exports);
    const { formatters } = module.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  })(node, node.exports);
  return node.exports;
}
if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
  src.exports = requireBrowser();
} else {
  src.exports = requireNode();
}
var srcExports = src.exports;
const { app, BrowserWindow } = electron;
const isAccelerator = electronIsAccelerator;
const equals = keyboardeventsAreequal;
const { toKeyEvent } = keyboardeventFromElectronAccelerator;
const _debug = srcExports;
const debug$1 = _debug("electron-localshortcut");
const ANY_WINDOW = {};
const windowsWithShortcuts = /* @__PURE__ */ new WeakMap();
const title = (win2) => {
  if (win2) {
    try {
      return win2.getTitle();
    } catch (error) {
      return "A destroyed window";
    }
  }
  return "An falsy value";
};
function _checkAccelerator(accelerator) {
  if (!isAccelerator(accelerator)) {
    const w = {};
    Error.captureStackTrace(w);
    const stack = w.stack ? w.stack.split("\n").slice(4).join("\n") : w.message;
    const msg = `
WARNING: ${accelerator} is not a valid accelerator.

${stack}
`;
    console.error(msg);
  }
}
function disableAll(win2) {
  debug$1(`Disabling all shortcuts on window ${title(win2)}`);
  const wc = win2.webContents;
  const shortcutsOfWindow = windowsWithShortcuts.get(wc);
  for (const shortcut of shortcutsOfWindow) {
    shortcut.enabled = false;
  }
}
function enableAll(win2) {
  debug$1(`Enabling all shortcuts on window ${title(win2)}`);
  const wc = win2.webContents;
  const shortcutsOfWindow = windowsWithShortcuts.get(wc);
  for (const shortcut of shortcutsOfWindow) {
    shortcut.enabled = true;
  }
}
function unregisterAll(win2) {
  debug$1(`Unregistering all shortcuts on window ${title(win2)}`);
  const wc = win2.webContents;
  const shortcutsOfWindow = windowsWithShortcuts.get(wc);
  if (shortcutsOfWindow && shortcutsOfWindow.removeListener) {
    shortcutsOfWindow.removeListener();
    windowsWithShortcuts.delete(wc);
  }
}
function _normalizeEvent(input) {
  const normalizedEvent = {
    code: input.code,
    key: input.key
  };
  ["alt", "shift", "meta"].forEach((prop) => {
    if (typeof input[prop] !== "undefined") {
      normalizedEvent[`${prop}Key`] = input[prop];
    }
  });
  if (typeof input.control !== "undefined") {
    normalizedEvent.ctrlKey = input.control;
  }
  return normalizedEvent;
}
function _findShortcut(event, shortcutsOfWindow) {
  let i = 0;
  for (const shortcut of shortcutsOfWindow) {
    if (equals(shortcut.eventStamp, event)) {
      return i;
    }
    i++;
  }
  return -1;
}
const _onBeforeInput = (shortcutsOfWindow) => (e, input) => {
  if (input.type === "keyUp") {
    return;
  }
  const event = _normalizeEvent(input);
  debug$1(`before-input-event: ${input} is translated to: ${event}`);
  for (const { eventStamp, callback } of shortcutsOfWindow) {
    if (equals(eventStamp, event)) {
      debug$1(`eventStamp: ${eventStamp} match`);
      callback();
      return;
    }
    debug$1(`eventStamp: ${eventStamp} no match`);
  }
};
function register(win2, accelerator, callback) {
  let wc;
  if (typeof callback === "undefined") {
    wc = ANY_WINDOW;
    callback = accelerator;
    accelerator = win2;
  } else {
    wc = win2.webContents;
  }
  if (Array.isArray(accelerator) === true) {
    accelerator.forEach((accelerator2) => {
      if (typeof accelerator2 === "string") {
        register(win2, accelerator2, callback);
      }
    });
    return;
  }
  debug$1(`Registering callback for ${accelerator} on window ${title(win2)}`);
  _checkAccelerator(accelerator);
  debug$1(`${accelerator} seems a valid shortcut sequence.`);
  let shortcutsOfWindow;
  if (windowsWithShortcuts.has(wc)) {
    debug$1("Window has others shortcuts registered.");
    shortcutsOfWindow = windowsWithShortcuts.get(wc);
  } else {
    debug$1("This is the first shortcut of the window.");
    shortcutsOfWindow = [];
    windowsWithShortcuts.set(wc, shortcutsOfWindow);
    if (wc === ANY_WINDOW) {
      const keyHandler = _onBeforeInput(shortcutsOfWindow);
      const enableAppShortcuts = (e, win3) => {
        const wc2 = win3.webContents;
        wc2.on("before-input-event", keyHandler);
        wc2.once(
          "closed",
          () => wc2.removeListener("before-input-event", keyHandler)
        );
      };
      const windows = BrowserWindow.getAllWindows();
      windows.forEach((win3) => enableAppShortcuts(null, win3));
      app.on("browser-window-created", enableAppShortcuts);
      shortcutsOfWindow.removeListener = () => {
        const windows2 = BrowserWindow.getAllWindows();
        windows2.forEach(
          (win3) => win3.webContents.removeListener("before-input-event", keyHandler)
        );
        app.removeListener("browser-window-created", enableAppShortcuts);
      };
    } else {
      const keyHandler = _onBeforeInput(shortcutsOfWindow);
      wc.on("before-input-event", keyHandler);
      shortcutsOfWindow.removeListener = () => wc.removeListener("before-input-event", keyHandler);
      wc.once("closed", shortcutsOfWindow.removeListener);
    }
  }
  debug$1("Adding shortcut to window set.");
  const eventStamp = toKeyEvent(accelerator);
  shortcutsOfWindow.push({
    eventStamp,
    callback,
    enabled: true
  });
  debug$1("Shortcut registered.");
}
function unregister(win2, accelerator) {
  let wc;
  if (typeof accelerator === "undefined") {
    wc = ANY_WINDOW;
    accelerator = win2;
  } else {
    if (win2.isDestroyed()) {
      debug$1("Early return because window is destroyed.");
      return;
    }
    wc = win2.webContents;
  }
  if (Array.isArray(accelerator) === true) {
    accelerator.forEach((accelerator2) => {
      if (typeof accelerator2 === "string") {
        unregister(win2, accelerator2);
      }
    });
    return;
  }
  debug$1(`Unregistering callback for ${accelerator} on window ${title(win2)}`);
  _checkAccelerator(accelerator);
  debug$1(`${accelerator} seems a valid shortcut sequence.`);
  if (!windowsWithShortcuts.has(wc)) {
    debug$1("Early return because window has never had shortcuts registered.");
    return;
  }
  const shortcutsOfWindow = windowsWithShortcuts.get(wc);
  const eventStamp = toKeyEvent(accelerator);
  const shortcutIdx = _findShortcut(eventStamp, shortcutsOfWindow);
  if (shortcutIdx === -1) {
    return;
  }
  shortcutsOfWindow.splice(shortcutIdx, 1);
  if (shortcutsOfWindow.length === 0) {
    shortcutsOfWindow.removeListener();
    windowsWithShortcuts.delete(wc);
  }
}
function isRegistered(win2, accelerator) {
  _checkAccelerator(accelerator);
  const wc = win2.webContents;
  const shortcutsOfWindow = windowsWithShortcuts.get(wc);
  const eventStamp = toKeyEvent(accelerator);
  return _findShortcut(eventStamp, shortcutsOfWindow) !== -1;
}
var electronLocalshortcut = {
  register,
  unregister,
  isRegistered,
  unregisterAll,
  enableAll,
  disableAll
};
const localShortcut = /* @__PURE__ */ getDefaultExportFromCjs(electronLocalshortcut);
if (typeof electron === "string") {
  throw new TypeError("Not running in an Electron environment!");
}
const { env } = process;
const isEnvSet = "ELECTRON_IS_DEV" in env;
const getFromEnv = Number.parseInt(env.ELECTRON_IS_DEV, 10) === 1;
const isDev = isEnvSet ? getFromEnv : !electron.app.isPackaged;
const isMacOS = process$1.platform === "darwin";
const developmentToolsOptions = /* @__PURE__ */ new Map();
function toggleDevelopmentTools(win2 = BrowserWindow$1.getFocusedWindow()) {
  if (win2) {
    const { webContents } = win2;
    if (webContents.isDevToolsOpened()) {
      webContents.closeDevTools();
    } else {
      webContents.openDevTools(developmentToolsOptions.get(win2));
    }
  }
}
function shouldRun(options) {
  return options && (options.isEnabled === true || options.isEnabled === null && isDev);
}
function getOptionsForWindow(win2, options) {
  if (!options.windowSelector) {
    return options;
  }
  const newOptions = options.windowSelector(win2);
  return newOptions === true ? options : newOptions === false ? { isEnabled: false } : { ...options, ...newOptions };
}
async function registerAccelerators(win2 = BrowserWindow$1.getFocusedWindow()) {
  await app$1.whenReady();
  if (win2) {
    localShortcut.register(win2, "CommandOrControl+Shift+C", inspectElements);
    localShortcut.register(win2, isMacOS ? "Command+Alt+I" : "Control+Shift+I", devTools);
    localShortcut.register(win2, "F12", devTools);
    localShortcut.register(win2, "CommandOrControl+R", refresh);
    localShortcut.register(win2, "F5", refresh);
  } else {
    localShortcut.register("CommandOrControl+Shift+C", inspectElements);
    localShortcut.register(isMacOS ? "Command+Alt+I" : "Control+Shift+I", devTools);
    localShortcut.register("F12", devTools);
    localShortcut.register("CommandOrControl+R", refresh);
    localShortcut.register("F5", refresh);
  }
}
function devTools(win2 = BrowserWindow$1.getFocusedWindow()) {
  if (win2) {
    toggleDevelopmentTools(win2);
  }
}
function openDevTools(win2 = BrowserWindow$1.getFocusedWindow()) {
  if (win2) {
    win2.webContents.openDevTools(developmentToolsOptions.get(win2));
  }
}
function refresh(win2 = BrowserWindow$1.getFocusedWindow()) {
  if (win2) {
    win2.webContents.reloadIgnoringCache();
  }
}
function inspectElements() {
  const win2 = BrowserWindow$1.getFocusedWindow();
  const inspect = () => {
    win2.devToolsWebContents.executeJavaScript("DevToolsAPI.enterInspectElementMode()");
  };
  if (win2) {
    if (win2.webContents.isDevToolsOpened()) {
      inspect();
    } else {
      win2.webContents.once("devtools-opened", inspect);
      win2.openDevTools();
    }
  }
}
function debug(options) {
  options = {
    isEnabled: null,
    showDevTools: true,
    devToolsMode: "previous",
    ...options
  };
  if (!options.windowSelector) {
    if (!shouldRun(options)) {
      return;
    }
    registerAccelerators();
  }
  app$1.on("browser-window-created", (event, win2) => {
    win2.webContents.once("dom-ready", () => {
      const winOptions = getOptionsForWindow(win2, options);
      if (winOptions.devToolsMode !== "previous") {
        developmentToolsOptions.set(win2, {
          ...developmentToolsOptions.get(win2),
          mode: winOptions.devToolsMode
        });
      }
      if (!shouldRun(winOptions)) {
        return;
      }
      if (winOptions.windowSelector) {
        registerAccelerators(win2);
      }
      if (winOptions.showDevTools) {
        openDevTools(win2);
      }
    });
  });
}
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV === "development") {
  debug();
}
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow$1({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
const isMac = process.platform === "darwin";
const template = [
  ...isMac ? [{
    label: app$1.name,
    submenu: [
      { role: "about" },
      { type: "separator" },
      { role: "services" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" }
    ]
  }] : [],
  {
    label: "File",
    submenu: [
      {
        label: "Open Folder",
        click: async () => {
          const result = await dialog.showOpenDialog(win, {
            properties: ["openDirectory"]
          });
          win.webContents.send("open-folder-dialog-completed", result);
        }
      },
      { type: "separator" },
      {
        label: "New",
        submenu: [
          {
            label: "File",
            click: async () => {
              const result = await dialog.showSaveDialog(win, {
                title: "Create New File",
                buttonLabel: "Create"
              });
              win.webContents.send("new-file-dialog-completed", result);
            }
          },
          {
            label: "Folder",
            click: async () => {
              const result = await dialog.showSaveDialog(win, {
                title: "Create New Folder",
                buttonLabel: "Create",
                properties: ["createDirectory"]
              });
              win.webContents.send("new-folder-dialog-completed", result);
            }
          }
        ]
      },
      { type: "separator" },
      {
        label: "Delete",
        click: async () => {
          const result = await dialog.showMessageBox(win, {
            type: "warning",
            title: "Confirm Delete",
            message: "Are you sure you want to delete the selected items?",
            buttons: ["Delete", "Cancel"],
            defaultId: 1,
            cancelId: 1
          });
          win.webContents.send("delete-confirmed", result);
        }
      },
      isMac ? { role: "close" } : { role: "quit" }
    ]
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...isMac ? [
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll" },
        { type: "separator" },
        {
          label: "Speech",
          submenu: [
            { role: "startSpeaking" },
            { role: "stopSpeaking" }
          ]
        }
      ] : [
        { role: "delete" },
        { type: "separator" },
        { role: "selectAll" }
      ]
    ]
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" }
    ]
  },
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      ...isMac ? [
        { type: "separator" },
        { role: "front" },
        { type: "separator" },
        { role: "window" }
      ] : [
        { role: "close" }
      ]
    ]
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          await shell.openExternal("https://electronjs.org");
        }
      }
    ]
  }
];
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
app$1.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app$1.quit();
    win = null;
  }
});
app$1.on("activate", () => {
  if (BrowserWindow$1.getAllWindows().length === 0) {
    createWindow();
  }
});
app$1.on("ready", () => {
  createWindow();
  ipcMain.handle("readFile", async (_, filePath) => await fileApi.readFile(filePath));
  ipcMain.handle("writeFile", async (_, filePath, content) => await fileApi.writeFile(filePath, content));
  ipcMain.handle("readDir", async (_, dirPath) => await fileApi.readDir(dirPath));
  ipcMain.handle("stat", async (_, itemPath) => await fileApi.stat(itemPath));
  ipcMain.handle("exists", async (_, itemPath) => await fileApi.exists(itemPath));
  ipcMain.handle("mkdir", async (_, dirPath) => await fileApi.mkdir(dirPath));
  ipcMain.handle("delete", async (_, itemPath) => await fileApi.delete(itemPath));
  ipcMain.handle("rename", async (_, oldPath, newPath) => await fileApi.rename(oldPath, newPath));
  ipcMain.handle("copy", async (_, src2, dest) => await fileApi.copy(src2, dest));
  ipcMain.on("show-context-menu", (event) => {
    const menu2 = Menu.buildFromTemplate(template);
    menu2.popup({ window: win });
  });
  ipcMain.handle("showOpenDialog", async (_, options) => {
    return await dialog.showOpenDialog(win, options);
  });
  ipcMain.handle("showSaveDialog", async (_, options) => {
    return await dialog.showSaveDialog(win, options);
  });
  ipcMain.handle("showMessageBox", async (_, options) => {
    return await dialog.showMessageBox(win, options);
  });
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};

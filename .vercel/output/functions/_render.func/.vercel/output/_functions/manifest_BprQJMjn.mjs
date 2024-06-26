import 'cookie';
import { bold, red, yellow, dim, blue } from 'kleur/colors';
import './chunks/astro_BUZmonMA.mjs';
import 'clsx';
import { compile } from 'path-to-regexp';

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return red(prefix.join(" "));
  }
  if (level === "warn") {
    return yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return dim(prefix[0]);
  }
  return dim(prefix[0]) + " " + blue(prefix.splice(1).join(" "));
}
if (typeof process !== "undefined") {
  let proc = process;
  if ("argv" in proc && Array.isArray(proc.argv)) {
    if (proc.argv.includes("--verbose")) ; else if (proc.argv.includes("--silent")) ; else ;
  }
}
class Logger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
}

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return (params) => {
    const path = toPath(params);
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware(_, next) {
      return next();
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes
  };
}

const manifest = deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"en/about-us/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/en/about-us","isIndex":false,"type":"page","pattern":"^\\/en\\/about-us\\/?$","segments":[[{"content":"en","dynamic":false,"spread":false}],[{"content":"about-us","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/en/about-us.astro","pathname":"/en/about-us","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"en/contact/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/en/contact","isIndex":false,"type":"page","pattern":"^\\/en\\/contact\\/?$","segments":[[{"content":"en","dynamic":false,"spread":false}],[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/en/contact.astro","pathname":"/en/contact","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"en/join-us/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/en/join-us","isIndex":false,"type":"page","pattern":"^\\/en\\/join-us\\/?$","segments":[[{"content":"en","dynamic":false,"spread":false}],[{"content":"join-us","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/en/join-us.astro","pathname":"/en/join-us","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"en/what-we-do/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/en/what-we-do","isIndex":false,"type":"page","pattern":"^\\/en\\/what-we-do\\/?$","segments":[[{"content":"en","dynamic":false,"spread":false}],[{"content":"what-we-do","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/en/what-we-do.astro","pathname":"/en/what-we-do","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"en/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/en","isIndex":true,"type":"page","pattern":"^\\/en\\/?$","segments":[[{"content":"en","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/en/index.astro","pathname":"/en","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"es/contacto/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/es/contacto","isIndex":false,"type":"page","pattern":"^\\/es\\/contacto\\/?$","segments":[[{"content":"es","dynamic":false,"spread":false}],[{"content":"contacto","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/es/contacto.astro","pathname":"/es/contacto","prerender":true,"fallbackRoutes":[{"route":"/en/contacto","isIndex":false,"type":"fallback","pattern":"^\\/en\\/contacto\\/?$","segments":[[{"content":"en","dynamic":false,"spread":false}],[{"content":"contacto","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/es/contacto.astro","pathname":"/en/contacto","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}],"_meta":{"trailingSlash":"ignore"}}},{"file":"es/nosotros/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/es/nosotros","isIndex":false,"type":"page","pattern":"^\\/es\\/nosotros\\/?$","segments":[[{"content":"es","dynamic":false,"spread":false}],[{"content":"nosotros","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/es/nosotros.astro","pathname":"/es/nosotros","prerender":true,"fallbackRoutes":[{"route":"/en/nosotros","isIndex":false,"type":"fallback","pattern":"^\\/en\\/nosotros\\/?$","segments":[[{"content":"en","dynamic":false,"spread":false}],[{"content":"nosotros","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/es/nosotros.astro","pathname":"/en/nosotros","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}],"_meta":{"trailingSlash":"ignore"}}},{"file":"es/que-hacemos/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/es/que-hacemos","isIndex":false,"type":"page","pattern":"^\\/es\\/que-hacemos\\/?$","segments":[[{"content":"es","dynamic":false,"spread":false}],[{"content":"que-hacemos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/es/que-hacemos.astro","pathname":"/es/que-hacemos","prerender":true,"fallbackRoutes":[{"route":"/en/que-hacemos","isIndex":false,"type":"fallback","pattern":"^\\/en\\/que-hacemos\\/?$","segments":[[{"content":"en","dynamic":false,"spread":false}],[{"content":"que-hacemos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/es/que-hacemos.astro","pathname":"/en/que-hacemos","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}],"_meta":{"trailingSlash":"ignore"}}},{"file":"es/sumate/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/es/sumate","isIndex":false,"type":"page","pattern":"^\\/es\\/sumate\\/?$","segments":[[{"content":"es","dynamic":false,"spread":false}],[{"content":"sumate","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/es/sumate.astro","pathname":"/es/sumate","prerender":true,"fallbackRoutes":[{"route":"/en/sumate","isIndex":false,"type":"fallback","pattern":"^\\/en\\/sumate\\/?$","segments":[[{"content":"en","dynamic":false,"spread":false}],[{"content":"sumate","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/es/sumate.astro","pathname":"/en/sumate","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}],"_meta":{"trailingSlash":"ignore"}}},{"file":"es/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/es","isIndex":true,"type":"page","pattern":"^\\/es\\/?$","segments":[[{"content":"es","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/es/index.astro","pathname":"/es","prerender":true,"fallbackRoutes":[{"route":"/en","isIndex":true,"type":"fallback","pattern":"^\\/en\\/?$","segments":[[{"content":"en","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/es/index.astro","pathname":"/en","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[{"route":"/","isIndex":true,"type":"fallback","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"fallback","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[{"route":"/","isIndex":true,"type":"fallback","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.BIe0mclZ.js"}],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/[lang]/blog/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/[lang]/red/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/en/about-us.astro",{"propagation":"none","containsHead":true}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/en/contact.astro",{"propagation":"none","containsHead":true}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/en/join-us.astro",{"propagation":"none","containsHead":true}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/en/what-we-do.astro",{"propagation":"none","containsHead":true}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/es/contacto.astro",{"propagation":"none","containsHead":true}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/es/nosotros.astro",{"propagation":"none","containsHead":true}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/es/que-hacemos.astro",{"propagation":"none","containsHead":true}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/es/sumate.astro",{"propagation":"none","containsHead":true}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/components/LastNews.astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/en/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/en/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/es/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/es/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/[lang]/blog/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/[lang]/red/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/en/blog/[...page].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/en/blog/[...page]@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/en/blog/tag/[tag].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/en/blog/tag/[tag]@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/en/red/[...page].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/en/red/[...page]@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/es/blog/[...page].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/es/blog/[...page]@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/es/blog/tag/[tag].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/es/blog/tag/[tag]@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/pages/es/red/[...page].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/es/red/[...page]@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/utils/getAllTags.ts",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/components/Tags.astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/components/Card.astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/components/PostsList.astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/layouts/BlogLayout.astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astrojs-manifest":"manifest_BprQJMjn.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/node_modules/@astrojs/react/vnode-children.js":"chunks/vnode-children_BkR_XoPb.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"chunks/generic_CQRPTjVI.mjs","\u0000@astro-page:src/pages/en/about-us@_@astro":"chunks/about-us_Dn5soDGU.mjs","\u0000@astro-page:src/pages/en/blog/tag/[tag]@_@astro":"chunks/_tag__DFp3pUXf.mjs","\u0000@astro-page:src/pages/en/blog/[...page]@_@astro":"chunks/_.._JDeQrjrV.mjs","\u0000@astro-page:src/pages/en/contact@_@astro":"chunks/contact_Cwah8F0t.mjs","\u0000@astro-page:src/pages/en/join-us@_@astro":"chunks/join-us_nbLDXNOG.mjs","\u0000@astro-page:src/pages/en/red/[...page]@_@astro":"chunks/_..__b9zYtJh.mjs","\u0000@astro-page:src/pages/en/what-we-do@_@astro":"chunks/what-we-do_DAZCQf1g.mjs","\u0000@astro-page:src/pages/en/index@_@astro":"chunks/index_fzcyTxGg.mjs","\u0000@astro-page:src/pages/es/blog/tag/[tag]@_@astro":"chunks/_tag__CULShu08.mjs","\u0000@astro-page:src/pages/es/blog/[...page]@_@astro":"chunks/_.._DdXDSQcZ.mjs","\u0000@astro-page:src/pages/es/contacto@_@astro":"chunks/contacto_DoGKYTxa.mjs","\u0000@astro-page:src/pages/es/nosotros@_@astro":"chunks/nosotros_CWV8KaF-.mjs","\u0000@astro-page:src/pages/es/que-hacemos@_@astro":"chunks/que-hacemos_LiuLwafN.mjs","\u0000@astro-page:src/pages/es/red/[...page]@_@astro":"chunks/_.._D8mMfQ_G.mjs","\u0000@astro-page:src/pages/es/sumate@_@astro":"chunks/sumate_NuMmT1ff.mjs","\u0000@astro-page:src/pages/es/index@_@astro":"chunks/index_qaLC5qu3.mjs","\u0000@astro-page:src/pages/[lang]/blog/[...slug]@_@astro":"chunks/_.._BONV7pjK.mjs","\u0000@astro-page:src/pages/[lang]/red/[...slug]@_@astro":"chunks/_.._D4JzUCKf.mjs","\u0000@astro-page:src/pages/index@_@astro":"chunks/index_DqmtoXzH.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/en/post-1.md?astroContentCollectionEntry=true":"chunks/post-1_7Lds0b8L.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/en/post-2.md?astroContentCollectionEntry=true":"chunks/post-2_Dgg1O5Ae.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/en/post-3.md?astroContentCollectionEntry=true":"chunks/post-3_BuoA339x.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/en/post.md?astroContentCollectionEntry=true":"chunks/post_BkSQCHAx.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/es/post-1.md?astroContentCollectionEntry=true":"chunks/post-1_99DDuxFW.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/es/post-2.md?astroContentCollectionEntry=true":"chunks/post-2_mOiPdRES.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/es/post-3.md?astroContentCollectionEntry=true":"chunks/post-3_1XkmG3I3.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/es/post.md?astroContentCollectionEntry=true":"chunks/post_PQNBr2ce.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/red/en/manitos-solidarias.md?astroContentCollectionEntry=true":"chunks/manitos-solidarias_1u9rii52.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/red/es/manitos-solidarias.md?astroContentCollectionEntry=true":"chunks/manitos-solidarias_5I4GlPFS.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/en/post-1.md?astroPropagatedAssets":"chunks/post-1_qJGsY-ee.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/en/post-2.md?astroPropagatedAssets":"chunks/post-2_BXjFkJIh.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/en/post-3.md?astroPropagatedAssets":"chunks/post-3_DOWR1dPf.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/en/post.md?astroPropagatedAssets":"chunks/post_GfEMdSFU.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/es/post-1.md?astroPropagatedAssets":"chunks/post-1_CIEkm1IJ.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/es/post-2.md?astroPropagatedAssets":"chunks/post-2_LT1nOafy.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/es/post-3.md?astroPropagatedAssets":"chunks/post-3_CJgR9MH9.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/es/post.md?astroPropagatedAssets":"chunks/post_D1b47G74.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/red/en/manitos-solidarias.md?astroPropagatedAssets":"chunks/manitos-solidarias_D-yXA_x6.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/red/es/manitos-solidarias.md?astroPropagatedAssets":"chunks/manitos-solidarias_DOdMP6gT.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/en/post-1.md":"chunks/post-1_4ZCw5PY7.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/en/post-2.md":"chunks/post-2_K-vMtekB.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/en/post-3.md":"chunks/post-3_BXiXRmzD.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/en/post.md":"chunks/post_wznWgTaF.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/es/post-1.md":"chunks/post-1_jPJNuv4o.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/es/post-2.md":"chunks/post-2_qkwQYg4r.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/es/post-3.md":"chunks/post-3_BAyz1lh7.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/blog/es/post.md":"chunks/post_CwazVJeX.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/red/en/manitos-solidarias.md":"chunks/manitos-solidarias_Xk5nF0nR.mjs","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/content/red/es/manitos-solidarias.md":"chunks/manitos-solidarias_Bc7iUs3a.mjs","/astro/hoisted.js?q=2":"_astro/hoisted.DunLaW_Q.js","@astrojs/react/client.js":"_astro/client.B3p-0cmE.js","/astro/hoisted.js?q=1":"_astro/hoisted.C2mrDoZc.js","astro:scripts/page.js":"_astro/page.BIe0mclZ.js","C:/Users/LDEVESA/Documents/Clientes/fge/fge-astro/src/components/slider-home.tsx":"_astro/slider-home.D7bePJjO.js","/astro/hoisted.js?q=0":"_astro/hoisted.B6z3CckA.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/fgeNewLogo.ChHWFhFr.svg","/_astro/fgeNewLogoBlanco.DHQgrgsp.svg","/_astro/_slug_.BMXcYhgK.css","/_astro/index.CWTUrSHB.css","/favicon.svg","/fonts/Evolventa-Bold.eot","/fonts/Evolventa-Bold.svg","/fonts/Evolventa-Bold.ttf","/fonts/Evolventa-Bold.woff","/fonts/Evolventa-Bold.woff2","/fonts/Evolventa-BoldOblique.eot","/fonts/Evolventa-BoldOblique.svg","/fonts/Evolventa-BoldOblique.ttf","/fonts/Evolventa-BoldOblique.woff","/fonts/Evolventa-BoldOblique.woff2","/fonts/Evolventa-Oblique.eot","/fonts/Evolventa-Oblique.svg","/fonts/Evolventa-Oblique.ttf","/fonts/Evolventa-Oblique.woff","/fonts/Evolventa-Oblique.woff2","/fonts/Evolventa-Regular.eot","/fonts/Evolventa-Regular.svg","/fonts/Evolventa-Regular.ttf","/fonts/Evolventa-Regular.woff","/fonts/Evolventa-Regular.woff2","/images/coin11.webp","/images/corazones.svg","/images/cuad.svg","/images/etica.jpg","/images/slider01.jpg","/images/slider02.jpg","/images/splash-blanco.svg","/images/splash.svg","/_astro/client.B3p-0cmE.js","/_astro/hoisted.B6z3CckA.js","/_astro/hoisted.C2mrDoZc.js","/_astro/hoisted.DunLaW_Q.js","/_astro/index.B0a9OMnn.css","/_astro/index.D3TkrQHj.js","/_astro/page.BIe0mclZ.js","/_astro/slider-home.D7bePJjO.js","/_astro/_commonjsHelpers.Cpj98o6Y.js","/pagefind/pagefind-entry.json","/pagefind/pagefind-highlight.js","/pagefind/pagefind-modular-ui.css","/pagefind/pagefind-modular-ui.js","/pagefind/pagefind-ui.css","/pagefind/pagefind-ui.js","/pagefind/pagefind.en_13d0eeb869.pf_meta","/pagefind/pagefind.en_13e310906f.pf_meta","/pagefind/pagefind.en_13e4e0d1e4.pf_meta","/pagefind/pagefind.en_3b5b5ef95a.pf_meta","/pagefind/pagefind.en_3d5bad8f9d.pf_meta","/pagefind/pagefind.en_535e8d5799.pf_meta","/pagefind/pagefind.en_5a73aa2823.pf_meta","/pagefind/pagefind.en_658628672b.pf_meta","/pagefind/pagefind.en_6e22147420.pf_meta","/pagefind/pagefind.en_77a4c37734.pf_meta","/pagefind/pagefind.en_96e940e4c3.pf_meta","/pagefind/pagefind.en_a3e3501928.pf_meta","/pagefind/pagefind.en_aabaf6eab6.pf_meta","/pagefind/pagefind.en_b3743687ac.pf_meta","/pagefind/pagefind.en_b761371495.pf_meta","/pagefind/pagefind.en_ca355dc9d3.pf_meta","/pagefind/pagefind.en_ca611b23b4.pf_meta","/pagefind/pagefind.en_cc217decb0.pf_meta","/pagefind/pagefind.en_d42c5c175d.pf_meta","/pagefind/pagefind.en_d72554a24b.pf_meta","/pagefind/pagefind.en_e68b9d1ddf.pf_meta","/pagefind/pagefind.es_2e1efa5ee2.pf_meta","/pagefind/pagefind.es_314ba4c5e3.pf_meta","/pagefind/pagefind.es_388e333a34.pf_meta","/pagefind/pagefind.es_38fbc99545.pf_meta","/pagefind/pagefind.es_3fdc209510.pf_meta","/pagefind/pagefind.es_5db85fe7ad.pf_meta","/pagefind/pagefind.es_5fc3f4f6dc.pf_meta","/pagefind/pagefind.es_73b69a10f3.pf_meta","/pagefind/pagefind.es_778251bafa.pf_meta","/pagefind/pagefind.es_8a42862d47.pf_meta","/pagefind/pagefind.es_8db33ecf68.pf_meta","/pagefind/pagefind.es_95d5bfe12b.pf_meta","/pagefind/pagefind.es_966d42496c.pf_meta","/pagefind/pagefind.es_a4462576b0.pf_meta","/pagefind/pagefind.es_b9438ae258.pf_meta","/pagefind/pagefind.es_c43486daeb.pf_meta","/pagefind/pagefind.es_cb47d52dc2.pf_meta","/pagefind/pagefind.es_cbff811a6b.pf_meta","/pagefind/pagefind.es_d663b3d871.pf_meta","/pagefind/pagefind.es_f21a177e25.pf_meta","/pagefind/pagefind.es_fc227963d8.pf_meta","/pagefind/pagefind.js","/pagefind/wasm.en.pagefind","/pagefind/wasm.es.pagefind","/pagefind/wasm.unknown.pagefind","/images/red/manitos-solidarias.jpg","/images/scrollbox/Asistencia-Alimentaria.jpg","/images/scrollbox/espacios-con-valores.jpg","/images/scrollbox/Formalizamos.jpg","/images/scrollbox/Referentes-al-Frente.jpg","/images/scrollbox/Una-Vuelta.jpg","/pagefind/fragment/en_166b18d.pf_fragment","/pagefind/fragment/en_16d5166.pf_fragment","/pagefind/fragment/en_1717456.pf_fragment","/pagefind/fragment/en_174a7d5.pf_fragment","/pagefind/fragment/en_189d392.pf_fragment","/pagefind/fragment/en_1e72182.pf_fragment","/pagefind/fragment/en_1ec461f.pf_fragment","/pagefind/fragment/en_2dd15a8.pf_fragment","/pagefind/fragment/en_2e888ec.pf_fragment","/pagefind/fragment/en_2fcd888.pf_fragment","/pagefind/fragment/en_318cc0f.pf_fragment","/pagefind/fragment/en_3a4f414.pf_fragment","/pagefind/fragment/en_3fa256d.pf_fragment","/pagefind/fragment/en_4669ebd.pf_fragment","/pagefind/fragment/en_4764251.pf_fragment","/pagefind/fragment/en_4fe168b.pf_fragment","/pagefind/fragment/en_557b4b3.pf_fragment","/pagefind/fragment/en_57cefe1.pf_fragment","/pagefind/fragment/en_5ae6b53.pf_fragment","/pagefind/fragment/en_5afaf2f.pf_fragment","/pagefind/fragment/en_5f4a36a.pf_fragment","/pagefind/fragment/en_611b1af.pf_fragment","/pagefind/fragment/en_662b9e4.pf_fragment","/pagefind/fragment/en_67ca1e3.pf_fragment","/pagefind/fragment/en_7835d69.pf_fragment","/pagefind/fragment/en_791fcca.pf_fragment","/pagefind/fragment/en_7a81cdd.pf_fragment","/pagefind/fragment/en_8478f24.pf_fragment","/pagefind/fragment/en_8e7f1fd.pf_fragment","/pagefind/fragment/en_92e5a56.pf_fragment","/pagefind/fragment/en_975a84c.pf_fragment","/pagefind/fragment/en_98a92e5.pf_fragment","/pagefind/fragment/en_9b653dc.pf_fragment","/pagefind/fragment/en_a0a3aa2.pf_fragment","/pagefind/fragment/en_a343680.pf_fragment","/pagefind/fragment/en_a6dc6ae.pf_fragment","/pagefind/fragment/en_abe0d26.pf_fragment","/pagefind/fragment/en_b56f90f.pf_fragment","/pagefind/fragment/en_b5b7161.pf_fragment","/pagefind/fragment/en_bae2d48.pf_fragment","/pagefind/fragment/en_bdfd7e5.pf_fragment","/pagefind/fragment/en_bf2dfbb.pf_fragment","/pagefind/fragment/en_c4fbb0f.pf_fragment","/pagefind/fragment/en_cb7416a.pf_fragment","/pagefind/fragment/en_cc869ba.pf_fragment","/pagefind/fragment/en_ce26c49.pf_fragment","/pagefind/fragment/en_d090614.pf_fragment","/pagefind/fragment/en_d0d8c24.pf_fragment","/pagefind/fragment/en_d677a5c.pf_fragment","/pagefind/fragment/en_dd80d49.pf_fragment","/pagefind/fragment/en_e49452a.pf_fragment","/pagefind/fragment/en_eee1fd7.pf_fragment","/pagefind/fragment/en_f64837a.pf_fragment","/pagefind/fragment/en_fdd1c3c.pf_fragment","/pagefind/fragment/es_074256b.pf_fragment","/pagefind/fragment/es_0997545.pf_fragment","/pagefind/fragment/es_1264703.pf_fragment","/pagefind/fragment/es_14212e6.pf_fragment","/pagefind/fragment/es_19d7c68.pf_fragment","/pagefind/fragment/es_1a6130d.pf_fragment","/pagefind/fragment/es_1ce7c97.pf_fragment","/pagefind/fragment/es_29b9de1.pf_fragment","/pagefind/fragment/es_2b15932.pf_fragment","/pagefind/fragment/es_2c1c603.pf_fragment","/pagefind/fragment/es_38731b8.pf_fragment","/pagefind/fragment/es_397153b.pf_fragment","/pagefind/fragment/es_3a0dbc8.pf_fragment","/pagefind/fragment/es_3ad2d79.pf_fragment","/pagefind/fragment/es_3df91c2.pf_fragment","/pagefind/fragment/es_42d4c84.pf_fragment","/pagefind/fragment/es_438f843.pf_fragment","/pagefind/fragment/es_4b81566.pf_fragment","/pagefind/fragment/es_51e6709.pf_fragment","/pagefind/fragment/es_5213a0d.pf_fragment","/pagefind/fragment/es_585db73.pf_fragment","/pagefind/fragment/es_5b7eadc.pf_fragment","/pagefind/fragment/es_5eb2a29.pf_fragment","/pagefind/fragment/es_6273f1b.pf_fragment","/pagefind/fragment/es_67d22a3.pf_fragment","/pagefind/fragment/es_6e96def.pf_fragment","/pagefind/fragment/es_6f895ca.pf_fragment","/pagefind/fragment/es_727b2bd.pf_fragment","/pagefind/fragment/es_72e3c81.pf_fragment","/pagefind/fragment/es_7838ffa.pf_fragment","/pagefind/fragment/es_788db77.pf_fragment","/pagefind/fragment/es_7a88a91.pf_fragment","/pagefind/fragment/es_7c7efe8.pf_fragment","/pagefind/fragment/es_7dc9923.pf_fragment","/pagefind/fragment/es_7f2c2d4.pf_fragment","/pagefind/fragment/es_8375e86.pf_fragment","/pagefind/fragment/es_84c795e.pf_fragment","/pagefind/fragment/es_8a2fd4f.pf_fragment","/pagefind/fragment/es_8f136e7.pf_fragment","/pagefind/fragment/es_8fcead6.pf_fragment","/pagefind/fragment/es_961a148.pf_fragment","/pagefind/fragment/es_9bef873.pf_fragment","/pagefind/fragment/es_9f17611.pf_fragment","/pagefind/fragment/es_ab32549.pf_fragment","/pagefind/fragment/es_b197b1d.pf_fragment","/pagefind/fragment/es_ba8908b.pf_fragment","/pagefind/fragment/es_bcadecc.pf_fragment","/pagefind/fragment/es_d1ec42d.pf_fragment","/pagefind/fragment/es_e2889ef.pf_fragment","/pagefind/fragment/es_e296b22.pf_fragment","/pagefind/fragment/es_e815e7d.pf_fragment","/pagefind/fragment/es_e9b1d5a.pf_fragment","/pagefind/fragment/es_f023242.pf_fragment","/pagefind/fragment/es_f4e5f88.pf_fragment","/pagefind/index/en_2c6a54f.pf_index","/pagefind/index/en_7033269.pf_index","/pagefind/index/en_88e9292.pf_index","/pagefind/index/en_8c92e8b.pf_index","/pagefind/index/en_9d42a5a.pf_index","/pagefind/index/en_a57dab7.pf_index","/pagefind/index/en_ac912c5.pf_index","/pagefind/index/en_bd1a08e.pf_index","/pagefind/index/en_c18bb05.pf_index","/pagefind/index/en_c453ad9.pf_index","/pagefind/index/es_1c51167.pf_index","/pagefind/index/es_7557bb7.pf_index","/pagefind/index/es_7ae4bd1.pf_index","/pagefind/index/es_a8c3bff.pf_index","/pagefind/index/es_ad404ba.pf_index","/pagefind/index/es_ccbc10b.pf_index","/pagefind/index/es_e2621fa.pf_index","/pagefind/index/es_ea17ccf.pf_index","/pagefind/index/es_fa2b47e.pf_index","/_astro/page.BIe0mclZ.js","/en/about-us/index.html","/en/contact/index.html","/en/join-us/index.html","/en/what-we-do/index.html","/en/index.html","/es/contacto/index.html","/es/nosotros/index.html","/es/que-hacemos/index.html","/es/sumate/index.html","/es/index.html","/index.html","/index.html"],"i18n":{"fallback":{"en":"es"},"strategy":"pathname-prefix-always","locales":["es","en"],"defaultLocale":"es","domainLookupTable":{}},"buildFormat":"directory"});

export { AstroIntegrationLogger as A, Logger as L, getEventPrefix as g, levels as l, manifest };

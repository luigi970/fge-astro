import{g as t,S as e}from"./hoisted._WdOVM38.js";import"./hoisted.C2mrDoZc.js";t.registerPlugin(e);document.addEventListener("astro:page-load",()=>{const a=t.utils.toArray(".desktopContentSection:not(:first-child)"),r=t.utils.toArray(".desktopPhoto:not(:first-child)");t.set(r,{yPercent:100,autoAlpha:0});const i=t.utils.toArray(".desktopPhoto");t.matchMedia().add("(min-width: 720px)",()=>(e.create({trigger:"#gallery",start:"top 70px",end:"bottom bottom",pin:"#right"}),a.forEach((l,o)=>{console.log("forEach",o);let s=l.querySelector("h2"),n=t.timeline().to(r[o],{yPercent:0,autoAlpha:1,duration:.8}).to(i[o],{autoAlpha:0,duration:.5},.8);e.create({trigger:s,start:"top 80%",end:"top 30%",animation:n,scrub:!0,markers:!0})}),()=>{console.log("mobile")}))});
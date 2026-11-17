const { chromium } = require('playwright');
const star = (x,y,s,c='#b8860b') => `<polygon points="${x},${y-s} ${x+s*0.55},${y} ${x},${y+s} ${x-s*0.55},${y}" fill="${c}" transform="rotate(18 ${x} ${y})"/>`;
function lines(w,h,n,seed){ let p=''; for(let i=0;i<n;i++){const y=h*(i+.5)/n; const a=h*0.18*Math.sin(i*seed);
 p+=`<path d="M-50 ${y+a} C ${w*.3} ${y-h*.25+a}, ${w*.6} ${y+h*.3-a}, ${w+50} ${y-a}" fill="none" stroke="#0d1612" stroke-opacity="${0.05+0.05*((i%3)/2)}" stroke-width="1.2"/>`;} return p;}
const cover=`<svg xmlns="http://www.w3.org/2000/svg" width="1584" height="396" viewBox="0 0 1584 396"><rect width="1584" height="396" fill="#f2f0eb"/>${lines(1584,396,16,1.7)}
<rect x="1010" y="168" width="330" height="40" fill="#f2d35a" opacity=".0"/>${star(1330,198,46)}${star(1424,120,14,'#0d1612')}</svg>`;
const pfp=`<html><body style="margin:0"><div style="width:1000px;height:1000px;background:#f2f0eb;position:relative;overflow:hidden">
<div style="position:absolute;left:0;right:0;top:50px;text-align:center;font:400 640px/1 'Bodoni 72','Bodoni 72 Oldstyle',Didot,serif;color:#0d1612">Z</div>
<svg style="position:absolute;left:0;top:0" width="1000" height="1000">${star(745,300,62)}</svg></div></body></html>`;
(async()=>{const b=await chromium.launch();
 let p=await b.newPage({viewport:{width:1000,height:1000}});
 await p.setContent(pfp);await p.screenshot({path:'zkk-profile.png'});
 p=await b.newPage({viewport:{width:1584,height:396}});
 await p.setContent('<body style="margin:0">'+cover);await p.screenshot({path:'zkk-linkedin-cover.png'});
 await b.close();})();

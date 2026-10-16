// Seated actions use independent active-time timelines. No torso or chair moves.
const clamp = v => Math.max(0, Math.min(1, v));
const ease = v => { const t=clamp(v); return t*t*(3-2*t); };
const mix = (a,b,t) => a+(b-a)*t;
const point = (a,b,t) => [mix(a[0],b[0],t),mix(a[1],b[1],t)];
export function sampleActivity(time,index) {
 const elapsed=time-4-index*3.7, period=25+index*2.3;
 if(elapsed<0) return {kind:'typing',phase:0,reach:0};
 const cycle=Math.floor(elapsed/period), phase=elapsed-cycle*period;
 if(phase>=8) return {kind:'typing',phase:0,reach:0};
 return {kind:['sip','phone','scratch'][(cycle+index)%3],phase,reach:ease(phase/.65)*ease((8-phase)/.65)};
}
const actors = [
 {shoulder:[584,250],elbow:[582,269],hand:[616,271],cup:[586,278],mouth:[619,235],temple:[582,202],side:-1,scale:.73,skin:['#ffdae6','#ed83ac'],eyes:[[601,218,7.2,8],[638,215,5.5,7]],mask:'M576 241 Q591 242 600 263 L624 264 L630 278 L591 282 L566 278 Q566 251 576 241Z'},
 {shoulder:[1473,253],elbow:[1479,273],hand:[1446,274],cup:[1477,280],mouth:[1439,238],temple:[1480,210],side:1,scale:.74,skin:['#f0fcff','#9ecbe8'],eyes:[[1422,221,5.7,7],[1457,224,7.2,8]],mask:'M1471 244 Q1492 251 1490 279 L1468 283 L1430 281 L1428 270 L1456 265Z'},
 {shoulder:[580,452],elbow:[572,474],hand:[610,482],cup:[574,496],mouth:[626,436],temple:[580,405],side:-1,scale:1,skin:['#fff1ee','#e99da9'],eyes:[[607,421,9.4,11],[647,415,7.5,9]],mask:'M571 440 Q587 441 596 462 L598 473 Q617 471 625 479 L627 489 L600 493 L559 486 Q558 457 571 440Z'},
 {shoulder:[1504,458],elbow:[1504,482],hand:[1468,487],cup:[1503,500],mouth:[1458,440],temple:[1514,411],side:1,scale:1,skin:['#ffe0f1','#de83c4'],eyes:[[1441,421,6.2,8],[1485,426,9,10]],mask:'M1502 446 Q1523 453 1522 491 L1496 496 L1452 493 L1450 481 L1480 476 Q1483 450 1502 446Z'},
];

/** A small transparent layer for eyelids and articulated arms/props. */
export function createOfficeActivity(baseCanvas,images) {
 const doc=baseCanvas.ownerDocument;
 const canvas=doc.createElement('canvas');
 canvas.className='neutral-hero-image office-activity-canvas';canvas.setAttribute('aria-hidden','true');
 baseCanvas.after(canvas);
 const ctx=canvas.getContext('2d'),plates={},masks=actors.map(a=>new Path2D(a.mask));
 let disposed=false;
 for(const theme of ['light','dark']) {
  const image=new Image();
  image.src=new URL(`./assets/office-clean-${theme}.webp`,import.meta.url).href;
  image.onload=()=>{if(!disposed) plates[theme]=image;};
 }
 function patch(image,path,opacity=1) {
  ctx.save();ctx.globalAlpha=opacity;ctx.clip(path);ctx.drawImage(image,0,0,2048,683);ctx.restore();
 }
 function stroke(points,width,color) {
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
  ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.stroke();
 }
 function arm(a,hand,phase,kind,alpha,theme) {
  const s=a.scale, sh=a.shoulder;
  // A bent elbow stays outside the torso. Only two arm bones articulate.
  const raised=clamp((a.hand[1]-hand[1])/(55*s));
  const elbow=[mix(a.elbow[0],sh[0]+a.side*20*s,raised),mix(a.elbow[1],sh[1]+10*s,raised)];
  ctx.save();ctx.globalAlpha=alpha;
  const gradient=ctx.createLinearGradient(sh[0]-12*s,sh[1]-8*s,sh[0]+10*s,elbow[1]+9*s);
  gradient.addColorStop(0,'#216bb9');gradient.addColorStop(.45,'#06489b');gradient.addColorStop(1,'#02245b');
  const wrist=point(elbow,hand,.79);
  stroke([sh,elbow,wrist],18*s,'#032960');stroke([sh,elbow,wrist],17*s,gradient);
  // Soft cylindrical shading and short cloth folds keep the sleeve rounded.
  stroke([sh,elbow,wrist],11*s,'#1762b855');
  stroke([[sh[0]-a.side*3*s,sh[1]], [elbow[0]-a.side*3*s,elbow[1]-2*s], [wrist[0],wrist[1]-3*s]],2*s,'#77b4f339');
  stroke([[elbow[0]-7*s,elbow[1]+1*s],[elbow[0]-1*s,elbow[1]+4*s],[elbow[0]+5*s,elbow[1]+1*s]],1.1*s,'#001c4870');
  stroke([point(wrist,hand,.05),point(wrist,hand,.25)],14*s,'#09458d');
  const skin=ctx.createLinearGradient(hand[0],hand[1]-8*s,hand[0],hand[1]+8*s);
  skin.addColorStop(0,a.skin[0]);skin.addColorStop(1,a.skin[1]);
  ctx.translate(...hand);ctx.rotate(kind==='scratch'?a.side*1.05:kind==='phone'?a.side*.4:0);ctx.translate(-hand[0],-hand[1]);
  ctx.fillStyle=skin;ctx.strokeStyle=a.skin[1];ctx.lineWidth=.7*s;
  ctx.beginPath();ctx.ellipse(hand[0],hand[1],10*s,6.8*s,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Four small digits are clearly separated, with local tapping/scratching.
  for(let j=0;j<4;j++) {
   const f=kind==='scratch'?Math.sin(phase*14+j)*1.4*s:kind==='phone'?Math.sin(phase*7+j)*.5*s:0;
   const x=hand[0]+(j-1.5)*4*s;
   stroke([[x,hand[1]+1*s],[x-a.side*1.5*s,hand[1]+(7+(j===3?-2:0))*s+f]],3.8*s,a.skin[1]);
   stroke([[x-.4*s,hand[1]],[x-a.side*1.5*s-.4*s,hand[1]+(6+(j===3?-2:0))*s+f]],2.8*s,skin);
  }
  ctx.restore();
 }
 function cup(a,position,angle,theme) {
  const s=a.scale;
  ctx.save();ctx.translate(...position);ctx.rotate(angle);
  // An isolated ceramic body and handle: no rectangular background travels with it.
  ctx.lineWidth=3.5*s;ctx.strokeStyle='#0664ff';ctx.beginPath();
  ctx.ellipse(a.side*13*s,0,5*s,8*s,0,0,Math.PI*2);ctx.stroke();
  ctx.save();ctx.beginPath();ctx.moveTo(-12*s,-13*s);
  ctx.bezierCurveTo(-12*s,-18*s,12*s,-18*s,12*s,-13*s);
  ctx.lineTo(11*s,12*s);ctx.quadraticCurveTo(0,17*s,-11*s,12*s);ctx.closePath();ctx.clip();
  const source=images[theme];ctx.translate(-a.cup[0],-a.cup[1]);ctx.drawImage(source,0,0,2048,683);
  ctx.restore();ctx.restore();
 }
 function restoreMug(a,theme) {
  const s=a.scale,path=new Path2D();
  path.roundRect(a.cup[0]-18*s,a.cup[1]-16*s,36*s,31*s,3*s);
  patch(images[theme],path);
 }
 function phone(a,position,angle=0) {
  const s=a.scale;ctx.save();ctx.translate(...position);ctx.rotate(angle);
  ctx.shadowColor='#0005';ctx.shadowBlur=2*s;ctx.fillStyle='#111a2e';
  ctx.beginPath();ctx.roundRect(-7*s,-17*s,14*s,25*s,2.5*s);ctx.fill();ctx.shadowBlur=0;
  const glow=ctx.createLinearGradient(-5*s,-15*s,5*s,5*s);glow.addColorStop(0,'#94d7ff');glow.addColorStop(1,'#0758d9');
  if(Math.abs(angle)>.7) {
   ctx.fillStyle=glow;ctx.fillRect(-5*s,-14*s,10*s,18*s);
   ctx.fillStyle='#f1faff';ctx.fillRect(-3*s,-9*s,6*s,1.3*s);ctx.fillRect(-3*s,-5*s,4*s,1.2*s);
  } else {
   ctx.fillStyle='#23334e';ctx.fillRect(-5*s,-14*s,10*s,18*s);
   ctx.fillStyle='#090f1c';ctx.beginPath();ctx.arc(-2.6*s,-11*s,1.5*s,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#bddbfc';ctx.beginPath();ctx.arc(-2.8*s,-11.3*s,.5*s,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
 }
 function blink(a,time,index,kind) {
  const period=4.1+index*.83,local=(time+index*1.37)%period;
  // A quick asymmetric close/open, with an occasional second blink.
  let amount=local<.105?ease(local/.105):local<.30?1-ease((local-.105)/.195):0;
  if(Math.floor(time/period)%3===1 && local>.43&&local<.63) amount=Math.sin((local-.43)/.2*Math.PI);
  if(kind==='phone') amount=Math.max(amount,.18);
  if(amount<.005)return;
  for(const [x,y,rx,ry] of a.eyes) {
   ctx.save();ctx.beginPath();ctx.ellipse(x,y,rx+1,ry+1,0,0,Math.PI*2);ctx.clip();
   const gradient=ctx.createLinearGradient(x,y-ry,x,y+ry);gradient.addColorStop(0,a.skin[0]);gradient.addColorStop(1,a.skin[1]);
   ctx.fillStyle=gradient;
   const edge=y-ry-1+(ry+1)*amount, lower=y+ry+1-(ry+1)*amount;
   ctx.fillRect(x-rx-2,y-ry-2,rx*2+4,edge-(y-ry-2));
   ctx.fillRect(x-rx-2,lower,rx*2+4,y+ry+2-lower);
   ctx.strokeStyle=a.skin[1];ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-rx,edge-1);ctx.quadraticCurveTo(x,edge+1.5,x+rx,edge-1);ctx.stroke();
   ctx.restore();
  }
 }
 function draw(time,theme,states) {
  if(disposed||!ctx)return;
  if(canvas.width!==baseCanvas.width||canvas.height!==baseCanvas.height){canvas.width=baseCanvas.width;canvas.height=baseCanvas.height;}
  ctx.setTransform(canvas.width/2048,0,0,canvas.height/683,0,0);ctx.clearRect(0,0,2048,683);
  const plate=plates[theme];
  actors.forEach((a,i)=>{
   const action=states[i],s=a.scale;
   let kind=plate?action.kind:'typing';
   const phoneRest=[a.cup[0]-a.side*25*s,a.cup[1]+2*s];
   if(kind==='typing'){phone(a,phoneRest,Math.PI*.46);blink(a,time,i,kind);return;}
   const p=action.phase;
   patch(plate,masks[i],action.reach);
   if(theme==='dark' && plates.light) {
    const cloth=new Path2D();const centers=[[582,260],[1476,264],[579,464],[1509,474]];
    cloth.ellipse(centers[i][0],centers[i][1],10*s,12*s,0,0,Math.PI*2);
    ctx.save();ctx.filter='brightness(0.82)';patch(plates.light,cloth,action.reach);ctx.restore();
   }
   let hand=a.hand;
   if(kind==='sip') {
    const grab=[a.cup[0]-a.side*12*s,a.cup[1]-6*s];
    const raised=[a.mouth[0]+a.side*12*s,a.mouth[1]+7*s];
    const lift=ease((p-1.25)/1.2)*(1-ease((p-4.6)/1.4));
    const reach=ease(p/1.05)*(1-ease((p-6.25)/1.75));
    const cupPos=point(a.cup,[a.mouth[0],a.mouth[1]+9*s],lift);
    hand=point(a.hand,point(grab,raised,lift),reach);
    const mugMask=new Path2D();mugMask.roundRect(a.cup[0]-19*s,a.cup[1]-20*s,38*s,36*s,3*s);
    if(lift>0)patch(plate,mugMask);
    else restoreMug(a,theme);
    arm(a,hand,p,kind,action.reach,theme);
    if(lift>0)cup(a,cupPos,-a.side*.22*lift,theme);
    phone(a,phoneRest,Math.PI*.46);
   } else if(kind==='phone') {
    restoreMug(a,theme);
    const raised=[a.shoulder[0]-a.side*16*s,a.shoulder[1]+2*s];
    const lift=ease((p-1.1)/1.2)*(1-ease((p-5.3)/1.3));
    const grab=[phoneRest[0],phoneRest[1]-2*s];
    const reach=ease(p/1.1)*(1-ease((p-6.5)/1.5));
    hand=point(a.hand,point(grab,raised,lift),reach);
    arm(a,hand,p,kind,action.reach,theme);
    phone(a,point(phoneRest,[raised[0],raised[1]-5*s],lift),mix(Math.PI*.46,-a.side*.13,lift));
   } else {
    restoreMug(a,theme);
    const reach=ease(p/1.45)*(1-ease((p-5.6)/2.4));
    hand=point(a.hand,[a.temple[0]+Math.sin(p*13)*1.8*s,a.temple[1]+Math.sin(p*11)*2*s],reach);
    arm(a,hand,p,kind,action.reach,theme);phone(a,phoneRest,Math.PI*.46);
   }
   // Action paths remain on the worker's side of the monitor.
   blink(a,time,i,kind);
  });
  canvas.dataset.ready=baseCanvas.dataset.ready;
 }
 return {draw,ready:theme=>!!ctx&&!!plates[theme],hide(){canvas.dataset.ready='false';},destroy(){disposed=true;canvas.remove();}};
}

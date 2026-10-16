import { createOfficeClock } from './office-clock.js';
import { createOfficeActivity, sampleActivity } from './office-activity.js?v=seated-2';

// Coordinates are authored against the approved 2048 × 683 composition.
// Only these feathered areas move. The camera, architecture and lettering stay still.
// Hands are independently timed; shoulders, torso and chair remain fixed.
const regions=[
 // x, y, rx, ry, horizontal px, vertical px, radians, speed, phase
 [617,270,17,11,.45,3.6,0,11.1,.1], [640,264,11,10,.3,3.0,0,12.2,1.8],
 [1418,267,12,10,.3,3.0,0,10.7,2.0], [1441,273,17,11,.5,3.8,0,11.5,4.1],
 [609,483,19,12,.6,4.2,0,11.8,3.2], [646,474,11,11,.4,3.5,0,10.9,.5],
 [1438,477,11,11,.4,3.7,0,11.3,5.0], [1467,487,18,12,.6,4.1,0,10.5,2.4],
 // Sparse surviving plants; cleared columns are never warped.
 [356,218,32,50,.9,.2,.004,.55,.6], [1668,204,33,52,.9,.2,.004,.48,1.8],
 [395,448,49,55,.8,.2,.003,.51,2.7], [1657,451,50,57,.8,.2,.003,.58,5.1],
 // The soft tips of the gills flex gently without moving a head.
 [550,201,24,29,0,1.4,.008,.9,.4], [661,191,16,24,0,1.2,.008,.83,1.2],
 [1402,200,15,27,0,1.3,.008,.93,2.1], [1507,215,20,26,0,1.4,.008,.88,4.2],
 [548,397,24,38,0,1.7,.009,.84,3.1], [671,380,13,26,0,1.5,.008,.91,1.4],
 [1422,389,15,31,0,1.4,.008,.87,2.6], [1537,408,22,35,0,1.8,.009,.95,4.5]
];
const vertex=`attribute vec2 a_position;varying vec2 v_uv;
void main(){v_uv=vec2(a_position.x*.5+.5,.5-a_position.y*.5);gl_Position=vec4(a_position,0.,1.);}`;
const fragment=`precision highp float;
varying vec2 v_uv;uniform sampler2D u_image;uniform float u_time;uniform float u_night;
uniform vec4 u_regions[${regions.length}];uniform vec4 u_moves[${regions.length}];
float area(vec2 p,vec2 c,vec2 r){vec2 q=(p-c)/r;return 1.-smoothstep(.15,1.,dot(q,q));}
float steam(vec2 p,vec2 cup,float phase){
 float h=cup.y-p.y;
 if(h<0.||h>39.)return 0.;
 float x=p.x-cup.x-sin(h*.15-u_time*1.4+phase)*(1.4+h*.08);
 float w=1.1+h*.035;
 return exp(-x*x/(w*w))*sin(h/39.*3.14159)*(.055+.025*sin(h*.20-u_time*1.6+phase));
}
void main(){
 vec2 p=v_uv*vec2(2048.,683.);vec2 samplePoint=p;
 for(int i=0;i<${regions.length};i++){
  vec4 r=u_regions[i];vec2 q=p-r.xy;vec2 n=q/r.zw;
  float d=dot(n,n);
  if(d<1.){
   vec4 m=u_moves[i];float weight=1.-smoothstep(.20,1.,d);
   samplePoint+=(m.xy+vec2(q.x*m.w-q.y*m.z,q.x*m.z+q.y*m.w))*weight;
  }
 }
 vec3 color=texture2D(u_image,samplePoint/vec2(2048.,683.)).rgb;
 float fade=min(u_time,1.);
 float light=(.5+.5*sin(u_time*.75)) * area(p,vec2(622.,279.),vec2(48.,15.));
 light+=(.5+.5*sin(u_time*.63+2.))*area(p,vec2(1430.,282.),vec2(45.,15.));
 light+=(.5+.5*sin(u_time*.80+4.))*area(p,vec2(624.,492.),vec2(47.,17.));
 light+=(.5+.5*sin(u_time*.57+1.))*area(p,vec2(1452.,496.),vec2(48.,17.));
 color+=vec3(.014,.032,.06)*light*mix(.15,1.,u_night)*fade;
 float mist=steam(p,vec2(239.,267.),0.)+steam(p,vec2(1905.,292.),4.);
 color=mix(color,vec3(.86,.89,.94),mist*mix(.75,1.35,u_night)*fade);
 gl_FragColor=vec4(color,1.);
}`;

/** Native, local-only 2.5D scene. Failure always reveals the matching PNG underneath. */
export function createOfficeScene(canvas, images, onStatus=()=>{}){
 const win=canvas.ownerDocument.defaultView,doc=canvas.ownerDocument;
 const activity=createOfficeActivity(canvas,images);
 let gl=null,program=null,buffer=null,uniforms=null,textures={},shaders=[],validated=false;
 let active=false,paused=false,intersecting=true,pageActive=true,disposed=false,lost=false,failed=false,theme='light',status='';
 const values=new Float32Array(regions.length*4),layout=new Float32Array(regions.flatMap(r=>r.slice(0,4)));
 const emit=value=>{if(value!==status){status=value;onStatus(value);}};
 const clock=createOfficeClock({request:fn=>win.requestAnimationFrame(fn),cancel:id=>win.cancelAnimationFrame(id),draw:render});
 function available(){return !disposed&&!failed&&!lost&&!!textures[theme];}
 function moving(){return available()&&active&&!paused&&intersecting&&pageActive&&!doc.hidden;}
 function sync(){
  if(disposed)return;
  if(moving()){clock.start();emit('running');}
  else {clock.stop();emit(failed?'unavailable':lost||!textures[theme]?'loading':paused?'paused':'inactive');}
 }
 function fail(){failed=true;clock.stop();canvas.dataset.ready='false';activity.hide();emit('unavailable');}
 function compile(type,source){
  const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('Office shader unavailable');
  return shader;
 }
 function initialize(){
  program=gl.createProgram();shaders=[];validated=false;
  gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Office renderer unavailable');
  gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  uniforms=Object.fromEntries(['image','time','night','regions','moves'].map(name=>[name,gl.getUniformLocation(program,'u_'+name+(['regions','moves'].includes(name)?'[0]':''))]));
  gl.uniform1i(uniforms.image,0);gl.uniform4fv(uniforms.regions,layout);
 }
 function loadImage(key){
  const image=images[key];if(disposed||lost||failed||!image?.complete||!image.naturalWidth)return;
  try{
   if(textures[key])gl.deleteTexture(textures[key]);
   const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
   if(gl.getError()!==gl.NO_ERROR){gl.deleteTexture(texture);throw new Error('Office texture unavailable');}
   textures[key]=texture;
   if(key===theme){resize();render(clock.time);sync();}
  }catch{fail();}
 }
 function render(time){
  if(!available())return;
  try{
   const fade=Math.min(1,time);
   const states=Array.from({length:4},(_,i)=>sampleActivity(time,i));
   regions.forEach((r,i)=>{
    const phase=time*r[7]+r[8],angle=r[6]*Math.sin(phase*.79)*fade;
    values[i*4]=r[4]*Math.sin(phase*.71)*fade;
    // Typing has brief independent rests, with no whole-body bobbing.
    const typing=i<8;
    const working=!typing||((!activity.ready(theme)||states[Math.floor(i/2)].kind==='typing')&&Math.sin(time*.63+Math.floor(i/2)*1.7)>-.8);
    if(typing&&!working)values[i*4]=0;
    values[i*4+1]=working?r[5]*(typing?Math.max(0,Math.sin(phase)):Math.sin(phase))*fade:0;
    values[i*4+2]=Math.sin(angle);values[i*4+3]=Math.cos(angle)-1;
   });
   gl.useProgram(program);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures[theme]);
   gl.uniform4fv(uniforms.moves,values);gl.uniform1f(uniforms.time,time);gl.uniform1f(uniforms.night,theme==='dark'?1:0);
   gl.drawArrays(gl.TRIANGLES,0,6);
   if(!validated){if(gl.getError()!==gl.NO_ERROR)throw new Error('Office frame unavailable');validated=true;}
   canvas.dataset.ready='true';
   activity.draw(time,theme,states);
  }catch{fail();}
 }
 function resize(){
  if(disposed||!gl||lost)return;
  const rect=canvas.parentElement.getBoundingClientRect();if(!rect.width||!rect.height)return;
  // Match the physical display up to the native artwork resolution.
  // Never force a low-resolution canvas on Retina screens.
  const nativeWidth=images[theme]?.naturalWidth||2172;
  const width=Math.round(Math.min(nativeWidth,Math.max(720,Math.max(rect.width,rect.height*3)*Math.min(win.devicePixelRatio||1,2)))/3)*3;
  if(canvas.width!==width){canvas.width=width;canvas.height=width/3;gl.viewport(0,0,width,width/3);}
  render(clock.time);
 }
 function contextLost(event){event.preventDefault();lost=true;clock.stop();canvas.dataset.ready='false';activity.hide();sync();}
 function contextRestored(){
  if(disposed)return;
  try{lost=false;failed=false;textures={};initialize();for(const key of ['light','dark'])loadImage(key);resize();sync();}catch{fail();}
 }
 const loaded={light:()=>loadImage('light'),dark:()=>loadImage('dark')};
 const imageFailed=()=>fail();
 function visibility(){sync();}
 function pageHide(){pageActive=false;sync();}
 function pageShow(){pageActive=true;sync();}
 let resizeObserver=null,intersectionObserver=null;
 try{
  if(!win.WebGLRenderingContext)throw new Error('No WebGL');
  gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power',preserveDrawingBuffer:false});
  if(!gl)throw new Error('No WebGL');
  initialize();
  for(const key of ['light','dark']){
   images[key].addEventListener('load',loaded[key]);
   images[key].addEventListener('error',imageFailed);
   if(images[key].complete&&!images[key].naturalWidth)fail();
   else loadImage(key);
  }
  if(win.ResizeObserver){resizeObserver=new win.ResizeObserver(resize);resizeObserver.observe(canvas.parentElement);}
  if(win.IntersectionObserver){intersectionObserver=new win.IntersectionObserver(entries=>{intersecting=entries[0].isIntersecting;sync();});intersectionObserver.observe(canvas.parentElement);}
  canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
  doc.addEventListener('visibilitychange',visibility);win.addEventListener('pagehide',pageHide);win.addEventListener('pageshow',pageShow);
  resize();sync();
 }catch{fail();}
 return {
  setActive(value){active=value;sync();},
  setPaused(value){paused=value;sync();},
  setTheme(value){theme=value==='dark'?'dark':'light';canvas.dataset.ready='false';activity.hide();render(clock.time);sync();},
  destroy(){
   if(disposed)return;disposed=true;clock.destroy();activity.destroy();resizeObserver?.disconnect();intersectionObserver?.disconnect();
   for(const key of ['light','dark']){
    images[key]?.removeEventListener('load',loaded[key]);
    images[key]?.removeEventListener('error',imageFailed);
   }
   canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);
   doc.removeEventListener('visibilitychange',visibility);win.removeEventListener('pagehide',pageHide);win.removeEventListener('pageshow',pageShow);
   if(gl&&!lost){for(const texture of Object.values(textures))gl.deleteTexture(texture);for(const shader of shaders)gl.deleteShader(shader);if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);}
   canvas.dataset.ready='false';
  }
 };
}

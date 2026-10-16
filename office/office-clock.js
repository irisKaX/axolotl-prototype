/** One capped animation clock; stopped time never advances the office. */
export function createOfficeClock({request, cancel, draw, fps=30}) {
 let frame=null, running=false, disposed=false, last=null, lastDraw=null, elapsed=0;
 const interval=1000/fps;
 function tick(now){
  frame=null;if(!running||disposed)return;
  if(last!==null)elapsed+=Math.min(.1,Math.max(0,(now-last)/1000));
  last=now;
  if(lastDraw===null||now-lastDraw>=interval-.5){lastDraw=now;draw(elapsed);}
  if(running&&!disposed)frame=request(tick);
 }
 function stop(){running=false;if(frame!==null)cancel(frame);frame=null;last=lastDraw=null;}
 return {get time(){return elapsed;},start(){if(running||disposed)return;running=true;frame=request(tick);},stop,destroy(){stop();disposed=true;}};
}

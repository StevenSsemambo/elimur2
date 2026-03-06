let _ctx = null, _on = true
function ac() {
  if (!_ctx) try { _ctx = new (window.AudioContext || window.webkitAudioContext)() } catch(e) { return null }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}
function tone(a, freq, type, t, dur, vol=0.25) {
  try {
    const o = a.createOscillator(), g = a.createGain()
    o.connect(g); g.connect(a.destination)
    o.type=type; o.frequency.setValueAtTime(freq,t)
    g.gain.setValueAtTime(0.001,t); g.gain.linearRampToValueAtTime(vol,t+0.015)
    g.gain.exponentialRampToValueAtTime(0.001,t+dur)
    o.start(t); o.stop(t+dur+0.05)
  } catch(e) {}
}
export const SoundEngine = {
  setEnabled(v) { _on=v }, isEnabled() { return _on },
  tap()           { if(!_on)return; const a=ac();if(!a)return; tone(a,280,'sine',a.currentTime,0.08,0.1) },
  correct()       { if(!_on)return; const a=ac();if(!a)return; const t=a.currentTime; tone(a,523.25,'sine',t,0.18,0.28); tone(a,659.25,'sine',t+0.13,0.25,0.32) },
  wrong()         { if(!_on)return; const a=ac();if(!a)return; const t=a.currentTime; tone(a,220,'sawtooth',t,0.12,0.2); tone(a,165,'sawtooth',t+0.1,0.15,0.12) },
  quizComplete()  { if(!_on)return; const a=ac();if(!a)return; const t=a.currentTime; tone(a,523.25,'triangle',t,0.18,0.30); tone(a,659.25,'triangle',t+0.16,0.18,0.32); tone(a,783.99,'triangle',t+0.32,0.40,0.38); tone(a,1046.5,'sine',t+0.32,0.35,0.12) },
  xpEarned()      { if(!_on)return; const a=ac();if(!a)return; const t=a.currentTime; [880,1108,1318,1568,1760].forEach((f,i)=>tone(a,f,'sine',t+i*0.05,0.12,0.14)) },
  badgeUnlocked() { if(!_on)return; const a=ac();if(!a)return; const t=a.currentTime; [392,493,587,698,783].forEach((f,i)=>tone(a,f,'triangle',t+i*0.09,0.22,0.25)) },
  streakMilestone(){ if(!_on)return; const a=ac();if(!a)return; const t=a.currentTime; [523,659,783,1046].forEach((f,i)=>tone(a,f,'sine',t+i*0.1,0.28,0.28)) },
  timerComplete() { if(!_on)return; const a=ac();if(!a)return; const t=a.currentTime; [0,0.35,0.7].forEach(d=>{tone(a,440,'sine',t+d,0.22,0.3);tone(a,880,'sine',t+d+0.04,0.18,0.1)}); tone(a,660,'triangle',t+1.0,0.45,0.35) },
}
export const Haptics = {
  tap()           { try{navigator.vibrate?.(8)}catch(e){} },
  correct()       { try{navigator.vibrate?.(40)}catch(e){} },
  wrong()         { try{navigator.vibrate?.([50,30,50])}catch(e){} },
  badgeUnlocked() { try{navigator.vibrate?.(180)}catch(e){} },
  timerDone()     { try{navigator.vibrate?.([80,40,80,40,160])}catch(e){} },
}

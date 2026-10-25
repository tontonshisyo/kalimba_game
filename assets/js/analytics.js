(() => {
  'use strict';
  const localPage = location.protocol !== 'https:' || !['otoiro.pages.dev','tontonshisyo.github.io'].includes(location.hostname);
  let enabled = !localPage && navigator.globalPrivacyControl !== true && navigator.doNotTrack !== '1';
  let visitor, session;
  try {
    enabled = enabled && localStorage.getItem('otoiro-analytics') !== 'off';
    if (enabled) {
      visitor = localStorage.getItem('otoiro-visitor') || crypto.randomUUID();
      localStorage.setItem('otoiro-visitor', visitor);
      session = sessionStorage.getItem('otoiro-session') || crypto.randomUUID();
      sessionStorage.setItem('otoiro-session', session);
    }
  } catch { enabled = false; }
  let queue=[], config, sending=false, timer=0;
  const environment = () => ({
    device: navigator.maxTouchPoints > 0 ? (Math.min(screen.width,screen.height)<600 ? 'mobile':'tablet') : 'desktop',
    orientation: matchMedia('(orientation: landscape)').matches?'landscape':'portrait',
    browser: /Edg\//.test(navigator.userAgent)?'edge':/Firefox\//.test(navigator.userAgent)?'firefox':/Chrome\/|CriOS\//.test(navigator.userAgent)?'chrome':/Safari\//.test(navigator.userAgent)?'safari':'other'
  });
  async function flush() {
    clearTimeout(timer);
    timer=0;
    if(!enabled||sending||!queue.length)return;
    sending=true;
    const batch=queue.splice(0,20);
    try {
      if(!config){const r=await fetch('assets/data/community-config.json',{cache:'no-store'});if(!r.ok)throw Error();config=await r.json();}
      if(!enabled)return;
      const response=await fetch(config.url+'/functions/v1/usage',{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({visitor,session,events:batch}),keepalive:true,signal:AbortSignal.timeout(10000)});
      if(!response.ok && response.status!==429)throw Error();
    } catch { /* Analytics must never interrupt play or repeatedly retry on failure. */ }
    finally {sending=false;if(enabled&&queue.length)timer=setTimeout(flush,20000);}
  }
  function track(event,props={}) {
    if(!enabled)return;
    if(queue.length>=60)queue.shift();
    queue.push({id:crypto.randomUUID(),event,props:{...environment(),...props}});
    if(!timer)timer=setTimeout(()=>{timer=0;flush();},20000);
  }
  window.OtoiroAnalytics=Object.freeze({track});
  const features={tutorialButton:'tutorial',freeRecordButton:'free_record',freeReplayButton:'free_replay',freeMetronomeButton:'free_metronome',freeVideoButton:'free_video',makeFreeVideoButton:'free_video',shareResultImageButton:'result_image',downloadShareButton:'share_copy',sendShareButton:'share_send',sortChartButton:'sort_chart',previewChartButton:'preview_chart',testPlayButton:'test_chart',loadChartButton:'load_chart',startRecordingButton:'new_recording',overdubRecordingButton:'overdub_recording',saveChartButton:'save_chart',saveNewChartButton:'save_chart',freeDisplayToggle:'display'};
  const settings={freeTuningMode:'tuning',freeSignature:'tuning',freeTonic:'tuning',noteSpeedSetting:'note_speed',practiceTempoSetting:'practice_speed',volumeSetting:'volume',keyColorPreset:'key_colors',quantizeSetting:'quantize',creatorMeter:'meter',creatorKeySignature:'signature'};
  document.addEventListener('click',e=>{const id=e.target.closest?.('button')?.id;if(features[id])track('ui_click',{feature:features[id]});});
  document.addEventListener('change',e=>{if(settings[e.target.id])track('settings_change',{feature:settings[e.target.id]});});
  matchMedia('(orientation: landscape)').addEventListener('change',()=>track('orientation'));
  let previous=performance.now();
  setInterval(()=>{const now=performance.now();if(!document.hidden)track('engaged',{seconds:Math.min(60,(now-previous)/1000)});previous=now;},60000);
  document.addEventListener('visibilitychange',()=>{previous=performance.now();if(document.hidden)flush();});
  window.addEventListener('pagehide',()=>flush());
  document.addEventListener('DOMContentLoaded',()=>{
    const button=document.getElementById('analyticsToggle');
    if(button){
      const render=()=>{button.textContent='改善のための利用統計：'+(enabled?'ON':'OFF');button.setAttribute('aria-pressed',String(enabled));};
      render();
      button.addEventListener('click',()=>{
        if(localPage||navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'){button.textContent='この環境では統計を送信しません';return;}
        enabled=!enabled;queue=[];clearTimeout(timer);timer=0;
        try{localStorage.setItem('otoiro-analytics',enabled?'on':'off');if(!enabled){localStorage.removeItem('otoiro-visitor');sessionStorage.removeItem('otoiro-session');}else{visitor=crypto.randomUUID();session=crypto.randomUUID();localStorage.setItem('otoiro-visitor',visitor);sessionStorage.setItem('otoiro-session',session);}}catch{enabled=false;}
        render();if(enabled)track('visit',{source:'direct'});
      });
    }
    track('visit',{source:location.hash.startsWith('#s=')?'short':location.hash.startsWith('#song=')?'long':'direct'});
  });
})();

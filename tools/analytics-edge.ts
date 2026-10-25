// Public publishable-key endpoint; writes are service-only and rate limited.
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
const uuid=(s:unknown)=>typeof s==='string'&&/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(s);
const names=new Set(['visit','engaged','ui_click','settings_change','orientation','game_start','game_finish','game_exit','game_pause','free_start','free_exit','recording_start','recording_end','song_saved','share_created','share_shortened','share_failed','share_copied','share_sent','share_cancelled','shared_open','shared_failed','transport','feedback_sent']);
const enums:Record<string,string[]>={mode:['normal','practice','tutorial','test','free','new','overdub'],device:['mobile','tablet','desktop'],orientation:['portrait','landscape'],browser:['safari','chrome','firefox','edge','other'],source:['direct','long','short'],reason:['finish','exit','discard','save'],difficulty:['0','1','2','3'],feature:['tutorial','free_record','free_replay','free_metronome','free_video','result_image','share_copy','share_send','sort_chart','preview_chart','test_chart','load_chart','new_recording','overdub_recording','save_chart','feedback','contact','tuning','display','note_speed','practice_speed','volume','key_colors','quantize','meter','signature','other_setting']};
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.headers.get('apikey')!=='sb_publishable_KkEOrUbd4KEPvXlBcltE4Q_Uh1Qvm0Y')return reply({},401);
 if(req.method!=='POST')return reply({},405);
 try{
  const reader=req.body?.getReader();if(!reader)return reply({},400);let length=0;const chunks:Uint8Array[]=[];
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>24000){await reader.cancel();return reply({},413);}chunks.push(value);}
  const bytes=new Uint8Array(length);let pos=0;for(const chunk of chunks){bytes.set(chunk,pos);pos+=chunk.length;}
  const raw=JSON.parse(new TextDecoder().decode(bytes));
  if(!uuid(raw.visitor)||!uuid(raw.session)||!Array.isArray(raw.events)||raw.events.length<1||raw.events.length>20)return reply({},400);
  const events=[];
  for(const e of raw.events){
   if(!uuid(e.id)||!names.has(e.event))return reply({},400);
   const props:Record<string,unknown>={};
   for(const [key,values] of Object.entries(enums))if(values.includes(String(e.props?.[key])))props[key]=String(e.props[key]);
   for(const key of ['seconds','score','perfect','good','miss','extra','combo','notes','bpm','accuracy','tempo','speed'])if(typeof e.props?.[key]==='number'&&Number.isFinite(e.props[key]))props[key]=Math.max(0,Math.min(2000000,e.props[key]));
   // Titles, URLs, hashes, free text, IP addresses and chart content are never accepted.
   if(typeof e.props?.song==='string'){
    const song=e.props.song;
    props.song=/^(twinkle|maryHadALittleLamb|user-catalog-[a-f0-9]{24,32}|user-\d{13}-[a-z0-9]{5}|user-20261024-canon-share)$/.test(song)?song:'custom';
   }
   events.push({id:e.id,event:e.event,props});
  }
  const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret+':usage:'+new Date().toISOString().slice(0,10)+':'+ip)))].map(n=>n.toString(16).padStart(2,'0')).join('');
  const response=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/rpc/ingest_usage',{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({p_client:hash,p_visitor:raw.visitor,p_session:raw.session,p_events:events})});
  if(!response.ok){const error=await response.text();return reply({},error.includes('RATE_LIMIT')?429:503);}
  return reply({accepted:await response.json()});
 }catch{return reply({},400);}
});

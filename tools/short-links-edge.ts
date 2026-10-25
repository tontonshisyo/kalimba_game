// Deploy as short-links, verify_jwt=false: public API-key validation is below.
const publicKey = 'sb_publishable_KkEOrUbd4KEPvXlBcltE4Q_Uh1Qvm0Y';
const headers = { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'apikey, content-type', 'Access-Control-Allow-Methods':'GET, POST, OPTIONS', 'Content-Type':'application/json', 'Cache-Control':'no-store' };
const reply = (data: unknown, status=200) => new Response(JSON.stringify(data),{status,headers});
const digest = async (s: string) => [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(n=>n.toString(16).padStart(2,'0')).join('');
async function rpc(name: string, data: unknown) {
 const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
 const r=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(data)});
 if(!r.ok) { const text=await r.text(); throw Error(text.includes('RATE_LIMIT')?'RATE_LIMIT':'SERVER'); }
 return r.json();
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.headers.get('apikey')!==publicKey)return reply({error:'UNAUTHORIZED'},401);
 try {
  if(req.method==='GET') {
   const id=new URL(req.url).searchParams.get('id')||'';
   if(!/^[a-f0-9]{24}$/.test(id))return reply({error:'INVALID_ID'},400);
   const song=await rpc('read_shared_chart',{p_id:id});
   return song?reply({song}):reply({error:'NOT_FOUND'},404);
  }
  if(req.method!=='POST')return reply({error:'METHOD'},405);
  const reader=req.body?.getReader(); if(!reader)return reply({error:'INVALID'},400);
  const chunks: Uint8Array[]=[];let length=0;
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>131072){await reader.cancel();return reply({error:'TOO_LARGE'},413);}chunks.push(value);}
  const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
  const raw=JSON.parse(new TextDecoder().decode(bytes));
  if(typeof raw.name!=='string'||!raw.name.trim()||raw.name.trim().length>40||!Number.isInteger(raw.bpm)||raw.bpm<30||raw.bpm>240||!['C','G','D','A','E','B','Fs','Cs','F','Bb','Eb','Ab','Db','Gb','Cb'].includes(raw.keySignature||'C')||![null,2,3,4,5,6].includes(raw.meter??4)||!Array.isArray(raw.steps)||!raw.steps.length||raw.steps.length>2000)return reply({error:'INVALID'},400);
  const seen=new Set();
  for(const n of raw.steps){if(!Array.isArray(n)||n.length!==2||!Number.isFinite(n[0])||n[0]<0||n[0]>20000||!Number.isInteger(n[1])||n[1]<0||n[1]>16||seen.has(n.join(':')))return reply({error:'INVALID'},400);seen.add(n.join(':'));}
  const steps=raw.steps.map((n: number[])=>[...n]).sort((a: number[],b: number[])=>a[0]-b[0]||a[1]-b[1]);
  // Reject only extreme bursts: more than 80 tones in any second.
  let left=0;for(let right=0;right<steps.length;right++){while((steps[right][0]-steps[left][0])*30/raw.bpm>=1)left++;if(right-left+1>80)return reply({error:'TOO_DENSE'},400);}
  const song={name:raw.name.trim(),bpm:raw.bpm,keySignature:raw.keySignature||'C',steps,meter:raw.meter===undefined?4:raw.meter};
  const fingerprint=await digest(JSON.stringify(song));
  // Use the originating address, not the changing internal gateway peer.
  const chain=(req.headers.get('x-forwarded-for')||req.headers.get('x-real-ip')||'unknown').split(',');
  const client=await digest(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!+':'+chain[0].trim());
  const id=await rpc('store_shared_chart',{p_client:client,p_song:song,p_fingerprint:fingerprint,p_id:crypto.randomUUID().replaceAll('-','').slice(0,24)});
  return reply({id});
 }catch(e){return reply({error:e instanceof Error&&e.message==='RATE_LIMIT'?'RATE_LIMIT':'SERVER'},e instanceof Error&&e.message==='RATE_LIMIT'?429:500);}
});

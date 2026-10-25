const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(x:unknown,status=200)=>new Response(JSON.stringify(x),{status,headers});
const uuid=(x:unknown)=>typeof x==='string'&&/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(x);
const hash=async(s:string)=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return reply({},405);
 if(req.headers.get('apikey')!=='sb_publishable_KkEOrUbd4KEPvXlBcltE4Q_Uh1Qvm0Y')return reply({},401);
 try{
 const reader=req.body?.getReader();if(!reader)return reply({},400);let size=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();return reply({},413);}chunks.push(value);}
 const data=new Uint8Array(size);let pos=0;for(const c of chunks){data.set(c,pos);pos+=c.length;}
 const body=JSON.parse(new TextDecoder().decode(data));
 if(!uuid(body.voter)||!Array.isArray(body.ids)||!body.ids.length||body.ids.length>25||!body.ids.every(uuid)||body.id!==undefined&&(!uuid(body.id)||!body.ids.includes(body.id)||![-1,0,1].includes(body.vote)))return reply({},400);
 const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
 const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
 const r=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/rpc/feedback_vote_action',{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({p_client:await hash(secret+':vote-ip:'+ip),p_voter:await hash(secret+':voter:'+body.voter),p_ids:body.ids,p_id:body.id??null,p_vote:body.vote??null})});
 if(!r.ok){const error=await r.text();return reply({},error.includes('RATE_LIMIT')?429:error.includes('NOT_FOUND')?404:500);}
 return reply(await r.json());
 }catch{return reply({},400);}
});

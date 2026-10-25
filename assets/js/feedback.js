(() => {
  "use strict";
  const form = document.getElementById("betaFeedbackForm");
  const field = document.getElementById("feedbackMessage");
  const button = document.getElementById("feedbackSend");
  const status = document.getElementById("feedbackStatus");
  let busy = false, config, configPromise, listBusy = false, offset = 0;
  const states = { reviewing: "検討中", planned: "実装予定", implemented: "実装済み" };
  const categories = { idea: "感想・アイデア", bug: "不具合", other: "その他" };
  const consent = document.getElementById("feedbackPublicConsent");
  const list = document.getElementById("feedbackList");
  const listStatus = document.getElementById("feedbackListStatus");
  const more = document.getElementById("feedbackMore");
  const voteControls = new Map();
  let voter = crypto.randomUUID(), canVote = true;
  try { voter = localStorage.getItem('otoiro-feedback-voter') || voter; localStorage.setItem('otoiro-feedback-voter', voter); }
  catch { canVote = false; }
  async function requestVotes(ids, id, vote) {
    const connection=await getConfig();
    const response=await fetch(connection.url+'/functions/v1/feedback-votes',{method:'POST',headers:{apikey:connection.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({voter,ids,...(id?{id,vote}:{})}),cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw Error(response.status===429?'操作が続いています。少し待ってお試しください。':'票を取得・更新できませんでした。一覧を更新してお試しください。');
    return response.json();
  }
  function applyVotes(rows) {
    for(const row of rows){const control=voteControls.get(row.id);if(!control)continue;control.mine=Number(row.mine);control.agree.textContent=`賛成 ${row.agree}`;control.disagree.textContent=`反対 ${row.disagree}`;control.agree.setAttribute('aria-pressed',String(control.mine===1));control.disagree.setAttribute('aria-pressed',String(control.mine===-1));control.agree.disabled=control.disagree.disabled=!canVote;}
  }
  async function getConfig() {
    if (config) return config;
    if (!configPromise) configPromise = (async () => {
      const result = await fetch("assets/data/community-config.json", { cache: "no-store", signal: AbortSignal.timeout(15000) });
      if (!result.ok) throw new Error("接続設定を読み込めませんでした。");
      const candidate = await result.json();
      if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(candidate.url) || !/^sb_publishable_/.test(candidate.publishableKey)) throw new Error("意見箱は準備中です。");
      config = candidate;
      return config;
    })().catch((error) => { configPromise = null; throw error; });
    return configPromise;
  }
  async function loadFeedback(reset = true) {
    if (listBusy) return;
    listBusy = true;
    document.getElementById("feedbackReload").disabled = true;
    more.disabled = true;
    listStatus.textContent = "読み込んでいます…";
    try {
      const connection = await getConfig();
      const nextOffset = reset ? 0 : offset;
      const response = await fetch(`${connection.url.replace(/\/$/, "")}/rest/v1/beta_feedback?select=id,category,message,created_at,status,admin_reply&order=created_at.desc,id.desc&limit=25&offset=${nextOffset}`, {
        headers: { apikey: connection.publishableKey }, cache: "no-store", signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) throw new Error("一覧を読み込めませんでした。しばらくしてから「一覧を更新」を押してください。");
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error("意見の形式が正しくありません。");
      if (reset) { list.replaceChildren(); voteControls.clear(); }
      for (const row of rows) {
        if (typeof row.message !== "string" || !Object.hasOwn(states, row.status)) continue;
        const article = document.createElement("article"); article.className = "feedback-entry";
        const badge = document.createElement("span"); badge.className = `feedback-state ${row.status}`; badge.textContent = states[row.status];
        const info = document.createElement("small"); info.textContent = ` ${categories[row.category] || "意見"} · ${new Date(row.created_at).toLocaleDateString("ja-JP")}`;
        const message = document.createElement("p"); message.textContent = row.message;
        article.append(badge, info, message);
        const votes=document.createElement('div');votes.className='feedback-votes';
        const agree=document.createElement('button'), disagree=document.createElement('button');
        const voteStatus=document.createElement('small');voteStatus.setAttribute('role','status');
        const control={agree,disagree,mine:0};voteControls.set(row.id,control);
        for(const [target,value,label]of [[agree,1,'賛成'],[disagree,-1,'反対']]){
          target.type='button';target.className='creator-button';target.textContent=label+' …';target.disabled=true;target.setAttribute('aria-pressed','false');
          target.addEventListener('click',async()=>{
            if(agree.disabled||disagree.disabled)return;
            agree.disabled=disagree.disabled=true;voteStatus.textContent='送信中…';
            try{const result=await requestVotes([row.id],row.id,control.mine===value?0:value);if(!result.length)throw Error('この意見は公開されていません。');applyVotes(result);voteStatus.textContent=control.mine===0?'投票を取り消しました。':'投票しました。';}
            catch(error){voteStatus.textContent=error.message;}
            finally{agree.disabled=disagree.disabled=!canVote;}
          });
        }
        if(!canVote)voteStatus.textContent='投票にはブラウザーの保存機能が必要です。';
        votes.append(agree,disagree,voteStatus);article.append(votes);
        if (row.admin_reply) {
          const reply = document.createElement("div"); reply.className = "feedback-admin-reply";
          const title = document.createElement("strong"); title.textContent = "管理者からの返信";
          const text = document.createElement("p"); text.textContent = row.admin_reply;
          reply.append(title, text); article.append(reply);
        }
        list.append(article);
      }
      offset = nextOffset + rows.length;
      more.hidden = rows.length < 25;
      listStatus.textContent = offset ? `${offset}件の意見を表示しています。` : "公開された意見はまだありません。";
      if(rows.length){try{applyVotes(await requestVotes(rows.map(row=>row.id)));}catch(error){listStatus.textContent+=' '+error.message;}}
    } catch (error) { listStatus.textContent = error.message; }
    finally { listBusy = false; document.getElementById("feedbackReload").disabled = false; more.disabled = false; }
  }
  document.getElementById("feedbackReload").addEventListener("click", () => loadFeedback(true));
  more.addEventListener("click", () => loadFeedback(false));
  document.getElementById('feedback').addEventListener("toggle", (event) => { if (event.target.open) loadFeedback(true); });
  document.getElementById('privateContactForm').addEventListener('submit', async event => {
    event.preventDefault(); const form=event.currentTarget, field=document.getElementById('privateContactMessage'), message=field.value.trim(), status=document.getElementById('privateContactStatus'), button=form.querySelector('button');
    if(!message || message.length>2000)return;button.disabled=true;status.textContent='送信しています…';
    try { const config=await getConfig();const response=await fetch(`${config.url}/rest/v1/beta_feedback`,{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({category:'other',message,is_public:false}),signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('送信できませんでした。時間をおいてお試しください。');if(field.value.trim()===message)field.value='';status.textContent='管理者に送信しました。一般には公開されません。'; }catch(error){status.textContent='送信できませんでした。入力内容は残しています。';}finally{button.disabled=false;}
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!consent.checked) { status.textContent = "内容が公開されることを確認し、チェックを入れてください。"; return; }
    const message = field.value.trim();
    if (!message || message.length > 2000) { status.textContent = "内容を1〜2000文字で入力してください。"; return; }
    const category = document.getElementById("feedbackCategory").value;
    if (!["idea", "bug", "other"].includes(category)) return;
    busy = true;
    button.disabled = true;
    status.textContent = "送信しています…";
    try {
      await getConfig();
      const response = await fetch(`${config.url.replace(/\/$/, "")}/rest/v1/beta_feedback`, {
        method: "POST", headers: { apikey: config.publishableKey, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ category, message, is_public: true }), signal: AbortSignal.timeout(15000)
      });
      if (response.status === 404) throw new Error("意見箱は受付の準備中です。しばらくしてからお試しください。");
      if (!response.ok) throw new Error("送信できませんでした。入力内容を残してありますので、しばらくしてから再度お試しください。");
      if (field.value.trim() === message) { field.value = ""; consent.checked = false; }
      status.textContent = "送信しました。内容が一覧に公開されます。";
      if (listBusy) listStatus.textContent = "投稿しました。一覧にない場合は「一覧を更新」を押してください。";
      else await loadFeedback(true);
    } catch (error) {
      status.textContent = error.name === "TimeoutError" || error.name === "TypeError" ? "通信できませんでした。入力内容を残してありますので、接続を確認して再度お試しください。" : error.message;
    } finally { busy = false; button.disabled = false; }
  });
})();

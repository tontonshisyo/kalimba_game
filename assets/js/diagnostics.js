(() => {
  'use strict';
  const errors=[];
  function record(message){errors.push(String(message).slice(0,300));if(errors.length>5)errors.shift();}
  window.addEventListener('error',event=>record(event.message||'ファイルを読み込めませんでした'));
  window.addEventListener('unhandledrejection',event=>record(event.reason?.message||'処理を完了できませんでした'));
  document.addEventListener('DOMContentLoaded',()=>{
    const details=document.createElement('details');details.className='game-settings';
    const title=document.createElement('summary');title.textContent='動作情報・不具合の報告';
    const text=document.createElement('p');text.textContent='問題が起きたら、動作情報をコピーしてお問い合わせに添えてください。情報は自動送信しません。';
    const button=document.createElement('button');button.type='button';button.className='creator-button';button.textContent='動作情報をコピー';
    button.onclick=async()=>{const report=`おといろ 公開準備版 2026-10-25\n${navigator.userAgent}\n画面 ${innerWidth}×${innerHeight}\nオンライン ${navigator.onLine}\n${errors.join('\n')||'記録されたエラーなし'}`;try{await navigator.clipboard.writeText(report);text.textContent='コピーしました。お問い合わせ本文に貼り付けてください。'}catch{const field=document.createElement('textarea');field.value=report;details.append(field);field.select();}};
    const link=document.createElement('a');link.href='index.html#contact';link.textContent='非公開のお問い合わせ';details.append(title,text,button,document.createTextNode(' '),link);document.querySelector('.home-footer')?.before(details);
  });
})();

# 曲の投稿機能と管理者による公式曲公開

一般ユーザーの曲投稿機能は無効です。既存の投稿データは削除されず、管理画面からも表示しません。ブラウザー内で作成した曲は、引き続き共有リンクで渡せます。操作方法は [SHARING.md](SHARING.md) を参照してください。

管理者は管理画面で譜面を作成して「曲を登録して全員に公開」できます。公開した曲は全利用者の曲一覧に追加され、管理画面から削除できます。

## Supabaseの設定

1. 既存環境では、必要に応じて [community-sharing-only.sql](community-sharing-only.sql) を実行し、一般ユーザーの投稿・閲覧権限を無効にします。既存データは削除しません。
2. [admin-published-songs.sql](admin-published-songs.sql) をSupabase SQL Editorで実行し、管理者公開曲テーブルとRLSポリシーを作成します。このSQLは [community-schema.sql](community-schema.sql) の otoiro_valid_notes 関数と、既存の otoiro_admins テーブルを使用します。
3. 管理者として登録済みのアカウントで管理画面へログインし、曲を作成・公開します。

community-config.json は管理画面と意見箱、公開曲の読み込みに使用します。Supabaseの移行を実行するまでは、管理画面の公開曲操作と一般利用者への公開は利用できません。

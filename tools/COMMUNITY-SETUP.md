# 曲投稿の廃止とファイル共有への移行

一般公開の曲一覧と投稿APIは廃止しました。新しい操作方法は [SHARING.md](SHARING.md) を参照してください。

既存のSupabase環境では community-sharing-only.sql を実行すると、曲の一般閲覧・投稿権限を取り消し、管理者専用の閲覧・削除権限だけを残します。今回の対象プロジェクトには適用済みです。データ自体は削除しません。

community-config.json は意見箱と管理画面で引き続き使用します。曲の作成・保存・共有にはSupabaseを使用しません。
community-schema.sql も、今後実行して一般公開が再開されない設定に変更済みです。


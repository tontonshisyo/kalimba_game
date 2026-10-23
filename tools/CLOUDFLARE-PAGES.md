# Cloudflare Pagesへの移行

GitHubはソースの保管先として使い続け、公開先だけCloudflare Pagesへ変更できます。
Cloudflare側でPagesプロジェクトの作成とGitHubリポジトリへのアクセス許可を行ってください。

## ビルド設定

| 項目 | 値 |
| --- | --- |
| リポジトリ | kalimba_game |
| 本番ブランチ | main |
| Framework preset | None |
| Build command | node tools/build-site.mjs |
| Build output directory | dist |
| Root directory | 空欄（リポジトリのルート） |

プロジェクト名が公開用の *.pages.dev の名前になります。例えば otoiro-game なら、その名前が利用可能な場合に otoiro-game.pages.dev を使えます。
ビルドではゲーム用ファイルだけをdistへコピーし、製作者向け操作の非表示用CSSも適用します。SQL・設定手順・開発ツールをサイトに配信しません。
管理画面は既存と同じ manage-7a3d9c2e.html で開けます。実際のデータ操作には従来どおり認証と管理者権限が必要です。

## 共有リンク

共有リンクは開いているサイトのURLを使います。Cloudflare Pagesや独自ドメインで開くと、そのURLで生成されます。
GitHub Pagesで開いた画面ではGitHub PagesのURLになります。固定の正規URLが必要な場合は window.OTOIRO_PUBLIC_URL に指定できます。
ローカルファイル・localhostでの共有リンク生成には公開URLの設定が必要です。
既存リンクの #song= 以降の譜面データは移行後も互換です。

ドメインが変わるとブラウザー内の保存曲・設定は自動では引き継がれません。移行前に必要な曲の共有リンクを控え、移行後のURLに #song= 以降を付けて開き、保存してください。
新しいサイトで演奏・共有・意見箱を確認してから、旧サイトの案内や転送を設定します。
広告タグの導入や独自ドメインの取得は、この準備には含みません。

公式手順:
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/


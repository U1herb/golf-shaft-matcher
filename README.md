# ゴルフ シャフト候補アプリ

Vite + Reactで作った、ドライバー/アイアン向けのシャフト候補シミュレーターです。

画面上に「試作版」と表示しています。URLを知っている人だけが使う前提の簡易公開向けです。

## ローカルで動かす

```powershell
npm install
npm run dev
```

表示されたURLをブラウザで開きます。通常は次のようなURLです。

```text
http://127.0.0.1:5176/
```

## ビルド確認

```powershell
npm run build
```

成功すると `dist` フォルダが生成されます。Vercelはこの `dist` を公開します。

## Notionアップロードを使う準備

Notionへ直接アップロードする場合は、Notion Integration Tokenが必要です。

1. NotionのIntegrationページを開く  
   https://www.notion.so/profile/integrations

2. Internal Integrationを作成し、Internal Integration Secretをコピー

3. ローカルでは `.env.local` に設定

```env
NOTION_TOKEN=secret_から始まる実際のトークン
```

4. Notionの `for_share` ページを開き、右上の `...` から対象Integrationを接続

5. devサーバーを再起動

## Vercelで公開する手順

### 1. GitHubにリポジトリを作る

GitHubで新しいリポジトリを作ります。例:

```text
golf-shaft-matcher
```

### 2. このフォルダをGitHubにpushする

初回だけ次を実行します。

```powershell
git init
git add .
git commit -m "Initial Vercel-ready app"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/golf-shaft-matcher.git
git push -u origin main
```

`.env.local` は `.gitignore` で除外しています。Notion tokenはGitHubにpushしないでください。

### 3. VercelにImportする

1. https://vercel.com/new を開く
2. GitHubリポジトリを選択
3. Framework Presetが `Vite` になっていることを確認
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Deployを押す

このプロジェクトには `vercel.json` を入れているので、通常は自動認識されます。

### 4. Vercelに環境変数を入れる

VercelのProject Settingsで次を設定します。

```text
Name: NOTION_TOKEN
Value: secret_から始まる実際のトークン
Environment: Production
```

設定後、VercelでRedeployしてください。

## 公開後の使い方

Vercelの公開URLを知っている人は、PCやスマホからアクセスできます。

Notionへ直接アップロードを押すと、Notionの `for_share` 配下に診断結果ページが作られます。見やすいHTML形式の診断結果は、Notionページ内にHTMLファイルとして添付されます。

## スマホ表示の確認

以下を確認してください。

- 入力フォームが1列で表示される
- 結果カードが横にはみ出さない
- `Notionへ直接アップロード` ボタンが画面幅に収まる
- スコア、スペック、比較差分が重ならない

ブラウザの開発者ツールで iPhone SE / iPhone 14 相当の幅にすると確認しやすいです。

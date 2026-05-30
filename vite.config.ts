import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

const NOTION_FOR_SHARE_PAGE_ID = "2d1f5833-8f65-80fe-9d2f-c6c051a83d0d";
const NOTION_FOR_SHARE_URL = "https://www.notion.so/2d1f58338f6580fe9d2fc6c051a83d0d?pvs=1";
const NOTION_VERSION = "2026-03-11";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildShareHtml(payload: any) {
  const form = payload.form ?? {};
  const results = Array.isArray(payload.results) ? payload.results : [];
  const selectedOwnedShaft = payload.selectedOwnedShaft;
  const generatedAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  const cards = results
    .map((result: any, index: number) => {
      const shaft = result.shaft ?? {};
      const reasons = Array.isArray(result.reasons) ? result.reasons : [];
      const differences = Array.isArray(result.differences) ? result.differences : [];
      const bars = [
        ["手元", shaft.buttStiffness],
        ["中間", shaft.midStiffness],
        ["先端", shaft.tipStiffness],
      ];

      return `
        <article class="shaft-card">
          <div class="rank">#${index + 1}</div>
          <div class="shaft-main">
            <div class="shaft-title">
              <div>
                <h2>${escapeHtml(shaft.name)}</h2>
                <p>${escapeHtml(shaft.comment)}</p>
              </div>
              <div class="score"><strong>${escapeHtml(result.score)}</strong><span>相性スコア</span></div>
            </div>
            <div class="flex-recommendation">
              <strong>推奨フレックス: ${escapeHtml(result.recommendedFlex)}</strong>
              <span>${escapeHtml(payload.speedLabel)} ${escapeHtml(form.headSpeed)}m/s から算出</span>
            </div>
            <div class="spec-grid">
              <span>重量帯<strong>${escapeHtml(shaft.weight)}</strong></span>
              <span>トルク<strong>${escapeHtml(Number(shaft.torque).toFixed(1))}</strong></span>
              <span>推奨速度<strong>${escapeHtml(shaft.speedRange?.[0])}-${escapeHtml(shaft.speedRange?.[1])} m/s</strong></span>
              <span>弾道傾向<strong>${escapeHtml(shaft.trajectory)}</strong></span>
            </div>
            <div class="card-bottom">
              <div class="ei-chart">
                ${bars
                  .map(
                    ([label, value]) => `
                      <div class="ei-bar">
                        <div class="ei-track"><span style="height:${escapeHtml(value)}%"></span></div>
                        <strong>${escapeHtml(label)}</strong><small>${escapeHtml(value)}</small>
                      </div>`,
                  )
                  .join("")}
              </div>
              <div class="reasons">
                <h3>なぜおすすめか</h3>
                <ul>${reasons.map((reason: string) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>
              </div>
            </div>
            ${
              selectedOwnedShaft
                ? `<div class="difference-box">
                    <h3>${escapeHtml(selectedOwnedShaft.name)} との差</h3>
                    <p>${escapeHtml(result.compareTone)}</p>
                    <div class="diff-grid">${differences.map((item: string) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
                  </div>`
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>シャフト診断結果</title>
  <style>
    :root { color: #18211d; background: #eef1ed; font-family: "Yu Gothic", Meiryo, system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; background: linear-gradient(135deg, rgba(35,77,54,.08), transparent 32%), radial-gradient(circle at top right, rgba(198,167,80,.18), transparent 34%), #eef1ed; }
    .page { max-width: 1180px; margin: 0 auto; }
    .hero { display: flex; justify-content: space-between; gap: 24px; align-items: flex-end; margin-bottom: 22px; }
    .eyebrow { margin: 0 0 8px; color: #567062; font-size: 12px; font-weight: 800; text-transform: uppercase; }
    h1 { margin: 0 0 10px; font-size: 44px; line-height: 1.05; color: #102018; }
    p { margin-top: 0; color: #52615b; }
    .notice { max-width: 360px; padding: 14px 16px; border: 1px solid #d5dcd4; border-left: 4px solid #be8f1b; border-radius: 8px; background: rgba(255,255,255,.78); color: #44391d; font-weight: 700; }
    .conditions, .shaft-card { border: 1px solid #d8dfd7; border-radius: 8px; background: rgba(255,255,255,.92); box-shadow: 0 18px 40px rgba(22,31,26,.08); }
    .conditions { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 8px; padding: 14px; margin-bottom: 16px; }
    .conditions span, .spec-grid span, .diff-grid span { display: grid; gap: 4px; padding: 10px; border-radius: 8px; background: #f8faf8; color: #607169; font-size: 12px; font-weight: 800; }
    .conditions strong, .spec-grid strong { color: #17231d; font-size: 14px; }
    .results { display: grid; gap: 16px; }
    .shaft-card { display: grid; grid-template-columns: 54px 1fr; overflow: hidden; }
    .rank { display: grid; place-items: center; background: #173523; color: #f4d58a; font-size: 18px; font-weight: 950; }
    .shaft-main { padding: 20px; }
    .shaft-title, .card-bottom, .flex-recommendation { display: flex; gap: 16px; justify-content: space-between; align-items: flex-start; }
    .shaft-title h2 { margin: 0 0 7px; font-size: 22px; }
    .score { display: grid; min-width: 96px; min-height: 96px; place-items: center; border: 1px solid #ead79a; border-radius: 8px; background: #fff8df; color: #173523; }
    .score strong { font-size: 34px; line-height: 1; }
    .score span { font-size: 11px; font-weight: 900; }
    .flex-recommendation { margin-top: 16px; padding: 12px 14px; border: 1px solid #d9e2dc; border-radius: 8px; background: #f2f7f3; }
    .spec-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 8px; margin: 18px 0; }
    .ei-chart { display: grid; grid-template-columns: repeat(3,56px); gap: 10px; min-width: 188px; padding: 14px; border-radius: 8px; background: #eef4ef; }
    .ei-bar { display: grid; grid-template-rows: 110px auto auto; gap: 6px; justify-items: center; color: #385246; font-size: 12px; font-weight: 900; }
    .ei-track { display: flex; align-items: flex-end; width: 28px; height: 110px; overflow: hidden; border-radius: 999px; background: #d7e0d7; }
    .ei-track span { display: block; width: 100%; border-radius: 999px; background: linear-gradient(180deg,#d0a538,#245d3c); }
    .reasons, .difference-box { flex: 1; padding: 14px 16px; border: 1px solid #e0e6df; border-radius: 8px; background: #fff; }
    .reasons h3, .difference-box h3 { margin: 0 0 8px; color: #1f5d3a; font-size: 15px; }
    .reasons ul { display: grid; gap: 6px; margin: 0; padding-left: 18px; color: #3d4c45; }
    .difference-box { margin-top: 16px; background: #f6faf8; }
    .difference-box p { margin-bottom: 10px; color: #263d32; font-weight: 900; }
    .diff-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 7px; }
    .footer { margin-top: 18px; color: #607169; font-size: 12px; }
    @media (max-width: 760px) { body { padding: 14px; } .hero, .shaft-title, .card-bottom, .flex-recommendation { display: grid; } h1 { font-size: 32px; } .conditions, .spec-grid, .diff-grid { grid-template-columns: 1fr 1fr; } .shaft-card { grid-template-columns: 1fr; } .rank { min-height: 40px; } }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <div>
        <p class="eyebrow">${escapeHtml(form.clubMode === "driver" ? "Driver" : "Iron")} Shaft Matching Report</p>
        <h1>シャフト診断結果</h1>
        <p>${escapeHtml(form.headName || "未入力")} に合う候補トップ3</p>
      </div>
      <div class="notice">この診断は参考情報であり、試打を推奨します。</div>
    </section>
    <section class="conditions">
      <span>モード<strong>${escapeHtml(form.clubMode === "driver" ? "ドライバー" : "アイアン")}</strong></span>
      <span>ヘッド/アイアン<strong>${escapeHtml(form.headName)}</strong></span>
      <span>特徴<strong>${escapeHtml(form.headTrait)}</strong></span>
      <span>${escapeHtml(payload.speedLabel)}<strong>${escapeHtml(form.headSpeed)} m/s</strong></span>
      <span>希望弾道<strong>${escapeHtml(form.desiredShape)}</strong></span>
      <span>悩み<strong>${escapeHtml(form.concern)}</strong></span>
    </section>
    <section class="results">${cards}</section>
    <p class="footer">Generated: ${escapeHtml(generatedAt)} / 仮想EIデータを使った参考レポートです。</p>
  </main>
</body>
</html>`;
}

function buildNotionMarkdown(payload: any, options: { includeTitle?: boolean } = {}) {
  const form = payload.form ?? {};
  const results = Array.isArray(payload.results) ? payload.results : [];
  const selectedOwnedShaft = payload.selectedOwnedShaft;
  const lines = [
    "> この診断は参考情報であり、試打を推奨します。",
    "",
    `- モード: ${form.clubMode === "driver" ? "ドライバー" : "アイアン"}`,
    `- ヘッド/アイアン: ${form.headName ?? ""}`,
    `- 特徴: ${form.headTrait ?? ""}`,
    `- ${payload.speedLabel ?? "速度"}: ${form.headSpeed ?? ""} m/s`,
    `- 希望弾道: ${form.desiredShape ?? ""}`,
    `- 悩み: ${form.concern ?? ""}`,
    `- 比較基準: ${selectedOwnedShaft?.name ?? "なし"}`,
    "",
  ];

  if (options.includeTitle ?? true) {
    lines.unshift("# シャフト診断結果", "");
  }

  results.forEach((result: any, index: number) => {
    const shaft = result.shaft ?? {};
    lines.push(`## #${index + 1} ${shaft.name ?? ""}`);
    lines.push(`- 相性スコア: ${result.score ?? ""}`);
    lines.push(`- 推奨フレックス: ${result.recommendedFlex ?? ""}`);
    lines.push(`- 重量帯: ${shaft.weight ?? ""}`);
    lines.push(`- トルク: ${Number(shaft.torque ?? 0).toFixed(1)}`);
    lines.push(`- 推奨速度: ${shaft.speedRange?.[0] ?? ""}-${shaft.speedRange?.[1] ?? ""} m/s`);
    lines.push(`- 弾道傾向: ${shaft.trajectory ?? ""}`);
    lines.push(`- コメント: ${shaft.comment ?? ""}`);
    lines.push("");
    lines.push("### なぜおすすめか");
    (Array.isArray(result.reasons) ? result.reasons : []).forEach((reason: string) => lines.push(`- ${reason}`));
    if (selectedOwnedShaft) {
      lines.push("");
      lines.push(`### ${selectedOwnedShaft.name} との差`);
      lines.push(`- ${result.compareTone ?? ""}`);
      (Array.isArray(result.differences) ? result.differences : []).forEach((item: string) => lines.push(`- ${item}`));
    }
    lines.push("");
  });

  return `${lines.join("\n")}\n`;
}

function buildNotionDropManifest(payload: any, files: Record<string, string>) {
  const form = payload.form ?? {};
  const title = `シャフト診断結果 - ${form.headName || "未入力"}`;
  return {
    destination: {
      type: "page_id",
      page_id: NOTION_FOR_SHARE_PAGE_ID,
      url: NOTION_FOR_SHARE_URL,
      title: "for_share",
    },
    create_page: {
      properties: { title },
      content_file: files.notionPageMarkdown,
    },
    attachments: {
      preview_html: files.html,
      readable_markdown: files.markdown,
      notion_blocks_json: files.notionBlocksJson,
    },
    note: "Notion MCPでfor_share配下に子ページを作る場合は、content_fileの本文をcontentに渡してください。HTMLはローカルプレビュー用です。",
  };
}

async function uploadHtmlFileToNotion(token: string, fileName: string, html: string) {
  const createResponse = await fetch("https://api.notion.com/v1/file_uploads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    body: JSON.stringify({
      mode: "single_part",
      filename: fileName,
      content_type: "text/html",
    }),
  });

  const created = await createResponse.json().catch(() => ({}));
  if (!createResponse.ok) {
    const message = created?.message ? `HTMLファイルアップロード準備に失敗しました: ${created.message}` : "HTMLファイルアップロード準備に失敗しました。";
    throw new Error(message);
  }

  const formData = new FormData();
  formData.append("file", new Blob([html], { type: "text/html" }), fileName);

  const sendResponse = await fetch(`https://api.notion.com/v1/file_uploads/${created.id}/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
    },
    body: formData,
  });

  const sent = await sendResponse.json().catch(() => ({}));
  if (!sendResponse.ok) {
    const message = sent?.message ? `HTMLファイルアップロードに失敗しました: ${sent.message}` : "HTMLファイルアップロードに失敗しました。";
    throw new Error(message);
  }

  return {
    id: sent.id ?? created.id,
    fileName: sent.filename ?? fileName,
  };
}

async function createNotionPage(payload: any, env: Record<string, string>, options: { htmlFileUploadId?: string; htmlFileName?: string } = {}) {
  const token = env.NOTION_TOKEN ?? env.VITE_NOTION_TOKEN ?? process.env.NOTION_TOKEN ?? process.env.VITE_NOTION_TOKEN;
  if (!token) {
    throw new Error("NOTION_TOKEN が未設定です。Notion連携トークンを環境変数に設定してから dev サーバーを再起動してください。");
  }

  const page = buildNotionBlocks(payload, options);
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    body: JSON.stringify({
      parent: { page_id: NOTION_FOR_SHARE_PAGE_ID },
      properties: {
        title: {
          title: [{ type: "text", text: { content: page.title } }],
        },
      },
      children: page.children.slice(0, 100),
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message ? `Notionアップロードに失敗しました: ${data.message}` : "Notionアップロードに失敗しました。";
    throw new Error(message);
  }

  return {
    pageId: data.id,
    pageUrl: data.url,
    parentPageId: NOTION_FOR_SHARE_PAGE_ID,
    parentUrl: NOTION_FOR_SHARE_URL,
    title: page.title,
  };
}

function richText(content: string) {
  return [{ type: "text", text: { content } }];
}

function linkRichText(content: string, url: string) {
  return [{ type: "text", text: { content, link: { url } } }];
}

function heading(content: string, level: 1 | 2 | 3 = 2) {
  const type = `heading_${level}`;
  return { object: "block", type, [type]: { rich_text: richText(content) } };
}

function paragraph(content: string) {
  return { object: "block", type: "paragraph", paragraph: { rich_text: richText(content) } };
}

function linkParagraph(content: string, url: string) {
  return { object: "block", type: "paragraph", paragraph: { rich_text: linkRichText(content, url) } };
}

function bulleted(content: string) {
  return { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: richText(content) } };
}

function divider() {
  return { object: "block", type: "divider", divider: {} };
}

function callout(content: string, emoji = "🏌️") {
  return { object: "block", type: "callout", callout: { rich_text: richText(content), icon: { type: "emoji", emoji } } };
}

function bookmark(url: string) {
  return { object: "block", type: "bookmark", bookmark: { url } };
}

function buildNotionBlocks(payload: any, options: { htmlFileUploadId?: string; htmlFileName?: string } = {}) {
  const form = payload.form ?? {};
  const results = Array.isArray(payload.results) ? payload.results : [];
  const selectedOwnedShaft = payload.selectedOwnedShaft;
  const children: any[] = [
    heading("シャフト診断結果", 1),
    callout("この診断は参考情報であり、最終判断には試打を推奨します。", "⚠️"),
  ];

  if (options.htmlFileUploadId) {
    children.push(heading("HTMLファイル", 2));
    children.push(callout("見やすいHTML形式の診断結果をNotionに添付しています。外出先でもNotion上から開けます。", "📎"));
    children.push({
      object: "block",
      type: "file",
      file: {
        type: "file_upload",
        file_upload: { id: options.htmlFileUploadId },
      },
    });
    children.push(divider());
  }

  children.push(heading("診断条件", 2));
  children.push(callout(`${form.clubMode === "driver" ? "ドライバー" : "アイアン"} / ${form.headName ?? ""} / ${payload.speedLabel ?? "速度"} ${form.headSpeed ?? ""} m/s`, "📋"));
  children.push(bulleted(`特徴: ${form.headTrait ?? ""}`));
  children.push(bulleted(`希望弾道: ${form.desiredShape ?? ""}`));
  children.push(bulleted(`悩み: ${form.concern ?? ""}`));
  children.push(bulleted(`比較基準: ${selectedOwnedShaft?.name ?? "なし"}`));
  children.push(divider());

  results.forEach((result: any, index: number) => {
    const shaft = result.shaft ?? {};
    children.push(heading(`#${index + 1} ${shaft.name ?? ""}`, 2));
    children.push(callout(`相性スコア ${result.score ?? ""} / 推奨フレックス ${result.recommendedFlex ?? ""}`, index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"));
    children.push(bulleted(`重量帯: ${shaft.weight ?? ""} / トルク: ${Number(shaft.torque ?? 0).toFixed(1)}`));
    children.push(bulleted(`推奨速度: ${shaft.speedRange?.[0] ?? ""}-${shaft.speedRange?.[1] ?? ""} m/s / 弾道傾向: ${shaft.trajectory ?? ""}`));
    children.push(bulleted(`EI目安: 手元 ${shaft.buttStiffness ?? ""} / 中間 ${shaft.midStiffness ?? ""} / 先端 ${shaft.tipStiffness ?? ""}`));
    children.push(paragraph(shaft.comment ?? ""));
    children.push(heading("なぜおすすめか", 3));
    (Array.isArray(result.reasons) ? result.reasons : []).forEach((reason: string) => children.push(bulleted(reason)));
    if (selectedOwnedShaft) {
      children.push(heading(`${selectedOwnedShaft.name} との差`, 3));
      children.push(bulleted(result.compareTone ?? ""));
      (Array.isArray(result.differences) ? result.differences : []).forEach((item: string) => children.push(bulleted(item)));
    }
    if (index < results.length - 1) {
      children.push(divider());
    }
  });

  return {
    title: `シャフト診断結果 - ${form.headName ?? ""}`,
    children,
  };
}

function uniqueSharePath(dir: string, baseName: string, extension: string) {
  let index = 0;
  while (true) {
    const suffix = index === 0 ? "" : `-${index + 1}`;
    const fileName = `${baseName}${suffix}${extension}`;
    const filePath = path.join(dir, fileName);
    if (!fs.existsSync(filePath)) {
      return { fileName, filePath };
    }
    index += 1;
  }
}

function shareExportPlugin(env: Record<string, string>) {
  return {
    name: "share-export",
    configureServer(server: any) {
      server.middlewares.use("/for_share", (req: any, res: any, next: any) => {
        if (req.method !== "GET") {
          next();
          return;
        }

        const requested = decodeURIComponent((req.url ?? "").replace(/^\/+/, ""));
        const shareRoot = path.resolve(process.cwd(), "for_share");
        const filePath = path.resolve(shareRoot, requested);
        if (!filePath.startsWith(shareRoot) || !fs.existsSync(filePath)) {
          next();
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = ext === ".html" ? "text/html; charset=utf-8" : ext === ".json" ? "application/json; charset=utf-8" : "text/plain; charset=utf-8";
        res.setHeader("Content-Type", contentType);
        res.end(fs.readFileSync(filePath));
      });

      server.middlewares.use("/api/export-share", (req: any, res: any) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method Not Allowed");
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            const html = buildShareHtml(payload);
            const markdown = buildNotionMarkdown(payload);
            const notionPageMarkdown = buildNotionMarkdown(payload, { includeTitle: false });
            const notionBlocks = buildNotionBlocks(payload);
            const dir = path.resolve(process.cwd(), "for_share");
            fs.mkdirSync(dir, { recursive: true });
            const stamp = new Date().toISOString().replace(/[:.]/g, "-");
            const baseName = `shaft-report-${stamp}`;
            const { fileName, filePath } = uniqueSharePath(dir, baseName, ".html");
            const { fileName: markdownName, filePath: markdownPath } = uniqueSharePath(dir, baseName, ".md");
            const { fileName: notionPageName, filePath: notionPagePath } = uniqueSharePath(dir, baseName, ".notion-page.md");
            const { fileName: notionJsonName, filePath: notionJsonPath } = uniqueSharePath(dir, baseName, ".notion-blocks.json");
            const { fileName: manifestName, filePath: manifestPath } = uniqueSharePath(dir, baseName, ".notion-for-share.json");
            const manifest = buildNotionDropManifest(payload, {
              html: fileName,
              markdown: markdownName,
              notionPageMarkdown: notionPageName,
              notionBlocksJson: notionJsonName,
            });
            fs.writeFileSync(filePath, html, "utf8");
            fs.writeFileSync(markdownPath, markdown, "utf8");
            fs.writeFileSync(notionPagePath, notionPageMarkdown, "utf8");
            fs.writeFileSync(notionJsonPath, JSON.stringify(notionBlocks, null, 2), "utf8");
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({
              fileName,
              filePath,
              markdownName,
              markdownPath,
              notionPageName,
              notionPagePath,
              notionJsonName,
              notionJsonPath,
              manifestName,
              manifestPath,
              notionParentPageId: NOTION_FOR_SHARE_PAGE_ID,
              notionParentUrl: NOTION_FOR_SHARE_URL,
              previewUrl: `/for_share/${fileName}`,
            }));
          } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Export failed" }));
          }
        });
      });

      server.middlewares.use("/api/upload-notion", (req: any, res: any) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method Not Allowed");
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          try {
            const payload = JSON.parse(body);
            const html = buildShareHtml(payload);
            const dir = path.resolve(process.cwd(), "for_share");
            fs.mkdirSync(dir, { recursive: true });
            const stamp = new Date().toISOString().replace(/[:.]/g, "-");
            const baseName = `shaft-report-${stamp}`;
            const { fileName, filePath } = uniqueSharePath(dir, baseName, ".html");
            fs.writeFileSync(filePath, html, "utf8");

            const token = env.NOTION_TOKEN ?? env.VITE_NOTION_TOKEN ?? process.env.NOTION_TOKEN ?? process.env.VITE_NOTION_TOKEN;
            if (!token) {
              throw new Error("NOTION_TOKEN が未設定です。Notion連携トークンを環境変数に設定してから dev サーバーを再起動してください。");
            }
            const htmlUpload = await uploadHtmlFileToNotion(token, fileName, html);
            const result = await createNotionPage(payload, env, { htmlFileUploadId: htmlUpload.id, htmlFileName: htmlUpload.fileName });
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({
              ...result,
              htmlFileName: htmlUpload.fileName,
              htmlFileUploadId: htmlUpload.id,
              localHtmlPath: filePath,
            }));
          } catch (error) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Notion upload failed" }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), shareExportPlugin(env)],
  };
});

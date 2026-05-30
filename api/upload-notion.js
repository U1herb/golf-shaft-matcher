const NOTION_FOR_SHARE_PAGE_ID = "2d1f5833-8f65-80fe-9d2f-c6c051a83d0d";
const NOTION_FOR_SHARE_URL = "https://www.notion.so/2d1f58338f6580fe9d2fc6c051a83d0d?pvs=1";
const NOTION_VERSION = "2026-03-11";

function text(content) {
  return [{ type: "text", text: { content: String(content ?? "") } }];
}

function heading(content, level = 2) {
  const type = `heading_${level}`;
  return { object: "block", type, [type]: { rich_text: text(content) } };
}

function paragraph(content) {
  return { object: "block", type: "paragraph", paragraph: { rich_text: text(content) } };
}

function bulleted(content) {
  return { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: text(content) } };
}

function divider() {
  return { object: "block", type: "divider", divider: {} };
}

function callout(content, emoji = "🏌️") {
  return { object: "block", type: "callout", callout: { rich_text: text(content), icon: { type: "emoji", emoji } } };
}

function htmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildShareHtml(payload) {
  const form = payload.form ?? {};
  const results = Array.isArray(payload.results) ? payload.results : [];
  const selectedOwnedShaft = payload.selectedOwnedShaft;
  const generatedAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const cards = results
    .map((result, index) => {
      const shaft = result.shaft ?? {};
      const reasons = Array.isArray(result.reasons) ? result.reasons : [];
      const differences = Array.isArray(result.differences) ? result.differences : [];
      return `
        <article class="shaft-card">
          <div class="rank">#${index + 1}</div>
          <div class="shaft-main">
            <div class="shaft-title">
              <div><h2>${htmlEscape(shaft.name)}</h2><p>${htmlEscape(shaft.comment)}</p></div>
              <div class="score"><strong>${htmlEscape(result.score)}</strong><span>相性スコア</span></div>
            </div>
            <div class="flex-recommendation"><strong>推奨フレックス: ${htmlEscape(result.recommendedFlex)}</strong><span>${htmlEscape(payload.speedLabel)} ${htmlEscape(form.headSpeed)}m/s から算出</span></div>
            <div class="spec-grid">
              <span>重量帯<strong>${htmlEscape(shaft.weight)}</strong></span>
              <span>トルク<strong>${htmlEscape(Number(shaft.torque ?? 0).toFixed(1))}</strong></span>
              <span>推奨速度<strong>${htmlEscape(shaft.speedRange?.[0])}-${htmlEscape(shaft.speedRange?.[1])} m/s</strong></span>
              <span>弾道傾向<strong>${htmlEscape(shaft.trajectory)}</strong></span>
            </div>
            <div class="card-bottom">
              <div class="reasons"><h3>なぜおすすめか</h3><ul>${reasons.map((reason) => `<li>${htmlEscape(reason)}</li>`).join("")}</ul></div>
            </div>
            ${
              selectedOwnedShaft
                ? `<div class="difference-box"><h3>${htmlEscape(selectedOwnedShaft.name)} との差</h3><p>${htmlEscape(result.compareTone)}</p><div class="diff-grid">${differences.map((item) => `<span>${htmlEscape(item)}</span>`).join("")}</div></div>`
                : ""
            }
          </div>
        </article>`;
    })
    .join("");

  return `<!doctype html><html lang="ja"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>シャフト診断結果</title><style>
    :root { color: #18211d; background: #eef1ed; font-family: "Yu Gothic", Meiryo, system-ui, sans-serif; }
    * { box-sizing: border-box; } body { margin: 0; padding: 28px; background: #eef1ed; }
    .page { max-width: 1180px; margin: 0 auto; } .hero { display: flex; justify-content: space-between; gap: 24px; align-items: flex-end; margin-bottom: 22px; }
    .eyebrow { margin: 0 0 8px; color: #567062; font-size: 12px; font-weight: 800; text-transform: uppercase; } h1 { margin: 0 0 10px; font-size: 44px; line-height: 1.05; color: #102018; }
    p { margin-top: 0; color: #52615b; } .notice { max-width: 360px; padding: 14px 16px; border: 1px solid #d5dcd4; border-left: 4px solid #be8f1b; border-radius: 8px; background: rgba(255,255,255,.78); color: #44391d; font-weight: 700; }
    .conditions, .shaft-card { border: 1px solid #d8dfd7; border-radius: 8px; background: rgba(255,255,255,.92); box-shadow: 0 18px 40px rgba(22,31,26,.08); }
    .conditions { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 8px; padding: 14px; margin-bottom: 16px; }
    .conditions span, .spec-grid span, .diff-grid span { display: grid; gap: 4px; padding: 10px; border-radius: 8px; background: #f8faf8; color: #607169; font-size: 12px; font-weight: 800; }
    .conditions strong, .spec-grid strong { color: #17231d; font-size: 14px; } .results { display: grid; gap: 16px; }
    .shaft-card { display: grid; grid-template-columns: 54px 1fr; overflow: hidden; } .rank { display: grid; place-items: center; background: #173523; color: #f4d58a; font-size: 18px; font-weight: 950; }
    .shaft-main { padding: 20px; } .shaft-title, .card-bottom, .flex-recommendation { display: flex; gap: 16px; justify-content: space-between; align-items: flex-start; }
    .shaft-title h2 { margin: 0 0 7px; font-size: 22px; } .score { display: grid; min-width: 96px; min-height: 96px; place-items: center; border: 1px solid #ead79a; border-radius: 8px; background: #fff8df; color: #173523; }
    .score strong { font-size: 34px; line-height: 1; } .score span { font-size: 11px; font-weight: 900; } .flex-recommendation { margin-top: 16px; padding: 12px 14px; border: 1px solid #d9e2dc; border-radius: 8px; background: #f2f7f3; }
    .spec-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 8px; margin: 18px 0; } .reasons, .difference-box { flex: 1; padding: 14px 16px; border: 1px solid #e0e6df; border-radius: 8px; background: #fff; }
    .reasons h3, .difference-box h3 { margin: 0 0 8px; color: #1f5d3a; font-size: 15px; } .reasons ul { display: grid; gap: 6px; margin: 0; padding-left: 18px; color: #3d4c45; }
    .difference-box { margin-top: 16px; background: #f6faf8; } .diff-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 7px; } .footer { margin-top: 18px; color: #607169; font-size: 12px; }
    @media (max-width: 760px) { body { padding: 14px; } .hero, .shaft-title, .card-bottom, .flex-recommendation { display: grid; } h1 { font-size: 32px; } .conditions, .spec-grid, .diff-grid { grid-template-columns: 1fr 1fr; } .shaft-card { grid-template-columns: 1fr; } .rank { min-height: 40px; } }
  </style></head><body><main class="page"><section class="hero"><div><p class="eyebrow">${htmlEscape(form.clubMode === "driver" ? "Driver" : "Iron")} Shaft Matching Report</p><h1>シャフト診断結果</h1><p>${htmlEscape(form.headName || "未入力")} に合う候補トップ3</p></div><div class="notice">この診断は参考情報であり、試打を推奨します。</div></section><section class="conditions"><span>モード<strong>${htmlEscape(form.clubMode === "driver" ? "ドライバー" : "アイアン")}</strong></span><span>ヘッド/アイアン<strong>${htmlEscape(form.headName)}</strong></span><span>特徴<strong>${htmlEscape(form.headTrait)}</strong></span><span>${htmlEscape(payload.speedLabel)}<strong>${htmlEscape(form.headSpeed)} m/s</strong></span><span>希望弾道<strong>${htmlEscape(form.desiredShape)}</strong></span><span>悩み<strong>${htmlEscape(form.concern)}</strong></span></section><section class="results">${cards}</section><p class="footer">Generated: ${htmlEscape(generatedAt)} / 仮想EIデータを使った参考レポートです。</p></main></body></html>`;
}

function buildNotionBlocks(payload, options = {}) {
  const form = payload.form ?? {};
  const results = Array.isArray(payload.results) ? payload.results : [];
  const selectedOwnedShaft = payload.selectedOwnedShaft;
  const children = [
    heading("シャフト診断結果", 1),
    callout("この診断は参考情報であり、最終判断には試打を推奨します。", "⚠️"),
  ];
  if (options.htmlFileUploadId) {
    children.push(heading("HTMLファイル", 2));
    children.push(callout("見やすいHTML形式の診断結果をNotionに添付しています。", "📎"));
    children.push({ object: "block", type: "file", file: { type: "file_upload", file_upload: { id: options.htmlFileUploadId } } });
    children.push(divider());
  }
  children.push(heading("診断条件", 2));
  children.push(callout(`${form.clubMode === "driver" ? "ドライバー" : "アイアン"} / ${form.headName ?? ""} / ${payload.speedLabel ?? "速度"} ${form.headSpeed ?? ""} m/s`, "📋"));
  children.push(bulleted(`特徴: ${form.headTrait ?? ""}`));
  children.push(bulleted(`希望弾道: ${form.desiredShape ?? ""}`));
  children.push(bulleted(`悩み: ${form.concern ?? ""}`));
  children.push(bulleted(`比較基準: ${selectedOwnedShaft?.name ?? "なし"}`));
  children.push(divider());
  results.forEach((result, index) => {
    const shaft = result.shaft ?? {};
    children.push(heading(`#${index + 1} ${shaft.name ?? ""}`, 2));
    children.push(callout(`相性スコア ${result.score ?? ""} / 推奨フレックス ${result.recommendedFlex ?? ""}`, index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"));
    children.push(bulleted(`重量帯: ${shaft.weight ?? ""} / トルク: ${Number(shaft.torque ?? 0).toFixed(1)}`));
    children.push(bulleted(`推奨速度: ${shaft.speedRange?.[0] ?? ""}-${shaft.speedRange?.[1] ?? ""} m/s / 弾道傾向: ${shaft.trajectory ?? ""}`));
    children.push(bulleted(`EI目安: 手元 ${shaft.buttStiffness ?? ""} / 中間 ${shaft.midStiffness ?? ""} / 先端 ${shaft.tipStiffness ?? ""}`));
    children.push(paragraph(shaft.comment ?? ""));
    children.push(heading("なぜおすすめか", 3));
    (Array.isArray(result.reasons) ? result.reasons : []).forEach((reason) => children.push(bulleted(reason)));
    if (selectedOwnedShaft) {
      children.push(heading(`${selectedOwnedShaft.name} との差`, 3));
      children.push(bulleted(result.compareTone ?? ""));
      (Array.isArray(result.differences) ? result.differences : []).forEach((item) => children.push(bulleted(item)));
    }
    if (index < results.length - 1) children.push(divider());
  });
  return { title: `シャフト診断結果 - ${form.headName ?? ""}`, children };
}

async function notionFetch(path, token, init) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      ...(init.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message ?? `Notion API error: ${response.status}`);
  }
  return data;
}

async function uploadHtmlFileToNotion(token, fileName, html) {
  const created = await notionFetch("/file_uploads", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "single_part", filename: fileName, content_type: "text/html" }),
  });
  const formData = new FormData();
  formData.append("file", new Blob([html], { type: "text/html" }), fileName);
  const sent = await notionFetch(`/file_uploads/${created.id}/send`, token, { method: "POST", body: formData });
  return { id: sent.id ?? created.id, fileName: sent.filename ?? fileName };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const token = process.env.NOTION_TOKEN;
    if (!token) {
      throw new Error("NOTION_TOKEN is not set in Vercel Environment Variables.");
    }

    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `shaft-report-${stamp}.html`;
    const html = buildShareHtml(payload);
    const htmlUpload = await uploadHtmlFileToNotion(token, fileName, html);
    const page = buildNotionBlocks(payload, { htmlFileUploadId: htmlUpload.id, htmlFileName: htmlUpload.fileName });
    const createdPage = await notionFetch("/pages", token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parent: { page_id: NOTION_FOR_SHARE_PAGE_ID },
        properties: { title: { title: [{ type: "text", text: { content: page.title } }] } },
        children: page.children.slice(0, 100),
      }),
    });

    res.status(200).json({
      pageId: createdPage.id,
      pageUrl: createdPage.url,
      parentPageId: NOTION_FOR_SHARE_PAGE_ID,
      parentUrl: NOTION_FOR_SHARE_URL,
      title: page.title,
      htmlFileName: htmlUpload.fileName,
      htmlFileUploadId: htmlUpload.id,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Notion upload failed" });
  }
}

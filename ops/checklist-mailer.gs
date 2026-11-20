/**
 * ZKK checklist mailer: Google Apps Script web app behind the site's checklist signup.
 * It emails the visitor the PDF, logs the signup in this Google Sheet and notifies info@.
 * It is not part of the website: this copy lives in the repo for reference only.
 *
 * Setup (about 5 minutes, signed in as info@zkkconsulting.com):
 *  1. Create a Google Sheet named "Checklist signups". Extensions > Apps Script. Paste this file.
 *  2. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone. Authorize.
 *  3. Copy the web app URL (ends in /exec) into SIGNUP_URL in /assets/js/lead-magnet.js.
 *  4. After editing this script later: Deploy > Manage deployments > Edit > New version (the URL stays the same).
 */
var PDF_URL = 'https://zkkconsulting.com/assets/downloads/zkk-medtech-market-readiness-checklist.pdf';
var FROM_NAME = 'ZKK Consulting';
var REPLY_TO = 'info@zkkconsulting.com';
var NOTIFY = 'info@zkkconsulting.com';   // set to '' to stop the signup notification
var ATTACH = true;                        // false: link only, no attachment

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var email = String(d.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return out({ ok: false, error: 'invalid' });

    // one email per address per 10 minutes, so a double click or a bot cannot loop it
    var cache = CacheService.getScriptCache();
    if (cache.get(email)) return out({ ok: true });
    cache.put(email, '1', 600);
    if (MailApp.getRemainingDailyQuota() < 2) return out({ ok: false, error: 'quota' });

    var opts = { name: FROM_NAME, replyTo: REPLY_TO, htmlBody: html() };
    if (ATTACH) opts.attachments = [UrlFetchApp.fetch(PDF_URL).getBlob().setName('ZKK Market Readiness Checklist.pdf')];
    MailApp.sendEmail(email, 'Your Market Readiness Checklist', text(), opts);

    SpreadsheetApp.getActive().getSheets()[0].appendRow([new Date(), email, String(d.source || '').slice(0, 20), String(d.page || '').slice(0, 200)]);
    if (NOTIFY) MailApp.sendEmail(NOTIFY, 'New checklist signup', email + ' signed up from ' + (d.page || 'the site') + ' (' + (d.source || '') + ').');
    return out({ ok: true });
  } catch (err) {
    console.error(err);
    return out({ ok: false, error: 'server' });
  }
}

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function text() {
  return 'Thanks for asking for the Market Readiness Checklist.\n\n' +
    'It is attached, and you can also download it here: ' + PDF_URL + '\n\n' +
    'Score one point per box. Under 12? Book a free call and we will help you close the gaps: https://zkkconsulting.com/intake/\n\n' +
    'ZKK Consulting\n\nYou received this one email because you asked for the checklist on zkkconsulting.com. We will not add you to a mailing list.';
}

function html() {
  return '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#0d1612;max-width:560px">' +
    '<p>Thanks for asking for the <b>Market Readiness Checklist</b>: 20 questions to answer before you pitch to investors.</p>' +
    '<p>It is attached. You can also <a href="' + PDF_URL + '" style="color:#0b4a32">download it here</a>.</p>' +
    '<p>Score one point per box. Under 12? <a href="https://zkkconsulting.com/intake/" style="color:#0b4a32">Book a free call</a> and we will help you close the gaps.</p>' +
    '<p>ZKK Consulting</p>' +
    '<p style="font-size:12px;color:#6a756f">You received this one email because you asked for the checklist on zkkconsulting.com. We will not add you to a mailing list.</p></div>';
}

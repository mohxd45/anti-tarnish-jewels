
const fs = require(fs);
let text = fs.readFileSync(app/admin/announcements/page.tsx, utf8);
const target =  </Field>\\n </div>;
const replacement =  </Field>\\n </div>\\n\\n <div className=\grid sm:grid-cols-2 gap-4 pt-2\>\\n <Field label=\Button Text (Optional)\>\\n <Input \\n value={settings.popupOfferLinkText || \\}\\n onChange={(e) => setSettings({ ...settings, popupOfferLinkText: e.target.value })}\\n className=\bg-card/40\\\n placeholder=\e.g. Shop Now\\\n />\\n </Field>\\n <Field label=\Button Link (Optional)\>\\n <Input \\n value={settings.popupOfferLinkUrl || \\}\\n onChange={(e) => setSettings({ ...settings, popupOfferLinkUrl: e.target.value })}\\n className=\bg-card/40\\\n placeholder=\e.g. /shop\\\n />\\n </Field>\\n </div>;
text = text.replace(target, replacement);
fs.writeFileSync(app/admin/announcements/page.tsx, text);


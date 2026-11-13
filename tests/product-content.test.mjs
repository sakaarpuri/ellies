import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const output = ts.transpileModule(fs.readFileSync("src/lib/products.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const productModule = { exports: {} };
new Function("module", "exports", output)(productModule, productModule.exports);
const { arohini, arohiniPhotos, arohiniHerbPhotos, arohiniFaqs, arohiniBotanicals, arohiniPackHighlights } = productModule.exports;

test("Arohini galleries contain the packshot, first model photo and poster", () => {
  assert.equal(arohiniPhotos.length, 3);
  assert.equal(new Set(arohiniPhotos.map(photo => photo.src)).size, 3);
  assert(arohiniPhotos[1].src.includes("morning"));
  assert(!arohiniPhotos.some(photo => /reading|portrait/.test(photo.src)));
  for (const photo of arohiniPhotos) {
    assert(fs.existsSync(path.join("public", photo.src)));
    assert(photo.alt.length > 20);
    assert(photo.width > 0 && photo.height > 0);
  }
});

test("Three original ingredient photos have qualified captions and known ingredients", () => {
  assert.equal(arohiniHerbPhotos.length, 3);
  for (const herb of arohiniHerbPhotos) {
    assert(arohiniBotanicals.some(([name]) => name === herb.name));
    assert(fs.existsSync(path.join("public", herb.src)));
    assert(herb.alt.length > 20);
    assert(herb.benefit.startsWith("Traditionally used"));
    assert(herb.source.startsWith("https://"));
  }
});

test("Product answers match the sale price and the seven named botanicals", () => {
  const answers = arohiniFaqs.map(faq => faq.answer).join(" ");
  assert(answers.includes(`Rs.${arohini.price}`));
  assert.equal(arohiniBotanicals.length, 7);
  assert.equal(arohiniPackHighlights.length, 5);
  for (const [name] of arohiniBotanicals) assert(answers.includes(name));
  assert(!/certified|safe for everyone|clinically proven/i.test(answers));
  assert(!Number.isNaN(Date.parse(arohini.updatedAt)));
});

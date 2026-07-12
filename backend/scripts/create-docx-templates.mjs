import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PizZip from "pizzip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, "..", "templates");

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const documentRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;

function paragraph(text) {
  return `<w:p><w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
}

function buildDocumentXml(lines) {
  const body = lines.map((line) => paragraph(line)).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${body}</w:body>
</w:document>`;
}

function createDocx(filename, lines) {
  const zip = new PizZip();
  zip.file("[Content_Types].xml", contentTypes);
  zip.folder("_rels").file(".rels", rels);
  zip.folder("word").file("document.xml", buildDocumentXml(lines));
  zip.folder("word").folder("_rels").file("document.xml.rels", documentRels);

  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(path.join(templatesDir, filename), buffer);
}

fs.mkdirSync(templatesDir, { recursive: true });

// individual-task.docx — реальный шаблон УрФУ, не перезаписываем

createDocx("review.docx", [
  "ОТЗЫВ О ПРАКТИКЕ",
  "Студент: {{student_fio}}, группа {{group}}",
  "Период: {{practice_start}} — {{practice_end}}",
  "Мероприятия: {{review_activities}}",
  "Характеристика: {{review_characteristic}}",
  "Трудоустройство на время практики: {{review_employed}}",
  "Следующая практика: {{review_next_practice}}",
  "Предложение трудоустройства: {{review_employment_offer}}",
  "Предложения: {{review_suggestions}}",
  "Оценка: {{review_grade}}",
  "{{city_year}}",
]);

createDocx("title-page.docx", [
  "ТИТУЛЬНЫЙ ЛИСТ ОТЧЁТА",
  "Институт: {{institute}}",
  "Студент: {{student_fio}}, группа {{group}}",
  "Специальность: {{specialty}}",
  "Тема: {{practice_topic}}",
  "Период: {{practice_start}} — {{practice_end}}",
  "{{city_year}}",
]);

console.log("Шаблоны .docx созданы в", templatesDir);

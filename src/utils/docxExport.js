import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType, UnderlineType,
} from 'docx';
import { saveAs } from 'file-saver';

const sName = (s) => (typeof s === 'string' ? s : s?.name ?? '');

function makeHR() {
  return new Paragraph({
    border: { bottom: { color: '2563EB', space: 1, style: BorderStyle.SINGLE, size: 6 } },
    spacing: { after: 120 },
  });
}

function sectionTitle(text) {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: '2563EB', font: 'Calibri' })],
    spacing: { before: 240, after: 80 },
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 20, font: 'Calibri' })],
    spacing: { after: 60 },
  });
}

function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function exportToDocx(resume, filename = 'Resume') {
  const p = resume.personalInfo || {};
  const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Resume';
  const contactLine = [p.email, p.phone, p.city, p.country].filter(Boolean).join(' | ');
  const linksLine = [p.linkedin, p.website].filter(Boolean).join(' | ');

  const children = [];

  // --- Header ---
  children.push(
    new Paragraph({
      children: [new TextRun({ text: fullName, bold: true, size: 40, font: 'Calibri', color: '1e3a6e' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    })
  );
  if (p.jobTitle) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: p.jobTitle, size: 24, font: 'Calibri', color: '555555' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      })
    );
  }
  if (contactLine) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactLine, size: 18, font: 'Calibri', color: '666666' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
      })
    );
  }
  if (linksLine) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: linksLine, size: 18, font: 'Calibri', color: '2563EB' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      })
    );
  }
  children.push(makeHR());

  // --- Summary ---
  if (resume.summary) {
    children.push(sectionTitle('Professional Summary'));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: stripHtml(resume.summary), size: 20, font: 'Calibri' })],
        spacing: { after: 80 },
      })
    );
    children.push(makeHR());
  }

  // --- Experience ---
  if (resume.experience?.length) {
    children.push(sectionTitle('Work Experience'));
    resume.experience.forEach((exp) => {
      const dates = [exp.startDate, exp.endDate || (exp.current ? 'Present' : '')].filter(Boolean).join(' – ');
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position || '', bold: true, size: 22, font: 'Calibri' }),
            new TextRun({ text: exp.company ? `  |  ${exp.company}` : '', size: 22, font: 'Calibri', color: '555555' }),
          ],
          spacing: { before: 120, after: 40 },
        })
      );
      if (dates) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: dates, size: 18, font: 'Calibri', color: '888888', italics: true })],
            spacing: { after: 60 },
          })
        );
      }
      if (exp.description) {
        const lines = stripHtml(exp.description).split(/\n|•/).map(l => l.trim()).filter(Boolean);
        lines.forEach(line => children.push(bullet(line)));
      }
    });
    children.push(makeHR());
  }

  // --- Education ---
  if (resume.education?.length) {
    children.push(sectionTitle('Education'));
    resume.education.forEach((edu) => {
      const dates = [edu.startDate, edu.endDate || (edu.current ? 'Present' : '')].filter(Boolean).join(' – ');
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree || '', bold: true, size: 22, font: 'Calibri' }),
            new TextRun({ text: edu.school ? ` — ${edu.school}` : '', size: 22, font: 'Calibri', color: '555555' }),
          ],
          spacing: { before: 120, after: 40 },
        })
      );
      if (dates) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: dates, size: 18, font: 'Calibri', color: '888888', italics: true })],
            spacing: { after: 60 },
          })
        );
      }
    });
    children.push(makeHR());
  }

  // --- Skills ---
  if (resume.skills?.length) {
    children.push(sectionTitle('Skills'));
    const skillNames = resume.skills.map(s => sName(s)).filter(Boolean).join(', ');
    children.push(
      new Paragraph({
        children: [new TextRun({ text: skillNames, size: 20, font: 'Calibri' })],
        spacing: { after: 80 },
      })
    );
    children.push(makeHR());
  }

  // --- Certifications ---
  if (resume.certifications?.length) {
    children.push(sectionTitle('Certifications'));
    resume.certifications.forEach((cert) => {
      const certName = typeof cert === 'string' ? cert : cert?.name || '';
      const issuer = typeof cert === 'object' ? cert?.issuer || '' : '';
      const date = typeof cert === 'object' ? cert?.date || '' : '';
      children.push(bullet([certName, issuer, date].filter(Boolean).join(' — ')));
    });
    children.push(makeHR());
  }

  // --- Languages ---
  if (resume.languages?.length) {
    children.push(sectionTitle('Languages'));
    resume.languages.forEach((lang) => {
      const langName = typeof lang === 'string' ? lang : lang?.name || '';
      const level = typeof lang === 'object' ? lang?.level || '' : '';
      children.push(bullet(level ? `${langName} — ${level}` : langName));
    });
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}

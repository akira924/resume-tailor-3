import jsPDF from 'jspdf'
import type { ResumeSettings } from '../types/settings'

export interface PdfExperienceItem {
  company: string
  role: string
  period: string
  location: string
  bullets: string[]
}

export interface PdfEducationItem {
  institution: string
  degree: string
  period: string
}

export interface PdfCertificationItem {
  institution: string
  certification: string
  date: string
}

export interface PdfSkillCategory {
  category: string
  skills: string[]
}

export interface PdfResumeData {
  name: string
  jobTitle: string
  email: string
  phone: string
  location: string
  linkedIn: string
  gitHub: string
  website: string
  summary: string
  experience: PdfExperienceItem[]
  education: PdfEducationItem[]
  certifications: PdfCertificationItem[]
  skills: PdfSkillCategory[]
}

const PAGE_W = 215.9
const PAGE_H = 279.4

const VALID_FONTS = new Set(['helvetica', 'times', 'courier'])

function pdfFont(family: string): string {
  return VALID_FONTS.has(family) ? family : 'helvetica'
}

type ContactPart = { text: string; url?: string }

function normalizeUrl(raw: string): string {
  return raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`
}

function buildResumePdf(data: PdfResumeData, settings: ResumeSettings): jsPDF {
  const MARGIN = settings.pageLayout.pageMargin * 25.4
  const font = pdfFont(settings.primary.fontFamily)
  const bodySize = settings.primary.fontSize
  const bodyColor = settings.primary.fontColor
  const labelSize = bodySize
  const PT_MM = 0.352778
  const CAP_RATIO = 0.75

  const { pageLayout, header, sectionTitle, experienceLayout } = settings
  const lineSpacing = pageLayout.lineSpacing
  const sectionGap = pageLayout.sectionGap * PT_MM
  const baseLH = bodySize * PT_MM * lineSpacing
  const labelLH = labelSize * PT_MM * lineSpacing

  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const cw = PAGE_W - 2 * MARGIN
  let y = MARGIN + header.name.fontSize * PT_MM * CAP_RATIO

  function pageBreak(space: number) {
    if (y + space > PAGE_H - MARGIN) {
      doc.addPage()
      y = MARGIN + bodySize * PT_MM * CAP_RATIO
    }
  }

  function heading(title: string) {
    pageBreak(14)
    y += sectionGap
    doc.setFont(font, sectionTitle.bold ? 'bold' : 'normal')
    doc.setFontSize(sectionTitle.fontSize)
    doc.setTextColor(sectionTitle.fontColor)
    const text = sectionTitle.capitalize ? title.toUpperCase() : title
    if (sectionTitle.alignment === 'center') {
      doc.text(text, PAGE_W / 2, y, { align: 'center' })
    } else {
      doc.text(text, MARGIN, y)
    }
    y += sectionTitle.fontSize * PT_MM * 0.4
    if (sectionTitle.borderVisible) {
      doc.setDrawColor(sectionTitle.fontColor)
      doc.setLineWidth(0.3)
      doc.line(MARGIN, y, PAGE_W - MARGIN, y)
      y += sectionTitle.fontSize * PT_MM * 0.2
    }
    y += sectionGap
  }

  function wrappedText(
    text: string,
    size: number,
    style: 'normal' | 'italic' | 'bold' = 'normal',
    color: string = bodyColor,
    indent: number = 0,
    lh: number = baseLH,
  ) {
    doc.setFont(font, style)
    doc.setFontSize(size)
    doc.setTextColor(color)
    const lines: string[] = doc.splitTextToSize(text, cw - indent)
    for (const line of lines) {
      pageBreak(lh)
      doc.text(line, MARGIN + indent, y)
      y += lh
    }
  }

  function twoColumnRow(
    left: string,
    right: string,
    leftStyle: 'normal' | 'bold' | 'italic',
    leftSize: number,
    rightSize: number,
  ) {
    doc.setFont(font, leftStyle)
    doc.setFontSize(leftSize)
    doc.setTextColor(bodyColor)

    const maxLeftW = cw - doc.getStringUnitWidth(right) * rightSize * 0.352778 - 4
    const leftLines: string[] = doc.splitTextToSize(left, maxLeftW)
    doc.text(leftLines[0] || '', MARGIN, y)

    doc.setFont(font, 'normal')
    doc.setFontSize(rightSize)
    const rw = doc.getTextWidth(right)
    doc.text(right, PAGE_W - MARGIN - rw, y)

    const lh = leftSize * PT_MM * lineSpacing
    for (let i = 1; i < leftLines.length; i++) {
      y += lh
      pageBreak(lh)
      doc.setFont(font, leftStyle)
      doc.setFontSize(leftSize)
      doc.setTextColor(bodyColor)
      doc.text(leftLines[i], MARGIN, y)
    }
  }

  // ── Header ──────────────────────────────────────────

  const contactParts: ContactPart[] = [
    data.email ? { text: data.email } : null,
    data.phone ? { text: data.phone } : null,
    data.linkedIn ? { text: 'LinkedIn', url: normalizeUrl(data.linkedIn) } : null,
    data.gitHub ? { text: 'GitHub', url: normalizeUrl(data.gitHub) } : null,
    data.website ? { text: 'Website', url: normalizeUrl(data.website) } : null,
    data.location ? { text: data.location } : null,
  ].filter((p): p is ContactPart => p !== null)

  const nameWeight = header.name.bold ? 'bold' as const : 'normal' as const
  const titleWeight = header.jobTitle.bold ? 'bold' as const : 'normal' as const

  if (header.alignment === 'hybrid') {
    const startY = y

    if (header.jobTitlePosition === 'beside' && data.jobTitle) {
      doc.setFont(font, nameWeight)
      doc.setFontSize(header.name.fontSize)
      doc.setTextColor(header.name.fontColor)
      const nameText = data.name || 'Your Name'
      doc.text(nameText, MARGIN, y)
      const nameW = doc.getTextWidth(nameText)

      doc.setFont(font, titleWeight)
      doc.setFontSize(header.jobTitle.fontSize)
      doc.setTextColor(header.jobTitle.fontColor)
      doc.text(data.jobTitle, MARGIN + nameW + 4, y)
      y += Math.max(header.name.fontSize, header.jobTitle.fontSize) * 0.32
    } else {
      doc.setFont(font, nameWeight)
      doc.setFontSize(header.name.fontSize)
      doc.setTextColor(header.name.fontColor)
      doc.text(data.name || 'Your Name', MARGIN, y)
      y += header.name.fontSize * 0.32

      if (data.jobTitle) {
        doc.setFont(font, titleWeight)
        doc.setFontSize(header.jobTitle.fontSize)
        doc.setTextColor(header.jobTitle.fontColor)
        doc.text(data.jobTitle, MARGIN, y)
        y += header.jobTitle.fontSize * 0.46
      }
    }

    const leftEndY = y

    if (contactParts.length) {
      let rightY = startY
      const contactLH = baseLH
      doc.setFont(font, 'normal')
      doc.setFontSize(bodySize)
      doc.setTextColor(header.contactFontColor)
      for (const part of contactParts) {
        const pw = doc.getTextWidth(part.text)
        if (part.url) {
          doc.textWithLink(part.text, PAGE_W - MARGIN - pw, rightY, { url: part.url })
        } else {
          doc.text(part.text, PAGE_W - MARGIN, rightY, { align: 'right' })
        }
        rightY += contactLH
      }
      y = Math.max(leftEndY, rightY) + 1
    }
  } else {
    const centered = header.alignment === 'center'

    if (header.jobTitlePosition === 'beside' && data.jobTitle) {
      const nameText = data.name || 'Your Name'

      doc.setFont(font, nameWeight)
      doc.setFontSize(header.name.fontSize)
      const nameW = doc.getTextWidth(nameText)

      doc.setFont(font, titleWeight)
      doc.setFontSize(header.jobTitle.fontSize)
      const titleW = doc.getTextWidth(data.jobTitle)

      const gap = 4
      if (centered) {
        const startX = (PAGE_W - nameW - gap - titleW) / 2

        doc.setFont(font, nameWeight)
        doc.setFontSize(header.name.fontSize)
        doc.setTextColor(header.name.fontColor)
        doc.text(nameText, startX, y)

        doc.setFont(font, titleWeight)
        doc.setFontSize(header.jobTitle.fontSize)
        doc.setTextColor(header.jobTitle.fontColor)
        doc.text(data.jobTitle, startX + nameW + gap, y)
      } else {
        doc.setFont(font, nameWeight)
        doc.setFontSize(header.name.fontSize)
        doc.setTextColor(header.name.fontColor)
        doc.text(nameText, MARGIN, y)

        doc.setFont(font, titleWeight)
        doc.setFontSize(header.jobTitle.fontSize)
        doc.setTextColor(header.jobTitle.fontColor)
        doc.text(data.jobTitle, MARGIN + nameW + gap, y)
      }
      y += Math.max(header.name.fontSize, header.jobTitle.fontSize) * 0.32
    } else {
      doc.setFont(font, nameWeight)
      doc.setFontSize(header.name.fontSize)
      doc.setTextColor(header.name.fontColor)
      const nameText = data.name || 'Your Name'
      if (centered) {
        doc.text(nameText, PAGE_W / 2, y, { align: 'center' })
      } else {
        doc.text(nameText, MARGIN, y)
      }
      y += header.name.fontSize * 0.32

      if (data.jobTitle) {
        doc.setFont(font, titleWeight)
        doc.setFontSize(header.jobTitle.fontSize)
        doc.setTextColor(header.jobTitle.fontColor)
        if (centered) {
          doc.text(data.jobTitle, PAGE_W / 2, y, { align: 'center' })
        } else {
          doc.text(data.jobTitle, MARGIN, y)
        }
        y += header.jobTitle.fontSize * 0.46
      }
    }

    if (contactParts.length) {
      doc.setFont(font, 'normal')
      doc.setFontSize(bodySize)
      doc.setTextColor(header.contactFontColor)

      const sep = '  |  '
      const sepW = doc.getTextWidth(sep)

      const partWidths = contactParts.map(p => doc.getTextWidth(p.text))
      const rows: ContactPart[][] = [[]]
      let rowW = 0
      for (let i = 0; i < contactParts.length; i++) {
        const needed = rowW > 0 ? sepW + partWidths[i] : partWidths[i]
        if (rowW > 0 && rowW + needed > cw) {
          rows.push([])
          rowW = 0
        }
        rows[rows.length - 1].push(contactParts[i])
        rowW += rowW > 0 ? sepW + partWidths[i] : partWidths[i]
      }

      for (const rowParts of rows) {
        let totalW = 0
        for (let i = 0; i < rowParts.length; i++) {
          totalW += doc.getTextWidth(rowParts[i].text)
          if (i < rowParts.length - 1) totalW += sepW
        }
        let x = centered ? (PAGE_W - totalW) / 2 : MARGIN
        for (let i = 0; i < rowParts.length; i++) {
          const part = rowParts[i]
          const pw = doc.getTextWidth(part.text)
          if (part.url) {
            doc.textWithLink(part.text, x, y, { url: part.url })
          } else {
            doc.text(part.text, x, y)
          }
          x += pw
          if (i < rowParts.length - 1) {
            doc.text(sep, x, y)
            x += sepW
          }
        }
        y += baseLH
      }
      y += 1
    }
  }

  // ── Professional Summary ────────────────────────────

  if (data.summary) {
    heading('Professional Summary')
    wrappedText(data.summary, bodySize)
  }

  // ── Technical Skills ────────────────────────────────

  if (data.skills.length) {
    heading('Technical Skills')
    for (const cat of data.skills) {
      pageBreak(5)
      const catLabel = `${cat.category}: `
      const skillsText = cat.skills.join(', ')

      doc.setFont(font, 'bold')
      doc.setFontSize(bodySize)
      doc.setTextColor(bodyColor)
      const catW = doc.getTextWidth(catLabel)
      doc.text(catLabel, MARGIN, y)

      doc.setFont(font, 'normal')
      const skillColW = cw - catW
      const skillLines: string[] = doc.splitTextToSize(skillsText, skillColW)

      doc.text(skillLines[0] || '', MARGIN + catW, y)
      y += baseLH

      for (let j = 1; j < skillLines.length; j++) {
        pageBreak(baseLH)
        doc.text(skillLines[j], MARGIN + catW, y)
        y += baseLH
      }
    }
  }

  // ── Experience ──────────────────────────────────────

  if (data.experience.length) {
    heading('Experience')

    for (let i = 0; i < data.experience.length; i++) {
      const exp = data.experience[i]
      pageBreak(14)

      const rowLH = labelLH

      switch (experienceLayout) {
        case 'company-first':
          twoColumnRow(exp.company, exp.location, 'bold', labelSize, bodySize)
          y += rowLH
          twoColumnRow(exp.role, exp.period, 'italic', labelSize, bodySize)
          y += rowLH
          break

        case 'role-first':
          twoColumnRow(exp.role, exp.period, 'bold', labelSize, bodySize)
          y += rowLH
          twoColumnRow(exp.company, exp.location, 'italic', labelSize, bodySize)
          y += rowLH
          break

        case 'single-row': {
          const dash = ' \u2013 '
          const rightText = `${exp.period}  |  ${exp.location}`

          doc.setFont(font, 'normal')
          doc.setFontSize(bodySize)
          doc.setTextColor(bodyColor)
          const rw = doc.getTextWidth(rightText)

          doc.setFont(font, 'bold')
          doc.setFontSize(labelSize)
          const compW = doc.getTextWidth(exp.company)
          const dashW = doc.getTextWidth(dash)

          doc.setFont(font, 'normal')
          doc.setFontSize(labelSize)
          const roleW = doc.getTextWidth(exp.role)

          const leftTotalW = compW + dashW + roleW
          const maxLeftW = cw - rw - 4
          const scale = leftTotalW > maxLeftW ? maxLeftW / leftTotalW : 1

          doc.setFont(font, 'bold')
          doc.setFontSize(labelSize)
          doc.setTextColor(bodyColor)
          const drawCompany = scale < 1
            ? doc.splitTextToSize(exp.company, compW * scale)[0] || ''
            : exp.company
          doc.text(drawCompany, MARGIN, y)
          const drawnCompW = doc.getTextWidth(drawCompany)

          doc.setFont(font, 'normal')
          doc.text(dash, MARGIN + drawnCompW, y)
          const drawRole = scale < 1
            ? doc.splitTextToSize(exp.role, roleW * scale)[0] || ''
            : exp.role
          doc.text(drawRole, MARGIN + drawnCompW + dashW, y)

          doc.setFontSize(bodySize)
          doc.text(rightText, PAGE_W - MARGIN - rw, y)
          y += rowLH
          break
        }
      }

      for (const bullet of exp.bullets) {
        pageBreak(5)
        doc.setFont(font, 'normal')
        doc.setFontSize(bodySize)
        doc.setTextColor(bodyColor)

        const prefix = '\u2022   '
        const prefixW = doc.getTextWidth(prefix)
        doc.text(prefix, MARGIN + 1, y)

        const bulletLH = baseLH
        const bLines: string[] = doc.splitTextToSize(bullet, cw - prefixW - 1)
        for (let j = 0; j < bLines.length; j++) {
          if (j > 0) pageBreak(bulletLH)
          doc.text(bLines[j], MARGIN + 1 + prefixW, y)
          y += bulletLH
        }
        y += 0.5
      }

      if (i < data.experience.length - 1) y += 3
    }
  }

  // ── Education ───────────────────────────────────────

  if (data.education.length) {
    heading('Education')

    for (const edu of data.education) {
      pageBreak(10)

      twoColumnRow(edu.institution, edu.period, 'bold', labelSize, bodySize)
      y += labelLH

      doc.setFont(font, 'italic')
      doc.setFontSize(bodySize)
      doc.setTextColor(bodyColor)
      doc.text(edu.degree, MARGIN, y)
      y += baseLH
    }
  }

  // ── Certifications ─────────────────────────────────

  if (data.certifications.length) {
    heading('Certifications')

    for (const cert of data.certifications) {
      pageBreak(10)

      twoColumnRow(cert.certification, cert.date, 'bold', labelSize, bodySize)
      y += labelLH

      if (cert.institution) {
        doc.setFont(font, 'italic')
        doc.setFontSize(bodySize)
        doc.setTextColor(bodyColor)
        doc.text(cert.institution, MARGIN, y)
        y += labelLH
      }
    }
  }

  return doc
}

export function generateResumePdf(data: PdfResumeData, settings: ResumeSettings): void {
  const doc = buildResumePdf(data, settings)
  const safeName = data.name
    ? data.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
    : 'Resume'
  doc.save(`${safeName}_Resume.pdf`)
}

export function generateResumePdfBlobUrl(data: PdfResumeData, settings: ResumeSettings): string {
  const doc = buildResumePdf(data, settings)
  return doc.output('bloburl').toString()
}

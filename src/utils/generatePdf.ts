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

const SERIF_FONTS = new Set([
  'Times New Roman', 'Georgia', 'Garamond', 'Merriweather', 'Playfair Display',
])

function pdfFont(family: string): string {
  return SERIF_FONTS.has(family) ? 'times' : 'helvetica'
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
    if (sectionTitle.borderVisible) {
      y += 1.5
      doc.setDrawColor(sectionTitle.fontColor)
      doc.setLineWidth(0.3)
      doc.line(MARGIN, y, PAGE_W - MARGIN, y)
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
  }

  // ── Header ──────────────────────────────────────────

  const contactParts = [
    data.email, data.phone, data.linkedIn, data.gitHub, data.website, data.location,
  ].filter(Boolean)

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
        doc.text(part, PAGE_W - MARGIN, rightY, { align: 'right' })
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
      const contactLine = contactParts.join('  |  ')
      const lines: string[] = doc.splitTextToSize(contactLine, cw)
      for (const line of lines) {
        if (centered) {
          doc.text(line, PAGE_W / 2, y, { align: 'center' })
        } else {
          doc.text(line, MARGIN, y)
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
      const firstLineFit = cw - catW
      const skillLines: string[] = doc.splitTextToSize(skillsText, firstLineFit)

      doc.text(skillLines[0] || '', MARGIN + catW, y)
      y += baseLH

      if (skillLines.length > 1) {
        const drawn = skillLines[0].length
        const rest = skillsText.slice(drawn).trim()
        if (rest) {
          wrappedText(rest, bodySize)
        }
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
          doc.setFont(font, 'bold')
          doc.setFontSize(labelSize)
          doc.setTextColor(bodyColor)
          doc.text(exp.company, MARGIN, y)
          const compW = doc.getTextWidth(exp.company)

          doc.setFont(font, 'normal')
          const dash = ' \u2013 '
          doc.text(dash, MARGIN + compW, y)
          const dashW = doc.getTextWidth(dash)
          doc.text(exp.role, MARGIN + compW + dashW, y)

          doc.setFontSize(bodySize)
          const rightText = `${exp.period}  |  ${exp.location}`
          const rw = doc.getTextWidth(rightText)
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

import jsPDF from 'jspdf'

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
const MARGIN = 19.05 // 0.75 inches

const CLR_DARK = '#111827'
const CLR_MID = '#4b5563'
const CLR_LIGHT = '#6b7280'

export function generateResumePdf(data: PdfResumeData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const cw = PAGE_W - 2 * MARGIN
  let y = MARGIN

  function pageBreak(space: number) {
    if (y + space > PAGE_H - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }

  function sectionHeading(title: string) {
    pageBreak(14)
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(CLR_DARK)
    doc.text(title.toUpperCase(), MARGIN, y)
    y += 1.5
    doc.setDrawColor(CLR_DARK)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, y, PAGE_W - MARGIN, y)
    y += 5
  }

  function wrappedText(
    text: string,
    size: number,
    style: 'normal' | 'italic' | 'bold' = 'normal',
    color: string = CLR_DARK,
    indent: number = 0,
    lh: number = 4.2,
  ) {
    doc.setFont('helvetica', style)
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
    doc.setFont('helvetica', leftStyle)
    doc.setFontSize(leftSize)
    doc.setTextColor(CLR_DARK)

    const maxLeftW = cw - doc.getStringUnitWidth(right) * rightSize * 0.352778 - 4
    const leftLines: string[] = doc.splitTextToSize(left, maxLeftW)
    doc.text(leftLines[0] || '', MARGIN, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(rightSize)
    const rw = doc.getTextWidth(right)
    doc.text(right, PAGE_W - MARGIN - rw, y)
  }

  // ── Header ──────────────────────────────────────────

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(CLR_DARK)
  doc.text(data.name || 'Your Name', MARGIN, y)
  y += 7

  if (data.jobTitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(CLR_MID)
    doc.text(data.jobTitle, MARGIN, y)
    y += 5.5
  }

  const contactParts = [
    data.email,
    data.phone,
    data.linkedIn,
    data.gitHub,
    data.website,
    data.location,
  ].filter(Boolean)

  if (contactParts.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(CLR_LIGHT)
    const contactLine = contactParts.join('  |  ')
    const lines: string[] = doc.splitTextToSize(contactLine, cw)
    for (const line of lines) {
      doc.text(line, MARGIN, y)
      y += 3.8
    }
    y += 1
  }

  // ── Professional Summary ────────────────────────────

  if (data.summary) {
    sectionHeading('Professional Summary')
    wrappedText(data.summary, 10)
  }

  // ── Technical Skills ────────────────────────────────

  if (data.skills.length) {
    sectionHeading('Technical Skills')
    for (const cat of data.skills) {
      pageBreak(5)
      const catLabel = `${cat.category}: `
      const skillsText = cat.skills.join(', ')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(CLR_DARK)
      const catW = doc.getTextWidth(catLabel)
      doc.text(catLabel, MARGIN, y)

      doc.setFont('helvetica', 'normal')
      const firstLineFit = cw - catW
      const skillLines: string[] = doc.splitTextToSize(skillsText, firstLineFit)

      doc.text(skillLines[0] || '', MARGIN + catW, y)
      y += 4.5

      if (skillLines.length > 1) {
        const drawn = skillLines[0].length
        const rest = skillsText.slice(drawn).trim()
        if (rest) {
          wrappedText(rest, 10, 'normal', CLR_DARK, 0, 4.2)
        }
      }
    }
  }

  // ── Experience ──────────────────────────────────────

  if (data.experience.length) {
    sectionHeading('Experience')

    for (let i = 0; i < data.experience.length; i++) {
      const exp = data.experience[i]
      pageBreak(14)

      twoColumnRow(exp.company, exp.location, 'bold', 10.5, 9.5)
      y += 4.5

      twoColumnRow(exp.role, exp.period, 'italic', 10, 9.5)
      y += 4.5

      for (const bullet of exp.bullets) {
        pageBreak(5)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        doc.setTextColor(CLR_DARK)

        const prefix = '\u2022   '
        const prefixW = doc.getTextWidth(prefix)
        doc.text(prefix, MARGIN + 1, y)

        const bLines: string[] = doc.splitTextToSize(bullet, cw - prefixW - 1)
        for (let j = 0; j < bLines.length; j++) {
          if (j > 0) pageBreak(3.8)
          doc.text(bLines[j], MARGIN + 1 + prefixW, y)
          y += 3.8
        }
        y += 0.5
      }

      if (i < data.experience.length - 1) y += 3
    }
  }

  // ── Education ───────────────────────────────────────

  if (data.education.length) {
    sectionHeading('Education')

    for (const edu of data.education) {
      pageBreak(10)

      twoColumnRow(edu.institution, edu.period, 'bold', 10.5, 9.5)
      y += 4.5

      doc.setFont('helvetica', 'italic')
      doc.setFontSize(10)
      doc.setTextColor(CLR_DARK)
      doc.text(edu.degree, MARGIN, y)
      y += 5
    }
  }

  // ── Certifications ─────────────────────────────────

  if (data.certifications.length) {
    sectionHeading('Certifications')

    for (const cert of data.certifications) {
      pageBreak(10)

      twoColumnRow(cert.certification, cert.date, 'bold', 10.5, 9.5)
      y += 4.5

      if (cert.institution) {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(10)
        doc.setTextColor(CLR_DARK)
        doc.text(cert.institution, MARGIN, y)
        y += 4.5
      }
    }
  }

  // ── Save ────────────────────────────────────────────

  const safeName = data.name
    ? data.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
    : 'Resume'
  doc.save(`${safeName}_Resume.pdf`)
}

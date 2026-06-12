import jsPDF from 'jspdf';

/**
 * Generate and download a cosmic-styled PDF report for a client.
 * @param {object} client  - Client document from DB
 * @param {array}  notes   - Array of consultation notes
 */
export function downloadClientPDF(client, notes = []) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 18;
  let y = 0;

  // ─── helpers ────────────────────────────────────────────
  const hex = (h) => {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return [r, g, b];
  };
  const setColor = (h) => doc.setTextColor(...hex(h));
  const setFill  = (h) => doc.setFillColor(...hex(h));

  const wrapText = (text, x, startY, maxW, lineH) => {
    const lines = doc.splitTextToSize(String(text || ''), maxW);
    lines.forEach((line) => {
      if (startY > H - margin - 10) {
        doc.addPage();
        startY = margin + 10;
      }
      doc.text(line, x, startY);
      startY += lineH;
    });
    return startY;
  };

  // ─── HEADER BANNER ──────────────────────────────────────
  setFill('#0d0a1a');
  doc.rect(0, 0, W, 42, 'F');

  // Purple gradient band (simulate with a rect)
  setFill('#7c3aed');
  doc.rect(0, 38, W, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  setColor('#f0e6ff');
  doc.text('✦ ASTROLOGER CRM', margin, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setColor('#a78bfa');
  doc.text('Client Consultation Report', margin, 27);

  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Generated: ${dateStr}`, W - margin, 27, { align: 'right' });

  y = 54;

  // ─── CLIENT NAME BLOCK ──────────────────────────────────
  setFill('#1a1040');
  doc.roundedRect(margin, y - 7, W - margin * 2, 28, 4, 4, 'F');

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  setColor('#f5d020');
  doc.text(client.name || 'Unknown', margin + 6, y + 5);

  const zodiac = client.zodiacSign || '—';
  const gemstone = client.suggestedGemstone || '—';
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setColor('#c4b5fd');
  doc.text(`${zodiac}  •  💎 ${gemstone}`, margin + 6, y + 14);

  y += 36;

  // ─── INFO GRID ──────────────────────────────────────────
  const infoItems = [
    ['Date of Birth', client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
    ['Zodiac Sign',   client.zodiacSign || '—'],
    ['Lucky Gemstone', client.suggestedGemstone ? `💎 ${client.suggestedGemstone}` : '—'],
    ['Email',         client.email || '—'],
    ['Phone',         client.phone || '—'],
    ['Address',       client.address || '—'],
  ];

  const colW = (W - margin * 2 - 6) / 2;
  let col = 0;
  let rowY = y;

  infoItems.forEach(([label, value], i) => {
    const x = margin + col * (colW + 6);

    setFill('#100c2a');
    doc.roundedRect(x, rowY - 5, colW, 20, 3, 3, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor('#7c3aed');
    doc.text(label.toUpperCase(), x + 5, rowY + 2);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor('#e2d9f3');
    doc.text(String(value), x + 5, rowY + 10, { maxWidth: colW - 10 });

    col++;
    if (col === 2) {
      col = 0;
      rowY += 26;
    }
  });

  if (col === 1) rowY += 26;
  y = rowY + 6;

  // General client notes
  if (client.notes) {
    setFill('#0f0a23');
    doc.roundedRect(margin, y, W - margin * 2, 8, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor('#a78bfa');
    doc.text('CLIENT NOTES', margin + 5, y + 5.5);
    y += 14;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setColor('#d1c4e9');
    y = wrapText(client.notes, margin + 5, y, W - margin * 2 - 10, 5.5);
    y += 8;
  }

  // ─── CONSULTATION NOTES ─────────────────────────────────
  if (notes.length > 0) {
    // Section header
    setFill('#7c3aed');
    doc.rect(margin, y, W - margin * 2, 10, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor('#ffffff');
    doc.text('📜  CONSULTATION NOTES', margin + 5, y + 7);
    y += 16;

    notes.forEach((note, idx) => {
      if (y > H - 40) { doc.addPage(); y = margin + 10; }

      // Note card bg
      setFill('#0d0920');
      doc.roundedRect(margin, y, W - margin * 2, 10, 3, 3, 'F');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      setColor('#f5d020');
      doc.text(`${idx + 1}. ${note.title}`, margin + 5, y + 7);

      const noteDate = new Date(note.createdAt).toLocaleDateString('en-IN');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setColor('#9c7fe0');
      doc.text(noteDate, W - margin - 5, y + 7, { align: 'right' });
      y += 16;

      // Content
      if (note.content) {
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        setColor('#d1c4e9');
        y = wrapText(note.content, margin + 5, y, W - margin * 2 - 10, 5.5);
        y += 4;
      }

      // Predictions
      if (note.predictions) {
        if (y > H - 30) { doc.addPage(); y = margin + 10; }
        setFill('#1a1205');
        doc.roundedRect(margin, y, W - margin * 2, 8, 2, 2, 'F');
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        setColor('#f59e0b');
        doc.text('🔮 PREDICTIONS', margin + 5, y + 5.5);
        y += 12;

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        setColor('#fde68a');
        y = wrapText(note.predictions, margin + 5, y, W - margin * 2 - 10, 5.5);
        y += 4;
      }

      // Remedies
      if (note.remedies) {
        if (y > H - 30) { doc.addPage(); y = margin + 10; }
        setFill('#0d0a1a');
        doc.roundedRect(margin, y, W - margin * 2, 8, 2, 2, 'F');
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        setColor('#c084fc');
        doc.text('💊 REMEDIES', margin + 5, y + 5.5);
        y += 12;

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        setColor('#e9d5ff');
        y = wrapText(note.remedies, margin + 5, y, W - margin * 2 - 10, 5.5);
        y += 4;
      }

      y += 8;
    });
  }

  // ─── FOOTER ─────────────────────────────────────────────
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    setFill('#0d0a1a');
    doc.rect(0, H - 12, W, 12, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor('#6b5b95');
    doc.text('Astrologer CRM  •  Confidential Client Report', margin, H - 4.5);
    doc.text(`Page ${p} of ${pages}`, W - margin, H - 4.5, { align: 'right' });
  }

  // ─── DOWNLOAD ───────────────────────────────────────────
  const safeName = (client.name || 'client').replace(/[^a-z0-9]/gi, '_');
  doc.save(`${safeName}_report.pdf`);
}

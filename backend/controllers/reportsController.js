const PDFDocument = require('pdfkit');
const model = require('../models/reportsModel');


const getTotalRevenue = async (req, res) => {
  try {
    const data = await model.getTotalRevenue();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getMonthlyRevenue = async (req, res) => {
  try {
    const data = await model.getMonthlyRevenue();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getOrdersByStatus = async (req, res) => {
  try {
    const data = await model.getOrdersByStatus();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getMostUsedParts = async (req, res) => {
  try {
    const data = await model.getMostUsedParts();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getRevenueByPeriod = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: 'start and end are required' });
    }

    const data = await model.getRevenueByPeriod(start, end);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getOrdersSummary = async (req, res) => {
  try {
    const data = await model.getOrdersSummary();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getAverageTicket = async (req, res) => {
  try {
    const data = await model.getAverageTicket();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function formatCurrencyBR(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatMonthLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value || '-');
  }

  return date.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
}

const generateRevenuePDF = async (req, res) => {
  try {
    const start = String(req.query?.start || '').trim();
    const end = String(req.query?.end || '').trim();
    const hasStart = Boolean(start);
    const hasEnd = Boolean(end);

    if (hasStart !== hasEnd) {
      return res.status(400).json({
        message: 'Para filtrar no PDF, informe start e end juntos'
      });
    }

    if (hasStart && hasEnd) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Periodo invalido para o PDF' });
      }

      if (startDate > endDate) {
        return res.status(400).json({ message: 'A data inicial deve ser menor ou igual a final' });
      }
    }

    const [totalRevenue, monthlyRevenue, periodRevenue] = await Promise.all([
      model.getTotalRevenue(),
      model.getMonthlyRevenue(),
      hasStart && hasEnd ? model.getRevenueByPeriod(start, end) : Promise.resolve(null)
    ]);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=relatorio-faturamento.pdf');
    doc.pipe(res);

    let currentY = 50;

    const ensureSpace = (heightNeeded = 24) => {
      if (currentY + heightNeeded > doc.page.height - 60) {
        doc.addPage();
        currentY = 50;
      }
    };

    doc
      .fillColor('#1a73e8')
      .font('Helvetica-Bold')
      .fontSize(18)
      .text('Relatorio de Faturamento', 50, currentY);
    currentY += 26;

    doc
      .fillColor('#555555')
      .font('Helvetica')
      .fontSize(10)
      .text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, 50, currentY);
    currentY += 22;

    doc
      .fillColor('#111111')
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(`Receita total confirmada: ${formatCurrencyBR(totalRevenue?.total)}`, 50, currentY);
    currentY += 20;

    if (periodRevenue) {
      doc
        .fillColor('#111111')
        .font('Helvetica')
        .fontSize(11)
        .text(
          `Receita no periodo (${start} a ${end}): ${formatCurrencyBR(periodRevenue.total)}`,
          50,
          currentY
        );
      currentY += 20;
    }

    ensureSpace(28);
    doc
      .fillColor('#1a73e8')
      .font('Helvetica-Bold')
      .fontSize(13)
      .text('Receita mensal (pagamentos confirmados)', 50, currentY);
    currentY += 18;

    if (!monthlyRevenue || monthlyRevenue.length === 0) {
      doc
        .fillColor('#666666')
        .font('Helvetica')
        .fontSize(10)
        .text('Nao ha pagamentos confirmados para listar.', 50, currentY);
      currentY += 16;
    } else {
      ensureSpace(24);

      doc.rect(50, currentY, 240, 20).fill('#e8f0fe');
      doc.rect(290, currentY, 240, 20).fill('#e8f0fe');
      doc
        .fillColor('#1f3a68')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Mes', 58, currentY + 5)
        .text('Total', 298, currentY + 5);
      currentY += 20;

      monthlyRevenue.forEach((item) => {
        ensureSpace(20);

        doc.rect(50, currentY, 240, 20).stroke('#d8dee8');
        doc.rect(290, currentY, 240, 20).stroke('#d8dee8');
        doc
          .fillColor('#222222')
          .font('Helvetica')
          .fontSize(10)
          .text(formatMonthLabel(item.month), 58, currentY + 5)
          .text(formatCurrencyBR(item.total), 298, currentY + 5);
        currentY += 20;
      });
    }

    ensureSpace(40);
    currentY += 12;
    doc
      .fillColor('#888888')
      .font('Helvetica')
      .fontSize(9)
      .text(
        'Documento gerado automaticamente pelo sistema de gestao de assistencia tecnica.',
        50,
        currentY,
        { width: doc.page.width - 100, align: 'center' }
      );

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const generateAllOrdersPDF = async (req, res) => {
  try {
    const data = await model.getAllOrders();

    if (data.length === 0)
      return res.status(404).json({ message: 'Nenhuma OS encontrada' });

    // ─── Agrupa linhas por OS ─────────────────────────────────────
    const ordersMap = new Map();
    data.forEach(row => {
      if (!ordersMap.has(row.id_os)) {
        ordersMap.set(row.id_os, {
          id_os: row.id_os,
          descricao_problema: row.descricao_problema,
          valor_mao_obra: row.valor_mao_obra,
          valor_total: row.valor_total,
          status_os: row.status_os,
          data_abertura: row.data_abertura,
          cliente: row.cliente,
          tipo: row.tipo,
          marca: row.marca,
          modelo: row.modelo,
          pecas: [],
        });
      }
      if (row.nome_peca) {
        ordersMap.get(row.id_os).pecas.push({
          nome_peca: row.nome_peca,
          quantidade: row.quantidade,
          preco_unitario_cobrado: row.preco_unitario_cobrado,
        });
      }
    });

    const orders = Array.from(ordersMap.values());

    // ─── Setup do PDF ─────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=todas-as-os.pdf');
    doc.pipe(res);

    const pageWidth = doc.page.width - 100;
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    const STATUS_COLORS = {
      'Aberto': { bg: '#e8f4fd', text: '#1a73e8' },
      'Em Analise': { bg: '#fff8e1', text: '#8d6e63' },
      'Aguardando Peca': { bg: '#fff3e0', text: '#ef6c00' },
      'Concluido': { bg: '#e8f8e8', text: '#2e7d32' },
      'Concluida': { bg: '#e8f8e8', text: '#2e7d32' },
      'Em Analise Tecnica': { bg: '#fff8e1', text: '#8d6e63' },
      'Em Conserto': { bg: '#fff3e0', text: '#ef6c00' },
      'Cancelada': { bg: '#fde8e8', text: '#c62828' },
    };

    // ─── Helper: nova página se não couber ────────────────────────
    const checkPageBreak = (neededHeight) => {
      if (currentY + neededHeight > doc.page.height - 70) {
        doc.addPage();
        currentY = 50;
      }
    };

    // ─── CABEÇALHO ───────────────────────────────────────────────
    // ─── CABEÇALHO ───────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill('#1a73e8');

    doc.fillColor('#ffffff')
      .fontSize(16).font('Helvetica-Bold')
      .text('RELATÓRIO DE ORDENS DE SERVIÇO', 50, 25, { width: 380 }); // <- limita largura

    doc.fontSize(10).font('Helvetica')
      .text(`Emitido em: ${dataAtual}`, 440, 25, { width: 110 }); // <- posição X fixa, não usa align:right

    doc.fontSize(11)
      .text(`Total de OS: ${orders.length}`, 50, 52);

    let currentY = 100;

    // ─── LOOP POR OS ──────────────────────────────────────────────
    orders.forEach((os, osIndex) => {
      const equipamento = `${os.tipo} ${os.marca} ${os.modelo}`;
      const dataAbertura = os.data_abertura
        ? new Date(os.data_abertura).toLocaleDateString('pt-BR')
        : '—';
      const statusStyle = STATUS_COLORS[os.status_os] || { bg: '#f5f5f5', text: '#555' };

      // Estima altura necessária: cabeçalho da OS + peças + totais
      const estimatedHeight = 32 + 24 + (os.pecas.length || 1) * 20 + 28 + 16;
      checkPageBreak(estimatedHeight);

      currentY += osIndex === 0 ? 10 : 20;

      // ── Faixa título da OS ──
      doc.rect(50, currentY, pageWidth, 28).fill('#1a73e8');

      // ID e cliente (esquerda)
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11)
        .text(`OS #${os.id_os} — ${os.cliente}`, 60, currentY + 8, { width: 250 });

      // Data de abertura (centro)
      doc.fillColor('#ffffff').font('Helvetica').fontSize(8)
        .text(`Aberto em: ${dataAbertura}`, 320, currentY + 10);

      // Badge de status (direita) — fora do rect azul para não sobrepor
      const badgeX = doc.page.width - 145;

      doc.rect(badgeX, currentY + 6, 85, 16).fill(statusStyle.bg);
      doc.fillColor(statusStyle.text).fontSize(8).font('Helvetica-Bold')
        .text(os.status_os, badgeX + 2, currentY + 9, { width: 81, align: 'center' });

      currentY += 28;

      // ── Linha de info: equipamento e problema ──
      doc.rect(50, currentY, pageWidth, 24).fill('#f0f4ff').stroke('#d0d8f0');
      doc.fillColor('#333333').font('Helvetica-Bold').fontSize(8)
        .text('Equipamento:', 60, currentY + 4);
      doc.font('Helvetica').fontSize(8)
        .text(equipamento, 130, currentY + 4, { width: 160 });

      doc.font('Helvetica-Bold').fontSize(8)
        .text('Problema:', 310, currentY + 4);
      doc.font('Helvetica').fontSize(8)
        .text(os.descricao_problema, 360, currentY + 4, { width: pageWidth - 315, ellipsis: true });

      currentY += 24;

      // ── Cabeçalho da tabela de peças ──
      const colPeca = 55;
      const colQtd = 330;
      const colUnit = 390;
      const colSub = 460;

      doc.rect(50, currentY, pageWidth, 20).fill('#3d8ef0');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
      doc.text('Peça', colPeca, currentY + 5);
      doc.text('Qtd', colQtd, currentY + 5);
      doc.text('Vlr Unit.', colUnit, currentY + 5);
      doc.text('Subtotal', colSub, currentY + 5);

      currentY += 20;

      // ── Linhas de peças ──
      if (os.pecas.length === 0) {
        doc.rect(50, currentY, pageWidth, 18).fill('#fafafa').stroke('#e0e6f0');
        doc.fillColor('#aaaaaa').font('Helvetica-Oblique').fontSize(8)
          .text('Nenhuma peça registrada.', colPeca, currentY + 4);
        currentY += 18;
      } else {
        os.pecas.forEach((peca, i) => {
          checkPageBreak(20);
          const rowBg = i % 2 === 0 ? '#ffffff' : '#f7f9ff';
          const subtotal = (peca.quantidade * peca.preco_unitario_cobrado).toFixed(2);

          doc.rect(50, currentY, pageWidth, 18).fill(rowBg).stroke('#e0e6f0');
          doc.fillColor('#333333').font('Helvetica').fontSize(8);
          doc.text(peca.nome_peca, colPeca, currentY + 4, { width: 270, ellipsis: true });
          doc.text(String(peca.quantidade), colQtd, currentY + 4);
          doc.text(`R$ ${Number(peca.preco_unitario_cobrado).toFixed(2)}`, colUnit, currentY + 4);
          doc.text(`R$ ${subtotal}`, colSub, currentY + 4);

          currentY += 18;
        });
      }

      // ── Linha de mão de obra + total ──
      checkPageBreak(48);

      doc.rect(50, currentY, pageWidth, 20).fill('#f0f4ff').stroke('#d0d8f0');
      doc.fillColor('#555555').font('Helvetica').fontSize(8)
        .text('Mão de obra:', colPeca, currentY + 5);
      doc.font('Helvetica-Bold')
        .text(`R$ ${Number(os.valor_mao_obra).toFixed(2)}`, 0, currentY + 5, {
          align: 'right', width: doc.page.width - 60,
        });

      currentY += 20;

      doc.rect(50, currentY, pageWidth, 22).fill('#1a73e8');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10)
        .text('TOTAL:', colPeca, currentY + 5);
      doc.text(`R$ ${Number(os.valor_total).toFixed(2)}`, 0, currentY + 5, {
        align: 'right', width: doc.page.width - 60,
      });

      currentY += 22;
    });

    // ─── TOTAL GERAL ──────────────────────────────────────────────
    checkPageBreak(50);
    currentY += 20;

    const totalGeral = orders.reduce((acc, os) => acc + Number(os.valor_total), 0);

    doc.rect(50, currentY, pageWidth, 30).fill('#0d47a1');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(13)
      .text('TOTAL GERAL:', 60, currentY + 8);
    doc.text(`R$ ${totalGeral.toFixed(2)}`, 0, currentY + 8, {
      align: 'right', width: doc.page.width - 60,
    });

    // ─── RODAPÉ ───────────────────────────────────────────────────
    const footerY = doc.page.height - 50;
    doc.rect(0, footerY, doc.page.width, 50).fill('#f5f5f5');
    doc.fillColor('#999999').font('Helvetica').fontSize(8)
      .text('Documento gerado automaticamente pelo sistema de gestão de OS.', 50, footerY + 18, {
        align: 'center', width: pageWidth,
      });

    doc.end();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  getTotalRevenue,
  getMonthlyRevenue,
  getOrdersByStatus,
  getMostUsedParts,
  getRevenueByPeriod,
  getOrdersSummary,
  getAverageTicket,
  generateRevenuePDF,
  generateAllOrdersPDF
};

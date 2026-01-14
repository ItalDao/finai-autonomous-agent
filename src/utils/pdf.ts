import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (
  elementId: string,
  filename: string = 'reporte.pdf'
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento no encontrado');
    }

    // Crear canvas del elemento
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#0f172a'
    });

    // Crear PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // Ancho A4
    const pageHeight = 295; // Alto A4
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Agregar imágenes si excede una página
    while (heightLeft >= 0) {
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      position -= pageHeight;
      if (heightLeft > 0) {
        pdf.addPage();
      }
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    throw error;
  }
};

export const exportFinancialAnalysisToPDF = async (
  data: {
    totalSpent?: string;
    subscriptions?: number;
    subscriptionCost?: string;
    predictions?: { nextMonth?: string; savings?: string };
    insights?: string[];
    duplicates?: Array<{ name: string; count: number; saving: number | string }>;
  },
  transactions?: Array<{ date: string; description: string; amount: number; category: string }>,
  filename: string = 'analisis-financiero.pdf'
) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const lineHeight = 7;

    // Encabezado
    pdf.setFontSize(18);
    pdf.text('Análisis Financiero FinAI', margin, yPosition);
    yPosition += 12;

    pdf.setFontSize(10);
    pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin, yPosition);
    yPosition += 10;

    // Resumen
    if (data.totalSpent || data.subscriptions) {
      pdf.setFontSize(14);
      pdf.text('Resumen', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(11);
      if (data.totalSpent) {
        pdf.text(`Total Gastado: ${data.totalSpent}`, margin + 5, yPosition);
        yPosition += lineHeight;
      }
      if (data.subscriptions) {
        pdf.text(`Suscripciones: ${data.subscriptions}`, margin + 5, yPosition);
        yPosition += lineHeight;
      }
      if (data.subscriptionCost) {
        pdf.text(`Costo de Suscripciones: ${data.subscriptionCost}`, margin + 5, yPosition);
        yPosition += lineHeight;
      }
      yPosition += 5;
    }

    // Predicciones
    if (data.predictions) {
      pdf.setFontSize(14);
      pdf.text('Predicciones', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(11);
      if (data.predictions.nextMonth) {
        pdf.text(
          `Gasto Próximo Mes: ${data.predictions.nextMonth}`,
          margin + 5,
          yPosition
        );
        yPosition += lineHeight;
      }
      if (data.predictions.savings) {
        pdf.text(
          `Potencial de Ahorro: ${data.predictions.savings}`,
          margin + 5,
          yPosition
        );
        yPosition += lineHeight;
      }
      yPosition += 5;
    }

    // Insights
    if (data.insights && data.insights.length > 0) {
      pdf.setFontSize(14);
      pdf.text('Insights de IA', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      data.insights.slice(0, 5).forEach((insight) => {
        const lines = pdf.splitTextToSize(
          `• ${insight}`,
          pageWidth - margin * 2
        );
        lines.forEach((line: string) => {
          if (yPosition > 280) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, margin + 3, yPosition);
          yPosition += lineHeight;
        });
      });
      yPosition += 5;
    }

    // Duplicados
    if (data.duplicates && data.duplicates.length > 0) {
      pdf.setFontSize(14);
      pdf.text('Servicios Duplicados', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      data.duplicates.forEach((dup) => {
        const savingNumber = typeof dup.saving === 'number' ? dup.saving : Number(dup.saving);
        const savingFormatted = Number.isFinite(savingNumber) ? savingNumber.toFixed(2) : '0.00';
        const text = `${dup.name}: ${dup.count} veces (Ahorro: $${savingFormatted})`;
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(text, margin + 5, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 5;
    }

    // Transacciones recientes
    if (transactions && transactions.length > 0) {
      if (yPosition > 260) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.text('Transacciones Recientes', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      const recentTransactions = transactions.slice(-10);
      recentTransactions.forEach((t) => {
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        const date = new Date(t.date).toLocaleDateString('es-ES');
        const text = `${date} - ${t.description}: $${Math.abs(t.amount).toFixed(2)}`;
        pdf.text(text, margin + 5, yPosition);
        yPosition += lineHeight;
      });
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error al exportar análisis:', error);
    throw error;
  }
};

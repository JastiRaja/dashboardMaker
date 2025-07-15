import React, { useState, useRef } from 'react';
import { Download, FileText, Image, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { ChartConfig, DataRow } from '../../types';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

interface ChartExportProps {
  chartConfig: ChartConfig;
  data: DataRow[];
  chartElementRef?: React.RefObject<HTMLElement>;
}

const ChartExport: React.FC<ChartExportProps> = ({
  chartConfig,
  data,
  chartElementRef
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'csv' | 'json'>('csv');

  const exportData = async (format: typeof exportFormat) => {
    setIsExporting(true);
    try {
      switch (format) {
        case 'csv':
          await exportAsCSV();
          toast.success('CSV exported successfully!');
          break;
        case 'json':
          await exportAsJSON();
          toast.success('JSON exported successfully!');
          break;
        case 'png':
          await exportAsPNG();
          toast.success('PNG image exported successfully!');
          break;
        case 'svg':
          await exportAsSVG();
          toast.success('SVG image exported successfully!');
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Failed to export ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsCSV = async () => {
    if (!chartConfig.xAxis || !chartConfig.yAxis) return;

    const csvContent = [
      [chartConfig.xAxis, chartConfig.yAxis],
      ...data.map(row => [
        row[chartConfig.xAxis!] || '',
        row[chartConfig.yAxis!] || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    downloadFile(csvContent, `${chartConfig.title}.csv`, 'text/csv');
  };

  const exportAsJSON = async () => {
    const jsonContent = {
      chartConfig,
      data,
      exportDate: new Date().toISOString(),
      metadata: {
        totalRows: data.length,
        columns: Object.keys(data[0] || {}),
        chartType: chartConfig.type
      }
    };
    
    downloadFile(
      JSON.stringify(jsonContent, null, 2),
      `${chartConfig.title}.json`,
      'application/json'
    );
  };

  const exportAsPNG = async () => {
    try {
      // Find the chart element by data attribute
      const chartElement = document.querySelector(`[data-chart-id="${chartConfig.id}"]`);
      
      if (!chartElement) {
        throw new Error('Chart element not found. Please ensure the chart is fully loaded.');
      }

      // Configure html2canvas options for better quality
      const canvas = await html2canvas(chartElement as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        width: chartConfig.settings.width,
        height: chartConfig.settings.height + 100, // Extra space for title and controls
        logging: false,
        onclone: (clonedDoc) => {
          // Remove export controls from the cloned element to avoid capturing them
          const clonedElement = clonedDoc.querySelector(`[data-chart-id="${chartConfig.id}"]`);
          if (clonedElement) {
            const exportControls = clonedElement.querySelector('.chart-export-controls');
            if (exportControls) {
              exportControls.remove();
            }
            // Also remove any other UI controls that shouldn't be in the export
            const chartControls = clonedElement.querySelector('.absolute.top-2.right-2');
            if (chartControls) {
              chartControls.remove();
            }
          }
        }
      });

      // Convert canvas to blob and download
      return new Promise<void>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${chartConfig.title}.png`;
            a.click();
            URL.revokeObjectURL(url);
            resolve();
          } else {
            reject(new Error('Failed to generate PNG blob'));
          }
        }, 'image/png', 0.95);
      });
    } catch (error) {
      console.error('PNG export failed:', error);
      throw error;
    }
  };

  const exportAsSVG = async () => {
    try {
      // Find the chart element
      const chartElement = document.querySelector(`[data-chart-id="${chartConfig.id}"]`);
      
      if (!chartElement) {
        console.error('Chart element not found');
        return;
      }

      // For SVG export, we'll create a custom SVG based on the chart data
      const svgContent = generateChartSVG();
      downloadFile(svgContent, `${chartConfig.title}.svg`, 'image/svg+xml');
    } catch (error) {
      console.error('SVG export failed:', error);
    }
  };

  const generateChartSVG = (): string => {
    const width = chartConfig.settings.width;
    const height = chartConfig.settings.height;
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Color palette for charts
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#0088FE', '#00C49F'];

    // Basic SVG structure
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background
    svg += `<rect width="${width}" height="${height}" fill="white"/>`;
    
    // Title
    svg += `<text x="${width/2}" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333">${chartConfig.title}</text>`;
    
    if (chartConfig.type === 'bar' && chartConfig.xAxis && chartConfig.yAxis) {
      // Generate bar chart SVG
      const barWidth = Math.min(chartWidth / data.length, 50);
      const maxValue = Math.max(...data.map(row => Number(row[chartConfig.yAxis!]) || 0));
      
      // Add grid lines
      for (let i = 0; i <= 5; i++) {
        const y = height - padding - (i * chartHeight / 5);
        svg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#f0f0f0" stroke-width="1"/>`;
      }
      
      data.forEach((row, index) => {
        const x = padding + (index * chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
        const value = Number(row[chartConfig.yAxis!]) || 0;
        const barHeight = (value / maxValue) * chartHeight;
        const y = height - padding - barHeight;
        
        svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${colors[index % colors.length]}" stroke="#fff" stroke-width="1" rx="2"/>`;
        svg += `<text x="${x + barWidth/2}" y="${height - padding + 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">${row[chartConfig.xAxis!]}</text>`;
        svg += `<text x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#333">${value}</text>`;
      });
    } else if (chartConfig.type === 'line' && chartConfig.xAxis && chartConfig.yAxis) {
      // Generate line chart SVG
      const maxValue = Math.max(...data.map(row => Number(row[chartConfig.yAxis!]) || 0));
      
      // Add grid lines
      for (let i = 0; i <= 5; i++) {
        const y = height - padding - (i * chartHeight / 5);
        svg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#f0f0f0" stroke-width="1"/>`;
      }
      
      const points = data.map((row, index) => {
        const x = padding + (index * chartWidth / (data.length - 1));
        const value = Number(row[chartConfig.yAxis!]) || 0;
        const y = height - padding - (value / maxValue) * chartHeight;
        return `${x},${y}`;
      }).join(' ');
      
      svg += `<polyline points="${points}" fill="none" stroke="${colors[0]}" stroke-width="3"/>`;
      
      // Add data points
      data.forEach((row, index) => {
        const x = padding + (index * chartWidth / (data.length - 1));
        const value = Number(row[chartConfig.yAxis!]) || 0;
        const y = height - padding - (value / maxValue) * chartHeight;
        
        svg += `<circle cx="${x}" cy="${y}" r="5" fill="${colors[0]}" stroke="#fff" stroke-width="2"/>`;
        svg += `<text x="${x}" y="${y - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#333">${value}</text>`;
      });
    } else if (chartConfig.type === 'area' && chartConfig.xAxis && chartConfig.yAxis) {
      // Generate area chart SVG
      const maxValue = Math.max(...data.map(row => Number(row[chartConfig.yAxis!]) || 0));
      
      const points = data.map((row, index) => {
        const x = padding + (index * chartWidth / (data.length - 1));
        const value = Number(row[chartConfig.yAxis!]) || 0;
        const y = height - padding - (value / maxValue) * chartHeight;
        return `${x},${y}`;
      });
      
      const areaPath = `${points.join(' ')} L ${points[points.length - 1].split(',')[0]},${height - padding} L ${points[0].split(',')[0]},${height - padding} Z`;
      
      svg += `<path d="M ${areaPath}" fill="${colors[0]}" fill-opacity="0.3" stroke="${colors[0]}" stroke-width="2"/>`;
    } else if (chartConfig.type === 'pie' && chartConfig.xAxis && chartConfig.yAxis) {
      // Generate pie chart SVG
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(chartWidth, chartHeight) / 3;
      
      const total = data.reduce((sum, row) => sum + (Number(row[chartConfig.yAxis!]) || 0), 0);
      let currentAngle = -Math.PI / 2; // Start from top
      
      data.forEach((row, index) => {
        const value = Number(row[chartConfig.yAxis!]) || 0;
        const sliceAngle = (value / total) * 2 * Math.PI;
        const endAngle = currentAngle + sliceAngle;
        
        const x1 = centerX + radius * Math.cos(currentAngle);
        const y1 = centerY + radius * Math.sin(currentAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);
        
        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
        
        svg += `<path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z" fill="${colors[index % colors.length]}" stroke="#fff" stroke-width="2"/>`;
        
        // Add labels
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);
        
        svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#333">${row[chartConfig.xAxis!]}</text>`;
        
        currentAngle = endAngle;
      });
    } else if (chartConfig.type === 'scatter' && chartConfig.xAxis && chartConfig.yAxis) {
      // Generate scatter plot SVG
      const maxValue = Math.max(...data.map(row => Number(row[chartConfig.yAxis!]) || 0));
      
      data.forEach((row, index) => {
        const x = padding + (Number(row[chartConfig.xAxis!]) || 0) * (chartWidth / Math.max(...data.map(r => Number(r[chartConfig.xAxis!]) || 0)));
        const value = Number(row[chartConfig.yAxis!]) || 0;
        const y = height - padding - (value / maxValue) * chartHeight;
        
        svg += `<circle cx="${x}" cy="${y}" r="6" fill="${colors[index % colors.length]}" stroke="#fff" stroke-width="2"/>`;
      });
    }
    
    svg += '</svg>';
    return svg;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getExportIcon = (format: typeof exportFormat) => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'json':
        return <FileText className="h-4 w-4" />;
      case 'png':
      case 'svg':
        return <Image className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getExportLabel = (format: typeof exportFormat) => {
    switch (format) {
      case 'csv':
        return 'CSV Data';
      case 'json':
        return 'JSON Data';
      case 'png':
        return 'PNG Image';
      case 'svg':
        return 'SVG Image';
      default:
        return 'Export';
    }
  };

  return (
    <div className="flex items-center space-x-2 chart-export-controls">
      <select
        value={exportFormat}
        onChange={(e) => setExportFormat(e.target.value as typeof exportFormat)}
        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="csv">CSV</option>
        <option value="json">JSON</option>
        <option value="png">PNG</option>
        <option value="svg">SVG</option>
      </select>
      
      <button
        onClick={() => exportData(exportFormat)}
        disabled={isExporting}
        className="flex items-center space-x-1 px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors disabled:opacity-50"
      >
        {getExportIcon(exportFormat)}
        <span>{isExporting ? 'Exporting...' : getExportLabel(exportFormat)}</span>
      </button>
    </div>
  );
};

export default ChartExport; 
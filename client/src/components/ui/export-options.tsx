import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileSpreadsheet, Mail, Share2, Printer } from "lucide-react";

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  format: string;
  onClick: () => void;
}

interface ExportOptionsProps {
  data: any[];
  filename: string;
  type: 'guests' | 'vendors' | 'budget' | 'tasks';
}

export default function ExportOptions({ data, filename, type }: ExportOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportToCsv = () => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportToJson = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const printData = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>${filename}</h1>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(item => 
                `<tr>${Object.values(item).map(value => `<td>${value || ''}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    setIsOpen(false);
  };

  const shareData = () => {
    if (navigator.share) {
      const textData = data.map(item => 
        Object.entries(item).map(([key, value]) => `${key}: ${value}`).join(', ')
      ).join('\n');
      
      navigator.share({
        title: filename,
        text: textData,
      });
    } else {
      // Fallback: copy to clipboard
      const textData = data.map(item => 
        Object.entries(item).map(([key, value]) => `${key}: ${value}`).join(', ')
      ).join('\n');
      
      navigator.clipboard.writeText(textData).then(() => {
        alert('Data copied to clipboard!');
      });
    }
    setIsOpen(false);
  };

  const exportOptions: ExportOption[] = [
    {
      id: 'csv',
      title: 'CSV File',
      description: 'Export as comma-separated values',
      icon: <FileSpreadsheet className="text-green-600" size={24} />,
      format: 'CSV',
      onClick: exportToCsv
    },
    {
      id: 'json',
      title: 'JSON File',
      description: 'Export as structured data',
      icon: <FileText className="text-blue-600" size={24} />,
      format: 'JSON',
      onClick: exportToJson
    },
    {
      id: 'print',
      title: 'Print',
      description: 'Print or save as PDF',
      icon: <Printer className="text-gray-600" size={24} />,
      format: 'PDF',
      onClick: printData
    },
    {
      id: 'share',
      title: 'Share',
      description: 'Share or copy to clipboard',
      icon: <Share2 className="text-purple-600" size={24} />,
      format: 'TEXT',
      onClick: shareData
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download size={16} />
          Export
          <Badge variant="secondary">{data.length}</Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export {filename}</DialogTitle>
          <DialogDescription>
            Choose how you want to export your wedding data for sharing or backup.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportOptions.map((option) => (
            <Card 
              key={option.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={option.onClick}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center space-x-3">
                    {option.icon}
                    <span>{option.title}</span>
                  </div>
                  <Badge variant="outline">{option.format}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{option.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Ready to export:</strong> {data.length} {type} records
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
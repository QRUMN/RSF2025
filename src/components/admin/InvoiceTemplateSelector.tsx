import React from 'react';
import { FileText, Users, MessageCircle, Package } from 'lucide-react';
import { INVOICE_TEMPLATES, InvoiceTemplateType } from '../../types/invoice';

interface InvoiceTemplateSelectorProps {
  selectedTemplate: InvoiceTemplateType;
  onSelectTemplate: (template: InvoiceTemplateType) => void;
}

const InvoiceTemplateSelector: React.FC<InvoiceTemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate
}) => {
  // Map template types to icons
  const getTemplateIcon = (type: InvoiceTemplateType) => {
    switch (type) {
      case 'personal_training':
        return <Users className="w-5 h-5" />;
      case 'messaging':
        return <MessageCircle className="w-5 h-5" />;
      case 'vendor':
        return <Package className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-light/70">Select Template</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {INVOICE_TEMPLATES.map((template) => (
          <button
            key={template.type}
            onClick={() => onSelectTemplate(template.type)}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-colors ${
              selectedTemplate === template.type
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-primary/20 bg-dark hover:bg-dark-surface text-light/70 hover:text-light'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-dark-surface flex items-center justify-center mb-2">
              {getTemplateIcon(template.type)}
            </div>
            <span className="text-sm font-medium">{template.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InvoiceTemplateSelector;

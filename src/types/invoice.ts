export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type InvoiceTemplateType = 'personal_training' | 'messaging' | 'vendor';

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at?: string;
}

export interface Invoice {
  id?: string;
  invoice_number?: string;
  client_id?: string;
  client_name: string;
  client_email: string;
  client_address?: string;
  invoice_date: string;
  due_date: string;
  status: InvoiceStatus;
  template_type: InvoiceTemplateType;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  terms?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  paid_at?: string;
  items: InvoiceItem[];
}

export interface InvoiceTemplate {
  name: string;
  type: InvoiceTemplateType;
  defaultItems: Partial<InvoiceItem>[];
  defaultNotes?: string;
  defaultTerms?: string;
  defaultTaxRate?: number;
}

export const INVOICE_TEMPLATES: InvoiceTemplate[] = [
  {
    name: 'Personal Training',
    type: 'personal_training',
    defaultItems: [
      {
        description: 'Personal Training Session (60 min)',
        quantity: 1,
        unit_price: 75,
        amount: 75
      }
    ],
    defaultNotes: 'Thank you for choosing Ready Set Fitness for your personal training needs.',
    defaultTerms: 'Payment due within 14 days of invoice date. Please make payment via bank transfer or through our online portal.',
    defaultTaxRate: 0
  },
  {
    name: 'Message/Body Work',
    type: 'messaging',
    defaultItems: [
      {
        description: 'Monthly Nutrition Coaching',
        quantity: 1,
        unit_price: 99,
        amount: 99
      },
      {
        description: 'Unlimited Messaging Support',
        quantity: 1,
        unit_price: 49,
        amount: 49
      }
    ],
    defaultNotes: 'This invoice covers your monthly coaching and messaging support subscription.',
    defaultTerms: 'Subscription renews automatically unless cancelled. Payment due within 7 days of invoice date.',
    defaultTaxRate: 0
  },
  {
    name: 'Vendor Services',
    type: 'vendor',
    defaultItems: [
      {
        description: 'Professional Services',
        quantity: 1,
        unit_price: 0,
        amount: 0
      }
    ],
    defaultNotes: 'Invoice for vendor services provided to Ready Set Fitness.',
    defaultTerms: 'Payment terms: Net 30 days. Please include invoice number with payment.',
    defaultTaxRate: 7.5
  }
];

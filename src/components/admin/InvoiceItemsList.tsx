import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { InvoiceItem } from '../../types/invoice';

interface InvoiceItemsListProps {
  items: InvoiceItem[];
  setItems: (items: InvoiceItem[]) => void;
}

const InvoiceItemsList: React.FC<InvoiceItemsListProps> = ({ items, setItems }) => {
  const addItem = () => {
    setItems([...items, {
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0
    }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate amount if quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].amount = Number(newItems[index].quantity) * Number(newItems[index].unit_price);
    }
    
    setItems(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-light/70">Invoice Items</h3>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={addItem}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-light/70 text-left border-b border-primary/10">
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 font-medium w-24 text-right">Quantity</th>
              <th className="pb-2 font-medium w-32 text-right">Price</th>
              <th className="pb-2 font-medium w-32 text-right">Amount</th>
              <th className="pb-2 font-medium w-16"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-light/50">
                  No items added to this invoice yet
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index} className="border-b border-primary/10 last:border-0">
                  <td className="py-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full bg-dark border border-primary/20 rounded py-1 px-2 text-light focus:outline-none focus:border-primary"
                      placeholder="Item description"
                    />
                  </td>
                  <td className="py-3">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      className="w-full bg-dark border border-primary/20 rounded py-1 px-2 text-light text-right focus:outline-none focus:border-primary"
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end">
                      <span className="mr-1">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                        className="w-full bg-dark border border-primary/20 rounded py-1 px-2 text-light text-right focus:outline-none focus:border-primary"
                      />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    ${item.amount.toFixed(2)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => removeItem(index)}
                      className="text-light/50 hover:text-primary transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addItem}
            className="flex items-center gap-1 mx-auto"
          >
            <Plus className="w-4 h-4" /> Add First Item
          </Button>
        </div>
      )}
    </div>
  );
};

export default InvoiceItemsList;

import React, { useState } from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { DollarSign, TrendingUp, CreditCard, Calendar, FileText } from 'lucide-react';
import InvoiceManager from '../../components/admin/InvoiceManager';
import InvoiceCreator from '../../components/admin/InvoiceCreator';
import { Button } from '../../components/ui/Button';

const AdminFinancialsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'create-invoice'>('overview');

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-display font-bold text-light mb-6 md:mb-8">
        Financials
      </h1>
      
      <div className="mb-6 flex flex-wrap gap-2">
        <Button 
          variant={activeTab === 'overview' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-1"
        >
          <DollarSign className="w-4 h-4" /> Overview
        </Button>
        <Button 
          variant={activeTab === 'invoices' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('invoices')}
          className="flex items-center gap-1"
        >
          <FileText className="w-4 h-4" /> Invoices
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-3 md:mr-4">
                <DollarSign className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-light/70 text-sm">Total Revenue</p>
                <h3 className="text-xl md:text-2xl font-semibold text-light">$24,500</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-3 md:mr-4">
                <TrendingUp className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-light/70 text-sm">Monthly Growth</p>
                <h3 className="text-xl md:text-2xl font-semibold text-light">+15.2%</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-3 md:mr-4">
                <CreditCard className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-light/70 text-sm">Active Subscriptions</p>
                <h3 className="text-xl md:text-2xl font-semibold text-light">342</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-3 md:mr-4">
                <Calendar className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-light/70 text-sm">Next Payout</p>
                <h3 className="text-xl md:text-2xl font-semibold text-light">May 15</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <h2 className="text-xl font-semibold text-light mb-6">Recent Transactions</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-primary/10 last:border-0">
                  <div>
                    <p className="font-medium text-light">Subscription Payment</p>
                    <p className="text-sm text-light/70">User #1234{i}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">+$49.99</p>
                    <p className="text-sm text-light/70">May {i}, 2025</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="text-xl font-semibold text-light mb-6">Revenue by Plan</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-light">Basic Plan</span>
                  <span className="text-light">$8,245</span>
                </div>
                <div className="w-full h-2 bg-dark rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '35%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-light">Pro Plan</span>
                  <span className="text-light">$12,830</span>
                </div>
                <div className="w-full h-2 bg-dark rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '55%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-light">Elite Plan</span>
                  <span className="text-light">$3,425</span>
                </div>
                <div className="w-full h-2 bg-dark rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      )}

      {activeTab === 'create-invoice' && (
        <InvoiceCreator 
          onClose={() => setActiveTab('invoices')}
          onSaved={() => setActiveTab('invoices')} 
        />
      )}
      
      {activeTab === 'invoices' && (
        <InvoiceManager
          onCreateNew={() => setActiveTab('create-invoice')}
        />
      )}
    </div>
  );
};

export default AdminFinancialsPage;
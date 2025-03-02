import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import SubscriptionSettings from './settings/SubscriptionSettings';
import AccountSettings from './settings/AccountSettings';
import PreferencesSettings from './settings/PreferencesSettings';
import SecuritySettings from './settings/SecuritySettings';
import IntegrationsSettings from './settings/IntegrationsSettings';
import HelpSettings from './settings/HelpSettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('subscription');

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Configuración</h1>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Tabs defaultValue="subscription" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200">
              <TabsList className="flex">
                <TabsTrigger value="subscription" className="px-4 py-3 text-sm font-medium">
                  📅 Suscripción
                </TabsTrigger>
                <TabsTrigger value="account" className="px-4 py-3 text-sm font-medium">
                  👤 Cuenta
                </TabsTrigger>
                <TabsTrigger value="preferences" className="px-4 py-3 text-sm font-medium">
                  ⚙️ Preferencias
                </TabsTrigger>
                <TabsTrigger value="security" className="px-4 py-3 text-sm font-medium">
                  🔒 Seguridad
                </TabsTrigger>
                <TabsTrigger value="integrations" className="px-4 py-3 text-sm font-medium">
                  🛠️ Integraciones
                </TabsTrigger>
                <TabsTrigger value="help" className="px-4 py-3 text-sm font-medium">
                  ❓ Ayuda
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="subscription">
                <SubscriptionSettings />
              </TabsContent>
              
              <TabsContent value="account">
                <AccountSettings />
              </TabsContent>
              
              <TabsContent value="preferences">
                <PreferencesSettings />
              </TabsContent>
              
              <TabsContent value="security">
                <SecuritySettings />
              </TabsContent>
              
              <TabsContent value="integrations">
                <IntegrationsSettings />
              </TabsContent>
              
              <TabsContent value="help">
                <HelpSettings />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
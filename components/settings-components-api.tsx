"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, Save, Webhook, Download } from "lucide-react";

// API Settings component for the settings page
export function APISettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // API keys state
  const [apiKeys, setApiKeys] = useState({
    production: {
      key: "sk_prod_xxxxxxxxxxxxxxxxxxxx",
      created: "2023-10-15",
      active: true
    },
    development: {
      key: "sk_dev_xxxxxxxxxxxxxxxxxxxx",
      created: "2023-11-02",
      active: true
    }
  });
  
  // API usage state
  const [apiUsage, setApiUsage] = useState({
    requests: 1250,
    limit: 5000,
    resetDate: "2023-12-01"
  });
  
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    // Could add a toast notification here
  };
  
  const handleGenerateNewKey = async (type: 'production' | 'development') => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update with a "new" key (in a real app, this would come from the server)
      const newKey = `sk_${type.substring(0, 4)}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      
      setApiKeys(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          key: newKey,
          created: new Date().toISOString().split('T')[0]
        }
      }));
      
      setSuccessMessage(`New ${type} API key generated successfully`);
    } catch (error) {
      console.error('Error generating new API key:', error);
    } finally {
      setIsSaving(false);
      
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="text-sm text-green-600 dark:text-green-500 p-2 bg-green-50 dark:bg-green-900/20 rounded">
          {successMessage}
        </div>
      )}
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Your API Keys</h3>
        <div className="space-y-4">
          {/* Production Key */}
          <div className="rounded-lg border p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Production Key</h4>
              <Badge variant={apiKeys.production.active ? "default" : "outline"} className={apiKeys.production.active ? "bg-green-500" : ""}>
                {apiKeys.production.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Input 
                value={apiKeys.production.key} 
                readOnly 
                className="font-mono text-sm" 
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleCopyKey(apiKeys.production.key)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Created: {apiKeys.production.created}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleGenerateNewKey('production')}
                disabled={isSaving}
              >
                {isSaving ? "Generating..." : "Generate New Key"}
              </Button>
            </div>
          </div>
          
          {/* Development Key */}
          <div className="rounded-lg border p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Development Key</h4>
              <Badge variant={apiKeys.development.active ? "default" : "outline"} className={apiKeys.development.active ? "bg-green-500" : ""}>
                {apiKeys.development.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Input 
                value={apiKeys.development.key} 
                readOnly 
                className="font-mono text-sm" 
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleCopyKey(apiKeys.development.key)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Created: {apiKeys.development.created}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleGenerateNewKey('development')}
                disabled={isSaving}
              >
                {isSaving ? "Generating..." : "Generate New Key"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">API Usage</h3>
          <span className="text-sm text-muted-foreground">{apiUsage.requests} / {apiUsage.limit} requests</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${(apiUsage.requests / apiUsage.limit) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-muted-foreground">Usage resets on {apiUsage.resetDate}</p>
        
        <div className="flex space-x-4">
          <Button variant="outline" size="sm">
            <Webhook className="mr-2 h-4 w-4" />
            View API Documentation
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Usage Report
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium">API Settings</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="rate-limiting">Rate Limiting</Label>
              <p className="text-sm text-muted-foreground">Limit API requests to prevent abuse</p>
            </div>
            <Switch id="rate-limiting" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="webhook-notifications">Webhook Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications for API events</p>
            </div>
            <Switch id="webhook-notifications" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ip-restrictions">IP Restrictions</Label>
              <p className="text-sm text-muted-foreground">Restrict API access to specific IP addresses</p>
            </div>
            <Switch id="ip-restrictions" />
          </div>
        </div>
      </div>
      
      <Button disabled={isSaving}>
        {isSaving ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save API Settings
          </>
        )}
      </Button>
    </div>
  );
}
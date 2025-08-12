'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Users, 
  Zap, 
  Target, 
  BarChart3,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Globe,
  Database,
  Cpu,
  HardDrive,
  Network,
  Shield,
  AlertTriangle,
  CheckCircle,
  Monitor as MonitorIcon
} from 'lucide-react';

interface PerformanceMetrics {
  pageLoadTime: number;
  userEngagement: number;
  activeUsers: number;
  systemPerformance: {
    cpu: number;
    memory: number;
    database: number;
    network: number;
  };
  userBehavior: {
    pageViews: number;
    sessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    userEngagement: 0,
    activeUsers: 0,
    systemPerformance: {
      cpu: 0,
      memory: 0,
      database: 0,
      network: 0
    },
    userBehavior: {
      pageViews: 0,
      sessionDuration: 0,
      bounceRate: 0,
      conversionRate: 0
    }
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Simulate performance data collection
  const collectMetrics = useCallback(() => {
    const newMetrics: PerformanceMetrics = {
      pageLoadTime: Math.random() * 2000 + 500, // 500ms - 2.5s
      userEngagement: Math.random() * 100,
      activeUsers: Math.floor(Math.random() * 1000) + 100,
      systemPerformance: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        database: Math.random() * 100,
        network: Math.random() * 100
      },
      userBehavior: {
        pageViews: Math.floor(Math.random() * 10000) + 1000,
        sessionDuration: Math.random() * 1800 + 300, // 5-35 minutes
        bounceRate: Math.random() * 50 + 20,
        conversionRate: Math.random() * 15 + 5
      }
    };

    setMetrics(newMetrics);
    checkPerformanceAlerts(newMetrics);
  }, []);

  // Performance alert system
  const checkPerformanceAlerts = (currentMetrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];

    // Page load time alerts
    if (currentMetrics.pageLoadTime > 2000) {
      newAlerts.push({
        id: Date.now().toString(),
        type: 'warning',
        message: `Page load time is ${currentMetrics.pageLoadTime.toFixed(0)}ms (above 2s threshold)`,
        timestamp: new Date(),
        severity: 'medium'
      });
    }

    // CPU usage alerts
    if (currentMetrics.systemPerformance.cpu > 80) {
      newAlerts.push({
        id: (Date.now() + 1).toString(),
        type: 'error',
        message: `High CPU usage: ${currentMetrics.systemPerformance.cpu.toFixed(1)}%`,
        timestamp: new Date(),
        severity: 'high'
      });
    }

    // Memory usage alerts
    if (currentMetrics.systemPerformance.memory > 85) {
      newAlerts.push({
        id: (Date.now() + 2).toString(),
        type: 'warning',
        message: `High memory usage: ${currentMetrics.systemPerformance.memory.toFixed(1)}%`,
        timestamp: new Date(),
        severity: 'medium'
      });
    }

    // Database performance alerts
    if (currentMetrics.systemPerformance.database > 90) {
      newAlerts.push({
        id: (Date.now() + 3).toString(),
        type: 'error',
        message: `Database performance critical: ${currentMetrics.systemPerformance.database.toFixed(1)}%`,
        timestamp: new Date(),
        severity: 'high'
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
    }
  };

  // Start/stop monitoring
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(collectMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isMonitoring, refreshInterval, collectMetrics]);

  // Initial metrics collection
  useEffect(() => {
    collectMetrics();
  }, [collectMetrics]);

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-500';
    if (value <= thresholds.warning) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'border-l-blue-500 bg-blue-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'high': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Performance Monitor</h2>
            <p className="text-gray-600">Real-time system performance and user analytics</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="1000"
              max="30000"
              step="1000"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-600">{(refreshInterval / 1000).toFixed(1)}s</span>
          </div>
          
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isMonitoring
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Page Load Time */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Page Load Time</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metrics.pageLoadTime, { good: 1000, warning: 2000 })}`}>
                {metrics.pageLoadTime.toFixed(0)}ms
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  metrics.pageLoadTime <= 1000 ? 'bg-green-500' :
                  metrics.pageLoadTime <= 2000 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((metrics.pageLoadTime / 3000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* User Engagement */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">User Engagement</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metrics.userEngagement, { good: 70, warning: 50 })}`}>
                {metrics.userEngagement.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.userEngagement}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-blue-600">
                {metrics.activeUsers.toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((metrics.activeUsers / 1000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className={`text-2xl font-bold ${
                metrics.systemPerformance.cpu > 80 || metrics.systemPerformance.memory > 85 
                  ? 'text-red-600' : 'text-green-600'
              }`}>
                {metrics.systemPerformance.cpu > 80 || metrics.systemPerformance.memory > 85 ? 'Warning' : 'Healthy'}
              </p>
            </div>
            <Zap className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  metrics.systemPerformance.cpu > 80 || metrics.systemPerformance.memory > 85 
                    ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.max(metrics.systemPerformance.cpu, metrics.systemPerformance.memory)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Performance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Resources */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Cpu className="w-5 h-5 mr-2 text-blue-500" />
            System Resources
          </h3>
          
          <div className="space-y-4">
            {/* CPU Usage */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">CPU Usage</span>
                <span className={`font-medium ${getPerformanceColor(metrics.systemPerformance.cpu, { good: 60, warning: 80 })}`}>
                  {metrics.systemPerformance.cpu.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.systemPerformance.cpu <= 60 ? 'bg-green-500' :
                    metrics.systemPerformance.cpu <= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.systemPerformance.cpu}%` }}
                />
              </div>
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Memory Usage</span>
                <span className={`font-medium ${getPerformanceColor(metrics.systemPerformance.memory, { good: 70, warning: 85 })}`}>
                  {metrics.systemPerformance.memory.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.systemPerformance.memory <= 70 ? 'bg-green-500' :
                    metrics.systemPerformance.memory <= 85 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.systemPerformance.memory}%` }}
                />
              </div>
            </div>

            {/* Database Performance */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Database</span>
                <span className={`font-medium ${getPerformanceColor(metrics.systemPerformance.database, { good: 70, warning: 90 })}`}>
                  {metrics.systemPerformance.database.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.systemPerformance.database <= 70 ? 'bg-green-500' :
                    metrics.systemPerformance.database <= 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.systemPerformance.database}%` }}
                />
              </div>
            </div>

            {/* Network Performance */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Network</span>
                <span className={`font-medium ${getPerformanceColor(metrics.systemPerformance.network, { good: 80, warning: 90 })}`}>
                  {metrics.systemPerformance.network.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metrics.systemPerformance.network <= 80 ? 'bg-green-500' :
                    metrics.systemPerformance.network <= 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.systemPerformance.network}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* User Behavior Analytics */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
            User Behavior
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.userBehavior.pageViews.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600">Page Views</p>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {Math.floor(metrics.userBehavior.sessionDuration / 60)}m
                </p>
                <p className="text-sm text-green-600">Avg Session</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {metrics.userBehavior.bounceRate.toFixed(1)}%
                </p>
                <p className="text-sm text-yellow-600">Bounce Rate</p>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.userBehavior.conversionRate.toFixed(1)}%
                </p>
                <p className="text-sm text-purple-600">Conversion</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Alerts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
          Performance Alerts
        </h3>
        
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
            <p>All systems operating normally</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Device Analytics */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-purple-500" />
          Device & Platform Analytics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <MonitorIcon className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">65%</p>
            <p className="text-sm text-gray-600">Desktop Users</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">30%</p>
            <p className="text-sm text-gray-600">Mobile Users</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
              <Monitor className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">5%</p>
            <p className="text-sm text-gray-600">Tablet Users</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;

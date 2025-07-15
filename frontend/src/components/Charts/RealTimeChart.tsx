import React, { useState, useEffect, useRef } from 'react';
import { ChartConfig, DataRow } from '../../types';
import ChartRenderer from './ChartRenderer';

interface RealTimeChartProps {
  config: ChartConfig;
  data: DataRow[];
  updateInterval?: number; // in milliseconds
  maxDataPoints?: number; // maximum number of data points to keep
  onDataUpdate?: (newData: DataRow[]) => void;
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({
  config,
  data,
  updateInterval = 5000, // 5 seconds default
  maxDataPoints = 50,
  onDataUpdate
}) => {
  const [realTimeData, setRealTimeData] = useState<DataRow[]>(data);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<Date>(new Date());

  // Initialize real-time data
  useEffect(() => {
    setRealTimeData(data);
  }, [data]);

  // Real-time update simulation
  const simulateDataUpdate = () => {
    if (!realTimeData.length) return;

    const newData = [...realTimeData];
    const lastRow = newData[newData.length - 1];
    
    // Create a new data point with slight variations
    const newRow: DataRow = { ...lastRow };
    
    // Add some random variation to numeric values
    Object.keys(newRow).forEach(key => {
      const value = newRow[key];
      if (typeof value === 'number') {
        // Add ±10% random variation
        const variation = value * (0.9 + Math.random() * 0.2);
        newRow[key] = Math.round(variation * 100) / 100;
      }
    });

    // Update timestamp if it exists
    if (newRow.timestamp) {
      newRow.timestamp = new Date().toISOString();
    }

    // Add new data point and remove oldest if exceeding maxDataPoints
    newData.push(newRow);
    if (newData.length > maxDataPoints) {
      newData.shift();
    }

    setRealTimeData(newData);
    lastUpdateRef.current = new Date();
    
    if (onDataUpdate) {
      onDataUpdate(newData);
    }
  };

  // Start/stop real-time updates
  useEffect(() => {
    if (isRealTimeEnabled) {
      intervalRef.current = setInterval(simulateDataUpdate, updateInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRealTimeEnabled, updateInterval, maxDataPoints, onDataUpdate]);

  const toggleRealTime = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled);
  };

  const resetData = () => {
    setRealTimeData(data);
    setIsRealTimeEnabled(false);
  };

  return (
    <div className="relative">
      {/* Real-time controls */}
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        <button
          onClick={toggleRealTime}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            isRealTimeEnabled
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isRealTimeEnabled ? 'Stop Live' : 'Start Live'}
        </button>
        <button
          onClick={resetData}
          className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Real-time indicator */}
      {isRealTimeEnabled && (
        <div className="absolute top-2 left-2 z-10">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-600 font-medium">LIVE</span>
          </div>
        </div>
      )}

      {/* Last update time */}
      {isRealTimeEnabled && (
        <div className="absolute top-2 left-16 z-10">
          <span className="text-xs text-gray-600">
            Last: {lastUpdateRef.current.toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Chart */}
      <ChartRenderer config={config} data={realTimeData} />
    </div>
  );
};

export default RealTimeChart; 
import React from 'react';
import Chart from 'react-apexcharts';

const InteractiveChart = ({ 
  type = 'line', 
  data, 
  title, 
  height = 300, 
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  showLegend = true,
  showToolbar = true,
  className = ''
}) => {
  const getDefaultOptions = () => {
    const baseOptions = {
      chart: {
        type: type,
        height: '100%',
        width: '100%',            // ✅ Added: make chart responsive to container width
        toolbar: {
          show: showToolbar,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        },
        background: 'transparent',
        fontFamily: 'Inter, sans-serif'
      },
      colors: colors,
      stroke: {
        curve: 'smooth',
        width: 3
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: colors.map(color => color + '20'),
          inverseColors: false,
          opacityFrom: 0.8,
          opacityTo: 0.1,
          stops: [0, 100]
        }
      },
      grid: {
        borderColor: '#E5E7EB',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        labels: {
          style: { colors: '#6B7280', fontSize: '12px' }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: { colors: '#6B7280', fontSize: '12px' },
          formatter: (value) => {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value.toFixed(0);
          }
        }
      },
      tooltip: {
        theme: 'light',
        style: { fontSize: '12px' },
        y: {
          formatter: (value) => {
            if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value.toFixed(2);
          }
        }
      },
      legend: {
        show: showLegend,
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
        markers: { width: 8, height: 8, radius: 2 }
      },
      dataLabels: { enabled: false },
      responsive: [
        {
          breakpoint: 768,
          options: { chart: { height: 250 } }
        }
      ]
    };

    if (type === 'bar') {
      return {
        ...baseOptions,
        plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } }
      };
    }

    if (type === 'area') {
      return {
        ...baseOptions,
        plotOptions: { area: { fillTo: 'end' } }
      };
    }

    return baseOptions;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <div className="w-full h-[300px]"> {/* ✅ container ensures full width */}
        <Chart
          options={getDefaultOptions()}
          series={data}
          type={type}
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
};

export default InteractiveChart;

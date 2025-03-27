// components/StatsCard.js
export default function StatsCard({ title, value, previousValue }) {
  const calculateChange = () => {
    if (!value || !previousValue) return null;
    
    // Extract numeric values, handling both string and number inputs
    const currentValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    const prevValue = parseFloat(previousValue.toString().replace(/[^0-9.-]+/g, ''));
    
    if (isNaN(currentValue) || isNaN(prevValue)) return null;
    
    const change = currentValue - prevValue;
    
    // Don't show change if the difference is less than 0.1
    if (Math.abs(change) < 0.1) return null;
    
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      isNegative: change < 0
    };
  };

  const change = calculateChange();

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:bg-white/10 border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <h3 className="text-gray-400 text-sm font-medium mb-3 tracking-wide">{title}</h3>
        <div className="space-y-1">
          <span className="text-white text-3xl font-semibold tracking-tight block">
            {value}
          </span>
          {change && (
            <span className={`text-sm font-medium ${change.isPositive ? 'text-green-400' : change.isNegative ? 'text-red-400' : 'text-gray-400'}`}>
              {change.isPositive ? '↑' : '↓'} {change.value} {title.includes('Weight') ? 'kg' : 'cm'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

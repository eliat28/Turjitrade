#!/usr/bin/env python3
import re

# Read the file
with open('/src/app/components/StockDetailModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all occurrences of TradingViewChart with ChartContainer
content = content.replace('<TradingViewChart symbol={stock.symbol} height={400} />', '<ChartContainer symbol={stock.symbol} height={400} />')
content = content.replace('<TradingViewChart symbol={stock.symbol} height={typeof window !== \'undefined\' ? window.innerHeight - 120 : 600} />', '<ChartContainer symbol={stock.symbol} height={typeof window !== \'undefined\' ? window.innerHeight - 120 : 600} />')

# Write back
with open('/src/app/components/StockDetailModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced TradingViewChart with ChartContainer successfully!")

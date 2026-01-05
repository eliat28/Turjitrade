#!/bin/bash
cd /tmp/sandbox/src/app/components
cat StockDetailModal.tsx | \
  awk '{
    if ($0 ~ /TradingViewChart/) {
      gsub(/TradingViewChart/, "ChartContainer");
    }
    print;
  }' > StockDetailModal.tsx.new
mv StockDetailModal.tsx.new StockDetailModal.tsx

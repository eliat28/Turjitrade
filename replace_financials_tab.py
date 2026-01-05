#!/usr/bin/env python3
import re

# Read the file
with open('src/app/components/StockDetailModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match the financials tab content
# Starting from {activeTab === 'financials' && (
# Ending before {/* Company Tab Content */}

financials_start = content.find("{activeTab === 'financials' && (")
company_tab_start = content.find("{/* Company Tab Content */}")

if financials_start != -1 and company_tab_start != -1:
    # Find the opening <>
    opening_bracket = content.find("<>", financials_start)
    # Find the corresponding closing </>
    closing_bracket = content.rfind("</>\n          )}", financials_start, company_tab_start)
    
    if opening_bracket != -1 and closing_bracket != -1:
        # Replace the content between the brackets
        new_content = (
            content[:opening_bracket] +
            "<FinancialsTabContent symbol={stock.symbol} />" +
            content[closing_bracket + 4:]  # Skip the closing </> but keep )}
        )
        
        # Write back
        with open('src/app/components/StockDetailModal.tsx', 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print("✅ Successfully replaced financials tab content!")
    else:
        print("❌ Could not find brackets")
        print(f"Opening: {opening_bracket}, Closing: {closing_bracket}")
else:
    print("❌ Could not find tab markers")
    print(f"Financials start: {financials_start}, Company start: {company_tab_start}")

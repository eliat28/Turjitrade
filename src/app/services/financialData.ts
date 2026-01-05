// Financial data for stocks - Updated with real data from Yahoo Finance & SEC filings (Dec 2024)
export interface FinancialData {
  marketCap: string;
  revenue: string;
  netIncome: string;
  peRatio: string;
  eps: string;
  dividend: string;
  debtToEquity: string;
  profitMargin: string;
  operatingMargin: string;
}

export const getFinancialData = (symbol: string): FinancialData => {
  const financials: Record<string, FinancialData> = {
    // ===== MEGA CAP TECH (>$1T) =====
    'AAPL': {
      marketCap: '$3.85T',
      revenue: '$383.3B',
      netIncome: '$97.0B',
      peRatio: '39.7',
      eps: '$6.13',
      dividend: '$1.00 (0.43%)',
      debtToEquity: '1.97',
      profitMargin: '25.3%',
      operatingMargin: '30.7%'
    },
    'MSFT': {
      marketCap: '$3.12T',
      revenue: '$245.1B',
      netIncome: '$88.5B',
      peRatio: '35.4',
      eps: '$11.86',
      dividend: '$3.00 (0.72%)',
      debtToEquity: '0.41',
      profitMargin: '36.1%',
      operatingMargin: '43.5%'
    },
    'GOOGL': {
      marketCap: '$2.21T',
      revenue: '$339.5B',
      netIncome: '$76.0B',
      peRatio: '29.1',
      eps: '$6.23',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.09',
      profitMargin: '22.4%',
      operatingMargin: '28.3%'
    },
    'GOOG': {
      marketCap: '$2.21T',
      revenue: '$339.5B',
      netIncome: '$76.0B',
      peRatio: '29.1',
      eps: '$6.23',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.09',
      profitMargin: '22.4%',
      operatingMargin: '28.3%'
    },
    'AMZN': {
      marketCap: '$2.19T',
      revenue: '$638.0B',
      netIncome: '$42.9B',
      peRatio: '51.1',
      eps: '$4.11',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.75',
      profitMargin: '6.7%',
      operatingMargin: '8.4%'
    },
    'NVDA': {
      marketCap: '$3.44T',
      revenue: '$113.0B',
      netIncome: '$61.3B',
      peRatio: '56.2',
      eps: '$24.98',
      dividend: '$0.20 (0.01%)',
      debtToEquity: '0.15',
      profitMargin: '54.2%',
      operatingMargin: '62.1%'
    },
    'META': {
      marketCap: '$1.54T',
      revenue: '$150.5B',
      netIncome: '$46.8B',
      peRatio: '32.9',
      eps: '$17.87',
      dividend: '$2.50 (0.41%)',
      debtToEquity: '0.00',
      profitMargin: '31.1%',
      operatingMargin: '40.2%'
    },
    'TSLA': {
      marketCap: '$1.39T',
      revenue: '$108.5B',
      netIncome: '$17.7B',
      peRatio: '78.5',
      eps: '$4.86',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.05',
      profitMargin: '16.3%',
      operatingMargin: '18.9%'
    },

    // ===== LARGE CAP TECH ($100B-$1T) =====
    'NFLX': {
      marketCap: '$386.5B',
      revenue: '$38.1B',
      netIncome: '$7.1B',
      peRatio: '54.4',
      eps: '$16.15',
      dividend: 'אין דיבידנד',
      debtToEquity: '1.22',
      profitMargin: '18.6%',
      operatingMargin: '23.7%'
    },
    'AMD': {
      marketCap: '$204.3B',
      revenue: '$26.6B',
      netIncome: '$1.9B',
      peRatio: '107.5',
      eps: '$1.17',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.03',
      profitMargin: '7.1%',
      operatingMargin: '10.3%'
    },
    'INTC': {
      marketCap: '$82.7B',
      revenue: '$54.2B',
      netIncome: '$1.7B',
      peRatio: '48.6',
      eps: '$0.40',
      dividend: '$0.50 (2.48%)',
      debtToEquity: '0.48',
      profitMargin: '3.1%',
      operatingMargin: '1.2%'
    },
    'CSCO': {
      marketCap: '$234.2B',
      revenue: '$56.9B',
      netIncome: '$12.6B',
      peRatio: '18.6',
      eps: '$3.06',
      dividend: '$1.60 (2.70%)',
      debtToEquity: '0.38',
      profitMargin: '22.1%',
      operatingMargin: '27.4%'
    },
    'ADBE': {
      marketCap: '$207.8B',
      revenue: '$21.5B',
      netIncome: '$6.1B',
      peRatio: '34.1',
      eps: '$13.21',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.41',
      profitMargin: '28.4%',
      operatingMargin: '35.2%'
    },
    'AVGO': {
      marketCap: '$876.4B',
      revenue: '$51.6B',
      netIncome: '$18.8B',
      peRatio: '46.6',
      eps: '$40.59',
      dividend: '$22.00 (1.16%)',
      debtToEquity: '1.32',
      profitMargin: '36.4%',
      operatingMargin: '52.1%'
    },
    'QCOM': {
      marketCap: '$178.5B',
      revenue: '$39.1B',
      netIncome: '$10.2B',
      peRatio: '17.5',
      eps: '$9.12',
      dividend: '$3.20 (2.01%)',
      debtToEquity: '1.05',
      profitMargin: '26.1%',
      operatingMargin: '31.7%'
    },
    'TXN': {
      marketCap: '$172.3B',
      revenue: '$18.3B',
      netIncome: '$7.6B',
      peRatio: '22.7',
      eps: '$8.21',
      dividend: '$5.00 (2.68%)',
      debtToEquity: '0.51',
      profitMargin: '41.5%',
      operatingMargin: '47.3%'
    },

    // ===== CONSUMER & RETAIL =====
    'COST': {
      marketCap: '$443.6B',
      revenue: '$266.0B',
      netIncome: '$7.4B',
      peRatio: '59.9',
      eps: '$16.56',
      dividend: '$5.60 (0.56%)',
      debtToEquity: '0.47',
      profitMargin: '2.8%',
      operatingMargin: '3.7%'
    },
    'WMT': {
      marketCap: '$737.8B',
      revenue: '$665.0B',
      netIncome: '$17.2B',
      peRatio: '42.9',
      eps: '$6.35',
      dividend: '$2.40 (0.95%)',
      debtToEquity: '0.55',
      profitMargin: '2.6%',
      operatingMargin: '4.2%'
    },
    'HD': {
      marketCap: '$408.2B',
      revenue: '$158.1B',
      netIncome: '$15.0B',
      peRatio: '27.2',
      eps: '$15.05',
      dividend: '$9.20 (2.33%)',
      debtToEquity: '0.00',
      profitMargin: '9.5%',
      operatingMargin: '14.2%'
    },
    'NKE': {
      marketCap: '$105.7B',
      revenue: '$51.4B',
      netIncome: '$5.7B',
      peRatio: '18.5',
      eps: '$3.75',
      dividend: '$1.48 (2.01%)',
      debtToEquity: '0.61',
      profitMargin: '11.1%',
      operatingMargin: '13.8%'
    },
    'SBUX': {
      marketCap: '$105.3B',
      revenue: '$36.2B',
      netIncome: '$4.1B',
      peRatio: '25.7',
      eps: '$3.58',
      dividend: '$2.32 (2.55%)',
      debtToEquity: '0.00',
      profitMargin: '11.3%',
      operatingMargin: '15.7%'
    },

    // ===== FINANCIAL SERVICES =====
    'V': {
      marketCap: '$615.4B',
      revenue: '$35.9B',
      netIncome: '$19.8B',
      peRatio: '31.1',
      eps: '$9.62',
      dividend: '$2.20 (0.72%)',
      debtToEquity: '0.68',
      profitMargin: '55.1%',
      operatingMargin: '67.4%'
    },
    'MA': {
      marketCap: '$497.2B',
      revenue: '$27.1B',
      netIncome: '$12.7B',
      peRatio: '39.1',
      eps: '$13.08',
      dividend: '$2.40 (0.47%)',
      debtToEquity: '2.12',
      profitMargin: '46.9%',
      operatingMargin: '58.3%'
    },
    'JPM': {
      marketCap: '$653.8B',
      revenue: '$173.2B',
      netIncome: '$57.1B',
      peRatio: '11.4',
      eps: '$19.37',
      dividend: '$5.00 (2.23%)',
      debtToEquity: '1.32',
      profitMargin: '33.0%',
      operatingMargin: '37.5%'
    },
    'BAC': {
      marketCap: '$353.4B',
      revenue: '$113.1B',
      netIncome: '$31.4B',
      peRatio: '11.3',
      eps: '$3.87',
      dividend: '$1.08 (2.47%)',
      debtToEquity: '1.18',
      profitMargin: '27.8%',
      operatingMargin: '32.1%'
    },
    'WFC': {
      marketCap: '$267.5B',
      revenue: '$88.3B',
      netIncome: '$23.5B',
      peRatio: '11.4',
      eps: '$6.19',
      dividend: '$1.60 (2.19%)',
      debtToEquity: '1.09',
      profitMargin: '26.6%',
      operatingMargin: '30.8%'
    },
    'GS': {
      marketCap: '$189.7B',
      revenue: '$53.5B',
      netIncome: '$12.7B',
      peRatio: '14.9',
      eps: '$36.09',
      dividend: '$11.00 (1.94%)',
      debtToEquity: '2.73',
      profitMargin: '23.7%',
      operatingMargin: '28.5%'
    },
    'MS': {
      marketCap: '$205.3B',
      revenue: '$54.8B',
      netIncome: '$11.2B',
      peRatio: '18.3',
      eps: '$6.31',
      dividend: '$3.70 (3.10%)',
      debtToEquity: '2.41',
      profitMargin: '20.4%',
      operatingMargin: '25.7%'
    },
    'AXP': {
      marketCap: '$205.8B',
      revenue: '$68.1B',
      netIncome: '$9.9B',
      peRatio: '20.8',
      eps: '$13.40',
      dividend: '$2.80 (1.04%)',
      debtToEquity: '5.89',
      profitMargin: '14.5%',
      operatingMargin: '17.8%'
    },
    'C': {
      marketCap: '$134.6B',
      revenue: '$81.1B',
      netIncome: '$14.8B',
      peRatio: '9.1',
      eps: '$7.37',
      dividend: '$2.12 (3.13%)',
      debtToEquity: '1.73',
      profitMargin: '18.2%',
      operatingMargin: '22.5%'
    },

    // ===== HEALTHCARE & PHARMA =====
    'JNJ': {
      marketCap: '$368.5B',
      revenue: '$85.2B',
      netIncome: '$17.9B',
      peRatio: '20.6',
      eps: '$7.12',
      dividend: '$4.96 (3.17%)',
      debtToEquity: '0.45',
      profitMargin: '21.0%',
      operatingMargin: '26.4%'
    },
    'UNH': {
      marketCap: '$464.2B',
      revenue: '$400.3B',
      netIncome: '$27.6B',
      peRatio: '16.8',
      eps: '$29.60',
      dividend: '$8.40 (1.71%)',
      debtToEquity: '0.71',
      profitMargin: '6.9%',
      operatingMargin: '9.2%'
    },
    'PFE': {
      marketCap: '$147.2B',
      revenue: '$58.5B',
      netIncome: '$2.1B',
      peRatio: '70.1',
      eps: '$0.37',
      dividend: '$1.72 (6.60%)',
      debtToEquity: '0.52',
      profitMargin: '3.6%',
      operatingMargin: '5.8%'
    },
    'ABBV': {
      marketCap: '$299.7B',
      revenue: '$54.3B',
      netIncome: '$6.5B',
      peRatio: '46.1',
      eps: '$3.65',
      dividend: '$6.36 (3.76%)',
      debtToEquity: '3.82',
      profitMargin: '12.0%',
      operatingMargin: '18.5%'
    },
    'LLY': {
      marketCap: '$714.3B',
      revenue: '$41.8B',
      netIncome: '$7.6B',
      peRatio: '94.0',
      eps: '$8.12',
      dividend: '$5.60 (0.70%)',
      debtToEquity: '1.71',
      profitMargin: '18.2%',
      operatingMargin: '25.3%'
    },
    'MRK': {
      marketCap: '$245.8B',
      revenue: '$60.1B',
      netIncome: '$14.5B',
      peRatio: '16.9',
      eps: '$5.72',
      dividend: '$3.08 (3.17%)',
      debtToEquity: '0.91',
      profitMargin: '24.1%',
      operatingMargin: '29.7%'
    },

    // ===== ENERGY =====
    'XOM': {
      marketCap: '$423.5B',
      revenue: '$344.6B',
      netIncome: '$36.0B',
      peRatio: '11.8',
      eps: '$8.66',
      dividend: '$4.04 (3.92%)',
      debtToEquity: '0.21',
      profitMargin: '10.4%',
      operatingMargin: '13.8%'
    },
    'CVX': {
      marketCap: '$264.2B',
      revenue: '$200.9B',
      netIncome: '$21.4B',
      peRatio: '12.3',
      eps: '$11.50',
      dividend: '$6.52 (4.56%)',
      debtToEquity: '0.17',
      profitMargin: '10.7%',
      operatingMargin: '14.2%'
    },

    // ===== CONSUMER GOODS =====
    'PG': {
      marketCap: '$403.7B',
      revenue: '$84.0B',
      netIncome: '$14.7B',
      peRatio: '27.5',
      eps: '$6.02',
      dividend: '$3.96 (2.41%)',
      debtToEquity: '0.52',
      profitMargin: '17.5%',
      operatingMargin: '23.1%'
    },
    'KO': {
      marketCap: '$282.4B',
      revenue: '$46.0B',
      netIncome: '$10.7B',
      peRatio: '26.4',
      eps: '$2.47',
      dividend: '$1.96 (2.97%)',
      debtToEquity: '1.48',
      profitMargin: '23.3%',
      operatingMargin: '29.7%'
    },
    'PEP': {
      marketCap: '$213.8B',
      revenue: '$91.5B',
      netIncome: '$9.1B',
      peRatio: '23.5',
      eps: '$6.56',
      dividend: '$5.42 (3.48%)',
      debtToEquity: '2.38',
      profitMargin: '9.9%',
      operatingMargin: '13.5%'
    },

    // ===== TELECOM =====
    'VZ': {
      marketCap: '$173.5B',
      revenue: '$134.0B',
      netIncome: '$11.6B',
      peRatio: '15.0',
      eps: '$2.75',
      dividend: '$2.71 (6.54%)',
      debtToEquity: '1.84',
      profitMargin: '8.7%',
      operatingMargin: '12.3%'
    },
    'TMUS': {
      marketCap: '$272.5B',
      revenue: '$80.1B',
      netIncome: '$8.3B',
      peRatio: '32.8',
      eps: '$7.10',
      dividend: 'אין דיבידנד',
      debtToEquity: '1.15',
      profitMargin: '10.4%',
      operatingMargin: '14.8%'
    },
    'T': {
      marketCap: '$174.2B',
      revenue: '$122.4B',
      netIncome: '$14.4B',
      peRatio: '12.1',
      eps: '$2.01',
      dividend: '$1.11 (4.58%)',
      debtToEquity: '0.93',
      profitMargin: '11.8%',
      operatingMargin: '16.2%'
    },
    'CMCSA': {
      marketCap: '$147.3B',
      revenue: '$121.6B',
      netIncome: '$15.4B',
      peRatio: '9.6',
      eps: '$3.71',
      dividend: '$1.32 (3.28%)',
      debtToEquity: '1.08',
      profitMargin: '12.7%',
      operatingMargin: '18.1%'
    },

    // ===== ENTERTAINMENT & MEDIA =====
    'DIS': {
      marketCap: '$171.2B',
      revenue: '$91.4B',
      netIncome: '$2.4B',
      peRatio: '71.3',
      eps: '$1.29',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.48',
      profitMargin: '2.6%',
      operatingMargin: '5.2%'
    },

    // ===== CLOUD & ENTERPRISE SOFTWARE =====
    'CRM': {
      marketCap: '$318.5B',
      revenue: '$37.3B',
      netIncome: '$5.2B',
      peRatio: '61.2',
      eps: '$5.26',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.21',
      profitMargin: '13.9%',
      operatingMargin: '19.7%'
    },
    'ORCL': {
      marketCap: '$544.8B',
      revenue: '$53.8B',
      netIncome: '$10.8B',
      peRatio: '50.4',
      eps: '$3.91',
      dividend: '$1.60 (0.81%)',
      debtToEquity: '5.27',
      profitMargin: '20.1%',
      operatingMargin: '28.4%'
    },
    'IBM': {
      marketCap: '$205.7B',
      revenue: '$61.9B',
      netIncome: '$7.5B',
      peRatio: '27.4',
      eps: '$8.20',
      dividend: '$6.68 (3.01%)',
      debtToEquity: '2.31',
      profitMargin: '12.1%',
      operatingMargin: '17.6%'
    },

    // ===== INDUSTRIALS =====
    'BA': {
      marketCap: '$107.4B',
      revenue: '$77.8B',
      netIncome: '-$2.2B',
      peRatio: '-48.8',
      eps: '-$3.57',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.00',
      profitMargin: '-2.8%',
      operatingMargin: '-1.5%'
    },
    'CAT': {
      marketCap: '$198.7B',
      revenue: '$67.1B',
      netIncome: '$10.1B',
      peRatio: '19.7',
      eps: '$20.05',
      dividend: '$5.84 (1.58%)',
      debtToEquity: '1.68',
      profitMargin: '15.0%',
      operatingMargin: '19.7%'
    },
    'GE': {
      marketCap: '$228.4B',
      revenue: '$68.6B',
      netIncome: '$6.8B',
      peRatio: '33.6',
      eps: '$6.20',
      dividend: '$1.12 (0.53%)',
      debtToEquity: '0.94',
      profitMargin: '9.9%',
      operatingMargin: '13.4%'
    },
    'HON': {
      marketCap: '$139.8B',
      revenue: '$36.7B',
      netIncome: '$5.8B',
      peRatio: '24.1',
      eps: '$8.56',
      dividend: '$4.56 (2.20%)',
      debtToEquity: '0.91',
      profitMargin: '15.8%',
      operatingMargin: '21.3%'
    },
    'MMM': {
      marketCap: '$68.5B',
      revenue: '$32.7B',
      netIncome: '$6.0B',
      peRatio: '11.4',
      eps: '$10.86',
      dividend: '$6.16 (4.91%)',
      debtToEquity: '0.94',
      profitMargin: '18.3%',
      operatingMargin: '23.8%'
    },
    'UPS': {
      marketCap: '$106.2B',
      revenue: '$91.0B',
      netIncome: '$7.1B',
      peRatio: '15.0',
      eps: '$8.23',
      dividend: '$6.52 (5.30%)',
      debtToEquity: '2.14',
      profitMargin: '7.8%',
      operatingMargin: '11.2%'
    },
    'RTX': {
      marketCap: '$168.2B',
      revenue: '$79.8B',
      netIncome: '$5.4B',
      peRatio: '31.1',
      eps: '$3.69',
      dividend: '$2.48 (2.15%)',
      debtToEquity: '0.43',
      profitMargin: '6.8%',
      operatingMargin: '10.5%'
    },
    'LMT': {
      marketCap: '$140.7B',
      revenue: '$71.3B',
      netIncome: '$6.9B',
      peRatio: '20.4',
      eps: '$27.59',
      dividend: '$13.20 (2.49%)',
      debtToEquity: '0.91',
      profitMargin: '9.7%',
      operatingMargin: '13.2%'
    },

    // ===== AUTO =====
    'F': {
      marketCap: '$43.2B',
      revenue: '$176.2B',
      netIncome: '$4.3B',
      peRatio: '10.0',
      eps: '$1.08',
      dividend: '$0.60 (5.45%)',
      debtToEquity: '3.18',
      profitMargin: '2.4%',
      operatingMargin: '4.1%'
    },
    'GM': {
      marketCap: '$54.8B',
      revenue: '$171.8B',
      netIncome: '$10.1B',
      peRatio: '5.4',
      eps: '$8.42',
      dividend: '$0.36 (0.80%)',
      debtToEquity: '1.47',
      profitMargin: '5.9%',
      operatingMargin: '8.7%'
    },

    // ===== FINTECH & PAYMENTS =====
    'PYPL': {
      marketCap: '$75.4B',
      revenue: '$31.5B',
      netIncome: '$4.3B',
      peRatio: '17.5',
      eps: '$4.18',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.54',
      profitMargin: '13.6%',
      operatingMargin: '18.2%'
    },

    // ===== TRAVEL & HOSPITALITY =====
    'ABNB': {
      marketCap: '$89.3B',
      revenue: '$11.1B',
      netIncome: '$4.8B',
      peRatio: '18.6',
      eps: '$7.60',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.00',
      profitMargin: '43.2%',
      operatingMargin: '47.5%'
    },

    // ===== CYBERSECURITY =====
    'PANW': {
      marketCap: '$132.7B',
      revenue: '$8.0B',
      netIncome: '$2.3B',
      peRatio: '57.7',
      eps: '$7.39',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.56',
      profitMargin: '28.8%',
      operatingMargin: '33.4%'
    },
    'FTNT': {
      marketCap: '$72.5B',
      revenue: '$6.0B',
      netIncome: '$1.6B',
      peRatio: '45.3',
      eps: '$2.03',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.00',
      profitMargin: '26.7%',
      operatingMargin: '31.8%'
    },

    // ===== SEMICONDUCTORS =====
    'LRCX': {
      marketCap: '$117.3B',
      revenue: '$16.3B',
      netIncome: '$3.9B',
      peRatio: '30.1',
      eps: '$28.68',
      dividend: '$9.00 (1.05%)',
      debtToEquity: '0.51',
      profitMargin: '23.9%',
      operatingMargin: '29.4%'
    },
    'KLAC': {
      marketCap: '$113.8B',
      revenue: '$11.0B',
      netIncome: '$3.5B',
      peRatio: '32.5',
      eps: '$24.37',
      dividend: '$6.00 (0.76%)',
      debtToEquity: '0.52',
      profitMargin: '31.8%',
      operatingMargin: '38.7%'
    },
    'MRVL': {
      marketCap: '$82.4B',
      revenue: '$6.5B',
      netIncome: '$1.1B',
      peRatio: '75.0',
      eps: '$1.31',
      dividend: '$0.24 (0.24%)',
      debtToEquity: '0.28',
      profitMargin: '16.9%',
      operatingMargin: '21.3%'
    },

    // ===== BIOTECH & MEDICAL =====
    'REGN': {
      marketCap: '$94.7B',
      revenue: '$13.1B',
      netIncome: '$3.8B',
      peRatio: '24.9',
      eps: '$34.26',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.11',
      profitMargin: '29.0%',
      operatingMargin: '34.5%'
    },
    'VRTX': {
      marketCap: '$133.5B',
      revenue: '$10.7B',
      netIncome: '$4.0B',
      peRatio: '33.4',
      eps: '$15.89',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.00',
      profitMargin: '37.4%',
      operatingMargin: '43.2%'
    },
    'ILMN': {
      marketCap: '$20.8B',
      revenue: '$4.5B',
      netIncome: '$0.4B',
      peRatio: '52.0',
      eps: '$2.58',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.30',
      profitMargin: '8.9%',
      operatingMargin: '12.3%'
    },
    'BIIB': {
      marketCap: '$28.7B',
      revenue: '$9.9B',
      netIncome: '$2.1B',
      peRatio: '13.7',
      eps: '$14.26',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.63',
      profitMargin: '21.2%',
      operatingMargin: '26.8%'
    },
    'MRNA': {
      marketCap: '$24.5B',
      revenue: '$6.8B',
      netIncome: '$0.8B',
      peRatio: '30.6',
      eps: '$2.04',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.00',
      profitMargin: '11.8%',
      operatingMargin: '15.7%'
    },
    'GILD': {
      marketCap: '$117.8B',
      revenue: '$27.1B',
      netIncome: '$6.2B',
      peRatio: '19.0',
      eps: '$4.94',
      dividend: '$3.20 (3.41%)',
      debtToEquity: '1.23',
      profitMargin: '22.9%',
      operatingMargin: '28.4%'
    },
    'AMGN': {
      marketCap: '$155.2B',
      revenue: '$28.2B',
      netIncome: '$8.3B',
      peRatio: '18.7',
      eps: '$15.19',
      dividend: '$8.80 (3.08%)',
      debtToEquity: '3.87',
      profitMargin: '29.4%',
      operatingMargin: '35.7%'
    },

    // ===== SOFTWARE & SAAS =====
    'SNPS': {
      marketCap: '$92.5B',
      revenue: '$6.1B',
      netIncome: '$1.2B',
      peRatio: '77.1',
      eps: '$7.83',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.09',
      profitMargin: '19.7%',
      operatingMargin: '25.3%'
    },
    'CDNS': {
      marketCap: '$89.7B',
      revenue: '$4.1B',
      netIncome: '$1.0B',
      peRatio: '89.7',
      eps: '$3.62',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.14',
      profitMargin: '24.4%',
      operatingMargin: '30.1%'
    },
    'WDAY': {
      marketCap: '$71.8B',
      revenue: '$7.3B',
      netIncome: '$0.8B',
      peRatio: '89.8',
      eps: '$3.20',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.43',
      profitMargin: '11.0%',
      operatingMargin: '15.7%'
    },

    // ===== MEDICAL DEVICES =====
    'DXCM': {
      marketCap: '$30.2B',
      revenue: '$4.0B',
      netIncome: '$0.5B',
      peRatio: '60.4',
      eps: '$1.27',
      dividend: 'אין דיבידנד',
      debtToEquity: '0.39',
      profitMargin: '12.5%',
      operatingMargin: '17.8%'
    },

    // ===== FOOD & BEVERAGE =====
    'MDLZ': {
      marketCap: '$84.7B',
      revenue: '$36.2B',
      netIncome: '$4.9B',
      peRatio: '17.3',
      eps: '$3.55',
      dividend: '$1.74 (2.83%)',
      debtToEquity: '0.56',
      profitMargin: '13.5%',
      operatingMargin: '18.2%'
    }
  };

  // Return financial data if exists, otherwise return generic data
  if (financials[symbol]) {
    return financials[symbol];
  }

  // Generic data for unknown stocks
  return {
    marketCap: 'N/A',
    revenue: 'N/A',
    netIncome: 'N/A',
    peRatio: 'N/A',
    eps: 'N/A',
    dividend: 'N/A',
    debtToEquity: 'N/A',
    profitMargin: 'N/A',
    operatingMargin: 'N/A'
  };
};

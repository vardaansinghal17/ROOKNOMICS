// Generate 240 data points for equity curves
export function generateEquityData() {
  const data: { month: number; user: number; sp500: number; label: string }[] = [];

  // User strategy: starts 10000, crash to ~7200 at 48-54, partial recovery to 11000 by 72,
  // volatile 9000-13000 through 150, then rises to end at 14700 at 239
  const userKeyPoints: [number, number][] = [
    [0, 10000], [12, 10800], [24, 11500], [36, 12200], [42, 11000],
    [48, 8200], [51, 7200], [54, 7500], [60, 9200], [66, 10200],
    [72, 11000], [84, 10500], [96, 11800], [108, 10200], [120, 12500],
    [132, 11000], [144, 12800], [150, 11500], [156, 13000], [168, 11800],
    [180, 12200], [192, 11500], [204, 13200], [216, 12800], [228, 13800], [239, 14700],
  ];

  // SP500: starts 10000, crash to 5800 at 54, then consistent growth
  const sp500KeyPoints: [number, number][] = [
    [0, 10000], [12, 11200], [24, 12500], [36, 14000], [42, 13500],
    [48, 9000], [54, 5800], [60, 6800], [66, 7400], [72, 8000],
    [84, 10500], [96, 12500], [108, 14000], [120, 16500], [132, 18000],
    [144, 20000], [156, 23000], [168, 26000], [180, 30000], [192, 33000],
    [204, 36000], [216, 38500], [228, 40800], [239, 43200],
  ];

  function interpolate(keyPoints: [number, number][], idx: number): number {
    for (let i = 0; i < keyPoints.length - 1; i++) {
      const [x0, y0] = keyPoints[i];
      const [x1, y1] = keyPoints[i + 1];
      if (idx >= x0 && idx <= x1) {
        const t = (idx - x0) / (x1 - x0);
        return y0 + t * (y1 - y0);
      }
    }
    return keyPoints[keyPoints.length - 1][1];
  }

  const yearLabels = ["'04","'05","'06","'07","'08","'09","'10","'11","'12","'13","'14","'15","'16","'17","'18","'19","'20","'21","'22","'23","'24"];

  for (let i = 0; i < 240; i++) {
    const userBase = interpolate(userKeyPoints, i);
    const sp500Base = interpolate(sp500KeyPoints, i);
    // Add slight noise
    const noise = () => (Math.random() - 0.5) * 300;
    const yearIdx = Math.floor(i / 12);
    data.push({
      month: i,
      user: Math.round(userBase + noise()),
      sp500: Math.round(sp500Base + noise() * 0.5),
      label: i % 24 === 0 ? yearLabels[yearIdx] || '' : '',
    });
  }
  // Fix endpoints
  data[0].user = 10000;
  data[0].sp500 = 10000;
  data[239].user = 14700;
  data[239].sp500 = 43200;
  return data;
}

export const tradeHistory = [
  { date: "Jan 2004", action: "BUY", price: "$111.25", shares: 89, pnl: "—", ret: "—", cum: "$10,000", positive: null },
  { date: "Mar 2004", action: "SELL", price: "$114.80", shares: 89, pnl: "+$316", ret: "+2.8%", cum: "$10,316", positive: true },
  { date: "Aug 2004", action: "BUY", price: "$109.40", shares: 94, pnl: "—", ret: "—", cum: "$10,316", positive: null },
  { date: "Nov 2004", action: "SELL", price: "$118.90", shares: 94, pnl: "+$893", ret: "+8.7%", cum: "$11,209", positive: true },
  { date: "Oct 2007", action: "BUY", price: "$152.30", shares: 73, pnl: "—", ret: "—", cum: "$11,209", positive: null },
  { date: "Jan 2008", action: "SELL", price: "$138.70", shares: 73, pnl: "-$993", ret: "-8.9%", cum: "$10,216", positive: false },
  { date: "Apr 2009", action: "BUY", price: "$83.20", shares: 122, pnl: "—", ret: "—", cum: "$10,216", positive: null },
  { date: "Sep 2009", action: "SELL", price: "$104.80", shares: 122, pnl: "+$2,635", ret: "+25.8%", cum: "$12,851", positive: true },
];

export const radarData = [
  { metric: "Returns", strategy: 22, sp500: 95 },
  { metric: "Stability", strategy: 45, sp500: 68 },
  { metric: "Drawdown", strategy: 62, sp500: 40 },
  { metric: "Costs", strategy: 30, sp500: 95 },
  { metric: "Simplicity", strategy: 20, sp500: 100 },
];

export const conceptCards = [
  {
    id: "rsi",
    icon: "TrendingUp",
    iconBg: "bg-indigo-500/15",
    difficulty: "Beginner",
    title: "What is RSI?",
    body: "The Relative Strength Index is a momentum oscillator that measures the speed and magnitude of recent price changes. It oscillates between 0 and 100—readings below 30 suggest a stock is oversold (potentially cheap), while readings above 70 suggest it's overbought (potentially expensive).",
    tags: ["Indicator", "Momentum", "Technical"],
    category: "Indicators",
    fullText: [
      "The Relative Strength Index (RSI) was developed by J. Welles Wilder Jr. in 1978. It's one of the most widely used technical indicators in trading, designed to measure the speed and magnitude of recent price changes to evaluate whether a security is overbought or oversold.",
      "RSI is calculated using the average gains and losses over a specified period (typically 14 days). The formula produces a value between 0 and 100. When RSI drops below 30, the asset is considered oversold—meaning it may have been sold too aggressively and could be due for a bounce. When RSI rises above 70, the asset is considered overbought.",
      "However, RSI signals alone are unreliable. In strong uptrends, RSI can remain above 70 for extended periods. In downtrends, it can stay below 30 for weeks. That's why experienced traders use RSI in combination with other indicators and never rely on it as a sole decision-maker.",
      "The key limitation: RSI is backward-looking. It tells you what has happened, not what will happen. By the time RSI signals 'oversold,' the price may continue falling significantly."
    ],
    takeaway: "RSI is a useful tool for gauging momentum, but using it alone as a buy/sell signal is a recipe for inconsistent results.",
    related: ["moving-averages", "sharpe-ratio"],
  },
  {
    id: "moving-averages",
    icon: "Activity",
    iconBg: "bg-cyan-500/15",
    difficulty: "Beginner",
    title: "Moving Averages Explained",
    body: "A moving average smooths out price data to reveal the underlying trend direction. The 50-day MA tracks short-term momentum, while the 200-day MA tracks long-term trends. When the 50 crosses above the 200, it's called a 'Golden Cross'—a classic bullish signal.",
    tags: ["Indicator", "Trend", "SMA/EMA"],
    category: "Indicators",
    fullText: [
      "Moving averages are among the oldest and most fundamental tools in technical analysis. A Simple Moving Average (SMA) calculates the arithmetic mean of prices over a set number of periods. An Exponential Moving Average (EMA) gives more weight to recent prices, making it more responsive to new information.",
      "The 50-day and 200-day moving averages are the most commonly watched. When the 50-day MA crosses above the 200-day MA (a 'Golden Cross'), it's interpreted as a bullish signal. When it crosses below (a 'Death Cross'), it's bearish. These signals are widely followed by institutional traders.",
      "The problem? Moving average crossover strategies are notoriously late. By the time the Golden Cross forms, a significant portion of the move has already occurred. And Death Crosses often trigger after a crash has already happened, causing you to sell at the bottom.",
      "Despite their simplicity, moving averages remain useful for identifying the overall trend direction. They work best in trending markets and fail miserably in sideways, choppy conditions."
    ],
    takeaway: "Moving averages help identify trends but generate signals too late to be consistently profitable as standalone trading rules.",
    related: ["rsi", "backtesting-bias"],
  },
  {
    id: "max-drawdown",
    icon: "TrendingDown",
    iconBg: "bg-rose-500/15",
    difficulty: "Intermediate",
    title: "What is Maximum Drawdown?",
    body: "Maximum Drawdown measures the largest peak-to-trough decline in your portfolio's value over a period. If your portfolio fell from $20,000 to $12,000 before recovering, your max drawdown was -40%. It's the single best measure of how painful your strategy can get.",
    tags: ["Risk", "Metrics", "Portfolio"],
    category: "Risk",
    fullText: [
      "Maximum Drawdown (MDD) is arguably the most important risk metric for any investor. While standard deviation measures average volatility, MDD captures the worst-case scenario—the deepest hole your portfolio dug before recovering.",
      "A 50% drawdown requires a 100% gain just to get back to breakeven. This mathematical asymmetry makes large drawdowns devastating. During the 2008 financial crisis, the S&P 500 experienced a ~57% drawdown. Many investors who panicked and sold near the bottom locked in those losses permanently.",
      "Professional fund managers are acutely aware of drawdowns because they cause clients to withdraw money at the worst possible time. A strategy with great returns but a 60% drawdown is practically unusable because no human can psychologically endure watching their portfolio lose more than half its value.",
      "When evaluating any strategy, always ask: 'Could I actually hold through the worst drawdown?' If the answer is no, the strategy's theoretical returns are irrelevant."
    ],
    takeaway: "The best strategy is one you can actually stick with through its worst drawdown—not the one with the highest theoretical return.",
    related: ["sharpe-ratio", "behavioral-finance"],
  },
  {
    id: "sharpe-ratio",
    icon: "BarChart2",
    iconBg: "bg-amber-500/15",
    difficulty: "Beginner",
    title: "The Sharpe Ratio",
    body: "The Sharpe Ratio measures return per unit of risk taken. A ratio above 1.0 is considered good—you're being adequately compensated for volatility. A ratio below 0.5 means you're taking too much risk for your returns. The S&P 500 historically averages around 0.9-1.0.",
    tags: ["Risk-Adjusted", "Metrics"],
    category: "Risk",
    fullText: [
      "Developed by Nobel laureate William Sharpe, the Sharpe Ratio is the gold standard for comparing risk-adjusted returns across different investments. It's calculated as (Return - Risk-Free Rate) / Standard Deviation of Returns.",
      "A Sharpe Ratio of 1.0 means you earned 1% of excess return for every 1% of volatility. Ratios above 1.0 are good, above 2.0 are excellent, and above 3.0 are exceptional (and often suspicious—they may indicate overfitting in backtests).",
      "The S&P 500 has historically delivered a Sharpe Ratio around 0.9-1.0 over long periods. Most active managers fail to consistently beat this. Hedge funds that claim Sharpe Ratios above 2.0 are either genuinely exceptional, taking hidden risks, or cherry-picking their measurement period.",
      "The Sharpe Ratio's main weakness is that it treats upside and downside volatility equally. A strategy that occasionally has big winning months gets penalized the same as one with big losing months. The Sortino Ratio addresses this by only measuring downside deviation."
    ],
    takeaway: "If your strategy's Sharpe Ratio is below 0.5, you'd be better off in a simple index fund with less risk and similar or better risk-adjusted returns.",
    related: ["max-drawdown", "index-investing"],
  },
  {
    id: "backtesting-bias",
    icon: "Cpu",
    iconBg: "bg-purple-500/15",
    difficulty: "Intermediate",
    title: "Backtesting Bias & Dangers",
    body: "Backtesting shows how a strategy would have performed historically, but it's full of pitfalls. 'Overfitting' means your rules are so perfectly tuned to past data that they fail in the future. Survivorship bias, look-ahead bias, and ignoring transaction costs can make bad strategies look great on paper.",
    tags: ["Strategy", "Danger", "Methodology"],
    category: "Strategy",
    fullText: [
      "Backtesting is a double-edged sword. On one hand, it's essential for evaluating whether a trading idea has any merit. On the other, it's trivially easy to create a strategy that looks amazing in hindsight but fails spectacularly in live trading.",
      "Overfitting is the most common trap. If you test enough parameter combinations, you'll inevitably find one that perfectly fits historical data. But that 'fit' is just noise—the market won't repeat those exact patterns. A strategy with 3-4 simple rules is almost always more robust than one with 15 finely-tuned parameters.",
      "Survivorship bias occurs when you only test on stocks that still exist today, ignoring companies that went bankrupt. Look-ahead bias sneaks in when your strategy uses information that wouldn't have been available at the time (like using a company's annual earnings before they were actually reported).",
      "This app intentionally exposes these limitations. Even a reasonable-looking strategy—RSI-based with moving average confirmation—dramatically underperforms simple buy-and-hold indexing over 20 years."
    ],
    takeaway: "If a backtest looks too good to be true, it almost certainly is. The more parameters you optimize, the less likely the strategy works in reality.",
    related: ["trading-costs", "passive-wins"],
  },
  {
    id: "index-investing",
    icon: "Shield",
    iconBg: "bg-emerald-500/15",
    difficulty: "Beginner",
    title: "What is Index Investing?",
    body: "Index investing means buying a fund that tracks a broad market index like the S&P 500. Instead of picking individual stocks, you own a tiny slice of 500 large US companies. Historically, over 90% of active fund managers fail to beat the S&P 500 over a 15-year period after fees.",
    tags: ["Strategy", "Passive", "ETF"],
    category: "Strategy",
    fullText: [
      "Index investing was popularized by John Bogle, founder of Vanguard, who launched the first index fund available to retail investors in 1976. The idea was radical at the time: instead of trying to pick winning stocks, just buy the entire market.",
      "The logic is compelling. In aggregate, all investors hold the entire market. After fees, the average investor must underperform the market average. Since index funds charge minimal fees (often 0.03-0.10% annually vs 1-2% for active funds), they have a structural advantage.",
      "The SPIVA Scorecard consistently shows that over 15-year periods, 85-95% of actively managed funds underperform their benchmark index. This isn't just about skill—it's mathematics. Fees and transaction costs create a persistent headwind that most managers cannot overcome.",
      "Critics argue that index investing creates market inefficiency since no one is doing fundamental analysis. However, even if this is true, it would create opportunities for the remaining active investors, not for retail traders competing against sophisticated institutions."
    ],
    takeaway: "You don't need to beat the market—you just need to match it. Over time, that puts you ahead of 90%+ of professional money managers.",
    related: ["passive-wins", "trading-costs"],
  },
  {
    id: "trading-costs",
    icon: "GitBranch",
    iconBg: "bg-indigo-500/15",
    difficulty: "Intermediate",
    title: "Trading Costs & Slippage",
    body: "Every trade costs money—brokerage commissions, bid-ask spreads, and tax on gains. A strategy that trades 200 times a year accumulates significant friction. Slippage occurs when your order executes at a worse price than expected. These costs, invisible in backtests, crush real returns.",
    tags: ["Risk", "Costs", "Real World"],
    category: "Risk",
    fullText: [
      "Trading costs are the silent killer of active strategies. While commission-free brokers have eliminated explicit trade fees, the bid-ask spread remains. For liquid stocks like SPY, this might be just $0.01 per share. But for less liquid securities, spreads can be $0.10-0.50 or more.",
      "Slippage is the difference between your expected execution price and the actual price you receive. In a fast-moving market, if you try to buy at $100, you might get filled at $100.15. Over hundreds of trades, this adds up to a significant performance drag.",
      "Tax drag is perhaps the largest hidden cost. Short-term capital gains (positions held less than a year) are taxed as ordinary income—potentially 35%+ for high earners. A buy-and-hold investor defers all taxes until they sell, and may even pass holdings to heirs tax-free.",
      "In this app's backtest, trading costs of $428 seem small. But the real cost is the tax drag on 214 realized trades. The S&P 500 buy-and-hold investor pays zero taxes until they sell—a massive compounding advantage over 20 years."
    ],
    takeaway: "Every trade is a tax event. The fewer trades you make, the more of your returns you actually keep.",
    related: ["backtesting-bias", "index-investing"],
  },
  {
    id: "behavioral-finance",
    icon: "AlertTriangle",
    iconBg: "bg-amber-500/15",
    difficulty: "Advanced",
    title: "Behavioral Finance & Your Brain",
    body: "Loss aversion, recency bias, and overconfidence are your biggest enemies as an investor. Studies show most retail investors buy high and sell low—the opposite of what works. Even with a perfect strategy, emotional decision-making at the worst moments destroys returns.",
    tags: ["Psychology", "Behavior", "Advanced"],
    category: "Strategy",
    fullText: [
      "Daniel Kahneman and Amos Tversky's research on prospect theory showed that humans feel the pain of losses roughly twice as intensely as the pleasure of equivalent gains. This 'loss aversion' causes investors to sell winners too early (to lock in the good feeling) and hold losers too long (to avoid the pain of admitting a mistake).",
      "Recency bias makes us extrapolate recent trends into the future. After a crash, investors expect more crashes. After a rally, they expect more gains. This is why fund inflows peak at market tops and outflows peak at bottoms—people systematically buy high and sell low.",
      "Overconfidence is rampant among retail traders. Studies by Brad Barber and Terrance Odean found that the most active traders earned the lowest returns. Men traded 45% more than women and earned 1% less annually as a result. Trading frequency and overconfidence are inversely correlated with returns.",
      "The most elegant solution to behavioral biases? Remove yourself from the equation. An automatic monthly investment into an index fund eliminates every behavioral trap simultaneously."
    ],
    takeaway: "Your biggest investing edge isn't a better indicator—it's the discipline to do nothing when your brain screams at you to act.",
    related: ["max-drawdown", "passive-wins"],
  },
  {
    id: "passive-wins",
    icon: "Award",
    iconBg: "bg-emerald-500/15",
    difficulty: "Beginner",
    title: "Why Passive Usually Wins",
    body: "The Efficient Market Hypothesis suggests stock prices already reflect all available information, making consistent 'edge' nearly impossible to sustain. Combined with fees, taxes, and behavioral errors, active trading is a losing game for most—which is exactly what this app is designed to show you.",
    tags: ["Market Theory", "Passive", "EMH"],
    category: "Market Basics",
    fullText: [
      "The Efficient Market Hypothesis (EMH), developed by Eugene Fama, proposes that asset prices fully reflect all available information. In its strong form, this means no amount of analysis—fundamental or technical—can consistently produce excess returns.",
      "Even if markets aren't perfectly efficient, they're efficient enough that the transaction costs of exploiting inefficiencies often exceed the gains. High-frequency trading firms with millions in infrastructure can capture tiny inefficiencies. A retail trader with a basic RSI strategy cannot.",
      "Warren Buffett famously bet a hedge fund manager $1 million that an S&P 500 index fund would outperform a portfolio of hedge funds over 10 years. Buffett won decisively. The index fund returned 125.8% vs the hedge funds' 36% after fees.",
      "This app exists to demonstrate this reality viscerally. You can build any strategy you want, optimize any parameters, and in most cases, the simple S&P 500 buy-and-hold approach will win over a 20-year period. Not because your strategy is bad—but because the game is structurally stacked against active trading."
    ],
    takeaway: "The most powerful investment strategy is also the simplest: buy a diversified index fund, contribute regularly, and never sell. Time in the market beats timing the market.",
    related: ["index-investing", "behavioral-finance"],
  },
];

export const metricsStrategy = {
  totalReturn: "+47.0%",
  annualizedReturn: "+1.97%",
  maxDrawdown: "-38.4%",
  winRate: "62.1%",
  sharpeRatio: "0.82",
  avgTradeDuration: "47 days",
  totalTrades: "214",
  tradingFees: "-$428",
};

export const metricsSP500 = {
  totalReturn: "+332.0%",
  annualizedReturn: "+7.4%",
  maxDrawdown: "-56.8%",
  winRate: "N/A",
  sharpeRatio: "0.94",
  avgTradeDuration: "∞",
  totalTrades: "1 (Buy & Hold)",
  tradingFees: "$0",
};

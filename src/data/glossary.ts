import { GlossaryTerm } from '@/types/learn';

export const glossaryTerms: GlossaryTerm[] = [
  // ── INDICATORS ──────────────────────────────────────────────────────────
  {
    id: 'rsi',
    term: 'RSI',
    fullName: 'Relative Strength Index',
    category: 'indicator',
    difficulty: 'beginner',
    definition:
      'The Relative Strength Index is a momentum oscillator that measures the speed and magnitude of recent price changes to evaluate whether an asset is overbought or oversold. It was developed by J. Welles Wilder Jr. in 1978 and plots on a scale from 0 to 100. Generally, an RSI above 70 suggests the asset may be overbought (due for a pullback), while an RSI below 30 suggests it may be oversold (potentially due for a bounce). Traders use RSI divergences—when price makes a new high but RSI does not—as an early warning of trend exhaustion.',
    howToUse:
      'Use RSI as a confirmation tool alongside price action; avoid buying when RSI is above 70 or selling when below 30 without additional confluence signals.',
    example:
      'Apple (AAPL) trades at $190 with an RSI of 72. A trader may wait for RSI to fall back below 70 before adding to a long position, reducing the risk of buying at a short-term peak.',
    related: ['macd', 'stochastic', 'bollinger', 'sma'],
    tags: ['momentum', 'oscillator', 'overbought', 'oversold', 'technical'],
    icon: 'TrendingUp',
  },
  {
    id: 'sma',
    term: 'SMA',
    fullName: 'Simple Moving Average',
    category: 'indicator',
    difficulty: 'beginner',
    definition:
      'A Simple Moving Average is calculated by summing the closing prices of an asset over a specific number of periods and dividing by that number, producing a smooth line that filters out short-term noise. It is one of the most widely used technical indicators because it is easy to calculate and interpret. The most common periods are 50-day and 200-day SMAs, which act as key support and resistance levels on price charts. When a shorter SMA crosses above a longer SMA, it signals potential bullish momentum; the opposite suggests bearish momentum.',
    howToUse:
      'Use the 50-day and 200-day SMAs as dynamic support/resistance levels; a price holding above the 200-day SMA indicates a broad uptrend, while price below it signals caution.',
    example:
      'A stock has closing prices of $10, $11, $12, $13, $14 over 5 days. Its 5-day SMA = ($10+$11+$12+$13+$14)/5 = $12. The following day, if the price closes at $15, the new SMA drops the first value and becomes ($11+$12+$13+$14+$15)/5 = $13.',
    related: ['ema', 'golden-cross', 'death-cross', 'macd'],
    tags: ['trend', 'moving average', 'support', 'resistance', 'technical'],
    icon: 'Activity',
  },
  {
    id: 'ema',
    term: 'EMA',
    fullName: 'Exponential Moving Average',
    category: 'indicator',
    difficulty: 'intermediate',
    definition:
      'The Exponential Moving Average is similar to the SMA but applies greater weighting to more recent prices, making it more responsive to new information and price changes. This responsiveness means EMA reacts faster to price reversals than SMA, which can be an advantage in trending markets but also leads to more false signals in choppy conditions. The weighting for each day is derived from a multiplier: 2 ÷ (N + 1), where N is the number of periods. Most trading platforms calculate EMA automatically, but understanding the weighting helps traders choose the right period for their strategy.',
    howToUse:
      'Use EMA when you want faster signals than SMA in trending conditions; the 9-day and 21-day EMAs are popular for short-term trading while 50-day and 200-day EMAs serve as longer-term trend guides.',
    example:
      'With a 10-day EMA and a multiplier of 2/(10+1)≈0.1818, if yesterday\'s EMA was $50 and today\'s closing price is $55, the new EMA = $55 × 0.1818 + $50 × (1−0.1818) ≈ $50.91, reacting immediately to the price jump.',
    related: ['sma', 'macd', 'golden-cross', 'bollinger'],
    tags: ['moving average', 'trend', 'weighted', 'technical', 'momentum'],
    icon: 'Activity',
  },
  {
    id: 'macd',
    term: 'MACD',
    fullName: 'Moving Average Convergence Divergence',
    category: 'indicator',
    difficulty: 'intermediate',
    definition:
      'MACD is a trend-following momentum indicator that shows the relationship between two exponential moving averages of a security\'s price, typically the 12-day and 26-day EMAs. It consists of three components: the MACD line (12-day EMA minus 26-day EMA), the Signal line (a 9-day EMA of the MACD line), and a Histogram showing the difference between the two lines. When the MACD line crosses above the Signal line, it generates a bullish crossover signal; crossing below produces a bearish signal. Divergence between MACD and price action can also signal major trend reversals.',
    howToUse:
      'Look for MACD crossovers to time entries and exits; combine with RSI to confirm whether momentum supports the signal before taking a trade.',
    example:
      'If AAPL\'s 12-day EMA is $185 and the 26-day EMA is $180, the MACD line = +$5. If the Signal line (9-day EMA of MACD) is $4.20, the Histogram = +$0.80, showing bullish momentum is accelerating.',
    related: ['ema', 'rsi', 'sma', 'momentum'],
    tags: ['momentum', 'crossover', 'signal', 'histogram', 'technical'],
    icon: 'GitBranch',
  },
  {
    id: 'bollinger',
    term: 'Bollinger Bands',
    fullName: 'Bollinger Bands',
    category: 'indicator',
    difficulty: 'intermediate',
    definition:
      'Bollinger Bands, developed by John Bollinger in the 1980s, consist of a middle band (typically a 20-day SMA) and two outer bands set at ±2 standard deviations from the middle band. The bands automatically widen during periods of high volatility and contract during low-volatility periods, providing a dynamic view of price ranges. When price touches the upper band, the asset may be considered overbought relative to its recent range; touching the lower band suggests it may be oversold. The "Bollinger Squeeze" — when bands narrow significantly — often precedes a sharp breakout move.',
    howToUse:
      'Use a Bollinger Squeeze (very narrow bands) to anticipate breakouts, and watch for price rejections at the outer bands combined with a momentum indicator to spot potential reversals.',
    example:
      'A stock\'s 20-day SMA is $100 with a standard deviation of $5. The upper band is $110 and the lower band is $90. When price spikes to $112 and closes back inside the upper band, many traders treat that as a sell signal.',
    related: ['rsi', 'atr', 'volatility', 'sma'],
    tags: ['volatility', 'bands', 'squeeze', 'standard deviation', 'technical'],
    icon: 'Layers',
  },
  {
    id: 'golden-cross',
    term: 'Golden Cross',
    fullName: 'Golden Cross',
    category: 'indicator',
    difficulty: 'beginner',
    definition:
      'A Golden Cross is a bullish technical signal that occurs when a short-term moving average—most commonly the 50-day SMA—crosses above a long-term moving average, typically the 200-day SMA. This crossover is widely watched by institutional and retail investors alike as it signals a potential shift from a downtrend to an uptrend. It is considered more reliable when accompanied by rising trading volume, confirming that buyers are in control. The Golden Cross has historically preceded many of the market\'s strongest multi-month rallies and is one of the most referenced technical patterns in mainstream financial media.',
    howToUse:
      'Treat a Golden Cross as a medium-term bullish signal; wait for a daily close to confirm the crossover and check volume to avoid acting on a false breakout.',
    example:
      'The S&P 500\'s 50-day SMA crosses above its 200-day SMA in April 2020, signaling the start of the post-COVID bull market. A trader who entered at the cross would have captured a +70% run over the next 12 months.',
    related: ['death-cross', 'sma', 'ema', 'trend-following'],
    tags: ['crossover', 'bullish', 'trend', 'moving average', 'signal'],
    icon: 'Star',
  },
  {
    id: 'death-cross',
    term: 'Death Cross',
    fullName: 'Death Cross',
    category: 'indicator',
    difficulty: 'beginner',
    definition:
      'The Death Cross is the bearish counterpart to the Golden Cross and occurs when a short-term moving average (typically the 50-day SMA) falls below a long-term moving average (the 200-day SMA). It signals that recent selling pressure is outpacing longer-term buying interest, which may indicate an extended downtrend is beginning. Although the Death Cross is a lagging indicator—by the time it forms, a significant decline has often already occurred—it can still be useful for trend confirmation and risk management decisions. Many traders use it as a signal to tighten stop-losses or reduce position sizes.',
    howToUse:
      'Use the Death Cross as a risk-management alert to review open long positions; it is more useful as a confirmation tool than a standalone entry signal for short trades.',
    example:
      'Bitcoin\'s Death Cross formed in June 2021 when its 50-day SMA crossed below the 200-day SMA. Over the following months, BTC declined from around $35,000 to roughly $29,000 before recovering.',
    related: ['golden-cross', 'sma', 'bear-market', 'stop-loss'],
    tags: ['crossover', 'bearish', 'trend', 'downtrend', 'moving average'],
    icon: 'X',
  },
  {
    id: 'vwap',
    term: 'VWAP',
    fullName: 'Volume Weighted Average Price',
    category: 'indicator',
    difficulty: 'intermediate',
    definition:
      'VWAP is a trading benchmark that calculates the average price at which a security has traded throughout the day, weighted by volume at each price level rather than by time. It resets at the start of each trading session and is displayed as a single line on intraday charts. Institutional traders frequently use VWAP to assess whether their execution price is above or below the market\'s average—buying below VWAP is generally considered a favorable fill. Day traders use VWAP as a dynamic support/resistance level; when price is above VWAP, the intraday trend is considered bullish, and below VWAP, bearish.',
    howToUse:
      'Use VWAP as a trend filter on intraday charts—take long trades when price is above VWAP and short trades when below, and watch for VWAP reclaims as potential reversal signals.',
    example:
      'A stock opens at $50, trades heavily at $52 (500,000 shares), then fades to $48 (100,000 shares). Its VWAP is roughly ($52×500k + $48×100k)/(600k) ≈ $51.33, which acts as a key intraday support level.',
    related: ['sma', 'momentum', 'day-trading', 'atr'],
    tags: ['intraday', 'volume', 'benchmark', 'institutional', 'support'],
    icon: 'BarChart2',
  },
  {
    id: 'atr',
    term: 'ATR',
    fullName: 'Average True Range',
    category: 'indicator',
    difficulty: 'intermediate',
    definition:
      'Average True Range, developed by J. Welles Wilder, measures market volatility by calculating the average of the "true range" over a given period (default: 14 days). The true range is the greatest of: today\'s high minus today\'s low, today\'s high minus yesterday\'s close, or today\'s low minus yesterday\'s close. ATR does not indicate direction—only magnitude of movement. It is essential for position sizing and stop-loss placement because it quantifies how much an asset actually moves on average, allowing traders to set stops wide enough to avoid being shaken out by normal price fluctuations.',
    howToUse:
      'Use ATR to size your stop-loss as a multiple of the ATR (e.g., 1.5×ATR below entry) so you account for normal daily price swings and avoid premature stop-outs.',
    example:
      'A stock has an ATR of $3.50. Using a 2×ATR stop, you place your stop-loss $7.00 below your entry of $100, at $93. This gives the trade breathing room based on actual market volatility rather than an arbitrary dollar amount.',
    related: ['bollinger', 'volatility', 'stop-loss', 'position-sizing'],
    tags: ['volatility', 'range', 'stop-loss', 'position sizing', 'risk'],
    icon: 'Maximize2',
  },
  {
    id: 'stochastic',
    term: 'Stochastic',
    fullName: 'Stochastic Oscillator',
    category: 'indicator',
    difficulty: 'intermediate',
    definition:
      'The Stochastic Oscillator, developed by George Lane in the 1950s, compares a security\'s closing price to its price range over a specific period (typically 14 days) and oscillates between 0 and 100. It consists of two lines: %K (the main line, showing where the close fell within the recent high-low range) and %D (a 3-day moving average of %K used as a signal line). Readings above 80 suggest overbought conditions, while readings below 20 indicate oversold conditions. Crossovers between %K and %D provide buy or sell signals, and divergences from price action often warn of impending trend changes.',
    howToUse:
      'Combine stochastic crossovers (below 20 for buys, above 80 for sells) with a trend filter like a moving average to avoid trading counter-trend in a strongly trending market.',
    example:
      'A stock\'s 14-day %K rises from 18 to 25 and crosses above %D at 20. This crossover in the oversold zone signals a potential long entry, especially if the wider trend is bullish (price above 200-day SMA).',
    related: ['rsi', 'macd', 'bollinger', 'atr'],
    tags: ['oscillator', 'overbought', 'oversold', 'momentum', 'crossover'],
    icon: 'RefreshCw',
  },

  // ── RISK ─────────────────────────────────────────────────────────────────
  {
    id: 'max-drawdown',
    term: 'Max Drawdown',
    fullName: 'Maximum Drawdown',
    category: 'risk',
    difficulty: 'beginner',
    definition:
      'Maximum Drawdown (MDD) measures the largest peak-to-trough decline in a portfolio\'s value over a given period, expressed as a percentage. It answers the question: "What is the worst loss an investor would have experienced if they bought at the top and sold at the bottom?" Maximum Drawdown is a critical risk metric because even strategies with high average returns may be unacceptable if they expose investors to devastating interim losses. A lower MDD indicates a smoother equity curve and a strategy that is psychologically easier to hold through downturns. It\'s often used alongside the Sharpe Ratio and CAGR to evaluate risk-adjusted performance.',
    howToUse:
      'Compare MDD against your personal risk tolerance before committing to a strategy; a strategy with 50% MDD requires your portfolio to double just to break even.',
    example:
      'An investor\'s portfolio peaks at $100,000 in January, falls to $60,000 by October, then recovers. The Maximum Drawdown is ($100k − $60k) / $100k = −40%, meaning they endured a 40% loss at the worst point.',
    related: ['stop-loss', 'sharpe', 'risk-reward', 'var'],
    tags: ['drawdown', 'risk', 'loss', 'portfolio', 'performance'],
    icon: 'TrendingDown',
  },
  {
    id: 'stop-loss',
    term: 'Stop Loss',
    fullName: 'Stop Loss Order',
    category: 'risk',
    difficulty: 'beginner',
    definition:
      'A stop-loss order is an instruction placed with a broker to automatically sell (or buy, for short positions) a security when it reaches a specified price, limiting the potential loss on a trade. It is one of the most fundamental risk management tools available to traders and investors because it removes the emotional component of deciding when to exit a losing trade. Stop-losses can be fixed (set at a specific price), percentage-based (e.g., 5% below entry), or dynamic (trailing stop-losses that move with the price to lock in profits). Without stop-losses, traders risk holding losing positions indefinitely, often resulting in catastrophic losses.',
    howToUse:
      'Always define your stop-loss level before entering a trade, not after; use ATR-based stops for technical trades and percentage-based stops for long-term positions.',
    example:
      'You buy 100 shares of TSLA at $250 and set a stop-loss at $237.50 (5% below entry). If TSLA drops to $237.50, your position is automatically sold, capping your loss at $1,250 and preventing a potentially larger decline.',
    related: ['take-profit', 'risk-reward', 'position-sizing', 'atr'],
    tags: ['risk management', 'order', 'exit', 'loss limit', 'protection'],
    icon: 'Shield',
  },
  {
    id: 'take-profit',
    term: 'Take Profit',
    fullName: 'Take Profit Order',
    category: 'risk',
    difficulty: 'beginner',
    definition:
      'A take-profit order is an instruction to automatically close a position when it reaches a predetermined profit target, locking in gains without requiring the trader to manually monitor the market. It is the complement to a stop-loss order, and together they define the risk/reward profile of a trade before it is entered. Using take-profit levels forces traders to think in terms of trade planning rather than hope, and prevents the common mistake of giving back unrealized gains by staying in a winning trade too long. Partial take-profits—closing part of a position at one target and letting the rest run—are a popular technique to balance securing gains with maintaining upside exposure.',
    howToUse:
      'Set your take-profit target at a level of natural resistance (prior highs, Fibonacci extensions) so you are exiting into buyers rather than chasing price higher.',
    example:
      'You enter a long at $50 with a stop-loss at $47 and a take-profit at $59. This defines a risk/reward ratio of 3:1 ($9 potential gain / $3 potential loss), a favourable trade setup.',
    related: ['stop-loss', 'risk-reward', 'swing-trading', 'momentum'],
    tags: ['target', 'profit', 'exit', 'order', 'risk management'],
    icon: 'Target',
  },
  {
    id: 'position-sizing',
    term: 'Position Sizing',
    fullName: 'Position Sizing',
    category: 'risk',
    difficulty: 'intermediate',
    definition:
      'Position sizing is the process of determining how many units of a security to buy or short in order to control the amount of capital at risk on any single trade. It is arguably the most important element of risk management because even the best strategy will fail if trades are sized too large during inevitable losing streaks. A common approach is the "1% Rule," where a trader risks no more than 1-2% of their total account on any single trade. Position size is calculated from the distance to the stop-loss: position size = (account risk in dollars) / (entry price − stop-loss price). Kelly Criterion is a more advanced formula for optimal bet sizing based on win rate and win/loss ratio.',
    howToUse:
      'Calculate your position size based on your dollar risk limit and stop-loss distance, not based on a round number of shares or a fixed dollar amount.',
    example:
      'Account size: $50,000. Risk limit: 1% = $500 per trade. Entry: $100, Stop-loss: $95 (distance = $5). Position size = $500 / $5 = 100 shares. Buying 100 shares means the trade risks exactly $500 if stopped out.',
    related: ['stop-loss', 'risk-reward', 'max-drawdown', 'var'],
    tags: ['risk management', 'lot size', 'Kelly criterion', 'allocation', 'sizing'],
    icon: 'Sliders',
  },
  {
    id: 'risk-reward',
    term: 'Risk/Reward',
    fullName: 'Risk to Reward Ratio',
    category: 'risk',
    difficulty: 'beginner',
    definition:
      'The risk/reward ratio (R:R) compares the potential profit of a trade against its potential loss, giving traders a framework for evaluating whether a trade is worth taking before entering it. A ratio of 1:2 means you risk $1 to potentially make $2. Professional traders typically seek setups with at least a 1:2 R:R—meaning even with a 50% win rate, a strategy remains profitable. Understanding R:R helps eliminate low-quality trades that might have high win rates but reward too little relative to the risk taken. It works in tandem with win rate: a lower win rate can still be profitable if average winning trades are much larger than average losing trades.',
    howToUse:
      'Before entering any trade, calculate your R:R and only proceed if it is at least 1:2; tracks your average R:R over time to benchmark your trade selection quality.',
    example:
      'Entry: $100, stop-loss: $95 (risk = $5), take-profit: $115 (reward = $15). R:R = 1:3. Even with a 35% win rate, this is a profitable strategy: 35% × $15 − 65% × $5 = $5.25 − $3.25 = +$2 expected value per trade.',
    related: ['stop-loss', 'take-profit', 'position-sizing', 'sharpe'],
    tags: ['ratio', 'expectancy', 'win rate', 'profit', 'loss'],
    icon: 'Scale',
  },
  {
    id: 'volatility',
    term: 'Volatility',
    fullName: 'Market Volatility',
    category: 'risk',
    difficulty: 'beginner',
    definition:
      'Volatility describes the degree of variation in an asset\'s price over time, typically measured by standard deviation of returns or the VIX Index for broad market volatility. High volatility means prices swing dramatically in short periods, while low volatility indicates stable, gradual price movements. Volatility is not inherently good or bad—it creates opportunity for traders but represents uncertainty and risk for long-term investors. Implied volatility (derived from options pricing) reflects market participants\' expectations of future price movement, while historical volatility measures past price variation. Understanding volatility is key to sizing positions appropriately and setting realistic price targets.',
    howToUse:
      'Adjust your position sizes inversely with volatility—trade smaller when volatility is high (e.g., ATR is elevated or VIX is above 25) to keep dollar risk constant across different market conditions.',
    example:
      'During the COVID crash, the VIX surged from 12 to 82 in weeks. A trader using fixed percentage position sizing on SPY would automatically risk the same 1% of account whether volatility is low or high, but volatility-adjusted sizing might halve positions to reflect the greater risk.',
    related: ['atr', 'bollinger', 'var', 'beta'],
    tags: ['standard deviation', 'VIX', 'risk', 'price swings', 'uncertainty'],
    icon: 'Zap',
  },
  {
    id: 'var',
    term: 'VaR',
    fullName: 'Value at Risk',
    category: 'risk',
    difficulty: 'advanced',
    definition:
      'Value at Risk is a statistical measure used by institutions and sophisticated investors to quantify the potential loss in value of a portfolio over a defined period for a given confidence interval. For example, a 1-day VaR of $1 million at 95% confidence means there is a 5% chance the portfolio will lose more than $1 million in a single day. VaR has three key inputs: time horizon, confidence level, and historical return distribution. While widely used in risk management and regulatory frameworks such as Basel III, VaR has been criticized for failing to capture tail risk—the extreme losses that occur beyond the confidence threshold—which is why institutions also use Conditional VaR (CVaR) or Expected Shortfall.',
    howToUse:
      'Use VaR as part of a broader risk framework to set portfolio-level loss limits and stress-test strategies; never treat VaR as a worst-case scenario since it explicitly excludes the worst outcomes.',
    example:
      'A hedge fund calculates a 5-day 99% VaR of $500,000. This means they estimate only a 1% probability of losing more than $500,000 over the next 5 trading days based on historical return distributions.',
    related: ['max-drawdown', 'volatility', 'beta', 'risk-reward'],
    tags: ['statistics', 'risk measurement', 'confidence interval', 'portfolio', 'institutional'],
    icon: 'AlertTriangle',
  },
  {
    id: 'beta',
    term: 'Beta',
    fullName: 'Beta Coefficient',
    category: 'risk',
    difficulty: 'intermediate',
    definition:
      'Beta measures a security\'s sensitivity to movements in a benchmark index, typically the S&P 500. A beta of 1.0 means the asset moves in line with the market; a beta of 1.5 means it tends to move 50% more than the market in either direction; a beta below 1.0 indicates lower sensitivity; and a negative beta (like gold sometimes exhibits) means the asset tends to move opposite to the market. Beta is central to the Capital Asset Pricing Model (CAPM), which argues that higher beta assets should offer higher expected returns to compensate for added market risk. However, beta is backward-looking and can change over time as a company\'s business model evolves.',
    howToUse:
      'Use beta to manage portfolio sensitivity during uncertain market conditions—reducing exposure to high-beta stocks and increasing low-beta or negative-beta assets can buffer a portfolio against sudden market drops.',
    example:
      'If the S&P 500 falls 10%, a stock with a beta of 1.8 is expected to fall roughly 18%, while a utility stock with a beta of 0.5 is expected to fall only 5%. This makes high-beta stocks riskier in downturns but more rewarding in rallies.',
    related: ['alpha', 'volatility', 'sharpe', 'var'],
    tags: ['market risk', 'CAPM', 'correlation', 'sensitivity', 'systematic risk'],
    icon: 'Percent',
  },

  // ── STRATEGY ─────────────────────────────────────────────────────────────
  {
    id: 'backtesting',
    term: 'Backtesting',
    fullName: 'Strategy Backtesting',
    category: 'strategy',
    difficulty: 'intermediate',
    definition:
      'Backtesting is the process of applying a trading strategy to historical market data to assess how it would have performed in the past, before risking real capital. It helps traders identify whether a strategy has a statistical edge, understand its risk profile (drawdowns, win rate, average trade duration), and optimize parameters. A critical pitfall is overfitting—tweaking a strategy to perform well specifically on historical data but failing forward because it was "curve-fitted" to past noise. Other risks include look-ahead bias (accidentally using data that would not have been available at the time of a trade) and survivorship bias (testing only on assets that are still trading today, ignoring those that went bankrupt).',
    howToUse:
      'Always split historical data into an in-sample period for development and an out-of-sample period for validation; if the strategy fails out-of-sample, it is likely overfitted.',
    example:
      'You backtest an RSI + 50-day SMA strategy on 10 years of S&P 500 data from 2010-2020. It shows 68% win rate and 15% CAGR. You then test on fresh 2020-2024 data (out-of-sample) and verify the edge holds before trading it live.',
    related: ['mean-reversion', 'momentum', 'sharpe', 'max-drawdown'],
    tags: ['historical', 'simulation', 'strategy testing', 'overfitting', 'edge'],
    icon: 'RotateCcw',
  },
  {
    id: 'momentum',
    term: 'Momentum',
    fullName: 'Momentum Trading',
    category: 'strategy',
    difficulty: 'intermediate',
    definition:
      'Momentum trading is based on the empirical observation that assets which have been rising tend to continue rising, and those that have been falling tend to continue falling in the near term—a pattern that contradicts the Efficient Market Hypothesis in its purest form. The phenomenon exists because of behavioral biases: investors underreact to new information initially, and the trend accelerates as more investors pile in (herding). Momentum strategies rank assets by their recent performance and buy the top performers while avoiding or shorting the worst performers. Academic research by Jegadeesh and Titman (1993) showed that momentum strategies generated significant excess returns across global equity markets.',
    howToUse:
      'Focus on assets making new multi-week or multi-month highs with expanding volume, and avoid catching falling knives—never buy momentum because you think something is "cheap after falling."',
    example:
      'During 2023, NVIDIA (NVDA) surged from $150 to over $500, gaining +230%. Momentum traders who bought NVDA at a new 52-week high of $200 in February and rode the trend captured a 150%+ gain by year-end.',
    related: ['trend-following', 'swing-trading', 'rsi', 'macd'],
    tags: ['trend', 'relative strength', 'breakout', 'continuation', 'behavioral'],
    icon: 'Rocket',
  },
  {
    id: 'mean-reversion',
    term: 'Mean Reversion',
    fullName: 'Mean Reversion Strategy',
    category: 'strategy',
    difficulty: 'intermediate',
    definition:
      'Mean reversion is the theory that asset prices and other financial metrics tend to return to their long-term historical average over time after deviating significantly in either direction. It is the philosophical opposite of momentum trading and forms the basis for strategies that buy underperforming assets and sell outperforming ones. The principle applies across many timeframes—from intraday overextensions (buying when RSI is extremely oversold) to multi-year cyclical rotations between sectors. Mean reversion strategies tend to perform well in range-bound, low-volatility markets but can suffer catastrophic losses in trending markets if the "reversion" never occurs and the asset continues in the same direction.',
    howToUse:
      'Use mean reversion trades in clearly range-bound markets with well-defined support and resistance levels; always use stop-losses to protect against cases where an asset breaks out of the range permanently.',
    example:
      'A stock has traded between $40 and $60 for 18 months and falls to $42 on weak volume. A mean reversion trader buys here targeting a return to the $50–$55 midrange, with a stop-loss at $37 to limit downside in case the range breaks lower.',
    related: ['bollinger', 'rsi', 'backtesting', 'trend-following'],
    tags: ['range', 'reversion', 'oversold', 'statistical', 'contrarian'],
    icon: 'ArrowLeftRight',
  },
  {
    id: 'buy-hold',
    term: 'Buy & Hold',
    fullName: 'Buy and Hold Strategy',
    category: 'strategy',
    difficulty: 'beginner',
    definition:
      'Buy and hold is a passive investment strategy where an investor purchases assets—typically diversified equity funds or index funds—and holds them for an extended period regardless of short-term market fluctuations. This approach is grounded in historical evidence that broad equity markets tend to rise over long time horizons (the S&P 500 has averaged roughly 10% annually over the past century including dividends), that timing the market is extremely difficult even for professionals, and that frequent trading generates costs and taxes that eat into returns. Warren Buffett is perhaps the most famous advocate of this philosophy, summarized in his quote: "Our favorite holding period is forever."',
    howToUse:
      'Commit capital you genuinely will not need for 10+ years, auto-invest monthly via dollar cost averaging into diversified index funds, and ignore short-term market noise to stay the course through inevitable downturns.',
    example:
      'An investor puts $10,000 into an S&P 500 index fund in 2000—right before the dot-com crash—and never touches it. Despite losing 50% in 2000-2002 and 57% in 2008-2009, by 2024 the investment would be worth approximately $60,000-70,000 including reinvested dividends.',
    related: ['dca', 'index-investing', 'sp500', 'cagr'],
    tags: ['passive', 'long-term', 'index', 'compounding', 'Warren Buffett'],
    icon: 'Clock',
  },
  {
    id: 'dca',
    term: 'DCA',
    fullName: 'Dollar Cost Averaging',
    category: 'strategy',
    difficulty: 'beginner',
    definition:
      'Dollar Cost Averaging is the practice of investing a fixed sum of money at regular intervals (weekly, monthly, quarterly) regardless of the asset\'s current price. When prices are high, the fixed contribution buys fewer units; when prices are low, it buys more. Over time, this smooths out the average purchase price and reduces the impact of short-term volatility and the psychological burden of trying to time the market perfectly. DCA is particularly effective during bear markets and sideways markets, where a lump-sum investor might be underwater while the DCA investor has accumulated more units at lower prices and has a lower cost basis.',
    howToUse:
      'Set up automatic monthly investments into your chosen funds on payday so it happens before you can spend the money; do not deviate during market downturns—keeping the schedule through crashes is when DCA provides the biggest advantage.',
    example:
      'An investor puts $500/month into Bitcoin. In Month 1, BTC is at $50,000 → 0.01 BTC. Month 2, BTC falls to $25,000 → 0.02 BTC. Month 3, BTC at $33,333 → 0.015 BTC. After 3 months, average cost per BTC ≈ $36,000 despite buying through a 50% crash.',
    related: ['buy-hold', 'index-investing', 'cagr', 'mean-reversion'],
    tags: ['systematic', 'averaging', 'monthly investing', 'volatility smoothing', 'passive'],
    icon: 'Calendar',
  },
  {
    id: 'swing-trading',
    term: 'Swing Trading',
    fullName: 'Swing Trading',
    category: 'strategy',
    difficulty: 'intermediate',
    definition:
      'Swing trading is a style that aims to capture short- to medium-term price "swings" within an existing trend, typically holding positions for a few days to several weeks. It sits between the high-frequency world of day trading and the long-term horizon of buy-and-hold investing, making it accessible to those who cannot monitor markets continuously during the day. Swing traders analyze charts using technical indicators (RSI, MACD, chart patterns) to identify high-probability entry and exit points within larger trends. The trade-off is exposure to overnight and weekend gap risk—news events that occur when markets are closed can cause significant price gaps through stop-loss levels.',
    howToUse:
      'Focus on higher timeframe (daily or weekly chart) trends and enter on pullbacks to key support or moving averages with well-defined stop-losses, targeting the next resistance level.',
    example:
      'AAPL is in an uptrend and pulls back to its 50-day SMA at $170. RSI reaches 42 (nearly oversold). A swing trader buys at $170 with a stop at $163 and a target of $190 (prior high), aiming for an ~3:1 R/R over a 2-3 week hold.',
    related: ['momentum', 'trend-following', 'rsi', 'sma'],
    tags: ['short-term', 'technical', 'position', 'days to weeks', 'chart patterns'],
    icon: 'BarChart',
  },
  {
    id: 'day-trading',
    term: 'Day Trading',
    fullName: 'Day Trading',
    category: 'strategy',
    difficulty: 'advanced',
    definition:
      'Day trading involves buying and selling financial instruments within the same trading session so that no positions are held overnight. Day traders rely on small price movements across many trades, often using leverage to amplify returns. It demands intense focus, lightning-fast execution, disciplined risk management, and deep knowledge of Level 2 order flow and tape reading. The reality is sobering: studies consistently show that 70-90% of day traders lose money over the long term, with commissions, spreads, and taxes creating a significant structural disadvantage. Profitable day trading requires a genuine statistical edge, strict discipline, and large enough capital to absorb inevitable losing streaks.',
    howToUse:
      'If testing day trading, start with a paper trading account for at least 3 months before risking real capital; focus on 1-2 setups and master them before expanding, and track every trade in a journal.',
    example:
      'A trader buys 500 shares of SPY at $450.00 at 9:45am after noticing a momentum surge above VWAP with strong volume. SPY rises to $450.75. The trader sells all 500 shares at $450.70 (allowing for slippage) for a $350 gain on a $225,000 position, then moves to the next setup.',
    related: ['vwap', 'momentum', 'swing-trading', 'stop-loss'],
    tags: ['intraday', 'scalping', 'leverage', 'active trading', 'high frequency'],
    icon: 'Sun',
  },
  {
    id: 'trend-following',
    term: 'Trend Following',
    fullName: 'Trend Following Strategy',
    category: 'strategy',
    difficulty: 'intermediate',
    definition:
      'Trend following is a systematic strategy that attempts to profit from sustained directional movements in asset prices by going long in uptrends and short in downtrends, holding until the trend reverses. Unlike momentum strategies that focus on recent performance rankings, trend following often uses price breakouts or moving average crossovers to define when a trend has begun or ended. Famous trend-following firms like Man AHL and Winton have compounded capital at significant rates over decades. The strategy is known for its ability to capture tail events (massive trending moves) and often performs best during financial crises when most other strategies collapse—making it an excellent portfolio diversifier.',
    howToUse:
      'Use a simple rule like "buy when price closes above its 200-day SMA; sell when it closes below" applied across a diversified basket of assets rather than picking individual stocks.',
    example:
      'A trend-following system goes long crude oil futures when price breaks above a 3-month high. Oil then surges from $70 to $110 over 6 months due to geopolitical tensions. The system rides the move and exits when price falls back below the 3-month high at $105, capturing most of the $40 gain.',
    related: ['momentum', 'golden-cross', 'sma', 'ema'],
    tags: ['systematic', 'breakout', 'futures', 'diversified', 'CTA'],
    icon: 'Navigation',
  },

  // ── MARKET ────────────────────────────────────────────────────────────────
  {
    id: 'bull-market',
    term: 'Bull Market',
    fullName: 'Bull Market',
    category: 'market',
    difficulty: 'beginner',
    definition:
      'A bull market is a sustained period of rising asset prices, typically defined as a 20% or more increase from a recent low, often accompanied by strong economic growth, low unemployment, rising corporate earnings, and investor optimism. Bull markets can last for years—the longest US bull market ran from March 2009 to February 2020, a span of nearly 11 years with the S&P 500 gaining over 400%. During bull markets, buying dips is generally rewarded and the trend-following approach outperforms. Investor sentiment tends to shift from caution to greed over the course of a bull market, often setting up the conditions for the eventual correction.',
    howToUse:
      'In a confirmed bull market (price above rising 200-day SMA, breadth expanding), favor buying dips to key moving averages over trying to short or time the top—the trend is your friend.',
    example:
      'The S&P 500 bottomed at 666 in March 2009 following the financial crisis. By February 2020, it had reached 3,386, a gain of 409%—one of the longest and strongest bull markets in US history, fueled by near-zero interest rates and QE.',
    related: ['bear-market', 'sp500', 'golden-cross', 'momentum'],
    tags: ['bull', 'uptrend', 'rising market', 'optimism', 'growth'],
    icon: 'TrendingUp',
  },
  {
    id: 'bear-market',
    term: 'Bear Market',
    fullName: 'Bear Market',
    category: 'market',
    difficulty: 'beginner',
    definition:
      'A bear market is conventionally defined as a decline of 20% or more from recent highs in a broad market index, sustained over at least two months. Bear markets are typically accompanied by economic slowdowns or recessions, rising unemployment, shrinking corporate earnings, and pervasive investor pessimism. They are psychologically brutal: the media amplifies negative news, portfolio losses erode confidence, and it becomes difficult to distinguish a temporary correction from a prolonged decline. However, history shows that bear markets are temporary. Every single US bear market has eventually been followed by new all-time highs. Average bear market duration is approximately 9-14 months.',
    howToUse:
      'Focus on capital preservation in confirmed bear markets (price below falling 200-day SMA, breadth deteriorating) by raising cash, reducing position sizes, and favoring defensive assets like bonds and utilities.',
    example:
      'The COVID bear market: the S&P 500 fell from 3,386 in February 2020 to 2,237 in March 2020—a 34% decline in just 33 days, the fastest bear market in history. By August 2020, it had fully recovered to new all-time highs.',
    related: ['bull-market', 'max-drawdown', 'death-cross', 'volatility'],
    tags: ['bear', 'downtrend', 'decline', 'recession', 'pessimism'],
    icon: 'TrendingDown',
  },
  {
    id: 'sp500',
    term: 'S&P 500',
    fullName: 'S&P 500 Index',
    category: 'market',
    difficulty: 'beginner',
    definition:
      'The S&P 500 (Standard & Poor\'s 500) is a market-capitalization-weighted stock market index that tracks the performance of 500 of the largest publicly traded companies in the United States. It is widely considered the best single gauge of large-cap US equity performance and serves as the benchmark against which most professional fund managers measure their results. The index is maintained by S&P Dow Jones Indices and is reviewed quarterly, with companies added or removed based on criteria including size, liquidity, and profitability. Since its 1957 inception, the S&P 500 has returned approximately 10% per year on average including dividends, making it the gold standard benchmark in global finance.',
    howToUse:
      'Use the S&P 500 as your primary benchmark: any investment strategy that consistently underperforms simple S&P 500 index fund investing should be questioned, as most active managers fail to beat it after fees over 15+ years.',
    example:
      'A $10,000 investment in an S&P 500 index fund in 1990 would be worth approximately $220,000 by 2024 (reinvesting dividends), representing a compound annual growth rate of roughly 10.7%.',
    related: ['etf', 'index-investing', 'bull-market', 'buy-hold'],
    tags: ['benchmark', 'index', 'US stocks', 'large cap', 'passive investing'],
    icon: 'PieChart',
  },
  {
    id: 'etf',
    term: 'ETF',
    fullName: 'Exchange Traded Fund',
    category: 'market',
    difficulty: 'beginner',
    definition:
      'An Exchange Traded Fund is a pooled investment vehicle that trades on a stock exchange like individual shares and typically tracks a benchmark index, sector, commodity, or investment strategy. ETFs combine the diversification benefits of mutual funds with the flexibility and liquidity of stocks—they can be bought and sold throughout the trading day at real-time prices, unlike mutual funds which settle at end-of-day NAV. Most ETFs passively track an index (like SPY tracking the S&P 500) with very low expense ratios (often under 0.1%), making them among the most cost-efficient investment vehicles available. There are also actively managed ETFs, leveraged ETFs (2x or 3x daily returns), and inverse ETFs.',
    howToUse:
      'Use low-cost index ETFs (e.g., VTI, SPY, QQQ) as the core of a diversified long-term portfolio; avoid leveraged and inverse ETFs unless you are an experienced trader who understands daily compounding decay.',
    example:
      'Buying SPY (SPDR S&P 500 ETF Trust) gives instant exposure to all 500 companies in the S&P 500 index with a single transaction. Its expense ratio is just 0.0945%, meaning for every $10,000 invested, fees are only $9.45 per year.',
    related: ['index-investing', 'sp500', 'market-cap', 'buy-hold'],
    tags: ['fund', 'index', 'diversification', 'passive', 'low-cost'],
    icon: 'Package',
  },
  {
    id: 'index-investing',
    term: 'Index Investing',
    fullName: 'Passive Index Investing',
    category: 'market',
    difficulty: 'beginner',
    definition:
      'Index investing is a strategy of buying and holding a portfolio that replicates a market index, such as the S&P 500, rather than attempting to select individual winning stocks. Pioneered by Jack Bogle, who founded Vanguard in 1975 and launched the first index mutual fund, the strategy rests on three core insights: markets are largely efficient; active management fees and transaction costs compound unfavorably over time; and broad diversification reduces individual security risk. Decades of data confirm that roughly 80-90% of actively managed funds underperform their benchmark index over 15-year periods after fees—making passive index investing the rational default for most investors.',
    howToUse:
      'Invest in a three-fund portfolio (total US market + total international + total bond market) via low-cost index ETFs or mutual funds, rebalance annually, and invest additional savings every month regardless of market conditions.',
    example:
      'Vanguard\'s Total Stock Market Index Fund (VTSAX) owns roughly 3,700 US stocks, has an expense ratio of 0.04%, and has returned approximately 11% per year over the past decade, outperforming around 80% of actively managed US equity funds.',
    related: ['etf', 'sp500', 'buy-hold', 'dca'],
    tags: ['passive', 'Bogle', 'Vanguard', 'diversification', 'low cost'],
    icon: 'Award',
  },
  {
    id: 'market-cap',
    term: 'Market Cap',
    fullName: 'Market Capitalisation',
    category: 'market',
    difficulty: 'beginner',
    definition:
      'Market capitalisation is the total market value of a company\'s outstanding shares, calculated by multiplying the current share price by the total number of shares outstanding. It is used to categorize companies into size tiers: mega-cap (>$200B), large-cap ($10-200B), mid-cap ($2-10B), small-cap ($300M-2B), and micro-cap (<$300M). Market cap drives index weighting: in a market-cap-weighted index like the S&P 500, larger companies have greater impact on the index\'s performance. Apple, Microsoft, and NVIDIA each carry weightings of 5-7%, meaning a 10% move in one of these companies can move the entire S&P 500 index by 0.5-0.7%.',
    howToUse:
      'Use market cap to understand the risk profile of your investments: large-caps (Apple, Google) tend to be more stable with predictable revenues, while small-caps offer higher growth potential but greater volatility and liquidity risk.',
    example:
      'Apple\'s stock price is $180 and it has 15.4 billion shares outstanding. Market cap = $180 × 15.4B = $2.77 trillion, making it the largest company by market cap in the world and the most heavily weighted stock in the S&P 500 index.',
    related: ['sp500', 'etf', 'liquidity', 'beta'],
    tags: ['valuation', 'company size', 'shares outstanding', 'large cap', 'small cap'],
    icon: 'DollarSign',
  },
  {
    id: 'liquidity',
    term: 'Liquidity',
    fullName: 'Market Liquidity',
    category: 'market',
    difficulty: 'intermediate',
    definition:
      'Liquidity refers to how quickly and easily an asset can be bought or sold without significantly impacting its price. A highly liquid asset, like a large-cap stock or a major currency pair, can be traded in large volumes with minimal price impact. An illiquid asset, like a small-cap stock, real estate, or private equity, may take days or weeks to sell and doing so in size can dramatically move the price. Liquidity has two dimensions: market liquidity (ease of trading the asset) and funding liquidity (ability to access cash when needed). During financial crises, liquidity can evaporate suddenly as sellers overwhelm buyers, causing prices to gap down far beyond what fundamentals would justify.',
    howToUse:
      'Always check average daily volume and bid-ask spread before entering a position; avoid committing more than 10% of a stock\'s average daily volume to your trade to minimize market impact.',
    example:
      'Apple trades 80 million shares per day with a bid-ask spread of $0.01. A micro-cap company trades 10,000 shares per day with a $0.50 spread. A $50,000 position in the micro-cap represents 50% of daily volume—a near-impossible exit without moving the price against you.',
    related: ['bid-ask', 'market-cap', 'volatility', 'etf'],
    tags: ['volume', 'bid-ask', 'slippage', 'ease of trading', 'market depth'],
    icon: 'Droplets',
  },
  {
    id: 'bid-ask',
    term: 'Bid-Ask Spread',
    fullName: 'Bid-Ask Spread',
    category: 'market',
    difficulty: 'beginner',
    definition:
      'The bid-ask spread is the difference between the highest price a buyer is willing to pay for an asset (the bid) and the lowest price a seller is willing to accept (the ask). It represents the transaction cost of trading and acts as implicit revenue for market makers who provide liquidity. Small spreads (e.g., $0.01 on Apple) indicate a highly liquid market with tight competition among market makers. Wide spreads (e.g., $0.50+ on thinly traded stocks or options) indicate illiquidity and act as a hidden tax on every trade. For options traders, bid-ask spreads can be enormous (10-20% of the mid-price), making them a major component of total trading costs.',
    howToUse:
      'Always use limit orders instead of market orders to control the price at which you trade and avoid paying an unnecessarily wide spread; for illiquid stocks and options, use the mid-price as a starting limit and adjust from there.',
    example:
      'SPY has a bid of $450.00 and an ask of $450.01—a spread of $0.01 or 0.002% of the price. An illiquid stock might have a bid of $5.00 and an ask of $5.50—a spread of $0.50 or 10% of the price, consuming 10% of your investment value immediately.',
    related: ['liquidity', 'market-cap', 'day-trading', 'volatility'],
    tags: ['spread', 'transaction cost', 'market maker', 'limit order', 'slippage'],
    icon: 'ArrowLeftRight',
  },

  // ── METRIC ───────────────────────────────────────────────────────────────
  {
    id: 'sharpe',
    term: 'Sharpe Ratio',
    fullName: 'Sharpe Ratio',
    category: 'metric',
    difficulty: 'intermediate',
    definition:
      'The Sharpe Ratio, developed by Nobel laureate William F. Sharpe, measures the risk-adjusted return of an investment portfolio by dividing the excess return (portfolio return minus the risk-free rate, typically the 3-month US Treasury yield) by the portfolio\'s standard deviation of returns. A Sharpe Ratio above 1.0 is generally considered acceptable; above 2.0 is very good; and above 3.0 is exceptional. It allows investors to compare strategies that might have similar returns but very different volatility profiles—a strategy returning 15% with 5% standard deviation (Sharpe 2.0) is far superior to one returning 15% with 20% standard deviation (Sharpe 0.75) after accounting for the risk taken.',
    howToUse:
      'Use the Sharpe Ratio to compare your strategy against the S&P 500 (historically ~0.4-0.6) and against other strategies; seek to maximize Sharpe, not just raw returns, because higher volatility compounds less efficiently over time.',
    example:
      'Strategy A: 20% annual return, 15% standard deviation, risk-free rate 5%. Sharpe = (20−5)/15 = 1.0. Strategy B: 15% annual return, 5% standard deviation. Sharpe = (15-5)/5 = 2.0. Strategy B is better despite lower absolute returns.',
    related: ['alpha', 'max-drawdown', 'cagr', 'beta'],
    tags: ['risk-adjusted', 'volatility', 'performance', 'William Sharpe', 'standard deviation'],
    icon: 'BarChart2',
  },
  {
    id: 'alpha',
    term: 'Alpha',
    fullName: 'Alpha (Excess Return)',
    category: 'metric',
    difficulty: 'intermediate',
    definition:
      'Alpha measures the excess return of a portfolio or strategy above what would be predicted by its level of market risk (beta), relative to a benchmark index. A positive alpha of 3% means the portfolio outperformed its expected return by 3 percentage points after adjusting for risk, while a negative alpha indicates underperformance. Alpha is the core metric for evaluating whether an active manager or strategy is genuinely adding value versus simply taking on more risk. In practice, generating consistent positive alpha is extremely difficult since every alpha winner requires an alpha loser on the other side of the trade, and the average investor earns zero alpha before fees.',
    howToUse:
      'Use alpha to evaluate whether paying higher fees for an active manager is justified; if their alpha after fees is consistently negative, switching to a passive index fund is the rational choice.',
    example:
      'A fund with a beta of 1.2 in a year where the market gains 10% is "expected" to return 12% (1.2 × 10%). If the fund actually returns 16%, its alpha is +4%. If it returns 9%, its alpha is −3%, meaning it underperformed on a risk-adjusted basis despite the bull market.',
    related: ['beta', 'sharpe', 'cagr', 'annualized-return'],
    tags: ['excess return', 'CAPM', 'active management', 'outperformance', 'benchmark'],
    icon: 'Star',
  },
  {
    id: 'cagr',
    term: 'CAGR',
    fullName: 'Compound Annual Growth Rate',
    category: 'metric',
    difficulty: 'beginner',
    definition:
      'CAGR represents the rate at which an investment must grow each year, on a compounded basis, to reach its ending value from its starting value over a given time period. Unlike simple average annual returns (which can be misleading due to volatility), CAGR is the "smoothed" geometric return and accurately represents the investment\'s actual growth rate. Einstein purportedly called compound interest "the eighth wonder of the world"—CAGR captures exactly this compounding effect. For portfolio evaluation, CAGR is meaningful only when viewed alongside other metrics like maximum drawdown and Sharpe Ratio, since a high CAGR achieved through excessive risk may not be reproducible or sustainable.',
    howToUse:
      'Use CAGR to compare investments over the same time period, but always pair it with maximum drawdown and Sharpe Ratio to understand the risk required to achieve that growth rate.',
    example:
      'A portfolio grows from $10,000 to $20,000 over 7 years. CAGR = (20,000/10,000)^(1/7) − 1 = 2^(0.143) − 1 ≈ 10.4% per year. This means $10,000 compounded at 10.4% annually for 7 years equals $20,000.',
    related: ['annualized-return', 'sharpe', 'buy-hold', 'sp500'],
    tags: ['compound growth', 'performance', 'geometric return', 'annualized', 'compounding'],
    icon: 'TrendingUp',
  },
  {
    id: 'annualized-return',
    term: 'Ann. Return',
    fullName: 'Annualised Return',
    category: 'metric',
    difficulty: 'beginner',
    definition:
      'Annualised return converts a total investment return over any time period into an equivalent yearly rate, allowing fair comparison between investments of different durations. It is calculated by taking the total return and adjusting it to a one-year time horizon using geometric compounding. Unlike CAGR (which assumes a fixed start and end point), annualised return is more commonly used for strategies that have been running for non-integer numbers of years, or for reporting calendar-year performance. Reporting standards such as GIPS (Global Investment Performance Standards) require annualisation for multi-year periods to prevent managers from cherry-picking favorable shorter periods.',
    howToUse:
      'Use annualised returns when comparing funds or strategies of different ages; be aware that short track records (under 3 years) are heavily influenced by luck and market conditions, making annualised returns less meaningful than for longer periods.',
    example:
      'A strategy gains 50% over 3.5 years. Annualised return = (1 + 0.50)^(1/3.5) − 1 = 1.50^0.286 − 1 ≈ 12.3% per year. This allows fair comparison against a fund that reports its 1-year calendar return of 12%.',
    related: ['cagr', 'sharpe', 'alpha', 'buy-hold'],
    tags: ['performance', 'annual', 'compounding', 'comparison', 'GIPS'],
    icon: 'Percent',
  },

  // ── PSYCHOLOGY ───────────────────────────────────────────────────────────
  {
    id: 'loss-aversion',
    term: 'Loss Aversion',
    fullName: 'Loss Aversion Bias',
    category: 'psychology',
    difficulty: 'intermediate',
    definition:
      'Loss aversion is a cognitive bias, first formalized by Kahneman and Tversky in Prospect Theory (1979), which holds that the psychological pain of a loss is approximately twice as powerful as the pleasure of an equivalent gain. In investing, this manifests as holding losing positions far too long (hoping to "get back to even") while cutting winning positions too early (taking profits quickly to avoid giving them back). It also explains why investors panic-sell during market crashes—the pain of further losses overrides rational thinking about long-term returns. Loss aversion is considered one of the primary reasons retail investors consistently underperform the very funds they invest in.',
    howToUse:
      'Pre-commit to exit rules (stop-losses and take-profit targets) before entering a trade, so your emotionally neutral self makes the decision rather than your loss-averse self in the heat of the moment.',
    example:
      'An investor buys a stock at $100. It falls to $70. Rather than cutting the loss, they hold and tell themselves "it\'ll come back." The stock falls to $50. Loss aversion is causing them to hold a −50% loser while simultaneously feeling reluctant to buy a new stock at its current price because it might also "fall."',
    related: ['fomo', 'backtesting', 'stop-loss', 'max-drawdown'],
    tags: ['behavioral finance', 'Kahneman', 'Tversky', 'bias', 'cognitive'],
    icon: 'Brain',
  },
  {
    id: 'fomo',
    term: 'FOMO',
    fullName: 'Fear Of Missing Out',
    category: 'psychology',
    difficulty: 'beginner',
    definition:
      'FOMO in markets describes the anxiety-driven compulsion to buy an asset that has already risen sharply because investors fear they will miss additional gains, typically at exactly the wrong time near a peak. It is a form of herding behavior amplified by social media, financial news, and friends sharing investment gains. FOMO causes investors to abandon their strategies, buy assets at extended valuations, use excessive leverage, and ignore risk signals—all classic preconditions for significant losses. Historical examples of FOMO-driven bubbles include the dot-com boom (1999-2000), US housing (2005-2007), Bitcoin at $65,000 (2021), and meme stocks like GameStop (2021).',
    howToUse:
      'Maintain a consistent investment process and written trading rules you can review before entering any new trade; if your reason to buy is "everyone else is buying it," that is FOMO—not a strategy.',
    example:
      'GameStop (GME) surges 1,700% in January 2021. Retail investors flood in near the top, buying at $400+ driven by social media FOMO. The stock crashes back to $50 within weeks. Investors who bought based on FOMO rather than fundamentals or a defined strategy suffered catastrophic losses.',
    related: ['loss-aversion', 'momentum', 'bubble', 'volatility'],
    tags: ['behavioral finance', 'fear', 'herding', 'bubble', 'psychology'],
    icon: 'AlertCircle',
  },
];

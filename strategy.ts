//Created by Louis Barnes - Enquiries please email louis.barnes16@gmail.com
// THIS IS NOT FINANCIAL ADVICE
// This strategy is not for use in live markets, I accept no responsibility for lost funds - this is strictly for demonstration purposes only.

//@version=4
strategy("RangingBot v42", overlay=true, pyramiding = 3, max_labels_count=500, default_qty_type=strategy.percent_of_equity,
     default_qty_value=10, precision=2, initial_capital=100000)
strategy.risk.max_position_size(contracts=6)

//Inputs via the settings cog
//Lot Size
transaction_size = input(3, "Contract/Share Amount")
takeProfit_pct = input(title="First TP %", type=input.float, minval=0.0, step=0.1, defval=66.6)

//Risk Management
// Set stop loss level with input options (optional)
longLossPerc = input(title="Long Stop Loss (%)",
     type=input.float, minval=0.0, step=0.1, defval=3) * 0.01

shortLossPerc = input(title="Short Stop Loss (%)",
     type=input.float, minval=0.0, step=0.1, defval=3) * 0.01

// Determine stop loss prices
// Long position SL price calculations
longStopPrice  = strategy.position_avg_price * (1 - longLossPerc)
// Short position SL price calculations
shortStopPrice = strategy.position_avg_price * (1 + shortLossPerc)

// Determine take profit prices 
// Long position TP price calculations
longtakeProfit = strategy.position_avg_price * 1.01
// Short position TP price calculations
shorttakeProfit = strategy.position_avg_price / 1.01

// Configure trail stop level with input options (optional)
longTrailPerc = input(title="Trail Long Loss (%)",
     type=input.float, minval=0.0, step=0.1, defval=3) * 0.01

shortTrailPerc = input(title="Trail Short Loss (%)",
     type=input.float, minval=0.0, step=0.1, defval=3) * 0.01

// Determine trail stop loss prices (NOT ACTIVE)
//longStopPriceTrl = 0.0

//longStopPriceTrl := if (strategy.position_size > 0)
    //stopValue = close * (1 - longTrailPerc)
    //max(stopValue, longStopPriceTrl[1])
//else
    //0   
    
// Determine trailing short price (NOT ACTIVE)
//shortStopPriceTrl = 0.0

//shortStopPriceTrl := if (strategy.position_size < 0)
    //stopValue = close * (1 + shortTrailPerc)
    //min(stopValue, shortStopPriceTrl[1])
//else
    //999999

//DIOSC Multi TF Inputs
average = input("None")
len = input(14, title="DI Length")
avlength=input(8, title="DI Smoothing Length")
SMA = input(false, title="Show SMA Line?")
up = change(high)
down = -change(low)
truerange = rma(tr, len)
plus = fixnan(100 * rma(up > down and up > 0 ? up : 0, len) / truerange)
minus = fixnan(100 * rma(down > up and down > 0 ? down : 0, len) / truerange)
diosc=plus-minus
signal=sma(diosc,avlength)

//Multi Timeframe Inputs 
period1 = input(title="Period 1", type=input.resolution, defval="120")
period2 = input(title="Period 2", type=input.resolution, defval="240")
period3 = input(title="Period 3", type=input.resolution, defval="D")


//Stochastic
periodK = input(21, title="K", minval=1)
periodD = input(1, title="D", minval=1)
smoothK = input(1, title="Smooth", minval=1)
k = sma(stoch(close, high, low, periodK), smoothK)
d = sma(k, periodD)
stochUpperValue = input(60, title="K >= ")
stochLowerValue = input(40, title="K <= ")


//Spinning Top
stsize=input(1, minval=.1, title="Spinning Top Size")
spinningtop=(open>close) and ((high-low)>(3*(open-close))and(((high-open)/(.001+high-low))< stsize)and (((close-low)/(.001+high-low))< stsize)) or (close>open) and ((high-low)>(3*(close-open))and(((high-close)/(.001+high-low))< stsize)and (((open-low)/(.001+high-low))< stsize))

//Moving Averages
maOne = input(title="SMA Length One", type=input.integer, defval=4)
maTwo = input(title="SMA Length Two", type=input.integer, defval=9)
maThree = input(title="SMA Length Three", type=input.integer, defval=21)

//Bollinger Bands
maLen = input(title="SMA Length", type=input.integer, defval=5)
stdLen = input(title="StdDev Length", type=input.integer, defval=5)
offset = input(title="StdDev Offset", type=input.float, defval=2.0)

// Date and time inputs
startDate = input(title="Start Date", type=input.integer,
     defval=1, minval=1, maxval=31)
startMonth = input(title="Start Month", type=input.integer,
     defval=1, minval=1, maxval=12)
startYear = input(title="Start Year", type=input.integer,
     defval=2022, minval=1800, maxval=2100)
// Check date
afterStartDate = (time >= timestamp(syminfo.timezone,
     startYear, startMonth, startDate, 0, 0))

//EMA Cloud
// Plot the EMA cloud based on the 21 and 55 bar EMAs.
ema21 = ema(close, 21)
ema55 = ema(close, 55)
plot21EMA = plot(ema21, color=#00000055)
plot55EMA = plot(ema55, color=#00000055)
fill(plot21EMA, plot55EMA, color = ema21 > ema55 ? #26d06a55 : #f3313d55)
emaDiffBull = ema21-ema55
emaDiffBear = ema55-ema21

//Calculations

//Moving Averages
fourMa = sma(close, maOne)
nineMa = sma(close, maTwo)
twenOneMa = sma(close, maThree)

//Bollinger Bands
maValue = sma(close, maLen)
stdValue = stdev(close, stdLen)
upperBand = maValue + stdValue * offset
lowerBand = maValue - stdValue * offset

//EMA ribbon
showRibbon = input(title="Show Ribbon", type=input.bool, defval=false)
plot(showRibbon ? ema21 : na, "21 EMA", color=#ffffff55)
plot(showRibbon ? ema(close, 25) : na, "25 EMA", color=#ffffff55)
plot(showRibbon ? ema(close, 30) : na, "30 EMA", color=#ffffff55)
plot(showRibbon ? ema(close, 35) : na, "35 EMA", color=#ffffff55)
plot(showRibbon ? ema(close, 40) : na, "40 EMA", color=#ffffff55)
plot(showRibbon ? ema(close, 45) : na, "45 EMA", color=#ffffff55)
plot(showRibbon ? ema(close, 50) : na, "50 EMA", color=#ffffff55)
plot(showRibbon ? ema55 : na, "55 EMA", color=#ffffff55)


//MTF Logic
rp_security1(_symbol, _period1, _src) => security(_symbol, _period1, _src[1], lookahead=barmerge.lookahead_on)
rp_security2(_symbol, _period2, _src) => security(_symbol, _period2, _src[1], lookahead=barmerge.lookahead_on)
rp_security3(_symbol, _period3, _src) => security(_symbol, _period3, _src[1], lookahead=barmerge.lookahead_on)

s1 = rp_security1(syminfo.tickerid, period1, diosc)
s2 = rp_security2(syminfo.tickerid, period2, diosc)
s3 = rp_security3(syminfo.tickerid, period3, diosc)

ss1 = float(na)
ss2 = float(na)
ss3 = float(na)


if (average == "None")
    ss1 := s1
    ss2 := s2
    ss3 := s3
    

//Wick Extension

lowerBandExt = lowerBand - 60
upperBandExt = upperBand + 60


// input paraneters
treshold_level = input(title='treshold', type=input.float, defval=-0.1, minval=-0.1, maxval=0.5, step=0.01)

//Kalman filter calculation

p = ohlc4

value1 = 0.0
value2 = 0.0
klmf = 0.0

value1 := 0.2 * (p - p[1]) + 0.8 * nz(value1[1])
value2 := 0.1 * (high - low) + 0.8 * nz(value2[1])
lambda = abs(value1 / value2)

alpha = (-lambda * lambda + sqrt(lambda * lambda * lambda * lambda + 16 * lambda * lambda)) / 8
klmf := alpha * p + (1 - alpha) * nz(klmf[1])


// Calculateing the absolute value of the Kalman filter curve slope
klmf_diff = abs(klmf - klmf[1])

// Long term average of the Kalman filter slope
av_klmf_diff = 1.0 * ema(klmf_diff, 200)

// The Kalman filter slope minus the average slope (Decline from the average slope)
// This slope decline is divided by the average slope value to normalize it
normalized_slope_decline = (klmf_diff - av_klmf_diff) / av_klmf_diff

// Condition that defines the trend regime
// Slope declined from the average by not less than the given treshold value
trend_condition = normalized_slope_decline >= treshold_level

// Are the markets ranging? (PickPocketing)
isRanging = iff(((normalized_slope_decline <= 3) and (normalized_slope_decline >= -3) and (normalized_slope_decline != -0)), true, false) 


//*****************ENTRY LOGIC********************
longEntry = iff(((low < lowerBandExt) and (high < upperBand) and (ss1 < -5) and (close < maValue) and (isRanging == true)), true, false) and barstate.isconfirmed
shortEntry = iff(((high > upperBandExt) and (low > lowerBand) and (ss1 > 5) and (close > maValue) and (isRanging == true)), true, false) and barstate.isconfirmed

//*****************EXIT LOGIC*********************
longExit = iff(((close > maValue)), true, false) and barstate.isconfirmed
shortExit = iff(((close < maValue)), true, false) and barstate.isconfirmed


//Trade entries
if(afterStartDate and longEntry)
    strategy.entry("Long", strategy.long, qty=1, comment="ENTER-LONG_FTX_BTC-PERP_HIDDEN_IMFORMATION", alert_message="ENTER-LONG_FTX_BTC-PERP_HIDDEN_IMFORMATION" )
if(strategy.position_size > 0)
    strategy.exit("Long", stop=longStopPrice, comment="EXIT-LONG_FTX_BTC-PERP_HIDDEN_IMFORMATION", alert_message="EXIT-LONG_FTX_BTC-PERP_HIDDEN_IMFORMATION")
strategy.close("Long", when=longExit, comment="EXIT-LONG_FTX_BTC-PERP_HIDDEN_IMFORMATION", alert_message="EXIT-LONG_FTX_BTC-PERP_HIDDEN_IMFORMATION")

if(afterStartDate and shortEntry)
    strategy.entry("Short", strategy.short, qty=1, comment="ENTER-SHORT_FTX_BTC-PERP_HIDDEN_IMFORMATION", alert_message="ENTER-SHORT_FTX_BTC-PERP_HIDDEN_IMFORMATION")
if(strategy.position_size < 0)
    strategy.exit("Short", stop=shortStopPrice, comment="EXIT-SHORT_FTX_BTC-PERP_HIDDEN_IMFORMATION", alert_message="EXIT-SHORT_FTX_BTC-PERP_HIDDEN_IMFORMATION")
strategy.close("Short", when=shortExit, comment="EXIT-SHORT_FTX_BTC-PERP_HIDDEN_IMFORMATION", alert_message="EXIT-SHORT_FTX_BTC-PERP_HIDDEN_IMFORMATION")

    
//Visual Overlays For Charts
plot(upperBand)
plot(lowerBand)
plot(maValue)
//plotchar(spinningtop, title="Spinning Top", text='ST', color=#0000FF, char='+')
plot(ss1, color=color.red, title="P1")
//plot(ss2, color=color.blue, title="P2")
//plot(ss3, color=color.green, title="P3")
plot(ema21, color=color.black)

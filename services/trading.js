// Trade Execution via Alpaca
const Alpaca = require('@alpacahq/alpaca-trade-api');

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_KEY_ID,
  secretKey: process.env.ALPACA_SECRET_KEY,
  paper: true // Start with paper trading
});

// Get account info
async function getAccount() {
  return await alpaca.getAccount();
}

// Get positions
async function getPositions() {
  return await alpaca.getPositions();
}

// Place market order
async function placeOrder(symbol, qty, side) {
  return await alpaca.createOrder({
    symbol,
    qty,
    side, // 'buy' or 'sell'
    type: 'market',
    time_in_force: 'day'
  });
}

// Place limit order
async function placeLimitOrder(symbol, qty, side, limitPrice) {
  return await alpaca.createOrder({
    symbol,
    qty,
    side,
    type: 'limit',
    limit_price: limitPrice,
    time_in_force: 'gtc'
  });
}

// Place bracket order (entry + take profit + stop loss)
async function placeBracketOrder(symbol, qty, side, takeProfit, stopLoss) {
  return await alpaca.createOrder({
    symbol,
    qty,
    side,
    type: 'market',
    time_in_force: 'day',
    order_class: 'bracket',
    take_profit: { limit_price: takeProfit },
    stop_loss: { stop_price: stopLoss }
  });
}

// Cancel order
async function cancelOrder(orderId) {
  return await alpaca.cancelOrder(orderId);
}

// Get order history
async function getOrders(status = 'all') {
  return await alpaca.getOrders({ status });
}

module.exports = {
  getAccount,
  getPositions,
  placeOrder,
  placeLimitOrder,
  placeBracketOrder,
  cancelOrder,
  getOrders
};

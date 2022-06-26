const API_KEY = '0912e596d505c5629ad148ad41eec08ba0396a0037c9176a9f659c97379e4373';

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);
const tickerHandlers = new Map();

const AGGREGATE_INDEX = '5';
socket.addEventListener('message', e => {
    const { type: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data);
    if (type !== AGGREGATE_INDEX) {
        return;
    }
    const handlers = tickerHandlers.get(currency) ?? [];
    handlers.forEach(fn => fn(newPrice));
    console.log(e);
});

export const subscribeToTicker = (ticker, cb) => {
    const subscribers = tickerHandlers.get(ticker) || [];
    tickerHandlers.set(ticker, [...subscribers, cb]);
    subscribeToTickerOnWebSocket(ticker);
}

function subscribeToTickerOnWebSocket(ticker) {
    const message = {
        "action": "SubAdd",
        "subs": [`5~CCCAGG~${ticker}~USD`]
    };
    sendMessageOnWS(message);
}

export const unsubscribeFromTicker = (ticker) => {
    tickerHandlers.delete(ticker);
    unsubscribeToTickerOnWebSocket(ticker);
};

function unsubscribeToTickerOnWebSocket(ticker) {
    const message = {
        "action": "SubRemove",
        "subs": [`5~CCCAGG~${ticker}~USD`]
    };
    sendMessageOnWS(message);
}

function sendMessageOnWS(message) {
    const stringifyMessage = JSON.stringify(message);
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(stringifyMessage);
        return;
    }
    socket.addEventListener('open', () => socket.send(stringifyMessage), {once: true});

}

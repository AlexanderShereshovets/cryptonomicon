const API_KEY = '5cf63ae5c764afb4c17d6c94ed41b3711585cdbf5659cef7f4102f8b32242955';

const tickerHandlers = new Map();

const loadTickers = () => {
    if (tickerHandlers.size === 0) {
        return;
    }
    fetch(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickerHandlers.keys()].join(',')}&tsyms=USD&api_key=${API_KEY}`
    )
        .then(r => r.json())
        .then(rawData => {
            const updatedPrices = Object.fromEntries(
                    Object.entries(rawData).map(([key, value]) => [key, value.USD])
                );
            Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
                const handlers = tickerHandlers.get(currency) ?? [];
                handlers.forEach(fn => fn(newPrice));
            });
            }
        );

};


export const subscribeToTicker = (ticker, cb) => {
    const subscribers = tickerHandlers.get(ticker) || [];
    tickerHandlers.set(ticker, [...subscribers, cb]);
}

export const unsubscribeFromTicker = (ticker) => {
    tickerHandlers.delete(ticker);
};

setInterval(loadTickers, 5000);

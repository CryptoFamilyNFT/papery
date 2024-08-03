
// dshelper.ts
import axios from 'axios';

export interface IPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        symbol: string;
    };
    priceNative: string;
    priceUsd?: string;
    txns: {
        m5: {
            buys: number;
            sells: number;
        };
        h1: {
            buys: number;
            sells: number;
        };
        h6: {
            buys: number;
            sells: number;
        };
        h24: {
            buys: number;
            sells: number;
        };
    };
    volume: {
        m5: number;
        h1: number;
        h6: number;
        h24: number;
    };
    priceChange: {
        m5: number;
        h1: number;
        h6: number;
        h24: number;
    };
    liquidity?: {
        usd?: number;
        base: number;
        quote: number;
    };
    fdv?: number;
    pairCreatedAt?: number;
}


class DSHelper {
    private apiUrl: string;

    constructor(apiUrl: string = 'https://api.dexscreener.com/latest/dex/tokens') {
        this.apiUrl = apiUrl;
    }

    async getTokenInfo(tokenAddress: string): Promise<IPair[]> {
        try {
            const response = await axios.get(`${this.apiUrl}/${tokenAddress}`);
            if (response.status === 200) {
                return response.data.pairs as IPair[];
            }
            console.log(response)
            throw new Error('Failed to fetch data from Dexscreener');
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getPairInfo(pairId: string): Promise<IPair> {
        try {
            const response = await axios.get(`${this.apiUrl}/${pairId}`);
            if (response.status === 200) {
                return response.data.pair as IPair;
            }
            throw new Error('Failed to fetch data from Dexscreener');
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export default DSHelper;

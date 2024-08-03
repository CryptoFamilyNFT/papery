

export default class AddressFactory {
    static getDeployerAddress(chainId: Number): string {
        switch (chainId) {
            case 102:
                return "0xa804dfE4b06607F379e0a788c856f1eDDA9B65C2"; // Mainnet
            case 5:
            case 11155111:
                return "0x91fFA8d015C7EF56820383699781526D8D5b4AD3"; //Testnet SEPOLIA
            default:
                return "";
        }
    }

    static getTokenAddress(chainId: Number): string {
        switch (chainId) {
            case 102:
                return "9KRXddfHPTjqHmbNSStvzPTbWQyp8JJocofXJNeXpump";
            case 5:
            case 11155111: //
                return "9KRXddfHPTjqHmbNSStvzPTbWQyp8JJocofXJNeXpump";
            default:
                return "";
        }
    }

    static getSolEp(isDev: boolean): string {
        switch (isDev) {
            case true:
                return "http://localhost:5000";
            case false: //
                return "0x8Ffe184421FB9855C20c6be9CaF63508FaedF631";
            default:
                return "";
        }
    }

    static getEthercode(chainId?: Number): string {
        switch (chainId) {
            case 102:
                return "0x22C01fAC53145DC1596989876affD874e9DaAc9D";
            case 5:
            case 11155111: //
                return "0x8Ffe184421FB9855C20c6be9CaF63508FaedF631";
            default:
                return "0x91fFA8d015C7EF56820383699781526D8D5b4AD3";
        }
    }

    static getRouterV2(chainId: Number): string {
        switch (chainId) {
            case 102:
                return "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506";
            case 5:
            case 11155111: //
                return "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";
            default:
                return "";
        }
    }

    static getPair(chainId: Number): string {
        switch (chainId) {
            case 102:
                return "0xC3Fcb7A38ec33e743c0F2c75E648BA28f8AD8Bfe";
            case 5:
            case 11155111:
                return "0xC3Fcb7A38ec33e743c0F2c75E648BA28f8AD8Bfe";
            default:
                return "";
        }
    }

    static getFactory(chainId: Number): string {
        switch (chainId) {
            case 102:
                return "0x35029F03602454A6149b353dd8d227c4f2D99B7c";
            case 5:
            case 11155111:
                return "0x7E0987E5b3a30e3f2828572Bb659A548460a3003";
            default:
                return "";
        }
    }

    static getWETH(chainId: Number): string {
        switch (chainId) {
            case 102:
                return "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
            case 5:
            case 11155111: //
                return "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
            default:
                return "";
        }
    }

    static getStaking(chainId: number): string {
        switch (chainId) {
            case 102:
                return '0xDB811Ea3c0d9c7D0380Ce429d08dCB4877b46e64'; //arb
            case 11155111:
                return '0x7a4Feb59993bf601bE00d3de8C510FfA8bd71300';
            default:
                return '0x7a4Feb59993bf601bE00d3de8C510FfA8bd71300';
        }
    }

    static getWooStakingLocal(chainId: number): string {
        switch (chainId) {
            case 102:
                return "0x2CFa72E7f58dc82B990529450Ffa83791db7d8e2";
            case 11155111:
                return "";
            default:
                return "";
        }
    }

    static getWooSuperChargerVault(chainId: number): string {
        switch (chainId) {
            case 102:
                return "0xba452bCc4BC52AF2fe1190e7e1dBE267ad1C2d08";
            case 11155111:
                return "";
            default:
                return "";
        }
    }

    static getFactoriesAddress(chainId: number): string {
        switch (chainId) {
            case 102:
                return "0x35029F03602454A6149b353dd8d227c4f2D99B7c";
            case 11155111:
                return "0x3aa397a3eFE14506aE615354d17E353F14cc9F3f";
            default:
                return "";
        }
    }

    static getRpcUrl(chainId: Number | undefined): string | undefined {
        switch (chainId) {
            case 102:
                return 'https://arb1.arbitrum.io/rpc';
            case 11155111:
                return 'https://eth-sepolia.g.alchemy.com/v2/d9hHRJdy6salX7wZ8wyrmrT5aTiYwhwO';
            default:
                return 'https://arb1.arbitrum.io/rpc';
        }
    }

    static formatAddress(address: string): string {
        return address && address.length > 20 ? `${address.substring(0, 7)}...${address.substring(address.length - 5)}` : '';
    }
}
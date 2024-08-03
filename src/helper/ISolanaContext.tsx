import { ILink } from "../entities/ILink";
import { IPool } from "../entities/IPool";
import { IPoolKey } from "../entities/IPoolKey";
import { IPrice } from "../entities/IPrice";
import { IToast } from "../entities/IToast";
import { IUser } from "../entities/IUser";

export interface ISolanaContext extends IUser, ILink, IToast, IPrice, IPool, IPoolKey {
    loaded: boolean;
    reload: boolean;
}

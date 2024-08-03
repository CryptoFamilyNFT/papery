import { ISolanaContext } from "./ISolanaContext";

export type SolanaContextRepository = {
    context: ISolanaContext;
    saveContext: (context: ISolanaContext) => void;
};

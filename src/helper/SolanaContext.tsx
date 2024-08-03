import React from "react";
import { SolanaContextRepository } from "./SolanaContextRepository";

export const SolanaContext = React.createContext<SolanaContextRepository | null>(null);
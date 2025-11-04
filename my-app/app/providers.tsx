"use client";

import React, { ReactNode } from "react";
import WalletContextProvider from "../lib/wallet";

export default function Providers({ children }: { children: ReactNode }) {
	return <WalletContextProvider>{children}</WalletContextProvider>;
}



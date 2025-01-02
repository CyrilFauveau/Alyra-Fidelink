'use client';
import { useAccount, useReadContract } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";

const DisplayBalance = () => {

    const { address } = useAccount();

    const { data: balance, isBalanceLoading, balanceError } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "balanceOf",
        args: [address],
        enabled: !!address,
    });

    const { data: symbol, isSymbolLoading, symbolError } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "symbol",
        enabled: !!address,
    });

    return (
        <>
            {
                (balance != undefined) ? (
                    <p>Balance: {balance.toString()} {symbol} = {(Number(balance) / 10).toFixed(2)} EUR</p>
                ) : (
                    <p>Impossible de récupérer la balance</p>
                )
            }
        </>
    );
}

export default DisplayBalance;
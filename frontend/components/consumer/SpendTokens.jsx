import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const SpendTokens = () => {

    const { address } = useAccount();
    const { toast } = useToast();
    const [merchantAddress, setMerchantAddress] = useState("");
    const [tokenAmount, setTokenAmount] = useState("");

    const { data: hash, isPending, error, writeContract } = useWriteContract();

    const spendTokens = async () => {
        if (merchantAddress.trim() === "") {
            toast({
                title: "Error",
                description: "Please use valid Ethereum address",
                className: "bg-red-600",
            });
            return;
        }

        try {
            writeContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: "spendTokens",
                args: [merchantAddress, tokenAmount],
                account: address,
            });
        } catch (e) {
            console.error(e);
            toast({
                title: "Error",
                description: "An error occurred during transaction",
                className: "bg-red-600",
            });
        }
    };

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isConfirmed) {
            toast({
                title: "Success",
                description: "Les tokens ont été enoyés à l'adresse ${consumerAddress}.",
                className: "bg-green-600",
            });
            setMerchantAddress("");
            setTokenAmount("");
        }
    }, [isConfirmed]);

    return (
        <>
            <h2 className="mt-5 font-bold">Dépenser des tokens</h2>

            <div className="flex gap-5">
                <Input
                    className="mt-5 w-3/12"
                    placeholder="Adresse du commerçant"
                    value={merchantAddress}
                    onChange={(e) => setMerchantAddress(e.target.value)}
                />

                <Input
                    className="mt-5 w-1/12"
                    placeholder="Nombre de tokens"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                />

                <Button
                    className="mt-5"
                    onClick={spendTokens}
                    disabled={isPending || isConfirming}
                >
                    {isPending || isConfirming ? "Envoi..." : "Envoyer"}
                </Button>
            </div>

            {error && (
                <Alert className="mt-5 w-3/12">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}

            {isConfirmed && (
                <Alert className="mt-5  w-3/12">
                    <AlertTitle>Succès</AlertTitle>
                    <AlertDescription>Les tokens ont été envoyés avec succès !</AlertDescription>
                </Alert>
            )}
        </>
    );
}

export default SpendTokens;
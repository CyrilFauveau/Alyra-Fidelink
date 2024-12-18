import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const MintTokens = () => {

    const { address } = useAccount();
    const { toast } = useToast();
    const [consumerAddress, setConsumerAddress] = useState("");
    const [tokenAmount, setTokenAmount] = useState("");

    const { data: hash, isPending, error, writeContract } = useWriteContract();

    const mintTokens = async () => {
        if (consumerAddress.trim() === "") {
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
                functionName: "mintTokens",
                args: [consumerAddress, tokenAmount],
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
                description: "Les tokens ont été mint à l'adresse ${consumerAddress}.",
                className: "bg-green-600",
            });
            setConsumerAddress("");
            setTokenAmount("");
        }
    }, [isConfirmed]);

    return (
        <>
            <h2 className="mt-5">Mint</h2>

            <Input
                className="mt-5"
                placeholder="Adresse du consommateur"
                value={consumerAddress}
                onChange={(e) => setConsumerAddress(e.target.value)}
            />

            <Input
                className="mt-5"
                placeholder="Nombre de tokens"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
            />

            <Button
                className="mt-5"
                onClick={mintTokens}
                disabled={isPending || isConfirming}
            >
                {isPending || isConfirming ? "Minting..." : "Mint"}
            </Button>

            {error && (
                <Alert className="mt-5">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}

            {isConfirmed && (
                <Alert className="mt-5">
                    <AlertTitle>Succès</AlertTitle>
                    <AlertDescription>Les tokens ont été minted avec succès !</AlertDescription>
                </Alert>
            )}
        </>
    );
}

export default MintTokens;
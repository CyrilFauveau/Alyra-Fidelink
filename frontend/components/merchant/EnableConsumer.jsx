import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const EnableConsumer = () => {

    const { address } = useAccount();
    const { toast } = useToast();
    const [consumerAddress, setConsumerAddress] = useState("");

    const { data: hash, isPending, error, writeContract } = useWriteContract();

    const EnableConsumer = async () => {
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
                functionName: "enableConsumer",
                args: [consumerAddress],
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
                description: "Le consommateur ${consumerAddress} a été réactivé avec succès.",
                className: "bg-green-600",
            });
            setConsumerAddress("");
        }
    }, [isConfirmed]);

    return (
        <>
            <h2 className="mt-5">Réactiver un consommateur</h2>

            <Input
                className="mt-5"
                placeholder="Addresse du consommateur"
                value={consumerAddress}
                onChange={(e) => setConsumerAddress(e.target.value)}
            />

            <Button
                className="mt-5"
                onClick={EnableConsumer}
                disabled={isPending || isConfirming}
            >
                {isPending || isConfirming ? "Réactivation..." : "Réactiver"}
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
                    <AlertDescription>Le consommateur à été réactivé avec succès !</AlertDescription>
                </Alert>
            )}
        </>
    );
}

export default EnableConsumer;
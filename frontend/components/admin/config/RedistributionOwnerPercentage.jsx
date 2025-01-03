import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

const RedistributionOwnerPercentage = () => {

    const { address } = useAccount();
    const { toast } = useToast();

    const { data: redistributionOwnerPercentage, isLoading, error } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getRedistributionOwnerPercentage",
    });

    const [newRedistributionOwnerPercentage, setNewRedistributionOwnerPercentage] = useState("");
    const { data: hash, isPending, isError, writeContract } = useWriteContract();

    const setRedistributionOwnerPercentage = async () => {
        try {
            writeContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: "setRedistributionOwnerPercentage",
                args: [newRedistributionOwnerPercentage],
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
                description: "La variable a été modifié avec succès.",
                className: "bg-green-600",
            });
            setNewRedistributionOwnerPercentage("");
        }
    }, [isConfirmed]);

    return (
        <>
            <div className="flex gap-5 mt-2">
                <p className="content-center">REDISTRIBUTION_OWNER_PERCENTAGE: {redistributionOwnerPercentage}%</p>

                <Input
                    className="w-4/12"
                    placeholder="Nouveau pourcentage"
                    value={newRedistributionOwnerPercentage}
                    onChange={(e) => setNewRedistributionOwnerPercentage(e.target.value)}
                />

                <Button
                    onClick={setRedistributionOwnerPercentage}
                    disabled={isPending || isConfirming}
                >
                    {isPending || isConfirming ? "Modification..." : "Modifier"}
                </Button>
            </div>

            {error && (
                <Alert className="mt-5 w-3/12">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}

            {isConfirmed && (
                <Alert className="mt-5 w-3/12">
                    <AlertTitle>Succès</AlertTitle>
                    <AlertDescription>La variable à été modifié avec succès !</AlertDescription>
                </Alert>
            )}
        </>
    );
}

export default RedistributionOwnerPercentage;
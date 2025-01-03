import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

const ExpirationMerchantPercentage = () => {

    const { address } = useAccount();
    const { toast } = useToast();

    const { data: expirationMerchantPercentage, isLoading, error } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getExpirationMerchantPercentage",
    });

    const [newExpirationMerchantPercentage, setNewExpirationMerchantPercentage] = useState("");
    const { data: hash, isPending, isError, writeContract } = useWriteContract();

    const setExpirationMerchantPercentage = async () => {
        try {
            writeContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: "setExpirationMerchantPercentage",
                args: [newExpirationMerchantPercentage],
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
            setNewExpirationMerchantPercentage("");
        }
    }, [isConfirmed]);

    return (
        <>
            <div className="flex gap-5 mt-2">
                <p className="content-center">EXPIRATION_MERCHANT_PERCENTAGE: {expirationMerchantPercentage}%</p>

                <Input
                    className="w-2/12"
                    placeholder="Nouveau pourcentage"
                    value={newExpirationMerchantPercentage}
                    onChange={(e) => setNewExpirationMerchantPercentage(e.target.value)}
                />

                <Button
                    onClick={setExpirationMerchantPercentage}
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

export default ExpirationMerchantPercentage;
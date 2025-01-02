import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const EnableMerchant = () => {

    const { address } = useAccount();
    const { toast } = useToast();
    const [merchantAddress, setMerchantAddress] = useState("");

    const { data: hash, isPending, error, writeContract } = useWriteContract();

    const enableMerchant = async () => {
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
                functionName: "enableMerchant",
                args: [merchantAddress],
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
                description: "Le commerçant ${merchantAddress} a été réactivé avec succès.",
                className: "bg-green-600",
            });
            setMerchantAddress("");
        }
    }, [isConfirmed]);

    return (
        <>
            <div className="flex gap-5">
                <Input
                    className="mt-5 w-3/12"
                    placeholder="Addresse du commerçant"
                    value={merchantAddress}
                    onChange={(e) => setMerchantAddress(e.target.value)}
                />

                <Button
                    className="mt-5"
                    onClick={enableMerchant}
                    disabled={isPending || isConfirming}
                >
                    {isPending || isConfirming ? "Réactivation..." : "Réactiver"}
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
                    <AlertDescription>Le marchant à été réactivé avec succès !</AlertDescription>
                </Alert>
            )}
        </>
    );
}

export default EnableMerchant;
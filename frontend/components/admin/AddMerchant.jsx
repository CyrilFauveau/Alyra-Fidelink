import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const AddMerchant = () => {

    const { address } = useAccount();
    const { toast } = useToast();
    const [merchantAddress, setMerchantAddress] = useState("");
    const [name, setName] = useState("");

    const { data: hash, isPending, error, writeContract } = useWriteContract();

    const addMerchant = async () => {
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
                functionName: "addMerchant",
                args: [merchantAddress, name],
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
                description: "L'adresse ${merchantAddress} a été ajouté en tant que commerçant.",
                className: "bg-green-600",
            });
            setMerchantAddress("");
            setName("");
        }
    }, [isConfirmed]);

    return (
        <>
            <h2 className="mt-10 font-bold">Ajouter un commerçant</h2>

            <div className="flex gap-5">
                <Input
                    className="mt-5 w-2/12"
                    placeholder="Nom du commerçant"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <Input
                    className="mt-5 w-3/12"
                    placeholder="Addresse du commerçant"
                    value={merchantAddress}
                    onChange={(e) => setMerchantAddress(e.target.value)}
                />

                <Button
                    className="mt-5 bg-blue-700 hover:bg-blue-600"
                    onClick={addMerchant}
                    disabled={isPending || isConfirming}
                >
                    {isPending || isConfirming ? "Ajout..." : "Ajouter"}
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
                    <AlertDescription>Le marchant à été ajouté avec succès !</AlertDescription>
                </Alert>
            )}
        </>
    );
}

export default AddMerchant;
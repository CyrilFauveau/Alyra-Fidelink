import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const GetMerchant = () => {
    const { address } = useAccount();
    const [merchantAddress, setMerchantAddress] = useState("");
    const [merchantData, setMerchantData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { refetch } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getMerchant",
        args: [merchantAddress],
        account: address,
        enabled: false,
    });

    const handleFetch = async () => {
        setError(null);
        setMerchantData(null);
        if (!merchantAddress) {
            setError("Please use valid Ethereum address");
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await refetch();
            setMerchantData(data);
        } catch (e) {
            setError(e.message || "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="mt-10 font-bold">Récupérer un commerçant</h2>

            <div className="flex gap-5 mt-5">
                <Input
                    className="w-6/12"
                    placeholder="Adresse du commerçant"
                    value={merchantAddress}
                    onChange={(e) => setMerchantAddress(e.target.value)}
                />

                <Button
                    onClick={handleFetch}
                    disabled={isLoading}
                >
                    {isLoading ? "Recherche..." : "Rechercher"}
                </Button>
            </div>

            {error && (
                <Alert className="mt-5 w-6/12">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {merchantData && (
                <Alert className="mt-5 w-6/12">
                    <AlertTitle>Informations</AlertTitle>
                    <AlertDescription>
                        <p>Nom: {merchantData.name}</p>
                        <p>Inscrit: {merchantData.hasBeenRegistered ? "Oui" : "Non"}</p>
                        <p>Actif: {merchantData.isActive ? "Oui" : "Non"}</p>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default GetMerchant;
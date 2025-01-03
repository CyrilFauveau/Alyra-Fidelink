import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const GetConsumer = () => {
    const { address } = useAccount();
    const [consumerAddress, setConsumerAddress] = useState("");
    const [consumerData, setConsumerData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { refetch } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getConsumer",
        args: [consumerAddress],
        account: address,
        enabled: false,
    });

    const handleFetch = async () => {
        setError(null);
        setConsumerData(null);
        if (!consumerAddress) {
            setError("Please use valid Ethereum address");
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await refetch();
            setConsumerData(data);
        } catch (e) {
            setError(e.message || "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="mt-10 font-bold">Récupérer un consommateur</h2>

            <div className="flex gap-5 mt-5">
                <Input
                    className="w-6/12"
                    placeholder="Adresse du consommateur"
                    value={consumerAddress}
                    onChange={(e) => setConsumerAddress(e.target.value)}
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

            {consumerData && (
                <Alert className="mt-5 w-6/12">
                    <AlertTitle>Informations</AlertTitle>
                    <AlertDescription>
                        <p>Inscrit: {consumerData.hasBeenRegistered ? "Oui" : "Non"}</p>
                        <p>Actif: {consumerData.isActive ? "Oui" : "Non"}</p>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default GetConsumer;
import { useAccount, useReadContract } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";

const GetBalanceByMerchant = () => {

    const { address } = useAccount();

    const { data: balance, isBalanceLoading, balanceError } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getBalanceByMerchant",
        account: address,
    });

    return (
        <>
            <h2 className="mt-10 font-bold">Mes points de fidélité</h2>
            
            {balance && (
                <table className="mt-5">
                    <thead>
                        <tr>
                            <th className="border p-1 pl-5 pr-5 text-center">Commerçant</th>
                            <th className="border p-1 pl-5 pr-5 text-center">Points de fidélité</th>
                            <th className="border p-1 pl-5 pr-5 text-center">Valeur</th>
                        </tr>
                    </thead>

                    <tbody>
                        {balance[0].map((merchant, index) => (
                            <tr key={merchant}>
                                <td className="border p-1 pl-5 pr-5 text-center">{merchant}</td>
                                <td className="border p-1 pl-5 pr-5 text-center">{balance[1][index]?.toString() || 0} FDL</td>
                                <td className="border p-1 pl-5 pr-5 text-center">{(Number(balance[1][index]) / 10)} EUR</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {balanceError && (
                <Alert className="mt-5 w-3/12">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}

            {isBalanceLoading && (
                <Alert className="mt-5 w-3/12">
                    <AlertTitle>Succès</AlertTitle>
                    <AlertDescription>Balances en cours de chargement ...</AlertDescription>
                </Alert>
            )}
        </>
    );
}

export default GetBalanceByMerchant;
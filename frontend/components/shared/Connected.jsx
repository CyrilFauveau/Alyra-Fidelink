import { useAccount, useReadContract } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { Terminal } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import AdminLayout from "@/components/admin/AdminLayout";
import MerchantLayout from "@/components/merchant/MerchantLayout";
import ConsumerLayout from "@/components/consumer/ConsumerLayout";

const Connected = () => {

  const { address } = useAccount();

  const { data: owner, isOwnerLoading, ownerError } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "owner",
    enabled: !!address,
  });
  
  const { data: merchant, isMerchantLoading, merchantError } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "merchants",
    args: [address],
    enabled: !!address,
  });
  
  const { data: consumer, isConsumerLoading, consumerError } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "consumers",
    args: [address],
    enabled: !!address,
  });

  if (isOwnerLoading || isMerchantLoading || isConsumerLoading) return <p>Chargement...</p>;
  if (ownerError || merchantError || consumerError) return <p>Erreur lors de la récupération des données de votre compte.</p>;

  const merchantData = merchant || { hasBeenRegistered: false };
  const consumerData = consumer || { hasBeenRegistered: false };

  return (
    <>
      {(owner === address) ? (
        <AdminLayout />
      ) : (merchantData[2]) ? (
        <MerchantLayout />
      ) : (consumerData[1]) ? (
        <ConsumerLayout />
      ) : (
        <Alert className="bg-[#F29F05]">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
                Vous n'avez pas de compte sur cette application.
            </AlertDescription>
        </Alert>
      )}
    </>
  );
}

export default Connected;
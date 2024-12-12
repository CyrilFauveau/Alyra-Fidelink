import { contractAddress, contractAbi } from "@/constants";
import { useAccount, useReadContract } from "wagmi";

const Connected = () => {

  const { address } = useAccount();

  const { data: owner, isOwnerLoading, ownerError } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "owner",
    enabled: true,
  });

  return (
    <>
      {(owner == address) ? (
        <p>Vous êtes administrateur</p>
      ) : (
        <p>Vous n'êtes pas administrateur</p>
      )}
    </>
  );
}

export default Connected;
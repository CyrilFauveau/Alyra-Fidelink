'use client';
import Connected from "@/components/shared/Connected";
import NotConnected from "@/components/shared/NotConnected";
import { useAccount } from "wagmi";

export default function Home({ children }) {

  const { isConnected } = useAccount();

  return (
    <>
      {isConnected ? (
        <Connected />
      ) : (
        <NotConnected />
      )}
    </>
  );
}
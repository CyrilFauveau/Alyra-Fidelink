import { ConnectButton } from "@rainbow-me/rainbowkit";
import DisplayBalance from "./DisplayBalance";

const Header = () => {
  return (
    <div className="flex justify-between items-center w-full p-5">
        <div className="text-2xl ml-5">FIDELINK</div>
        <div className="flex justify-between items-center gap-x-5">
          <DisplayBalance />
          <ConnectButton />
        </div>
    </div>
  );
}

export default Header;
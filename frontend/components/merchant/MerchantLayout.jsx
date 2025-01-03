import AddConsumer from "./AddConsumer";
import DisableConsumer from "./DisableConsumer";
import EnableMerchant from "./EnableConsumer";
import MintTokens from "./MintTokens";
import GetConsumer from "../shared/GetConsumer";

const MerchantLayout = () => {
    return (
        <>
            <div className="flex gap-10">
                <div className="w-6/12">
                    <AddConsumer />

                    <h2 className="mt-10 font-bold">Désactiver / Réactiver un consommateur</h2>
                    <DisableConsumer />
                    <EnableMerchant />

                    <GetConsumer />
                </div>
                <div className="w-6/12">
                    <MintTokens />
                </div>
            </div>
        </>
    );
}

export default MerchantLayout;
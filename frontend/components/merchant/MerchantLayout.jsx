import AddConsumer from "./AddConsumer";
import DisableConsumer from "./DisableConsumer";
import EnableMerchant from "./EnableConsumer";
import MintTokens from "./MintTokens";

const MerchantLayout = () => {
    return (
        <>
            <AddConsumer />

            <h2 className="mt-10">Désactiver / Réactiver un consommateur</h2>
            <DisableConsumer />
            <EnableMerchant />

            <MintTokens />
        </>
    );
}

export default MerchantLayout;
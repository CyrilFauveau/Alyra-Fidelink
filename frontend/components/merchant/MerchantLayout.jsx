import AddConsumer from "./AddConsumer";
import DisableConsumer from "./DisableConsumer";
import EnableMerchant from "./EnableConsumer";
import MintTokens from "./MintTokens";

const MerchantLayout = () => {
    return (
        <>
            <AddConsumer />
            <DisableConsumer />
            <EnableMerchant />
            <MintTokens />
        </>
    );
}

export default MerchantLayout;
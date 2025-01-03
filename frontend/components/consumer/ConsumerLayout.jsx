import GetBalanceByMerchant from "./GetBalanceByMerchant";
import SpendTokens from "./SpendTokens";

const ConsumerLayout = () => {
    return (
        <>
            <SpendTokens />
            <GetBalanceByMerchant />
        </>
    );
}

export default ConsumerLayout;
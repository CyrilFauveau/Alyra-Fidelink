import ExpirationDuration from "./config/ExpirationDuration";
import ExpirationOwnerPercentage from "./config/ExpirationOwnerPercentage";
import ExpirationMerchantPercentage from "./config/ExpirationMerchantPercentage";
import RedistributionOwnerPercentage from "./config/RedistributionOwnerPercentage";
import RedistributionMerchantPercentage from "./config/RedistributionMerchantPercentage";

const EditConfig = () => {

    return (
        <>
            <h2 className="mt-10 mb-5 font-bold">Configuration</h2>
        
            <ExpirationDuration />
            <ExpirationOwnerPercentage />
            <ExpirationMerchantPercentage />
            <RedistributionOwnerPercentage />
            <RedistributionMerchantPercentage />
        </>
    );
}

export default EditConfig;
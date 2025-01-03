import AddMerchant from "./AddMerchant";
import DisableMerchant from "./DisableMerchant";
import EnableMerchant from "./EnableMerchant";
import GetMerchant from "./GetMerchant";
import GetConsumer from "../shared/GetConsumer";
import EditConfig from "./EditConfig";

const AdminLayout = () => {
  return (
    <>
      <div className="flex gap-10">
        <div className="w-6/12">
          <AddMerchant />

          <h2 className="mt-10 font-bold">Désactiver / Réactiver un commerçant</h2>
          <DisableMerchant />
          <EnableMerchant />

          <GetMerchant />
          <GetConsumer />
        </div>

        <div className="w-6/12">
          <EditConfig />
        </div>
      </div>
    </>
  );
}

export default AdminLayout;
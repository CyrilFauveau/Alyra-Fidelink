import EditConfig from "./EditConfig";
import AddMerchant from "./AddMerchant";
import DisableMerchant from "./DisableMerchant";
import EnableMerchant from "./EnableMerchant";

const AdminLayout = () => {
  return (
      <>
          <EditConfig />

          <AddMerchant />

          <h2 className="mt-10 font-bold">Désactiver / Réactiver un commerçant</h2>
          <DisableMerchant />
          <EnableMerchant />
      </>
  );
}

export default AdminLayout;
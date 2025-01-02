import AddMerchant from "./AddMerchant";
import DisableMerchant from "./DisableMerchant";
import EnableMerchant from "./EnableMerchant";

const AdminLayout = () => {
  return (
      <>
          <AddMerchant />

          <h2 className="mt-10">Désactiver / Réactiver un commerçant</h2>
          <DisableMerchant />
          <EnableMerchant />
      </>
  );
}

export default AdminLayout;
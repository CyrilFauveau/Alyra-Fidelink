import AddMerchant from "./AddMerchant";
import DisableMerchant from "./DisableMerchant";
import EnableMerchant from "./EnableMerchant";

const AdminLayout = () => {
  return (
      <>
          <AddMerchant />
          <DisableMerchant />
          <EnableMerchant />
      </>
  );
}

export default AdminLayout;
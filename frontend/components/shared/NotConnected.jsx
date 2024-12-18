import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const NotConnected = () => {
  return (
    <Alert className="bg-[#F29F05]">
      <Terminal className="h-4 w-4" />
      <AlertTitle>Attention</AlertTitle>
      <AlertDescription>
        Veuillez connecter votre portefeuille.
      </AlertDescription>
    </Alert>
  );
}

export default NotConnected;
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const NotConnected = () => {
  return (
    <div className="h-full flex justify-center items-center w-full">
        <Alert className="bg-[#F29F05]">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
                Veuillez connecter votre portefeuille.
            </AlertDescription>
        </Alert>
    </div>
  );
}

export default NotConnected;
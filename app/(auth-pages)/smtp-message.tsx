import { ArrowUpRight, InfoIcon } from "lucide-react";
import { signInAnonymously } from "../actions"

export function SmtpMessage() {
  return (
    <div className="bg-muted/50 px-5 py-3 border rounded-md flex gap-4">
      <InfoIcon size={16} className="mt-0.5" />
      <div className="flex flex-col text-sm gap-2">
        Convidado está habilitado<br/> apenas como <strong>read-only</strong>
        <button 
          onClick={signInAnonymously}
          className="text-primary/50 hover:text-primary hover:text-blue-600 flex items-center text-sm gap-1"
        >
          Entrar como convidado <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}

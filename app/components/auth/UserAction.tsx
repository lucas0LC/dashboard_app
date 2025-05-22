import { createClient } from "../../lib/utils/supabase/server";
import { signOutAction } from "../../actions"
import Link from "next/link";

export default async function AuthButton() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  return user ? (
    <div className="flex items-center gap-4 text-white">
      Hey, {user.email}!
      <form action={signOutAction}>
        <button>
          Sair
        </button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2 text-white">
      <button>
        <Link href="/sign-in">Sign in</Link>
      </button>
    </div>
  );
}
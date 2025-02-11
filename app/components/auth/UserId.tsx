import { createClient } from "../../lib/utils/supabase/server";
import { signOutAction } from "../../actions"
import Link from "next/link";

export default async function AuthButton() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <form action={signOutAction}>
        <button>
          Sign out
        </button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <button>
        <Link href="/sign-in">Sign in</Link>
      </button>
      <button>
        <Link href="/sign-up">Sign up</Link>
      </button>
    </div>
  );
}
import { createClient } from "../../lib/utils/supabase/server";
import { EmailOtpType } from "@supabase/supabase-js/dist/module";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest) {
    const { searchParams, origin} = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const redirectUrl = searchParams.get('redirect_to') ?? '/';

    if (token_hash && type){
        const supabase = await createClient();
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash
        });

        if(!error) {
            return NextResponse.redirect(redirectUrl)
        }
    } return NextResponse.redirect(`${origin}/error`)
    
}
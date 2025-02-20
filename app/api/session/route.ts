import {getSession} from "@/utlis/session"
import { NextResponse } from "next/server"
export const dynamic = "auto";
export async function GET(){
    const session = await getSession()

    if(session) NextResponse.json({isAuthenticated:true})
    else{
return NextResponse.json({isAuthenticated:false},{status:401})
}
}
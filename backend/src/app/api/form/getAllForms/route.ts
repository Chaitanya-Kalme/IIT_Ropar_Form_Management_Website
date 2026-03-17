import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest){
    try {
        const allForms = await prisma.form.findMany()

        return NextResponse.json({
            success: true,
            message: "Forms fetched successfully",
            data: allForms
        })
        
    } catch (error:any) {
        console.log(error)
        return NextResponse.json({
            success: false,
            message: error.message
        })
        
    }
}
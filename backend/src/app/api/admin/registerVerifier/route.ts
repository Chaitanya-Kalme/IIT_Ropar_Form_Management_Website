import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "../../../../../generated/prisma/enums";


export async function POST(req: NextRequest) {
    try {

        // Check that the admin is logged in or not.
        const session = await getServerSession()

        if (!session || session.user?.role !== "Admin") {
            return NextResponse.json({
                success: false,
                message: "Admin is not logged in"
            }, { status: 400 })
        }



        const { memberName, email, mobileNo, department, role } = await req.json()

        if (!memberName || !email || !mobileNo || !department || !role) {
            return NextResponse.json({
                success: false,
                message: "All fields are required"
            }, { status: 404 })
        }

        // Check that the user already exist in the verifier model or not. 
        const isUserExist = await prisma.verifier.findFirst({
            where: {
                email: email
            }
        })

        if (isUserExist) {
            return NextResponse.json({
                success: false,
                message: "User already exist with this id."
            })
        }

        // Check that the role is correct or not.
        let isRoleCorrect;

        if(role==="Admin")  isRoleCorrect= Role.Admin
        else if(role==="Caretaker") isRoleCorrect= Role.Caretaker
        else if(role==="HOD")   isRoleCorrect= Role.HOD
        else if(role==="Dean")  isRoleCorrect = Role.Dean
        else{
            return NextResponse.json({
                success: false,
                message: "Given Role is not appropriate"
            },{status: 400})
        }

        const registeredUser = await prisma.verifier.create({
            data: {
                userName: memberName,
                email,
                mobileNo,
                role: isRoleCorrect,
                department
            }
        })


        return NextResponse.json({
            success: true,
            message: "User registered successfully",
            data: registeredUser
        })


    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 })

    }

}
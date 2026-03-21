import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "../../../../../generated/prisma/enums";
import { authOptions } from "../../auth/[...nextauth]/options";

const validRoles = ['Caretaker', 'HOD', 'Dean', 'Admin'];


export async function POST(req: NextRequest) {
    try {

        // Check that the admin is logged in or not.
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== "Admin") {
            return NextResponse.json({
                success: false,
                message: "Admin is not logged in"
            }, { status: 401 })
        }


        const { memberName, email, mobileNo, department, role } = await req.json()
        console.log(memberName,email,mobileNo,department,role)


        if (!memberName || !email || !mobileNo || !department || !role) {
            return NextResponse.json({
                success: false,
                message: "All fields are required"
            }, { status: 404 })
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            return NextResponse.json({ success: false, message: 'Invalid email format.' }, { status: 400 });
        }

        const validRoles = Object.values(Role);
        if (!validRoles.includes(role as Role)) {
            return NextResponse.json(
                { success: false, message: `Role must be one of: ${validRoles.join(', ')}.` },
                { status: 400 }
            );
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

        const registeredUser = await prisma.verifier.create({
            data: {
                userName: memberName,
                email,
                mobileNo,
                role: role as Role,
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
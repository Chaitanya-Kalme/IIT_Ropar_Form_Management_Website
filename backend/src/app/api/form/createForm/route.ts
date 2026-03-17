import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


const allowedTypes = [
  "text", "number", "date", "file", "checkbox",
  "radio", "select", "textarea", "email", "phone"
];

const isValidField = (field: any) => {
  if (typeof field.label !== "string") return false;
  if (!allowedTypes.includes(field.type)) return false;
  if (typeof field.required !== "boolean") return false;

  // Optional: For select, radio, checkbox fields, validate options array
  if (["radio", "select", "checkbox"].includes(field.type)) {
    if (!Array.isArray(field.options) || field.options.length === 0) return false;
    if (!field.options.every((opt: any) => typeof opt === "string")) return false;
  }

  return true;
};

export async function POST(req: NextRequest){
    try {
        // Check that admin is logged in or not. 
        // const data = await getServerSession()

        // if(!data?.user && data?.user.role!=="Admin"){
        //     return NextResponse.json({
        //         success: false,
        //         message: "Admin is not logged in "
        //     })
        // }


        const {title, description, deadline, formStatus , fields} = await req.json()

        if(!title || !description || !deadline || !formStatus || !fields){
            return NextResponse.json({
                success: false,
                message: "All fields are required"
            },{status: 404})
        }

        if (!Array.isArray(fields) || !fields.every(isValidField)) {
            return NextResponse.json({
                success: false,
                message: "Fields must be valid custom field objects"
            }, { status: 400 });
        }

        const status = true? formStatus==="True" : false

        const createdForm = await prisma.form.create({
            data:{
                title,
                description,
                deadline,
                formStatus: status,
                formFields: fields
            }
        })

        return NextResponse.json({
            success: true,
            message: "Form Created Successfully",
            data: createdForm
        })

        
    } catch (error:any) {
        console.log(error)
        return NextResponse.json({
            success: false,
            message: error.message
        },{status: 500})
        
    }
}
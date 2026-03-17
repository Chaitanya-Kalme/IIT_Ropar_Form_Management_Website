import { prisma } from "@/lib/prisma";
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

export default async function POST(req: NextRequest){
    try {
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


        
        
    } catch (error:any) {
        console.log(error)
        return NextResponse.json({
            success: false,
            message: error.message
        },{status: 500})
        
    }
}
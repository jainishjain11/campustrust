import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                department: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error("Users API error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { fullName, email, role, departmentId } = body;

        if (!fullName || !email || !role) {
            return NextResponse.json(
                { success: false, message: "Name, email and role are required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                role,
                departmentId: departmentId || null,
            },
            include: {
                department: true,
            },
        });

        return NextResponse.json(
            { success: true, data: user },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create user error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to create user. Check whether the email already exists." },
            { status: 400 }
        );
    }
}
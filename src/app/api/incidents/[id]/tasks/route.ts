import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: incidentId } = await context.params;
    const body = await request.json();
    const { title, description, assigneeId, dueDate } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Task title is required" },
        { status: 400 }
      );
    }

    const task = await prisma.mitigationTask.create({
      data: {
        title,
        description: description || "",
        status: "PENDING",
        dueDate: dueDate ? new Date(dueDate) : null,
        incidentId,
        assigneeId: assigneeId || null,
      },
      include: {
        assignee: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: task,
      message: "Mitigation task scheduled",
    });
  } catch (error) {
    console.error("Task POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create mitigation task" },
      { status: 400 }
    );
  }
}

export async function PATCH(
  request: Request,
  _context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { taskId, status } = body;

    if (!taskId || !status) {
      return NextResponse.json(
        { success: false, message: "Task ID and status are required" },
        { status: 400 }
      );
    }

    const task = await prisma.mitigationTask.update({
      where: { id: taskId },
      data: { status },
      include: { assignee: true },
    });

    return NextResponse.json({
      success: true,
      data: task,
      message: `Task updated to ${status}`,
    });
  } catch (error) {
    console.error("Task PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update mitigation task" },
      { status: 400 }
    );
  }
}


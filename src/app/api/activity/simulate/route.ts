import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenario, userId, assetId, customNote } = body;

    const [user, asset] = await Promise.all([
      userId ? prisma.user.findUnique({ where: { id: userId } }) : null,
      assetId ? prisma.asset.findUnique({ where: { id: assetId } }) : null,
    ]);

    const userName = user?.fullName || "Demonstration Identity";
    const assetName = asset?.name || "Campus Digital Service";
    const randomIp = `192.168.10.${Math.floor(Math.random() * 200) + 10}`;

    let createdLogs = [];

    switch (scenario) {
      case "FAILED_LOGIN_BURST": {
        // Generate 3 rapid failed login events
        for (let i = 1; i <= 3; i++) {
          const log = await prisma.activityLog.create({
            data: {
              action: "FAILED_LOGIN",
              description: `Simulated failed login attempt (${i}/3) detected from IP ${randomIp} targeting ${assetName}.`,
              eventType: "AUTHENTICATION",
              ipAddress: randomIp,
              userId: user?.id || null,
              assetId: asset?.id || null,
            },
          });
          createdLogs.push(log);
        }
        break;
      }

      case "PRIVILEGE_ESCALATION": {
        const log = await prisma.activityLog.create({
          data: {
            action: "PRIVILEGE_ESCALATION_ATTEMPT",
            description: `Unauthorized administrative role requested by ${userName} on ${assetName}.`,
            eventType: "SUSPICIOUS_ACTIVITY",
            ipAddress: randomIp,
            userId: user?.id || null,
            assetId: asset?.id || null,
          },
        });
        createdLogs.push(log);
        break;
      }

      case "OFF_HOURS_ACCESS": {
        const log = await prisma.activityLog.create({
          data: {
            action: "UNUSUAL_ACCESS_TIME",
            description: `Simulated off-hours access session by ${userName} into ${assetName} at 03:14 AM.`,
            eventType: "ACCESS",
            ipAddress: randomIp,
            userId: user?.id || null,
            assetId: asset?.id || null,
          },
        });
        createdLogs.push(log);
        break;
      }

      case "SSO_SUCCESS":
      default: {
        const log = await prisma.activityLog.create({
          data: {
            action: "SUCCESSFUL_LOGIN",
            description: `Routine Single Sign-On (SSO) authentication for ${userName} into ${assetName}. ${
              customNote || ""
            }`,
            eventType: "AUTHENTICATION",
            ipAddress: randomIp,
            userId: user?.id || null,
            assetId: asset?.id || null,
          },
        });
        createdLogs.push(log);
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: createdLogs,
      message: `Simulated security event [${scenario}] recorded successfully.`,
    });
  } catch (error) {
    console.error("Simulate activity error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to simulate activity event" },
      { status: 400 }
    );
  }
}


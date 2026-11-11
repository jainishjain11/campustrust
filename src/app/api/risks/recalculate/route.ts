import { NextResponse } from "next/server";
import { runRiskAssessment } from "@/services/risk-engine.service";

export async function POST() {
  try {
    const result = await runRiskAssessment();

    return NextResponse.json({
      success: true,
      data: result,
      message: `Risk assessment completed. Evaluated rules across users, assets, access entitlements, and authentication events. (${result.created} new findings detected, ${result.updated} updated).`,
    });
  } catch (error) {
    console.error("Risk recalculate error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to recalculate risks" },
      { status: 500 }
    );
  }
}


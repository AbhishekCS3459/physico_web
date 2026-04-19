import { NextResponse } from "next/server"

const DEFAULT_WORKFLOW_FILE = "database-backup.yml"

export async function POST() {
  try {
    const token = process.env.GITHUB_BACKUP_TOKEN
    const repo = process.env.GITHUB_BACKUP_REPO
    const workflowFile = process.env.GITHUB_BACKUP_WORKFLOW || DEFAULT_WORKFLOW_FILE
    const ref = process.env.GITHUB_BACKUP_REF || "main"

    if (!token || !repo) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Backup is not configured. Set GITHUB_BACKUP_TOKEN and GITHUB_BACKUP_REPO on Vercel.",
        },
        { status: 500 }
      )
    }

    const dispatchRes = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/${workflowFile}/dispatches`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref }),
        cache: "no-store",
      }
    )

    if (!dispatchRes.ok) {
      const bodyText = await dispatchRes.text()
      console.error("POST /api/admin/db-backup dispatch failed:", dispatchRes.status, bodyText)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to start backup workflow.",
          details: bodyText,
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Backup workflow started.",
      actionsUrl: `https://github.com/${repo}/actions/workflows/${workflowFile}`,
    })
  } catch (e: any) {
    console.error("POST /api/admin/db-backup", e)
    return NextResponse.json({ success: false, error: "Failed to start backup" }, { status: 500 })
  }
}

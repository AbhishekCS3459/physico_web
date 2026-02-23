import { prisma } from '@/lib/prisma'

const appBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function notifyAccessGranted(adminId: string, chartId: string, chartLabel: string, grantedBy: string) {
  await prisma.adminNotification.create({
    data: {
      adminId,
      type: 'access_granted',
      title: 'Chart access granted',
      message: `${grantedBy} granted you access to the chart: ${chartLabel}. You can now view all notes.`,
      chartId,
      link: `${appBase}/admin/charts/${chartId}`,
    },
  })
}

export async function notifyAccessRevoked(adminId: string, chartId: string, chartLabel: string, revokedBy: string) {
  await prisma.adminNotification.create({
    data: {
      adminId,
      type: 'access_revoked',
      title: 'Chart access revoked',
      message: `${revokedBy} has revoked your access to the chart: ${chartLabel}.`,
      chartId,
      link: `${appBase}/admin/charts`,
    },
  })
}

export async function notifyInvitationReceived(inviteeId: string, chartId: string, chartLabel: string, inviterName: string, permission: string) {
  await prisma.adminNotification.create({
    data: {
      adminId: inviteeId,
      type: 'invitation_received',
      title: 'Chart invitation',
      message: `${inviterName} invited you to access the chart: ${chartLabel} (${permission} access). Accept from your chart list or pending invitations.`,
      chartId,
      link: `${appBase}/admin/charts`,
    },
  })
}

export async function notifyRequestReceived(ownerId: string, chartId: string, chartLabel: string, requesterName: string, permission: string) {
  await prisma.adminNotification.create({
    data: {
      adminId: ownerId,
      type: 'request_received',
      title: 'Access request',
      message: `${requesterName} requested ${permission} access to the chart: ${chartLabel}. Grant or deny from the chart's Access section.`,
      chartId,
      link: `${appBase}/admin/charts/${chartId}`,
    },
  })
}

export async function notifyRequestGranted(requesterId: string, chartId: string, chartLabel: string) {
  await prisma.adminNotification.create({
    data: {
      adminId: requesterId,
      type: 'request_granted',
      title: 'Access request granted',
      message: `Your request for access to the chart "${chartLabel}" was granted. You can now view all notes.`,
      chartId,
      link: `${appBase}/admin/charts/${chartId}`,
    },
  })
}

export async function notifyRequestDenied(requesterId: string, chartLabel: string) {
  await prisma.adminNotification.create({
    data: {
      adminId: requesterId,
      type: 'request_denied',
      title: 'Access request denied',
      message: `Your request for access to the chart "${chartLabel}" was denied.`,
      link: `${appBase}/admin/charts`,
    },
  })
}

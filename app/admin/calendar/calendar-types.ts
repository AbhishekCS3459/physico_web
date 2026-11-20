export type StaffMember = {
  id: string
  email: string
  name: string | null
  role: string
}

export type Viewer = { id: string; role: "staff" | "super_admin" }

export type CalendarVisit = {
  id: string
  firstName: string
  lastName: string
  serviceType: string
  appointmentType: string
  fullAddress: string
  status: string
  scheduledStart: string
  scheduledEnd: string
  assignedAdminId: string | null
}

export const titleCase = (slug: string) => slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

export const staffLabel = (member: Pick<StaffMember, "name" | "email">) => member.name || member.email

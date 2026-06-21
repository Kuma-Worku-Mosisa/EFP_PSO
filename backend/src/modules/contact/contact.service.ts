import prisma from "../../lib/prisma";

export const ContactService = {
  // 1. Submit a new contact message
  async createMessage(data: {
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
    department: string;
    departmentHeadId: number;
  }) {
    // Verify the department head exists before creating
    const headExists = await prisma.user.findUnique({
      where: { id: data.departmentHeadId },
    });

    if (!headExists) {
      throw { code: "NOT_FOUND", message: "Department head not found" };
    }

    return await prisma.contact.create({
      data: {
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        subject: data.subject,
        message: data.message,
        department: data.department,
        departmentHeadId: data.departmentHeadId,
      },
    });
  },

  // 2. Intended User (Department Head) fetches their messages
  async getMessagesForHead(departmentHeadId: number) {
    return await prisma.contact.findMany({
      where: { departmentHeadId },
      orderBy: { createdAt: "desc" },
    });
  },

  // 3. Mark a message as RESOLVED or REVIEWED
  async updateMessageStatus(contactId: number, status: string) {
    return await prisma.contact.update({
      where: { id: contactId },
      data: { status },
    });
  },
};

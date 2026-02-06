import { prisma } from "../prisma.js";

export async function createTemplate(title, body) {
  if (!title || !body) {
    throw new Error("Title and body are required");
  }

  return prisma.notificationTemplate.create({
    data: {
      titleTemplate: title,
      bodyTemplate: body
    }
  });
}

export async function listTemplates() {
  return prisma.notificationTemplate.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function getTemplate(id) {
  const template = await prisma.notificationTemplate.findUnique({
    where: { id }
  });

  if (!template) {
    throw new Error("Template not found");
  }

  return template;
}

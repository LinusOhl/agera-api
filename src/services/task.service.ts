import type {
  TaskCreateInput,
  TaskModel,
} from "../../generated/prisma/models.js";
import { getUserIdFromToken } from "../helpers.js";
import { prisma } from "../lib/prisma.js";

export const createTask = async (
  authHeader: string | undefined,
  data: TaskCreateInput,
): Promise<TaskModel> => {
  if (!authHeader) {
    throw new Error("Missing authorization header.");
  }

  const token = authHeader.split(" ")[1];

  const userId = await getUserIdFromToken(token);

  if (!userId) {
    throw new Error("Unauthorized.");
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description ?? "",
      userId: userId,
    },
  });

  return task;
};

import type {
  TaskCreateInput,
  TaskModel,
} from "../../generated/prisma/models.js";
import { prisma } from "../lib/prisma.js";

export const createTask = async (
  userId: string,
  data: TaskCreateInput,
): Promise<TaskModel> => {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description ?? "",
      userId: userId,
    },
  });

  return task;
};

export const getTasks = async (userId: string) => {};

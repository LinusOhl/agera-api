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

export const getTasksByUserId = async (userId: string) => {
  const tasks = await prisma.task.findMany({
    where: {
      userId,
    },
  });

  return tasks;
};

export const getTaskById = async (userId: string, taskId: string) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
      userId,
    },
  });

  if (!task) {
    throw new Error("Task not found.");
  }

  return task;
};

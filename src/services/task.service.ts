import { HTTPException } from "hono/http-exception";
import type {
  TaskCreateInput,
  TaskModel,
  TaskUpdateInput,
} from "../../generated/prisma/models.js";
import { prisma } from "../lib/prisma.js";

export const createTask = async (
  userId: string,
  data: TaskCreateInput,
): Promise<TaskModel> => {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
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
    throw new HTTPException(404, { message: "Task not found." });
  }

  return task;
};

export const updateTaskById = async (
  userId: string,
  taskId: string,
  data: TaskUpdateInput,
) => {
  const now = new Date(Date.now());

  const task = await prisma.task.update({
    where: {
      id: taskId,
      userId,
    },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      updatedAt: now,
    },
  });

  return task;
};

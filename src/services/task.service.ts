import { PrismaClientValidationError } from "@prisma/client/runtime/client";
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
  try {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        userId: userId,
      },
    });

    return task;
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      throw new HTTPException(400, {
        message: "Missing field or incorrect field type.",
      });
    }

    throw new HTTPException(400, { cause: error });
  }
};

export const getTasksByUserId = async (
  userId: string,
): Promise<TaskModel[]> => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
      },
    });

    return tasks;
  } catch (error) {
    throw new HTTPException(400, { cause: error });
  }
};

export const getTaskById = async (
  userId: string,
  taskId: string,
): Promise<TaskModel | null> => {
  try {
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
        userId,
      },
    });

    return task;
  } catch (error) {
    throw new HTTPException(400, { cause: error });
  }
};

export const updateTaskById = async (
  userId: string,
  taskId: string,
  data: TaskUpdateInput,
): Promise<TaskModel> => {
  const now = new Date(Date.now());

  try {
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
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      throw new HTTPException(400, {
        message: "Missing field or incorrect field type.",
      });
    }

    throw new HTTPException(400, { cause: error });
  }
};

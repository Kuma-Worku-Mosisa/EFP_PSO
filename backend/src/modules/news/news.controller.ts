import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { ApiResponse } from "../../utils/apiResponse";

const parseIntegerId = (
  value: string | string[] | undefined,
): number | null => {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : null;
};

export const getPublicNews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const news = await prisma.newsArticle.findMany({
      where: { status: "published" },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    });

    ApiResponse.success(res, "Public news items fetched successfully.", news);
  } catch (error) {
    ApiResponse.error(
      res,
      "Failed to fetch public news items.",
      500,
      error instanceof Error ? error.message : String(error),
    );
  }
};

export const getAllNews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const news = await prisma.newsArticle.findMany({
      orderBy: [{ updatedAt: "desc" }, { publishedAt: "desc" }, { id: "desc" }],
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    ApiResponse.success(res, "All news records fetched successfully.", news);
  } catch (error) {
    ApiResponse.error(
      res,
      "Failed to fetch news records.",
      500,
      error instanceof Error ? error.message : String(error),
    );
  }
};

export const getNewsById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const newsId = parseIntegerId(req.params.id);
    if (!newsId) {
      ApiResponse.error(res, "Invalid news ID.", 400);
      return;
    }

    const newsItem = await prisma.newsArticle.findUnique({
      where: { id: newsId },
    });

    if (!newsItem || newsItem.status !== "published") {
      ApiResponse.error(res, "News item not found.", 404);
      return;
    }

    ApiResponse.success(res, "News item retrieved successfully.", newsItem);
  } catch (error) {
    ApiResponse.error(
      res,
      "Failed to retrieve news item.",
      500,
      error instanceof Error ? error.message : String(error),
    );
  }
};

export const createNews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      title,
      category,
      summary,
      content,
      imageUrl: bodyImageUrl,
      status,
      publishedAt,
    } = req.body;
    // If multer stored a file, build an accessible uploads URL
    const uploadedFile = (req as any).file as Express.Multer.File | undefined;
    const computedImageUrl = uploadedFile
      ? `/uploads/news/${uploadedFile.filename}`
      : bodyImageUrl;
    const creatorId = (req.user?.id as number) ?? null;

    if (!title || !content) {
      ApiResponse.error(res, "Title and content are required.", 400);
      return;
    }

    const newNews = await prisma.newsArticle.create({
      data: {
        title,
        category: category || "General",
        summary: summary || content.slice(0, 320),
        content,
        imageUrl: computedImageUrl || null,
        status: status || "published",
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        createdByUserId: creatorId,
      },
    });

    ApiResponse.success(res, "News item created successfully.", newNews, 201);
  } catch (error) {
    ApiResponse.error(
      res,
      "Failed to create news item.",
      500,
      error instanceof Error ? error.message : String(error),
    );
  }
};

export const updateNews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const newsId = parseIntegerId(req.params.id);
    if (!newsId) {
      ApiResponse.error(res, "Invalid news ID.", 400);
      return;
    }

    const {
      title,
      category,
      summary,
      content,
      imageUrl: bodyImageUrl,
      status,
      publishedAt,
    } = req.body;
    const uploadedFile = (req as any).file as Express.Multer.File | undefined;
    const computedImageUrl = uploadedFile
      ? `/uploads/news/${uploadedFile.filename}`
      : bodyImageUrl;

    const existing = await prisma.newsArticle.findUnique({
      where: { id: newsId },
    });
    if (!existing) {
      ApiResponse.error(res, "News item not found.", 404);
      return;
    }

    const updatedNews = await prisma.newsArticle.update({
      where: { id: newsId },
      data: {
        title: title ?? existing.title,
        category: category ?? existing.category,
        summary: summary ?? existing.summary,
        content: content ?? existing.content,
        imageUrl: computedImageUrl ?? existing.imageUrl,
        status: status ?? existing.status,
        publishedAt: publishedAt ? new Date(publishedAt) : existing.publishedAt,
        updatedAt: new Date(),
      },
    });

    ApiResponse.success(res, "News item updated successfully.", updatedNews);
  } catch (error) {
    ApiResponse.error(
      res,
      "Failed to update news item.",
      500,
      error instanceof Error ? error.message : String(error),
    );
  }
};

export const deleteNews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const newsId = parseIntegerId(req.params.id);
    if (!newsId) {
      ApiResponse.error(res, "Invalid news ID.", 400);
      return;
    }

    await prisma.newsArticle.delete({ where: { id: newsId } });

    ApiResponse.success(res, "News item deleted successfully.");
  } catch (error) {
    ApiResponse.error(
      res,
      "Failed to delete news item.",
      500,
      error instanceof Error ? error.message : String(error),
    );
  }
};

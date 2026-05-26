import { Request, Response } from "express";
import prisma from "../../lib/prisma";

/**
 * Fetch all published FAQs ordered by trending popularity (hitCount)
 */
export const getPublicFaqs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isPublished: true },
      orderBy: { hitCount: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Public FAQs fetched successfully.",
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Administrative: fetch all FAQs, including unpublished records
 */
export const getAllFaqs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      include: {
        creator: {
          select: { id: true, email: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "All FAQs fetched successfully.",
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ records.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Fetch a single FAQ by ID and atomically increment its view count
 */
export const getFaqById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const idParam = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const faqId = parseInt(idParam ?? "", 10);
    if (isNaN(faqId)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid FAQ ID format." });
      return;
    }

    const updatedFaq = await prisma.faq.update({
      where: { id: faqId },
      data: {
        hitCount: { increment: 1 },
      },
      include: {
        creator: {
          select: { id: true, email: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "FAQ retrieved successfully.",
      data: updatedFaq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process FAQ request.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Administrative: Create a new FAQ entry
 */
export const createFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryType, questionText, answerText, isPublished } = req.body;
    const currentUserId = (req as any).user?.id || null;

    if (!categoryType || !questionText || !answerText) {
      res.status(400).json({
        success: false,
        message: "Required content fields are missing.",
      });
      return;
    }

    const newFaq = await prisma.faq.create({
      data: {
        categoryType,
        questionText,
        answerText,
        isPublished: isPublished ?? true,
        createdByUserId: currentUserId,
      },
    });

    res.status(201).json({
      success: true,
      message: "FAQ document registered successfully.",
      data: newFaq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create FAQ entry.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Administrative: Update existing FAQ structural properties
 */
export const updateFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const faqId = parseInt(idParam ?? "", 10);
    const { categoryType, questionText, answerText, isPublished } = req.body;

    if (isNaN(faqId)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid target identifier." });
      return;
    }

    const updatedFaq = await prisma.faq.update({
      where: { id: faqId },
      data: {
        categoryType,
        questionText,
        answerText,
        isPublished,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "FAQ document updated successfully.",
      data: updatedFaq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update FAQ records.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Administrative: Purge an FAQ record permanently
 */
export const deleteFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const faqId = parseInt(idParam ?? "", 10);
    if (isNaN(faqId)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid target identifier." });
      return;
    }

    await prisma.faq.delete({ where: { id: faqId } });

    res.status(200).json({
      success: true,
      message: "FAQ resource successfully removed.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete FAQ resource.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

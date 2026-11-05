import { Router } from 'express';
import { asyncHandler, created, ok, paginated } from '../../common/http/response';
import { validate, validated } from '../../common/middleware/validate';
import { getWorkspace, resolveSlug } from '../../common/workspace';
import {
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema,
  type CreateProductInput,
  type ListProductsQuery,
  type UpdateProductInput,
} from './products.schema';
import { createProduct, deleteProduct, listProducts, updateProduct } from './products.service';

export const productsRouter = Router();

productsRouter.get(
  '/',
  validate(listProductsQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const query = validated<ListProductsQuery>(req, 'query');
    const { rows, total, counts } = await listProducts(workspace.id, query);
    res.json({
      data: rows,
      meta: {
        page: query.page,
        perPage: query.perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.perPage)),
        counts,
      },
    });
  }),
);

productsRouter.post(
  '/',
  validate(createProductSchema),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    created(res, await createProduct(workspace.id, validated<CreateProductInput>(req)));
  }),
);

productsRouter.patch(
  '/:id',
  validate(updateProductSchema),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await updateProduct(workspace.id, String(req.params.id ?? ''), validated<UpdateProductInput>(req)));
  }),
);

productsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await deleteProduct(workspace.id, String(req.params.id ?? '')));
  }),
);

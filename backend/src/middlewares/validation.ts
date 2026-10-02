import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { RequestHandler } from 'express';

export function validationMiddleware<T extends object>(type: new () => T): RequestHandler {
  return async (req, res, next) => {
    try {
      const fromQuery = req.method === 'GET';
      const dto = plainToInstance(type, (fromQuery ? req.query : req.body) ?? {});
      const errors = await validate(dto, {
        whitelist: false,
        forbidUnknownValues: false,
        validationError: { target: false, value: false },
      });

      if (errors.length) {
        res.status(400).json({
          status: 'error',
          message: 'Revisa los campos indicados.',
          errors: errors.map((error) => ({
            field: error.property,
            messages: Object.values(error.constraints ?? {}),
          })),
        });
        return;
      }

      if (!fromQuery) {
        req.body = dto;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
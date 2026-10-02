import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { RequestHandler } from 'express';

export function validationMiddleware<T extends object>(type: new () => T): RequestHandler {
  return async (req, res, next) => {
    try {
      const source = req.method === 'GET' ? req.query : req.body;
      const dto = plainToInstance(type, source ?? {});
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

      next();
    } catch (error) {
      next(error);
    }
  };
}

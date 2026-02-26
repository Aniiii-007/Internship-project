import { ZodError } from 'zod';

/**
 * Middleware factory: validate request against a Zod schema.
 * Returns 422 with structured field errors on failure.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source - The part of the request to validate
 */
export function validate(schema, source = 'body') {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const errors = result.error.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            return res.status(422).json({
                message: 'Validation failed',
                errors,
            });
        }

       // req[source] = result.data;   the alternative code for this line is given below
       if (source === 'query') {
      Object.keys(result.data).forEach((key) => {
        req.query[key] = result.data[key];
      });
    } else {
      req[source] = result.data;
    }
        next();
    };
}

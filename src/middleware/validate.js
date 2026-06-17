/**
 * Centralised request validation middleware.
 *
 * Runs a Zod schema against the chosen request property and, on success,
 * replaces it with the parsed (typed, defaulted) data so handlers can trust
 * their inputs. On failure it short-circuits with a 400 and field-level
 * messages drawn from Zod's flatten().
 *
 * @param {import('zod').ZodTypeAny} schema
 * @param {'body'|'query'|'params'} [source='body']
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
    }
    req[source] = result.data; // replace with parsed, typed data
    next();
  };
}

module.exports = { validate };

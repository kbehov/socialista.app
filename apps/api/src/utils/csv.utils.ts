import { stringify } from 'csv-stringify/sync'
import type { Context } from 'hono'

/** Build a CSV download response (sync — fine for small analytics exports). */
export function csvResponse(
  c: Context,
  filename: string,
  columns: string[],
  rows: Record<string, unknown>[],
) {
  const body = stringify(rows, {
    header: true,
    columns,
    cast: {
      boolean: value => (value ? 'true' : 'false'),
    },
  })
  c.header('Content-Type', 'text/csv; charset=utf-8')
  c.header('Content-Disposition', `attachment; filename="${filename}"`)
  return c.body(body)
}

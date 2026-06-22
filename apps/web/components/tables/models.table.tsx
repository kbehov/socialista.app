import type { Model } from '@socialista/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

type ModelsTableProps = {
  models: Model[]
}

export function ModelsTable({ models }: ModelsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Cost Unit</TableHead>
          <TableHead>Model Type</TableHead>
          <TableHead>Model Provider</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Updated At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models.map(model => (
          <TableRow key={model._id}>
            <TableCell>{model.name}</TableCell>
            <TableCell>{model.cost}</TableCell>
            <TableCell>{model.costUnit}</TableCell>
            <TableCell>{model.modelType}</TableCell>
            <TableCell>{model.modelProvider}</TableCell>
            <TableCell>{model.createdAt.toISOString()}</TableCell>
            <TableCell>{model.updatedAt.toISOString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

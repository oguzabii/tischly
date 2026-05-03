import TableKiosk from '@/components/TableKiosk'

export default async function TablePage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = await params
  return <TableKiosk tableId={tableId} />
}

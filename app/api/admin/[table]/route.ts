import { NextResponse } from 'next/server'
import { db } from '@/utils/db/dbConfig'
import { Users, Reports, Rewards, CollectedWastes, Notifications, Transactions } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'

const tables = {
  users: Users,
  reports: Reports,
  rewards: Rewards,
  collected_wastes: CollectedWastes,
  notifications: Notifications,
  transactions: Transactions
}

export async function GET(
  request: Request,
  { params }: { params: { table: string } }
) {
  try {
    const table = tables[params.table as keyof typeof tables]
    if (!table) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    console.log('Fetching data for table:', params.table)
    const data = await db.select().from(table)
    console.log('Fetched data:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching data:', error)
    console.error('Error details:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { table: string; id: string } }
) {
  try {
    const table = tables[params.table as keyof typeof tables]
    if (!table) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    const [updated] = await db
      .update(table)
      .set(updateData)
      .where(eq(table.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating data:', error)
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { table: string; id: string } }
) {
  try {
    const table = tables[params.table as keyof typeof tables]
    if (!table) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    await db.delete(table).where(eq(table.id, parseInt(params.id)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting data:', error)
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const supabase = supabaseAdmin

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    console.log('N8N Webhook received:', { action, data })

    switch (action) {
      case 'update_user_status':
        return await handleUpdateUserStatus(data)
      
      case 'log_automation_event':
        return await handleLogAutomationEvent(data)
      
      case 'sync_external_data':
        return await handleSyncExternalData(data)
      
      case 'trigger_notification':
        return await handleTriggerNotification(data)
      
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('N8N Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleUpdateUserStatus(data: any) {
  try {
    const { userId, status, metadata } = data

    const { error } = await supabase
      .from('user_automation_status')
      .upsert({
        user_id: userId,
        status,
        metadata,
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}

async function handleLogAutomationEvent(data: any) {
  try {
    const { eventType, userId, workflowId, details } = data

    const { error } = await supabase
      .from('automation_logs')
      .insert({
        event_type: eventType,
        user_id: userId,
        workflow_id: workflowId,
        details,
        created_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging automation event:', error)
    return NextResponse.json(
      { error: 'Failed to log automation event' },
      { status: 500 }
    )
  }
}

async function handleSyncExternalData(data: any) {
  try {
    const { dataType, records } = data

    // Sync different types of external data
    switch (dataType) {
      case 'weather_data':
        await syncWeatherData(records)
        break
      case 'course_availability':
        await syncCourseAvailability(records)
        break
      case 'pricing_updates':
        await syncPricingUpdates(records)
        break
      default:
        throw new Error(`Unknown data type: ${dataType}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error syncing external data:', error)
    return NextResponse.json(
      { error: 'Failed to sync external data' },
      { status: 500 }
    )
  }
}

async function handleTriggerNotification(data: any) {
  try {
    const { userId, notificationType, message, metadata } = data

    const { error } = await supabase
      .from('pending_notifications')
      .insert({
        user_id: userId,
        notification_type: notificationType,
        message,
        metadata,
        status: 'pending',
        created_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error triggering notification:', error)
    return NextResponse.json(
      { error: 'Failed to trigger notification' },
      { status: 500 }
    )
  }
}

// Helper functions for data synchronization
async function syncWeatherData(records: any[]) {
  for (const record of records) {
    await supabase
      .from('weather_data')
      .upsert({
        course_id: record.courseId,
        date: record.date,
        temperature: record.temperature,
        conditions: record.conditions,
        precipitation: record.precipitation,
        wind_speed: record.windSpeed,
        updated_at: new Date().toISOString()
      })
  }
}

async function syncCourseAvailability(records: any[]) {
  for (const record of records) {
    await supabase
      .from('course_availability')
      .upsert({
        course_id: record.courseId,
        date: record.date,
        time_slot: record.timeSlot,
        available_spots: record.availableSpots,
        updated_at: new Date().toISOString()
      })
  }
}

async function syncPricingUpdates(records: any[]) {
  for (const record of records) {
    await supabase
      .from('course_pricing')
      .upsert({
        course_id: record.courseId,
        date: record.date,
        time_slot: record.timeSlot,
        price: record.price,
        updated_at: new Date().toISOString()
      })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'N8N Webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}


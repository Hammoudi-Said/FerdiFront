import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'

export async function GET(request, { params }) {
  return forwardRequest(request, params, 'GET')
}

export async function POST(request, { params }) {
  return forwardRequest(request, params, 'POST')
}

export async function PUT(request, { params }) {
  return forwardRequest(request, params, 'PUT')
}

export async function PATCH(request, { params }) {
  return forwardRequest(request, params, 'PATCH')
}

export async function DELETE(request, { params }) {
  return forwardRequest(request, params, 'DELETE')
}

async function forwardRequest(request, params, method) {
  try {
    const path = params?.path ? params.path.join('/') : ''
    const searchParams = new URL(request.url).searchParams
    const queryString = searchParams.toString()
    
    // Construct the backend URL
    let backendUrl = `${BACKEND_URL}/api/v1/${path}`
    if (queryString) {
      backendUrl += `?${queryString}`
    }

    // Get headers from the request
    const requestHeaders = {}
    const headersList = headers()
    
    // Forward important headers
    const importantHeaders = [
      'authorization',
      'content-type',
      'accept',
      'user-agent'
    ]
    
    importantHeaders.forEach(header => {
      const value = headersList.get(header)
      if (value) {
        requestHeaders[header] = value
      }
    })

    // Prepare request options
    const requestOptions = {
      method,
      headers: {
        ...requestHeaders,
        'Content-Type': 'application/json',
      },
    }

    // Add body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const body = await request.text()
        if (body) {
          requestOptions.body = body
        }
      } catch (error) {
        console.error('Error reading request body:', error)
      }
    }

    // Handle form data for login endpoint
    if (path === 'login/access-token' && method === 'POST') {
      try {
        const formData = await request.formData()
        requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        requestOptions.body = new URLSearchParams(formData).toString()
      } catch (error) {
        console.error('Error processing form data:', error)
      }
    }

    console.log(`Forwarding ${method} request to: ${backendUrl}`)
    
    // Make the request to the backend
    const response = await fetch(backendUrl, requestOptions)
    
    // Get response data
    const contentType = response.headers.get('content-type')
    let data
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    // Return the response with the same status and headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('API forwarding error:', error)
    return NextResponse.json(
      { 
        message: 'Erreur de connexion au serveur',
        error: error.message 
      },
      { status: 500 }
    )
  }
}
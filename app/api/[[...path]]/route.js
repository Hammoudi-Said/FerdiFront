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
      },
    }

    // Handle body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (path === 'login/access-token') {
        // Special handling for OAuth2PasswordRequestForm endpoint
        try {
          const originalContentType = request.headers.get('content-type')
          let formBody = ''

          if (originalContentType?.includes('application/x-www-form-urlencoded')) {
            // Already form-encoded, just pass through
            formBody = await request.text()
          } else if (originalContentType?.includes('multipart/form-data')) {
            // Convert multipart to form-encoded for OAuth2PasswordRequestForm
            const formData = await request.formData()
            const urlEncoded = new URLSearchParams()
            for (const [key, value] of formData.entries()) {
              urlEncoded.append(key, value.toString())
            }
            formBody = urlEncoded.toString()
          } else {
            // Fallback: try to read as text
            formBody = await request.text()
          }

          requestOptions.body = formBody
          requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded'

          console.log('OAuth2 form body:', formBody)

        } catch (error) {
          console.error('Error processing OAuth2 form data:', error)
        }
      } else {
        // Handle other endpoints normally (JSON)
        try {
          const originalContentType = request.headers.get('content-type')
          requestOptions.headers['Content-Type'] = originalContentType || 'application/json'

          const body = await request.text()
          if (body) {
            requestOptions.body = body
          }
        } catch (error) {
          console.error('Error reading request body:', error)
        }
      }
    }

    console.log(`Forwarding ${method} request to: ${backendUrl}`)
    // console.log('Final headers:', requestOptions.headers)
    console.log('Final body:', requestOptions.body)
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

    // Return the response with proper content type
    return new Response(
      typeof data === 'string' ? data : JSON.stringify(data),
      {
        status: response.status,
        headers: {
          'Content-Type': contentType || 'application/json',
        },
      }
    )

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

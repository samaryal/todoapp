import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const client = jwksClient({
  jwksUri: 'https://dev-he0x1qipr7tp4tzr.us.auth0.com/.well-known/jwks.json'
})

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('JWT Token:', jwtToken)
    logger.info('Authorization Token:', event.authorizationToken)   
    return generatePolicy(jwtToken.sub, 'Allow')
  } catch (e) {
    logger.error('Authorization failed:', e.message)
    return generatePolicy('user', 'Deny')
  }
}

function generatePolicy(principalId, effect) {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: '*'
        }
      ]
    }
  }
}

async function verifyToken(authHeader) {
  const token = extractToken(authHeader)
  
  if (!token) {
    throw new Error('Authentication token is missing')
  }

  const decodedHeader = jsonwebtoken.decode(token, { complete: true })?.header
  if (!decodedHeader?.kid) {
    throw new Error('Token does not contain a valid kid')
  }

  const signingKey = await getSigningKey(decodedHeader.kid)
  if (!signingKey) {
    throw new Error('Failed to retrieve signing key')
  }

  const decodedJwt = await new Promise((resolve, reject) => {
    jsonwebtoken.verify(token, signingKey, { algorithms: ['RS256'] }, (error, decoded) => {
      if (error) {
        reject(new Error('Token verification failed'))
      } else {
        resolve(decoded)
      }
    })
  })

  return decodedJwt
}

function extractToken(authHeader) {
  if (!authHeader) {
    throw new Error('Authorization header is missing')
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    throw new Error('Invalid token format')
  }

  return parts[1]
}

async function getSigningKey(kid) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        logger.error('Error fetching signing key:', err.message)
        reject(err)
      } else {
        resolve(key.publicKey || key.rsaPublicKey)
      }
    })
  })
}

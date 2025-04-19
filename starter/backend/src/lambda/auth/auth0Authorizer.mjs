import Axios from 'axios';
import jwt from 'jsonwebtoken'; 
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('auth');
const jwksUrl = 'https://dev-he0x1qipr7tp4tzr.us.auth0.com/.well-known/jwks.json';

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    };
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    };
  }
}

async function verifyToken(authHeader) {
  logger.info('verifiedToken', authHeader.substring);
  const token = getToken(authHeader);
  const decodedJwt = jwt.decode(token, { complete: true }); 

  const response = await Axios.get(jwksUrl);
  const keys = response.data.keys;

  const signingKeys = keys.find(key => key.kid === decodedJwt.header.kid);
  logger.info('signingKeys', signingKeys);

  if (!signingKeys) {
    throw new Error('The JWKS endpoint did not contain any keys');
  }

  const pemData = signingKeys.x5c[0];
  const cert = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`;

  const verifiedToken = jwt.verify(token, cert, { algorithms: ['RS256'] });
  logger.info('verifiedToken', verifiedToken);

  return verifiedToken;
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  return authHeader.split(' ')[1];
}
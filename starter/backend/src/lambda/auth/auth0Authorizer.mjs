require('source-map-support').install();
import { verify, decode } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger.mjs';
import Axios from 'axios';

const logger = createLogger('auth');

// رابط مفاتيح Auth0
const jwksUrl = 'https://dev-he0x1qipr7tp4tzr.us.auth0.com/.well-known/jwks.json';

export const handler = async (event) => {
  logger.info('Authorizing a user', event.authorizationToken);

  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info('User was authorized', jwtToken);

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
};

async function verifyToken(authHeader) {
  const token = getToken(authHeader);

  const jwt = decode(token, { complete: true });
  if (!jwt) throw new Error('Invalid token');

  const kid = jwt.header.kid;
  const res = await Axios.get(jwksUrl);
  const signingKey = getSigningKey(res.data.keys, kid);

  return verify(token, signingKey, { algorithms: ['RS256'] });
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  return authHeader.split(' ')[1];
}

function getSigningKey(keys, kid) {
  const key = keys.find(k => k.kid === kid);
  if (!key) throw new Error('Signing key not found');

  const cert = key.x5c[0];
  const pem = `-----BEGIN CERTIFICATE-----\n${cert.match(/.{1,64}/g).join('\n')}\n-----END CERTIFICATE-----\n`;
  return pem;
}
